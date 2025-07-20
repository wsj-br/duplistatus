import { NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';
import { sendMissedBackupNotification, MissedBackupContext } from '@/lib/notifications';
import { getConfiguration } from '@/lib/db-utils';
import { NotificationConfig, BackupKey } from '@/lib/types';

// Helper function to get backup key
function getBackupKey(machineName: string, backupName: string): BackupKey {
  return `${machineName}:${backupName}`;
}

// Helper function to get backup settings with fallback to machine settings
function getBackupSettings(config: NotificationConfig, machineName: string, backupName: string, machineId?: string) {
  const backupKey = getBackupKey(machineName, backupName);
  const backupConfig = config.backupSettings?.[backupKey];
  
  if (backupConfig) {
    return backupConfig;
  }
  
  // Fallback to machine settings for backward compatibility
  if (machineId && config.machineSettings?.[machineId]) {
    return config.machineSettings[machineId];
  }
  
  return null;
}

export async function POST() {
  try {
    // Get notification configuration
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    if (!configJson) {
      return NextResponse.json({ message: 'No notification configuration found' });
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
    
    // Get machines summary which includes backup names
    const machinesSummary = dbUtils.getMachinesSummary() as { 
      id: string; 
      name: string; 
      lastBackupName: string | null;
    }[];
    
    let checkedMachines = 0;
    let missedBackupsFound = 0;
    let notificationsSent = 0;

    for (const machine of machinesSummary) {
      // Skip machines without backup names
      if (!machine.lastBackupName) {
        continue;
      }

      const backupConfig = getBackupSettings(config, machine.name, machine.lastBackupName, machine.id);
      
      // Skip machines with no configuration or notifications disabled
      if (!backupConfig || backupConfig.notificationEvent === 'off') {
        continue;
      }

      // Skip if missed backup check is disabled for this backup
      if (!backupConfig.missedBackupCheckEnabled) {
        continue;
      }

      checkedMachines++;

      // Get the latest backup for this machine and backup name
      const latestBackup = dbUtils.getLatestBackup(machine.id) as {
        date: string;
        machine_name: string;
        backup_name?: string;
      } | null;

      if (!latestBackup) {
        // No backups found for this machine - could send a notification
        continue;
      }

      // Calculate hours since last backup
      const lastBackupTime = new Date(latestBackup.date).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLastBackup = (currentTime - lastBackupTime) / (1000 * 60 * 60);

      // Check if backup is overdue
      if (hoursSinceLastBackup > backupConfig.expectedInterval) {
        missedBackupsFound++;

        try {
          const missedBackupContext: MissedBackupContext = {
            machine_name: machine.name,
            machine_id: machine.id,
            backup_name: machine.lastBackupName,
            expected_interval: backupConfig.expectedInterval,
            hours_since_last_backup: Math.round(hoursSinceLastBackup),
            last_backup_date: latestBackup.date,
            link: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9666'}/detail/${machine.id}`,
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

          await sendMissedBackupNotification(machine.id, machine.name, machine.lastBackupName, missedBackupContext);
          notificationsSent++;
          
          console.log(`Sent missed backup notification for backup ${machine.lastBackupName} on machine ${machine.name} (${hoursSinceLastBackup.toFixed(1)} hours overdue)`);
        } catch (error) {
          console.error(`Failed to send missed backup notification for backup ${machine.lastBackupName} on machine ${machine.name}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: 'Missed backup check completed',
      statistics: {
        totalMachines: machinesSummary.length,
        checkedMachines,
        missedBackupsFound,
        notificationsSent,
      },
    });
  } catch (error) {
    console.error('Error checking for missed backups:', error);
    return NextResponse.json(
      { error: 'Failed to check for missed backups' },
      { status: 500 }
    );
  }
} 