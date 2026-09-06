# 时区 {#timezone}

应用程序用户界面的日期和时间将根据浏览器的设置显示。日志仍然使用 `TZ` 环境变量。每日摘要通知使用 [设置 → 每日摘要](../user-guide/settings/daily-summary-settings.md) 中保存的 IANA 时区，而不是 `TZ`。其他非每日摘要的通知时间戳仍然遵循 `TZ`。

如果此环境变量未设置，则默认值为 `TZ=Europe/London`。

:::note
通知的语言和区域设置（数字和日期格式）可以在 [设置 → 模板](../user-guide/settings/notification-templates.md) 中配置。
:::

## 配置时区 {#configuring-the-timezone}

应用程序用户界面的日期和时间将根据浏览器的设置显示。日志仍然使用 `TZ` 环境变量。每日摘要通知使用 [设置 → 每日摘要](../user-guide/settings/daily-summary-settings.md) 中保存的 IANA 时区，而不是 `TZ`。其他非每日摘要的通知时间戳仍然遵循 `TZ`。

如果此环境变量未设置，则默认值为 `TZ=Europe/London`。

例如，要将时区更改为圣保罗，可以将以下行添加到目录 `duplistatus` 中的 `compose.yml` 中：

```yaml
environment:
  - TZ=America/Sao_Paulo
```

或者，可以在命令行中传递环境变量（Docker 或 Podman）：

```bash
  --env TZ=America/Sao_Paulo
```

### 使用您的 Linux 配置 {#using-your-linux-configuration}

要获取您的 Linux 主机配置，可以执行：

```bash
echo TZ=\"$(</etc/timezone)\"
```

### 时区列表 {#list-of-timezones}

您可以在此处找到时区列表：[维基百科：时区数据库时间区列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
