// src/components/dashboard/dashboard-table.tsx
"use client";

import type { ServerSummary } from "@/lib/types";
import type { NotificationEvent } from "@/lib/types";
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useRouter } from "next/navigation"; // Import useRouter
import { formatRelativeTime } from "@/lib/utils"; // Import the new function
import { formatDateTime, formatDate } from "@/lib/date-format"; // Import locale-aware date formatting
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { createSortedArray, type SortConfig } from "@/lib/sort-utils";
import { useAvailableBackupsModal, AvailableBackupsIcon } from "@/components/ui/available-backups-modal";
import { MessageSquareMore, MessageSquareOff, Settings, HardDrive, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServerConfigurationButton } from "@/components/ui/server-configuration-button";
import { BackupCollectMenu } from "@/components/backup-collect-menu";
import { getUserLocalStorageItem, setUserLocalStorageItem } from "@/lib/user-local-storage";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRef } from "react";
import { useLocale } from "@/contexts/locale-context";
import { useIntlayer } from 'react-intlayer';

interface DashboardTableProps {
  servers: ServerSummary[];
}

const DASHBOARD_SORT_KEY = 'dashboard-table-sort';

// Helper function to get notification icon
function getNotificationIcon(notificationEvent: NotificationEvent | undefined) {
  if (!notificationEvent) return null;
  
  switch (notificationEvent) {
    case 'errors':
      return <MessageSquareMore className="h-4 w-4 text-red-400" />;
    case 'warnings':
      return <MessageSquareMore className="h-4 w-4 text-yellow-400" />;
    case 'all':
      return <MessageSquareMore className="h-4 w-4 text-blue-400" />;
    case 'off':
      return <MessageSquareOff className="h-4 w-4 text-gray-400" />;
    default:
      return null;
  }
}

// Helper function to get notification tooltip
function getNotificationTooltip(notificationEvent: NotificationEvent | undefined) {
  if (!notificationEvent) return '';
  
  switch (notificationEvent) {
    case 'errors':
      return <>Errors Only.<br/><br/><span className="text-xs text-muted-foreground">Click to configure.</span></>;
    case 'warnings':
      return <>Warnings & Errors.<br/><br/><span className="text-xs text-muted-foreground">Click to configure.</span></>;
    case 'all':
      return <>All Backups.<br/><br/><span className="text-xs text-muted-foreground">Click to configure.</span></>;
    case 'off':
      return <>Off.<br/>Click to configure.</>;
    default:
      return '';
  }
}

