"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useConfiguration } from '@/contexts/configuration-context';
import { NtfyForm } from '@/components/settings/ntfy-form';
import { BackupNotificationsForm } from '@/components/settings/backup-notifications-form';
import { NotificationTemplatesForm } from '@/components/settings/notification-templates-form';
import { ServerSettingsForm } from '@/components/settings/server-settings-form';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { config, loading, refreshConfigSilently } = useConfiguration();
  const [activeTab, setActiveTab] = useState<string>('backups');

  useEffect(() => {
    // Check for tab parameter in URL first
    const tabParam = searchParams.get('tab');
    if (tabParam && ['backups', 'addresses', 'ntfy', 'templates'].includes(tabParam)) {
      setActiveTab(tabParam);
      localStorage.setItem('settings-active-tab', tabParam);
    } else {
      // Load the last selected tab from localStorage if no URL parameter
      const savedTab = localStorage.getItem('settings-active-tab');
      if (savedTab && ['backups', 'addresses', 'ntfy', 'templates'].includes(savedTab)) {
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">System settings</CardTitle>
          <CardDescription>
             Configure backup notifications, overdue backup monitoring, server settings, and notification settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
              <TabsTrigger value="backups" className="text-xs lg:text-sm py-2 px-3">
                <span className="hidden lg:inline">Backup Alerts</span>
                <span className="lg:hidden">Backup</span>
              </TabsTrigger>
              <TabsTrigger value="serverSettings" className="text-xs lg:text-sm py-2 px-3">
                <span className="hidden lg:inline">Server Settings</span>
                <span className="lg:hidden">ServerSettings</span>
              </TabsTrigger>
              <TabsTrigger value="ntfy" className="text-xs lg:text-sm py-2 px-3">
                <span className="hidden lg:inline">NTFY Settings</span>
                <span className="lg:hidden">NTFY</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs lg:text-sm py-2 px-3">
                <span className="hidden lg:inline">Notification Templates</span>
                <span className="lg:hidden">Templates</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="backups" className="mt-6">
              <BackupNotificationsForm 
                backupSettings={config.backupSettings || {}} 
                onSave={async () => {
                  // Already uses /api/configuration/backup-settings
                  // No change needed here
                }}
              />
            </TabsContent>
            
            <TabsContent value="serverSettings" className="mt-6">
              <ServerSettingsForm 
                serverAddresses={config.serverAddresses || []} 
              />
            </TabsContent>
            
            <TabsContent value="ntfy" className="mt-6">
              <NtfyForm 
                config={config.ntfy} 
                onSave={async (ntfyConfig) => {
                  try {
                    const response = await fetch('/api/configuration/notifications', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
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
            
            <TabsContent value="templates" className="mt-6">
              <NotificationTemplatesForm 
                templates={config.templates || {}} 
                onSave={async (templates) => {
                  try {
                    const response = await fetch('/api/configuration/templates', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
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
                  const response = await fetch('/api/notifications/test', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
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