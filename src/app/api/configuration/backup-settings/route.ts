import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { BackupKey, BackupNotificationConfig } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { backupSettings } = body;
    
    if (!backupSettings) {
      return NextResponse.json({ error: 'backupSettings is required' }, { status: 400 });
    }
    
    // Get current backup settings to compare for changes
    const currentBackupSettingsJson = getConfiguration('backup_settings');
    const currentBackupSettings: Record<BackupKey, BackupNotificationConfig> = currentBackupSettingsJson 
      ? JSON.parse(currentBackupSettingsJson) 
      : {};
    
    // Save backup settings separately
    setConfiguration('backup_settings', JSON.stringify(backupSettings));
    
    // Clean up overdue backup notifications for disabled backups and changed timeout settings
    try {
      // Get current overdue backup notifications configuration
      const overdueNotificationsJson = getConfiguration('overdue_backup_notifications');
      if (overdueNotificationsJson) {
        const overdueNotifications = JSON.parse(overdueNotificationsJson) as Record<string, {
          lastNotificationSent: string;
          lastBackupDate: string;
        }>;

        const backupKeysToClear: BackupKey[] = [];
        
        for (const [backupKey, backupConfig] of Object.entries(backupSettings)) {
          const config = backupConfig as BackupNotificationConfig;
          const currentConfig = currentBackupSettings[backupKey];
          
          // Clear notifications if overdue backup check is disabled
          if (!config.overdueBackupCheckEnabled) {
            backupKeysToClear.push(backupKey);
            continue;
          }
          
          // Clear notifications if timeout period settings have changed
          if (currentConfig) {
            const hasIntervalChanged = currentConfig.expectedInterval !== config.expectedInterval;
            const hasUnitChanged = currentConfig.intervalUnit !== config.intervalUnit;
            
            if (hasIntervalChanged || hasUnitChanged) {
              backupKeysToClear.push(backupKey);
            }
          }
        }

        // Remove entries for backups that need clearing from overdue_backup_notifications
        const updatedOverdueNotifications = { ...overdueNotifications };

        for (const backupKey of backupKeysToClear) {
          if (updatedOverdueNotifications[backupKey]) {
            delete updatedOverdueNotifications[backupKey];
          }
        }

        // Save the updated configuration
        setConfiguration('overdue_backup_notifications', JSON.stringify(updatedOverdueNotifications));
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup overdue backup notifications:', cleanupError);
      // Don't fail the entire save operation if cleanup fails
    }
    
    return NextResponse.json({ message: 'Backup settings updated successfully' });
  } catch (error) {
    console.error('Failed to update backup settings:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update backup settings' }, { status: 500 });
  }
} 