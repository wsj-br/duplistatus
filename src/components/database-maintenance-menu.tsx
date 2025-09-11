"use client";

import { Database, Loader2, Trash2, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
}

export function DatabaseMaintenanceMenu() {
  const {
    databaseCleanupPeriod,
    setDatabaseCleanupPeriod,
    cleanupDatabase,
  } = useConfig();
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDeletingServer, setIsDeletingServer] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();

  // Fetch servers on component mount
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('/api/servers');
        if (response.ok) {
          const serverList = await response.json();
          // Sort servers alphabetically by alias with fallback to name
          const sortedServers = serverList.sort((a: Server, b: Server) => 
            (a.alias || a.name).localeCompare(b.alias || b.name)
          );
          setServers(sortedServers);
        }
      } catch (error) {
        console.error('Error fetching servers:', error instanceof Error ? error.message : String(error));
      }
    };

    fetchServers();
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
      
      const response = await fetch(`/api/servers/${selectedServer}`, {
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
      
      // Refresh servers list
      const serversResponse = await fetch('/api/servers');
      if (serversResponse.ok) {
        const serverList = await serversResponse.json();
        // Sort servers alphabetically by alias with fallback to name
        const sortedServers = serverList.sort((a: Server, b: Server) => 
          (a.alias || a.name).localeCompare(b.alias || b.name)
        );
        setServers(sortedServers);
      }
      
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="Database maintenance">
          <Database className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Database Maintenance</h4>
            <p className="text-sm text-muted-foreground">
              Reduce the size of the database by cleaning up old records.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="database-cleanup">Database Cleanup Period</Label>
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
            <div className="grid gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isCleaning}
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
            
            {/* Server Deletion Section */}
            <div className="grid gap-2 border-t pt-4">
              <Label htmlFor="server-select">Delete Server Data</Label>
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