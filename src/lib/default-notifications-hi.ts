import type { NotificationTemplate } from '@/lib/types';
import { defaultDailySummaryHi } from './default-daily-summary-templates';

/**
 * Hindi (hi) default notification templates
 */
export const defaultNotificationTemplatesHi: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
  dailySummary: typeof defaultDailySummaryHi;
} = {
  success: {
    title: '✅ {status} - {backup_name} @ {server_alias}',
    message:
      "सर्वर {server_alias} पर बैकअप {backup_name} स्थिति '{status}' के साथ {backup_date} को {duration} में पूरा हुआ।\n\n" +
      '🔍 नोट: {server_note}\n' +
      '☁️ अपलोड: {uploaded_size}\n' +
      '💾 संग्रहण उपयोग: {storage_size}\n' +
      '🔃 उपलब्ध संस्करण: {available_versions}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, success',
  },
  warning: {
    title: '⚠️ {status} - {backup_name} @ {server_alias}',
    message:
      "सर्वर {server_alias} पर बैकअप {backup_name} स्थिति '{status}' के साथ {backup_date} को पूरा हुआ।\n\n" +
      '🔍 नोट: {server_note}\n' +
      '⏰ अवधि: {duration}\n' +
      '☁️ अपलोड: {uploaded_size}\n\n' +
      '🚨 {warnings_count} चेतावनियाँ\n' +
      '🛑 {errors_count} त्रुटियाँ।\n\n' +
      '📄 लॉग संदेश:\n{log_text}\n\n' +
      '⚠️ Duplicati सर्वर तुरंत जाँचें {server_url}\n',
    priority: 'high',
    tags: 'duplicati, duplistatus, warning, error',
  },
  overdueBackup: {
    title: '🕑 अतिदेय - {backup_name} @ {server_alias}',
    message:
      'सर्वर {server_alias} पर बैकअप {backup_name} अतिदेय है।\n\n' +
      '🔍 नोट: {server_note}\n' +
      '🚨 अंतिम बैकअप प्राप्त: {last_backup_date} ({last_elapsed})\n' +
      '⏰ अपेक्षित बैकअप समय: {expected_date} ({expected_elapsed})\n\n' +
      'अपेक्षित अंतराल: {backup_interval} / सहनशीलता: {overdue_tolerance}\n\n' +
      '⚠️ Duplicati सर्वर तुरंत जाँचें {server_url}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, overdue',
  },
  dailySummary: defaultDailySummaryHi,
};
