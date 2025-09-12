// src/components/dashboard/dashboard-summary-cards.tsx
"use client";

import type { OverallSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Archive, UploadCloud, Database, FileSearch, AlertTriangle, LayoutDashboard, Sheet, ThumbsUp, Radar } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerSelection } from "@/contexts/server-selection-context";

interface DashboardSummaryCardsProps {
  summary: OverallSummary;
  onViewModeChange?: (viewMode: 'cards' | 'table' | 'compact') => void;
}

export function DashboardSummaryCards({ 
  summary, 
  onViewModeChange
}: DashboardSummaryCardsProps) {
  const { state: serverSelectionState, setViewMode } = useServerSelection();
  const { viewMode } = serverSelectionState;

  // Handle view mode toggle
  const handleViewModeToggle = () => {
    let newViewMode: 'cards' | 'table' | 'compact';
    if (viewMode === 'cards') {
      newViewMode = 'table';
    } else if (viewMode === 'table') {
      newViewMode = 'compact';
    } else {
      newViewMode = 'cards';
    }
    setViewMode(newViewMode);
    localStorage.setItem('dashboard-view-mode', newViewMode);
    onViewModeChange?.(newViewMode);
  };

  const summaryItems = [
    {
      title: "Total Servers",
      value: summary.totalServers.toLocaleString(),
      icon: <HardDrive className="h-6 w-6 text-blue-600" />,
      "data-ai-hint": "server computer",
    },
    {
      title: "Total Backup Jobs",
      value: summary.totalBackups.toLocaleString(),
      icon: <Archive className="h-6 w-6 text-blue-600" />,
      "data-ai-hint": "archive box",
    },
    {
      title: "Total Backup Runs",
      value: summary.totalBackupsRuns.toLocaleString(),
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
    // Only show Overdue Backups card when not in compact mode
    ...(viewMode !== 'compact' ? [{
      title: "Overdue Backups",
      value: summary.overdueBackupsCount.toLocaleString(),
      icon: summary.overdueBackupsCount > 0 ? (
        <AlertTriangle className="h-6 w-6 text-red-600" />
      ) : (
        <ThumbsUp className="h-6 w-6 text-green-600" />
      ),
      "data-ai-hint": "alert triangle",
    }] : []),
  ];

  return (
    <div className="flex gap-3">
      <div className={`grid gap-3 md:grid-cols-2 ${viewMode === 'compact' ? 'lg:grid-cols-6' : 'lg:grid-cols-7'} flex-1`}>
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
                  className="h-8 w-8 p-0 hover:bg-transparent [&_svg]:!h-8 [&_svg]:!w-8"
                  onClick={handleViewModeToggle}
                >
                  {viewMode === 'cards' ? (
                    <LayoutDashboard className="h-6 w-6 text-blue-600" />
                  ) : viewMode === 'table' ? (
                    <Sheet className="h-8 w-8 text-blue-600" />
                  ) : (
                    <Radar className="h-6 w-6 text-blue-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show {viewMode === 'cards' ? 'table' : viewMode === 'table' ? 'compact' : 'cards'} view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* <div className="text-xs text-muted-foreground mt-2">
            {viewMode === 'cards' ? 'Switch to Table' : 'Switch to Cards'}
          </div> */}
        </div>
      </Card>
    </div>
  );
}
