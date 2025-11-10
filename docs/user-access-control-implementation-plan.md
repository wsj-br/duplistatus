# User Access Control & Audit System - Implementation Plan

**Version:** 1.0  
**Date:** 2025-11-09  
**Application:** duplistatus v0.9.1

---

## Executive Summary

This document outlines the implementation plan for adding user access control and audit logging to duplistatus. The system will provide authentication, user management, and comprehensive audit trails while maintaining the application's existing functionality and user experience.

---

## 1. Current Application Analysis

### 1.1 Architecture Overview

**Technology Stack:**
- **Framework:** Next.js 16.0.1 (App Router)
- **Runtime:** Node.js 20.x
- **Database:** SQLite3 with better-sqlite3
- **Package Manager:** pnpm 10.x
- **UI Components:** Radix UI + Tailwind CSS
- **Encryption:** Node.js crypto (AES-256-GCM for sensitive data)

**Current Database Schema:**
- `servers` - Duplicati server configurations
- `backups` - Backup execution records
- `configurations` - System configuration (key-value store)
- `db_version` - Schema migration tracking

**Current Security Features:**
- Session-based CSRF protection (in-memory sessions)
- Encrypted storage for server passwords and SMTP credentials
- Master key encryption system (`data/keys/master.key`)
- Session duration: 24 hours
- CSRF token duration: 30 minutes

**Key Files:**
- `/src/lib/session-csrf.ts` - In-memory session management
- `/src/lib/secrets.ts` - Encryption/decryption utilities
- `/src/lib/db.ts` - Database operations and schema
- `/src/lib/csrf-middleware.ts` - CSRF validation middleware
- `/src/components/session-initializer.tsx` - Client session setup
- `/src/app/api/session/route.ts` - Session API endpoints

### 1.2 Current Limitations

1. **No Authentication:** Application is currently open access - anyone with network access can use all features
2. **In-Memory Sessions:** Sessions stored in memory, lost on restart
3. **No User Management:** No concept of users or roles
4. **No Audit Trail:** No logging of system changes or user actions
5. **Settings Page:** Current design with 6 tabs (Notifications, Overdue, Servers, NTFY, Email, Templates)

---

## 2. Requirements Analysis

### 2.1 Core Requirements

#### Authentication & Authorization
- ✅ Single user type with full feature access (except user management)
- ✅ Admin users can manage other users (add, delete, change passwords)
- ✅ Regular users cannot add other users
- ✅ Password complexity: minimum 8 characters
- ✅ Initial admin account: username "admin", password "duplistatus"
- ✅ Forced password change on first login
- ❌ No external identity providers (future consideration)

#### Audit Logging
- ✅ All system changes logged to file
- ✅ Log file visible in Settings page
- ✅ Log rotation with 90-day retention
- ✅ Search functionality for audit logs
- ✅ Download capability for audit logs

#### User Interface
- ✅ Non-intrusive logout button with consistent look and feel
- ✅ Settings page redesign consideration for user management
- ✅ Modern web application aesthetic

### 2.2 Derived Requirements

1. **Database Changes:** New tables for users, database-backed sessions, and audit logs
2. **Password Security:** Industry-standard password hashing (bcrypt or Argon2)
3. **Session Persistence:** Move from in-memory to database-backed sessions
4. **Migration Strategy:** Seamless upgrade path for existing installations
5. **Error Handling:** Graceful handling of authentication failures
6. **Developer Experience:** Maintain type safety, no `any` types

---

## 3. Technical Design

### 3.1 Database Schema Changes

#### New Tables

**users**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- UUID
  username TEXT UNIQUE NOT NULL,          -- Unique username
  password_hash TEXT NOT NULL,            -- bcrypt hash
  is_admin BOOLEAN NOT NULL DEFAULT 0,    -- Admin flag
  must_change_password BOOLEAN DEFAULT 0, -- Force password change
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,                 -- Last successful login
  last_login_ip TEXT,                     -- IP address of last login
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME                   -- Account lockout timestamp
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_login ON users(last_login_at);
```

**sessions (migrate from in-memory)**
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,                    -- Session ID (hex string)
  user_id TEXT NOT NULL,                  -- Foreign key to users
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,                        -- Client IP
  user_agent TEXT,                        -- Browser/client info
  csrf_token TEXT,                        -- Associated CSRF token
  csrf_expires_at DATETIME,               -- CSRF token expiration
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_last_accessed ON sessions(last_accessed);
```

**audit_log**
```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,                           -- NULL for system actions
  username TEXT,                          -- Denormalized for reporting
  action TEXT NOT NULL,                   -- Action type
  category TEXT NOT NULL,                 -- auth, user, config, backup, server
  target_type TEXT,                       -- users, servers, backups, config
  target_id TEXT,                         -- ID of affected resource
  details TEXT,                           -- JSON with action details
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL,                   -- success, failure, error
  error_message TEXT,                     -- If status = failure/error
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_category ON audit_log(category);
CREATE INDEX idx_audit_status ON audit_log(status);
```

#### Initial Data Migration

**Seed Admin User:**
```typescript
// Default admin credentials (must be changed on first login)
// Note: Default password updated to meet policy requirements
INSERT INTO users (
  id, 
  username, 
  password_hash, 
  is_admin, 
  must_change_password
) VALUES (
  'admin-seed-001',
  'admin',
  '$2b$12$...',  // bcrypt hash of 'Duplistatus09'
  1,
  1
);
```

**Important:** Default password is `Duplistatus09` to meet password policy requirements (uppercase, lowercase, number).

### 3.2 Authentication System

#### Password Security

**Library:** `bcrypt` (already battle-tested, simpler than Argon2)
- Cost factor: 12 (good balance of security and performance)
- Automatic salt generation
- Future-proof (can increase cost factor as hardware improves)

**Password Policy:**
```typescript
interface PasswordPolicy {
  minLength: 8;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: false;  // Optional but accepted
}
```

**Validation:**
```typescript
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  // Special characters are accepted but not required
  return { valid: true };
}
```

#### Session Management

**Migration from In-Memory to Database:**
- Update `/src/lib/session-csrf.ts` to use database instead of Map
- Maintain backward compatibility with existing session API
- Session cleanup on database initialization
- Periodic cleanup of expired sessions (cron job)

**Session Configuration:**
```typescript
const SESSION_CONFIG = {
  duration: 24 * 60 * 60 * 1000,        // 24 hours
  csrfTokenDuration: 30 * 60 * 1000,    // 30 minutes
  extendOnActivity: true,                // Extend session on use
  cleanupInterval: 60 * 60 * 1000,      // Clean every hour
  strictIpBinding: false,                // Allow IP changes (mobile-friendly)
};
```

**Security Features:**
- HTTP-only cookies
- SameSite=Strict (or Lax for compatibility)
- Secure flag when HTTPS detected
- IP address logging (but not strict binding)
- Suspicious IP change detection (logged to audit)
- Automatic cleanup of expired sessions

