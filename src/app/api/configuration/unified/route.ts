import { NextResponse } from 'next/server';
import { getConfigNotifications, getConfigBackupSettings, getConfigOverdueTolerance, getNtfyConfig, getAllServerAddresses, getCronConfig, getNotificationFrequencyConfig } from '@/lib/db-utils';
import { dbUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    // Fetch all configuration data in parallel
    const [notificationConfig, backupSettings, overdueToleranceMinutes, ntfyConfig, cronConfig, notificationFrequency, serversBackupNames] = await Promise.all([
      Promise.resolve(getConfigNotifications()),
      getConfigBackupSettings(), // Now async and includes completion logic
      Promise.resolve(getConfigOverdueTolerance()),
      getNtfyConfig(),
      Promise.resolve(getCronConfig()),
      Promise.resolve(getNotificationFrequencyConfig()),
      Promise.resolve(dbUtils.getServersBackupNames())
    ]);

    // Build the main configuration
    const config = notificationConfig;
    config.ntfy = ntfyConfig;

    // Load backup settings
    if (Object.keys(backupSettings).length > 0) {
      config.backupSettings = backupSettings;
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
      overdue_tolerance: overdueToleranceMinutes,
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
