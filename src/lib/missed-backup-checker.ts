import { dbUtils } from '@/lib/db-utils';
import { sendMissedBackupNotification, MissedBackupContext } from '@/lib/notifications';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { NotificationConfig } from '@/lib/types';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

interface LastNotificationTimestamps {
  [backupKey: string]: {
    lastNotificationSent: string; // ISO timestamp
    lastBackupDate: string; // ISO timestamp of the backup that was current when notification was sent
  };
}

// Core function that can be called directly
export async function checkMissedBackups() {
  try {
    // Get notification configuration
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    if (!configJson) {
      return { message: 'No notification configuration found' };
    }

    const config: NotificationConfig = JSON.parse(configJson);
    
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

    // Get last notification timestamps
    const lastNotificationJson = getConfiguration('missed_backup_notifications');
    const lastNotifications: LastNotificationTimestamps = lastNotificationJson 
      ? JSON.parse(lastNotificationJson) 
      : {};

    // Get machines summary for machine ID lookup
    const machinesSummary = dbUtils.getMachinesSummary() as { 
      id: string; 
      name: string; 
      lastBackupName: string | null;
    }[];
    
    // Create a map for quick machine name to ID lookup
    const machineNameToId = new Map<string, string>();
    machinesSummary.forEach(machine => {
      machineNameToId.set(machine.name, machine.id);
    });
    
    let checkedBackups = 0;
    let missedBackupsFound = 0;
    let notificationsSent = 0;
    const updatedNotifications: LastNotificationTimestamps = { ...lastNotifications };

    // Iterate through backup settings keys (machine_name:backup_name)
    const backupKeys = Object.keys(config.backupSettings || {});

    for (const backupKey of backupKeys) {
      // Parse machine name and backup name from the key
      const [machineName, backupName] = backupKey.split(':');
      
      if (!machineName || !backupName) {
        continue;
      }
      
      // Get the backup configuration
      const backupConfig = config.backupSettings[backupKey];
      
      if (!backupConfig) {
        continue;
      }
            
      if (!backupConfig.missedBackupCheckEnabled) {
        continue;
      }
      
      // Get machine ID from the machine name
      const machineId = machineNameToId.get(machineName);
      if (!machineId) {
        continue;
      }
      
      checkedBackups++;

      // Get the latest backup for this machine and backup name
      const latestBackup = dbUtils.getLatestBackupByName(machineId, backupName) as {
        date: string;
        machine_name: string;
        backup_name?: string;
      } | null;

      if (!latestBackup) {
        continue;
      }

      // Calculate hours since last backup
      const lastBackupTime = new Date(latestBackup.date).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLastBackup = (currentTime - lastBackupTime) / (1000 * 60 * 60);

      // Convert expected interval to hours based on the configured unit
      let expectedIntervalInHours: number;
      const intervalUnit = backupConfig.intervalUnit || 'hours'; // Fallback for legacy configs
      if (intervalUnit === 'days') {
        expectedIntervalInHours = backupConfig.expectedInterval * 24;
      } else {
        expectedIntervalInHours = backupConfig.expectedInterval;
      }

      // Add 1 hour buffer to accommodate backup durations and clock differences
      const thresholdInHours = expectedIntervalInHours + 1;

      // Check if backup is overdue (only trigger if threshold + 1 hour has elapsed)
      if (hoursSinceLastBackup > thresholdInHours) {
        missedBackupsFound++;

        // Check if we should send a notification
        const lastNotification = lastNotifications[backupKey];
        const shouldSendNotification = !lastNotification || 
          new Date(latestBackup.date) > new Date(lastNotification.lastBackupDate);

        if (shouldSendNotification) {
          try {
            const missedBackupContext: MissedBackupContext = {
              machine_name: machineName,
              machine_id: machineId,
              backup_name: backupName,
              expected_interval: expectedIntervalInHours, // Store in hours for consistency
              hours_since_last_backup: Math.round(hoursSinceLastBackup),
              last_backup_date: latestBackup.date,
              link: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9666'}/detail/${machineId}`,
              // Additional variables to match TEMPLATE_VARIABLES
              backup_date: latestBackup.date,
              status: 'Missed',
              messages_count: 0,
              warnings_count: 0,
              errors_count: 0,
              duration: 'N/A',
              file_count: 0,
              file_size: 'N/A',
              uploaded_size: 'N/A',
              storage_size: 'N/A',
              available_versions: 0,
            };

            await sendMissedBackupNotification(machineId, machineName, backupName, missedBackupContext);
            notificationsSent++;
            
            // Update the notification timestamp
            updatedNotifications[backupKey] = {
              lastNotificationSent: new Date().toISOString(),
              lastBackupDate: latestBackup.date
            };
          } catch (error) {
            console.error(`Failed to send missed backup notification for ${backupKey}:`, error);
          }
        }
      }
    }

    // Save updated notification timestamps
    setConfiguration('missed_backup_notifications', JSON.stringify(updatedNotifications));

    return {
      message: 'Missed backup check completed',
      statistics: {
        totalBackupConfigs: backupKeys.length,
        checkedBackups,
        missedBackupsFound,
        notificationsSent,
      },
    };
  } catch (error) {
    console.error('Error checking for missed backups:', error);
    throw error;
  }
} 

// Clears missed backup notification timestamps configuration
export function clearMissedBackupNotificationTimestamps(): { message: string } {
  setConfiguration('missed_backup_notifications', JSON.stringify({}));
  return { message: 'Missed backup notification timestamps cleared successfully' };
} 