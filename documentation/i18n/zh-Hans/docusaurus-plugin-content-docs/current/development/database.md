# 数据库模式 {#database-schema}

本文档描述了 duplistatus 使用的 SQLite 数据库模式，以存储备份操作数据。

## 数据库位置 {#database-location}

数据库存储在应用程序数据目录中：
- **默认位置**: `/app/data/backups.db`
- **Docker 卷**: `duplistatus_data:/app/data`
- **文件名**: `backups.db`

## 数据库迁移系统 {#database-migration-system}

duplistatus 使用自动化迁移系统来处理不同版本之间的数据库模式更改。

### 迁移版本历史 {#migration-version-history}

以下是历史上的迁移版本，它们使数据库达到当前状态:

- **模式 v1.0** (应用程序 v0.6.x 及更早版本): 初始数据库模式，包含机器和备份表
- **模式 v2.0** (应用程序 v0.7.x): 添加缺失的列和配置表
- **模式 v3.0** (应用程序 v0.7.x): 将机器表重命名为服务器，添加服务器 URL 列
- **模式 v3.1** (应用程序 v0.8.x): 增强备份数据字段，添加服务器密码列
- **模式 v4.0** (应用程序 v0.9.x / v1.0.x): 添加用户访问控制（用户、会话、审计日志表）

当前应用程序版本（v1.3.x）使用 **模式 v4.0** 作为最新的数据库模式版本。

### 迁移过程 {#migration-process}

1. **自动备份**: 创建备份之前的迁移
2. **模式更新**: 更新数据库结构
3. **数据迁移**: 保留现有数据
4. **验证**: 确认成功迁移

## 表格 {#tables}

### 服务器表 {#servers-table}

存储有关被监控的 Duplicati 服务器的信息。

#### 字段 {#fields}

| 字段             | 类型             | 描述                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | 唯一的服务器标识符           |
| `name`            | TEXT NOT NULL    | 服务器名称来自 Duplicati         |
| `server_url`      | TEXT             | Duplicati 服务器 URL               |
| `alias`           | TEXT             | 用户定义的友好名称         |
| `note`            | TEXT             | 用户定义的备注/描述     |
| `server_password` | TEXT             | 服务器密码用于认证 |
| `created_at`      | DATETIME         | 服务器创建时间戳          |

### 备份表 {#backups-table}

存储从Duplicati服务器接收的备份操作数据。

#### 关键字段 {#key-fields}

| 字段              | 类型              | 描述                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | 唯一的备份标识符                       |
| `server_id`        | TEXT NOT NULL     | 引用服务器表                     |
| `backup_name`      | TEXT NOT NULL     | 备份作业名称                                |
| `backup_id`        | TEXT NOT NULL     | Duplicati的备份ID                       |
| `date`             | DATETIME NOT NULL | 备份执行时间                          |
| `status`           | TEXT NOT NULL     | 备份状态（成功，警告，错误，严重错误） |
| `duration_seconds` | INTEGER NOT NULL  | 持续时间（秒）                            |
| `size`             | INTEGER           | 源文件大小                           |
| `uploaded_size`    | INTEGER           | 已上传数据的大小                          |
| `examined_files`   | INTEGER           | 检查的文件数量                       |
| `warnings`         | INTEGER           | 警告数量                             |
| `errors`           | INTEGER           | 错误数量                               |
| `created_at`       | DATETIME          | 记录创建时间戳                      |

#### 消息数组（JSON 存储） {#message-arrays-json-storage}

| 字段               | 类型 | 描述                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | JSON 数组的日志消息              |
| `warnings_array`    | TEXT | JSON 数组的警告消息          |
| `errors_array`      | TEXT | JSON 数组的错误消息            |
| `available_backups` | TEXT | JSON 数组的可用备份版本 |

#### 文件操作字段 {#file-operation-fields}

