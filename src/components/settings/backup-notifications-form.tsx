"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useConfiguration } from '@/contexts/configuration-context';
import { useConfig } from '@/contexts/config-context';
import { NotificationEvent, BackupNotificationConfig, BackupKey } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { defaultBackupNotificationConfig } from '@/lib/default-config';
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
}

export function BackupNotificationsForm({ backupSettings }: BackupNotificationsFormProps) {
  const { toast } = useToast();
  const { config, refreshConfigSilently } = useConfiguration();
  const { refreshOverdueTolerance } = useConfig();
  const [settings, setSettings] = useState<Record<BackupKey, BackupNotificationConfig>>(backupSettings);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  
  // Auto-save debouncing state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Record<BackupKey, BackupNotificationConfig> | null>(null);
  const isAutoSaveInProgressRef = useRef(false);

  // Column configuration for sorting
  const columnConfig = {
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    backupName: { type: 'text' as keyof typeof sortFunctions, path: 'backupName' },
    notificationEvent: { type: 'notificationEvent' as keyof typeof sortFunctions, path: 'notificationEvent' },
  };

  useEffect(() => {
    if (config) {
      // Initialize settings from config
      if (config.backupSettings && Object.keys(config.backupSettings).length > 0) {
        setSettings(config.backupSettings);
      }
    }
  }, [config]);

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

  const getBackupSettingById = (serverId: string, backupName: string): BackupNotificationConfig => {
    const backupKey = `${serverId}:${backupName}`;
    return settings[backupKey] || { ...defaultBackupNotificationConfig };
  };

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
      
      try {
        const settingsToSave = pendingChangesRef.current || newSettings;
        
        const response = await fetch('/api/configuration/backup-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            backupSettings: settingsToSave
          }),
        });
        
        if (!response.ok) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Backup Notifications</CardTitle>
          <CardDescription>
             Configure notification settings for each backup received from Duplicati. 
             Choose which backup events should trigger notifications.
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
                <th className="text-left font-medium text-sm text-muted-foreground px-2 py-3 w-[80px]">
                  NTFY
                </th>
                <th className="text-left font-medium text-sm text-muted-foreground px-2 py-3 w-[80px]">
                  Email
                </th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServers.map((server) => {
                const backupSetting = getBackupSettingById(server.id, server.backupName);
                
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
                    
                    <TableCell className="text-center">
                      <Checkbox
                        checked={backupSetting.ntfyEnabled !== undefined ? backupSetting.ntfyEnabled : true}
                        onCheckedChange={(checked: boolean) => 
                          updateBackupSettingById(server.id, server.backupName, 'ntfyEnabled', checked)
                        }
                      />
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Checkbox
                        checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                        onCheckedChange={(checked: boolean) => 
                          updateBackupSettingById(server.id, server.backupName, 'emailEnabled', checked)
                        }
                      />
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
                    
                    {/* Notification Channels */}
                    <div className="space-y-3">
                      <Label className="text-xs font-medium">Notification Channels</Label>
                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={backupSetting.ntfyEnabled !== undefined ? backupSetting.ntfyEnabled : true}
                            onCheckedChange={(checked: boolean) => 
                              updateBackupSettingById(server.id, server.backupName, 'ntfyEnabled', checked)
                            }
                          />
                          <Label className="text-xs">NTFY</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={backupSetting.emailEnabled !== undefined ? backupSetting.emailEnabled : true}
                            onCheckedChange={(checked: boolean) => 
                              updateBackupSettingById(server.id, server.backupName, 'emailEnabled', checked)
                            }
                          />
                          <Label className="text-xs">Email</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
{/* Manual Save Button Section - Commented out because auto-save is now enabled
          This section provided a manual save button for backup notification settings.
          It has been disabled in favor of the auto-save functionality that triggers
          automatically when users change notification settings (with 500ms debounce).
          
          The auto-save feature provides better UX by eliminating the need for users
          to remember to manually save their changes, while still providing visual
          feedback through the cursor change and auto-save status indicators.
          
          <div className="flex flex-col gap-6 pt-6 w-full">
            <div className="flex gap-3 items-center">
              <Button onClick={handleSave} disabled={isSaving || isAutoSaving}>
                {isSaving ? "Saving..." : "Save Notification Settings"}
              </Button>
              {isAutoSaving && (
                <span className="text-sm text-muted-foreground">
                  Auto-saving...
                </span>
              )}
            </div> 
          </div>
*/}

        </CardContent>
      </Card>
    </div>
  );
}