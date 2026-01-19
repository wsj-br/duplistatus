"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useIntlayer } from 'react-intlayer';
import type { ServerSummary, Backup, DashboardData } from "@/lib/types";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { Card, CardContent } from "@/components/ui/card";
import { OverviewCards } from "./overview-cards";
import { MetricsChartsPanel } from "@/components/metrics-charts-panel";
import { OverviewStatusPanel } from "./overview-status-cards";
import { OverviewChartsPanel } from "./overview-charts-panel";
import { OverviewSidePanelToggle } from "@/components/ui/overview-side-panel-toggle";
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
  isLoading: _isLoading,
  lastRefreshTime: _lastRefreshTime,
  onServerSelect,
  onRefresh: _onRefresh
}: DashboardLayoutProps) {
  const common = useIntlayer('common');
  const { state: serverSelectionState, setSelectedServerId, setViewMode, setServers } = useServerSelection();
  const { viewMode, isInitialized, overviewSidePanel } = serverSelectionState;
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
  // Overview view uses content-based height when screen height < 720px
  const useContentBasedHeight = viewMode === 'table' || (viewMode === 'overview' && screenHeight < 720) || screenHeight < 865;
  
  // Use refs to track initialization and prevent infinite loops
  const previousSelectedServerId = useRef<string | null>(null);
  const previousServersData = useRef<string>('');
  
  // Get visible card index from global context instead of local state
  const visibleCardIndex = globalRefreshState.visibleCardIndex;

  // Handle view mode changes
  const handleViewModeChange = (newViewMode: 'table' | 'overview') => {
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
        totalBackupsRuns: serverBackups.length,
        totalBackups: data.overallSummary.totalBackups, // Keep the overall totalBackups count
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
                <div className="text-muted-foreground">{common.status.loading}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Card className="h-full shadow-lg border-2 border-border">
            <CardContent className="h-full p-0">
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">{common.status.loading}</div>
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
        : viewMode === 'overview'
          ? useContentBasedHeight 
            ? 'min-h-screen' // Allow content-based height when screen is narrow
            : 'h-[calc(100vh-4rem)] overflow-hidden min-h-[720px]' // Fit exactly into viewport in overview view
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
      
      {/* Overview Layout */}
      {viewMode === 'overview' ? (
        <div className={`flex flex-col md:flex-row gap-3 mt-2 mb-4 flex-1 min-h-0 ${
          useContentBasedHeight ? 'min-h-fit' : 'h-full'
        }`}>
          {/* Left Panel: Overview Cards - 80% width */}
          <div className={`${useContentBasedHeight ? 'w-full md:w-[80%]' : 'w-[80%]'} ${
            useContentBasedHeight ? 'min-h-[400px]' : 'h-full'
          }`}>
            <Card className="shadow-lg border-2 border-border h-full">
              <CardContent className="p-2 h-full">
                <OverviewCards 
                  servers={data.serversSummary}
                  selectedServerId={selectedServerId}
                  onSelect={onServerSelect}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Right Panel: Overview Charts - 20% width */}
          <div className={`${useContentBasedHeight ? 'w-full md:w-[20%]' : 'w-[20%]'} ${
            useContentBasedHeight ? 'min-h-[400px]' : 'h-full'
          }`} data-screenshot-target="overview-side-panel">
            <Card className="shadow-lg border-2 border-border h-full relative">
              <OverviewSidePanelToggle />
              <CardContent className="p-0 h-full">
                {overviewSidePanel === 'status' ? (
                  <OverviewStatusPanel servers={data.serversSummary} totalBackups={summary.totalBackups} />
                ) : (
                  <OverviewChartsPanel 
                    serverId={selectedServerId || undefined}
                    chartData={selectedServerId ? undefined : data.allServersChartData}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          {/* Table View - Server Overview Panel - auto height */}
          <div className="mt-2 mb-2">
            <Card className="shadow-lg border-2 border-border">
              <CardContent className="p-4">
                <DashboardTable servers={data.serversSummary} />
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
        </>
      )}
    </div>
  );
}
