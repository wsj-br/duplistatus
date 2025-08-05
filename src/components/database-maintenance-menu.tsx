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
import { usePathname, useRouter } from "next/navigation";

interface Machine {
  id: string;
  name: string;
}

export function DatabaseMaintenanceMenu() {
  const {
    databaseCleanupPeriod,
    setDatabaseCleanupPeriod,
    cleanupDatabase,
  } = useConfig();
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDeletingMachine, setIsDeletingMachine] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  // Fetch machines on component mount
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/machines');
        if (response.ok) {
          const machineList = await response.json();
          // Sort machines alphabetically by name
          const sortedMachines = machineList.sort((a: Machine, b: Machine) => 
            a.name.localeCompare(b.name)
          );
          setMachines(sortedMachines);
        }
      } catch (error) {
        console.error('Error fetching machines:', error instanceof Error ? error.message : String(error));
      }
    };

    fetchMachines();
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
      
      // Navigate to dashboard and refresh its contents
      router.push('/');
      
      // Wait a short delay to ensure navigation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force a complete refresh of the dashboard data
      router.refresh();
      
      // Additional refresh for the dashboard page
      if (pathname === '/') {
        window.location.reload();
      }
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

  const handleDeleteMachine = async () => {
    if (!selectedMachine) return;

    try {
      setIsDeletingMachine(true);
      
      const response = await fetch(`/api/machines/${selectedMachine}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete machine');
      }

      const result = await response.json();
      
      // Show success toast
      toast({
        title: "Machine deleted",
        description: result.message,
        variant: "default",
        duration: 2000,
      });
      
      // Reset selected machine
      setSelectedMachine("");
      
      // Refresh machines list
      const machinesResponse = await fetch('/api/machines');
      if (machinesResponse.ok) {
        const machineList = await machinesResponse.json();
        // Sort machines alphabetically by name
        const sortedMachines = machineList.sort((a: Machine, b: Machine) => 
          a.name.localeCompare(b.name)
        );
        setMachines(sortedMachines);
      }
      
      // Navigate to dashboard and refresh its contents
      router.push('/');
      
      // Wait a short delay to ensure navigation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force a complete refresh of the dashboard data
      router.refresh();
      
      // Additional refresh for the dashboard page
      if (pathname === '/') {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error deleting machine:', error instanceof Error ? error.message : String(error));
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete machine. Please try again.';
      
      // Show detailed error toast
      toast({
        title: "Machine Deletion Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeletingMachine(false);
    }
  };

  return (
    <Popover>
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
            
            {/* Machine Deletion Section */}
            <div className="grid gap-2 border-t pt-4">
              <Label htmlFor="machine-select">Delete Machine Data</Label>
              <Select
                value={selectedMachine}
                onValueChange={setSelectedMachine}
              >
                <SelectTrigger id="machine-select">
                  <SelectValue placeholder="Select machine to delete" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a machine to delete all its backup data permanently.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isDeletingMachine || !selectedMachine}
                    className="mt-2"
                  >
                    {isDeletingMachine ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Server className="mr-2 h-4 w-4" />
                        Delete Machine Data
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Machine Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the selected machine and all its backup records. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMachine} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Machine
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