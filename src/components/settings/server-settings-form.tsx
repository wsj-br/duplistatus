"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerAddress } from '@/lib/types';
import { SortConfig, createSortedArray, sortFunctions } from '@/lib/sort-utils';
import { Server, XCircle, Ellipsis, Loader2, Play, Globe, CheckCircle, User, FileText, RectangleEllipsis, KeyRound, FastForward, SquareX } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { ServerConfigurationButton } from '@/components/ui/server-configuration-button';
import { BackupCollectMenu } from '@/components/backup-collect-menu';
import { CollectAllButton } from '@/components/ui/collect-all-button';
import { useConfiguration } from '@/contexts/configuration-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getCSRFToken, authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { TogglePasswordInput } from '@/components/ui/toggle-password-input';
import { useIntlayer } from 'react-intlayer';

interface ServerSettingsFormProps {
  serverAddresses: ServerAddress[];
}

type ConnectionStatus = 'unknown' | 'success' | 'failed' | 'testing' | 'collecting' | 'collected' | 'need_url' | 'need_password' | 'need_url_and_password';

interface ServerConnectionWithStatus extends ServerAddress {
  connectionStatus: ConnectionStatus;
  originalServerUrl: string;
  originalAlias: string;
  originalNote: string;
  hasPassword: boolean;
}

