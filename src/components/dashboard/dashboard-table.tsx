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
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { Eye } from "lucide-react";

interface DashboardTableProps {
  machines: MachineSummary[];
}

export function DashboardTable({ machines }: DashboardTableProps) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Machine Name</TableHead>
            <TableHead className="text-center">Backup Count</TableHead>
            <TableHead>Last Backup Status</TableHead>
            <TableHead>Last Backup Date</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="text-center">Warnings</TableHead>
            <TableHead className="text-center">Errors</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {machines.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                No machines found.
              </TableCell>
            </TableRow>
          )}
          {machines.map((machine) => (
            <TableRow key={machine.id}>
              <TableCell className="font-medium">
                <Link href={`/machines/${machine.id}`} className="hover:underline text-primary">
                  {machine.name}
                </Link>
              </TableCell>
              <TableCell className="text-center">{machine.backupCount}</TableCell>
              <TableCell>
                <StatusBadge status={machine.lastBackupStatus} />
              </TableCell>
              <TableCell>{new Date(machine.lastBackupDate).toLocaleString()}</TableCell>
              <TableCell className="text-right">{machine.lastBackupDuration}</TableCell>
              <TableCell className="text-center">{machine.totalWarnings}</TableCell>
              <TableCell className="text-center">{machine.totalErrors}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/machines/${machine.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
