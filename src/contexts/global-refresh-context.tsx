"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useConfig } from './config-context';
import { useConfiguration } from './configuration-context';
import type { ServerSummary, OverallSummary, ChartDataPoint } from '@/lib/types';

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
    serversSummary: ServerSummary[];
    overallSummary: OverallSummary;
    allServersChartData: ChartDataPoint[];
  } | null;
  // Persist scroll position across data refreshes
  visibleCardIndex: number;
}

interface GlobalRefreshContextProps {
  state: GlobalRefreshState;
  refreshDashboard: () => Promise<void>;
  refreshDetail: (serverId: string) => Promise<void>;
  toggleAutoRefresh: () => void;
  getCurrentPageType: () => PageType;
  setVisibleCardIndex: (index: number) => void;
}

const GlobalRefreshContext = createContext<GlobalRefreshContextProps | undefined>(undefined);

export const GlobalRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const { autoRefreshEnabled, setAutoRefreshEnabled, autoRefreshInterval } = useConfig();
  const { refreshConfigSilently } = useConfiguration();
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
    visibleCardIndex: 0,
  });

  // Track previous pathname to detect navigation back to dashboard
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);

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

  const refreshDashboard = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        pageSpecificLoading: { ...prev.pageSpecificLoading, dashboard: true },
        refreshInProgress: true,
      }));

      // Fetch consolidated dashboard data and configuration in parallel
      const [dashboardResponse] = await Promise.all([
        fetch('/api/dashboard', {
          credentials: 'include', // Include session cookies
        }),
        refreshConfigSilently() // Refresh configuration silently
      ]);

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      // Parse JSON response to ensure it is valid
      const dashboardData = await dashboardResponse.json();

      // Validate that we got valid data
      if (!dashboardData || !dashboardData.serversSummary || !dashboardData.overallSummary || !Array.isArray(dashboardData.chartData)) {
        throw new Error('Invalid data received from API');
      }

      // Extract individual data components for backward compatibility
      const serversData = dashboardData.serversSummary;
      const summaryData = dashboardData.overallSummary;
      const chartData = dashboardData.chartData;

      setState(prev => ({
        ...prev,
        lastRefresh: new Date(),
        nextRefresh: new Date(Date.now() + prev.interval * 60 * 1000),
        isRefreshing: false,
        pageSpecificLoading: { ...prev.pageSpecificLoading, dashboard: false },
        refreshInProgress: false,
        dashboardData: {
          serversSummary: serversData,
          overallSummary: summaryData,
          allServersChartData: chartData,
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
  }, [refreshConfigSilently]);

  const refreshDetail = useCallback(async (serverId: string) => {
    try {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        pageSpecificLoading: { ...prev.pageSpecificLoading, detail: true },
        refreshInProgress: true,
      }));

      // Fetch detail data and configuration in parallel
      const [dataResponse] = await Promise.all([
        fetch(`/api/detail/${serverId}`),
        refreshConfigSilently() // Refresh configuration silently
      ]);

      if (!dataResponse.ok) {
        throw new Error('Failed to fetch detail data');
      }

      // Parse JSON response to ensure it is valid
      const detailData = await dataResponse.json();

      // Validate that we got valid data
      if (!detailData) {
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
  }, [refreshConfigSilently]);

  // Update current page when pathname changes and detect dashboard returns
  useEffect(() => {
    const pageType = getCurrentPageType();
    const isDashboardPage = pageType === 'dashboard';
    
    // Check if user is returning to dashboard from another page
    const isReturningToDashboard = isDashboardPage && 
      previousPathname && 
      previousPathname !== '/' && 
      previousPathname !== pathname;
    
    setState(prev => ({
      ...prev,
      currentPage: pageType,
    }));
    
    // Trigger refresh when returning to dashboard
    if (isReturningToDashboard && !state.isRefreshing && !state.refreshInProgress) {
      console.log('User returned to dashboard, triggering refresh');
      refreshDashboard();
    }
    
    // Update previous pathname for next comparison
    setPreviousPathname(pathname);
  }, [pathname, getCurrentPageType, previousPathname, state.isRefreshing, state.refreshInProgress, refreshDashboard]);

  // Auto-refresh effect
  useEffect(() => {
    if (!state.isEnabled || state.currentPage === 'none') return;

    const intervalMs = state.interval * 60 * 1000; // interval is in minutes
    const interval = setInterval(() => {
      if (state.currentPage === 'dashboard') {
        refreshDashboard();
      } else if (state.currentPage === 'detail') {
        // For detail pages, we need the serverId from the URL
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

  const setVisibleCardIndex = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      visibleCardIndex: index,
    }));
  }, []);

  return (
    <GlobalRefreshContext.Provider
      value={{
        state,
        refreshDashboard,
        refreshDetail,
        toggleAutoRefresh,
        getCurrentPageType,
        setVisibleCardIndex,
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