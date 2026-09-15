# 向后不兼容的 API 更改 {/* #backward-incompatible-api-changes */}

本文档概述了跨不同版本的 duplistatus 中外部 API 端点的不兼容更改。外部 API 端点是为其他应用程序和集成设计的（例如，主页集成）。

## 概述 {/* #overview */}

本文档涵盖影响集成、脚本和使用这些端点的应用程序的外部 API 端点的不兼容更改。对于 Web 界面使用的内部 API 端点，更改会自动处理，不需要手动更新。

:::note
外部 API 端点在可能的情况下保持向后兼容性。仅在必要时引入不兼容更改，以确保一致性、安全性或功能改进。
:::

## 版本特定更改 {/* #version-specific-changes */}

### 版本 1.3.0 {/* #version-130 */}

**外部 API 端点无不兼容更改**

### 版本 1.2.1 {/* #version-121 */}

**外部 API 端点无不兼容更改**

### 版本 1.1.x {/* #version-11x */}

**外部 API 端点无不兼容更改**

### 版本 1.0.x {/* #version-10x */}

**外部 API 端点无不兼容更改**

### 版本 0.9.x {/* #version-09x */}

**外部 API 端点无不兼容更改**

版本 0.9.x 引入了身份验证，并要求所有用户登录。从版本 0.8.x 升级时：

1. **需要身份验证**：所有页面和内部 API 端点现在都需要身份验证
2. **默认管理员账户**：自动创建默认管理员账户：
   - 用户名：`admin`
   - 密码：`Duplistatus09`（首次登录后必须更改）
3. **会话失效**：所有现有会话都将失效
4. **外部 API 访问**：外部 API 端点（`/api/summary`、`/api/lastbackup`、`/api/lastbackups`、`/api/upload`）保持无需身份验证以保持与集成和 Duplicati 的兼容性

### 版本 0.8.x {/* #version-08x */}

**外部 API 端点无不兼容更改**

版本0.8.x未对外部API端点引入任何破坏性更改。以下端点保持不变：

- `/api/summary` - 响应结构不变
- `/api/lastbackup/{serverId}` - 响应结构不变
- `/api/lastbackups/{serverId}` - 响应结构不变
- `/api/upload` - 请求/响应格式不变

#### 安全增强 {/* #security-enhancements */}

虽然未对外部API端点进行破坏性更改，但版本0.8.x包含以下安全增强：

- **CSRF保护**：对状态更改的API请求强制执行CSRF令牌验证，但外部API保持兼容
- **密码安全**：出于安全原因，密码端点仅限于用户界面

:::note
这些安全增强不影响用于读取备份数据的外部API端点。如果您有使用内部端点的自定义脚本，可能需要处理CSRF令牌。
:::

### 版本0.7.x {/* #version-07x */}

版本0.7.x对外部API端点进行了多项破坏性更改，需要更新外部集成。

#### 破坏性更改 {/* #breaking-changes */}

##### 字段重命名 {/* #field-renaming */}

- `totalMachines` → `totalServers` 在 `/api/summary` 端点
- `machine` → `server` 在API响应对象中
- `backup_types_count` → `backup_jobs_count` 在 `/api/lastbackups/{serverId}` 端点

##### 端点路径更改 {/* #endpoint-path-changes */}

- 所有以前使用 `/api/machines/...` 的API端点现在使用 `/api/servers/...`
- 参数名称从 `machine_id` 更改为 `server_id`（URL编码仍然支持两者）

#### 响应结构更改 {/* #response-structure-changes */}

多个端点的响应结构已更新以保持一致：

##### `/api/summary` {/* #apisummary */}

**0.6.x 及更早版本：**

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

**0.7.x+ 之后：**

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

##### `/api/lastbackup/{serverId}` {/* #apilastbackupserverid */}

**0.6.x 及更早版本：**

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

**0.7.x+ 之后：**

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

##### `/api/lastbackups/{serverId}` {/* #apilastbackupsserverid */}

**0.6.x 及更早版本：**

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

**0.7.x+ 之后：**

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

## 迁移步骤 {/* #migration-steps */}

如果您从 0.7.x 之前的版本升级，请按照以下步骤进行：

1. **更新字段引用**：将所有旧字段名称的引用替换为新名称
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **更新对象键**：在响应解析中将 `machine` 更改为 `server`
   - 更新访问 `response.machine` 的任何代码以使用 `response.server`

3. **更新端点路径**：将使用 `/api/machines/...` 的任何端点更改为 `/api/servers/...`
   - 注意：参数仍然可以接受旧标识符；路径应更新

4. **测试集成**：验证您的集成是否与新的 API 结构正常工作
   - 测试您的应用程序使用的所有端点
   - 验证响应解析是否正确处理新的字段名称

5. **更新文档**：更新任何引用旧 API 的内部文档
   - 更新 API 示例和字段名称引用

## 兼容性 {/* #compatibility */}

### 向后兼容性 {/* #backward-compatibility */}

- **版本 1.2.1**：完全向后兼容 1.1.x API 结构
- **版本 1.1.x**：完全向后兼容 1.0.x API 结构
- **版本 1.0.x**：完全向后兼容 0.9.x API 结构
- **版本 0.9.x**：完全向后兼容 0.8.x API 结构
- **版本 0.8.x**：完全向后兼容 0.7.x API 结构
- **版本 0.7.x**：与 0.7.x 之前的版本不兼容
  - 旧字段名称将无法使用
  - 旧端点路径将无法使用

### 未来支持 {/* #future-support */}

- 不支持 0.7.x 之前的旧字段名称
- 不支持 0.7.x 之前的旧端点路径
- 未来版本将保持当前的 API 结构，除非必要时进行重大更改

## 外部 API 端点摘要 {/* #summary-of-external-api-endpoints */}

以下外部 API 端点为向后兼容而保留，仍然是未经身份验证的：

| 端点 | 方法 | 描述 | 重大更改 |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | 备份操作的总体摘要 | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | 获取服务器的最新备份 | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | 获取所有备份作业的最新备份 | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | 从Duplicati上传备份数据 | 无重大更改 |

## 需要帮助？{/* #need-help */}

如果您需要协助更新集成：

- **API参考**：查看[API参考](../api-reference/overview.md)以获取当前端点文档
- **外部API**：查看[外部API](../api-reference/external-apis.md)以获取详细的端点文档
- **迁移指南**：查看[迁移指南](version_upgrade.md)以获取一般迁移信息
- **发布说明**：查看特定版本的[发布说明](../release-notes/0.8.x.md)以获取额外的上下文
- **支持**：在[GitHub](https://github.com/wsj-br/duplistatus/issues)上开启一个问题以获取支持
