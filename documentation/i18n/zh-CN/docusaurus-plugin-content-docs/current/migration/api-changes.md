# 外部 API 不兼容变更 {#api-breaking-changes}

本文档概述了 duplistatus 不同版本中外部 API 端点的重大变更。外部 API 端点是为其他应用程序和集成（例如 Homepage 集成）设计的。

## 概览 {#overview}

本文档涵盖了对影响集成、脚本和使用这些端点的应用程序的外部 API 端点的重大变更。对于 Web 界面使用的内部 API 端点，变更将自动处理，无需手动更新。

:::note
外部 API 端点在可能的情况下会保持向后兼容。只有在为了保持一致性、安全性或功能改进时，才会引入重大变更。
:::

## 版本特定变更 {#version-specific-changes}

### 版本 1.3.0 {#version-130}

**外部 API 端点无重大变更**

### 版本 1.2.1 {#version-121}

**外部 API 端点无重大变更**

### 版本 1.1.x {#version-11x}

**外部 API 端点无重大变更**

### 版本 1.0.x {#version-10x}

**外部 API 端点无重大变更**

### 版本 0.9.x {#version-09x}

**外部 API 端点无重大变更**

版本 0.9.x 引入了身份验证，并要求所有用户登录。从版本 0.8.x 升级时：

1. **需要身份验证**：所有页面和内部 API 端点现在都需要身份验证
2. **默认管理员账户**：将自动创建默认管理员账户：
   - 用户名：`admin`
   - 密码：`Duplistatus09`（首次登录时必须更改）
3. **会话失效**：所有现有会话将失效
4. **外部 API 访问**：外部 API 端点（`/api/summary`、`/api/lastbackup`、`/api/lastbackups`、`/api/upload`）为了与集成和 Duplicati 兼容，仍保持未经身份验证的状态

### 版本 0.8.x {#version-08x}

**外部 API 端点无重大变更**

0.8.x 版本对外部 API 端点没有引入任何重大变更。以下端点保持不变：

- `/api/summary` - 响应结构未改变
- `/api/lastbackup/{serverId}` - 响应结构未改变
- `/api/lastbackups/{serverId}` - 响应结构未改变
- `/api/upload` - 请求/响应格式未改变

#### 安全增强 {#security-enhancements}

虽然对外部 API 端点没有做出重大变更，但 0.8.x 版本包含安全增强：

- **CSRF 保护**：对状态改变的 API 请求强制执行 CSRF 令牌验证，但外部 API 仍保持兼容
- **密码安全**：出于安全原因，密码端点仅限于用户界面

:::note
这些安全增强不会影响用于读取备份数据的外部 API 端点。如果您有使用内部端点的自定义脚本，可能需要处理 CSRF 令牌。
:::

### 版本 0.7.x {#version-07x}

0.7.x 版本对外部 API 端点引入了几项需要更新外部集成的重大变更。

#### 重大变更 {#breaking-changes}

##### 字段重命名 {#field-renaming}

- `totalMachines` → `totalServers` 在 `/api/summary` 端点
- `machine` → `server` 在 API 响应对象中
- `backup_types_count` → `backup_jobs_count` 在 `/api/lastbackups/{serverId}` 端点

##### 端点路径变更 {#endpoint-path-changes}

- 所有之前使用 `/api/machines/...` 的 API 端点现在使用 `/api/servers/...`
- 参数名从 `machine_id` 更改为 `server_id`（URL 编码仍然对两者都有效）

#### 响应结构变更 {#response-structure-changes}

为了保持一致性，几个端点的响应结构已更新：

##### `/api/summary` {#apisummary}

**升级前 (0.6.x 及更早版本):**

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

**升级后 (0.7.x+):**

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

**升级前 (0.6.x 及更早版本):**

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

**升级后 (0.7.x+):**

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

**升级前 (0.6.x 及更早版本):**

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

**升级后 (0.7.x+):**

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

如果从 0.7.x 之前的版本升级，请执行以下步骤：

1. **更新字段引用**：将所有对旧字段名的引用替换为新字段名
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **更新对象键**：在响应解析中将 `machine` 更改为 `server`
   - 更新任何访问 `response.machine` 的代码为访问 `response.server`

3. **更新端点路径**：将使用 `/api/machines/...` 的端点更改为使用 `/api/servers/...`
   - 注意：参数仍可接受旧标识符；但路径应进行更新

4. **测试集成**：验证您的集成是否能与新的 API 结构正常工作
   - 测试您的应用程序使用的所有端点
   - 确保响应解析能正确处理新的字段名

5. **更新文档**：更新任何引用旧 API 的内部文档
   - 更新 API 示例和字段名引用

## 兼容性 {#compatibility}

### 向后兼容性 {#backward-compatibility}

- **版本 1.2.1**：完全向后兼容 1.1.x API 结构
- **版本 1.1.x**：完全向后兼容 1.0.x API 结构
- **版本 1.0.x**：完全向后兼容 0.9.x API 结构
- **版本 0.9.x**：完全向后兼容 0.8.x API 结构
- **版本 0.8.x**：完全向后兼容 0.7.x API 结构
- **版本 0.7.x**：不向后兼容 0.7.x 之前的版本
  - 旧字段名将无法使用
  - 旧端点路径将无法使用

### 未来支持 {#future-support}

- 不再支持 0.7.x 之前版本的旧字段名
- 不再支持 0.7.x 之前版本的旧端点路径
- 除非必要，未来版本将维持当前 API 结构

## 外部 API 端点汇总 {#summary-of-external-api-endpoints}

以下外部 API 端点为保持向后兼容性而保留，且无需认证：

| 端点 | 方法 | 描述 | 重大变更 |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | 备份操作的总体摘要 | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | 服务器的最新备份 | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | 所有备份任务的最新备份 | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | 从 Duplicati 上传备份数据 | 无破坏性变更 |

## 需要帮助？ {#need-help}

如果您在更新集成时需要帮助：

- **API 参考**：检查 [API 参考](../api-reference/overview.md) 以获取当前端点文档
- **外部 API**：参阅 [外部 API](../api-reference/external-apis.md) 以获取详细的端点文档
- **迁移指南**：查阅 [迁移指南](version_upgrade.md) 以获取常规迁移信息
- **发行说明**：查阅特定版本的 [发行说明](../release-notes/0.8.x.md) 以获取更多上下文
- **支持**：在 [GitHub](https://github.com/wsj-br/duplistatus/issues) 上提交 issue 以获取支持
