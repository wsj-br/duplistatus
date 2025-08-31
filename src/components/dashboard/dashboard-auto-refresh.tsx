"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardLayout } from './dashboard-layout';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import type { MachineSummary, OverallSummary, ChartDataPoint } from '@/lib/types';

interface DashboardAutoRefreshProps {
  initialData: {
    machinesSummary: MachineSummary[];
    overallSummary: OverallSummary;
    allMachinesChartData: ChartDataPoint[];
  };
}

export function DashboardAutoRefresh({ initialData }: DashboardAutoRefreshProps) {
  const { state } = useGlobalRefresh();
  
  // State for data
  const [machinesSummary, setMachinesSummary] = useState<MachineSummary[]>(initialData.machinesSummary);
  const [overallSummary, setOverallSummary] = useState<OverallSummary>(initialData.overallSummary);
  const [allMachinesChartData, setAllMachinesChartData] = useState<ChartDataPoint[]>(initialData.allMachinesChartData);
  
  // State for selection
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  
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
      
      // Fetch all required data
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

      // Update state with new data
      setMachinesSummary(machinesData);
      setOverallSummary(summaryData);
      setAllMachinesChartData(chartData);
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
      const { machinesSummary: newMachinesSummary, overallSummary: newOverallSummary, allMachinesChartData: newAllMachinesChartData } = state.dashboardData;
      
      // Compare data before updating to prevent unnecessary re-renders
      const machinesChanged = JSON.stringify(newMachinesSummary) !== JSON.stringify(machinesSummary);
      const summaryChanged = JSON.stringify(newOverallSummary) !== JSON.stringify(overallSummary);
      const chartDataChanged = JSON.stringify(newAllMachinesChartData) !== JSON.stringify(allMachinesChartData);
      
      // Only update if there are actual changes
      if (machinesChanged || summaryChanged || chartDataChanged) {
        if (machinesChanged) setMachinesSummary(newMachinesSummary);
        if (summaryChanged) setOverallSummary(newOverallSummary);
        if (chartDataChanged) setAllMachinesChartData(newAllMachinesChartData);
      }
      
      // Always update refresh time for the UI
      setLastRefreshTime(new Date());
    }
  }, [state.lastRefresh, state.isRefreshing, state.pageSpecificLoading.dashboard, state.dashboardData, machinesSummary, overallSummary, allMachinesChartData]);

  // Handle machine selection
  const handleMachineSelect = useCallback((machineId: string | null) => {
    if (selectedMachineId === machineId) {
      // Toggle off if same machine is clicked
      setSelectedMachineId(null);
    } else {
      // Select new machine
      setSelectedMachineId(machineId);
    }
  }, [selectedMachineId]);

  // We no longer need to filter chart data here, as the MetricsChartsPanel component now handles this internally

  // Get selected machine
  const selectedMachine = useMemo(() => {
    if (!selectedMachineId) return null;
    return machinesSummary.find(machine => machine.id === selectedMachineId) || null;
  }, [machinesSummary, selectedMachineId]);

  // Get all backups for the selected machine
  const machineBackups = useMemo(() => {
    if (!selectedMachine) return [];
    // This would need to be fetched from the database
    // For now, we'll return an empty array and handle this in the layout
    return [];
  }, [selectedMachine]);

  return (
    <DashboardLayout
      data={{
        machinesSummary,
        overallSummary,
        allMachinesChartData
      }}
      selectedMachineId={selectedMachineId}
      selectedMachine={selectedMachine}
      machineBackups={machineBackups}
      isLoading={isLoading}
      lastRefreshTime={lastRefreshTime}
      onMachineSelect={handleMachineSelect}
      onRefresh={refreshData}
    />
  );
}
