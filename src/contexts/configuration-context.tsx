"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { NotificationConfig, NotificationFrequencyConfig, OverdueTolerance } from '@/lib/types';

export interface ServerWithBackup {
  id: string;
  name: string;
  backupName: string;
  server_url: string;
  alias: string;
  note: string;
  hasPassword: boolean;
}

interface UnifiedConfiguration extends NotificationConfig {
  cronConfig: {
    cronExpression: string;
    enabled: boolean;
  };
  notificationFrequency: NotificationFrequencyConfig;
  serversWithBackups: ServerWithBackup[];
  overdue_tolerance: OverdueTolerance;
}

interface ConfigurationContextType {
  config: UnifiedConfiguration | null;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  refreshConfigSilently: () => Promise<void>;
  updateConfig: (updates: Partial<UnifiedConfiguration>) => void;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UnifiedConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchUnifiedConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/configuration/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch configuration';
      setError(errorMessage);
      // Only show toast if we're in the browser and mounted
      if (typeof window !== 'undefined' && mounted) {
        // We'll handle toast errors in the components that use this context
        console.error('Configuration fetch error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  const refreshConfig = async () => {
    await fetchUnifiedConfiguration();
  };

  const refreshConfigSilently = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/configuration/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch configuration';
      setError(errorMessage);
      console.error('Configuration fetch error:', errorMessage);
    }
  }, []);

  const updateConfig = (updates: Partial<UnifiedConfiguration>) => {
    setConfig(prev => prev ? { ...prev, ...updates } : null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUnifiedConfiguration();
    }
  }, [fetchUnifiedConfiguration, mounted]);

  // Listen for configuration change events from other parts of the app
  useEffect(() => {
    if (!mounted) return;

    const handleConfigurationChange = () => {
      refreshConfigSilently();
    };

    window.addEventListener('configuration-saved', handleConfigurationChange);
    
    return () => {
      window.removeEventListener('configuration-saved', handleConfigurationChange);
    };
  }, [mounted, refreshConfigSilently]);

  const value: ConfigurationContextType = {
    config,
    loading,
    error,
    refreshConfig,
    refreshConfigSilently,
    updateConfig,
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration() {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
}
