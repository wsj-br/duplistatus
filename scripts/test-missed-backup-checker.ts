import { checkMissedBackups, clearMissedBackupNotificationTimestamps } from '../src/lib/missed-backup-checker';
import { dbUtils, getConfiguration, setConfiguration, setResendFrequencyConfig } from '../src/lib/db-utils';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// SQL to delete test data
//
// SELECT id, name, created_at
// FROM machines
// WHERE name LIKE '%Test Machine Missed%';
// SELECT * FROM backups
// WHERE backup_name LIKE 'TestDailyBackup';
// DELETE FROM backups
// WHERE backup_name LIKE 'TestDailyBackup';
// DELETE FROM machines
// WHERE name LIKE '%Test Machine Missed%';
// SELECT id, name, created_at
// FROM machines
// WHERE name LIKE '%Test Machine Missed%';
// SELECT * FROM backups
// WHERE backup_name LIKE 'TestDailyBackup';



// Save and restore config helpers
const CONFIG_KEYS = [
  'notifications',
  'backup_settings',
  'resend_frequency',
  'missed_backup_notifications',
];
let originalConfigs: Record<string, string | null> = {};

async function saveOriginalConfigs() {
  for (const key of CONFIG_KEYS) {
    originalConfigs[key] = getConfiguration(key);
  }
}

async function restoreOriginalConfigs() {
  for (const key of CONFIG_KEYS) {
    const value = originalConfigs[key];
    if (value === null || value === undefined) {
      // Remove config if it didn't exist before
      setConfiguration(key, '');
    } else {
      setConfiguration(key, value);
    }
  }
}

async function deleteTestMachineAndBackups(machineId: string) {
  try {
    dbUtils.deleteMachine(machineId);
  } catch (e) {
    // Ignore errors
  }
}

// Track all test machine IDs for cleanup
const testMachineIds: string[] = [];

