"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface BackupSelectionContextType {
  selectedBackup: string;
  setSelectedBackup: (backup: string) => void;
}

const BackupSelectionContext = createContext<BackupSelectionContextType | undefined>(undefined);

export function BackupSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedBackup, setSelectedBackup] = useState<string>("all");

  const handleSetSelectedBackup = useCallback((backup: string) => {
    setSelectedBackup(backup);
  }, []);

  return (
    <BackupSelectionContext.Provider value={{ selectedBackup, setSelectedBackup: handleSetSelectedBackup }}>
      {children}
    </BackupSelectionContext.Provider>
  );
}

export function useBackupSelection() {
  const context = useContext(BackupSelectionContext);
  if (context === undefined) {
    throw new Error('useBackupSelection must be used within a BackupSelectionProvider');
  }
  return context;
} 