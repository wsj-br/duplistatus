"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { NotificationConfig } from '@/lib/types';
import { NtfyForm } from '@/components/settings/ntfy-form';
import { BackupNotificationsForm } from '@/components/settings/backup-notifications-form';
import { NotificationTemplatesForm } from '@/components/settings/notification-templates-form';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ntfy');

  useEffect(() => {
    // Check for tab parameter in URL first
    const tabParam = searchParams.get('tab');
    if (tabParam && ['ntfy', 'backups', 'templates'].includes(tabParam)) {
      setActiveTab(tabParam);
      localStorage.setItem('settings-active-tab', tabParam);
    } else {
      // Load the last selected tab from localStorage if no URL parameter
      const savedTab = localStorage.getItem('settings-active-tab');
      if (savedTab && ['ntfy', 'backups', 'templates'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
    
    fetchConfiguration();
  }, [searchParams]);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('/api/configuration');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching configuration:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: "Failed to load configuration settings",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-lg font-medium text-red-600">Failed to load configuration</div>
          <Button onClick={fetchConfiguration} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your duplistatus application</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Notification Configuration</CardTitle>
          <CardDescription>
            Configure how duplistatus sends notifications about backup events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ntfy">NTFY Settings</TabsTrigger>
              <TabsTrigger value="backups">Backup Notifications</TabsTrigger>
              <TabsTrigger value="templates">Notification Messages</TabsTrigger>
            </TabsList>
            
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
                    toast({ title: 'Success', description: 'NTFY config saved successfully', duration: 2000 });
                  } catch (error) {
                    toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save NTFY config', variant: 'destructive', duration: 3000 });
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="backups" className="mt-6">
              <BackupNotificationsForm 
                backupSettings={config.backupSettings || {}} 
                onSave={async () => {
                  // Already uses /api/configuration/backup-settings
                  // No change needed here
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
                  } catch (error) {
                    toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save notification templates', variant: 'destructive', duration: 3000 });
                  }
                }}
                onSendTest={async (template) => {
                  const response = await fetch('/api/notifications/test-template', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
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