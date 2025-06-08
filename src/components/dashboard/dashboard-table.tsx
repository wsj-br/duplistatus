// src/components/dashboard/dashboard-table.tsx
"use client";

import type { MachineSummary } from "@/lib/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useRouter } from "next/navigation"; // Import useRouter
import { formatTimeAgo } from "@/lib/utils"; // Import the new function

interface DashboardTableProps {
  machines: MachineSummary[];
}

export function DashboardTable({ machines }: DashboardTableProps) {
  const router = useRouter(); // Initialize router

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

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Machine Name</TableHead>
            <TableHead>Backup Name</TableHead>
            <TableHead className="text-center">Available Backup Versions</TableHead>
            <TableHead className="text-center">Backup Count</TableHead>
            <TableHead>Last Backup Date</TableHead>
            <TableHead>Last Backup Status</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="text-center">Warnings</TableHead>
            <TableHead className="text-center">Errors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {machines.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center h-24">
                No machines found.
              </TableCell>
            </TableRow>
          )}
          {machines.map((machine) => (
            <TableRow 
              key={`${machine.id}-${machine.lastBackupName || 'no-backup'}`} 
              onClick={() => handleRowClick(machine.id, machine.lastBackupName)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell 
                className="font-medium"
                onClick={(e) => handleMachineNameClick(machine.id, e)}
              >
                {machine.name}
              </TableCell>
              <TableCell>
                {machine.lastBackupName || 'N/A'}
              </TableCell>
              <TableCell className="text-center">
                {machine.lastBackupListCount !== null ? machine.lastBackupListCount.toLocaleString() : 'N/A'}
              </TableCell>
              <TableCell className="text-center">{machine.backupCount}</TableCell>
              <TableCell>
                {machine.lastBackupDate !== "N/A" ? (
                  <>
                    <div>{new Date(machine.lastBackupDate).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(machine.lastBackupDate)}
                    </div>
                  </>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={machine.lastBackupStatus} />
              </TableCell>
              <TableCell className="text-right">{machine.lastBackupDuration}</TableCell>
              <TableCell className="text-center">{machine.totalWarnings}</TableCell>
              <TableCell className="text-center">{machine.totalErrors}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