#### Authentication Middleware

**New Middleware: `/src/lib/auth-middleware.ts`**
```typescript
interface AuthOptions {
  requireAuth?: boolean;      // Default: true
  requireAdmin?: boolean;     // Default: false
  skipAudit?: boolean;        // Default: false
}

function withAuth<T>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<Response>,
  options?: AuthOptions
)
```

**Context Injection:**
```typescript
interface AuthContext {
  user: {
    id: string;
    username: string;
    isAdmin: boolean;
    mustChangePassword: boolean;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}
```

### 3.3 API Routes

#### Authentication Endpoints

**POST /api/auth/login**
```typescript
Request: {
  username: string;
  password: string;
}

Success Response (200): {
  success: true;
  user: {
    id: string;
    username: string;
    isAdmin: boolean;
    mustChangePassword: boolean;
  };
  redirectTo?: string;  // '/change-password' if must change
}

Error Responses:
  401: Invalid credentials
  423: Account locked (too many failed attempts)
  500: Server error
```

**POST /api/auth/logout**
```typescript
Success Response (200): {
  success: true;
  message: 'Logged out successfully';
}
```

**POST /api/auth/change-password**
```typescript
Request: {
  currentPassword?: string;  // Not required if mustChangePassword
  newPassword: string;
  confirmPassword: string;
}

Success Response (200): {
  success: true;
  message: 'Password changed successfully';
}

Error Responses:
  400: Validation errors (weak password, mismatch, etc.)
  401: Invalid current password
  403: Unauthorized
```

**GET /api/auth/me**
```typescript
Success Response (200): {
  user: {
    id: string;
    username: string;
    isAdmin: boolean;
    mustChangePassword: boolean;
    lastLoginAt: string;
  }
}

Error Response:
  401: Not authenticated
```

#### User Management Endpoints (Admin Only)

**GET /api/users**
```typescript
Query Parameters:
  page?: number;
  limit?: number;
  search?: string;

Success Response (200): {
  users: Array<{
    id: string;
    username: string;
    isAdmin: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    mustChangePassword: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**POST /api/users**
```typescript
Request: {
  username: string;
  password?: string;        // Optional, auto-generate if not provided
  isAdmin: boolean;
}

Success Response (201): {
  user: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
  temporaryPassword: string;  // Always returned (auto-generated or admin-specified)
}

Error Responses:
  400: Validation error (duplicate username, weak password)
  403: Not admin
```

**PATCH /api/users/{userId}**
```typescript
Request: {
  isAdmin?: boolean;
  mustChangePassword?: boolean;
  resetPassword?: boolean;     // Generate new temp password
}

Success Response (200): {
  success: true;
  temporaryPassword?: string;  // If resetPassword was true
}
```

**DELETE /api/users/{userId}**
```typescript
Success Response (200): {
  success: true;
  message: 'User deleted successfully';
}

Error Responses:
  400: Cannot delete last admin
  403: Not admin
  404: User not found
```

#### Audit Log Endpoints

**GET /api/audit-log**
```typescript
Query Parameters:
  startDate?: string;        // ISO date
  endDate?: string;          // ISO date
  userId?: string;
  username?: string;
  action?: string;
  category?: string;
  status?: 'success' | 'failure' | 'error';
  page?: number;
  limit?: number;

