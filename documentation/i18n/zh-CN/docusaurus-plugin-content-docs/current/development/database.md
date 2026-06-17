

# 数据库架构 {#database-schema}

本文档描述 duplistatus 用于存储备份操作数据的 SQLite 数据库架构。

## 数据库位置 {#database-location}

数据库存储在应用程序数据目录中：
- **默认位置**：`/app/data/backups.db`
- **Docker 卷**：`duplistatus_data:/app/data`
- **文件名**：`backups.db`

## 数据库迁移系统 {#database-migration-system}

duplistatus 使用自动迁移系统处理版本间的数据库架构变更。

### 迁移版本历史 {#migration-version-history}

以下是使数据库达到当前状态的历史迁移版本：

- **架构 v1.0**（应用程序 v0.6.x 及更早）：初始数据库架构，包含 machines 和 backups 表
- **架构 v2.0**（应用程序 v0.7.x）：添加缺失列和 configurations 表
- **架构 v3.0**（应用程序 v0.7.x）：将 machines 表重命名为 servers，添加 server_url 列
- **架构 v3.1**（应用程序 v0.8.x）：增强备份数据字段，添加 server_password 列
- **架构 v4.0**（应用程序 v0.9.x / v1.0.x）：添加用户访问控制（users、sessions、audit_log 表）

当前应用程序版本（v1.3.x）使用 **架构 v4.0** 作为最新数据库架构版本。

### 迁移过程 {#migration-process}

1. **自动备份**：迁移前创建备份
2. **架构更新**：更新数据库结构
3. **数据迁移**：保留现有数据
4. **验证**：确认迁移成功

## 表 {#tables}

### Servers 表 {#servers-table}

存储被监控的 Duplicati 服务器信息。

#### 字段 {#fields}

| 字段             | 类型             | 描述                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | 唯一服务器标识符           |
| `name`            | TEXT NOT NULL    | 来自 Duplicati 的服务器名称         |
| `server_url`      | TEXT             | Duplicati 服务器 URL               |
| `alias`           | TEXT             | 用户定义的友好名称         |
| `note`            | TEXT             | 用户定义的备注/描述     |
| `server_password` | TEXT             | 用于认证的服务器密码 |
| `created_at`      | DATETIME         | 服务器创建时间戳          |

### Backups 表 {#backups-table}

存储从 Duplicati 服务器接收的备份操作数据。

#### 关键字段 {#key-fields}

