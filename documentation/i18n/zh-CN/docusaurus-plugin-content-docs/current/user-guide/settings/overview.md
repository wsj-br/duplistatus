# 概览 {#overview}

设置页面提供统一界面，用于配置 **duplistatus** 的所有方面。您可点击[应用工具栏](../overview.md#application-toolbar)中的 <IconButton icon="lucide:settings" /> **Settings** 按钮访问。请注意，与普通用户相比，管理员会看到包含更多选项的完整菜单。

## 管理员视图 {#administrator-view}

管理员可看到所有可用设置。

<table>
  <tr>
    <td>
      ![Settings Sidebar - Admin View](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup Notifications</a>：配置按备份的通知设置</li>
            <li><a href="backup-monitoring-settings.md">Backup Monitoring</a>：配置逾期备份检测与告警</li>
            <li><a href="notification-templates.md">Templates</a>：自定义通知消息模板</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>：配置 NTFY 推送通知服务</li>
            <li><a href="email-settings.md">Email</a>：配置 SMTP 电子邮件通知</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Servers</a>：管理 Duplicati 服务器配置</li>
            <li><a href="display-settings.md">Display Settings</a>：配置主题、图表时间范围、图表样式、格式区域设置、自动刷新间隔、卡片排序顺序和每周起始日</li>
            <li><a href="database-maintenance.md">Database Maintenance</a>：执行数据库清理（仅管理员）</li>
            <li><a href="user-management-settings.md">Users</a>：管理用户账户（仅管理员）</li>
            <li><a href="audit-logs-viewer.md">Audit Log</a>：查看系统审计日志</li>
            <li><a href="audit-logs-retention.md">Audit Log Retention</a>：配置审计日志保留（仅管理员）</li>
            <li><a href="application-logs-settings.md">Application Logs</a>：查看和导出应用程序日志（仅管理员）</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## 非管理员视图 {#non-administrator-view}

普通用户只能看到有限的设置。

<table>
  <tr>
    <td>
      ![Settings Sidebar - Non-Admin View](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup Notifications</a>：查看按备份的通知设置（只读）</li>
            <li><a href="backup-monitoring-settings.md">Backup monitoring</a>：查看逾期备份设置（只读）</li>
            <li><a href="notification-templates.md">Templates</a>：查看通知模板（只读）</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>：查看 NTFY 设置（只读）</li>
            <li><a href="email-settings.md">Email</a>：查看电子邮件设置（只读）</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Servers</a>：查看服务器配置（只读）</li>
            <li><a href="display-settings.md">Display</a>：配置主题、图表时间范围、图表样式、格式区域设置、自动刷新间隔、卡片排序顺序和每周起始日</li>
            <li><a href="audit-logs-viewer.md">Audit Log</a>：查看系统审计日志（只读）</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## 状态图标 {#status-icons}

侧边栏在 **NTFY** 和 **Email** 集成设置旁显示状态图标：
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Green icon**：您的设置有效且配置正确
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Yellow icon**：您的设置无效或未配置

配置无效时，[Backup Notifications](backup-notifications-settings.md) 标签页中对应的复选框会变为灰色并禁用。详见 [NTFY Settings](ntfy-settings.md) 和 [Email Settings](email-settings.md) 页面。

<br/>

:::important
绿色图标并不一定表示通知功能正常。在依赖通知之前，请始终使用可用的测试功能确认通知是否正常工作。
:::

<br/>
