import { v4 as uuidv4 } from 'uuid';

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

// Helper function to generate a random duration between 5 minutes and 15 minutes
function generateRandomDuration(): string {
  const totalSeconds = Math.floor(Math.random() * (900 - 300) + 300);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generate backup dates according to the specified patterns
function generateBackupDates(machineIndex: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  const isOddMachine = (machineIndex + 1) % 2 === 1;
  
  // Start with today (in the past)
  const today = new Date(now);
  today.setDate(today.getDate() - 1); // Yesterday to ensure it's in the past
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
  const hasWarnings = Math.random() > 0.7; // 30% chance of warnings
  const hasErrors = Math.random() > 0.9; // 10% chance of errors
  
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
        LastBackupDate: backupNumber > 1 
          ? new Date(new Date(beginTime).getTime() - 86400000).toISOString() // 1 day before
          : new Date(new Date(beginTime).getTime() - 86400000).toISOString(),
        BackupListCount: backupNumber,
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

// Main function to send test data
async function sendTestData() {
  const API_URL = 'http://localhost:8666/api/upload';
  const HEALTH_CHECK_URL = 'http://localhost:8666/api/health'; // Adjust this URL based on your actual health endpoint
  const BACKUP_TYPES = ['Files', 'Databases', 'System'];

  // Check server health before proceeding
  console.log('  🩺 Checking server health...');
  const isServerHealthy = await checkServerHealth(HEALTH_CHECK_URL);
  if (!isServerHealthy) {
    console.error('🚨 Server is not reachable. Please ensure the server is running and try again.');
    process.exit(1);
  }
  console.log('  👍 Server is healthy, proceeding with data generation...');

  for (let machineIndex = 0; machineIndex < machines.length; machineIndex++) {
    const machine = machines[machineIndex];
    const isOddMachine = (machineIndex + 1) % 2 === 1;
    
    // Generate backup dates according to the pattern
    const backupDates = generateBackupDates(machineIndex);
    
    console.log(`\n    🔄 Generating ${backupDates.length} backups for ${machine.name} (${isOddMachine ? 'Odd' : 'Even'} machine pattern)...`);
    console.log(`      📅 Pattern: ${isOddMachine ? 'Daily for 1 week, then weekly for 2 months, then monthly for 2 years' : 'Daily for 1 week, then weekly for 6 months, then monthly for 2 years'}`);
    
    for (const backupType of BACKUP_TYPES) {
      console.log(`        📁 Generating ${backupType} backups...`);
      
      for (let i = 0; i < backupDates.length; i++) {
        const backupNumber = i + 1;
        const beginTime = backupDates[i];
        const payload = generateBackupPayload(machine, backupNumber, beginTime, backupType);
        
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
          const backupDate = new Date(beginTime).toLocaleDateString();
          console.log(`          📄 ${backupType} Backup ${backupNumber}/${backupDates.length} for ${machine.name} (${backupDate}): ${result.success ? 'Success' : 'Failed'}`);
          
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
console.log('  ℹ️ Generating backups with specific date patterns:');
console.log('     • Odd machines: Daily for 1 week, then weekly for 2 months, then monthly for 2 years');
console.log('     • Even machines: Daily for 1 week, then weekly for 6 months, then monthly for 2 years');
console.log('     • 2 backups per machine (Files and Databases)\n');

sendTestData().then(() => {
  console.log('\n🎉 Test data generation completed!');
}).catch(error => {
  console.error('🚨 Error generating test data:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 