# Overdue Backup Detection Algorithm

## Overview

This document describes the algorithm used to detect overdue backups in duplistatus. The system tracks when the next backup is expected and compares it with the current time to determine if a backup is overdue.

## Core Data Structure

Each backup job is identified by a unique key: `{server_id}:{backup_name}` and has the following configuration stored in `backup_settings`:

```typescript
interface BackupNotificationConfig {
  time: string;              // Next expected backup date (ISO timestamp)
  lastBackupDate: string;    // Last actual backup received (ISO timestamp)
  expectedInterval: string;  // Backup interval (e.g., "1D", "2h30m", "1W")
  allowedWeekDays: number[]; // Allowed week days (0=Sunday, 6=Saturday)
  overdueBackupCheckEnabled: boolean;
  // ... other notification settings
}
```

## Core Algorithm

### Time Field Calculation

The `time` field represents the **next expected backup date** and is calculated using this algorithm:

```typescript
// Start with current time value (preserves schedule reference)
let nextTime = time;

// Keep adding intervals until we're past the last backup
while (nextTime <= lastBackupDate) {
  nextTime = GetNextBackupRunDate(
    lastBackupDate,
    nextTime,
    expectedInterval,
    allowedWeekDays
  );
}

// Update time to the next expected backup
time = nextTime;
```

### Overdue Detection

Once the `time` field is calculated, overdue detection is simple:

```typescript
const toleranceMinutes = getConfigOverdueTolerance(); // e.g., 60 minutes
const expectedTime = new Date(time);
expectedTime.setMinutes(expectedTime.getMinutes() + toleranceMinutes);

const currentTime = new Date();
const isOverdue = currentTime > expectedTime;
```

## When Updates Occur

The `time` and `lastBackupDate` fields are updated automatically in `getConfigBackupSettings()`, which is called:

1. **After backup upload** - When a backup is received via `/api/upload`
2. **After backup collection** - When backups are collected via `/api/backups/collect`
3. **On-demand** - When accessing configuration or overdue monitoring pages
4. **After test data generation** - When using `generate-test-data` script

## Concrete Examples

### Example 1: Regular Scheduled Backup

```
Initial state:
  time = Jan 2, 14:00 (expected backup time)
  lastBackupDate = Jan 1, 14:05
  expectedInterval = 1D (daily)

Backup arrives: Jan 2, 14:03 (slightly late, but scheduled)

Algorithm execution:
  Step 1: time (Jan 2 14:00) <= lastBackup (Jan 2 14:03)? YES
  Step 2: time = Jan 2 14:00 + 1D = Jan 3, 14:00
  Step 3: time (Jan 3 14:00) <= lastBackup (Jan 2 14:03)? NO ✓ STOP

Result:
  lastBackupDate = Jan 2, 14:03 (updated to new backup)
  time = Jan 3, 14:00 ✅ (preserves 14:00 schedule!)

Next Run Display: Jan 3, 14:00
Overdue Status: NO (current time < Jan 3 14:00 + tolerance)
```

### Example 2: Manual Backup (Off Schedule)

```
Initial state:
  time = Jan 3, 14:00 (expecting backup today at 2pm)
  lastBackupDate = Jan 2, 14:03
  expectedInterval = 1D

Manual backup runs: Jan 3, 22:00 (8 hours after schedule)

Algorithm execution:
  Step 1: time (Jan 3 14:00) <= lastBackup (Jan 3 22:00)? YES
  Step 2: time = Jan 3 14:00 + 1D = Jan 4, 14:00
  Step 3: time (Jan 4 14:00) <= lastBackup (Jan 3 22:00)? NO ✓ STOP

Result:
  lastBackupDate = Jan 3, 22:00 (updated to manual backup)
  time = Jan 4, 14:00 ✅ (still preserves 14:00 schedule!)

Next Run Display: Jan 4, 14:00
Overdue Status: NO

Key Point: Manual backup at 10pm doesn't shift the schedule to 10pm.
           The next expected backup is still at 2pm the next day.
```

### Example 3: Manual Backup Minutes Before Schedule

```
Initial state:
  time = Jan 4, 14:00 (expecting backup in 5 minutes)
  lastBackupDate = Jan 3, 22:00
  expectedInterval = 1D

Manual backup runs: Jan 4, 13:59 (1 minute before scheduled time)

Algorithm execution:
  Step 1: time (Jan 4 14:00) <= lastBackup (Jan 4 13:59)? NO ✓ STOP

Result:
  lastBackupDate = Jan 4, 13:59 (updated to manual backup)
  time = Jan 4, 14:00 (unchanged - still in the future)

Next Run Display: Jan 4, 14:00
Overdue Status: NO

Important: Duplicati will still run the scheduled backup at 14:00.
          The time field doesn't advance because it's already in the future.
```

