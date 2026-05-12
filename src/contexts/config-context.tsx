"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { defaultUIConfig, defaultOverdueTolerance } from '@/lib/default-config';
import type { OverdueTolerance, StartOfWeek, FormatLocaleOverride } from '@/lib/types';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { getUserLocalStorageItem, setUserLocalStorageItem, removeUserLocalStorageItem } from '@/lib/user-local-storage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLocale } from '@/contexts/locale-context';

type DatabaseCleanupPeriod = 'Delete all data' | '6 months' | '1 year' | '2 years';
export type TablePageSize = 5 | 10 | 15 | 20 | 25 | 30 | 40 | 50;
export type ChartTimeRange = '1 week' | '2 weeks' | '1 month' | '3 months';
export type ChartStyle = 'smooth-line' | 'bar';
type AutoRefreshInterval = 0.25 | 0.5 | 1 | 2 | 3 | 4 | 5 | 10;
type DashboardCardsSortOrder = 'Server name (a-z)' | 'Status (error>warnings>success)' | 'Last backup received (new>old)';

interface ConfigContextProps {
  databaseCleanupPeriod: DatabaseCleanupPeriod;
  setDatabaseCleanupPeriod: (period: DatabaseCleanupPeriod) => void;
  tablePageSize: TablePageSize;
  setTablePageSize: (size: TablePageSize) => void;
  chartTimeRange: ChartTimeRange;
  setChartTimeRange: (range: ChartTimeRange) => void;
  chartStyle: ChartStyle;
  setChartStyle: (style: ChartStyle) => void;
  autoRefreshInterval: AutoRefreshInterval;
  setAutoRefreshInterval: (interval: AutoRefreshInterval) => void;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  dashboardCardsSortOrder: DashboardCardsSortOrder;
  setDashboardCardsSortOrder: (order: DashboardCardsSortOrder) => void;
  startOfWeek: StartOfWeek;
  setStartOfWeek: (start: StartOfWeek) => void;
  formatLocale: FormatLocaleOverride;
  setFormatLocale: (locale: FormatLocaleOverride) => void;
  overdueTolerance: OverdueTolerance;
  refreshOverdueTolerance: () => Promise<void>;
  cleanupDatabase: () => Promise<void>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [databaseCleanupPeriod, setDatabaseCleanupPeriod] = useState<DatabaseCleanupPeriod>(defaultUIConfig.databaseCleanupPeriod);
  const [tablePageSize, setTablePageSize] = useState<TablePageSize>(defaultUIConfig.tablePageSize);
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>(defaultUIConfig.chartTimeRange);
  const [chartStyle, setChartStyle] = useState<ChartStyle>(defaultUIConfig.chartStyle);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<AutoRefreshInterval>(defaultUIConfig.autoRefreshInterval);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [dashboardCardsSortOrder, setDashboardCardsSortOrder] = useState<DashboardCardsSortOrder>(defaultUIConfig.dashboardCardsSortOrder);
  const [startOfWeek, setStartOfWeek] = useState<StartOfWeek>(defaultUIConfig.startOfWeek);
  const [formatLocale, setFormatLocale] = useState<FormatLocaleOverride>(defaultUIConfig.formatLocale);
  const [overdueTolerance, setOverdueTolerance] = useState<OverdueTolerance>(defaultOverdueTolerance);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useCurrentUser();
  // Use a ref to always access the latest currentUser value in callbacks
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const hasLoadedUserConfigRef = useRef(false);

