import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { db, dbOps, parseDurationToSeconds } from '../src/lib/db';
import { dbUtils, getConfigBackupSettings, setConfigBackupSettings, clearRequestCache, invalidateDataCache } from '../src/lib/db-utils';
import { extractAvailableBackups } from '../src/lib/utils';
import { setServerPassword } from '../src/lib/secrets';
import { defaultBackupNotificationConfig } from '../src/lib/default-config';

// Function to clean database tables before generating test data
async function cleanDatabaseTables(quiet: boolean = false) {
  logConsole('🧹 Cleaning database tables before generating test data...', quiet);
  
  try {
    // Start a transaction for atomic cleanup
    const transaction = db.transaction(() => {
      // Delete all backups first (due to foreign key constraint)
      const backupsResult = db.prepare('DELETE FROM backups').run();
      logConsole(`  🗑️  Deleted ${backupsResult.changes} backup records`, quiet);
      
      // Delete all servers
      const serversResult = db.prepare('DELETE FROM servers').run();
      logConsole(`  🗑️  Deleted ${serversResult.changes} server records`, quiet);
      
      // Delete backup_settings configuration specifically (so it can be recalculated)
      const backupSettingsResult = db.prepare("DELETE FROM configurations WHERE key = 'backup_settings'").run();
      logConsole(`  🗑️  Deleted backup_settings configuration (${backupSettingsResult.changes} row(s))`, quiet);
      
      // Delete all remaining configurations
      const configsResult = db.prepare('DELETE FROM configurations').run();
      logConsole(`  🗑️  Deleted ${configsResult.changes} configuration records`, quiet);
    });
    
    // Execute the transaction
    transaction();
    
    logConsole('✅ Database cleanup completed successfully!', quiet);
    return true;
  } catch (error) {
    console.error('🚨 Error during database cleanup:', error instanceof Error ? error.message : String(error));
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
      'machine-id': server.id,
      'machine-name': server.name,
      'backup-name': backupJob,
      'backup-id': `DB-${backupNumber}`
    }
  };
}

// Helper function for conditional logging
function logConsole(message: string, quiet: boolean): void {
  if (!quiet) {
    console.log(message);
  }
}

// Parse command line arguments
function parseArgs(): { useUpload: boolean; serverCount: number; port: number; quiet: boolean } {
  const args = process.argv.slice(2);
  const useUpload = args.includes('--upload');
  const quiet = args.includes('--quiet') || args.includes('-q');
  
  // Parse server count parameter (mandatory)
  const serverCountArg = args.find(arg => arg.startsWith('--servers='));
  if (!serverCountArg) {
    console.error('🚨 Error: --servers parameter is required!');
    console.log('');
    console.log('Usage:');
    console.log('  pnpm run generate-test-data --servers=N [--upload] [--port=N] [--quiet|-q]');
    console.log('');
    console.log('Parameters:');
    console.log('  --servers=N    Number of servers to generate (1-30, mandatory)');
    console.log('  --upload       Optional: Send data via API instead of direct DB write');
    console.log('  --port=N       Optional: Port number for API endpoints (default: 8666)');
    console.log('  --quiet, -q    Optional: Suppress output (quiet mode)');
    console.log('');
    console.log('Examples:');
    console.log('  pnpm run generate-test-data --servers=5');
    console.log('  pnpm run generate-test-data --servers=1 --upload');
    console.log('  pnpm run generate-test-data --servers=3 --port=3000');
    console.log('  pnpm run generate-test-data --servers=5 --quiet');
    console.log('');
    process.exit(1);
  }
  
  const count = parseInt(serverCountArg.split('=')[1], 10);
  if (isNaN(count) || count < 1 || count > 30) {
    console.error('🚨 Error: Invalid server count. Must be between 1 and 30.');
    process.exit(1);
  }
  
  // Parse port parameter (optional, default: 8666)
  const portArg = args.find(arg => arg.startsWith('--port='));
  let port = 8666; // default port
  if (portArg) {
    const parsedPort = parseInt(portArg.split('=')[1], 10);
    if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      console.error('🚨 Error: Invalid port number. Must be between 1 and 65535.');
      process.exit(1);
    }
    port = parsedPort;
  }
  
  return { useUpload, serverCount: count, port, quiet };
}

