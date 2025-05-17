"use client";

import type { Backup } from "@/lib/types";
import React, { useState } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatBytes, formatTimeAgo } from "@/lib/utils";
import { useConfig } from "@/contexts/config-context";

interface MachineBackupTableProps {
  backups: Backup[];
}

export function MachineBackupTable({ backups }: MachineBackupTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { tablePageSize } = useConfig();
  const totalPages = Math.ceil(backups.length / tablePageSize);
  const paginatedBackups = backups.slice(
    (currentPage - 1) * tablePageSize,
    currentPage * tablePageSize
  );

  // Reset to first page when table page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [tablePageSize]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Backup Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Warnings</TableHead>
              <TableHead className="text-center">Errors</TableHead>
              <TableHead className="text-right">File Count</TableHead>
              <TableHead className="text-right">File Size</TableHead>
              <TableHead className="text-right">Uploaded Size</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Storage Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBackups.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24">
                  No backups found for this machine.
                </TableCell>
              </TableRow>
            )}
            {paginatedBackups.map((backup) => (
              <TableRow key={backup.id}>
                <TableCell className="font-medium">{backup.name}</TableCell>
                <TableCell>
                  <div>{new Date(backup.date).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(backup.date)}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={backup.status} />
                </TableCell>
                <TableCell className="text-center">{backup.warnings}</TableCell>
                <TableCell className="text-center">{backup.errors}</TableCell>
                <TableCell className="text-right">{backup.fileCount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatBytes(backup.fileSize)}</TableCell>
                <TableCell className="text-right">{formatBytes(backup.uploadedSize)}</TableCell>
                <TableCell className="text-right">{backup.duration}</TableCell>
                <TableCell className="text-right">{formatBytes(backup.knownFileSize)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

