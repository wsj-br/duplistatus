"use client";

import { useMemo, memo } from 'react';
import type { BackupStatus, ServerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRelativeTime, formatBytes, formatShortTimeAgo } from "@/lib/utils";
import { HardDrive, AlertTriangle, Download, Server, Database, Calendar } from "lucide-react";
import { ColoredIcon } from "@/components/ui/colored-icon";
import { useRouter } from "next/navigation";
import { useConfig } from "@/contexts/config-context";
import { getStatusSortValue } from "@/lib/sort-utils";
import { ServerConfigurationButton } from "@/components/ui/server-configuration-button";
import { BackupTooltipContent } from "@/components/ui/backup-tooltip-content";

// Helper function to get overall server status
function getServerStatus(server: ServerSummary): BackupStatus {
  // Check if any backup has an error or fatal status
  const hasErrorOrFatal = server.backupInfo.some(backupJob => 
    backupJob.lastBackupStatus === 'Error' || backupJob.lastBackupStatus === 'Fatal'
  );
  if (hasErrorOrFatal) {
    return 'Error';
  }
  
  // Check if any backup has a warning status
  const hasWarning = server.backupInfo.some(backupJob => 
    backupJob.lastBackupStatus === 'Warning'
  );
  
  // Check if any backup job is overdue
  const hasOverdueBackup = server.backupInfo.some(backupJob => backupJob.isBackupOverdue);
  
  if (hasWarning || hasOverdueBackup) {
    return 'Warning';
  }
  
  // Check if all backup statuses are success
  const allBackupsHaveStatus = server.backupInfo.length > 0;
  const allBackupsSuccess = allBackupsHaveStatus && server.backupInfo.every(backupJob => 
    backupJob.lastBackupStatus === 'Success'
  );
  
  if (allBackupsSuccess && !hasOverdueBackup) {
    return 'Success';
  }
  
  return 'Unknown';
}