| 字段              | 类型              | 描述                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | 唯一备份标识符                       |
| `server_id`        | TEXT NOT NULL     | 引用 servers 表                     |
| `backup_name`      | TEXT NOT NULL     | 备份任务名称                                |
| `backup_id`        | TEXT NOT NULL     | 来自 Duplicati 的备份 ID                       |
| `date`             | DATETIME NOT NULL | 备份执行时间                          |
| `status`           | TEXT NOT NULL     | 备份状态 (Success, Warning, Error, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | 持续时间（秒）                            |
| `size`             | INTEGER           | 源文件大小                           |
| `uploaded_size`    | INTEGER           | 上传数据大小                          |
| `examined_files`   | INTEGER           | 检查的文件数量                       |
| `warnings`         | INTEGER           | 警告数量                             |
| `errors`           | INTEGER           | 错误数量                               |
| `created_at`       | DATETIME          | 记录创建时间戳                      |

#### 消息数组（JSON 存储） {#message-arrays-json-storage}

| 字段               | 类型 | 描述                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | JSON 格式的日志消息数组              |
| `warnings_array`    | TEXT | JSON 格式的警告消息数组          |
| `errors_array`      | TEXT | JSON 格式的错误消息数组            |
| `available_backups` | TEXT | JSON 格式的可用备份版本数组 |

#### 文件操作字段 {#file-operation-fields}

| 字段                 | 类型    | 描述                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | 备份期间检查的文件 |
| `opened_files`        | INTEGER | 为备份打开的文件      |
| `added_files`         | INTEGER | 添加到备份的新文件    |
| `modified_files`      | INTEGER | 备份中修改的文件     |
| `deleted_files`       | INTEGER | 从备份中删除的文件       |
| `deleted_folders`     | INTEGER | 从备份中删除的文件夹     |
| `added_folders`       | INTEGER | 添加到备份的文件夹      |
| `modified_folders`    | INTEGER | 备份中修改的文件夹    |
| `not_processed_files` | INTEGER | 未处理的文件          |
| `too_large_files`     | INTEGER | 过大无法处理的文件   |
| `files_with_error`    | INTEGER | 有错误的文件            |
| `added_symlinks`      | INTEGER | 添加的符号链接         |
| `modified_symlinks`   | INTEGER | 修改的符号链接      |
| `deleted_symlinks`    | INTEGER | 删除的符号链接      |

#### 文件大小字段 {#file-size-fields}

| 字段                    | 类型    | 描述                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | 备份期间检查的文件大小 |
| `size_of_opened_files`   | INTEGER | 为备份打开的文件大小      |
| `size_of_added_files`    | INTEGER | 添加到备份的新文件大小    |
| `size_of_modified_files` | INTEGER | 备份中修改的文件大小     |

#### 操作状态字段 {#operation-status-fields}

| 字段                    | 类型              | 描述                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | 解析的操作结果        |
| `main_operation`         | TEXT NOT NULL     | 主要操作类型            |
| `interrupted`            | BOOLEAN           | 备份是否被中断 |
| `partial_backup`         | BOOLEAN           | 备份是否为部分备份     |
| `dryrun`                 | BOOLEAN           | 备份是否为试运行   |
| `version`                | TEXT              | 使用的 Duplicati 版本         |
| `begin_time`             | DATETIME NOT NULL | 备份开始时间              |
| `end_time`               | DATETIME NOT NULL | 备份结束时间                |
| `warnings_actual_length` | INTEGER           | 实际警告数量          |
| `errors_actual_length`   | INTEGER           | 实际错误数量            |
| `messages_actual_length` | INTEGER           | 实际消息数量          |

#### 后端统计字段 {#backend-statistics-fields}

| 字段                            | 类型     | 描述                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | 从目标下载的字节数 |
| `known_file_size`                | INTEGER  | 目标上的已知文件大小    |
| `last_backup_date`               | DATETIME | 目标上的最后备份日期   |
| `backup_list_count`              | INTEGER  | 备份版本数量         |
| `reported_quota_error`           | BOOLEAN  | 报告的配额错误              |
| `reported_quota_warning`         | BOOLEAN  | 报告的配额警告            |
| `backend_main_operation`         | TEXT     | 后端主要操作            |
| `backend_parsed_result`          | TEXT     | 后端解析结果             |
| `backend_interrupted`            | BOOLEAN  | 后端操作是否中断     |
| `backend_version`                | TEXT     | 后端版本                   |
| `backend_begin_time`             | DATETIME | 后端操作开始时间      |
| `backend_duration`               | TEXT     | 后端操作持续时间        |
| `backend_warnings_actual_length` | INTEGER  | 后端警告数量            |
| `backend_errors_actual_length`   | INTEGER  | 后端错误数量              |

### Configurations 表 {#configurations-table}

存储应用程序配置设置。

#### 字段 {#fields-1}

| 字段   | 类型                      | 描述                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | 配置键          |
| `value` | TEXT                      | 配置值 (JSON) |

#### 常见配置键 {#common-configuration-keys}

- `email_config`：邮件通知设置
- `ntfy_config`：NTFY 通知设置
- `overdue_tolerance`：逾期备份容差设置
- `notification_templates`：通知消息模板
- `audit_retention_days`：审计日志保留期（默认：90 天）

### Database Version 表 {#database-version-table}

跟踪数据库架构版本，用于迁移。

#### 字段 {#fields-2}

| 字段        | 类型             | 描述                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | 数据库版本           |
| `applied_at` | DATETIME         | 迁移应用时间 |

### Users 表 {#users-table}

存储用户账户信息，用于认证和访问控制。

#### 字段 {#fields-3}

| 字段                   | 类型                 | 描述                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | 唯一用户标识符              |
| `username`              | TEXT UNIQUE NOT NULL | 登录用户名                  |
| `password_hash`         | TEXT NOT NULL        | Bcrypt 哈希密码              |
| `is_admin`              | BOOLEAN NOT NULL     | 用户是否具有管理员权限   |
| `must_change_password`  | BOOLEAN              | 是否需要更改密码 |
| `created_at`            | DATETIME             | 账户创建时间戳          |
| `updated_at`            | DATETIME             | 最后更新时间戳               |
| `last_login_at`         | DATETIME             | 最后成功登录时间戳     |
| `last_login_ip`         | TEXT                 | 最后登录 IP 地址            |
| `failed_login_attempts` | INTEGER              | 失败登录尝试次数      |
| `locked_until`          | DATETIME             | 账户锁定到期时间（若已锁定） |

### Sessions 表 {#sessions-table}

存储用户会话数据，用于认证和安全。

#### 字段 {#fields-4}

| 字段             | 类型              | 描述                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | 会话标识符                                               |
| `user_id`         | TEXT              | 引用 users 表（未认证会话可为空） |
| `created_at`      | DATETIME          | 会话创建时间戳                                       |
| `last_accessed`   | DATETIME          | 最后访问时间戳                                            |
| `expires_at`      | DATETIME NOT NULL | 会话过期时间戳                                     |
| `ip_address`      | TEXT              | 会话来源 IP 地址                                     |
| `user_agent`      | TEXT              | User agent 字符串                                                |
| `csrf_token`      | TEXT              | 会话的 CSRF 令牌                                       |
| `csrf_expires_at` | DATETIME          | CSRF 令牌过期                                            |

### Audit Log 表 {#audit-log-table}

存储用户操作和系统事件的审计跟踪。

#### 字段 {#fields-5}

| 字段           | 类型                              | 描述                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | 唯一审计日志条目标识符                                 |
| `timestamp`     | DATETIME                          | 事件时间戳                                                   |
| `user_id`       | TEXT                              | 引用 users 表（可为空）                               |
| `username`      | TEXT                              | 操作时的用户名                                        |
| `action`        | TEXT NOT NULL                     | 执行的操作                                                  |
| `category`      | TEXT NOT NULL                     | 操作类别（例如 'authentication'、'settings'、'backup'） |
| `target_type`   | TEXT                              | 目标类型（例如 'server'、'backup'、'user'）                 |
| `target_id`     | TEXT                              | 目标标识符                                              |
| `details`       | TEXT                              | 附加详情 (JSON)                                         |
| `ip_address`    | TEXT                              | 请求者 IP 地址                                           |
| `user_agent`    | TEXT                              | User agent 字符串                                                 |
| `status`        | TEXT NOT NULL                     | 操作状态 ('success'、'failure'、'error')                  |
| `error_message` | TEXT                              | 操作失败时的错误消息                                    |

## 会话管理 {#session-management}

### 数据库支持的会话存储 {#database-backed-session-storage}

会话存储在数据库中，内存作为回退：
- **主要存储**：数据库支持的 sessions 表
- **回退**：内存存储（旧版支持或错误情况）
- **会话 ID**：加密安全的随机字符串
- **过期**：可配置的会话超时
- **CSRF 保护**：跨站请求伪造保护
- **自动清理**：自动移除过期会话

### 会话 API 端点 {#session-api-endpoints}

- `POST /api/session`：创建新会话
- `GET /api/session`：验证现有会话
- `DELETE /api/session`：销毁会话
- `GET /api/csrf`：获取 CSRF 令牌

## 索引 {#indexes}

数据库包含多个索引以优化查询性能：

- **主键**：所有表都有主键索引
- **外键**：backups 表中的服务器引用，sessions 和 audit_log 中的用户引用
- **查询优化**：频繁查询字段上的索引
- **日期索引**：日期字段上的索引，用于基于时间的查询
- **用户索引**：用户名索引，用于快速用户查找
- **会话索引**：过期时间和 user_id 索引，用于会话管理
- **审计索引**：timestamp、user_id、action、category 和 status 索引，用于审计查询

## 关系 {#relationships}

- **Servers → Backups**：一对多关系
- **Users → Sessions**：一对多关系（会话可以没有用户）
- **Users → Audit Log**：一对多关系（审计条目可以没有用户）
- **Backups → Messages**：嵌入式 JSON 数组
- **Configurations**：键值存储

## 数据类型 {#data-types}

- **TEXT**：字符串数据、JSON 数组
- **INTEGER**：数值数据、文件计数、大小
- **REAL**：浮点数、持续时间
- **DATETIME**：时间戳数据
- **BOOLEAN**：真/假值

## 备份状态值 {#backup-status-values}

- **Success**：备份成功完成
- **Warning**：备份完成但有警告
- **Error**：备份完成但有错误
- **Fatal**：备份致命失败

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

当 Duplicati 通过 HTTP POST 发送备份数据时，JSON 结构映射到数据库列：

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

**注意**：backups 表中的 `size` 字段存储 `SizeOfExaminedFiles`，`uploaded_size` 存储备份操作中实际上传/传输的大小。
