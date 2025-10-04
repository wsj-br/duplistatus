"use client";

import { useState, useEffect } from 'react';
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
import { BackupNotificationConfig, BackupKey, CronInterval, NotificationFrequencyConfig, OverdueTolerance } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { cronClient } from '@/lib/cron-client';
import { cronIntervalMap } from '@/lib/cron-interval-map';
import { defaultBackupNotificationConfig, defaultNotificationFrequencyConfig, defaultOverdueTolerance, defaultCronInterval } from '@/lib/default-config';
import { RefreshCw, TimerReset } from "lucide-react";
import { ServerConfigurationButton } from '../ui/server-configuration-button';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { BackupCollectMenu } from '../backup-collect-menu';
import { CollectAllButton } from '../ui/collect-all-button';
import Link from 'next/link';
import { 
  getIntervalDisplay, 
  createIntervalString, 
  validateIntervalString,
  IntervalUnit,
  getDefaultAllowedWeekDays,
  toggleWeekDay,
  isWeekDayAllowed
} from '@/lib/interval-utils';


// Use the ServerWithBackup interface from the configuration context

interface OverdueMonitoringFormProps {
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

export function OverdueMonitoringForm({ backupSettings }: OverdueMonitoringFormProps) {
  const { toast } = useToast();
  const { config, refreshConfigSilently, updateConfig } = useConfiguration();
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

  const notificationFrequencyOptions: { value: NotificationFrequencyConfig; label: string }[] = [
    { value: 'onetime', label: 'One time' },
    { value: 'every_day', label: 'Every day' },
    { value: 'every_week', label: 'Every week' },
    { value: 'every_month', label: 'Every month' },
  ];

  const overdueToleranceOptions: { value: OverdueTolerance; label: string; milliseconds: number }[] = [
    { value: 'no_tolerance', label: 'No tolerance', milliseconds: 0 },
    { value: '5min', label: '5 min', milliseconds: 5 * 60 * 1000 },
    { value: '15min', label: '15 min', milliseconds: 15 * 60 * 1000 },
    { value: '30min', label: '30 min', milliseconds: 30 * 60 * 1000 },
    { value: '1h', label: '1 hour', milliseconds: 60 * 60 * 1000 },
    { value: '2h', label: '2 hours', milliseconds: 2 * 60 * 60 * 1000 },
    { value: '4h', label: '4 hours', milliseconds: 4 * 60 * 60 * 1000 },
    { value: '6h', label: '6 hours', milliseconds: 6 * 60 * 60 * 1000 },
    { value: '12h', label: '12 hours', milliseconds: 12 * 60 * 60 * 1000 },
    { value: '1d', label: '1 day', milliseconds: 24 * 60 * 60 * 1000 },
  ];

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
          [inputKey]: validation.error || 'Invalid interval format'
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
          [inputKey]: 'Please enter a valid positive number'
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
          [inputKey]: error instanceof Error ? error.message : 'Invalid interval format'
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
      
      // Use the backup settings time field
      const nextRunDate = backupSetting.time || 'N/A';
      
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

  // Get sorted servers
  const sortedServers = createSortedArray(getServersWithBackupAndSettings(), sortConfig, columnConfig);

  // Helper function to run overdue backup check
  const runOverdueBackupCheck = async () => {
    try {
      const response = await authenticatedRequestWithRecovery('/api/notifications/check-overdue', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run overdue backup check');
      }

      const result = await response.json();
      toast({
        title: "Overdue Backup Check Complete",
        description: `Checked ${result.statistics.checkedBackups} backups, found ${result.statistics.overdueBackupsFound} overdue backups, sent ${result.statistics.notificationsSent} notifications.`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error running overdue backup check:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to run overdue backup check",
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
          title: "Success",
          description: "Overdue backup check interval updated successfully",
          duration: 2000,
        });
      } catch (cronError) {
        // Cron service might not be running, but the config was saved successfully
        console.warn('Cron service not available, but configuration was saved:', cronError);
        toast({
          title: "Success",
          description: "Configuration saved successfully. Note: Cron service is not running - start it with 'npm run cron:start' to enable scheduled tasks.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to update cron interval:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to update overdue backup check interval",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSavingInProgress(true);
    try {
      // Save backup settings using the dedicated endpoint
      const backupResponse = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
        method: 'POST',
        body: JSON.stringify({
          backupSettings: settings
        }),
      });
      
      if (!backupResponse.ok) {
        throw new Error('Failed to save backup settings');
      }
      
      // Save overdue tolerance using the dedicated endpoint
      const toleranceResponse = await authenticatedRequestWithRecovery('/api/configuration/overdue-tolerance', {
        method: 'POST',
        body: JSON.stringify({ overdue_tolerance: config?.overdue_tolerance || defaultOverdueTolerance }),
      });
      
      if (!toleranceResponse.ok) {
        throw new Error('Failed to save overdue tolerance');
      }
      
      // Dispatch custom event to notify other components about configuration change
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
      
      toast({
        title: "Success",
        description: "Overdue monitoring settings saved successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving settings:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to save overdue monitoring settings",
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
      // Save backup settings using the dedicated endpoint
      const backupResponse = await authenticatedRequestWithRecovery('/api/configuration/backup-settings', {
        method: 'POST',
        body: JSON.stringify({
          backupSettings: settings
        }),
      });
      
      if (!backupResponse.ok) {
        throw new Error('Failed to save backup settings');
      }
      
      // Save overdue tolerance using the dedicated endpoint
      const toleranceResponse = await authenticatedRequestWithRecovery('/api/configuration/overdue-tolerance', {
        method: 'POST',
        body: JSON.stringify({ overdue_tolerance: config?.overdue_tolerance || defaultOverdueTolerance }),
      });
      
      if (!toleranceResponse.ok) {
        throw new Error('Failed to save overdue tolerance');
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
        throw new Error('Failed to run overdue backup check');
      }

      const result = await response.json();
      toast({
        title: "Overdue Backup Check Complete",
        description: `Checked ${result.statistics.checkedBackups} backups, found ${result.statistics.overdueBackupsFound} overdue backups, sent ${result.statistics.notificationsSent} notifications.`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error running overdue backup check:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to run overdue backup check",
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
      toast({ title: 'Success', description: 'Notification frequency updated.', duration: 2000 });
    } catch {
      setNotificationFrequencyError('Failed to update notification frequency');
      toast({ title: 'Error', description: 'Failed to update notification frequency', variant: 'destructive', duration: 3000 });
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
        title: 'Success', 
        description: 'Overdue tolerance updated successfully.', 
        duration: 2000 
      });
    } catch (error) {
      console.error('Failed to update overdue tolerance:', error instanceof Error ? error.message : String(error));
      // Revert the optimistic update on error by refreshing from server
      await refreshConfigSilently();
      toast({ 
        title: 'Error', 
        description: 'Failed to update overdue tolerance', 
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
        throw new Error('Failed to reset overdue backup notifications');
      }

      toast({
        title: "Success",
        description: "Overdue backup notifications have been reset",
        duration: 2000,
      });
      
      // Run overdue backup check after resetting timers to ensure fresh state
      await runOverdueBackupCheck();
    } catch (error) {
      console.error('Error resetting overdue backup notifications:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to reset overdue backup notifications",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsResetting(false);
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
          <CardTitle>Overdue Monitoring</CardTitle>
          <CardDescription>No servers with backups found in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No servers with backups have been registered yet. Add some backup data first to see overdue monitoring settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Overdue Monitoring</CardTitle>
          <CardDescription>
             Configure overdue backup monitoring settings for each backup. 
             Enable/disable overdue backup monitoring, set the timeout period and notification frequency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead 
                  className="w-[150px] min-w-[120px]" 
                  column="name" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Server Name
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[150px] min-w-[120px]" 
                  column="backupName" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Backup Name
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[150px] min-w-[120px]" 
                  column="nextRunDate" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Next Run
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[140px] min-w-[120px]" 
                  column="overdueBackupCheckEnabled" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Overdue Backup Monitoring
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[120px] min-w-[100px]" 
                  column="displayInterval" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Expected Backup Interval
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[80px] min-w-[60px]" 
                  column="displayUnit" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Unit
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[200px] min-w-[180px]" 
                  column="allowedWeekDays" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Allowed Days
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServers.map((server) => {
                const backupSetting = getBackupSettingById(server.id, server.backupName);
                const inputKey = `${server.id}:${server.backupName}`;
                
                return (
                  <TableRow key={`${server.id}-${server.backupName}`}>
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
                    
                    <TableCell>
                      <div 
                        className={`text-xs p-1 rounded ${getNextRunDateStyle(server.nextRunDate, backupSetting.overdueBackupCheckEnabled)}`}
                      >
                        {server.nextRunDate !== 'N/A' ? 
                          new Date(server.nextRunDate).toLocaleString() : 
                          'Not set'
                        }
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Switch
                          id={`overdue-backup-${inputKey}`}
                          checked={backupSetting.overdueBackupCheckEnabled}
                          onCheckedChange={(checked) => 
                            updateBackupSettingById(server.id, server.backupName, 'overdueBackupCheckEnabled', checked)
                          }
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <Label htmlFor={`overdue-backup-${inputKey}`} className="text-xs">
                          {backupSetting.overdueBackupCheckEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          type="text"
                          value={inputValues[inputKey] ?? (server.isCustomInterval ? server.expectedInterval : server.displayInterval.toString())}
                          onChange={(e) => handleIntervalInputChangeById(server.id, server.backupName, e.target.value)}
                          onBlur={(e) => handleIntervalBlurById(server.id, server.backupName, e.target.value, server.displayUnit)}
                          placeholder={server.isCustomInterval ? "1D2h30m" : "1"}
                          disabled={!backupSetting.overdueBackupCheckEnabled}
                          className={`text-xs ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''} ${validationErrors[inputKey] ? 'border-red-500' : ''}`}
                        />
                        {validationErrors[inputKey] && (
                          <p className="text-xs text-red-500">{validationErrors[inputKey]}</p>
                        )}
                      </div>
                    </TableCell>
                    
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
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="Minutes">Minute(s)</SelectItem>
                          <SelectItem value="Hours">Hour(s)</SelectItem>
                          <SelectItem value="Days">Day(s)</SelectItem>
                          <SelectItem value="Weeks">Week(s)</SelectItem>
                          <SelectItem value="Months">Month(s)</SelectItem>
                          <SelectItem value="Years">Year(s)</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <Button
                            key={day}
                            variant={isWeekDayAllowed(server.allowedWeekDays, index) ? "default" : "outline"}
                            size="sm"
                            className={`text-xs px-2 py-1 h-6 min-w-8 ${!backupSetting.overdueBackupCheckEnabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                              isWeekDayAllowed(server.allowedWeekDays, index) 
                                ? 'bg-blue-800 hover:bg-blue-600 text-white border-blue-800' 
                                : 'border-gray-800 text-gray-600 hover:bg-blue-400'
                            }`}
                            onClick={() => handleWeekDayToggle(server.id, server.backupName, index)}
                            disabled={!backupSetting.overdueBackupCheckEnabled}
                          >
                            {day}
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {sortedServers.map((server) => {
              const backupSetting = getBackupSettingById(server.id, server.backupName);
              const inputKey = `${server.id}:${server.backupName}`;
              
              return (
                <Card key={`${server.id}-${server.backupName}`} className="p-4">
                  <div className="space-y-3">
                    {/* Header with Server and Backup Name */}
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
                    
                    {/* Next Run */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Next Run</Label>
                      <div 
                        className={`text-xs p-1 rounded ${getNextRunDateStyle(server.nextRunDate, backupSetting.overdueBackupCheckEnabled)}`}
                      >
                        {server.nextRunDate !== 'N/A' ? 
                          new Date(server.nextRunDate).toLocaleString() : 
                          'Not set'
                        }
                      </div>
                    </div>
                    
                    {/* Overdue Backup Monitoring */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Overdue Backup Monitoring</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`overdue-backup-mobile-${inputKey}`}
                          checked={backupSetting.overdueBackupCheckEnabled}
                          onCheckedChange={(checked) => 
                            updateBackupSettingById(server.id, server.backupName, 'overdueBackupCheckEnabled', checked)
                          }
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <Label htmlFor={`overdue-backup-mobile-${inputKey}`} className="text-xs">
                          {backupSetting.overdueBackupCheckEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                    </div>
                    
                    {/* Expected Backup Interval */}
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
                    
                    {/* Allowed Days */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Allowed Days</Label>
                      <div className="flex gap-1 flex-wrap">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <Button
                            key={day}
                            variant={isWeekDayAllowed(server.allowedWeekDays, index) ? "default" : "outline"}
                            size="sm"
                            className={`text-xs px-2 py-1 h-6 min-w-8 ${!backupSetting.overdueBackupCheckEnabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                              isWeekDayAllowed(server.allowedWeekDays, index) 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                                : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                            }`}
                            onClick={() => handleWeekDayToggle(server.id, server.backupName, index)}
                            disabled={!backupSetting.overdueBackupCheckEnabled}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="flex flex-col gap-6 pt-6 w-full">
            {/* Save button and Collect All button */}
            <div className="flex gap-3">
              <Button onClick={() => {
                handleSave();
              }} disabled={isSaving} variant="gradient">
                {isSaving ? "Saving..." : "Save Overdue Monitoring Settings"}
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
                      title: "Starting Collection",
                      description: "Collecting backup logs from all configured servers...",
                      duration: 4000,
                    });
                  }
                }}
                onCollectionEnd={() => {
                  // Collection completed, toast will be shown by the component
                }}
              />
            </div>

            {/* Controls grid - responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <Label htmlFor="overdue-tolerance" className="mb-2 text-sm">
                  <span className="hidden sm:inline">Overdue tolerance:</span>
                  <span className="sm:hidden">Tolerance:</span>
                </Label>
                <Select
                  value={config?.overdue_tolerance || defaultOverdueTolerance}
                  onValueChange={(value: OverdueTolerance) => handleOverdueToleranceChange(value)}
                >
                  <SelectTrigger id="overdue-tolerance" className="w-full">
                    <SelectValue placeholder="Select tolerance" />
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
                  <span className="hidden lg:inline">Overdue monitoring interval:</span>
                  <span className="lg:hidden hidden sm:inline">Monitoring interval:</span>
                  <span className="sm:hidden">Interval:</span>
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
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col">
                <Label htmlFor="notification-frequency" className="mb-2 text-sm">
                  <span className="hidden lg:inline">Notification frequency:</span>
                  <span className="lg:hidden hidden sm:inline">Notification freq:</span>
                  <span className="sm:hidden">Frequency:</span>
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
                {notificationFrequencyLoading && <span className="text-xs text-muted-foreground mt-1">Loading...</span>}
                {notificationFrequencyError && <span className="text-xs text-destructive mt-1">{notificationFrequencyError}</span>}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex-1"></div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTestOverdueBackups} 
                    variant="outline" 
                    disabled={isTesting}
                    size="sm"
                    className="flex-1"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">{isTesting ? "Checking..." : "Check now"}</span>
                    <span className="sm:hidden">{isTesting ? "..." : "Check"}</span>
                  </Button>
                  <Button 
                    onClick={handleResetNotifications}
                    variant="outline"
                    disabled={isResetting}
                    size="sm"
                    className="flex-1"
                  >
                    <TimerReset className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">{isResetting ? "Resetting..." : "Reset notifications"}</span>
                    <span className="sm:hidden">{isResetting ? "..." : "Reset notifications"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
