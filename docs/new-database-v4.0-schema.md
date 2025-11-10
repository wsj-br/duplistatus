# New Database Initialization - Schema v4.0

## Overview

New installations now start directly with schema version **4.0**, eliminating the need to run migrations. This improves the first-run experience and reduces setup time.

## What Changed

### Before
- New database created with schema v3.1 (servers, backups, configurations)
- On first startup, Migration 4.0 would run to add user access control tables
- Two-step process: create → migrate

### After
- New database created directly with schema v4.0
- All tables created immediately: servers, backups, configurations, **users**, **sessions**, **audit_log**
- Admin user seeded during initialization
- One-step process: create complete schema

## Schema v4.0 Includes

### Core Tables (from v3.1)
- `servers` - Duplicati server configurations
- `backups` - Backup job records
- `configurations` - Application settings
- `db_version` - Schema version tracking

### User Access Control Tables (new in v4.0)
- `users` - User accounts with authentication
  - Admin user seeded: `admin` / `Duplistatus09` (must change on first login)
  - Password hashed with bcrypt (12 rounds)
  - Admin user ID format: `admin-{16-byte hex string}`
- `sessions` - Database-backed session management
  - `user_id` is nullable to support unauthenticated sessions
  - Includes CSRF token management
- `audit_log` - Complete audit trail
  - Initial log entry created for database initialization
  - Records schema version, tables created, and admin user creation

### Indexes
All performance indexes are created immediately:
- 5 indexes on `backups` table
- 2 indexes on `users` table  
- 3 indexes on `sessions` table
- 5 indexes on `audit_log` table

### Initial Configuration
- `audit_retention_days` = 90 (configurable)
- Default configurations populated via `populateDefaultConfigurations()`:
  - `cron_service` - Cron job scheduling configuration
  - `overdue_tolerance` - Backup overdue tolerance settings
  - `ntfy_config` - NTFY notification configuration (with auto-generated topic)
  - `notification_templates` - Notification message templates
  - `notification_frequency` - Notification frequency settings

## Benefits

1. **Faster First Run** - No migration needed for new installations
2. **Consistent State** - All users start with the same complete schema
3. **Immediate Features** - User access control available from the start
4. **Cleaner Logs** - No migration messages on first startup
5. **Reduced Complexity** - One initialization path instead of two

## Migration Still Works

Existing installations (v3.1 or earlier) will still automatically migrate to v4.0 on next startup. The migration system remains fully functional for upgrades.

## Testing New Installation

To test the new initialization:

```bash
cd /home/wsj/src/duplistatus

# Remove existing database
rm data/backups.db

# Start the application
pnpm dev
```

**Expected console output:**
```
Initializing new database with latest schema (v4.0)...
Database initialized with schema v4.0
Admin user created: username="admin", password="Duplistatus09" (must change on first login)
Database schema initialized successfully
Default configurations populated successfully
[Database] Creating database operations...
[Database] Database operations ready
[Database] Startup initialization complete
```

## Code Location

- **File:** `src/lib/db.ts`
- **Function:** Database initialization (lines 78-304)
- **Version Set:** Line 293 - `INSERT INTO db_version (version) VALUES ('4.0')`
- **Database File:** `data/backups.db` (created in project root `data/` directory)

## Backward Compatibility

✅ **Fully backward compatible**
- Existing databases detect current version and migrate if needed
- New databases start at v4.0
- No breaking changes to application logic

## Initial Admin User

**Username:** `admin`  
**Password:** `Duplistatus09`  
**Role:** Administrator  
**Must Change Password:** Yes (forced on first login)

The password meets complexity requirements:
- ✅ At least 8 characters
- ✅ Contains uppercase (D)
- ✅ Contains lowercase (uplistatus)
- ✅ Contains numbers (09)

## Implementation Details

### Database File
- **Location:** `data/backups.db` (relative to project root)
- **Directory:** Created automatically if `data/` doesn't exist

### Schema Creation Process
1. Checks if tables exist (lines 72-76)
2. If no tables found, creates complete schema v4.0 (lines 86-241)
3. Creates admin user with bcrypt hash (lines 243-261)
4. Sets `audit_retention_days` configuration (lines 263-266)
5. Creates initial audit log entry (lines 268-290)
6. Sets database version to 4.0 (line 293)
7. Populates default configurations asynchronously (lines 300-303)

### Key Implementation Notes
- Uses `CREATE TABLE IF NOT EXISTS` for safety
- Admin password hashed with bcrypt (12 rounds)
- Sessions table `user_id` is nullable (supports unauthenticated sessions)
- All indexes created immediately with tables
- Foreign key constraints enforced (CASCADE for sessions, SET NULL for audit_log)

## Files Modified

- `/home/wsj/src/duplistatus/src/lib/db.ts` - Updated initial schema creation (lines 78-304)

## Implementation Date

2025-11-09

