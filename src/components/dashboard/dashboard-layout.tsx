"use client";

import { useMemo, useState, useEffect } from "react";
import type { MachineSummary, Backup, DashboardData } from "@/lib/types";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { Card, CardContent } from "@/components/ui/card";
import { MachineCards } from "./machine-cards";
import { MetricsChartsPanel } from "@/components/metrics-charts-panel";

interface DashboardLayoutProps {
  data: DashboardData;
  selectedMachineId?: string | null;
  selectedMachine?: MachineSummary | null;
  machineBackups: Backup[];
  isLoading: boolean;
  lastRefreshTime: Date;
  onMachineSelect: (machineId: string | null) => void;
  onRefresh: () => void;
}

export function DashboardLayout({ 
  data, 
  selectedMachineId,
  selectedMachine,
  machineBackups,
  isLoading: _isLoading, // eslint-disable-line @typescript-eslint/no-unused-vars
  lastRefreshTime,
  onMachineSelect,
  onRefresh: _onRefresh // eslint-disable-line @typescript-eslint/no-unused-vars
}: DashboardLayoutProps) {
  
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  // Preserve visible card index across component remounts
  const [visibleCardIndex, setVisibleCardIndex] = useState<number>(0);
  
  // Handle visible card index changes
  const handleVisibleCardIndexChange = (index: number) => {
    setVisibleCardIndex(index);
  };

  // Handle view mode changes
  const handleViewModeChange = (newViewMode: 'cards' | 'table') => {
    setViewMode(newViewMode);
  };

  // Load view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('dashboard-view-mode');
    if (savedViewMode === 'cards' || savedViewMode === 'table') {
      setViewMode(savedViewMode);
    }
  }, []);

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
    <div className={`flex flex-col px-2 pb-4 ${
      viewMode === 'table' 
        ? 'min-h-screen' // Allow content to extend beyond viewport for table view
        : 'h-[calc(100vh-4rem)] overflow-hidden' // Fit exactly into viewport in cards view
    }`}>
      {/* Top Row: Summary Cards - auto height */}
      <div>
        <DashboardSummaryCards 
          summary={summary} 
          onViewModeChange={handleViewModeChange}
          defaultViewMode={viewMode}
        />
      </div>
      
      {/* Machine Overview Panel - auto height */}
      <div className="mt-2 mb-2">
        <Card className="shadow-lg border-2 border-border">
          <CardContent className="p-4">
            {viewMode === 'cards' ? (
              <MachineCards 
                machines={data.machinesSummary} 
                selectedMachineId={selectedMachineId}
                onSelect={onMachineSelect}
                visibleCardIndex={visibleCardIndex}
                onVisibleCardIndexChange={handleVisibleCardIndexChange}
              />
            ) : (
              <DashboardTable machines={data.machinesSummary} />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content: Metrics Panel - responsive height to fill remaining space */}
      <div className={`${viewMode === 'table' ? 'min-h-[550px]' : 'flex-1 min-h-0 overflow-hidden'}`}>
        <Card className={`${viewMode === 'table' ? 'min-h-[550px] h-[550px]' : 'h-full'} shadow-lg border-2 border-border`}>
          <CardContent className={`${viewMode === 'table' ? 'min-h-[550px] h-[550px]' : 'h-full'} p-0`}>
            <MetricsChartsPanel
              machineId={selectedMachineId || undefined}
              lastRefreshTime={lastRefreshTime}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
