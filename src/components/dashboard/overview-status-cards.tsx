"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ServerSummary, BackupStatus, NotificationEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCheck, OctagonAlert, AlertTriangle, ThumbsUp } from "lucide-react";
import { formatShortTimeAgo } from "@/lib/utils";
import { ServerConfigurationButton } from "@/components/ui/server-configuration-button";
import { BackupTooltipContent } from "@/components/ui/backup-tooltip-content";

interface OverviewStatusPanelProps {
  servers: ServerSummary[];
  totalBackups: number;
}

interface BackupWithServer {
  serverId: string;
  serverName: string;
  serverAlias: string;
  serverUrl: string;
  serverNote: string;
  backupName: string;
  lastBackupDate: string;
  lastBackupStatus: BackupStatus | 'N/A';
  lastBackupDuration: string;
  lastBackupListCount: number | null;
  fileCount: number;
  fileSize: number;
  storageSize: number;
  uploadedSize: number;
  isOverdue: boolean;
  expectedBackupDate: string;
  notificationEvent?: NotificationEvent;
}

export function OverviewStatusPanel({ servers, totalBackups }: OverviewStatusPanelProps) {
  const router = useRouter();

  // Helper function to calculate percentage
  const calculatePercentage = (count: number): number => {
    if (totalBackups === 0) return 0;
    return Math.round((count / totalBackups) * 100);
  };

  // Helper function to get status icon
  const getStatusIcon = (status: BackupStatus | 'N/A') => {
    switch (status) {
      case 'Success':
          return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'Warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'Error':
      case 'Fatal':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  // Calculate statistics and prepare data
  const { successCount, overdueBackups, warningErrorBackups } = useMemo(() => {
    let successCount = 0;
    const overdueBackups: BackupWithServer[] = [];
    const warningErrorBackups: BackupWithServer[] = [];

    servers.forEach(server => {
      server.backupInfo.forEach(backup => {
        // Count successful backups
        if (backup.lastBackupStatus === 'Success') {
          successCount++;
        }

        // Collect overdue backups
        if (backup.isBackupOverdue) {
          overdueBackups.push({
            serverId: server.id,
            serverName: server.name,
            serverAlias: server.alias,
            serverUrl: server.server_url,
            serverNote: server.note,
            backupName: backup.name,
            lastBackupDate: backup.lastBackupDate,
            lastBackupStatus: backup.lastBackupStatus,
            lastBackupDuration: backup.lastBackupDuration,
            lastBackupListCount: backup.lastBackupListCount,
            fileCount: backup.fileCount,
            fileSize: backup.fileSize,
            storageSize: backup.storageSize,
            uploadedSize: backup.uploadedSize,
            isOverdue: backup.isBackupOverdue,
            expectedBackupDate: backup.expectedBackupDate,
            notificationEvent: backup.notificationEvent,
          });
        }

        // Collect warning/error backups
        if (backup.lastBackupStatus !== 'Success' && backup.lastBackupStatus !== 'N/A') {
          warningErrorBackups.push({
            serverId: server.id,
            serverName: server.name,
            serverAlias: server.alias,
            serverUrl: server.server_url,
            serverNote: server.note,
            backupName: backup.name,
            lastBackupDate: backup.lastBackupDate,
            lastBackupStatus: backup.lastBackupStatus,
            lastBackupDuration: backup.lastBackupDuration,
            lastBackupListCount: backup.lastBackupListCount,
            fileCount: backup.fileCount,
            fileSize: backup.fileSize,
            storageSize: backup.storageSize,
            uploadedSize: backup.uploadedSize,
            isOverdue: backup.isBackupOverdue,
            expectedBackupDate: backup.expectedBackupDate,
            notificationEvent: backup.notificationEvent,
          });
        }
      });
    });

    // Sort overdue backups alphabetically by server name, then by backup name
    overdueBackups.sort((a, b) => {
      const serverA = a.serverAlias || a.serverName;
      const serverB = b.serverAlias || b.serverName;
      if (serverA !== serverB) {
        return serverA.localeCompare(serverB);
      }
      return a.backupName.localeCompare(b.backupName);
    });

    // Sort warning/error backups alphabetically by server name, then by backup name
    warningErrorBackups.sort((a, b) => {
      const serverA = a.serverAlias || a.serverName;
      const serverB = b.serverAlias || b.serverName;
      if (serverA !== serverB) {
        return serverA.localeCompare(serverB);
      }
      return a.backupName.localeCompare(b.backupName);
    });

    return { successCount, overdueBackups, warningErrorBackups };
  }, [servers]);

  const handleBackupClick = (serverId: string, backupName: string) => {
    router.push(`/detail/${serverId}?backup=${encodeURIComponent(backupName)}`);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3 h-full p-2">
        {/* Success Card */}
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCheck className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Success</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-500">{successCount}</span>
                <div className="text-xs text-muted-foreground">{calculatePercentage(successCount)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Backups Card */}
        <Card className="flex-1 min-h-0 flex flex-col" style={{ maxHeight: '40vh' }}>
          <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {overdueBackups.length > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                )}
                <CardTitle className="text-sm font-medium">Overdue Backups</CardTitle>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${overdueBackups.length > 0 ? 'text-red-500' : 'text-green-500'}`}>{overdueBackups.length}</span>
                <div className="text-xs text-muted-foreground">{calculatePercentage(overdueBackups.length)}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-4 flex-1 min-h-0 overflow-hidden">
            {overdueBackups.length > 0 ? (
              <div className="overflow-y-auto h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                <div className="space-y-0.5">
                  {overdueBackups.map((backup) => (
                    <Tooltip key={`${backup.serverId}-${backup.backupName}`} delayDuration={1000}>
                      <TooltipTrigger asChild>
                          <div
                            className="grid grid-cols-[35%_35%_30%] items-center p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors"
                            onClick={() => handleBackupClick(backup.serverId, backup.backupName)}
                          >
                            <div className="text-xs text-muted-foreground truncate">
                              {backup.serverAlias || backup.serverName}
                            </div>
                            <div className="text-xs font-medium truncate">
                              {backup.backupName}
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              {getStatusIcon(backup.lastBackupStatus)}
                              <span className="text-xs text-red-500 truncate">
                                {formatShortTimeAgo(backup.lastBackupDate)}
                              </span>
                              <ServerConfigurationButton
                                serverUrl={backup.serverUrl}
                                serverName={backup.serverName}
                                serverAlias={backup.serverAlias}
                                size="sm"
                                variant="ghost"
                                showText={false}
                                className="h-4 w-4 p-0 flex-shrink-0"
                              />
                            </div>
                          </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        align="start"
                        sideOffset={8}
                        avoidCollisions={true}
                        collisionPadding={24}
                        className="cursor-default space-y-3 min-w-[300px] max-w-[400px] z-[9999]"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Close the tooltip by clicking outside
                          const tooltip = e.currentTarget.closest('[data-radix-tooltip-content]');
                          if (tooltip) {
                            tooltip.remove();
                          }
                        }}
                        onPointerDownOutside={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <BackupTooltipContent
                          serverAlias={backup.serverAlias}
                          serverName={backup.serverName}
                          serverNote={backup.serverNote}
                          serverUrl={backup.serverUrl}
                          backupName={backup.backupName}
                          lastBackupDate={backup.lastBackupDate}
                          lastBackupStatus={backup.lastBackupStatus}
                          lastBackupDuration={backup.lastBackupDuration}
                          lastBackupListCount={backup.lastBackupListCount}
                          fileCount={backup.fileCount}
                          fileSize={backup.fileSize}
                          storageSize={backup.storageSize}
                          uploadedSize={backup.uploadedSize}
                          isOverdue={backup.isOverdue}
                          expectedBackupDate={backup.expectedBackupDate}
                          notificationEvent={backup.notificationEvent}
                        />
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No overdue backups
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warnings & Errors Card */}
        <Card className="flex-1 min-h-0 flex flex-col" style={{ maxHeight: '40vh' }}>
          <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <OctagonAlert className={`h-5 w-5 ${warningErrorBackups.length > 0 ? 'text-yellow-500' : 'text-gray-500'}`} />
                <CardTitle className="text-sm font-medium">Warnings & Errors</CardTitle>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${warningErrorBackups.length > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>{warningErrorBackups.length}</span>
                <div className="text-xs text-muted-foreground">{calculatePercentage(warningErrorBackups.length)}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-4 flex-1 min-h-0 overflow-hidden">
            {warningErrorBackups.length > 0 ? (
              <div className="overflow-y-auto h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                <div className="space-y-0.5">
                  {warningErrorBackups.map((backup) => (
                    <Tooltip key={`${backup.serverId}-${backup.backupName}`} delayDuration={1000}>
                      <TooltipTrigger asChild>
                        <div
                          className="grid grid-cols-[35%_35%_30%] items-center p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors"
                          onClick={() => handleBackupClick(backup.serverId, backup.backupName)}
                        >
                          <div className="text-xs text-muted-foreground truncate">
                            {backup.serverAlias || backup.serverName}
                          </div>
                          <div className="text-xs font-medium truncate">
                            {backup.backupName}
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            {getStatusIcon(backup.lastBackupStatus)}
                            <span className="text-xs text-muted-foreground truncate">
                              {formatShortTimeAgo(backup.lastBackupDate)}
                            </span>
                            <ServerConfigurationButton
                              serverUrl={backup.serverUrl}
                              serverName={backup.serverName}
                              serverAlias={backup.serverAlias}
                              size="sm"
                              variant="ghost"
                              showText={false}
                              className="h-4 w-4 p-0 flex-shrink-0"
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        align="start"
                        sideOffset={8}
                        avoidCollisions={true}
                        collisionPadding={24}
                        className="cursor-default space-y-3 min-w-[300px] max-w-[400px] z-[9999]"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Close the tooltip by clicking outside
                          const tooltip = e.currentTarget.closest('[data-radix-tooltip-content]');
                          if (tooltip) {
                            tooltip.remove();
                          }
                        }}
                        onPointerDownOutside={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <BackupTooltipContent
                          serverAlias={backup.serverAlias}
                          serverName={backup.serverName}
                          serverNote={backup.serverNote}
                          serverUrl={backup.serverUrl}
                          backupName={backup.backupName}
                          lastBackupDate={backup.lastBackupDate}
                          lastBackupStatus={backup.lastBackupStatus}
                          lastBackupDuration={backup.lastBackupDuration}
                          lastBackupListCount={backup.lastBackupListCount}
                          fileCount={backup.fileCount}
                          fileSize={backup.fileSize}
                          storageSize={backup.storageSize}
                          uploadedSize={backup.uploadedSize}
                          isOverdue={backup.isOverdue}
                          expectedBackupDate={backup.expectedBackupDate}
                          notificationEvent={backup.notificationEvent}
                        />
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No warnings or errors
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
