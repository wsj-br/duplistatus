"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { MachineSummary } from '@/lib/types';

interface MachineSelectionState {
  selectedMachineId: string | null;
  viewMode: 'cards' | 'table';
  machines: MachineSummary[];
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
    viewMode: 'cards',
    machines: [],
  });

  const setSelectedMachineId = useCallback((machineId: string | null) => {
    setState(prev => ({ ...prev, selectedMachineId: machineId }));
  }, []);

  const setViewMode = useCallback((viewMode: 'cards' | 'table') => {
    setState(prev => ({ ...prev, viewMode }));
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
