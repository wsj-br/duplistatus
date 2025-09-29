import { NextResponse } from 'next/server';
import { getConfigNotifications, getConfigBackupSettings, getOverdueToleranceConfig, getNtfyConfig, getAllServerAddresses, getCronConfig, getNotificationFrequencyConfig, getSMTPConfig, clearRequestCache } from '@/lib/db-utils';
import { dbUtils } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

export const GET = withCSRF(async () => {
  try {
    // Clear request cache to ensure fresh data on each request
    clearRequestCache();
    
    // Fetch all configuration data in parallel
    const [notificationConfig, backupSettings, overdueToleranceEnum, ntfyConfig, cronConfig, notificationFrequency, serversBackupNames, smtpConfig] = await Promise.all([
      Promise.resolve(getConfigNotifications()),
      getConfigBackupSettings(), // Now async and includes completion logic
      Promise.resolve(getOverdueToleranceConfig()),
      getNtfyConfig(),
      Promise.resolve(getCronConfig()),
      Promise.resolve(getNotificationFrequencyConfig()),
      Promise.resolve(dbUtils.getServersBackupNames()),
      Promise.resolve(getSMTPConfig())
    ]);

    // Build the main configuration
    const config = notificationConfig;
    config.ntfy = ntfyConfig;
    
    // Add email configuration if available
    if (smtpConfig) {
      config.email = {
        ...smtpConfig,
        enabled: true // SMTP config exists, so email is enabled
      };
    }

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
      hasPassword: boolean;
    }[]).map((server) => ({
      id: server.server_id,
      name: server.server_name,
      backupName: server.backup_name,
      server_url: server.server_url,
      alias: server.alias,
      note: server.note,
      hasPassword: server.hasPassword
    }));

    // Return unified configuration object
    const unifiedConfig = {
      ...config,
      overdue_tolerance: overdueToleranceEnum,
      serverAddresses: getAllServerAddresses(),
      cronConfig: {
        cronExpression: cronConfig.tasks['overdue-backup-check'].cronExpression,
        enabled: cronConfig.tasks['overdue-backup-check'].enabled
      },
      notificationFrequency,
      serversWithBackups
    };

    return NextResponse.json(unifiedConfig, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching unified configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
});
