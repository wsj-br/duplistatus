# 外部API {/* #external-apis */}

这些端点设计用于其他应用程序和集成，例如[Homepage](../user-guide/homepage-integration.md)。它们免除CSRF保护且不使用会话cookie。

身份验证是可选的，默认为关闭。虽然密钥是可选的，客户端可以省略密钥或发送一个：接受并记录有效的匹配范围密钥；忽略错误密钥，请求仍会继续进行。当在[API密钥](../user-guide/settings/api-keys-settings.md)中启用**需要API密钥**时，将密钥作为`?api_key=`、`X-Api-Key`或`Authorization: Bearer`发送。上传密钥仅在`POST /api/upload`上工作。读取密钥仅在`/api/summary`和`/api/lastbackup*`上工作。查询字符串密钥出现在反向代理访问日志中。

也可以使用[IP白名单](../user-guide/settings/ip-allowlist-settings.md)限制这些路由。当两个列表都关闭时，`/api/health`和`/api/ping`保持公开；当启用任一列表时，它们接受管理员或外部列表中的回环和CIDR，并且非回环客户端受到速率限制。

## 获取总体摘要 - `/api/summary` {/* #get-overall-summary---apisummary */}
- **端点**: `/api/summary`
- **方法**: GET
- **描述**: 检索所有服务器上的所有备份操作摘要。
- **响应**：

  ```json
  {
    "totalServers": 3,
    "totalBackupsRuns": 9,
    "totalBackups": 9,
    "totalUploadedSize": 2397229507,
    "totalStorageUsed": 43346796938,
    "totalBackupSize": 126089687807,
    "overdueBackupsCount": 2,
    "secondsSinceLastBackup": 7200
  }
  ```

- **错误响应**:
  - `401`: 需要密钥时缺少或无效的API密钥
  - `403`: 密钥范围不是`read`，或客户端IP不在外部白名单上
  - `429`: 超出读取API速率限制
  - `500`: 获取摘要数据时服务器错误
- **备注**:
  - 在版本0.5.x中，字段`totalBackupedSize`被`totalBackupSize`替换
  - 在版本0.7.x中，字段`totalMachines`被`totalServers`替换
  - 字段`overdueBackupsCount`显示当前过期备份的数量
  - 字段`secondsSinceLastBackup`显示自上次备份以来的所有服务器时间（以秒为单位）
  - 如果数据获取失败，则返回带有零值的备用响应
  - **注意**: 对于内部仪表板使用，请考虑使用`/api/dashboard`，它包含此数据以及附加信息

## 获取最新备份 - `/api/lastbackup/:serverId` {/* #get-latest-backup---apilastbackupserverid */}
- **端点**: `/api/lastbackup/:serverId`
- **方法**: GET
- **描述**: 检索特定服务器的最新备份信息。
- **参数**:
  - `serverId`: 服务器标识符（ID或名称）

:::note
服务器标识符必须进行URL编码。
:::

