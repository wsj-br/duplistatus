import { getMachineById, getAllMachines } from "@/lib/data";
import type { Machine, BackupStatus } from "@/lib/types";
import { MachineBackupTable } from "@/components/machine-details/machine-backup-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MachineDetailSummaryItems } from "@/components/machine-details/machine-detail-summary-items";
import { notFound } from 'next/navigation';
import { use } from 'react';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add cache control headers to the response
export async function generateMetadata() {
  return {
    other: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  };
}

export async function generateStaticParams() {
  const machines = await getAllMachines();
  return machines.map((machine: Machine) => ({
    machineId: machine.id,
  }));
}

export default function MachineDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ machineId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Use React's use() hook to handle the Promise
  const { machineId } = use(params);
  
  // Since we can't use await directly in a non-async component,
  // we'll wrap the async logic in a separate function
  const machine = use(
    getMachineById(machineId).then(result => {
      if (!result) {
        notFound();
      }
      return result;
    })
  );

  // Calculate summary data
  const totalBackups = machine.backups.length;
  const latestBackup = machine.backups.length > 0 ? machine.backups[0] : null;
  const lastBackupListCount = latestBackup?.backup_list_count ?? null;
  const lastBackupFileSize = latestBackup ? (() => {
    const size = Number(latestBackup.fileSize);
    const result = isNaN(size) ? 0 : size;
    return result;
  })() : 0;

  // Calculate average duration using duration_seconds
  const totalDurationSeconds = machine.backups.reduce((sum, b) => {
    const seconds = Number(b.duration_seconds);
    return sum + (isNaN(seconds) ? 0 : seconds);
  }, 0);
  const averageDurationSeconds = totalBackups > 0 ? totalDurationSeconds / totalBackups : 0;
  const averageDuration = averageDurationSeconds / 60; // Convert to minutes for display

  const totalUploadedSize = machine.backups.reduce((sum, b) => {
    const size = Number(b.uploadedSize);
    const result = sum + (isNaN(size) ? 0 : size);
    return result;
  }, 0);

  const lastBackupStorageSize = latestBackup ? (() => {
    const size = Number(latestBackup.knownFileSize);
    const result = isNaN(size) ? 0 : size;
    return result;
  })() : 0;

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
    </div>
  );
} 