# 核心操作 {#core-operations}

## 获取仪表板数据（综合） - `/api/dashboard` {#get-dashboard-data-consolidated---apidashboard}
- **端点**: `/api/dashboard`
- **方法**: GET
- **描述**: 检索所有仪表板数据，包括服务器摘要、总结、图表数据等，返回一个综合响应。
- **响应**:

  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Server Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastBackupStatus": "Success",
        "lastBackupDuration": "00:38:31",
        "lastBackupListCount": 10,
        "lastBackupName": "Backup Name",
        "lastBackupId": "backup-id",
        "backupCount": 15,
        "totalWarnings": 5,
        "totalErrors": 0,
        "availableBackups": ["v1", "v2", "v3"],
        "isBackupOverdue": false,
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago",
        "lastOverdueCheck": "2024-03-20T12:00:00Z",
        "lastNotificationSent": "N/A"
      }
    ],
    "overallSummary": {
      "totalServers": 3,
      "totalBackups": 9,
      "totalUploadedSize": 2397229507,
      "totalStorageUsed": 43346796938,
      "totalBackupSize": 126089687807,
      "overdueBackupsCount": 2,
      "secondsSinceLastBackup": 7200
    },
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```

- **错误响应**:
  - `500`: 服务器错误，无法获取仪表板数据
- **注释**:
  - 本端点合并了之前的 `/api/servers-summary` 端点（已移除）
  - `overallSummary` 字段包含与 `/api/summary` 相同的数据（为外部应用程序维护）
  - `chartData` 字段包含与 `/api/chart-data/aggregated` 相同的数据（仍然存在以便直接访问）
  - 通过减少多个 API 调用来提高性能，仅需一个请求
  - 所有数据都并行获取以实现最佳性能
  - `secondsSinceLastBackup` 字段显示自上次备份以来所经过的时间（以秒为单位），适用于所有服务器

## 获取所有服务器 - `/api/servers` {#get-all-servers---apiservers}
- **端点**: `/api/servers`
- **方法**: GET
- **描述**: 检索所有服务器的基本信息列表，选项包括备份信息。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **查询参数**:
  - `includeBackups` （可选）：设置为 `true` 以包含每个服务器的备份信息
- **响应** （无参数）：

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```

- **响应** （带 `includeBackups=true`）：

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "backupName": "Backup Name",
      "server_url": "http://localhost:8200",
      "alias": "Server Alias",
      "note": "Additional notes about the server",
      "hasPassword": true
    }
  ]
  ```

- **错误响应**:
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `500`: 服务器错误，无法获取服务器
- **注释**:
  - 返回服务器信息，包括别名和注释字段
  - 当 `includeBackups=true` 时，返回包含 URL 和密码状态的服务器备份组合
  - 合并了之前的 `/api/servers-with-backups` 端点（已移除）
  - 用于服务器选择、显示和配置目的
  - 包括 `hasPassword` 字段以指示服务器是否存储了密码

## 获取服务器详细信息 - `/api/servers/:id` {#get-server-details---apiserversid}
- **端点**: `/api/servers/:id`
- **方法**: GET
- **描述**: 检索有关特定服务器的信息。可以返回基本服务器信息或包含备份和图表数据的详细信息。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **参数**:
  - `id`: 服务器标识符
- **查询参数**:
  - `includeBackups` （可选）：设置为 `true` 以包含备份数据
  - `includeChartData` （可选）：设置为 `true` 以包含图表数据
- **响应** （无参数）：

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **响应** （带参数）：

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200",
    "backups": [
      { ... }
    ],
    "chartData": [
      { ... }
    ]
  }
  ```

- **错误响应**:
  - `401`: 未经授权 - 无效会话或 CSRF 令牌
  - `404`: 服务器未找到
  - `500`: 服务器错误，无法获取服务器详细信息
- **注释**:
  - 在不提供查询参数时返回基本服务器信息
  - 将 `includeBackups` 或 `includeChartData` 设置为 `true` 时，返回包含备份和图表数据的完整服务器数据
  - 用于服务器设置和详细视图

## 更新服务器 - `/api/servers/:id` {#update-server---apiserversid}
- **端点**: `/api/servers/:id`
- **方法**: PATCH
- **描述**: 更新服务器详细信息，包括别名、注释和服务器 URL。
- **身份验证**: 需要有效的会话和 CSRF 令牌
- **参数**:
  - `id`: 服务器标识符
- **请求体**:

  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **响应**:

  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 无效会话或CSRF令牌
  - `404`: 服务器未找到
  - `500`: 服务器更新期间出错
