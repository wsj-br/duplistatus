"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { useToast } from '@/components/ui/use-toast';
import { useConfiguration, type ServerWithBackup } from '@/contexts/configuration-context';
import { useConfig } from '@/contexts/config-context';
import { BackupNotificationConfig, BackupKey, CronInterval, NotificationFrequencyConfig, OverdueTolerance } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { cronClient } from '@/lib/cron-client';
import { cronIntervalMap } from '@/lib/cron-interval-map';
import { defaultBackupNotificationConfig, defaultNotificationFrequencyConfig, defaultOverdueTolerance, defaultCronInterval } from '@/lib/default-config';
import { RefreshCw, TimerReset, Download } from "lucide-react";
import { ServerConfigurationButton } from '../ui/server-configuration-button';
import { ServerFilterInput } from '@/components/ui/server-filter-input';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { BackupCollectMenu } from '../backup-collect-menu';
import { CollectAllButton } from '../ui/collect-all-button';
import Link from 'next/link';
import { useLocale } from '@/contexts/locale-context';
import { 
  getIntervalDisplay, 
  createIntervalString, 
  validateIntervalString,
  IntervalUnit,
  getDefaultAllowedWeekDays,
  toggleWeekDay,
  isWeekDayAllowed
} from '@/lib/interval-utils';
import { formatRelativeTime, getLocaleWeekDays } from '@/lib/utils';
import { formatDateTime } from '@/lib/date-format';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// Use the ServerWithBackup interface from the configuration context

interface BackupMonitoringFormProps {
  backupSettings: Record<BackupKey, BackupNotificationConfig>;
  onSave?: (settings: Record<BackupKey, BackupNotificationConfig>) => void;
}

// Extended server interface for sorting
interface ServerWithBackupAndSettings extends ServerWithBackup {
  overdueBackupCheckEnabled: boolean;
  expectedInterval: string;
  displayInterval: number;
  displayUnit: IntervalUnit;
  isCustomInterval: boolean;
  allowedWeekDays: number[];
  nextRunDate: string;
}

