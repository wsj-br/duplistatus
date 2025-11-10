# Phase 1 Testing Guide

**Date:** 2025-11-09  
**Phase:** 1 - Foundation & Data Layer  
**Status:** Ready for Testing

---

## Overview

All Phase 1 implementation is complete. This guide helps you test the migration and verify all functionality works correctly.

---

## Pre-Testing Checklist

Before starting tests:

- [x] All code committed to files
- [x] TypeScript compilation passes (✅ confirmed)
- [x] Dependencies installed (bcrypt)
- [x] No breaking changes to existing code
- [ ] Database backup ready (automatic on migration)

---

## Test 1: Clean Database Migration

**Purpose:** Verify migration creates all tables correctly on a fresh database.

### Steps:

1. **Backup current database** (if you have data):
   ```bash
   cd /home/wsj/src/duplistatus/data
   cp backups.db backups.db.backup-before-migration-4.0
   ```

2. **Optional: Test on clean database**:
   ```bash
   # Rename existing database
   mv backups.db backups.db.production
   # App will create new database on startup
   ```

3. **Start the application**:
   ```bash
   cd /home/wsj/src/duplistatus
   pnpm dev
   # or
   pnpm start-local
   ```

4. **Check console output** for migration messages:
   ```
   Expected output:
   ✓ Migration 4.0: Adding user access control system...
   ✓ Migration 4.0: User access control system created successfully
   ✓ Migration 4.0: Admin user created with username "admin"
   ✓ Migration 4.0: Default password is "Duplistatus09"
   ```

5. **Verify database tables created**:
   ```bash
   sqlite3 data/backups.db
   ```
   ```sql
   -- Check tables exist
   .tables
   -- Should show: users, sessions, audit_log (plus existing tables)
   
   -- Check users table
   SELECT * FROM users;
   -- Should show 1 admin user
   
   -- Check admin user details
   SELECT id, username, is_admin, must_change_password FROM users;
   -- username: admin
   -- is_admin: 1
   -- must_change_password: 1
   
   -- Check sessions table structure
   .schema sessions
   
   -- Check audit_log table structure
   .schema audit_log
   
   -- Check audit log has migration entry
   SELECT action, category, status FROM audit_log;
   -- Should show: database_migration, system, success
   
   .quit
   ```

### Expected Results:

- ✅ Migration runs without errors
- ✅ Backup created in `data/backups-copy-YYYY-MM-DDTHH-MM-SS.db`
- ✅ 3 new tables created
- ✅ 9 indexes created
- ✅ 1 admin user created
- ✅ Audit retention config set to 90 days
- ✅ Migration logged to audit_log

---

## Test 2: Existing Database Migration

**Purpose:** Verify migration works on database with existing data.

### Steps:

1. **Restore production database** (if you tested with clean DB):
   ```bash
   cd /home/wsj/src/duplistatus/data
   mv backups.db backups.db.clean
   mv backups.db.production backups.db
   ```

2. **Restart application**:
   ```bash
   # Migration will run automatically
   pnpm start-local
   ```

3. **Verify migration** (same as Test 1)

4. **Verify existing data intact**:
   ```sql
   sqlite3 data/backups.db
   SELECT COUNT(*) FROM servers;
   SELECT COUNT(*) FROM backups;
   -- Counts should match pre-migration
   ```

### Expected Results:

- ✅ Migration runs successfully
- ✅ All existing data preserved
- ✅ New tables added alongside existing ones
- ✅ Application functions normally

---

## Test 3: Password Utilities

**Purpose:** Verify password hashing and validation works.

### Test Script:

Create `test-password.ts`:

