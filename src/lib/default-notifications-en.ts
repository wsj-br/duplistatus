import type { NotificationTemplate } from '@/lib/types';

/**
 * English (en-GB) default notification templates
 */
export const defaultNotificationTemplatesEn: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  success: {
    title: '✅ {status} - {backup_name} @ {server_alias}',
    message:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      '🔍 Note: {server_note}\n' +
      '☁️ Uploaded: {uploaded_size}\n' +
      '💾 Store usage: {storage_size}\n' +
      '🔃 Available versions: {available_versions}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, success',
  },
  warning: {
    title: '⚠️ {status} - {backup_name} @ {server_alias}',
    message:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date}.\n\n" +
      '🔍 Note: {server_note}\n' +
      '⏰ Duration: {duration}\n' +
      '☁️ Uploaded: {uploaded_size}\n\n' +
      '🚨 {warnings_count} warnings\n' +
      '🛑 {errors_count} errors.\n\n' +
      '📄 Log Messages:\n{log_text}\n\n' +
      '⚠️ Check the duplicati server immediately {server_url}\n',
    priority: 'high',
    tags: 'duplicati, duplistatus, warning, error',
  },
  overdueBackup: {
    title: '🕑 Overdue - {backup_name} @ {server_alias}',
    message:
      'The backup {backup_name} is overdue on {server_alias}.\n\n' +
      '🔍 Note: {server_note}\n' +
      '🚨 Last backup received: {last_backup_date} ({last_elapsed})\n' +
      '⏰ Expected backup time: {expected_date} ({expected_elapsed})\n\n' +
      'Expected interval: {backup_interval} / Tolerance: {overdue_tolerance}\n\n' +
      '⚠️ Check the duplicati server immediately {server_url}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, overdue',
  },
};