export function BackupMonitoringForm({ backupSettings }: BackupMonitoringFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const locale = useLocale();
  const { config, refreshConfigSilently, updateConfig } = useConfiguration();
  const { startOfWeek } = useConfig();
  const [settings, setSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, IntervalUnit>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [cronInterval, setCronIntervalState] = useState<CronInterval>(defaultCronInterval);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequencyConfig>(defaultNotificationFrequencyConfig);
  const [notificationFrequencyLoading, setNotificationFrequencyLoading] = useState(false);
  const [notificationFrequencyError, setNotificationFrequencyError] = useState<string | null>(null);
  const [overdueToleranceMs, setOverdueToleranceMs] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);
  const [autoCollectingServers, setAutoCollectingServers] = useState<Set<string>>(new Set());
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [lastBackupTimestamps, setLastBackupTimestamps] = useState<Record<string, string>>({});
  const [serverFilter, setServerFilter] = useState<string>("");
  const tableScrollContainerRef = useRef<HTMLDivElement>(null);

  // Get locale-aware weekdays ordered by locale's first day of week (with user's preference)
  const localeWeekDays = useMemo(() => getLocaleWeekDays(locale, startOfWeek), [locale, startOfWeek]);

  // Notification frequency options - will be created inside component to use common
  const notificationFrequencyOptions = useMemo(() => [
    { value: 'onetime' as NotificationFrequencyConfig, label: t("One time") },
    { value: 'every_day' as NotificationFrequencyConfig, label: t("Every day") },
    { value: 'every_week' as NotificationFrequencyConfig, label: t("Every week") },
    { value: 'every_month' as NotificationFrequencyConfig, label: t("Every month") },
  ], [t]);

  // Create translated cron interval map
  const translatedCronIntervalMap = useMemo(() => {
    const labelMap: Record<CronInterval, string> = {
      'disabled': t("Disabled"),
      '1min': t("1 minute"),
      '5min': t("5 minutes"),
      '10min': t("10 minutes"),
      '15min': t("15 minutes"),
      '20min': t("20 minutes"),
      '30min': t("30 minutes"),
      '1hour': t("1 hour"),
      '2hours': t("2 hours"),
    };
    return labelMap;
  }, [t]);

  const overdueToleranceOptions: { value: OverdueTolerance; label: string; milliseconds: number }[] = useMemo(() => [
    { value: 'no_tolerance', label: t("No tolerance"), milliseconds: 0 },
    { value: '5min', label: t("5 min"), milliseconds: 5 * 60 * 1000 },
    { value: '15min', label: t("15 min"), milliseconds: 15 * 60 * 1000 },
    { value: '30min', label: t("30 min"), milliseconds: 30 * 60 * 1000 },
    { value: '1h', label: t("1 hour"), milliseconds: 60 * 60 * 1000 },
    { value: '2h', label: t("2 hours"), milliseconds: 2 * 60 * 60 * 1000 },
    { value: '4h', label: t("4 hours"), milliseconds: 4 * 60 * 60 * 1000 },
    { value: '6h', label: t("6 hours"), milliseconds: 6 * 60 * 60 * 1000 },
    { value: '12h', label: t("12 hours"), milliseconds: 12 * 60 * 60 * 1000 },
    { value: '1d', label: t("1 day"), milliseconds: 24 * 60 * 60 * 1000 },
  ], [t]);

  // Create lookup map from the options array
  const toleranceByValue = Object.fromEntries(
    overdueToleranceOptions.map(option => [option.value, option.milliseconds])
  );

  // Column configuration for sorting
  const columnConfig = {
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    backupName: { type: 'text' as keyof typeof sortFunctions, path: 'backupName' },
    overdueBackupCheckEnabled: { type: 'text' as keyof typeof sortFunctions, path: 'overdueBackupCheckEnabled' },
    displayInterval: { type: 'number' as keyof typeof sortFunctions, path: 'displayInterval' },
    displayUnit: { type: 'text' as keyof typeof sortFunctions, path: 'displayUnit' },
    nextRunDate: { type: 'text' as keyof typeof sortFunctions, path: 'nextRunDate' },
  };

  useEffect(() => {
    // Don't reinitialize if we're in the middle of saving to prevent overwriting local changes
    if (isSavingInProgress) return;
    
    if (config) {
      // Initialize settings from config
      if (config.backupSettings && Object.keys(config.backupSettings).length > 0) {
        setSettings(config.backupSettings);
      }
      
      // Initialize other settings from config
      
      if (config.notificationFrequency) {
        setNotificationFrequency(config.notificationFrequency);
      }
      
      // Initialize cron interval from config
      if (config.cronConfig) {
        const entry = Object.entries(cronIntervalMap).find(([, value]) => 
          value.expression === config.cronConfig.cronExpression && value.enabled === config.cronConfig.enabled
        );
        setCronIntervalState(entry ? entry[0] as CronInterval : defaultCronInterval);
      }
    }
  }, [config, isSavingInProgress]);

  // Calculate overdue tolerance in milliseconds when config changes
  useEffect(() => {
    if (config?.overdue_tolerance) {
      const toleranceMs = toleranceByValue[config.overdue_tolerance] || 0;
      setOverdueToleranceMs(toleranceMs);
    } else {
      setOverdueToleranceMs(0);
    }
  }, [config?.overdue_tolerance, toleranceByValue]);

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
  }, [config?.serversWithBackups, settings, isSavingInProgress]);

  // Override Table component's wrapper div overflow to allow parent scrolling
  useEffect(() => {
    const updateTableOverflow = () => {
      if (tableScrollContainerRef.current) {
        const tableWrapper = tableScrollContainerRef.current.querySelector('div.relative');
        if (tableWrapper instanceof HTMLElement) {
          tableWrapper.style.overflow = 'visible';
        }
      }
    };
    
    // Run immediately
    updateTableOverflow();
    
    // Also run after a short delay to catch any delayed renders
    const timeoutId = setTimeout(updateTableOverflow, 100);
    
    // Use MutationObserver to catch when table is added/updated
    const observer = new MutationObserver(updateTableOverflow);
    if (tableScrollContainerRef.current) {
      observer.observe(tableScrollContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [config?.serversWithBackups, sortConfig]);

  // Fetch last backup timestamps from database
  useEffect(() => {
    const fetchLastBackupTimestamps = async () => {
      try {
        const response = await authenticatedRequestWithRecovery('/api/backups/last-timestamps', {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          setLastBackupTimestamps(data.timestamps || {});
        }
      } catch (error) {
        console.warn('Error fetching last backup timestamps:', error instanceof Error ? error.message : String(error));
      }
    };

    if (config?.serversWithBackups && config.serversWithBackups.length > 0) {
      fetchLastBackupTimestamps();
    }
  }, [config?.serversWithBackups]);

  const updateBackupSettingById = (serverId: string, backupName: string, field: keyof BackupNotificationConfig, value: string | number | boolean | number[]) => {
    const backupKey = `${serverId}:${backupName}`;
    setSettings(prev => ({
      ...prev,
      [backupKey]: {
        ...(prev[backupKey] || { ...defaultBackupNotificationConfig }),
        [field]: value,
      },
    }));
  };

  const getBackupSettingById = (serverId: string, backupName: string): BackupNotificationConfig => {
    const backupKey = `${serverId}:${backupName}`;
    return settings[backupKey] || { ...defaultBackupNotificationConfig };
  };

  const handleIntervalInputChangeById = (serverId: string, backupName: string, value: string) => {
    const inputKey = `${serverId}:${backupName}`;
    
    // Update the input value
    setInputValues(prev => ({
      ...prev,
      [inputKey]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[inputKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[inputKey];
        return newErrors;
      });
    }
    
    // For custom intervals, validate in real-time as user types
    const server = getServersWithBackupAndSettings().find(s => s.id === serverId && s.backupName === backupName);
    if (server && server.displayUnit === 'custom' && value.trim()) {
      const validation = validateIntervalString(value);
      if (!validation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [inputKey]: validation.error || t("Invalid interval format")
        }));
      }
    }
  };

  const handleIntervalBlurById = (serverId: string, backupName: string, value: string, unit: IntervalUnit) => {
    const inputKey = `${serverId}:${backupName}`;
    
    // Clear any existing validation error
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[inputKey];
      return newErrors;
    });
    
    // If the value is empty, don't update
    if (!value.trim()) return;
    
    let intervalString: string;
    
    if (unit === 'custom') {
      // For custom, validate the interval string
      const validation = validateIntervalString(value);
      if (!validation.isValid) {
        // Set validation error and don't update
        setValidationErrors(prev => ({
          ...prev,
          [inputKey]: validation.error || 'Invalid interval format'
        }));
        return;
      }
      intervalString = value;
    } else {
      // For specific units, try to parse the value as a number and create interval string
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue <= 0) {
        // Set validation error and don't update
        setValidationErrors(prev => ({
          ...prev,
          [inputKey]: t("Please enter a valid positive number")
        }));
        return;
      }
      
      const unitMap: Record<IntervalUnit, string> = {
        'Minutes': 'm',
        'Hours': 'h',
        'Days': 'D',
        'Weeks': 'W',
        'Months': 'M',
        'Years': 'Y',
        'custom': 'D'
      };
      
      try {
        intervalString = createIntervalString(numValue, unitMap[unit]);
      } catch (error) {
        // Set validation error and don't update
        setValidationErrors(prev => ({
          ...prev,
          [inputKey]: error instanceof Error ? error.message : t("Invalid interval format")
        }));
        return;
      }
    }
    
    // Update the backup setting
    updateBackupSettingById(serverId, backupName, 'expectedInterval', intervalString);
    
    // Clear the local input value since we've saved the setting
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[inputKey];
      return newValues;
    });
  };

  const handleUnitChangeById = (serverId: string, backupName: string, newUnit: IntervalUnit) => {
    const backupSetting = getBackupSettingById(serverId, backupName);
    const display = getIntervalDisplay(backupSetting.expectedInterval);
    const inputKey = `${serverId}:${backupName}`;
    
    // Store the selected unit
    setSelectedUnits(prev => ({
      ...prev,
      [inputKey]: newUnit
    }));
    
    if (newUnit === 'custom') {
      // When switching to custom, keep the current interval string as-is
      // No need to change the expectedInterval
    } else {
      // Convert to single unit format
      const unitMap: Record<IntervalUnit, string> = {
        'Minutes': 'm',
        'Hours': 'h',
        'Days': 'D',
        'Weeks': 'W',
        'Months': 'M',
        'Years': 'Y',
        'custom': 'D'
      };
      
      // Use the current display value or default to 1
      const currentValue = display.isCustom ? 1 : display.value;
      const intervalString = createIntervalString(currentValue, unitMap[newUnit]);
      updateBackupSettingById(serverId, backupName, 'expectedInterval', intervalString);
    }
    
    // Clear any local input values since the unit has changed
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[inputKey];
      return newValues;
    });
  };

  const handleWeekDayToggle = (serverId: string, backupName: string, day: number) => {
    const backupSetting = getBackupSettingById(serverId, backupName);
    const currentAllowedDays = backupSetting.allowedWeekDays || getDefaultAllowedWeekDays();
    const newAllowedDays = toggleWeekDay(currentAllowedDays, day);
    updateBackupSettingById(serverId, backupName, 'allowedWeekDays', newAllowedDays);
  };


  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Create servers with settings for sorting
  const getServersWithBackupAndSettings = (): ServerWithBackupAndSettings[] => {
    if (!config?.serversWithBackups) return [];
    
    return config.serversWithBackups.map((server: ServerWithBackup) => {
      const backupSetting = getBackupSettingById(server.id, server.backupName);
      const display = getIntervalDisplay(backupSetting.expectedInterval);
      const inputKey = `${server.id}:${server.backupName}`;
      
      // Use selected unit if available, otherwise use calculated unit
      const displayUnit = selectedUnits[inputKey] || display.unit;
      const isCustomInterval = displayUnit === 'custom' || display.isCustom;
      
      // Use the calculated expectedBackupDate from server data (calculated on server-side)
      // This is the correct next expected backup date based on lastBackupDate + interval
      const nextRunDate = server.expectedBackupDate || 'N/A';
      
      return {
        ...server,
        overdueBackupCheckEnabled: backupSetting.overdueBackupCheckEnabled,
        expectedInterval: backupSetting.expectedInterval,
        displayInterval: display.isCustom ? 0 : display.value,
        displayUnit: displayUnit,
        isCustomInterval: isCustomInterval,
        allowedWeekDays: backupSetting.allowedWeekDays || getDefaultAllowedWeekDays(),
        nextRunDate: nextRunDate,
      };
    });
  };

  // Filter servers by name, alias, and backup name
  const filteredServers = useMemo(() => {
    const servers = getServersWithBackupAndSettings();
    if (!serverFilter.trim()) return servers;
    
    const filterLower = serverFilter.toLowerCase();
    return servers.filter(server => 
      server.name.toLowerCase().includes(filterLower) ||
      (server.alias && server.alias.toLowerCase().includes(filterLower)) ||
      (server.note && server.note.toLowerCase().includes(filterLower)) ||
      server.backupName.toLowerCase().includes(filterLower)
    );
  }, [config?.serversWithBackups, settings, selectedUnits, serverFilter]);

  // Get sorted servers
  const sortedServers = createSortedArray(filteredServers, sortConfig, columnConfig);

  // Helper function to run overdue backup check
  const runOverdueBackupCheck = async () => {
    try {
      const response = await authenticatedRequestWithRecovery('/api/notifications/check-overdue', {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(t("You do not have permission to run backup checks. Only administrators can perform this action."));
        }
        const errorData = await response.json().catch(() => ({ error: t("Failed to run backup check") }));
        throw new Error(errorData.error || t("Failed to run backup check"));
      }

      const result = await response.json();
      toast({
        title: t("Backup Check Complete"),
        description: t("Checked {{checked}} backups, found {{overdue}} backups needing attention, sent {{notifications}} notifications.", {
          checked: result.statistics.checkedBackups,
          overdue: result.statistics.overdueBackupsFound,
          notifications: result.statistics.notificationsSent,
        }),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error running backup check:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Error"),
        description: t("Failed to run backup check"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleCronIntervalChange = async (value: CronInterval) => {
    try {
      // First save the configuration
      const response = await authenticatedRequestWithRecovery('/api/cron-config', {
        method: 'POST',
        body: JSON.stringify({ interval: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cron configuration');
      }

      // Update local state
      setCronIntervalState(value);

      // Try to reload the cron service configuration
      try {
        await cronClient.reloadConfig();
        toast({
          title: t("Success"),
          description: t("Backup check interval updated successfully"),
          duration: 2000,
        });
      } catch (cronError) {
        // Cron service might not be running, but the config was saved successfully
        console.warn('Cron service not available, but configuration was saved:', cronError);
        toast({
          title: t("Success"),
          description: t("Configuration saved successfully. Note: Cron service is not running - start it with 'npm run cron:start' to enable scheduled tasks."),
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to update cron interval:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Error"),
        description: t("Failed to update overdue backup check interval"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSavingInProgress(true);
    try {
      // Only save backup settings (server-level overdue monitoring enabled/disabled)
      // Overdue tolerance, monitoring interval, and notification frequency are auto-saved
      const backupResponse = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
        method: 'POST',
        body: JSON.stringify({
          backupSettings: settings
        }),
      });
      
      if (!backupResponse.ok) {
        if (backupResponse.status === 403) {
          throw new Error(t("You do not have permission to modify this setting. Only administrators can change configurations."));
        }
        const errorData = await backupResponse.json().catch(() => ({ error: t("Failed to save backup monitoring settings") }));
        throw new Error(errorData.error || t("Failed to save backup monitoring settings"));
      }
      
      // Dispatch custom event to notify other components about configuration change
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
      
      toast({
        title: t("Success"),
        description: t("Backup monitoring settings saved successfully"),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving settings:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Error"),
        description: t("Failed to save backup monitoring settings"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
      setIsSavingInProgress(false);
    }
  };

  const handleTestOverdueBackups = async () => {
    setIsTesting(true);
    try {
      // Only save backup settings (server-level overdue monitoring enabled/disabled)
      // Overdue tolerance, monitoring interval, and notification frequency are auto-saved
      const backupResponse = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
        method: 'POST',
        body: JSON.stringify({
          backupSettings: settings
        }),
      });
      
      if (!backupResponse.ok) {
        throw new Error(t("Failed to save backup monitoring settings"));
      }
      
      // Dispatch custom event to notify other components about configuration change
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
      
      // Run the overdue backup check
      const response = await authenticatedRequestWithRecovery('/api/notifications/check-overdue', {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(t("You do not have permission to run backup checks. Only administrators can perform this action."));
        }
        const errorData = await response.json().catch(() => ({ error: t("Failed to run backup check") }));
        throw new Error(errorData.error || t("Failed to run backup check"));
      }

      const result = await response.json();
      toast({
        title: t("Backup Check Complete"),
        description: t("Checked {{checked}} backups, found {{overdue}} backups needing attention, sent {{notifications}} notifications.", {
          checked: result.statistics.checkedBackups,
          overdue: result.statistics.overdueBackupsFound,
          notifications: result.statistics.notificationsSent,
        }),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error running backup check:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Error"),
        description: t("Failed to run backup check"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleNotificationFrequencyChange = async (value: NotificationFrequencyConfig) => {
    setNotificationFrequencyLoading(true);
    setNotificationFrequencyError(null);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/notifications', {
        method: 'POST',
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update notification frequency');
      setNotificationFrequency(value);
      toast({ title: t("Success"), description: t("Notification frequency updated."), duration: 2000 });
    } catch {
      setNotificationFrequencyError(t("Failed to update notification frequency"));
      toast({ title: t("Error"), description: t("Failed to update notification frequency"), variant: 'destructive', duration: 3000 });
    } finally {
      setNotificationFrequencyLoading(false);
    }
  };

  const handleOverdueToleranceChange = async (value: OverdueTolerance) => {
    try {
      // Optimistically update the UI immediately
      updateConfig({ overdue_tolerance: value });
      
      // Save to the database using the dedicated API endpoint
      const response = await authenticatedRequestWithRecovery('/api/configuration/overdue-tolerance', {
        method: 'POST',
        body: JSON.stringify({ overdue_tolerance: value }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update overdue tolerance');
      }
      
      toast({
        title: t("Success"),
        description: t("Backup tolerance updated successfully."),
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to update backup tolerance:', error instanceof Error ? error.message : String(error));
      // Revert the optimistic update on error by refreshing from server
      await refreshConfigSilently();
      toast({
        title: t("Error"),
        description: t("Failed to update backup tolerance"),
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  const handleResetNotifications = async () => {
    setIsResetting(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/notifications/clear-overdue-timestamps', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset backup notifications');
      }

      toast({
        title: t("Success"),
        description: t("Backup notifications have been reset"),
        duration: 2000,
      });

      // Run backup check after resetting timers to ensure fresh state
      await runOverdueBackupCheck();
    } catch (error) {
      console.error('Error resetting backup notifications:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Error"),
        description: t("Failed to reset backup notifications"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      // Fetch last backup timestamps from the database
      let lastBackupTimestamps: Record<string, string> = {};
      try {
        const response = await authenticatedRequestWithRecovery('/api/backups/last-timestamps', {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          lastBackupTimestamps = data.timestamps || {};
        } else {
          console.warn('Failed to fetch last backup timestamps, continuing without them');
        }
      } catch (error) {
        console.warn('Error fetching last backup timestamps, continuing without them:', error instanceof Error ? error.message : String(error));
      }

      // Capture current time at the moment of CSV generation
      const csvGenerationTime = new Date();
      
      // Prepare CSV headers
      const headers = [
        t("CSV Generated At"),
        t("Server Name"),
        t("Server ID"),
        t("Backup Name"),
        t("Last Backup (cfg)"),
        t("Last Backup (cfg) Weekday"),
        t("Last Backup (DB)"),
        t("Next Run"),
        t("Next Run Weekday"),
        t("Needs Attention"),
        t("Monitoring Enabled"),
        t("Expected Interval"),
        t("Allowed Weekdays")
      ];

      // Prepare CSV rows
      const rows = sortedServers.map(server => {
        const backupSetting = getBackupSettingById(server.id, server.backupName);
        const nextRunDate = server.nextRunDate !== 'N/A' ? new Date(server.nextRunDate) : null;
        const lastBackupDate = backupSetting.lastBackupDate ? new Date(backupSetting.lastBackupDate) : null;
        
        // Get last backup timestamp from database
        const backupKey = `${server.id}:${server.backupName}`;
        const lastBackupTimestampDB = lastBackupTimestamps[backupKey] || 'N/A';
        const lastBackupTimestampDBDate = lastBackupTimestampDB !== 'N/A' ? new Date(lastBackupTimestampDB) : null;
        
        // Determine if overdue using the CSV generation time
        const isOverdue = nextRunDate && backupSetting.overdueBackupCheckEnabled
          ? new Date(nextRunDate.getTime() + overdueToleranceMs) < csvGenerationTime
          : false;
        
        // Format allowed weekdays using English names for CSV export (consistent format)
        // But order them according to locale (e.g., Monday-Sunday for UK, Sunday-Saturday for US)
        const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const allowedWeekDaysArray = backupSetting.allowedWeekDays || getDefaultAllowedWeekDays();
        
        // Sort allowed weekdays according to locale order (localeWeekDays is already ordered by locale)
        const localeOrderedDays = localeWeekDays.map(wd => wd.dayNumber);
        const allowedWeekdays = allowedWeekDaysArray
          .sort((a, b) => {
            const indexA = localeOrderedDays.indexOf(a);
            const indexB = localeOrderedDays.indexOf(b);
            return indexA - indexB;
          })
          .map(day => weekdayNames[day])
          .join('; ');

        // Get weekday names for dates (using English names)
        const lastBackupWeekday = lastBackupDate ? weekdayNames[lastBackupDate.getDay()] : 'N/A';
        const nextRunWeekday = nextRunDate ? weekdayNames[nextRunDate.getDay()] : 'N/A';

        return [
          csvGenerationTime.toISOString(),
          server.alias || server.name,
          server.id,
          server.backupName,
          lastBackupDate ? lastBackupDate.toISOString() : 'N/A',
          lastBackupWeekday,
          lastBackupTimestampDB !== 'N/A' ? lastBackupTimestampDB : 'N/A',
          nextRunDate ? nextRunDate.toISOString() : 'N/A',
          nextRunWeekday,
          isOverdue ? 'Yes' : 'No',
          backupSetting.overdueBackupCheckEnabled ? 'Yes' : 'No',
          backupSetting.expectedInterval,
          allowedWeekdays
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape cells containing commas, quotes, or newlines
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `backup-monitoring-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: t("Success"),
        description: t("CSV file downloaded successfully"),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error generating CSV:', error instanceof Error ? error.message : String(error));
      toast({
        title: t("Error"),
        description: t("Failed to generate CSV file"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };


  const handleAutoCollectStart = (serverId: string) => {
    setAutoCollectingServers(prev => new Set(prev).add(serverId));
  };

  const handleAutoCollectEnd = (serverId: string) => {
    setAutoCollectingServers(prev => {
      const newSet = new Set(prev);
      newSet.delete(serverId);
      return newSet;
    });
  };



  // Helper function to determine if a date is in the future or past considering overdue tolerance
  const getNextRunDateStyle = (nextRunDate: string, overdueBackupCheckEnabled: boolean): string => {
    if (nextRunDate === 'N/A') {
      return 'text-muted-foreground';
    }
    
    // If overdue backup monitoring is disabled, use foreground text
    if (!overdueBackupCheckEnabled) {
      return 'text-muted-foreground';
    }
    
    const date = new Date(nextRunDate);
    const now = new Date();
    
    // Add tolerance to the current time to determine if the date is still "acceptable"
    const dateWithTolerance =  new Date(date.getTime() + overdueToleranceMs);
    
    if (dateWithTolerance >= now  ) {
      return 'text-green-600'; // Future date (within tolerance) - green
    } else {
      return 'text-red-600'; // Past date (beyond tolerance) - red
    }
  };

  if (!config?.serversWithBackups || config.serversWithBackups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup Monitoring</CardTitle>
          <CardDescription>No servers with backups found in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No servers with backups have been registered yet. Add some backup data first to see backup monitoring settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle>{t("Configure Backup Monitoring")}</CardTitle>
          <CardDescription>
            {t("Configure monitoring settings for each backup. Enable/disable backup monitoring, set the timeout period and notification frequency.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Input */}
          <div className="mb-4">
            <ServerFilterInput
              value={serverFilter}
              onChange={setServerFilter}
              placeholder={t("Filter by server name, alias, or backup name...")}
            />
          </div>
            
          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-md">
            <div 
              ref={tableScrollContainerRef}
              className="max-h-[calc(100vh-400px)] overflow-y-auto overflow-x-auto table-horizontal-scrollbar [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
            >
              <div className="[&>div]:overflow-visible">
                <Table>
              <TableHeader className="sticky top-0 z-20 bg-muted border-b-2 border-border shadow-sm">
              <TableRow className="bg-muted">
                <SortableTableHead 
                  className="w-[120px] min-w-[100px]" 
                  column="name" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  {t("Server Name")}
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[120px] min-w-[90px]" 
                  column="backupName" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  {t("Backup Name")}
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[140px] min-w-[120px]" 
                  column="nextRunDate" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  {t("Next Run")}
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[130px] min-w-[110px]" 
                  column="overdueBackupCheckEnabled" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  {t("Backup Monitoring")}
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[120px] min-w-[100px]" 
                  column="displayInterval" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  {t("Expected Backup Interval")}
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[80px] min-w-[60px]" 
                  column="displayUnit" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  {t("Unit")}
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[200px] min-w-[180px]" 
                  column="allowedWeekDays" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  {t("Allowed Days")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-screenshot-target="settings-overdue-monitoring-table">
              {sortedServers.map((server) => {
                const backupSetting = getBackupSettingById(server.id, server.backupName);
                const inputKey = `${server.id}:${server.backupName}`;
                
                return (
                  <TableRow key={`${server.id}-${server.backupName}`}>
                    {/* Server name - Table */}
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          <div className="flex items-center gap-0.5">
                            <ServerConfigurationButton
                              serverUrl={server.server_url}
                              serverName={server.name}
                              serverAlias={server.alias}
                              size="sm"
                              variant="ghost"
                              className="text-xs hover:text-blue-500 transition-colors h-6 w-6 p-0"
                              showText={false}
                            />
                            <BackupCollectMenu
                              preFilledServerUrl={server.server_url}
                              preFilledServerName={server.alias || server.name}
                              preFilledServerId={server.id}
                              size="sm"
                              variant="ghost"
                              className={`text-xs transition-colors h-6 w-6 p-0 ${autoCollectingServers.has(server.id) ? 'cursor-wait' : ''} ${server.hasPassword ? 'text-blue-500 hover:text-blue-600' : 'hover:text-blue-500'}`}
                              showText={false}
                              autoCollect={Boolean(server.hasPassword && server.server_url && server.server_url.trim() !== '')}
                              onAutoCollectStart={() => handleAutoCollectStart(server.id)}
                              onAutoCollectEnd={() => handleAutoCollectEnd(server.id)}
                            />
                            <div className="flex flex-col ml-1">
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
                    </TableCell>
                    {/* Backup Name - Table */}
                    <TableCell>
                      <div>
                        <Link 
                          href={`/detail/${server.id}?backup=${encodeURIComponent(server.backupName)}`}
                          className="font-medium text-sm truncate  hover:underline transition-colors"
                        >
                          {server.backupName}
                        </Link>
                      </div>
                    </TableCell>
                    {/* Next Run - Table */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`text-xs p-1 ${getNextRunDateStyle(server.nextRunDate, backupSetting.overdueBackupCheckEnabled)}`}
                            >
                              {server.nextRunDate !== 'N/A' ? 
                                <>
                                  {formatDateTime(server.nextRunDate, locale)}
                                  <br />
                                  {formatRelativeTime(server.nextRunDate, undefined, locale)}
                                </>
                               : 
                                t("Not set")
                              }
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-semibold mb-1">{t("Last Backup:")}</div>
                              {(() => {
                                const backupKey = `${server.id}:${server.backupName}`;
                                const lastBackupTimestamp = lastBackupTimestamps[backupKey];
                                if (lastBackupTimestamp) {
                                  return (
                                    <>
                                      {formatDateTime(lastBackupTimestamp, locale)}
                                      <br />
                                      {formatRelativeTime(lastBackupTimestamp, undefined, locale)}
                                    </>
                                  );
                                }
                                return 'N/A';
                              })()}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    {/* Backup Monitoring - Table */}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Switch
                          id={`backup-monitoring-${inputKey}`}
                          checked={backupSetting.overdueBackupCheckEnabled}
                          onCheckedChange={(checked) =>
                            updateBackupSettingById(server.id, server.backupName, 'overdueBackupCheckEnabled', checked)
                          }
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <Label htmlFor={`backup-monitoring-${inputKey}`} className="text-xs">
                          {backupSetting.overdueBackupCheckEnabled ? t("Enabled") : t("Disabled")}
                        </Label>
                      </div>
                    </TableCell>
                    {/* Expected Backup Interval - Table */}
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          type="text"
                          value={inputValues[inputKey] ?? (server.isCustomInterval ? server.expectedInterval : server.displayInterval.toString())}
                          onChange={(e) => handleIntervalInputChangeById(server.id, server.backupName, e.target.value)}
                          onBlur={(e) => handleIntervalBlurById(server.id, server.backupName, e.target.value, server.displayUnit)}
                          placeholder={server.isCustomInterval ? t("1D2h30m") : "1"}
                          disabled={!backupSetting.overdueBackupCheckEnabled}
                          className={`text-xs ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''} ${validationErrors[inputKey] ? 'border-red-500' : ''}`}
                        />
                        {validationErrors[inputKey] && (
                          <p className="text-xs text-red-500">{validationErrors[inputKey]}</p>
                        )}
                      </div>
                    </TableCell>
                    {/* Unit - Table */}
                    <TableCell>
                      <Select
                        value={server.displayUnit}
                        onValueChange={(value: IntervalUnit) => handleUnitChangeById(server.id, server.backupName, value)}
                        disabled={!backupSetting.overdueBackupCheckEnabled}
                      >
                        <SelectTrigger className={`w-full text-xs ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}>
                          <SelectValue placeholder={server.displayUnit} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">{t("Custom")}</SelectItem>
                          <SelectItem value="Minutes">{t("Minute(s)")}</SelectItem>
                          <SelectItem value="Hours">{t("Hour(s)")}</SelectItem>
                          <SelectItem value="Days">{t("Day(s)")}</SelectItem>
                          <SelectItem value="Weeks">{t("Week(s)")}</SelectItem>
                          <SelectItem value="Months">{t("Month(s)")}</SelectItem>
                          <SelectItem value="Years">{t("Year(s)")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {/* Allowed Days - Table */}
                    <TableCell>
                      <div className="flex gap-1">
                        {localeWeekDays.map((weekDay) => (
                          <Button
                            key={weekDay.dayNumber}
                            variant={isWeekDayAllowed(server.allowedWeekDays, weekDay.dayNumber) ? "default" : "outline"}
                            size="sm"
                            className={`text-xs px-2 py-1 h-6 min-w-8 ${!backupSetting.overdueBackupCheckEnabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                              isWeekDayAllowed(server.allowedWeekDays, weekDay.dayNumber) 
                                ? 'bg-blue-800 hover:bg-blue-600 text-white border-blue-800' 
                                : 'border-gray-800 text-gray-600 hover:bg-blue-400'
                            }`}
                            onClick={() => handleWeekDayToggle(server.id, server.backupName, weekDay.dayNumber)}
                            disabled={!backupSetting.overdueBackupCheckEnabled}
                          >
                            {weekDay.shortName}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
              </Table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {sortedServers.map((server) => {
              const backupSetting = getBackupSettingById(server.id, server.backupName);
              const inputKey = `${server.id}:${server.backupName}`;
              
              return (
                <Card key={`${server.id}-${server.backupName}`} className="p-4">
                  <div className="space-y-3">
                    {/* Header with Server and Backup Name - Card */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0">
                        <ServerConfigurationButton
                          serverUrl={server.server_url}
                          serverName={server.name}
                          serverAlias={server.alias}
                          size="sm"
                          variant="ghost"
                          className="text-xs hover:text-blue-500 transition-colors h-6 w-6 p-0"
                          showText={false}
                        />
                        <BackupCollectMenu
                          preFilledServerUrl={server.server_url}
                          preFilledServerName={server.alias || server.name}
                          preFilledServerId={server.id}
                          size="sm"
                          variant="ghost"
                          className={`text-xs transition-colors h-6 w-6 p-0 ${autoCollectingServers.has(server.id) ? 'cursor-wait' : ''} ${server.hasPassword ? 'text-blue-500 hover:text-blue-600' : 'hover:text-blue-500'}`}
                          showText={false}
                          autoCollect={Boolean(server.hasPassword && server.server_url && server.server_url.trim() !== '')}
                          onAutoCollectStart={() => handleAutoCollectStart(server.id)}
                          onAutoCollectEnd={() => handleAutoCollectEnd(server.id)}
                        />
                        <div className="ml-1">
                          <div 
                            className="font-medium text-sm" 
                            title={server.alias ? server.name : undefined}
                          >
                            {server.alias || server.name}
                          </div>
                          <Link 
                            href={`/detail/${server.id}?backup=${encodeURIComponent(server.backupName)}`}
                            className="text-xs hover:underline transition-colors"
                          >
                            {server.backupName}
                          </Link>
                          {server.note && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {server.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Next Run - Card */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">{t("Next Run")}</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`text-xs p-1 rounded ${getNextRunDateStyle(server.nextRunDate, backupSetting.overdueBackupCheckEnabled)}`}
                            >
                              {server.nextRunDate !== 'N/A' ?
                                 formatDateTime(server.nextRunDate, locale)+` (${formatRelativeTime(server.nextRunDate, undefined, locale)})` :
                                'Not set'
                              }
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-semibold mb-1">{t("Last Backup:")}</div>
                              {(() => {
                                const backupKey = `${server.id}:${server.backupName}`;
                                const lastBackupTimestamp = lastBackupTimestamps[backupKey];
                                if (lastBackupTimestamp) {
                                  return (
                                    <>
                                      {formatDateTime(lastBackupTimestamp, locale)}
                                      <br />
                                      {formatRelativeTime(lastBackupTimestamp, undefined, locale)}
                                    </>
                                  );
                                }
                                return 'N/A';
                              })()}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Backup Monitoring */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Backup Monitoring</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`backup-monitoring-mobile-${inputKey}`}
                          checked={backupSetting.overdueBackupCheckEnabled}
                          onCheckedChange={(checked) =>
                            updateBackupSettingById(server.id, server.backupName, 'overdueBackupCheckEnabled', checked)
                          }
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <Label htmlFor={`backup-monitoring-mobile-${inputKey}`} className="text-xs">
                          {backupSetting.overdueBackupCheckEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                    </div>
                    
                    {/* Expected Backup Interval - Card */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Expected Backup Interval</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={inputValues[inputKey] ?? (server.isCustomInterval ? server.expectedInterval : server.displayInterval.toString())}
                          onChange={(e) => handleIntervalInputChangeById(server.id, server.backupName, e.target.value)}
                          onBlur={(e) => handleIntervalBlurById(server.id, server.backupName, e.target.value, server.displayUnit)}
                          placeholder={server.isCustomInterval ? "1D2h30m" : "1"}
                          disabled={!backupSetting.overdueBackupCheckEnabled}
                          className={`text-xs flex-1 ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''} ${validationErrors[inputKey] ? 'border-red-500' : ''}`}
                        />
                        <Select
                          value={server.displayUnit}
                          onValueChange={(value: IntervalUnit) => handleUnitChangeById(server.id, server.backupName, value)}
                          disabled={!backupSetting.overdueBackupCheckEnabled}
                        >
                          <SelectTrigger className={`w-20 text-xs ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}>
                            <SelectValue placeholder={server.displayUnit} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="Minutes">Min(s)</SelectItem>
                            <SelectItem value="Hours">Hour(s)</SelectItem>
                            <SelectItem value="Days">Day(s)</SelectItem>
                            <SelectItem value="Weeks">Week(s)</SelectItem>
                            <SelectItem value="Months">Month(s)</SelectItem>
                            <SelectItem value="Years">Year(s)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {validationErrors[inputKey] && (
                        <p className="text-xs text-red-500">{validationErrors[inputKey]}</p>
                      )}
                    </div>
                    
                    {/* Allowed Days - Card */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">{t("Allowed Days")}</Label>
                      <div className="flex gap-1 flex-wrap">
                        {localeWeekDays.map((weekDay) => (
                          <Button
                            key={weekDay.dayNumber}
                            variant={isWeekDayAllowed(server.allowedWeekDays, weekDay.dayNumber) ? "default" : "outline"}
                            size="sm"
                            className={`text-xs px-2 py-1 h-6 min-w-8 ${!backupSetting.overdueBackupCheckEnabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                              isWeekDayAllowed(server.allowedWeekDays, weekDay.dayNumber) 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                                : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                            }`}
                            onClick={() => handleWeekDayToggle(server.id, server.backupName, weekDay.dayNumber)}
                            disabled={!backupSetting.overdueBackupCheckEnabled}
                          >
                            {weekDay.shortName}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="flex flex-col gap-6 pt-6 w-full flex-shrink-0">
            {/* Save button, Collect All button, Check now, and Reset Notifications */}
            <div className="flex gap-3 justify-between items-center flex-wrap">
              <div className="flex gap-3">
                <Button onClick={() => {
                  handleSave();
                }} disabled={isSaving} variant="gradient">
                  {isSaving ? t("Saving...") : t("Save Backup Monitoring Settings")}
                </Button>
                <CollectAllButton
                  servers={(() => {
                    // Deduplicate servers by ID to avoid multiple collections for the same server
                    const servers = config?.serversWithBackups || [];
                    const uniqueServers = servers.reduce((acc: ServerWithBackup[], server: ServerWithBackup) => {
                      if (!acc.find(s => s.id === server.id)) {
                        acc.push({
                          id: server.id,
                          name: server.name,
                          server_url: server.server_url,
                          alias: server.alias,
                          note: server.note,
                          hasPassword: server.hasPassword,
                          backupName: server.backupName
                        });
                      }
                      return acc;
                    }, []);
                    return uniqueServers;
                  })()}
                  variant="outline"
                  showText={true}
                  disabled={isSaving}
                  onCollectionStart={(showInstructionToast) => {
                    if (showInstructionToast) {
                      toast({
                        title: t("Starting Collection"),
                        description: t("Collecting backup logs from all configured servers..."),
                        duration: 4000,
                      });
                    }
                  }}
                  onCollectionEnd={() => {
                    // Collection completed, toast will be shown by the component
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDownloadCSV}
                  variant="outline"
                  size="sm"
                  title={t("Download backup monitoring data as CSV")}
                >
                  <Download className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">{t("Download CSV")}</span>
                  <span className="sm:hidden">{t("CSV")}</span>
                </Button>
                <Button 
                  onClick={handleTestOverdueBackups} 
                  variant="outline" 
                  disabled={isTesting}
                  size="sm"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">{isTesting ? t("Checking...") : t("Check now")}</span>
                  <span className="sm:hidden">{isTesting ? "..." : t("Check")}</span>
                </Button>
                <Button 
                  onClick={handleResetNotifications}
                  variant="outline"
                  disabled={isResetting}
                  size="sm"
                >
                  <TimerReset className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">{isResetting ? t("Resetting...") : t("Reset notifications")}</span>
                  <span className="sm:hidden">{isResetting ? "..." : t("Reset notifications")}</span>
                </Button>
              </div>
            </div>

            {/* Controls grid - responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <Label htmlFor="backup-tolerance" className="mb-2 text-sm">
                  <span className="hidden sm:inline">{t("Backup tolerance:")}</span>
                  <span className="sm:hidden">{t("Tolerance:")}</span>
                </Label>
                <Select
                  value={config?.overdue_tolerance || defaultOverdueTolerance}
                  onValueChange={(value: OverdueTolerance) => handleOverdueToleranceChange(value)}
                >
                  <SelectTrigger id="backup-tolerance" className="w-full">
                    <SelectValue placeholder={t("Select tolerance")} />
                  </SelectTrigger>
                  <SelectContent>
                    {overdueToleranceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col">
                <Label htmlFor="cron-interval" className="mb-2 text-sm">
                  <span className="hidden lg:inline">{t("Backup monitoring interval:")}</span>
                  <span className="lg:hidden hidden sm:inline">{t("Monitoring interval:")}</span>
                  <span className="sm:hidden">{t("Interval:")}</span>
                </Label>
                <Select
                  value={cronInterval}
                  onValueChange={(value: CronInterval) => handleCronIntervalChange(value)}
                >
                  <SelectTrigger id="cron-interval" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(cronIntervalMap).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {translatedCronIntervalMap[value as CronInterval]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col">
                <Label htmlFor="notification-frequency" className="mb-2 text-sm">
                  <span className="hidden lg:inline">{t("Notification frequency:")}</span>
                  <span className="lg:hidden hidden sm:inline">{t("Notification freq:")}</span>
                  <span className="sm:hidden">{t("Frequency:")}</span>
                </Label>
                <Select
                  value={notificationFrequency}
                  onValueChange={(value: NotificationFrequencyConfig) => handleNotificationFrequencyChange(value)}
                  disabled={notificationFrequencyLoading}
                >
                  <SelectTrigger id="notification-frequency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationFrequencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {notificationFrequencyLoading && <span className="text-xs text-muted-foreground mt-1">{t("Loading...")}</span>}
                {notificationFrequencyError && <span className="text-xs text-destructive mt-1">{notificationFrequencyError}</span>}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
