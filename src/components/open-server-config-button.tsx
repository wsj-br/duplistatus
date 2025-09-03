"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useToast } from '@/components/ui/use-toast';
import { ServerIcon } from '@/components/ui/server-icon';
import { Settings } from 'lucide-react';
import { useMachineSelection } from '@/contexts/machine-selection-context';
import { MachineAddress } from '@/lib/types';

export function OpenServerConfigButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [machineAddresses, setMachineAddresses] = useState<MachineAddress[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state: machineSelectionState, getSelectedMachine } = useMachineSelection();

  const fetchMachineAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we're on a machine detail page
      if (pathname.startsWith('/detail/')) {
        // On detail page, don't fetch machine connections for popup
        // The popup should not be shown for single machines
        setMachineAddresses([]);
        return;
      }
      
      // Fetch all machines from the new server-connections endpoint
      const response = await fetch('/api/configuration/server-connections');
      if (!response.ok) {
        throw new Error('Failed to fetch server connections');
      }
      const data = await response.json();
      
      // Filter machines with valid HTTP/HTTPS server_url
      const validMachines = (data.machineAddresses || [])
        .filter((machine: MachineAddress) => {
          if (!machine.server_url || machine.server_url.trim() === '') return false;
          try {
            const url = new URL(machine.server_url);
            return ['http:', 'https:'].includes(url.protocol);
          } catch {
            return false;
          }
        })
        .sort((a: MachineAddress, b: MachineAddress) => 
          a.name.localeCompare(b.name)
        );
      
      setMachineAddresses(validMachines);
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
    if (isPopoverOpen && machineAddresses.length === 0) {
      fetchMachineAddresses();
    }
  }, [isPopoverOpen, machineAddresses.length, fetchMachineAddresses]);

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

  const handleSettingsClick = () => {
    router.push('/settings?tab=addresses');
    setIsPopoverOpen(false);
  };

  const handleButtonClick = async () => {
    // Check if we're on a machine detail page (including backup detail pages)
    if (pathname.startsWith('/detail/')) {
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
    
    // Check if we have a selected machine on dashboard
    if (pathname === '/' && machineSelectionState.viewMode === 'cards' && machineSelectionState.selectedMachineId) {
      const selectedMachine = getSelectedMachine();
      if (selectedMachine && selectedMachine.server_url && selectedMachine.server_url.trim() !== '') {
        try {
          const url = new URL(selectedMachine.server_url);
          if (['http:', 'https:'].includes(url.protocol)) {
            window.open(selectedMachine.server_url, '_blank', 'noopener,noreferrer');
            return;
          }
        } catch {
          // Invalid URL, fall through to popover
        }
      }
    }
    
    // Only open popover if no machine is selected or no valid server URL
    setIsPopoverOpen(true);
  };

  return (
    <Popover 
      open={isPopoverOpen} 
      onOpenChange={(open) => {
        // Only allow closing the popover manually (when user clicks outside or presses escape)
        // Don't allow opening via onOpenChange - that should only happen via button click
        if (!open && isPopoverOpen) {
          setIsPopoverOpen(false);
        }
        // If trying to open via onOpenChange, ignore it - only button click should open
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleButtonClick}
          disabled={isLoading}
          title="Duplicati configuration"
        >
          <ServerIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
            <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Open Duplicati Configuration</h4>
            <p className="text-sm text-muted-foreground">
               Select a server below to manage its settings and backups.
            </p>
          </div>
          <div className="grid gap-2">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading server connections...
              </div>
            ) : machineAddresses.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No machines with server URLs configured.
              </div>
            ) : (
              machineAddresses.map((machine: MachineAddress) => (
                <button
                  key={machine.id}
                  onClick={() => handleMachineClick(machine.server_url)}
                  className="flex items-center gap-3 p-2 text-left hover:bg-muted rounded-md transition-colors border border-border"
                >
                  <ServerIcon className="h-4 w-4" />
                  <span className="font-medium">{machine.name}</span>
                </button>
              ))
            )}
          </div>
          <div className="space-y-3">
            <div className="h-px bg-border"></div>
            <button
              className="text-xs flex items-center gap-1 hover:text-blue-500 transition-colors px-2 py-1 rounded w-full text-left"
              onClick={handleSettingsClick}
            >
              <Settings className="h-3 w-3" />
              <span>Configure addresses</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
