"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { ServerSummary } from '@/lib/types';

interface ServerSelectionState {
  selectedServerId: string | null;
  viewMode: 'cards' | 'table' | 'compact';
  servers: ServerSummary[];
  isInitialized: boolean;
}

interface ServerSelectionContextProps {
  state: ServerSelectionState;
  setSelectedServerId: (serverId: string | null) => void;
  setViewMode: (viewMode: 'cards' | 'table' | 'compact') => void;
  setServers: (servers: ServerSummary[]) => void;
  getSelectedServer: () => ServerSummary | null;
}

const ServerSelectionContext = createContext<ServerSelectionContextProps | undefined>(undefined);

interface ServerSelectionProviderProps {
  children: ReactNode;
}

export function ServerSelectionProvider({ children }: ServerSelectionProviderProps) {
  const [state, setState] = useState<ServerSelectionState>({
    selectedServerId: null,
    viewMode: 'compact', // Default fallback
    servers: [],
    isInitialized: false,
  });

  // Initialize view mode from localStorage on mount
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('dashboard-view-mode');
      if (savedViewMode === 'cards' || savedViewMode === 'table' || savedViewMode === 'compact') {
        setState(prev => ({ 
          ...prev, 
          viewMode: savedViewMode,
          isInitialized: true 
        }));
      } else {
        setState(prev => ({ ...prev, viewMode: 'compact', isInitialized: true }));
      }
    } catch (error) {
      console.error('Error loading view mode from localStorage:', error);
      setState(prev => ({ ...prev, viewMode: 'compact', isInitialized: true }));
    }
  }, []);

  const setSelectedServerId = useCallback((serverId: string | null) => {
    setState(prev => ({ ...prev, selectedServerId: serverId }));
  }, []);

  const setViewMode = useCallback((viewMode: 'cards' | 'table' | 'compact') => {
    setState(prev => ({ ...prev, viewMode }));
    // Save to localStorage
    try {
      localStorage.setItem('dashboard-view-mode', viewMode);
    } catch (error) {
      console.error('Error saving view mode to localStorage:', error);
    }
  }, []);

  const setServers = useCallback((servers: ServerSummary[]) => {
    setState(prev => ({ ...prev, servers }));
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
