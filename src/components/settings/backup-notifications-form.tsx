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
import { NotificationEvent, BackupNotificationConfig, BackupKey } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          expectedInterval: 1, // Default to 1 day
          missedBackupCheckEnabled: false,
          intervalUnit: 'day'
        }),
        [field]: value,
      },
    }));
  };

  const getBackupSetting = (machineName: string, backupName: string): BackupNotificationConfig => {
    const backupKey = getBackupKey(machineName, backupName);
    return settings[backupKey] || {
      notificationEvent: 'off',
      expectedInterval: 1, // Default to 1 day
      missedBackupCheckEnabled: false,
      intervalUnit: 'day',
    };
  };

  // Convert hours to display value based on unit
  const getDisplayInterval = (hours: number, unit: 'hours' | 'days'): number => {
    if (unit === 'days') {
      return Math.round(hours / 24);
    }
    return hours;
  };

  // Convert display value to hours for storage
  const getStorageInterval = (value: number, unit: 'hours' | 'days'): number => {
    if (unit === 'days') {
      return value * 24;
    }
    return value;
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
    const backupSetting = getBackupSetting(machineName, backupName);
    const hoursValue = getStorageInterval(numValue, backupSetting.intervalUnit);
    updateBackupSetting(machineName, backupName, 'expectedInterval', hoursValue);
    
    // Clear the local input value since we've saved the setting
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[`${machineName}:${backupName}`];
      return newValues;
    });
  };

  const handleUnitChange = (machineName: string, backupName: string, newUnit: 'hours' | 'days') => {
    const backupSetting = getBackupSetting(machineName, backupName);
    updateBackupSetting(machineName, backupName, 'intervalUnit', newUnit);
    // Update the interval value to maintain the same time duration
    const currentDisplayValue = getDisplayInterval(backupSetting.expectedInterval, backupSetting.intervalUnit);
    const newHoursValue = getStorageInterval(currentDisplayValue, newUnit);
    updateBackupSetting(machineName, backupName, 'expectedInterval', newHoursValue);
    
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
      const displayInterval = getDisplayInterval(backupSetting.expectedInterval, backupSetting.intervalUnit);
      
      return {
        ...machine,
        ...backupSetting,
        displayInterval,
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
      const response = await fetch('/api/notifications/check-missed', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run missed backup check');
      }

      const result = await response.json();
      toast({
        title: "Missed Backup Check Complete",
        description: `Checked ${result.statistics.checkedMachines} machines, found ${result.statistics.missedBackupsFound} missed backups, sent ${result.statistics.notificationsSent} notifications.`,
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
                const displayInterval = getDisplayInterval(backupSetting.expectedInterval, backupSetting.intervalUnit);
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
                        value={inputValues[inputKey] ?? displayInterval.toString()}
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
                        <SelectTrigger className="w-full">
                          <SelectValue />
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
          
          <div className="flex gap-3 pt-6">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Backup Settings"}
            </Button>
            <Button 
              onClick={handleTestMissedBackups} 
              variant="outline" 
              disabled={isTesting}
            >
              {isTesting ? "Checking..." : "Test Missed Backup Check"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 