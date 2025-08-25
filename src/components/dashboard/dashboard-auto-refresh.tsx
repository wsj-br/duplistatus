"use client";

import { useState, useEffect } from 'react';
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardMetricsChart } from "@/components/dashboard/dashboard-metrics-chart";
import { DashboardToastHandler } from "@/components/dashboard/dashboard-toast-handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { useToast } from "@/components/ui/use-toast";
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
  const [lastError, setLastError] = useState<string | null>(null);
  
  const { state } = useGlobalRefresh();
  const { toast } = useToast();

  // Listen for refresh events from global refresh context
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLastError(null);
        
        // Fetch data from API endpoints
        const [machinesResponse, summaryResponse, chartResponse] = await Promise.all([
          fetch('/api/machines-summary'),
          fetch('/api/summary'),
          fetch('/api/chart-data')
        ]);

        if (!machinesResponse.ok || !summaryResponse.ok || !chartResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [machinesData, summaryData, chartData] = await Promise.all([
          machinesResponse.json(),
          summaryResponse.json(),
          chartResponse.json()
        ]);

        setData({
          machinesSummary: machinesData,
          overallSummary: summaryData,
          aggregatedChartData: chartData
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.log('Error refreshing dashboard data:', error instanceof Error ? error.message : String(error));
        setLastError(errorMessage);
        
        toast({
          title: "Update Failed",
          description: `Failed to refresh dashboard data: ${errorMessage}`,
          variant: "destructive",
          duration: 2000,
        });
      }
    };

    // Only fetch data when global refresh completes and no refresh is in progress
    // This prevents race conditions with the global refresh context
    if (!state.isRefreshing && !state.pageSpecificLoading.dashboard && !state.refreshInProgress && state.lastRefresh) {
      fetchData();
    }
  }, [state.isRefreshing, state.pageSpecificLoading.dashboard, state.refreshInProgress, state.lastRefresh, toast]);

  return (
    <div className="flex flex-col gap-8">
      <DashboardToastHandler />
      
      {/* Error Alert */}
      {lastError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to update dashboard data: {lastError}
          </AlertDescription>
        </Alert>
      )}

      <DashboardSummaryCards summary={data.overallSummary} />

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