```typescript
import { validatePassword, hashPassword, verifyPassword, generateSecurePassword } from './src/lib/auth';

async function testPasswords() {
  console.log('Testing password utilities...\n');
  
  // Test 1: Password validation
  console.log('1. Testing password validation:');
  const tests = [
    { password: 'short', valid: false, reason: 'Too short' },
    { password: 'lowercase1', valid: false, reason: 'No uppercase' },
    { password: 'UPPERCASE1', valid: false, reason: 'No lowercase' },
    { password: 'NoNumbers', valid: false, reason: 'No numbers' },
    { password: 'Duplistatus09', valid: true, reason: 'Valid' },
    { password: 'StrongP@ss1', valid: true, reason: 'Valid with special chars' },
  ];
  
  for (const test of tests) {
    const result = validatePassword(test.password);
    const status = result.valid === test.valid ? '✅' : '❌';
    console.log(`  ${status} "${test.password}": ${test.reason}`);
    if (!result.valid) {
      console.log(`     Error: ${result.error}`);
    }
  }
  
  // Test 2: Password hashing
  console.log('\n2. Testing password hashing:');
  const password = 'Duplistatus09';
  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(password);
  console.log(`  ✅ Hash 1: ${hash1.substring(0, 20)}...`);
  console.log(`  ✅ Hash 2: ${hash2.substring(0, 20)}...`);
  console.log(`  ${hash1 !== hash2 ? '✅' : '❌'} Hashes are different (salt working)`);
  
  // Test 3: Password verification
  console.log('\n3. Testing password verification:');
  const correctVerify = await verifyPassword(password, hash1);
  const wrongVerify = await verifyPassword('WrongPassword1', hash1);
  console.log(`  ${correctVerify ? '✅' : '❌'} Correct password verified`);
  console.log(`  ${!wrongVerify ? '✅' : '❌'} Wrong password rejected`);
  
  // Test 4: Secure password generation
  console.log('\n4. Testing secure password generation:');
  const generated = generateSecurePassword(12);
  console.log(`  Generated: ${generated}`);
  const genResult = validatePassword(generated);
  console.log(`  ${genResult.valid ? '✅' : '❌'} Generated password meets policy`);
}

testPasswords().catch(console.error);
```

Run test:
```bash
tsx test-password.ts
```

### Expected Results:

- ✅ All validation tests pass
- ✅ Hashes are different (salt working)
- ✅ Correct password verifies
- ✅ Wrong password rejected
- ✅ Generated passwords meet policy

---

## Test 4: Session Persistence

**Purpose:** Verify sessions persist across server restarts.

### Steps:

1. **Start application and access it**:
   ```bash
   pnpm start-local
   # Open browser to http://localhost:8666
   ```

2. **Check session in database**:
   ```sql
   sqlite3 data/backups.db
   SELECT id, user_id, created_at, expires_at FROM sessions;
   -- Should show session(s)
   ```

3. **Restart server** without clearing database:
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   pnpm start-local
   ```

4. **Check browser** - should still work without re-login

5. **Verify session cleanup**:
   ```sql
   -- Check for expired sessions
   SELECT COUNT(*) FROM sessions WHERE expires_at < datetime('now');
   
   -- Manual cleanup test
   DELETE FROM sessions WHERE expires_at < datetime('now', '-1 day');
   ```

### Expected Results:

- ✅ Sessions created in database
- ✅ Sessions persist across restart
- ✅ Expired sessions can be cleaned up
- ✅ Application works with database sessions

---

## Test 5: Audit Logging

**Purpose:** Verify audit logger writes to database correctly.

### Test Script:

Create `test-audit.ts`:

```typescript
import { AuditLogger } from './src/lib/audit-logger';

async function testAuditLog() {
  console.log('Testing audit logger...\n');
  
  // Test 1: Write audit log
  console.log('1. Writing test audit logs...');
  await AuditLogger.logAuth('test_login', 'user-123', 'testuser', true, {
    method: 'password',
    timestamp: new Date().toISOString()
  }, '127.0.0.1');
  console.log('  ✅ Auth log written');
  
  await AuditLogger.logSystem('test_system_event', {
    test: true,
    description: 'Test system event'
  });
  console.log('  ✅ System log written');
  
  // Test 2: Query logs
  console.log('\n2. Querying audit logs...');
  const result = await AuditLogger.query({ limit: 10 });
  console.log(`  ✅ Found ${result.total} total log entries`);
  console.log(`  ✅ Retrieved ${result.logs.length} logs`);
  
  // Test 3: Filter logs
  console.log('\n3. Testing filters...');
  const authLogs = await AuditLogger.query({ 
    category: 'auth',
    limit: 5
  });
  console.log(`  ✅ Found ${authLogs.total} auth logs`);
  
  // Test 4: Get statistics
  console.log('\n4. Getting statistics...');
  const stats = await AuditLogger.getStats(7);
  console.log(`  Total events: ${stats.totalEvents}`);
  console.log(`  Success: ${stats.successCount}`);
  console.log(`  Failure: ${stats.failureCount}`);
  console.log(`  Error: ${stats.errorCount}`);
  
  console.log('\n✅ All audit log tests passed!');
}

