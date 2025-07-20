import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { NotificationConfig } from '@/lib/types';

export async function GET() {
  try {
    const configJson = getConfiguration('notifications');
    const backupSettingsJson = getConfiguration('backup_settings');
    
    const config: NotificationConfig = configJson ? JSON.parse(configJson) : {
      ntfy: { url: 'https://ntfy.sh/', topic: '' },
      machineSettings: {},
      backupSettings: {},
      templates: {
        missedBackup: {
            message: "The backup {backup_name} was missing on {machine_name}. Please check the duplicati server. ",
            priority: "default",
            tags: "duplicati, duplistatus, missed",
            title: "🕑 Missed - {backup_name}  @ {machine_name}"
        },
        success: {
            message: "Backup {backup_name} on {machine_name} completed with status {status} at {backup_date}  {link} ",
            priority: "default",
            tags: "duplicati, duplistatus, success",
            title: "✅ {status} - {backup_name}  @ {machine_name}"
        },
        warning: {
            message: "Backup {backup_name} on {machine_name} completed with status {status} at {backup_date} with {warnings} warnings, {errors} errors. ",
            priority: "high",
            tags: "duplicati, duplistatus, warning, error",
            title: " ⚠️{status} - {backup_name}  @ {machine_name}"
        }
      },
    };

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

    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to get configuration:', error);
    return NextResponse.json({ error: 'Failed to get configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const config: NotificationConfig = await request.json();
    
    // Save main configuration (without backupSettings)
    const { backupSettings, ...mainConfig } = config;
    setConfiguration('notifications', JSON.stringify(mainConfig));
    
    // Save backup settings separately
    setConfiguration('backup_settings', JSON.stringify(backupSettings || {}));
    
    return NextResponse.json({ message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Failed to save configuration:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
} 