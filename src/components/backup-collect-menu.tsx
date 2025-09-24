"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { useConfiguration } from "@/contexts/configuration-context";
import { defaultAPIConfig } from '@/lib/default-config';
import { ServerAddress } from '@/lib/types';

interface BackupCollectMenuProps {
  preFilledServerUrl?: string;
  preFilledServerName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
}

export function BackupCollectMenu({ 
  preFilledServerUrl, 
  preFilledServerName,
  size = 'md', 
  variant = 'outline', 
  className = '',
  showText = false 
}: BackupCollectMenuProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState(defaultAPIConfig.duplicatiPort.toString());
  const [password, setPassword] = useState("");
  const [downloadJson, setDownloadJson] = useState(false);
  const [stats, setStats] = useState<{ processed: number; skipped: number; errors: number } | null>(null);
  const [serverAddresses, setServerAddresses] = useState<ServerAddress[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const { toast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();

  // Fetch server addresses function similar to open-server-config-button.tsx
  const fetchServerAddresses = useCallback(async () => {
    try {
      setIsLoadingServers(true);
      
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
      setIsLoadingServers(false);
    }
  }, [toast]);

  // Parse server URL to extract hostname and port
  const parseServerUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port ||  defaultAPIConfig.duplicatiPort.toString(),
        isValid: true
      };
    } catch {
      return {
        hostname: '',
        port: defaultAPIConfig.duplicatiPort.toString(),
        isValid: false
      };
    }
  };

  // Initialize form with pre-filled server details
  useEffect(() => {
    if (preFilledServerUrl) {
      const parsed = parseServerUrl(preFilledServerUrl);
      if (parsed.isValid) {
        setHostname(parsed.hostname);
        setPort(parsed.port);
      }
    }
  }, [preFilledServerUrl]);

  // Fetch server addresses when popover opens and preFilledServerUrl is not provided
  useEffect(() => {
    if (isOpen && !preFilledServerUrl && serverAddresses.length === 0) {
      fetchServerAddresses();
    }
  }, [isOpen, preFilledServerUrl, serverAddresses.length, fetchServerAddresses]);

  // Listen for configuration changes and refresh server list
  useEffect(() => {
    const handleConfigurationChange = () => {
      // Clear the server addresses to force a refresh next time the popover opens
      setServerAddresses([]);
      setSelectedServerId("");
    };

    window.addEventListener('configuration-saved', handleConfigurationChange);
    
    return () => {
      window.removeEventListener('configuration-saved', handleConfigurationChange);
    };
  }, []);

  // Handle server selection
  const handleServerSelect = (serverId: string) => {
    const selectedServer = serverAddresses.find(server => server.id === serverId);
    if (selectedServer) {
      const parsed = parseServerUrl(selectedServer.server_url);
      if (parsed.isValid) {
        setHostname(parsed.hostname);
        setPort(parsed.port);
        setSelectedServerId(serverId);
      }
    }
  };

  // Parse and format connection errors for better user experience
  const formatConnectionError = (errorMessage: string, hostname: string, port: string) => {
    if (errorMessage.includes('Could not establish connection with any protocol')) {
      return {
        title: "Connection Failed",
        description: `Unable to connect to ${hostname}:${port}. Please check: Server is running and accessible, hostname/IP address is correct, port number is correct, and network connectivity.`
      };
    }
    
    if (errorMessage.includes('EHOSTUNREACH')) {
      return {
        title: "Host Unreachable",
        description: `Cannot reach ${hostname}:${port}. The server may be down or the network address is incorrect.`
      };
    }
    
    if (errorMessage.includes('ECONNREFUSED')) {
      return {
        title: "Connection Refused",
        description: `${hostname}:${port} refused the connection. The Duplicati service may not be running on this port.`
      };
    }
    
    if (errorMessage.includes('ETIMEDOUT')) {
      return {
        title: "Connection Timeout",
        description: `Connection to ${hostname}:${port} timed out. Check network connectivity and firewall settings.`
      };
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return {
        title: "Authentication Failed",
        description: `Invalid password for ${hostname}:${port}. Please check your Duplicati password.`
      };
    }
    
    if (errorMessage.includes('ENOTFOUND')) {
      return {
        title: "Host Not Found",
        description: `Cannot resolve hostname "${hostname}". Please check the server name or IP address.`
      };
    }
    
    // Return original error for unknown cases, but clean it up
    const cleanedMessage = errorMessage.replace(/\\n/g, ' ').replace(/\n/g, ' ').trim();
    return {
      title: "Collection Failed",
      description: cleanedMessage
    };
  };

  const downloadJsonFile = (jsonData: string, serverName: string) => {
    try {
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${serverName}_collected_${timestamp}.json`;
      
      // Create a blob with the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "JSON file downloaded",
        description: `Downloaded ${filename}`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error downloading JSON file:', error);
      toast({
        title: "Download failed",
        description: "Failed to download JSON file",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleCollect = async () => {
    if (!hostname) {
      toast({
        title: "Error",
        description: "Please enter a hostname",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setIsCollecting(true);
      setStats(null);

      const response = await fetch('/api/backups/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          hostname, 
          port: parseInt(port) || defaultAPIConfig.duplicatiPort,
          password,
          downloadJson
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to collect backups');
      }

      const result = await response.json();
      setStats(result.stats);
      const serverName = result.serverAlias || result.serverName;

      // Handle JSON download if requested and data is available
      if (downloadJson && result.jsonData) {
        downloadJsonFile(result.jsonData, serverName);
      }

      // Clear stats immediately
      setStats(null);

      // Close the modal
      setIsOpen(false);

      // Show success toast
      toast({
        title: `Backups collected successfully from ${serverName}`,
        description: `Processed: ${result.stats.processed}, Skipped: ${result.stats.skipped}, Errors: ${result.stats.errors}`,
        variant: "default",
        duration: 3000,
      });

      // Refresh dashboard data using global refresh context
      await refreshDashboard();
      
      // Also refresh configuration data to update server lists in configuration tabs
      await refreshConfigSilently();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error collecting backups:', errorMessage);
      
      // Format the error for better user experience
      const formattedError = formatConnectionError(errorMessage, hostname, port);
      
      // Show error toast with formatted message
      toast({
        title: formattedError.title,
        description: formattedError.description,
        variant: "destructive",
        duration: 10000, // Increased duration for longer error messages
      });
    } finally {
      setIsCollecting(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default: // md - use 'icon' size for toolbar consistency
        return 'icon';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default: // md
        return 'h-4 w-4';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={getButtonSize()} 
          className={className}
          title="Collect backup logs"
        >
          <Download className={getIconSize()} />
          {showText && "Collect"}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-100"
        side={preFilledServerUrl ? "right" : "bottom"}
        align="center"
        sideOffset={4}
        collisionPadding={40}
        avoidCollisions={true}
      >
        <div className="grid gap-5">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Collect Backup Logs</h4>
            <p className="text-sm text-muted-foreground">
              {preFilledServerName
                ? <>Extract backup logs and schedule configuration directly from <span className="text-sm text-foreground">{preFilledServerName}</span></>
                : "Extract backup logs and schedule configuration directly from the Duplicati server"}
            </p>
            
          </div>
          <div className="grid gap-4">
            {/* Show server selection dropdown only when preFilledServerUrl is empty or non-existent */}
            {!preFilledServerUrl && (
              <div className="grid gap-2">
                <Label htmlFor="server-select">Select Server</Label>
                <Select value={selectedServerId} onValueChange={handleServerSelect} disabled={isCollecting}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingServers ? "Loading servers..." : "Choose a server or enter manually below"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingServers ? (
                      <SelectItem value="loading" disabled>
                        Loading servers...
                      </SelectItem>
                    ) : serverAddresses.length === 0 ? (
                      <SelectItem value="no-servers" disabled>
                        No servers with server URLs configured
                      </SelectItem>
                    ) : (
                      serverAddresses.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          {server.alias ? `${server.alias} (${server.name})` : server.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="hostname">Hostname <span className="text-xs text-muted-foreground">(HTTP/HTTPS automatically detected)</span></Label>
              <Input
                id="hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="server name or IP"
                disabled={isCollecting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="8200"
                disabled={isCollecting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="Enter Duplicati password"
                disabled={isCollecting}
              />
              <a href="https://docs.duplicati.com/detailed-descriptions/duplicati-access-password" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">Password missing or lost?</a>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="downloadJson"
                checked={downloadJson}
                onCheckedChange={(checked) => setDownloadJson(checked as boolean)}
                disabled={isCollecting}
              />
              <Label
                htmlFor="downloadJson"
                className="text-sm font-normal"
              >
                Download collected JSON data
              </Label>
            </div>
            {isCollecting && (
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Collecting backup logs...
                </p>
              </div>
            )}
            {stats && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Collection complete:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Processed: {stats.processed} backups</li>
                  <li>Skipped: {stats.skipped} duplicates</li>
                  <li>Errors: {stats.errors}</li>
                </ul>
              </div>
            )}
            <Button
              onClick={handleCollect}
              disabled={isCollecting || !hostname || !password}
            >
              {isCollecting ? (
                'Collecting...'
              ) : (
                'Collect Backups'
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 