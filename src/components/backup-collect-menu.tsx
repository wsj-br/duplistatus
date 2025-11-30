"use client";

import { Download, Loader2, Server, Globe, Lock, FileDown, CheckCircle, XCircle, Ellipsis } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { useConfiguration } from "@/contexts/configuration-context";
import { useServerSelection } from "@/contexts/server-selection-context";
import { defaultAPIConfig } from '@/lib/default-config';
import { ServerAddress } from '@/lib/types';
import { authenticatedRequestWithRecovery } from "@/lib/client-session-csrf";
import { CollectAllButton } from "@/components/ui/collect-all-button";
import { collectFromMultipleServers, type CollectionResult } from "@/lib/bulk-collection";


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
  const [showCollectAll, setShowCollectAll] = useState(false);
  const [isInAutoCollectOperation, setIsInAutoCollectOperation] = useState(false);
  
  // Multi-server collection modal state
  const [showMultiServerModal, setShowMultiServerModal] = useState(false);
  const [multiServerStatuses, setMultiServerStatuses] = useState<Record<string, {
    status: 'waiting' | 'collecting' | 'collected' | 'failed';
    error?: string;
    stats?: { processed: number; skipped: number; errors: number };
  }>>({});
  const [isMultiServerCollecting, setIsMultiServerCollecting] = useState(false);
  const [multiServerAddresses, setMultiServerAddresses] = useState<string[]>([]);
  
  // Helper function to parse comma-separated hostnames
  const parseHostnames = (hostnameString: string): string[] => {
    if (!hostnameString || hostnameString.trim() === '') return [];
    
    return hostnameString
      .split(',')
      .map(h => h.trim())
      .filter(h => h.length > 0);
  };

  // Helper function to validate hostname format
  const isValidHostname = (hostname: string): boolean => {
    if (!hostname || hostname.trim() === '') return false;
    
    // Basic validation for hostname/IP address
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    return hostnameRegex.test(hostname) || ipRegex.test(hostname);
  };

  // Helper function to create ServerAddress array from hostnames
  const createServerAddressesFromHostnames = (hostnames: string[], port: string, password: string): ServerAddress[] => {
    return hostnames.map((hostname, index) => ({
      id: `temp-${hostname}-${index}`, // Temporary ID for dynamic servers
      name: hostname,
      server_url: `http://${hostname}:${port}`, // Default to HTTP, will be validated by CollectAllButton
      alias: hostname,
      note: `Dynamic server from hostname input`,
      hasPassword: password.trim() !== ''
    }));
  };

  // Get parsed hostnames and validation state
  const parsedHostnames = parseHostnames(hostname);
  const hasMultipleHostnames = parsedHostnames.length > 1;
  const invalidHostnames = parsedHostnames.filter(h => !isValidHostname(h));
  const validHostnames = parsedHostnames.filter(h => isValidHostname(h));
  
  // Determine the mode based on props and context
  // Auto-collect mode should only be true when explicitly set via props OR when we're in an auto-collect operation
  const isAutoCollectMode = (autoCollect && preFilledServerId) || isInAutoCollectOperation;
  const isServerListMode = !autoCollect && !preFilledServerUrl && !preFilledServerName;
  const { toast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();
  const pathname = usePathname();
  const { state: serverSelectionState, getSelectedServer } = useServerSelection();
  
  // Get the current server name for display
  const getCurrentServerName = () => {
    // First priority: preFilledServerName prop
    if (preFilledServerName) {
      return preFilledServerName;
    }
    
    // Second priority: selected server from serverAddresses
    if (selectedServerId && selectedServerId !== "new-server") {
      const selectedServer = serverAddresses.find(s => s.id === selectedServerId);
      if (selectedServer) {
        return selectedServer.alias || selectedServer.name;
      }
    }
    
    // Third priority: server from server selection context (for auto-collect from dashboard)
    if (isAutoCollectMode && serverSelectionState.selectedServerId) {
      const contextServer = getSelectedServer();
      if (contextServer) {
        return contextServer.alias || contextServer.name;
      }
    }
    
    // Fallback
    return "server";
  };
  
  const currentServerName = getCurrentServerName();

  // Fetch server addresses function similar to open-server-config-button.tsx
  const fetchServerAddresses = useCallback(async () => {
    try {
      setIsLoadingServers(true);
      
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
    // Check for master key error first
    if (errorMessage.includes('Master key is invalid') || errorMessage.includes('MASTER_KEY_INVALID')) {
      return {
        title: "Master Key Invalid",
        description: "The master key is no longer valid. All encrypted passwords and settings must be reconfigured."
      };
    }
    
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

  const handleAutoCollect = async (serverId?: string) => {
    const targetServerId = serverId || preFilledServerId;
    if (!targetServerId) return;
    
    onAutoCollectStart?.();
    
    // Set auto-collect operation flag to show progress-only mode
    setIsInAutoCollectOperation(true);
    
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

      const response = await authenticatedRequestWithRecovery('/api/backups/collect', {
        method: 'POST',
        body: JSON.stringify({
          serverId: targetServerId,
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
        // Reset auto-collect operation flag
        setIsInAutoCollectOperation(false);
        // Reset selectedServerId to allow fresh context detection on next click
        setSelectedServerId("new-server");
      }, 3000);
    }
  };

  const handleCollect = async () => {
    // Check if we have multiple hostnames and should use modal-based collection
    if (hasMultipleHostnames && validHostnames.length > 0) {
      // Validate that we have password for multiple servers
      if (!password) {
        toast({
          title: "Error",
          description: "Please enter a password for multiple servers",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Show validation errors for invalid hostnames
      if (invalidHostnames.length > 0) {
        toast({
          title: "Invalid Hostnames",
          description: `Invalid hostnames detected: ${invalidHostnames.join(', ')}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Initialize modal with server addresses and waiting status
      setMultiServerAddresses(validHostnames.map(h => `${h}:${port}`));
      const initialStatuses: Record<string, {
        status: 'waiting' | 'collecting' | 'collected' | 'failed';
        error?: string;
        stats?: { processed: number; skipped: number; errors: number };
      }> = {};
      
      validHostnames.forEach(h => {
        initialStatuses[`${h}:${port}`] = { status: 'waiting' };
      });
      
      setMultiServerStatuses(initialStatuses);
      setShowMultiServerModal(true);
      setIsMultiServerCollecting(true);

      // Create ServerAddress array for collection
      const dynamicServers = createServerAddressesFromHostnames(validHostnames, port, password);

      try {
        // Use the bulk-collection library directly
        const summary = await collectFromMultipleServers({
          servers: dynamicServers,
          dynamicMode: true,
          dynamicPort: port,
          dynamicPassword: password,
          downloadJson: downloadJson,
          onServerStatusUpdate: (serverId, status) => {
            // Find the corresponding hostname for this serverId
            const server = dynamicServers.find(s => s.id === serverId);
            if (server) {
              const address = `${server.name}:${port}`;
              
              setMultiServerStatuses(prev => ({
                ...prev,
                [address]: {
                  ...prev[address],
                  status: status === 'testing' ? 'collecting' : 
                         status === 'success' ? 'collected' : 
                         status === 'failed' ? 'failed' : 
                         prev[address].status
                }
              }));
            }
          },
          onCollectionStart: () => {
            // Update all to collecting status
            setMultiServerStatuses(prev => {
              const updated = { ...prev };
              Object.keys(updated).forEach(key => {
                updated[key] = { ...updated[key], status: 'collecting' };
              });
              return updated;
            });
          }
        });

        // Update statuses with detailed results and download JSON files if requested
        summary.results.forEach((result: CollectionResult) => {
          const server = dynamicServers.find(s => s.id === result.serverId);
          if (server) {
            const address = `${server.name}:${port}`;
            
            setMultiServerStatuses(prev => ({
              ...prev,
              [address]: {
                status: result.success ? 'collected' : 'failed',
                error: result.error,
                stats: result.stats
              }
            }));

            // Download JSON file if requested and available
            if (result.success && result.jsonData && downloadJson) {
              downloadJsonFile(result.jsonData, result.serverName);
            }
          }
        });

        // Refresh dashboard and close popover
        await refreshDashboard();
        await refreshConfigSilently();
        setServerAddresses([]);
        
        // Close the popover after a short delay
        setTimeout(() => setIsOpen(false), 1000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error during multi-server collection:', errorMessage);
        
        toast({
          title: "Collection Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsMultiServerCollecting(false);
      }
      
      return; // Exit early for multiple hostnames case
    }

    // Original single server logic
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

      const response = await authenticatedRequestWithRecovery('/api/backups/collect', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Check for master key error
        if (error.masterKeyInvalid) {
          toast({
            title: "Master Key Invalid",
            description: "The master key is no longer valid. All encrypted passwords and settings must be reconfigured.",
            variant: "destructive",
            duration: 8000,
          });
          return;
        }
        
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

  // Helper function to get status icon for multi-server modal
  const getMultiServerStatusIcon = (status: 'waiting' | 'collecting' | 'collected' | 'failed') => {
    switch (status) {
      case 'collected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'collecting':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'waiting':
      default:
        return <Ellipsis className="h-5 w-5 text-gray-400" />;
    }
  };

  // Helper function to format status text for multi-server modal
  const getMultiServerStatusText = (serverStatus: {
    status: 'waiting' | 'collecting' | 'collected' | 'failed';
    error?: string;
    stats?: { processed: number; skipped: number; errors: number };
  }) => {
    const { status, error, stats } = serverStatus;
    
    switch (status) {
      case 'collected':
        if (stats) {
          return `Success (Processed: ${stats.processed}, Skipped: ${stats.skipped}, Errors: ${stats.errors})`;
        }
        return 'Success';
      case 'failed':
        return error || 'Failed';
      case 'collecting':
        return 'Collecting...';
      case 'waiting':
      default:
        return 'Waiting...';
    }
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
                // Set auto-collect mode and collect from this server
                setSelectedServerId(currentServerId);
                await handleAutoCollect(currentServerId);
                return;
              }
            } catch {
              // Invalid URL, fall through to show popover
            }
          }
          
          // If no valid server_url, show popover with all servers
          setIsOpen(true);
        } catch (error) {
          console.error('Error fetching server data:', error);
          // Fall back to showing popover
          setIsOpen(true);
        }
        return;
      } else {
        // Even on detail page, if we can't get serverId, show popover
        setIsOpen(true);
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
            // Set auto-collect mode and collect from selected server
            setSelectedServerId(selectedServer.id);
            await handleAutoCollect(selectedServer.id);
            return;
          }
        } catch {
          // Invalid URL, fall through to popover
        }
      }
    }
    
    // Only open popover if no server is selected or no valid server URL
    setIsOpen(true);
  };

  const handleRightClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fetch server addresses if not already loaded
    if (serverAddresses.length === 0) {
      await fetchServerAddresses();
    }
    
    setShowCollectAll(true);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      // Reset state when popover closes to allow fresh context detection
      if (!open) {
        setSelectedServerId("new-server");
        setIsInAutoCollectOperation(false);
      }
    }}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={getButtonSize()} 
          className={className}
          title="Collect backup logs (Right-click for Collect All)"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isAutoCollectMode) {
              handleAutoCollect();
            } else if (isServerListMode) {
              handleButtonClick();
            }
          }}
          onContextMenu={handleRightClick}
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
        data-screenshot-target="collect-button-popup"
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
                        Collecting backup logs from {currentServerName}...
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
                      Collection complete from {currentServerName}!
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
                    : hasMultipleHostnames
                    ? <>Extract backup logs from <span className="font-medium text-blue-600">{validHostnames.length} servers</span> using the same port and password</>
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
                    {hasMultipleHostnames && (
                      <span className="text-xs text-blue-600 font-medium">({validHostnames.length} servers)</span>
                    )}
                    {selectedServerId && selectedServerId !== "new-server" && !hostname && !password && (
                      <span className="text-xs text-muted-foreground">(optional - leave empty to use stored)</span>
                    )}
                    {selectedServerId && selectedServerId !== "new-server" && hostname && password && (
                      <span className="text-xs text-orange-600">(updating stored value)</span>
                    )}
                    <StatusIndicator 
                      status="online" 
                      label={hasMultipleHostnames ? "Multiple servers detected" : "HTTP/HTTPS automatically detected"} 
                      animate={true}
                    />
                  </Label>
                  <Input
                    id="hostname"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder={selectedServerId && selectedServerId !== "new-server" && !hostname && !password ? "Leave empty to use stored hostname" : "server name or IP (comma-separated for multiple)"}
                    disabled={isCollecting}
                    className={hasMultipleHostnames ? "border-blue-300 dark:border-blue-700" : ""}
                  />
                  {hasMultipleHostnames && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-blue-600 dark:text-blue-400">Multiple servers detected:</p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        {validHostnames.map((h, index) => (
                          <li key={index} className="text-green-600 dark:text-green-400">✓ {h}</li>
                        ))}
                        {invalidHostnames.map((h, index) => (
                          <li key={index} className="text-red-600 dark:text-red-400">✗ {h}</li>
                        ))}
                      </ul>
                      {invalidHostnames.length > 0 && (
                        <p className="text-red-600 dark:text-red-400 mt-1">Please fix invalid hostnames before collecting.</p>
                      )}
                    </div>
                  )}
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
                            Collecting backup logs from {currentServerName}...
                          </p>
                          <Progress value={progress} variant="gradient" className="w-full h-2" />
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {Math.round(progress)}% complete
                          </p>
                        </div>
                      </>
                    ) : stats ? (
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">Collection complete from {currentServerName}:</p>
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
                  disabled={isCollecting || (selectedServerId === "new-server" && (!hostname || !password)) || (hasMultipleHostnames && invalidHostnames.length > 0)}
                  variant={buttonState === 'success' ? 'success' : 'gradient'}
                  className="w-full relative overflow-hidden"
                  title={hasMultipleHostnames ? `Collect backup logs from ${validHostnames.length} servers` : "Collect backup logs"}
                >
                  {buttonState === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {hasMultipleHostnames ? `Collecting from ${validHostnames.length} servers...` : "Collecting..."}
                    </>
                  ) : buttonState === 'success' ? (
                    <>
                      <ColoredIcon icon={Download} color="green" size="sm" className="mr-2 text-white" />
                      Collection Complete!
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {hasMultipleHostnames ? `Collect from ${validHostnames.length} Servers` : "Collect Backups"}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
    
    {/* Collect All Modal - Only for right-click on existing servers */}
    {showCollectAll && (
      <div className="fixed inset-0 bg-black/50 z-50">
        <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 absolute top-1/3 left-1/2 transform -translate-x-1/2" data-screenshot-target="collect-button-right-click-popup">
          <h3 className="text-lg font-semibold mb-4">Collect All Backups</h3>
          <p className="text-muted-foreground mb-4">
            This will collect backup logs from all configured servers. Are you sure you want to continue?
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCollectAll(false)}
            >
              Cancel
            </Button>
            <CollectAllButton
              servers={serverAddresses}
              variant="default"
              showText={true}
              onCollectionStart={(showInstructionToast) => {
                setShowCollectAll(false);
                if (showInstructionToast) {
                  toast({
                    title: "Starting Collection",
                    description: "Collecting backup logs from all configured servers...",
                    duration: 4000,
                  });
                }
              }}
              onCollectionEnd={() => {
                // Collection completed, toast will be shown by the component
              }}
            />
          </div>
        </div>
      </div>
    )}

    {/* Multi-Server Collection Modal */}
    <Dialog 
      open={showMultiServerModal} 
      onOpenChange={(open) => {
        // Only allow closing when collection is complete
        if (!isMultiServerCollecting) {
          setShowMultiServerModal(open);
        }
      }}
    >
      <DialogContent className="max-w-full max-h-screen h-full sm:max-w-3xl sm:max-h-[85vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Multi-Server Collection Progress</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <TooltipProvider>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Server Address</TableHead>
                    <TableHead className="w-[60%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {multiServerAddresses.map((address) => {
                    const serverStatus = multiServerStatuses[address] || { status: 'waiting' as const };
                    const statusText = getMultiServerStatusText(serverStatus);
                    const isTruncated = serverStatus.status === 'failed' && statusText.length > 50;
                    
                    return (
                      <TableRow key={address}>
                        <TableCell className="font-medium">
                          {address}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMultiServerStatusIcon(serverStatus.status)}
                            {isTruncated ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`text-sm cursor-help ${
                                    serverStatus.status === 'collected' ? 'text-green-600' :
                                    serverStatus.status === 'failed' ? 'text-red-600' :
                                    serverStatus.status === 'collecting' ? 'text-blue-600' :
                                    'text-gray-500'
                                  }`}>
                                    {statusText.substring(0, 50)}...
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md">
                                  <p className="break-words">{statusText}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className={`text-sm ${
                                serverStatus.status === 'collected' ? 'text-green-600' :
                                serverStatus.status === 'failed' ? 'text-red-600' :
                                serverStatus.status === 'collecting' ? 'text-blue-600' :
                                'text-gray-500'
                              }`}>
                                {statusText}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        </div>

        <DialogFooter>
          <Button
            onClick={() => setShowMultiServerModal(false)}
            disabled={isMultiServerCollecting}
            variant="gradient"
          >
            {isMultiServerCollecting ? 'Collection in Progress...' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
} 