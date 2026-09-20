# 向后不兼容的 API 变更 {/* #backward-incompatible-api-changes */}

本文档概述了 duplistatus 不同版本中外部 API 端点的破坏性变更。外部 API 端点是为其他应用程序和集成（例如，Homepage 集成）设计使用的端点。

## 概述 {/* #overview */}

本文档涵盖影响集成、脚本和使用这些端点的应用程序的外部 API 端点的破坏性变更。对于网页界面使用的内部 API 端点，变更会自动处理，无需手动更新。

:::note
在可能的情况下，外部 API 端点会保持向后兼容性。仅在需要一致性、安全性或功能改进时才会引入破坏性变更。
:::

## 版本特定变更 {/* #version-specific-changes */}

### 版本 1.3.0 {/* #version-130 */}

**外部 API 端点无破坏性变更**

### 版本 1.2.1 {/* #version-121 */}

**外部 API 端点无破坏性变更**

### 版本 1.1.x {/* #version-11x */}

**外部 API 端点无破坏性变更**

### 版本 1.0.x {/* #version-10x */}

**外部 API 端点无破坏性变更**

### 版本 0.9.x {/* #version-09x */}

**外部 API 端点无破坏性变更**

版本 0.9.x 引入了身份验证并要求所有用户登录。从版本 0.8.x 升级时：

1. **需要身份验证**：所有页面和内部 API 端点现在都需要身份验证
2. **默认管理员账户**：默认管理员账户会自动创建：
   - 用户名：`admin`
   - 密码：`Duplistatus09`（首次登录时必须更改）
3. **会话失效**：所有现有会话都将失效
4. **外部 API 访问**：外部 API 端点（`/api/summary`、`/api/lastbackup`、`/api/lastbackups`、`/api/upload`）仍保持未经身份验证状态，以与集成和 duplicati 兼容

### 版本 0.8.x {/* #version-08x */}

**外部 API 端点无破坏性变更**

版本 0.8.x 不对外部 API 端点引入任何破坏性变更。以下端点保持不变：

- `/api/summary` - 响应结构不变
- `/api/lastbackup/{serverId}` - 响应结构不变
- `/api/lastbackups/{serverId}` - 响应结构不变
- `/api/upload` - 请求/响应格式不变

#### 安全增强功能 {/* #security-enhancements */}

虽然对外部API端点没有进行破坏性更改，但版本0.8.x包含安全增强功能：

- **CSRF保护**：对状态更改API请求强制执行CSRF令牌验证，但外部API保持兼容
- **密码安全**：出于安全原因，密码端点仅限于用户界面使用

:::note
这些安全增强功能不会影响用于读取备份数据的外部API端点。如果您有使用内部端点的自定义脚本，它们可能需要处理CSRF令牌。
:::

### 版本 0.7.x {/* #version-07x */}

版本0.7.x对外部API端点引入了若干破坏性更改，需要更新外部集成。

#### 破坏性更改 {/* #breaking-changes */}

##### 字段重命名 {/* #field-renaming */}

- `totalMachines` → `totalServers` 在 `/api/summary` 端点中
- `machine` → `server` 在API响应对象中
- `backup_types_count` → `backup_jobs_count` 在 `/api/lastbackups/{serverId}` 端点中

##### 端点路径更改 {/* #endpoint-path-changes */}

- 所有之前使用 `/api/machines/...` 的API端点现在使用 `/api/servers/...`
- 参数名称从 `machine_id` 更改为 `server_id`（URL编码仍可与两者一起工作）

#### 响应结构更改 {/* #response-structure-changes */}

为了一致性，已更新多个端点的响应结构：

##### `/api/summary` {/* #apisummary */}

**升级前（0.6.x 及更早版本）：**

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

**升级后（0.7.x+）：**

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

**升级前（0.6.x 及更早版本）：**

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

**升级后（0.7.x+）：**

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

**升级前（0.6.x 及更早版本）：**

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

**升级后（0.7.x+）：**

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

如果从 0.7.x 之前的版本升级，请按照以下步骤操作：

1. **更新字段引用**：将所有旧字段名的引用替换为新字段名
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **更新对象键**：在响应解析中将 `machine` 更改为 `server`
   - 更新任何访问 `response.machine` 的代码为 `response.server`

3. **更新端点路径**：将使用 `/api/machines/...` 的任何端点更改为 `/api/servers/...`
   - 注意：参数仍可接受旧标识符；路径应进行更新

4. **测试集成**：验证您的集成是否能与新的 API 结构正常工作
   - 测试应用程序使用的所有端点
   - 验证响应解析是否能正确处理新字段名

5. **更新文档**：更新任何引用旧 API 的内部文档
   - 更新 API 示例和字段名引用

## 兼容性 {/* #compatibility */}

### 向后兼容性 {/* #backward-compatibility */}

- **版本 1.2.1**：完全向后兼容 1.1.x API 结构
- **版本 1.1.x**：完全向后兼容 1.0.x API 结构
- **版本 1.0.x**：完全向后兼容 0.9.x API 结构
- **版本 0.9.x**：完全向后兼容 0.8.x API 结构
- **版本 0.8.x**：完全向后兼容 0.7.x API 结构
- **版本 0.7.x**：不向后兼容 0.7.x 之前的版本
  - 旧字段名将无法使用
  - 旧端点路径将无法使用

### 未来支持 {/* #future-support */}

- 不支持 0.7.x 之前版本的旧字段名
- 不支持 0.7.x 之前版本的旧端点路径
- 除非必要，否则未来版本将保持当前 API 结构不变

## 外部 API 端点摘要 {/* #summary-of-external-api-endpoints */}

以下外部 API 端点为向后兼容而维护，且保持无需身份验证：

| 端点 | 方法 | 描述 | 破坏性变更 |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | 备份操作的总体摘要 | 0.7.x：`totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | 服务器的最新备份 | 0.7.x：`machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | 所有备份任务的最新备份 | 0.7.x: `machine` → `server`，`backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | 从 duplicati 上传备份数据 | 无破坏性变更 |

## 需要帮助？ {/* #need-help */}

如果您需要协助更新集成：

- **API 参考**：查看 [API 参考](../api-reference/overview.md) 获取当前端点文档
- **外部API**：查看 [外部API](../api-reference/external-apis.md) 获取详细的端点文档
- **迁移指南**：查看 [迁移指南](version_upgrade.md) 获取一般迁移信息
- **发布说明**：查看版本特定的 [发布说明](../release-notes/0.8.x.md) 获取更多上下文
- **支持**：在 [GitHub](https://github.com/wsj-br/duplistatus/issues) 上提交问题以获得支持