Success Response (200): {
  logs: Array<{
    id: number;
    timestamp: string;
    username: string;
    action: string;
    category: string;
    targetType: string;
    targetId: string;
    details: object;
    status: string;
    errorMessage?: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
```

**GET /api/audit-log/download**
```typescript
Query Parameters: Same as GET /api/audit-log

Response: CSV or JSON file download
Content-Type: text/csv or application/json
Content-Disposition: attachment; filename="audit-log-YYYY-MM-DD.csv"
```

**GET /api/audit-log/stats**
```typescript
Query Parameters:
  days?: number;  // Default: 7

Success Response (200): {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsByUser: Array<{ username: string; count: number }>;
  recentFailures: number;
}
```

### 3.4 Audit Logging System

#### Audit Logger Utility

**File:** `/src/lib/audit-logger.ts`

```typescript
interface AuditLogEntry {
  userId?: string;
  username?: string;
  action: string;
  category: 'auth' | 'user' | 'config' | 'backup' | 'server' | 'system';
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

class AuditLogger {
  // Log to database
  log(entry: AuditLogEntry): void;
  
  // Convenience methods
  logAuth(action: string, userId: string, success: boolean, details?: object): void;
  logUserManagement(action: string, actorId: string, targetId: string, details?: object): void;
  logConfigChange(action: string, userId: string, configKey: string, details?: object): void;
  logBackupOperation(action: string, userId: string, backupId: string, details?: object): void;
  
  // Cleanup old entries
  cleanup(retentionDays: number): number;  // Returns deleted count
}
```

#### Actions to Audit

**Authentication:**
- `login_success`
- `login_failure`
- `logout`
- `password_change`
- `session_expired`
- `account_locked`

**User Management:**
- `user_created`
- `user_updated`
- `user_deleted`
- `password_reset`
- `admin_status_changed`

**Configuration:**
- `config_updated`
- `email_config_updated`
- `ntfy_config_updated`
- `server_config_updated`
- `notification_template_updated`
- `overdue_tolerance_updated`

**Backup Operations:**
- `backup_collected`
- `backup_deleted`
- `server_added`
- `server_updated`
- `server_deleted`
- `bulk_collection_started`
- `overdue_check_triggered`

**System:**
- `database_maintenance`
- `database_migration`
- `cleanup_executed`

#### Retention & Cleanup

**Configurable Retention:**
- Default retention: 90 days
- Configurable via Settings UI (admin only)
- Stored in configurations table: `audit_retention_days`
- Minimum: 30 days, Maximum: 365 days

**Automatic Cleanup:**
- Cron job runs daily at 2 AM
- Deletes audit logs older than configured retention period
- Logs cleanup operation itself
- Reports on cleanup success/failure

**Manual Cleanup API:**
```typescript
POST /api/audit-log/cleanup
Request: {
  retentionDays?: number;  // Override configured retention
  dryRun?: boolean;        // Preview without deleting
}

Response: {
  deletedCount: number;
  oldestRemaining: string;
  success: boolean;
}
```

**Retention Configuration API:**
```typescript
GET /api/audit-log/retention

Response: {
  retentionDays: number;  // Current setting (default: 90)
}

PATCH /api/audit-log/retention  // Admin only
Request: {
  retentionDays: number;  // Must be between 30-365
}

Response: {
  success: true;
  retentionDays: number;
}
```

**Storage Location:**
- Stored in `configurations` table
- Key: `audit_retention_days`
- Value: String representation of days (e.g., "90")
- Set during migration 4.0

### 3.5 Frontend Changes

#### New Pages

**1. Login Page: `/src/app/login/page.tsx`**
- Modern, centered card design
- Username and password fields
- "Remember me" option (extend session duration)
- Error message display
- Link to documentation/help
- Responsive design

**2. Change Password Page: `/src/app/change-password/page.tsx`**
- Required for first-time login
- Current password field (skipped if mustChangePassword)
- New password field
- Confirm password field
- Password strength indicator
- Form validation
- Success/error messaging

**3. User Management Page: `/src/app/settings/users/page.tsx`** (Admin Only)
- User list table with columns:
  - Username
  - Role (Admin/User)
  - Last Login
  - Status (Active, Must Change Password, Locked)
  - Actions (Edit, Reset Password, Delete)
- Add User button (opens modal)
- Search/filter functionality
- Confirmation dialogs for destructive actions
- Display temporary passwords securely

**4. Audit Log Viewer: `/src/app/settings/audit-log/page.tsx`**
- Filter panel:
  - Date range picker
  - User filter
  - Action type filter
  - Category filter
  - Status filter
- Results table with pagination
- Export/download button
- Real-time updates option
- Details modal for viewing full log entry

#### UI Component Updates

**AppHeader Updates: `/src/components/app-header.tsx`**
```tsx
// Add logout button and user indicator
<div className="flex items-center gap-2">
  <span className="text-sm text-muted-foreground">
    {user.username}
  </span>
  <Button 
    variant="ghost" 
    size="icon" 
    onClick={handleLogout}
    title="Logout"
  >
    <LogOut className="h-4 w-4" />
  </Button>
</div>
```

**Settings Page Redesign: `/src/app/settings/page.tsx`**

Current tabs: Notifications, Overdue, Servers, NTFY, Email, Templates

**Option A: Add More Tabs**
- Keep horizontal tab layout
- Add "Users" tab (admin only)
- Add "Audit Log" tab
- Use responsive design for mobile (grid layout)

**Option B: Sidebar + Content Layout**
- Left sidebar with grouped sections:
  - **Notifications**
    - Backup Notifications
    - Overdue Monitoring
    - Templates
  - **Integrations**
    - NTFY
    - Email
  - **System**
    - Servers
    - Users (admin only)
    - Audit Log
- Right content area with active section
- More scalable for future additions
- Modern admin panel aesthetic

**Recommendation:** Option B for better scalability and modern UX

#### Authentication Context

**New Context: `/src/contexts/auth-context.tsx`**
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user from /api/auth/me on mount
  // Handle automatic logout on 401 responses
  // Provide authentication state to all components
}
```

**Protected Route Wrapper:**
```typescript
function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) redirect('/login');
  if (requireAdmin && !isAdmin) return <UnauthorizedPage />;
  
  return <>{children}</>;
}
```

#### Client Request Helper Updates

**Update: `/src/lib/client-session-csrf.ts`**
- Add 401 handling → redirect to login
- Add 403 handling → show unauthorized message
- Maintain CSRF token logic
- Add request retry logic for session recovery

### 3.6 Migration Strategy

#### Database Migration

**New Migration: Version 4.0 - User Access Control System**

This migration follows the same pattern as existing migrations in `src/lib/db-migrations.ts`. Add to the `migrations` array:

```typescript
{
  version: '4.0',
  description: 'Add user access control system with users, database-backed sessions, and audit logging',
  up: (db: Database.Database) => {
    console.log('Migration 4.0: Adding user access control system...');
    
    // Step 1: Check if users table already exists (migration already completed)
    const usersTableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get();
    
    if (usersTableExists) {
      throw new Error('MIGRATION_ALREADY_COMPLETED');
    }
    
    // Step 2: Create users table
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT 0,
        must_change_password BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME,
        last_login_ip TEXT,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until DATETIME
      );
    `);
    
    // Step 3: Create indexes for users table
    db.exec(`
      CREATE INDEX idx_users_username ON users(username);
      CREATE INDEX idx_users_last_login ON users(last_login_at);
    `);
    
    // Step 4: Create sessions table (database-backed, replaces in-memory)
    db.exec(`
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        csrf_token TEXT,
        csrf_expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    // Step 5: Create indexes for sessions table
    db.exec(`
      CREATE INDEX idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
      CREATE INDEX idx_sessions_last_accessed ON sessions(last_accessed);
    `);
    
    // Step 6: Create audit_log table
    db.exec(`
      CREATE TABLE audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        username TEXT,
        action TEXT NOT NULL,
        category TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT NOT NULL,
        error_message TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    
    // Step 7: Create indexes for audit_log table
    db.exec(`
      CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
      CREATE INDEX idx_audit_user_id ON audit_log(user_id);
      CREATE INDEX idx_audit_action ON audit_log(action);
      CREATE INDEX idx_audit_category ON audit_log(category);
      CREATE INDEX idx_audit_status ON audit_log(status);
    `);
    
    // Step 8: Seed default admin user
    // Note: Import bcrypt at the top of db-migrations.ts: import bcrypt from 'bcrypt';
    const bcrypt = require('bcrypt');
    const { randomBytes } = require('crypto');
    
    // Generate admin user ID
    const adminId = 'admin-' + randomBytes(16).toString('hex');
    
    // Hash default password: 'Duplistatus09'
    // Using bcrypt.hashSync for synchronous execution within migration
    const adminPasswordHash = bcrypt.hashSync('Duplistatus09', 12);
    
    // Insert admin user
    db.prepare(`
      INSERT INTO users (
        id, 
        username, 
        password_hash, 
        is_admin, 
        must_change_password
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      adminId,
      'admin',
      adminPasswordHash,
      1,  // is_admin = true
      1   // must_change_password = true
    );
    
    // Step 9: Set default audit retention configuration (90 days)
    db.prepare(
      'INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)'
    ).run(
      'audit_retention_days',
      '90'
    );
    
    // Step 10: Log the migration in audit log
    db.prepare(`
      INSERT INTO audit_log (
        action, 
        category, 
        status, 
        username,
        details
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      'database_migration',
      'system',
      'success',
      'system',
      JSON.stringify({ 
        migration: '4.0', 
        description: 'User Access Control System',
        tables_created: ['users', 'sessions', 'audit_log'],
        admin_user_created: true,
        default_password: 'Duplistatus09 (must change on first login)'
      })
    );
    
    console.log('Migration 4.0: User access control system created successfully');
    console.log('Migration 4.0: Admin user created with username "admin"');
    console.log('Migration 4.0: Default password is "Duplistatus09" (must be changed on first login)');
  }
}
```

#### Migration Integration

**File: `src/lib/db-migrations.ts`**

Add the following import at the top of the file:

```typescript
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
```

Add the migration object to the `migrations` array (after migration 3.1).

**Dependency Update:**

Add bcrypt to `package.json` dependencies:

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2"
  }
}
```

#### Migration Error Handling

The migration includes error handling consistent with existing migrations:

1. **Already Completed Check:**
   - Checks if `users` table exists
   - Throws `MIGRATION_ALREADY_COMPLETED` error if found
   - Migration system will mark as complete and continue

2. **Transaction Safety:**
   - Entire migration runs in a transaction
   - Automatic rollback on any error
   - Database remains in consistent state

3. **Automatic Backup:**
   - `DatabaseMigrator` creates backup before running
   - Backup location logged to console
   - Format: `backups-copy-YYYY-MM-DDTHH-MM-SS.db`

4. **Retry Logic:**
   - Automatic retry on database lock (3 attempts)
   - Progressive backoff (1s, 2s, 3s)
   - Handles concurrent access scenarios

#### Rollback Strategy

**Automatic Rollback (if migration fails):**
- Transaction rollback is automatic
- Database restored to pre-migration state
- Backup file available for manual recovery

**Manual Rollback (if needed after completion):**

```sql
-- Rollback migration 4.0 (use with caution)
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Remove audit retention configuration
DELETE FROM configurations WHERE key = 'audit_retention_days';

-- Remove migration version record
DELETE FROM db_version WHERE version = '4.0';
```

**Recovery from Backup:**

```bash
# Stop application
docker compose down

# Restore database from backup
cd data
cp backups.db backups.db.failed  # Save failed state
cp backups-copy-YYYY-MM-DDTHH-MM-SS.db backups.db

# Restart application
docker compose up -d
```

**Important Notes:**
- ✅ Backup created automatically before migration
- ✅ Migration runs in transaction (atomic)
- ✅ No data loss on migration failure
- ⚠️ Manual rollback deletes all user accounts and audit logs
- ⚠️ Rollback should only be used in emergencies

---

## 4. Implementation Phases

### Phase 1: Foundation & Data Layer (Week 1)
**Duration:** 5-7 days  
**Focus:** Database and core authentication infrastructure

#### Tasks:
1. **Database Schema & Migration**
   - Add migration 4.0 to `src/lib/db-migrations.ts`
   - Add bcrypt and @types/bcrypt dependencies
   - Add database operations for users, sessions, audit logs to `src/lib/db.ts`
   - Test migration on sample database
   - Test migration on copy of production database
   - Verify automatic backup creation

2. **Password Security**
   - Create `src/lib/auth.ts` with password utilities:
     - `hashPassword(password: string): Promise<string>`
     - `verifyPassword(password: string, hash: string): Promise<boolean>`
     - `validatePassword(password: string): ValidationResult`
   - Implement password validation with all requirements
   - Unit tests for password operations

3. **Session Management**
   - Update `src/lib/session-csrf.ts`:
     - Replace in-memory Maps with database queries
     - Add `createDbSession()`, `getDbSession()`, `updateDbSession()`
     - Implement database-backed CSRF token storage
     - Maintain existing API for backward compatibility
   - Implement session cleanup utilities (cron job)
   - Add session cleanup to existing cleanup routines
   - Test session persistence across restarts
   - Test concurrent session handling

4. **Audit Logger**
   - Create `src/lib/audit-logger.ts`:
     - `AuditLogger` class with log methods
     - Convenience methods for each category
     - Cleanup method with configurable retention
   - Add database operations to `src/lib/db.ts`
   - Implement retention configuration logic
   - Unit tests for audit operations
   - Test log rotation

5. **Database Operations**
   - Add to `src/lib/db.ts` in `createDbOps()`:
     - User CRUD operations
     - Session CRUD operations  
     - Audit log operations with filtering
     - Cleanup operations
   - Add proper TypeScript interfaces
   - Add prepared statements for performance

#### Deliverables:
- ✅ Migration 4.0 added to codebase
- ✅ bcrypt dependency installed
- ✅ Migration tested on clean database
- ✅ Migration tested on existing database
- ✅ Password hashing/validation working
- ✅ Database-backed sessions functioning
- ✅ Audit logger operational
- ✅ All unit tests passing
- ✅ No breaking changes to existing code

#### Testing Checklist:
- [ ] Migration 4.0 runs successfully on clean database
- [ ] Migration 4.0 runs successfully on existing database (with backup data)
- [ ] Automatic backup created before migration
- [ ] Admin user created with username "admin"
- [ ] Admin user has correct password hash (Duplistatus09)
- [ ] Admin user has must_change_password = 1
- [ ] Admin user has is_admin = 1
- [ ] All three tables created with correct schema
- [ ] All indexes created
- [ ] Audit retention configuration set to 90 days
- [ ] Migration logged to audit_log table
- [ ] Sessions persist across server restart
- [ ] Session cleanup removes expired sessions
- [ ] Audit logs written correctly to database
- [ ] Audit cleanup deletes logs older than configured retention
- [ ] Password validation rejects weak passwords
- [ ] Password hashing produces different hashes for same password (salt)
- [ ] Password verification works correctly
- [ ] No duplicate column errors
- [ ] No foreign key constraint errors
- [ ] Database size increase reasonable (minimal for empty audit log)

---

### Phase 2: Authentication API & Middleware (Week 2)
**Duration:** 5-7 days  
**Focus:** API endpoints and request authentication

#### Tasks:
1. **Authentication Endpoints**
   - Create /api/auth/login endpoint
   - Create /api/auth/logout endpoint
   - Create /api/auth/change-password endpoint
   - Create /api/auth/me endpoint
   - Error handling and validation

2. **Authentication Middleware**
   - Create withAuth middleware wrapper
   - Add user context injection
   - Implement admin-only guards
   - Add request logging to audit system

3. **Update Existing Endpoints**
   - Wrap protected routes with withAuth
   - Add audit logging to critical operations
   - Update error responses for 401/403
   - Maintain backward compatibility during transition

4. **Security Features**
   - Implement rate limiting for login
   - Add account lockout after failed attempts
   - IP address logging
   - Session security hardening

#### Deliverables:
- ✅ All auth endpoints functional
- ✅ Middleware protecting routes
- ✅ Audit logs capturing actions
- ✅ Rate limiting working
- ✅ Integration tests passing

#### Testing Checklist:
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong credentials fails
- [ ] Logout clears session
- [ ] Password change enforced on first login
- [ ] Admin-only routes reject regular users
- [ ] Rate limiting blocks brute force
- [ ] All actions logged to audit system

---

### Phase 3: User Management (Week 3)
**Duration:** 5-7 days  
**Focus:** User CRUD operations and admin features

#### Tasks:
1. **User Management API**
   - Create GET /api/users endpoint
   - Create POST /api/users endpoint
   - Create PATCH /api/users/{id} endpoint
   - Create DELETE /api/users/{id} endpoint
   - Implement pagination and search

2. **User Operations**
   - User creation with temp password generation
   - Password reset functionality
   - User deletion with safeguards
   - Admin status management
   - Prevent deletion of last admin

3. **Audit Integration**
   - Log all user management actions
   - Include actor and target information
   - Capture before/after states
   - Sensitive data sanitization

#### Deliverables:
- ✅ User CRUD API complete
- ✅ Admin safeguards in place
- ✅ All operations audited
- ✅ API tests passing

#### Testing Checklist:
- [ ] Admin can create users
- [ ] Regular users cannot create users
- [ ] Temporary passwords work correctly
- [ ] Cannot delete last admin
- [ ] Password resets generate new temp passwords
- [ ] All user operations logged

---

### Phase 4: Frontend Authentication (Week 4)
**Duration:** 7-10 days  
**Focus:** Login UI, auth context, and route protection

#### Tasks:
1. **Authentication UI**
   - Create login page with form
   - Create change password page
   - Design error/success messages
   - Implement loading states
   - Responsive design

2. **Auth Context**
   - Create AuthProvider
   - Implement login/logout logic
   - Handle session refresh
   - Auto-redirect on 401

3. **Route Protection**
   - Add ProtectedRoute wrapper
   - Implement admin-only route guards
   - Handle first-login password change flow
   - Redirect logic for unauthenticated users

4. **Header Updates**
   - Add user indicator
   - Add logout button
   - Maintain responsive design
   - Icon consistency

5. **Client Request Updates**
   - Update authenticatedRequestWithRecovery
   - Handle 401 → redirect to login
   - Handle 403 → show error
   - Maintain CSRF token logic

#### Deliverables:
- ✅ Login page functional and styled
- ✅ Password change flow working
- ✅ Auth context providing state
- ✅ Protected routes blocking access
- ✅ Logout working correctly

#### Testing Checklist:
- [ ] Login form validates input
- [ ] Successful login redirects to dashboard
- [ ] Failed login shows error
- [ ] First login forces password change
- [ ] Logout clears session and redirects
- [ ] Protected routes require authentication
- [ ] Admin routes require admin role
- [ ] 401 errors trigger login redirect

---

### Phase 5: Settings UI Redesign (Week 5)
**Duration:** 7-10 days  
**Focus:** Settings page layout and user management UI

#### Tasks:
1. **Settings Layout**
   - Implement sidebar + content layout
   - Group settings into logical sections
   - Responsive design for mobile
   - Maintain existing functionality

2. **User Management UI (Admin Only)**
   - User list table with sorting
   - Add user modal/form
   - Edit user modal
   - Delete confirmation dialog
   - Password reset functionality
   - Search and filter users
   - Display user status indicators

3. **Role-Based UI**
   - Hide admin features from regular users
   - Show appropriate error messages
   - Graceful degradation

#### Deliverables:
- ✅ Settings page redesigned
- ✅ User management UI complete
- ✅ Admin-only features hidden appropriately
- ✅ All forms functional and validated

#### Testing Checklist:
- [ ] Settings layout responsive on all screen sizes
- [ ] All existing settings tabs work
- [ ] Admin sees Users section
- [ ] Regular users don't see Users section
- [ ] User creation form validates correctly
- [ ] User list displays correct information
- [ ] Delete confirmation prevents accidents
- [ ] Temporary passwords displayed securely (one-time)

---

### Phase 6: Audit Log Viewer (Week 6)
**Duration:** 5-7 days  
**Focus:** Audit log UI and export functionality

#### Tasks:
1. **Audit Log API Completion**
   - Implement filtering and pagination
   - Add statistics endpoint
   - Create download/export endpoint
   - Optimize queries for performance

2. **Audit Log UI**
   - Filter panel with all options
   - Results table with sorting
   - Pagination controls
   - Details modal for expanded view
   - Real-time updates option
   - Export button with format options

3. **Export Functionality**
   - CSV export
   - JSON export
   - Date range selection
   - Filtered exports

#### Deliverables:
- ✅ Audit log viewer functional
- ✅ All filters working
- ✅ Export functionality complete
- ✅ Performance optimized

#### Testing Checklist:
- [ ] Filters return correct results
- [ ] Pagination works correctly
- [ ] Sorting works on all columns
- [ ] Details modal shows full information
- [ ] CSV export contains all data
- [ ] JSON export is valid
- [ ] Filtered exports match UI filters
- [ ] Performance acceptable with 90 days of logs

---

### Phase 7: Integration & Testing (Week 7)
**Duration:** 5-7 days  
**Focus:** End-to-end testing, bug fixes, and polish

#### Tasks:
1. **Integration Testing**
   - Test complete user workflows
   - Test all authentication scenarios
   - Test audit logging across all features
   - Test session management edge cases
   - Test database migration on real data

2. **Security Audit**
   - Review password storage
   - Review session security
   - Review audit log completeness
   - Check for information leakage
   - Verify rate limiting

3. **Bug Fixes**
   - Fix issues found in testing
   - Address edge cases
   - Handle error scenarios
   - Improve error messages

4. **Performance Optimization**
   - Optimize database queries
   - Add missing indexes
   - Review audit log performance
   - Test with large datasets

5. **User Experience Polish**
   - Refine UI animations
   - Improve loading states
   - Enhance error messages
   - Consistency pass on styling

#### Deliverables:
- ✅ All major workflows tested
- ✅ Security review complete
- ✅ Known bugs fixed
- ✅ Performance acceptable
- ✅ UI polished

#### Testing Checklist:
- [ ] New user can login with temp password
- [ ] Password change enforced and works
- [ ] Regular user cannot access admin features
- [ ] Admin can manage all users
- [ ] All actions logged correctly
- [ ] Logs retained for 90 days
- [ ] Export includes all filtered data
- [ ] Session persists across server restart
- [ ] Rate limiting prevents brute force
- [ ] UI responsive on mobile and desktop

---

### Phase 8: Documentation & Deployment (Week 8)
**Duration:** 3-5 days  
**Focus:** Documentation, deployment guide, and release

#### Tasks:
1. **User Documentation**
   - Update user guide with authentication
   - Document user management features
   - Document audit log usage
   - Create troubleshooting guide
   - Password policy documentation

2. **Admin Documentation**
   - Initial setup guide
   - User management best practices
   - Audit log interpretation
   - Security recommendations
   - Admin recovery procedures (CLI tool)

3. **Developer Documentation**
   - Update DEVELOPMENT.md
   - Document new API endpoints
   - Update API reference docs
   - Architecture documentation
   - Migration guide for developers

4. **Deployment Preparation**
   - Update Docker configuration
   - Update docker-compose.yml
   - Test container deployment
   - Create upgrade guide
   - Database backup recommendations

5. **Release Preparation**
   - Create changelog
   - Update version to 1.0.0
   - Tag release in git
   - Update README
   - Prepare release notes

#### Deliverables:
- ✅ User documentation complete
- ✅ Admin documentation complete
- ✅ Developer documentation updated
- ✅ Deployment tested
- ✅ Release notes ready

---

## 5. Security Considerations

### 5.1 Password Security

**Hashing:**
- ✅ bcrypt with cost factor 12
- ✅ Automatic salt generation
- ✅ Password validation before hashing

**Storage:**
- ✅ Never log passwords
- ✅ Never return passwords in API responses
- ✅ Temporary passwords displayed only once
- ✅ Passwords stored only as bcrypt hashes

**Policy:**
- ✅ Minimum 8 characters
- ✅ Require uppercase letter (A-Z)
- ✅ Require lowercase letter (a-z)
- ✅ Require number (0-9)
- ✅ Accept special characters (optional)
- 🔮 Future: Password history (prevent reuse)
- 🔮 Future: Password expiration (optional)

### 5.2 Session Security

**Configuration:**
- ✅ 24-hour expiration
- ✅ HTTP-only cookies (no JavaScript access)
- ✅ SameSite=Strict when possible
- ✅ Secure flag when HTTPS detected

**Protection:**
- ✅ Session tied to user ID
- ✅ CSRF token per session
- ✅ Optional IP binding
- ✅ Automatic cleanup of expired sessions

**Attack Prevention:**
- ✅ Session fixation (regenerate on login)
- ✅ Session hijacking (IP binding, user agent check)
- ✅ CSRF (token validation)
- ✅ XSS (HTTP-only cookies)

### 5.3 Authentication Security

**Rate Limiting:**
- ✅ Max 5 login attempts per IP per 15 minutes
- ✅ Account lockout after 5 failed attempts
- ✅ Lockout duration: 15 minutes
- ✅ Admin can unlock accounts

**Brute Force Protection:**
- ✅ Rate limiting per IP
- ✅ Account lockout mechanism
- ✅ Failed attempts logged to audit
- ✅ CAPTCHA consideration for future

**Information Disclosure:**
- ❌ Don't reveal if username or password is wrong
- ❌ Don't reveal if account is locked vs wrong password
- ✅ Generic error: "Invalid username or password"

### 5.4 Audit Log Security

**Data Sanitization:**
- ✅ Never log passwords
- ✅ Never log CSRF tokens
- ✅ Never log session IDs
- ✅ Sanitize sensitive configuration values

**Access Control:**
- ✅ All authenticated users can view logs
- ✅ Logs cannot be modified through API
- ✅ Logs cannot be deleted individually
- ✅ Only retention cleanup deletes logs

**Integrity:**
- 🔮 Future: Cryptographic signatures
- 🔮 Future: Write-once storage
- 🔮 Future: External log streaming

### 5.5 Admin Recovery

**Lost Admin Access:**

Create CLI tool: `/scripts/admin-recovery.ts`

```typescript
#!/usr/bin/env tsx
// Usage: tsx scripts/admin-recovery.ts <username> <new-password>

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'backups.db');
const db = new Database(dbPath);

async function resetAdminPassword(username: string, newPassword: string) {
  // Validate inputs
  if (!username || !newPassword) {
    console.error('Usage: tsx admin-recovery.ts <username> <new-password>');
    process.exit(1);
  }
  
  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }
  
  // Find user
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    console.error(`User '${username}' not found`);
    process.exit(1);
  }
  
  // Hash new password
  const hash = await bcrypt.hash(newPassword, 12);
  
  // Update user
  db.prepare(`
    UPDATE users 
    SET password_hash = ?, 
        must_change_password = 0,
        failed_login_attempts = 0,
        locked_until = NULL
    WHERE username = ?
  `).run(hash, username);
  
  // Log to audit
  db.prepare(`
    INSERT INTO audit_log (action, category, status, username, details)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'admin_password_reset_cli',
    'system',
    'success',
    'system',
    JSON.stringify({ targetUser: username, method: 'cli' })
  );
  
  console.log(`✅ Password reset successfully for user '${username}'`);
  console.log('The user can now login with the new password.');
}

