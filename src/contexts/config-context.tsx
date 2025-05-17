"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type BackupRetentionPeriod = 'Delete all data' | '6 months' | '1 year' | '2 years';
type TablePageSize = 5 | 10 | 15 | 20;
type ChartTimeRange = '2 weeks' | '1 month' | '3 months' | '6 months' | '1 year' | '2 years' | 'All data';

interface ConfigContextProps {
  backupRetentionPeriod: BackupRetentionPeriod;
  setBackupRetentionPeriod: (period: BackupRetentionPeriod) => void;
  tablePageSize: TablePageSize;
  setTablePageSize: (size: TablePageSize) => void;
  chartTimeRange: ChartTimeRange;
  setChartTimeRange: (range: ChartTimeRange) => void;
  deleteOldBackups: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [backupRetentionPeriod, setBackupRetentionPeriod] = useState<BackupRetentionPeriod>('2 years');
  const [tablePageSize, setTablePageSize] = useState<TablePageSize>(5);
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>('1 month');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Load saved settings from localStorage
    const savedConfig = localStorage.getItem('duplidash-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.backupRetentionPeriod) setBackupRetentionPeriod(config.backupRetentionPeriod);
      if (config.tablePageSize) setTablePageSize(config.tablePageSize);
      if (config.chartTimeRange) setChartTimeRange(config.chartTimeRange);
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('duplidash-config', JSON.stringify({
      backupRetentionPeriod,
      tablePageSize,
      chartTimeRange,
    }));
  }, [backupRetentionPeriod, tablePageSize, chartTimeRange]);

  const deleteOldBackups = async () => {
    try {
      const response = await fetch('/api/backups/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ retentionPeriod: backupRetentionPeriod }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete old backups');
      }

      // Always refresh the page after deletion to update data
      router.refresh();
      
      // For detail pages, also do a full reload to ensure data and pagination are reset
      if (pathname && pathname.startsWith('/detail/')) {
        // Wait a short delay for router.refresh() to complete first
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting old backups:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        backupRetentionPeriod,
        setBackupRetentionPeriod,
        tablePageSize,
        setTablePageSize,
        chartTimeRange,
        setChartTimeRange,
        deleteOldBackups,
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