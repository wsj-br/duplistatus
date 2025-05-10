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

interface MachineBackupTableProps {
  backups: Backup[];
  itemsPerPage?: number;
}

export function MachineBackupTable({ backups, itemsPerPage = 10 }: MachineBackupTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(backups.length / itemsPerPage);
  const paginatedBackups = backups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                <TableCell>{new Date(backup.date).toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={backup.status} />
                </TableCell>
                <TableCell className="text-center">{backup.warnings}</TableCell>
                <TableCell className="text-center">{backup.errors}</TableCell>
                <TableCell className="text-right">{backup.fileCount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{backup.fileSize}</TableCell>
                <TableCell className="text-right">{backup.uploadedSize}</TableCell>
                <TableCell className="text-right">{backup.duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
