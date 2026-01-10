"use client";

import { Fragment, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useConfiguration } from '@/contexts/configuration-context';
import { useConfig } from '@/contexts/config-context';
import { NotificationEvent, BackupNotificationConfig, BackupKey } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { defaultBackupNotificationConfig } from '@/lib/default-config';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { ChevronDown, ChevronRight, X, Search, SendHorizontal, QrCode, Link as LinkIcon, Link2Off, Settings2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import QRCode from 'qrcode';
import { NtfyQrModal } from '@/components/ui/ntfy-qr-modal';

interface ServerWithBackup {
  id: string;
  name: string;
  backupName: string;
  server_url: string;
  alias: string;
  note: string;
}

interface BackupNotificationsFormProps {
  backupSettings: Record<BackupKey, BackupNotificationConfig>;
  onSave?: (settings: Record<BackupKey, BackupNotificationConfig>) => void;
}

// Extended server interface for sorting
interface ServerWithBackupAndSettings extends ServerWithBackup {
  notificationEvent: NotificationEvent;
}

// Server default key pattern: "serverId:__default__"
const SERVER_DEFAULT_KEY_SUFFIX = '__default__';
const getServerDefaultKey = (serverId: string): BackupKey => `${serverId}:${SERVER_DEFAULT_KEY_SUFFIX}`;
const isServerDefaultKey = (key: BackupKey): boolean => key.endsWith(`:${SERVER_DEFAULT_KEY_SUFFIX}`);

// Grouped structure for server and its backups
interface ServerGroup {
  serverId: string;
  serverName: string;
  serverAlias: string;
  serverUrl: string;
  serverNote: string;
  backups: ServerWithBackup[];
}

export function BackupNotificationsForm({ backupSettings }: BackupNotificationsFormProps) {
  const { toast } = useToast();
  const { config, refreshConfigSilently } = useConfiguration();
  const { refreshOverdueTolerance } = useConfig();
  const [settings, setSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  
  // Select-all state
  const [allNtfySelected, setAllNtfySelected] = useState(false);
  const [allEmailSelected, setAllEmailSelected] = useState(false);
  
  // Expanded rows state (for both backups and server headers)
  const [expandedRows, setExpandedRows] = useState<Set<BackupKey>>(new Set());
  const [expandedServerHeaders, setExpandedServerHeaders] = useState<Set<string>>(new Set());
  
  const toggleRowExpansion = (backupKey: BackupKey) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(backupKey)) {
        newSet.delete(backupKey);
      } else {
        newSet.add(backupKey);
      }
      return newSet;
    });
  };

  const toggleServerHeaderExpansion = (serverId: string) => {
    setExpandedServerHeaders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serverId)) {
        newSet.delete(serverId);
      } else {
        newSet.add(serverId);
      }
      return newSet;
    });
  };

  // Bulk selection state
  const [selectedBackups, setSelectedBackups] = useState<Set<BackupKey>>(new Set());
  const [serverNameFilter, setServerNameFilter] = useState<string>('');
  
  // Refs for text inputs to avoid re-renders during typing
  // Key format: `${backupKey}:${field}` or `${serverDefaultKey}:${field}`
  // Using refs instead of state prevents re-renders when typing
  const textInputValuesRef = useRef<Record<string, string>>({});
  const textInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const textInputTimeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  // Track which inputs were just updated to prevent ref callback from overwriting
  const recentlyUpdatedInputs = useRef<Set<string>>(new Set());
  
  // Bulk edit modal state
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditNotificationEvent, setBulkEditNotificationEvent] = useState<NotificationEvent>('off');
  const [bulkEditAdditionalEmails, setBulkEditAdditionalEmails] = useState<string>('');
  const [bulkEditAdditionalNtfyTopic, setBulkEditAdditionalNtfyTopic] = useState<string>('');
  
  // Confirmation dialog state for bulk clear
  const [isBulkClearConfirmOpen, setIsBulkClearConfirmOpen] = useState(false);
  
  // QR code modal state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [topicUrl, setTopicUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  // Test notification loading states
  const [testingEmail, setTestingEmail] = useState<BackupKey | null>(null);
  const [testingNtfy, setTestingNtfy] = useState<BackupKey | null>(null);
  const [testingBulkEmail, setTestingBulkEmail] = useState(false);
  const [testingBulkNtfy, setTestingBulkNtfy] = useState(false);

  // Configuration status checks
  const isNtfyConfigured = config?.ntfy && config.ntfy.url && config.ntfy.topic;
  const isEmailConfigured = config?.email && config.email.enabled;
  
  // Auto-save debouncing state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTextInputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Record<BackupKey, BackupNotificationConfig> | null>(null);
  const isAutoSaveInProgressRef = useRef(false);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const tableScrollContainerRef = useRef<HTMLDivElement>(null);
  // Ref to store latest settings for autoSave to avoid passing large objects on every keystroke
  const settingsRef = useRef<Record<BackupKey, BackupNotificationConfig>>(settings);
  // Ref to track when we just saved to prevent useEffect from overwriting our changes
  const justSavedRef = useRef(false);
  const justSavedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Column configuration for sorting - memoized to prevent recreation on every render
  const columnConfig = useMemo(() => ({
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    backupName: { type: 'text' as keyof typeof sortFunctions, path: 'backupName' },
    notificationEvent: { type: 'notificationEvent' as keyof typeof sortFunctions, path: 'notificationEvent' },
  }), []);

  // Keep settingsRef in sync with settings state
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Update backup inputs that inherit from server defaults when server defaults change
  useEffect(() => {
    if (!config?.serversWithBackups) return;
    
    // Group backups by server
    const serverBackupMap = new Map<string, ServerWithBackup[]>();
    config.serversWithBackups.forEach((server: ServerWithBackup) => {
      if (!serverBackupMap.has(server.id)) {
        serverBackupMap.set(server.id, []);
      }
      serverBackupMap.get(server.id)!.push(server);
    });
    
    // For each server, check if server defaults changed and update inheriting backups
    serverBackupMap.forEach((backups, serverId) => {
      const serverDefaultKey = getServerDefaultKey(serverId);
      const serverDefaults = settings[serverDefaultKey];
      
      if (!serverDefaults) return;
      
      // Check both fields
      (['additionalEmails', 'additionalNtfyTopic'] as const).forEach((field) => {
        const newValue = serverDefaults[field] ?? '';
        
        backups.forEach((backup: ServerWithBackup) => {
          const backupKey = `${backup.id}:${backup.backupName}`;
          const backupSetting = settings[backupKey];
          
          // Check if this backup is inheriting (no explicit value set)
          const hasExplicitValue = backupSetting && field in backupSetting && backupSetting[field] !== undefined;
          
          if (!hasExplicitValue) {
            // This backup is inheriting, update its input value
            const inputKey = `${backupKey}:${field}`;
            const inputRef = textInputRefs.current[inputKey];
            
            if (inputRef && document.activeElement !== inputRef) {
              // Only update if the value is different and user is not currently typing
              if (inputRef.value !== newValue && !textInputTimeoutRefs.current[inputKey]) {
                inputRef.value = newValue;
              }
            }
          }
        });
      });
    });
  }, [settings, config?.serversWithBackups]);

  useEffect(() => {
    // Don't reinitialize if we're in the middle of saving to prevent overwriting local changes
    if (isSavingInProgress) return;
    
    // Don't overwrite settings if we just saved (prevent race condition with refreshConfigSilently)
    if (justSavedRef.current) return;
    
    if (config) {
      // Initialize settings from config, but only if settings are empty or missing
      // Don't overwrite existing settings to prevent losing user changes
      if (config.backupSettings && Object.keys(config.backupSettings).length > 0) {
        const backupSettings = config.backupSettings;
        setSettings(prev => {
          // Only update if current settings are empty or if config has new keys
          const hasExistingSettings = Object.keys(prev).length > 0;
          if (hasExistingSettings) {
            // Merge: keep existing settings, only add new keys from config
            const merged = { ...prev };
            let hasNewKeys = false;
            Object.keys(backupSettings).forEach(key => {
              if (!(key in merged)) {
                merged[key] = backupSettings[key];
                hasNewKeys = true;
              }
            });
            return hasNewKeys ? merged : prev;
          } else {
            // No existing settings, safe to initialize from config
            return backupSettings;
          }
        });
      }
    }
  }, [config, isSavingInProgress]);

  // Initialize default settings for all servers when they are loaded
  useEffect(() => {
    // Don't reinitialize if we're in the middle of saving to prevent overwriting local changes
    if (isSavingInProgress) return;
    
    if (config?.serversWithBackups && config.serversWithBackups.length > 0) {
      setSettings(prev => {
        const defaultSettings: Record<BackupKey, BackupNotificationConfig> = {};
        let hasChanges = false;
        
        config.serversWithBackups.forEach((server: ServerWithBackup) => {
          const backupKey = `${server.id}:${server.backupName}`;
          if (!prev[backupKey]) {
            defaultSettings[backupKey] = { ...defaultBackupNotificationConfig };
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          const newSettings = {
            ...prev,
            ...defaultSettings,
          };
          return newSettings;
        }
        return prev;
      });
    }
  }, [config?.serversWithBackups, isSavingInProgress]);


  // Cleanup timeout on unmount and handle cursor state
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      if (autoSaveTextInputTimeoutRef.current) {
        clearTimeout(autoSaveTextInputTimeoutRef.current);
        autoSaveTextInputTimeoutRef.current = null;
      }
      if (justSavedTimeoutRef.current) {
        clearTimeout(justSavedTimeoutRef.current);
        justSavedTimeoutRef.current = null;
      }
      // Clear all text input timeouts
      Object.values(textInputTimeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      textInputTimeoutRefs.current = {};
      // Clear all text input refs
      textInputValuesRef.current = {};
      textInputRefs.current = {};
      // Always reset cursor on unmount to avoid stuck state
      document.body.style.cursor = 'default';
    };
  }, []);

  // Additional effect to handle cursor state changes
  useEffect(() => {
    if (!isAutoSaving) {
      document.body.style.cursor = 'default';
    }
  }, [isAutoSaving]);

  // Helper function to remove empty email/topic fields from a config
  const removeEmptyFields = useCallback((config: BackupNotificationConfig): BackupNotificationConfig => {
    const cleaned = { ...config };
    // Remove empty string/null fields for additionalEmails and additionalNtfyTopic
    if (cleaned.additionalEmails !== undefined && (cleaned.additionalEmails === null || cleaned.additionalEmails === '' || (typeof cleaned.additionalEmails === 'string' && cleaned.additionalEmails.trim() === ''))) {
      const { additionalEmails, ...rest } = cleaned;
      return removeEmptyFields(rest as BackupNotificationConfig);
    }
    if (cleaned.additionalNtfyTopic !== undefined && (cleaned.additionalNtfyTopic === null || cleaned.additionalNtfyTopic === '' || (typeof cleaned.additionalNtfyTopic === 'string' && cleaned.additionalNtfyTopic.trim() === ''))) {
      const { additionalNtfyTopic, ...rest } = cleaned;
      return removeEmptyFields(rest as BackupNotificationConfig);
    }
    return cleaned;
  }, []);

  // Clear override and revert to inheritance
  const clearOverride = (serverId: string, backupName: string, field: 'additionalEmails' | 'additionalNtfyTopic' | 'additionalNotificationEvent') => {
    const backupKey = `${serverId}:${backupName}`;
    const currentSetting = settings[backupKey] || { ...defaultBackupNotificationConfig };
    const { [field]: _, ...rest } = currentSetting;
    
    const newSettings = {
      ...settings,
      [backupKey]: rest as BackupNotificationConfig,
    };
    
    setSettings(newSettings);
    autoSave(newSettings);
  };

  // Sync all backups to server defaults (clear all overrides)
  const syncAllToServerDefaults = (serverId: string) => {
    const group = serverGroups.find(g => g.serverId === serverId);
    if (!group) return;

    const newSettings = { ...settings };
    
    group.backups.forEach(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      const currentSetting = newSettings[backupKey] || { ...defaultBackupNotificationConfig };
      
      // Remove all additional destination overrides
      const { additionalNotificationEvent, additionalEmails, additionalNtfyTopic, ...rest } = currentSetting;
      newSettings[backupKey] = rest as BackupNotificationConfig;
    });
    
    setSettings(newSettings);
    autoSave(newSettings);
    
    toast({
      title: "Synced to Server Defaults",
      description: `All ${group.backups.length} backup${group.backups.length === 1 ? '' : 's'} now inherit from server defaults`,
      duration: 3000,
    });
  };

  // Clear all additional destinations for server and all backups
  // This removes the server default key and clears backup overrides
  const clearAllAdditionalDestinations = (serverId: string) => {
    const group = serverGroups.find(g => g.serverId === serverId);
    if (!group) return;

    const serverDefaultKey = getServerDefaultKey(serverId);
    const newSettings = { ...settings };
    
    // Helper function to check if a config is effectively empty (only has default values)
    const isConfigEmpty = (config: BackupNotificationConfig): boolean => {
      return (
        config.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
        config.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
        config.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
        config.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
        config.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
        (!config.allowedWeekDays || 
         JSON.stringify(config.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort())) &&
        !config.additionalNotificationEvent &&
        !config.additionalEmails &&
        !config.additionalNtfyTopic
      );
    };
    
    // Delete server default key entirely
    delete newSettings[serverDefaultKey];
    
    // Clear all backup overrides for additional destinations
    // Removing these fields makes backups no longer have overrides
    group.backups.forEach(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      const currentSetting = newSettings[backupKey];
      
      if (currentSetting) {
        // Remove all additional destination overrides
        const { additionalNotificationEvent, additionalEmails, additionalNtfyTopic, ...rest } = currentSetting;
        const cleanedConfig = rest as BackupNotificationConfig;
        
        // If the config is now effectively empty (only has defaults), remove the key entirely
        if (isConfigEmpty(cleanedConfig)) {
          delete newSettings[backupKey];
        } else {
          newSettings[backupKey] = cleanedConfig;
        }
      }
    });
    
    setSettings(newSettings);
    
    // Update settingsRef immediately
    settingsRef.current = newSettings;
    
    // Clear input ref values for server defaults
    const serverDefaultEmailsKey = `${serverDefaultKey}:additionalEmails`;
    const serverDefaultNtfyKey = `${serverDefaultKey}:additionalNtfyTopic`;
    
    if (textInputRefs.current[serverDefaultEmailsKey]) {
      textInputRefs.current[serverDefaultEmailsKey].value = '';
    }
    if (textInputRefs.current[serverDefaultNtfyKey]) {
      textInputRefs.current[serverDefaultNtfyKey].value = '';
    }
    
    // Clear input ref values for all backups in this server
    group.backups.forEach(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      const backupEmailsKey = `${backupKey}:additionalEmails`;
      const backupNtfyKey = `${backupKey}:additionalNtfyTopic`;
      
      if (textInputRefs.current[backupEmailsKey]) {
        textInputRefs.current[backupEmailsKey].value = '';
      }
      if (textInputRefs.current[backupNtfyKey]) {
        textInputRefs.current[backupNtfyKey].value = '';
      }
    });
    
    // Clear textInputValuesRef entries
    delete textInputValuesRef.current[serverDefaultEmailsKey];
    delete textInputValuesRef.current[serverDefaultNtfyKey];
    group.backups.forEach(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      delete textInputValuesRef.current[`${backupKey}:additionalEmails`];
      delete textInputValuesRef.current[`${backupKey}:additionalNtfyTopic`];
    });
    
    autoSave(newSettings);
    
    toast({
      title: "Clear Complete",
      description: `Cleared all additional destinations for server and ${group.backups.length} backup${group.backups.length === 1 ? '' : 's'}.`,
      duration: 3000,
    });
  };

  const getBackupSettingById = useCallback((serverId: string, backupName: string): BackupNotificationConfig => {
    const backupKey = `${serverId}:${backupName}`;
    return settings[backupKey] || { ...defaultBackupNotificationConfig };
  }, [settings]);

  // Get server default settings
  const getServerDefaultSettings = useCallback((serverId: string): BackupNotificationConfig | null => {
    const serverDefaultKey = getServerDefaultKey(serverId);
    const serverDefaults = settings[serverDefaultKey];
    if (!serverDefaults) return null;
    
    // Return only the relevant fields for server defaults (additional destinations)
    return {
      ...defaultBackupNotificationConfig,
      additionalNotificationEvent: serverDefaults.additionalNotificationEvent,
      additionalEmails: serverDefaults.additionalEmails,
      additionalNtfyTopic: serverDefaults.additionalNtfyTopic,
    };
  }, [settings]);

  // Check if server has additional destinations configured
  const hasServerAdditionalDestinations = useCallback((serverDefaults: BackupNotificationConfig | null): boolean => {
    if (!serverDefaults) return false;
    return (
      (serverDefaults.additionalNotificationEvent && serverDefaults.additionalNotificationEvent !== 'off') ||
      !!(serverDefaults.additionalEmails && serverDefaults.additionalEmails.trim() !== '') ||
      !!(serverDefaults.additionalNtfyTopic && serverDefaults.additionalNtfyTopic.trim() !== '')
    );
  }, []);

  // Update server default settings
  const updateServerDefaultSetting = (serverId: string, field: 'additionalNotificationEvent' | 'additionalEmails' | 'additionalNtfyTopic', value: string | NotificationEvent) => {
    const serverDefaultKey = getServerDefaultKey(serverId);
    
    // Use functional update to avoid creating new object unnecessarily
    setSettings(prev => {
      const currentDefaults = prev[serverDefaultKey] || { ...defaultBackupNotificationConfig };
      
      // Set the value, then remove empty fields
      const updatedDefaults = {
        ...currentDefaults,
        [field]: value,
      };
      const cleanedDefaults = removeEmptyFields(updatedDefaults);
      
      const newSettings = {
        ...prev,
        [serverDefaultKey]: cleanedDefaults,
      };
      
      // Update ref immediately so autoSave can access latest state
      // This must happen BEFORE any autoSave functions are called
      settingsRef.current = newSettings;
      
      // For text input fields, don't trigger autosave here
      // Autosave is handled by triggerTextInputAutoSave() on blur or autoSaveTextInput() after 5 seconds
      // This prevents race conditions where the old value might be saved
      if (field !== 'additionalEmails' && field !== 'additionalNtfyTopic') {
        // Use regular auto-save for non-text fields (like additionalNotificationEvent)
        autoSave(newSettings);
      }
      
      return newSettings;
    });
  };

  // Get effective value for a backup (inherits from server if not overridden)
  const getEffectiveValue = useCallback((
    serverId: string, 
    backupName: string, 
    field: 'additionalEmails' | 'additionalNtfyTopic'
  ): { value: string; isInherited: boolean; isOverridden: boolean } => {
    const backupKey = `${serverId}:${backupName}`;
    const backupSetting = settings[backupKey];
    const serverDefaults = getServerDefaultSettings(serverId);
    
    // Check if backup has an explicit value (including empty string means override)
    const hasExplicitValue = backupSetting && field in backupSetting && backupSetting[field] !== undefined;
    
    if (hasExplicitValue) {
      return {
        value: backupSetting[field] || '',
        isInherited: false,
        isOverridden: true,
      };
    }
    
    // Inherit from server defaults
    if (serverDefaults && serverDefaults[field]) {
      return {
        value: serverDefaults[field] || '',
        isInherited: true,
        isOverridden: false,
      };
    }
    
    return {
      value: '',
      isInherited: false,
      isOverridden: false,
    };
  }, [settings, getServerDefaultSettings]);

  // Get effective notification event for a backup (inherits from server if not overridden, falls back to notificationEvent)
  const getEffectiveNotificationEvent = useCallback((
    serverId: string, 
    backupName: string
  ): { value: NotificationEvent; isInherited: boolean; isOverridden: boolean } => {
    const backupKey = `${serverId}:${backupName}`;
    const backupSetting = settings[backupKey];
    const serverDefaults = getServerDefaultSettings(serverId);
    
    // Check if backup has an explicit additionalNotificationEvent value
    const hasExplicitValue = backupSetting && 'additionalNotificationEvent' in backupSetting && backupSetting.additionalNotificationEvent !== undefined;
    
    if (hasExplicitValue) {
      return {
        value: backupSetting.additionalNotificationEvent!,
        isInherited: false,
        isOverridden: true,
      };
    }
    
    // Inherit from server defaults
    if (serverDefaults && serverDefaults.additionalNotificationEvent) {
      return {
        value: serverDefaults.additionalNotificationEvent,
        isInherited: true,
        isOverridden: false,
      };
    }
    
    // Fall back to the main notificationEvent
    return {
      value: backupSetting?.notificationEvent || 'warnings',
      isInherited: false,
      isOverridden: false,
    };
  }, [settings, getServerDefaultSettings]);

  // Check if a backup has overridden a field
  const hasOverride = useCallback((serverId: string, backupName: string, field: 'additionalEmails' | 'additionalNtfyTopic' | 'additionalNotificationEvent'): boolean => {
    const backupKey = `${serverId}:${backupName}`;
    const backupSetting = settings[backupKey];
    return backupSetting !== undefined && field in backupSetting && backupSetting[field] !== undefined;
  }, [settings]);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (newSettings: Record<BackupKey, BackupNotificationConfig>) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    // Also clear text input timeout to avoid conflicts
    if (autoSaveTextInputTimeoutRef.current) {
      clearTimeout(autoSaveTextInputTimeoutRef.current);
      autoSaveTextInputTimeoutRef.current = null;
    }

    // Store pending changes
    pendingChangesRef.current = newSettings;

    // Set cursor to progress and auto-saving state immediately
    if (!isAutoSaving) {
      setIsAutoSaving(true);
      document.body.style.cursor = 'progress';
    }

    // Debounce the save operation
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Prevent concurrent auto-save operations
      if (isAutoSaveInProgressRef.current) {
        return;
      }

      isAutoSaveInProgressRef.current = true;
      setIsSavingInProgress(true);
      
      try {
        const settingsToSave = pendingChangesRef.current || newSettings;
        
        const response = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
          method: 'POST',
          body: JSON.stringify({
            backupSettings: settingsToSave
          }),
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to modify this setting. Only administrators can change configurations.');
          }
          const errorText = await response.text();
          console.error('Auto-save response error:', response.status, errorText);
          throw new Error(`Failed to auto-save backup settings: ${response.status} ${errorText}`);
        }
        
        // Refresh the configuration cache silently
        await refreshConfigSilently();
        
        // Refresh the config context to update tooltips immediately
        await refreshOverdueTolerance();
        
        // Clear pending changes
        pendingChangesRef.current = null;
        
        // Set flag to prevent useEffect from overwriting our saved changes
        // Clear any existing timeout
        if (justSavedTimeoutRef.current) {
          clearTimeout(justSavedTimeoutRef.current);
        }
        justSavedRef.current = true;
        // Clear the flag after 2 seconds (enough time for config refresh to complete)
        justSavedTimeoutRef.current = setTimeout(() => {
          justSavedRef.current = false;
          justSavedTimeoutRef.current = null;
        }, 2000);
        
      } catch (error) {
        console.error('Error auto-saving settings:', error instanceof Error ? error.message : String(error));
        toast({
          title: "Auto-save Error",
          description: `Failed to save backup notification settings: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        // Always reset the auto-saving state and cursor, regardless of success or failure
        isAutoSaveInProgressRef.current = false;
        setIsAutoSaving(false);
        setIsSavingInProgress(false);
        document.body.style.cursor = 'default';
        autoSaveTimeoutRef.current = null;
      }
    }, 500); // 500ms debounce
  }, [refreshConfigSilently, refreshOverdueTolerance, toast, isAutoSaving]);

  // Build settings object by reading values directly from input elements
  // This is simpler and more reliable than trying to keep state/refs in sync
  const buildSettingsFromInputs = useCallback((): Record<BackupKey, BackupNotificationConfig> => {
    // Start with current settings state (for non-text fields like checkboxes, selects)
    // Use settingsRef.current to get the latest state, not the potentially stale settings state
    const settingsToSave = { ...settingsRef.current };
    
    // Read all text input values directly from input refs
    Object.keys(textInputRefs.current).forEach(key => {
      const inputRef = textInputRefs.current[key];
      if (!inputRef) return;
      
      // Parse key: format is either "serverId:__default__:field" or "serverId:backupName:field"
      const parts = key.split(':');
      if (parts.length < 3) return;
      
      // Only process additionalEmails and additionalNtfyTopic fields
      const field = parts[2];
      if (field !== 'additionalEmails' && field !== 'additionalNtfyTopic') return;
      
      const currentValue = inputRef.value;
      
      // Check if it's a server default key (contains __default__)
      if (parts[1] === SERVER_DEFAULT_KEY_SUFFIX) {
        // Server default: "serverId:__default__:field"
        const serverId = parts[0];
        const serverDefaultKey = getServerDefaultKey(serverId);
        
        // For text fields, always use the input ref value directly to ensure we capture cleared values
        // The input ref value is the source of truth for what the user typed
        const valueToUse = currentValue ?? '';
        
        // Get existing server default config or create new one
        // IMPORTANT: Preserve all existing fields (like additionalNotificationEvent) when updating text fields
        const existingDefaults = settingsToSave[serverDefaultKey] || { ...defaultBackupNotificationConfig };
        
        // Update only the text field while preserving all other fields
        const updatedDefaults = {
          ...existingDefaults,
          [field]: valueToUse,
        };
        
        // Remove empty fields (only removes empty text fields, preserves other fields like additionalNotificationEvent)
        settingsToSave[serverDefaultKey] = removeEmptyFields(updatedDefaults);
      } else {
          // Regular backup setting: "serverId:backupName:field"
          const serverId = parts[0];
          const backupName = parts[1];
          if (serverId && backupName) {
            const backupKeyForSettings = `${serverId}:${backupName}`;
            
            // Check if backup currently has an explicit override in state
            const hasExplicitOverrideInState = settingsRef.current[backupKeyForSettings] && 
                                        field in settingsRef.current[backupKeyForSettings] && 
                                        settingsRef.current[backupKeyForSettings][field as 'additionalEmails' | 'additionalNtfyTopic'] !== undefined;
            
            // Check if backup previously had an override (in the original settings before any updates)
            // This is important when a field is cleared - it might be removed from state but we still need to save the removal
            const hadPreviousOverride = settingsToSave[backupKeyForSettings] && 
                                        field in settingsToSave[backupKeyForSettings] && 
                                        settingsToSave[backupKeyForSettings][field as 'additionalEmails' | 'additionalNtfyTopic'] !== undefined;
            
            // Check what the inherited value would be (from server defaults)
            const serverDefaultKey = getServerDefaultKey(serverId);
            const serverDefaults = settingsRef.current[serverDefaultKey];
            const inheritedValue = serverDefaults?.[field as 'additionalEmails' | 'additionalNtfyTopic'] ?? '';
            
            // Check if this input was recently updated (user is currently editing or just edited)
            // This helps distinguish between actual user edits and stale input ref values
            const wasRecentlyUpdated = recentlyUpdatedInputs.current.has(key) || textInputValuesRef.current[key] !== undefined;
            
            // Get the current value in state (either override or inherited)
            const currentStateValue = hasExplicitOverrideInState 
              ? (settingsRef.current[backupKeyForSettings]?.[field as 'additionalEmails' | 'additionalNtfyTopic'] ?? '')
              : inheritedValue;
            
            // Include the field if:
            // 1. There's an explicit override in state, OR
            // 2. The backup previously had an override (even if removed from state), OR
            // 3. The input value differs from inherited AND (matches state OR was recently updated)
            //    (this ensures we only create overrides for actual user edits, not stale input ref values)
            // This ensures that clearing a field (making it empty) is saved even if it was removed from state
            // but prevents stale input ref values from creating unwanted overrides
            const inputValueDiffersFromInherited = currentValue !== inheritedValue;
            const inputMatchesState = currentValue === currentStateValue;
            const shouldIncludeField = hasExplicitOverrideInState || hadPreviousOverride || (inputValueDiffersFromInherited && (inputMatchesState || wasRecentlyUpdated));
            
            if (shouldIncludeField) {
              // Backup has an explicit override or the input value differs from inherited, so include it in the settings
              if (!settingsToSave[backupKeyForSettings]) {
                settingsToSave[backupKeyForSettings] = { ...defaultBackupNotificationConfig };
              }
              settingsToSave[backupKeyForSettings][field as 'additionalEmails' | 'additionalNtfyTopic'] = currentValue;
              
              // Remove empty fields (this will remove the field if it's empty, regardless of server defaults)
              settingsToSave[backupKeyForSettings] = removeEmptyFields(settingsToSave[backupKeyForSettings]);
              
              // If the config is now effectively empty after removing empty fields, remove the key entirely
              const cleanedConfig = settingsToSave[backupKeyForSettings];
              const isConfigEmpty = (
                cleanedConfig.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
                cleanedConfig.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
                cleanedConfig.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
                cleanedConfig.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
                cleanedConfig.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
                (!cleanedConfig.allowedWeekDays || 
                 JSON.stringify(cleanedConfig.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort())) &&
                !cleanedConfig.additionalNotificationEvent &&
                !cleanedConfig.additionalEmails &&
                !cleanedConfig.additionalNtfyTopic
              );
              
              if (isConfigEmpty) {
                delete settingsToSave[backupKeyForSettings];
              }
            }
            // If backup is inheriting and input value matches inherited, we don't include the field
            // This preserves the inheritance relationship
          }
      }
    });
    
    return settingsToSave;
  }, [removeEmptyFields]);

  // Auto-save function specifically for text inputs
  // Reads values directly from input elements - simple and reliable
  // If immediate is true, saves right away (for blur events). Otherwise, waits 5 seconds.
  const autoSaveTextInput = useCallback(async (immediate: boolean = false) => {
    // Clear existing timeout
    if (autoSaveTextInputTimeoutRef.current) {
      clearTimeout(autoSaveTextInputTimeoutRef.current);
    }
    // Also clear regular autoSave timeout to avoid conflicts
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    // If immediate, save right away (blur event)
    if (immediate) {
      // Prevent concurrent auto-save operations
      if (isAutoSaveInProgressRef.current) {
        return;
      }

      // Set cursor and saving state when save starts
      isAutoSaveInProgressRef.current = true;
      setIsAutoSaving(true);
      setIsSavingInProgress(true);
      document.body.style.cursor = 'progress';
      
      try {
        // Read values directly from input elements - simple and reliable
        const settingsToSave = buildSettingsFromInputs();
        
        const response = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
          method: 'POST',
          body: JSON.stringify({
            backupSettings: settingsToSave
          }),
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to modify this setting. Only administrators can change configurations.');
          }
          const errorText = await response.text();
          console.error('Auto-save response error:', response.status, errorText);
          throw new Error(`Failed to auto-save backup settings: ${response.status} ${errorText}`);
        }
        
        // Refresh the configuration cache silently
        await refreshConfigSilently();
        
        // Refresh the config context to update tooltips immediately
        await refreshOverdueTolerance();
        
        // Set flag to prevent useEffect from overwriting our saved changes
        // Clear any existing timeout
        if (justSavedTimeoutRef.current) {
          clearTimeout(justSavedTimeoutRef.current);
        }
        justSavedRef.current = true;
        // Clear the flag after 2 seconds (enough time for config refresh to complete)
        justSavedTimeoutRef.current = setTimeout(() => {
          justSavedRef.current = false;
          justSavedTimeoutRef.current = null;
        }, 2000);
        
      } catch (error) {
        console.error('Error auto-saving settings:', error instanceof Error ? error.message : String(error));
        toast({
          title: "Auto-save Error",
          description: `Failed to save backup notification settings: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        // Always reset the auto-saving state and cursor, regardless of success or failure
        isAutoSaveInProgressRef.current = false;
        setIsAutoSaving(false);
        setIsSavingInProgress(false);
        document.body.style.cursor = 'default';
        autoSaveTextInputTimeoutRef.current = null;
      }
      return;
    }

    // Otherwise, debounce the save operation with 5 second delay for text inputs
    // This only saves if user stops typing for 5 seconds
    autoSaveTextInputTimeoutRef.current = setTimeout(async () => {
      // Prevent concurrent auto-save operations
      if (isAutoSaveInProgressRef.current) {
        return;
      }

      // First, capture ALL values from textInputValuesRef BEFORE clearing any timeouts
      // This prevents race conditions where timeouts delete values before we read them
      const capturedValuesFromOnChange = new Map<string, string>();
      Object.keys(textInputValuesRef.current).forEach(key => {
        const parts = key.split(':');
        if (parts.length < 3) return;
        const field = parts[2];
        if (field === 'additionalEmails' || field === 'additionalNtfyTopic') {
          const value = textInputValuesRef.current[key];
          if (value !== undefined) {
            capturedValuesFromOnChange.set(key, value);
          }
        }
      });
      
      // Now clear pending timeouts (this prevents storeTextInputValue timeouts from deleting textInputValuesRef)
      Object.keys(textInputTimeoutRefs.current).forEach(key => {
        const timeout = textInputTimeoutRefs.current[key];
        if (timeout) {
          clearTimeout(timeout);
          delete textInputTimeoutRefs.current[key];
        }
      });
      
      // Read current values from ALL text inputs and store them
      // We'll use these values for saving, and also update state with them
      const inputValuesToSave = new Map<string, string>();
      Object.keys(textInputRefs.current).forEach(key => {
        const inputRef = textInputRefs.current[key];
        if (!inputRef) return;
        
        // Only process additionalEmails and additionalNtfyTopic fields
        const parts = key.split(':');
        if (parts.length < 3) return;
        const field = parts[2];
        if (field !== 'additionalEmails' && field !== 'additionalNtfyTopic') return;
        
        // Prefer the value from textInputValuesRef (updated on every onChange)
        // which is more reliable than inputRef.value (can be stale after re-renders)
        // We captured these values above to avoid race conditions
        // Fall back to inputRef.value if textInputValuesRef doesn't have it
        const valueFromOnChange = capturedValuesFromOnChange.get(key);
        const valueFromInputRef = inputRef.value;
        const currentValue = valueFromOnChange !== undefined ? valueFromOnChange : valueFromInputRef;
        inputValuesToSave.set(key, currentValue);
        
        // Update the state with the current input value
        updateTextInputToMainState(key, currentValue, true);
        
        // Clean up any pending timeouts or refs for this key
        delete textInputValuesRef.current[key];
      });

      // Wait a brief moment to ensure state updates have been applied
      // setSettings is async, but settingsRef.current is updated synchronously in the callback
      // We need to wait a bit longer to ensure all setSettings callbacks have completed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Now update settingsRef with the values we read, to ensure buildSettingsFromInputs uses them
      // This is a safety measure in case state updates haven't propagated yet
      inputValuesToSave.forEach((value, key) => {
        const parts = key.split(':');
        if (parts.length < 3) return;
        if (parts[1] === SERVER_DEFAULT_KEY_SUFFIX) {
          const serverId = parts[0];
          const field = parts[2];
          const serverDefaultKey = getServerDefaultKey(serverId);
          if (!settingsRef.current[serverDefaultKey]) {
            settingsRef.current[serverDefaultKey] = { ...defaultBackupNotificationConfig };
          }
          settingsRef.current[serverDefaultKey][field as 'additionalEmails' | 'additionalNtfyTopic'] = value;
        }
      });

      // Now set cursor and saving state when save actually starts
      isAutoSaveInProgressRef.current = true;
      setIsAutoSaving(true);
      setIsSavingInProgress(true);
      document.body.style.cursor = 'progress';
      
      try {
        // Read values directly from input elements - simple and reliable
        const settingsToSave = buildSettingsFromInputs();
        
        const response = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
          method: 'POST',
          body: JSON.stringify({
            backupSettings: settingsToSave
          }),
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to modify this setting. Only administrators can change configurations.');
          }
          const errorText = await response.text();
          console.error('Auto-save response error:', response.status, errorText);
          throw new Error(`Failed to auto-save backup settings: ${response.status} ${errorText}`);
        }
        
        // Refresh the configuration cache silently
        await refreshConfigSilently();
        
        // Refresh the config context to update tooltips immediately
        await refreshOverdueTolerance();
        
        // Set flag to prevent useEffect from overwriting our saved changes
        // Clear any existing timeout
        if (justSavedTimeoutRef.current) {
          clearTimeout(justSavedTimeoutRef.current);
        }
        justSavedRef.current = true;
        // Clear the flag after 2 seconds (enough time for config refresh to complete)
        justSavedTimeoutRef.current = setTimeout(() => {
          justSavedRef.current = false;
          justSavedTimeoutRef.current = null;
        }, 2000);
        
      } catch (error) {
        console.error('Error auto-saving settings:', error instanceof Error ? error.message : String(error));
        toast({
          title: "Auto-save Error",
          description: `Failed to save backup notification settings: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        // Always reset the auto-saving state and cursor, regardless of success or failure
        isAutoSaveInProgressRef.current = false;
        setIsAutoSaving(false);
        setIsSavingInProgress(false);
        document.body.style.cursor = 'default';
        autoSaveTextInputTimeoutRef.current = null;
      }
    }, 5000); // 5 second timeout - only saves if user stops typing for 5 seconds
  }, [refreshConfigSilently, refreshOverdueTolerance, toast, buildSettingsFromInputs]);

  // Trigger autosave immediately for text fields (called on blur)
  const triggerTextInputAutoSave = useCallback(() => {
    // Clear any pending timeout since we're saving now
    if (autoSaveTextInputTimeoutRef.current) {
      clearTimeout(autoSaveTextInputTimeoutRef.current);
      autoSaveTextInputTimeoutRef.current = null;
    }
    // Trigger immediate save
    autoSaveTextInput(true);
  }, [autoSaveTextInput]);

  const updateBackupSettingById: (serverId: string, backupName: string, field: keyof BackupNotificationConfig, value: string | number | boolean) => void = useCallback((serverId: string, backupName: string, field: keyof BackupNotificationConfig, value: string | number | boolean) => {
    const backupKey = `${serverId}:${backupName}`;
    
    // Use functional update to avoid creating new object unnecessarily
    // This is more efficient and prevents unnecessary re-renders
    setSettings(prev => {
      const currentSetting = prev[backupKey] || { ...defaultBackupNotificationConfig };
      
      // Check if there are server defaults
      const serverDefaultKey = getServerDefaultKey(serverId);
      const serverDefaults = prev[serverDefaultKey];
      const hasServerDefaults = serverDefaults !== null;
      
      // Set the value, then remove empty fields for additionalEmails and additionalNtfyTopic
      const updatedSetting = {
        ...currentSetting,
        [field]: value,
      };
      const cleanedSetting = removeEmptyFields(updatedSetting);
      
      // If the config is now effectively empty after removing empty fields, remove the key entirely
      const isConfigEmpty = (
        cleanedSetting.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
        cleanedSetting.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
        cleanedSetting.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
        cleanedSetting.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
        cleanedSetting.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
        (!cleanedSetting.allowedWeekDays || 
         JSON.stringify(cleanedSetting.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort())) &&
        !cleanedSetting.additionalNotificationEvent &&
        !cleanedSetting.additionalEmails &&
        !cleanedSetting.additionalNtfyTopic
      );
      
      const newSettings = { ...prev };
      if (isConfigEmpty) {
        delete newSettings[backupKey];
      } else {
        newSettings[backupKey] = cleanedSetting;
      }
      
      // Update ref immediately so autoSave can access latest state
      settingsRef.current = newSettings;
      
      // For text input fields, don't trigger autosave during typing
      // Autosave will happen on blur or after 5 seconds of inactivity
      if (field === 'additionalEmails' || field === 'additionalNtfyTopic') {
        // Schedule autoSave with 5 second timeout (only saves if user stops typing)
        autoSaveTextInput();
      } else {
        // Use regular auto-save for other fields
        autoSave(newSettings);
      }
      
      return newSettings;
    });
  }, [setSettings, removeEmptyFields, autoSaveTextInput, autoSave]);

  // Store value in ref (no re-renders, no expensive computations)
  // Input is uncontrolled, so we just store the value for later use
  // The value will be read by autoSaveTextInput's 5-second timeout
  // We don't set up our own timeout here - autoSaveTextInput handles that
  const storeTextInputValue = (key: string, value: string) => {
    textInputValuesRef.current[key] = value;
    // Note: We don't set up a timeout here anymore - autoSaveTextInput handles the 5-second autosave
    // This prevents race conditions where the timeout deletes the value before autoSaveTextInput can read it
  };

  // Update all backup inputs that inherit from a server default when that default changes
  const updateInheritingBackupInputs = useCallback((serverId: string, field: 'additionalEmails' | 'additionalNtfyTopic', newValue: string) => {
    if (!config?.serversWithBackups) return;
    
    // Find all backups for this server
    const serverBackups = config.serversWithBackups.filter((server: ServerWithBackup) => server.id === serverId);
    
    serverBackups.forEach((backup: ServerWithBackup) => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      const backupSetting = settingsRef.current[backupKey];
      
      // Check if this backup is inheriting (no explicit value set)
      const hasExplicitValue = backupSetting && field in backupSetting && backupSetting[field] !== undefined;
      
      if (!hasExplicitValue) {
        // This backup is inheriting, update its input value
        const inputKey = `${backupKey}:${field}`;
        const inputRef = textInputRefs.current[inputKey];
        
        if (inputRef && document.activeElement !== inputRef) {
          // Only update if the value is different and user is not currently typing
          if (inputRef.value !== newValue && !textInputTimeoutRefs.current[inputKey]) {
            inputRef.value = newValue;
          }
        }
      }
    });
  }, [config?.serversWithBackups]);

  // Update main state from text input value (called on blur or timeout)
  const updateTextInputToMainState = useCallback((key: string, value: string, syncInputAfterUpdate: boolean = false) => {
    // Parse key: format is either "serverId:__default__:field" or "serverId:backupName:field"
    const parts = key.split(':');
    if (parts.length < 3) return;
    
      // Check if it's a server default key (contains __default__)
      if (parts[1] === SERVER_DEFAULT_KEY_SUFFIX) {
        // Server default: "serverId:__default__:field"
        const serverId = parts[0];
        const field = parts[2];
        
        if (!serverId || !field) return;
        
        const serverDefaultKey = getServerDefaultKey(serverId);
        
        // Update state and ref synchronously
        setSettings(prev => {
          const currentDefaults = prev[serverDefaultKey] || { ...defaultBackupNotificationConfig };
          
          // Set the value, then remove empty fields (consistent with updateServerDefaultSetting)
          const updatedDefaults = {
            ...currentDefaults,
            [field]: value,
          };
          const cleanedDefaults = removeEmptyFields(updatedDefaults);
          
          const newSettings = {
            ...prev,
            [serverDefaultKey]: cleanedDefaults,
          };
          
          // Update ref immediately so autoSave can access latest state
          // This happens synchronously inside setSettings callback
          settingsRef.current = newSettings;
          
          return newSettings;
        });
        
        // Update all backup inputs that inherit from this server default
        // Use setTimeout to ensure state update has completed
        setTimeout(() => {
          updateInheritingBackupInputs(serverId, field as 'additionalEmails' | 'additionalNtfyTopic', value);
        }, 0);
      } else {
      // Regular backup setting: "serverId:backupName:field"
      const serverId = parts[0];
      const backupName = parts[1];
      const field = parts[2];
      if (serverId && backupName && field) {
        const backupKey = `${serverId}:${backupName}`;
        const fieldName = field as 'additionalEmails' | 'additionalNtfyTopic';
        
        // Check if backup currently has an explicit override
        const currentSetting = settingsRef.current[backupKey];
        const hasExplicitOverride = currentSetting && fieldName in currentSetting && currentSetting[fieldName] !== undefined;
        
        // Get the inherited value from server defaults
        const serverDefaultKey = getServerDefaultKey(serverId);
        const serverDefaults = settingsRef.current[serverDefaultKey];
        const hasServerDefaults = serverDefaults !== null;
        const inheritedValue = serverDefaults?.[fieldName] ?? '';
        
        // When there are no server defaults and value is empty, remove the field entirely
        if (!hasServerDefaults && value.trim() === '') {
          if (hasExplicitOverride) {
            // Remove the field from the override
            setSettings(prev => {
              const currentSetting = prev[backupKey];
              if (!currentSetting) return prev;
              
              const { [fieldName]: _, ...rest } = currentSetting;
              
              // If the config is now effectively empty, remove the key entirely
              const cleanedConfig = rest as BackupNotificationConfig;
              const isConfigEmpty = (
                cleanedConfig.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
                cleanedConfig.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
                cleanedConfig.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
                cleanedConfig.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
                cleanedConfig.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
                (!cleanedConfig.allowedWeekDays || 
                 JSON.stringify(cleanedConfig.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort())) &&
                !cleanedConfig.additionalNotificationEvent &&
                !cleanedConfig.additionalEmails &&
                !cleanedConfig.additionalNtfyTopic
              );
              
              const newSettings = { ...prev };
              if (isConfigEmpty) {
                delete newSettings[backupKey];
              } else {
                newSettings[backupKey] = cleanedConfig;
              }
              
              settingsRef.current = newSettings;
              autoSaveTextInput(true);
              
              return newSettings;
            });
          }
          // If no explicit override, nothing to remove
          return;
        }
        
        // Only create/update override if:
        // 1. Backup already has an explicit override, OR
        // 2. The new value is different from the inherited value (user actually changed it)
        if (hasExplicitOverride || value !== inheritedValue) {
          updateBackupSettingById(serverId, backupName, fieldName, value);
        }
        // If backup is inheriting and value matches inherited value, don't create an override
        // This preserves the inheritance relationship
      }
    }
    
    // Sync input value after state update (for uncontrolled inputs)
    // For server defaults, don't sync at all - the input already has the correct value from user typing
    // For backup settings, read from settings to get the effective value (which may inherit from server defaults)
    if (syncInputAfterUpdate && parts[1] !== SERVER_DEFAULT_KEY_SUFFIX) {
      // For backup settings, sync the input value to match the effective value
      // Mark as recently updated to prevent ref callback from overwriting
      recentlyUpdatedInputs.current.add(key);
      
      // Use setTimeout to ensure state update has completed
      setTimeout(() => {
        const inputRef = textInputRefs.current[key];
        if (inputRef && document.activeElement !== inputRef) {
          // Read from settings to get the effective value
          // (which may inherit from server defaults if not overridden)
          const serverId = parts[0];
          const backupName = parts[1];
          const fieldName = parts[2] as 'additionalEmails' | 'additionalNtfyTopic';
          let newValue = '';
          if (serverId && backupName) {
            const backupKeyForSettings = `${serverId}:${backupName}`;
            const backupSetting = settingsRef.current[backupKeyForSettings];
            // Check if backup has explicit value, otherwise get from server defaults
            if (backupSetting && (fieldName === 'additionalEmails' || fieldName === 'additionalNtfyTopic')) {
              if (fieldName in backupSetting && backupSetting[fieldName] !== undefined) {
                newValue = backupSetting[fieldName] ?? '';
              } else {
                // Inherit from server defaults
                const serverDefaultKey = getServerDefaultKey(serverId);
                const serverDefaults = settingsRef.current[serverDefaultKey];
                newValue = serverDefaults?.[fieldName] ?? '';
              }
            }
          }
          // Update input value to match saved state
          // Only update if different to avoid unnecessary DOM manipulation
          if (inputRef.value !== newValue) {
            inputRef.value = newValue;
          }
        }
        
        // Remove from recently updated set after a short delay
        setTimeout(() => {
          recentlyUpdatedInputs.current.delete(key);
        }, 100);
      }, 0);
    }
  }, [setSettings, removeEmptyFields, updateInheritingBackupInputs, updateBackupSettingById]);


  // Get current value from input ref or effective value (for test buttons, etc.)
  const getCurrentTextInputValue = (key: string, effectiveValue: string): string => {
    const inputRef = textInputRefs.current[key];
    if (inputRef && inputRef.value !== undefined && inputRef.value !== '') {
      return inputRef.value;
    }
    return effectiveValue;
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Select-all handlers
  const handleSelectAllNtfy = (checked: boolean) => {
    const newSettings = { ...settings };
    
    // If backups are selected, only update those; otherwise update all backups
    if (selectedBackups.size > 0) {
      selectedBackups.forEach(backupKey => {
        newSettings[backupKey] = {
          ...(newSettings[backupKey] || { ...defaultBackupNotificationConfig }),
          ntfyEnabled: checked,
        };
      });
    } else {
      // Fallback to all backups when none are selected
      const servers = getServersWithBackupAndSettings();
      servers.forEach(server => {
        const backupKey = `${server.id}:${server.backupName}`;
        newSettings[backupKey] = {
          ...(newSettings[backupKey] || { ...defaultBackupNotificationConfig }),
          ntfyEnabled: checked,
        };
      });
    }
    
    setSettings(newSettings);
    autoSave(newSettings);
  };

  const handleSelectAllEmail = (checked: boolean) => {
    const newSettings = { ...settings };
    
    // If backups are selected, only update those; otherwise update all backups
    if (selectedBackups.size > 0) {
      selectedBackups.forEach(backupKey => {
        newSettings[backupKey] = {
          ...(newSettings[backupKey] || { ...defaultBackupNotificationConfig }),
          emailEnabled: checked,
        };
      });
    } else {
      // Fallback to all backups when none are selected
      const servers = getServersWithBackupAndSettings();
      servers.forEach(server => {
        const backupKey = `${server.id}:${server.backupName}`;
        newSettings[backupKey] = {
          ...(newSettings[backupKey] || { ...defaultBackupNotificationConfig }),
          emailEnabled: checked,
        };
      });
    }
    
    setSettings(newSettings);
    autoSave(newSettings);
  };

  // Create servers with settings for sorting
  const getServersWithBackupAndSettings = useCallback((): ServerWithBackupAndSettings[] => {
    if (!config?.serversWithBackups) return [];
    
    return config.serversWithBackups.map((server: ServerWithBackup) => {
      const backupSetting = getBackupSettingById(server.id, server.backupName);
      
      return {
        ...server,
        notificationEvent: backupSetting.notificationEvent,
      };
    });
  }, [config?.serversWithBackups, getBackupSettingById]);

  // Group backups by server - memoized to prevent recalculation on every render
  const serverGroups = useMemo((): ServerGroup[] => {
    if (!config?.serversWithBackups) return [];
    
    const groupsMap = new Map<string, ServerGroup>();
    
    config.serversWithBackups.forEach((server: ServerWithBackup) => {
      if (!groupsMap.has(server.id)) {
        groupsMap.set(server.id, {
          serverId: server.id,
          serverName: server.name,
          serverAlias: server.alias,
          serverUrl: server.server_url,
          serverNote: server.note,
          backups: [],
        });
      }
      groupsMap.get(server.id)!.backups.push(server);
    });
    
    // Sort backups within each group
    const groups = Array.from(groupsMap.values());
    groups.forEach(group => {
      group.backups.sort((a, b) => {
        const aSetting = getBackupSettingById(a.id, a.backupName);
        const bSetting = getBackupSettingById(b.id, b.backupName);
        
        if (sortConfig.column === 'backupName') {
          return sortConfig.direction === 'asc' 
            ? a.backupName.localeCompare(b.backupName)
            : b.backupName.localeCompare(a.backupName);
        } else if (sortConfig.column === 'notificationEvent') {
          const aVal = aSetting.notificationEvent;
          const bVal = bSetting.notificationEvent;
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    });
    
    // Sort groups by server name
    groups.sort((a, b) => {
      if (sortConfig.column === 'name') {
        const aName = a.serverAlias || a.serverName;
        const bName = b.serverAlias || b.serverName;
        return sortConfig.direction === 'asc' 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      return 0;
    });
    
    return groups;
  }, [config?.serversWithBackups, sortConfig, getBackupSettingById]);

  // Get filtered and sorted server groups - memoized
  const filteredServerGroups = useMemo(() => {
    return serverGroups.filter(group => {
      if (!serverNameFilter.trim()) return true;
      const filterLower = serverNameFilter.toLowerCase();
      const nameMatch = group.serverName.toLowerCase().includes(filterLower);
      const aliasMatch = group.serverAlias?.toLowerCase().includes(filterLower) || false;
      return nameMatch || aliasMatch;
    });
  }, [serverGroups, serverNameFilter]);

  // Legacy: Get sorted servers (for backward compatibility with some logic) - memoized
  const sortedServers = useMemo(() => {
    return createSortedArray(getServersWithBackupAndSettings(), sortConfig, columnConfig);
  }, [sortConfig, getServersWithBackupAndSettings, columnConfig]);

  // Filter servers by server name/alias (for backward compatibility) - memoized
  const filteredServers = useMemo(() => {
    return sortedServers.filter(server => {
      if (!serverNameFilter.trim()) return true;
      const filterLower = serverNameFilter.toLowerCase();
      const nameMatch = server.name.toLowerCase().includes(filterLower);
      const aliasMatch = server.alias?.toLowerCase().includes(filterLower) || false;
      return nameMatch || aliasMatch;
    });
  }, [sortedServers, serverNameFilter]);

  // Update select-all state based on current settings
  useEffect(() => {
    if (sortedServers.length === 0) return;
    
    // If backups are selected, only check those; otherwise check all backups
    let ntfyStates: boolean[];
    let emailStates: boolean[];
    
    if (selectedBackups.size > 0) {
      // Check only selected backups
      ntfyStates = Array.from(selectedBackups).map(backupKey => {
        const [serverId, backupName] = backupKey.split(':');
        const setting = getBackupSettingById(serverId, backupName);
        return setting.ntfyEnabled !== undefined ? setting.ntfyEnabled : true;
      });
      emailStates = Array.from(selectedBackups).map(backupKey => {
        const [serverId, backupName] = backupKey.split(':');
        const setting = getBackupSettingById(serverId, backupName);
        return setting.emailEnabled !== undefined ? setting.emailEnabled : true;
      });
    } else {
      // Fallback to all backups when none are selected
      ntfyStates = sortedServers.map(server => {
        const setting = getBackupSettingById(server.id, server.backupName);
        return setting.ntfyEnabled !== undefined ? setting.ntfyEnabled : true;
      });
      emailStates = sortedServers.map(server => {
        const setting = getBackupSettingById(server.id, server.backupName);
        return setting.emailEnabled !== undefined ? setting.emailEnabled : true;
      });
    }
    
    setAllNtfySelected(ntfyStates.every(state => state));
    setAllEmailSelected(emailStates.every(state => state));
  }, [settings, sortedServers, selectedBackups, getBackupSettingById]);

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedBackups(prev => {
      const newSet = new Set(prev);
      filteredServerGroups.forEach(group => {
        group.backups.forEach(backup => {
          const backupKey = `${backup.id}:${backup.backupName}`;
          if (checked) {
            newSet.add(backupKey);
          } else {
            newSet.delete(backupKey);
          }
        });
      });
      return newSet;
    });
  };

  const handleToggleSelection = (backupKey: BackupKey) => {
    setSelectedBackups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(backupKey)) {
        newSet.delete(backupKey);
      } else {
        newSet.add(backupKey);
      }
      return newSet;
    });
  };

  // Select all backups for a server
  const handleSelectServer = (serverId: string, checked: boolean) => {
    setSelectedBackups(prev => {
      const newSet = new Set(prev);
      const group = serverGroups.find(g => g.serverId === serverId);
      if (group) {
        group.backups.forEach(backup => {
          const backupKey = `${backup.id}:${backup.backupName}`;
          if (checked) {
            newSet.add(backupKey);
          } else {
            newSet.delete(backupKey);
          }
        });
      }
      return newSet;
    });
  };

  // Check if all backups in a server are selected
  const isServerFullySelected = (serverId: string): boolean => {
    const group = filteredServerGroups.find(g => g.serverId === serverId);
    if (!group || group.backups.length === 0) return false;
    return group.backups.every(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      return selectedBackups.has(backupKey);
    });
  };

  // Check if some backups in a server are selected
  const isServerPartiallySelected = (serverId: string): boolean => {
    const group = filteredServerGroups.find(g => g.serverId === serverId);
    if (!group) return false;
    const selectedCount = group.backups.filter(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      return selectedBackups.has(backupKey);
    }).length;
    return selectedCount > 0 && selectedCount < group.backups.length;
  };

  const handleClearSelection = () => {
    setSelectedBackups(new Set());
  };

  // Calculate select-all checkbox state
  const allFilteredSelected = filteredServerGroups.length > 0 && filteredServerGroups.every(group => {
    return group.backups.every(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      return selectedBackups.has(backupKey);
    });
  });
  const someFilteredSelected = filteredServerGroups.some(group => {
    return group.backups.some(backup => {
      const backupKey = `${backup.id}:${backup.backupName}`;
      return selectedBackups.has(backupKey);
    });
  });

  // Bulk remove additional destinations handler (called after confirmation)
  // This clears all values but maintains inheritance structure
  const handleBulkRemoveAdditionalDestinationsConfirmed = async () => {
    if (selectedBackups.size === 0) return;

    // Capture count before clearing
    const selectedCount = selectedBackups.size;

    // Clear any pending auto-save to prevent race conditions
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    // Prevent concurrent auto-save operations during bulk update
    if (isAutoSaveInProgressRef.current) {
      toast({
        title: "Update In Progress",
        description: "Please wait for the current save operation to complete.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // Helper function to check if a config is effectively empty (only has default values)
      // A config is empty if it only contains values that match the defaults
      const isConfigEmpty = (config: BackupNotificationConfig): boolean => {
        // Check if all non-dynamic fields match defaults
        // Dynamic fields like 'time' and 'lastBackupDate' are ignored as they're runtime values
        return (
          config.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
          config.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
          config.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
          config.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
          config.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
          (!config.allowedWeekDays || 
           JSON.stringify(config.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort())) &&
          !config.additionalNotificationEvent &&
          !config.additionalEmails &&
          !config.additionalNtfyTopic
        );
      };

      // Collect all updates into a single settings object
      const updatedSettings = { ...settings };
      
      // Collect unique server IDs from selected backups
      const affectedServerIds = new Set<string>();
      
      // First pass: collect server IDs and remove backup overrides
      selectedBackups.forEach(backupKey => {
        const [serverId, backupName] = backupKey.split(':');
        if (serverId && backupName) {
          affectedServerIds.add(serverId);
          const currentSetting = updatedSettings[backupKey];
          
          if (currentSetting) {
            // Remove all additional destination fields from the backup configuration
            const { additionalNotificationEvent, additionalEmails, additionalNtfyTopic, ...rest } = currentSetting;
            const cleanedConfig = rest as BackupNotificationConfig;
            
            // If the config is now effectively empty (only has defaults), remove the key entirely
            if (isConfigEmpty(cleanedConfig)) {
              delete updatedSettings[backupKey];
            } else {
              updatedSettings[backupKey] = cleanedConfig;
            }
          }
        }
      });
      
      // Second pass: remove additional fields from server defaults for all affected servers
      affectedServerIds.forEach(serverId => {
        const serverDefaultKey = getServerDefaultKey(serverId);
        const currentServerDefault = updatedSettings[serverDefaultKey];
        
        if (currentServerDefault) {
          // Remove all additional destination fields from the server default configuration
          // Explicitly create a new object without these fields
          const cleanedConfig: BackupNotificationConfig = {
            ...currentServerDefault,
          };
          delete cleanedConfig.additionalNotificationEvent;
          delete cleanedConfig.additionalEmails;
          delete cleanedConfig.additionalNtfyTopic;
          
          // If the config is now effectively empty (only has defaults), remove the key entirely
          if (isConfigEmpty(cleanedConfig)) {
            delete updatedSettings[serverDefaultKey];
          } else {
            updatedSettings[serverDefaultKey] = cleanedConfig;
          }
        }
      });

      // Update state once with all changes
      setSettings(updatedSettings);
      
      // Update settingsRef immediately to clear in-memory values
      // This ensures the ref is synchronized before any auto-save or other operations
      settingsRef.current = updatedSettings;
      
      // Set saving state
      setIsSavingInProgress(true);
      setIsAutoSaving(true);
      document.body.style.cursor = 'progress';
      isAutoSaveInProgressRef.current = true;

      // Save immediately without debounce for bulk updates
      try {
        const response = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
          method: 'POST',
          body: JSON.stringify({
            backupSettings: updatedSettings
          }),
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to modify this setting. Only administrators can change configurations.');
          }
          const errorText = await response.text();
          console.error('Bulk remove response error:', response.status, errorText);
          throw new Error(`Failed to save backup settings: ${response.status} ${errorText}`);
        }
        
        // Refresh the configuration cache silently
        await refreshConfigSilently();
        
        // Refresh the config context to update tooltips immediately
        await refreshOverdueTolerance();
        
        // Set flag to prevent useEffect from overwriting our saved changes
        // Clear any existing timeout
        if (justSavedTimeoutRef.current) {
          clearTimeout(justSavedTimeoutRef.current);
        }
        justSavedRef.current = true;
        // Clear the flag after 2 seconds (enough time for config refresh to complete)
        justSavedTimeoutRef.current = setTimeout(() => {
          justSavedRef.current = false;
          justSavedTimeoutRef.current = null;
        }, 2000);
        
        // Close confirmation dialog
        setIsBulkClearConfirmOpen(false);
        
        // Clear selection
        handleClearSelection();
        
        toast({
          title: "Additional Destinations Cleared",
          description: `Cleared all additional destinations from ${selectedCount} backup${selectedCount === 1 ? '' : 's'}. Inheritance maintained.`,
          duration: 3000,
        });
      } catch (error) {
        console.error('Error saving bulk remove:', error instanceof Error ? error.message : String(error));
        toast({
          title: "Remove Error",
          description: `Failed to remove additional destinations: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
          duration: 5000,
        });
        throw error;
      } finally {
        // Always reset the saving state
        isAutoSaveInProgressRef.current = false;
        setIsAutoSaving(false);
        setIsSavingInProgress(false);
        document.body.style.cursor = 'default';
      }
    } catch (error) {
      // Error already handled in inner try-catch
      console.error('Bulk remove error:', error);
    }
  };

  // Test email handler
  const handleTestEmail = async (backupKey: BackupKey, emails: string) => {
    if (!emails || !emails.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter email addresses before testing",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Validate email addresses (basic check - must contain @)
    const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
    const invalidEmails = emailList.filter(e => !e.includes('@'));
    if (invalidEmails.length > 0) {
      toast({
        title: "Validation Error",
        description: `Invalid email addresses: ${invalidEmails.join(', ')}`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setTestingEmail(backupKey);
    try {
      // Send test email to each address
      for (const email of emailList) {
        const response = await authenticatedRequestWithRecovery('/api/notifications/test', {
          method: 'POST',
          body: JSON.stringify({ 
            type: 'email',
            toEmail: email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send test email');
        }
      }

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${emailList.length} address${emailList.length === 1 ? '' : 'es'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error sending test email:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Test Email Failed",
        description: error instanceof Error ? error.message : 'Failed to send test email',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setTestingEmail(null);
    }
  };

  // Test NTFY handler
  const handleTestNtfy = async (backupKey: BackupKey, topic: string) => {
    if (!topic || !topic.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a topic before testing",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!config?.ntfy?.url) {
      toast({
        title: "Configuration Error",
        description: "NTFY is not configured. Please configure NTFY settings first.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setTestingNtfy(backupKey);
    try {
      const response = await authenticatedRequestWithRecovery('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ 
          type: 'simple',
          ntfyConfig: {
            url: config.ntfy.url,
            topic: topic.trim(),
            accessToken: config.ntfy.accessToken,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test notification');
      }

      toast({
        title: "Test Notification Sent",
        description: `Test notification sent to topic: ${topic.trim()}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error sending test NTFY notification:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Test Notification Failed",
        description: error instanceof Error ? error.message : 'Failed to send test notification',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setTestingNtfy(null);
    }
  };

  // Generate QR code handler
  const handleGenerateQrCode = async (topic: string) => {
    if (!topic || !topic.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a topic before generating QR code",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!config?.ntfy?.url) {
      toast({
        title: "Configuration Error",
        description: "NTFY is not configured. Please configure NTFY settings first.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // Extract server URL from the NTFY URL (remove trailing slash)
      const serverUrl = config.ntfy.url.replace(/\/$/, '');
      const topicName = topic.trim();
      
      // Build the NTFY URL for phone configuration
      let ntfyUrl = `ntfy://${serverUrl.replace(/^https?:\/\//, '')}/${topicName}`;
      
      // Add access token if configured
      if (config.ntfy.accessToken && config.ntfy.accessToken.trim() !== '') {
        ntfyUrl += `?auth=tk_${config.ntfy.accessToken}`;
      }

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(ntfyUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
      setTopicUrl(ntfyUrl);
      setIsQrModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR Code Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Bulk test email handler
  const handleBulkTestEmail = async () => {
    if (!bulkEditAdditionalEmails || !bulkEditAdditionalEmails.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter email addresses before testing",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Validate email addresses (basic check - must contain @)
    const emailList = bulkEditAdditionalEmails.split(',').map(e => e.trim()).filter(e => e);
    const invalidEmails = emailList.filter(e => !e.includes('@'));
    if (invalidEmails.length > 0) {
      toast({
        title: "Validation Error",
        description: `Invalid email addresses: ${invalidEmails.join(', ')}`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setTestingBulkEmail(true);
    try {
      // Send test email to each address
      for (const email of emailList) {
        const response = await authenticatedRequestWithRecovery('/api/notifications/test', {
          method: 'POST',
          body: JSON.stringify({ 
            type: 'email',
            toEmail: email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send test email');
        }
      }

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${emailList.length} address${emailList.length === 1 ? '' : 'es'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error sending test email:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Test Email Failed",
        description: error instanceof Error ? error.message : 'Failed to send test email',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setTestingBulkEmail(false);
    }
  };

  // Bulk test NTFY handler
  const handleBulkTestNtfy = async () => {
    if (!bulkEditAdditionalNtfyTopic || !bulkEditAdditionalNtfyTopic.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a topic before testing",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!config?.ntfy?.url) {
      toast({
        title: "Configuration Error",
        description: "NTFY is not configured. Please configure NTFY settings first.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setTestingBulkNtfy(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ 
          type: 'simple',
          ntfyConfig: {
            url: config.ntfy.url,
            topic: bulkEditAdditionalNtfyTopic.trim(),
            accessToken: config.ntfy.accessToken,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test notification');
      }

      toast({
        title: "Test Notification Sent",
        description: `Test notification sent to topic: ${bulkEditAdditionalNtfyTopic.trim()}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error sending test NTFY notification:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Test Notification Failed",
        description: error instanceof Error ? error.message : 'Failed to send test notification',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setTestingBulkNtfy(false);
    }
  };

  // Bulk update handler
  const handleBulkUpdate = async () => {
    if (selectedBackups.size === 0) return;

    // Clear any pending auto-save to prevent race conditions
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    // Prevent concurrent auto-save operations during bulk update
    if (isAutoSaveInProgressRef.current) {
      toast({
        title: "Update In Progress",
        description: "Please wait for the current save operation to complete.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // Collect all updates into a single settings object
      const updatedSettings = { ...settings };
      
      // Group selected backups by server
      const selectedByServer = new Map<string, Set<string>>();
      selectedBackups.forEach(backupKey => {
        const [serverId, backupName] = backupKey.split(':');
        if (serverId && backupName) {
          if (!selectedByServer.has(serverId)) {
            selectedByServer.set(serverId, new Set());
          }
          selectedByServer.get(serverId)!.add(backupName);
        }
      });
      
      // Track which servers had all backups selected (applied to server default)
      const serversWithAllBackupsSelected = new Set<string>();
      let totalBackupsUpdated = 0;
      let totalServersUpdated = 0;
      
      // Process each server
      selectedByServer.forEach((selectedBackupNames, serverId) => {
        // Find the server group to get all backups for this server
        const serverGroup = serverGroups.find(g => g.serverId === serverId);
        if (!serverGroup) return;
        
        // Check if all backups for this server are selected
        const allBackupsForServer = serverGroup.backups.map(b => b.backupName);
        const allSelected = allBackupsForServer.length > 0 && 
                           allBackupsForServer.every(backupName => selectedBackupNames.has(backupName));
        
        if (allSelected) {
          // All backups selected - apply to server default instead
          const serverDefaultKey = getServerDefaultKey(serverId);
          const currentDefaults = updatedSettings[serverDefaultKey] || { ...defaultBackupNotificationConfig };
          
          // Update server default and remove empty fields
          const updatedDefaults = {
            ...currentDefaults,
            additionalNotificationEvent: bulkEditNotificationEvent,
            additionalEmails: bulkEditAdditionalEmails,
            additionalNtfyTopic: bulkEditAdditionalNtfyTopic,
          };
          const cleanedDefaults = removeEmptyFields(updatedDefaults);
          
          // Check if server default is now effectively empty
          const isServerDefaultEmpty = (
            cleanedDefaults.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
            cleanedDefaults.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
            cleanedDefaults.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
            cleanedDefaults.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
            cleanedDefaults.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
            (!cleanedDefaults.allowedWeekDays || 
             JSON.stringify(cleanedDefaults.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort())) &&
            !cleanedDefaults.additionalNotificationEvent &&
            !cleanedDefaults.additionalEmails &&
            !cleanedDefaults.additionalNtfyTopic
          );
          
          if (isServerDefaultEmpty) {
            delete updatedSettings[serverDefaultKey];
          } else {
            updatedSettings[serverDefaultKey] = cleanedDefaults;
          }
          
          // Remove individual overrides for additional destinations (they'll inherit from server default)
          allBackupsForServer.forEach(backupName => {
            const backupKey = `${serverId}:${backupName}`;
            const currentSetting = updatedSettings[backupKey];
            
            if (currentSetting) {
              // Remove additional destination overrides
              const { additionalNotificationEvent, additionalEmails, additionalNtfyTopic, ...rest } = currentSetting;
              const cleanedConfig = rest as BackupNotificationConfig;
              
              // Check if config is now effectively empty
              const isConfigEmpty = (
                cleanedConfig.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
                cleanedConfig.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
                cleanedConfig.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
                cleanedConfig.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
                cleanedConfig.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
                (!cleanedConfig.allowedWeekDays || 
                 JSON.stringify(cleanedConfig.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort()))
              );
              
              if (isConfigEmpty) {
                delete updatedSettings[backupKey];
              } else {
                updatedSettings[backupKey] = cleanedConfig;
              }
            }
          });
          
          serversWithAllBackupsSelected.add(serverId);
          totalServersUpdated++;
          totalBackupsUpdated += allBackupsForServer.length;
        } else {
          // Not all backups selected - apply to individual backups
          selectedBackupNames.forEach(backupName => {
            const backupKey = `${serverId}:${backupName}`;
            const currentSetting = updatedSettings[backupKey] || { ...defaultBackupNotificationConfig };
            const updatedSetting = {
              ...currentSetting,
              additionalNotificationEvent: bulkEditNotificationEvent,
              additionalEmails: bulkEditAdditionalEmails,
              additionalNtfyTopic: bulkEditAdditionalNtfyTopic,
            };
            const cleanedSetting = removeEmptyFields(updatedSetting);
            
            // Check if config is now effectively empty
            const isConfigEmpty = (
              cleanedSetting.notificationEvent === defaultBackupNotificationConfig.notificationEvent &&
              cleanedSetting.expectedInterval === defaultBackupNotificationConfig.expectedInterval &&
              cleanedSetting.overdueBackupCheckEnabled === defaultBackupNotificationConfig.overdueBackupCheckEnabled &&
              cleanedSetting.ntfyEnabled === defaultBackupNotificationConfig.ntfyEnabled &&
              cleanedSetting.emailEnabled === defaultBackupNotificationConfig.emailEnabled &&
              (!cleanedSetting.allowedWeekDays || 
               JSON.stringify(cleanedSetting.allowedWeekDays.sort()) === JSON.stringify(defaultBackupNotificationConfig.allowedWeekDays?.sort())) &&
              !cleanedSetting.additionalNotificationEvent &&
              !cleanedSetting.additionalEmails &&
              !cleanedSetting.additionalNtfyTopic
            );
            
            if (isConfigEmpty) {
              delete updatedSettings[backupKey];
            } else {
              updatedSettings[backupKey] = cleanedSetting;
            }
            totalBackupsUpdated++;
          });
        }
      });

      // Update state once with all changes
      setSettings(updatedSettings);
      
      // Set saving state
      setIsSavingInProgress(true);
      setIsAutoSaving(true);
      document.body.style.cursor = 'progress';
      isAutoSaveInProgressRef.current = true;

      // Save immediately without debounce for bulk updates
      try {
        const response = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
          method: 'POST',
          body: JSON.stringify({
            backupSettings: updatedSettings
          }),
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to modify this setting. Only administrators can change configurations.');
          }
          const errorText = await response.text();
          console.error('Bulk update response error:', response.status, errorText);
          throw new Error(`Failed to save backup settings: ${response.status} ${errorText}`);
        }
        
        // Refresh the configuration cache silently
        await refreshConfigSilently();
        
        // Refresh the config context to update tooltips immediately
        await refreshOverdueTolerance();
        
        // Set flag to prevent useEffect from overwriting our saved changes
        // Clear any existing timeout
        if (justSavedTimeoutRef.current) {
          clearTimeout(justSavedTimeoutRef.current);
        }
        justSavedRef.current = true;
        // Clear the flag after 2 seconds (enough time for config refresh to complete)
        justSavedTimeoutRef.current = setTimeout(() => {
          justSavedRef.current = false;
          justSavedTimeoutRef.current = null;
        }, 2000);
        
        // Close modal and clear selection
        setIsBulkEditModalOpen(false);
        handleClearSelection();
        
        // Build success message
        let successMessage = '';
        if (totalServersUpdated > 0) {
          successMessage = `Applied to ${totalServersUpdated} server default${totalServersUpdated === 1 ? '' : 's'} (${totalBackupsUpdated} backup${totalBackupsUpdated === 1 ? '' : 's'} will inherit)`;
          if (totalBackupsUpdated < selectedBackups.size) {
            const individualCount = selectedBackups.size - totalBackupsUpdated;
            successMessage += ` and ${individualCount} individual backup${individualCount === 1 ? '' : 's'}`;
          }
        } else {
          successMessage = `Updated ${totalBackupsUpdated} backup${totalBackupsUpdated === 1 ? '' : 's'}`;
        }
        
        toast({
          title: "Bulk Update Successful",
          description: successMessage,
          duration: 3000,
        });
      } catch (error) {
        console.error('Error saving bulk update:', error instanceof Error ? error.message : String(error));
        toast({
          title: "Bulk Update Error",
          description: `Failed to update backups: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
          duration: 5000,
        });
        throw error;
      } finally {
        // Always reset the saving state
        isAutoSaveInProgressRef.current = false;
        setIsAutoSaving(false);
        setIsSavingInProgress(false);
        document.body.style.cursor = 'default';
      }
    } catch (error) {
      // Error already handled in inner try-catch
      console.error('Bulk update error:', error);
    }
  };


  if (!config?.serversWithBackups || config.serversWithBackups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup Notifications</CardTitle>
          <CardDescription>No servers with backups found in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No servers with backups have been registered yet. Add some backup data first to see backup notification settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle>Configure Backup Notifications</CardTitle>
          <CardDescription>
             Configure notification settings for a server or backup when a new backup log is received.
             Icons indicate additional destinations: <Settings2 className="inline w-3 h-3 align-middle" /> for server defaults,{' '}
             <ExternalLink className="inline w-3 h-3 align-middle" style={{ color: 'rgb(96 165 250)' }} /> for custom backup overrides,{' '}
             <ExternalLink className="inline w-3 h-3 align-middle" style={{ color: 'rgb(100 116 139)' }} /> for inherited destinations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Input */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="server-filter" className="text-sm font-medium">Filter by Server Name</Label>
              <div className="relative w-[260px]">
                <Input
                  id="server-filter"
                  type="text"
                  placeholder="Search by server name or alias..."
                  value={serverNameFilter}
                  onChange={(e) => setServerNameFilter(e.target.value)}
                  className="pr-10"
               />
                {serverNameFilter ? (
                  <button
                    type="button"
                    onClick={() => setServerNameFilter('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Search className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedBackups.size > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-md border flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                <span className="font-bold">Additional Destinations:</span> {selectedBackups.size} backup{selectedBackups.size === 1 ? '' : 's'} selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 transition-none"
                >
                  Clear Selection
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Bulk Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkClearConfirmOpen(true)}
                >
                  Bulk Clear
                </Button>
              </div>
            </div>
          )}
          
          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-md">
            <div 
              ref={tableScrollContainerRef}
              className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto table-horizontal-scrollbar [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
            >
              <div className="[&>div]:overflow-visible">
                <Table>
              <TableHeader className="sticky top-0 z-20 bg-muted border-b-2 border-border shadow-sm">
              <TableRow className="bg-muted">
                <th className="w-[40px] min-w-[40px] bg-muted pl-4 pr-0 py-3 text-left">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={handleSelectAll}
                    title={someFilteredSelected && !allFilteredSelected ? "Some backups selected - click to select all visible" : "Select all visible backups"}
                  />
                </th>
                <SortableTableHead 
                  className="w-[150px] min-w-[120px] bg-muted pl-1" 
                  column="name" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Server / Backup
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[140px] min-w-[120px] bg-muted" 
                  column="notificationEvent" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Notification Events
                </SortableTableHead>
                <th className="text-center font-medium text-sm text-muted-foreground px-2 py-3 w-[80px] bg-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={allNtfySelected}
                      onCheckedChange={handleSelectAllNtfy}
                      title={isNtfyConfigured ? "Select all NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                      className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                    />
                    <span className={isNtfyConfigured ? "" : "text-gray-500"} title={isNtfyConfigured ? undefined : "not configured"}>
                      NTFY Notifications{!isNtfyConfigured ? " (disabled)" : ""}
                    </span>
                  </div>
                </th>
                <th className="text-center font-medium text-sm text-muted-foreground px-2 py-3 w-[80px] bg-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={allEmailSelected}
                      onCheckedChange={handleSelectAllEmail}
                      title={isEmailConfigured ? "Select all Email notifications" : "SMTP not configured - notifications will not be sent"}
                      className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                    />
                    <span className={isEmailConfigured ? "" : "text-gray-500"} title={isEmailConfigured ? undefined : "not configured"}>
                      Email Notifications{!isEmailConfigured ? " (disabled)" : ""}
                    </span>
                  </div>
                </th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServerGroups.map((group) => {
                const isServerHeaderExpanded = expandedServerHeaders.has(group.serverId);
                const serverDefaults = getServerDefaultSettings(group.serverId);
                const serverDefaultKey = getServerDefaultKey(group.serverId);
                const serverDefaultAdditionalEvent = serverDefaults?.additionalNotificationEvent ?? 'off';
                const isServerSelected = isServerFullySelected(group.serverId);
                const isServerPartially = isServerPartiallySelected(group.serverId);
                const isSingleBackup = group.backups.length === 1;
                
                // For single backup servers, render merged row instead of server header
                if (isSingleBackup) {
                  const backup = group.backups[0];
                  const backupSetting = getBackupSettingById(backup.id, backup.backupName);
                  const backupKey = `${backup.id}:${backup.backupName}`;
                  const isExpanded = expandedRows.has(backupKey);
                  
                  // Get effective values with inheritance info
                  const effectiveNotificationEvent = getEffectiveNotificationEvent(backup.id, backup.backupName);
                  const effectiveEmails = getEffectiveValue(backup.id, backup.backupName, 'additionalEmails');
                  const effectiveNtfyTopic = getEffectiveValue(backup.id, backup.backupName, 'additionalNtfyTopic');
                  const hasNotificationEventOverride = hasOverride(backup.id, backup.backupName, 'additionalNotificationEvent');
                  const hasEmailOverride = hasOverride(backup.id, backup.backupName, 'additionalEmails');
                  const hasNtfyOverride = hasOverride(backup.id, backup.backupName, 'additionalNtfyTopic');
                  const hasServerDefaults = serverDefaults !== null;
                  
                  // Check if backup has any overrides or values (for chevron color)
                  let hasBackupOverridesOrValues: boolean;
                  if (hasServerDefaults) {
                    hasBackupOverridesOrValues = hasNotificationEventOverride || hasEmailOverride || hasNtfyOverride;
                  } else {
                    const backupSetting = settings[backupKey];
                    const hasNotificationEventValue = !!(backupSetting?.additionalNotificationEvent && backupSetting.additionalNotificationEvent !== 'off');
                    const hasEmailValue = !!(backupSetting?.additionalEmails && backupSetting.additionalEmails.trim() !== '');
                    const hasNtfyValue = !!(backupSetting?.additionalNtfyTopic && backupSetting.additionalNtfyTopic.trim() !== '');
                    hasBackupOverridesOrValues = hasNotificationEventValue || hasEmailValue || hasNtfyValue;
                  }
                  
                  // Combined display name
                  const combinedName = group.serverAlias 
                    ? `${group.serverAlias} (${group.serverName}) : ${backup.backupName}`
                    : `${group.serverName} : ${backup.backupName}`;
                  
                  return (
                    <Fragment key={`server-group-${group.serverId}`}>
                      {/* Merged Row for Single Backup Server */}
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50 border-l-4 border-l-blue-600"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          const isInteractiveElement = target.closest('button, input, select, [role="checkbox"], [role="combobox"]');
                          if (!isInteractiveElement) {
                            toggleRowExpansion(backupKey);
                          }
                        }}
                      >
                        <TableCell className="w-[40px] pl-4 pr-0" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedBackups.has(backupKey)}
                            onCheckedChange={() => handleToggleSelection(backupKey)}
                            title="Select this backup"
                          />
                        </TableCell>
                        <TableCell className="pl-1" colSpan={1}>
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpansion(backupKey);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm" title={`ServerID: ${group.serverId}`}>
                                  {combinedName}
                                </span>
                                {(hasBackupOverridesOrValues || (hasServerDefaults && !hasBackupOverridesOrValues && hasServerAdditionalDestinations(serverDefaults))) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ExternalLink 
                                          className="w-3.5 h-3.5" 
                                          style={{ 
                                            color: hasBackupOverridesOrValues 
                                              ? 'rgb(96 165 250)' // blue-400
                                              : 'rgb(100 116 139)' // slate-500
                                          }} 
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {hasBackupOverridesOrValues 
                                            ? 'Custom additional destinations configured'
                                            : 'Using server default destinations'}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              {group.serverNote && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {group.serverNote}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={backupSetting.notificationEvent}
                            onValueChange={(value: NotificationEvent) => 
                              updateBackupSettingById(backup.id, backup.backupName, 'notificationEvent', value)
                            }
                          >
                            <SelectTrigger className="w-full text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="off">Off</SelectItem>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="warnings">Warnings</SelectItem>
                              <SelectItem value="errors">Errors</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={backupSetting.ntfyEnabled !== undefined ? backupSetting.ntfyEnabled : true}
                            onCheckedChange={(checked: boolean) => 
                              updateBackupSettingById(backup.id, backup.backupName, 'ntfyEnabled', checked)
                            }
                            title={isNtfyConfigured ? "Enable NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                            className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                          />
                        </TableCell>
                        
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                            onCheckedChange={(checked: boolean) => 
                              updateBackupSettingById(backup.id, backup.backupName, 'emailEnabled', checked)
                            }
                            title={isEmailConfigured ? "Enable Email notifications" : "SMTP not configured - notifications will not be sent"}
                            className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                          />
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Additional Destinations for Merged Row */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30 pl-12 border-l border-l-border/50 ml-6">
                            <div className="py-0 px-2">
                              <div className="font-medium text-sm mb-3 flex items-center gap-2">
                                Additional Destinations
                                {(effectiveNotificationEvent.isInherited || effectiveEmails.isInherited || effectiveNtfyTopic.isInherited) && (
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (Some values inherited from server defaults)
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-[auto_1fr_1fr] gap-4 items-start">
                                <div className="space-y-1 max-w-[160px]">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs font-medium">Notification event</Label>
                                    {!hasNotificationEventOverride && hasServerDefaults && (
                                      <span title="Inheriting from server defaults">
                                        <LinkIcon className="h-3 w-3 text-blue-500" />
                                      </span>
                                    )}
                                    {hasNotificationEventOverride && hasServerDefaults && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNotificationEvent')}
                                            className="cursor-pointer hover:text-blue-500 transition-colors"
                                            title="Override (not inheriting)"
                                          >
                                            <Link2Off className="h-3 w-3 text-blue-500" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Click to inherit from server defaults</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  <Select
                                    value={effectiveNotificationEvent.value}
                                    onValueChange={(value: NotificationEvent) => 
                                      updateBackupSettingById(backup.id, backup.backupName, 'additionalNotificationEvent', value)
                                    }
                                  >
                                    <SelectTrigger className={`w-full text-xs ${effectiveNotificationEvent.isInherited && !hasNotificationEventOverride ? 'bg-muted/40 text-muted-foreground' : hasNotificationEventOverride ? 'bg-background border-blue-500/50' : ''}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="off">Off</SelectItem>
                                      <SelectItem value="all">All</SelectItem>
                                      <SelectItem value="warnings">Warnings</SelectItem>
                                      <SelectItem value="errors">Errors</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    {effectiveNotificationEvent.isInherited 
                                      ? "Inheriting from server defaults. Change to override."
                                      : "Notification events to be sent to the additional email address and topic"}
                                  </p>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs font-medium">Additional Emails</Label>
                                    {!hasEmailOverride && hasServerDefaults && (
                                      <span title="Inheriting from server defaults">
                                        <LinkIcon className="h-3 w-3 text-blue-500" />
                                      </span>
                                    )}
                                    {hasEmailOverride && hasServerDefaults && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() => clearOverride(backup.id, backup.backupName, 'additionalEmails')}
                                            className="cursor-pointer hover:text-blue-500 transition-colors"
                                            title="Override (not inheriting)"
                                          >
                                            <Link2Off className="h-3 w-3 text-blue-500" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Click to inherit from server defaults</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <Input
                                      ref={(el) => {
                                        const key = `${backupKey}:additionalEmails`;
                                        textInputRefs.current[key] = el;
                                        if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                          el.value = effectiveEmails.value;
                                        }
                                      }}
                                      type="text"
                                      placeholder={effectiveEmails.isInherited ? `Inheriting: ${effectiveEmails.value || 'Server Default'}` : "e.g. user1@example.com, user2@example.com"}
                                      defaultValue={effectiveEmails.value}
                                      disabled={effectiveNotificationEvent.value === 'off'}
                                      onChange={(e) => {
                                        if (effectiveNotificationEvent.value === 'off') return;
                                        storeTextInputValue(`${backupKey}:additionalEmails`, e.target.value);
                                        autoSaveTextInput(false);
                                      }}
                                      onBlur={(e) => {
                                        if (effectiveNotificationEvent.value === 'off') return;
                                        const currentValue = e.currentTarget.value;
                                        const key = `${backupKey}:additionalEmails`;
                                        if (textInputTimeoutRefs.current[key]) {
                                          clearTimeout(textInputTimeoutRefs.current[key]);
                                          delete textInputTimeoutRefs.current[key];
                                        }
                                        updateTextInputToMainState(key, currentValue, true);
                                        delete textInputValuesRef.current[key];
                                        triggerTextInputAutoSave();
                                      }}
                                      readOnly={(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off'}
                                      className={`text-xs pr-10 ${(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasEmailOverride ? 'bg-background border-blue-500/50' : ''}`}
                                      title={effectiveEmails.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                      onFocus={(e) => {
                                        if (effectiveEmails.isInherited && !hasEmailOverride) {
                                          updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                          e.currentTarget.value = effectiveEmails.value;
                                          e.currentTarget.select();
                                        }
                                      }}
                                      onClick={(e) => {
                                        if (effectiveEmails.isInherited && !hasEmailOverride) {
                                          updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                          e.currentTarget.value = effectiveEmails.value;
                                          e.currentTarget.focus();
                                          e.currentTarget.select();
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentValue = getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value);
                                        handleTestEmail(backupKey, currentValue);
                                      }}
                                      disabled={testingEmail === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value) || effectiveNotificationEvent.value === 'off'}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      aria-label="Send test email"
                                      title="Send test email"
                                    >
                                      {testingEmail === backupKey ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                      ) : (
                                        <SendHorizontal className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {effectiveEmails.isInherited 
                                      ? "Inheriting from server defaults. Click to override."
                                      : "Notifications for this backup will be sent to these addresses in addition to the global recipient."}
                                  </p>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs font-medium">Additional NTFY Topic</Label>
                                    {!hasNtfyOverride && hasServerDefaults && (
                                      <span title="Inheriting from server defaults">
                                        <LinkIcon className="h-3 w-3 text-blue-500" />
                                      </span>
                                    )}
                                    {hasNtfyOverride && hasServerDefaults && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNtfyTopic')}
                                            className="cursor-pointer hover:text-blue-500 transition-colors"
                                            title="Override (not inheriting)"
                                          >
                                            <Link2Off className="h-3 w-3 text-blue-500" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Click to inherit from server defaults</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <Input
                                      ref={(el) => {
                                        const key = `${backupKey}:additionalNtfyTopic`;
                                        textInputRefs.current[key] = el;
                                        if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                          el.value = effectiveNtfyTopic.value;
                                        }
                                      }}
                                      type="text"
                                      placeholder={effectiveNtfyTopic.isInherited ? `Inheriting: ${effectiveNtfyTopic.value || 'Server Default'}` : "e.g. duplistatus-user-backup-alerts"}
                                      defaultValue={effectiveNtfyTopic.value}
                                      disabled={effectiveNotificationEvent.value === 'off'}
                                      onChange={(e) => {
                                        if (effectiveNotificationEvent.value === 'off') return;
                                        storeTextInputValue(`${backupKey}:additionalNtfyTopic`, e.target.value);
                                        autoSaveTextInput(false);
                                      }}
                                      onBlur={(e) => {
                                        if (effectiveNotificationEvent.value === 'off') return;
                                        const currentValue = e.currentTarget.value;
                                        const key = `${backupKey}:additionalNtfyTopic`;
                                        if (textInputTimeoutRefs.current[key]) {
                                          clearTimeout(textInputTimeoutRefs.current[key]);
                                          delete textInputTimeoutRefs.current[key];
                                        }
                                        updateTextInputToMainState(key, currentValue, true);
                                        delete textInputValuesRef.current[key];
                                        triggerTextInputAutoSave();
                                      }}
                                      readOnly={(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off'}
                                      className={`text-xs pr-20 ${(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasNtfyOverride ? 'bg-background border-blue-500/50' : ''}`}
                                      title={effectiveNtfyTopic.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                      onFocus={(e) => {
                                        if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                          updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                          e.currentTarget.value = effectiveNtfyTopic.value;
                                          e.currentTarget.select();
                                        }
                                      }}
                                      onClick={(e) => {
                                        if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                          updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                          e.currentTarget.value = effectiveNtfyTopic.value;
                                          e.currentTarget.focus();
                                          e.currentTarget.select();
                                        }
                                      }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const currentValue = getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value);
                                          handleTestNtfy(backupKey, currentValue);
                                        }}
                                        disabled={testingNtfy === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value) || effectiveNotificationEvent.value === 'off'}
                                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Send test notification"
                                        title="Send test notification"
                                      >
                                        {testingNtfy === backupKey ? (
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        ) : (
                                          <SendHorizontal className="h-4 w-4" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const currentValue = getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value);
                                          handleGenerateQrCode(currentValue);
                                        }}
                                        disabled={!effectiveNtfyTopic.value || effectiveNotificationEvent.value === 'off'}
                                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Show QR code"
                                        title="Show QR code"
                                      >
                                        <QrCode className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {effectiveNtfyTopic.isInherited 
                                      ? "Inheriting from server defaults. Click to override."
                                      : "Notifications will be published to this topic in addition to the default topic."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                }
                
                // For multiple backups, render server header + backup rows
                return (
                  <Fragment key={`server-group-${group.serverId}`}>
                    {/* Server Header Row */}
                    <TableRow 
                      className={`${isServerHeaderExpanded ? 'bg-muted/80' : 'bg-muted/40'} hover:bg-muted/80 cursor-pointer border-b-2 border-border border-l-4 border-l-blue-500`}
                      style={{ boxShadow: 'var(--shadow-card)' }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        const isInteractiveElement = target.closest('button, input, select, [role="checkbox"], [role="combobox"]');
                        if (!isInteractiveElement) {
                          toggleServerHeaderExpansion(group.serverId);
                        }
                      }}
                    >
                      <TableCell className="w-[40px] pl-4 pr-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isServerSelected || isServerPartially}
                          onCheckedChange={(checked) => handleSelectServer(group.serverId, checked as boolean)}
                          title={isServerPartially ? "Some backups selected - click to select all" : "Select all backups for this server"}
                        />
                      </TableCell>
                      <TableCell colSpan={4} className="pl-1">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleServerHeaderExpansion(group.serverId);
                            }}
                          >
                            {isServerHeaderExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm" title={`ServerID: ${group.serverId}`} >
                                {group.serverAlias ? (
                                  <>
                                    {group.serverAlias} ({group.serverName})
                                  </>
                                ) : (
                                  <span title={group.serverId}>{group.serverName}</span>
                                )}
                              </span>
                              {hasServerAdditionalDestinations(serverDefaults) && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Settings2 className="w-3.5 h-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Default additional destinations configured</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            {group.serverNote && (
                              <span className="text-xs text-muted-foreground truncate">
                                {group.serverNote}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {group.backups.length} backup{group.backups.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Server Default Settings Row (when expanded) */}
                    {isServerHeaderExpanded && (
                      <TableRow className="bg-blue-500/5">
                        <TableCell colSpan={5} className="bg-blue-500/5">
                          <div className="py-2 px-2">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium text-sm">Default Additional Destinations for this Server</div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="gradient"
                                  size="sm"
                                  className="h-7 px-3 text-xs"
                                  onClick={() => syncAllToServerDefaults(group.serverId)}
                                  title="Sync all backups to inherit from server defaults"
                                >
                                  Sync to All
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-xs hover:bg-accent text-yellow-500 hover:text-yellow-500"
                                  onClick={() => clearAllAdditionalDestinations(group.serverId)}
                                  title="Clear all additional destinations from server and all backups"
                                >
                                  Clear All
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-[auto_1fr_1fr] gap-4 items-start">
                              <div className="space-y-1 max-w-[160px]">
                                <Label className="text-xs font-medium">Notification event</Label>
                                <Select
                                  value={serverDefaultAdditionalEvent}
                                  onValueChange={(value: NotificationEvent) => 
                                    updateServerDefaultSetting(group.serverId, 'additionalNotificationEvent', value)
                                  }
                                >
                                  <SelectTrigger className="w-full text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="off">Off</SelectItem>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="warnings">Warnings</SelectItem>
                                    <SelectItem value="errors">Errors</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  Default notification events for additional destinations
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">Default Additional Emails</Label>
                                <div className="relative">
                                  <Input
                                key={`${serverDefaultKey}:additionalEmails:${serverDefaults ? 'exists' : 'cleared'}`}
                                ref={(el) => {
                                  const key = `${serverDefaultKey}:additionalEmails`;
                                  textInputRefs.current[key] = el;
                                  // Don't sync value - uncontrolled input keeps its own value
                                  // The input maintains its value through re-renders
                                }}
                                    type="text"
                                    placeholder="e.g. user1@example.com, user2@example.com"
                                    defaultValue={serverDefaults?.additionalEmails ?? ''}
                                    disabled={serverDefaultAdditionalEvent === 'off'}
                                    onChange={(e) => {
                                      if (serverDefaultAdditionalEvent === 'off') return;
                                      // Store in ref only (no re-renders, no expensive computations)
                                      storeTextInputValue(`${serverDefaultKey}:additionalEmails`, e.target.value);
                                      // Set up 5-second debounced autosave
                                      autoSaveTextInput(false);
                                    }}
                                    onBlur={(e) => {
                                      if (serverDefaultAdditionalEvent === 'off') return;
                                      const key = `${serverDefaultKey}:additionalEmails`;
                                      // Use event value - it's the most reliable source for the current value on blur
                                      // The ref might be stale due to re-renders
                                      const currentValue = e.currentTarget.value;
                                      // Update main state when input loses focus - use event value which is reliable
                                      // Clear timeout since we're updating now
                                      if (textInputTimeoutRefs.current[key]) {
                                        clearTimeout(textInputTimeoutRefs.current[key]);
                                        delete textInputTimeoutRefs.current[key];
                                      }
                                      // Update main state for UI consistency
                                      // Use setTimeout to ensure state update completes before autosave
                                      updateTextInputToMainState(key, currentValue, false);
                                      // Clean up ref
                                      delete textInputValuesRef.current[key];
                                      // Trigger autosave after a brief delay to ensure state update has completed
                                      // This ensures settingsRef.current has the latest value
                                      setTimeout(() => {
                                        triggerTextInputAutoSave();
                                      }, 0);
                                    }}
                                    className={`text-xs pr-10 ${serverDefaultAdditionalEvent === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : ''}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentValue = getCurrentTextInputValue(`${serverDefaultKey}:additionalEmails`, serverDefaults?.additionalEmails ?? '');
                                      handleTestEmail(serverDefaultKey, currentValue);
                                    }}
                                    disabled={testingEmail === serverDefaultKey || serverDefaultAdditionalEvent === 'off'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Send test email"
                                    title="Send test email"
                                  >
                                    {testingEmail === serverDefaultKey ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                      <SendHorizontal className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Default email addresses inherited by all backups on this server
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">Default Additional NTFY Topic</Label>
                                <div className="relative">
                                  <Input
                                    key={`${serverDefaultKey}:additionalNtfyTopic:${serverDefaults ? 'exists' : 'cleared'}`}
                                    ref={(el) => {
                                      const key = `${serverDefaultKey}:additionalNtfyTopic`;
                                      textInputRefs.current[key] = el;
                                      // Don't sync value - uncontrolled input keeps its own value
                                      // The input maintains its value through re-renders
                                    }}
                                    type="text"
                                    placeholder="e.g. duplistatus-user-backup-alerts"
                                    defaultValue={serverDefaults?.additionalNtfyTopic ?? ''}
                                    disabled={serverDefaultAdditionalEvent === 'off'}
                                    onChange={(e) => {
                                      if (serverDefaultAdditionalEvent === 'off') return;
                                      // Store in ref only (no re-renders, no expensive computations)
                                      storeTextInputValue(`${serverDefaultKey}:additionalNtfyTopic`, e.target.value);
                                      // Set up 5-second debounced autosave
                                      autoSaveTextInput(false);
                                    }}
                                    onBlur={(e) => {
                                      if (serverDefaultAdditionalEvent === 'off') return;
                                      const key = `${serverDefaultKey}:additionalNtfyTopic`;
                                      // Use event value - it's the most reliable source for the current value on blur
                                      // The ref might be stale due to re-renders
                                      const currentValue = e.currentTarget.value;
                                      // Update main state when input loses focus - use event value which is reliable
                                      // Clear timeout since we're updating now
                                      if (textInputTimeoutRefs.current[key]) {
                                        clearTimeout(textInputTimeoutRefs.current[key]);
                                        delete textInputTimeoutRefs.current[key];
                                      }
                                      // Update main state for UI consistency
                                      // Use setTimeout to ensure state update completes before autosave
                                      updateTextInputToMainState(key, currentValue, false);
                                      // Clean up ref
                                      delete textInputValuesRef.current[key];
                                      // Trigger autosave after a brief delay to ensure state update has completed
                                      // This ensures settingsRef.current has the latest value
                                      setTimeout(() => {
                                        triggerTextInputAutoSave();
                                      }, 0);
                                    }}
                                    className={`text-xs pr-20 ${serverDefaultAdditionalEvent === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : ''}`}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentValue = getCurrentTextInputValue(`${serverDefaultKey}:additionalNtfyTopic`, serverDefaults?.additionalNtfyTopic ?? '');
                                        handleTestNtfy(serverDefaultKey, currentValue);
                                      }}
                                      disabled={testingNtfy === serverDefaultKey || serverDefaultAdditionalEvent === 'off'}
                                      className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      aria-label="Send test notification"
                                      title="Send test notification"
                                    >
                                      {testingNtfy === serverDefaultKey ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                      ) : (
                                        <SendHorizontal className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentValue = getCurrentTextInputValue(`${serverDefaultKey}:additionalNtfyTopic`, serverDefaults?.additionalNtfyTopic ?? '');
                                        handleGenerateQrCode(currentValue);
                                      }}
                                      disabled={!serverDefaults?.additionalNtfyTopic || serverDefaultAdditionalEvent === 'off'}
                                      className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      aria-label="Show QR code"
                                      title="Show QR code"
                                    >
                                      <QrCode className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Default NTFY topic inherited by all backups on this server
                                </p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {/* Backup Rows */}
                    {group.backups.map((backup) => {
                      const backupSetting = getBackupSettingById(backup.id, backup.backupName);
                      const backupKey = `${backup.id}:${backup.backupName}`;
                      const isExpanded = expandedRows.has(backupKey);
                      
                      // Get effective values with inheritance info
                      const effectiveNotificationEvent = getEffectiveNotificationEvent(backup.id, backup.backupName);
                      const effectiveEmails = getEffectiveValue(backup.id, backup.backupName, 'additionalEmails');
                      const effectiveNtfyTopic = getEffectiveValue(backup.id, backup.backupName, 'additionalNtfyTopic');
                      const hasNotificationEventOverride = hasOverride(backup.id, backup.backupName, 'additionalNotificationEvent');
                      const hasEmailOverride = hasOverride(backup.id, backup.backupName, 'additionalEmails');
                      const hasNtfyOverride = hasOverride(backup.id, backup.backupName, 'additionalNtfyTopic');
                      // Check if server defaults exist for this server
                      const serverDefaults = getServerDefaultSettings(backup.id);
                      const hasServerDefaults = serverDefaults !== null;
                      
                      // Check if backup has any overrides or values (for chevron color)
                      // If server defaults exist: checks if any field is not inherited (has override)
                      // If server defaults don't exist: checks if any field has a non-empty value
                      let hasBackupOverridesOrValues: boolean;
                      if (hasServerDefaults) {
                        // When server defaults exist, check if there are any overrides
                        hasBackupOverridesOrValues = hasNotificationEventOverride || hasEmailOverride || hasNtfyOverride;
                      } else {
                        // When no server defaults exist, check if any field has a non-empty value
                        const backupSetting = settings[backupKey];
                        const hasNotificationEventValue = !!(backupSetting?.additionalNotificationEvent && backupSetting.additionalNotificationEvent !== 'off');
                        const hasEmailValue = !!(backupSetting?.additionalEmails && backupSetting.additionalEmails.trim() !== '');
                        const hasNtfyValue = !!(backupSetting?.additionalNtfyTopic && backupSetting.additionalNtfyTopic.trim() !== '');
                        hasBackupOverridesOrValues = hasNotificationEventValue || hasEmailValue || hasNtfyValue;
                      }
                      
                      return (
                        <Fragment key={`${backup.id}-${backup.backupName}`}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              const isInteractiveElement = target.closest('button, input, select, [role="checkbox"], [role="combobox"]');
                              if (!isInteractiveElement) {
                                toggleRowExpansion(backupKey);
                              }
                            }}
                          >
                            <TableCell className="w-[40px] pl-12 pr-0" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedBackups.has(backupKey)}
                                onCheckedChange={() => handleToggleSelection(backupKey)}
                                title="Select this backup"
                              />
                            </TableCell>
                            <TableCell className="pl-1" colSpan={1}>
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(backupKey);
                                  }}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {backup.backupName}
                                    </span>
                                    {(hasBackupOverridesOrValues || (hasServerDefaults && !hasBackupOverridesOrValues && hasServerAdditionalDestinations(serverDefaults))) && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <ExternalLink 
                                              className="w-3.5 h-3.5" 
                                              style={{ 
                                                color: hasBackupOverridesOrValues 
                                                  ? 'rgb(96 165 250)' // blue-400
                                                  : 'rgb(100 116 139)' // slate-500
                                              }} 
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              {hasBackupOverridesOrValues 
                                                ? 'Custom additional destinations configured'
                                                : 'Using server default destinations'}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={backupSetting.notificationEvent}
                                onValueChange={(value: NotificationEvent) => 
                                  updateBackupSettingById(backup.id, backup.backupName, 'notificationEvent', value)
                                }
                              >
                                <SelectTrigger className="w-full text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="off">Off</SelectItem>
                                  <SelectItem value="all">All</SelectItem>
                                  <SelectItem value="warnings">Warnings</SelectItem>
                                  <SelectItem value="errors">Errors</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={backupSetting.ntfyEnabled !== undefined ? backupSetting.ntfyEnabled : true}
                                onCheckedChange={(checked: boolean) => 
                                  updateBackupSettingById(backup.id, backup.backupName, 'ntfyEnabled', checked)
                                }
                                title={isNtfyConfigured ? "Enable NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                                className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                              />
                            </TableCell>
                            
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                                onCheckedChange={(checked: boolean) => 
                                  updateBackupSettingById(backup.id, backup.backupName, 'emailEnabled', checked)
                                }
                                title={isEmailConfigured ? "Enable Email notifications" : "SMTP not configured - notifications will not be sent"}
                                className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                              />
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-muted/30 pl-12 border-l border-l-border/50 ml-6">
                                <div className="py-0 px-2">
                                  <div className="font-medium text-sm mb-3 flex items-center gap-2">
                                    Additional Destinations
                                    {(effectiveNotificationEvent.isInherited || effectiveEmails.isInherited || effectiveNtfyTopic.isInherited) && (
                                      <span className="text-xs text-muted-foreground font-normal">
                                        (Some values inherited from server defaults)
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-[auto_1fr_1fr] gap-4 items-start">
                                    <div className="space-y-1 max-w-[160px]">
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs font-medium">Notification event</Label>
                                        {!hasNotificationEventOverride && hasServerDefaults && (
                                          <span title="Inheriting from server defaults">
                                            <LinkIcon className="h-3 w-3 text-blue-500" />
                                          </span>
                                        )}
                                        {hasNotificationEventOverride && hasServerDefaults && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                type="button"
                                                onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNotificationEvent')}
                                                className="cursor-pointer hover:text-blue-500 transition-colors"
                                                title="Override (not inheriting)"
                                              >
                                                <Link2Off className="h-3 w-3 text-blue-500" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Click to inherit from server defaults</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <Select
                                        value={effectiveNotificationEvent.value}
                                        onValueChange={(value: NotificationEvent) => 
                                          updateBackupSettingById(backup.id, backup.backupName, 'additionalNotificationEvent', value)
                                        }
                                      >
                                        <SelectTrigger className={`w-full text-xs ${effectiveNotificationEvent.isInherited && !hasNotificationEventOverride ? 'bg-muted/40 text-muted-foreground' : hasNotificationEventOverride ? 'bg-background border-blue-500/50' : ''}`}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="off">Off</SelectItem>
                                          <SelectItem value="all">All</SelectItem>
                                          <SelectItem value="warnings">Warnings</SelectItem>
                                          <SelectItem value="errors">Errors</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <p className="text-xs text-muted-foreground">
                                        {effectiveNotificationEvent.isInherited 
                                          ? "Inheriting from server defaults. Change to override."
                                          : "Notification events to be sent to the additional email address and topic"}
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs font-medium">Additional Emails</Label>
                                        {!hasEmailOverride && hasServerDefaults && (
                                          <span title="Inheriting from server defaults">
                                            <LinkIcon className="h-3 w-3 text-blue-500" />
                                          </span>
                                        )}
                                        {hasEmailOverride && hasServerDefaults && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                type="button"
                                                onClick={() => clearOverride(backup.id, backup.backupName, 'additionalEmails')}
                                                className="cursor-pointer hover:text-blue-500 transition-colors"
                                                title="Override (not inheriting)"
                                              >
                                                <Link2Off className="h-3 w-3 text-blue-500" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Click to inherit from server defaults</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <div className="relative">
                                        <Input
                                          ref={(el) => {
                                            const key = `${backupKey}:additionalEmails`;
                                            textInputRefs.current[key] = el;
                                            // Sync value when ref is set (only if user is not currently typing)
                                            if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                              el.value = effectiveEmails.value;
                                            }
                                          }}
                                          type="text"
                                          placeholder={effectiveEmails.isInherited ? `Inheriting: ${effectiveEmails.value || 'Server Default'}` : "e.g. user1@example.com, user2@example.com"}
                                          defaultValue={effectiveEmails.value}
                                          disabled={effectiveNotificationEvent.value === 'off'}
                                          onChange={(e) => {
                                            if (effectiveNotificationEvent.value === 'off') return;
                                            // Store in ref only (no re-renders, no expensive computations)
                                            storeTextInputValue(`${backupKey}:additionalEmails`, e.target.value);
                                            // Set up 5-second debounced autosave
                                            autoSaveTextInput(false);
                                          }}
                                          onBlur={(e) => {
                                            if (effectiveNotificationEvent.value === 'off') return;
                                            // Update main state when input loses focus - read current value from input
                                            const currentValue = e.currentTarget.value;
                                            const key = `${backupKey}:additionalEmails`;
                                            // Clear timeout since we're updating now
                                            if (textInputTimeoutRefs.current[key]) {
                                              clearTimeout(textInputTimeoutRefs.current[key]);
                                              delete textInputTimeoutRefs.current[key];
                                            }
                                            // Update main state immediately with current input value
                                            // syncInputAfterUpdate=true to update input value after state change
                                            updateTextInputToMainState(key, currentValue, true);
                                            // Clean up ref
                                            delete textInputValuesRef.current[key];
                                            // Also trigger autosave
                                            triggerTextInputAutoSave();
                                          }}
                                          readOnly={(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off'}
                                          className={`text-xs pr-10 ${(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasEmailOverride ? 'bg-background border-blue-500/50' : ''}`}
                                          title={effectiveEmails.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                          onFocus={(e) => {
                                            if (effectiveEmails.isInherited && !hasEmailOverride) {
                                              // Create override by setting the value (user can now edit)
                                              updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                              // Update input value directly (uncontrolled input)
                                              e.currentTarget.value = effectiveEmails.value;
                                              e.currentTarget.select();
                                            }
                                          }}
                                          onClick={(e) => {
                                            if (effectiveEmails.isInherited && !hasEmailOverride) {
                                              // Create override when clicked
                                              updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                              // Update input value directly (uncontrolled input)
                                              e.currentTarget.value = effectiveEmails.value;
                                              e.currentTarget.focus();
                                              e.currentTarget.select();
                                            }
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const currentValue = getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value);
                                            handleTestEmail(backupKey, currentValue);
                                          }}
                                          disabled={testingEmail === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value) || effectiveNotificationEvent.value === 'off'}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label="Send test email"
                                          title="Send test email"
                                        >
                                          {testingEmail === backupKey ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                          ) : (
                                            <SendHorizontal className="h-4 w-4" />
                                          )}
                                        </button>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {effectiveEmails.isInherited 
                                          ? "Inheriting from server defaults. Click to override."
                                          : "Notifications for this backup will be sent to these addresses in addition to the global recipient."}
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs font-medium">Additional NTFY Topic</Label>
                                        {!hasNtfyOverride && hasServerDefaults && (
                                          <span title="Inheriting from server defaults">
                                            <LinkIcon className="h-3 w-3 text-blue-500" />
                                          </span>
                                        )}
                                        {hasNtfyOverride && hasServerDefaults && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button
                                                type="button"
                                                onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNtfyTopic')}
                                                className="cursor-pointer hover:text-blue-500 transition-colors"
                                                title="Override (not inheriting)"
                                              >
                                                <Link2Off className="h-3 w-3 text-blue-500" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Click to inherit from server defaults</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <div className="relative">
                                        <Input
                                          ref={(el) => {
                                            const key = `${backupKey}:additionalNtfyTopic`;
                                            textInputRefs.current[key] = el;
                                            // Sync value when ref is set (only if user is not currently typing)
                                            if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                              el.value = effectiveNtfyTopic.value;
                                            }
                                          }}
                                          type="text"
                                          placeholder={effectiveNtfyTopic.isInherited ? `Inheriting: ${effectiveNtfyTopic.value || 'Server Default'}` : "e.g. duplistatus-user-backup-alerts"}
                                          defaultValue={effectiveNtfyTopic.value}
                                          disabled={effectiveNotificationEvent.value === 'off'}
                                          onChange={(e) => {
                                            if (effectiveNotificationEvent.value === 'off') return;
                                            // Store in ref only (no re-renders, no expensive computations)
                                            storeTextInputValue(`${backupKey}:additionalNtfyTopic`, e.target.value);
                                            // Set up 5-second debounced autosave
                                            autoSaveTextInput(false);
                                          }}
                                          onBlur={(e) => {
                                            if (effectiveNotificationEvent.value === 'off') return;
                                            // Update main state when input loses focus - read current value from input
                                            const currentValue = e.currentTarget.value;
                                            const key = `${backupKey}:additionalNtfyTopic`;
                                            // Clear timeout since we're updating now
                                            if (textInputTimeoutRefs.current[key]) {
                                              clearTimeout(textInputTimeoutRefs.current[key]);
                                              delete textInputTimeoutRefs.current[key];
                                            }
                                            // Update main state immediately with current input value
                                            // syncInputAfterUpdate=true to update input value after state change
                                            updateTextInputToMainState(key, currentValue, true);
                                            // Clean up ref
                                            delete textInputValuesRef.current[key];
                                            // Also trigger autosave
                                            triggerTextInputAutoSave();
                                          }}
                                          readOnly={(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off'}
                                          className={`text-xs pr-20 ${(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasNtfyOverride ? 'bg-background border-blue-500/50' : ''}`}
                                          title={effectiveNtfyTopic.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                          onFocus={(e) => {
                                            if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                              // Create override by setting the value (user can now edit)
                                              updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                              // Update input value directly (uncontrolled input)
                                              e.currentTarget.value = effectiveNtfyTopic.value;
                                              e.currentTarget.select();
                                            }
                                          }}
                                          onClick={(e) => {
                                            if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                              // Create override when clicked
                                              updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                              // Update input value directly (uncontrolled input)
                                              e.currentTarget.value = effectiveNtfyTopic.value;
                                              e.currentTarget.focus();
                                              e.currentTarget.select();
                                            }
                                          }}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const currentValue = getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value);
                                              handleTestNtfy(backupKey, currentValue);
                                            }}
                                            disabled={testingNtfy === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value) || effectiveNotificationEvent.value === 'off'}
                                            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Send test notification"
                                            title="Send test notification"
                                          >
                                            {testingNtfy === backupKey ? (
                                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                              <SendHorizontal className="h-4 w-4" />
                                            )}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const currentValue = getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value);
                                              handleGenerateQrCode(currentValue);
                                            }}
                                            disabled={!effectiveNtfyTopic.value || effectiveNotificationEvent.value === 'off'}
                                            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Show QR code"
                                            title="Show QR code"
                                          >
                                            <QrCode className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {effectiveNtfyTopic.isInherited 
                                          ? "Inheriting from server defaults. Click to override."
                                          : "Notifications will be published to this topic in addition to the default topic."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              })}
            </TableBody>
              </Table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredServerGroups.map((group) => {
              const isServerHeaderExpanded = expandedServerHeaders.has(group.serverId);
              const serverDefaults = getServerDefaultSettings(group.serverId);
              const serverDefaultKey = getServerDefaultKey(group.serverId);
              const serverDefaultAdditionalEvent = serverDefaults?.additionalNotificationEvent ?? 'off';
              const isSingleBackup = group.backups.length === 1;
              
              // For single backup servers, render merged card instead of server header
              if (isSingleBackup) {
                const backup = group.backups[0];
                const backupSetting = getBackupSettingById(backup.id, backup.backupName);
                const backupKey = `${backup.id}:${backup.backupName}`;
                
                // Get effective values with inheritance info
                const effectiveNotificationEvent = getEffectiveNotificationEvent(backup.id, backup.backupName);
                const effectiveEmails = getEffectiveValue(backup.id, backup.backupName, 'additionalEmails');
                const effectiveNtfyTopic = getEffectiveValue(backup.id, backup.backupName, 'additionalNtfyTopic');
                const hasNotificationEventOverride = hasOverride(backup.id, backup.backupName, 'additionalNotificationEvent');
                const hasEmailOverride = hasOverride(backup.id, backup.backupName, 'additionalEmails');
                const hasNtfyOverride = hasOverride(backup.id, backup.backupName, 'additionalNtfyTopic');
                const hasServerDefaults = serverDefaults !== null;
                
                // Combined display name
                const combinedName = group.serverAlias 
                  ? `${group.serverAlias} (${group.serverName}) : ${backup.backupName}`
                  : `${group.serverName} : ${backup.backupName}`;
                
                return (
                  <Card key={`mobile-merged-${backupKey}`} className="p-4 border-l-4 border-l-blue-600 hover:bg-muted/50">
                    <div className="space-y-3">
                      {/* Header with Combined Name */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedBackups.has(backupKey)}
                            onCheckedChange={() => handleToggleSelection(backupKey)}
                            title="Select this backup"
                          />
                          <div>
                            <div className="font-medium text-sm" title={`ServerID: ${group.serverId}`}>
                              {combinedName}
                            </div>
                            {group.serverNote && (
                              <div className="text-xs text-muted-foreground truncate">
                                {group.serverNote}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Notification Events */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Notification Events</Label>
                        <Select
                          value={backupSetting.notificationEvent}
                          onValueChange={(value: NotificationEvent) => 
                            updateBackupSettingById(backup.id, backup.backupName, 'notificationEvent', value)
                          }
                        >
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off">Off</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="warnings">Warnings</SelectItem>
                            <SelectItem value="errors">Errors</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Notification Channels */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Notification Channels</Label>
                        </div>
                        <div className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={backupSetting.ntfyEnabled !== undefined ? backupSetting.ntfyEnabled : true}
                              onCheckedChange={(checked: boolean) => 
                                updateBackupSettingById(backup.id, backup.backupName, 'ntfyEnabled', checked)
                              }
                              title={isNtfyConfigured ? "Enable NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                              className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                            />
                            <Label className={`text-xs ${!isNtfyConfigured ? "text-gray-400" : ""}`}>NTFY{!isNtfyConfigured ? " (disabled)" : ""}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                              onCheckedChange={(checked: boolean) => 
                                updateBackupSettingById(backup.id, backup.backupName, 'emailEnabled', checked)
                              }
                              title={isEmailConfigured ? "Enable Email notifications" : "SMTP not configured - notifications will not be sent"}
                              className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                            />
                            <Label className={`text-xs ${!isEmailConfigured ? "text-gray-400" : ""}`}>Email{!isEmailConfigured ? " (disabled)" : ""}</Label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Destinations */}
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`additional-${backupKey}`} className="border-none">
                          <AccordionTrigger className="text-xs font-medium py-2">
                            <div className="flex items-center gap-2">
                              Additional Destinations
                              {(effectiveNotificationEvent.isInherited || effectiveEmails.isInherited || effectiveNtfyTopic.isInherited) && (
                                <span title="Some values inherited from server defaults">
                                  <LinkIcon className="h-3 w-3 text-blue-500" />
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs font-medium">Notification event</Label>
                                  {!hasNotificationEventOverride && hasServerDefaults && (
                                    <span title="Inheriting from server defaults">
                                      <LinkIcon className="h-3 w-3 text-blue-500" />
                                    </span>
                                  )}
                                  {hasNotificationEventOverride && hasServerDefaults && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNotificationEvent')}
                                          className="cursor-pointer hover:text-blue-500 transition-colors"
                                          title="Override (not inheriting)"
                                        >
                                          <Link2Off className="h-3 w-3 text-blue-500" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Click to inherit from server defaults</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <Select
                                  value={effectiveNotificationEvent.value}
                                  onValueChange={(value: NotificationEvent) => 
                                    updateBackupSettingById(backup.id, backup.backupName, 'additionalNotificationEvent', value)
                                  }
                                >
                                  <SelectTrigger className={`w-full text-xs ${effectiveNotificationEvent.isInherited && !hasNotificationEventOverride ? 'bg-muted/40 text-muted-foreground' : hasNotificationEventOverride ? 'bg-background border-blue-500/50' : ''}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="off">Off</SelectItem>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="warnings">Warnings</SelectItem>
                                    <SelectItem value="errors">Errors</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  {effectiveNotificationEvent.isInherited 
                                    ? "Inheriting from server defaults. Change to override."
                                    : "Notification events to be sent to the additional email address and topic"}
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs font-medium">Additional Emails</Label>
                                  {!hasEmailOverride && hasServerDefaults && (
                                    <span title="Inheriting from server defaults">
                                      <LinkIcon className="h-3 w-3 text-blue-500" />
                                    </span>
                                  )}
                                  {hasEmailOverride && hasServerDefaults && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => clearOverride(backup.id, backup.backupName, 'additionalEmails')}
                                          className="cursor-pointer hover:text-blue-500 transition-colors"
                                          title="Override (not inheriting)"
                                        >
                                          <Link2Off className="h-3 w-3 text-blue-500" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Click to inherit from server defaults</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="relative">
                                  <Input
                                    ref={(el) => {
                                      const key = `${backupKey}:additionalEmails`;
                                      textInputRefs.current[key] = el;
                                      if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                        el.value = effectiveEmails.value;
                                      }
                                    }}
                                    type="text"
                                    placeholder={effectiveEmails.isInherited ? `Inheriting: ${effectiveEmails.value || 'Server Default'}` : "e.g. user1@example.com, user2@example.com"}
                                    defaultValue={effectiveEmails.value}
                                    disabled={effectiveNotificationEvent.value === 'off'}
                                    onChange={(e) => {
                                      if (effectiveNotificationEvent.value === 'off') return;
                                      storeTextInputValue(`${backupKey}:additionalEmails`, e.target.value);
                                      autoSaveTextInput(false);
                                    }}
                                    onBlur={(e) => {
                                      if (effectiveNotificationEvent.value === 'off') return;
                                      const currentValue = e.currentTarget.value;
                                      const key = `${backupKey}:additionalEmails`;
                                      if (textInputTimeoutRefs.current[key]) {
                                        clearTimeout(textInputTimeoutRefs.current[key]);
                                        delete textInputTimeoutRefs.current[key];
                                      }
                                      updateTextInputToMainState(key, currentValue, true);
                                      delete textInputValuesRef.current[key];
                                      triggerTextInputAutoSave();
                                    }}
                                    readOnly={(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off'}
                                    className={`text-xs pr-10 ${(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasEmailOverride ? 'bg-background border-blue-500/50' : ''}`}
                                    title={effectiveEmails.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                    onFocus={(e) => {
                                      if (effectiveEmails.isInherited && !hasEmailOverride) {
                                        updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                        e.currentTarget.value = effectiveEmails.value;
                                        e.currentTarget.select();
                                      }
                                    }}
                                    onClick={(e) => {
                                      if (effectiveEmails.isInherited && !hasEmailOverride) {
                                        updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                        e.currentTarget.value = effectiveEmails.value;
                                        e.currentTarget.focus();
                                        e.currentTarget.select();
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentValue = getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value);
                                      handleTestEmail(backupKey, currentValue);
                                    }}
                                    disabled={testingEmail === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value) || effectiveNotificationEvent.value === 'off'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Send test email"
                                    title="Send test email"
                                  >
                                    {testingEmail === backupKey ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                      <SendHorizontal className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {effectiveEmails.isInherited 
                                    ? "Inheriting from server defaults. Click to override."
                                    : "Notifications for this backup will be sent to these addresses in addition to the global recipient."}
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs font-medium">Additional NTFY Topic</Label>
                                  {!hasNtfyOverride && hasServerDefaults && (
                                    <span title="Inheriting from server defaults">
                                      <LinkIcon className="h-3 w-3 text-blue-500" />
                                    </span>
                                  )}
                                  {hasNtfyOverride && hasServerDefaults && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNtfyTopic')}
                                          className="cursor-pointer hover:text-blue-500 transition-colors"
                                          title="Override (not inheriting)"
                                        >
                                          <Link2Off className="h-3 w-3 text-blue-500" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Click to inherit from server defaults</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="relative">
                                  <Input
                                    ref={(el) => {
                                      const key = `${backupKey}:additionalNtfyTopic`;
                                      textInputRefs.current[key] = el;
                                      if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                        el.value = effectiveNtfyTopic.value;
                                      }
                                    }}
                                    type="text"
                                    placeholder={effectiveNtfyTopic.isInherited ? `Inheriting: ${effectiveNtfyTopic.value || 'Server Default'}` : "e.g. duplistatus-user-backup-alerts"}
                                    defaultValue={effectiveNtfyTopic.value}
                                    disabled={effectiveNotificationEvent.value === 'off'}
                                    onChange={(e) => {
                                      if (effectiveNotificationEvent.value === 'off') return;
                                      storeTextInputValue(`${backupKey}:additionalNtfyTopic`, e.target.value);
                                      autoSaveTextInput(false);
                                    }}
                                    onBlur={(e) => {
                                      if (effectiveNotificationEvent.value === 'off') return;
                                      const currentValue = e.currentTarget.value;
                                      const key = `${backupKey}:additionalNtfyTopic`;
                                      if (textInputTimeoutRefs.current[key]) {
                                        clearTimeout(textInputTimeoutRefs.current[key]);
                                        delete textInputTimeoutRefs.current[key];
                                      }
                                      updateTextInputToMainState(key, currentValue, true);
                                      delete textInputValuesRef.current[key];
                                      triggerTextInputAutoSave();
                                    }}
                                    readOnly={(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off'}
                                    className={`text-xs pr-20 ${(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasNtfyOverride ? 'bg-background border-blue-500/50' : ''}`}
                                    title={effectiveNtfyTopic.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                    onFocus={(e) => {
                                      if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                        updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                        e.currentTarget.value = effectiveNtfyTopic.value;
                                        e.currentTarget.select();
                                      }
                                    }}
                                    onClick={(e) => {
                                      if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                        updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                        e.currentTarget.value = effectiveNtfyTopic.value;
                                        e.currentTarget.focus();
                                        e.currentTarget.select();
                                      }
                                    }}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentValue = getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value);
                                        handleTestNtfy(backupKey, currentValue);
                                      }}
                                      disabled={testingNtfy === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value) || effectiveNotificationEvent.value === 'off'}
                                      className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      aria-label="Send test notification"
                                      title="Send test notification"
                                    >
                                      {testingNtfy === backupKey ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                      ) : (
                                        <SendHorizontal className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleGenerateQrCode(effectiveNtfyTopic.value)}
                                      disabled={!effectiveNtfyTopic.value || effectiveNotificationEvent.value === 'off'}
                                      className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      aria-label="Show QR code"
                                      title="Show QR code"
                                    >
                                      <QrCode className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {effectiveNtfyTopic.isInherited 
                                    ? "Inheriting from server defaults. Click to override."
                                    : "Notifications will be published to this topic in addition to the default topic."}
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </Card>
                );
              }
              
              // For multiple backups, render server header + backup cards
              return (
                <div key={`mobile-server-group-${group.serverId}`} className="space-y-3">
                  {/* Server Header Card */}
                  <Card className="p-4 bg-muted/60 border-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={isServerFullySelected(group.serverId) || isServerPartiallySelected(group.serverId)}
                            onCheckedChange={(checked) => handleSelectServer(group.serverId, checked as boolean)}
                            title={isServerPartiallySelected(group.serverId) ? "Some backups selected - click to select all" : "Select all backups for this server"}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleServerHeaderExpansion(group.serverId)}
                          >
                            {isServerHeaderExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-sm" title={`ServerID: ${group.serverId}`}>
                                {group.serverAlias ? (
                                  <>
                                    {group.serverAlias} ({group.serverName})
                                  </>
                                ) : (
                                  <span title={group.serverId}>{group.serverName}</span>
                                )}
                              </div>
                              {hasServerAdditionalDestinations(serverDefaults) && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Settings2 className="w-3.5 h-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Default additional destinations configured</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            {group.serverNote && (
                              <div className="text-xs text-muted-foreground truncate">
                                {group.serverNote}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {group.backups.length} backup{group.backups.length === 1 ? '' : 's'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Server Default Settings (when expanded) */}
                      {isServerHeaderExpanded && (
                        <div className="pt-3 border-t space-y-3 bg-blue-500/5 -mx-4 px-4 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">Default Additional Destinations for this Server</div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="gradient"
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => syncAllToServerDefaults(group.serverId)}
                                title="Sync all backups to inherit from server defaults"
                              >
                                Sync to All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs text-yellow-500 hover:text-yellow-500"
                                onClick={() => clearAllAdditionalDestinations(group.serverId)}
                                title="Clear all additional destinations from server and all backups"
                              >
                                Clear All
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Notification event</Label>
                            <Select
                              value={serverDefaultAdditionalEvent}
                              onValueChange={(value: NotificationEvent) => 
                                updateServerDefaultSetting(group.serverId, 'additionalNotificationEvent', value)
                              }
                            >
                              <SelectTrigger className="w-full text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="off">Off</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="warnings">Warnings</SelectItem>
                                <SelectItem value="errors">Errors</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Default Additional Emails</Label>
                            <div className="relative">
                              <Input
                                ref={(el) => {
                                  const key = `${serverDefaultKey}:additionalEmails`;
                                  textInputRefs.current[key] = el;
                                  // Sync value when ref is set (only if user is not currently typing and not recently updated)
                                  if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el && !recentlyUpdatedInputs.current.has(key)) {
                                    el.value = serverDefaults?.additionalEmails ?? '';
                                  }
                                }}
                                type="text"
                                placeholder="e.g. user1@example.com, user2@example.com"
                                defaultValue={serverDefaults?.additionalEmails ?? ''}
                                disabled={serverDefaultAdditionalEvent === 'off'}
                                onChange={(e) => {
                                  if (serverDefaultAdditionalEvent === 'off') return;
                                  // Store in ref only (no re-renders, no expensive computations)
                                  storeTextInputValue(`${serverDefaultKey}:additionalEmails`, e.target.value);
                                  // Set up 5-second debounced autosave
                                  autoSaveTextInput(false);
                                }}
                                onBlur={(e) => {
                                  if (serverDefaultAdditionalEvent === 'off') return;
                                  // Update main state when input loses focus - read current value from input
                                  const currentValue = e.currentTarget.value;
                                  const key = `${serverDefaultKey}:additionalEmails`;
                                  // Clear timeout since we're updating now
                                  if (textInputTimeoutRefs.current[key]) {
                                    clearTimeout(textInputTimeoutRefs.current[key]);
                                    delete textInputTimeoutRefs.current[key];
                                  }
                                  // Update main state immediately with current input value
                                  updateTextInputToMainState(key, currentValue, true);
                                  // Clean up ref
                                  delete textInputValuesRef.current[key];
                                  // Also trigger autosave
                                  triggerTextInputAutoSave();
                                }}
                                className={`text-xs pr-10 ${serverDefaultAdditionalEvent === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : ''}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValue = getCurrentTextInputValue(`${serverDefaultKey}:additionalEmails`, serverDefaults?.additionalEmails ?? '');
                                  handleTestEmail(serverDefaultKey, currentValue);
                                }}
                                disabled={testingEmail === serverDefaultKey || serverDefaultAdditionalEvent === 'off'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send test email"
                                title="Send test email"
                              >
                                {testingEmail === serverDefaultKey ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <SendHorizontal className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Default email addresses inherited by all backups on this server
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Default Additional NTFY Topic</Label>
                            <div className="relative">
                              <Input
                                ref={(el) => {
                                  const key = `${serverDefaultKey}:additionalNtfyTopic`;
                                  textInputRefs.current[key] = el;
                                  // Sync value when ref is set (only if user is not currently typing and not recently updated)
                                  if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el && !recentlyUpdatedInputs.current.has(key)) {
                                    el.value = serverDefaults?.additionalNtfyTopic ?? '';
                                  }
                                }}
                                type="text"
                                placeholder="e.g. duplistatus-user-backup-alerts"
                                defaultValue={serverDefaults?.additionalNtfyTopic ?? ''}
                                disabled={serverDefaultAdditionalEvent === 'off'}
                                onChange={(e) => {
                                  if (serverDefaultAdditionalEvent === 'off') return;
                                  // Store in ref only (no re-renders, no expensive computations)
                                  storeTextInputValue(`${serverDefaultKey}:additionalNtfyTopic`, e.target.value);
                                  // Set up 5-second debounced autosave
                                  autoSaveTextInput(false);
                                }}
                                onBlur={(e) => {
                                  if (serverDefaultAdditionalEvent === 'off') return;
                                  // Update main state when input loses focus - read current value from input
                                  const currentValue = e.currentTarget.value;
                                  const key = `${serverDefaultKey}:additionalNtfyTopic`;
                                  // Clear timeout since we're updating now
                                  if (textInputTimeoutRefs.current[key]) {
                                    clearTimeout(textInputTimeoutRefs.current[key]);
                                    delete textInputTimeoutRefs.current[key];
                                  }
                                  // Update main state immediately with current input value
                                  updateTextInputToMainState(key, currentValue, true);
                                  // Clean up ref
                                  delete textInputValuesRef.current[key];
                                  // Also trigger autosave
                                  triggerTextInputAutoSave();
                                }}
                                className={`text-xs pr-20 ${serverDefaultAdditionalEvent === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : ''}`}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentValue = getCurrentTextInputValue(`${serverDefaultKey}:additionalNtfyTopic`, serverDefaults?.additionalNtfyTopic ?? '');
                                    handleTestNtfy(serverDefaultKey, currentValue);
                                  }}
                                  disabled={testingNtfy === serverDefaultKey || serverDefaultAdditionalEvent === 'off'}
                                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Send test notification"
                                  title="Send test notification"
                                >
                                  {testingNtfy === serverDefaultKey ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <SendHorizontal className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGenerateQrCode(serverDefaults?.additionalNtfyTopic ?? '')}
                                  disabled={!serverDefaults?.additionalNtfyTopic || serverDefaultAdditionalEvent === 'off'}
                                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Show QR code"
                                  title="Show QR code"
                                >
                                  <QrCode className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Default NTFY topic inherited by all backups on this server
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                  
                  {/* Backup Cards */}
                  {group.backups.map((backup) => {
                    const backupSetting = getBackupSettingById(backup.id, backup.backupName);
                    const backupKey = `${backup.id}:${backup.backupName}`;
                    
                    // Get effective values with inheritance info
                    const effectiveNotificationEvent = getEffectiveNotificationEvent(backup.id, backup.backupName);
                    const effectiveEmails = getEffectiveValue(backup.id, backup.backupName, 'additionalEmails');
                    const effectiveNtfyTopic = getEffectiveValue(backup.id, backup.backupName, 'additionalNtfyTopic');
                    const hasNotificationEventOverride = hasOverride(backup.id, backup.backupName, 'additionalNotificationEvent');
                    const hasEmailOverride = hasOverride(backup.id, backup.backupName, 'additionalEmails');
                    const hasNtfyOverride = hasOverride(backup.id, backup.backupName, 'additionalNtfyTopic');
                    // Check if server defaults exist for this server
                    const serverDefaults = getServerDefaultSettings(backup.id);
                    const hasServerDefaults = serverDefaults !== null;
                    
                    return (
                      <Card key={`${backup.id}-${backup.backupName}`} className="p-4 ml-12 border-l border-l-border/50">
                        <div className="space-y-3">
                          {/* Header with Backup Name */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedBackups.has(backupKey)}
                                onCheckedChange={() => handleToggleSelection(backupKey)}
                                title="Select this backup"
                              />
                              <div>
                                <div className="font-medium text-sm">
                                  {backup.backupName}
                                </div>
                              </div>
                            </div>
                          </div>
                    
                    {/* Notification Events */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Notification Events</Label>
                      <Select
                        value={backupSetting.notificationEvent}
                        onValueChange={(value: NotificationEvent) => 
                          updateBackupSettingById(backup.id, backup.backupName, 'notificationEvent', value)
                        }
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">Off</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="warnings">Warnings</SelectItem>
                          <SelectItem value="errors">Errors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Notification Channels */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Notification Channels</Label>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              checked={allNtfySelected}
                              onCheckedChange={handleSelectAllNtfy}
                              title={isNtfyConfigured ? "Select all NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                              className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                            />
                            <Label className={`text-xs ${!isNtfyConfigured ? "text-gray-400" : "text-muted-foreground"}`}>All NTFY{!isNtfyConfigured ? " (disabled)" : ""}</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              checked={allEmailSelected}
                              onCheckedChange={handleSelectAllEmail}
                              title={isEmailConfigured ? "Select all Email notifications" : "SMTP not configured - notifications will not be sent"}
                              className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                            />
                            <Label className={`text-xs ${!isEmailConfigured ? "text-gray-400" : "text-muted-foreground"}`}>All Email{!isEmailConfigured ? " (disabled)" : ""}</Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={backupSetting.ntfyEnabled !== undefined ? backupSetting.ntfyEnabled : true}
                            onCheckedChange={(checked: boolean) => 
                              updateBackupSettingById(backup.id, backup.backupName, 'ntfyEnabled', checked)
                            }
                            title={isNtfyConfigured ? "Enable NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                            className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                          />
                          <Label className={`text-xs ${!isNtfyConfigured ? "text-gray-400" : ""}`}>NTFY{!isNtfyConfigured ? " (disabled)" : ""}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                            onCheckedChange={(checked: boolean) => 
                              updateBackupSettingById(backup.id, backup.backupName, 'emailEnabled', checked)
                            }
                            title={isEmailConfigured ? "Enable Email notifications" : "SMTP not configured - notifications will not be sent"}
                            className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                          />
                          <Label className={`text-xs ${!isEmailConfigured ? "text-gray-400" : ""}`}>Email{!isEmailConfigured ? " (disabled)" : ""}</Label>
                        </div>
                      </div>
                    </div>
                    
                          {/* Notification Events */}
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Notification Events</Label>
                            <Select
                              value={backupSetting.notificationEvent}
                              onValueChange={(value: NotificationEvent) => 
                                updateBackupSettingById(backup.id, backup.backupName, 'notificationEvent', value)
                              }
                            >
                              <SelectTrigger className="w-full text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="off">Off</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="warnings">Warnings</SelectItem>
                                <SelectItem value="errors">Errors</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Notification Channels */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium">Notification Channels</Label>
                            </div>
                            <div className="flex gap-6">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={backupSetting.ntfyEnabled !== undefined ? backupSetting.ntfyEnabled : true}
                                  onCheckedChange={(checked: boolean) => 
                                    updateBackupSettingById(backup.id, backup.backupName, 'ntfyEnabled', checked)
                                  }
                                  title={isNtfyConfigured ? "Enable NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                                  className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                                />
                                <Label className={`text-xs ${!isNtfyConfigured ? "text-gray-400" : ""}`}>NTFY{!isNtfyConfigured ? " (disabled)" : ""}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                                  onCheckedChange={(checked: boolean) => 
                                    updateBackupSettingById(backup.id, backup.backupName, 'emailEnabled', checked)
                                  }
                                  title={isEmailConfigured ? "Enable Email notifications" : "SMTP not configured - notifications will not be sent"}
                                  className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                                />
                                <Label className={`text-xs ${!isEmailConfigured ? "text-gray-400" : ""}`}>Email{!isEmailConfigured ? " (disabled)" : ""}</Label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Additional Destinations */}
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={`additional-${backupKey}`} className="border-none">
                              <AccordionTrigger className="text-xs font-medium py-2">
                                <div className="flex items-center gap-2">
                                  Additional Destinations
                                  {(effectiveEmails.isInherited || effectiveNtfyTopic.isInherited) && (
                                    <span title="Some values inherited from server defaults">
                                      <LinkIcon className="h-3 w-3 text-blue-500" />
                                    </span>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-xs font-medium">Notification event</Label>
                                      {!hasNotificationEventOverride && hasServerDefaults && (
                                        <span title="Inheriting from server defaults">
                                          <LinkIcon className="h-3 w-3 text-blue-500" />
                                        </span>
                                      )}
                                      {hasNotificationEventOverride && hasServerDefaults && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNotificationEvent')}
                                              className="cursor-pointer hover:text-blue-500 transition-colors"
                                              title="Override (not inheriting)"
                                            >
                                              <Link2Off className="h-3 w-3 text-blue-500" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Click to inherit from server defaults</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                    <Select
                                      value={effectiveNotificationEvent.value}
                                      onValueChange={(value: NotificationEvent) => 
                                        updateBackupSettingById(backup.id, backup.backupName, 'additionalNotificationEvent', value)
                                      }
                                    >
                                      <SelectTrigger className={`w-full text-xs ${effectiveNotificationEvent.isInherited && !hasNotificationEventOverride ? 'bg-muted/40 text-muted-foreground' : hasNotificationEventOverride ? 'bg-background border-blue-500/50' : ''}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="off">Off</SelectItem>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="warnings">Warnings</SelectItem>
                                        <SelectItem value="errors">Errors</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                      {effectiveNotificationEvent.isInherited 
                                        ? "Inheriting from server defaults. Change to override."
                                        : "Notification events to be sent to the additional email address and topic"}
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-xs font-medium">Additional Emails</Label>
                                      {!hasEmailOverride && hasServerDefaults && (
                                        <span title="Inheriting from server defaults">
                                          <LinkIcon className="h-3 w-3 text-blue-500" />
                                        </span>
                                      )}
                                      {hasEmailOverride && hasServerDefaults && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => clearOverride(backup.id, backup.backupName, 'additionalEmails')}
                                              className="cursor-pointer hover:text-blue-500 transition-colors"
                                              title="Override (not inheriting)"
                                            >
                                              <Link2Off className="h-3 w-3 text-blue-500" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Click to inherit from server defaults</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                    <div className="relative">
                                      <Input
                                        ref={(el) => {
                                          const key = `${backupKey}:additionalEmails`;
                                          textInputRefs.current[key] = el;
                                          // Sync value when ref is set (only if user is not currently typing)
                                          if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                            el.value = effectiveEmails.value;
                                          }
                                        }}
                                        type="text"
                                        placeholder={effectiveEmails.isInherited ? `Inheriting: ${effectiveEmails.value || 'Server Default'}` : "e.g. user1@example.com, user2@example.com"}
                                        defaultValue={effectiveEmails.value}
                                        disabled={effectiveNotificationEvent.value === 'off'}
                                        onChange={(e) => {
                                          if (effectiveNotificationEvent.value === 'off') return;
                                          // Store in ref only (no re-renders, no expensive computations)
                                          storeTextInputValue(`${backupKey}:additionalEmails`, e.target.value);
                                          // Set up 5-second debounced autosave
                                          autoSaveTextInput(false);
                                        }}
                                        onBlur={(e) => {
                                          if (effectiveNotificationEvent.value === 'off') return;
                                          // Update main state when input loses focus - read current value from input
                                          const currentValue = e.currentTarget.value;
                                          const key = `${backupKey}:additionalEmails`;
                                          // Clear timeout since we're updating now
                                          if (textInputTimeoutRefs.current[key]) {
                                            clearTimeout(textInputTimeoutRefs.current[key]);
                                            delete textInputTimeoutRefs.current[key];
                                          }
                                          // Update main state immediately with current input value
                                          // syncInputAfterUpdate=true to update input value after state change
                                          updateTextInputToMainState(key, currentValue, true);
                                          // Clean up ref
                                          delete textInputValuesRef.current[key];
                                          // Also trigger autosave
                                          triggerTextInputAutoSave();
                                        }}
                                        readOnly={(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off'}
                                        className={`text-xs pr-10 ${(effectiveEmails.isInherited && !hasEmailOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasEmailOverride ? 'bg-background border-blue-500/50' : ''}`}
                                        title={effectiveEmails.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                        onFocus={(e) => {
                                          if (effectiveEmails.isInherited && !hasEmailOverride) {
                                            // Create override by setting the value (user can now edit)
                                            updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                            // Update input value directly (uncontrolled input)
                                            e.currentTarget.value = effectiveEmails.value;
                                            e.currentTarget.select();
                                          }
                                        }}
                                        onClick={(e) => {
                                          if (effectiveEmails.isInherited && !hasEmailOverride) {
                                            // Create override when clicked
                                            updateBackupSettingById(backup.id, backup.backupName, 'additionalEmails', effectiveEmails.value);
                                            // Update input value directly (uncontrolled input)
                                            e.currentTarget.value = effectiveEmails.value;
                                            e.currentTarget.focus();
                                            e.currentTarget.select();
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentValue = getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value);
                                          handleTestEmail(backupKey, currentValue);
                                        }}
                                          disabled={testingEmail === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalEmails`, effectiveEmails.value) || effectiveNotificationEvent.value === 'off'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Send test email"
                                        title="Send test email"
                                      >
                                        {testingEmail === backupKey ? (
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        ) : (
                                          <SendHorizontal className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {effectiveEmails.isInherited 
                                        ? "Inheriting from server defaults. Click to override."
                                        : "Notifications for this backup will be sent to these addresses in addition to the global recipient."}
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-xs font-medium">Additional NTFY Topic</Label>
                                      {!hasNtfyOverride && hasServerDefaults && (
                                        <span title="Inheriting from server defaults">
                                          <LinkIcon className="h-3 w-3 text-blue-500" />
                                        </span>
                                      )}
                                      {hasNtfyOverride && hasServerDefaults && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => clearOverride(backup.id, backup.backupName, 'additionalNtfyTopic')}
                                              className="cursor-pointer hover:text-blue-500 transition-colors"
                                              title="Override (not inheriting)"
                                            >
                                              <Link2Off className="h-3 w-3 text-blue-500" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Click to inherit from server defaults</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                    <div className="relative">
                                      <Input
                                        ref={(el) => {
                                          const key = `${backupKey}:additionalNtfyTopic`;
                                          textInputRefs.current[key] = el;
                                          // Sync value when ref is set (only if user is not currently typing)
                                          if (el && !textInputTimeoutRefs.current[key] && document.activeElement !== el) {
                                            el.value = effectiveNtfyTopic.value;
                                          }
                                        }}
                                        type="text"
                                        placeholder={effectiveNtfyTopic.isInherited ? `Inheriting: ${effectiveNtfyTopic.value || 'Server Default'}` : "e.g. duplistatus-user-backup-alerts"}
                                        defaultValue={effectiveNtfyTopic.value}
                                        disabled={effectiveNotificationEvent.value === 'off'}
                                        onChange={(e) => {
                                          if (effectiveNotificationEvent.value === 'off') return;
                                          // Store in ref only (no re-renders, no expensive computations)
                                          storeTextInputValue(`${backupKey}:additionalNtfyTopic`, e.target.value);
                                          // Set up 5-second debounced autosave
                                          autoSaveTextInput(false);
                                        }}
                                        onBlur={(e) => {
                                          if (effectiveNotificationEvent.value === 'off') return;
                                          // Update main state when input loses focus - read current value from input
                                          const currentValue = e.currentTarget.value;
                                          const key = `${backupKey}:additionalNtfyTopic`;
                                          // Clear timeout since we're updating now
                                          if (textInputTimeoutRefs.current[key]) {
                                            clearTimeout(textInputTimeoutRefs.current[key]);
                                            delete textInputTimeoutRefs.current[key];
                                          }
                                          // Update main state immediately with current input value
                                          // syncInputAfterUpdate=true to update input value after state change
                                          updateTextInputToMainState(key, currentValue, true);
                                          // Clean up ref
                                          delete textInputValuesRef.current[key];
                                          // Also trigger autosave
                                          triggerTextInputAutoSave();
                                        }}
                                        readOnly={(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off'}
                                        className={`text-xs pr-20 ${(effectiveNtfyTopic.isInherited && !hasNtfyOverride) || effectiveNotificationEvent.value === 'off' ? 'bg-muted/40 text-muted-foreground cursor-not-allowed' : hasNtfyOverride ? 'bg-background border-blue-500/50' : ''}`}
                                        title={effectiveNtfyTopic.isInherited ? "Inheriting from server defaults. Click to override." : undefined}
                                        onFocus={(e) => {
                                          if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                            // Create override by setting the value (user can now edit)
                                            updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                            // Update input value directly (uncontrolled input)
                                            e.currentTarget.value = effectiveNtfyTopic.value;
                                            e.currentTarget.select();
                                          }
                                        }}
                                        onClick={(e) => {
                                          if (effectiveNtfyTopic.isInherited && !hasNtfyOverride) {
                                            // Create override when clicked
                                            updateBackupSettingById(backup.id, backup.backupName, 'additionalNtfyTopic', effectiveNtfyTopic.value);
                                            // Update input value directly (uncontrolled input)
                                            e.currentTarget.value = effectiveNtfyTopic.value;
                                            e.currentTarget.focus();
                                            e.currentTarget.select();
                                          }
                                        }}
                                      />
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                          type="button"
                                            onClick={() => {
                                              const currentValue = getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value);
                                              handleTestNtfy(backupKey, currentValue);
                                            }}
                                          disabled={testingNtfy === backupKey || !getCurrentTextInputValue(`${backupKey}:additionalNtfyTopic`, effectiveNtfyTopic.value) || effectiveNotificationEvent.value === 'off'}
                                          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label="Send test notification"
                                          title="Send test notification"
                                        >
                                          {testingNtfy === backupKey ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                          ) : (
                                            <SendHorizontal className="h-4 w-4" />
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleGenerateQrCode(effectiveNtfyTopic.value)}
                                          disabled={!effectiveNtfyTopic.value || effectiveNotificationEvent.value === 'off'}
                                          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label="Show QR code"
                                          title="Show QR code"
                                        >
                                          <QrCode className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {effectiveNtfyTopic.isInherited 
                                        ? "Inheriting from server defaults. Click to override."
                                        : "Notifications will be published to this topic in addition to the default topic."}
                                    </p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Bulk Clear Confirmation Dialog */}
          <AlertDialog open={isBulkClearConfirmOpen} onOpenChange={setIsBulkClearConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Additional Destinations</AlertDialogTitle>
                <AlertDialogDescription>
                  {(() => {
                    // Calculate unique server IDs from selected backups
                    const affectedServerIds = new Set<string>();
                    selectedBackups.forEach(backupKey => {
                      const [serverId] = backupKey.split(':');
                      if (serverId) {
                        affectedServerIds.add(serverId);
                      }
                    });
                    const affectedServerCount = affectedServerIds.size;
                    
                    return (
                      <>
                        Are you sure you want to clear all additional notification settings for the <strong>{selectedBackups.size}</strong> selected backup{selectedBackups.size === 1 ? '' : 's'}?
                        {affectedServerCount > 0 && (
                          <> <br/> This will also clear additional destination settings from the server default{affectedServerCount === 1 ? '' : 's'} for <strong>{affectedServerCount}</strong> affected server{affectedServerCount === 1 ? '' : 's'}.</>
                        )}
                        {' '}This action cannot be undone.
                      </>
                    );
                  })()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkRemoveAdditionalDestinationsConfirmed}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Bulk Edit Modal */}
          <Dialog open={isBulkEditModalOpen} onOpenChange={setIsBulkEditModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Set Additional Destinations</DialogTitle>
                <DialogDescription>
                  Update additional destination settings for {selectedBackups.size} selected backup{selectedBackups.size === 1 ? '' : 's'}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notification Event</Label>
                  <Select
                    value={bulkEditNotificationEvent}
                    onValueChange={(value: NotificationEvent) => setBulkEditNotificationEvent(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="warnings">Warnings</SelectItem>
                      <SelectItem value="errors">Errors</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Notification events to be sent to the additional email address and topic
                  </p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Additional Emails</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. user1@example.com, user2@example.com"
                      value={bulkEditAdditionalEmails}
                      onChange={(e) => setBulkEditAdditionalEmails(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={handleBulkTestEmail}
                      disabled={testingBulkEmail}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send test email"
                      title="Send test email"
                    >
                      {testingBulkEmail ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <SendHorizontal className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Notifications for these backups will be sent to these addresses in addition to the global recipient.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Additional NTFY Topic</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. duplistatus-user-backup-alerts"
                      value={bulkEditAdditionalNtfyTopic}
                      onChange={(e) => setBulkEditAdditionalNtfyTopic(e.target.value)}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleBulkTestNtfy}
                        disabled={testingBulkNtfy}
                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send test notification"
                        title="Send test notification"
                      >
                        {testingBulkNtfy ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <SendHorizontal className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateQrCode(bulkEditAdditionalNtfyTopic)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Show QR code"
                        title="Show QR code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Notifications will be published to this topic in addition to the default topic.
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBulkEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpdate}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* QR Code Modal */}
          <NtfyQrModal 
            isOpen={isQrModalOpen} 
            onOpenChange={setIsQrModalOpen} 
            qrCodeDataUrl={qrCodeDataUrl} 
            topicUrl={topicUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}