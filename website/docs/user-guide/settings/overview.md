

# Overview

The Settings page provides a comprehensive interface for configuring all aspects of **duplistatus**. Access it by clicking the <IconButton icon="lucide:settings" /> `Settings` button in the [Application Toolbar](../overview#application-toolbar).

## Settings Structure

The settings page features a collapsible sidebar that organizes settings into logical groups:

![Settings Sidebar - Admin View](/img/screen-settings-left-panel-admin.png)

**Administrator View** - Administrators see all available settings sections:

- **Notifications**
  - [Backup Notifications](backup-notifications-settings.md): Configure per-backup notification settings
  - [Overdue Monitoring](overdue-settings.md): Configure overdue backup detection and alerts
  - [Templates](notification-templates.md): Customize notification message templates

- **Integrations**
  - [NTFY](ntfy-settings.md): Configure NTFY push notification service
  - [Email](email-settings.md): Configure SMTP email notifications

- **System**
  - [Servers](server-settings.md): Manage Duplicati server configurations
  - [Display](../display-settings.md): Configure display preferences
  - [Database Maintenance](../database-maintenance.md): Perform database cleanup (admin only)
  - [Users](user-management-settings.md): Manage user accounts (admin only)
  - [Audit Log](audit-log-settings.md): View system audit logs
  - [Audit Log Retention](audit-log-settings.md#retention-configuration): Configure audit log retention (admin only)

![Settings Sidebar - Non-Admin View](/img/screen-settings-left-panel-non-admin.png)

**Non-Administrator View** - Regular users see a limited set of settings:

- **Notifications**
  - [Backup Notifications](backup-notifications-settings.md): View per-backup notification settings (read-only)
  - [Overdue Monitoring](overdue-settings.md): View overdue backup settings (read-only)
  - [Templates](notification-templates.md): View notification templates (read-only)

- **Integrations**
  - [NTFY](ntfy-settings.md): View NTFY settings (read-only)
  - [Email](email-settings.md): View email settings (read-only)

- **System**
  - [Servers](server-settings.md): View server configurations (read-only)
  - [Display](../display-settings.md): Configure display preferences
  - [Audit Log](audit-log-settings.md): View system audit logs (read-only)

> [!NOTE]
> Non-admin users can still use test notification features and configure display settings, but most other settings are read-only. A notice is displayed in the sidebar indicating that settings are read-only.

## Quick Start

> [!IMPORTANT]
> Before configuring settings in **duplistatus**, ensure your Duplicati servers are configured to send backup logs to **duplistatus**. See the [Duplicati Configuration](/installation/duplicati-server-configuration.md) section for details.

1. **Collect Backup Logs**: Use the [Collect Backup Logs](../collect-backup-logs.md) feature to populate the database with backup data from your Duplicati servers
2. **Configure Servers**: Set up your Duplicati server configurations in [Server Settings](server-settings.md)
3. **Set Up Notification Channels**: Configure [NTFY](ntfy-settings.md) or [Email](email-settings.md) for backup alerts
4. **Configure Backup Notifications**: Set up per-backup notification settings in [Backup Notifications](backup-notifications-settings.md)
5. **Configure Overdue Monitoring**: Set up [Overdue Monitoring](overdue-settings.md) to track missed backups
6. **Customize Templates**: Personalize [Notification Templates](notification-templates.md) for your alerts

For more detailed information about each setting, click on the links above or use the sidebar navigation.

