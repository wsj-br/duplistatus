"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { Settings, Bell, AlertTriangle, Server, MessageSquare, Mail, FileText, Users, ScrollText, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { useConfiguration } from '@/contexts/configuration-context';
import { NtfyForm } from '@/components/settings/ntfy-form';
import { BackupNotificationsForm } from '@/components/settings/backup-notifications-form';
import { OverdueMonitoringForm } from '@/components/settings/overdue-monitoring-form';
import { NotificationTemplatesForm } from '@/components/settings/notification-templates-form';
import { ServerSettingsForm } from '@/components/settings/server-settings-form';
import { EmailConfigurationForm } from '@/components/settings/email-configuration-form';
import { UserManagementForm } from '@/components/settings/user-management-form';
import { AuditLogViewer } from '@/components/settings/audit-log-viewer';
import { AuditLogRetentionForm } from '@/components/settings/audit-log-retention-form';

interface SettingsPageClientProps {
  currentUser: {
    id: string;
    isAdmin: boolean;
  };
}

export function SettingsPageClient({ currentUser }: SettingsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { config, loading, refreshConfigSilently, updateConfig } = useConfiguration();
  const [activeSection, setActiveSection] = useState<string>('notifications');
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
      const response = await authenticatedRequestWithRecovery('/api/configuration/unified');
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
          const response = await authenticatedRequestWithRecovery('/api/configuration/unified');
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
        const response = await authenticatedRequestWithRecovery('/api/configuration/unified');
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
    // Check for section parameter in URL first
    const sectionParam = searchParams.get('tab') || searchParams.get('section');
    const validSections = ['notifications', 'overdue', 'server', 'ntfy', 'email', 'templates', 'users', 'audit', 'audit-retention'];
    
    if (sectionParam && validSections.includes(sectionParam)) {
      setActiveSection(sectionParam);
      localStorage.setItem('settings-active-section', sectionParam);
    } else {
      // Load the last selected section from localStorage if no URL parameter
      const savedSection = localStorage.getItem('settings-active-section');
      if (savedSection && validSections.includes(savedSection)) {
        setActiveSection(savedSection);
        // Only update URL if it's different from what's in the URL
        if (sectionParam !== savedSection) {
          router.replace(`/settings?tab=${savedSection}`, { scroll: false });
        }
      } else {
        // Default to notifications
        setActiveSection('notifications');
        if (!sectionParam || sectionParam !== 'notifications') {
          router.replace('/settings?tab=notifications', { scroll: false });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSectionChange = (value: string) => {
    setActiveSection(value);
    localStorage.setItem('settings-active-section', value);
    router.replace(`/settings?tab=${value}`, { scroll: false });
  };

  // Check if email configuration is valid (mirrors logic from EmailConfigurationForm)
  const isEmailConfigValid = () => {
    if (!config?.email) return false;
    
    return config.email.host?.trim() !== '' &&
           config.email.username?.trim() !== '' &&
           config.email.mailto?.trim() !== '' &&
           config.email.port > 0 &&
           config.email.hasPassword;
  };

  // Check if NTFY configuration is valid (mirrors logic from NtfyForm)
  const isNtfyConfigValid = () => {
    if (!config?.ntfy) return false;
    
    return config.ntfy.url?.trim() !== '' &&
           config.ntfy.topic?.trim() !== '';
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
    <div className="min-h-screen w-full bg-background">
      {/* Main Content Area with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-background flex-shrink-0 sticky top-[88px] h-[calc(100vh-88px)] overflow-auto">
          {/* Sidebar Header */}
          <div className="px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center gap-3">
              <ColoredIcon icon={Settings} color="blue" size="md" />
              <h2 className="text-lg font-semibold">System Settings</h2>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
              {/* Notifications Group */}
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Notifications</div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSectionChange('notifications')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'notifications'
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <Bell className="h-4 w-4 flex-shrink-0" />
                    <span>Backup Notifications</span>
                  </button>
                  <button
                    onClick={() => handleSectionChange('overdue')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'overdue'
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>Overdue Monitoring</span>
                  </button>
                  <button
                    onClick={() => handleSectionChange('templates')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'templates'
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>Templates</span>
                  </button>
                </div>
              </div>

              {/* Integrations Group */}
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Integrations</div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSectionChange('ntfy')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'ntfy'
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <MessageSquare className={`h-4 w-4 flex-shrink-0 ${isNtfyConfigValid() ? 'text-green-600' : 'text-yellow-500'}`} />
                    <span>NTFY</span>
                  </button>
                  <button
                    onClick={() => handleSectionChange('email')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'email'
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <Mail className={`h-4 w-4 flex-shrink-0 ${isEmailConfigValid() ? 'text-green-600' : 'text-yellow-500'}`} />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              {/* System Group */}
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">System</div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSectionChange('server')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'server'
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <Server className="h-4 w-4 flex-shrink-0" />
                    <span>Servers</span>
                  </button>
                  {currentUser?.isAdmin && (
                    <button
                      onClick={() => handleSectionChange('users')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'users'
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>Users</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleSectionChange('audit')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === 'audit'
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <ScrollText className="h-4 w-4 flex-shrink-0" />
                    <span>Audit Log</span>
                  </button>
                  {currentUser?.isAdmin && (
                    <button
                      onClick={() => handleSectionChange('audit-retention')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'audit-retention'
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>Audit Log Retention</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
            <div className="w-full px-6 py-4 space-y-6">
              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <BackupNotificationsForm 
                  backupSettings={config.backupSettings || {}} 
                  onSave={async () => {
                    // Already uses /api/configuration/backup-settings
                  }}
                />
              )}

              {/* Overdue Monitoring Section */}
              {activeSection === 'overdue' && (
                <OverdueMonitoringForm 
                  backupSettings={config.backupSettings || {}} 
                  onSave={async () => {
                    // Already uses /api/configuration/backup-settings and other endpoints
                  }}
                />
              )}

              {/* Server Settings Section */}
              {activeSection === 'server' && (
                <ServerSettingsForm 
                  serverAddresses={config.serverAddresses || []} 
                />
              )}

              {/* NTFY Section */}
              {activeSection === 'ntfy' && (
                <NtfyForm 
                  config={config.ntfy} 
                  onSave={async (ntfyConfig) => {
                    try {
                      const response = await authenticatedRequestWithRecovery('/api/configuration/notifications', {
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
              )}

              {/* Email Section */}
              {activeSection === 'email' && (
                <EmailConfigurationForm />
              )}

              {/* Templates Section */}
              {activeSection === 'templates' && (
                <NotificationTemplatesForm 
                  templates={config.templates || {}} 
                  onSave={async (templates) => {
                    try {
                      const response = await authenticatedRequestWithRecovery('/api/configuration/templates', {
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
                    const response = await authenticatedRequestWithRecovery('/api/notifications/test', {
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
              )}

              {/* Users Section (Admin only) */}
              {activeSection === 'users' && currentUser?.isAdmin && (
                <UserManagementForm currentUserId={currentUser.id} />
              )}

              {/* Audit Log Section */}
              {activeSection === 'audit' && (
                <AuditLogViewer currentUserId={currentUser?.id} isAdmin={currentUser?.isAdmin || false} />
              )}

              {/* Audit Log Retention Section (Admin only) */}
              {activeSection === 'audit-retention' && (
                <AuditLogRetentionForm isAdmin={currentUser?.isAdmin || false} />
              )}
            </div>
        </main>
      </div>
    </div>
  );
}

