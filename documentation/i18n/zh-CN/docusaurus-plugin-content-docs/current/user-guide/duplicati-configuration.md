# Duplicati 配置 {#duplicati-configuration}

[应用程序工具栏](overview.md#application-toolbar) 上的 <SvgButton svgFilename="duplicati_logo.svg" /> 按钮会在新标签页中打开 Duplicati 服务器的 Web 界面。

您可以从下拉列表中选择一台服务器。如果您已经选择了一台服务器（通过点击其卡片）或正在查看其详情，该按钮将直接打开该特定服务器的 Duplicati 配置。

![Duplicati configuration](../assets/screen-duplicati-configuration.png)

- 服务器列表将显示 `server name` 或 `server alias (server name)`。
- 服务器地址在 [设置 → 服务器](settings/server-settings.md) 中进行配置。
- 当您使用 <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [采集备份日志](collect-backup-logs.md) 功能时，应用程序会自动保存服务器的 URL。
- 如果服务器地址尚未配置，则该服务器不会出现在服务器列表中。

## 访问旧版 Duplicati UI {#accessing-the-old-duplicati-ui}

如果您在使用新版 Duplicati Web 界面 (`/ngclient/`) 时遇到登录问题，可以右键单击服务器选择弹出窗口中的 <SvgButton svgFilename="duplicati_logo.svg" /> 按钮或任何服务器项目，在新标签页中打开旧版 Duplicati UI (`/ngax/`)。

<br/><br/>

:::note
所有产品名称、徽标和商标均为其各自所有者的财产。图标和名称仅用于识别目的，并不暗示认可。
:::
