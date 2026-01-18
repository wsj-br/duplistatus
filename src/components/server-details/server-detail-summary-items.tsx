// src/components/server-details/server-detail-summary-items.tsx
"use client";

import React from "react";
import { useIntlayer } from 'react-intlayer';
import { useRouter } from "next/navigation";
import { useLocale } from "@/contexts/locale-context";
import type { BackupStatus } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Clock, UploadCloud, Database, History, HardDrive, CalendarX2, Settings, FolderOpen } from "lucide-react";
import { formatBytes, formatDurationFromMinutes, formatRelativeTime } from "@/lib/utils";
import type { Backup } from "@/lib/types";

interface OverdueBackup {
  serverName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: string;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}

interface ServerDetailSummaryItemsProps {
  totalBackupsRuns: number;
  statusCounts?: Record<BackupStatus, number>;
  averageDuration: number; // in minutes
  totalUploadedSize: number; // in bytes
  lastBackupStorageSize: number; // in bytes
  lastBackupListCount: number | null;
  lastBackupFileSize: number; // in bytes
  selectedBackup?: Backup | null; // Add this prop for selected backup data
  overdueBackups: OverdueBackup[]; // Add overdue backups as prop
  lastOverdueCheck?: string; // Time of last overdue backup check
  totalBackupJobs?: number; // Total number of unique backup job configurations
}

export function ServerDetailSummaryItems({
  totalBackupsRuns,
  averageDuration,
  totalUploadedSize,
  lastBackupStorageSize,
  lastBackupListCount,
  lastBackupFileSize,
  selectedBackup,
  overdueBackups,
  lastOverdueCheck,
  totalBackupJobs,
}: ServerDetailSummaryItemsProps) {
  const content = useIntlayer('server-detail-summary-items');
  const common = useIntlayer('common');
  const router = useRouter();
  const locale = useLocale();
  // Use a try/catch for each item to ensure nothing breaks
  const getFormattedValue = (value: number, formatter: (val: number) => string, defaultValue: string = '0') => {
    try {
      return formatter(value);
    } catch {
      return defaultValue;
    }
  };

  const getFormattedNumber = (value: number, defaultValue: string = '0') => {
    try {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num.toLocaleString();
    } catch {
      return defaultValue;
    }
  };

  // Check if the selected backup is in the overdue backups list
  const isSelectedBackupOverdue = selectedBackup && overdueBackups.some(
    overdue => overdue.backupName === selectedBackup.name
  );

  // Get the expected backup elapsed time for the selected backup
  const SelectedExpectedBackupElapsed = selectedBackup && overdueBackups.find(
    overdue => overdue.backupName === selectedBackup.name
  )?.expectedBackupElapsed;
  
  // Get the expected backup date for the selected backup
  const SelectedExpectedBackupDate = selectedBackup && overdueBackups.find(
    overdue => overdue.backupName === selectedBackup.name
  )?.expectedBackupDate;
  
  // Format the expected backup date with toLocaleString()
  const formattedExpectedBackupDate = SelectedExpectedBackupDate && SelectedExpectedBackupDate !== 'N/A' 
    ? new Date(SelectedExpectedBackupDate).toLocaleString()
    : SelectedExpectedBackupDate;


  const getSummaryItems = () => {
    const items = [];

    // Add total Backup Jobs card first when no specific backup is selected
    if (!selectedBackup && totalBackupJobs !== undefined) {
      items.push({
        id: 'totalBackupJobs',
        title: content.totalBackupJobs,
        value: getFormattedNumber(totalBackupJobs),
        icon: <FolderOpen className="h-4 w-4 text-blue-600" />,
        "data-ai-hint": "folder backup jobs"
      });
    }

    // Add the rest of the items
    items.push(
      { 
        id: 'totalBackupRuns',
        title: content.totalBackupRuns, 
        value: getFormattedNumber(totalBackupsRuns),
        icon: <Archive className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "archive storage" 
      },
      { 
        id: 'availableVersions',
        title: content.availableVersions, 
        value: lastBackupListCount !== null ? getFormattedNumber(lastBackupListCount) : 'N/A',
        icon: <History className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "history versions" 
      },
      { 
        id: 'avgDuration',
        title: content.avgDuration, 
        value: getFormattedValue(averageDuration, formatDurationFromMinutes, "00:00:00"),
        icon: <Clock className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "timer clock" 
      },
      { 
        id: 'lastBackupSize',
        title: content.lastBackupSize, 
        value: getFormattedValue(lastBackupFileSize, formatBytes, "0 Bytes"),
        icon: <HardDrive className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "hard drive" 
      },
      { 
        id: 'totalStorageUsed',
        title: content.totalStorageUsed, 
        value: getFormattedValue(lastBackupStorageSize, formatBytes, "0 Bytes"),
        icon: <Database className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "database symbol" 
      },
      { 
        id: 'totalUploaded',
        title: content.totalUploaded, 
        value: getFormattedValue(totalUploadedSize, formatBytes, "0 Bytes"),
        icon: <UploadCloud className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "cloud data" 
      }
    );

    return items;
  };

  const summaryItems = getSummaryItems();

  const handleSettingsClick = () => {
    router.push(`/${locale}/settings?tab=overdue`);
  };

  return (
    <div className="pt-4" data-screenshot-target="server-detail-summary">
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          {selectedBackup ? `${selectedBackup.name} ${content.statistics}` : content.machineStatistics}
        </h3>
        
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${!selectedBackup ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-2 lg:gap-3`}>
          {summaryItems.map((item) => (
            <Card key={item.id} className="shadow-sm" data-ai-hint={item['data-ai-hint']}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1.5 px-2 lg:px-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {item.title}
                </p>
                {item.icon}
              </CardHeader>
              <CardContent className="pt-0 pb-1.5 px-2 lg:px-3">
                <div className="text-sm lg:text-lg font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Overdue Backups Warning */}
        <>
          {/* Show overdue backups list when "all backups" is selected */}
          {!selectedBackup && overdueBackups.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md" data-screenshot-target="server-overdue-message">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarX2 className="h-4 w-4 text-red-400" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Overdue scheduled backups:</span> {overdueBackups.map(ob => `'${ob.backupName} (${ob.expectedBackupElapsed} overdue)'`).join(', ')}.
                    {lastOverdueCheck && lastOverdueCheck !== 'N/A' && (
                      <span className="px-3 text-muted-foreground">Last checked: {formatRelativeTime(lastOverdueCheck, undefined, locale)}</span>
                    )}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSettingsClick}
                  className="text-xs h-7 px-2"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            </div>
          )}
          
          {/* Show warning when specific backup is selected and is overdue */}
          {selectedBackup && isSelectedBackupOverdue && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarX2 className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-muted-foreground">
                     {content.scheduledBackupIsOverdue
                       .replace('{date}', formattedExpectedBackupDate || 'N/A')
                       .replace('{elapsed}', SelectedExpectedBackupElapsed || 'N/A')}
                     {lastOverdueCheck && lastOverdueCheck !== 'N/A' && (
                       <span className="px-3 text-muted-foreground">{content.lastChecked} {formatRelativeTime(lastOverdueCheck, undefined, locale)}</span>
                     )}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSettingsClick}
                  className="text-xs h-7 px-2"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  {content.configure}
                </Button>
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
}

