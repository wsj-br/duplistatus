

# Overview

The Settings page offers a unified interface for configuring all aspects of **duplistatus**. You can access it by clicking the <IconButton icon="lucide:settings" /> `Settings` button in the [Application Toolbar](../overview#application-toolbar). Note that regular users will see a simplified menu with fewer options compared to administrators.



## Administrator View

Administrators see all available settings.

<table>
  <tr>
    <td>
      <img src="/img/screen-settings-left-panel-admin.png" alt="Settings Sidebar - Admin View" />
    </td>
    <td>
      <ul>
        <li>
          <strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup Notifications</a>: Configure per-backup notification settings</li>
            <li><a href="overdue-settings.md">Overdue Monitoring</a>: Configure overdue backup detection and alerts</li>
            <li><a href="notification-templates.md">Templates</a>: Customise notification message templates</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Configure NTFY push notification service</li>
            <li><a href="email-settings.md">Email</a>: Configure SMTP email notifications</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Servers</a>: Manage Duplicati server configurations</li>
            <li><a href="display-settings.md">Display</a>: Configure display preferences</li>
            <li><a href="database-maintenance.md">Database Maintenance</a>: Perform database cleanup (admin only)</li>
            <li><a href="user-management-settings.md">Users</a>: Manage user accounts (admin only)</li>
            <li><a href="audit-log-settings.md">Audit Log</a>: View system audit logs</li>
            <li><a href="audit-log-settings.md#retention-configuration">Audit Log Retention</a>: Configure audit log retention (admin only)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Non-Administrator View

Regular users see a limited set of settings.

<table>
  <tr>
    <td>
      <img src="/img/screen-settings-left-panel-non-admin.png" alt="Settings Sidebar - Non-Admin View" />
    </td>
    <td>
      <ul>
        <li>
          <strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup Notifications</a>: View per-backup notification settings (read-only)</li>
            <li><a href="overdue-settings.md">Overdue Monitoring</a>: View overdue backup settings (read-only)</li>
            <li><a href="notification-templates.md">Templates</a>: View notification templates (read-only)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: View NTFY settings (read-only)</li>
            <li><a href="email-settings.md">Email</a>: View email settings (read-only)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Servers</a>: View server configurations (read-only)</li>
            <li><a href="display-settings.md">Display</a>: Configure display preferences</li>
            <li><a href="audit-log-settings.md">Audit Log</a>: View system audit logs (read-only)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Status Icons

The sidebar displays status icons next to the **NTFY** and **Email** integration settings:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Green icon**: Your settings are valid and configured correctly
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Yellow icon**: Your settings are not valid or not configured

When the configuration is invalid, the corresponding checkboxes in the [`Backup Notifications`](backup-notifications-settings.md) tab will be greyed out and disabled. For more details, see the [NTFY Settings](ntfy-settings.md) and [Email Settings](email-settings.md) pages.

<br/>

:::important
A green icon does not necessarily mean that notifications are functioning correctly. Always use the available test features to confirm your notifications are working before relying on them. 
:::

<br/>

