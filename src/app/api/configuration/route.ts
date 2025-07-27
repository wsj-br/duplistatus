import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration, getNtfyConfig } from '@/lib/db-utils';
import { NotificationConfig, BackupKey, BackupNotificationConfig } from '@/lib/types';
import { createDefaultNotificationConfig } from '@/lib/default-config';

export async function GET() {
  try {
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    // Get ntfy config with default topic generation if needed
    const ntfyConfig = getNtfyConfig();
    
    let config: NotificationConfig;
    
    if (configJson) {
      try {
        config = JSON.parse(configJson) as NotificationConfig;
      } catch (parseError) {
        console.error('Failed to parse notifications configuration, creating default:', parseError);
        config = createDefaultNotificationConfig(ntfyConfig);
      }
    } else {
      config = createDefaultNotificationConfig(ntfyConfig);
    }
    
    // Ensure ntfy config is always set with the generated default if needed
    config.ntfy = ntfyConfig;

    // Load backup settings from separate configuration if available
    if (backupSettingsJson) {
      try {
        const backupSettings = JSON.parse(backupSettingsJson);
        config.backupSettings = backupSettings;
      } catch (error) {
        console.error('Failed to parse backup settings:', error instanceof Error ? error.message : String(error));
        config.backupSettings = {};
      }
    } else {
      config.backupSettings = {};
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to get configuration:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const config: NotificationConfig = await request.json();
    
    // Get current backup settings to compare for changes
    const currentBackupSettingsJson = getConfiguration('backup_settings');
    const currentBackupSettings: Record<BackupKey, BackupNotificationConfig> = currentBackupSettingsJson 
      ? JSON.parse(currentBackupSettingsJson) 
      : {};
    
    // Save main configuration (without backupSettings)
    const { backupSettings, ...mainConfig } = config;
    setConfiguration('notifications', JSON.stringify(mainConfig));
    
    // Save backup settings separately
    setConfiguration('backup_settings', JSON.stringify(backupSettings || {}));
    
    // Clean up missed backup notifications for disabled backups and changed timeout settings
    if (backupSettings) {
      try {
        // Get current missed backup notifications configuration
        const missedNotificationsJson = getConfiguration('missed_backup_notifications');
        if (missedNotificationsJson) {
          const missedNotifications = JSON.parse(missedNotificationsJson) as Record<string, {
            lastNotificationSent: string;
            lastBackupDate: string;
          }>;

          const backupKeysToClear: BackupKey[] = [];
          
          for (const [backupKey, backupConfig] of Object.entries(backupSettings)) {
            const config = backupConfig as BackupNotificationConfig;
            const currentConfig = currentBackupSettings[backupKey];
            
            // Clear notifications if missed backup check is disabled
            if (!config.missedBackupCheckEnabled) {
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

          // Remove entries for backups that need clearing from missed_backup_notifications
          const updatedMissedNotifications = { ...missedNotifications };

          for (const backupKey of backupKeysToClear) {
            if (updatedMissedNotifications[backupKey]) {
              delete updatedMissedNotifications[backupKey];
            }
          }

          // Save the updated configuration
          setConfiguration('missed_backup_notifications', JSON.stringify(updatedMissedNotifications));

        }
      } catch (cleanupError) {
        console.error('Failed to cleanup missed backup notifications:', cleanupError);
        // Don't fail the entire save operation if cleanup fails
      }
    }
    
    return NextResponse.json({ message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Failed to save configuration:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
} 