async function setupTestData({ resendFrequency, backupMissed = true, backupAgeDays = 2 }: { resendFrequency: string, backupMissed?: boolean, backupAgeDays?: number }) {
  clearMissedBackupNotificationTimestamps();
  setResendFrequencyConfig(resendFrequency as any);

  const machineId = uuidv4();
  const machineName = `Test Machine Missed (${resendFrequency},${backupMissed ? 'missed' : 'not-missed'})`;
  const backupName = 'TestDailyBackup';

  dbUtils.upsertMachine({ id: machineId, name: machineName });

  // Insert a backup: if missed, set backupAgeDays ago; if not missed, set 1 hour ago
  const backupDate = backupMissed
    ? new Date(Date.now() - backupAgeDays * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();

  // Required fields for backups table
  const backup_id = `test-backup-id-${machineId}`;
  const main_operation = 'Backup';
  const parsed_result = 'Success';
  const begin_time = backupDate;
  const end_time = backupDate;

  dbUtils.insertBackup({
    id: uuidv4(),
    machine_id: machineId,
    backup_name: backupName,
    backup_id,
    date: backupDate,
    status: 'Success',
    warnings: 0,
    errors: 0,
    messages_actual_length: 0,
    examined_files: 100,
    size: 1000000,
    uploaded_size: 1000000,
    duration_seconds: 3600,
    known_file_size: 1000000,
    backup_list_count: 1,
    messages_array: '[]',
    warnings_array: '[]',
    errors_array: '[]',
    available_backups: '[]',
    deleted_files: 0,
    deleted_folders: 0,
    modified_files: 0,
    opened_files: 0,
    added_files: 0,
    size_of_modified_files: 0,
    size_of_added_files: 0,
    size_of_examined_files: 0,
    size_of_opened_files: 0,
    not_processed_files: 0,
    added_folders: 0,
    too_large_files: 0,
    files_with_error: 0,
    modified_folders: 0,
    modified_symlinks: 0,
    added_symlinks: 0,
    deleted_symlinks: 0,
    partial_backup: 0,
    dryrun: 0,
    main_operation,
    parsed_result,
    interrupted: 0,
    version: 'test',
    begin_time,
    end_time,
    warnings_actual_length: 0,
    errors_actual_length: 0,
    bytes_downloaded: 0,
    last_backup_date: null,
    reported_quota_error: 0,
    reported_quota_warning: 0,
    backend_main_operation: null,
    backend_parsed_result: null,
    backend_interrupted: 0,
    backend_version: null,
    backend_begin_time: null,
    backend_duration: null,
    backend_warnings_actual_length: 0,
    backend_errors_actual_length: 0
  });

  const notificationConfig = {
    ntfy: { url: 'https://ntfy.sh/', topic: 'TjhId2wj6lbN' },
    machineSettings: {},
    backupSettings: {
      [`${machineName}:${backupName}`]: {
        notificationEvent: 'all',
        expectedInterval: 24, // 24 hours
        missedBackupCheckEnabled: true,
        intervalUnit: 'hours',
      },
    },
    templates: {
      success: { title: '', priority: '', tags: '', message: '' },
      warning: { title: '', priority: '', tags: '', message: '' },
      missedBackup: { title: 'test-missed-backup-checker', priority: '', tags: '', message: 'test: backup {backup_name} on {machine_name} triggered' },
    },
  };
  setConfiguration('notifications', JSON.stringify(notificationConfig));
  setConfiguration('backup_settings', JSON.stringify(notificationConfig.backupSettings));

  // Track for cleanup
  testMachineIds.push(machineId);
  return { machineId, machineName, backupName };
}

async function printNotificationTimestamps() {
  const json = getConfiguration('missed_backup_notifications');
  if (!json) {
    console.log('No missed backup notification timestamps found.');
    return;
  }
  console.log('Missed backup notification timestamps:', JSON.stringify(JSON.parse(json), null, 2));
}

async function testResendNever() {
  console.log('\n=== Test: Resend Frequency = never, missed backup ===');
  await setupTestData({ resendFrequency: 'never', backupMissed: true });
  await printNotificationTimestamps();
  const result1 = await checkMissedBackups();
  console.log('Result after first check:', result1);
  await printNotificationTimestamps();
  const result2 = await checkMissedBackups();
  console.log('Result after second check (should NOT resend):', result2);
  await printNotificationTimestamps();
}

async function testResendWeek() {
  console.log('\n=== Test: Resend Frequency = every_week, missed backup (8 days old) ===');
  await setupTestData({ resendFrequency: 'every_week', backupMissed: true, backupAgeDays: 8 });
  await printNotificationTimestamps();
  const result1 = await checkMissedBackups();
  console.log('Result after first check:', result1);
  await printNotificationTimestamps();
  // Simulate a second run after 1 second (should NOT resend)
  const result2 = await checkMissedBackups();
  console.log('Result after second check (should NOT resend yet):', result2);
  await printNotificationTimestamps();
  // Simulate a third run after 8 days (should resend)
  // (In real test, would mock Date; here, we clear timestamps to simulate passage)
  clearMissedBackupNotificationTimestamps();
  const result3 = await checkMissedBackups();
  console.log('Result after third check (should resend after 1 week):', result3);
  await printNotificationTimestamps();
}

async function testResendMonth() {
  console.log('\n=== Test: Resend Frequency = every_month, missed backup (32 days old) ===');
  await setupTestData({ resendFrequency: 'every_month', backupMissed: true, backupAgeDays: 32 });
  await printNotificationTimestamps();
  const result1 = await checkMissedBackups();
  console.log('Result after first check:', result1);
  await printNotificationTimestamps();
  // Simulate a second run after 1 second (should NOT resend)
  const result2 = await checkMissedBackups();
  console.log('Result after second check (should NOT resend yet):', result2);
  await printNotificationTimestamps();
  // Simulate a third run after 32 days (should resend)
  clearMissedBackupNotificationTimestamps();
  const result3 = await checkMissedBackups();
  console.log('Result after third check (should resend after 1 month):', result3);
  await printNotificationTimestamps();
}

async function testNotMissedBackup() {
  console.log('\n=== Test: Backup is NOT missed (recent backup) ===');
  await setupTestData({ resendFrequency: 'every_day', backupMissed: false });
  await printNotificationTimestamps();
  const result1 = await checkMissedBackups();
  console.log('Result after check (should NOT send notification):', result1);
  await printNotificationTimestamps();
}

async function main() {
  await saveOriginalConfigs();
  try {
    await testResendNever();
    await testResendWeek();
    await testResendMonth();
    await testNotMissedBackup();
  } finally {
    // Clean up test machines and restore configs
    for (const id of testMachineIds) {
      await deleteTestMachineAndBackups(id);
    }
    await restoreOriginalConfigs();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 