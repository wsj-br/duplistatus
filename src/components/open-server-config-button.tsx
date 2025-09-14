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
import { useServerSelection } from '@/contexts/server-selection-context';
import { ServerAddress } from '@/lib/types';

export function OpenServerConfigButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverAddresses, setServerAddresses] = useState<ServerAddress[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state: serverSelectionState, getSelectedServer } = useServerSelection();

  const fetchServerAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we're on a server detail page
      if (pathname.startsWith('/detail/')) {
        // On detail page, don't fetch server connections for popup
        // The popup should not be shown for single servers
        setServerAddresses([]);
        return;
      }
      
      // Fetch all servers from the existing servers endpoint
      const response = await fetch('/api/servers?includeBackups=true');
      if (!response.ok) {
        throw new Error('Failed to fetch server connections');
      }
      const data = await response.json();
      
      // Filter servers with valid HTTP/HTTPS server_url and remove duplicates
      const validServers = (data || [])
        .filter((server: ServerAddress) => {
          if (!server.server_url || server.server_url.trim() === '') return false;
          try {
            const url = new URL(server.server_url);
            return ['http:', 'https:'].includes(url.protocol);
          } catch {
            return false;
          }
        })
        .reduce((uniqueServers: ServerAddress[], server: ServerAddress) => {
          // Check if we already have a server with this URL
          const existingServer = uniqueServers.find(s => s.server_url === server.server_url);
          if (!existingServer) {
            uniqueServers.push(server);
          }
          return uniqueServers;
        }, [])
        .sort((a: ServerAddress, b: ServerAddress) => {
          const aDisplayName = a.alias || a.name;
          const bDisplayName = b.alias || b.name;
          return aDisplayName.localeCompare(bDisplayName);
        });
      
      setServerAddresses(validServers);
    } catch (error) {
      console.error('Error fetching server connections:', error instanceof Error ? error.message : String(error));
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

  // Fetch server connections when popover opens
  useEffect(() => {
    if (isPopoverOpen && serverAddresses.length === 0) {
      fetchServerAddresses();
    }
  }, [isPopoverOpen, serverAddresses.length, fetchServerAddresses]);

  const handleServerClick = (serverUrl: string) => {
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
    // Check if we're on a server detail page (including backup detail pages)
    if (pathname.startsWith('/detail/')) {
      // Extract serverId from the pathname
      const pathMatch = pathname.match(/^\/detail\/([^\/\?]+)/);
      const currentServerId = pathMatch ? pathMatch[1] : undefined;
      
      if (currentServerId) {
        try {
          const response = await fetch(`/api/servers/${currentServerId}/server-url`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch server URL: ${response.status}`);
          }
          
          const data = await response.json();
          
          // The server-url endpoint returns { serverId, server_url }
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
          
          // If no valid server_url, show popover with all servers
          setIsPopoverOpen(true);
        } catch (error) {
          console.error('Error fetching server data:', error);
          // Fall back to showing popover
          setIsPopoverOpen(true);
        }
        return;
      } else {
        // Even on detail page, if we can't get serverId, show popover
        setIsPopoverOpen(true);
        return;
      }
    }
    
    // Check if we have a selected server on dashboard (both analytics and overview view modes)
    if (pathname === '/' && (serverSelectionState.viewMode === 'analytics' || serverSelectionState.viewMode === 'overview') && serverSelectionState.selectedServerId) {
      const selectedServer = getSelectedServer();
      if (selectedServer && selectedServer.server_url && selectedServer.server_url.trim() !== '') {
        try {
          const url = new URL(selectedServer.server_url);
          if (['http:', 'https:'].includes(url.protocol)) {
            window.open(selectedServer.server_url, '_blank', 'noopener,noreferrer');
            return;
          }
        } catch {
          // Invalid URL, fall through to popover
        }
      }
    }
    
    // Only open popover if no server is selected or no valid server URL
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
            <PopoverContent className="w-auto max-w-100">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Open Duplicati Configuration</h4>
            <p className="text-sm text-muted-foreground">
               Select a server below to manage its settings and backups.
            </p>
          </div>
          <div className="max-h-128 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="grid gap-2">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading server connections...
                </div>
              ) : serverAddresses.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No servers with server URLs configured.
                </div>
              ) : (
                serverAddresses.map((server: ServerAddress) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerClick(server.server_url)}
                    className="flex items-center gap-3 p-2 text-left hover:bg-muted rounded-md transition-colors border border-border"
                  >
                    <ServerIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {server.alias ? `${server.alias} (${server.name})` : server.name}
                    </span>
                  </button>
                ))
              )}
            </div>
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
