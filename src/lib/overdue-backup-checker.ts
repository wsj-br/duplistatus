import { dbUtils } from '@/lib/db-utils';
import { sendOverdueBackupNotification, OverdueBackupContext } from '@/lib/notifications';
import { getConfiguration, setConfiguration, getNotificationFrequencyConfig, calculateExpectedBackupDate, getOverdueToleranceConfig, getNtfyConfig } from '@/lib/db-utils';
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
export async function checkOverdueBackups(checkDate?: Date) {
  try {
    // Get current time
    const currentTime = checkDate || new Date();
    const currentTimeMs = currentTime.getTime();

    if(checkDate) {
      console.log('[checkOverdueBackups] Current time: '+currentTime.toLocaleString());
    }

    // Check if cron configuration exists in database, if not use default and persist
    const cronConfigJson = getConfiguration('cron_service');
    if (!cronConfigJson) {
      console.log('[checkOverdueBackups] No cron configuration found in database, using default configuration');
      const { defaultCronConfig } = await import('@/lib/default-config');
      setConfiguration('cron_service', JSON.stringify(defaultCronConfig));
      console.log('[checkOverdueBackups] Default cron configuration persisted to database');
    }

    // Get notification configuration
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    if (!configJson) {
      return { 
        message: 'No notification configuration found',
        statistics: {
          totalBackupConfigs: 0,
          checkedBackups: 0,
          overdueBackupsFound: 0,
          notificationsSent: 0,
        }
      };
    }

    const config: NotificationConfig = JSON.parse(configJson);
    
    // Ensure ntfy config is properly set
    const ntfyConfig = getNtfyConfig();
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

    // Get notification frequency configuration
    const notificationFrequency = getNotificationFrequencyConfig();

    // Get last notification timestamps
    const lastNotificationJson = getConfiguration('overdue_backup_notifications');
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
    let overdueBackupsFound = 0;
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
            
      if (!backupConfig.overdueBackupCheckEnabled) {
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

      // Always update the lastBackupDate for this backup to ensure dashboard accuracy
      // This ensures the dashboard shows real-time overdue backup counts
      if (!updatedNotifications[backupKey]) {
        updatedNotifications[backupKey] = {
          lastNotificationSent: "",
          lastBackupDate: latestBackup.date
        };
      } else {
        // Update the lastBackupDate to the current latest backup date
        updatedNotifications[backupKey].lastBackupDate = latestBackup.date;
      }
      
      // Get interval configuration
      const intervalUnit = backupConfig.intervalUnit || 'hours'; // Fallback for legacy configs
      const expectedInterval = backupConfig.expectedInterval;
      
      // Calculate expected backup date using the helper function with tolerance
      const globalTolerance = getOverdueToleranceConfig();
      const expectedBackupDate = calculateExpectedBackupDate(latestBackup.date, expectedInterval, intervalUnit, globalTolerance);
      
      // Check if backup is overdue by comparing expected date with current time
      const expectedBackupTime = new Date(expectedBackupDate);
      
      // Check if backup is overdue (expected date is in the past)
      if (expectedBackupDate !== 'N/A' && !isNaN(expectedBackupTime.getTime()) && currentTime > expectedBackupTime) {
        overdueBackupsFound++;

        // Check if we should send a notification (with resend frequency logic)
        const lastNotification = lastNotifications[backupKey];
        let shouldSendNotification = false;
        
        if (!lastNotification || !lastNotification.lastNotificationSent || lastNotification.lastNotificationSent === "") {
          // No notification sent yet or lastNotificationSent is empty
          shouldSendNotification = true;
        } else {
          // Notification was sent before
          const lastBackupDate = new Date(lastNotification.lastBackupDate);
          const lastNotificationSent = new Date(lastNotification.lastNotificationSent);
          const latestBackupDate = new Date(latestBackup.date);

          // Check if lastNotificationSent is a valid date
          if (isNaN(lastNotificationSent.getTime())) {
            // Invalid date, treat as no notification sent
            shouldSendNotification = true;
          } else if (latestBackupDate > lastBackupDate) {
            // New backup event, always notify
            shouldSendNotification = true;
          } else {
            // No new backup, check notification frequency
            if (notificationFrequency !== 'onetime') {
              let notificationIntervalMs = 0;
              switch (notificationFrequency) {
                case 'every_day':
                  notificationIntervalMs = 24 * 60 * 60 * 1000;
                  break;
                case 'every_week':
                  notificationIntervalMs = 7 * 24 * 60 * 60 * 1000;
                  break;
                case 'every_month':
                  notificationIntervalMs = 30 * 24 * 60 * 60 * 1000;
                  break;
                default:
                  notificationIntervalMs = 0;
              }
              
              if (notificationIntervalMs > 0 && (currentTimeMs - lastNotificationSent.getTime() >= notificationIntervalMs)) {
                shouldSendNotification = true;
              } else {
                shouldSendNotification = false;
              }
            } else {
              // If notificationFrequency is 'onetime', do not resend
              shouldSendNotification = false;
            }
          }
        }
        
        if (shouldSendNotification) {
          try {
            // Calculate overdue time ago using formatTimeAgo
            const overdueTimeAgo = formatTimeAgo(latestBackup.date);
            
            // Get interval information from backup config
            const intervalUnit = backupConfig.intervalUnit || 'hours';
            const intervalValue = backupConfig.expectedInterval;
            
            // Validate required fields
            if (!machineName || !backupName || !latestBackup.date) {
              console.error(`Missing required fields for overdue backup notification: machineName=${machineName}, backupName=${backupName}, lastBackupDate=${latestBackup.date}`);
              continue;
            }
            
            // Validate interval configuration
            if (!intervalValue || intervalValue <= 0) {
              console.error(`Invalid interval configuration for ${backupKey}: intervalValue=${intervalValue}`);
              continue;
            }
            
            // Calculate expected backup date and elapsed time
            const globalTolerance = getOverdueToleranceConfig();
            const expectedBackupDate = calculateExpectedBackupDate(latestBackup.date, intervalValue, intervalUnit, globalTolerance);
            const expectedBackupElapsed = expectedBackupDate !== 'N/A' ? formatTimeAgo(expectedBackupDate) : 'N/A';
            
            const overdueBackupContext: OverdueBackupContext = {
              machine_name: machineName,
              machine_id: machineId,
              backup_name: backupName,
              last_backup_date: latestBackup.date,
              last_elapsed: overdueTimeAgo,
              expected_date: expectedBackupDate,
              expected_elapsed: expectedBackupElapsed,
              backup_interval_type: intervalUnit,
              backup_interval_value: intervalValue,
              overdue_tolerance: '', // This will be set by sendOverdueBackupNotification
            };

            await sendOverdueBackupNotification(machineId, machineName, backupName, overdueBackupContext, config);
            notificationsSent++;
            
            // Update the notification timestamp when notification is sent
            updatedNotifications[backupKey].lastNotificationSent = currentTime.toISOString();
          } catch (error) {
            console.error(`Failed to send overdue backup notification for ${backupKey}:`, error instanceof Error ? error.message : String(error));
          }
        }
      }
    }

    // Save updated notification timestamps
    setConfiguration('overdue_backup_notifications', JSON.stringify(updatedNotifications));

    // Save the timestamp of when this check was last run
    setConfiguration('last_overdue_check', currentTime.toISOString());
    
    return {
      message: 'Overdue backup check completed',
      statistics: {
        totalBackupConfigs: backupKeys.length,
        checkedBackups,
        overdueBackupsFound,
        notificationsSent,
      },
    };
  } catch (error) {
    console.error('Error checking for overdue backups:', error instanceof Error ? error.message : String(error));
    throw error;
  }
} 

// Clears overdue backup notification timestamps configuration
export function clearOverdueBackupNotificationTimestamps(): { message: string } {
  setConfiguration('overdue_backup_notifications', JSON.stringify({}));
  return { message: 'Overdue backup notification timestamps cleared successfully' };
} 