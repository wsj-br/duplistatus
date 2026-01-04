

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
> • This page has an auto-save feature. Any changes you make will be saved automatically.
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

Additional notification destinations allow you to send notifications to specific email addresses or NTFY topics beyond the global settings. The system uses a hierarchical inheritance model where backups can inherit default settings from their server, or override them with backup-specific values.

![Server-level additional destinations](/img/screen-settings-notifications-server.png)

### Server-Level Defaults

You can configure default additional destinations at the server level that all backups on that server will automatically inherit.

1. Navigate to `Settings → Backup Notifications`.
2. The table is grouped by server, with distinct server header rows showing the server name, alias, and backup count.
3. Click the <IconButton icon="lucide:chevron-right" /> next to a server header to expand the **Default Additional Destinations for this server** section.
4. Configure the following default settings:
   - **Notification event**: Choose which events trigger notifications to the additional destinations (`all`, `warnings`, `errors`, or `off`).
   - **Additional Emails**: Enter one or more email addresses (comma-separated) that will receive notifications for all backups on this server. Click the <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> icon button to send a test email to the addresses in the field.
   - **Additional NTFY Topic**: Enter a custom NTFY topic name where notifications will be published for all backups on this server. Click the <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> icon button to send a test notification to the topic, or click the <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> icon button to display a QR code for the topic to configure your device to receive notifications.

**Server Default Management:**

- **Sync to All**: Clears all backup overrides, making all backups inherit from the server defaults.
- **Clear All**: Clears all additional destinations from both server defaults and all backups while maintaining the inheritance structure.

### Per-Backup Configuration

Individual backups automatically inherit the server defaults, but you can override them for specific backup jobs.

1. Click the <IconButton icon="lucide:chevron-right" /> next to a backup to expand its **Additional Destinations** section.
2. Configure the following settings:
   - **Notification event**: Choose which events trigger notifications to the additional destinations (`all`, `warnings`, `errors`, or `off`).
   - **Additional Emails**: Enter one or more email addresses (comma-separated) that will receive notifications in addition to the global recipient. Click the <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> icon button to send a test email to the addresses in the field.
   - **Additional NTFY Topic**: Enter a custom NTFY topic name where notifications will be published in addition to the default topic. Click the <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> icon button to send a test notification to the topic, or click the <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> icon button to display a QR code for the topic to configure your device to receive notifications.

**Inheritance Indicators:**

- **Link icon** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in blue: Indicates the value is inherited from server defaults. Clicking the field will create an override for editing.
- **Broken link icon** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in blue: Indicates the value has been overridden. Click the icon to revert to inheritance.


**Additional Destinations Behavior:**

- Notifications are sent to both the global settings and the additional destinations when configured.
- The notification event setting for additional destinations is independent of the main notification event setting.
- If additional destinations are set to `off`, no notifications will be sent to those destinations, but the main notifications will still work according to the primary settings.
- When a backup inherits from server defaults, any changes to the server defaults will automatically apply to that backup (unless it has been overridden).

<br/>

## Bulk Edit

You can edit additional destination settings for multiple backups at once using the bulk edit feature. This is particularly useful when you need to apply the same additional destinations to many backup jobs.

![Bulk edit dialog](/img/screen-settings-notifications-bulk.png)

1. Navigate to `Settings → Backup Notifications`.
2. Use the checkboxes in the first column to select the backups you want to edit.
   - Use the checkbox in the header row to select or deselect all visible backups.
   - You can use the filter to narrow down the list before selecting.
   - Server headers cannot be selected; only individual backup rows can be selected for bulk operations.
3. Once backups are selected, a bulk action bar will appear showing the number of selected backups.
4. Click `Bulk Edit` to open the edit dialog.
5. Configure the additional destination settings:
   - **Notification Event**: Set the notification event for all selected backups.
   - **Additional Emails**: Enter email addresses (comma-separated) to apply to all selected backups.
   - **Additional NTFY Topic**: Enter a NTFY topic name to apply to all selected backups.
   - Test buttons are available in the bulk edit dialog to verify email addresses and NTFY topics before applying to multiple backups.
6. Click `Save` to apply the settings to all selected backups.

**Important Notes:**

- Bulk edit creates overrides for all selected backups, meaning they will no longer inherit from server defaults (if any were set).
- The bulk edit operation applies the same values to all selected backups, regardless of their current inheritance status.
- After bulk editing, individual backups can still be modified or reverted to inheritance using the per-backup controls.

**Bulk Clear:**

To remove all additional destination settings from selected backups:

1. Select the backups you want to clear.
2. Click `Bulk Clear` in the bulk action bar.
3. Confirm the action in the dialogue box.

This will remove all additional email addresses, NTFY topics, and reset the notification event to `off` for the selected backups. After clearing, backups will revert to inheriting from server defaults (if any are configured).

<br/>

