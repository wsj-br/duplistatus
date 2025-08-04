"use client";

import { useState, useEffect } from 'react';
import { MachineDetailsContent } from "@/components/machine-details/machine-details-content";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from 'next/navigation';
import type { Machine } from "@/lib/types";

interface OverdueBackup {
  machineName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: string;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}

interface DetailData {
  machine: Machine;
  overdueBackups: OverdueBackup[];
  lastOverdueCheck: string;
}

interface DetailAutoRefreshProps {
  initialData: DetailData;
}

export function DetailAutoRefresh({ initialData }: DetailAutoRefreshProps) {
  const [data, setData] = useState<DetailData>(initialData);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const { state } = useGlobalRefresh();
  const { toast } = useToast();
  const params = useParams();
  const machineId = params.machineId as string;

  // Listen for refresh events from global refresh context
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLastError(null);
        
        // Fetch data from API endpoints
        const [dataResponse, chartResponse] = await Promise.all([
          fetch(`/api/detail/${machineId}/data`),
          fetch(`/api/detail/${machineId}/chart-data`)
        ]);

        if (!dataResponse.ok || !chartResponse.ok) {
          throw new Error('Failed to fetch detail data');
        }

        const [detailData, chartData] = await Promise.all([
          dataResponse.json(),
          chartResponse.json()
        ]);

        // Update the machine's chart data with the fresh chart data
        const updatedMachine = {
          ...detailData.machine,
          chartData: chartData
        };

        setData({
          machine: updatedMachine,
          overdueBackups: detailData.overdueBackups,
          lastOverdueCheck: detailData.lastOverdueCheck
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error refreshing detail data:', error);
        setLastError(errorMessage);
        
        toast({
          title: "Update Failed",
          description: `Failed to refresh detail data: ${errorMessage}`,
          variant: "destructive",
          duration: 2000,
        });
      }
    };

    // Fetch data when global refresh is triggered
    if (state.isRefreshing && state.pageSpecificLoading.detail) {
      fetchData();
    }
  }, [state.isRefreshing, state.pageSpecificLoading.detail, state.lastRefresh, machineId, toast]);

  return (
    <div className="flex flex-col gap-8">
      {/* Error Alert */}
      {lastError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to update detail data: {lastError}
          </AlertDescription>
        </Alert>
      )}

      <MachineDetailsContent 
        machine={data.machine} 
        overdueBackups={data.overdueBackups} 
        lastOverdueCheck={data.lastOverdueCheck} 
      />
    </div>
  );
} 