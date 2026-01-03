"use client";

import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
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
import { ServerConfigurationButton } from '../ui/server-configuration-button';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { ChevronDown, ChevronRight, X, Search, SendHorizontal, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function BackupNotificationsForm({ backupSettings }: BackupNotificationsFormProps) {
  const { toast } = useToast();
  const { config, refreshConfigSilently } = useConfiguration();
  const { refreshOverdueTolerance } = useConfig();
  const [settings, setSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  
  // Select-all state
  const [allNtfySelected, setAllNtfySelected] = useState(false);
  const [allEmailSelected, setAllEmailSelected] = useState(false);
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<BackupKey>>(new Set());
  
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

  // Bulk selection state
  const [selectedBackups, setSelectedBackups] = useState<Set<BackupKey>>(new Set());
  const [serverNameFilter, setServerNameFilter] = useState<string>('');
  
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
  const pendingChangesRef = useRef<Record<BackupKey, BackupNotificationConfig> | null>(null);
  const isAutoSaveInProgressRef = useRef(false);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const tableScrollContainerRef = useRef<HTMLDivElement>(null);

  // Column configuration for sorting
  const columnConfig = {
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    backupName: { type: 'text' as keyof typeof sortFunctions, path: 'backupName' },
    notificationEvent: { type: 'notificationEvent' as keyof typeof sortFunctions, path: 'notificationEvent' },
  };

  useEffect(() => {
    // Don't reinitialize if we're in the middle of saving to prevent overwriting local changes
    if (isSavingInProgress) return;
    
    if (config) {
      // Initialize settings from config
      if (config.backupSettings && Object.keys(config.backupSettings).length > 0) {
        setSettings(config.backupSettings);
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

  const updateBackupSettingById = (serverId: string, backupName: string, field: keyof BackupNotificationConfig, value: string | number | boolean) => {
    const backupKey = `${serverId}:${backupName}`;
    const newSettings = {
      ...settings,
      [backupKey]: {
        ...(settings[backupKey] || { ...defaultBackupNotificationConfig }),
        [field]: value,
      },
    };
    
    setSettings(newSettings);
    
    // Trigger auto-save
    autoSave(newSettings);
  };

  const getBackupSettingById = useCallback((serverId: string, backupName: string): BackupNotificationConfig => {
    const backupKey = `${serverId}:${backupName}`;
    return settings[backupKey] || { ...defaultBackupNotificationConfig };
  }, [settings]);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (newSettings: Record<BackupKey, BackupNotificationConfig>) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
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

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Select-all handlers
  const handleSelectAllNtfy = (checked: boolean) => {
    const servers = getServersWithBackupAndSettings();
    const newSettings = { ...settings };
    
    servers.forEach(server => {
      const backupKey = `${server.id}:${server.backupName}`;
      newSettings[backupKey] = {
        ...(newSettings[backupKey] || { ...defaultBackupNotificationConfig }),
        ntfyEnabled: checked,
      };
    });
    
    setSettings(newSettings);
    autoSave(newSettings);
  };

  const handleSelectAllEmail = (checked: boolean) => {
    const servers = getServersWithBackupAndSettings();
    const newSettings = { ...settings };
    
    servers.forEach(server => {
      const backupKey = `${server.id}:${server.backupName}`;
      newSettings[backupKey] = {
        ...(newSettings[backupKey] || { ...defaultBackupNotificationConfig }),
        emailEnabled: checked,
      };
    });
    
    setSettings(newSettings);
    autoSave(newSettings);
  };

  // Create servers with settings for sorting
  const getServersWithBackupAndSettings = (): ServerWithBackupAndSettings[] => {
    if (!config?.serversWithBackups) return [];
    
    return config.serversWithBackups.map((server: ServerWithBackup) => {
      const backupSetting = getBackupSettingById(server.id, server.backupName);
      
      return {
        ...server,
        notificationEvent: backupSetting.notificationEvent,
      };
    });
  };

  // Get sorted servers
  const sortedServers = createSortedArray(getServersWithBackupAndSettings(), sortConfig, columnConfig);

  // Filter servers by server name/alias
  const filteredServers = sortedServers.filter(server => {
    if (!serverNameFilter.trim()) return true;
    const filterLower = serverNameFilter.toLowerCase();
    const nameMatch = server.name.toLowerCase().includes(filterLower);
    const aliasMatch = server.alias?.toLowerCase().includes(filterLower) || false;
    return nameMatch || aliasMatch;
  });

  // Update select-all state based on current settings
  useEffect(() => {
    if (sortedServers.length === 0) return;
    
    const ntfyStates = sortedServers.map(server => {
      const setting = getBackupSettingById(server.id, server.backupName);
      return setting.ntfyEnabled !== undefined ? setting.ntfyEnabled : true;
    });
    const emailStates = sortedServers.map(server => {
      const setting = getBackupSettingById(server.id, server.backupName);
      return setting.emailEnabled !== undefined ? setting.emailEnabled : true;
    });
    
    setAllNtfySelected(ntfyStates.every(state => state));
    setAllEmailSelected(emailStates.every(state => state));
  }, [settings, sortedServers, getBackupSettingById]);

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedBackups(prev => {
      const newSet = new Set(prev);
      if (checked) {
        filteredServers.forEach(server => {
          const backupKey = `${server.id}:${server.backupName}`;
          newSet.add(backupKey);
        });
      } else {
        filteredServers.forEach(server => {
          const backupKey = `${server.id}:${server.backupName}`;
          newSet.delete(backupKey);
        });
      }
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

  const handleClearSelection = () => {
    setSelectedBackups(new Set());
  };

  // Calculate select-all checkbox state
  const allFilteredSelected = filteredServers.length > 0 && filteredServers.every(server => {
    const backupKey = `${server.id}:${server.backupName}`;
    return selectedBackups.has(backupKey);
  });
  const someFilteredSelected = filteredServers.some(server => {
    const backupKey = `${server.id}:${server.backupName}`;
    return selectedBackups.has(backupKey);
  });

  // Bulk remove additional destinations handler (called after confirmation)
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
      // Collect all updates into a single settings object
      const updatedSettings = { ...settings };
      
      selectedBackups.forEach(backupKey => {
        const [serverId, backupName] = backupKey.split(':');
        if (serverId && backupName) {
          const currentSetting = updatedSettings[backupKey] || { ...defaultBackupNotificationConfig };
          // Remove additional destination fields or set notification event to "off"
          const { additionalNotificationEvent, additionalEmails, additionalNtfyTopic, ...rest } = currentSetting;
          updatedSettings[backupKey] = {
            ...rest,
            additionalNotificationEvent: 'off' as NotificationEvent,
            additionalEmails: '',
            additionalNtfyTopic: '',
          };
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
          console.error('Bulk remove response error:', response.status, errorText);
          throw new Error(`Failed to save backup settings: ${response.status} ${errorText}`);
        }
        
        // Refresh the configuration cache silently
        await refreshConfigSilently();
        
        // Refresh the config context to update tooltips immediately
        await refreshOverdueTolerance();
        
        // Close confirmation dialog
        setIsBulkClearConfirmOpen(false);
        
        // Clear selection
        handleClearSelection();
        
        toast({
          title: "Additional Destinations Removed",
          description: `Removed additional destinations from ${selectedCount} backup${selectedCount === 1 ? '' : 's'}`,
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
      
      selectedBackups.forEach(backupKey => {
        const [serverId, backupName] = backupKey.split(':');
        if (serverId && backupName) {
          const currentSetting = updatedSettings[backupKey] || { ...defaultBackupNotificationConfig };
          updatedSettings[backupKey] = {
            ...currentSetting,
            additionalNotificationEvent: bulkEditNotificationEvent,
            additionalEmails: bulkEditAdditionalEmails,
            additionalNtfyTopic: bulkEditAdditionalNtfyTopic,
          };
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
        
        // Close modal and clear selection
        setIsBulkEditModalOpen(false);
        handleClearSelection();
        
        toast({
          title: "Bulk Update Successful",
          description: `Updated ${selectedBackups.size} backup${selectedBackups.size === 1 ? '' : 's'}`,
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
             Configure notification settings for each backup received from Duplicati. 
             Choose which backup events should trigger notifications.
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
                  Server Name
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[150px] min-w-[120px] bg-muted" 
                  column="backupName" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Backup Name
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
              {filteredServers.map((server) => {
                const backupSetting = getBackupSettingById(server.id, server.backupName);
                const backupKey = `${server.id}:${server.backupName}`;
                const isExpanded = expandedRows.has(backupKey);
                const additionalNotificationEvent = backupSetting.additionalNotificationEvent ?? backupSetting.notificationEvent;
                
                return (
                  <Fragment key={`${server.id}-${server.backupName}`}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={(e) => {
                        // Only toggle if clicking on the row itself, not on interactive elements
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
                      <TableCell className="pl-1">
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
                          <div>
                            <div className="font-medium text-sm">
                              <div className="flex items-center gap-1">
                                <div onClick={(e) => e.stopPropagation()}>
                                  <ServerConfigurationButton
                                    serverUrl={server.server_url}
                                    serverName={server.name}
                                    serverAlias={server.alias}
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs hover:text-blue-500 transition-colors"
                                    showText={false}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span 
                                    className="truncate" 
                                    title={server.alias ? server.name : undefined}
                                  >
                                    {server.alias || server.name}
                                  </span>
                                  {server.note && (
                                    <span className="text-xs text-muted-foreground truncate">
                                      {server.note}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm truncate">{server.backupName}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={backupSetting.notificationEvent}
                          onValueChange={(value: NotificationEvent) => 
                            updateBackupSettingById(server.id, server.backupName, 'notificationEvent', value)
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
                            updateBackupSettingById(server.id, server.backupName, 'ntfyEnabled', checked)
                          }
                          title={isNtfyConfigured ? "Enable NTFY notifications" : "NTFY not configured - notifications will not be sent"}
                          className={!isNtfyConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                        />
                      </TableCell>
                      
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                          onCheckedChange={(checked: boolean) => 
                            updateBackupSettingById(server.id, server.backupName, 'emailEnabled', checked)
                          }
                          title={isEmailConfigured ? "Enable Email notifications" : "SMTP not configured - notifications will not be sent"}
                          className={!isEmailConfigured ? "opacity-100 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-black" : ""}
                        />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="py-0 px-2">
                            <div className="font-medium text-sm mb-3">Additional Destinations</div>
                            
                            <div className="grid grid-cols-[auto_1fr_1fr] gap-4 items-start">
                              <div className="space-y-1 max-w-[160px]">
                                <Label className="text-xs font-medium">Notification event</Label>
                                <Select
                                  value={additionalNotificationEvent}
                                  onValueChange={(value: NotificationEvent) => 
                                    updateBackupSettingById(server.id, server.backupName, 'additionalNotificationEvent', value)
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
                                  Notification events to be sent to the additional email address and topic
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">Additional Emails</Label>
                                <div className="relative">
                                  <Input
                                    type="text"
                                    placeholder="e.g. user1@example.com, user2@example.com"
                                    value={backupSetting.additionalEmails ?? ''}
                                    onChange={(e) => 
                                      updateBackupSettingById(server.id, server.backupName, 'additionalEmails', e.target.value)
                                    }
                                    className="text-xs pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTestEmail(backupKey, backupSetting.additionalEmails ?? '');
                                    }}
                                    disabled={testingEmail === backupKey}
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
                                  Notifications for this backup will be sent to these addresses in addition to the global recipient.
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">Additional NTFY Topic</Label>
                                <div className="relative">
                                  <Input
                                    type="text"
                                    placeholder="e.g. duplistatus-user-backup-alerts"
                                    value={backupSetting.additionalNtfyTopic ?? ''}
                                    onChange={(e) => 
                                      updateBackupSettingById(server.id, server.backupName, 'additionalNtfyTopic', e.target.value)
                                    }
                                    className="text-xs pr-20"
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTestNtfy(backupKey, backupSetting.additionalNtfyTopic ?? '');
                                      }}
                                      disabled={testingNtfy === backupKey}
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
                                        handleGenerateQrCode(backupSetting.additionalNtfyTopic ?? '');
                                      }}
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
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
              </Table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredServers.map((server) => {
              const backupSetting = getBackupSettingById(server.id, server.backupName);
              const backupKey = `${server.id}:${server.backupName}`;
              const additionalNotificationEvent = backupSetting.additionalNotificationEvent ?? backupSetting.notificationEvent;
              
              return (
                <Card key={`${server.id}-${server.backupName}`} className="p-4">
                  <div className="space-y-3">
                    {/* Header with Server and Backup Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedBackups.has(backupKey)}
                          onCheckedChange={() => handleToggleSelection(backupKey)}
                          title="Select this backup"
                        />
                        <ServerConfigurationButton
                          serverUrl={server.server_url}
                          serverName={server.name}
                          serverAlias={server.alias}
                          size="sm"
                          variant="ghost"
                          className="text-xs hover:text-blue-500 transition-colors"
                          showText={false}
                        />
                        <div>
                          <div 
                            className="font-medium text-sm" 
                            title={server.alias ? server.name : undefined}
                          >
                            {server.alias || server.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{server.backupName}</div>
                          {server.note && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {server.note}
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
                          updateBackupSettingById(server.id, server.backupName, 'notificationEvent', value)
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
                              updateBackupSettingById(server.id, server.backupName, 'ntfyEnabled', checked)
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
                              updateBackupSettingById(server.id, server.backupName, 'emailEnabled', checked)
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
                          Additional Destinations
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Notification event</Label>
                              <Select
                                value={additionalNotificationEvent}
                                onValueChange={(value: NotificationEvent) => 
                                  updateBackupSettingById(server.id, server.backupName, 'additionalNotificationEvent', value)
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
                                Notification events to be sent to the additional email address and topic
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Additional Emails</Label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="e.g. user1@example.com, user2@example.com"
                                  value={backupSetting.additionalEmails ?? ''}
                                  onChange={(e) => 
                                    updateBackupSettingById(server.id, server.backupName, 'additionalEmails', e.target.value)
                                  }
                                  className="text-xs pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTestEmail(backupKey, backupSetting.additionalEmails ?? '');
                                  }}
                                  disabled={testingEmail === backupKey}
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
                                Notifications for this backup will be sent to these addresses in addition to the global recipient.
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Additional NTFY Topic</Label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="e.g. duplistatus-user-backup-alerts"
                                  value={backupSetting.additionalNtfyTopic ?? ''}
                                  onChange={(e) => 
                                    updateBackupSettingById(server.id, server.backupName, 'additionalNtfyTopic', e.target.value)
                                  }
                                  className="text-xs pr-20"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTestNtfy(backupKey, backupSetting.additionalNtfyTopic ?? '');
                                    }}
                                    disabled={testingNtfy === backupKey}
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
                                      handleGenerateQrCode(backupSetting.additionalNtfyTopic ?? '');
                                    }}
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
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bulk Clear Confirmation Dialog */}
          <AlertDialog open={isBulkClearConfirmOpen} onOpenChange={setIsBulkClearConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Additional Destinations</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to clear all additional notification settings for the <strong>{selectedBackups.size}</strong> selected backup{selectedBackups.size === 1 ? '' : 's'}? This action cannot be undone.
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