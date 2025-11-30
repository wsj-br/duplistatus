import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { db, dbOps, parseDurationToSeconds } from '../src/lib/db';
import { dbUtils, getConfigBackupSettings, clearRequestCache } from '../src/lib/db-utils';
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
      
      // Delete all servers
      const serversResult = db.prepare('DELETE FROM servers').run();
      console.log(`  🗑️  Deleted ${serversResult.changes} server records`);
      
      // Delete backup_settings configuration specifically (so it can be recalculated)
      const backupSettingsResult = db.prepare("DELETE FROM configurations WHERE key = 'backup_settings'").run();
      console.log(`  🗑️  Deleted backup_settings configuration (${backupSettingsResult.changes} row(s))`);
      
      // Delete all remaining configurations
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

// Function to clean database tables before generating test data
async function cleanBackupSettings() {
  console.log('🧹 Cleaning backup_settings configuration...');
  
  try {
    // Start a transaction for atomic cleanup
    const transaction = db.transaction(() => {

      // Delete backup_settings configuration specifically (so it can be recalculated)
      const backupSettingsResult = db.prepare("DELETE FROM configurations WHERE key = 'backup_settings'").run();
      console.log(`  🗑️  Deleted backup_settings configuration (${backupSettingsResult.changes} row(s))`);
      
    });
    
    // Execute the transaction
    transaction();
    
    console.log('✅ backup_settings cleanup completed successfully!');
    return true;
  } catch (error) {
    console.error('🚨 Error during backup_settings cleanup:', error instanceof Error ? error.message : String(error));
    return false;
  }
} 


