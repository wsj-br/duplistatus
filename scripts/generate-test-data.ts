const { v4: uuidv4 } = require('uuid');

// Machine configurations
const machines = [
  { id: 'machine-1', name: 'Test Machine 1', backupName: 'Machine 1 Local Files' },
  { id: 'machine-2', name: 'Test Machine 2', backupName: 'Machine 2 Local Files' },
  { id: 'machine-3', name: 'Test Machine 3', backupName: 'Machine 3 Local Files' }
];

// Helper function to generate a random duration between 30 seconds and 2 hours
function generateRandomDuration(): string {
  const totalSeconds = Math.floor(Math.random() * (7200 - 30) + 30);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to generate a random date within the last 30 days
function generateRandomDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
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

// Helper function to generate a backup payload
function generateBackupPayload(machine: typeof machines[0], backupNumber: number) {
  const beginTime = generateRandomDate();
  const endTime = new Date(new Date(beginTime).getTime() + Math.random() * 7200000); // Add up to 2 hours
  const duration = generateRandomDuration();
  const stats = generateRandomFileStats();
  const hasWarnings = Math.random() > 0.7; // 30% chance of warnings
  const hasErrors = Math.random() > 0.9; // 10% chance of errors

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
      WarningsActualLength: hasWarnings ? Math.floor(Math.random() * 5) + 1 : 0,
      ErrorsActualLength: hasErrors ? Math.floor(Math.random() * 3) + 1 : 0,
      BackendStatistics: {
        BytesUploaded: stats.uploadedSize,
        BytesDownloaded: Math.floor(stats.uploadedSize * 0.1),
        KnownFileSize: stats.fileSize,
        LastBackupDate: new Date(new Date(beginTime).getTime() - 86400000).toISOString(), // 1 day before
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
      OperationName: "Backup",
      'machine-id': machine.id,
      'machine-name': machine.name,
      'backup-name': machine.backupName,
      'backup-id': `DB-${backupNumber}`
    }
  };
}

// Main function to send test data
async function sendTestData() {
  const API_URL = 'http://localhost:9666/api/upload';

  for (const machine of machines) {
    console.log(`\nGenerating backups for ${machine.name}...`);
    
    for (let i = 1; i <= 10; i++) {
      const payload = generateBackupPayload(machine, i);
      
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
        console.log(`Backup ${i} for ${machine.name}: ${result.success ? 'Success' : 'Failed'}`);
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error sending backup ${i} for ${machine.name}:`, error);
      }
    }
  }
}

// Run the script
console.log('Starting test data generation...');
sendTestData().then(() => {
  console.log('\nTest data generation completed!');
}).catch(error => {
  console.error('Error generating test data:', error);
  process.exit(1);
}); 