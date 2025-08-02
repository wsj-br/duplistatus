import { checkOverdueBackups } from '../src/lib/overdue-backup-checker';
import { displayOverdueNotifications } from './show-overdue-notifications';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: pnpm run run-overdue-check <date-time-string>');
    console.error('Example: pnpm run run-overdue-check "2025-08-15T10:30:00"');
    console.error('Example: pnpm run run-overdue-check "2025-08-15 10:30:00"');
    process.exit(1);
  }

  const dateTimeString = args[0];
  
  // Parse the date string
  let checkDate: Date;
  try { 
    checkDate = new Date(dateTimeString);
    if (isNaN(checkDate.getTime())) {
      throw new Error('Invalid date format');
    }
  } catch (error) {
    console.error(`Error parsing date string "${dateTimeString}":`, error instanceof Error ? error.message : String(error));
    console.error('Please provide a valid date string in ISO format or a format that JavaScript Date constructor can parse.');
    process.exit(1);
  }

  console.log('='.repeat(80));
  console.log(`Running Overdue Backup Check with date: ${checkDate.toISOString()}`);
  console.log(`Formatted date: ${checkDate.toLocaleString()}`);
  console.log('='.repeat(80));

  // Show overdue notifications BEFORE the check
  console.log('\n📋 OVERDUE NOTIFICATIONS BEFORE CHECK:');
  console.log('='.repeat(80));
  displayOverdueNotifications(checkDate);

  // Run the overdue backup check
  console.log('\n🔄 RUNNING OVERDUE BACKUP CHECK...');
  console.log('='.repeat(80));
  
  try {
    const result = await checkOverdueBackups(checkDate);
    
    console.log('\n✅ CHECK COMPLETED:');
    console.log('='.repeat(80));
    console.log(`Message: ${result.message}`);
    
    if (result.statistics) {
      console.log('\n📊 STATISTICS:');
      console.log(`  Total Backup Configs: ${result.statistics.totalBackupConfigs}`);
      console.log(`  Checked Backups: ${result.statistics.checkedBackups}`);
      console.log(`  Overdue Backups Found: ${result.statistics.overdueBackupsFound}`);
      console.log(`  Notifications Sent: ${result.statistics.notificationsSent}`);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR RUNNING OVERDUE BACKUP CHECK:');
    console.error('='.repeat(80));
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Show overdue notifications AFTER the check
  console.log('\n📋 OVERDUE NOTIFICATIONS AFTER CHECK:');
  console.log('='.repeat(80));
  displayOverdueNotifications(checkDate);

  console.log('\n🏁 SCRIPT COMPLETED');
  console.log('='.repeat(80));
  console.log(`           Current time: ${new Date().toLocaleString()}`);
  console.log('\n');
}

// Run the main function
main().catch(error => {
  console.error('Fatal error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 