import { getMachineById, getAllMachines } from "@/lib/data";
import type { Machine, BackupStatus } from "@/lib/types";
import { MachineBackupTable } from "@/components/machine-details/machine-backup-table";
import { MachineMetricsChart } from "@/components/machine-details/machine-metrics-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MachineDetailSummaryItems } from "@/components/machine-details/machine-detail-summary-items";
import { notFound } from 'next/navigation';

interface MachineDetailsPageProps {
  params: {
    machineId: string;
  };
}

export async function generateStaticParams() {
  const machines = await getAllMachines();
  return machines.map((machine: Machine) => ({
    machineId: machine.id,
  }));
}

export default async function MachineDetailsPage({
  params,
}: MachineDetailsPageProps) {
  // Ensure params is properly awaited
  const { machineId } = await Promise.resolve(params);
  
  const machine = await getMachineById(machineId);

  if (!machine) {
    notFound();
  }

  // Calculate summary data
  const totalBackups = machine.backups.length;
  const latestBackup = machine.backups.length > 0 ? machine.backups[0] : null;
  const lastBackupWarnings = latestBackup?.warnings || 0;
  const lastBackupErrors = latestBackup?.errors || 0;

  // Debug logging for latest backup
  console.log('Latest backup:', latestBackup ? {
    id: latestBackup.id,
    uploadedSize: latestBackup.uploadedSize,
    knownFileSize: latestBackup.knownFileSize
  } : 'No backups');

  const totalDurationMinutes = machine.backups.reduce((sum, b) => sum + (b.durationInMinutes || 0), 0);
  const averageDuration = totalBackups > 0 ? totalDurationMinutes / totalBackups : 0;

  const totalUploadedSize = machine.backups.reduce((sum, b) => {
    const size = Number(b.uploadedSize);
    const result = sum + (isNaN(size) ? 0 : size);
    console.log('Adding to totalUploadedSize:', { current: b.uploadedSize, size, result });
    return result;
  }, 0);

  const lastBackupStorageSize = latestBackup ? (() => {
    const size = Number(latestBackup.knownFileSize);
    const result = isNaN(size) ? 0 : size;
    console.log('Calculating lastBackupStorageSize:', { raw: latestBackup.knownFileSize, size, result });
    return result;
  })() : 0;

  // Debug logging for final values
  console.log('Final calculated values:', {
    totalUploadedSize,
    lastBackupStorageSize,
    totalBackups,
    averageDuration
  });

  // Calculate chart data
  const chartData = machine.backups.map(backup => ({
    date: new Date(backup.date).toLocaleDateString(),
    uploadedSize: backup.uploadedSize,
    duration: backup.durationInMinutes,
    fileCount: backup.fileCount,
    fileSize: backup.fileSize,
    storageSize: backup.knownFileSize
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{machine.name}</CardTitle>
          <CardDescription>Detailed backup information and performance metrics for {machine.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <MachineDetailSummaryItems
            totalBackups={totalBackups}
            lastBackupWarnings={lastBackupWarnings}
            lastBackupErrors={lastBackupErrors}
            averageDuration={averageDuration}
            totalUploadedSize={totalUploadedSize}
            lastBackupStorageSize={lastBackupStorageSize}
          />
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>List of all backups for {machine.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <MachineBackupTable backups={machine.backups} itemsPerPage={5} />
        </CardContent>
      </Card>

      <MachineMetricsChart machine={{ ...machine, chartData }} />
    </div>
  );
} 