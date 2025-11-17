import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { getConfigBackupSettings, setConfigBackupSettings, getConfigOverdueNotifications, setConfigOverdueNotifications, getServerInfoById } from '@/lib/db-utils';
import { BackupKey, BackupNotificationConfig } from '@/lib/types';
import { migrateBackupSettings } from '@/lib/migration-utils';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    
    const body = await request.json();
    const { backupSettings } = body;
    
    if (!backupSettings) {
      return NextResponse.json({ error: 'backupSettings is required' }, { status: 400 });
    }
    
    // Get current backup settings to compare for changes
    const currentBackupSettings = await getConfigBackupSettings();
    
    // Migrate incoming backup settings to ensure they're in new format
    const migratedBackupSettings = migrateBackupSettings(backupSettings);
    
    // Save backup settings separately
    setConfigBackupSettings(migratedBackupSettings);
    
    // Clean up overdue backup notifications for disabled backups and changed timeout settings
    try {
      // Get current overdue backup notifications configuration
      const overdueNotifications = getConfigOverdueNotifications();
      if (Object.keys(overdueNotifications).length > 0) {

        const backupKeysToClear: BackupKey[] = [];
        
        for (const [backupKey, backupConfig] of Object.entries(migratedBackupSettings)) {
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
            const hasAllowedDaysChanged = JSON.stringify(currentConfig.allowedWeekDays) !== JSON.stringify(config.allowedWeekDays);
            
            if (hasIntervalChanged || hasAllowedDaysChanged) {
              backupKeysToClear.push(backupKey);
            }
          }
        }

        // Remove entries for backups that need clearing from overdue_notifications
        const updatedOverdueNotifications = { ...overdueNotifications };

        for (const backupKey of backupKeysToClear) {
          if (updatedOverdueNotifications[backupKey]) {
            delete updatedOverdueNotifications[backupKey];
          }
        }

        // Save the updated configuration
        setConfigOverdueNotifications(updatedOverdueNotifications);
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup overdue backup notifications:', cleanupError);
        // Don't fail the entire save operation if cleanup fails
    }
    
    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const backupKeys = Object.keys(migratedBackupSettings);
      
      // Build a summary of changed notification settings
      // Only include fields that actually changed (limit to first 20 backups to avoid huge logs)
      const changesSummary: Record<string, Record<string, { old: any; new: any }>> = {};
      const modifiedBackupKeys: string[] = [];
      const keysToCheck = backupKeys.slice(0, 20); // Check up to 20 backups for changes
      
      // Helper function to format backup key with server name
      const formatBackupKeyWithServerName = (backupKey: string): string => {
        const [serverId, ...backupNameParts] = backupKey.split(':');
        const backupName = backupNameParts.join(':'); // Handle backup names that might contain ':'
        
        // Get server name
        const serverInfo = getServerInfoById(serverId);
        const serverName = serverInfo?.name || serverId; // Fallback to serverId if server not found
        
        return `${serverName}:${serverId}:${backupName}`;
      };
      
      for (const backupKey of keysToCheck) {
        const newConfig = migratedBackupSettings[backupKey];
        const oldConfig = currentBackupSettings[backupKey];
        
        // Track only the fields that changed with old and new values
        const changedFields: Record<string, { old: any; new: any }> = {};
        
        // Check each field for changes
        if (!oldConfig || oldConfig.notificationEvent !== newConfig.notificationEvent) {
          changedFields.notificationEvent = {
            old: oldConfig?.notificationEvent ?? null,
            new: newConfig.notificationEvent,
          };
        }
        if (!oldConfig || oldConfig.ntfyEnabled !== newConfig.ntfyEnabled) {
          changedFields.ntfyEnabled = {
            old: oldConfig?.ntfyEnabled ?? null,
            new: newConfig.ntfyEnabled,
          };
        }
        if (!oldConfig || oldConfig.emailEnabled !== newConfig.emailEnabled) {
          changedFields.emailEnabled = {
            old: oldConfig?.emailEnabled ?? null,
            new: newConfig.emailEnabled,
          };
        }
        if (!oldConfig || oldConfig.overdueBackupCheckEnabled !== newConfig.overdueBackupCheckEnabled) {
          changedFields.overdueBackupCheckEnabled = {
            old: oldConfig?.overdueBackupCheckEnabled ?? null,
            new: newConfig.overdueBackupCheckEnabled,
          };
        }
        if (!oldConfig || oldConfig.expectedInterval !== newConfig.expectedInterval) {
          changedFields.expectedInterval = {
            old: oldConfig?.expectedInterval ?? null,
            new: newConfig.expectedInterval,
          };
        }
        if (!oldConfig || JSON.stringify(oldConfig.allowedWeekDays) !== JSON.stringify(newConfig.allowedWeekDays)) {
          changedFields.allowedWeekDays = {
            old: oldConfig?.allowedWeekDays ?? null,
            new: newConfig.allowedWeekDays,
          };
        }
        
        // Only include this backup if there are actual changes
        if (Object.keys(changedFields).length > 0) {
          const formattedKey = formatBackupKeyWithServerName(backupKey);
          modifiedBackupKeys.push(formattedKey);
          changesSummary[formattedKey] = changedFields;
        }
      }
      
      // Only include detailed changes if there are actual modifications
      const auditDetails = modifiedBackupKeys.length > 0
        ? {
            backupCount: backupKeys.length,
            modifiedCount: modifiedBackupKeys.length,
            modifiedBackupKeys: modifiedBackupKeys,
            changes: changesSummary,
            hasMoreBackups: modifiedBackupKeys.length === 20 && backupKeys.length > 20,
          }
        : {
            message: 'No changes',
          };

      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.logConfigChange(
        'backup_notification_updated',
        authContext.userId,
        authContext.username,
        'backup_settings',
        auditDetails,
        ipAddress,
        userAgent
      );
    }
    
    return NextResponse.json({ message: 'Backup settings updated successfully' });
  } catch (error) {
    console.error('Failed to update backup settings:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update backup settings' }, { status: 500 });
  }
}));