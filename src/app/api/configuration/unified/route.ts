import { NextResponse } from 'next/server';
import { getConfigBackupSettings, getOverdueToleranceConfig, getNtfyConfig, getAllServerAddresses, getCronConfig, getNotificationFrequencyConfig, getSMTPConfig, clearRequestCache, getNotificationTemplates } from '@/lib/db-utils';
import type { NtfyConfig, EmailConfig, NotificationTemplate } from '@/lib/types';
import { dbUtils } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

export const GET = withCSRF(async () => {
  try {
    // Clear request cache to ensure fresh data on each request
    clearRequestCache();
    
    // Fetch all configuration data in parallel
    const [backupSettings, overdueToleranceEnum, ntfyConfig, cronConfig, notificationFrequency, serversBackupNames, smtpConfig, templates] = await Promise.all([
      getConfigBackupSettings(),
      Promise.resolve(getOverdueToleranceConfig()),
      getNtfyConfig(),
      Promise.resolve(getCronConfig()),
      Promise.resolve(getNotificationFrequencyConfig()),
      Promise.resolve(dbUtils.getServersBackupNames()),
      Promise.resolve(getSMTPConfig()),
      Promise.resolve(getNotificationTemplates())
    ]);

    // Build base response fields
    const base: {
      ntfy: NtfyConfig;
      templates: { success: NotificationTemplate; warning: NotificationTemplate; overdueBackup: NotificationTemplate };
      email?: EmailConfig;
    } = {
      ntfy: ntfyConfig,
      templates
    };

    // Add email configuration if available (without password)
    if (smtpConfig) {
      base.email = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        connectionType: smtpConfig.connectionType,
        username: smtpConfig.username,
        mailto: smtpConfig.mailto,
        senderName: smtpConfig.senderName,
        fromAddress: smtpConfig.fromAddress,
        requireAuth: smtpConfig.requireAuth !== false, // Default to true for backward compatibility
        enabled: true, // SMTP config exists, so email is enabled
        hasPassword: Boolean(smtpConfig.password && smtpConfig.password.trim() !== '')
      };
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
      ...base,
      overdue_tolerance: overdueToleranceEnum,
      // keep these independent of notification config shape
      backup_settings: backupSettings,
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
