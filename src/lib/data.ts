import type { Machine, MachineSummary, Backup, BackupStatus } from './types';

const generateBackups = (machineId: string, count: number): Backup[] => {
  const statuses: BackupStatus[] = ["Success", "Failed", "InProgress", "Warning"];
  const backups: Backup[] = [];
  let currentDate = new Date();

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const durationMinutes = Math.floor(Math.random() * 120) + 5; // 5 to 125 minutes
    const uploadedMB = Math.floor(Math.random() * 5000) + 100; // 100MB to 5GB
    const totalFiles = Math.floor(Math.random() * 10000) + 500; // 500 to 10500 files
    const totalSizeMB = uploadedMB + Math.floor(Math.random() * 1000); // Total size slightly larger

    backups.push({
      id: `${machineId}-backup-${i + 1}`,
      name: `Backup ${currentDate.toLocaleDateString()}`,
      date: currentDate.toISOString(),
      status: status,
      warnings: status === "Warning" ? Math.floor(Math.random() * 5) + 1 : 0,
      errors: status === "Failed" ? Math.floor(Math.random() * 3) + 1 : 0,
      fileCount: totalFiles,
      fileSize: `${(totalSizeMB / 1024).toFixed(2)} GB`,
      uploadedSize: `${(uploadedMB / 1024).toFixed(2)} GB`,
      duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
      // Numeric values for charting
      fileSizeInMB: totalSizeMB,
      uploadedSizeInMB: uploadedMB,
      durationInMinutes: durationMinutes,
    });
    currentDate.setDate(currentDate.getDate() - (Math.floor(Math.random()*3) + 1)); // Go back 1-3 days
  }
  return backups.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const machinesData: Machine[] = [
  {
    id: "alpha-server",
    name: "Alpha Server",
    backups: generateBackups("alpha-server", 25),
    chartData: [] // Will be populated based on backups
  },
  {
    id: "beta-workstation",
    name: "Beta Workstation",
    backups: generateBackups("beta-workstation", 15),
    chartData: []
  },
  {
    id: "gamma-vm",
    name: "Gamma Virtual Machine",
    backups: generateBackups("gamma-vm", 30),
    chartData: []
  },
  {
    id: "delta-db",
    name: "Delta Database",
    backups: generateBackups("delta-db", 10),
    chartData: []
  },
];

// Populate chartData
machinesData.forEach(machine => {
  machine.chartData = machine.backups
    .map(b => ({
      date: new Date(b.date).toLocaleDateString(),
      uploadedSize: b.uploadedSizeInMB,
      duration: b.durationInMinutes,
      fileCount: b.fileCount,
      fileSize: b.fileSizeInMB,
    }))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending for chart
});


export const getMachinesSummary = (): MachineSummary[] => {
  return machinesData.map(machine => {
    const latestBackup = machine.backups.length > 0 ? machine.backups[0] : null;
    return {
      id: machine.id,
      name: machine.name,
      backupCount: machine.backups.length,
      lastBackupStatus: latestBackup?.status || "N/A" as any, // Cast to any if N/A needed, or handle better
      lastBackupDate: latestBackup?.date || "N/A",
      lastBackupDuration: latestBackup?.duration || "N/A",
      totalWarnings: machine.backups.reduce((sum, b) => sum + b.warnings, 0),
      totalErrors: machine.backups.reduce((sum, b) => sum + b.errors, 0),
    };
  });
};

export const getMachineById = (id: string): Machine | undefined => {
  return machinesData.find(machine => machine.id === id);
};

export const getAllMachines = (): Machine[] => machinesData;
