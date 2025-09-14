import { dbUtils, ensureBackupSettingsComplete } from '@/lib/db-utils';
import { sendOverdueBackupNotification, OverdueBackupContext } from '@/lib/notifications';
import { getConfiguration, setConfiguration, getNotificationFrequencyConfig, getOverdueToleranceConfig, getOverdueToleranceLabel } from '@/lib/db-utils';
import { OverdueNotifications } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';


// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

// Core function that can be called directly
export async function checkOverdueBackups(checkDate?: Date) {
  try {
    // Get current time
    const currentTime = checkDate || new Date();
    const currentTimeMs = currentTime.getTime();

    if(checkDate) {
      console.log('[checkOverdueBackups] Debug mode: current time: '+currentTime.toLocaleString());
    }

    // Ensure backup settings are complete for all machines and backups
    // This will add default settings for any missing machine-backup combinations
    await ensureBackupSettingsComplete();

    // Load backup settings from separate configuration if available
    const backupSettingsJson = getConfiguration('backup_settings');
    const backupSettings = backupSettingsJson ? JSON.parse(backupSettingsJson) : {};

    // Get notification frequency configuration
    const notificationFrequency = getNotificationFrequencyConfig();

    // Get last notification timestamps
    const lastNotificationJson = getConfiguration('overdue_notifications');
    const lastNotifications = lastNotificationJson ? JSON.parse(lastNotificationJson) : {};

    // Get servers summary with all server and backup information
    const serversSummary = dbUtils.getServersSummary();
    
    let checkedBackups = 0;
    let overdueBackupsFound = 0;
    let notificationsSent = 0;
    const updatedNotifications: OverdueNotifications = { ...lastNotifications };

    // Iterate through servers and their backup jobs
    for (const server of serversSummary) {
      for (const backupInfo of server.backupInfo) {
        const backupKey = `${server.id}:${backupInfo.name}`;

        // Get the backup configuration
        const backupConfig = backupSettings?.[backupKey];
        
        if (!backupConfig || !backupConfig.overdueBackupCheckEnabled) {
          continue;
        }

        checkedBackups++;

        // Skip if no backup date available
        if (backupInfo.lastBackupDate === 'N/A') {
          continue;
        }

        // Use the pre-calculated overdue status from getServersSummary
        if (backupInfo.isBackupOverdue) {
          overdueBackupsFound++;

          // Check if we should send a notification (with resend frequency logic)
          const lastNotification = lastNotifications[backupKey];
          let shouldSendNotification = false;

          if (!lastNotification || !lastNotification.lastNotificationSent || lastNotification.lastNotificationSent === "") {
            // No notification sent yet or lastNotificationSent is empty
            shouldSendNotification = true;
          } else {
            // Notification was sent before
            const lastNotificationSent = new Date(lastNotification.lastNotificationSent);

            // Check if lastNotificationSent is a valid date
            if (isNaN(lastNotificationSent.getTime())) {
              // Invalid date, treat as no notification sent
              shouldSendNotification = true;
            } else if ((new Date(backupInfo.lastBackupDate)) > lastNotificationSent) {
               // Last backup event is newer than the lastNotificationSent, always notify 
               shouldSendNotification = true;
            } else {
              // lastNotificationSent exists, check notification frequency
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

                if (notificationIntervalMs > 0 && ((lastNotificationSent.getTime()+notificationIntervalMs) <= currentTimeMs )) {
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
              const overdueTimeAgo = formatTimeAgo(backupInfo.lastBackupDate);
              
              // Get interval information from backup config
              const intervalUnit = backupConfig.intervalUnit || 'hour';
              const intervalValue = backupConfig.expectedInterval;
              
              // Validate required fields
              if (!server.name || !backupInfo.name || !backupInfo.lastBackupDate) {
                continue;
              }
              
              // Validate interval configuration
              if (!intervalValue || intervalValue <= 0) {
                continue;
              }
              
              // Use the pre-calculated expected backup date from getServersSummary
              const expectedBackupDate = backupInfo.expectedBackupDate;
              const expectedBackupElapsed = expectedBackupDate !== 'N/A' ? formatTimeAgo(expectedBackupDate) : 'N/A';
              
              // Get the overdue tolerance configuration and add it to the context
              const overdueTolerance = getOverdueToleranceConfig();
              
              const overdueBackupContext: OverdueBackupContext = {
                server_name: server.name,
                server_id: server.id,
                server_alias: '', // will be populated by the notification service
                server_note: '', // will be populated by the notification service
                server_url: '', // will be populated by the notification service
                backup_name: backupInfo.name,
                last_backup_date: backupInfo.lastBackupDate,
                last_elapsed: overdueTimeAgo,
                expected_date: expectedBackupDate,
                expected_elapsed: expectedBackupElapsed,
                backup_interval_type: intervalUnit,
                backup_interval_value: intervalValue,
                overdue_tolerance: getOverdueToleranceLabel(overdueTolerance), 
              };

              await sendOverdueBackupNotification(overdueBackupContext);
              notificationsSent++;
              
              // Update the notification timestamp when notification is sent
              if (!updatedNotifications[backupKey]) {
                updatedNotifications[backupKey] = {lastNotificationSent: currentTime.toISOString(), serverName :''};
              }
              else {
                updatedNotifications[backupKey].lastNotificationSent = currentTime.toISOString();
              }
              updatedNotifications[backupKey].serverName = server.name;
            } catch (error) {
              console.error(`Failed to send overdue backup notification for ${backupKey}:`, error instanceof Error ? error.message : String(error));
            }
          }
        }
      }
    }

    // Save updated notification timestamps
    setConfiguration('overdue_notifications', JSON.stringify(updatedNotifications));
    // Save the timestamp of when this check was last run
    setConfiguration('last_overdue_check', currentTime.toISOString());

    return {
      message: 'Overdue backup check completed',
      statistics: {
        totalBackupConfigs: Object.keys(backupSettings || {}).length,
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
  setConfiguration('overdue_notifications', '{}');
  return { message: 'Overdue backup notification timestamps cleared successfully' };
} 