// src/components/dashboard/dashboard-summary-cards.tsx
"use client";

import type { OverallSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Archive, UploadCloud, Database, FileSearch, AlertTriangle, LayoutDashboard, Sheet } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSummaryCardsProps {
  summary: OverallSummary;
  onViewModeChange?: (viewMode: 'cards' | 'table') => void;
  defaultViewMode?: 'cards' | 'table';
}

export function DashboardSummaryCards({ 
  summary, 
  onViewModeChange,
  defaultViewMode = 'cards'
}: DashboardSummaryCardsProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(defaultViewMode);

  // Load view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('dashboard-view-mode');
    if (savedViewMode === 'cards' || savedViewMode === 'table') {
      setViewMode(savedViewMode);
      onViewModeChange?.(savedViewMode);
    }
  }, [onViewModeChange]);

  // Handle view mode toggle
  const handleViewModeToggle = () => {
    const newViewMode = viewMode === 'cards' ? 'table' : 'cards';
    setViewMode(newViewMode);
    localStorage.setItem('dashboard-view-mode', newViewMode);
    onViewModeChange?.(newViewMode);
  };

  const summaryItems = [
    {
      title: "Total Machines",
      value: summary.totalMachines.toLocaleString(),
      icon: <HardDrive className="h-6 w-6 text-blue-600" />,
      "data-ai-hint": "server computer",
    },
    {
      title: "Total Backups",
      value: summary.totalBackups.toLocaleString(),
      icon: <Archive className="h-6 w-6 text-blue-600" />,
      "data-ai-hint": "archive box",
    },
    {
      title: "Total Backup Size",
      value: formatBytes(summary.totalBackupSize),
      icon: <FileSearch className="h-6 w-6 text-blue-600" />,
      "data-ai-hint": "file search",
    },
    {
      title: "Total Storage Used",
      value: formatBytes(summary.totalStorageUsed),
      icon: <Database className="h-6 w-6 text-blue-600" />,
      "data-ai-hint": "database storage",
    },
    {
      title: "Total Uploaded Size",
      value: formatBytes(summary.totalUploadedSize),
      icon: <UploadCloud className="h-6 w-6 text-blue-600" />,
      "data-ai-hint": "cloud upload",
    },
    {
      title: "Overdue Backups",
      value: summary.overdueBackupsCount.toLocaleString(),
      icon: <AlertTriangle className={`h-6 w-6 ${summary.overdueBackupsCount > 0 ? 'text-red-600' : 'text-gray-500'}`} />,
      "data-ai-hint": "alert warning",
    },
  ];

  return (
    <div className="flex gap-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6 flex-1">
        {summaryItems.map((item) => (
          <Card key={item.title} className="shadow-md hover:shadow-lg transition-shadow" data-ai-hint={item['data-ai-hint']}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className={`text-2xl font-bold ${item.title === "Overdue Backups" ? (summary.overdueBackupsCount > 0 ? 'text-red-600' : 'text-gray-500') : ''}`}>
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Toggle View Mode Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow w-fit flex-shrink-0 flex items-center justify-center">
        <div className="p-3 text-center">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={handleViewModeToggle}
                  aria-label={`Switch to ${viewMode === 'cards' ? 'table' : 'cards'} view`}
                >
                  {viewMode === 'cards' ? (
                    <Sheet className="h-6 w-6 text-blue-600" />
                  ) : (
                    <LayoutDashboard className="h-6 w-6 text-blue-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch between Cards view and Table view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="text-xs text-muted-foreground mt-2">
            {viewMode === 'cards' ? 'Switch to Table' : 'Switch to Cards'}
          </div>
        </div>
      </Card>
    </div>
  );
}
