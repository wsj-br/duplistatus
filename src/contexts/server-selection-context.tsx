"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { ServerSummary } from '@/lib/types';
import { getUserLocalStorageItem, setUserLocalStorageItem } from '@/lib/user-local-storage';
import { useCurrentUser } from '@/hooks/use-current-user';

interface ServerSelectionState {
  selectedServerId: string | null;
  viewMode: 'table' | 'overview';
  servers: ServerSummary[];
  isInitialized: boolean;
  overviewSidePanel: 'status' | 'chart';
}

interface ServerSelectionContextProps {
  state: ServerSelectionState;
  setSelectedServerId: (serverId: string | null) => void;
  setViewMode: (viewMode: 'table' | 'overview') => void;
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
  // Use a ref to always access the latest currentUser value in callbacks
  // This avoids closure staleness issues when callbacks are called after render
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  
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

    // Default values - isInitialized=false until user-specific settings are loaded
    // from localStorage (requires currentUser to be resolved first)
    return {
      selectedServerId: null,
      viewMode: 'overview',
      servers: [],
      isInitialized: false,
      overviewSidePanel: 'status',
    };
  });

  const hasLoadedUserConfigRef = useRef(false);

  // Load user-specific settings when user is available.
  // Also marks isInitialized=true once loading is done (whether user is
  // authenticated or not), so the dashboard doesn't stay stuck on the
  // loading screen when there is no session.
  useEffect(() => {
    if (typeof window === 'undefined' || hasLoadedUserConfigRef.current) {
      return;
    }

    // currentUser is undefined while the /api/auth/me fetch is in-flight; wait for it.
    // null means loading is done but no authenticated user (will be redirected to login).
    if (currentUser === undefined) {
      return;
    }

    // If not authenticated, there are no user-specific settings to load.
    // Mark as initialized so the UI is not stuck on the loading screen.
    if (currentUser === null) {
      hasLoadedUserConfigRef.current = true;
      setState(prev => ({ ...prev, isInitialized: true }));
      return;
    }

    try {
      const savedViewMode = getUserLocalStorageItem('dashboard-view-mode', currentUser.id);
      const savedOverviewSidePanel = getUserLocalStorageItem('overview-side-panel', currentUser.id);
      
      const viewMode = (savedViewMode === 'table' || savedViewMode === 'overview') 
        ? savedViewMode 
        : 'overview';
      
      const overviewSidePanel = (savedOverviewSidePanel === 'status' || savedOverviewSidePanel === 'chart')
        ? savedOverviewSidePanel
        : 'status';
      
      setState(prev => ({
        ...prev,
        viewMode: viewMode as 'table' | 'overview',
        overviewSidePanel: overviewSidePanel as 'status' | 'chart',
        isInitialized: true,
      }));
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      // Mark as initialized even on error so the UI is not stuck
      setState(prev => ({ ...prev, isInitialized: true }));
    } finally {
      hasLoadedUserConfigRef.current = true;
    }
  }, [currentUser]);

  const setSelectedServerId = useCallback((serverId: string | null) => {
    setState(prev => ({ ...prev, selectedServerId: serverId }));
  }, []);

  const setViewMode = useCallback((viewMode: 'table' | 'overview') => {
    // Use ref to get latest currentUser value, avoiding closure staleness
    const latestUser = currentUserRef.current;
    setState(prev => {
      if (typeof window !== 'undefined') {
        const userId = latestUser?.id;
        if (userId) {
          try {
            setUserLocalStorageItem('dashboard-view-mode', userId, viewMode);
          } catch (error) {
            console.error('Error saving view mode to localStorage:', error);
          }
        }
      }
      return { ...prev, viewMode };
    });
  }, []); // No dependencies - uses ref for latest value

  const setServers = useCallback((servers: ServerSummary[]) => {
    setState(prev => ({ ...prev, servers }));
  }, []);

  const setOverviewSidePanel = useCallback((panel: 'status' | 'chart') => {
    // Use ref to get latest currentUser value, avoiding closure staleness
    const latestUser = currentUserRef.current;
    setState(prev => {
      if (typeof window !== 'undefined') {
        const userId = latestUser?.id;
        if (userId) {
          try {
            setUserLocalStorageItem('overview-side-panel', userId, panel);
          } catch (error) {
            console.error('Error saving overview side panel to localStorage:', error);
          }
        }
      }
      return { ...prev, overviewSidePanel: panel };
    });
  }, []); // No dependencies - uses ref for latest value

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
