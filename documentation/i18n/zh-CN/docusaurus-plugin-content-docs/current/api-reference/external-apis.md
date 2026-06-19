# 外部 API {#external-apis}

这些端点旨在供其他应用程序和集成使用，例如 [Homepage](../user-guide/homepage-integration.md)。

## 获取总体摘要 - `/api/summary` {#get-overall-summary---apisummary}
- **端点**: `/api/summary`
- **方法**: GET
- **描述**: 检索所有服务器上所有备份操作的摘要。
- **响应**:

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
  - `500`: 获取摘要数据时发生服务器错误
- **备注**:
  - 在版本 0.5.x 中，字段 `totalBackupedSize` 被 `totalBackupSize` 取代
  - 在版本 0.7.x 中，字段 `totalMachines` 被 `totalServers` 取代
  - 字段 `overdueBackupsCount` 显示当前逾期备份的数字
  - 字段 `secondsSinceLastBackup` 显示所有服务器上次备份以来经过的时间（秒）
  - 如果数据获取失败，则返回包含零值的回退响应
  - **备注**: 对于内部仪表板使用，请考虑使用 `/api/dashboard`，其中包含此数据及其他附加信息

## 获取最新备份 - `/api/lastbackup/:serverId` {#get-latest-backup---apilastbackupserverid}
- **端点**: `/api/lastbackup/:serverId`
- **方法**: GET
- **描述**: 检索特定服务器的最新备份信息。
- **参数**:
  - `serverId`: 服务器标识符（ID 或名称）

:::note
服务器标识符必须经过 URL 编码。
:::

- **响应**:

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
  - `404`: 未找到服务器
  - `500`: 内部服务器错误
- **备注**:
  - 在版本 0.7.x 中，响应对象键从 `machine` 更改为 `server`
  - 服务器标识符可以是 ID 或名称
  - 如果不存在备份，则 latest_backup 返回 null
  - 包含缓存控制标头以防止缓存

## 获取最新备份列表 - `/api/lastbackups/:serverId` {#get-latest-backups---apilastbackupsserverid}
- **端点**: `/api/lastbackups/:serverId`
- **方法**: GET
- **描述**: 检索特定服务器上所有已配置备份（例如“文件”、“数据库”）的最新备份信息。
- **参数**:
  - `serverId`: 服务器标识符（ID 或名称）

:::note
服务器标识符必须经过 URL 编码。
:::

- **响应**:

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
  - `404`: 未找到服务器
  - `500`: 内部服务器错误
- **备注**:
  - 在版本 0.7.x 中，响应对象键从 `machine` 更改为 `server`，且字段 `backup_types_count` 重命名为 `backup_jobs_count`
  - 服务器标识符可以是 ID 或名称
  - 返回服务器拥有的每个备份作业 (backup_name) 的最新备份
  - 不同于 `/api/lastbackup/:serverId`，后者仅返回服务器最近的一次备份（与备份作业无关）
  - 包含缓存控制标头以防止缓存

## 上传备份数据 - `/api/upload` {#upload-backup-data---apiupload}
- **端点**: `/api/upload`
- **方法**: POST
- **描述**: 为服务器上传备份操作数据。支持重复备份运行检测并发送通知。
- **请求正文**: 由 Duplicati 发送的包含以下选项的 JSON:

  ```bash
  --send-http-url=http://my.local.server:9666/api/upload
  --send-http-result-output-format=Json
  --send-http-log-level=Information
  ```

- **响应**:

  ```json
  {
    "success": true
  }
  ```

- **错误响应**:
  - `400`: Extra 或 Data 部分缺少必填字段，或 MainOperation 无效
  - `409`: 重复的备份数据（已忽略）
  - `500`: 处理备份数据时发生服务器错误
- **备注**:
  - 仅处理备份操作（MainOperation 必须为 "Backup"）
  - 验证 Extra 部分的必填字段：machine-id、machine-name、backup-name、backup-id
  - 验证 Data 部分的必填字段：ParsedResult、BeginTime、持续时间
  - 自动检测重复的备份运行并返回 409 状态
  - 在成功插入备份后发送通知（如果已配置）
  - 在开发模式下，为方便调试，将请求数据记录到项目根目录下 `data` 目录中的文件中
  - 使用事务确保数据一致性
