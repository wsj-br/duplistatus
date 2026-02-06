import type { NotificationTemplate } from '@/lib/types';

/**
 * German (de) default notification templates
 */
export const defaultNotificationTemplatesDe: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  success: {
    title: '✅ {status} - {backup_name} @ {server_alias}',
    message:
      "Sicherung {backup_name} auf {server_alias} wurde mit Status '{status}' am {backup_date} in {duration} abgeschlossen.\n\n" +
      '🔍 Notiz: {server_note}\n' +
      '☁️ Hochgeladen: {uploaded_size}\n' +
      '💾 Speichernutzung: {storage_size}\n' +
      '🔃 Verfügbare Versionen: {available_versions}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, success',
  },
  warning: {
    title: '⚠️ {status} - {backup_name} @ {server_alias}',
    message:
      "Sicherung {backup_name} auf {server_alias} wurde mit Status '{status}' am {backup_date} abgeschlossen.\n\n" +
      '🔍 Notiz: {server_note}\n' +
      '⏰ Dauer: {duration}\n' +
      '☁️ Hochgeladen: {uploaded_size}\n\n' +
      '🚨 {warnings_count} Warnungen\n' +
      '🛑 {errors_count} Fehler.\n\n' +
      '📄 Protokollnachrichten:\n{log_text}\n\n' +
      '⚠️ Überprüfen Sie den Duplicati-Server sofort {server_url}\n',
    priority: 'high',
    tags: 'duplicati, duplistatus, warning, error',
  },
  overdueBackup: {
    title: '🕑 Überfällig - {backup_name} @ {server_alias}',
    message:
      'Die Sicherung {backup_name} ist auf {server_alias} überfällig.\n\n' +
      '🔍 Notiz: {server_note}\n' +
      '🚨 Letzte Sicherung empfangen: {last_backup_date} ({last_elapsed})\n' +
      '⏰ Erwartete Sicherungszeit: {expected_date} ({expected_elapsed})\n\n' +
      'Erwartetes Intervall: {backup_interval} / Toleranz: {overdue_tolerance}\n\n' +
      '⚠️ Überprüfen Sie den Duplicati-Server sofort {server_url}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, overdue',
  },
};
