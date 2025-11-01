"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ServerSummary } from '@/lib/types';

interface ServerSelectionState {
  selectedServerId: string | null;
  viewMode: 'analytics' | 'table' | 'overview';
  servers: ServerSummary[];
  isInitialized: boolean;
  overviewSidePanel: 'status' | 'chart';
}

interface ServerSelectionContextProps {
  state: ServerSelectionState;
  setSelectedServerId: (serverId: string | null) => void;
  setViewMode: (viewMode: 'analytics' | 'table' | 'overview') => void;
  setServers: (servers: ServerSummary[]) => void;
  getSelectedServer: () => ServerSummary | null;
  setOverviewSidePanel: (panel: 'status' | 'chart') => void;
}

const ServerSelectionContext = createContext<ServerSelectionContextProps | undefined>(undefined);

interface ServerSelectionProviderProps {
  children: ReactNode;
}

export function ServerSelectionProvider({ children }: ServerSelectionProviderProps) {
  // Initialize view mode and overview side panel from localStorage (lazy initialization)
  const [state, setState] = useState<ServerSelectionState>(() => {
    // Check if we're in a browser environment (not SSR)
    if (typeof window === 'undefined') {
      return {
        selectedServerId: null,
        viewMode: 'overview',
        servers: [],
        isInitialized: true,
        overviewSidePanel: 'status',
      };
    }

    try {
      const savedViewMode = localStorage.getItem('dashboard-view-mode');
      const savedOverviewSidePanel = localStorage.getItem('overview-side-panel');
      
      const viewMode = (savedViewMode === 'analytics' || savedViewMode === 'table' || savedViewMode === 'overview') 
        ? savedViewMode 
        : 'overview';
      
      const overviewSidePanel = (savedOverviewSidePanel === 'status' || savedOverviewSidePanel === 'chart')
        ? savedOverviewSidePanel
        : 'status';
      
      return {
        selectedServerId: null,
        viewMode,
        servers: [],
        isInitialized: true,
        overviewSidePanel,
      };
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return {
        selectedServerId: null,
        viewMode: 'overview',
        servers: [],
        isInitialized: true,
        overviewSidePanel: 'status',
      };
    }
  });

  const setSelectedServerId = useCallback((serverId: string | null) => {
    setState(prev => ({ ...prev, selectedServerId: serverId }));
  }, []);

  const setViewMode = useCallback((viewMode: 'analytics' | 'table' | 'overview') => {
    setState(prev => ({ ...prev, viewMode }));
    // Save to localStorage (only in browser environment)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dashboard-view-mode', viewMode);
      } catch (error) {
        console.error('Error saving view mode to localStorage:', error);
      }
    }
  }, []);

  const setServers = useCallback((servers: ServerSummary[]) => {
    setState(prev => ({ ...prev, servers }));
  }, []);

  const setOverviewSidePanel = useCallback((panel: 'status' | 'chart') => {
    setState(prev => ({ ...prev, overviewSidePanel: panel }));
    // Save to localStorage (only in browser environment)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('overview-side-panel', panel);
      } catch (error) {
        console.error('Error saving overview side panel to localStorage:', error);
      }
    }
  }, []);

  const getSelectedServer = useCallback(() => {
    if (!state.selectedServerId) return null;
    return state.servers.find(server => server.id === state.selectedServerId) || null;
  }, [state.selectedServerId, state.servers]);

  const contextValue: ServerSelectionContextProps = {
    state,
    setSelectedServerId,
    setViewMode,
    setServers,
    getSelectedServer,
    setOverviewSidePanel,
  };

  return (
    <ServerSelectionContext.Provider value={contextValue}>
      {children}
    </ServerSelectionContext.Provider>
  );
}

export function useServerSelection() {
  const context = useContext(ServerSelectionContext);
  if (context === undefined) {
    throw new Error('useServerSelection must be used within a ServerSelectionProvider');
  }
  return context;
}