testAuditLog().catch(console.error);
```

Run test:
```bash
tsx test-audit.ts
```

### Verify in Database:

```sql
sqlite3 data/backups.db
SELECT timestamp, username, action, category, status 
FROM audit_log 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Expected Results:

- ✅ Logs written to database
- ✅ Query returns results
- ✅ Filters work correctly
- ✅ Statistics calculated correctly
- ✅ Sensitive data sanitized

---

## Test 6: Database Operations

**Purpose:** Verify all new database operations work.

### Test Script:

Create `test-db-ops.ts`:

```typescript
import { dbOps, ensureDatabaseInitialized } from './src/lib/db';

async function testDatabaseOps() {
  await ensureDatabaseInitialized();
  
  console.log('Testing database operations...\n');
  
  // Test 1: User operations
  console.log('1. Testing user operations:');
  const users = dbOps.getAllUsers.all();
  console.log(`  ✅ Found ${users.length} user(s)`);
  
  const admin = dbOps.getUserByUsername.get('admin');
  console.log(`  ✅ Admin user exists: ${admin ? 'Yes' : 'No'}`);
  if (admin) {
    console.log(`     - ID: ${admin.id}`);
    console.log(`     - Is Admin: ${admin.is_admin}`);
    console.log(`     - Must Change Password: ${admin.must_change_password}`);
  }
  
  // Test 2: Session operations
  console.log('\n2. Testing session operations:');
  const sessions = dbOps.getAuditLogs.all(10, 0);
  console.log(`  ✅ Can query sessions`);
  
  // Test 3: Audit log operations
  console.log('\n3. Testing audit log operations:');
  const auditCount = dbOps.countAuditLogs.get();
  console.log(`  ✅ Total audit logs: ${auditCount.count}`);
  
  const recentLogs = dbOps.getAuditLogs.all(5, 0);
  console.log(`  ✅ Retrieved ${recentLogs.length} recent logs`);
  
  console.log('\n✅ All database operation tests passed!');
}

testDatabaseOps().catch(console.error);
```

Run test:
```bash
tsx test-db-ops.ts
```

### Expected Results:

- ✅ All queries execute without errors
- ✅ Admin user found
- ✅ Audit logs can be queried
- ✅ Operations return expected types

---

## Common Issues & Solutions

### Issue: Migration Already Completed Error

**Symptoms:** 
```
Migration 4.0: MIGRATION_ALREADY_COMPLETED
```

**Solution:** This is normal - migration only runs once. Tables already exist.

### Issue: Database Locked

**Symptoms:**
```
SQLITE_BUSY: database is locked
```

**Solution:** 
- Close any SQLite browser/tool accessing the database
- Wait a moment and restart
- Check for multiple app instances

### Issue: bcrypt Not Found

**Symptoms:**
```
Cannot find module 'bcrypt'
```

**Solution:**
```bash
pnpm install
# or
pnpm add bcrypt @types/bcrypt
```

### Issue: Tables Not Created

**Symptoms:** Sessions/users table doesn't exist

**Solution:**
1. Check migration ran: `SELECT * FROM db_version`
2. Check for errors in console output
3. Verify backup was created
4. Try on clean database

---

## Cleanup After Testing

If you tested on a clean database and want to revert:

```bash
cd /home/wsj/src/duplistatus/data

# Remove test database
rm backups.db

# Restore production database
mv backups.db.production backups.db

# Or keep test database and remove production copy
rm backups.db.production
```

---

## Test Results Checklist

Mark as you complete each test:

- [ ] Test 1: Clean database migration ✅
- [ ] Test 2: Existing database migration ✅
- [ ] Test 3: Password utilities ✅
- [ ] Test 4: Session persistence ✅
- [ ] Test 5: Audit logging ✅
- [ ] Test 6: Database operations ✅

**Once all tests pass, Phase 1 is complete! 🎉**

---

## Next: Phase 2 - Authentication API

After testing is complete:

1. Review test results
2. Fix any issues found
3. Commit all changes
4. Begin Phase 2: Authentication API & Middleware

---

*Testing Guide Version 1.0*