| 字段                 | 类型    | 描述                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | 备份时检查的文件 |
| `opened_files`        | INTEGER | 备份时打开的文件      |
| `added_files`         | INTEGER | 添加到备份的新文件    |
| `modified_files`      | INTEGER | 备份时修改的文件     |
| `deleted_files`       | INTEGER | 从备份中删除的文件    |
| `deleted_folders`     | INTEGER | 从备份中删除的文件夹  |
| `added_folders`       | INTEGER | 添加到备份的文件夹      |
| `modified_folders`    | INTEGER | 备份时修改的文件夹   |
| `not_processed_files` | INTEGER | 未处理的文件          |
| `too_large_files`     | INTEGER | 太大而无法处理的文件   |
| `files_with_error`    | INTEGER | 出现错误的文件            |
| `added_symlinks`      | INTEGER | 添加的符号链接         |
| `modified_symlinks`   | INTEGER | 修改的符号链接      |
| `deleted_symlinks`    | INTEGER | 删除的符号链接       |

#### 文件大小字段 {#file-size-fields}

| 字段                    | 类型    | 描述                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | 备份期间检查的文件大小 |
| `size_of_opened_files`   | INTEGER | 打开用于备份的文件大小      |
| `size_of_added_files`    | INTEGER | 添加到备份的新文件大小    |
| `size_of_modified_files` | INTEGER | 备份期间修改的文件大小     |

#### 操作状态字段 {#operation-status-fields}

| 字段                    | 类型              | 描述                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | 解析的操作结果        |
| `main_operation`         | TEXT NOT NULL     | 主要操作类型            |
| `interrupted`            | BOOLEAN           | 是否中断备份         |
| `partial_backup`         | BOOLEAN           | 是否部分备份     |
| `dryrun`                 | BOOLEAN           | 是否为模拟运行   |
| `version`                | TEXT              | 使用的Duplicati版本         |
| `begin_time`             | DATETIME NOT NULL | 备份开始时间              |
| `end_time`               | DATETIME NOT NULL | 备份结束时间                |
| `warnings_actual_length` | INTEGER           | 实际警告数          |
| `errors_actual_length`   | INTEGER           | 实际错误数            |
| `messages_actual_length` | INTEGER           | 实际消息数          |

#### 后端统计信息字段 {#backend-statistics-fields}

| 字段                            | 类型     | 描述                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | 从目标下载的字节数 |
| `known_file_size`                | INTEGER  | 目标上的已知文件大小    |
| `last_backup_date`               | DATETIME | 上次备份日期                     |
| `backup_list_count`              | INTEGER  | 备份版本数量                     |
| `reported_quota_error`           | BOOLEAN  | 报告配额错误                     |
| `reported_quota_warning`         | BOOLEAN  | 报告配额警告                     |
| `backend_main_operation`         | TEXT     | 后端主操作                       |
| `backend_parsed_result`          | TEXT     | 后端解析结果                       |
| `backend_interrupted`            | BOOLEAN  | 后端操作中断                       |
| `backend_version`                | TEXT     | 后端版本                         |
| `backend_begin_time`             | DATETIME | 后端操作开始时间                   |
| `backend_duration`               | TEXT     | 后端操作持续时间                   |
| `backend_warnings_actual_length` | INTEGER  | 后端警告数量                     |
| `backend_errors_actual_length`   | INTEGER  | 后端错误数量                       |

### 配置表 {#configurations-table}

存储应用程序配置设置。

#### 字段 {#fields-1}

| 字段   | 类型                      | 描述                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | 配置键          |
| `value` | TEXT                      | 配置值 (JSON) |

#### 常见配置键 {#common-configuration-keys}

- `email_config`: 电子邮件通知设置
- `ntfy_config`: NTFY 通知设置
- `overdue_tolerance`: 逾期备份容忍度设置
- `notification_templates`: 通知消息模板
- `audit_retention_days`: 审计日志保留期 (默认: 90 天)

### 数据库版本表 {#database-version-table}

