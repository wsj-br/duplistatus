"use client";

import type { Backup } from "@/lib/types";
import React, { useState, useEffect } from "react";
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
import { formatBytes } from "@/lib/utils";
import { useConfig } from "@/contexts/config-context";
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const router = useRouter();

  // Reset to first page when table page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tablePageSize]);

  // Reset to first page when backups data changes (e.g. after deletion)
  useEffect(() => {
    setCurrentPage(1);
  }, [backups.length]);
  
  // Ensure current page is valid when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const parseJsonArray = (jsonString: string | null): string[] => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const hasNoMessages = (backup: Backup): boolean => {
    const messages = parseJsonArray(backup.messages_array);
    const warnings = parseJsonArray(backup.warnings_array);
    const errors = parseJsonArray(backup.errors_array);
    
    return messages.length === 0 && warnings.length === 0 && errors.length === 0;
  };

  const handleBackupClick = (backup: Backup) => {
    // Only navigate if there are messages to show
    if (!hasNoMessages(backup)) {
      router.push(`/detail/${backup.machine_id}/backup/${backup.id}`);
    }
  };

  return (
    <TooltipProvider>
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
              <TableHead className="text-center">Available Versions</TableHead>
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
                <TableCell colSpan={11} className="text-center h-24">
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
                    {formatDistanceToNow(new Date(backup.date), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell>
                  {hasNoMessages(backup) ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger>
                        <div className="cursor-default">
                          <StatusBadge status={backup.status} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <p>No messages were received for this backup.</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div 
                      onClick={() => handleBackupClick(backup)}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={backup.status} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">{backup.warnings}</TableCell>
                <TableCell className="text-center">{backup.errors}</TableCell>
                <TableCell className="text-center">
                  {backup.backup_list_count !== null ? backup.backup_list_count.toLocaleString() : 'N/A'}
                </TableCell>
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
    </TooltipProvider>
  );
}

