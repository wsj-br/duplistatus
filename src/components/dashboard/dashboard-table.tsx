// src/components/dashboard/dashboard-table.tsx
"use client";

import type { MachineSummary } from "@/lib/types";
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
import { formatTimeAgo } from "@/lib/utils"; // Import the new function
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { createSortedArray, type SortConfig } from "@/lib/sort-utils";
import { useAvailableBackupsModal, AvailableBackupsIcon } from "@/components/ui/available-backups-modal";
import { MessageSquareMore, MessageSquareOff, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServerConfigurationButton } from "@/components/ui/server-configuration-button";

interface DashboardTableProps {
  machines: MachineSummary[];
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
      return <>Errors Only.<br /><br /><span className="text-xs text-muted-foreground">Click to configure.</span></>;
    case 'warnings':
      return <>Warnings & Errors.<br /><br /><span className="text-xs text-muted-foreground">Click to configure.</span></>;
    case 'all':
      return <>All Backups.<br /><br /><span className="text-xs text-muted-foreground">Click to configure.</span></>;
    case 'off':
      return <>Off.<br />Click to configure.</>;
    default:
      return '';
  }
}

export function DashboardTable({ machines }: DashboardTableProps) {
  const router = useRouter(); // Initialize router
  const { handleAvailableBackupsClick } = useAvailableBackupsModal();
  
  // Initialize with default state to match server rendering
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: 'asc' });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted sort config after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(DASHBOARD_SORT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate the stored data
          if (parsed && typeof parsed.column === 'string' && 
              (parsed.direction === 'asc' || parsed.direction === 'desc')) {
            setSortConfig(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load dashboard sort config:', error);
      }
      setIsLoaded(true);
    }
  }, []);

  // Convert MachineSummary to table-compatible format
  const tableData = useMemo(() => {
    const flattenedData = [];
    
    for (const machine of machines) {
      for (const backup of machine.backupInfo) {
        flattenedData.push({
          id: `${machine.id}-${backup.name}`,
          machineId: machine.id,
          name: machine.name,
          backupName: backup.name,
          lastBackupListCount: backup.lastBackupListCount || 0,
          backupCount: backup.backupCount,
          lastBackupDate: backup.lastBackupDate,
          lastBackupId: backup.lastBackupId,
          lastBackupStatus: backup.lastBackupStatus,
          isBackupOverdue: backup.isBackupOverdue,
          expectedBackupElapsed: backup.expectedBackupElapsed,
          lastOverdueCheck: machine.lastOverdueCheck,
          expectedBackupDate: backup.expectedBackupDate,
          lastNotificationSent: backup.lastNotificationSent,
          lastBackupDuration: backup.lastBackupDuration,
          warnings: backup.warnings || 0,
          errors: backup.errors || 0,
          notificationEvent: backup.notificationEvent as NotificationEvent | undefined,
          availableBackups: backup.availableBackups || [],
          server_url: machine.server_url
        });
      }
    }
    
    return flattenedData;
  }, [machines]);

  // Column configuration for sorting
  const columnConfig = useMemo(() => ({
    name: { type: 'text' as const, path: 'name' },
    backupName: { type: 'text' as const, path: 'backupName' },
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

  // Sort machines based on current sort configuration
  const sortedMachines = useMemo(() => {
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

  const handleMachineNameClick = (machineId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    router.push(`/detail/${machineId}`);
  };

  const handleRowClick = (machineId: string, backupName: string | null) => {
    const queryParams = new URLSearchParams();
    if (backupName) {
      queryParams.set('backup', backupName);
    }
    router.push(`/detail/${machineId}?${queryParams.toString()}`);
  };

  const handleStatusBadgeClick = (machineId: string, backupId: string | null, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    if (backupId) {
      router.push(`/detail/${machineId}/backup/${backupId}`);
    }
  };

  const handleNotificationIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    // Navigate to settings page with backup notifications tab active
    router.push('/settings?tab=backups');
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
                  Machine Name
                </SortableTableHead>
              <SortableTableHead column="backupName" sortConfig={sortConfig} onSort={handleSort}>
                  Backup Name
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
                  Notification
                </SortableTableHead>
                <SortableTableHead column="server_url" sortConfig={sortConfig} onSort={handleSort} align="center">
                  Duplicati configuration
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMachines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center h-24">
                    No machines found.
                  </TableCell>
                </TableRow>
              )}
              {sortedMachines.map((machine) => {              
                return (
                  <TableRow 
                    key={`${machine.id} || 'no-backup'}`} 
                    onClick={() => handleRowClick(machine.machineId, machine.backupName)}
                    className={`cursor-pointer hover:bg-muted/50`}
                  >
                    <TableCell 
                      className="font-medium"
                      onClick={(e) => handleMachineNameClick(machine.machineId, e)}
                    >
                      <div>
                        {machine.name}
                        <div className="text-xs text-muted-foreground">({machine.machineId})</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      {machine.isBackupOverdue ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-left w-full">
                              <div className="font-medium">{machine.backupName || 'N/A'}</div>
                              <div className="text-xs text-red-400">⚠️ {machine.expectedBackupElapsed} overdue</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div><span>Checked:</span> <span className="text-muted-foreground">{machine.lastOverdueCheck !== "N/A" ? new Date(machine.lastOverdueCheck).toLocaleString() + " (" + formatTimeAgo(machine.lastOverdueCheck) + ")"  	 : "N/A"}</span></div>
                              <div><span>Last backup:</span> <span className="text-muted-foreground">{machine.lastBackupDate !== "N/A" ? new Date(machine.lastBackupDate).toLocaleString() + " (" + formatTimeAgo(machine.lastBackupDate) + ")" : "N/A"}</span></div>
                              <div><span>Expected backup:</span> <span className="text-muted-foreground">{machine.expectedBackupDate !== "N/A" ? new Date(machine.expectedBackupDate).toLocaleString() + " (" + formatTimeAgo(machine.expectedBackupDate) + ")" : "N/A"}</span></div>
                              <div><span>Last notification:</span> <span className="text-muted-foreground">{machine.lastNotificationSent !== "N/A" ? new Date(machine.lastNotificationSent).toLocaleString() + " (" + formatTimeAgo(machine.lastNotificationSent) + ")" : "N/A"}</span></div>

                              <div className="border-t pt-2 flex items-center gap-2">
                                <button 
                                  className="text-xs flex items-center gap-1 hover:text-blue-500 transition-colors px-2 py-1 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push('/settings?tab=backups');
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                  <span>Overdue configuration</span>
                                </button>
                                <ServerConfigurationButton 
                                  className="text-xs !p-1" 
                                  variant="ghost"
                                  size="sm"
                                  machineName={machine.name}
                                  serverUrl={machine.server_url} 
                                  showText={true} 
                                />
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        ) : (
                          machine.backupName || 'N/A'
                        )}
                    </TableCell>
                    <TableCell className="text-center">
                      <AvailableBackupsIcon
                        availableBackups={machine.availableBackups}
                        currentBackupDate={machine.lastBackupDate}
                        machineName={machine.name}
                        backupName={machine.backupName || 'N/A'}
                        onIconClick={handleAvailableBackupsClick}
                        count={machine.lastBackupListCount}
                      />
                    </TableCell>
                    <TableCell className="text-center">{machine.backupCount}</TableCell>
                    <TableCell>
                      {machine.lastBackupDate !== "N/A" ? (
                        <>
                          <div>{new Date(machine.lastBackupDate).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{formatTimeAgo(machine.lastBackupDate)}
                          </div>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <div 
                        onClick={(e) => handleStatusBadgeClick(machine.machineId, machine.lastBackupId, e)}
                        className="cursor-pointer"
                      >
                        <StatusBadge status={machine.lastBackupStatus} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{machine.lastBackupDuration}</TableCell>
                    <TableCell className="text-center">{machine.warnings}</TableCell>
                    <TableCell className="text-center">{machine.errors}</TableCell>
                    <TableCell className="text-center">
                      {machine.notificationEvent && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div 
                              onClick={handleNotificationIconClick}
                              className="cursor-pointer inline-block"
                            >
                              {getNotificationIcon(machine.notificationEvent)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getNotificationTooltip(machine.notificationEvent)}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <ServerConfigurationButton 
                        machineName={machine.name}
                        serverUrl={machine.server_url} 
                        showText={false}
                        disabled={machine.server_url === ''}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {sortedMachines.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No machines found.
            </div>
          )}
          {sortedMachines.map((machine) => (
            <Card key={`${machine.id} || 'no-backup'}`} className="p-4">
              <div className="space-y-3">
                {/* Header with Machine, Backup Name and Status */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div 
                    className="cursor-pointer flex-1"
                    onClick={(e) => handleMachineNameClick(machine.machineId, e)}
                  >
                    <div className="font-medium text-sm">{machine.name}</div>
                    <div className="text-xs text-muted-foreground">({machine.machineId})</div>
                    <div className="font-medium text-sm">{machine.backupName || 'N/A'}</div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div 
                      onClick={(e) => handleStatusBadgeClick(machine.machineId, machine.lastBackupId, e)}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={machine.lastBackupStatus} />
                    </div>
                    {machine.isBackupOverdue && (
                      <div className="text-red-400 text-xs">⚠️ {machine.expectedBackupElapsed} overdue</div>
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
                        availableBackups={machine.availableBackups}
                        currentBackupDate={machine.lastBackupDate}
                        machineName={machine.name}
                        backupName={machine.backupName || 'N/A'}
                        onIconClick={handleAvailableBackupsClick}
                        count={machine.lastBackupListCount}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Backup Count</Label>
                    <div className="text-sm">{machine.backupCount}</div>
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Last Backup</Label>
                    <div className="text-sm">
                      {machine.lastBackupDate !== "N/A" ? (
                        <>
                          <div className="text-xs">{new Date(machine.lastBackupDate).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{formatTimeAgo(machine.lastBackupDate)}</div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">N/A</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Duration</Label>
                    <div className="text-sm">{machine.lastBackupDuration}</div>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Warnings</Label>
                    <div className="text-sm">{machine.warnings}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Errors</Label>
                    <div className="text-sm">{machine.errors}</div>
                  </div>
                </div>

                {/* Additional Info Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Notification</Label>
                    <div className="flex justify-start">
                      {machine.notificationEvent ? (
                        <div 
                          onClick={handleNotificationIconClick}
                          className="cursor-pointer"
                        >
                          {getNotificationIcon(machine.notificationEvent)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Off</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Duplicati Config</Label>
                    <div className="flex justify-start">
                      <ServerConfigurationButton 
                        machineName={machine.name}
                        serverUrl={machine.server_url} 
                        showText={false}
                        disabled={machine.server_url === ''}
                      />
                    </div>
                  </div>
                </div>

                {/* Overdue Information (if applicable) */}
                {machine.isBackupOverdue && (
                  <div className="space-y-1 border-t pt-3">
                    <Label className="text-xs text-muted-foreground">Overdue Details</Label>
                    <div className="text-xs space-y-1">
                      <div><span className="font-medium">Checked:</span> <span className="text-muted-foreground">{machine.lastOverdueCheck !== "N/A" ? new Date(machine.lastOverdueCheck).toLocaleString() + " (" + formatTimeAgo(machine.lastOverdueCheck) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">Last backup:</span> <span className="text-muted-foreground">{machine.lastBackupDate !== "N/A" ? new Date(machine.lastBackupDate).toLocaleString() + " (" + formatTimeAgo(machine.lastBackupDate) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">Expected backup:</span> <span className="text-muted-foreground">{machine.expectedBackupDate !== "N/A" ? new Date(machine.expectedBackupDate).toLocaleString() + " (" + formatTimeAgo(machine.expectedBackupDate) + ")" : "N/A"}</span></div>
                      <div><span className="font-medium">Last notification:</span> <span className="text-muted-foreground">{machine.lastNotificationSent !== "N/A" ? new Date(machine.lastNotificationSent).toLocaleString() + " (" + formatTimeAgo(machine.lastNotificationSent) + ")" : "N/A"}</span></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/settings?tab=backups');
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
                    onClick={() => handleRowClick(machine.machineId, machine.backupName)}
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