用于迁移目的的数据库模式版本跟踪。

#### 字段 {#fields-2}

| 字段        | 类型             | 描述                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | 数据库版本           |
| `applied_at` | DATETIME         | 何时应用迁移 |

### 用户表 {#users-table}

存储用户账户信息用于身份验证和访问控制。

#### 字段 {#fields-3}

| 字段                   | 类型                 | 描述                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | 唯一用户标识              |
| `username`              | TEXT UNIQUE NOT NULL | 登录用户名                  |
| `password_hash`         | TEXT NOT NULL        | Bcrypt 哈希密码              |
| `is_admin`              | BOOLEAN NOT NULL     | 用户是否具有管理员权限   |
| `must_change_password`  | BOOLEAN              | 是否需要更改密码 |
| `created_at`            | DATETIME             | 账户创建时间戳          |
| `updated_at`            | DATETIME             | 上次更新时间戳               |
| `last_login_at`         | DATETIME             | 上次成功登录时间戳     |
| `last_login_ip`         | TEXT                 | 上次登录的 IP 地址            |
| `failed_login_attempts` | INTEGER              | 登录失败尝试次数      |
| `locked_until`          | DATETIME             | 账户锁定过期时间（如果已锁定） |

### 会话表 {#sessions-table}

存储用户会话数据用于认证和安全。

#### 字段 {#fields-4}

| 字段             | 类型              | 描述                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | 会话标识符                                               |
| `user_id`         | TEXT              | 引用用户表（未认证会话可为空） |
| `created_at`      | DATETIME          | 会话创建时间戳                                       |
| `last_accessed`   | DATETIME          | 上次访问时间戳                                            |
| `expires_at`      | DATETIME NOT NULL | 会话过期时间戳                                     |
| `ip_address`      | TEXT              | 会话来源IP地址                                     |
| `user_agent`    | 文本                              | 用户代理字符串                                                 |
| `csrf_token`      | TEXT              | 会话的CSRF令牌                                       |
| `csrf_expires_at` | DATETIME          | CSRF令牌过期时间                                            |

### 审计日志表 {#audit-log-table}

存储用户操作和系统事件的审计跟踪。

#### 字段 {#fields-5}

| 字段           | 类型                              | 描述                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | 唯一审计日志条目标识符                                 |
| `timestamp`     | DATETIME                          | 事件时间戳                                                   |
| `user_id`       | TEXT                              | 引用用户表（可为空）                               |
| `username`      | TEXT                              | 操作时的用户名                                        |
| `action`        | TEXT NOT NULL                     | 执行的操作                                                  |
| `category`      | TEXT NOT NULL                     | 操作类别（例如，'认证'，'设置'，'备份'） |
| `target_type`   | 文本                              | 目标类型（例如，'服务器'，'备份'，'用户'）                 |
| `target_id`     | 文本                              | 目标标识符                                              |
| `details`       | 文本                              | 附加详细信息（JSON）                                         |
| `ip_address`    | 文本                              | 请求者的IP地址                                           |
| `user_agent`    | 文本                              | 用户代理字符串                                                 |
| `status`        | 文本 NOT NULL                     | 操作状态（'成功'，'失败'，'错误'）                  |
| `error_message` | 文本                              | 如果操作失败，显示错误消息                                    |

## 会话管理 {#session-management}

### 数据库支持的会话存储 {#database-backed-session-storage}

会话存储在数据库中，具有内存回退：
- **主存储**：数据库支持的会话表
- **回退**：内存存储（遗留支持或错误情况）
- **会话ID**：加密安全的随机字符串
- **过期**：可配置的会话超时
- **CSRF保护**：跨站点请求伪造保护
- **自动清理**：过期会话将自动删除

### 会话API端点 {#session-api-endpoints}

- `POST /api/session`：创建新会话
- `GET /api/session`：验证现有会话
- `DELETE /api/session`：销毁会话
- `GET /api/csrf`：获取CSRF令牌