- **注释**:
  - 更新服务器别名、注释和服务器URL
  - 所有字段都是可选的
  - 所有字段都允许为空字符串

## 删除服务器 - `/api/servers/:id` {#delete-server---apiserversid}
- **端点**: `/api/servers/:id`
- **方法**: DELETE
- **描述**: 删除一个服务器及其所有关联的备份。
- **身份验证**: 需要有效的会话和CSRF令牌
- **参数**:
  - `id`: 服务器标识符

- **响应**:

  ```json
  {
    "message": "Successfully deleted server and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```

- **错误响应**:
  - `401`: 未授权 - 无效会话或CSRF令牌
  - `404`: 服务器未找到
  - `500`: 服务器删除期间出错
- **注释**: 
  - 此操作是不可逆的
  - 将永久删除与服务器关联的所有备份数据
  - 服务器记录本身也将被删除
  - 返回已删除的备份和服务器的数量

## 获取服务器数据，包括逾期信息 - `/api/detail/:serverId` {#get-server-data-with-overdue-info---apidetailserverid}
- **端点**: `/api/detail/:serverId`
- **方法**: GET
- **描述**: 检索详细的服务器信息，包括逾期备份状态。
- **参数**:
  - `serverId`: 服务器标识符

- **响应**:

  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Server Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Server Name",
        "backupName": "Backup Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

- **错误响应**:
  - `404`: 服务器未找到
  - `500`: 服务器错误，获取服务器详细信息
- **注释**:
  - 返回服务器数据，包括逾期备份信息
  - 包括逾期备份详细信息和时间戳
  - 用于逾期备份管理和监控

## 获取重复服务器 - `/api/servers/duplicates` {#get-duplicate-servers---apiserversduplicates}
- **端点**: `/api/servers/duplicates`
- **方法**: GET
- **描述**: 根据机器ID检索重复服务器列表。重复服务器是指共享同一个机器ID但作为单独记录存储在数据库中的服务器。
- **身份验证**: 需要有效的会话、CSRF令牌和管理员访问
- **响应**:

  ```json
  [
    {
      "machineId": "machine-id-123",
      "servers": [
        {
          "id": "server-id-1",
          "name": "Server Name 1",
          "alias": "Server Alias 1",
          "server_url": "http://localhost:8200",
          "backupCount": 5
        },
        {
          "id": "server-id-2",
          "name": "Server Name 2",
          "alias": "Server Alias 2",
          "server_url": "http://localhost:8200",
          "backupCount": 3
        }
      ]
    }
  ]
  ```

- **错误响应**:
  - `401`: 未授权 - 无效会话或CSRF令牌
  - `403`: 需要管理员访问
  - `500`: 服务器错误，获取重复服务器
- **注释**:
  - 只有管理员可以访问此端点
  - 返回共享同一个机器ID的服务器组
  - 每个组包含所有具有同一个机器ID的服务器
  - 用于识别和合并重复服务器记录
  - 包括每个重复服务器的服务器详细信息和备份计数

## 合并服务器 - `/api/servers/merge` {#merge-servers---apiserversmerge}
- **端点**: `/api/servers/merge`
- **方法**: POST
- **描述**: 将多个服务器合并到目标服务器。所有源服务器的备份都将转移到目标服务器，源服务器将被删除。
- **身份验证**：需要有效的会话、CSRF 令牌和管理员访问权限
- **请求体**：

  ```json
  {
    "oldServerIds": ["server-id-1", "server-id-2"],
    "targetServerId": "server-id-3"
  }
  ```

- **响应**:

  ```json
  {
    "success": true,
    "message": "Successfully merged 2 server(s) into target server",
    "backupIdsNormalized": 1
  }
  ```

- **错误响应**:
  - `400`：无效的请求体、缺少必需字段或目标服务器在合并服务器列表中
  - `401`：未经授权 - 无效的会话或 CSRF 令牌
  - `403`：需要管理员访问权限
  - `500`：合并操作期间发生服务器错误
- **注意**:
  - 只有管理员可以执行合并操作
  - 目标服务器不得在合并服务器列表中
  - 所有来自源服务器的备份都被转移到目标服务器
  - 合并服务器上相同 `backup_name` 的重复 `backup_id` 值被规范化为最近备份行的 ID
  - 源服务器在合并成功后被删除
  - 此操作是不可逆的
  - 用于合并重复的服务器记录
  - 验证 oldServerIds 是一个非空数组
  - 验证 targetServerId 已提供且为字符串
