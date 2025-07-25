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
import { NotificationEvent, BackupNotificationConfig, BackupKey, CronInterval, ResendFrequencyConfig } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { cronClient } from '@/lib/cron-client';
import { cronIntervalMap } from '@/lib/cron-interval-map';
import { RefreshCw, TimerReset } from "lucide-react";

interface MachineWithBackup {
  id: string;
  name: string;
  backupName: string;
}

interface BackupNotificationsFormProps {
  backupSettings: Record<BackupKey, BackupNotificationConfig>;
  onSave: (settings: Record<BackupKey, BackupNotificationConfig>) => void;
}

// Extended machine interface for sorting
interface MachineWithBackupAndSettings extends MachineWithBackup {
  notificationEvent: NotificationEvent;
  missedBackupCheckEnabled: boolean;
  expectedInterval: number;
  intervalUnit: 'hours' | 'days';
  displayInterval: number;
}

export function BackupNotificationsForm({ backupSettings, onSave }: BackupNotificationsFormProps) {
  const { toast } = useToast();
  const [machinesWithBackups, setMachinesWithBackups] = useState<MachineWithBackup[]>([]);
  const [settings, setSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [cronInterval, setCronIntervalState] = useState<CronInterval>('20min');
  const [resendFrequency, setResendFrequency] = useState<ResendFrequencyConfig>('never');
  const [resendLoading, setResendLoading] = useState(true);
  const [resendError, setResendError] = useState<string | null>(null);
  const resendOptions: { value: ResendFrequencyConfig; label: string }[] = [
    { value: 'never', label: 'Never (just once)' },
    { value: 'every_day', label: 'Every day' },
    { value: 'every_week', label: 'Every week' },
    { value: 'every_month', label: 'Every month' },
  ];

  // Column configuration for sorting
  const columnConfig = {
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    backupName: { type: 'text' as keyof typeof sortFunctions, path: 'backupName' },
    notificationEvent: { type: 'notificationEvent' as keyof typeof sortFunctions, path: 'notificationEvent' },
    missedBackupCheckEnabled: { type: 'text' as keyof typeof sortFunctions, path: 'missedBackupCheckEnabled' },
    displayInterval: { type: 'number' as keyof typeof sortFunctions, path: 'displayInterval' },
    intervalUnit: { type: 'text' as keyof typeof sortFunctions, path: 'intervalUnit' },
  };

  useEffect(() => {
    fetchMachinesWithBackups();
    loadCronInterval();
    fetchResendFrequency();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCronInterval = async () => {
    try {
      const response = await fetch('/api/cron-config');
      if (!response.ok) {
        throw new Error('Failed to load cron configuration');
      }
      
      const { enabled } = await response.json();
      
      // Find matching interval from the configuration
      const entry = Object.entries(cronIntervalMap).find(([key]) => {
        const interval = key as CronInterval;
        return interval === (enabled ? '20min' : 'disabled'); // Default to 20min if enabled, disabled if not
      });
      
      setCronIntervalState(entry ? entry[0] as CronInterval : '20min');
    } catch (error) {
      console.error('Failed to load cron interval:', error);
      toast({
        title: "Error",
        description: "Failed to load missed backup check interval",
        variant: "destructive",
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

      // Restart the cron task to apply new configuration
      //await cronClient.stopTask('missed-backup-check');
      await cronClient.reloadConfig();
      //await cronClient.startTask('missed-backup-check');

      toast({
        title: "Success",
        description: "Missed backup check interval updated successfully",
      });
    } catch (error) {
      console.error('Failed to update cron interval:', error);
      toast({
        title: "Error",
        description: "Failed to update missed backup check interval",
        variant: "destructive",
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
            defaultSettings[backupKey] = {
              notificationEvent: 'off',
              expectedInterval: 1, // 1 day as default
              missedBackupCheckEnabled: false,
              intervalUnit: 'days',
            };
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          return {
            ...prev,
            ...defaultSettings,
          };
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
      console.error('Error fetching machines with backups:', error);
      toast({
        title: "Error",
        description: "Failed to load machines with backups list",
        variant: "destructive",
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
        ...(prev[backupKey] || { 
          notificationEvent: 'off', 
          expectedInterval: 1, // Default to 1 day (24 hours)
          missedBackupCheckEnabled: false,
          intervalUnit: 'days'
        }),
        [field]: value,
      },
    }));
  };

  const getBackupSetting = (machineName: string, backupName: string): BackupNotificationConfig => {
    const backupKey = getBackupKey(machineName, backupName);
    return settings[backupKey] || {
      notificationEvent: 'off',
      expectedInterval: 1, // Default to 1 day (24 hours)
      missedBackupCheckEnabled: false,
      intervalUnit: 'days',
    };
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
      await onSave(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMissedBackups = async () => {
    setIsTesting(true);
    try {
      // Save backup settings first
      await onSave(settings);
      
      // Run the missed backup check
      const response = await fetch('/api/notifications/check-missed', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run missed backup check');
      }

      const result = await response.json();
      toast({
        title: "Missed Backup Check Complete",
        description: `Checked ${result.statistics.checkedBackups} backups, found ${result.statistics.missedBackupsFound} missed backups, sent ${result.statistics.notificationsSent} notifications.`,
      });
    } catch (error) {
      console.error('Error running missed backup check:', error);
      toast({
        title: "Error",
        description: "Failed to run missed backup check",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResendFrequencyChange = async (value: ResendFrequencyConfig) => {
    setResendLoading(true);
    setResendError(null);
    try {
      const response = await fetch('/api/notifications/resend-frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update resend frequency');
      setResendFrequency(value);
      toast({ title: 'Success', description: 'Resend frequency updated.' });
    } catch {
      setResendError('Failed to update resend frequency');
      toast({ title: 'Error', description: 'Failed to update resend frequency', variant: 'destructive' });
    } finally {
      setResendLoading(false);
    }
  };

  const fetchResendFrequency = async () => {
    setResendLoading(true);
    setResendError(null);
    try {
      const response = await fetch('/api/notifications/resend-frequency');
      if (!response.ok) throw new Error('Failed to fetch resend frequency');
      const data = await response.json();
      setResendFrequency(data.value ?? 'never');
    } catch {
      setResendError('Failed to load resend frequency');
      setResendFrequency('never');
    } finally {
      setResendLoading(false);
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const handleResetNotifications = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/notifications/clear-missed-timestamps', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset missed backup notifications');
      }

      toast({
        title: "Success",
        description: "Missed backup notifications have been reset",
      });
    } catch (error) {
      console.error('Error resetting missed backup notifications:', error);
      toast({
        title: "Error",
        description: "Failed to reset missed backup notifications",
        variant: "destructive",
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
            Configure notification preferences for each backup. You can set when to receive notifications 
            and define expected backup intervals to detect missed backups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
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
                  column="missedBackupCheckEnabled" 
                  sortConfig={sortConfig} 
                  onSort={handleSort}
                >
                  Enable Missed Backup Check
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
                          id={`missed-backup-${inputKey}`}
                          checked={backupSetting.missedBackupCheckEnabled}
                          onCheckedChange={(checked) => 
                            updateBackupSetting(machine.name, machine.backupName, 'missedBackupCheckEnabled', checked)
                          }
                        />
                        <Label htmlFor={`missed-backup-${inputKey}`} className="text-sm">
                          {backupSetting.missedBackupCheckEnabled ? 'Enabled' : 'Disabled'}
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
                        disabled={!backupSetting.missedBackupCheckEnabled}
                        className={!backupSetting.missedBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={backupSetting.intervalUnit}
                        onValueChange={(value: 'hours' | 'days') => handleUnitChange(machine.name, machine.backupName, value)}
                        disabled={!backupSetting.missedBackupCheckEnabled}
                      >
                        <SelectTrigger className={`w-full ${!backupSetting.missedBackupCheckEnabled ? 'bg-muted text-muted-foreground' : ''}`}>
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
          
          <div className="flex items-end pt-6 justify-between w-full">
            {/* Left: Save button */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Backup Settings"}
              </Button>
            </div>

            {/* Right: Other controls in specified order */}
            <div className="flex gap-4 items-end">
              <div className="flex flex-col items-start">
                <Label htmlFor="cron-interval" className="mb-2 self-start">
                  Check for missed backups every:
                </Label>
                <Select
                  value={cronInterval}
                  onValueChange={(value: CronInterval) => handleCronIntervalChange(value)}
                >
                  <SelectTrigger id="cron-interval" className="w-[200px]">
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
                onClick={handleTestMissedBackups} 
                variant="outline" 
                disabled={isTesting}
                className="self-end"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isTesting ? "Checking..." : "Check Missed Backup"}
              </Button>
              <div className="flex flex-col items-start">
                <Label htmlFor="resend-frequency" className="mb-2 self-start">
                  Resend frequency:
                </Label>
                <Select
                  value={resendFrequency}
                  onValueChange={(value: ResendFrequencyConfig) => handleResendFrequencyChange(value)}
                  disabled={resendLoading}
                >
                  <SelectTrigger id="resend-frequency" className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resendOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {resendLoading && <span className="text-xs text-muted-foreground mt-1">Loading...</span>}
                {resendError && <span className="text-xs text-destructive mt-1">{resendError}</span>}
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