// Function to write backup data directly to database
async function writeBackupToDatabase(payload: any, quiet: boolean = false): Promise<boolean> {
  try {
    // Check for duplicate backup
    const backupDate = new Date(payload.Data.BeginTime).toISOString();
    // Support both machine-id (Duplicati API format) and server-id (legacy format)
    const serverId = payload.Extra['machine-id'] || payload.Extra['server-id'];
    const serverName = payload.Extra['machine-name'] || payload.Extra['server-name'];
    const isDuplicate = await dbUtils.checkDuplicateBackup({
      server_id: serverId,
      backup_name: payload.Extra['backup-name'],
      date: backupDate
    });

    if (isDuplicate) {
      logConsole('          ⚠️  Duplicate backup detected, skipping...', quiet);
      return false;
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Find the server configuration to get alias and note
      const serverConfig = servers.find(s => s.id === serverId);
      
      // Insert server information only if it doesn't exist (preserves existing server_url)
      dbOps.insertServerIfNotExists.run({
        id: serverId,
        name: serverName,
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
        server_id: serverId,
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

// Main function to send test data
async function sendTestData(useUpload: boolean = false, serverCount: number, port: number = 8666, quiet: boolean = false) {
  const API_URL = `http://localhost:${port}/api/upload`;
  const HEALTH_CHECK_URL = `http://localhost:${port}/api/health`; // Adjust this URL based on your actual health endpoint
  const BACKUP_JOBS = ['Files', 'Databases', 'System', 'Users'];

  // Clean database tables before generating test data (only for direct DB mode)
  if (!useUpload) {
    const cleanupSuccess = await cleanDatabaseTables(quiet);
    if (!cleanupSuccess) {
      console.error('🚨 Database cleanup failed. Aborting test data generation.');
      process.exit(1);
    }
    logConsole('', quiet); // Add spacing after cleanup
  }

  // Check server health before proceeding (only when using upload mode)
  if (useUpload) {
    logConsole('  🩺 Checking server health...', quiet);
    const isServerHealthy = await checkServerHealth(HEALTH_CHECK_URL);
    if (!isServerHealthy) {
      console.error('🚨 Server is not reachable. Please ensure the server is running and try again.');
      process.exit(1);
    }
    logConsole('  👍 Server is healthy, proceeding with data generation...', quiet);
  } else {
    logConsole('  💾 Writing directly to database...', quiet);
  }

  // Create generation plan
  const shuffledServers = [...servers].sort(() => Math.random() - 0.5);
  const selectedServersCount = Math.min(serverCount, servers.length);
  const generationPlan: Array<{
    server: typeof servers[0];
    selectedBackupJobs: string[];
    isOddServer: boolean;
    serverIndex: number;
  }> = [];

  for (let i = 0; i < selectedServersCount; i++) {
    const server = shuffledServers[i];
    const isOddServer = (i + 1) % 2 === 1;
    
    // Randomly select backup jobs
    const randomBackupCount = Math.random() < 0.6 ? 2 : Math.floor(Math.random() * 2) + 3;
    const shuffledBackupJobs = [...BACKUP_JOBS].sort(() => Math.random() - 0.5);
    const selectedBackupJobs = shuffledBackupJobs.slice(0, randomBackupCount);
    
    generationPlan.push({ server, selectedBackupJobs, isOddServer, serverIndex: i });
  }

  // Preconfigure notifications to disable ntfy (as requested)
  // This is especially important for --upload mode to prevent spamming notifications
  logConsole('\n  🔧 Preconfiguring notifications (disabling ntfy for generated backups)...', quiet);
  try {
    const currentSettings = await getConfigBackupSettings();
    let updated = false;

    for (const plan of generationPlan) {
      for (const backupJob of plan.selectedBackupJobs) {
        const key = `${plan.server.id}:${backupJob}`;
        if (!currentSettings[key] || currentSettings[key].ntfyEnabled !== false) {
          currentSettings[key] = {
            ...(currentSettings[key] || defaultBackupNotificationConfig),
            ntfyEnabled: false
          };
          updated = true;
        }
      }
    }

    if (updated) {
      setConfigBackupSettings(currentSettings);
      logConsole('    ✅ Notification settings updated to disable ntfy', quiet);
    } else {
      logConsole('    ℹ️ Notification settings already configured', quiet);
    }
  } catch (error) {
    console.error('🚨 Error preconfiguring notification settings:', error instanceof Error ? error.message : String(error));
  }

  // Proceed with data generation
  for (const plan of generationPlan) {
    const { server, selectedBackupJobs, isOddServer, serverIndex } = plan;
    const serverDisplayName = server.alias ? `${server.name} (${server.alias})` : server.name;
    
    logConsole(`\n    🔄 Generating backups for ${serverDisplayName} (${isOddServer ? 'Odd' : 'Even'} server pattern)...`, quiet);
    if (server.note) {
      logConsole(`      📝 Note: ${server.note}`, quiet);
    }
    logConsole(`      📅 Pattern: ${isOddServer ? 'Daily for 1 week, then weekly for 2 months, then monthly for 2 years' : 'Daily for 1 week, then weekly for 6 months, then monthly for 2 years'}`, quiet);
    logConsole(`      🎯 Selected backup jobs (${selectedBackupJobs.length}/${BACKUP_JOBS.length}): ${selectedBackupJobs.join(', ')}`, quiet);
    
    for (const backupJob of selectedBackupJobs) {
      // Generate backup dates for this specific backup job
      const backupDates = generateBackupDates(serverIndex, backupJob);
      logConsole(`        📁 Generating ${backupDates.length} ${backupJob} backups...`, quiet);
      
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
            success = await writeBackupToDatabase(payload, quiet);
          }

          if (!success) {
            logConsole(`          📄 ${backupJob} Backup ${backupNumber}/${backupDates.length} for ${server.name} (${backupDate}): Failed`, quiet);
          }
        } catch (error) {
          console.error(`🚨 Error processing backup ${backupNumber} for ${server.name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
  }

  // Ensure backup settings are complete for all servers and backups (only for direct DB mode)
  if (!useUpload) {
    logConsole('\n  🔧 Processing backups after generation...', quiet);
    
    // Recalculate backup settings to ensure all missing entries are added and times are calculated
    // This replaces the previous logic of deleting and letting it be recalculated later
    logConsole('  🔄 Recalculating backup settings...', quiet);
    await getConfigBackupSettings();
  }

  // Update server URLs for 90% of generated servers
  await updateServerUrls(serverCount, quiet);

  // Delete recent backups from 2 random servers to create overdue backups
  await deleteRecentBackupsForOverdue(quiet);
}

// Function to update server URLs for 90% of generated servers
async function updateServerUrls(serverCount: number, quiet: boolean = false) {
  try {
    logConsole('\n  🌐 Updating server URLs...', quiet);
    
    // Get all servers from database
    const allServers = dbOps.getAllServers.all() as Array<{ id: string; name: string; server_url: string }>;
    
    if (allServers.length === 0) {
      logConsole('    ⚠️  No servers found in database', quiet);
      return;
    }

    // Calculate 90% of servers (round up)
    const targetCount = Math.ceil(allServers.length * 0.9);
    
    // Shuffle servers and select targetCount
    const shuffled = [...allServers].sort(() => Math.random() - 0.5);
    const selectedServers = shuffled.slice(0, targetCount);
    
    logConsole(`    📊 Updating ${selectedServers.length} out of ${allServers.length} servers (${Math.round((selectedServers.length / allServers.length) * 100)}%)`, quiet);
    
    // Update each selected server with a random URL and set password
    const transaction = db.transaction(() => {
      for (const server of selectedServers) {
        // Generate random IP between 100-200
        const randomIp = Math.floor(Math.random() * 101) + 100; // 100 to 200 inclusive
        const serverUrl = `http://192.168.1.${randomIp}:8200`;
        
        dbOps.updateServerServerUrl.run({
          id: server.id,
          server_url: serverUrl
        });
      }
    });
    
    transaction();
    
    // Set password for the same servers (outside transaction since setServerPassword handles encryption)
    for (const server of selectedServers) {
      setServerPassword(server.id, 'test-password');
    }
    
    logConsole(`    ✅ Successfully updated ${selectedServers.length} server URLs and set passwords`, quiet);
  } catch (error) {
    console.error('🚨 Error updating server URLs:', error instanceof Error ? error.message : String(error));
  }
}

// Function to delete recent backups from 2 random servers to create overdue backups
// Ensures at least 2 backups are overdue (1 from each of 2 random servers)
// Deletes enough recent backups to guarantee overdue status (default interval is 1D)
async function deleteRecentBackupsForOverdue(quiet: boolean = false) {
  try {
    logConsole('\n  🗑️  Deleting recent backups to create overdue backups...', quiet);
    
    // Get all servers that have backups
    const serversWithBackups = db.prepare(`
      SELECT DISTINCT s.id, s.name, s.alias
      FROM servers s
      INNER JOIN backups b ON s.id = b.server_id
      ORDER BY s.name
    `).all() as Array<{ id: string; name: string; alias: string }>;
    
    if (serversWithBackups.length < 2) {
      logConsole(`    ⚠️  Not enough servers with backups (found ${serversWithBackups.length}, need at least 2)`, quiet);
      return;
    }
    
    // Randomly select 2 servers (ensuring we have 2 different servers)
    const shuffled = [...serversWithBackups].sort(() => Math.random() - 0.5);
    const selectedServers = shuffled.slice(0, 2);
    
    logConsole(`    📊 Selected ${selectedServers.length} random servers for overdue backup creation`, quiet);
    
    // Track which backup keys had backups deleted
    const affectedBackupKeys: string[] = [];
    let overdueCount = 0;
    
    const transaction = db.transaction(() => {
      for (const server of selectedServers) {
        // Get all unique backup names for this server
        const backupNames = db.prepare(`
          SELECT DISTINCT backup_name
          FROM backups
          WHERE server_id = ?
          ORDER BY backup_name
        `).all(server.id) as Array<{ backup_name: string }>;
        
        if (backupNames.length === 0) {
          logConsole(`    ⚠️  No backup names found for server ${server.name}`, quiet);
          continue;
        }
        
        // Pick a random backup name
        const randomBackupName = backupNames[Math.floor(Math.random() * backupNames.length)].backup_name;
        const backupKey = `${server.id}:${randomBackupName}`;
        
        // Get total count of backups for this server/backup_name combination
        const totalBackups = db.prepare(`
          SELECT COUNT(*) as count
          FROM backups
          WHERE server_id = ? AND backup_name = ?
        `).get(server.id, randomBackupName) as { count: number } | undefined;
        
        if (!totalBackups || totalBackups.count === 0) {
          logConsole(`    ⚠️  No backups found for server ${server.name} with backup name ${randomBackupName}`, quiet);
          continue;
        }
        
        // Get the 3 most recent backups (or fewer if there aren't enough)
        // We delete up to 3 to ensure the remaining backup is at least 3 days old (definitely overdue with 1D interval)
        // But we always leave at least 1 backup remaining
        const backupsToDelete = Math.min(3, totalBackups.count - 1);
        
        if (backupsToDelete <= 0) {
          logConsole(`    ⚠️  Not enough backups to delete (need at least 2, found ${totalBackups.count}) for ${server.name}:${randomBackupName}`, quiet);
          continue;
        }
        
        const recentBackups = db.prepare(`
          SELECT id, date
          FROM backups
          WHERE server_id = ? AND backup_name = ?
          ORDER BY date DESC
          LIMIT ?
        `).all(server.id, randomBackupName, backupsToDelete) as Array<{ id: string; date: string }>;
        
        if (recentBackups.length === 0) {
          logConsole(`    ⚠️  No recent backups found for server ${server.name} with backup name ${randomBackupName}`, quiet);
          continue;
        }
        
        // Delete recent backups to guarantee overdue status (leaving at least 1 backup)
        let deletedCount = 0;
        const deletedDates: string[] = [];
        for (const backup of recentBackups) {
          const result = db.prepare('DELETE FROM backups WHERE id = ?').run(backup.id);
          if (result.changes > 0) {
            deletedCount++;
            deletedDates.push(new Date(backup.date).toLocaleDateString());
          }
        }
        
        if (deletedCount > 0) {
          overdueCount++;
          affectedBackupKeys.push(backupKey);
          const serverDisplayName = server.alias ? `${server.name} (${server.alias})` : server.name;
          logConsole(`    ✅ Deleted ${deletedCount} recent "${randomBackupName}" backup(s) from ${serverDisplayName}`, quiet);
          logConsole(`       Dates deleted: ${deletedDates.join(', ')}`, quiet);
        }
      }
    });
    
    transaction();
    
    // Clear caches and recalculate backup settings after deletion
    // This ensures the 'time' field in backup_settings is updated to reflect the new latest backup date
    logConsole('    🔄 Recalculating backup settings after deletion...', quiet);
    clearRequestCache();
    invalidateDataCache();
    
    // Get updated backup settings after deletion
    const backupSettings = await getConfigBackupSettings();
    
    // For affected backups, we need to manually set the time field to make them overdue
    // The time field should be set to an old date so GetNextBackupRunDate calculates a past expected date
    let updatedSettings = false;
    const updatedBackupSettings = { ...backupSettings };
    
    for (const backupKey of affectedBackupKeys) {
      const [serverId, backupName] = backupKey.split(':');
      const settings = updatedBackupSettings[backupKey];
      
      // Get the actual latest backup date from database
      const latestBackup = db.prepare(`
        SELECT date
        FROM backups
        WHERE server_id = ? AND backup_name = ?
        ORDER BY date DESC
        LIMIT 1
      `).get(serverId, backupName) as { date: string } | undefined;
      
      if (settings && latestBackup) {
        // Set the time field to the latest backup date (not a future expected date)
        // This ensures GetNextBackupRunDate calculates from the last actual backup
        // and the result will be in the past (making it overdue)
        updatedBackupSettings[backupKey] = {
          ...settings,
          overdueBackupCheckEnabled: true,
          time: latestBackup.date // Use the last backup date as the schedule time
        };
        updatedSettings = true;
      } else if (!settings && latestBackup) {
        // If settings don't exist, create them with overdue check enabled
        updatedBackupSettings[backupKey] = {
          ...defaultBackupNotificationConfig,
          overdueBackupCheckEnabled: true,
          time: latestBackup.date
        };
        updatedSettings = true;
      }
    }
    
    // Save updated settings if any were changed
    if (updatedSettings) {
      setConfigBackupSettings(updatedBackupSettings);
      clearRequestCache(); // Clear cache again after manual update
      invalidateDataCache();
      logConsole('    ✅ Updated backup settings for overdue detection', quiet);
    }
    
    // Verify the affected backups
    const finalBackupSettings = await getConfigBackupSettings();
    
    // Verify the affected backups have correct settings
    for (const backupKey of affectedBackupKeys) {
      const [serverId, backupName] = backupKey.split(':');
      const settings = finalBackupSettings[backupKey];
      
      if (settings) {
        // Get the actual latest backup date from database
        const latestBackup = db.prepare(`
          SELECT date
          FROM backups
          WHERE server_id = ? AND backup_name = ?
          ORDER BY date DESC
          LIMIT 1
        `).get(serverId, backupName) as { date: string } | undefined;
        
        if (latestBackup) {
          const latestDate = new Date(latestBackup.date);
          const daysSinceLastBackup = Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
          const server = selectedServers.find(s => s.id === serverId);
          const serverDisplayName = server ? (server.alias ? `${server.name} (${server.alias})` : server.name) : serverId;
          
          logConsole(`    📊 ${serverDisplayName}:${backupName} - Last backup: ${latestDate.toLocaleDateString()} (${daysSinceLastBackup} days ago)`, quiet);
          logConsole(`       Overdue check enabled: ${settings.overdueBackupCheckEnabled}, Expected interval: ${settings.expectedInterval}`, quiet);
        }
      }
    }
    
    if (overdueCount >= 2) {
      logConsole(`    ✅ Successfully made ${overdueCount} backup job(s) overdue (1 from each of ${selectedServers.length} servers)`, quiet);
    } else {
      logConsole(`    ⚠️  Only made ${overdueCount} backup job(s) overdue, expected at least 2`, quiet);
    }
  } catch (error) {
    console.error('🚨 Error deleting recent backups:', error instanceof Error ? error.message : String(error));
  }
}

// Run the script
const { useUpload, serverCount, port, quiet } = parseArgs();

logConsole('🛫 Starting test data generation...\n', quiet);
if (useUpload) {
  logConsole('  📤 Mode: Upload via API endpoint', quiet);
  logConsole(`  🔌 Port: ${port}`, quiet);
} else {
  logConsole('  💾 Mode: Direct database write', quiet);
  logConsole('  🧹 Database cleanup: Will clear servers, backups, and configurations tables before generation', quiet);
}
logConsole(`  🖥️  Generating data for ${serverCount} server(s) (out of ${servers.length} available)`, quiet);
logConsole('  ℹ️ Generating backups with specific date patterns:', quiet);
logConsole('     • Odd servers: Daily for 1 week, then weekly for 2 months, then monthly for 2 years', quiet);
logConsole('     • Even servers: Daily for 1 week, then weekly for 6 months, then monthly for 2 years', quiet);
logConsole('     • Random backup jobs per server (1-3 jobs from: Files, Databases, System)', quiet);
logConsole('     • Servers include alias and note fields for testing', quiet);
logConsole('     • After generation: Cleanup backup_settings configuration', quiet);
logConsole('     • 90% of servers will get random URLs (http://192.168.1.100-200:8200) and password "test-password"', quiet);
logConsole('     • 2 random backup jobs (from different servers) will have recent backups deleted to guarantee overdue status\n', quiet);


sendTestData(useUpload, serverCount, port, quiet).then(() => {
  if (quiet) {
    console.log('✅ Test data generation completed successfully!');
  } else {
    console.log('\n🎉 Test data generation completed!');
  }
}).catch(error => {
  console.error('🚨 Error generating test data:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 