// Run
const [,, username, password] = process.argv;
resetAdminPassword(username, password).catch(console.error);
```

**Documentation:**
```bash
# Reset admin password if locked out
tsx scripts/admin-recovery.ts admin newpassword123

# Create emergency admin account
tsx scripts/create-emergency-admin.ts emergencyadmin temppassword
```

---

## 6. UI/UX Design Considerations

### 6.1 Settings Page Redesign

**Current Layout:**
- Horizontal tabs (6 tabs)
- Works but getting crowded
- Not scalable for more settings

**Proposed Layout: Sidebar Navigation**

```
┌─────────────────────────────────────────────┐
│ Settings                          [X] Close │
├─────────────┬───────────────────────────────┤
│             │                               │
│ NOTIFICATIONS                               │
│ › Backup     │  [Content area for selected  │
│ › Overdue    │   settings section]          │
│ › Templates  │                               │
│             │                               │
│ INTEGRATIONS│                               │
│ › NTFY      │                               │
│ › Email     │                               │
│             │                               │
│ SYSTEM      │                               │
│ › Servers   │                               │
│ › Users 👑  │                               │
│ › Audit Log │                               │
│             │                               │
└─────────────┴───────────────────────────────┘
```

**Benefits:**
- More scalable (room for growth)
- Better organization (logical groups)
- Modern admin panel aesthetic
- Clearer information hierarchy
- Mobile-friendly (collapsible sidebar)

**Implementation:**
```tsx
<div className="flex h-full">
  {/* Sidebar */}
  <aside className="w-64 border-r">
    <SettingsSidebar 
      isAdmin={user.isAdmin}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  </aside>
  
  {/* Content */}
  <main className="flex-1 p-6 overflow-auto">
    <SettingsContent section={activeSection} />
  </main>
