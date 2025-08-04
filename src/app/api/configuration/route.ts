import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration, getNtfyConfig } from '@/lib/db-utils';
import { NotificationConfig, BackupKey, BackupNotificationConfig } from '@/lib/types';
import { createDefaultNotificationConfig, defaultBackupNotificationConfig } from '@/lib/default-config';

export async function GET() {
  try {
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    const overdueTolerance = getConfiguration('overdue_tolerance');
    
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

    // Add overdue tolerance to the response
    const response = {
      ...config,
      overdue_tolerance: overdueTolerance || defaultBackupNotificationConfig.overdueTolerance
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get configuration:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get configuration' }, { status: 500 });
  }
} 