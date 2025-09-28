import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { getConfigBackupSettings, setConfigBackupSettings, getConfigOverdueNotifications, setConfigOverdueNotifications } from '@/lib/db-utils';
import { BackupKey, BackupNotificationConfig } from '@/lib/types';
import { migrateBackupSettings } from '@/lib/migration-utils';

export const POST = withCSRF(async (request: NextRequest) => {
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
    
    return NextResponse.json({ message: 'Backup settings updated successfully' });
  } catch (error) {
    console.error('Failed to update backup settings:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update backup settings' }, { status: 500 });
  }
});