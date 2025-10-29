"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerBackupTable } from "@/components/server-details/server-backup-table";
import { ServerDetailSummaryItems } from "@/components/server-details/server-detail-summary-items";
import { MetricsChartsPanel } from "@/components/metrics-charts-panel";
import type { Server } from "@/lib/types";
import { useBackupSelection } from "@/contexts/backup-selection-context";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";

interface OverdueBackup {
  serverName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: string;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}

interface ServerDetailsContentProps {
  server: Server;
  overdueBackups: OverdueBackup[];
  lastOverdueCheck: string;
  lastRefreshTime: Date;
}

export function ServerDetailsContent({ server, overdueBackups, lastOverdueCheck, lastRefreshTime: _lastRefreshTime }: ServerDetailsContentProps) {
  const { selectedBackup: selectedBackupName } = useBackupSelection();
  const { refreshDetail } = useGlobalRefresh();
  
  // Server details always uses content-based height regardless of window dimensions
  // This ensures the content can expand naturally like a table view
  const useContentBasedHeight = true;
  
  // Find the selected backup if one is selected
  const selectedBackup = selectedBackupName === 'all' 
    ? null 
    : server.backups.find(backup => backup.name === selectedBackupName) ?? null;

  // Calculate total backups for the selected backup name
  const selectedBackupTotal = selectedBackupName === 'all'
    ? server.backups.length
    : server.backups.filter(backup => backup.name === selectedBackupName).length;
  
  // Calculate total backups for the selected backup name
  const totalUploadedSize = selectedBackupName === 'all'
    ? server.backups.reduce((acc, backup) => acc + backup.uploadedSize, 0)
    : server.backups
        .filter(backup => backup.name === selectedBackupName)
        .reduce((acc, backup) => acc + backup.uploadedSize, 0);

  // Calculate average duration based on selection
  const averageDuration = selectedBackupName === 'all'
    ? server.backups.reduce((acc, backup) => acc + backup.duration_seconds/60.0, 0) / selectedBackupTotal
    : server.backups
        .filter(backup => backup.name === selectedBackupName)
        .reduce((acc, backup) => acc + backup.duration_seconds/60.0, 0) / selectedBackupTotal;

  // Get the most recent backup for each backup name and sum their fields
  const getMostRecentBackupsSum = (backups: typeof server.backups) => {
    // Group backups by name
    const backupsByName = backups.reduce((acc, backup) => {
      if (!acc[backup.name]) {
        acc[backup.name] = [];
      }
      acc[backup.name].push(backup);
      return acc;
    }, {} as Record<string, typeof server.backups>);

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
    ? server.backups
    : server.backups.filter(backup => backup.name === selectedBackupName);

  // Get the sum of most recent backups
  const { knownFileSize, backup_list_count, fileSize } = getMostRecentBackupsSum(relevantBackups);
  const lastBackupStorageSize = knownFileSize;
  const lastBackupListCount = backup_list_count;
  const lastBackupFileSize = fileSize;

  // Calculate total unique backup jobs (configurations)
  const totalBackupJobs = new Set(server.backups.map(backup => backup.name)).size;

  // Handle backup deletion
  const handleBackupDeleted = async () => {
    try {
      await refreshDetail(server.id);
    } catch (error) {
      console.error('Error refreshing data after backup deletion:', error);
    }
  };

  // this page is always show in the table view

  return (
    <div className="flex flex-col gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex justify-between items-center">
            <span 
              title={server.alias ? server.name : undefined}
            >
              {server.alias || server.name}
            </span>
            <span className="text-2xl text-muted-foreground">
              {server.note ? server.note : ''}
            </span>
          </CardTitle>
          <CardDescription>
            {selectedBackup 
              ? <>Details for backup <span className="text-primary font-medium">{selectedBackup.name}</span></>
              : <>Details for <span className="text-primary font-medium">all backups</span></>
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerDetailSummaryItems
            totalBackupsRuns={selectedBackupTotal}
            averageDuration={averageDuration}
            totalUploadedSize={totalUploadedSize}
            lastBackupStorageSize={lastBackupStorageSize}
            lastBackupListCount={lastBackupListCount}
            lastBackupFileSize={lastBackupFileSize}
            selectedBackup={selectedBackup}
            overdueBackups={overdueBackups}
            lastOverdueCheck={lastOverdueCheck}
            totalBackupJobs={totalBackupJobs}
          />
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            {selectedBackup 
              ? <>List of all <span className="text-primary font-medium">{selectedBackup.name}</span> backups</>
              : <>List of all backups for  <span className="text-primary font-medium">{server.alias || server.name}</span></>
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerBackupTable 
            backups={server.backups} 
            serverName={server.name}
            serverAlias={server.alias}
            serverNote={server.note}
            onBackupDeleted={handleBackupDeleted}
          />
        </CardContent>
      </Card>

      {/* Server-specific metrics chart */}
      <div className={`${useContentBasedHeight ? 'min-h-fit' : 'flex-1 min-h-0 overflow-hidden'}`}>
        <Card className={`${useContentBasedHeight ? 'min-h-fit' : 'h-full'} shadow-lg border-2 border-border`}>
          <CardContent className={`${useContentBasedHeight ? 'min-h-fit' : 'h-full'} p-0`}>
            <MetricsChartsPanel
              serverId={server.id}
              backupName={selectedBackupName === 'all' ? undefined : selectedBackupName}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 