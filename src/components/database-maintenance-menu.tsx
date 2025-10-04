"use client";

import { Database, Loader2, Trash2, Server, FolderOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GradientCardHeader } from "@/components/ui/card";
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { ColoredIcon } from "@/components/ui/colored-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { useConfig } from "@/contexts/config-context";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { useConfiguration } from "@/contexts/configuration-context";

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

export function DatabaseMaintenanceMenu() {
  const {
    databaseCleanupPeriod,
    setDatabaseCleanupPeriod,
    cleanupDatabase,
  } = useConfig();
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDeletingServer, setIsDeletingServer] = useState(false);
  const [isDeletingBackupJob, setIsDeletingBackupJob] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [selectedBackupJob, setSelectedBackupJob] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();

  // Function to fetch servers and backup jobs
  const fetchServers = async () => {
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
  };

  // Fetch servers on component mount
  useEffect(() => {
    fetchServers();
  }, []);

  // Listen for configuration change events to refresh data
  useEffect(() => {
    const handleConfigurationChange = () => {
      fetchServers();
    };

    window.addEventListener('configuration-saved', handleConfigurationChange);
    
    return () => {
      window.removeEventListener('configuration-saved', handleConfigurationChange);
    };
  }, []);

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
      
      // Close the menu after successful execution
      setIsOpen(false);
      
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
        title: `Server "${serverDisplayName}"	 deleted`,
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
      
      // Close the menu after successful execution
      setIsOpen(false);
      
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
      
      // Close the menu after successful execution
      setIsOpen(false);
      
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="Database maintenance">
          <Database className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 shadow-lg backdrop-blur-sm bg-popover/95 border-border/50">
        <div className="grid gap-4">
          <GradientCardHeader>
            <h4 className="text-lg font-semibold leading-none text-white">Database Maintenance</h4>
          </GradientCardHeader>
          <div className="px-1 -mt-2">
            <p className="text-xs text-muted-foreground">
              Reduce database size by cleaning up old records and managing data
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="database-cleanup" className="flex items-center gap-2">
                <ColoredIcon icon={Clock} color="blue" size="sm" />
                Database Cleanup Period
              </Label>
              <Select
                value={databaseCleanupPeriod}
                onValueChange={(value) => setDatabaseCleanupPeriod(value as "Delete all data" | "6 months" | "1 year" | "2 years")}
              >
                <SelectTrigger id="database-cleanup">
                  <SelectValue placeholder="Select cleanup period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delete all data">Delete all data</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                  <SelectItem value="2 years">2 years</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select how long backup records are kept in the database. 
              </p>
            </div>
            <div className="grid gap-1.5">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="gradient" 
                    disabled={isCleaning}
                    className="w-full relative overflow-hidden"
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
              <p className="text-xs text-muted-foreground">
                This will remove all backup records older than the selected cleanup period.
                <u>Manual action required</u> - you must click the button to perform the cleanup.
              </p>
            </div>
            
            {/* Backup Job Deletion Section */}
            <div className="grid gap-1.5 border-t pt-3">
              <Label htmlFor="backup-job-select" className="flex items-center gap-2">
                <ColoredIcon icon={FolderOpen} color="yellow" size="sm" />
                Delete Backup Job
              </Label>
              <Select
                value={selectedBackupJob}
                onValueChange={setSelectedBackupJob}
              >
                <SelectTrigger id="backup-job-select">
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
              <p className="text-xs text-muted-foreground">
                Select a backup job to delete all its backup records permanently.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={isDeletingBackupJob || !selectedBackupJob}
                    className="btn-amber-clear"
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
            
            {/* Server Deletion Section */}
            <div className="grid gap-1.5 border-t pt-3">
              <Label htmlFor="server-select" className="flex items-center gap-2">
                <ColoredIcon icon={Server} color="red" size="sm" />
                Delete Server Data
              </Label>
              <Select
                value={selectedServer}
                onValueChange={setSelectedServer}
              >
                <SelectTrigger id="server-select">
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
              <p className="text-xs text-muted-foreground">
                Select a server to delete all its backup data permanently.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isDeletingServer || !selectedServer}
                    className="mt-2"
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 