</div>
```

### 6.2 Login Page Design

**Design Principles:**
- Clean and minimal
- Centered card layout
- Clear error messaging
- Accessible (keyboard navigation, ARIA labels)
- Loading states during submission

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│          ┌──────────────────┐           │
│          │  [duplistatus]   │           │
│          │                  │           │
│          │  Username:       │           │
│          │  [_____________] │           │
│          │                  │           │
│          │  Password:       │           │
│          │  [_____________] │           │
│          │                  │           │
│          │  [✓] Remember me │           │
│          │                  │           │
│          │  [  Login  ]     │           │
│          │                  │           │
│          │  Version 1.0.0   │           │
│          └──────────────────┘           │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### 6.3 User Management UI

**User List Table:**

| Username | Role | Last Login | Status | Actions |
|----------|------|------------|--------|---------|
| admin | Admin | 2025-11-09 10:30 | Active | [Edit] [Reset] |
| john.doe | User | 2025-11-08 15:22 | Active | [Edit] [Reset] [Delete] |
| jane.smith | User | Never | Must Change Password | [Edit] [Reset] [Delete] |

**Features:**
- Sortable columns
- Search bar
- Filter by role
- Filter by status
- Pagination
- Bulk actions (future)

**Add/Edit User Modal:**
```
┌─────────────────────────────────┐
│ Add New User              [X]   │
├─────────────────────────────────┤
│                                 │
│ Username:                       │
│ [___________________________]   │
│                                 │
│ Password:                       │
│ [___________________________]   │
│ [ ] Auto-generate password      │
│                                 │
│ Role:                           │
│ ( ) User  ( ) Admin             │
│                                 │
│ [ ] Require password change     │
│                                 │
│          [Cancel] [Create]      │
└─────────────────────────────────┘
```

### 6.4 Audit Log Viewer

**Layout:**

```
┌─────────────────────────────────────────────┐
│ Audit Log                                   │
├─────────────────────────────────────────────┤
│ Filters: [Show/Hide]                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Date Range: [Start] to [End]           │ │
│ │ User: [All Users ▼]                    │ │
│ │ Action: [All Actions ▼]               │ │
│ │ Status: [All ▼]                        │ │
│ │ [Apply] [Reset]             [Download] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Timestamp    User    Action    Status  │ │
│ ├─────────────────────────────────────────┤ │
│ │ 10:30:45   admin   login      success │ │
│ │ 10:32:12   admin   user_created ✓    │ │
│ │ 10:35:00   john    login_failure ✗   │ │
│ │ ...                                    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Showing 1-50 of 1,234 [< 1 2 3 ... 25 >]   │
└─────────────────────────────────────────────┘
```

**Details Modal:**
```
┌─────────────────────────────────┐
│ Audit Log Details         [X]   │
├─────────────────────────────────┤
│ Timestamp: 2025-11-09 10:32:12  │
│ User: admin                     │
│ Action: user_created            │
│ Category: user                  │
│ Status: success                 │
│                                 │
│ Details:                        │
│ ┌─────────────────────────────┐ │
│ │ {                           │ │
│ │   "username": "john.doe",   │ │
│ │   "role": "user",           │ │
│ │   "tempPassword": true      │ │
│ │ }                           │ │
│ └─────────────────────────────┘ │
│                                 │
│ IP Address: 192.168.1.100       │
│ User Agent: Mozilla/5.0 ...     │
│                                 │
│              [Close]            │
└─────────────────────────────────┘
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Files to Test:**
- `/src/lib/auth.ts` - Password hashing and validation
- `/src/lib/audit-logger.ts` - Audit log operations
- `/src/lib/session-csrf.ts` - Session management
- `/src/lib/auth-middleware.ts` - Auth middleware logic