export function DashboardTable({ servers }: DashboardTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const { handleAvailableBackupsClick } = useAvailableBackupsModal();
  const currentUser = useCurrentUser();
  const content = useIntlayer('dashboard-table');
  const common = useIntlayer('common');
  
  // Initialize with persisted sort config from localStorage
  // We'll load user-specific config after user is available
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: 'asc' });
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedUserConfigRef = useRef(false);

  // Load user-specific sort config when user is available
  useEffect(() => {
    if (typeof window === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoaded(true);
      return;
    }

    if (currentUser === null || hasLoadedUserConfigRef.current) {
      // User not loaded yet, or already loaded config
      if (currentUser === null) {
        return;
      }
      // Already loaded, mark as loaded
      if (!isLoaded) {
        setIsLoaded(true);
      }
      return;
    }

    // User is available and we haven't loaded config yet
    hasLoadedUserConfigRef.current = true;
    try {
      const stored = getUserLocalStorageItem(DASHBOARD_SORT_KEY, currentUser.id);
      if (stored && stored.trim() !== '') {
        const parsed = JSON.parse(stored);
        // Validate the stored data
        if (parsed && typeof parsed.column === 'string' && 
            (parsed.direction === 'asc' || parsed.direction === 'desc')) {
          // Load user-specific config - this is necessary for per-user settings
          setSortConfig(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load dashboard sort config:', error);
    }
    setIsLoaded(true);
  }, [currentUser, isLoaded]);

  // Convert ServerSummary to table-compatible format
  const tableData = useMemo(() => {
    const flattenedData = [];
    
    for (const server of servers) {
      for (const backup of server.backupInfo) {
        flattenedData.push({
          id: `${server.id}-${backup.name}`,
          serverId: server.id,
          name: server.name,
          alias: server.alias,
          displayName: server.alias || server.name, // Computed field for sorting
          note: server.note,
          backupName: backup.name,
          lastBackupListCount: backup.lastBackupListCount || 0,
          backupCount: backup.backupCount,
          lastBackupDate: backup.lastBackupDate,
          lastBackupId: backup.lastBackupId,
          lastBackupStatus: backup.lastBackupStatus,
          isBackupOverdue: backup.isBackupOverdue,
          expectedBackupElapsed: backup.expectedBackupElapsed,
          lastOverdueCheck: server.lastOverdueCheck,
          expectedBackupDate: backup.expectedBackupDate,
          lastNotificationSent: backup.lastNotificationSent,
          lastBackupDuration: backup.lastBackupDuration,
          warnings: backup.warnings || 0,
          errors: backup.errors || 0,
          notificationEvent: backup.notificationEvent as NotificationEvent | undefined,
          availableBackups: backup.availableBackups || [],
          server_url: server.server_url
        });
      }
    }
    
    return flattenedData;
  }, [servers]);

  // Column configuration for sorting
  const columnConfig = useMemo(() => ({
    name: { type: 'text' as const, path: 'displayName' },
    backupName: { type: 'text' as const, path: 'backupName' },
    isBackupOverdue: { type: 'date' as const, path: 'expectedBackupDate' },
    lastBackupListCount: { type: 'number' as const, path: 'lastBackupListCount' },
    backupCount: { type: 'number' as const, path: 'backupCount' },
    lastBackupDate: { type: 'date' as const, path: 'lastBackupDate' },
    lastBackupStatus: { type: 'status' as const, path: 'lastBackupStatus' },
    lastBackupDuration: { type: 'duration' as const, path: 'lastBackupDuration' },
    warnings: { type: 'number' as const, path: 'warnings' },
    errors: { type: 'number' as const, path: 'errors' },
    notification: { type: 'notificationEvent' as const, path: 'notificationEvent' },
    server_url: { type: 'serverUrl' as const, path: 'server_url' }
  }), []);

  // Persist sort configuration to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && sortConfig.column && currentUser) {
      try {
        setUserLocalStorageItem(DASHBOARD_SORT_KEY, currentUser.id, JSON.stringify(sortConfig));
      } catch (error) {
        console.warn('Failed to save dashboard sort config:', error);
      }
    }
  }, [sortConfig, isLoaded, currentUser]);

  // Sort servers based on current sort configuration
  const sortedServers = useMemo(() => {
    return createSortedArray(tableData, sortConfig, columnConfig);
  }, [tableData, sortConfig, columnConfig]);

  const handleSort = (column: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.column === column) {
        // Toggle direction for the same column
        return {
          column,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // New column - use descending for dates, ascending for others
        const isDateColumn = column === 'lastBackupDate';
        return {
          column,
          direction: isDateColumn ? 'desc' : 'asc'
        };
      }
    });
  };

  const handleServerNameClick = (serverId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    router.push(`/${locale}/detail/${serverId}`);
  };

  const handleRowClick = (serverId: string, backupName: string | null) => {
    const queryParams = new URLSearchParams();
    if (backupName) {
      queryParams.set('backup', backupName);
    }
    router.push(`/${locale}/detail/${serverId}?${queryParams.toString()}`);
  };

  const handleStatusBadgeClick = (serverId: string, backupId: string | null, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    if (backupId) {
      router.push(`/${locale}/detail/${serverId}/backup/${backupId}`);
    }
  };

  const handleNotificationIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    // Navigate to settings page with backup notifications tab active
    router.push(`/${locale}/settings?tab=notifications`);
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead column="name" sortConfig={sortConfig} onSort={handleSort}>
                  {content.servers.serverName.value}
                </SortableTableHead>
              <SortableTableHead column="backupName" sortConfig={sortConfig} onSort={handleSort}>
                  {content.servers.backupName.value}
                </SortableTableHead>
                <SortableTableHead column="isBackupOverdue" sortConfig={sortConfig} onSort={handleSort} align="center">
                  {(() => {
                    const overdueNextRun = content.servers.overdueNextRun.value;
                    if (typeof overdueNextRun !== 'string') {
                      return overdueNextRun || '';
                    }
                    const parts = overdueNextRun.split(' / ');
                    return parts.length === 2 ? (
                      <>{parts[0]} / <span className="text-green-500">{content.nextRun.value}</span></>
                    ) : (
                      overdueNextRun
                    );
                  })()}
                </SortableTableHead>
                <SortableTableHead column="lastBackupListCount" sortConfig={sortConfig} onSort={handleSort} align="center">
                  {content.servers.availableVersions.value}
                </SortableTableHead>
                <SortableTableHead column="backupCount" sortConfig={sortConfig} onSort={handleSort} align="center">
                  {content.servers.backupCount.value}
                </SortableTableHead>
                <SortableTableHead column="lastBackupDate" sortConfig={sortConfig} onSort={handleSort}>
                  {content.servers.lastBackupDate.value}
                </SortableTableHead>
                <SortableTableHead column="lastBackupStatus" sortConfig={sortConfig} onSort={handleSort}>
                  {content.servers.lastBackupStatus.value}
                </SortableTableHead>
                <SortableTableHead column="lastBackupDuration" sortConfig={sortConfig} onSort={handleSort} align="right">
                  {content.backups.duration.value}
                </SortableTableHead>
                <SortableTableHead column="warnings" sortConfig={sortConfig} onSort={handleSort} align="center">
                  {content.backups.warnings.value}
                </SortableTableHead>
                <SortableTableHead column="errors" sortConfig={sortConfig} onSort={handleSort} align="center">
                  {content.backups.errors.value}
                </SortableTableHead>
                <SortableTableHead column="notification" sortConfig={sortConfig} onSort={handleSort} align="center">
                  {content.servers.settingsActions.value}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center h-24">
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center space-y-3">
                        <HardDrive className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-muted-foreground">{content.servers.noServersFound}</h3>
                          <p className="text-sm text-muted-foreground">
                            {content.servers.collectDataMessage}{" "}
                            <span className="inline-flex items-center">
                              <Download className="inline w-4 h-4 mx-1" aria-label={common.ui.download} />
                            </span>{" "}
                            {content.servers.collectBackupsLogs} in the toolbar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {sortedServers.map((server) => {              
                return (
                  <TableRow 
                    key={`${server.id} || 'no-backup'}`} 
                    onClick={() => handleRowClick(server.serverId, server.backupName)}
                    className={`cursor-pointer hover:bg-muted/50`}
                  >
                    <TableCell 
                      className="font-medium"
                      onClick={(e) => handleServerNameClick(server.serverId, e)}
                    >
                      <div>
                        <span title={server.alias ? server.name : undefined}>
                          {server.alias || server.name}
                        </span>
                        {server.note && (
                          <div className="text-xs text-muted-foreground">{server.note}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      {server.backupName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-left">
                      {server.isBackupOverdue ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-red-400 text-xs">⚠️ {server.expectedBackupDate !== "N/A" ? formatRelativeTime(server.expectedBackupDate, undefined, locale) : server.expectedBackupElapsed} {content.overdue.value}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div><span>{content.checked.value}</span> <span className="text-muted-foreground">{server.lastOverdueCheck !== "N/A" ? formatDateTime(server.lastOverdueCheck, locale) + " (" + formatRelativeTime(server.lastOverdueCheck, undefined, locale) + ")"  	 : "N/A"}</span></div>
                              <div><span>{content.lastBackupLabel.value}</span> <span className="text-muted-foreground">{server.lastBackupDate !== "N/A" ? formatDateTime(server.lastBackupDate, locale) + " (" + formatRelativeTime(server.lastBackupDate, undefined, locale) + ")" : "N/A"}</span></div>
                              <div><span>{content.expectedBackup.value}</span> <span className="text-muted-foreground">{server.expectedBackupDate !== "N/A" ? formatDateTime(server.expectedBackupDate, locale) + " (" + formatRelativeTime(server.expectedBackupDate, undefined, locale) + ")" : "N/A"}</span></div>
                              <div><span>{content.lastNotification.value}</span> <span className="text-muted-foreground">{server.lastNotificationSent !== "N/A" ? formatDateTime(server.lastNotificationSent, locale) + " (" + formatRelativeTime(server.lastNotificationSent, undefined, locale) + ")" : "N/A"}</span></div>

                              <div className="border-t pt-2 flex items-center gap-2">
                                <button 
                                  className="text-xs flex items-center gap-1 hover:text-blue-500 transition-colors px-2 py-1 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/${locale}/settings?tab=monitoring`);
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                  <span>{content.overdueConfiguration.value}</span>
                                </button>
                                <ServerConfigurationButton 
                                  className="text-xs !p-1" 
                                  variant="ghost"
                                  size="sm"
                                  serverName={server.name}
                                  serverAlias={server.alias}
                                  serverUrl={server.server_url}
                                  showText={true} 
                                />
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        server.expectedBackupDate !== "N/A" ? (
                          <div className="text-green-400 text-xs">
                            <div>{formatDateTime(server.expectedBackupDate, locale)}</div>
                            <div>{formatRelativeTime(server.expectedBackupDate, undefined, locale)}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <AvailableBackupsIcon
                        availableBackups={server.availableBackups}
                        currentBackupDate={server.lastBackupDate}
                        serverName={server.name}
                        serverAlias={server.alias}
                        serverNote={server.note}
                        backupName={server.backupName || 'N/A'}
                        onIconClick={handleAvailableBackupsClick}
                        count={server.lastBackupListCount}
                      />
                    </TableCell>
                    <TableCell className="text-center">{server.backupCount}</TableCell>
                    <TableCell>
                      {server.lastBackupDate !== "N/A" ? (
                        <>
                          <div>{formatDateTime(server.lastBackupDate, locale)}</div>
                          <div className="text-xs text-muted-foreground">{formatRelativeTime(server.lastBackupDate, undefined, locale)}
                          </div>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <div 
                        onClick={(e) => handleStatusBadgeClick(server.serverId, server.lastBackupId, e)}
                        className="cursor-pointer"
                      >
                        <StatusBadge status={server.lastBackupStatus} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{server.lastBackupDuration}</TableCell>
                    <TableCell className="text-center">{server.warnings}</TableCell>
                    <TableCell className="text-center">{server.errors}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-0">
                        <div className="h-9 px-3 flex items-center justify-center mr-1">
                          {server.notificationEvent && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div 
                                  onClick={handleNotificationIconClick}
                                  className="cursor-pointer inline-block"
                                >
                                  {getNotificationIcon(server.notificationEvent)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getNotificationTooltip(server.notificationEvent)}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <ServerConfigurationButton 
                          serverName={server.name}
                          serverAlias={server.alias}
                          serverUrl={server.server_url}
                          showText={false}
                          disabled={server.server_url === ''}
                          variant="ghost"
                          size="sm"
                        />
                        <BackupCollectMenu
                          preFilledServerId={server.serverId}
                          preFilledServerName={server.name}
                          preFilledServerUrl={server.server_url}
                          autoCollect={true}
                          size="sm"
                          variant="ghost"
                          showText={false}
                          disabled={server.server_url === ''}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {sortedServers.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <HardDrive className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-muted-foreground">{content.servers.noServersFound.value}</h3>
                  <p className="text-sm text-muted-foreground">
                    {content.servers.collectDataMessage.value}{" "}
                    <span className="inline-flex items-center">
                      <Download className="inline w-4 h-4 mx-1" aria-label={common.ui.download} />
                    </span>{" "}
                    {content.servers.collectBackupsLogs.value} in the toolbar.
                  </p>
                </div>
              </div>
            </div>
          )}
          {sortedServers.map((server) => (
            <Card key={`${server.id} || 'no-backup'}`} className="p-4">
              <div className="space-y-3">
                {/* Header with Server, Backup Name and Status */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div 
                    className="cursor-pointer flex-1"
                    onClick={(e) => handleServerNameClick(server.serverId, e)}
                  >
                    <div className="font-medium text-sm" title={server.alias ? server.name : undefined}>
                      {server.alias || server.name}
                    </div>
                    {server.note && (
                      <div className="text-xs text-muted-foreground">{server.note}</div>
                    )}
                    <div className="font-medium text-sm">{server.backupName || 'N/A'}</div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div 
                      onClick={(e) => handleStatusBadgeClick(server.serverId, server.lastBackupId, e)}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={server.lastBackupStatus} />
                    </div>
                    {server.isBackupOverdue ? (
                      <div className="text-red-400 text-xs">⚠️ {server.expectedBackupDate !== "N/A" ? formatRelativeTime(server.expectedBackupDate, undefined, locale) : server.expectedBackupElapsed} {content.overdue.value}</div>
                    ) : (
                      server.expectedBackupDate !== "N/A" && (
                        <div className="text-green-400 text-xs">
                          <div>{formatDateTime(server.expectedBackupDate, locale)}</div>
                          <div>{formatRelativeTime(server.expectedBackupDate, undefined, locale)}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Grid Layout - 2 columns × 3 rows */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Row 1 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{content.servers.availableVersions.value}</Label>
                    <div className="flex justify-start">
                      <AvailableBackupsIcon
                        availableBackups={server.availableBackups}
                        currentBackupDate={server.lastBackupDate}
                        serverName={server.name}
                        backupName={server.backupName || 'N/A'}
                        onIconClick={handleAvailableBackupsClick}
                        count={server.lastBackupListCount}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{content.servers.backupCount.value}</Label>
                    <div className="text-sm">{server.backupCount}</div>
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{content.lastBackup.value}</Label>
                    <div className="text-sm">
                      {server.lastBackupDate !== "N/A" ? (
                        <>
                          <div className="text-xs">{formatDate(server.lastBackupDate, locale)}</div>
                          <div className="text-xs text-muted-foreground">{formatRelativeTime(server.lastBackupDate, undefined, locale)}</div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">N/A</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{content.backups.duration.value}</Label>
                    <div className="text-sm">{server.lastBackupDuration}</div>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{content.backups.warnings.value}</Label>
                    <div className="text-sm">{server.warnings}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{content.backups.errors.value}</Label>
                    <div className="text-sm">{server.errors}</div>
                  </div>
                </div>

                {/* Settings Row */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{content.settings.value}</Label>
                  <div className="flex items-center gap-1">
                    <div className="h-9 px-3 flex items-center justify-center mr-1">
                      {server.notificationEvent ? (
                        <div 
                          onClick={handleNotificationIconClick}
                          className="cursor-pointer"
                        >
                          {getNotificationIcon(server.notificationEvent)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">{content.off.value}</div>
                      )}
                    </div>
                    <BackupCollectMenu
                      preFilledServerId={server.serverId}
                      preFilledServerName={server.name}
                      preFilledServerUrl={server.server_url}
                      autoCollect={true}
                      size="sm"
                      variant="ghost"
                      showText={false}
                      disabled={server.server_url === ''}
                    />
                    <ServerConfigurationButton 
                      serverName={server.name}
                      serverAlias={server.alias}
                      serverUrl={server.server_url}
                      showText={false}
                      disabled={server.server_url === ''}
                    />
                  </div>
                </div>

                {/* Overdue Information (if applicable) */}
                {server.isBackupOverdue && (
                  <div className="space-y-1 border-t pt-3">
                    <Label className="text-xs text-muted-foreground">{content.overdueDetails.value}</Label>
                    <div className="text-xs space-y-1">
                      <div><span className="font-medium">{content.checked.value}</span> <span className="text-muted-foreground">{server.lastOverdueCheck !== "N/A" ? formatDateTime(server.lastOverdueCheck, locale) + " (" + formatRelativeTime(server.lastOverdueCheck, undefined, locale) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">{content.lastBackupLabel.value}</span> <span className="text-muted-foreground">{server.lastBackupDate !== "N/A" ? formatDateTime(server.lastBackupDate, locale) + " (" + formatRelativeTime(server.lastBackupDate, undefined, locale) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">{content.expectedBackup.value}</span> <span className="text-muted-foreground">{server.expectedBackupDate !== "N/A" ? formatDateTime(server.expectedBackupDate, locale) + " (" + formatRelativeTime(server.expectedBackupDate, undefined, locale) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">{content.lastNotification.value}</span> <span className="text-muted-foreground">{server.lastNotificationSent !== "N/A" ? formatDateTime(server.lastNotificationSent, locale) + " (" + formatRelativeTime(server.lastNotificationSent, undefined, locale) + ")" : "N/A"}</span></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${locale}/settings?tab=monitoring`);
                        }}
                        className="flex-1"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        {content.overdueConfig.value}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Card Click Action */}
                <div className="border-t pt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRowClick(server.serverId, server.backupName)}
                    className="w-full"
                  >
                    {content.backups.viewDetails}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {/* AvailableBackupsModal is now rendered globally */}
      </div>
    </TooltipProvider>
  );
}