// Server configurations
const servers = [
  { id: createHash('md5').update('server-1').digest('hex'), name: 'DB-PROD-01', alias: 'Production DB', note: 'Primary database server - critical backups', backupName: 'S1' },
  { id: createHash('md5').update('server-2').digest('hex'), name: 'WEB-PROD-01', alias: 'Web Frontend', note: 'Main web application server', backupName: 'S2' },
  { id: createHash('md5').update('server-3').digest('hex'), name: 'FS-PROD-01', alias: 'File Storage', note: 'Document and media file storage', backupName: 'S3' },
  { id: createHash('md5').update('server-4').digest('hex'), name: 'DEV-TEST-01', alias: '', note: 'Development environment - low priority', backupName: 'S4' },
  { id: createHash('md5').update('server-5').digest('hex'), name: 'ANL-PROD-01', alias: 'Analytics', note: '', backupName: 'S5' },
  { id: createHash('md5').update('server-6').digest('hex'), name: 'STG-PROD-01', alias: 'Staging', note: 'Pre-production testing server', backupName: 'S6' },
  { id: createHash('md5').update('server-7').digest('hex'), name: 'BK-DR-01', alias: 'Backup Storage', note: 'Secondary backup destination', backupName: 'S7' },
  { id: createHash('md5').update('server-8').digest('hex'), name: 'MAIL-PROD-01', alias: 'Mail Server', note: 'Corporate email and messaging system', backupName: 'S8' },
  { id: createHash('md5').update('server-9').digest('hex'), name: 'CRM-PROD-01', alias: 'CRM System', note: 'Customer relationship management platform', backupName: 'S9' },
  { id: createHash('md5').update('server-10').digest('hex'), name: 'MON-PROD-01', alias: 'Monitoring', note: 'Infrastructure monitoring and alerting', backupName: 'S10' },
  { id: createHash('md5').update('server-11').digest('hex'), name: 'LB-PROD-01', alias: 'Load Balancer', note: 'Traffic distribution and SSL termination', backupName: 'S11' },
  { id: createHash('md5').update('server-12').digest('hex'), name: 'CACHE-PROD-01', alias: 'Cache Server', note: 'Redis and Memcached caching layer', backupName: 'S12' },
  { id: createHash('md5').update('server-13').digest('hex'), name: 'CI-CD-PROD-01', alias: 'CI/CD Pipeline', note: 'Continuous integration and deployment', backupName: 'S13' },
  { id: createHash('md5').update('server-14').digest('hex'), name: 'SEC-PROD-01', alias: 'Security Gateway', note: 'Firewall and intrusion detection system', backupName: 'S14' },
  { id: createHash('md5').update('server-15').digest('hex'), name: 'API-PROD-01', alias: 'API Gateway', note: 'REST API management and rate limiting', backupName: 'S15' },
  { id: createHash('md5').update('server-16').digest('hex'), name: 'LOG-PROD-01', alias: 'Log Aggregator', note: 'Centralized logging and log analysis', backupName: 'S16' },
  { id: createHash('md5').update('server-17').digest('hex'), name: 'DNS-PROD-01', alias: 'DNS Server', note: 'Domain name resolution and DNS management', backupName: 'S17' },
  { id: createHash('md5').update('server-18').digest('hex'), name: 'VPN-PROD-01', alias: 'VPN Server', note: 'Remote access and secure tunneling', backupName: 'S18' },
  { id: createHash('md5').update('server-19').digest('hex'), name: 'BK-DR-02', alias: 'Backup Replica', note: 'Tertiary backup storage for disaster recovery', backupName: 'S19' },
  { id: createHash('md5').update('server-20').digest('hex'), name: 'QA-TEST-01', alias: 'Test Environment', note: 'Automated testing and QA environment', backupName: 'S20' },
  { id: createHash('md5').update('server-21').digest('hex'), name: 'DOC-PROD-01', alias: 'Document Server', note: 'Document management and collaboration platform', backupName: 'S21' },
  { id: createHash('md5').update('server-22').digest('hex'), name: 'MEDIA-PROD-01', alias: 'Media Server', note: 'Video streaming and media content delivery', backupName: 'S22' },
  { id: createHash('md5').update('server-23').digest('hex'), name: 'INV-PROD-01', alias: 'Inventory System', note: 'Asset tracking and inventory management', backupName: 'S23' },
  { id: createHash('md5').update('server-24').digest('hex'), name: 'PAY-PROD-01', alias: 'Payment Gateway', note: 'Financial transactions and payment processing', backupName: 'S24' },
  { id: createHash('md5').update('server-25').digest('hex'), name: 'HR-PROD-01', alias: 'HR System', note: 'Human resources and employee management', backupName: 'S25' },
  { id: createHash('md5').update('server-26').digest('hex'), name: 'DEVOPS-PROD-01', alias: 'DevOps Tools', note: 'Container orchestration and deployment tools', backupName: 'S26' },
  { id: createHash('md5').update('server-27').digest('hex'), name: 'ARCH-DR-01', alias: 'Archive Server', note: 'Long-term data archival and compliance storage', backupName: 'S27' },
  { id: createHash('md5').update('server-28').digest('hex'), name: 'RPT-PROD-01', alias: 'Reporting Server', note: 'Business intelligence and reporting platform', backupName: 'S28' },
  { id: createHash('md5').update('server-29').digest('hex'), name: 'MOBILE-PROD-01', alias: 'Mobile API', note: 'Mobile application backend services', backupName: 'S29' },
  { id: createHash('md5').update('server-30').digest('hex'), name: 'COMP-PROD-01', alias: 'Compliance Server', note: 'Regulatory compliance and audit logging', backupName: 'S30' }
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
function generateBackupDates(serverIndex: number, backupJob: string): string[] {
  const dates: string[] = [];
  const now = new Date();
  const isOddServer = (serverIndex + 1) % 2 === 1;
  
  // Generate a time offset based on backup job to ensure different timestamps
  const backupJobOffsets: { [key: string]: number } = {
    'Files': 0,        // No offset
    'Databases': 15,   // 15 minutes later
    'System': 30,      // 30 minutes later
    'Users': 45        // 45 minutes later
  };
  const timeOffsetMinutes = backupJobOffsets[backupJob] || 0;
  
  // Start with today (in the past)
  const today = new Date(now);
  today.setHours(today.getHours() - 2); // 2 hours ago to ensure it's in the past
  today.setMinutes(today.getMinutes() + timeOffsetMinutes); // Add backup job offset
  dates.push(today.toISOString());
  
  if (isOddServer) {
    // Odd server pattern: daily for a week, then weekly for 2 months, then monthly for 2 years
    
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
    // Even server pattern: daily for a week, then weekly for 6 months, then monthly for 2 years
    
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
function generateBackupPayload(server: typeof servers[0], backupNumber: number, beginTime: string, backupJob: string = "Backup") {
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
      OperationName: backupJob,
      'server-id': server.id,
      'server-name': server.name,
      'backup-name': backupJob,
      'backup-id': `DB-${backupNumber}`
    }
  };
}

// Parse command line arguments
function parseArgs(): { useUpload: boolean; serverCount: number } {
  const args = process.argv.slice(2);
  const useUpload = args.includes('--upload');
  
  // Parse server count parameter (mandatory)
  const serverCountArg = args.find(arg => arg.startsWith('--servers='));
  if (!serverCountArg) {
    console.error('🚨 Error: --servers parameter is required!');
    console.log('');
    console.log('Usage:');
    console.log('  pnpm run generate-test-data --servers=N [--upload]');
    console.log('');
    console.log('Parameters:');
    console.log('  --servers=N    Number of servers to generate (1-30, mandatory)');
    console.log('  --upload       Optional: Send data via API instead of direct DB write');
    console.log('');
    console.log('Examples:');
    console.log('  pnpm run generate-test-data --servers=5');
    console.log('  pnpm run generate-test-data --servers=1 --upload');
    console.log('  pnpm run generate-test-data --servers=30');
    console.log('');
    process.exit(1);
  }
  
  const count = parseInt(serverCountArg.split('=')[1], 10);
  if (isNaN(count) || count < 1 || count > 30) {
    console.error('🚨 Error: Invalid server count. Must be between 1 and 30.');
    console.log('');
    console.log('Usage:');
    console.log('  pnpm run generate-test-data --servers=N [--upload]');
    console.log('');
    console.log('Examples:');
    console.log('  pnpm run generate-test-data --servers=5');
    console.log('  pnpm run generate-test-data --servers=1 --upload');
    console.log('  pnpm run generate-test-data --servers=30');
    console.log('');
    process.exit(1);
  }
  
  return { useUpload, serverCount: count };
}

// Function to write backup data directly to database
async function writeBackupToDatabase(payload: any): Promise<boolean> {
  try {
    // Check for duplicate backup
    const backupDate = new Date(payload.Data.BeginTime).toISOString();
    const isDuplicate = await dbUtils.checkDuplicateBackup({
      server_id: payload.Extra['server-id'],
      backup_name: payload.Extra['backup-name'],
      date: backupDate
    });

    if (isDuplicate) {
      console.log('          ⚠️  Duplicate backup detected, skipping...');
      return false;
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Find the server configuration to get alias and note
      const serverConfig = servers.find(s => s.id === payload.Extra['server-id']);
      
      // Insert server information only if it doesn't exist (preserves existing server_url)
      dbOps.insertServerIfNotExists.run({
        id: payload.Extra['server-id'],
        name: payload.Extra['server-name'],
        alias: serverConfig?.alias || '',
        note: serverConfig?.note || ''
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
        server_id: payload.Extra['server-id'],
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

// Function to delete backups from randomly chosen configurations to create overdue samples (>48 hours old)
async function deleteRandomBackups() {
  console.log('\n  🎲 Deleting recent backups from randomly chosen configurations to create overdue samples (>48 hours)...');
  
  try {
    // Get all unique backup configurations (server_id + backup_name combinations)
    const configurationsResult = db.prepare(`
      SELECT DISTINCT b.server_id, b.backup_name, s.name as server_name, s.alias
      FROM backups b
      JOIN servers s ON b.server_id = s.id
      ORDER BY s.name, b.backup_name
    `).all() as { server_id: string; backup_name: string; server_name: string; alias: string }[];
    
    if (configurationsResult.length === 0) {
      console.log('    ⚠️  No backup configurations found, skipping random deletion');
      return;
    }
    
    if (configurationsResult.length < 2) {
      console.log(`    ⚠️  Only ${configurationsResult.length} backup configuration(s) found, cannot delete 2`);
      return;
    }
    
    // Randomly select 2 backup configurations
    const shuffledConfigurations = [...configurationsResult].sort(() => Math.random() - 0.5);
    const selectedConfigurations = shuffledConfigurations.slice(0, 2);
    
    console.log(`    🎯 Selected ${selectedConfigurations.length} random backup configuration(s):`);
    selectedConfigurations.forEach((config, index) => {
      const serverDisplayName = config.alias ? `${config.server_name} (${config.alias})` : config.server_name;
      console.log(`      ${index + 1}. Server: ${serverDisplayName}, Backup: ${config.backup_name}`);
    });
    
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000)); // 48 hours ago
    
    for (const config of selectedConfigurations) {
      try {
        const serverDisplayName = config.alias ? `${config.server_name} (${config.alias})` : config.server_name;
        const configDisplayName = `${serverDisplayName} - ${config.backup_name}`;
        
        // Get all backups for this configuration, ordered by date DESC
        const allBackupsResult = db.prepare(`
          SELECT b.id, b.date
          FROM backups b
          WHERE b.server_id = ? AND b.backup_name = ?
          ORDER BY b.date DESC
        `).all(config.server_id, config.backup_name) as { id: string; date: string }[];
        
        if (allBackupsResult.length === 0) {
          console.log(`      ⚠️  ${configDisplayName}: No backups found`);
          continue;
        }
        
        console.log(`      📊 ${configDisplayName}: Found ${allBackupsResult.length} total backup(s)`);
        
        // Find backups that are newer than 48 hours ago (need to be deleted)
        const backupsToDelete: { id: string; date: string }[] = [];
        for (const backup of allBackupsResult) {
          const backupDate = new Date(backup.date);
          if (backupDate > fortyEightHoursAgo) {
            backupsToDelete.push(backup);
          } else {
            // Found the first backup that is >48 hours old, stop here
            break;
          }
        }
        
        if (backupsToDelete.length === 0) {
          const mostRecentDate = new Date(allBackupsResult[0].date);
          const hoursSinceLastBackup = Math.floor((now.getTime() - mostRecentDate.getTime()) / (60 * 60 * 1000));
          console.log(`      ✅ ${configDisplayName}: Already overdue (last backup ${hoursSinceLastBackup}h ago)`);
          continue;
        }
        
        console.log(`      🎯 ${configDisplayName}: Will delete ${backupsToDelete.length} backup(s) newer than 48 hours`);
        backupsToDelete.forEach((backup, idx) => {
          const backupDate = new Date(backup.date);
          const hoursAgo = Math.floor((now.getTime() - backupDate.getTime()) / (60 * 60 * 1000));
          console.log(`         ${idx + 1}. Backup ID: ${backup.id.substring(0, 8)}..., Date: ${backupDate.toLocaleString()} (${hoursAgo}h ago)`);
        });
        
        // Delete all backups that are newer than 48 hours using a transaction
        const deleteTransaction = db.transaction(() => {
          let deletedCount = 0;
          for (const backup of backupsToDelete) {
            // Verify backup exists before deletion
            const verifyResult = db.prepare(`
              SELECT id FROM backups WHERE id = ? AND server_id = ? AND backup_name = ?
            `).get(backup.id, config.server_id, config.backup_name);
            
            if (verifyResult) {
              const deleteResult = db.prepare(`
                DELETE FROM backups 
                WHERE id = ? AND server_id = ? AND backup_name = ?
              `).run(backup.id, config.server_id, config.backup_name);
              
              if (deleteResult.changes > 0) {
                deletedCount++;
              }
            }
          }
          return deletedCount;
        });
        
        const deletedCount = deleteTransaction();
        
        if (deletedCount > 0) {
          const remainingMostRecent = allBackupsResult[backupsToDelete.length];
          if (remainingMostRecent) {
            const remainingDate = new Date(remainingMostRecent.date);
            const hoursSinceLastBackup = Math.floor((now.getTime() - remainingDate.getTime()) / (60 * 60 * 1000));
            console.log(`      🗑️  ${configDisplayName}: Successfully deleted ${deletedCount} backup(s), now overdue (last backup ${hoursSinceLastBackup}h ago)`);
          } else {
            console.log(`      🗑️  ${configDisplayName}: Successfully deleted ${deletedCount} backup(s), no backups remaining`);
          }
        } else {
          console.log(`      ⚠️  ${configDisplayName}: Failed to delete backups (no rows affected)`);
        }
      } catch (error) {
        const serverDisplayName = config.alias ? `${config.server_name} (${config.alias})` : config.server_name;
        const configDisplayName = `${serverDisplayName} - ${config.backup_name}`;
        console.error(`      🚨 Error deleting backups for ${configDisplayName}:`, 
          error instanceof Error ? error.message : String(error));
      }
    }
    
    console.log('  ✅ Random backup deletion completed!');
    
  } catch (error) {
    console.error('  🚨 Error during random backup deletion:', 
      error instanceof Error ? error.message : String(error));
  }
}

// Function to cleanup backups - keep only 5-8 random backups for 1 random backup job from 2 random servers
async function cleanupBackupsForUserManual(){
  console.log('\n  🧹 Cleaning up backups for user manual demonstration...');
  
  // Get servers from generated backups instead of from servers array
  const serversFromBackupsResult = db.prepare(`
    SELECT DISTINCT s.id, s.name, s.alias, s.note
    FROM servers s
    JOIN backups b ON s.id = b.server_id
    ORDER BY s.name
  `).all() as { id: string; name: string; alias: string; note: string }[];
  
  if (serversFromBackupsResult.length === 0) {
    console.log('    ⚠️  No servers found with generated backups, skipping cleanup');
    return;
  }
  
  // Select 2 random servers from the first 6 servers that have backups
  const firstSixServers = serversFromBackupsResult.slice(0, 6);
  const shuffledServers = [...firstSixServers].sort(() => Math.random() - 0.5);
  const selectedServers = shuffledServers.slice(0, 2);
  
  // Generate random number of backups to keep 
  const backupsToKeep = Math.floor(Math.random() * 4) + 4; // 4 to 7
  
  console.log(`    🎯 Selected servers: ${selectedServers.map(s => s.name).join(', ')}`);
  console.log(`    📊 Keeping ${backupsToKeep} most recent backups for each selected server-backup combination`);
  
  for (const server of selectedServers) {
    try {
      // Get all backup jobs that exist for this server
      const backupJobsResult = db.prepare(`
        SELECT DISTINCT backup_name FROM backups 
        WHERE server_id = ?
        ORDER BY backup_name
      `).all(server.id) as { backup_name: string }[];
      
      const availableBackupJobs = backupJobsResult.map(row => row.backup_name);
      
      if (availableBackupJobs.length === 0) {
        console.log(`      ⚠️  ${server.name}: No backups found, skipping...`);
        continue;
      }
      
      // Select 1 random backup job from the available ones for this server
      const selectedBackupJob = availableBackupJobs[Math.floor(Math.random() * availableBackupJobs.length)];
      
      console.log(`      📁 ${server.name} - Selected backup job: ${selectedBackupJob} (from available: ${availableBackupJobs.join(', ')})`);
      
      // Count total backups for this server-backup combination
      const countResult = db.prepare(`
        SELECT COUNT(*) as total FROM backups 
        WHERE server_id = ? AND backup_name = ?
      `).get(server.id, selectedBackupJob) as { total: number };
      
      const totalBackups = countResult.total;
      
      if (totalBackups <= backupsToKeep) {
        console.log(`      ✅ ${server.name} - ${selectedBackupJob}: Only ${totalBackups} backups exist, no cleanup needed`);
        continue;
      }
      
      const backupsToDelete = totalBackups - backupsToKeep;
      
      // Delete older backups, keeping the most recent ones
      const deleteResult = db.prepare(`
        DELETE FROM backups 
        WHERE id IN (
          SELECT id FROM backups 
          WHERE server_id = ? AND backup_name = ? 
          ORDER BY date DESC 
          LIMIT -1 OFFSET ?
        )
      `).run(server.id, selectedBackupJob, backupsToKeep);
      
      console.log(`      🗑️  ${server.name} - ${selectedBackupJob}: Deleted ${deleteResult.changes} backups, kept ${backupsToKeep} most recent`);
      
    } catch (error) {
      console.error(`      🚨 Error cleaning up backups for ${server.name}:`, 
        error instanceof Error ? error.message : String(error));
    }
  }

  try {
    // Get all available server-backup combinations
    const combinationsResult = db.prepare(`
      SELECT DISTINCT b.server_id, b.backup_name, m.name as server_name
      FROM backups b
      JOIN servers m ON b.server_id = m.id
      ORDER BY b.server_id, b.backup_name
    `).all() as { server_id: number; backup_name: string; server_name: string }[];
    
    if (combinationsResult.length === 0) {
      console.log('    ⚠️  No server-backup combinations found for additional cleanup');
      return;
    }
    
    // Shuffle and select 3 random combinations
    const shuffledCombinations = [...combinationsResult].sort(() => Math.random() - 0.5);
    const selectedCombinations = shuffledCombinations.slice(0, Math.min(2, shuffledCombinations.length));
    
    console.log(`    🎯 Selected ${selectedCombinations.length} combinations for last backup deletion:`);
    selectedCombinations.forEach(combo => {
      console.log(`      - ${combo.server_name} (${combo.backup_name})`);
    });
    
    for (const combination of selectedCombinations) {
      try {
        // Get the most recent backup for this combination
        const lastBackupResult = db.prepare(`
          SELECT id, date FROM backups 
          WHERE server_id = ? AND backup_name = ? 
          ORDER BY date DESC 
          LIMIT 1
        `).get(combination.server_id, combination.backup_name) as { id: number; date: string } | undefined;
        
        if (!lastBackupResult) {
          console.log(`      ⚠️  ${combination.server_name} (${combination.backup_name}): No backups found`);
          continue;
        }
        
        // Delete the  most recent backups
        const deleteResult = db.prepare(`
          DELETE FROM backups 
          WHERE id = ?
        `).run(lastBackupResult.id);
        
        if (deleteResult.changes > 0) {
          const backupDate = new Date(lastBackupResult.date).toLocaleDateString();
          console.log(`      🗑️  ${combination.server_name} (${combination.backup_name}): Deleted last backup from ${backupDate}`);
        } else {
          console.log(`      ⚠️  ${combination.server_name} (${combination.backup_name}): Failed to delete backup`);
        }
        
      } catch (error) {
        console.error(`      🚨 Error deleting last backup for ${combination.server_name} (${combination.backup_name}):`, 
          error instanceof Error ? error.message : String(error));
      }
    }
    
  console.log('  ✅ Backup cleanup completed!');
    
  } catch (error) {
    console.error('  🚨 Error during additional cleanup:', 
      error instanceof Error ? error.message : String(error));
  }

  // Update server_url for 70% of random servers
  try {
    console.log('\n  🌐 Updating server URLs for random servers...');
    
    // Get servers from generated backups instead of total list
    const serversFromBackupsResult = db.prepare(`
      SELECT DISTINCT s.id, s.name, s.alias, s.note
      FROM servers s
      JOIN backups b ON s.id = b.server_id
      ORDER BY s.name
    `).all() as { id: string; name: string; alias: string; note: string }[];
    
    if (serversFromBackupsResult.length === 0) {
      console.log('    ⚠️  No servers found with generated backups, skipping server URL update');
      return;
    }
    
    // Select 70% of random servers from generated backups
    const shuffledServers = [...serversFromBackupsResult].sort(() => Math.random() - 0.5);
    const selectedCount = Math.ceil(serversFromBackupsResult.length * 0.7);
    const selectedServers = shuffledServers.slice(0, selectedCount);
    
    console.log(`    🎯 Selected servers for server URL update: ${selectedServers.map(s => s.alias ? `${s.name} (${s.alias})` : s.name).join(', ')}`);
    
    const serverUrl = "http://192.168.1.55:8200";
    let updatedCount = 0;
    
    for (const server of selectedServers) {
      try {
        const updateResult = db.prepare(`
          UPDATE servers 
          SET server_url = ? 
          WHERE id = ?
        `).run(serverUrl, server.id);
        
        const serverDisplayName = server.alias ? `${server.name} (${server.alias})` : server.name;
        if (updateResult.changes > 0) {
          console.log(`      🔗 ${serverDisplayName}: Server URL updated to ${serverUrl}`);
          updatedCount++;
        } else {
          console.log(`      ⚠️  ${serverDisplayName}: No update performed (server may not exist in DB)`);
        }
      } catch (error) {
        console.error(`      🚨 Error updating server URL for ${server.name}:`, 
          error instanceof Error ? error.message : String(error));
      }
    }
    
    console.log(`  ✅ Server URL update completed! Updated ${updatedCount} out of ${selectedServers.length} servers`);
    
  } catch (error) {
    console.error('  🚨 Error during server URL update:', 
      error instanceof Error ? error.message : String(error));
  }
}

// Main function to send test data
async function sendTestData(useUpload: boolean = false, serverCount: number) {
  const API_URL = 'http://localhost:8666/api/upload';
  const HEALTH_CHECK_URL = 'http://localhost:8666/api/health'; // Adjust this URL based on your actual health endpoint
  const BACKUP_JOBS = ['Files', 'Databases', 'System', 'Users'];

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

  const suffledServers = [...servers].sort(() => Math.random() - 0.5);

  for (let serverIndex = 0; serverIndex < Math.min(serverCount, servers.length); serverIndex++) {
    const server = suffledServers[serverIndex];
    const isOddServer = (serverIndex + 1) % 2 === 1;
    
    // Randomly select a subset of backup jobs for this server
    // 70% chance of 2 jobs, 30% chance of 3-4 jobs
    const randomBackupCount = Math.random() < 0.6 
      ? 2 
      : Math.floor(Math.random() * 2) + 3; // 3 or 4 jobs  
    const shuffledBackupJobs = [...BACKUP_JOBS].sort(() => Math.random() - 0.5);
    const selectedBackupJobs = shuffledBackupJobs.slice(0, randomBackupCount);
    
    const serverDisplayName = server.alias ? `${server.name} (${server.alias})` : server.name;
    console.log(`\n    🔄 Generating backups for ${serverDisplayName} (${isOddServer ? 'Odd' : 'Even'} server pattern)...`);
    if (server.note) {
      console.log(`      📝 Note: ${server.note}`);
    }
    console.log(`      📅 Pattern: ${isOddServer ? 'Daily for 1 week, then weekly for 2 months, then monthly for 2 years' : 'Daily for 1 week, then weekly for 6 months, then monthly for 2 years'}`);
    console.log(`      🎯 Selected backup jobs (${selectedBackupJobs.length}/${BACKUP_JOBS.length}): ${selectedBackupJobs.join(', ')}`);
    
    for (const backupJob of selectedBackupJobs) {
      // Generate backup dates for this specific backup job
      const backupDates = generateBackupDates(serverIndex, backupJob);
      console.log(`        📁 Generating ${backupDates.length} ${backupJob} backups...`);
      
      for (let i = 0; i < backupDates.length; i++) {
        const backupNumber = i + 1;
        const beginTime = backupDates[i];
        const payload = generateBackupPayload(server, backupNumber, beginTime, backupJob);
        
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

          if (!success) {
            console.log(`          📄 ${backupJob} Backup ${backupNumber}/${backupDates.length} for ${server.name} (${backupDate}): Failed`);
          }
        } catch (error) {
          console.error(`🚨 Error processing backup ${backupNumber} for ${server.name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
  }

  // Ensure backup settings are complete for all servers and backups (only for direct DB mode)
  if (!useUpload) {
    console.log('\n  🔧 Processing backups after generation...');
    
    // Delete 2 randomly chosen backup runs to create overdue samples
    await deleteRandomBackups();
    
    // Delete backup settings after deletions so it can be recalculated based on new most recent backups
    console.log('\n  🔄 Deleting backup_settings configuration after deletions...');
    await cleanBackupSettings();
  }
}

// Run the script
const { useUpload, serverCount } = parseArgs();

console.log('🛫 Starting test data generation...\n');
if (useUpload) {
  console.log('  📤 Mode: Upload via API endpoint');
} else {
  console.log('  💾 Mode: Direct database write');
}
console.log(`  🖥️  Generating data for ${serverCount} server(s) (out of ${servers.length} available)`);
console.log('  🧹 Database cleanup: Will clear servers, backups, and configurations tables before generation');
console.log('  ℹ️ Generating backups with specific date patterns:');
console.log('     • Odd servers: Daily for 1 week, then weekly for 2 months, then monthly for 2 years');
console.log('     • Even servers: Daily for 1 week, then weekly for 6 months, then monthly for 2 years');
console.log('     • Random backup jobs per server (1-3 jobs from: Files, Databases, System)');
console.log('     • Servers include alias and note fields for testing');
console.log('     • After generation: Random cleanup some servers/backup jobs and last backups for the user manual screenshots\n');


sendTestData(useUpload, serverCount).then(() => {
  console.log('\n🎉 Test data generation completed!');
}).catch(error => {
  console.error('🚨 Error generating test data:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 