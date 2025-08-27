"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useConfig } from './config-context';
import type { MachineSummary, OverallSummary, ChartDataPoint } from '@/lib/types';

type PageType = 'dashboard' | 'detail' | 'none';

interface GlobalRefreshState {
  isEnabled: boolean;
  interval: number;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  currentPage: PageType;
  isRefreshing: boolean;
  pageSpecificLoading: {
    dashboard: boolean;
    detail: boolean;
  };
  refreshInProgress: boolean;
  // Store fetched data to avoid duplicate API calls
  dashboardData: {
    machinesSummary: MachineSummary[];
    overallSummary: OverallSummary;
    allMachinesChartData: ChartDataPoint[];
  } | null;
}

interface GlobalRefreshContextProps {
  state: GlobalRefreshState;
  refreshDashboard: () => Promise<void>;
  refreshDetail: (machineId: string) => Promise<void>;
  toggleAutoRefresh: () => void;
  getCurrentPageType: () => PageType;
}

const GlobalRefreshContext = createContext<GlobalRefreshContextProps | undefined>(undefined);

export const GlobalRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const { autoRefreshEnabled, setAutoRefreshEnabled, autoRefreshInterval } = useConfig();
  const pathname = usePathname();
  
  const [state, setState] = useState<GlobalRefreshState>({
    isEnabled: autoRefreshEnabled,
    interval: autoRefreshInterval,
    lastRefresh: null,
    nextRefresh: null,
    currentPage: 'none',
    isRefreshing: false,
    pageSpecificLoading: {
      dashboard: false,
      detail: false,
    },
    refreshInProgress: false,
    dashboardData: null,
  });

  // Update state when config changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isEnabled: autoRefreshEnabled,
      interval: autoRefreshInterval,
    }));
  }, [autoRefreshEnabled, autoRefreshInterval]);

  // Determine current page type
  const getCurrentPageType = useCallback((): PageType => {
    if (pathname === '/') return 'dashboard';
    // Only show on main detail pages, not on backup detail pages
    if (pathname.startsWith('/detail/') && !pathname.includes('/backup/')) return 'detail';
    return 'none';
  }, [pathname]);

  // Update current page when pathname changes
  useEffect(() => {
    const pageType = getCurrentPageType();
    setState(prev => ({
      ...prev,
      currentPage: pageType,
    }));
  }, [pathname, getCurrentPageType]);

  const refreshDashboard = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        pageSpecificLoading: { ...prev.pageSpecificLoading, dashboard: true },
        refreshInProgress: true,
      }));

      // Fetch dashboard data and parse JSON responses
      const [machinesResponse, summaryResponse, chartResponse] = await Promise.all([
        fetch('/api/machines-summary'),
        fetch('/api/summary'),
        fetch('/api/chart-data')
      ]);

      if (!machinesResponse.ok || !summaryResponse.ok || !chartResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      // Parse JSON responses to ensure they are valid
      const [machinesData, summaryData, chartData] = await Promise.all([
        machinesResponse.json(),
        summaryResponse.json(),
        chartResponse.json()
      ]);

      // Validate that we got valid data
      if (!machinesData || !summaryData || !Array.isArray(chartData)) {
        throw new Error('Invalid data received from API');
      }

      setState(prev => ({
        ...prev,
        lastRefresh: new Date(),
        nextRefresh: new Date(Date.now() + prev.interval * 60 * 1000),
        isRefreshing: false,
        pageSpecificLoading: { ...prev.pageSpecificLoading, dashboard: false },
        refreshInProgress: false,
        dashboardData: {
          machinesSummary: machinesData,
          overallSummary: summaryData,
          allMachinesChartData: chartData,
        },
      }));
    } catch (error) {
      console.error('Error refreshing dashboard:', error instanceof Error ? error.message : String(error));
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        pageSpecificLoading: { ...prev.pageSpecificLoading, dashboard: false },
        refreshInProgress: false,
      }));
    }
  }, []);

  const refreshDetail = useCallback(async (machineId: string) => {
    try {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        pageSpecificLoading: { ...prev.pageSpecificLoading, detail: true },
        refreshInProgress: true,
      }));

      // Fetch detail page data and parse JSON responses
      const [dataResponse, chartResponse] = await Promise.all([
        fetch(`/api/detail/${machineId}/data`),
        fetch(`/api/detail/${machineId}/chart-data`)
      ]);

      if (!dataResponse.ok || !chartResponse.ok) {
        throw new Error('Failed to fetch detail data');
      }

      // Parse JSON responses to ensure they are valid
      const [detailData, chartData] = await Promise.all([
        dataResponse.json(),
        chartResponse.json()
      ]);

      // Validate that we got valid data
      if (!detailData || !Array.isArray(chartData)) {
        throw new Error('Invalid data received from API');
      }

      setState(prev => ({
        ...prev,
        lastRefresh: new Date(),
        nextRefresh: new Date(Date.now() + prev.interval * 60 * 1000),
        isRefreshing: false,
        pageSpecificLoading: { ...prev.pageSpecificLoading, detail: false },
        refreshInProgress: false,
      }));
    } catch (error) {
      console.error('Error refreshing detail page:', error instanceof Error ? error.message : String(error));
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        pageSpecificLoading: { ...prev.pageSpecificLoading, detail: false },
        refreshInProgress: false,
      }));
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!state.isEnabled || state.currentPage === 'none') return;

    const intervalMs = state.interval * 60 * 1000; // interval is in minutes
    const interval = setInterval(() => {
      if (state.currentPage === 'dashboard') {
        refreshDashboard();
      } else if (state.currentPage === 'detail') {
        // For detail pages, we need the machineId from the URL
        // Only match main detail pages, not backup detail pages
        const match = pathname.match(/^\/detail\/([^\/]+)$/);
        if (match) {
          refreshDetail(match[1]);
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [state.isEnabled, state.interval, state.currentPage, pathname, refreshDashboard, refreshDetail]);

  const toggleAutoRefresh = () => {
    const newEnabled = !state.isEnabled;
    setAutoRefreshEnabled(newEnabled);
    setState(prev => ({
      ...prev,
      isEnabled: newEnabled,
    }));
  };

  return (
    <GlobalRefreshContext.Provider
      value={{
        state,
        refreshDashboard,
        refreshDetail,
        toggleAutoRefresh,
        getCurrentPageType,
      }}
    >
      {children}
    </GlobalRefreshContext.Provider>
  );
};

export const useGlobalRefresh = () => {
  const context = useContext(GlobalRefreshContext);
  if (context === undefined) {
    throw new Error('useGlobalRefresh must be used within a GlobalRefreshProvider');
  }
  return context;
}; 