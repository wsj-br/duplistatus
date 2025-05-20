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

  const handleRowClick = (machineId: string) => {
    router.push(`/detail/${machineId}`);
  };

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Machine Name</TableHead>
            <TableHead className="text-center">Available Backup Versions</TableHead>
            <TableHead className="text-center">Backup Count</TableHead>
            <TableHead>Last Backup Date</TableHead>
            <TableHead>Last Backup Status</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="text-center">Warnings</TableHead>
            <TableHead className="text-center">Errors</TableHead>
            {/* Removed Actions TableHead */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {machines.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24"> {/* Adjusted colSpan */}
                No machines found.
              </TableCell>
            </TableRow>
          )}
          {machines.map((machine) => (
            <TableRow 
              key={machine.id} 
              onClick={() => handleRowClick(machine.id)} // Add onClick handler
              className="cursor-pointer hover:bg-muted/50" // Add cursor and hover effect
            >
              <TableCell className="font-medium">
                {machine.name} {/* Removed Link component */}
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
              {/* Removed TableCell for actions */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

