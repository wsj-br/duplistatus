"use client";

import { useState, useEffect } from 'react';
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardMetricsChart } from "@/components/dashboard/dashboard-metrics-chart";
import { DashboardToastHandler } from "@/components/dashboard/dashboard-toast-handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MachineSummary, OverallSummary } from "@/lib/types";

interface ChartDataPoint {
  date: string;
  isoDate: string;
  uploadedSize: number;
  duration: number;
  fileCount: number;
  fileSize: number;
  storageSize: number;
  backupVersions: number;
  machineId?: string;
  backupId?: string;
}

interface DashboardData {
  machinesSummary: MachineSummary[];
  overallSummary: OverallSummary;
  aggregatedChartData: ChartDataPoint[];
}

interface DashboardAutoRefreshProps {
  initialData: DashboardData;
}

export function DashboardAutoRefresh({ initialData }: DashboardAutoRefreshProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const { state } = useGlobalRefresh();

  // Listen for refresh events from global refresh context
  useEffect(() => {
    // When the global refresh completes for dashboard pages, use the data from the context
    // instead of making duplicate API calls
    if (!state.isRefreshing && !state.pageSpecificLoading.dashboard && !state.refreshInProgress && state.lastRefresh && state.dashboardData) {
      // Use the data from global refresh context to avoid duplicate API calls
      const { machinesSummary: machinesData, overallSummary: summaryData, allMachinesChartData: chartData } = state.dashboardData;
      
      setData({
        machinesSummary: machinesData,
        overallSummary: summaryData,
        aggregatedChartData: chartData
      });
    }
  }, [state.isRefreshing, state.pageSpecificLoading.dashboard, state.refreshInProgress, state.lastRefresh, state.dashboardData]);

  return (
    <div className="flex flex-col gap-8">
      <DashboardToastHandler />

      <DashboardSummaryCards 
        summary={data.overallSummary} 
        onViewModeChange={() => {}} // No-op since this component doesn't support view switching
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl cursor-default">Overview</CardTitle>
          <CardDescription className="cursor-default">
            Latest backup status for all machines.
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help ml-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Last refresh: {state.lastRefresh ? new Date(state.lastRefresh).toLocaleString() : '--'}
                  </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardTable machines={data.machinesSummary} />
        </CardContent>
      </Card>

      <DashboardMetricsChart aggregatedData={data.aggregatedChartData} />
    </div>
  );
}
