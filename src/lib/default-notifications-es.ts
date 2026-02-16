import type { NotificationTemplate } from '@/lib/types';

/**
 * Spanish (es) default notification templates
 */
export const defaultNotificationTemplatesEs: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  success: {
    title: '✅ {status} - {backup_name} @ {server_alias}',
    message:
      "La copia de seguridad {backup_name} en {server_alias} se completó con estado '{status}' el {backup_date} en {duration}.\n\n" +
      '🔍 Nota: {server_note}\n' +
      '☁️ Subido: {uploaded_size}\n' +
      '💾 Uso de almacenamiento: {storage_size}\n' +
      '🔃 Versiones disponibles: {available_versions}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, success',
  },
  warning: {
    title: '⚠️ {status} - {backup_name} @ {server_alias}',
    message:
      "La copia de seguridad {backup_name} en {server_alias} se completó con estado '{status}' el {backup_date}.\n\n" +
      '🔍 Nota: {server_note}\n' +
      '⏰ Duración: {duration}\n' +
      '☁️ Subido: {uploaded_size}\n\n' +
      '🚨 {warnings_count} advertencias\n' +
      '🛑 {errors_count} errores.\n\n' +
      '📄 Mensajes del registro:\n{log_text}\n\n' +
      '⚠️ Verifique el servidor Duplicati inmediatamente {server_url}\n',
    priority: 'high',
    tags: 'duplicati, duplistatus, warning, error',
  },
  overdueBackup: {
    title: '🕑 Atrasado - {backup_name} @ {server_alias}',
    message:
      'La copia de seguridad {backup_name} está atrasada en {server_alias}.\n\n' +
      '🔍 Nota: {server_note}\n' +
      '🚨 Última copia recibida: {last_backup_date} ({last_elapsed})\n' +
      '⏰ Hora de copia esperada: {expected_date} ({expected_elapsed})\n\n' +
      'Intervalo esperado: {backup_interval} / Tolerancia: {overdue_tolerance}\n\n' +
      '⚠️ Verifique el servidor Duplicati inmediatamente {server_url}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, overdue',
  },
};