**Test Coverage Goals:**
- Password hashing: 100%
- Password validation: 100%
- Session operations: 100%
- Audit logger: 100%
- Auth middleware: 95%+

**Sample Test:**
```typescript
describe('Password Hashing', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$')).toBe(true);
  });
  
  it('should verify correct password', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    
    expect(isValid).toBe(true);
  });
  
  it('should reject incorrect password', async () => {
    const hash = await hashPassword('correct');
    const isValid = await verifyPassword('wrong', hash);
    
    expect(isValid).toBe(false);
  });
});
```

### 7.2 Integration Tests

**Scenarios:**
1. User authentication flow
2. Session persistence across requests
3. Admin user management operations
4. Audit log creation and retrieval
5. Protected route access control
6. Password change flow

**Sample Test:**
```typescript
describe('Authentication Flow', () => {
  it('should login with valid credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'duplistatus'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.username).toBe('admin');
    expect(data.user.mustChangePassword).toBe(true);
  });
  
  it('should enforce password change on first login', async () => {
    // Login
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'duplistatus'
      })
    });
    
    const cookies = loginRes.headers.get('set-cookie');
    
    // Try to access protected route
    const dashboardRes = await fetch('/api/dashboard', {
      headers: { cookie: cookies }
    });
    
    expect(dashboardRes.status).toBe(403);
    expect(await dashboardRes.json()).toMatchObject({
      error: 'Password change required'
    });
  });
});
```

