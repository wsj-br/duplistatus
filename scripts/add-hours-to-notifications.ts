import { getConfiguration, setConfiguration } from '../src/lib/db-utils';

interface NotificationTimestamp {
  lastNotificationSent: string; // ISO timestamp
  lastBackupDate: string; // ISO timestamp
}

interface OverdueBackupNotifications {
  [backupKey: string]: NotificationTimestamp;
}

function addHoursToNotifications(hoursToAdd: number): void {
  try {
    console.log(`Adding ${hoursToAdd} hours to lastNotificationSent timestamps...`);

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

    let updatedCount = 0;
    const updatedNotifications: OverdueBackupNotifications = {};

    // Process each backup key
    for (const [backupKey, notification] of Object.entries(notifications)) {
      const { lastNotificationSent, lastBackupDate } = notification;
      
      if (!lastNotificationSent || lastNotificationSent === "") {
        console.log(`Skipping ${backupKey}: no lastNotificationSent timestamp`);
        updatedNotifications[backupKey] = notification;
        continue;
      }

      try {
        // Parse the current timestamp
        const currentDate = new Date(lastNotificationSent);
        
        if (isNaN(currentDate.getTime())) {
          console.log(`Skipping ${backupKey}: invalid lastNotificationSent timestamp: ${lastNotificationSent}`);
          updatedNotifications[backupKey] = notification;
          continue;
        }

        // Add the specified hours
        const newDate = new Date(currentDate.getTime() + (hoursToAdd * 60 * 60 * 1000));
        const newTimestamp = newDate.toISOString();

        console.log(`${backupKey}: ${new Date(lastNotificationSent).toLocaleString()} -> ${new Date(newTimestamp).toLocaleString()} (${hoursToAdd > 0 ? '+' : ''}${hoursToAdd} hours)`);

        updatedNotifications[backupKey] = {
          lastNotificationSent: newTimestamp,
          lastBackupDate
        };
        
        updatedCount++;
      } catch (error) {
        console.error(`Error processing ${backupKey}:`, error instanceof Error ? error.message : String(error));
        updatedNotifications[backupKey] = notification;
      }
    }

    // Save the updated configuration
    setConfiguration('overdue_backup_notifications', JSON.stringify(updatedNotifications, null, 2));

    console.log(`\nSuccessfully updated ${updatedCount} notification timestamps.`);
    console.log(`Total entries processed: ${Object.keys(notifications).length}`);
    
  } catch (error) {
    console.error('Error updating notification timestamps:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Parse command line arguments
function parseArguments(): number {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error('Usage: pnpm tsx scripts/add-hours-to-notifications.ts <hours>');
    console.error('Example: pnpm tsx scripts/add-hours-to-notifications.ts 24');
    process.exit(1);
  }

  const hours = parseFloat(args[0]);
  
  if (isNaN(hours)) {
    console.error('Error: hours must be a valid number');
    process.exit(1);
  }

  return hours;
}

// Main execution
const hoursToAdd = parseArguments();
addHoursToNotifications(hoursToAdd);

console.log('Script completed successfully!');
process.exit(0); 