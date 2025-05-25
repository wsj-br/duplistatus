import { db, dbOps } from './db';

// Helper function to ensure database operations are only performed on the server
export function withDb<T>(operation: () => T): T {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations can only be performed on the server side');
  }
  return operation();
}

// Wrapper functions for database operations
export const dbUtils = {
  getMachinesSummary: () => withDb(() => dbOps.getMachinesSummary.all()),
  getMachineById: (id: string) => withDb(() => dbOps.getMachine.get(id)),
  getMachineByName: (name: string) => withDb(() => dbOps.getMachineByName.get(name)),
  getLatestBackup: (machineId: string) => withDb(() => dbOps.getLatestBackup.get(machineId)),
  getMachineBackups: (machineId: string) => withDb(() => dbOps.getMachineBackups.all(machineId)),
  getAllMachines: () => withDb(() => dbOps.getAllMachines.all()),
  getOverallSummary: () => withDb(() => dbOps.getOverallSummary.get()),
  getLatestBackupDate: () => withDb(() => dbOps.getLatestBackupDate.get()),
  getAggregatedChartData: () => withDb(() => dbOps.getAggregatedChartData.all()),
  insertBackup: (data: Parameters<typeof dbOps.insertBackup.run>[0]) => 
    withDb(() => dbOps.insertBackup.run(data)),
  upsertMachine: (data: Parameters<typeof dbOps.upsertMachine.run>[0]) => 
    withDb(() => dbOps.upsertMachine.run(data)),
  checkDuplicateBackup: (data: { machine_id: string; backup_name: string; date: string }) =>
    withDb(() => (dbOps.checkDuplicateBackup.get(data) as { count: number }).count > 0)
}; 