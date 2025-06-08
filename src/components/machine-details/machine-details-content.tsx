"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MachineBackupTable } from "@/components/machine-details/machine-backup-table";
import { MachineMetricsChart } from "@/components/machine-details/machine-metrics-chart";
import { MachineDetailSummaryItems } from "@/components/machine-details/machine-detail-summary-items";
import { BackupSelectionProvider } from "@/contexts/backup-selection-context";
import type { Machine } from "@/lib/types";

interface MachineDetailsContentProps {
  machine: Machine;
}

export function MachineDetailsContent({ machine }: MachineDetailsContentProps) {
  const totalBackups = machine.backups.length;
  const averageDuration = machine.backups.reduce((acc, backup) => acc + backup.duration_seconds, 0) / totalBackups;
  const totalUploadedSize = machine.backups.reduce((acc, backup) => acc + backup.uploadedSize, 0);
  const lastBackup = machine.backups[0];
  const lastBackupStorageSize = lastBackup?.knownFileSize ?? 0;
  const lastBackupListCount = lastBackup?.backup_list_count ?? 0;
  const lastBackupFileSize = lastBackup?.fileSize ?? 0;

  return (
    <BackupSelectionProvider>
      <div className="flex flex-col gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">{machine.name}</CardTitle>
            <CardDescription>Detailed backup information and performance metrics for {machine.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <MachineDetailSummaryItems
              totalBackups={totalBackups}
              averageDuration={averageDuration}
              totalUploadedSize={totalUploadedSize}
              lastBackupStorageSize={lastBackupStorageSize}
              lastBackupListCount={lastBackupListCount}
              lastBackupFileSize={lastBackupFileSize}
            />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>List of all backups for {machine.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <MachineBackupTable backups={machine.backups} />
          </CardContent>
        </Card>

        {/* Machine-specific metrics chart */}
        <MachineMetricsChart machine={machine} />
      </div>
    </BackupSelectionProvider>
  );
} 