## 索引 {#indexes}

数据库包括几个索引以实现最佳查询性能：

- **主键**：所有表都有主键索引
- **外键**：备份表中的服务器引用，会话和审计日志中的用户引用
- **查询优化**：频繁查询字段的索引
- **日期索引**：日期字段的索引，用于时间基于的查询
- **用户索引**：用户名索引，用于快速用户查找
- **会话索引**：过期和用户ID索引，用于会话管理
- **审计索引**：时间戳、用户ID、操作、类别和状态索引，用于审计查询

## 关系 {#relationships}

- **服务器 → 备份**：一对多关系
- **用户 → 会话**：一对多关系（会话可以在没有用户的情况下存在）
- **用户 → 审计日志**：一对多关系（审计条目可以在没有用户的情况下存在）
- **备份 → 消息**：嵌入式JSON数组
- **配置**：键值存储

## 数据类型 {#data-types}

- **TEXT**: 字符串数据，JSON 数组
- **INTEGER**: 数值数据，文件计数，大小
- **REAL**: 浮点数，持续时间
- **DATETIME**: 时间戳数据
- **BOOLEAN**: 真/假值

## 备份状态值 {#backup-status-values}

- **成功**: 备份完成成功
- **警告**: 备份完成时有警告
- **错误**: 备份完成时有错误
- **严重错误**: 备份失败

## 常见查询 {#common-queries}

### 获取服务器的最新备份 {#get-latest-backup-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### 获取服务器的所有备份 {#get-all-backups-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### 获取服务器摘要 {#get-server-summary}

```sql
SELECT 
  s.name,
  s.alias,
  COUNT(b.id) as backup_count,
  MAX(b.date) as last_backup,
  b.status as last_status
FROM servers s
LEFT JOIN backups b ON s.id = b.server_id
GROUP BY s.id;
```

### 获取总体摘要 {#get-overall-summary}

```sql
SELECT 
  COUNT(DISTINCT s.id) as total_servers,
  COUNT(b.id) as total_backups_runs,
  COUNT(DISTINCT s.id || ':' || b.backup_name) as total_backups,
  COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
  (
    SELECT COALESCE(SUM(b2.known_file_size), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_storage_used,
  (
    SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_backuped_size
FROM servers s
LEFT JOIN backups b ON b.server_id = s.id;
```

### 数据库清理 {#database-cleanup}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON 到数据库映射 {#json-to-database-mapping}

### API 请求体到数据库列映射 {#api-request-body-to-database-columns-mapping}

何时 Duplicati 通过 HTTP POST 发送备份数据，JSON 结构被映射到数据库列：

```json
{
  "Data": {
    "ExaminedFiles": 15399,           // → examined_files
    "OpenedFiles": 1861,              // → opened_files
    "AddedFiles": 1861,               // → added_files
    "SizeOfExaminedFiles": 11086692615, // → size_of_examined_files
    "SizeOfOpenedFiles": 13450481,    // → size_of_opened_files
    "SizeOfAddedFiles": 13450481,     // → size_of_added_files
    "SizeOfModifiedFiles": 0,         // → size_of_modified_files
    "ParsedResult": "Success",        // → status
    "BeginTime": "2025-04-21T23:45:46.9712217Z", // → begin_time and date
    "Duration": "00:00:51.3856057",   // → duration_seconds (calculated)
    "WarningsActualLength": 0,        // → warnings_actual_length
    "ErrorsActualLength": 0           // → errors_actual_length
  },
  "Extra": {
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", // → server_id
    "machine-name": "WSJ-SER5",       // → server name
    "backup-name": "WSJ-SER5 Local files", // → backup_name
    "backup-id": "DB-2"               // → backup_id
  }
}
```

**注释**: 备份表中的 `size` 字段存储 `SizeOfExaminedFiles`，而 `uploaded_size` 存储实际上传/传输的大小从备份操作。
