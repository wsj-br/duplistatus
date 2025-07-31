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
      return 'Notifications: Errors Only';
    case 'warnings':
      return 'Notifications: Warnings & Errors';
    case 'all':
      return 'Notifications: All Backups';
    case 'off':
      return 'Notifications: Off';
    default:
      return '';
  }
}

export function DashboardTable({ machines }: DashboardTableProps) {
  const router = useRouter(); // Initialize router
  const { handleAvailableBackupsClick, AvailableBackupsModal } = useAvailableBackupsModal();
  
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

  // Column configuration for sorting
  const columnConfig = useMemo(() => ({
    name: { type: 'text' as const, path: 'name' },
    lastBackupName: { type: 'text' as const, path: 'lastBackupName' },
    lastBackupListCount: { type: 'number' as const, path: 'lastBackupListCount' },
    backupCount: { type: 'number' as const, path: 'backupCount' },
    lastBackupDate: { type: 'date' as const, path: 'lastBackupDate' },
    lastBackupStatus: { type: 'status' as const, path: 'lastBackupStatus' },
    lastBackupDuration: { type: 'duration' as const, path: 'lastBackupDuration' },
    totalWarnings: { type: 'number' as const, path: 'totalWarnings' },
    totalErrors: { type: 'number' as const, path: 'totalErrors' },
    notification: { type: 'notificationEvent' as const, path: 'notificationEvent' }
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
    return createSortedArray(machines, sortConfig, columnConfig);
  }, [machines, sortConfig, columnConfig]);

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
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead column="name" sortConfig={sortConfig} onSort={handleSort}>
                Machine Name
              </SortableTableHead>
              <SortableTableHead column="lastBackupName" sortConfig={sortConfig} onSort={handleSort}>
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
              <SortableTableHead column="totalWarnings" sortConfig={sortConfig} onSort={handleSort} align="center">
                Warnings
              </SortableTableHead>
              <SortableTableHead column="totalErrors" sortConfig={sortConfig} onSort={handleSort} align="center">
                Errors
              </SortableTableHead>
              <SortableTableHead column="notification" sortConfig={sortConfig} onSort={handleSort} align="center">
                Notification
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
                  key={`${machine.id}-${machine.lastBackupName || 'no-backup'}`} 
                  onClick={() => handleRowClick(machine.id, machine.lastBackupName)}
                  className={`cursor-pointer hover:bg-muted/50`}
                >
                  <TableCell 
                    className="font-medium"
                    onClick={(e) => handleMachineNameClick(machine.id, e)}
                  >
                    {machine.name}
                  </TableCell>
                  <TableCell className="text-left">
                    {machine.isBackupOverdue ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="text-left w-full">
                            <div className="font-medium">{machine.lastBackupName || 'N/A'}</div>
                            <div className="text-xs text-red-400">⚠️ {machine.expectedBackupElapsed} overdue</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <div><span>Checked:</span> <span className="text-muted-foreground">{machine.lastOverdueCheck !== "N/A" ? new Date(machine.lastOverdueCheck).toLocaleString() + " (" + formatTimeAgo(machine.lastOverdueCheck) + ")"  	 : "N/A"}</span></div>
                            <div><span>Last backup:</span> <span className="text-muted-foreground">{machine.lastBackupDate !== "N/A" ? new Date(machine.lastBackupDate).toLocaleString() + " (" + formatTimeAgo(machine.lastBackupDate) + ")" : "N/A"}</span></div>
                            <div><span>Expected backup:</span> <span className="text-muted-foreground">{machine.expectedBackupDate !== "N/A" ? new Date(machine.expectedBackupDate).toLocaleString() + " (" + formatTimeAgo(machine.expectedBackupDate) + ")" : "N/A"}</span></div>
                            <div className="pt-2 border-t">
                              <button 
                                className="text-xs cursor-pointer flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push('/settings?tab=backups');
                                }}
                              >
                              <Settings className="h-3 w-3 mr-1" /> Configure 
                              </button>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      ) : (
                        machine.lastBackupName || 'N/A'
                      )}
                  </TableCell>
                  <TableCell className="text-center">
                    <AvailableBackupsIcon
                      availableBackups={machine.availableBackups}
                      currentBackupDate={machine.lastBackupDate}
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
                      onClick={(e) => handleStatusBadgeClick(machine.id, machine.lastBackupId, e)}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={machine.lastBackupStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{machine.lastBackupDuration}</TableCell>
                  <TableCell className="text-center">{machine.totalWarnings}</TableCell>
                  <TableCell className="text-center">{machine.totalErrors}</TableCell>
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <AvailableBackupsModal />
      </div>
    </TooltipProvider>
  );
}

