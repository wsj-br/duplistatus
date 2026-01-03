# Database Restore Login Loop Fix

## Issue Description

After performing a database restore operation, users would experience an infinite login loop where:
1. Login succeeds (returns 200)
2. `/api/auth/me` correctly returns authenticated status
3. User is redirected back to `/login?redirect=/` immediately
4. This cycle repeats indefinitely
5. **Critical symptom**: Restarting the server fixes the issue, allowing login to work

## Root Cause Analysis

The login loop was caused by **persistent in-memory session state** that wasn't being cleared or invalidated after a database restore. The issue involved multiple interacting problems:

### 1. In-Memory Session Fallback (Primary Issue)

**What happens during restore:**
- Database restore calls `resetDatabaseStateAfterRestore()` which sets `dbOps = null`
- All sessions are deleted from the database for security
- `clearAllLegacySessions()` is called to clear in-memory sessions
- However, **new unauthenticated sessions are immediately created in memory** by client-side code (`SessionInitializer`, etc.)
- These in-memory sessions persist in the Node.js process until server restart

**The race condition:**
1. User attempts to login after restore
2. Login creates a new session with `user_id` in the **database**
3. But the session cookie from the browser might reference an **old unauthenticated session**
4. When auth middleware calls `validateSession()`, it checks if `dbOps` is available
5. If `dbOps` is null or not ready, `validateSession()` **falls back to checking in-memory sessions**
6. The old in-memory session validates as true, but has no `user_id`
7. `getUserIdFromSession()` returns null → authentication fails → redirect to login

### 2. The Proxy Check Bug

The `dbOpsProxy` in `db.ts` (lines 1585-1612) throws an error when you try to access any property if the underlying `dbOps` is null. This caused our wait loops to throw exceptions instead of returning false:

```typescript
// This would THROW instead of returning false!
while (!dbOpsModule.dbOps && ...) {
  // Never gets here because the check throws!
}
```

### 3. Silent Fallback to Memory Sessions

When `isSessionsTableAvailable()` returned false (because `dbOps` was null), **all session operations silently fell back to in-memory storage**. This included:
- `createSession()` - created sessions in memory instead of database
- `validateSession()` - checked memory instead of database
- `getUserIdFromSession()` - returned null for memory sessions

