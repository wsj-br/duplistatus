"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MachineAddress } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { CheckCircle, XCircle, Ellipsis, Loader2, Play } from 'lucide-react';
import { ServerConfigurationButton } from '@/components/ui/server-configuration-button';

interface ServerAddressesFormProps {
  machineAddresses: MachineAddress[];
}

type ConnectionStatus = 'unknown' | 'success' | 'failed' | 'testing';

interface MachineConnectionWithStatus extends MachineAddress {
  connectionStatus: ConnectionStatus;
  originalServerUrl: string;
}

export function ServerAddressesForm({ machineAddresses }: ServerAddressesFormProps) {
  const { toast } = useToast();
  const [connections, setConnections] = useState<MachineConnectionWithStatus[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [isTestingAll, setIsTestingAll] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Column configuration for sorting
  const columnConfig = {
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    server_url: { type: 'text' as keyof typeof sortFunctions, path: 'server_url' },
    connectionStatus: { type: 'text' as keyof typeof sortFunctions, path: 'connectionStatus' },
  };

  // Initialize connections with unknown status
  useEffect(() => {
          const initialConnections: MachineConnectionWithStatus[] = machineAddresses.map(conn => ({
        ...conn,
        connectionStatus: 'unknown' as ConnectionStatus,
        originalServerUrl: conn.server_url
      }));
    setConnections(initialConnections);
  }, [machineAddresses]);

  // Check for URL validity
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Check if any URL is invalid
  const hasInvalidUrls = connections.some(conn => !isValidUrl(conn.server_url));

  const handleUrlChange = (machineId: string, newUrl: string) => {
    setConnections(prev => {
      const newConnections = prev.map(conn => {
        if (conn.id === machineId) {
          const hasChanged = newUrl !== conn.originalServerUrl;
          setHasChanges(hasChanged);
          
          return {
            ...conn,
            server_url: newUrl,
            connectionStatus: 'unknown' as ConnectionStatus
          };
        }
        return conn;
      });
      
      return newConnections;
    });
  };

  const handleUrlFocus = (machineId: string, currentUrl: string) => {
    if (!currentUrl || currentUrl.trim() === '') {
      const defaultUrl = "http://:8200";
      setConnections(prev => prev.map(conn => {
        if (conn.id === machineId) {
          return {
            ...conn,
            server_url: defaultUrl
          };
        }
        return conn;
      }));
      
      setHasChanges(true);
      
      setTimeout(() => {
        const inputElement = inputRefs.current[machineId];
        if (inputElement) {
          const cursorPosition = defaultUrl.indexOf(':8200');
          inputElement.setSelectionRange(cursorPosition, cursorPosition);
          inputElement.focus();
        }
      }, 0);
    }
  };

  const handleUrlBlur = (machineId: string) => {
    setConnections(prev => {
      const updatedConnections = prev.map(conn => {
        if (conn.id === machineId) {
          if (!conn.server_url || conn.server_url.trim() === '' || conn.server_url === "http://:8200") {
            return {
              ...conn,
              server_url: '',
              connectionStatus: 'unknown' as ConnectionStatus
            };
          }
          
          return conn;
        }
        return conn;
      });
      
      return updatedConnections;
    });
  };

  const testConnection = async (machineId: string, serverUrl: string) => {
    if (!serverUrl || serverUrl.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a server URL to test",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!isValidUrl(serverUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Update status to testing
    setConnections(prev => prev.map(conn => {
      if (conn.id === machineId) {
        return { ...conn, connectionStatus: 'testing' as ConnectionStatus };
      }
      return conn;
    }));

    try {
      const response = await fetch('/api/machines/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_url: serverUrl }),
      });

      const result = await response.json();

      setConnections(prev => prev.map(conn => {
        if (conn.id === machineId) {
          return { 
            ...conn, 
            connectionStatus: result.success ? 'success' : 'failed' as ConnectionStatus
          };
        }
        return conn;
      }));

      if (!result.success) {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Connection Successful",
          description: "Server connection test passed",
          duration: 3000,
        });
      }

    } catch (error) {
      setConnections(prev => prev.map(conn => {
        if (conn.id === machineId) {
          return { ...conn, connectionStatus: 'failed' as ConnectionStatus };
        }
        return conn;
      }));

      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Manual test all connections function
  const handleTestAllConnections = async () => {
    setIsTestingAll(true);
    try {
      const connectionsWithUrls = connections.filter(conn => conn.server_url && conn.server_url.trim() !== '');
      
      if (connectionsWithUrls.length === 0) {
        toast({
          title: "No URLs to Test",
          description: "No server URLs are configured to test",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set status to testing for all machines with server_url
      setConnections(prev => prev.map(conn => {
        if (conn.server_url && conn.server_url.trim() !== '') {
          return { ...conn, connectionStatus: 'testing' as ConnectionStatus };
        }
        return conn;
      }));

      let successCount = 0;
      let failureCount = 0;

      // Helper function to test a single connection
      const testConnectionInBatch = async (connection: typeof connectionsWithUrls[0]) => {
        try {
          const response = await fetch('/api/machines/test-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server_url: connection.server_url }),
          });

          const result = await response.json();

          setConnections(prev => prev.map(conn => {
            if (conn.id === connection.id) {
              return { 
                ...conn, 
                connectionStatus: result.success ? 'success' : 'failed' as ConnectionStatus
              };
            }
            return conn;
          }));
          
          return { success: result.success, connectionId: connection.id };
        } catch {
          setConnections(prev => prev.map(conn => {
            if (conn.id === connection.id) {
              return { ...conn, connectionStatus: 'failed' as ConnectionStatus };
            }
            return conn;
          }));
          return { success: false, connectionId: connection.id };
        }
      };

      // Test all connections in parallel
      const results = await Promise.allSettled(
        connectionsWithUrls.map(connection => testConnectionInBatch(connection))
      );

      // Process results
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } else {
          failureCount++;
        }
      });
      
      toast({
        title: "Connection Tests Complete",
        description: `Tested ${connectionsWithUrls.length} connections: ${successCount} successful, ${failureCount} failed`,
        duration: 5000,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to test all connections",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTestingAll(false);
    }
  };

  const handleSave = async () => {
    if (hasInvalidUrls) {
      toast({
        title: "Validation Error",
        description: "Please fix invalid URLs before saving",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save each machine's server URL
      for (const connection of connections) {
        if (connection.server_url !== connection.originalServerUrl) {
          await fetch(`/api/machines/${connection.id}/server-url`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server_url: connection.server_url }),
          });
        }
      }

      // Update original URLs
      setConnections(prev => prev.map(conn => ({
        ...conn,
        originalServerUrl: conn.server_url
      })));
      setHasChanges(false);

      toast({
        title: "Success",
        description: "Server addresses saved successfully",
        duration: 3000,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save server addresses",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getConnectionIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Ellipsis className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get sorted connections
  const sortedConnections = createSortedArray(connections, sortConfig, columnConfig);

  if (connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Server Addresses</CardTitle>
          <CardDescription>No machines found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No machines have been registered yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Machine Addresses</CardTitle>
          <CardDescription>
            Configure the web interface addresses for each machine. Test connections to ensure they are accessible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead 
                    className="w-[200px]" 
                    column="name" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    Machine Name
                  </SortableTableHead>
                  <SortableTableHead 
                    className="w-[300px]" 
                    column="server_url" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    Web Interface Address (URL)
                  </SortableTableHead>
                  <SortableTableHead 
                    className="w-[100px]" 
                    column="connectionStatus" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    Status
                  </SortableTableHead>
                  <TableCell className="w-[150px]">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedConnections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <div>
                        <div className="font-xl">{connection.name}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          ref={(el) => {
                            inputRefs.current[connection.id] = el;
                          }}
                          type="url"
                          value={connection.server_url}
                          onChange={(e) => handleUrlChange(connection.id, e.target.value)}
                          onFocus={() => handleUrlFocus(connection.id, connection.server_url)}
                          onBlur={() => handleUrlBlur(connection.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              testConnection(connection.id, connection.server_url);
                            }
                          }}
                          placeholder="https://server:8200"
                          className={!isValidUrl(connection.server_url) ? 'border-red-500' : ''}
                        />
                        {!isValidUrl(connection.server_url) && (
                          <div className="text-xs text-red-600">
                            Invalid URL
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getConnectionIcon(connection.connectionStatus)}
                        <span className="text-sm">
                          {(() => {
                            const statusToDisplay = connection.connectionStatus;
                            
                            if (statusToDisplay === 'success') return 'Connected';
                            if (statusToDisplay === 'failed') return 'Failed';
                            if (statusToDisplay === 'testing') return 'Testing...';
                            return '';
                          })()}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(connection.id, connection.server_url)}
                          disabled={!connection.server_url || !isValidUrl(connection.server_url)}
                        >
                          <Play className="h-4 w-4" />
                          Test
                        </Button>
                        <ServerConfigurationButton
                          serverUrl={connection.server_url}
                          machineName={connection.name}
                          size="sm"
                          variant="outline"
                          showText={true}
                          disabled={!connection.server_url || !isValidUrl(connection.server_url)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between pt-6">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || hasInvalidUrls || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                onClick={handleTestAllConnections}
                variant="outline"
                disabled={isTestingAll || connections.filter(conn => conn.server_url && conn.server_url.trim() !== '').length === 0}
              >
                {isTestingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing All...
                  </>
                ) : (
                  'Test All'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
