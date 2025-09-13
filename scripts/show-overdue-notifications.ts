import { getConfiguration, getLastOverdueBackupCheckTime, dbUtils } from '../src/lib/db-utils';
import { formatTimeElapsed } from '../src/lib/utils';

interface NotificationTimestamp {
  lastNotificationSent: string; // ISO timestamp
}

interface OverdueBackupNotifications {
  [backupKey: string]: NotificationTimestamp;
}

export function displayOverdueNotifications(checkDate?: Date): void {
  try {
    // Get current time
    const currentTime = checkDate || new Date();

    // If checkDate is provided, display a message to indicate that it is being used as the current time
    if(checkDate) {
      console.log('  Using current time as: '+currentTime.toLocaleString());
    }

    // Get the current overdue backup notifications configuration
    const lastNotificationJson = getConfiguration('overdue_notifications');
    
    if (!lastNotificationJson) {
      console.log('No overdue_notifications configuration found.');
      return;
    }

    const notifications: OverdueBackupNotifications = JSON.parse(lastNotificationJson);
    
    if (Object.keys(notifications).length === 0) {
      console.log('No notification timestamps found in configuration.');
      return;
    }

    // Calculate column widths for proper formatting
    const backupKeys = Object.keys(notifications);
    const maxBackupKeyLength = Math.max(...backupKeys.map(key => key.length), 'Backup Key'.length);
    const maxNotificationLength = Math.max(...backupKeys.map(key => {
      const timestamp = notifications[key].lastNotificationSent;
      return timestamp ? new Date(timestamp).toLocaleString().length : 'N/A'.length;
    }), 'Last Notification Sent'.length);
    
    // Calculate max lengths for backup date and elapsed time (we'll calculate these dynamically)
    let maxBackupDateLength = 'Last Backup Date'.length;
    let maxBackupElapsedLength = 'Backup Elapsed'.length;
    let maxDifferenceLength = 'Notification-Backup Diff'.length;
    
    // Pre-calculate backup dates to determine column widths
    const backupDates: Record<string, string> = {};
    for (const backupKey of backupKeys) {
      const [serverId, backupName] = backupKey.split(':');
      try {
        const latestBackup = dbUtils.getLatestBackupByName(serverId, backupName) as {
          date: string;
          server_name: string;
          backup_name?: string;
        } | null;
        
        if (latestBackup) {
          backupDates[backupKey] = latestBackup.date;
          const formattedDate = new Date(latestBackup.date).toLocaleString();
          const elapsed = formatTimeElapsed(latestBackup.date, currentTime);
          maxBackupDateLength = Math.max(maxBackupDateLength, formattedDate.length);
          maxBackupElapsedLength = Math.max(maxBackupElapsedLength, elapsed.length);
        }
      } catch (error) {
        console.error(`Error pre-calculating backup date for ${backupKey}:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    const maxNotificationElapsedLength = Math.max(...backupKeys.map(key => {
      const timestamp = notifications[key].lastNotificationSent;
      return timestamp ? formatTimeElapsed(timestamp, currentTime).length : 'N/A'.length;
    }), 'Notification Elapsed'.length);

    // Create header
    const header = [
      'Backup Key'.padEnd(maxBackupKeyLength),
      'Last Notification Sent'.padEnd(maxNotificationLength),
      'Notification Elapsed'.padEnd(maxNotificationElapsedLength),
      'Last Backup Date'.padEnd(maxBackupDateLength),
      'Backup Elapsed'.padEnd(maxBackupElapsedLength),
      'Notification-Backup Diff'.padEnd(maxDifferenceLength)
    ].join(' | ');

    console.log('  '+header);
    console.log('  '+'-'.repeat(header.length));

    // Display each entry
    for (const [backupKey, notification] of Object.entries(notifications)) {
      const { lastNotificationSent } = notification;
      
      // Extract server ID and backup name from backup key
      const [serverId, backupName] = backupKey.split(':');
      
      // Get the latest backup date from the database
      let lastBackupDate = 'N/A';
      try {
        const latestBackup = dbUtils.getLatestBackupByName(serverId, backupName) as {
          date: string;
          server_name: string;
          backup_name?: string;
        } | null;
        
        if (latestBackup) {
          lastBackupDate = latestBackup.date;
        }
      } catch (error) {
        console.error(`Error fetching last backup date for ${backupKey}:`, error instanceof Error ? error.message : String(error));
      }
      
      const formattedNotificationSent = lastNotificationSent && lastNotificationSent !== "" 
        ? new Date(lastNotificationSent).toLocaleString() 
        : 'N/A';
      
      const formattedBackupDate = lastBackupDate && lastBackupDate !== "" 
        ? new Date(lastBackupDate).toLocaleString() 
        : 'N/A';

      const notificationElapsed = lastNotificationSent && lastNotificationSent !== "" 
        ? formatTimeElapsed(lastNotificationSent, currentTime) 
        : 'N/A';

      const backupElapsed = lastBackupDate && lastBackupDate !== "" 
        ? formatTimeElapsed(lastBackupDate, currentTime) 
        : 'N/A';

      // Calculate difference between notification sent and backup date
      let notificationBackupDiff = 'N/A';
      if (lastNotificationSent && lastBackupDate && lastNotificationSent !== "" && lastBackupDate !== "") {
        try {
          const notificationDate = new Date(lastNotificationSent);
          const backupDate = new Date(lastBackupDate);
          
          if (!isNaN(notificationDate.getTime()) && !isNaN(backupDate.getTime())) {
            const diff = Math.abs(notificationDate.getTime() - backupDate.getTime());
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            notificationBackupDiff = `${days.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            maxDifferenceLength = Math.max(maxDifferenceLength, notificationBackupDiff.length);
          }
        } catch (error) {
          console.error(`Error calculating difference for ${backupKey}:`, error instanceof Error ? error.message : String(error));
        }
      }

      const row = [
        backupKey.padEnd(maxBackupKeyLength),
        formattedNotificationSent.padEnd(maxNotificationLength),
        notificationElapsed.padEnd(maxNotificationElapsedLength),
        formattedBackupDate.padEnd(maxBackupDateLength),
        backupElapsed.padEnd(maxBackupElapsedLength),
        notificationBackupDiff.padEnd(maxDifferenceLength)
      ].join(' | ');

      console.log('  '+row);
    }

    console.log(`\n  Total entries: ${Object.keys(notifications).length}`);
        
    const lastOverdueCheck = getLastOverdueBackupCheckTime();
    
    if (lastOverdueCheck && lastOverdueCheck !== 'N/A') {
      try {
        const lastCheckDate = new Date(lastOverdueCheck);
        if (!isNaN(lastCheckDate.getTime())) {
          console.log(`\n\n     Last Overdue Check: ${lastCheckDate.toLocaleString()}  (${formatTimeElapsed(lastOverdueCheck, currentTime)} ago)`);
        } else {
          console.log('Last Overdue Check: Invalid date format');
        }
      } catch (error) {
        console.log(`Last Overdue Check: ${lastOverdueCheck} (raw value)`);
        console.error('Error parsing last overdue check date:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log('Last Overdue Check: No overdue check has been performed yet');
    }
    
  } catch (error) {
    console.error('Error displaying overdue notifications:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Main execution - only run when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n  Overdue Backup Notifications Configuration\n');
  displayOverdueNotifications();
  console.log('           Current time: '+new Date().toLocaleString());
  console.log('\n');
  process.exit(0);
} 