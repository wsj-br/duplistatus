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
  TableHead,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useRouter } from "next/navigation"; // Import useRouter
import { formatTimeAgo } from "@/lib/utils"; // Import the new function
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { createSortedArray, type SortConfig } from "@/lib/sort-utils";
import { useAvailableBackupsModal, AvailableBackupsIcon } from "@/components/ui/available-backups-modal";
import { MessageSquareMore, MessageSquareOff } from "lucide-react";

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
          lastBackupStatus: backup.lastBackupStatus,
          lastBackupDuration: backup.lastBackupDuration,
          warnings: backup.warnings || 0,
          errors: backup.errors || 0,
          notificationEvent: backup.notificationEvent as NotificationEvent | undefined,
          availableBackups: backup.availableBackups || []
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
    notification: { type: 'notificationEvent' as const, path: 'notificationEvent' }
  }), []);

  // Persist sort configuration to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (isLoaded && sortConfig.column) {
      localStorage.setItem(DASHBOARD_SORT_KEY, JSON.stringify(sortConfig));
    }
  }, [sortConfig, isLoaded]);

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.column) return tableData;
    return createSortedArray(tableData, sortConfig, columnConfig);
  }, [tableData, sortConfig, columnConfig]);

  const handleStatusBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    // Navigate to settings page with backup notifications tab active
    router.push('/settings?tab=backups');
  };

  const handleNotificationIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click from firing
    // Navigate to settings page with backup notifications tab active
    router.push('/settings?tab=backups');
  };

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
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
            <TableHead className="text-center">
              Warnings
            </TableHead>
            <TableHead className="text-center">
              Errors
            </TableHead>
            <SortableTableHead column="notification" sortConfig={sortConfig} onSort={handleSort} align="center">
              Notification
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((machine) => (
            <TableRow 
              key={machine.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/detail/${machine.machineId}`)}
            >
              <TableCell className="font-medium">
                {machine.name}
              </TableCell>
              <TableCell>
                {machine.backupName}
              </TableCell>
              <TableCell className="text-center">
                {machine.lastBackupListCount > 0 ? (
                  <AvailableBackupsIcon
                    availableBackups={machine.availableBackups}
                    currentBackupDate={machine.lastBackupDate}
                    machineName={machine.name}
                    backupName={machine.backupName}
                    onIconClick={handleAvailableBackupsClick}
                    count={machine.lastBackupListCount}
                  />
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell className="text-center">
                {machine.backupCount}
              </TableCell>
              <TableCell>
                {machine.lastBackupDate !== "N/A" 
                  ? formatTimeAgo(machine.lastBackupDate)
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div 
                  className="cursor-pointer"
                  onClick={handleStatusBadgeClick}
                >
                  <StatusBadge status={machine.lastBackupStatus} />
                </div>
              </TableCell>
              <TableCell className="text-right">
                {machine.lastBackupDuration !== "N/A" 
                  ? machine.lastBackupDuration
                  : "N/A"}
              </TableCell>
              <TableCell className="text-center">
                {machine.warnings > 0 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {machine.warnings}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {machine.errors > 0 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {machine.errors}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div 
                  className="cursor-pointer inline-block"
                  onClick={handleNotificationIconClick}
                >
                  {getNotificationIcon(machine.notificationEvent)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

