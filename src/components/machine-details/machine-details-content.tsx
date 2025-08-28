"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MachineBackupTable } from "@/components/machine-details/machine-backup-table";
import { MachineDetailSummaryItems } from "@/components/machine-details/machine-detail-summary-items";
import { MetricsChartsPanel } from "@/components/metrics-charts-panel";
import type { Machine } from "@/lib/types";
import { useBackupSelection } from "@/contexts/backup-selection-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface OverdueBackup {
  machineName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: string;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}

interface MachineDetailsContentProps {
  machine: Machine;
  overdueBackups: OverdueBackup[];
  lastOverdueCheck: string;
  lastRefreshTime: Date;
}

export function MachineDetailsContent({ machine, overdueBackups, lastOverdueCheck, lastRefreshTime }: MachineDetailsContentProps) {
  const { selectedBackup: selectedBackupName } = useBackupSelection();
  
  // Find the selected backup if one is selected
  const selectedBackup = selectedBackupName === 'all' 
    ? null 
    : machine.backups.find(backup => backup.name === selectedBackupName) ?? null;

  // Calculate total backups for the selected backup name
  const selectedBackupTotal = selectedBackupName === 'all'
    ? machine.backups.length
    : machine.backups.filter(backup => backup.name === selectedBackupName).length;
  
  // Calculate total backups for the selected backup name
  const totalUploadedSize = selectedBackupName === 'all'
    ? machine.backups.reduce((acc, backup) => acc + backup.uploadedSize, 0)
    : machine.backups
        .filter(backup => backup.name === selectedBackupName)
        .reduce((acc, backup) => acc + backup.uploadedSize, 0);

  // Calculate average duration based on selection
  const averageDuration = selectedBackupName === 'all'
    ? machine.backups.reduce((acc, backup) => acc + backup.duration_seconds/60.0, 0) / selectedBackupTotal
    : machine.backups
        .filter(backup => backup.name === selectedBackupName)
        .reduce((acc, backup) => acc + backup.duration_seconds/60.0, 0) / selectedBackupTotal;

  // Get the most recent backup for each backup name and sum their fields
  const getMostRecentBackupsSum = (backups: typeof machine.backups) => {
    // Group backups by name
    const backupsByName = backups.reduce((acc, backup) => {
      if (!acc[backup.name]) {
        acc[backup.name] = [];
      }
      acc[backup.name].push(backup);
      return acc;
    }, {} as Record<string, typeof machine.backups>);

    // Get most recent backup for each name and sum their fields
    return Object.values(backupsByName).reduce((sum, backups) => {
      // Sort by startTime and get the most recent
      const mostRecent = [...backups].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      return {
        knownFileSize: sum.knownFileSize + (mostRecent.knownFileSize ?? 0),
        backup_list_count: sum.backup_list_count + (mostRecent.backup_list_count ?? 0),
        fileSize: sum.fileSize + (mostRecent.fileSize ?? 0)
      };
    }, { knownFileSize: 0, backup_list_count: 0, fileSize: 0 });
  };

  // Get the relevant backups based on selection
  const relevantBackups = selectedBackupName === 'all'
    ? machine.backups
    : machine.backups.filter(backup => backup.name === selectedBackupName);

  // Get the sum of most recent backups
  const { knownFileSize, backup_list_count, fileSize } = getMostRecentBackupsSum(relevantBackups);
  const lastBackupStorageSize = knownFileSize;
  const lastBackupListCount = backup_list_count;
  const lastBackupFileSize = fileSize;

  return (
    <div className="flex flex-col gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{machine.name}</CardTitle>
          <CardDescription>
            {selectedBackup 
              ? <>Details for backup <span className="text-primary font-medium">{selectedBackup.name}</span></>
              : <>Details for <span className="text-primary font-medium">all backups</span></>
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MachineDetailSummaryItems
            totalBackups={selectedBackupTotal}
            averageDuration={averageDuration}
            totalUploadedSize={totalUploadedSize}
            lastBackupStorageSize={lastBackupStorageSize}
            lastBackupListCount={lastBackupListCount}
            lastBackupFileSize={lastBackupFileSize}
            selectedBackup={selectedBackup}
            overdueBackups={overdueBackups}
                          lastOverdueCheck={lastOverdueCheck}
          />
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            {selectedBackup 
              ? <>List of all <span className="text-primary font-medium">{selectedBackup.name}</span> backups</>
              : <>List of all backups for  <span className="text-primary font-medium">{machine.name}</span></>
            }
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help ml-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last refresh: --</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MachineBackupTable backups={machine.backups} machineName={machine.name} />
        </CardContent>
      </Card>

      {/* Machine-specific metrics chart */}
      <Card className="shadow-lg">
        <CardContent className="pt-6 min-h-[470px]">
          <MetricsChartsPanel
            machineId={machine.id}
            backupName={selectedBackupName === 'all' ? undefined : selectedBackupName}
            lastRefreshTime={lastRefreshTime}
          />
        </CardContent>
      </Card>
    </div>
  );
} 