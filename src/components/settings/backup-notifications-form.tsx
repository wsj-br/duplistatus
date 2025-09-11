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
import { useConfiguration } from '@/contexts/configuration-context';
import { NotificationEvent, BackupNotificationConfig, BackupKey, CronInterval, NotificationFrequencyConfig, OverdueTolerance } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { cronClient } from '@/lib/cron-client';
import { cronIntervalMap } from '@/lib/cron-interval-map';
import { defaultBackupNotificationConfig, defaultNotificationFrequencyConfig, defaultOverdueTolerance, defaultCronInterval } from '@/lib/default-config';
import { RefreshCw, TimerReset } from "lucide-react";
import { ServerConfigurationButton } from '../ui/server-configuration-button';

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
  overdueBackupCheckEnabled: boolean;
  expectedInterval: number;
  intervalUnit: 'hour' | 'day';
  displayInterval: number;
}

export function BackupNotificationsForm({ backupSettings }: BackupNotificationsFormProps) {
  const { toast } = useToast();
  const { config, refreshConfigSilently } = useConfiguration();
  const [settings, setSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [cronInterval, setCronIntervalState] = useState<CronInterval>(defaultCronInterval);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequencyConfig>(defaultNotificationFrequencyConfig);
  const [notificationFrequencyLoading, setNotificationFrequencyLoading] = useState(false);
  const [notificationFrequencyError, setNotificationFrequencyError] = useState<string | null>(null);
  const [overdueTolerance, setOverdueTolerance] = useState<OverdueTolerance>(defaultOverdueTolerance);
  const notificationFrequencyOptions: { value: NotificationFrequencyConfig; label: string }[] = [
    { value: 'onetime', label: 'One time' },
    { value: 'every_day', label: 'Every day' },
    { value: 'every_week', label: 'Every week' },
    { value: 'every_month', label: 'Every month' },
  ];

  const overdueToleranceOptions: { value: OverdueTolerance; label: string }[] = [
    { value: 'no_tolerance', label: 'No tolerance' },
    { value: '5min', label: '5 min' },
    { value: '15min', label: '15 min' },
    { value: '30min', label: '30 min' },
    { value: '1h', label: '1 hour' },
    { value: '2h', label: '2 hours' },
    { value: '4h', label: '4 hours' },
    { value: '6h', label: '6 hours' },
    { value: '12h', label: '12 hours' },
    { value: '1d', label: '1 day' },
  ];

  // Column configuration for sorting
  const columnConfig = {
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    backupName: { type: 'text' as keyof typeof sortFunctions, path: 'backupName' },
    notificationEvent: { type: 'notificationEvent' as keyof typeof sortFunctions, path: 'notificationEvent' },
    overdueBackupCheckEnabled: { type: 'text' as keyof typeof sortFunctions, path: 'overdueBackupCheckEnabled' },
    displayInterval: { type: 'number' as keyof typeof sortFunctions, path: 'displayInterval' },
    intervalUnit: { type: 'text' as keyof typeof sortFunctions, path: 'intervalUnit' },
  };

  useEffect(() => {
    if (config) {
      // Initialize settings from config
      if (config.backupSettings && Object.keys(config.backupSettings).length > 0) {
        setSettings(config.backupSettings);
      }
      
      // Initialize other settings from config
      if (config.overdue_tolerance) {
        setOverdueTolerance(config.overdue_tolerance);
      }
      
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
  }, [config]);



  // Helper function to run overdue backup check
  const runOverdueBackupCheck = async () => {
    try {
      const response = await fetch('/api/notifications/check-overdue', {
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
      const response = await fetch('/api/cron-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Initialize default settings for all servers when they are loaded
  useEffect(() => {
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
  }, [config?.serversWithBackups]);

  const updateBackupSettingById = (serverId: string, backupName: string, field: keyof BackupNotificationConfig, value: string | number | boolean) => {
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
    setInputValues(prev => ({
      ...prev,
      [inputKey]: value
    }));
  };

  const handleIntervalBlurById = (serverId: string, backupName: string, value: string) => {
    const numValue = parseInt(value) || 1;
    updateBackupSettingById(serverId, backupName, 'expectedInterval', numValue);
    
    // Clear the local input value since we've saved the setting
    const inputKey = `${serverId}:${backupName}`;
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[inputKey];
      return newValues;
    });
  };

  const handleUnitChangeById = (serverId: string, backupName: string, newUnit: 'hour' | 'day') => {
    updateBackupSettingById(serverId, backupName, 'intervalUnit', newUnit);
    
    // Clear any local input value since the unit has changed
    const inputKey = `${serverId}:${backupName}`;
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[inputKey];
      return newValues;
    });
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
      
      return {
        ...server,
        ...backupSetting,
        displayInterval: backupSetting.expectedInterval,
      };
    });
  };

  // Get sorted servers
  const sortedServers = createSortedArray(getServersWithBackupAndSettings(), sortConfig, columnConfig);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save backup settings using the dedicated endpoint
      const backupResponse = await fetch('/api/configuration/backup-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupSettings: settings
        }),
      });
      
      if (!backupResponse.ok) {
        throw new Error('Failed to save backup settings');
      }
      
      // Save overdue tolerance using the dedicated endpoint
      const toleranceResponse = await fetch('/api/configuration/overdue-tolerance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdue_tolerance: overdueTolerance }),
      });
      
      if (!toleranceResponse.ok) {
        throw new Error('Failed to save overdue tolerance');
      }
      
      // Dispatch custom event to notify other components about configuration change
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
      
      // Always run overdue backup check when saving to ensure tolerance is applied
      await runOverdueBackupCheck();
      
      toast({
        title: "Success",
        description: "Backup settings and tolerance saved successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving settings:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestOverdueBackups = async () => {
    setIsTesting(true);
    try {
      // Save backup settings using the dedicated endpoint
      const backupResponse = await fetch('/api/configuration/backup-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupSettings: settings
        }),
      });
      
      if (!backupResponse.ok) {
        throw new Error('Failed to save backup settings');
      }
      
      // Save overdue tolerance using the dedicated endpoint
      const toleranceResponse = await fetch('/api/configuration/overdue-tolerance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdue_tolerance: overdueTolerance }),
      });
      
      if (!toleranceResponse.ok) {
        throw new Error('Failed to save overdue tolerance');
      }
      
      // Dispatch custom event to notify other components about configuration change
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
      // Refresh the configuration cache to reflect the changes
      await refreshConfigSilently();
      
      // Run the overdue backup check
      const response = await fetch('/api/notifications/check-overdue', {
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
      const response = await fetch('/api/notifications/resend-frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      // Create a separate API call just for overdue tolerance to avoid affecting other settings
      const response = await fetch('/api/configuration/overdue-tolerance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdue_tolerance: value }),
      });
      if (!response.ok) throw new Error('Failed to update overdue tolerance');
      setOverdueTolerance(value);
      toast({ title: 'Success', description: 'Overdue tolerance updated.', duration: 2000 });
    } catch (error) {
      console.error('Failed to update overdue tolerance:', error instanceof Error ? error.message : String(error));
      toast({ title: 'Error', description: 'Failed to update overdue tolerance', variant: 'destructive', duration: 3000 });
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const handleResetNotifications = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/notifications/clear-overdue-timestamps', {
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

  if (!config?.serversWithBackups || config.serversWithBackups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup Alerts</CardTitle>
          <CardDescription>No servers with backups found in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No servers with backups have been registered yet. Add some backup data first to see backup alerts settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Backup Alerts</CardTitle>
          <CardDescription>
             Configure notification settings for each backup received from Duplicati. 
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
                  className="w-[140px] min-w-[120px]" 
                  column="notificationEvent" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Notification Events
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
                  column="intervalUnit" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Unit
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
                          <div className="flex items-center gap-1">
                            <ServerConfigurationButton
                              serverUrl={server.server_url}
                              serverName={server.name}
                              serverAlias={server.alias}
                              size="sm"
                              variant="ghost"
                              className="text-xs hover:text-blue-500 transition-colors"
                              showText={false}
                            />
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
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm truncate">{server.backupName}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
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
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Switch
                          id={`overdue-backup-${inputKey}`}
                          checked={backupSetting.overdueBackupCheckEnabled}
                          onCheckedChange={(checked) => 
                            updateBackupSettingById(server.id, server.backupName, 'overdueBackupCheckEnabled', checked)
                          }
                        />
                        <Label htmlFor={`overdue-backup-${inputKey}`} className="text-xs">
                          {backupSetting.overdueBackupCheckEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        max={backupSetting.intervalUnit === 'hour' ? "8760" : "365"}
                        value={inputValues[inputKey] ?? backupSetting.expectedInterval.toString()}
                        onChange={(e) => handleIntervalInputChangeById(server.id, server.backupName, e.target.value)}
                        onBlur={(e) => handleIntervalBlurById(server.id, server.backupName, e.target.value)}
                        placeholder={backupSetting.intervalUnit === 'hour' ? "24" : "1"}
                        disabled={!backupSetting.overdueBackupCheckEnabled}
                        className={`text-xs ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={backupSetting.intervalUnit}
                        onValueChange={(value: 'hour' | 'day') => handleUnitChangeById(server.id, server.backupName, value)}
                        disabled={!backupSetting.overdueBackupCheckEnabled}
                      >
                        <SelectTrigger className={`w-full text-xs ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}>
                          <SelectValue placeholder={backupSetting.intervalUnit === 'day' ? 'Days' : 'Hours'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Hour(s)</SelectItem>
                          <SelectItem value="day">Day(s)</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <div className="flex items-center gap-2">
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
                          type="number"
                          min="1"
                          max={backupSetting.intervalUnit === 'hour' ? "8760" : "365"}
                          value={inputValues[inputKey] ?? backupSetting.expectedInterval.toString()}
                          onChange={(e) => handleIntervalInputChangeById(server.id, server.backupName, e.target.value)}
                          onBlur={(e) => handleIntervalBlurById(server.id, server.backupName, e.target.value)}
                          placeholder={backupSetting.intervalUnit === 'hour' ? "24" : "1"}
                          disabled={!backupSetting.overdueBackupCheckEnabled}
                          className={`text-xs flex-1 ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}
                        />
                        <Select
                          value={backupSetting.intervalUnit}
                          onValueChange={(value: 'hour' | 'day') => handleUnitChangeById(server.id, server.backupName, value)}
                          disabled={!backupSetting.overdueBackupCheckEnabled}
                        >
                          <SelectTrigger className={`w-20 text-xs ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}>
                            <SelectValue placeholder={backupSetting.intervalUnit === 'day' ? 'Days' : 'Hours'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hour">Hour(s)</SelectItem>
                            <SelectItem value="day">Day(s)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="flex flex-col gap-6 pt-6 w-full">
            {/* Save button */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Backup Settings"}
              </Button>
            </div>

            {/* Controls grid - responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <Label htmlFor="overdue-tolerance" className="mb-2 text-sm">
                  <span className="hidden sm:inline">Overdue tolerance:</span>
                  <span className="sm:hidden">Tolerance:</span>
                </Label>
                <Select
                  value={overdueTolerance}
                  onValueChange={(value: OverdueTolerance) => handleOverdueToleranceChange(value)}
                >
                  <SelectTrigger id="overdue-tolerance" className="w-full">
                    <SelectValue />
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
                    {Object.entries(cronIntervalMap).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
                    <span className="hidden sm:inline">{isResetting ? "Resetting..." : "Reset timer"}</span>
                    <span className="sm:hidden">{isResetting ? "..." : "Reset"}</span>
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