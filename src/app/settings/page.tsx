"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { Settings, Bell, AlertTriangle, Server, MessageSquare, Mail, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useConfiguration } from '@/contexts/configuration-context';
import { NtfyForm } from '@/components/settings/ntfy-form';
import { BackupNotificationsForm } from '@/components/settings/backup-notifications-form';
import { OverdueMonitoringForm } from '@/components/settings/overdue-monitoring-form';
import { NotificationTemplatesForm } from '@/components/settings/notification-templates-form';
import { ServerSettingsForm } from '@/components/settings/server-settings-form';
import { EmailConfigurationForm } from '@/components/settings/email-configuration-form';
import { authenticatedRequest } from '@/lib/client-session-csrf';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { config, loading, refreshConfigSilently, updateConfig } = useConfiguration();
  const [activeTab, setActiveTab] = useState<string>('backupNotifications');
  const [lastServerListHash, setLastServerListHash] = useState<string>('');
  // Function to create a hash of the server list for change detection
  const createServerListHash = (servers: Array<{id: string; name: string; backupName: string}>) => {
    if (!servers || servers.length === 0) return '';
    return servers
      .map(server => `${server.id}-${server.name}-${server.backupName}`)
      .sort()
      .join('|');
  };

  // Function to refresh only server list data without affecting other configuration
  const refreshServerListOnly = useCallback(async () => {
    try {
      const response = await fetch('/api/configuration/unified', {
        credentials: 'include', // Include session cookies
      });
      if (!response.ok) throw new Error('Failed to fetch configuration');
      
      const freshConfig = await response.json();
      
      // Update only the server-related data in the configuration context
      // This preserves any unsaved changes in other parts of the configuration
      updateConfig({
        serversWithBackups: freshConfig.serversWithBackups,
        serverAddresses: freshConfig.serverAddresses
      });
      
      return freshConfig;
    } catch (error) {
      console.error('Error refreshing server list:', error);
      throw error;
    }
  }, [updateConfig]);

  // Check for server list changes and refresh config if needed
  useEffect(() => {
    if (!config || loading) return;

    const currentServerListHash = createServerListHash(config.serversWithBackups || []);
    
    // If this is the first load, store the hash and don't refresh
    if (lastServerListHash === '') {
      setLastServerListHash(currentServerListHash);
      return;
    }

    // If the server list has changed, refresh only the server list data
    if (currentServerListHash !== lastServerListHash) {
      console.log('Server list changed, refreshing server list...');
      refreshServerListOnly().then(() => {
        setLastServerListHash(currentServerListHash);
        toast({
          title: 'Server List Updated',
          description: 'New servers detected and added to the list',
          duration: 3000
        });
      }).catch((error) => {
        console.error('Failed to refresh server list:', error);
      });
    }
  }, [config, loading, lastServerListHash, refreshServerListOnly, toast]);

  // Check for server list changes when user navigates back to the settings page
  useEffect(() => {
    if (!config || loading) return;

    const handleVisibilityChange = async () => {
      // Only check when the page becomes visible (user navigated back)
      if (document.visibilityState === 'visible') {
        try {
          // Fetch fresh configuration to check for server changes
          const response = await fetch('/api/configuration/unified');
          if (!response.ok) return;
          
          const freshConfig = await response.json();
          const freshServerListHash = createServerListHash(freshConfig.serversWithBackups || []);
          
          // If server list has changed, refresh only the server list data
          if (freshServerListHash !== lastServerListHash && lastServerListHash !== '') {
            console.log('Page visibility change detected server list changes, refreshing server list...');
            await refreshServerListOnly();
            setLastServerListHash(freshServerListHash);
            toast({
              title: 'Server List Updated',
              description: 'New servers detected and added to the list',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('Error during visibility change server list check:', error);
        }
      }
    };

    // Listen for visibility changes (when user navigates back to the page)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus events (when user switches back to the browser tab)
    const handleFocus = async () => {
      try {
        // Fetch fresh configuration to check for server changes
        const response = await fetch('/api/configuration/unified');
        if (!response.ok) return;
        
        const freshConfig = await response.json();
        const freshServerListHash = createServerListHash(freshConfig.serversWithBackups || []);
        
        // If server list has changed, refresh only the server list data
        if (freshServerListHash !== lastServerListHash && lastServerListHash !== '') {
          console.log('Window focus detected server list changes, refreshing server list...');
          await refreshServerListOnly();
          setLastServerListHash(freshServerListHash);
          toast({
            title: 'Server List Updated',
            description: 'New servers detected and added to the list',
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Error during focus server list check:', error);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [config, loading, lastServerListHash, refreshServerListOnly, toast]);

  useEffect(() => {
    // Check for tab parameter in URL first
    const tabParam = searchParams.get('tab');
    if (tabParam && ['notifications', 'overdue', 'server', 'ntfy', 'email', 'templates'].includes(tabParam)) {
      setActiveTab(tabParam);
      localStorage.setItem('settings-active-tab', tabParam);
    } else {
      // Load the last selected tab from localStorage if no URL parameter
      const savedTab = localStorage.getItem('settings-active-tab');
      if (savedTab && ['notifications', 'overdue', 'server', 'ntfy', 'email', 'templates'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, [searchParams]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Remove saveConfiguration and saveBackupSettings


  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('settings-active-tab', value);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading configuration...</div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">No configuration available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[95%] mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
      </div>

      <Card variant="modern" className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ColoredIcon icon={Settings} color="blue" size="lg" />
            <div>
              <CardTitle className="text-2xl">System Settings</CardTitle>
              <CardDescription className="mt-1">
                Configure backup notifications, overdue backup monitoring, server settings, and notification settings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
              <TabsTrigger value="notifications" className="text-xs lg:text-sm py-2 px-3 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden lg:inline">Backup Notifications</span>
                <span className="lg:hidden">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-xs lg:text-sm py-2 px-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden lg:inline">Overdue Monitoring</span>
                <span className="lg:hidden">Overdue</span>
              </TabsTrigger>
              <TabsTrigger value="server" className="text-xs lg:text-sm py-2 px-3 flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span className="hidden lg:inline">Servers</span>
                <span className="lg:hidden">Servers</span>
              </TabsTrigger>
              <TabsTrigger value="ntfy" className="text-xs lg:text-sm py-2 px-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden lg:inline">NTFY</span>
                <span className="lg:hidden">NTFY</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs lg:text-sm py-2 px-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden lg:inline">Email</span>
                <span className="lg:hidden">Email</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs lg:text-sm py-2 px-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden lg:inline">Notification Templates</span>
                <span className="lg:hidden">Templates</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="mt-6">
              <BackupNotificationsForm 
                backupSettings={config.backupSettings || {}} 
                onSave={async () => {
                  // Already uses /api/configuration/backup-settings
                  // No change needed here
                }}
              />
            </TabsContent>
            
            <TabsContent value="overdue" className="mt-6">
              <OverdueMonitoringForm 
                backupSettings={config.backupSettings || {}} 
                onSave={async () => {
                  // Already uses /api/configuration/backup-settings and other endpoints
                  // No change needed here
                }}
              />
            </TabsContent>
            
            <TabsContent value="server" className="mt-6">
              <ServerSettingsForm 
                serverAddresses={config.serverAddresses || []} 
              />
            </TabsContent>
            
            <TabsContent value="ntfy" className="mt-6">
              <NtfyForm 
                config={config.ntfy} 
                onSave={async (ntfyConfig) => {
                  try {
                    const response = await authenticatedRequest('/api/configuration/notifications', {
                      method: 'POST',
                      body: JSON.stringify({ ntfy: ntfyConfig }),
                    });
                    if (!response.ok) throw new Error('Failed to save NTFY config');
                    const result = await response.json();
                    toast({ title: 'Success', description: 'NTFY config saved successfully', duration: 2000 });
                    
                    // Refresh the configuration cache to reflect the changes
                    await refreshConfigSilently();
                    
                    return result;
                  } catch (error) {
                    toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save NTFY config', variant: 'destructive', duration: 3000 });
                    throw error;
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="email" className="mt-6">
              <EmailConfigurationForm />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-6">
              <NotificationTemplatesForm 
                templates={config.templates || {}} 
                onSave={async (templates) => {
                  try {
                    const response = await authenticatedRequest('/api/configuration/templates', {
                      method: 'POST',
                      body: JSON.stringify({ templates }),
                    });
                    if (!response.ok) throw new Error('Failed to save notification templates');
                    toast({ title: 'Success', description: 'Notification templates saved successfully', duration: 2000 });
                    
                    // Refresh the configuration cache to reflect the changes
                    await refreshConfigSilently();
                  } catch (error) {
                    toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save notification templates', variant: 'destructive', duration: 3000 });
                  }
                }}
                onSendTest={async (template) => {
                  const response = await authenticatedRequest('/api/notifications/test', {
                    method: 'POST',
                    body: JSON.stringify({ 
                      type: 'template',
                      template,
                      ntfyConfig: config.ntfy 
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to send test notification');
                  }

                  // Show success message with channels used
                  const result = await response.json();
                  const channels = result.channels || ['NTFY'];
                  toast({ 
                    title: 'Test Sent Successfully', 
                    description: `Template test sent via ${channels.join(' and ')}`, 
                    duration: 3000 
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
} 