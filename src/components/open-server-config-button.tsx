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
import { Settings, Server, Loader2 } from 'lucide-react';
import { useServerSelection } from '@/contexts/server-selection-context';
import { ServerAddress } from '@/lib/types';
import { GradientCardHeader } from '@/components/ui/card';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';

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
      const response = await authenticatedRequestWithRecovery('/api/servers?includeBackups=true');
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
          const existingServer = uniqueServers.find(s => s.id === server.id);
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

  // Listen for configuration changes and refresh server list
  useEffect(() => {
    const handleConfigurationChange = () => {
      // Clear the server addresses to force a refresh next time the popover opens
      setServerAddresses([]);
    };

    window.addEventListener('configuration-saved', handleConfigurationChange);
    
    return () => {
      window.removeEventListener('configuration-saved', handleConfigurationChange);
    };
  }, []);

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

  const handleServerContextMenu = (e: React.MouseEvent, serverUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Open old UI by replacing/adding /ngax path to the existing URL
    try {
      const url = new URL(serverUrl);
      if (['http:', 'https:'].includes(url.protocol)) {
        // Replace the pathname with /ngax
        url.pathname = '/ngax';
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
        setIsPopoverOpen(false);
      }
    } catch (error) {
      console.error('Invalid server URL for old UI:', error);
      toast({
        title: "Error",
        description: "Failed to open old UI",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSettingsClick = () => {
    router.push('/settings?tab=server');
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
          const response = await authenticatedRequestWithRecovery(`/api/servers/${currentServerId}/server-url`);
          
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
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleButtonClick();
          }}
          disabled={isLoading}
          title="Duplicati configuration"
        >
          <ServerIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
            <PopoverContent className="w-auto max-w-100 shadow-lg backdrop-blur-sm bg-popover/95 border-border/50" data-screenshot-target="duplicati-configuration">
        <div className="grid gap-4">
          <GradientCardHeader>
            <h4 className="text-lg font-semibold leading-none text-white">Open Duplicati Configuration</h4>
          </GradientCardHeader>
          <div className="px-1 -mt-2">
            <p className="text-xs text-muted-foreground">
               Select a server below to manage its settings and backups
            </p>
          </div>
          <div className="max-h-128 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="grid gap-1.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-4 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Loading server connections...
                  </p>
                </div>
              ) : serverAddresses.length === 0 ? (
                <div className="text-center py-4 px-4 bg-muted/30 rounded-lg border border-border/50">
                  <ColoredIcon icon={Server} color="gray" size="lg" className="mb-2 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No servers with server URLs configured
                  </p>
                </div>
              ) : (
                serverAddresses.map((server: ServerAddress) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerClick(server.server_url)}
                    onContextMenu={(e) => handleServerContextMenu(e, server.server_url)}
                    className="flex items-center gap-3 p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 border border-border hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md hover:-translate-y-0.5 group"
                    title={`Open ${server.alias ? `${server.alias} (${server.name})` : server.name} configuration (Right-click for old UI)`}
                  >
                    <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <ServerIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {server.alias ? `${server.alias} (${server.name})` : server.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <button
              className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-3 py-2 rounded-lg w-full text-left hover:bg-muted/30 group"
              onClick={handleSettingsClick}
            >
              <ColoredIcon icon={Settings} color="purple" size="sm" className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Configure server addresses</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
