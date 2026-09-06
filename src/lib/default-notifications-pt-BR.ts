import type { NotificationTemplate } from '@/lib/types';
import { defaultDailySummaryPtBR } from './default-daily-summary-templates';

/**
 * Portuguese - Brazil (pt-BR) default notification templates
 */
export const defaultNotificationTemplatesPtBR: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
  dailySummary: typeof defaultDailySummaryPtBR;
} = {
  success: {
    title: '✅ {status} - {backup_name} @ {server_alias}',
    message:
      "Backup {backup_name} em {server_alias} concluído com status '{status}' em {backup_date} em {duration}.\n\n" +
      '🔍 Nota: {server_note}\n' +
      '☁️ Enviado: {uploaded_size}\n' +
      '💾 Uso de armazenamento: {storage_size}\n' +
      '🔃 Versões disponíveis: {available_versions}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, success',
  },
  warning: {
    title: '⚠️ {status} - {backup_name} @ {server_alias}',
    message:
      "Backup {backup_name} em {server_alias} concluído com status '{status}' em {backup_date}.\n\n" +
      '🔍 Nota: {server_note}\n' +
      '⏰ Duração: {duration}\n' +
      '☁️ Enviado: {uploaded_size}\n\n' +
      '🚨 {warnings_count} avisos\n' +
      '🛑 {errors_count} erros.\n\n' +
      '📄 Mensagens de log:\n{log_text}\n\n' +
      '⚠️ Verifique o servidor Duplicati imediatamente {server_url}\n',
    priority: 'high',
    tags: 'duplicati, duplistatus, warning, error',
  },
  overdueBackup: {
    title: '🕑 Atrasado - {backup_name} @ {server_alias}',
    message:
      'O backup {backup_name} está atrasado em {server_alias}.\n\n' +
      '🔍 Nota: {server_note}\n' +
      '🚨 Último backup recebido: {last_backup_date} ({last_elapsed})\n' +
      '⏰ Hora esperada do backup: {expected_date} ({expected_elapsed})\n\n' +
      'Intervalo esperado: {backup_interval} / Tolerância: {overdue_tolerance}\n\n' +
      '⚠️ Verifique o servidor Duplicati imediatamente {server_url}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, overdue',
  },
  dailySummary: defaultDailySummaryPtBR,
};
