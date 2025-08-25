"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { MachineSummary, Backup, ChartDataPoint, MachineCardData, DashboardData } from "@/lib/types";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { Card, CardContent } from "@/components/ui/card";
import { MachineCards } from "./machine-cards";
import { MetricsChartsPanel } from "./metrics-charts-panel";





interface DashboardAutoLayoutProps {
  data: DashboardData;
  selectedMachineId?: string | null;
  selectedMachine?: MachineSummary | null;
  machineBackups: Backup[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  lastRefreshTime: Date;
  onMachineSelect: (machineId: string | null) => void;
  onRefresh: () => void;
}

export function DashboardAutoLayout({ 
  data, 
  selectedMachineId,
  selectedMachine,
  machineBackups,
  chartData,
  isLoading: _isLoading, // eslint-disable-line @typescript-eslint/no-unused-vars
  lastRefreshTime,
  onMachineSelect,
  onRefresh: _onRefresh // eslint-disable-line @typescript-eslint/no-unused-vars
}: DashboardAutoLayoutProps) {
  
  const [machineCardsData, setMachineCardsData] = useState<MachineCardData[]>([]);
  const [machineCardsLoading, setMachineCardsLoading] = useState(true);
  const previousMachineCardsDataRef = useRef<string>('');
  // Preserve visible card index across component remounts
  const [visibleCardIndex, setVisibleCardIndex] = useState<number>(0);
  
  // Handle visible card index changes
  const handleVisibleCardIndexChange = (index: number) => {
    setVisibleCardIndex(index);
  };

  // Fetch machine cards data on component mount and when refresh is triggered
  useEffect(() => {
    const fetchMachineCardsData = async () => {
      try {
        // Only show loading on initial load (when we have no data)
        const isInitialLoad = previousMachineCardsDataRef.current === '';
        if (isInitialLoad) {
          setMachineCardsLoading(true);
        }
        
        const response = await fetch('/api/machine-cards');
        if (response.ok) {
          const newData = await response.json();
          
          // Create a more comprehensive hash to detect actual data changes
          const newDataHash = JSON.stringify(newData.map((m: MachineCardData) => ({
            id: m.id,
            name: m.name,
            lastBackupStatus: m.lastBackupStatus,
            lastBackupDate: m.lastBackupDate,
            totalBackupCount: m.totalBackupCount,
            backupTypesCount: m.backupTypes.length,
            // Include a simplified version of backup types to detect changes
            backupTypes: m.backupTypes.map(bt => ({
              name: bt.name,
              lastBackupDate: bt.lastBackupDate,
              isBackupOverdue: bt.isBackupOverdue,
              statusHistoryLength: bt.statusHistory.length
            }))
          })));
          
          // Only update if there's an actual change in machine data or if this is the initial load
          if (newDataHash !== previousMachineCardsDataRef.current || isInitialLoad) {
            setMachineCardsData(newData);
            previousMachineCardsDataRef.current = newDataHash;
          }
        } else {
          console.error('Failed to fetch machine cards data');
        }
      } catch (error) {
        console.error('Error fetching machine cards data:', error);
      } finally {
        // Only set loading to false if we were actually loading
        if (previousMachineCardsDataRef.current === '' || machineCardsLoading) {
          setMachineCardsLoading(false);
        }
      }
    };

    fetchMachineCardsData();
  }, [lastRefreshTime, machineCardsLoading]);

  // Calculate machine-specific summary if a machine is selected
  const summary = useMemo(() => {
    if (selectedMachine && machineBackups.length > 0) {
      // Calculate machine-specific summary
      const machineSummary = {
        ...data.overallSummary,
        totalMachines: 1,
        totalBackups: machineBackups.length,
        totalUploadedSize: machineBackups.reduce((sum, backup) => sum + backup.uploadedSize, 0),
        totalStorageUsed: machineBackups.reduce((sum, backup) => sum + backup.fileSize, 0),
        totalBackupSize: machineBackups.reduce((sum, backup) => sum + backup.knownFileSize || 0, 0),
        overdueBackupsCount: machineBackups.filter(() => {
          // This would need proper overdue logic
          return false;
        }).length
      };
      return machineSummary;
    }
    return data.overallSummary;
  }, [data.overallSummary, selectedMachine, machineBackups]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] px-2 pb-4 overflow-hidden">
      {/* Top Row: Summary Cards - auto height */}
      <div>
        <DashboardSummaryCards summary={summary} />
      </div>
      
      {/* Machine Overview Panel - auto height */}
      <div className="mt-2 mb-2">
        <Card className="shadow-lg border-2 border-border">
          <CardContent className="p-4">
            {machineCardsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading machine data...</div>
              </div>
            ) : (
              <MachineCards 
                machines={machineCardsData} 
                selectedMachineId={selectedMachineId}
                onSelect={onMachineSelect}
                visibleCardIndex={visibleCardIndex}
                onVisibleCardIndexChange={handleVisibleCardIndexChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content: Metrics Panel - responsive height to fill remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Card className="h-full shadow-lg border-2 border-border">
          <CardContent className="h-full p-4">
            <MetricsChartsPanel 
              chartData={chartData} 
              selectedMachineId={selectedMachineId}
              selectedMachineName={selectedMachine?.name || null}
              lastRefreshTime={lastRefreshTime}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
