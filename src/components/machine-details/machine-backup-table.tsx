"use client";

import type { Backup } from "@/lib/types";
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useConfig } from "@/contexts/config-context";
import { useBackupSelection } from "@/contexts/backup-selection-context";
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { createSortedArray, type SortConfig } from "@/lib/sort-utils";

interface MachineBackupTableProps {
  backups: Backup[];
}

export function MachineBackupTable({ backups }: MachineBackupTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: 'asc' });
  const { selectedBackup, setSelectedBackup } = useBackupSelection();
  const { tablePageSize } = useConfig();

  // Get unique backup names for the filter
  const uniqueBackupNames = ["all", ...new Set(backups.map(backup => backup.name))];

  // Sort, filter, and paginate backups
  const sortedFilteredPaginatedBackups = useMemo(() => {
    // Column configuration for sorting
    const columnConfig = {
      name: { type: 'text' as const, path: 'name' },
      date: { type: 'date' as const, path: 'date' },
      status: { type: 'status' as const, path: 'status' },
      warnings: { type: 'number' as const, path: 'warnings' },
      errors: { type: 'number' as const, path: 'errors' },
      backup_list_count: { type: 'number' as const, path: 'backup_list_count' },
      fileCount: { type: 'number' as const, path: 'fileCount' },
      fileSize: { type: 'number' as const, path: 'fileSize' },
      uploadedSize: { type: 'number' as const, path: 'uploadedSize' },
      duration: { type: 'duration' as const, path: 'duration' },
      knownFileSize: { type: 'number' as const, path: 'knownFileSize' }
    };

    // First sort the backups
    const sorted = createSortedArray(backups, sortConfig, columnConfig);
    
    // Then filter based on selected backup name
    const filtered = sorted.filter((backup) => {
      if (selectedBackup === "all") return true;
      return backup.name === selectedBackup;
    });
    
    return {
      totalPages: Math.ceil(filtered.length / tablePageSize),
      paginated: filtered.slice(
        (currentPage - 1) * tablePageSize,
        currentPage * tablePageSize
      )
    };
  }, [backups, sortConfig, selectedBackup, currentPage, tablePageSize]);

  const { totalPages, paginated: paginatedBackups } = sortedFilteredPaginatedBackups;
  const router = useRouter();

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
        const isDateColumn = column === 'date';
        return {
          column,
          direction: isDateColumn ? 'desc' : 'asc'
        };
      }
    });
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBackup]);

  // Reset to first page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

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
          <div className="flex justify-end p-4 border-b">
            <Select
              value={selectedBackup}
              onValueChange={setSelectedBackup}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select backup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Backups</SelectItem>
                {uniqueBackupNames.filter(name => name !== "all").map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead column="name" sortConfig={sortConfig} onSort={handleSort}>
                    Backup Name
                  </SortableTableHead>
                  <SortableTableHead column="date" sortConfig={sortConfig} onSort={handleSort}>
                    Date
                  </SortableTableHead>
                  <SortableTableHead column="status" sortConfig={sortConfig} onSort={handleSort}>
                    Status
                  </SortableTableHead>
                  <SortableTableHead column="warnings" sortConfig={sortConfig} onSort={handleSort} align="center">
                    Warnings
                  </SortableTableHead>
                  <SortableTableHead column="errors" sortConfig={sortConfig} onSort={handleSort} align="center">
                    Errors
                  </SortableTableHead>
                  <SortableTableHead column="backup_list_count" sortConfig={sortConfig} onSort={handleSort} align="center">
                    Available Versions
                  </SortableTableHead>
                  <SortableTableHead column="fileCount" sortConfig={sortConfig} onSort={handleSort} align="right">
                    File Count
                  </SortableTableHead>
                  <SortableTableHead column="fileSize" sortConfig={sortConfig} onSort={handleSort} align="right">
                    File Size
                  </SortableTableHead>
                  <SortableTableHead column="uploadedSize" sortConfig={sortConfig} onSort={handleSort} align="right">
                    Uploaded Size
                  </SortableTableHead>
                  <SortableTableHead column="duration" sortConfig={sortConfig} onSort={handleSort} align="right">
                    Duration
                  </SortableTableHead>
                  <SortableTableHead column="knownFileSize" sortConfig={sortConfig} onSort={handleSort} align="right">
                    Storage Size
                  </SortableTableHead>
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

