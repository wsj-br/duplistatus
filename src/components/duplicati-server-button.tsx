"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { ServerIcon } from '@/components/ui/server-icon';
import { useMachineSelection } from '@/contexts/machine-selection-context';

interface MachineConnection {
  id: string;
  name: string;
  server_url: string;
}

export function DuplicatiServerButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [machineConnections, setMachineConnections] = useState<MachineConnection[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  const { state: machineSelectionState, getSelectedMachine } = useMachineSelection();

  const fetchMachineConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we're on a machine detail page
      if (pathname.startsWith('/detail/')) {
        // On detail page, don't fetch machine connections for popup
        // The popup should not be shown for single machines
        setMachineConnections([]);
        return;
      }
      
      // Fetch all machines from the new server-connections endpoint
      const response = await fetch('/api/configuration/server-connections');
      if (!response.ok) {
        throw new Error('Failed to fetch server connections');
      }
      const data = await response.json();
      
      // Filter machines with valid HTTP/HTTPS server_url
      const validMachines = (data.machineConnections || [])
        .filter((machine: MachineConnection) => {
          if (!machine.server_url || machine.server_url.trim() === '') return false;
          try {
            const url = new URL(machine.server_url);
            return ['http:', 'https:'].includes(url.protocol);
          } catch {
            return false;
          }
        })
        .sort((a: MachineConnection, b: MachineConnection) => 
          a.name.localeCompare(b.name)
        );
      
      setMachineConnections(validMachines);
    } catch (error) {
      console.error('Error fetching machine connections:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to load server connections",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, pathname]);

  // Fetch machine connections when popover opens
  useEffect(() => {
    if (isPopoverOpen && machineConnections.length === 0) {
      fetchMachineConnections();
    }
  }, [isPopoverOpen, machineConnections.length, fetchMachineConnections]);

  const handleMachineClick = (serverUrl: string) => {
    try {
      window.open(serverUrl, '_blank', 'noopener,noreferrer');
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Error opening server URL:', error);
      toast({
        title: "Error",
        description: "Failed to open server URL",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleButtonClick = async () => {
    // Check if we're on a machine detail page (including backup detail pages)
    if (pathname.startsWith('/detail/')) {
      
      // Ensure popup is closed on detail pages
      if (isPopoverOpen) {
        setIsPopoverOpen(false);
      }
      
      // Extract machineId from the pathname
      const pathMatch = pathname.match(/^\/detail\/([^\/\?]+)/);
      const currentMachineId = pathMatch ? pathMatch[1] : undefined;
      
      if (currentMachineId) {
        try {
          const response = await fetch(`/api/machines/${currentMachineId}/server-url`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch machine server URL: ${response.status}`);
          }
          
          const data = await response.json();
          
          // The server-url endpoint returns { machineId, server_url }
          const serverUrl = data.server_url;
          
          if (serverUrl && serverUrl.trim() !== '') {
            try {
              const url = new URL(serverUrl);
              
              if (['http:', 'https:'].includes(url.protocol)) {
                window.open(serverUrl, '_blank', 'noopener,noreferrer');
                // Don't show popup when successfully opening server URL
                return;
              }
            } catch {
              // Invalid URL, fall through to show popover
            }
          }
          
          // If no valid server_url, show popover with all machines
          setIsPopoverOpen(true);
        } catch (error) {
          console.error('Error fetching machine data:', error);
          // Fall back to showing popover
          setIsPopoverOpen(true);
        }
        return;
      } else {
        // Even on detail page, if we can't get machineId, show popover
        setIsPopoverOpen(true);
        return;
      }
    }
    
    // Check if we're on dashboard page and have a selected machine in cards view
    if (pathname === '/' && machineSelectionState.viewMode === 'cards' && machineSelectionState.selectedMachineId) {
      const selectedMachine = getSelectedMachine();
      
      if (selectedMachine && selectedMachine.server_url && selectedMachine.server_url.trim() !== '') {
        try {
          const url = new URL(selectedMachine.server_url);
          
          if (['http:', 'https:'].includes(url.protocol)) {
            // Open the selected machine's server directly
            window.open(selectedMachine.server_url, '_blank', 'noopener,noreferrer');
            return;
          }
        } catch {
          // Invalid URL, fall through to show popover
        }
      }
      
      // If selected machine has no valid server_url, fall back to popover
      setIsPopoverOpen(true);
      return;
    }
    
    // For all other cases (dashboard in table view, no machine selected, etc.), show popover
    setIsPopoverOpen(true);
  };

  return (
    <Popover 
      open={isPopoverOpen} 
      onOpenChange={(open) => {
        // Prevent popup from opening on detail pages unless explicitly needed
        if (open && pathname.startsWith('/detail/')) {
          return;
        }
        setIsPopoverOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleButtonClick}
          disabled={isLoading}
          title="Connect to Duplicati server"
        >
          <ServerIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Connect to Duplicati Server</h4>
            <p className="text-sm text-muted-foreground">
              Select a machine to connect to its Duplicati server.
            </p>
          </div>
          <div className="grid gap-2">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading server connections...
              </div>
            ) : machineConnections.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No machines with server URLs configured.
              </div>
            ) : (
              machineConnections.map((machine) => (
                <button
                  key={machine.id}
                  onClick={() => handleMachineClick(machine.server_url)}
                  className="flex items-center justify-between p-1 text-left hover:bg-muted rounded-md transition-colors"
                >
                  <span className="font-medium">{machine.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
