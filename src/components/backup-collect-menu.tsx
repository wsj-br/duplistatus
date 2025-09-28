"use client";

import { Download, Loader2, Server, Globe, Lock, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { GradientCardHeader } from "@/components/ui/card";
import { ColoredIcon, StatusIndicator } from "@/components/ui/colored-icon";
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
import { authenticatedRequest } from "@/lib/client-session-csrf";

interface BackupCollectMenuProps {
  preFilledServerUrl?: string;
  preFilledServerName?: string;
  preFilledServerId?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
  autoCollect?: boolean;
  disabled?: boolean;
  onAutoCollectStart?: () => void;
  onAutoCollectEnd?: () => void;
}

export function BackupCollectMenu({ 
  preFilledServerUrl, 
  preFilledServerName,
  preFilledServerId,
  size = 'md', 
  variant = 'outline', 
  className = '',
  showText = false,
  autoCollect = false,
  disabled = false,
  onAutoCollectStart,
  onAutoCollectEnd
}: BackupCollectMenuProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState(defaultAPIConfig.duplicatiPort.toString());
  const [password, setPassword] = useState("");
  const [downloadJson, setDownloadJson] = useState(false);
  const [stats, setStats] = useState<{ processed: number; skipped: number; errors: number } | null>(null);
  const [serverAddresses, setServerAddresses] = useState<ServerAddress[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>("new-server");
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'success'>('default');
  
  // Determine the mode based on props
  const isAutoCollectMode = autoCollect && preFilledServerId;
  const isServerListMode = !autoCollect && !preFilledServerUrl && !preFilledServerName;
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

  // Auto-collect is now triggered by button click, not on mount

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
    if (serverId === "new-server") {
      // Clear fields for new server
      setHostname("");
      setPort(defaultAPIConfig.duplicatiPort.toString());
      setPassword("");
      setSelectedServerId("new-server");
    } else {
      const selectedServer = serverAddresses.find(server => server.id === serverId);
      if (selectedServer) {
        const parsed = parseServerUrl(selectedServer.server_url);
        if (parsed.isValid) {
          setHostname(parsed.hostname);
          setPort(parsed.port);
          setSelectedServerId(serverId);
        }
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

  const handleAutoCollect = async () => {
    if (!preFilledServerId) return;
    
    onAutoCollectStart?.();
    
    // Open popup to show progress only
    setIsOpen(true);
    
    try {
      setIsCollecting(true);
      setProgress(0);
      setStats(null);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 15;
          const newProgress = prev + increment;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      const response = await authenticatedRequest('/api/backups/collect', {
        method: 'POST',
        body: JSON.stringify({
          serverId: preFilledServerId,
          downloadJson: false
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to collect backups');
      }

      const result = await response.json();
      
      // Complete progress and clear interval
      clearInterval(progressInterval);
      setProgress(100);
      setStats(result.stats);
      
      const serverName = result.serverAlias || result.serverName;

      // Show success toast
      toast({
        title: `Backups collected successfully from ${serverName}`,
        description: `Processed: ${result.stats.processed}, Skipped: ${result.stats.skipped}, Errors: ${result.stats.errors}`,
        variant: "default",
        duration: 3000,
      });

      // Refresh dashboard data
      await refreshDashboard();
      await refreshConfigSilently();
      setServerAddresses([]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error collecting backups:', errorMessage);
      
      // Show error toast
      toast({
        title: "Collection Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsCollecting(false);
      onAutoCollectEnd?.();
      
      // Close popup after few seconds to show completion
      setTimeout(() => {
        setIsOpen(false);
        setProgress(0);
        setStats(null);
      }, 3000);
    }
  };

  const handleCollect = async () => {
    // Determine which API case to use based on user input
    const requestBody: Record<string, unknown> = { downloadJson };
    
    if (selectedServerId && selectedServerId !== "new-server") {
      // Case 1: ServerID only (use stored credentials) - no password provided
      if (!password) {
        requestBody.serverId = selectedServerId;
      }
      // Case 2: ServerID with updates (update stored credentials) - password provided
      else {
        requestBody.serverId = selectedServerId;
        requestBody.hostname = hostname;
        requestBody.port = parseInt(port) || defaultAPIConfig.duplicatiPort;
        requestBody.password = password;
      }
    } else {
      // Case 2: Hostname/port/password only (new connection)
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
      requestBody.hostname = hostname;
      requestBody.port = parseInt(port) || defaultAPIConfig.duplicatiPort;
      requestBody.password = password;
    }

    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      setIsCollecting(true);
      setButtonState('loading');
      setStats(null);
      setProgress(0);
      
      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 15;
          const newProgress = prev + increment;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      const response = await authenticatedRequest('/api/backups/collect', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to collect backups');
      }

      const result = await response.json();
      
      // Complete progress and clear interval
      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);
      
      setStats(result.stats);
      const serverName = result.serverAlias || result.serverName;

      // Handle JSON download if requested and data is available
      if (downloadJson && result.jsonData) {
        downloadJsonFile(result.jsonData, serverName);
      }

      // Show success state briefly
      setButtonState('success');
      
      // Clear stats after a short delay
      setTimeout(() => {
        setStats(null);
        setProgress(0);
        setButtonState('default');
        // Close the modal
        setIsOpen(false);
      }, 1500);

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
      
      // Clear server addresses to force a refresh next time the popover opens
      setServerAddresses([]);

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
      if (progressInterval) clearInterval(progressInterval);
      setIsCollecting(false);
      setButtonState('default');
      setProgress(0);
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
          disabled={disabled}
          onClick={(e) => {
            if (isAutoCollectMode) {
              e.preventDefault();
              e.stopPropagation();
              handleAutoCollect();
            }
          }}
        >
          <Download className={getIconSize()} />
          {showText && "Collect"}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-100 shadow-lg backdrop-blur-sm bg-popover/95 border-border/50"
        side={preFilledServerUrl ? "right" : "bottom"}
        align="center"
        sideOffset={4}
        collisionPadding={40}
        avoidCollisions={true}
      >
        <div className="grid gap-4">
          {/* Auto-collect mode: Only show progress */}
          {isAutoCollectMode ? (
            (isCollecting || stats) && (
              <div className="flex flex-col items-center justify-center space-y-3 py-4 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                {isCollecting ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Collecting backup logs...
                      </p>
                      <Progress value={progress} variant="gradient" className="w-full h-2" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {Math.round(progress)}% complete
                      </p>
                    </div>
                  </>
                ) : stats ? (
                  <div className="text-center space-y-2">
                    <div className="h-8 w-8 mx-auto flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Collection complete!
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Processed: {stats.processed} backups</p>
                      <p>Skipped: {stats.skipped} duplicates</p>
                      <p>Errors: {stats.errors}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          ) : (
            /* Pre-filled mode or Server list mode: Show form */
            <>
              <GradientCardHeader>
                <h4 className="text-lg font-semibold leading-none text-white">Collect Backup Logs</h4>
              </GradientCardHeader>
              <div className="px-1 -mt-2">
                <p className="text-xs text-muted-foreground">
                  {preFilledServerName
                    ? <>Extract backup logs and configuration from <span className="font-medium text-foreground">{preFilledServerName}</span></>
                    : selectedServerId && selectedServerId !== "new-server" && !hostname && !password
                    ? <>Using stored credentials for selected server</>
                    : selectedServerId && selectedServerId !== "new-server" && hostname && password
                    ? <>Updating server credentials and collecting backups</>
                    : "Extract backup logs and schedule configuration directly from Duplicati server"}
                </p>
              </div>
              <div className="grid gap-3">
                {/* Show server selection dropdown only in server list mode */}
                {isServerListMode && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="server-select" className="flex items-center gap-2">
                      <ColoredIcon icon={Server} color="blue" size="sm" />
                      Select Server
                    </Label>
                    <Select value={selectedServerId} onValueChange={handleServerSelect} disabled={isCollecting}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingServers ? "Loading servers..." : "Choose a server or enter manually below"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-server">
                          + New Server
                        </SelectItem>
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

                <div className="grid gap-1.5">
                  <Label htmlFor="hostname" className="flex items-center gap-2">
                    <ColoredIcon icon={Globe} color="blue" size="sm" />
                    Hostname
                    {selectedServerId && selectedServerId !== "new-server" && !hostname && !password && (
                      <span className="text-xs text-muted-foreground">(optional - leave empty to use stored)</span>
                    )}
                    {selectedServerId && selectedServerId !== "new-server" && hostname && password && (
                      <span className="text-xs text-orange-600">(updating stored value)</span>
                    )}
                    <StatusIndicator 
                      status="online" 
                      label="HTTP/HTTPS automatically detected" 
                      animate={true}
                    />
                  </Label>
                  <Input
                    id="hostname"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder={selectedServerId && selectedServerId !== "new-server" && !hostname && !password ? "Leave empty to use stored hostname" : "server name or IP"}
                    disabled={isCollecting}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="port" className="flex items-center gap-2">
                    <ColoredIcon icon={Server} color="purple" size="sm" />
                    Port
                  </Label>
                  <Input
                    id="port"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="8200"
                    disabled={isCollecting}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <ColoredIcon icon={Lock} color="red" size="sm" />
                    Password
                    {selectedServerId && selectedServerId !== "new-server" && !hostname && !password && (
                      <span className="text-xs text-muted-foreground">(optional - leave empty to use stored)</span>
                    )}
                    {selectedServerId && selectedServerId !== "new-server" && hostname && password && (
                      <span className="text-xs text-orange-600">(updating stored value)</span>
                    )}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder={selectedServerId && selectedServerId !== "new-server" && !hostname && !password ? "Leave empty to use stored password" : "Enter Duplicati password"}
                    disabled={isCollecting}
                  />
                  <a href="https://docs.duplicati.com/detailed-descriptions/duplicati-access-password" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">Password missing or lost?</a>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <Checkbox
                    id="downloadJson"
                    checked={downloadJson}
                    onCheckedChange={(checked) => setDownloadJson(checked as boolean)}
                    disabled={isCollecting}
                  />
                  <Label
                    htmlFor="downloadJson"
                    className="text-sm font-normal flex items-center gap-2 cursor-pointer"
                  >
                    <ColoredIcon icon={FileDown} color="green" size="sm" />
                    Download collected JSON data
                  </Label>
                </div>
                
                {/* Show progress during manual collection */}
                {(isCollecting || stats) && (
                  <div className="flex flex-col items-center justify-center space-y-3 py-4 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    {isCollecting ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <div className="text-center space-y-2">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Collecting backup logs...
                          </p>
                          <Progress value={progress} variant="gradient" className="w-full h-2" />
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {Math.round(progress)}% complete
                          </p>
                        </div>
                      </>
                    ) : stats ? (
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">Collection complete:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Processed: {stats.processed} backups</li>
                          <li>Skipped: {stats.skipped} duplicates</li>
                          <li>Errors: {stats.errors}</li>
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}

                <Button
                  onClick={handleCollect}
                  disabled={isCollecting || (selectedServerId === "new-server" && (!hostname || !password))}
                  variant={buttonState === 'success' ? 'success' : 'gradient'}
                  className="w-full relative overflow-hidden"
                  title="Collect backup logs"
                >
                  {buttonState === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Collecting...
                    </>
                  ) : buttonState === 'success' ? (
                    <>
                      <ColoredIcon icon={Download} color="green" size="sm" className="mr-2 text-white" />
                      Collection Complete!
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Collect Backups
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 