

# 不向后兼容的 API 变更 {#api-breaking-changes}

本文档概述 duplistatus 各版本对外部 API 端点的破坏性变更。外部 API 端点供其他应用程序和集成（例如 Homepage 集成）使用。

## 概览 {#overview}

本文档涵盖影响集成、脚本和使用这些端点的应用程序的外部 API 端点破坏性变更。对于 Web 界面使用的内部 API 端点，变更会自动处理，无需手动更新。

:::note
在可能的情况下，外部 API 端点会保持向后兼容。仅在一致性、安全性或功能改进所必需时才会引入破坏性变更。
:::

## 各版本变更 {#version-specific-changes}

### 版本 1.3.0 {#version-130}

**外部 API 端点无破坏性变更**

### 版本 1.2.1 {#version-121}

**外部 API 端点无破坏性变更**


### 版本 1.1.x {#version-11x}

**外部 API 端点无破坏性变更**

### 版本 1.0.x {#version-10x}

**外部 API 端点无破坏性变更**


### 版本 0.9.x {#version-09x}

**外部 API 端点无破坏性变更**

版本 0.9.x 引入身份验证，要求所有用户登录。从 0.8.x 升级时：

1. **需要身份验证**：所有页面和内部 API 端点现在都需要身份验证
2. **默认管理员账户**：自动创建默认管理员账户：
   - 用户名：`admin`
   - 密码：`Duplistatus09`（首次登录时必须更改）
3. **会话失效**：所有现有会话均失效
4. **外部 API 访问**：外部 API 端点（`/api/summary`、`/api/lastbackup`、`/api/lastbackups`、`/api/upload`）保持无需身份验证，以兼容集成和 Duplicati

### 版本 0.8.x {#version-08x}

**外部 API 端点无破坏性变更**

版本 0.8.x 未对外部 API 端点引入任何破坏性变更。以下端点保持不变：

- `/api/summary` - 响应结构未变
- `/api/lastbackup/{serverId}` - 响应结构未变
- `/api/lastbackups/{serverId}` - 响应结构未变
- `/api/upload` - 请求/响应格式未变

#### 安全增强 {#security-enhancements}

虽然外部 API 端点未做破坏性变更，版本 0.8.x 包含以下安全增强：

- **CSRF 保护**：对状态变更 API 请求强制 CSRF 令牌验证，但外部 API 仍保持兼容
- **密码安全**：密码端点限制为用户界面使用，出于安全考虑

:::note
这些安全增强不影响用于读取备份数据的外部 API 端点。若您有使用内部端点的自定义脚本，可能需要 CSRF 令牌处理。
:::

### 版本 0.7.x {#version-07x}

版本 0.7.x 对外部 API 端点引入多项破坏性变更，需要更新外部集成。

#### 破坏性变更 {#breaking-changes}

##### 字段重命名 {#field-renaming}

- `/api/summary` 端点中 `totalMachines` → `totalServers`
- API 响应对象中 `machine` → `server`
- `/api/lastbackups/{serverId}` 端点中 `backup_types_count` → `backup_jobs_count`

##### 端点路径变更 {#endpoint-path-changes}

- 所有原先使用 `/api/machines/...` 的 API 端点现使用 `/api/servers/...`
- 参数名从 `machine_id` 改为 `server_id`（URL 编码仍兼容两者）

#### 响应结构变更 {#response-structure-changes}

多个端点的响应结构已更新以保持一致：

##### `/api/summary` {#apisummary}

**之前（0.6.x 及更早）：**
```json
{
  "totalMachines": 3,
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

**之后（0.7.x+）：**
```json
{
  "totalServers": 3,  // Changed from "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}` {#apilastbackupserverid}

**之前（0.6.x 及更早）：**
```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

**之后（0.7.x+）：**
```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}` {#apilastbackupsserverid}

**之前（0.6.x 及更早）：**
```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Changed to "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**之后（0.7.x+）：**
```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Changed from "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## 迁移步骤 {#migration-steps}

若从 0.7.x 之前的版本升级，请按以下步骤操作：

1. **更新字段引用**：将所有旧字段名替换为新字段名
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **更新对象键**：在响应解析中将 `machine` 改为 `server`
   - 更新所有访问 `response.machine` 的代码为 `response.server`

3. **更新端点路径**：将使用 `/api/machines/...` 的端点改为 `/api/servers/...`
   - 注意：参数仍可接受旧标识符；路径应更新

4. **测试集成**：验证集成是否适用于新 API 结构
   - 测试应用程序使用的所有端点
   - 验证响应解析是否正确处理新字段名

5. **更新文档**：更新引用旧 API 的内部文档
   - 更新 API 示例和字段名引用

## 兼容性 {#compatibility}

### 向后兼容 {#backward-compatibility}

- **版本 1.2.1**：与 1.1.x API 结构完全向后兼容
- **版本 1.1.x**：与 1.0.x API 结构完全向后兼容
- **版本 1.0.x**：与 0.9.x API 结构完全向后兼容
- **版本 0.9.x**：与 0.8.x API 结构完全向后兼容
- **版本 0.8.x**：与 0.7.x API 结构完全向后兼容
- **版本 0.7.x**：与 0.7.x 之前版本不向后兼容
  - 旧字段名不可用
  - 旧端点路径不可用

### 未来支持 {#future-support}

- 不支持 0.7.x 之前版本的旧字段名
- 不支持 0.7.x 之前版本的旧端点路径
- 未来版本将保持当前 API 结构，除非有必要引入破坏性变更

## 外部 API 端点摘要 {#summary-of-external-api-endpoints}

以下外部 API 端点保持向后兼容且无需身份验证：

| 端点 | 方法 | 说明 | 破坏性变更 |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | 备份操作总体摘要 | 0.7.x：`totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | 某服务器最新备份 | 0.7.x：`machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | 所有备份作业的最新备份 | 0.7.x：`machine` → `server`，`backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | 从 Duplicati 上传备份数据 | 无破坏性变更 |

## 需要帮助？ {#need-help}

若更新集成时需要帮助：

- **API 参考**：[API 参考](../api-reference/overview.md) 查看当前端点文档
- **外部 API**：详见[外部 API](../api-reference/external-apis.md) 的端点详细文档
- **迁移指南**：参阅[迁移指南](version_upgrade.md) 了解一般迁移信息
- **发行说明**：查阅各版本[发行说明](../release-notes/0.8.x.md) 获取更多背景
- **支持**：在 [GitHub](https://github.com/wsj-br/duplistatus/issues) 提交 issue 获取支持