export function ServerSettingsForm({ serverAddresses }: ServerSettingsFormProps) {
  const content = useIntlayer('server-settings-form');
  const common = useIntlayer('common');
  const { toast } = useToast();
  const { refreshConfigSilently } = useConfiguration();
  const [connections, setConnections] = useState<ServerConnectionWithStatus[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [isTestingAll, setIsTestingAll] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const lastServerAddressesRef = useRef<ServerAddress[]>([]);
  
  // Password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [selectedServerName, setSelectedServerName] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingPassword, setIsDeletingPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Column configuration for sorting
  const columnConfig = {
    name: { type: 'text' as keyof typeof sortFunctions, path: 'name' },
    alias: { type: 'text' as keyof typeof sortFunctions, path: 'alias' },
    note: { type: 'text' as keyof typeof sortFunctions, path: 'note' },
    server_url: { type: 'text' as keyof typeof sortFunctions, path: 'server_url' },
    connectionStatus: { type: 'text' as keyof typeof sortFunctions, path: 'connectionStatus' },
  };

  // Initialize connections with unknown status
  useEffect(() => {
    // Don't reinitialize if we're in the middle of saving to prevent overwriting local changes
    if (isSavingInProgress) return;
    
    // Check if serverAddresses has actually changed by comparing with the last known value
    const hasServerAddressesChanged = JSON.stringify(serverAddresses) !== JSON.stringify(lastServerAddressesRef.current);
    
    if (!hasServerAddressesChanged) return;
    
    // Update the ref with the new serverAddresses
    lastServerAddressesRef.current = serverAddresses;
    
    const initialConnections: ServerConnectionWithStatus[] = serverAddresses.map(conn => ({
      ...conn,
      connectionStatus: 'unknown' as ConnectionStatus,
      originalServerUrl: conn.server_url,
      originalAlias: conn.alias || '',
      originalNote: conn.note || '',
      hasPassword: conn.hasPassword
    }));
    setConnections(initialConnections);
  }, [serverAddresses, isSavingInProgress]);

  // Handle password dialog open/close - reset form when opening, clear passwords when closing
  useEffect(() => {
    if (passwordDialogOpen) {
      // Reset form state when dialog opens
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    } else {
      // Safely clear passwords from memory when dialog closes (covers all close methods)
      // Capture current values before clearing
      const currentNewPassword = newPassword;
      const currentConfirmPassword = confirmPassword;
      const randomStr = 'x'.repeat(Math.max(currentNewPassword.length, currentConfirmPassword.length, 100));
      setNewPassword(randomStr);
      setConfirmPassword(randomStr);
      // Clear after overwrite
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
      }, 0);
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordDialogOpen]);

  // Copy new password to confirm password when dialog opens and new password is autofilled
  const prevPasswordDialogOpenRef = useRef(passwordDialogOpen);
  useEffect(() => {
    // When dialog just opened and new password has a value (from browser autofill), copy to confirm
    if (passwordDialogOpen && !prevPasswordDialogOpenRef.current && newPassword && !confirmPassword) {
      setConfirmPassword(newPassword);
    }
    prevPasswordDialogOpenRef.current = passwordDialogOpen;
  }, [passwordDialogOpen, newPassword, confirmPassword]);

  // Watch for autofill after dialog opens (browser autofill happens asynchronously)
  useEffect(() => {
    if (passwordDialogOpen && newPassword && !confirmPassword) {
      // Small delay to allow browser autofill to complete, then copy to confirm
      const timeoutId = setTimeout(() => {
        if (newPassword && !confirmPassword) {
          setConfirmPassword(newPassword);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [passwordDialogOpen, newPassword, confirmPassword]);

  // Copy new password to confirm password when hiding password
  const prevShowPasswordRef = useRef(showPassword);
  useEffect(() => {
    // When password visibility changes from shown to hidden, copy new password to confirm
    if (prevShowPasswordRef.current === true && showPassword === false && newPassword) {
      setConfirmPassword(newPassword);
    }
    prevShowPasswordRef.current = showPassword;
  }, [showPassword, newPassword]);

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

  const handleUrlChange = (serverId: string, newUrl: string) => {
    setConnections(prev => {
      const newConnections = prev.map(conn => {
        if (conn.id === serverId) {
          return {
            ...conn,
            server_url: newUrl,
            connectionStatus: 'unknown' as ConnectionStatus
          };
        }
        return conn;
      });
      
      // Check if any connection has changes
      const hasAnyChanges = newConnections.some(conn => 
        conn.server_url !== conn.originalServerUrl ||
        conn.alias !== conn.originalAlias ||
        conn.note !== conn.originalNote
      );
      setHasChanges(hasAnyChanges);
      
      return newConnections;
    });
  };

  const handleAliasChange = (serverId: string, newAlias: string) => {
    setConnections(prev => {
      const newConnections = prev.map(conn => {
        if (conn.id === serverId) {
          return {
            ...conn,
            alias: newAlias
          };
        }
        return conn;
      });
      
      // Check if any connection has changes
      const hasAnyChanges = newConnections.some(conn => 
        conn.server_url !== conn.originalServerUrl ||
        conn.alias !== conn.originalAlias ||
        conn.note !== conn.originalNote
      );
      setHasChanges(hasAnyChanges);
      
      return newConnections;
    });
  };

  const handleNoteChange = (serverId: string, newNote: string) => {
    setConnections(prev => {
      const newConnections = prev.map(conn => {
        if (conn.id === serverId) {
          return {
            ...conn,
            note: newNote
          };
        }
        return conn;
      });
      
      // Check if any connection has changes
      const hasAnyChanges = newConnections.some(conn => 
        conn.server_url !== conn.originalServerUrl ||
        conn.alias !== conn.originalAlias ||
        conn.note !== conn.originalNote
      );
      setHasChanges(hasAnyChanges);
      
      return newConnections;
    });
  };

  const handleUrlFocus = (serverId: string, currentUrl: string) => {
    if (!currentUrl || currentUrl.trim() === '') {
      const defaultUrl = "http://:8200";
      
      setConnections(prev => prev.map(conn => {
        if (conn.id === serverId) {
          return {
            ...conn,
            server_url: defaultUrl
          };
        }
        return conn;
      }));
      
      setHasChanges(true);
    }
  };


  const handleUrlBlur = (serverId: string) => {
    setConnections(prev => {
      const updatedConnections = prev.map(conn => {
        if (conn.id === serverId) {
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

  const testConnection = async (serverId: string, serverUrl: string) => {
    if (!serverUrl || serverUrl.trim() === '') {
      toast({
        title: common.status.error,
        description: content.pleaseEnterServerUrl,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!isValidUrl(serverUrl)) {
      toast({
        title: common.status.error,
        description: content.pleaseEnterValidUrl,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Update status to testing
    setConnections(prev => prev.map(conn => {
      if (conn.id === serverId) {
        return { ...conn, connectionStatus: 'testing' as ConnectionStatus };
      }
      return conn;
    }));

    try {
      const response = await authenticatedRequestWithRecovery('/api/servers/test-connection', {
        method: 'POST',
        body: JSON.stringify({ server_url: serverUrl }),
      });

      const result = await response.json();

      setConnections(prev => prev.map(conn => {
        if (conn.id === serverId) {
          return { 
            ...conn, 
            connectionStatus: result.success ? 'success' : 'failed' as ConnectionStatus
          };
        }
        return conn;
      }));

      if (!result.success) {
        toast({
          title: content.connectionFailed,
          description: result.message,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: content.connectionSuccessful,
          description: content.serverConnectionTestPassed,
          duration: 3000,
        });
      }

    } catch (error) {
      setConnections(prev => prev.map(conn => {
        if (conn.id === serverId) {
          return { ...conn, connectionStatus: 'failed' as ConnectionStatus };
        }
        return conn;
      }));

      toast({
        title: content.connectionTestFailed,
        description: error instanceof Error ? error.message : common.status.unknown,
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
          title: content.noUrlsToTest,
          description: content.noServerUrlsConfigured,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Set status to testing for all servers with server_url, and unknown for others
      setConnections(prev => prev.map(conn => {
        if (conn.server_url && conn.server_url.trim() !== '') {
          return { ...conn, connectionStatus: 'testing' as ConnectionStatus };
        }
        return { ...conn, connectionStatus: 'unknown' as ConnectionStatus };
      }));

      let successCount = 0;
      let failureCount = 0;

      // Helper function to test a single connection
      const testConnectionInBatch = async (connection: typeof connectionsWithUrls[0]) => {
        try {
          const response = await authenticatedRequestWithRecovery('/api/servers/test-connection', {
            method: 'POST',
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
        title: content.connectionTestsComplete,
        description: content.testedConnections.value
          .replace('{count}', String(connectionsWithUrls.length))
          .replace('{success}', String(successCount))
          .replace('{failed}', String(failureCount)),
        duration: 5000,
      });
    } catch {
      toast({
        title: common.status.error,
        description: content.failedToTestAllConnections,
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
        title: content.validationError,
        description: content.pleaseFixInvalidUrls,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    setIsSavingInProgress(true);
    try {
      // Save each server's details
      for (const connection of connections) {
        const hasChanges = 
          connection.server_url !== connection.originalServerUrl ||
          connection.alias !== connection.originalAlias ||
          connection.note !== connection.originalNote;
          
        if (hasChanges) {
          const response = await authenticatedRequestWithRecovery(`/api/servers/${connection.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ 
              server_url: connection.server_url,
              alias: connection.alias || '',
              note: connection.note || ''
            }),
          });
          
          if (!response.ok) {
            if (response.status === 403) {
              throw new Error('You do not have permission to modify server settings. Only administrators can change configurations.');
            }
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Failed to update server ${connection.id}: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
          }
        }
      }

      // Update original values
      setConnections(prev => prev.map(conn => ({
        ...conn,
        originalServerUrl: conn.server_url,
        originalAlias: conn.alias || '',
        originalNote: conn.note || ''
      })));
      setHasChanges(false);

      // Dispatch custom event to notify other components about configuration change
      // The configuration context will automatically refresh when it receives this event
      window.dispatchEvent(new CustomEvent('configuration-saved'));

      toast({
        title: common.status.success,
        description: content.serverDetailsUpdated,
        duration: 3000,
      });

    } catch (error) {
      toast({
        title: common.status.error,
        description: error instanceof Error ? error.message : content.failedToSaveServerDetails,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
      setIsSavingInProgress(false);
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
      case 'collected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'collecting':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'need_url':
      case 'need_password':
      case 'need_url_and_password':
        return <SquareX className="h-5 w-5 text-yellow-400" />;
      default:
        return <Ellipsis className="h-5 w-5 text-gray-400" />;
    }
  };

  // Password dialog handlers
  const handlePasswordButtonClick = async (serverId: string, serverName: string) => {
    setSelectedServerId(serverId);
    setSelectedServerName(serverName);
    setNewPassword('');
    setConfirmPassword('');

    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken();

      setCsrfToken(csrfToken);

      setPasswordDialogOpen(true);
      // Form reset is handled by useEffect watching passwordDialogOpen
    } catch {
      toast({
        title: common.status.error,
        description: content.failedToInitializePasswordChange,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handlePasswordSave = async () => {
    // When password is visible, confirmation field is synced, so only check newPassword
    if (!newPassword || (!showPassword && !confirmPassword)) {
      toast({
        title: common.status.error,
        description: content.pleaseEnterBothPasswordFields,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // When password is visible, confirmation is synced, so they match
    if (!showPassword && newPassword !== confirmPassword) {
      toast({
        title: common.status.error,
        description: content.passwordsDoNotMatch,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await authenticatedRequestWithRecovery(`/api/servers/${selectedServerId}/password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: common.status.success,
          description: content.passwordUpdatedSuccessfully,
          duration: 3000,
        });
        setPasswordDialogOpen(false);
        // Safely clear passwords from memory
        safeClearPasswords();
        // Refresh configuration to update hasPassword status and UI buttons
        await refreshConfigSilently();
        
        // Dispatch configuration-saved event to update toolbar components (Duplicati config and collect buttons)
        window.dispatchEvent(new CustomEvent('configuration-saved'));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update password",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePasswordDelete = async () => {
    setIsDeletingPassword(true);
    try {
      const response = await authenticatedRequestWithRecovery(`/api/servers/${selectedServerId}/password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ password: '' }), // Empty password to delete
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: common.status.success,
          description: content.passwordDeletedSuccessfully,
          duration: 3000,
        });
        setPasswordDialogOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        // Refresh configuration to update hasPassword status
        await refreshConfigSilently();
        
        // Dispatch configuration-saved event to update toolbar components (Duplicati config and collect buttons)
        window.dispatchEvent(new CustomEvent('configuration-saved'));
      } else {
        toast({
          title: common.status.error,
          description: result.error || content.failedToDeletePassword,
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: common.status.error,
        description: error instanceof Error ? error.message : content.failedToDeletePassword,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeletingPassword(false);
    }
  };

  // Safely clear password fields by overwriting before clearing
  const safeClearPasswords = () => {
    // Overwrite with random characters to clear from memory
    const randomStr = 'x'.repeat(Math.max(newPassword.length, confirmPassword.length, 100));
    setNewPassword(randomStr);
    setConfirmPassword(randomStr);
    // Clear after overwrite
    setTimeout(() => {
      setNewPassword('');
      setConfirmPassword('');
    }, 0);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setCsrfToken('');
    // Password clearing is handled by useEffect watching passwordDialogOpen
  };


  // Get sorted connections
  const sortedConnections = createSortedArray(connections, sortConfig, columnConfig);

  if (connections.length === 0) {
    return (
      <Card variant="modern">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ColoredIcon icon={Server} color="green" size="lg" />
            <div>
              <CardTitle>{content.serverAddresses}</CardTitle>
              <CardDescription className="mt-1">{content.noServersFound}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{content.noServersRegistered}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card variant="modern">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ColoredIcon icon={Server} color="green" size="lg" />
            <div>
              <CardTitle>{content.configureServerSettings}</CardTitle>
              <CardDescription className="mt-1">
                {content.configureServerSettingsDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead 
                    className="w-[150px] min-w-[100px]" 
                    column="name" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    {content.serverName}
                  </SortableTableHead>
                  <SortableTableHead 
                    className="w-[200px] min-w-[100px]" 
                    column="alias" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    {content.alias}
                  </SortableTableHead>
                  <SortableTableHead 
                    className="w-[300px] min-w-[150px]" 
                    column="note" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    {content.note}
                  </SortableTableHead>
                  <SortableTableHead 
                    className="w-[250px] min-w-[150px]" 
                    column="server_url" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    {content.webInterfaceAddress}
                  </SortableTableHead>
                  <SortableTableHead 
                    className="w-[150px] min-w-[120px]" 
                    column="connectionStatus" 
                    sortConfig={sortConfig} 
                    onSort={handleSort}
                  >
                    {content.status}
                  </SortableTableHead>
                  <TableCell className="w-[120px] min-w-[120px]">
                    {content.actions}
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedConnections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate" title={connection.id}>{connection.name}</span>
                        {connection.hasPassword && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => handlePasswordButtonClick(connection.id, connection.name)}
                            title={content.clickToChangePassword}
                          >
                            <KeyRound className="h-3 w-3 text-blue-400"/>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <Input
                          type="text"
                          value={connection.alias || ''}
                          onChange={(e) => handleAliasChange(connection.id, e.target.value)}
                          placeholder={content.serverAliasPlaceholder.value}
                          className="text-xs"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <Input
                          type="text"
                          value={connection.note || ''}
                          onChange={(e) => handleNoteChange(connection.id, e.target.value)}
                          placeholder={content.notesPlaceholder.value}
                          className="text-xs"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col space-y-1">
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
                          placeholder={content.urlPlaceholder.value}
                          className={`text-xs ${!isValidUrl(connection.server_url) ? 'border-red-500' : ''}`}
                        />
                        {!isValidUrl(connection.server_url) && (
                          <div className="text-xs text-red-600">
                            {content.invalidUrl}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getConnectionIcon(connection.connectionStatus)}
                        <span className="text-xs">
                          {(() => {
                            const statusToDisplay = connection.connectionStatus;
                            
                            if (statusToDisplay === 'success') return content.connected;
                            if (statusToDisplay === 'collected') return content.collected;
                            if (statusToDisplay === 'failed') return content.failed;
                            if (statusToDisplay === 'testing') return content.testing;
                            if (statusToDisplay === 'collecting') return content.collecting;
                            if (statusToDisplay === 'need_url') return content.missingUrl;
                            if (statusToDisplay === 'need_password') return content.missingPassword;
                            if (statusToDisplay === 'need_url_and_password') return content.missingUrlAndPassword;
                            return '';
                          })()}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(connection.id, connection.server_url)}
                          disabled={!connection.server_url || !isValidUrl(connection.server_url)}
                          className="px-2"
                        >
                          <Play className="h-3 w-3" />
                          <span className="hidden sm:inline ml-1">{content.test}</span>
                        </Button>
                        <ServerConfigurationButton
                          serverUrl={connection.server_url}
                          serverName={connection.name}
                          serverAlias={connection.alias}
                          size="sm"
                          variant="outline"
                          showText={false}
                          disabled={!connection.server_url || !isValidUrl(connection.server_url)}
                        />
                        <BackupCollectMenu
                          preFilledServerUrl={connection.server_url}
                          preFilledServerName={connection.alias || connection.name}
                          preFilledServerId={connection.id}
                          size="sm"
                          variant="outline"
                          showText={false}
                          autoCollect={Boolean(connection.hasPassword && connection.server_url && connection.server_url.trim() !== '')}
                          disabled={!connection.hasPassword}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePasswordButtonClick(connection.id, connection.name)}
                          className="px-2"
                          title={content.changePassword}
                        >
                          <RectangleEllipsis className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {sortedConnections.map((connection) => (
              <Card key={connection.id} className="p-4">
                <div className="space-y-3">
                  {/* Header with Machine Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm" title={connection.id}>{connection.name}</span>
                      {connection.hasPassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => handlePasswordButtonClick(connection.id, connection.name)}
                          title={content.clickToChangePassword}
                        >
                          <KeyRound className="h-3 w-3 text-orange-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Alias */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <ColoredIcon icon={User} color="blue" size="sm" />
                      {content.alias}
                    </Label>
                    <Input
                      type="text"
                      value={connection.alias}
                      onChange={(e) => handleAliasChange(connection.id, e.target.value)}
                      placeholder={content.serverAliasPlaceholder.value}
                      className="text-xs"
                    />
                  </div>
                  
                  {/* Note */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <ColoredIcon icon={FileText} color="green" size="sm" />
                      {content.note}
                    </Label>
                    <Input
                      type="text"
                      value={connection.note}
                      onChange={(e) => handleNoteChange(connection.id, e.target.value)}
                      placeholder={content.additionalNotesPlaceholder.value}
                      className="text-xs"
                    />
                  </div>
                  
                  {/* Server URL */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <ColoredIcon icon={Globe} color="purple" size="sm" />
                      {content.webInterfaceAddress}
                    </Label>
                    <div className="flex flex-col space-y-1">
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
                        placeholder={content.urlPlaceholder.value}
                        className={`text-xs ${!isValidUrl(connection.server_url) ? 'border-red-500' : ''}`}
                      />
                      {!isValidUrl(connection.server_url) && (
                        <div className="text-xs text-red-600">
                          {content.invalidUrl}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">{content.status}</Label>
                    <div className="flex items-center space-x-2">
                      {getConnectionIcon(connection.connectionStatus)}
                      <span className="text-xs">
                        {(() => {
                          const statusToDisplay = connection.connectionStatus;
                          
                          if (statusToDisplay === 'success') return content.connected;
                          if (statusToDisplay === 'collected') return content.collected;
                          if (statusToDisplay === 'failed') return content.failed;
                          if (statusToDisplay === 'testing') return content.testing;
                          if (statusToDisplay === 'collecting') return content.collecting;
                          if (statusToDisplay === 'need_url') return content.missingUrl;
                          if (statusToDisplay === 'need_password') return content.missingPassword;
                          if (statusToDisplay === 'need_url_and_password') return content.missingUrlAndPassword;
                          return content.unknown;
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">{content.actions}</Label>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(connection.id, connection.server_url)}
                        disabled={!connection.server_url || !isValidUrl(connection.server_url)}
                        className="w-full text-blue-600 hover:text-blue-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {content.test}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePasswordButtonClick(connection.id, connection.name)}
                        className="w-full"
                      >
                        <RectangleEllipsis className="h-3 w-3 mr-1" />
                        {content.changePassword}
                      </Button>
                      <ServerConfigurationButton
                        serverUrl={connection.server_url}
                        serverName={connection.name}
                        serverAlias={connection.alias}
                        size="sm"
                        variant="outline"
                        showText={true}
                        disabled={!connection.server_url || !isValidUrl(connection.server_url)}
                        className="w-full"
                      />
                      <BackupCollectMenu
                        preFilledServerUrl={connection.server_url}
                        preFilledServerName={connection.alias || connection.name}
                        preFilledServerId={connection.id}
                        size="sm"
                        variant="outline"
                        showText={true}
                        autoCollect={Boolean(connection.hasPassword && connection.server_url && connection.server_url.trim() !== '')}
                        className="w-full"
                        disabled={!connection.hasPassword}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-6 gap-4">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || hasInvalidUrls || !hasChanges}
                variant="gradient"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {content.saving}
                  </>
                ) : (
                  content.saveChanges
                )}
              </Button>
              <Button
                onClick={handleTestAllConnections}
                variant="outline"
                disabled={isTestingAll || hasChanges || connections.filter(conn => conn.server_url && conn.server_url.trim() !== '').length === 0}
              >
                {isTestingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">{content.testingAll}</span>
                    <span className="sm:hidden">{content.testing}</span>
                  </>
                ) : (
                  <>
                    <FastForward className="h-4 w-4" />
                    <span className="hidden sm:inline">{content.testAll}</span>
                    <span className="sm:hidden">{content.testAll}</span>
                  </>
                )}
              </Button>
              <CollectAllButton
                servers={connections}
                variant="outline"
                showText={true}
                showInstructionToast={false}
                disabled={isSaving || isTestingAll || hasChanges}
                onCollectionStart={(showInstructionToast) => {
                  if (showInstructionToast) {
                    toast({
                      title: content.startingCollection.value,
                      description: content.collectingBackupLogs.value,
                      duration: 4000,
                    });
                  }
                }}
                onServerStatusUpdate={(serverId, status) => {
                  setConnections(prev => prev.map(conn => {
                    if (conn.id === serverId) {
                      // Map statuses for backup collection
                      let mappedStatus = status as ConnectionStatus;
                      if (status === 'testing') {
                        mappedStatus = 'collecting';
                      } else if (status === 'success') {
                        mappedStatus = 'collected';
                      }
                      return { ...conn, connectionStatus: mappedStatus };
                    }
                    return conn;
                  }));
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={handlePasswordDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{content.changePasswordToAccess}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="server-name" className="text-sm font-medium">
                {content.server} {selectedServerName}
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                {content.newPassword}
              </Label>
              <TogglePasswordInput
                ref={passwordInputRef}
                id="new-password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder={content.enterNewPassword.value}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className={`text-sm font-medium ${showPassword ? 'opacity-60' : ''}`}>
                {content.confirmPassword}
              </Label>
              <TogglePasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder={content.confirmNewPassword.value}
                className={!showPassword && newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                isConfirmation={true}
                syncValue={newPassword}
                passwordInputRef={passwordInputRef}
              />
              {!showPassword && newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {content.passwordsDoNotMatch}
                </p>
              )}
            </div>
            
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="destructive"
                onClick={handlePasswordDelete}
                disabled={isDeletingPassword || isSavingPassword}
              >
                {isDeletingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {content.deleting}
                  </>
                ) : (
                  content.deletePassword
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasswordDialogClose}
                  disabled={isDeletingPassword || isSavingPassword}
                >
                  {common.ui.cancel}
                </Button>
                <Button
                  type="button"
                  onClick={handlePasswordSave}
                  disabled={isDeletingPassword || isSavingPassword || !newPassword || (!showPassword && (!confirmPassword || newPassword !== confirmPassword))}
                  variant="gradient"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {content.saving}
                    </>
                  ) : (
                    content.savePassword
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
