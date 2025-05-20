// src/components/dashboard/dashboard-summary-cards.tsx
"use client";

import type { OverallSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Archive, UploadCloud, Database, FileSearch } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface DashboardSummaryCardsProps {
  summary: OverallSummary;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const summaryItems = [
    {
      title: "Total Machines",
      value: summary.totalMachines.toLocaleString(),
      icon: <HardDrive className="h-6 w-6 text-primary" />,
      "data-ai-hint": "server computer",
    },
    {
      title: "Total Backups",
      value: summary.totalBackups.toLocaleString(),
      icon: <Archive className="h-6 w-6 text-primary" />,
      "data-ai-hint": "archive box",
    },
    {
      title: "Total Backuped Size",
      value: formatBytes(summary.totalBackupedSize),
      icon: <FileSearch className="h-6 w-6 text-primary" />,
      "data-ai-hint": "file search",
    },
    {
      title: "Total Storage Used",
      value: formatBytes(summary.totalStorageUsed),
      icon: <Database className="h-6 w-6 text-primary" />,
      "data-ai-hint": "database storage",
    },
    {
      title: "Total Uploaded Size",
      value: formatBytes(summary.totalUploadedSize),
      icon: <UploadCloud className="h-6 w-6 text-primary" />,
      "data-ai-hint": "cloud upload",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      {summaryItems.map((item) => (
        <Card key={item.title} className="shadow-md hover:shadow-lg transition-shadow" data-ai-hint={item['data-ai-hint']}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
