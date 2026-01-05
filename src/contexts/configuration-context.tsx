"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { NotificationFrequencyConfig, OverdueTolerance, NtfyConfig, EmailConfig, NotificationTemplate, BackupNotificationConfig, BackupKey, ServerAddress } from '@/lib/types';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';

/**
 * Check if session cookie exists (client-side)
 * This helps detect if user will be redirected to login
 */
function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key] = cookie.trim().split('=');
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);
  return !!(cookies['sessionId'] || cookies['session']);
}

export interface ServerWithBackup {
  id: string;
  name: string;
  backupName: string;
  server_url: string;
  alias: string;
  note: string;
  hasPassword: boolean;
  expectedBackupDate?: string; // Calculated next expected backup date
  lastBackupDate?: string; // Last actual backup received
}

interface UnifiedConfiguration {
  ntfy: NtfyConfig;
  templates: {
    success: NotificationTemplate;
    warning: NotificationTemplate;
    overdueBackup: NotificationTemplate;
  };
  email?: EmailConfig;
  // New canonical field from API
  backup_settings: Record<BackupKey, BackupNotificationConfig>;
  // Back-compat alias for existing UI usage
  backupSettings?: Record<BackupKey, BackupNotificationConfig>;
  serverAddresses: ServerAddress[];
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
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname?.startsWith('/login');
  const [config, setConfig] = useState<UnifiedConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchUnifiedConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedRequestWithRecovery('/api/configuration/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const data = await response.json();
      // Provide back-compat alias for existing components
      data.backupSettings = data.backup_settings || {};
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
      
      const response = await authenticatedRequestWithRecovery('/api/configuration/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const data = await response.json();
      data.backupSettings = data.backup_settings || {};
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
    // Skip configuration fetch on login page to avoid unnecessary API calls
    // Wait for both mounted and pathname to be available before making decisions
    if (!mounted) {
      return; // Wait for client-side mount
    }
    
    // If pathname is not available yet, wait (it will trigger effect again when set)
    if (!pathname) {
      return;
    }
    
    if (isLoginPage) {
      setLoading(false); // Set loading to false so components don't wait
      return; // Skip on login page
    }

    // If we're on root path and no session cookie, we'll be redirected to login
    // Skip API call to avoid unnecessary requests
    if (pathname === '/' && !hasSessionCookie()) {
      setLoading(false);
      return;
    }
    
    // Only fetch if we're not on login page and have a session
    fetchUnifiedConfiguration();
  }, [fetchUnifiedConfiguration, mounted, isLoginPage, pathname]);

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
