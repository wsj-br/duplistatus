import { getConfiguration, getLastOverdueBackupCheckTime } from '../src/lib/db-utils';
import { formatTimeElapsed } from '../src/lib/utils';

interface NotificationTimestamp {
  lastNotificationSent: string; // ISO timestamp
  lastBackupDate: string; // ISO timestamp
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
    const lastNotificationJson = getConfiguration('overdue_backup_notifications');
    
    if (!lastNotificationJson) {
      console.log('No overdue_backup_notifications configuration found.');
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
    const maxBackupDateLength = Math.max(...backupKeys.map(key => {
      const timestamp = notifications[key].lastBackupDate;
      return timestamp ? new Date(timestamp).toLocaleString().length : 'N/A'.length;
    }), 'Last Backup Date'.length);
    const maxNotificationElapsedLength = Math.max(...backupKeys.map(key => {
      const timestamp = notifications[key].lastNotificationSent;
      return timestamp ? formatTimeElapsed(timestamp, currentTime).length : 'N/A'.length;
    }), 'Notification Elapsed'.length);
    const maxBackupElapsedLength = Math.max(...backupKeys.map(key => {
      const timestamp = notifications[key].lastBackupDate;
      return timestamp ? formatTimeElapsed(timestamp, currentTime).length : 'N/A'.length;
    }), 'Backup Elapsed'.length);

    // Calculate max length for the difference column
    const maxDifferenceLength = Math.max(...backupKeys.map(key => {
      const notificationSent = notifications[key].lastNotificationSent;
      const backupDate = notifications[key].lastBackupDate;
      if (notificationSent && backupDate && notificationSent !== "" && backupDate !== "") {
        const diff = Math.abs(new Date(notificationSent).getTime() - new Date(backupDate).getTime());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${days.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`.length;
      }
      return 'N/A'.length;
    }), 'Notification-Backup Diff'.length);

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
      const { lastNotificationSent, lastBackupDate } = notification;
      
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
if (require.main === module) {
  console.log('\n  Overdue Backup Notifications Configuration\n');
  displayOverdueNotifications();
  console.log('           Current time: '+new Date().toLocaleString());
  console.log('\n');
  process.exit(0);
} 