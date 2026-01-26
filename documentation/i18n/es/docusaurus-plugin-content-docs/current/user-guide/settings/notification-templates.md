# Templates {#templates}

**duplistatus** uses three templates for notification messages. These templates are used for both NTFY and Email notifications:

![notification templates](/assets/screen-settings-templates.png)

| Template           | Description                                                         |
| :----------------- | :------------------------------------------------------------------ |
| **Success**        | Used when backups complete successfully.            |
| **Warning/Error**  | Used when backups complete with warnings or errors. |
| **Overdue Backup** | Used when backups are overdue.                      |

<br/>

## Available Actions {#available-actions}

| Button                                                          | Description                                                                                                                                                                                                                      |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton label="Save Template Settings" />                   | Saves the settings when changing the template. The button saves the template being displayed (Success, Warning/Error or Overdue Backup).                                      |
| <IconButton icon="lucide:send" label="Send Test Notification"/> | Checks the template after updating it. The variables will be replaced with their names for the test. For email notifications, the template title becomes the email subject line. |
| <IconButton icon="lucide:rotate-ccw" label="Reset to Default"/> | Restores the default template for the **selected template**. Remember to save it after resetting.                                                                                                |

<br/>

## Variables {#variables}

All templates support variables that will be replaced with actual values. The following table shows the available variables:

| Variable               | Description                                                                                                  | Available In     |
| :--------------------- | :----------------------------------------------------------------------------------------------------------- | :--------------- |
| `{server_name}`        | Name of the server.                                                                          | All templates    |
| `{server_alias}`       | Alias of the server.                                                                         | All templates    |
| `{server_note}`        | Note for the server.                                                                         | All templates    |
| `{server_url}`         | URL of the Duplicati Server web configuration                                                                | All templates    |
| `{backup_name}`        | Name of the backup.                                                                          | All templates    |
| `{status}`             | Backup status (Success, Warning, Error, Fatal).                           | Success, Warning |
| `{backup_date}`        | Date and time of the backup.                                                                 | Success, Warning |
| `{duration}`           | Duration of the backup.                                                                      | Success, Warning |
| `{uploaded_size}`      | Amount of data uploaded.                                                                     | Success, Warning |
| `{storage_size}`       | Storage usage information.                                                                   | Success, Warning |
| `{available_versions}` | Number of available backup versions.                                                         | Success, Warning |
| `{file_count}`         | Number of files processed.                                                                   | Success, Warning |
| `{file_size}`          | Total size of files backed up.                                                               | Success, Warning |
| `{messages_count}`     | Number of messages.                                                                          | Success, Warning |
| `{warnings_count}`     | Number of warnings.                                                                          | Success, Warning |
| `{errors_count}`       | Number of errors.                                                                            | Success, Warning |
| `{log_text}`           | Log messages (warnings and errors)                                                        | Success, Warning |
| `{last_backup_date}`   | Date of the last backup.                                                                     | Overdue          |
| `{last_elapsed}`       | Time elapsed since the last backup.                                                          | Overdue          |
| `{expected_date}`      | Expected backup date.                                                                        | Overdue          |
| `{expected_elapsed}`   | Time elapsed since the expected date.                                                        | Overdue          |
| `{backup_interval}`    | Interval string (e.g., "1D", "2W", "1M"). | Overdue          |
| `{overdue_tolerance}`  | Overdue tolerance setting.                                                                   | Overdue          |