// Helper function to get status color for backup status bars
function getStatusColorForBar(status: BackupStatus): string {
  switch (status) {
    case 'Success':
      return 'bg-green-500';
    case 'Warning':
      return 'bg-yellow-500';
    case 'Error':
    case 'Fatal':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

// Custom status badge without text, just icon and color
function OverviewStatusBadge({ status, haveOverdueBackups }: { status: BackupStatus; haveOverdueBackups: boolean }) {
  const getStatusIcon = (status: BackupStatus) => {
      switch (status) {
      case 'Success':
        if (!haveOverdueBackups) {
          return <div className="w-3 h-3 bg-green-500 rounded-full" />;
        } else { // return yelllow if have overdue backups
          return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
        }
      case 'Warning':
          return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 'Error':
      case 'Fatal':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {getStatusIcon(status)}
    </div>
  );
}

// Component for backup status bar using narrow rectangular blocks
function BackupStatusBar({ statusHistory }: { statusHistory: BackupStatus[] }) {
  // Use the last 10 statuses for the status bar
  const recentStatuses = statusHistory.length <= 10 ? statusHistory : statusHistory.slice(-10);
  
  return (
    <div className="flex gap-0.5">
      {/* Fill remaining slots if less than 10 statuses */}
      {Array.from({ length: Math.max(0, 10 - recentStatuses.length) }, (_, index) => (
        <div
          key={`empty-${index}`}
          className="w-1 h-3 border border-gray-700 rounded-sm bg-transparent"
        />
      ))}
      {recentStatuses.map((status, index) => {
        const statusColor = getStatusColorForBar(status);  
        return (
          <div 
            key={index} 
            className={`w-1 h-3 ${statusColor} rounded-sm`}
          />
        );
      })}
    </div>
  );
}

interface OverviewCardProps {
  server: ServerSummary;
  isSelected: boolean;
  onSelect: (serverId: string) => void;
}

const OverviewCard = ({ server, isSelected, onSelect }: OverviewCardProps) => {
  const serverStatus = getServerStatus(server);
  const router = useRouter();

  const handleCardClick = () => {
    onSelect(server.id);
  };

  return (
    <Card 
      variant="modern"
      hover={true}
      className={`cursor-pointer h-full flex flex-col ${
        isSelected 
          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg' 
          : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-1 pt-1 px-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold flex items-center flex-1">
            <ServerConfigurationButton className="h-8 w-8 flex-shrink-0" variant="ghost" serverUrl={server.server_url} serverName={server.name} serverAlias={server.alias} showText={false}  />
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/detail/${server.id}`);
              }}
              className="flex items-center hover:text-blue-600 transition-colors duration-200 cursor-pointer"
              title={`${server.alias ? server.name : ''}${server.alias && server.note ? '\n': ''}${server.note ? server.note : ''}`}
            >
              {server.alias || server.name}
            </button>
          </CardTitle>
          <div className="flex items-center flex-shrink-0">
            <OverviewStatusBadge 
              status={serverStatus} 
              haveOverdueBackups={server.haveOverdueBackups}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 px-3 pb-3 flex-1 flex flex-col">
        {/* Summary Information - Overview */}
        <div className="grid grid-cols-4 gap-2 text-xs flex-shrink-0 text-center">
          <section className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
              <Database className="h-3 w-3" />
              <span>Files</span>
            </div>
            <p className="font-semibold text-sm">
              {server.totalFileCount > 0 ? server.totalFileCount.toLocaleString() : 'N/A'}
            </p>
          </section>
          <section className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
              <HardDrive className="h-3 w-3" />
              <span>Size</span>
            </div>
            <p className="font-semibold text-sm">
              {server.totalFileSize > 0 ? formatBytes(server.totalFileSize) : 'N/A'}
            </p>
          </section>
          <section className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
              <Server className="h-3 w-3" />
              <span>Storage</span>
            </div>
            <p className="font-semibold text-sm">
              {server.totalStorageSize > 0 ? formatBytes(server.totalStorageSize) : 'N/A'}
            </p>
          </section>
          <section className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3 w-3" />
              <span>Last</span>
            </div>
            <div className="font-semibold text-xs">
              {server.lastBackupDate !== "N/A" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{formatRelativeTime(server.lastBackupDate)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(server.lastBackupDate).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                "N/A"
              )}
            </div>
          </section>
        </div>

        {/* Backup List - Each backup job on its own row */}
        <section className="space-y-0.5 flex-1 flex flex-col mt-auto">
          <h3 className="text-xs text-muted-foreground font-medium">Backups:</h3>
          {server.backupInfo.length > 0 ? (
            <div className="flex-1 flex flex-col divide-y divide-border/30">
              {server.backupInfo.map((backupJob, index) => (
                <Tooltip key={index} delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <div 
                      className="grid grid-cols-[45%_25%_30%] cursor-pointer hover:bg-muted/30 transition-colors duration-200 rounded px-1 -mx-1"
                      data-screenshot-trigger="backup-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/detail/${server.id}?backup=${encodeURIComponent(backupJob.name)}`);
                      }}
                    >
                      {/* Backup job name */}
                      <div className="text-left text-xs truncate">
                        {backupJob.name}
                      </div>
                      {/* Status bar using actual backup history */}
                      <div className="flex justify-center items-center">
                        <BackupStatusBar statusHistory={backupJob.statusHistory} />
                      </div>

                      {/* Overdue icon and time ago */}
                      <div className="flex items-center gap-1 justify-end">
                        
                        {/* Overdue icon */}
                        {backupJob.isBackupOverdue && (
                          <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        )}

                        {/* Time ago - use backup job's last backup date */}
                        <span className="text-muted-foreground text-xs truncate">
                          {backupJob.lastBackupDate !== "N/A" 
                            ? formatShortTimeAgo(backupJob.lastBackupDate)
                            : "N/A"}
                        </span>

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
                    data-screenshot-target={backupJob.isBackupOverdue ? "overdue-backup-tooltip" : "backup-tooltip"}
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
                      serverAlias={server.alias}
                      serverName={server.name}
                      serverNote={server.note}
                      serverUrl={server.server_url}
                      backupName={backupJob.name}
                      lastBackupDate={backupJob.lastBackupDate}
                      lastBackupStatus={backupJob.lastBackupStatus}
                      lastBackupDuration={backupJob.lastBackupDuration}
                      lastBackupListCount={backupJob.lastBackupListCount}
                      fileCount={backupJob.fileCount}
                      fileSize={backupJob.fileSize}
                      storageSize={backupJob.storageSize}
                      uploadedSize={backupJob.uploadedSize}
                      isOverdue={backupJob.isBackupOverdue}
                      expectedBackupDate={backupJob.expectedBackupDate}
                      notificationEvent={backupJob.notificationEvent}
                    />
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">No backup jobs available</div>
          )}
        </section>
      </CardContent>
    </Card>
  );
};

interface OverviewCardsProps {
  servers: ServerSummary[];
  selectedServerId?: string | null;
  onSelect: (serverId: string | null) => void;
}

export const OverviewCards = memo(function OverviewCards({ servers, selectedServerId, onSelect }: OverviewCardsProps) {
  const { dashboardCardsSortOrder } = useConfig();

  // Remove duplicates by server ID, sort based on configuration, and memoize to prevent unnecessary re-renders
  const uniqueServers = useMemo(() => {
    const filtered = servers.filter((server, index, self) => 
      index === self.findIndex(s => s.id === server.id)
    );
    
    // Sort based on dashboardCardsSortOrder configuration
    return [...filtered].sort((a, b) => {
      switch (dashboardCardsSortOrder) {
        case 'Server name (a-z)':
          // Use alias with fallback to name for sorting
          const aDisplayName = a.alias || a.name;
          const bDisplayName = b.alias || b.name;
          return aDisplayName.localeCompare(bDisplayName);
        
        case 'Status (error>warnings>success)':
          const aStatus = getServerStatus(a);
          const bStatus = getServerStatus(b);
          // First sort by status, then by server alias/name within the same status
          const statusComparison = getStatusSortValue(aStatus) - getStatusSortValue(bStatus);
          if (statusComparison !== 0) {
            return statusComparison;
          }
          // If status is the same, sort alphabetically by server alias/name
          const aDisplayNameStatus = a.alias || a.name;
          const bDisplayNameStatus = b.alias || b.name;
          return aDisplayNameStatus.localeCompare(bDisplayNameStatus);
        
        case 'Last backup received (new>old)':
          // Handle "N/A" dates by putting them at the end
          if (a.lastBackupDate === "N/A" && b.lastBackupDate === "N/A") return 0;
          if (a.lastBackupDate === "N/A") return 1;
          if (b.lastBackupDate === "N/A") return -1;
          // Sort by newest first (descending)
          return new Date(b.lastBackupDate).getTime() - new Date(a.lastBackupDate).getTime();
        
        default:
          return 0;
      }
    });
  }, [servers, dashboardCardsSortOrder]);

  // Show message if no servers
  if (uniqueServers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card variant="modern" className="max-w-md">
          <CardContent className="text-center space-y-4 py-8">
            <ColoredIcon icon={HardDrive} color="gray" size="lg" className="h-16 w-16 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-muted-foreground">No servers found</h3>
              <p className="text-sm text-muted-foreground">
                Collect data for your first server by clicking on{" "}
                <span className="inline-flex items-center">
                  <ColoredIcon icon={Download} color="blue" size="sm" className="mx-1" />
                </span>{" "}
                (Collect backups logs) in the toolbar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
      {/* Responsive Grid Layout with vertical scrolling */}
      {/* 
        Responsive breakpoints:
        - xl (1280px+): 4 columns 
        - lg (1024px+): 3 columns 
        - md (768px+): 2 columns 
        - sm (640px+): 2 columns 
        - default: 1 column 
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 xxl:grid-cols-5 gap-2">
        {uniqueServers.map((server) => (
          <div key={server.id} className="w-full h-[200px]">
            <OverviewCard
              server={server}
              isSelected={selectedServerId === server.id}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if there are actual changes in the data we care about
  
  // Check if servers data changed (deep comparison of essential fields)
  if (prevProps.servers.length !== nextProps.servers.length) return false;
  
  const serversEqual = prevProps.servers.every((server, index) => {
    const nextServer = nextProps.servers[index];
    return server.id === nextServer.id &&
           server.name === nextServer.name &&
           server.lastBackupStatus === nextServer.lastBackupStatus &&
           server.lastBackupDate === nextServer.lastBackupDate &&
           server.totalBackupCount === nextServer.totalBackupCount &&
           server.backupInfo.length === nextServer.backupInfo.length &&
           JSON.stringify(server.backupInfo) === JSON.stringify(nextServer.backupInfo);
  });
  
  // Check other props
  const otherPropsEqual = prevProps.selectedServerId === nextProps.selectedServerId;
  
  return serversEqual && otherPropsEqual;
});
