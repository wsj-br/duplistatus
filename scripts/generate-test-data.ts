import { v4 as uuidv4 } from 'uuid';
import { db, dbOps, parseDurationToSeconds } from '../src/lib/db';
import { dbUtils, ensureBackupSettingsComplete } from '../src/lib/db-utils';
import { extractAvailableBackups } from '../src/lib/utils';

// Function to clean database tables before generating test data
async function cleanDatabaseTables() {
  console.log('🧹 Cleaning database tables before generating test data...');
  
  try {
    // Start a transaction for atomic cleanup
    const transaction = db.transaction(() => {
      // Delete all backups first (due to foreign key constraint)
      const backupsResult = db.prepare('DELETE FROM backups').run();
      console.log(`  🗑️  Deleted ${backupsResult.changes} backup records`);
      
      // Delete all machines
      const machinesResult = db.prepare('DELETE FROM machines').run();
      console.log(`  🗑️  Deleted ${machinesResult.changes} machine records`);
      
      // Delete all configurations
      const configsResult = db.prepare('DELETE FROM configurations').run();
      console.log(`  🗑️  Deleted ${configsResult.changes} configuration records`);
    });
    
    // Execute the transaction
    transaction();
    
    console.log('✅ Database cleanup completed successfully!');
    return true;
  } catch (error) {
    console.error('🚨 Error during database cleanup:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Machine configurations
const machines = [
  { id: 'machine-1', name: 'Test Machine 1', backupName: 'Machine 1' },
  { id: 'machine-2', name: 'Test Machine 2', backupName: 'Machine 2' },
  { id: 'machine-3', name: 'Test Machine 3', backupName: 'Machine 3' },
  { id: 'machine-4', name: 'Test Machine 4', backupName: 'Machine 4' },
  { id: 'machine-5', name: 'Test Machine 5', backupName: 'Machine 5' },
  { id: 'machine-6', name: 'Test Machine 6', backupName: 'Machine 6' },
  { id: 'machine-7', name: 'Test Machine 7', backupName: 'Machine 7' }
];

// Server health check function
async function checkServerHealth(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Server health check failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Helper function to generate a random duration between 2 minutes and 10 minutes
function generateRandomDuration(): string {
  const totalSeconds = Math.floor(Math.random() * (600 - 120) + 120);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generate backup dates according to the specified patterns
function generateBackupDates(machineIndex: number, backupType: string): string[] {
  const dates: string[] = [];
  const now = new Date();
  const isOddMachine = (machineIndex + 1) % 2 === 1;
  
  // Generate a time offset based on backup type to ensure different timestamps
  const backupTypeOffsets: { [key: string]: number } = {
    'Files': 0,        // No offset
    'Databases': 15,   // 15 minutes later
    'System': 30,      // 30 minutes later
    'Users': 45        // 45 minutes later
  };
  const timeOffsetMinutes = backupTypeOffsets[backupType] || 0;
  
  // Start with today (in the past)
  const today = new Date(now);
  today.setDate(today.getDate() - 1); // Yesterday to ensure it's in the past
  today.setMinutes(today.getMinutes() + timeOffsetMinutes); // Add backup type offset
  dates.push(today.toISOString());
  
  if (isOddMachine) {
    // Odd machine pattern: daily for a week, then weekly for 2 months, then monthly for 2 years
    
    // Daily backups for 6 more days (total 7 days including today)
    for (let i = 1; i <= 6; i++) {
      const dailyDate = new Date(today);
      dailyDate.setDate(dailyDate.getDate() - i);
      dates.push(dailyDate.toISOString());
    }
    
    // Weekly backups for 2 months (8 weeks)
    for (let i = 1; i <= 8; i++) {
      const weeklyDate = new Date(today);
      weeklyDate.setDate(weeklyDate.getDate() - (7 * i));
      dates.push(weeklyDate.toISOString());
    }
    
    // Monthly backups for remaining time until 2 years ago
    let monthCount = 1;
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - (7 * 8)); // Start after weekly backups
    
    while (currentDate.getTime() > now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000)) {
      currentDate.setMonth(currentDate.getMonth() - 1);
      dates.push(currentDate.toISOString());
      monthCount++;
    }
  } else {
    // Even machine pattern: daily for a week, then weekly for 6 months, then monthly for 2 years
    
    // Daily backups for 6 more days (total 7 days including today)
    for (let i = 1; i <= 6; i++) {
      const dailyDate = new Date(today);
      dailyDate.setDate(dailyDate.getDate() - i);
      dates.push(dailyDate.toISOString());
    }
    
    // Weekly backups for 6 months (26 weeks)
    for (let i = 1; i <= 26; i++) {
      const weeklyDate = new Date(today);
      weeklyDate.setDate(weeklyDate.getDate() - (7 * i));
      dates.push(weeklyDate.toISOString());
    }
    
    // Monthly backups for remaining time until 2 years ago
    let monthCount = 1;
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - (7 * 26)); // Start after weekly backups
    
    while (currentDate.getTime() > now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000)) {
      currentDate.setMonth(currentDate.getMonth() - 1);
      dates.push(currentDate.toISOString());
      monthCount++;
    }
  }
  
  // Sort dates in descending order (newest first)
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}

// Helper function to generate random file statistics
function generateRandomFileStats() {
  const examinedFiles = Math.floor(Math.random() * 3000) + 5000;
  const addedFiles = Math.floor(Math.random() * examinedFiles * 0.3);
  const modifiedFiles = Math.floor(Math.random() * examinedFiles * 0.1);
  const deletedFiles = Math.floor(Math.random() * examinedFiles * 0.05);
  const fileSize = Math.floor(Math.random() * 200000000) + 500000000; // 500MB to 700MB
  const uploadedSize = Math.floor(fileSize * (Math.random() * 0.3 + 0.7)); // 70-100% of file size

  return {
    examinedFiles,
    addedFiles,
    modifiedFiles,
    deletedFiles,
    fileSize,
    uploadedSize
  };
}

// Add this helper function to generate message arrays
function generateMessageArrays(warningsCount: number, errorsCount: number, messagesCount: number) {
  const warnings = Array.from({ length: warningsCount }, (_, i) => 
    `Warning ${(i + 1).toString().padStart(3, '0')}`
  );
  
  const errors = Array.from({ length: errorsCount }, (_, i) => 
    `Error ${(i + 1).toString().padStart(3, '0')}`
  );
  
  // Include the specific retention policy messages
  const retentionPolicyMessages = [
    "2025-08-05 18:26:53 +01 - [Information-Duplicati.Library.Main.Operation.DeleteHandler:RetentionPolicy-StartCheck]: Start checking if backups can be removed",
    "2025-08-05 18:26:53 +01 - [Information-Duplicati.Library.Main.Operation.DeleteHandler:RetentionPolicy-FramesAndIntervals]: Time frames and intervals pairs: 7.00:00:00 / 1.00:00:00, 28.00:00:00 / 7.00:00:00, 365.00:00:00 / 31.00:00:00",
    "2025-08-05 18:26:53 +01 - [Information-Duplicati.Library.Main.Operation.DeleteHandler:RetentionPolicy-BackupList]: Backups to consider: 04/08/2025 00:14:55, 31/07/2025 15:10:00, 18/07/2025 15:10:00, 30/06/2025 23:34:57, 29/06/2025 16:08:11, 18/05/2025 20:39:59, 12/04/2025 16:31:15",
    "2025-08-05 18:26:53 +01 - [Information-Duplicati.Library.Main.Operation.DeleteHandler:RetentionPolicy-BackupsToDelete]: Backups outside of all time frames and thus getting deleted: ",
    "2025-08-05 18:26:53 +01 - [Information-Duplicati.Library.Main.Operation.DeleteHandler:RetentionPolicy-AllBackupsToDelete]: All backups to delete: ",
    "2025-08-05 18:26:53 +01 - [Information-Duplicati.Library.Main.Operation.DeleteHandler-DeleteResults]: No remote filesets were deleted"
  ];
  
  // Generate additional random messages to fill the requested count
  const additionalMessages = Array.from({ length: Math.max(0, messagesCount - retentionPolicyMessages.length) }, (_, i) => 
    `Message ${(i + 1).toString().padStart(3, '0')}`
  );
  
  // Combine retention policy messages with additional random messages
  const messages = [...retentionPolicyMessages, ...additionalMessages];

  return { warnings, errors, messages };
}

// Modify the generateBackupPayload function
function generateBackupPayload(machine: typeof machines[0], backupNumber: number, beginTime: string, backupType: string = "Backup") {
  const endTime = new Date(new Date(beginTime).getTime() + Math.random() * 7200000);
  const duration = generateRandomDuration();
  const stats = generateRandomFileStats();
  const hasWarnings = Math.random() > 0.9; // 10% chance of warnings
  const hasErrors = Math.random() > 0.98; // 2% chance of errors
  
  // Generate message counts
  const warningsCount = hasWarnings ? Math.floor(Math.random() * 5) : 0; // 0 to 4
  const errorsCount = hasErrors ? Math.floor(Math.random() * 3) : 0; // 0 to 2
  const messagesCount = Math.floor(Math.random() * 11) + 10; // 10 to 20
  
  // Generate the message arrays
  const { warnings, errors, messages } = generateMessageArrays(
    warningsCount,
    errorsCount,
    messagesCount
  );

  return {
    Data: {
      DeletedFiles: stats.deletedFiles,
      DeletedFolders: Math.floor(stats.deletedFiles * 0.1),
      ModifiedFiles: stats.modifiedFiles,
      ExaminedFiles: stats.examinedFiles,
      OpenedFiles: stats.addedFiles + stats.modifiedFiles,
      AddedFiles: stats.addedFiles,
      SizeOfModifiedFiles: Math.floor(stats.fileSize * 0.1),
      SizeOfAddedFiles: Math.floor(stats.fileSize * 0.3),
      SizeOfExaminedFiles: stats.fileSize,
      SizeOfOpenedFiles: Math.floor(stats.fileSize * 0.4),
      NotProcessedFiles: Math.floor(stats.examinedFiles * 0.05),
      AddedFolders: Math.floor(stats.addedFiles * 0.2),
      TooLargeFiles: Math.floor(Math.random() * 5),
      FilesWithError: hasErrors ? Math.floor(Math.random() * 5) + 1 : 0,
      ModifiedFolders: Math.floor(stats.modifiedFiles * 0.1),
      ModifiedSymlinks: Math.floor(Math.random() * 3),
      AddedSymlinks: Math.floor(Math.random() * 3),
      DeletedSymlinks: Math.floor(Math.random() * 2),
      PartialBackup: Math.random() > 0.95, // 5% chance of partial backup
      Dryrun: false,
      MainOperation: "Backup",
      ParsedResult: hasErrors ? "Error" : (hasWarnings ? "Warning" : "Success"),
      Interrupted: false,
      Version: "2.1.0.5 (2.1.0.5_stable_2025-03-04)",
      BeginTime: beginTime,
      EndTime: endTime.toISOString(),
      Duration: duration,
      Warnings: warnings,
      Errors: errors,
      Messages: messages,
      WarningsActualLength: warnings.length,
      ErrorsActualLength: errors.length,
      MessagesActualLength: messages.length,
      BackendStatistics: {
        BytesUploaded: stats.uploadedSize,
        BytesDownloaded: Math.floor(stats.uploadedSize * 0.1),
        KnownFileSize: Math.floor(stats.fileSize * ((Math.random() * 2) + 1) ),
        LastBackupDate: new Date(new Date(beginTime).getTime() - 86400000).toISOString(), // 1 day before
        BackupListCount: Math.floor(Math.random()*3+9),
        ReportedQuotaError: false,
        ReportedQuotaWarning: Math.random() > 0.9, // 10% chance of quota warning
        MainOperation: "Backup",
        ParsedResult: hasErrors ? "Failed" : (hasWarnings ? "Warning" : "Success"),
        Interrupted: false,
        Version: "2.1.0.5 (2.1.0.5_stable_2025-03-04)",
        BeginTime: beginTime,
        Duration: duration,
        WarningsActualLength: warningsCount,
        ErrorsActualLength: errorsCount
      }
    },
    Extra: {
      OperationName: backupType,
      'machine-id': machine.id,
      'machine-name': machine.name,
      'backup-name': backupType,
      'backup-id': `DB-${backupNumber}`
    }
  };
}

// Parse command line arguments
function parseArgs(): { useUpload: boolean } {
  const args = process.argv.slice(2);
  const useUpload = args.includes('--upload');
  return { useUpload };
}

// Function to write backup data directly to database
async function writeBackupToDatabase(payload: any): Promise<boolean> {
  try {
    // Check for duplicate backup
    const backupDate = new Date(payload.Data.BeginTime).toISOString();
    const isDuplicate = await dbUtils.checkDuplicateBackup({
      machine_id: payload.Extra['machine-id'],
      backup_name: payload.Extra['backup-name'],
      date: backupDate
    });

    if (isDuplicate) {
      console.log('          ⚠️  Duplicate backup detected, skipping...');
      return false;
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Insert machine information only if it doesn't exist (preserves existing server_url)
      dbOps.insertMachineIfNotExists.run({
        id: payload.Extra['machine-id'],
        name: payload.Extra['machine-name']
      });

      // Map backup status
      let status = payload.Data.ParsedResult;
      if (status === "Success" && payload.Data.WarningsActualLength > 0) {
        status = "Warning";
      }

      // Insert backup data with all fields
      dbOps.insertBackup.run({
        // Primary fields
        id: uuidv4(),
        machine_id: payload.Extra['machine-id'],
        backup_name: payload.Extra['backup-name'],
        backup_id: payload.Extra['backup-id'],
        date: new Date(payload.Data.BeginTime).toISOString(),
        status: status,
        duration_seconds: parseDurationToSeconds(payload.Data.Duration),
        size: payload.Data.SizeOfExaminedFiles || 0,
        uploaded_size: payload.Data.BackendStatistics?.BytesUploaded || 0,
        examined_files: payload.Data.ExaminedFiles || 0,
        warnings: payload.Data.WarningsActualLength || 0,
        errors: payload.Data.ErrorsActualLength || 0,

        // Message arrays stored as JSON blobs
        messages_array: payload.LogLines ? JSON.stringify(payload.LogLines) : 
                        (payload.Data.Messages ? JSON.stringify(payload.Data.Messages) : null), 
        warnings_array: payload.Data.Warnings ? JSON.stringify(payload.Data.Warnings) : null,
        errors_array: payload.Data.Errors ? JSON.stringify(payload.Data.Errors) : null,
        available_backups: JSON.stringify(extractAvailableBackups(
          payload.LogLines ? JSON.stringify(payload.LogLines) : 
          (payload.Data.Messages ? JSON.stringify(payload.Data.Messages) : null)
        )),

        // Data fields
        deleted_files: payload.Data.DeletedFiles || 0,
        deleted_folders: payload.Data.DeletedFolders || 0,
        modified_files: payload.Data.ModifiedFiles || 0,
        opened_files: payload.Data.OpenedFiles || 0,
        added_files: payload.Data.AddedFiles || 0,
        size_of_modified_files: payload.Data.SizeOfModifiedFiles || 0,
        size_of_added_files: payload.Data.SizeOfAddedFiles || 0,
        size_of_examined_files: payload.Data.SizeOfExaminedFiles || 0,
        size_of_opened_files: payload.Data.SizeOfOpenedFiles || 0,
        not_processed_files: payload.Data.NotProcessedFiles || 0,
        added_folders: payload.Data.AddedFolders || 0,
        too_large_files: payload.Data.TooLargeFiles || 0,
        files_with_error: payload.Data.FilesWithError || 0,
        modified_folders: payload.Data.ModifiedFolders || 0,
        modified_symlinks: payload.Data.ModifiedSymlinks || 0,
        added_symlinks: payload.Data.AddedSymlinks || 0,
        deleted_symlinks: payload.Data.DeletedSymlinks || 0,
        partial_backup: payload.Data.PartialBackup ? 1 : 0,
        dryrun: payload.Data.Dryrun ? 1 : 0,
        main_operation: payload.Data.MainOperation,
        parsed_result: payload.Data.ParsedResult,
        interrupted: payload.Data.Interrupted ? 1 : 0,
        version: payload.Data.Version,
        begin_time: new Date(payload.Data.BeginTime).toISOString(),
        end_time: new Date(payload.Data.EndTime).toISOString(),
        warnings_actual_length: payload.Data.WarningsActualLength || 0,
        errors_actual_length: payload.Data.ErrorsActualLength || 0,
        messages_actual_length: payload.Data.MessagesActualLength || 0,

        // BackendStatistics fields
        bytes_downloaded: payload.Data.BackendStatistics?.BytesDownloaded || 0,
        known_file_size: payload.Data.BackendStatistics?.KnownFileSize || 0,
        last_backup_date: payload.Data.BackendStatistics?.LastBackupDate ? new Date(payload.Data.BackendStatistics.LastBackupDate).toISOString() : null,
        backup_list_count: payload.Data.BackendStatistics?.BackupListCount || 0,
        reported_quota_error: payload.Data.BackendStatistics?.ReportedQuotaError ? 1 : 0,
        reported_quota_warning: payload.Data.BackendStatistics?.ReportedQuotaWarning ? 1 : 0,
        backend_main_operation: payload.Data.BackendStatistics?.MainOperation,
        backend_parsed_result: payload.Data.BackendStatistics?.ParsedResult,
        backend_interrupted: payload.Data.BackendStatistics?.Interrupted ? 1 : 0,
        backend_version: payload.Data.BackendStatistics?.Version,
        backend_begin_time: payload.Data.BackendStatistics?.BeginTime ? new Date(payload.Data.BackendStatistics.BeginTime).toISOString() : null,
        backend_duration: payload.Data.BackendStatistics?.Duration,
        backend_warnings_actual_length: payload.Data.BackendStatistics?.WarningsActualLength || 0,
        backend_errors_actual_length: payload.Data.BackendStatistics?.ErrorsActualLength || 0
      });
    });

    // Execute the transaction
    transaction();
    return true;
  } catch (error) {
    console.error('Error writing backup to database:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Function to cleanup backups - keep only 5-8 random backups for 1 random backup type from 2 random machines
async function cleanupBackupsForUserManual(){
  console.log('\n  🧹 Cleaning up backups for user manual demonstration...');
  
  // Select 2 random machines from the first 6 machines
  const firstSixMachines = machines.slice(0, 6);
  const shuffledMachines = [...firstSixMachines].sort(() => Math.random() - 0.5);
  const selectedMachines = shuffledMachines.slice(0, 2);
  
  // Generate random number of backups to keep (5-8)
  const backupsToKeep = Math.floor(Math.random() * 4) + 5; // 5 to 8
  
  console.log(`    🎯 Selected machines: ${selectedMachines.map(m => m.name).join(', ')}`);
  console.log(`    📊 Keeping ${backupsToKeep} most recent backups for each selected machine-backup combination`);
  
  for (const machine of selectedMachines) {
    try {
      // Get all backup types that exist for this machine
      const backupTypesResult = db.prepare(`
        SELECT DISTINCT backup_name FROM backups 
        WHERE machine_id = ?
        ORDER BY backup_name
      `).all(machine.id) as { backup_name: string }[];
      
      const availableBackupTypes = backupTypesResult.map(row => row.backup_name);
      
      if (availableBackupTypes.length === 0) {
        console.log(`      ⚠️  ${machine.name}: No backups found, skipping...`);
        continue;
      }
      
      // Select 1 random backup type from the available ones for this machine
      const selectedBackupType = availableBackupTypes[Math.floor(Math.random() * availableBackupTypes.length)];
      
      console.log(`      📁 ${machine.name} - Selected backup type: ${selectedBackupType} (from available: ${availableBackupTypes.join(', ')})`);
      
      // Count total backups for this machine-backup combination
      const countResult = db.prepare(`
        SELECT COUNT(*) as total FROM backups 
        WHERE machine_id = ? AND backup_name = ?
      `).get(machine.id, selectedBackupType) as { total: number };
      
      const totalBackups = countResult.total;
      
      if (totalBackups <= backupsToKeep) {
        console.log(`      ✅ ${machine.name} - ${selectedBackupType}: Only ${totalBackups} backups exist, no cleanup needed`);
        continue;
      }
      
      const backupsToDelete = totalBackups - backupsToKeep;
      
      // Delete older backups, keeping the most recent ones
      const deleteResult = db.prepare(`
        DELETE FROM backups 
        WHERE id IN (
          SELECT id FROM backups 
          WHERE machine_id = ? AND backup_name = ? 
          ORDER BY date DESC 
          LIMIT -1 OFFSET ?
        )
      `).run(machine.id, selectedBackupType, backupsToKeep);
      
      console.log(`      🗑️  ${machine.name} - ${selectedBackupType}: Deleted ${deleteResult.changes} backups, kept ${backupsToKeep} most recent`);
      
    } catch (error) {
      console.error(`      🚨 Error cleaning up backups for ${machine.name}:`, 
        error instanceof Error ? error.message : String(error));
    }
  }

  try {
    // Get all available machine-backup combinations
    const combinationsResult = db.prepare(`
      SELECT DISTINCT b.machine_id, b.backup_name, m.name as machine_name
      FROM backups b
      JOIN machines m ON b.machine_id = m.id
      ORDER BY b.machine_id, b.backup_name
    `).all() as { machine_id: number; backup_name: string; machine_name: string }[];
    
    if (combinationsResult.length === 0) {
      console.log('    ⚠️  No machine-backup combinations found for additional cleanup');
      return;
    }
    
    // Shuffle and select 2 random combinations
    const shuffledCombinations = [...combinationsResult].sort(() => Math.random() - 0.5);
    const selectedCombinations = shuffledCombinations.slice(0, Math.min(2, shuffledCombinations.length));
    
    console.log(`    🎯 Selected ${selectedCombinations.length} combinations for last backup deletion:`);
    selectedCombinations.forEach(combo => {
      console.log(`      - ${combo.machine_name} (${combo.backup_name})`);
    });
    
    for (const combination of selectedCombinations) {
      try {
        // Get the most recent backup for this combination
        const lastBackupResult = db.prepare(`
          SELECT id, date FROM backups 
          WHERE machine_id = ? AND backup_name = ? 
          ORDER BY date DESC 
          LIMIT 1
        `).get(combination.machine_id, combination.backup_name) as { id: number; date: string } | undefined;
        
        if (!lastBackupResult) {
          console.log(`      ⚠️  ${combination.machine_name} (${combination.backup_name}): No backups found`);
          continue;
        }
        
        // Delete the last backup
        const deleteResult = db.prepare(`
          DELETE FROM backups 
          WHERE id = ?
        `).run(lastBackupResult.id);
        
        if (deleteResult.changes > 0) {
          const backupDate = new Date(lastBackupResult.date).toLocaleDateString();
          console.log(`      🗑️  ${combination.machine_name} (${combination.backup_name}): Deleted last backup from ${backupDate}`);
        } else {
          console.log(`      ⚠️  ${combination.machine_name} (${combination.backup_name}): Failed to delete backup`);
        }
        
      } catch (error) {
        console.error(`      🚨 Error deleting last backup for ${combination.machine_name} (${combination.backup_name}):`, 
          error instanceof Error ? error.message : String(error));
      }
    }
    
  console.log('  ✅ Backup cleanup completed!');
    
  } catch (error) {
    console.error('  🚨 Error during additional cleanup:', 
      error instanceof Error ? error.message : String(error));
  }
}

// Main function to send test data
async function sendTestData(useUpload: boolean = false) {
  const API_URL = 'http://localhost:8666/api/upload';
  const HEALTH_CHECK_URL = 'http://localhost:8666/api/health'; // Adjust this URL based on your actual health endpoint
  const BACKUP_TYPES = ['Files', 'Databases', 'System', 'Users'];

  // Clean database tables before generating test data 
  const cleanupSuccess = await cleanDatabaseTables();
  if (!cleanupSuccess) {
    console.error('🚨 Database cleanup failed. Aborting test data generation.');
    process.exit(1);
  }
  console.log(''); // Add spacing after cleanup

  // Check server health before proceeding (only when using upload mode)
  if (useUpload) {
    console.log('  🩺 Checking server health...');
    const isServerHealthy = await checkServerHealth(HEALTH_CHECK_URL);
    if (!isServerHealthy) {
      console.error('🚨 Server is not reachable. Please ensure the server is running and try again.');
      process.exit(1);
    }
    console.log('  👍 Server is healthy, proceeding with data generation...');
  } else {
    console.log('  💾 Writing directly to database...');
  }

  for (let machineIndex = 0; machineIndex < machines.length; machineIndex++) {
    const machine = machines[machineIndex];
    const isOddMachine = (machineIndex + 1) % 2 === 1;
    
    // Randomly select a subset of backup types for this machine
    // 70% chance of 2 types, 30% chance of 3-4 types
    const randomBackupCount = Math.random() < 0.6 
      ? 2 
      : Math.floor(Math.random() * 2) + 3; // 3 or 4 types  
    const shuffledBackupTypes = [...BACKUP_TYPES].sort(() => Math.random() - 0.5);
    const selectedBackupTypes = shuffledBackupTypes.slice(0, randomBackupCount);
    
    console.log(`\n    🔄 Generating backups for ${machine.name} (${isOddMachine ? 'Odd' : 'Even'} machine pattern)...`);
    console.log(`      📅 Pattern: ${isOddMachine ? 'Daily for 1 week, then weekly for 2 months, then monthly for 2 years' : 'Daily for 1 week, then weekly for 6 months, then monthly for 2 years'}`);
    console.log(`      🎯 Selected backup types (${selectedBackupTypes.length}/${BACKUP_TYPES.length}): ${selectedBackupTypes.join(', ')}`);
    
    for (const backupType of selectedBackupTypes) {
      // Generate backup dates for this specific backup type
      const backupDates = generateBackupDates(machineIndex, backupType);
      console.log(`        📁 Generating ${backupDates.length} ${backupType} backups...`);
      
      for (let i = 0; i < backupDates.length; i++) {
        const backupNumber = i + 1;
        const beginTime = backupDates[i];
        const payload = generateBackupPayload(machine, backupNumber, beginTime, backupType);
        
        try {
          const backupDate = new Date(beginTime).toLocaleDateString();
          let success = false;

          if (useUpload) {
            // Upload via API endpoint
            const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            success = result.success;
            
            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            // Write directly to database
            success = await writeBackupToDatabase(payload);
          }

          console.log(`          📄 ${backupType} Backup ${backupNumber}/${backupDates.length} for ${machine.name} (${backupDate}): ${success ? 'Success' : 'Failed'}`);
        } catch (error) {
          console.error(`🚨 Error processing backup ${backupNumber} for ${machine.name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
  }

  // Ensure backup settings are complete for all machines and backups (only for direct DB mode)
  if (!useUpload) {
    console.log('\n  🔧 Ensuring backup settings are complete...');
    const backupSettingsResult = await ensureBackupSettingsComplete();
    if (backupSettingsResult.added > 0) {
      console.log(`  ✅ Added ${backupSettingsResult.added} default backup settings for ${backupSettingsResult.total} total machine-backup combinations`);
    }
    
    // Cleanup backups for user manual demonstration
    await cleanupBackupsForUserManual();
  }
}

// Run the script
const { useUpload } = parseArgs();

console.log('🛫 Starting test data generation...\n');
if (useUpload) {
  console.log('  📤 Mode: Upload via API endpoint');
} else {
  console.log('  💾 Mode: Direct database write');
}
console.log('  🧹 Database cleanup: Will clear machines, backups, and configurations tables before generation');
console.log('  ℹ️ Generating backups with specific date patterns:');
console.log('     • Odd machines: Daily for 1 week, then weekly for 2 months, then monthly for 2 years');
console.log('     • Even machines: Daily for 1 week, then weekly for 6 months, then monthly for 2 years');
console.log('     • Random backup types per machine (1-3 types from: Files, Databases, System)');
console.log('     • After generation: Random cleanup some machines/backup types and last backups for the user manual screenshots\n');


sendTestData(useUpload).then(() => {
  console.log('\n🎉 Test data generation completed!');
}).catch(error => {
  console.error('🚨 Error generating test data:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 