- **响应**：

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Backup Name",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "server_id": "unique-server-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "messages": 150,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "uploadedSize": 331318892,
      "duration": "00:38:31",
      "duration_seconds": 2311.6018052,
      "durationInMinutes": 38.52669675333333,
      "knownFileSize": 27203688543,
      "backup_list_count": 10,
      "messages_array": ["message1", "message2"],
      "warnings_array": ["warning1"],
      "errors_array": [],
      "available_backups": ["v1", "v2", "v3"]
    },
    "status": 200
  }
  ```

- **错误响应**:
  - `401`: 需要密钥时缺少或无效的API密钥
  - `403`: 密钥范围不是`read`，或客户端IP不在外部白名单上
  - `404`: 未找到服务器
  - `429`: 超出读取API速率限制
  - `500`: 内部服务器错误
- **备注**:
  - 在版本0.7.x中，响应对象键从`machine`更改为`server`
  - 服务器标识符可以是ID或名称
  - 如果不存在备份，则latest_backup返回null
  - 包含缓存控制头以防止缓存

## 获取最新备份 - `/api/lastbackups/:serverId` {/* #get-latest-backups---apilastbackupsserverid */}
- **端点**: `/api/lastbackups/:serverId`
- **方法**: GET
- **描述**: 检索特定服务器上所有配置备份（例如'文件'、'数据库'）的最新备份信息。
- **参数**:
  - `serverId`: 服务器标识符（ID或名称）

:::note
服务器标识符必须进行URL编码。
:::

- **响应**：

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Default Backup",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backups": [
      {
        "id": "backup1",
        "server_id": "unique-server-id",
        "name": "Files",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "messages": 150,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "uploadedSize": 331318892,
        "duration": "00:38:31",
        "duration_seconds": 2311.6018052,
        "durationInMinutes": 38.52669675333333,
        "knownFileSize": 27203688543,
        "backup_list_count": 10,
        "messages_array": "[\"message1\", \"message2\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2", "v3"]
      },
      {
        "id": "backup2",
        "server_id": "unique-server-id",
        "name": "Databases",
        "date": "2024-03-20T11:00:00Z",
        "status": "Success",
        "warnings": 1,
        "errors": 0,
        "messages": 75,
        "fileCount": 125000,
        "fileSize": 56789012345,
        "uploadedSize": 123456789,
        "duration": "00:25:15",
        "duration_seconds": 1515.1234567,
        "durationInMinutes": 25.25205761166667,
        "knownFileSize": 12345678901,
        "backup_list_count": 5,
        "messages_array": ["message1"],
        "warnings_array": ["warning1"],
        "errors_array": [],
        "available_backups": ["v1", "v2"]
      }
    ],
    "backup_jobs_count": 2,
    "backup_names": ["Files", "Databases"],
    "status": 200
  }
  ```

- **错误响应**:
  - `401`: 需要密钥时缺少或无效的API密钥
  - `403`: 密钥范围不是`read`，或客户端IP不在外部白名单上
  - `404`: 未找到服务器
  - `429`: 超出读取API速率限制
  - `500`: 内部服务器错误
- **备注**:
  - 在版本0.7.x中，响应对象键从`machine`更改为`server`，字段`backup_types_count`重命名为`backup_jobs_count`
  - 服务器标识符可以是ID或名称
  - 返回服务器具有的每个备份作业（backup_name）的最新备份
  - 与`/api/lastbackup/:serverId`不同，后者仅返回服务器的单个最近备份（独立于备份作业）
  - 包含缓存控制头以防止缓存

## 上传备份数据 - `/api/upload` {/* #upload-backup-data---apiupload */}
- **端点**：`/api/upload`
- **方法**：POST
- **描述**：为服务器上传备份操作数据。支持重复备份运行检测并发送通知。
- **请求正文**：由 duplicati 发送的 JSON，包含以下选项：

  ```bash
  --send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
  --send-http-log-level=Information
  --send-http-max-log-lines=500
```

在早于 2.0.9.106 的 duplicati 版本中，使用 `--send-http-url` 和 `--send-http-result-output-format=Json`。参见 [duplicati 服务器配置](../installation/duplicati-server-configuration.md)。

- **响应**：

  ```json
  {
    "success": true
  }
  ```

- **错误响应**：
  - `400`：Extra 或 Data 部分缺少必需字段，或 MainOperation 无效
  - `401`：缺少或无效的 API 密钥（当需要密钥时）
  - `403`：密钥范围不是 `upload`，或客户端 IP 不在外围允许列表中
  - `409`：重复备份数据（已忽略）
  - `413`：请求正文超出配置的上传大小限制（默认 5 MB）
  - `429`：上传或身份验证失败率限制超出（已设置 `Retry-After`）
  - `500`：服务器处理备份数据时出错
- **注意事项**：
  - 仅处理备份操作（MainOperation 必须为 "Backup"）
  - 验证 Extra 部分中的必需字段：machine-id、machine-name、backup-name、backup-id
  - 验证 Data 部分中的必需字段：ParsedResult、BeginTime、Duration
  - 自动检测重复备份运行并返回 409 状态
  - 在成功插入备份后发送通知（如果已配置）
  - 在开发模式下将请求数据记录到项目根目录下的 `data` 目录中的文件以供调试
  - 使用事务确保数据一致性
