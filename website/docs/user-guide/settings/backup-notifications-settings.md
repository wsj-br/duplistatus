

# Backup Notifications 

![Backup alerts](/img/screen-settings-notifications.png)

You can click on the <SvgButton svgFilename="duplicati_logo.svg" /> button to open the Duplicati server's web interface (if configured).

## Configure Per-Backup Notification Settings

![notification detail](/img/screen-settings-backup-notifications-detail.png)

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

<br/>

> [!NOTE]
> 
> • This page has a auto-save feature. Any changes you make will be saved automatically.
> 
> • These options only control notifications sent when a [new backup log is received](/installation/duplicati-server-configuration.md).
>   **Overdue notifications will be sent regardless of these settings.**
>
> • If the configuration options are greyed out, it means that the notification channel (NTFY or Email) is not properly configured. Checkboxes will show "(disabled)" labels when their respective services are not configured.