### Example 4: New Server (No Duplicati Sync)

```
First backup arrives: Jan 1, 14:05
No existing backup_settings entry

Initial setup:
  lastBackupDate = Jan 1, 14:05
  time = GetNextBackupRunDate(Jan 1 14:05, Jan 1 14:05, "1D", allDays)
       = Jan 2, 14:05

Result:
  lastBackupDate = Jan 1, 14:05
  time = Jan 2, 14:05 ✅

Next Run Display: Jan 2, 14:05
Overdue Status: NO

Key Point: For new servers without Duplicati sync, the backup time-of-day
          (14:05) becomes the schedule reference.
```

### Example 5: With Duplicati Sync

```
User clicks "Collect" or "Sync Schedule" button:
  Duplicati returns:
    Schedule.Time = Jan 5, 14:00 (next scheduled run from Duplicati)
    Schedule.LastRun = Jan 4, 14:02 (last successful backup)
    Schedule.Repeat = "1D"

Initial setup from Duplicati:
  time = Jan 5, 14:00 (exact Duplicati schedule)
  lastBackupDate = Jan 4, 14:02
  expectedInterval = "1D"

Next scheduled backup arrives: Jan 5, 14:03

Algorithm execution:
  Step 1: time (Jan 5 14:00) <= lastBackup (Jan 5 14:03)? YES
  Step 2: time = Jan 5 14:00 + 1D = Jan 6, 14:00
  Step 3: time (Jan 6 14:00) <= lastBackup (Jan 5 14:03)? NO ✓ STOP

Result:
  lastBackupDate = Jan 5, 14:03
  time = Jan 6, 14:00

Next Run Display: Jan 6, 14:00
Overdue Status: NO

Key Point: Duplicati sync provides the exact schedule reference.
          After that, the algorithm maintains the schedule automatically.
```

### Example 6: Overdue Backup

```
Current state:
  time = Jan 6, 14:00 (backup was expected 2 days ago)
  lastBackupDate = Jan 4, 14:03
  expectedInterval = 1D
  overdueTolerance = 1h (60 minutes)

Current date/time: Jan 8, 16:00

Overdue check:
  expectedTime = Jan 6, 14:00 + 60 minutes = Jan 6, 15:00
  currentTime = Jan 8, 16:00
  isOverdue = Jan 8 16:00 > Jan 6 15:00? YES ✓

Result:
  Next Run Display: Jan 6, 14:00 (shown in RED in UI)
  Overdue Status: YES
  Time since expected: 2 days, 1 hour

Key Point: The backup is overdue because current time is past the
          expected time plus tolerance.
```

### Example 7: Missed Multiple Backups

```
Initial state:
  time = Jan 5, 14:00
  lastBackupDate = Jan 4, 14:03
  expectedInterval = 1D

No backups arrive for 3 days...

Current date/time: Jan 8, 16:00

Overdue check:
  expectedTime = Jan 5, 14:00 + 60 minutes = Jan 5, 15:00
  currentTime = Jan 8, 16:00
  isOverdue = YES ✓

Next backup arrives: Jan 8, 20:00

Algorithm execution:
  Step 1: time (Jan 5 14:00) <= lastBackup (Jan 8 20:00)? YES
  Step 2: time = Jan 5 14:00 + 1D = Jan 6, 14:00
  Step 3: time (Jan 6 14:00) <= lastBackup (Jan 8 20:00)? YES
  Step 4: time = Jan 6 14:00 + 1D = Jan 7, 14:00
  Step 5: time (Jan 7 14:00) <= lastBackup (Jan 8 20:00)? YES
  Step 6: time = Jan 7 14:00 + 1D = Jan 8, 14:00
  Step 7: time (Jan 8 14:00) <= lastBackup (Jan 8 20:00)? YES
  Step 8: time = Jan 8 14:00 + 1D = Jan 9, 14:00
  Step 9: time (Jan 9 14:00) <= lastBackup (Jan 8 20:00)? NO ✓ STOP

Result:
  lastBackupDate = Jan 8, 20:00
  time = Jan 9, 14:00

Next Run Display: Jan 9, 14:00
Overdue Status: NO (back to normal)

Key Point: The algorithm "catches up" by adding intervals until the time
          is in the future, preserving the 14:00 schedule time.
```

## Key Features

### ✅ Preserves Schedule Time-of-Day

Manual backups at off-schedule times (e.g., 10pm) don't shift the schedule. The next expected backup time remains at the original schedule time (e.g., 2pm).

### ✅ Works Without Duplicati Sync

For new servers that haven't synced with Duplicati, the system uses the first backup's time-of-day as the schedule reference and calculates from there.

### ✅ Handles Early Manual Backups

If a manual backup runs minutes before the scheduled time, the `time` field doesn't advance (it's already in the future). Duplicati will still run the scheduled backup.

