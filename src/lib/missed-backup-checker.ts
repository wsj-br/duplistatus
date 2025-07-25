import { dbUtils } from '@/lib/db-utils';
import { sendMissedBackupNotification, MissedBackupContext } from '@/lib/notifications';
import { getConfiguration, setConfiguration, getResendFrequencyConfig } from '@/lib/db-utils';
import { NotificationConfig } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';

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

    // Get resend frequency configuration
    const resendFrequency = getResendFrequencyConfig();

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

      // Add 2 hours buffer to accommodate backup durations and clock differences
      const thresholdInHours = expectedIntervalInHours + 2;

      // Check if backup is overdue
      if (hoursSinceLastBackup > thresholdInHours) {
        missedBackupsFound++;

        // Check if we should send a notification (with resend frequency logic)
        const lastNotification = lastNotifications[backupKey];
        let shouldSendNotification = false;
        if (!lastNotification) {
          // No notification sent yet
          shouldSendNotification = true;
        } else {
          // Notification was sent before
          const lastBackupDate = new Date(lastNotification.lastBackupDate);
          const lastNotificationSent = new Date(lastNotification.lastNotificationSent);
          const latestBackupDate = new Date(latestBackup.date);

          if (latestBackupDate > lastBackupDate) {
            // New backup event, always notify
            shouldSendNotification = true;
          } else {
            // No new backup, check resend frequency
            if (resendFrequency !== 'never') {
              let resendIntervalMs = 0;
              switch (resendFrequency) {
                case 'every_day':
                  resendIntervalMs = 24 * 60 * 60 * 1000;
                  break;
                case 'every_week':
                  resendIntervalMs = 7 * 24 * 60 * 60 * 1000;
                  break;
                case 'every_month':
                  resendIntervalMs = 30 * 24 * 60 * 60 * 1000;
                  break;
                default:
                  resendIntervalMs = 0;
              }
              if (resendIntervalMs > 0 && (currentTime - lastNotificationSent.getTime() >= resendIntervalMs)) {
                shouldSendNotification = true;
              }
            }
            // If resendFrequency is 'never', do not resend
          }
        }

        if (shouldSendNotification) {
          try {
            // Calculate missed time ago using formatTimeAgo
            const missedTimeAgo = formatTimeAgo(latestBackup.date);
            
            // Get interval information from backup config
            const intervalUnit = backupConfig.intervalUnit || 'hours';
            const intervalValue = backupConfig.expectedInterval;
            
            // Validate required fields
            if (!machineName || !backupName || !latestBackup.date) {
              console.error(`Missing required fields for missed backup notification: machineName=${machineName}, backupName=${backupName}, lastBackupDate=${latestBackup.date}`);
              continue;
            }
            
            // Validate interval configuration
            if (!intervalValue || intervalValue <= 0) {
              console.error(`Invalid interval configuration for ${backupKey}: intervalValue=${intervalValue}`);
              continue;
            }
            
            const missedBackupContext: MissedBackupContext = {
              machine_name: machineName,
              machine_id: machineId,
              backup_name: backupName,
              last_backup_date: new Date(latestBackup.date).toLocaleString(),
              last_elapsed: missedTimeAgo,
              backup_interval_type: intervalUnit,
              backup_interval_value: intervalValue,
            };

            await sendMissedBackupNotification(machineId, machineName, backupName, missedBackupContext, config);
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