### 7.3 End-to-End Tests

**Tools:** Playwright or Cypress

**Scenarios:**
1. Complete user journey from login to logout
2. Admin creates new user → user logs in → user changes password
3. Admin resets user password → user logs in with temp password
4. Audit log filtering and export
5. Session expiration handling
6. Access control enforcement

**Sample E2E Test:**
```typescript
test('admin can create and manage users', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('[name="username"]', 'admin');
  await page.fill('[name="password"]', 'newpassword123');
  await page.click('button[type="submit"]');
  
  // Navigate to user management
  await page.click('a[href="/settings"]');
  await page.click('text=Users');
  
  // Create new user
  await page.click('text=Add User');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'testpass123');
  await page.click('text=Create');
  
  // Verify user appears in list
  await expect(page.locator('text=testuser')).toBeVisible();
  
  // Delete user
  await page.click('button[aria-label="Delete testuser"]');
  await page.click('text=Confirm');
  
  // Verify user removed
  await expect(page.locator('text=testuser')).not.toBeVisible();
});
```

### 7.4 Security Tests

**Manual Tests:**
1. SQL injection attempts on login
2. XSS attempts in username/password
3. CSRF token bypass attempts
4. Session hijacking attempts
5. Brute force login attempts
6. Rate limit effectiveness

**Automated Security:**
- Dependency vulnerability scanning (npm audit)
- OWASP ZAP or similar security scanner
- Static code analysis for security issues

---

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Migration breaks existing installations | Medium | High | Extensive testing, rollback procedure, backup reminders |
| Session storage performance issues | Low | Medium | Database indexing, periodic cleanup, monitoring |
| Audit log grows too large | Medium | Medium | Automated retention, monitoring, compression consideration |
| Password hashing too slow | Low | Low | bcrypt cost factor tuning, async operations |
| Breaking changes to existing API | Medium | High | Backward compatibility, versioning, migration guide |

### 8.2 User Experience Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Users forget passwords | High | Medium | Admin recovery procedure, password reset feature |
| Confusion with new login requirement | Medium | Medium | Clear documentation, migration guide, admin communication |
| Settings page too complex | Low | Medium | User testing, iterative refinement, good defaults |
| Audit log overwhelming | Low | Low | Good filtering, clear UI, helpful documentation |

### 8.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Weak passwords chosen | High | High | Password policy, strength indicator, education |
| Session token leakage | Low | High | HTTP-only cookies, secure flag, SameSite |
| Audit log tampering | Low | High | Database-backed (harder to modify), future: signatures |
| Brute force attacks | Medium | Medium | Rate limiting, account lockout, monitoring |
| Admin lockout | Low | High | CLI recovery tool, documentation |

---

## 9. Success Metrics

### 9.1 Technical Metrics

