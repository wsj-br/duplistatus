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

interface MachineDetailsPageProps {
  params: {
    machineId: string;
  };
}

export async function generateStaticParams() {
  const machines = getAllMachines();
  return machines.map((machine) => ({
    machineId: machine.id,
  }));
}


export default function MachineDetailsPage({ params }: MachineDetailsPageProps) {
  const machine = getMachineById(params.machineId);

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Machine Not Found</AlertTitle>
            <AlertDescription>
            The machine with ID "{params.machineId}" could not be found. 
            It might have been removed or the ID is incorrect.
            </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
            <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Calculate summary data
  const totalBackups = machine.backups.length;
  
  const statusCounts: Record<BackupStatus, number> = {
    Success: 0,
    Failed: 0,
    InProgress: 0,
    Warning: 0,
  };
  machine.backups.forEach(backup => {
    if (statusCounts[backup.status] !== undefined) {
        statusCounts[backup.status]++;
    }
  });

  const latestBackup = machine.backups.length > 0 ? machine.backups[0] : null;
  const lastBackupWarnings = latestBackup?.warnings || 0;
  const lastBackupErrors = latestBackup?.errors || 0;

  const totalDurationMinutes = machine.backups.reduce((sum, b) => sum + (b.durationInMinutes || 0), 0);
  const averageDuration = totalBackups > 0 ? totalDurationMinutes / totalBackups : 0;

  const totalUploadedSize = machine.backups.reduce((sum, b) => sum + (b.uploadedSize || 0), 0);
  const lastBackupStorageSize = latestBackup?.fileSize || 0;


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
            statusCounts={statusCounts}
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

      <MachineMetricsChart machine={machine} />

    </div>
  );
}

