"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import type { ServerSummary, Backup, DashboardData } from "@/lib/types";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { Card, CardContent } from "@/components/ui/card";
import { ServerCards } from "./server-cards";
import { MetricsChartsPanel } from "@/components/metrics-charts-panel";
import { useServerSelection } from "@/contexts/server-selection-context";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";

interface DashboardLayoutProps {
  data: DashboardData;
  selectedServerId?: string | null;
  selectedServer?: ServerSummary | null;
  serverBackups: Backup[];
  isLoading: boolean;
  lastRefreshTime: Date;
  onServerSelect: (serverId: string | null) => void;
  onRefresh: () => void;
}

export function DashboardLayout({ 
  data, 
  selectedServerId,
  selectedServer,
  serverBackups,
  isLoading: _isLoading, // eslint-disable-line @typescript-eslint/no-unused-vars
  lastRefreshTime: _lastRefreshTime, // eslint-disable-line @typescript-eslint/no-unused-vars
  onServerSelect,
  onRefresh: _onRefresh // eslint-disable-line @typescript-eslint/no-unused-vars
}: DashboardLayoutProps) {
  const { state: serverSelectionState, setSelectedServerId, setViewMode, setServers } = useServerSelection();
  const { viewMode, isInitialized } = serverSelectionState;
  const { state: globalRefreshState, setVisibleCardIndex } = useGlobalRefresh();
  
  // Track screen height for responsive height behavior
  const [screenHeight, setScreenHeight] = useState<number>(0);
  
  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight);
    };

    // Set initial height
    updateScreenHeight();

    // Add event listener
    window.addEventListener('resize', updateScreenHeight);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenHeight);
  }, []);
  
  // Determine if we should use content-based height (when screen height < 865px)
  // Table view always uses content-based height regardless of window height
  const useContentBasedHeight = viewMode === 'table' || screenHeight < 865;
  
  // Use refs to track initialization and prevent infinite loops
  const previousSelectedServerId = useRef<string | null>(null);
  const previousServersData = useRef<string>('');
  
  // Get visible card index from global context instead of local state
  const visibleCardIndex = globalRefreshState.visibleCardIndex;

  // Handle view mode changes
  const handleViewModeChange = (newViewMode: 'cards' | 'table') => {
    setViewMode(newViewMode);
  };

  // Update context when selected server changes (only if actually changed)
  useEffect(() => {
    if (previousSelectedServerId.current !== selectedServerId) {
      setSelectedServerId(selectedServerId || null);
      previousSelectedServerId.current = selectedServerId || null;
    }
  }, [selectedServerId, setSelectedServerId]);

  // Update context when servers data changes (only if actually changed)
  useEffect(() => {
    const serversDataString = JSON.stringify(data.serversSummary);
    if (previousServersData.current !== serversDataString) {
      setServers(data.serversSummary);
      previousServersData.current = serversDataString;
    }
  }, [data.serversSummary, setServers]);

  // Calculate server-specific summary if a server is selected
  const summary = useMemo(() => {
    if (selectedServer && serverBackups.length > 0) {
      // Calculate server-specific summary
      const serverSummary = {
        ...data.overallSummary,
        totalServers: 1,
        totalBackups: serverBackups.length,
        totalUploadedSize: serverBackups.reduce((sum, backup) => sum + backup.uploadedSize, 0),
        totalBackupSize: serverBackups.reduce((sum, backup) => sum + backup.knownFileSize || 0, 0),
        overdueBackupsCount: serverBackups.filter(() => {
          // This would need proper overdue logic
          return false;
        }).length
      };
      return serverSummary;
    }
    return data.overallSummary;
  }, [data.overallSummary, selectedServer, serverBackups]);

  // Don't render until the view mode is initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="flex flex-col px-2 pb-4 h-[calc(100vh-4rem)] overflow-hidden">
        <div>
          <DashboardSummaryCards 
            summary={summary} 
            onViewModeChange={handleViewModeChange}
          />
        </div>
        <div className="mt-2 mb-2">
          <Card className="shadow-lg border-2 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Card className="h-full shadow-lg border-2 border-border">
            <CardContent className="h-full p-0">
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col px-2 pb-4 
      ${viewMode === 'table' 
        ? 'min-h-screen' // Allow content to extend beyond viewport for table view
        : useContentBasedHeight 
          ? 'min-h-screen' // Allow content-based height when screen is narrow
          : 'h-[calc(100vh-4rem)] overflow-hidden' // Fit exactly into viewport in cards view
      }`}>
      {/* Top Row: Summary Cards - auto height */}
      <div>
        <DashboardSummaryCards 
          summary={summary} 
          onViewModeChange={handleViewModeChange}
        />
      </div>
      
      {/* Server Overview Panel - auto height */}
      <div className="mt-2 mb-2">
        <Card className="shadow-lg border-2 border-border">
          <CardContent className="p-4">
            {viewMode === 'cards' ? (
              <ServerCards 
                servers={data.serversSummary} 
                selectedServerId={selectedServerId}
                onSelect={onServerSelect}
                visibleCardIndex={visibleCardIndex}
                onVisibleCardIndexChange={setVisibleCardIndex}
              />
            ) : (
              <DashboardTable servers={data.serversSummary} />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content: Metrics Panel - responsive height to fill remaining space */}
      <div className={`${viewMode === 'table' 
        ? 'min-h-[550px]' 
        : useContentBasedHeight 
          ? 'min-h-fit' 
          : 'flex-1 min-h-0 overflow-hidden pb-4'
      }`}>
        <Card className={`${viewMode === 'table' 
          ? 'min-h-[550px] h-[550px]' 
          : useContentBasedHeight 
            ? 'min-h-fit' 
            : 'h-full'
        } shadow-lg border-2 border-border`}>
          <CardContent className={`${viewMode === 'table' 
            ? 'min-h-[550px] h-[550px]' 
            : useContentBasedHeight 
              ? 'min-h-fit' 
              : 'h-full'
          } p-0`}>
            <MetricsChartsPanel
              serverId={selectedServerId || undefined}
              chartData={selectedServerId ? undefined : data.allServersChartData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
