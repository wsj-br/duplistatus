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
import { NotificationEvent, BackupNotificationConfig, BackupKey, CronInterval, NotificationFrequencyConfig, OverdueTolerance } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { cronClient } from '@/lib/cron-client';
import { cronIntervalMap } from '@/lib/cron-interval-map';
import { defaultBackupNotificationConfig, defaultUIConfig, defaultNotificationFrequencyConfig } from '@/lib/default-config';
import { RefreshCw, TimerReset } from "lucide-react";

interface MachineWithBackup {
  id: string;
  name: string;
  backupName: string;
}

interface BackupNotificationsFormProps {
  backupSettings: Record<BackupKey, BackupNotificationConfig>;
  onSave?: (settings: Record<BackupKey, BackupNotificationConfig>) => void;
}

// Extended machine interface for sorting
interface MachineWithBackupAndSettings extends MachineWithBackup {
  notificationEvent: NotificationEvent;
  overdueBackupCheckEnabled: boolean;
  expectedInterval: number;
  intervalUnit: 'hours' | 'days';
  displayInterval: number;
}

export function BackupNotificationsForm({ backupSettings }: BackupNotificationsFormProps) {
  const { toast } = useToast();
  const [machinesWithBackups, setMachinesWithBackups] = useState<MachineWithBackup[]>([]);
  const [settings, setSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [originalSettings, setOriginalSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [cronInterval, setCronIntervalState] = useState<CronInterval>(defaultBackupNotificationConfig.cronInterval || '20min');
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequencyConfig>(defaultNotificationFrequencyConfig);
  const [notificationFrequencyLoading, setNotificationFrequencyLoading] = useState(true);
  const [notificationFrequencyError, setNotificationFrequencyError] = useState<string | null>(null);
  const [overdueTolerance, setOverdueTolerance] = useState<OverdueTolerance>(defaultBackupNotificationConfig.overdueTolerance || '1h');
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
    fetchMachinesWithBackups();
    loadCronInterval();
    fetchNotificationFrequency();
    fetchOverdueTolerance();
    loadExistingBackupSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



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

  const loadCronInterval = async () => {
    try {
      const response = await fetch('/api/cron-config');
      if (!response.ok) {
        throw new Error('Failed to load cron configuration');
      }
      
      const { cronExpression, enabled } = await response.json();
      
      // Find matching interval from the cron expression and enabled status
      const entry = Object.entries(cronIntervalMap).find(([, value]) => 
        value.expression === cronExpression && value.enabled === enabled
      );
      
      setCronIntervalState(entry ? entry[0] as CronInterval : defaultBackupNotificationConfig.cronInterval || '20min');
    } catch (error) {
      console.error('Failed to load cron interval:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to load overdue backup check interval",
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

  // Initialize default settings for all machines when they are loaded
  useEffect(() => {
    if (machinesWithBackups.length > 0) {
      setSettings(prev => {
        const defaultSettings: Record<BackupKey, BackupNotificationConfig> = {};
        let hasChanges = false;
        
        machinesWithBackups.forEach(machine => {
          const backupKey = getBackupKey(machine.name, machine.backupName);
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
          // Update original settings to match the new settings
          setOriginalSettings(newSettings);
          return newSettings;
        }
        return prev;
      });
    }
  }, [machinesWithBackups]);

  const fetchMachinesWithBackups = async () => {
    try {
      const response = await fetch('/api/machines-with-backups');
      if (!response.ok) {
        throw new Error('Failed to fetch machines with backups');
      }
      const data = await response.json();
      // Sort machines alphabetically by name initially
      const sortedMachines = data.sort((a: MachineWithBackup, b: MachineWithBackup) => 
        a.name.localeCompare(b.name) || a.backupName.localeCompare(b.backupName)
      );
      setMachinesWithBackups(sortedMachines);
    } catch (error) {
      console.error('Error fetching machines with backups:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to load machines with backups list",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getBackupKey = (machineName: string, backupName: string): BackupKey => {
    return `${machineName}:${backupName}`;
  };

  const updateBackupSetting = (machineName: string, backupName: string, field: keyof BackupNotificationConfig, value: string | number | boolean) => {
    const backupKey = getBackupKey(machineName, backupName);
    setSettings(prev => ({
      ...prev,
      [backupKey]: {
        ...(prev[backupKey] || { ...defaultBackupNotificationConfig }),
        [field]: value,
      },
    }));
  };

  const getBackupSetting = (machineName: string, backupName: string): BackupNotificationConfig => {
    const backupKey = getBackupKey(machineName, backupName);
    return settings[backupKey] || { ...defaultBackupNotificationConfig };
  };



  const handleIntervalInputChange = (machineName: string, backupName: string, value: string) => {
    const key = `${machineName}:${backupName}`;
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleIntervalBlur = (machineName: string, backupName: string, value: string) => {
    const numValue = parseInt(value) || 1;
    updateBackupSetting(machineName, backupName, 'expectedInterval', numValue);
    
    // Clear the local input value since we've saved the setting
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[`${machineName}:${backupName}`];
      return newValues;
    });
  };

  const handleUnitChange = (machineName: string, backupName: string, newUnit: 'hours' | 'days') => {
    updateBackupSetting(machineName, backupName, 'intervalUnit', newUnit);
    
    // Clear any local input value since the unit has changed
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[`${machineName}:${backupName}`];
      return newValues;
    });
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Create machines with settings for sorting
  const getMachinesWithBackupAndSettings = (): MachineWithBackupAndSettings[] => {
    return machinesWithBackups.map(machine => {
      const backupSetting = getBackupSetting(machine.name, machine.backupName);
      
      return {
        ...machine,
        ...backupSetting,
        displayInterval: backupSetting.expectedInterval,
      };
    });
  };

  // Get sorted machines
  const sortedMachines = createSortedArray(getMachinesWithBackupAndSettings(), sortConfig, columnConfig);

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
      
      // Always run overdue backup check when saving to ensure tolerance is applied
      await runOverdueBackupCheck();
      
      // Update original settings to reflect the new state
      setOriginalSettings(settings);
      
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

  const fetchNotificationFrequency = async () => {
    setNotificationFrequencyLoading(true);
    setNotificationFrequencyError(null);
    try {
      const response = await fetch('/api/notifications/resend-frequency');
      if (!response.ok) throw new Error('Failed to fetch notification frequency');
      const data = await response.json();
      setNotificationFrequency(data.value ?? defaultNotificationFrequencyConfig);
    } catch {
      setNotificationFrequencyError('Failed to load notification frequency');
      setNotificationFrequency(defaultNotificationFrequencyConfig);
    } finally {
      setNotificationFrequencyLoading(false);
    }
  };

  const fetchOverdueTolerance = async () => {
    try {
      const response = await fetch('/api/configuration');
      if (!response.ok) throw new Error('Failed to fetch configuration');
      const data = await response.json();
      setOverdueTolerance(data.overdue_tolerance ?? (defaultBackupNotificationConfig.overdueTolerance || '1h'));
    } catch (error) {
      console.error('Failed to load overdue tolerance:', error instanceof Error ? error.message : String(error));
      setOverdueTolerance(defaultBackupNotificationConfig.overdueTolerance || '1h');
    }
  };

  const loadExistingBackupSettings = async () => {
    try {
      const response = await fetch('/api/configuration');
      if (!response.ok) throw new Error('Failed to fetch configuration');
      const data = await response.json();
      
      if (data.backupSettings && Object.keys(data.backupSettings).length > 0) {
        setSettings(data.backupSettings);
        setOriginalSettings(data.backupSettings);
      }
    } catch (error) {
      console.error('Failed to load existing backup settings:', error instanceof Error ? error.message : String(error));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading machines with backups...</div>
        </div>
      </div>
    );
  }

  if (machinesWithBackups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup Notifications</CardTitle>
          <CardDescription>No machines with backups found in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No machines with backups have been registered yet. Add some backup data first to see backup notification settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backup Notification Settings</CardTitle>
          <CardDescription>
             Configure notification settings for each backup received from Duplicati. 
             Enable/disable overdue backup monitoring, set the timeout period and notification frequency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead 
                  className="w-[200px]" 
                  column="name" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Machine Name
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[200px]" 
                  column="backupName" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Backup Name
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[180px]" 
                  column="notificationEvent" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Notification Events
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[180px]" 
                  column="overdueBackupCheckEnabled" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Overdue Backup Monitoring
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[150px]" 
                  column="displayInterval" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Expected Backup Interval
                </SortableTableHead>
                <SortableTableHead 
                  className="w-[100px]" 
                  column="intervalUnit" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Unit
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMachines.map((machine) => {
                const backupSetting = getBackupSetting(machine.name, machine.backupName);
                const inputKey = `${machine.name}:${machine.backupName}`;
                
                return (
                  <TableRow key={`${machine.id}-${machine.backupName}`}>
                    <TableCell>
                      <div>
                        <div className="font-xl">{machine.name}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-xl">{machine.backupName}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={backupSetting.notificationEvent}
                        onValueChange={(value: NotificationEvent) => 
                          updateBackupSetting(machine.name, machine.backupName, 'notificationEvent', value)
                        }
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
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`overdue-backup-${inputKey}`}
                          checked={backupSetting.overdueBackupCheckEnabled}
                          onCheckedChange={(checked) => 
                            updateBackupSetting(machine.name, machine.backupName, 'overdueBackupCheckEnabled', checked)
                          }
                        />
                        <Label htmlFor={`overdue-backup-${inputKey}`} className="text-sm">
                          {backupSetting.overdueBackupCheckEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        max={backupSetting.intervalUnit === 'hours' ? "8760" : "365"}
                        value={inputValues[inputKey] ?? backupSetting.expectedInterval.toString()}
                        onChange={(e) => handleIntervalInputChange(machine.name, machine.backupName, e.target.value)}
                        onBlur={(e) => handleIntervalBlur(machine.name, machine.backupName, e.target.value)}
                        placeholder={backupSetting.intervalUnit === 'hours' ? "24" : "1"}
                        disabled={!backupSetting.overdueBackupCheckEnabled}
                        className={!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={backupSetting.intervalUnit}
                        onValueChange={(value: 'hours' | 'days') => handleUnitChange(machine.name, machine.backupName, value)}
                        disabled={!backupSetting.overdueBackupCheckEnabled}
                      >
                        <SelectTrigger className={`w-full ${!backupSetting.overdueBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}>
                          <SelectValue placeholder={backupSetting.intervalUnit === 'days' ? 'Days' : 'Hours'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between pt-6 gap-4 w-full">
            {/* Save button - always on top on mobile, left on desktop */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Backup Settings"}
              </Button>
            </div>

            {/* Other controls - wrap on smaller screens, right-aligned on desktop */}
            <div className="flex flex-wrap gap-4 items-end lg:justify-end">
              <div className="flex flex-col items-start">
                <Label htmlFor="overdue-tolerance" className="mb-2 self-start">
                  Overdue tolerance:
                </Label>
                <Select
                  value={overdueTolerance}
                  onValueChange={(value: OverdueTolerance) => handleOverdueToleranceChange(value)}
                >
                  <SelectTrigger id="overdue-tolerance" className="w-[200px] min-w-[150px] max-w-full">
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
              <div className="flex flex-col items-start">
                <Label htmlFor="cron-interval" className="mb-2 self-start">
                  Overdue monitoring interval:
                </Label>
                <Select
                  value={cronInterval}
                  onValueChange={(value: CronInterval) => handleCronIntervalChange(value)}
                >
                  <SelectTrigger id="cron-interval" className="w-[200px] min-w-[150px] max-w-full">
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
              <Button 
                onClick={handleTestOverdueBackups} 
                variant="outline" 
                disabled={isTesting}
                className="self-end"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isTesting ? "Checking..." : "Check now"}
              </Button>
              <div className="flex flex-col items-start">
                <Label htmlFor="notification-frequency" className="mb-2 self-start">
                    Notification frequency:
                </Label>
                <Select
                  value={notificationFrequency}
                  onValueChange={(value: NotificationFrequencyConfig) => handleNotificationFrequencyChange(value)}
                  disabled={notificationFrequencyLoading}
                >
                  <SelectTrigger id="notification-frequency" className="w-[200px] min-w-[150px] max-w-full">
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
              <Button 
                onClick={handleResetNotifications}
                variant="outline"
                disabled={isResetting}
                className="self-end"
              >
                <TimerReset className="mr-2 h-4 w-4" />
                {isResetting ? "Resetting..." : "Reset timer"}
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
} 