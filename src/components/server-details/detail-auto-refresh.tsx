"use client";

import { useState, useEffect, useRef } from 'react';
import { ServerDetailsContent } from "@/components/server-details/server-details-content";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { useToast } from "@/components/ui/use-toast";
import { authenticatedRequestWithRecovery } from "@/lib/client-session-csrf";
import { useParams } from 'next/navigation';
import type { Server } from "@/lib/types";

interface OverdueBackup {
  serverName: string;
  backupName: string;
  lastBackupDate: string;
  lastNotificationSent: string;
  notificationEvent?: string;
  expectedBackupDate: string;
  expectedBackupElapsed: string;
}

interface DetailData {
  server: Server;
  overdueBackups: OverdueBackup[];
  lastOverdueCheck: string;
}

interface DetailAutoRefreshProps {
  initialData: DetailData;
}

export function DetailAutoRefresh({ initialData }: DetailAutoRefreshProps) {
  const [data, setData] = useState<DetailData>(initialData);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const lastDataRef = useRef<string>('');
  
  const { state } = useGlobalRefresh();
  const { toast } = useToast();
  const params = useParams();
  const serverId = params.serverId as string;

  // Listen for refresh events from global refresh context
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLastError(null);
        
        // Only fetch basic server data - chart data is handled by MetricsChartsPanel
        const dataResponse = await authenticatedRequestWithRecovery(`/api/detail/${serverId}`);

        if (!dataResponse.ok) {
          throw new Error('Failed to fetch detail data');
        }

        const detailData = await dataResponse.json();

        const newData = {
          server: detailData.server,
          overdueBackups: detailData.overdueBackups,
          lastOverdueCheck: detailData.lastOverdueCheck
        };
        
        // Compare data before updating to prevent unnecessary re-renders
        const newDataString = JSON.stringify(newData);
        if (newDataString !== lastDataRef.current) {
          setData(newData);
          lastDataRef.current = newDataString;
        }
        
        // Update last refresh time
        setLastRefreshTime(new Date());
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error refreshing detail data:', error);
        setLastError(errorMessage);
        
        toast({
          title: "Update Failed",
          description: `Failed to refresh detail data: ${errorMessage}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    // Only fetch data when global refresh completes and no refresh is in progress
    // This prevents race conditions with the global refresh context
    if (!state.isRefreshing && !state.pageSpecificLoading.detail && !state.refreshInProgress && state.lastRefresh) {
      fetchData();
    }
  }, [state.isRefreshing, state.pageSpecificLoading.detail, state.refreshInProgress, state.lastRefresh, serverId, toast]);

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

      <ServerDetailsContent 
        server={data.server} 
        overdueBackups={data.overdueBackups} 
        lastOverdueCheck={data.lastOverdueCheck}
        lastRefreshTime={lastRefreshTime}
      />
    </div>
  );
} 