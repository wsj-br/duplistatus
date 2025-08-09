import { v4 as uuidv4 } from 'uuid';

// Machine configurations
const machines = [
  { id: 'machine-1', name: 'Test Machine 1', backupName: 'Machine 1' },
  { id: 'machine-2', name: 'Test Machine 2', backupName: 'Machine 2' },
  { id: 'machine-3', name: 'Test Machine 3', backupName: 'Machine 3' }
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

// Helper function to generate a random duration between 30 seconds and 2 hours
function generateRandomDuration(): string {
  const totalSeconds = Math.floor(Math.random() * (7200 - 30) + 30);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generate a date at a specific interval from now
function generateIntervalDate(intervalIndex: number, totalIntervals: number): string {
  const now = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(now.getFullYear() - 2);
  
  // Calculate the time span between two years ago and now
  const timeSpan = now.getTime() - twoYearsAgo.getTime();
  
  // Calculate the interval size
  const intervalSize = timeSpan / (totalIntervals - 1);
  
  // Calculate the date for this specific interval
  const intervalDate = new Date(twoYearsAgo.getTime() + (intervalSize * intervalIndex));
  
  // Add some randomness within a day to make it look more natural
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  intervalDate.setHours(randomHours);
  intervalDate.setMinutes(randomMinutes);
  
  return intervalDate.toISOString();
}

// Helper function to generate random file statistics
function generateRandomFileStats() {
  const examinedFiles = Math.floor(Math.random() * 10000) + 1000;
  const addedFiles = Math.floor(Math.random() * examinedFiles * 0.3);
  const modifiedFiles = Math.floor(Math.random() * examinedFiles * 0.1);
  const deletedFiles = Math.floor(Math.random() * examinedFiles * 0.05);
  const fileSize = Math.floor(Math.random() * 1000000000) + 1000000; // 1MB to 1GB
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
function generateBackupPayload(machine: typeof machines[0], backupNumber: number, intervalIndex: number, totalIntervals: number, backupType: string = "Backup") {
  const beginTime = generateIntervalDate(intervalIndex, totalIntervals);
  const endTime = new Date(new Date(beginTime).getTime() + Math.random() * 7200000);
  const duration = generateRandomDuration();
  const stats = generateRandomFileStats();
  const hasWarnings = Math.random() > 0.7; // 30% chance of warnings
  const hasErrors = Math.random() > 0.9; // 10% chance of errors
  
  // Generate message counts
  const warningsCount = hasWarnings ? Math.floor(Math.random() * 5) + 1 : 0;
  const errorsCount = hasErrors ? Math.floor(Math.random() * 3) + 1 : 0;
  const messagesCount = Math.floor(Math.random() * 20) + 10; // At least 10 messages (6 retention policy + 4+ additional)
  
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
      ParsedResult: hasErrors ? "Failed" : (hasWarnings ? "Warning" : "Success"),
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
        KnownFileSize: stats.fileSize,
        LastBackupDate: intervalIndex > 0 
          ? generateIntervalDate(intervalIndex - 1, totalIntervals) 
          : new Date(new Date(beginTime).getTime() - 86400000).toISOString(), // Previous interval or 1 day before
        BackupListCount: backupNumber,
        ReportedQuotaError: false,
        ReportedQuotaWarning: Math.random() > 0.9, // 10% chance of quota warning
        MainOperation: "Backup",
        ParsedResult: hasErrors ? "Failed" : (hasWarnings ? "Warning" : "Success"),
        Interrupted: false,
        Version: "2.1.0.5 (2.1.0.5_stable_2025-03-04)",
        BeginTime: beginTime,
        Duration: duration,
        WarningsActualLength: hasWarnings ? Math.floor(Math.random() * 5) + 1 : 0,
        ErrorsActualLength: hasErrors ? Math.floor(Math.random() * 3) + 1 : 0
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

// Main function to send test data
async function sendTestData() {
  const API_URL = 'http://localhost:8666/api/upload';
  const HEALTH_CHECK_URL = 'http://localhost:8666/api/health'; // Adjust this URL based on your actual health endpoint
  const TOTAL_BACKUPS_PER_TYPE = 20;
  const BACKUP_TYPES = ['Files', 'Databases'];

  // Check server health before proceeding
  console.log('  🩺 Checking server health...');
  const isServerHealthy = await checkServerHealth(HEALTH_CHECK_URL);
  if (!isServerHealthy) {
    console.error('🚨 Server is not reachable. Please ensure the server is running and try again.');
    process.exit(1);
  }
  console.log('  👍 Server is healthy, proceeding with data generation...');

  for (const machine of machines) {
    for (const backupType of BACKUP_TYPES) {
      console.log(`\n    🔄 Generating ${TOTAL_BACKUPS_PER_TYPE} ${backupType} backups for ${machine.name}...`);
      for (let i = 0; i < TOTAL_BACKUPS_PER_TYPE; i++) {
        const backupNumber = i + 1;
        const payload = generateBackupPayload(machine, backupNumber, i, TOTAL_BACKUPS_PER_TYPE, backupType);
        
        try {
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
          console.log(`      📄 ${backupType} Backup ${backupNumber}/${TOTAL_BACKUPS_PER_TYPE} for ${machine.name}: ${result.success ? 'Success' : 'Failed'}`);
          
          // Add a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`🚨 Error sending backup ${backupNumber} for ${machine.name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
  }
}

// Run the script
console.log('🛫 Starting test data generation...\n');
console.log('  ℹ️ Generating 2 types of backups per machine (30 each) at regular intervals from 2 years ago to today\n');
sendTestData().then(() => {
  console.log('\n🎉 Test data generation completed!');
}).catch(error => {
  console.error('🚨 Error generating test data:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 