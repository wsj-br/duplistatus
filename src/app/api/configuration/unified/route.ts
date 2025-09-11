import { NextResponse } from 'next/server';
import { getConfiguration, getNtfyConfig, getAllServerAddresses, getCronConfig, getNotificationFrequencyConfig } from '@/lib/db-utils';
import { dbUtils } from '@/lib/db-utils';
import { NotificationConfig } from '@/lib/types';
import { createDefaultNotificationConfig, defaultOverdueTolerance } from '@/lib/default-config';

export async function GET() {
  try {
    // Fetch all configuration data in parallel
    const [configJson, backupSettingsJson, overdueTolerance, ntfyConfig, cronConfig, notificationFrequency, serversBackupNames] = await Promise.all([
      Promise.resolve(getConfiguration('notifications')),
      Promise.resolve(getConfiguration('backup_settings')),
      Promise.resolve(getConfiguration('overdue_tolerance')),
      getNtfyConfig(),
      Promise.resolve(getCronConfig()),
      Promise.resolve(getNotificationFrequencyConfig()),
      Promise.resolve(dbUtils.getServersBackupNames())
    ]);

    // Build the main configuration
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
    config.ntfy = ntfyConfig;

    // Load backup settings
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

    // Transform servers data
    const serversWithBackups = (serversBackupNames as { 
      id: string; 
      server_id: string;
      server_name: string; 
      backup_name: string;
      server_url: string;
      alias: string;
      note: string;
    }[]).map((server) => ({
      id: server.server_id,
      name: server.server_name,
      backupName: server.backup_name,
      server_url: server.server_url,
      alias: server.alias,
      note: server.note
    }));

    // Return unified configuration object
    const unifiedConfig = {
      ...config,
      overdue_tolerance: overdueTolerance || defaultOverdueTolerance,
      serverAddresses: getAllServerAddresses(),
      cronConfig: {
        cronExpression: cronConfig.tasks['overdue-backup-check'].cronExpression,
        enabled: cronConfig.tasks['overdue-backup-check'].enabled
      },
      notificationFrequency,
      serversWithBackups
    };

    return NextResponse.json(unifiedConfig);
  } catch (error) {
    console.error('Error fetching unified configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}
