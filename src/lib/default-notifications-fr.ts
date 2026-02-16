import type { NotificationTemplate } from '@/lib/types';

/**
 * French (fr) default notification templates
 */
export const defaultNotificationTemplatesFr: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  success: {
    title: '✅ {status} - {backup_name} @ {server_alias}',
    message:
      "La sauvegarde {backup_name} sur {server_alias} s'est terminée avec le statut '{status}' le {backup_date} en {duration}.\n\n" +
      '🔍 Note : {server_note}\n' +
      '☁️ Téléversé : {uploaded_size}\n' +
      '💾 Utilisation du stockage : {storage_size}\n' +
      '🔃 Versions disponibles : {available_versions}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, success',
  },
  warning: {
    title: '⚠️ {status} - {backup_name} @ {server_alias}',
    message:
      "La sauvegarde {backup_name} sur {server_alias} s'est terminée avec le statut '{status}' le {backup_date}.\n\n" +
      '🔍 Note : {server_note}\n' +
      '⏰ Durée : {duration}\n' +
      '☁️ Téléversé : {uploaded_size}\n\n' +
      '🚨 {warnings_count} avertissements\n' +
      '🛑 {errors_count} erreurs.\n\n' +
      '📄 Messages du journal :\n{log_text}\n\n' +
      '⚠️ Vérifiez le serveur Duplicati immédiatement {server_url}\n',
    priority: 'high',
    tags: 'duplicati, duplistatus, warning, error',
  },
  overdueBackup: {
    title: '🕑 En retard - {backup_name} @ {server_alias}',
    message:
      'La sauvegarde {backup_name} est en retard sur {server_alias}.\n\n' +
      '🔍 Note : {server_note}\n' +
      '🚨 Dernière sauvegarde reçue : {last_backup_date} ({last_elapsed})\n' +
      '⏰ Heure de sauvegarde prévue : {expected_date} ({expected_elapsed})\n\n' +
      'Intervalle prévu : {backup_interval} / Tolérance : {overdue_tolerance}\n\n' +
      '⚠️ Vérifiez le serveur Duplicati immédiatement {server_url}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, overdue',
  },
};
