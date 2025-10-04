"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import type { ServerSummary, OverallSummary, ChartDataPoint } from '@/lib/types';

interface DashboardAutoRefreshProps {
  initialData: {
    serversSummary: ServerSummary[];
    overallSummary: OverallSummary;
    allServersChartData: ChartDataPoint[];
  };
}

export function DashboardAutoRefresh({ initialData }: DashboardAutoRefreshProps) {
  const { state } = useGlobalRefresh();
  
  // State for data
  const [serversSummary, setServersSummary] = useState<ServerSummary[]>(initialData.serversSummary);
  const [overallSummary, setOverallSummary] = useState<OverallSummary>(initialData.overallSummary);
  const [allServersChartData, setAllServersChartData] = useState<ChartDataPoint[]>(initialData.allServersChartData);
  
  // State for selection
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(() => {
    // Use a stable timestamp to prevent hydration mismatches
    // We'll set the actual time after the component mounts
    return new Date(0);
  });

  // Set the actual refresh time after component mounts
  useEffect(() => {
    setLastRefreshTime(new Date());
  }, []);

  // Refresh function - used only for manual refresh (user clicking refresh button)
  const refreshData = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous refreshes
    
    try {
      setIsLoading(true);
      
      // Fetch consolidated dashboard data
      const dashboardResponse = await authenticatedRequestWithRecovery('/api/dashboard');

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await dashboardResponse.json();

      // Extract individual data components for backward compatibility
      const machinesData = dashboardData.serversSummary;
      const summaryData = dashboardData.overallSummary;
      const chartData = dashboardData.chartData;

      // Update state with new data
      setServersSummary(machinesData);
      setOverallSummary(summaryData);
      setAllServersChartData(chartData);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Listen for global refresh events
  useEffect(() => {
    // When the global refresh completes for dashboard pages, use the data from the context
    // instead of making duplicate API calls
    if (state.lastRefresh && !state.isRefreshing && !state.pageSpecificLoading.dashboard && state.dashboardData) {
      // Use the data from global refresh context to avoid duplicate API calls
      const { serversSummary: newServersSummary, overallSummary: newOverallSummary, allServersChartData: newAllServersChartData } = state.dashboardData;
      
      // Compare data before updating to prevent unnecessary re-renders
      const serversChanged = JSON.stringify(newServersSummary) !== JSON.stringify(serversSummary);
      const summaryChanged = JSON.stringify(newOverallSummary) !== JSON.stringify(overallSummary);
      const chartDataChanged = JSON.stringify(newAllServersChartData) !== JSON.stringify(allServersChartData);
      
      // Only update if there are actual changes
      if (serversChanged || summaryChanged || chartDataChanged) {
        if (serversChanged) setServersSummary(newServersSummary);
        if (summaryChanged) setOverallSummary(newOverallSummary);
        if (chartDataChanged) setAllServersChartData(newAllServersChartData);
      }
      
      // Always update refresh time for the UI
      setLastRefreshTime(new Date());
    }
  }, [state.lastRefresh, state.isRefreshing, state.pageSpecificLoading.dashboard, state.dashboardData, serversSummary, overallSummary, allServersChartData]);

  // Handle server selection
  const handleServerSelect = useCallback((serverId: string | null) => {
    if (selectedServerId === serverId) {
      // Toggle off if same server is clicked
      setSelectedServerId(null);
    } else {
      // Select new server
      setSelectedServerId(serverId);
    }
  }, [selectedServerId]);

  // We no longer need to filter chart data here, as the MetricsChartsPanel component now handles this internally

  // Get selected server
  const selectedServer = useMemo(() => {
    if (!selectedServerId) return null;
    return serversSummary.find(server => server.id === selectedServerId) || null;
  }, [serversSummary, selectedServerId]);

  // Get all backups for the selected server
  const serverBackups = useMemo(() => {
    if (!selectedServer) return [];
    // This would need to be fetched from the database
    // For now, we'll return an empty array and handle this in the layout
    return [];
  }, [selectedServer]);

  return (
    <DashboardLayout
      data={{
        serversSummary,
        overallSummary,
        allServersChartData
      }}
      selectedServerId={selectedServerId}
      selectedServer={selectedServer}
      serverBackups={serverBackups}
      isLoading={isLoading}
      lastRefreshTime={lastRefreshTime}
      onServerSelect={handleServerSelect}
      onRefresh={refreshData}
    />
  );
}
