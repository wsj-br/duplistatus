// Store the old default templates to automatically migrate to the new default templates.
// The new default templates are in default-config.ts.
 
interface PreviousTemplateMessages {
  version: string;
  sucess: string;
  warning: string;
  overdueBackup: string;
}

export const previousTemplatesMessages: PreviousTemplateMessages[] = [
  {
    version: "0.7.24",
    sucess:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "☁️ Uploaded: {uploaded_size}\n" +
      "💾 Store usage:  {storage_size}\n" +
      "🔃 Available versions:  {available_versions}\n",
    warning:
      "Backup {backup_name} on {server_alias} completed with status '{status}' at {backup_date}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "⏰ Duration: {duration}\n" +
      "☁️ Uploaded: {uploaded_size}\n\n" +
      "🚨 {warnings_count} warnings\n" +
      "🛑 {errors_count} errors.\n\n" +
      "🔍 Please check the duplicati server {server_url}\n",
    overdueBackup:
      "The backup {backup_name} is overdue on {server_alias}.\n\n" +
      "🔍 Note: {server_note}\n" +
      "🚨 Last backup was {last_backup_date} ({last_elapsed})\n" +
      "⏰ Expected backup was {expected_date} ({expected_elapsed})\n\n" +
      "Expected interval:  {backup_interval_value} {backup_interval_type} / Tolerance:  {overdue_tolerance}\n\n" +
      "🔍 Please check the duplicati server {server_url}\n",
  },
  {
    version: "0.6.1",
    sucess:
      "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date} in {duration}.\n\n" +
      "☁️ Uploaded: {uploaded_size}\n" +
      "💾 Store usage:  {storage_size}\n" +
      "🔃 Available versions:  {available_versions}\n",
    warning:
      "Backup {backup_name} on {machine_name} completed with status '{status}' at {backup_date}.\n\n" +
      "⏰ Duration: {duration}\n" +
      "☁️ Uploaded: {uploaded_size}\n\n" +
      "🚨 {warnings_count} warnings\n" +
      "🛑 {errors_count} errors.\n\n" +
      "🔍 Please check the duplicati server.\n",
    overdueBackup:
      "The backup {backup_name} is overdue on {machine_name}.\n\n" +
      "🚨 Last backup was {last_backup_date} ({last_elapsed})\n" +
      "⏰ Expected backup was {expected_date} ({expected_elapsed})\n\n" +
      "Expected interval:  {backup_interval_value} {backup_interval_type} / Tolerance:  {overdue_tolerance}\n\n" +
      "🔍 Please check the duplicati server.\n",
  },
];