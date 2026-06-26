# 向后不兼容的API更改 {#api-breaking-changes}

本文档概述了duplistatus不同版本中外部API端点的破坏性更改。外部API端点是为其他应用程序和集成（例如首页集成）设计的。

## 概览 {#overview}

本文档涵盖了影响集成、脚本和使用这些端点的应用程序的外部API端点的破坏性更改。对于由Web界面使用的内部API端点，更改会自动处理，不需要手动更新。

:::note
外部API端点在可能的情况下保持向后兼容。仅在必要时为一致性、安全性或功能改进而引入破坏性更改。
:::

## 版本特定更改 {#version-specific-changes}

### 版本 1.3.0 {#version-130}

**外部API端点无破坏性更改**

### 版本 1.2.1 {#version-121}

**外部API端点无破坏性更改**

### 版本 1.1.x {#version-11x}

**外部API端点无破坏性更改**

### 版本 1.0.x {#version-10x}

**外部API端点无破坏性更改**

### 版本 0.9.x {#version-09x}

**外部API端点无破坏性更改**

版本 0.9.x 引入了身份验证，并要求所有用户登录。当从版本 0.8.x 升级时：

1. **身份验证要求**：所有页面和内部API端点现在都需要身份验证
2. **默认管理员帐户**：创建了一个默认的管理员帐户：
   - 用户名：`admin`
   - 密码：`Duplistatus09`（必须在第一次登录时更改）
3. **会话失效**：所有现有的会话都失效
4. **外部API访问**：外部API端点（`/api/summary`，`/api/lastbackup`，`/api/lastbackups`，`/api/upload`）保持不需要身份验证，以便与集成和Duplicati兼容

### 版本 0.8.x {#version-08x}

**外部API端点无破坏性更改**

版本0.8.x不引入任何外部API端点的破坏性更改。以下端点保持不变:

- `/api/summary` - 响应结构未更改
- `/api/lastbackup/{serverId}` - 响应结构未更改
- `/api/lastbackups/{serverId}` - 响应结构未更改
- `/api/upload` - 请求/响应格式未更改

#### 安全增强 {#security-enhancements}

虽然外部API端点没有破坏性更改，但版本0.8.x包括安全增强:

- **CSRF保护**: CSRF令牌验证强制执行状态更改API请求，但外部API保持兼容
- **密码安全**: 密码端点仅限于用户界面，出于安全原因

:::note
这些安全增强不会影响用于读取备份数据的外部API端点。如果您有使用内部端点的自定义脚本，它们可能需要CSRF令牌处理。
:::

### 版本0.7.x {#version-07x}

版本0.7.x引入了几个外部API端点的破坏性更改，需要更新外部集成。

#### 破坏性更改 {#breaking-changes}

##### 字段重命名 {#field-renaming}

- `totalMachines` → `totalServers` 在 `/api/summary` 端点
- `machine` → `server` 在API响应对象
- `backup_types_count` → `backup_jobs_count` 在 `/api/lastbackups/{serverId}` 端点

##### 端点路径更改 {#endpoint-path-changes}

- 所有以前使用 `/api/machines/...` 的API端点现在使用 `/api/servers/...`
- 参数名称从 `machine_id` 更改为 `server_id` (URL编码仍然可以使用两个)

#### 响应结构更改 {#response-structure-changes}

几个端点的响应结构已更新以保持一致性:

##### `/api/summary` {#apisummary}

**之前（0.6.x 及更早版本）：**

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

**之前（0.6.x 及更早版本）：**

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

**之前（0.6.x 及更早版本）：**

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

如果您从 0.7.x 之前的版本升级，请按照以下步骤进行：

1. **更新字段引用**：用新字段名称替换所有旧字段名称的引用
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **更新对象键**：在响应解析中将 `machine` 改为 `server`
   - 更新任何访问 `response.machine` 的代码以使用 `response.server`

3. **更新端点路径**：将使用 `/api/machines/...` 的任何端点改为 `/api/servers/...`
   - 注意：参数仍然可以接受旧标识符；路径应更新

4. **测试集成**：验证您的集成是否与新的 API 结构兼容
   - 测试您的应用程序使用的所有端点
   - 验证响应解析是否正确处理新字段名称

5. **更新文档**：更新任何引用旧 API 的内部文档
   - 更新 API 示例和字段名称引用

## 兼容性 {#compatibility}

### 向后兼容性 {#backward-compatibility}

- **版本 1.2.1**：与 1.1.x API 结构完全向后兼容
- **版本 1.1.x**：与 1.0.x API 结构完全向后兼容
- **版本 1.0.x**：与 0.9.x API 结构完全向后兼容
- **版本 0.9.x**：与 0.8.x API 结构完全向后兼容
- **版本 0.8.x**：与 0.7.x API 结构完全向后兼容
- **版本 0.7.x**：不与 0.7.x 之前的版本向后兼容
  - 旧字段名称将不起作用
  - 旧端点路径将不起作用

### 未来支持 {#future-support}

- 来自 0.7.x 之前版本的旧字段名称不受支持
- 来自 0.7.x 之前版本的旧端点路径不受支持
- 未来版本将保持当前的 API 结构，除非需要进行破坏性更改

## 外部 API 端点摘要 {#summary-of-external-api-endpoints}

以下外部 API 端点为维护向后兼容性而保留，且无需身份验证：

| 端点 | 方法 | 描述 | 破坏性变更 |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | 备份操作的总体摘要 | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | 服务器的最新备份 | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | 所有备份作业的最新备份 | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | 从 Duplicati 上传备份数据 | 无破坏性变更 |

## 需要帮助？ {#need-help}

如果您需要帮助更新您的集成：

- **API 参考**: 检查 [API 参考](../api-reference/overview.md) 以获取当前端点文档
- **外部 API**: 参阅 [外部 API](../api-reference/external-apis.md) 以获取详细的端点文档
- **迁移指南**: 查看 [迁移指南](version_upgrade.md) 以获取一般的迁移信息
- **版本说明**: 查看版本特定的 [版本说明](../release-notes/0.8.x.md) 以获取更多上下文
- **支持**: 在 [GitHub](https://github.com/wsj-br/duplistatus/issues) 上打开一个问题以获取支持
