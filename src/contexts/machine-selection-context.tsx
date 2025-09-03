"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { MachineSummary } from '@/lib/types';

interface MachineSelectionState {
  selectedMachineId: string | null;
  viewMode: 'cards' | 'table';
  machines: MachineSummary[];
  isInitialized: boolean;
}

interface MachineSelectionContextProps {
  state: MachineSelectionState;
  setSelectedMachineId: (machineId: string | null) => void;
  setViewMode: (viewMode: 'cards' | 'table') => void;
  setMachines: (machines: MachineSummary[]) => void;
  getSelectedMachine: () => MachineSummary | null;
}

const MachineSelectionContext = createContext<MachineSelectionContextProps | undefined>(undefined);

interface MachineSelectionProviderProps {
  children: ReactNode;
}

export function MachineSelectionProvider({ children }: MachineSelectionProviderProps) {
  const [state, setState] = useState<MachineSelectionState>({
    selectedMachineId: null,
    viewMode: 'cards', // Default fallback
    machines: [],
    isInitialized: false,
  });

  // Initialize view mode from localStorage on mount
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('dashboard-view-mode');
      if (savedViewMode === 'cards' || savedViewMode === 'table') {
        setState(prev => ({ 
          ...prev, 
          viewMode: savedViewMode,
          isInitialized: true 
        }));
      } else {
        setState(prev => ({ ...prev, isInitialized: true }));
      }
    } catch (error) {
      console.error('Error loading view mode from localStorage:', error);
      setState(prev => ({ ...prev, isInitialized: true }));
    }
  }, []);

  const setSelectedMachineId = useCallback((machineId: string | null) => {
    setState(prev => ({ ...prev, selectedMachineId: machineId }));
  }, []);

  const setViewMode = useCallback((viewMode: 'cards' | 'table') => {
    setState(prev => ({ ...prev, viewMode }));
    // Save to localStorage
    try {
      localStorage.setItem('dashboard-view-mode', viewMode);
    } catch (error) {
      console.error('Error saving view mode to localStorage:', error);
    }
  }, []);

  const setMachines = useCallback((machines: MachineSummary[]) => {
    setState(prev => ({ ...prev, machines }));
  }, []);

  const getSelectedMachine = useCallback(() => {
    if (!state.selectedMachineId) return null;
    return state.machines.find(machine => machine.id === state.selectedMachineId) || null;
  }, [state.selectedMachineId, state.machines]);

  const contextValue: MachineSelectionContextProps = {
    state,
    setSelectedMachineId,
    setViewMode,
    setMachines,
    getSelectedMachine,
  };

  return (
    <MachineSelectionContext.Provider value={contextValue}>
      {children}
    </MachineSelectionContext.Provider>
  );
}

export function useMachineSelection() {
  const context = useContext(MachineSelectionContext);
  if (context === undefined) {
    throw new Error('useMachineSelection must be used within a MachineSelectionProvider');
  }
  return context;
}