  useEffect(() => {
    // Load saved settings from localStorage (only in browser environment)
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Wait for user to be loaded before loading settings.
    // undefined = still loading; null = loaded but unauthenticated.
    if (currentUser === undefined || hasLoadedUserConfigRef.current) {
      return;
    }

    // If not authenticated, just mark loading as done with defaults.
    if (currentUser === null) {
      hasLoadedUserConfigRef.current = true;
      setIsLoading(false);
      return;
    }

    hasLoadedUserConfigRef.current = true;
    const savedConfig = getUserLocalStorageItem('duplistatus-config', currentUser.id);
    if (savedConfig && savedConfig.trim() !== '') {
      try {
        const config = JSON.parse(savedConfig);
        if (config.databaseCleanupPeriod) setDatabaseCleanupPeriod(config.databaseCleanupPeriod);
        if (config.tablePageSize) setTablePageSize(config.tablePageSize);
        if (config.chartTimeRange) setChartTimeRange(config.chartTimeRange);
        if (config.chartStyle) setChartStyle(config.chartStyle);
        if (config.autoRefreshInterval) setAutoRefreshInterval(config.autoRefreshInterval);
        if (config.autoRefreshEnabled !== undefined) setAutoRefreshEnabled(config.autoRefreshEnabled);
        if (config.dashboardCardsSortOrder) setDashboardCardsSortOrder(config.dashboardCardsSortOrder);
        if (config.startOfWeek) setStartOfWeek(config.startOfWeek);
        if (config.formatLocale) setFormatLocale(config.formatLocale);
      } catch (error) {
        console.error('Failed to parse saved config from localStorage:', error);
        // Clear the invalid config from localStorage
        removeUserLocalStorageItem('duplistatus-config', currentUser.id);
      }
    }
    
    // Load tolerance from API
    const loadTolerance = async () => {
      try {
        const response = await authenticatedRequestWithRecovery('/api/configuration/overdue-tolerance');
        if (response.ok) {
          const data = await response.json();
          setOverdueTolerance(data.overdue_tolerance);
        } else {
          console.error('Failed to load tolerance config:', response.statusText);
          // Keep default value
        }
      } catch (error) {
        console.error('Failed to load tolerance config:', error);
        // Keep default value
      }
    };
    
    loadTolerance();
    
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    // Save settings to localStorage whenever they change (only in browser environment)
    // Only save when user is authenticated (not null/undefined)
    if (typeof window !== 'undefined' && currentUser) {
      setUserLocalStorageItem('duplistatus-config', currentUser.id, JSON.stringify({
        databaseCleanupPeriod,
        tablePageSize,
        chartTimeRange,
        chartStyle,
        autoRefreshInterval,
        autoRefreshEnabled,
        dashboardCardsSortOrder,
        startOfWeek,
        formatLocale,
      }));
    }
  }, [databaseCleanupPeriod, tablePageSize, chartTimeRange, chartStyle, autoRefreshInterval, autoRefreshEnabled, dashboardCardsSortOrder, startOfWeek, formatLocale, currentUser]);

  const cleanupDatabase = async () => {
    try {
      const response = await authenticatedRequestWithRecovery('/api/backups/cleanup', {
        method: 'POST',
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

  // Function to refresh overdue tolerance from API
  const refreshOverdueTolerance = async () => {
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/overdue-tolerance');
      if (response.ok) {
        const data = await response.json();
        setOverdueTolerance(data.overdue_tolerance);
      } else {
        console.error('Failed to refresh tolerance config:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to refresh tolerance config:', error);
    }
  };

  // Wrapped setters that immediately persist to localStorage.
  // This avoids race conditions where the user changes a setting before
  // currentUser has resolved, causing the change to not be persisted.
  const persistChartTimeRange = useCallback((range: ChartTimeRange) => {
    // Use ref to get latest currentUser value, avoiding closure staleness
    const latestUser = currentUserRef.current;
    setChartTimeRange(range);
    if (typeof window !== 'undefined') {
      const userId = latestUser?.id;
      if (userId) {
        try {
          const existing = getUserLocalStorageItem('duplistatus-config', userId);
          const config = existing ? JSON.parse(existing) : {};
          config.chartTimeRange = range;
          setUserLocalStorageItem('duplistatus-config', userId, JSON.stringify(config));
        } catch (error) {
          console.error('Failed to persist chartTimeRange:', error);
        }
      }
    }
  }, []); // No dependencies - uses ref for latest value

  const persistChartStyle = useCallback((style: ChartStyle) => {
    // Use ref to get latest currentUser value, avoiding closure staleness
    const latestUser = currentUserRef.current;
    setChartStyle(style);
    if (typeof window !== 'undefined') {
      const userId = latestUser?.id;
      if (userId) {
        try {
          const existing = getUserLocalStorageItem('duplistatus-config', userId);
          const config = existing ? JSON.parse(existing) : {};
          config.chartStyle = style;
          setUserLocalStorageItem('duplistatus-config', userId, JSON.stringify(config));
        } catch (error) {
          console.error('Failed to persist chartStyle:', error);
        }
      }
    }
  }, []); // No dependencies - uses ref for latest value

  return (
    <ConfigContext.Provider
      value={{
        databaseCleanupPeriod,
        setDatabaseCleanupPeriod,
        tablePageSize,
        setTablePageSize,
        chartTimeRange,
        setChartTimeRange: persistChartTimeRange,
        chartStyle,
        setChartStyle: persistChartStyle,
        autoRefreshInterval,
        setAutoRefreshInterval,
        autoRefreshEnabled,
        setAutoRefreshEnabled,
        dashboardCardsSortOrder,
        setDashboardCardsSortOrder,
        startOfWeek,
        setStartOfWeek,
        formatLocale,
        setFormatLocale,
        overdueTolerance,
        refreshOverdueTolerance,
        cleanupDatabase,
        isLoading,
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

/**
 * Returns the effective locale to use for date/time/number formatting.
 * If the user has set a format locale override, that locale is returned.
 * Otherwise, the UI language locale is used.
 */
export function useEffectiveFormatLocale(): string {
  const { formatLocale } = useConfig();
  const uiLocale = useLocale();
  return formatLocale === 'locale-default' ? uiLocale : formatLocale;
}
