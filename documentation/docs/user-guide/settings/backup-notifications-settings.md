

# Backup Notifications 

![Backup alerts](/img/screen-settings-notifications.png)

## Configure Per-Backup Notification Settings

| Setting                       | Description                                               | Default Value |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **Notification Events**       | Configure when to send notifications for new backup logs. | `Warnings`    |
| **NTFY**                      | Enable or disable NTFY notifications for this backup.     | `Enabled`     |
| **Email**                     | Enable or disable email notifications for this backup.    | `Enabled`    |

**Notification Events Options:**

- `all`: Send notifications for all backup events.
- `warnings`: Send notifications for warnings and errors only.
- `errors`: Send notifications for errors only.
- `off`: Disable notifications for new backup logs for this backup.

**Select All Functionality:**

Use the checkboxes in the **NTFY Notifications** and **Email Notifications** column headers to quickly enable or disable all notifications for all backups at once. This is useful for quickly toggling notification channels across all your backups.

<br/>

> [!NOTE]
> 
> • This page has a auto-save feature. Any changes you make will be saved automatically.
> 
> • These options only control notifications sent when a [new backup log is received](/installation/duplicati-server-configuration.md).
>   **Overdue notifications will be sent regardless of these settings.**
>
> • If the configuration options are greyed out, it means that the notification channel (NTFY or Email) is not properly configured. Checkboxes will show "(disabled)" labels when their respective services are not configured.

<br/>

## Filter and Search

Use the **Filter by Server Name** field at the top of the page to quickly find specific backups by server name or alias. The table will automatically filter to show only matching entries.

<br/>

## Additional Destinations

For each backup, you can configure additional notification destinations beyond the global settings. This allows you to send notifications to specific email addresses or NTFY topics for individual backups.

1. Navigate to `Settings → Backup Notifications`.
2. Click the chevron icon (▶) next to a backup to expand its **Additional Destinations** section.
3. Configure the following settings:
   - **Notification event**: Choose which events trigger notifications to the additional destinations (`all`, `warnings`, `errors`, or `off`).
   - **Additional Emails**: Enter one or more email addresses (comma-separated) that will receive notifications in addition to the global recipient.
   - **Additional NTFY Topic**: Enter a custom NTFY topic name where notifications will be published in addition to the default topic.

**Additional Destinations Behavior:**

- Notifications are sent to both the global settings and the additional destinations when configured.
- The notification event setting for additional destinations is independent of the main notification event setting.
- If additional destinations are set to `off`, no notifications will be sent to those destinations, but the main notifications will still work according to the primary settings.

<br/>

## Bulk Edit

You can edit additional destination settings for multiple backups at once using the bulk edit feature.

1. Navigate to `Settings → Backup Notifications`.
2. Use the checkboxes in the first column to select the backups you want to edit.
   - Use the checkbox in the header row to select or deselect all visible backups.
   - You can use the filter to narrow down the list before selecting.
3. Once backups are selected, a bulk action bar will appear showing the number of selected backups.
4. Click `Bulk Edit` to open the edit dialog.
5. Configure the additional destination settings:
   - **Notification Event**: Set the notification event for all selected backups.
   - **Additional Emails**: Enter email addresses (comma-separated) to apply to all selected backups.
   - **Additional NTFY Topic**: Enter a NTFY topic name to apply to all selected backups.
6. Click `Save` to apply the settings to all selected backups.

**Bulk Clear:**

To remove all additional destination settings from selected backups:

1. Select the backups you want to clear.
2. Click `Bulk Clear` in the bulk action bar.
3. Confirm the action in the dialogue box.

This will remove all additional email addresses, NTFY topics, and reset the notification event to `off` for the selected backups.

<br/>

