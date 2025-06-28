// src/components/machine-details/machine-detail-summary-items.tsx
"use client";

import type { BackupStatus } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Archive, Clock, UploadCloud, Database, History, HardDrive } from "lucide-react";
import { formatBytes, formatDurationFromMinutes } from "@/lib/utils";
import { useBackupSelection } from "@/contexts/backup-selection-context";
import type { Backup } from "@/lib/types";

interface MachineDetailSummaryItemsProps {
  totalBackups: number;
  statusCounts?: Record<BackupStatus, number>;
  averageDuration: number; // in minutes
  totalUploadedSize: number; // in bytes
  lastBackupStorageSize: number; // in bytes
  lastBackupListCount: number | null;
  lastBackupFileSize: number; // in bytes
  selectedBackup?: Backup | null; // Add this prop for selected backup data
}

interface SummaryItem {
  title: string;
  value: string;
  icon: JSX.Element;
  'data-ai-hint': string;
}

export function MachineDetailSummaryItems({
  totalBackups,
  averageDuration,
  totalUploadedSize,
  lastBackupStorageSize,
  lastBackupListCount,
  lastBackupFileSize,
  selectedBackup,
}: MachineDetailSummaryItemsProps) {
  const { selectedBackup: selectedBackupId } = useBackupSelection();

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
        title: "Available Backup Versions", 
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
        title: "Backup File Size", 
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

  return (
    <div className="pt-4">
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          {selectedBackup ? `${selectedBackup.name} Statistics` : 'Machine Statistics'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {summaryItems.map((item) => (
            <Card key={item.title} className="shadow-sm" data-ai-hint={item['data-ai-hint']}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1.5 px-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {item.title}
                </p>
                {item.icon}
              </CardHeader>
              <CardContent className="pt-0 pb-1.5 px-3">
                <div className="text-lg font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

