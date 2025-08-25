"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DashboardAutoLayout } from './dashboard-auto-layout';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import type { MachineSummary, OverallSummary, ChartDataPoint } from '@/lib/types';

interface DashboardAutoAutoRefreshProps {
  initialData: {
    machinesSummary: MachineSummary[];
    overallSummary: OverallSummary;
    allMachinesChartData: ChartDataPoint[];
  };
}



export function DashboardAutoAutoRefresh({ initialData }: DashboardAutoAutoRefreshProps) {
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

  // Refresh function
  const refreshData = useCallback(async () => {
    if (isLoading) return;
    
    try {
      const [machinesResponse, summaryResponse, chartResponse] = await Promise.all([
        fetch('/api/machines-summary'),
        fetch('/api/summary'),
        fetch('/api/chart-data')
      ]);

      if (!machinesResponse.ok || !summaryResponse.ok || !chartResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [newMachinesSummary, newOverallSummary, newAllMachinesChartData] = await Promise.all([
        machinesResponse.json(),
        summaryResponse.json(),
        chartResponse.json()
      ]);
      
      // Compare data before updating to prevent unnecessary re-renders
      const machinesChanged = JSON.stringify(newMachinesSummary) !== JSON.stringify(machinesSummary);
      const summaryChanged = JSON.stringify(newOverallSummary) !== JSON.stringify(overallSummary);
      const chartDataChanged = JSON.stringify(newAllMachinesChartData) !== JSON.stringify(allMachinesChartData);
      
      // Only show loading and update if there are actual changes
      if (machinesChanged || summaryChanged || chartDataChanged) {
        setIsLoading(true);
        
        if (machinesChanged) setMachinesSummary(newMachinesSummary);
        if (summaryChanged) setOverallSummary(newOverallSummary);
        if (chartDataChanged) setAllMachinesChartData(newAllMachinesChartData);
        
        // Small delay to show loading state briefly
        setTimeout(() => setIsLoading(false), 100);
      }
      
      // Always update refresh time for the UI
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      setIsLoading(false);
    }
  }, [isLoading, machinesSummary, overallSummary, allMachinesChartData]);

  // Listen for global refresh events
  useEffect(() => {
    // When the global refresh completes for dashboard pages, refresh our data
    // We check for lastRefresh changes to catch when the refresh cycle completes
    if (state.lastRefresh && !state.isRefreshing && !state.pageSpecificLoading.dashboard) {
      // Add a small delay to ensure we don't conflict with the global refresh
      const timeoutId = setTimeout(() => {
        refreshData();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.lastRefresh, state.isRefreshing, state.pageSpecificLoading.dashboard, refreshData]);

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

  // Filter and aggregate chart data based on selection
  const filteredChartData = useMemo(() => {
    if (selectedMachineId) {
      // Filter data for the selected machine
      return allMachinesChartData.filter(item => item.machineId === selectedMachineId);
    } else {
      // Aggregate data by date when no machine is selected (sum all machines per date)
      const aggregatedMap = new Map<string, ChartDataPoint>();
      
      allMachinesChartData.forEach(item => {
        const existing = aggregatedMap.get(item.date);
        if (existing) {
          // Sum the numeric fields
          existing.uploadedSize += item.uploadedSize;
          existing.duration += item.duration;
          existing.fileCount += item.fileCount;
          existing.fileSize += item.fileSize;
          existing.storageSize += item.storageSize;
          existing.backupVersions += item.backupVersions;
        } else {
          // Create new aggregated entry (without machineId for aggregated data)
          aggregatedMap.set(item.date, {
            date: item.date,
            isoDate: item.isoDate,
            uploadedSize: item.uploadedSize,
            duration: item.duration,
            fileCount: item.fileCount,
            fileSize: item.fileSize,
            storageSize: item.storageSize,
            backupVersions: item.backupVersions
          });
        }
      });
      
      // Convert map to array and sort by date
      return Array.from(aggregatedMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
  }, [allMachinesChartData, selectedMachineId]);

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
    <DashboardAutoLayout
      data={{
        machinesSummary,
        overallSummary,
        allMachinesChartData
      }}
      selectedMachineId={selectedMachineId}
      selectedMachine={selectedMachine}
      machineBackups={machineBackups}
      chartData={filteredChartData}
      isLoading={isLoading}
      lastRefreshTime={lastRefreshTime}
      onMachineSelect={handleMachineSelect}
      onRefresh={refreshData}
    />
  );
}
