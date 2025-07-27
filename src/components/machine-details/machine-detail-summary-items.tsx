// src/components/machine-details/machine-detail-summary-items.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { BackupStatus } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Clock, UploadCloud, Database, History, HardDrive, CalendarX2, Settings } from "lucide-react";
import { formatBytes, formatDurationFromMinutes, formatTimeAgo } from "@/lib/utils";
import type { Backup } from "@/lib/types";

interface MissedBackup {
  machineName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: string;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}

interface MachineDetailSummaryItemsProps {
  totalBackups: number;
  statusCounts?: Record<BackupStatus, number>;
  averageDuration: number; // in minutes
  totalUploadedSize: number; // in bytes
  lastBackupStorageSize: number; // in bytes
  lastBackupListCount: number | null;
  lastBackupFileSize: number; // in bytes
  selectedBackup?: Backup | null; // Add this prop for selected backup data
  missedBackups: MissedBackup[]; // Add missed backups as prop
  lastMissedCheck?: string; // Time of last missed backup check
}

export function MachineDetailSummaryItems({
  totalBackups,
  averageDuration,
  totalUploadedSize,
  lastBackupStorageSize,
  lastBackupListCount,
  lastBackupFileSize,
  selectedBackup,
  missedBackups,
  lastMissedCheck,
}: MachineDetailSummaryItemsProps) {
  const router = useRouter();
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

  // Check if the selected backup is in the missed backups list
  const isSelectedBackupMissed = selectedBackup && missedBackups.some(
    missed => missed.backupName === selectedBackup.name
  );

  // Get the expected backup elapsed time for the selected backup
  const SelectedExpectedBackupElapsed = selectedBackup && missedBackups.find(
    missed => missed.backupName === selectedBackup.name
  )?.expectedBackupElapsed;
  
  // Get the expected backup date for the selected backup
  const SelectedExpectedBackupDate = selectedBackup && missedBackups.find(
    missed => missed.backupName === selectedBackup.name
  )?.expectedBackupDate;
  
  // Format the expected backup date with toLocaleString()
  const formattedExpectedBackupDate = SelectedExpectedBackupDate && SelectedExpectedBackupDate !== 'N/A' 
    ? new Date(SelectedExpectedBackupDate).toLocaleString()
    : SelectedExpectedBackupDate;


  const getSummaryItems = () => {
 
    // Show aggregate statistics for all backups (or selected backup)
    return [
      { 
        title: "Total Backups", 
        value: getFormattedNumber(totalBackups),
        icon: <Archive className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "archive storage" 
      },
      { 
        title: "Available Versions", 
        value: lastBackupListCount !== null ? getFormattedNumber(lastBackupListCount) : 'N/A',
        icon: <History className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "history versions" 
      },
      { 
        title: "Avg. Duration", 
        value: getFormattedValue(averageDuration, formatDurationFromMinutes, "00:00:00"),
        icon: <Clock className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "timer clock" 
      },
      { 
        title: "Last Backup Size", 
        value: getFormattedValue(lastBackupFileSize, formatBytes, "0 Bytes"),
        icon: <HardDrive className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "hard drive" 
      },
      { 
        title: "Total Storage Used", 
        value: getFormattedValue(lastBackupStorageSize, formatBytes, "0 Bytes"),
        icon: <Database className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "database symbol" 
      },
      { 
        title: "Total Uploaded", 
        value: getFormattedValue(totalUploadedSize, formatBytes, "0 Bytes"),
        icon: <UploadCloud className="h-4 w-4 text-blue-600" />, 
        "data-ai-hint": "cloud data" 
      }
    ];
  };

  const summaryItems = getSummaryItems();

  const handleSettingsClick = () => {
    router.push('/settings?tab=backups');
  };

  return (
    <div className="pt-4">
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          {selectedBackup ? `${selectedBackup.name} Statistics` : 'Machine Statistics'}
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-3">
          {summaryItems.map((item) => (
            <Card key={item.title} className="shadow-sm" data-ai-hint={item['data-ai-hint']}>
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
        
        {/* Missed Backups Warning */}
        <>
          {/* Show missed backups list when "all backups" is selected */}
          {!selectedBackup && missedBackups.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarX2 className="h-4 w-4 text-red-400" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Missed scheduled backups:</span> {missedBackups.map(mb => `'${mb.backupName} (${mb.expectedBackupElapsed} overdue)'`).join(', ')}.
                    {lastMissedCheck && lastMissedCheck !== 'N/A' && (
                      <span className="px-3 text-muted-foreground">Last checked: {formatTimeAgo(lastMissedCheck)}</span>
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
          
          {/* Show warning when specific backup is selected and is missed */}
          {selectedBackup && isSelectedBackupMissed && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarX2 className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-muted-foreground">
                     Scheduled backup was missed. Expected backup date: {formattedExpectedBackupDate} ({SelectedExpectedBackupElapsed} overdue).
                     {lastMissedCheck && lastMissedCheck !== 'N/A' && (
                       <span className="px-3 text-muted-foreground">Last checked: {formatTimeAgo(lastMissedCheck)}</span>
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
        </>
      </div>
    </div>
  );
}

