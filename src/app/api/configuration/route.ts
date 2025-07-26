import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { NotificationConfig, BackupKey, BackupNotificationConfig } from '@/lib/types';

export async function GET() {
  try {
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    const config: NotificationConfig = configJson ? JSON.parse(configJson) : {
      ntfy: { url: 'https://ntfy.sh/', topic: '' },
      machineSettings: {},
      backupSettings: {},
      templates: {
        missedBackup: {
            message: "The backup {backup_name} is missing on {machine_name}.\n\n🚨 The last backup was {last_backup_date} ({last_elapsed})\n🔍 Please check the duplicati server.",
            priority: "default",
            tags: "duplicati, duplistatus, missed",
            title: "🕑 Missed - {backup_name}  @ {machine_name}"
        },
        success: {
              message: "Backup {backup_name} on {machine_name} completed with status {status} at {backup_date} in {duration}.\n\n💾 Store usage:  {storage_size} \n🔃 Available versions:  {available_versions} ",
            priority: "default",
            tags: "duplicati, duplistatus, success",
            title: "✅ {status} - {backup_name}  @ {machine_name}"
        },
        warning: {
            message: "Backup {backup_name} on {machine_name} completed with status {status} at {backup_date}.\n\n🚨 {warnings} warnings\n🛑 {errors} errors.",
            priority: "high",
            tags: "duplicati, duplistatus, warning, error",
            title: " ⚠️{status} - {backup_name}  @ {machine_name}"
        }
      },
    };

    // Load backup settings from separate configuration if available
    if (backupSettingsJson) {
      try {
        const backupSettings = JSON.parse(backupSettingsJson);
        config.backupSettings = backupSettings;
      } catch (error) {
        console.error('Failed to parse backup settings:', error);
        config.backupSettings = {};
      }
    } else {
      config.backupSettings = {};
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to get configuration:', error);
    return NextResponse.json({ error: 'Failed to get configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const config: NotificationConfig = await request.json();
    
    // Save main configuration (without backupSettings)
    const { backupSettings, ...mainConfig } = config;
    setConfiguration('notifications', JSON.stringify(mainConfig));
    
    // Save backup settings separately
    setConfiguration('backup_settings', JSON.stringify(backupSettings || {}));
    
    // Clean up missed backup notifications for disabled backups
    if (backupSettings) {
      try {
        // Get current missed backup notifications configuration
        const missedNotificationsJson = getConfiguration('missed_backup_notifications');
        if (missedNotificationsJson) {
          const missedNotifications = JSON.parse(missedNotificationsJson) as Record<string, {
            lastNotificationSent: string;
            lastBackupDate: string;
          }>;

          // Find backups where missedBackupCheckEnabled is disabled
          const disabledBackupKeys: BackupKey[] = [];
          
          for (const [backupKey, backupConfig] of Object.entries(backupSettings)) {
            const config = backupConfig as BackupNotificationConfig;
            if (!config.missedBackupCheckEnabled) {
              disabledBackupKeys.push(backupKey);
            }
          }

          // Remove entries for disabled backups from missed_backup_notifications
          const updatedMissedNotifications = { ...missedNotifications };

          for (const backupKey of disabledBackupKeys) {
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
    console.error('Failed to save configuration:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
} 