### ✅ Automatic Updates

The `time` field is automatically recalculated whenever `getConfigBackupSettings()` is called, which happens after every backup upload or collection.

### ✅ Simple Overdue Detection

Overdue detection is straightforward: `currentTime > time + tolerance`. No complex recalculation needed at check time.

### ✅ Robust for Test Data

Works correctly with direct database writes (e.g., `generate-test-data` script) because the algorithm runs when settings are accessed.

## Edge Cases

### Cannot Distinguish Manual vs Scheduled Backups

The backup upload payload from Duplicati doesn't indicate whether a backup was scheduled or manual. The algorithm treats all backups the same way, which is acceptable because:

1. The time-of-day is preserved through the interval calculation
2. Manual backups don't break the schedule
3. If a manual backup runs minutes before schedule, the schedule still runs

### Schedule Changes Require Re-sync

If the user changes the Duplicati schedule (e.g., from daily at 2pm to daily at 10pm), the system won't automatically detect this change. The user must:

1. Click "Collect" or "Sync Schedule" to pull the new schedule from Duplicati
2. Or manually update the settings in the UI

This is documented in the user guide as expected behavior.

### Weekly Backups with Allowed Weekdays

For weekly backups with restricted weekdays, the algorithm respects the `allowedWeekDays` setting:

```
Example:
  expectedInterval = "1W"
  allowedWeekDays = [1, 3, 5] (Monday, Wednesday, Friday)
  lastBackup = Monday, Jan 1, 14:00
  time = Monday, Jan 1, 14:00

After backup on Monday Jan 1:
  Algorithm advances by 1 week = Monday, Jan 8, 14:00 ✓
  (Skips Tuesday-Sunday because only Mon/Wed/Fri are allowed)

After manual backup on Thursday Jan 4, 22:00:
  time (Mon Jan 8 14:00) <= lastBackup (Thu Jan 4 22:00)? NO
  time stays = Monday, Jan 8, 14:00 ✓
  (Manual backup doesn't change the schedule)
```

## Implementation Details

### Location

The algorithm is implemented in `src/lib/db-utils.ts` in the `getConfigBackupSettings()` function (lines ~1880-1980).

### Performance

- The algorithm has a safety limit of 1000 iterations to prevent infinite loops
- In practice, it typically runs 1-2 iterations (advancing by 1-2 intervals)
- The result is cached until the next backup arrives or cache is cleared

### Thread Safety

The `getConfigBackupSettings()` function uses a request-level cache to avoid redundant calculations within a single request. The cache is cleared:

- After backup upload
- After backup collection
- When explicitly requested via `clearRequestCache()`

### Error Handling

If the `GetNextBackupRunDate()` function throws an error (e.g., invalid interval or dates), the algorithm:

1. Logs a warning with the error details
2. Falls back to using `lastBackupDate` as the `time` value
3. Continues processing other backup configurations

## Related Functions

### `GetNextBackupRunDate(lastBackupDate, baseTime, interval, allowedWeekDays)`

Calculates the next valid backup date given:
- `lastBackupDate`: Reference point (must be after this)
- `baseTime`: Time to advance (preserves time-of-day)
- `interval`: How much to advance (e.g., "1D", "2h", "1W")
- `allowedWeekDays`: Which days are allowed for the backup

Location: `src/lib/server_intervals.ts`

### `isBackupOverdueByInterval(serverId, backupName, lastBackupDate)`

Checks if a backup is overdue by:
1. Getting the backup settings (with calculated `time` field)
2. Adding tolerance to the expected time
3. Comparing with current time

Location: `src/lib/db-utils.ts`

### `getConfigOverdueTolerance()`

Returns the overdue tolerance in minutes (e.g., 60 for 1 hour). This grace period is added to the expected time before marking a backup as overdue.

Location: `src/lib/db-utils.ts`

## Testing

To test the overdue detection algorithm:

1. **Generate test data**:
   ```bash
   pnpm run generate-test-data --servers=5
   ```

2. **Check overdue backups**:
   - Navigate to `/settings?tab=monitoring`
   - Review the "Next Run" column
   - Check color coding (green = future, red = overdue)

3. **Run overdue check**:
   ```bash
   pnpm run check-overdue "2025-12-28T10:00:00"
   ```

4. **Show overdue notifications**:
   ```bash
   pnpm run show-overdue-notifications
   ```

## Version History

- **v4.0+**: Current implementation with moving `time` field
- **v3.x**: Previous implementation (had issues with overdue detection)

## References

- User Guide: `/documentation/user-guide/overdue-monitoring.md`
- CHANGELOG: `/dev/CHANGELOG.md`
- Source Code: `/src/lib/db-utils.ts` (getConfigBackupSettings)

