"use client";

import { useIntlayer } from 'react-intlayer';
import type { Backup } from "@/lib/types";
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-format";
import { formatInteger } from "@/lib/number-format";
import { useConfig } from "@/contexts/config-context";
import { useBackupSelection } from "@/contexts/backup-selection-context";
import { useRouter } from "next/navigation";
import { useLocale } from "@/contexts/locale-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAvailableBackupsModal, AvailableBackupsIcon } from "@/components/ui/available-backups-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { createSortedArray, type SortConfig } from "@/lib/sort-utils";

interface ServerBackupTableProps {
  backups: Backup[];
  serverName: string;
  serverAlias?: string;
  serverNote?: string;
}

export function ServerBackupTable({ backups, serverName, serverAlias, serverNote }: ServerBackupTableProps) {
  const content = useIntlayer('server-backup-table');
  const common = useIntlayer('common');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: 'asc' });
  const { selectedBackup, setSelectedBackup } = useBackupSelection();
  const { tablePageSize } = useConfig();
  const { handleAvailableBackupsClick } = useAvailableBackupsModal();
  
  // Display-only sort config to show chevron on Date (desc) by default without changing data order
  const displaySortConfig = useMemo<SortConfig>(() => (
    sortConfig.column ? sortConfig : { column: 'date', direction: 'desc' }
  ), [sortConfig]);

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
  const locale = useLocale();

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
        const isFirstSort = !prevConfig.column;
        return {
          column,
          direction: isDateColumn ? (isFirstSort ? 'asc' : 'desc') : 'asc'
        };
      }
    });
  };

  // Reset to first page when filter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [selectedBackup]);

  // Reset to first page when sort changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [sortConfig]);

  // Reset to first page when table page size changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [tablePageSize]);

  // Reset to first page when backups data changes (e.g. after deletion)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [backups.length]);
  
  // Ensure current page is valid when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      router.push(`/${locale}/detail/${backup.server_id}/backup/${backup.id}`);
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
                <SelectValue placeholder={content.selectBackup.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{content.allBackups.value}</SelectItem>
                {uniqueBackupNames.filter(name => name !== "all").map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead column="name" sortConfig={displaySortConfig} onSort={handleSort}>
                    {content.backupName}
                  </SortableTableHead>
                  <SortableTableHead column="date" sortConfig={displaySortConfig} onSort={handleSort}>
                    {content.date}
                  </SortableTableHead>
                  <SortableTableHead column="status" sortConfig={displaySortConfig} onSort={handleSort}>
                    {content.status}
                  </SortableTableHead>
                  <SortableTableHead column="warnings" sortConfig={displaySortConfig} onSort={handleSort} align="center">
                    {content.warnings}
                  </SortableTableHead>
                  <SortableTableHead column="errors" sortConfig={displaySortConfig} onSort={handleSort} align="center">
                    {content.errors}
                  </SortableTableHead>
                  <SortableTableHead column="backup_list_count" sortConfig={displaySortConfig} onSort={handleSort} align="center">
                    {content.availableVersions}
                  </SortableTableHead>
                  <SortableTableHead column="fileCount" sortConfig={displaySortConfig} onSort={handleSort} align="right">
                    {content.fileCount}
                  </SortableTableHead>
                  <SortableTableHead column="fileSize" sortConfig={displaySortConfig} onSort={handleSort} align="right">
                    {content.fileSize}
                  </SortableTableHead>
                  <SortableTableHead column="uploadedSize" sortConfig={displaySortConfig} onSort={handleSort} align="right">
                    {content.uploadedSize}
                  </SortableTableHead>
                  <SortableTableHead column="duration" sortConfig={displaySortConfig} onSort={handleSort} align="right">
                    {content.duration}
                  </SortableTableHead>
                  <SortableTableHead column="knownFileSize" sortConfig={displaySortConfig} onSort={handleSort} align="right">
                    {content.storageSize}
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBackups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center h-24">
                      {content.noBackupsFoundForThisServer}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedBackups.map((backup) => (
                  <TableRow 
                    key={backup.id}
                    className={!hasNoMessages(backup) ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => !hasNoMessages(backup) && handleBackupClick(backup)}
                  >
                    <TableCell className="font-medium">{backup.name}</TableCell>
                    <TableCell>
                      <div>{formatDateTime(backup.date, locale)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(backup.date, undefined, locale)}
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
                        <div>
                          <StatusBadge status={backup.status} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{backup.warnings}</TableCell>
                    <TableCell className="text-center">{backup.errors}</TableCell>
                    <TableCell className="text-center">
                      <AvailableBackupsIcon
                        availableBackups={backup.available_backups}
                        currentBackupDate={backup.date}
                        serverName={serverName}
                        serverAlias={serverAlias}
                        serverNote={serverNote}
                        backupName={backup.name}
                        onIconClick={handleAvailableBackupsClick}
                        count={backup.backup_list_count}
                      />
                    </TableCell>
                    <TableCell className="text-right">{formatInteger(backup.fileCount, locale)}</TableCell>
                    <TableCell className="text-right">{formatBytes(backup.fileSize)}</TableCell>
                    <TableCell className="text-right">{formatBytes(backup.uploadedSize)}</TableCell>
                    <TableCell className="text-right">{backup.duration}</TableCell>
                    <TableCell className="text-right">{formatBytes(backup.knownFileSize)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {paginatedBackups.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {content.noBackupsFoundForThisMachine}
              </div>
            )}
            {paginatedBackups.map((backup) => (
              <Card key={backup.id} className="p-4">
                <div className="space-y-3">
                  {/* Header with Backup Name and Status */}
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{backup.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(backup.date, locale)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
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
                    </div>
                  </div>

                  {/* Grid Layout - 2 columns × 3 rows */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Row 1 */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Available Versions</Label>
                      <div className="flex justify-start">
                        <AvailableBackupsIcon
                          availableBackups={backup.available_backups}
                          currentBackupDate={backup.date}
                          serverName={serverName}
                          serverAlias={serverAlias}
                          serverNote={serverNote}
                          backupName={backup.name}
                          onIconClick={handleAvailableBackupsClick}
                          count={backup.backup_list_count}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">File Count</Label>
                      <div className="text-sm">{formatInteger(backup.fileCount, locale)}</div>
                    </div>

                    {/* Row 2 */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">File Size</Label>
                      <div className="text-sm">{formatBytes(backup.fileSize)}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Uploaded Size</Label>
                      <div className="text-sm">{formatBytes(backup.uploadedSize)}</div>
                    </div>

                    {/* Row 3 */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Duration</Label>
                      <div className="text-sm">{backup.duration}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Storage Size</Label>
                      <div className="text-sm">{formatBytes(backup.knownFileSize)}</div>
                    </div>
                  </div>

                  {/* Additional Info Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Warnings</Label>
                      <div className="text-sm">{backup.warnings}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Errors</Label>
                      <div className="text-sm">{backup.errors}</div>
                    </div>
                  </div>

                  {/* Card Click Action */}
                  {!hasNoMessages(backup) && (
                    <div className="border-t pt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleBackupClick(backup)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
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
              {content.previous}
            </Button>
            <div className="text-sm text-muted-foreground">
              {content.page} {currentPage} {content.of} {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              {content.next}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* AvailableBackupsModal is now rendered globally */}
      </div>
    </TooltipProvider>
  );
}

