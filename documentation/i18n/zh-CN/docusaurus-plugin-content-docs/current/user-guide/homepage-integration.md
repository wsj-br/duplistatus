# Homepage 集成（可选） {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) 是一个可自定义的仪表板应用程序。要将 **duplistatus** 与 Homepage 集成，请使用 [Custom API 挂件类型](https://gethomepage.dev/widgets/services/customapi/) 在您的 `services.yaml` 文件中添加一个挂件。

## 摘要挂件 {#summary-widget}

此挂件在您的 Homepage 仪表板上显示整体备份统计信息。

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

**挂件显示：**

![Homepage Summary Widget](/img/homepage-summary.png)

## 上次备份信息挂件 {#last-backup-information-widget}

此挂件显示特定机器的最新备份信息。

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

**挂件显示：**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## 配置说明 {#configuration-notes}

- 将 `your-server` 替换为服务器的 IP 地址或主机名。
- 根据需要调整 `refreshInterval`（单位为毫秒）。
- 将 URL 中机器名称的空格替换为 `%20`（例如，`Test Machine 1` 变为 `Test%20Machine%201`）。
- `scale` 值将字节转换为更易读的单位（GB, MB）。
