import type { NotificationTemplate } from '@/lib/types';

/**
 * Chinese Simplified (zh-CN) default notification templates
 */
export const defaultNotificationTemplatesZhCN: {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
} = {
  success: {
    title: '✅ {status} - {backup_name} @ {server_alias}',
    message:
      "备份 {backup_name} 在 {server_alias} 上已完成，状态为 '{status}'，时间 {backup_date}，耗时 {duration}。\n\n" +
      '🔍 备注：{server_note}\n' +
      '☁️ 已上传：{uploaded_size}\n' +
      '💾 存储用量：{storage_size}\n' +
      '🔃 可用版本：{available_versions}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, success',
  },
  warning: {
    title: '⚠️ {status} - {backup_name} @ {server_alias}',
    message:
      "备份 {backup_name} 在 {server_alias} 上已完成，状态为 '{status}'，时间 {backup_date}。\n\n" +
      '🔍 备注：{server_note}\n' +
      '⏰ 耗时：{duration}\n' +
      '☁️ 已上传：{uploaded_size}\n\n' +
      '🚨 {warnings_count} 条警告\n' +
      '🛑 {errors_count} 条错误。\n\n' +
      '📄 日志消息：\n{log_text}\n\n' +
      '⚠️ 请立即检查 Duplicati 服务器 {server_url}\n',
    priority: 'high',
    tags: 'duplicati, duplistatus, warning, error',
  },
  overdueBackup: {
    title: '🕑 逾期 - {backup_name} @ {server_alias}',
    message:
      '备份 {backup_name} 在 {server_alias} 上已逾期。\n\n' +
      '🔍 备注：{server_note}\n' +
      '🚨 上次收到备份：{last_backup_date}（{last_elapsed}）\n' +
      '⏰ 预期备份时间：{expected_date}（{expected_elapsed}）\n\n' +
      '预期间隔：{backup_interval} / 容差：{overdue_tolerance}\n\n' +
      '⚠️ 请立即检查 Duplicati 服务器 {server_url}\n',
    priority: 'default',
    tags: 'duplicati, duplistatus, overdue',
  },
};
