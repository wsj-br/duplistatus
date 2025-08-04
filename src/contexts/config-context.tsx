"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { defaultUIConfig } from '@/lib/default-config';

type DatabaseCleanupPeriod = 'Delete all data' | '6 months' | '1 year' | '2 years';
type TablePageSize = 5 | 10 | 15 | 20;
type ChartTimeRange = '2 weeks' | '1 month' | '3 months' | '6 months' | '1 year' | '2 years' | 'All data';
export type ChartMetricSelection = 'uploadedSize' | 'duration' | 'fileCount' | 'fileSize' | 'storageSize' | 'backupVersions';
type AutoRefreshInterval = 0.25 | 0.5 | 1 | 2 | 3 | 4 | 5 | 10;

interface ConfigContextProps {
  databaseCleanupPeriod: DatabaseCleanupPeriod;
  setDatabaseCleanupPeriod: (period: DatabaseCleanupPeriod) => void;
  tablePageSize: TablePageSize;
  setTablePageSize: (size: TablePageSize) => void;
  chartTimeRange: ChartTimeRange;
  setChartTimeRange: (range: ChartTimeRange) => void;
  chartMetricSelection: ChartMetricSelection;
  setChartMetricSelection: (metric: ChartMetricSelection) => void;
  autoRefreshInterval: AutoRefreshInterval;
  setAutoRefreshInterval: (interval: AutoRefreshInterval) => void;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  cleanupDatabase: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [databaseCleanupPeriod, setDatabaseCleanupPeriod] = useState<DatabaseCleanupPeriod>(defaultUIConfig.databaseCleanupPeriod);
  const [tablePageSize, setTablePageSize] = useState<TablePageSize>(defaultUIConfig.tablePageSize);
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>(defaultUIConfig.chartTimeRange);
  const [chartMetricSelection, setChartMetricSelection] = useState<ChartMetricSelection>(defaultUIConfig.chartMetricSelection);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<AutoRefreshInterval>(defaultUIConfig.autoRefreshInterval);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Load saved settings from localStorage
    const savedConfig = localStorage.getItem('duplistatus-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.databaseCleanupPeriod) setDatabaseCleanupPeriod(config.databaseCleanupPeriod);
      if (config.tablePageSize) setTablePageSize(config.tablePageSize);
      if (config.chartTimeRange) setChartTimeRange(config.chartTimeRange);
      if (config.chartMetricSelection) setChartMetricSelection(config.chartMetricSelection);
      if (config.autoRefreshInterval) setAutoRefreshInterval(config.autoRefreshInterval);
      if (config.autoRefreshEnabled !== undefined) setAutoRefreshEnabled(config.autoRefreshEnabled);
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('duplistatus-config', JSON.stringify({
      databaseCleanupPeriod,
      tablePageSize,
      chartTimeRange,
      chartMetricSelection,
      autoRefreshInterval,
      autoRefreshEnabled,
    }));
  }, [databaseCleanupPeriod, tablePageSize, chartTimeRange, chartMetricSelection, autoRefreshInterval, autoRefreshEnabled]);

  const cleanupDatabase = async () => {
    try {
      const response = await fetch('/api/backups/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ retentionPeriod: databaseCleanupPeriod }),
      });

      if (!response.ok) {
        // Get detailed error information if available
        let errorDetails = 'Failed to cleanup database';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorDetails = errorData.details || errorData.error;
          }
        } catch {
          // If we can't parse the JSON, use the status text
          errorDetails = `Failed to cleanup database: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorDetails);
      }

      // Always refresh the page after cleanup to update data
      router.refresh();
      
      // For detail pages, also do a full reload to ensure data and pagination are reset
      if (pathname && pathname.startsWith('/detail/')) {
        // Wait a short delay for router.refresh() to complete first
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error cleaning up database:', error instanceof Error ? error.message : String(error));
      throw error; // Re-throw the error so the component can handle it
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        databaseCleanupPeriod,
        setDatabaseCleanupPeriod,
        tablePageSize,
        setTablePageSize,
        chartTimeRange,
        setChartTimeRange,
        chartMetricSelection,
        setChartMetricSelection,
        autoRefreshInterval,
        setAutoRefreshInterval,
        autoRefreshEnabled,
        setAutoRefreshEnabled,
        cleanupDatabase,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}; 