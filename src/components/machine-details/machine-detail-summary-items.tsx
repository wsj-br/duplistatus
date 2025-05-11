// src/components/machine-details/machine-detail-summary-items.tsx
"use client";

import type { BackupStatus } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Archive, CheckCircle, XCircle, AlertTriangle, Clock, UploadCloud, Database } from "lucide-react";
import { formatBytes, formatDurationFromMinutes } from "@/lib/utils";

interface MachineDetailSummaryItemsProps {
  totalBackups: number;
  statusCounts?: Record<BackupStatus, number>;
  lastBackupWarnings: number;
  lastBackupErrors: number;
  averageDuration: number; // in minutes
  totalUploadedSize: number; // in bytes
  lastBackupStorageSize: number; // in bytes
}

export function MachineDetailSummaryItems({
  totalBackups,
  lastBackupWarnings,
  lastBackupErrors,
  averageDuration,
  totalUploadedSize,
  lastBackupStorageSize,
}: MachineDetailSummaryItemsProps) {

  const summaryItems = [
    { title: "Total Backups", value: totalBackups.toLocaleString(), icon: <Archive className="h-4 w-4 text-primary" />, "data-ai-hint": "archive storage" },
    { title: "Avg. Duration", value: formatDurationFromMinutes(averageDuration), icon: <Clock className="h-4 w-4 text-primary" />, "data-ai-hint": "timer clock" },
    { title: "Total Uploaded", value: formatBytes(totalUploadedSize), icon: <UploadCloud className="h-4 w-4 text-primary" />, "data-ai-hint": "cloud data" },
    { title: "Total Storage Used", value: formatBytes(lastBackupStorageSize), icon: <Database className="h-4 w-4 text-primary" />, "data-ai-hint": "database symbol" },
    { title: "Last Backup Warnings", value: lastBackupWarnings.toLocaleString(), icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, "data-ai-hint": "warning symbol" },
    { title: "Last Backup Errors", value: lastBackupErrors.toLocaleString(), icon: <XCircle className="h-4 w-4 text-destructive" />, "data-ai-hint": "error cross" },
  ];

  return (
    <div className="pt-4">
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">Machine Statistics</h3>
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

