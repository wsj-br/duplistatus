# 主页集成（可选） {#homepage-integration-optional}

[主页](https://gethomepage.dev/) 是一个可定制的仪表盘应用程序。要将 **duplistatus** 与主页集成，请使用 [自定义 API 小部件类型](https://gethomepage.dev/widgets/services/customapi/) 将小部件添加到您的 `services.yaml` 文件中。

## 总结小部件 {#summary-widget}

此小部件在主页仪表盘上显示整体备份统计信息。

```yaml
- Dashboard:
    icon: mdi-cloud-upload
    href: http://your-server:9666/
    widget:
      type: customapi
      url: http://your-server:9666/api/summary
      display: list
      refreshInterval: 60000
      mappings:
        - field: totalServers
          label: Servers
        - field: totalBackups
          label: Backups received
        - field: secondsSinceLastBackup
          label: Last backup
          format: duration
        - field: totalBackupSize
          label: Backed up size
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalStorageUsed
          label: Storage used
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalUploadedSize
          label: Uploaded size
          format: number
          scale: 0.000000001
          suffix: GB
```

**小部件显示：**

![Homepage Summary Widget](/img/homepage-summary.png)

## 上次备份信息小部件 {#last-backup-information-widget}

此小部件显示特定机器的最新备份信息。

```yaml
- Test Machine 1:
    icon: mdi-test-tube
    widget:
      type: customapi
      url: http://your-server:9666/api/lastbackup/Test%20Machine%201
      display: list
      refreshInterval: 60000
      mappings:
        - field: latest_backup.name
          label: Backup name
        - field: latest_backup.status
          label: Result
        - field: latest_backup.date
          label: Date
          format: relativeDate
        - field: latest_backup.duration
          label: Duration
        - field: latest_backup.uploadedSize
          label: Bytes Uploaded
          format: number
          scale: 0.000001
          suffix: MB
        - field: latest_backup.backup_list_count
          label: Versions
```

**小部件显示：**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## 配置说明 {#configuration-notes}

- 将 `your-server` 替换为您的服务器的 IP 地址或主机名。
- 根据需要调整 `refreshInterval`（以毫秒为单位）。
- 在 URL 中将机器名称中的空格替换为 `%20`（例如，`Test Machine 1` 变为 `Test%20Machine%201`）。
- `scale` 值将字节转换为更易读的单位（GB、MB）。