**Performance:**
- Login response time < 500ms
- Dashboard load time (authenticated) < 1s
- Audit log query response < 1s for 90 days of data
- Session validation overhead < 10ms

**Reliability:**
- Zero data loss during migration
- 99.9% session persistence across restarts
- Zero false positives in rate limiting

**Security:**
- 100% of sensitive operations logged
- Zero password storage in plain text
- Zero session tokens in logs
- Rate limiting blocks 99% of brute force attempts

### 9.2 User Experience Metrics

**Usability:**
- Users can complete first login and password change in < 2 minutes
- Admins can create user in < 30 seconds
- Audit log search returns results in < 5 seconds
- Settings navigation clear and intuitive

**Adoption:**
- Zero reports of lost access after migration
- < 5% admin recovery tool usage
- Positive feedback on settings redesign

---

## 10. Future Enhancements

### 10.1 Short-term (v1.1 - v1.3)

**Password Enhancements:**
- [ ] Password strength requirements (configurable)
- [ ] Password history (prevent reuse)
- [ ] Password expiration (optional)
- [ ] Two-factor authentication (TOTP)

**Session Enhancements:**
- [ ] Remember me (longer sessions)
- [ ] Active session management (view and revoke)
- [ ] Suspicious login detection
- [ ] Session activity log

**Audit Enhancements:**
- [ ] Real-time audit log viewer
- [ ] Audit log alerts (email/NTFY)
- [ ] Advanced analytics and reports
- [ ] Audit log export scheduling

**User Management:**
- [ ] User groups/teams
- [ ] Granular permissions (beyond admin/user)
- [ ] User self-service password reset
- [ ] Bulk user operations

### 10.2 Long-term (v2.0+)

**Authentication:**
- [ ] LDAP/Active Directory integration
- [ ] SAML SSO support
- [ ] OAuth2/OIDC (Google, Microsoft, etc.)
- [ ] API keys for automation

**Security:**
- [ ] IP whitelisting
- [ ] GeoIP restrictions
- [ ] Security headers (CSP, etc.)
- [ ] Security audit mode

**Compliance:**
- [ ] GDPR compliance features
- [ ] Data retention policies
- [ ] User data export
- [ ] Privacy controls

**Enterprise:**
- [ ] Multi-tenancy
- [ ] Custom branding
- [ ] Advanced role management
- [ ] Audit log signing/verification

---

## 11. Open Questions & Decisions Needed

### 11.1 User Decisions (CONFIRMED)

1. **Temporary Password Generation:** ✅ CONFIRMED
   - Auto-generate by default
   - Admin can override and specify custom password
   - Display once after creation

2. **Password Policy:** ✅ CONFIRMED
   - Minimum 8 characters
   - Require uppercase letter
   - Require lowercase letter
   - Require number
   - Special characters accepted but not required

3. **Session Binding:** ✅ CONFIRMED
   - Allow IP changes (mobile-friendly)
   - Log IP changes to audit log
   - Detect and flag suspicious IP changes

4. **Audit Log Scope:** ✅ CONFIRMED
   - Log only write operations (creates, updates, deletes)
   - No logging of read operations
   - Reduces log volume and improves performance

5. **Settings Page Layout:** ✅ CONFIRMED
   - Sidebar navigation with grouped sections
   - More scalable and modern

6. **Account Lockout:** ✅ CONFIRMED
   - 15 minutes lockout after 5 failed attempts
   - Admin can unlock immediately via user management

7. **Audit Log Retention:** ✅ CONFIRMED
   - Configurable retention period
   - Default: 90 days
   - Range: 30-365 days
   - Configurable in Settings (admin only)

8. **User Deletion:** ✅ CONFIRMED
   - Hard delete (permanent removal)
   - Audit log preserves deletion record
   - Cannot delete last admin account

### 11.2 Technical Decisions

1. **Password Hashing:**
   - ✅ DECISION: bcrypt with cost factor 12

2. **Session Storage:**
   - ✅ DECISION: Database-backed (SQLite)

3. **Migration Version:**
   - ✅ DECISION: Version 4.0

4. **UI Framework:**
   - ✅ DECISION: Radix UI + Tailwind (consistent with existing)

5. **Testing Framework:**
   - ❓ Jest + React Testing Library + Playwright?
   - **Recommendation:** Yes, standard for Next.js

---

## 12. Conclusion

This implementation plan provides a comprehensive roadmap for adding user access control and audit logging to duplistatus. The phased approach allows for incremental delivery and testing while minimizing risk to existing functionality.

**Key Highlights:**
- ✅ Maintains existing functionality
- ✅ Modern, secure authentication
- ✅ Comprehensive audit trail
- ✅ Scalable architecture
- ✅ Clear migration path
- ✅ Future-proof design

**Timeline Summary:**
- Total duration: 8 weeks (can be compressed or extended based on resources)
- Critical path: Database → Auth → Frontend
- Parallel opportunities: Documentation can start early

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Create feature branch
4. Begin Phase 1 implementation

---

## Appendix A: Database Schema Reference

### Complete Schema (After Migration)

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT 0,
  must_change_password BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  last_login_ip TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  csrf_token TEXT,
  csrf_expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_last_accessed ON sessions(last_accessed);

-- Audit log table
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,
  username TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_category ON audit_log(category);
CREATE INDEX idx_audit_status ON audit_log(status);

-- Existing tables remain unchanged
-- (servers, backups, configurations, db_version)
```

---

## Appendix B: API Endpoint Summary

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### User Management (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Audit Log
- `GET /api/audit-log` - Query audit logs
- `GET /api/audit-log/download` - Download audit logs
- `GET /api/audit-log/stats` - Audit statistics
- `POST /api/audit-log/cleanup` - Manual cleanup (admin)

---

## Appendix C: Audit Action Types

### Authentication Actions
- `login_success`
- `login_failure`
- `logout`
- `password_change`
- `password_change_required`
- `session_expired`
- `account_locked`
- `account_unlocked`

### User Management Actions
- `user_created`
- `user_updated`
- `user_deleted`
- `password_reset`
- `admin_status_granted`
- `admin_status_revoked`

### Configuration Actions
- `config_updated`
- `email_config_updated`
- `email_password_updated`
- `ntfy_config_updated`
- `server_config_updated`
- `notification_template_updated`
- `overdue_tolerance_updated`
- `backup_notification_updated`

### Backup Actions
- `backup_collected`
- `backup_deleted`
- `backup_cleanup`
- `bulk_collection_started`
- `bulk_collection_completed`

### Server Actions
- `server_added`
- `server_updated`
- `server_deleted`
- `server_password_updated`
- `server_url_updated`

### System Actions
- `database_maintenance`
- `database_migration`
- `audit_cleanup`
- `overdue_check_triggered`
- `notification_sent`
- `notification_failed`

---

*End of Implementation Plan*