This created a state where:
- Sessions existed and validated successfully (in memory)
- But had no user association (memory sessions don't store user_id)
- So authentication always failed, creating the loop

## Solution

The fix required making session validation wait for the database to be ready instead of falling back to memory storage.

### Key Changes

**1. Made `validateSession()` Async with Database Wait**

Changed `validateSession()` from synchronous to asynchronous, with logic to wait for `dbOps` to be ready:

```typescript
export async function validateSession(sessionId: string): Promise<boolean> {
  // CRITICAL: After database restore, dbOps might be temporarily null
  // We must wait for it to be ready instead of falling back to memory
  if (!dbOps || !isSessionsTableAvailable()) {
    const dbReady = await waitForDbOps(2000);
    if (!dbReady) {
      console.warn('[Session] validateSession: dbOps not available, session validation failed');
      return false; // Fail instead of using stale memory sessions
    }
  }
  
  // Validate using database only
  const session = dbOps!.getSessionById.get(sessionId);
  // ... validation logic ...
}
```

**2. Added `waitForDbOps()` Helper**

Created a reusable helper function that properly handles the proxy throwing errors:

```typescript
async function waitForDbOps(maxWaitMs: number = 2000): Promise<boolean> {
  const startTime = Date.now();
  
  while ((Date.now() - startTime) < maxWaitMs) {
    try {
      const { dbOps: ops } = await import('./db');
      if (ops && isSessionsTableAvailable()) {
        return true;
      }
    } catch (error) {
      // dbOps not ready yet, proxy threw error
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return false;
}
```

**3. Fixed Wait Loops in Auth Functions**

Updated all authentication functions to use try-catch when checking `dbOps`:

```typescript
let dbOpsReady = false;
while (!dbOpsReady && (Date.now() - startTime) < maxWaitTime) {
  try {
    const testModule = await import('@/lib/db');
    if (testModule.dbOps && testModule.dbOps.getUserById) {
      dbOpsReady = true;
      break;
    }
  } catch (error) {
    // dbOps not ready yet, wait and retry
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
```

**4. Updated All `validateSession` Calls to Async**

Changed all calls to `validateSession()` to use `await`:
- Login route: `await validateSession(existingSessionId)`
- Auth middleware: `await validateSession(sessionId)`  
- Auth server: `await validateSession(sessionId)`
- CSRF middleware: `await validateSession(sessionId)`

**5. Removed Memory Fallback from Session Validation**

Critically, when `dbOps` is not ready, `validateSession()` now **returns false** instead of falling back to in-memory sessions. This ensures that stale memory sessions from before the restore are never used for authentication.

### Modified Files

1. **`src/lib/session-csrf.ts`**:
   - Made `validateSession()` async with database wait
   - Added `waitForDbOps()` helper function
   - Removed fallback to in-memory sessions when database is available
   - Added `validateSessionSync()` for backward compatibility (not used after restore)
   - Removed `validateSessionAsync()` (replaced by async `validateSession()`)

2. **`src/app/api/auth/login/route.ts`**:
   - Changed wait loop to use try-catch around `dbOps` access
   - Updated to `await validateSession()`
   - Uses verified `dbOperations` reference consistently throughout

3. **`src/lib/auth-middleware.ts`**:
   - Try-catch pattern for waiting on `dbOps`
   - Updated to `await validateSession()`

4. **`src/lib/auth-server.ts`**:
   - Try-catch pattern for waiting on `dbOps`
   - Updated to `await validateSession()` in both `requireServerAuth()` and `getServerAuth()`

5. **`src/lib/csrf-middleware.ts`**:
   - Updated all `validateSessionAsync()` calls to `await validateSession()`

6. **`src/app/api/database/restore/route.ts`** (from earlier):
   - Improved session clearing sequence with proper waits

### Why Server Restart Fixed It

When the server restarted:
1. All in-memory state (including legacy sessions) was cleared
2. `dbOps` was initialized fresh from a clean state
3. No stale in-memory sessions existed to interfere with authentication
4. Login created sessions in the database as expected

This is why restarting temporarily "fixed" the issue - it cleared the problematic in-memory state.

## Testing Instructions

1. Open http://localhost:8666
2. Go to Settings → Database Maintenance
3. Upload a database backup file and restore it
4. You'll be logged out and redirected to /login
5. Login with your credentials
6. You should be redirected to the dashboard **without any loop**
7. No server restart should be needed
8. Run `/home/wsj/src/duplistatus/test-login-loop-fix.sh` to verify sessions have `user_id` set

### Expected Behavior After Fix

- Session validation waits for database to be ready (up to 2 seconds)
- If database isn't ready, authentication fails cleanly (not using memory fallback)
- Sessions are always created in database when `dbOps` is available
- No stale in-memory sessions interfere with authentication
- Login works immediately after restore without server restart

## Prevention

To prevent similar issues in the future:

1. **Avoid synchronous database operations with async initialization** - Use async/await consistently
2. **Don't silently fall back to degraded behavior** - Fail cleanly with clear errors
3. **Clear all caches after significant state changes** - Including in-memory caches
4. **Test restore operations thoroughly** - Include testing without server restart
5. **Log state transitions** - Help diagnose timing-related issues
6. **Consider initialization locks** - Prevent operations during state transitions

## Related Issues

This fix also improves behavior in other scenarios:
- Docker container restarts
- Hot module reloading in development  
- Database connection issues
- High load situations where database initialization is slow
- Any scenario where `dbOps` might be temporarily unavailable
