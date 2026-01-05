"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useConfig } from '@/contexts/config-context';
import { useToast } from '@/components/ui/use-toast';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import { useConfiguration } from '@/contexts/configuration-context';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { Database, Loader2, Trash2, Server, FolderOpen, Clock, Info, GitMerge, Download, Upload } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface Server {
  id: string;
  name: string;
  alias: string;
  server_url?: string;
  note?: string;
  backups?: Array<{
    name: string;
  }>;
}

interface BackupJob {
  id: string;
  server_id: string;
  server_name: string;
  backup_name: string;
  server_url: string;
  alias: string;
  note: string;
}

interface DuplicateServer {
  name: string;
  servers: Array<{
    id: string;
    created_at: string;
    alias: string;
    note: string;
    server_url: string;
  }>;
}

interface DatabaseMaintenanceFormProps {
  isAdmin: boolean;
}

export function DatabaseMaintenanceForm({ isAdmin }: DatabaseMaintenanceFormProps) {
  const {
    databaseCleanupPeriod,
    setDatabaseCleanupPeriod,
    cleanupDatabase,
  } = useConfig();
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDeletingServer, setIsDeletingServer] = useState(false);
  const [isDeletingBackupJob, setIsDeletingBackupJob] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupFormat, setBackupFormat] = useState<'db' | 'sql'>('db');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [duplicateServers, setDuplicateServers] = useState<DuplicateServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [selectedBackupJob, setSelectedBackupJob] = useState<string>("");
  const [selectedDuplicateNames, setSelectedDuplicateNames] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();

  // Function to fetch duplicate servers
  const fetchDuplicateServers = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const response = await authenticatedRequestWithRecovery('/api/servers/duplicates');
      if (response.ok) {
        const duplicates = await response.json();
        setDuplicateServers(duplicates);
      }
    } catch (error) {
      console.error('Error fetching duplicate servers:', error instanceof Error ? error.message : String(error));
    }
  }, [isAdmin]);

  // Function to fetch servers and backup jobs
  const fetchServers = useCallback(async () => {
    try {
      // First get basic server information
      const serversResponse = await authenticatedRequestWithRecovery('/api/servers');
      if (serversResponse.ok) {
        const serverList = await serversResponse.json();
        // Sort servers alphabetically by alias with fallback to name
        const sortedServers = serverList.sort((a: Server, b: Server) => 
          (a.alias || a.name).localeCompare(b.alias || b.name)
        );
        setServers(sortedServers);

        // Then get servers with backup information to derive backup jobs
        const serversWithBackupsResponse = await authenticatedRequestWithRecovery('/api/servers?includeBackups=true');
        if (serversWithBackupsResponse.ok) {
          const serversWithBackups = await serversWithBackupsResponse.json();
          
          // Group backup jobs by server
          const serverBackupMap = new Map<string, Set<string>>();
          serversWithBackups.forEach((server: {id: string; backupName: string}) => {
            if (!serverBackupMap.has(server.id)) {
              serverBackupMap.set(server.id, new Set());
            }
            serverBackupMap.get(server.id)!.add(server.backupName);
          });

          // Derive backup jobs from grouped data
          const derivedBackupJobs: BackupJob[] = [];
          serverBackupMap.forEach((backupNames, serverId) => {
            // Find server details from the basic server list
            const serverDetails = sortedServers.find((server: Server) => server.id === serverId);
            if (serverDetails) {
              backupNames.forEach(backupName => {
                derivedBackupJobs.push({
                  id: `${serverId}:${backupName}`,
                  server_id: serverId,
                  server_name: serverDetails.name,
                  backup_name: backupName,
                  server_url: serverDetails.server_url || '',
                  alias: serverDetails.alias || '',
                  note: serverDetails.note || ''
                });
              });
            }
          });
          
          // Sort backup jobs alphabetically by server alias/name, then by backup name
          const sortedBackupJobs = derivedBackupJobs.sort((a: BackupJob, b: BackupJob) => {
            const serverA = a.alias || a.server_name;
            const serverB = b.alias || b.server_name;
            if (serverA !== serverB) {
              return serverA.localeCompare(serverB);
            }
            return a.backup_name.localeCompare(b.backup_name);
          });
          setBackupJobs(sortedBackupJobs);
        }
      }
    } catch (error) {
      console.error('Error fetching servers:', error instanceof Error ? error.message : String(error));
    }
  }, []);

  // Fetch servers and duplicates on component mount
  useEffect(() => {
    fetchServers();
    fetchDuplicateServers();
  }, [fetchServers, fetchDuplicateServers]);

  // Listen for configuration change events to refresh data
  useEffect(() => {
    const handleConfigurationChange = () => {
      fetchServers();
      fetchDuplicateServers();
    };

    window.addEventListener('configuration-saved', handleConfigurationChange);
    
    return () => {
      window.removeEventListener('configuration-saved', handleConfigurationChange);
    };
  }, [fetchServers, fetchDuplicateServers]);

  const handleCleanup = async () => {
    try {
      setIsCleaning(true);
      await cleanupDatabase();
      
      // Show success toast
      toast({
        title: "Database cleaned",
        description: "Old records have been successfully removed.",
        variant: "default",
        duration: 2000,
      });
      
      // Refresh dashboard data using global refresh context
      await refreshDashboard();
      
    } catch (error) {
      console.error('Error in handleCleanup:', error instanceof Error ? error.message : String(error));
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred. Please try again.';
      
      // Show detailed error toast
      toast({
        title: "Database Cleanup Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!selectedServer) return;

    try {
      setIsDeletingServer(true);
      
      // Find the selected server details for the toast
      const selectedServerDetails = servers.find(server => server.id === selectedServer);
      const serverDisplayName = selectedServerDetails ? (selectedServerDetails.alias || selectedServerDetails.name) : 'Unknown Server';
      
      const response = await authenticatedRequestWithRecovery(`/api/servers/${selectedServer}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete server');
      }

      const result = await response.json();
      
      // Show success toast
      toast({
        title: `Server "${serverDisplayName}" deleted`,
        description: `${result.message}`,
        variant: "default",
        duration: 3000,
      });
      
      // Reset selected server
      setSelectedServer("");
      
      // Refresh servers and backup jobs
      await fetchServers();
      
      // Refresh dashboard data using global refresh context
      await refreshDashboard();
      
      // Also refresh configuration data to update server lists in configuration tabs
      await refreshConfigSilently();
      
      // Dispatch configuration-saved event to update toolbar components (Duplicati config and collect buttons)
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
    } catch (error) {
      console.error('Error deleting server:', error instanceof Error ? error.message : String(error));
      
      // Find the selected server details for the error toast
      const selectedServerDetails = servers.find(server => server.id === selectedServer);
      const serverDisplayName = selectedServerDetails ? (selectedServerDetails.alias || selectedServerDetails.name) : 'Unknown Server';
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete server. Please try again.';
      
      // Show detailed error toast
      toast({
        title: `Server "${serverDisplayName}" Deletion Failed`,
        description: `${errorMessage}`,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeletingServer(false);
    }
  };

  const handleDeleteBackupJob = async () => {
    if (!selectedBackupJob) return;

    try {
      setIsDeletingBackupJob(true);
      
      // Find the selected backup job details for the toast
      const selectedBackupJobDetails = backupJobs.find(job => job.id === selectedBackupJob);
      const backupJobName = selectedBackupJobDetails?.backup_name || 'Unknown Backup';
      
      const response = await authenticatedRequestWithRecovery('/api/backups/delete-job', {
        method: 'DELETE',
        body: JSON.stringify({
          serverId: selectedBackupJobDetails?.server_id,
          backupName: selectedBackupJobDetails?.backup_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete backup job');
      }

      const result = await response.json();
      
      // Show success toast
      toast({
        title: `Backup Job "${backupJobName}" deleted`,
        description: `${result.message}`,
        variant: "default",
        duration: 3000,
      });
      
      // Reset selected backup job
      setSelectedBackupJob("");
      
      // Refresh servers and backup jobs
      await fetchServers();
      
      // Refresh dashboard data using global refresh context
      await refreshDashboard();
      
      // Also refresh configuration data to update server lists in configuration tabs
      await refreshConfigSilently();
      
      // Dispatch configuration-saved event to update toolbar components (Duplicati config and collect buttons)
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
    } catch (error) {
      console.error('Error deleting backup job:', error instanceof Error ? error.message : String(error));
      
      // Find the selected backup job details for the error toast
      const selectedBackupJobDetails = backupJobs.find(job => job.id === selectedBackupJob);
      const backupJobName = selectedBackupJobDetails?.backup_name || 'Unknown Backup';
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete backup job. Please try again.';
      
      // Show detailed error toast
      toast({
        title: `Backup Job "${backupJobName}" Deletion Failed`,
        description: `${errorMessage}`,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeletingBackupJob(false);
    }
  };

  const handleToggleDuplicate = (serverName: string) => {
    const newSelected = new Set(selectedDuplicateNames);
    if (newSelected.has(serverName)) {
      newSelected.delete(serverName);
    } else {
      newSelected.add(serverName);
    }
    setSelectedDuplicateNames(newSelected);
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      
      // Get CSRF token
      const csrfResponse = await authenticatedRequestWithRecovery('/api/csrf');
      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }
      const { csrfToken } = await csrfResponse.json();
      
      // Download backup
      const backupResponse = await fetch(`/api/database/backup?format=${backupFormat}`, {
        method: 'GET',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
      });
      
      if (!backupResponse.ok) {
        const errorData = await backupResponse.json();
        throw new Error(errorData.error || 'Failed to create backup');
      }
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = backupResponse.headers.get('Content-Disposition');
      let filename = `backups-${new Date().toISOString().split('T')[0]}.${backupFormat}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Download file
      const blob = await backupResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Backup created",
        description: `Database backup downloaded successfully as ${filename}`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error creating backup:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : 'Failed to create backup. Please try again.',
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      toast({
        title: "No file selected",
        description: "Please select a database backup file to restore.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setIsRestoring(true);
      
      // Get CSRF token
      const csrfResponse = await authenticatedRequestWithRecovery('/api/csrf');
      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }
      const { csrfToken } = await csrfResponse.json();
      
      // Create form data
      const formData = new FormData();
      formData.append('database', restoreFile);
      
      // Upload and restore
      const restoreResponse = await fetch('/api/database/restore', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: formData,
      });
      
      if (restoreResponse.ok) {
        const result = await restoreResponse.json();
        toast({
          title: "Database restored",
          description: result.requiresReauth 
            ? `${result.message || 'Database restored successfully'}. You will need to log in again.`
            : result.message || 'Database restored successfully',
          variant: "default",
          duration: 8000,
        });
        
        // Reset file input
        setRestoreFile(null);
        
        // If reauth is required, redirect to login after a short delay
        if (result.requiresReauth) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        // Refresh dashboard and configuration
        await refreshDashboard();
        await refreshConfigSilently();
        window.dispatchEvent(new CustomEvent('configuration-saved'));
      } else {
        const errorData = await restoreResponse.json();
        throw new Error(errorData.error || errorData.details || 'Failed to restore database');
      }
    } catch (error) {
      console.error('Error restoring database:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Restore Failed",
        description: error instanceof Error ? error.message : 'Failed to restore database. Please try again.',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleMergeSelectedServers = async () => {
    if (selectedDuplicateNames.size === 0) {
      toast({
        title: "No servers selected",
        description: "Please select at least one server group to merge.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Process each selected server group
    const mergePromises = Array.from(selectedDuplicateNames).map(async (serverName) => {
      const duplicateGroup = duplicateServers.find(d => d.name === serverName);
      if (!duplicateGroup || duplicateGroup.servers.length < 2) return;

      // Find the target server (newest by created_at)
      const sortedServers = [...duplicateGroup.servers].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        // Handle invalid dates - put them last
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      });
      const targetServer = sortedServers[0];
      
      // Get old server IDs (all except the target)
      const oldServerIds = sortedServers.slice(1).map(s => s.id).filter(id => id && id !== targetServer.id);
      
      if (oldServerIds.length === 0) return;

      const response = await authenticatedRequestWithRecovery('/api/servers/merge', {
        method: 'POST',
        body: JSON.stringify({
          oldServerIds,
          targetServerId: targetServer.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to merge ${serverName}: ${errorData.error || 'Unknown error'}`);
      }

      return { serverName, count: oldServerIds.length };
    });

    try {
      setIsMerging(true);
      
      const results = await Promise.all(mergePromises);
      const successfulMerges = results.filter(r => r !== undefined);
      const totalMerged = successfulMerges.reduce((sum, r) => sum + (r?.count || 0), 0);
      
      toast({
        title: "Servers merged successfully",
        description: `Successfully merged ${totalMerged} server(s) across ${successfulMerges.length} server group(s).`,
        variant: "default",
        duration: 3000,
      });
      
      // Clear selections
      setSelectedDuplicateNames(new Set());
      
      // Refresh data
      await fetchServers();
      await fetchDuplicateServers();
      await refreshDashboard();
      await refreshConfigSilently();
      
      // Dispatch configuration-saved event to update toolbar components (Duplicati config and collect buttons)
      window.dispatchEvent(new CustomEvent('configuration-saved'));
      
    } catch (error) {
      console.error('Error merging servers:', error instanceof Error ? error.message : String(error));
      
      toast({
        title: "Merge Failed",
        description: error instanceof Error ? error.message : 'Failed to merge servers. Please try again.',
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Database} color="blue" size="md" />
            Database Maintenance
          </CardTitle>
          <CardDescription>
            Reduce database size by cleaning up old records and managing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAdmin && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You are viewing this in read-only mode. Only administrators can perform maintenance operations.
              </p>
            </div>
          )}

          {/* Database Backup & Restore Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={Download} color="green" size="sm" />
                  Database Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="backup-format">
                    Backup Format
                  </Label>
                  <Select
                    value={backupFormat}
                    onValueChange={(value) => setBackupFormat(value as 'db' | 'sql')}
                    disabled={!isAdmin || isBackingUp}
                  >
                    <SelectTrigger id="backup-format" disabled={!isAdmin || isBackingUp}>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="db">Database File (.db)</SelectItem>
                      <SelectItem value="sql">SQL Dump (.sql)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {backupFormat === 'db' 
                      ? 'Binary database file - fastest backup, preserves all database structure'
                      : 'SQL text file - human-readable, can be edited before restore'}
                  </p>
                </div>
                
                <div className="flex">
                  <Button 
                    variant="gradient" 
                    disabled={!isAdmin || isBackingUp}
                    onClick={handleBackup}
                    className="relative overflow-hidden"
                  >
                    {isBackingUp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Backup
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create a backup of the entire database. The backup will be downloaded to your computer.
                </p>
              </CardContent>
            </Card>

            {/* Restore Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={Upload} color="orange" size="sm" />
                  Database Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="restore-file">
                    Select Backup File
                  </Label>
                  <Input
                    id="restore-file"
                    type="file"
                    accept=".db,.sql,.sqlite,.sqlite3"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setRestoreFile(file);
                    }}
                    disabled={!isAdmin || isRestoring}
                    className="border-0 bg-transparent p-0 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {restoreFile ? (
                    <p className="text-sm text-muted-foreground">
                      Selected: {restoreFile.name} ({(restoreFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a .db or .sql backup file to restore. This will replace the current database.
                    </p>
                  )}
                </div>
                
                <div className="flex">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="gradient" 
                        disabled={!isAdmin || isRestoring || !restoreFile}
                        className="relative overflow-hidden"
                      >
                        {isRestoring ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Restore Database
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restore Database?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will replace the current database with the backup file. All current data will be lost unless you have a backup. 
                          A safety backup of the current database will be created automatically before restore.
                          <br /><br />
                          <strong>This action cannot be undone.</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleRestore} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Restore Database
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-destructive">Warning:</span> Restoring will replace all current database data. A safety backup will be created automatically.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 2-Column Layout for Database Cleanup and Delete Backup Job */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Cleanup Period Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={Clock} color="blue" size="sm" />
                  Database Cleanup Period
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="database-cleanup">
                  Select cleanup period
                </Label>
                <Select
                value={databaseCleanupPeriod}
                onValueChange={(value) => setDatabaseCleanupPeriod(value as "Delete all data" | "6 months" | "1 year" | "2 years")}
                disabled={!isAdmin}
              >
                <SelectTrigger id="database-cleanup" disabled={!isAdmin}>
                  <SelectValue placeholder="Select cleanup period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delete all data">Delete all data</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                  <SelectItem value="2 years">2 years</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select how long backup records are kept in the database.
              </p>
            </div>

            <div className="flex">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="gradient" 
                    disabled={!isAdmin || isCleaning}
                    className="relative overflow-hidden"
                  >
                  {isCleaning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Old Records
                    </>
                  )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all backup records older than the selected cleanup period. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCleanup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <p className="text-sm text-muted-foreground">
              This will remove all backup records older than the selected cleanup period.
              <span className="font-medium"> Manual action required</span> - you must click the button to perform the cleanup.
            </p>
              </CardContent>
            </Card>

            {/* Delete Backup Job Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={FolderOpen} color="yellow" size="sm" />
                  Delete Backup Job
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="backup-job-select">
                  Select backup job
                </Label>
                <Select
                value={selectedBackupJob}
                onValueChange={setSelectedBackupJob}
                disabled={!isAdmin}
              >
                <SelectTrigger id="backup-job-select" disabled={!isAdmin}>
                  <SelectValue placeholder="Select backup job to delete" />
                </SelectTrigger>
                <SelectContent>
                  {backupJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.alias ? `${job.alias} (${job.server_name})` : job.server_name} - {job.backup_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select a backup job to delete all its backup records permanently.
              </p>
            </div>
            
            <div className="flex">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="gradient" 
                    disabled={!isAdmin || isDeletingBackupJob || !selectedBackupJob}
                    className="relative overflow-hidden"
                  >
                  {isDeletingBackupJob ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Delete Backup Job
                    </>
                  )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Backup Job?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {(() => {
                        const selectedBackupJobDetails = backupJobs.find(job => job.id === selectedBackupJob);
                        const serverDisplayName = selectedBackupJobDetails ? (selectedBackupJobDetails.alias || selectedBackupJobDetails.server_name) : 'Unknown Server';
                        const backupJobName = selectedBackupJobDetails?.backup_name || 'Unknown Backup';
                        return `This will permanently delete all backup records for "${backupJobName}" from server "${serverDisplayName}". This action cannot be undone.`;
                      })()}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBackupJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Backup Job
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
              </CardContent>
            </Card>
          </div>

          {/* 2-Column Layout for Delete Server Data and Duplicate Servers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delete Server Data Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={Server} color="red" size="sm" />
                  Delete Server Data
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 min-w-0">
              <div className="grid gap-2">
                <Label htmlFor="server-select">
                  Select server
                </Label>
                <Select
                value={selectedServer}
                onValueChange={setSelectedServer}
                disabled={!isAdmin}
              >
                <SelectTrigger id="server-select" disabled={!isAdmin}>
                  <SelectValue placeholder="Select server to delete" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.alias ? `${server.alias} (${server.name})` : server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select a server to delete all its backup data permanently.
              </p>
            </div>
            
            <div className="flex">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="gradient" 
                    disabled={!isAdmin || isDeletingServer || !selectedServer}
                    className="relative overflow-hidden"
                  >
                  {isDeletingServer ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Server className="mr-2 h-4 w-4" />
                      Delete Server Data
                    </>
                  )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Server Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {(() => {
                        const selectedServerDetails = servers.find(server => server.id === selectedServer);
                        const serverDisplayName = selectedServerDetails ? (selectedServerDetails.alias || selectedServerDetails.name) : 'Unknown Server';
                        return `This will permanently delete server "${serverDisplayName}" and all its backup records. This action cannot be undone.`;
                      })()}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteServer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Server
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
              </CardContent>
            </Card>

            {/* Duplicate Servers Section */}
            {isAdmin && duplicateServers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ColoredIcon icon={GitMerge} color="purple" size="sm" />
                    Merge Duplicate Servers
                  </CardTitle>
                  <CardDescription>
                    Select server groups to merge. These servers have the same name but different IDs.
                    <span className="inline ml-1">
                      <span className="relative group">
                        <Info className="inline w-4 h-4 align-text-bottom text-blue-500 cursor-pointer" />
                        <span className="absolute z-10 right-0 bottom-full mb-2 w-max max-w-md bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg border border-gray-200 dark:border-gray-800 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity pointer-events-none">
                          Duplicati&apos;s machine-id can be changed after an upgrade or reinstall.
                          <br />
                          All backup logs and configurations will be transferred to the target servers.
                        </span>
                      </span>
                    </span>
                    <br />
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 min-w-0">

              <div className="space-y-4">
                {duplicateServers.map((duplicate) => {
                  const isSelected = selectedDuplicateNames.has(duplicate.name);
                  // Sort servers by created_at (newest first) to identify target
                  const sortedServers = [...duplicate.servers].sort((a, b) => {
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    // Handle invalid dates - put them last
                    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;
                    return dateB.getTime() - dateA.getTime();
                  });
                  const targetServer = sortedServers[0];
                  const oldServers = sortedServers.slice(1);
                  
                  return (
                    <div key={duplicate.name} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleDuplicate(duplicate.name)}
                          disabled={isMerging}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-3">
                            Server Name: <span className="font-semibold">{duplicate.name}</span>
                          </div>
                          <div className="overflow-x-auto min-w-0">
                            <table className="w-full text-sm border-collapse min-w-0">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2 font-medium">
                                    <span className="inline-block px-2 py-1 rounded-md bg-blue-700 dark:bg-blue-800 text-blue-100 dark:text-blue-200 shadow-inner border border-blue-600 dark:border-blue-700">
                                      Target Server (newest)
                                    </span>
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    <span className="inline-block px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                                      Old Server ID
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="p-2 align-top break-words">
                                    <div className="space-y-1">
                                      <div className="font-medium break-all">{targetServer.id || 'N/A'}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Created: {targetServer.created_at && !isNaN(new Date(targetServer.created_at).getTime()) 
                                          ? new Date(targetServer.created_at).toLocaleString() 
                                          : 'Invalid Date'}
                                      </div>
                                      {targetServer.alias && (
                                        <div className="text-xs text-muted-foreground">Alias: {targetServer.alias}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2 align-top break-words">
                                    <div className="space-y-2">
                                      {oldServers.length > 0 ? (
                                        oldServers.map((server, idx) => (
                                          <div key={server.id || idx} className="space-y-1">
                                            <div className="font-medium break-all">{server.id || 'N/A'}</div>
                                            <div className="text-xs text-muted-foreground">
                                              Created: {server.created_at && !isNaN(new Date(server.created_at).getTime()) 
                                                ? new Date(server.created_at).toLocaleString() 
                                                : 'Invalid Date'}
                                            </div>
                                            {server.alias && (
                                              <div className="text-xs text-muted-foreground">Alias: {server.alias}</div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-muted-foreground">None</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedDuplicateNames.size > 0 && (
                <div className="flex justify-end pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="gradient"
                        disabled={isMerging}
                        className="relative overflow-hidden"
                      >
                        {isMerging ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Merging...
                          </>
                        ) : (
                          <>
                            <GitMerge className="mr-2 h-4 w-4" />
                            Merge Selected Servers ({selectedDuplicateNames.size})
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Merge Duplicate Servers?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will merge {selectedDuplicateNames.size} server group(s). For each group, all old server IDs will be merged into the target server (newest by creation date). All backup records and configurations will be transferred to the target servers. The old server entries will be deleted. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleMergeSelectedServers}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Merge Servers
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
                </CardContent>
              </Card>
            )}

            {isAdmin && duplicateServers.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ColoredIcon icon={GitMerge} color="purple" size="sm" />
                    Duplicate Servers
                  </CardTitle>
                  <CardDescription>
                    No duplicate servers found. All servers have unique names.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

