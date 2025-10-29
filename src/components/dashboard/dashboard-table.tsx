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
  const router = useRouter(); // Initialize router
  const { handleAvailableBackupsClick } = useAvailableBackupsModal();
  
  // Initialize with persisted sort config from localStorage (lazy initialization)
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(DASHBOARD_SORT_KEY);
        if (stored && stored.trim() !== '') {
          const parsed = JSON.parse(stored);
          // Validate the stored data
          if (parsed && typeof parsed.column === 'string' && 
              (parsed.direction === 'asc' || parsed.direction === 'desc')) {
            return parsed;
          }
        }
      } catch (error) {
        console.warn('Failed to load dashboard sort config:', error);
      }
    }
    return { column: '', direction: 'asc' };
  });
  const [isLoaded, setIsLoaded] = useState(true);

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
    if (isLoaded && typeof window !== 'undefined' && sortConfig.column) {
      try {
        localStorage.setItem(DASHBOARD_SORT_KEY, JSON.stringify(sortConfig));
      } catch (error) {
        console.warn('Failed to save dashboard sort config:', error);
      }
    }
  }, [sortConfig, isLoaded]);

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
    router.push(`/detail/${serverId}`);
  };

  const handleRowClick = (serverId: string, backupName: string | null) => {
    const queryParams = new URLSearchParams();
    if (backupName) {
      queryParams.set('backup', backupName);
    }
    router.push(`/detail/${serverId}?${queryParams.toString()}`);
  };

  const handleStatusBadgeClick = (serverId: string, backupId: string | null, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    if (backupId) {
      router.push(`/detail/${serverId}/backup/${backupId}`);
    }
  };

  const handleNotificationIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    // Navigate to settings page with backup notifications tab active
    router.push('/settings?tab=notifications');
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
                  Server Name
                </SortableTableHead>
              <SortableTableHead column="backupName" sortConfig={sortConfig} onSort={handleSort}>
                  Backup Name
                </SortableTableHead>
                <SortableTableHead column="isBackupOverdue" sortConfig={sortConfig} onSort={handleSort} align="center">
                  Overdue / <span className="text-green-500">Next run</span>
                </SortableTableHead>
                <SortableTableHead column="lastBackupListCount" sortConfig={sortConfig} onSort={handleSort} align="center">
                  Available Versions
                </SortableTableHead>
                <SortableTableHead column="backupCount" sortConfig={sortConfig} onSort={handleSort} align="center">
                  Backup Count
                </SortableTableHead>
                <SortableTableHead column="lastBackupDate" sortConfig={sortConfig} onSort={handleSort}>
                  Last Backup Date
                </SortableTableHead>
                <SortableTableHead column="lastBackupStatus" sortConfig={sortConfig} onSort={handleSort}>
                  Last Backup Status
                </SortableTableHead>
                <SortableTableHead column="lastBackupDuration" sortConfig={sortConfig} onSort={handleSort} align="right">
                  Duration
                </SortableTableHead>
                <SortableTableHead column="warnings" sortConfig={sortConfig} onSort={handleSort} align="center">
                  Warnings
                </SortableTableHead>
                <SortableTableHead column="errors" sortConfig={sortConfig} onSort={handleSort} align="center">
                  Errors
                </SortableTableHead>
                <SortableTableHead column="notification" sortConfig={sortConfig} onSort={handleSort} align="center">
                  Settings/Actions
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
                          <h3 className="text-lg font-semibold text-muted-foreground">No servers found</h3>
                          <p className="text-sm text-muted-foreground">
                            Collect data for your first server by clicking on{" "}
                            <span className="inline-flex items-center">
                              <Download className="inline w-4 h-4 mx-1" aria-label="Download" />
                            </span>{" "}
                            (Collect backups logs) in the toolbar.
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
                            <div className="text-red-400 text-xs">⚠️ {server.expectedBackupElapsed} overdue</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div><span>Checked:</span> <span className="text-muted-foreground">{server.lastOverdueCheck !== "N/A" ? new Date(server.lastOverdueCheck).toLocaleString() + " (" + formatRelativeTime(server.lastOverdueCheck) + ")"  	 : "N/A"}</span></div>
                              <div><span>Last backup:</span> <span className="text-muted-foreground">{server.lastBackupDate !== "N/A" ? new Date(server.lastBackupDate).toLocaleString() + " (" + formatRelativeTime(server.lastBackupDate) + ")" : "N/A"}</span></div>
                              <div><span>Expected backup:</span> <span className="text-muted-foreground">{server.expectedBackupDate !== "N/A" ? new Date(server.expectedBackupDate).toLocaleString() + " (" + formatRelativeTime(server.expectedBackupDate) + ")" : "N/A"}</span></div>
                              <div><span>Last notification:</span> <span className="text-muted-foreground">{server.lastNotificationSent !== "N/A" ? new Date(server.lastNotificationSent).toLocaleString() + " (" + formatRelativeTime(server.lastNotificationSent) + ")" : "N/A"}</span></div>

                              <div className="border-t pt-2 flex items-center gap-2">
                                <button 
                                  className="text-xs flex items-center gap-1 hover:text-blue-500 transition-colors px-2 py-1 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push('/settings?tab=overdue');
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                  <span>Overdue configuration</span>
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
                            <div>{new Date(server.expectedBackupDate).toLocaleString()}</div>
                            <div>{formatRelativeTime(server.expectedBackupDate)}</div>
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
                          <div>{new Date(server.lastBackupDate).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{formatRelativeTime(server.lastBackupDate)}
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
                  <h3 className="text-lg font-semibold text-muted-foreground">No servers found</h3>
                  <p className="text-sm text-muted-foreground">
                    Collect data for your first server by clicking on{" "}
                    <span className="inline-flex items-center">
                      <Download className="inline w-4 h-4 mx-1" aria-label="Download" />
                    </span>{" "}
                    (Collect backups logs) in the toolbar.
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
                      <div className="text-red-400 text-xs">⚠️ {server.expectedBackupElapsed} overdue</div>
                    ) : (
                      server.expectedBackupDate !== "N/A" && (
                        <div className="text-green-400 text-xs">
                          <div>{new Date(server.expectedBackupDate).toLocaleString()}</div>
                          <div>{formatRelativeTime(server.expectedBackupDate)}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Grid Layout - 2 columns × 3 rows */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Row 1 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Available Versions</Label>
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
                    <Label className="text-xs text-muted-foreground">Backup Count</Label>
                    <div className="text-sm">{server.backupCount}</div>
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Last Backup</Label>
                    <div className="text-sm">
                      {server.lastBackupDate !== "N/A" ? (
                        <>
                          <div className="text-xs">{new Date(server.lastBackupDate).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{formatRelativeTime(server.lastBackupDate)}</div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">N/A</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Duration</Label>
                    <div className="text-sm">{server.lastBackupDuration}</div>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Warnings</Label>
                    <div className="text-sm">{server.warnings}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Errors</Label>
                    <div className="text-sm">{server.errors}</div>
                  </div>
                </div>

                {/* Settings Row */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Settings</Label>
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
                        <div className="text-xs text-muted-foreground">Off</div>
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
                    <Label className="text-xs text-muted-foreground">Overdue Details</Label>
                    <div className="text-xs space-y-1">
                      <div><span className="font-medium">Checked:</span> <span className="text-muted-foreground">{server.lastOverdueCheck !== "N/A" ? new Date(server.lastOverdueCheck).toLocaleString() + " (" + formatRelativeTime(server.lastOverdueCheck) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">Last backup:</span> <span className="text-muted-foreground">{server.lastBackupDate !== "N/A" ? new Date(server.lastBackupDate).toLocaleString() + " (" + formatRelativeTime(server.lastBackupDate) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">Expected backup:</span> <span className="text-muted-foreground">{server.expectedBackupDate !== "N/A" ? new Date(server.expectedBackupDate).toLocaleString() + " (" + formatRelativeTime(server.expectedBackupDate) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">Last notification:</span> <span className="text-muted-foreground">{server.lastNotificationSent !== "N/A" ? new Date(server.lastNotificationSent).toLocaleString() + " (" + formatRelativeTime(server.lastNotificationSent) + ")" : "N/A"}</span></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/settings?tab=overdue');
                        }}
                        className="flex-1"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Overdue Config
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
                    View Details
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


