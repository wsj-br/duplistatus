"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { ServerSummary } from '@/lib/types';
import { getUserLocalStorageItem, setUserLocalStorageItem } from '@/lib/user-local-storage';
import { useCurrentUser } from '@/hooks/use-current-user';

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
  const currentUser = useCurrentUser();
  
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

    // Default values - will be updated when user loads
    return {
      selectedServerId: null,
      viewMode: 'overview',
      servers: [],
      isInitialized: true,
      overviewSidePanel: 'status',
    };
  });

  const hasLoadedUserConfigRef = useRef(false);

  // Load user-specific settings when user is available
  useEffect(() => {
    if (typeof window === 'undefined' || currentUser === null || hasLoadedUserConfigRef.current) {
      return;
    }

    hasLoadedUserConfigRef.current = true;
    try {
      const savedViewMode = getUserLocalStorageItem('dashboard-view-mode', currentUser.id);
      const savedOverviewSidePanel = getUserLocalStorageItem('overview-side-panel', currentUser.id);
      
      const viewMode = (savedViewMode === 'analytics' || savedViewMode === 'table' || savedViewMode === 'overview') 
        ? savedViewMode 
        : 'overview';
      
      const overviewSidePanel = (savedOverviewSidePanel === 'status' || savedOverviewSidePanel === 'chart')
        ? savedOverviewSidePanel
        : 'status';
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(prev => ({
        ...prev,
        viewMode: viewMode as 'analytics' | 'table' | 'overview',
        overviewSidePanel: overviewSidePanel as 'status' | 'chart',
      }));
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  }, [currentUser]);

  const setSelectedServerId = useCallback((serverId: string | null) => {
    setState(prev => ({ ...prev, selectedServerId: serverId }));
  }, []);

  const setViewMode = useCallback((viewMode: 'analytics' | 'table' | 'overview') => {
    setState(prev => ({ ...prev, viewMode }));
    // Save to localStorage (only in browser environment and if user is loaded)
    if (typeof window !== 'undefined' && currentUser) {
      try {
        setUserLocalStorageItem('dashboard-view-mode', currentUser.id, viewMode);
      } catch (error) {
        console.error('Error saving view mode to localStorage:', error);
      }
    }
  }, [currentUser]);

  const setServers = useCallback((servers: ServerSummary[]) => {
    setState(prev => ({ ...prev, servers }));
  }, []);

  const setOverviewSidePanel = useCallback((panel: 'status' | 'chart') => {
    setState(prev => ({ ...prev, overviewSidePanel: panel }));
    // Save to localStorage (only in browser environment and if user is loaded)
    if (typeof window !== 'undefined' && currentUser) {
      try {
        setUserLocalStorageItem('overview-side-panel', currentUser.id, panel);
      } catch (error) {
        console.error('Error saving overview side panel to localStorage:', error);
      }
    }
  }, [currentUser]);

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
