# 数据库模式 {/* #database-schema */}

本文档描述了 duplistatus 用于存储备份操作数据的 SQLite 数据库模式。

## 数据库位置 {/* #database-location */}

数据库存储在应用程序数据目录中：
- **默认位置**：`/app/data/backups.db`
- **Docker 卷**：`duplistatus_data:/app/data`
- **文件名**：`backups.db`

## 数据库迁移系统 {/* #database-migration-system */}

duplistatus 使用自动迁移系统来处理版本之间的数据库模式更改。

### 迁移版本历史 {/* #migration-version-history */}

以下是将数据库带到当前状态的历史迁移版本：

- **模式 v1.0**（应用程序 v0.6.x 及更早版本）：初始数据库模式，包含 machines 和 backups 表
- **模式 v2.0**（应用程序 v0.7.x）：添加缺失列和配置表
- **模式 v3.0**（应用程序 v0.7.x）：将 machines 表重命名为 servers，添加 server_url 列
- **模式 v3.1**（应用程序 v0.8.x）：增强备份数据字段，添加 server_password 列
- **模式 v4.0**（应用程序 v0.9.x / v1.0.x）：添加用户访问控制（users、sessions、audit_log 表）
- **模式 v4.1**（应用程序 v1.5.x）：添加 `api_keys` 和可选 API 密钥身份验证、IP 白名单和上传限制的默认配置键
- **模式 v4.2**（应用程序 v1.5.x）：添加 `daily_summary_deliveries` 分类账和可选每日摘要通知的默认 `daily_summary` 配置

当前应用程序版本（v1.5.x）使用 **模式 v4.2** 作为最新数据库模式版本。

### 迁移过程 {/* #migration-process */}

1. **自动备份**：迁移前创建备份
2. **模式更新**：更新数据库结构
3. **数据迁移**：保留现有数据
4. **验证**：确认迁移成功

## 表 {/* #tables */}

### 服务器表 {/* #servers-table */}

存储有关正在监控的 Duplicati 服务器的信息。

#### 字段 {/* #fields */}

| 字段              | 类型             | 描述                               |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | 唯一服务器标识符                   |
| `name`            | TEXT NOT NULL    | 来自 Duplicati 的服务器名称        |
| `server_url`      | TEXT             | Duplicati 服务器 URL               |
| `alias`           | TEXT             | 用户定义的友好名称         |
| `note`            | TEXT             | 用户定义的备注/描述     |
| `server_password` | TEXT             | 服务器身份验证密码 |
| `created_at`      | DATETIME         | 服务器创建时间戳          |

### 备份表 {/* #backups-table */}

存储从 duplicati 服务器接收的备份操作数据。

#### 关键字段 {/* #key-fields */}

| 字段              | 类型              | 描述                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | 唯一备份标识符                       |
| `server_id`        | TEXT NOT NULL     | 引用服务器表                     |
| `backup_name`      | TEXT NOT NULL     | 备份作业名称                                |
| `backup_id`        | TEXT NOT NULL     | 来自 duplicati 的备份 ID                       |
| `date`             | DATETIME NOT NULL | 备份执行时间                          |
| `status`           | TEXT NOT NULL     | 备份状态（成功、警告、错误、致命） |
| `duration_seconds` | INTEGER NOT NULL  | 持续时间（秒）                            |
| `size`             | INTEGER           | 源文件大小                           |
| `uploaded_size`    | INTEGER           | 上传数据大小                          |
| `examined_files`   | INTEGER           | 检查的文件数量                       |
| `warnings`         | INTEGER           | 警告数量                             |
| `errors`           | INTEGER           | 错误数量                               |
| `created_at`       | DATETIME          | 记录创建时间戳                      |

#### 消息数组（JSON 存储）{/* #message-arrays-json-storage */}

| 字段                | 类型 | 描述                                  |
|---------------------|------|---------------------------------------|
| `messages_array`    | TEXT | 日志消息的 JSON 数组                  |
| `warnings_array`    | TEXT | 警告消息的 JSON 数组                  |
| `errors_array`      | TEXT | 错误消息的 JSON 数组                  |
| `available_backups` | TEXT | 可用备份版本的 JSON 数组              |

#### 文件操作字段 {/* #file-operation-fields */}

| 字段                  | 类型    | 描述                     |
|-----------------------|---------|--------------------------|
| `examined_files`      | INTEGER | 备份期间检查的文件数量   |
| `opened_files`        | INTEGER | 为备份打开的文件数量     |
| `added_files`         | INTEGER | 添加到备份的新文件数量   |
| `modified_files`      | INTEGER | 备份中修改的文件数量     |
| `deleted_files`       | INTEGER | 从备份中删除的文件数量   |
| `deleted_folders`     | INTEGER | 从备份中删除的文件夹数量 |
| `added_folders`       | INTEGER | 添加到备份的文件夹数量   |
| `modified_folders`    | INTEGER | 备份中修改的文件夹数量   |
| `not_processed_files` | INTEGER | 未处理的文件数量         |
| `too_large_files`     | INTEGER | 过大而无法处理的文件数量 |
| `files_with_error`    | INTEGER | 出错的文件数量           |
| `added_symlinks`      | INTEGER | 添加的符号链接数量       |
| `modified_symlinks`   | INTEGER | 修改的符号链接数量       |
| `deleted_symlinks`    | INTEGER | 删除的符号链接数量       |

#### 文件大小字段 {/* #file-size-fields */}

| 字段                    | 类型    | 描述                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | 整数 | 备份期间检查的文件大小 |
| `size_of_opened_files`   | 整数 | 为备份打开的文件大小      |
| `size_of_added_files`    | 整数 | 添加到备份的新文件大小    |
| `size_of_modified_files` | 整数 | 备份中修改的文件大小     |

#### 操作状态字段 {/* #operation-status-fields */}

| 字段                    | 类型              | 描述                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | 文本（非空）     | 解析的操作结果        |
| `main_operation`         | 文本（非空）     | 主要操作类型            |
| `interrupted`            | 布尔值           | 备份是否被中断 |
| `partial_backup`         | 布尔值           | 备份是否为部分备份     |
| `dryrun`                 | 布尔值           | 备份是否为试运行   |
| `version`                | 文本              | 使用的 duplicati 版本         |
| `begin_time`             | 日期时间（非空） | 备份开始时间              |
| `end_time`               | 日期时间（非空） | 备份结束时间                |
| `warnings_actual_length` | 整数           | 实际警告数量          |
| `errors_actual_length`   | 整数           | 实际错误数量            |
| `messages_actual_length` | 整数           | 实际消息数量          |

#### 后端统计字段 {/* #backend-statistics-fields */}

| 字段                            | 类型     | 描述                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | 整数  | 从目标位置下载的字节数 |
| `known_file_size`                | 整数  | 目标位置上的已知文件大小    |
| `last_backup_date`               | DATETIME | 目标位置的最后备份日期   |
| `backup_list_count`              | INTEGER  | 备份版本数量         |
| `reported_quota_error`           | BOOLEAN  | 已报告配额错误              |
| `reported_quota_warning`         | BOOLEAN  | 已报告配额警告            |
| `backend_main_operation`         | TEXT     | 后端主要操作            |
| `backend_parsed_result`          | TEXT     | 后端解析结果             |
| `backend_interrupted`            | BOOLEAN  | 后端操作已中断     |
| `backend_version`                | TEXT     | 后端版本                   |
| `backend_begin_time`             | DATETIME | 后端操作开始时间      |
| `backend_duration`               | TEXT     | 后端操作持续时间        |
| `backend_warnings_actual_length` | INTEGER  | 后端警告计数            |
| `backend_errors_actual_length`   | INTEGER  | 后端错误计数              |

### 配置表 {/* #configurations-table */}

存储应用程序配置设置。

#### 字段 {/* #fields-1 */}

| 字段   | 类型                      | 描述                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | 配置键          |
| `value` | TEXT                      | 配置值 (JSON) |

#### 常见配置键 {/* #common-configuration-keys */}

- `email_config`: 电子邮件通知设置
- `ntfy_config`: NTFY 通知设置
- `overdue_tolerance`: 过期备份容忍度设置
- `notification_templates`: 通知消息模板
- `daily_summary`: 每日摘要模式、计划、时区、可选的公共仪表板 URL，以及可选的 SMTP 收件人覆盖（`smtpRecipient`；空值使用电子邮件设置）
- `cron_service`: Cron 任务计划，包括 `daily-summary-dispatch`（`minute hour * * *` 来自 `daily_summary.utcTime`）
- `audit_retention_days`: 审计日志保留期限（默认：90 天）

### 数据库版本表 {/* #database-version-table */}

跟踪数据库模式版本以用于迁移目的。

#### 字段 {/* #fields-2 */}

| 字段         | 类型             | 描述                       |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | 数据库版本                 |
| `applied_at` | DATETIME         | 迁移应用的时间             |

### 用户表 {/* #users-table */}

存储用户账户信息以用于身份验证和访问控制。

#### 字段 {/* #fields-3 */}

| 字段                      | 类型                 | 描述                              |
|---------------------------|----------------------|-----------------------------------|
| `id`                    | TEXT PRIMARY KEY     | 唯一用户标识符                    |
| `username`              | TEXT UNIQUE NOT NULL | 登录用户名                        |
| `password_hash`         | TEXT NOT NULL        | Bcrypt 哈希密码                   |
| `is_admin`              | BOOLEAN NOT NULL     | 用户是否具有管理员权限            |
| `must_change_password`  | BOOLEAN              | 是否需要更改密码                  |
| `created_at`            | DATETIME             | 账户创建时间戳                    |
| `updated_at`       | DATETIME         | 最后更新时间戳                                                           |
| `last_login_at`         | DATETIME             | 最后成功登录时间戳                |
| `last_login_ip`         | TEXT                 | 最后登录的 IP 地址                |
| `failed_login_attempts` | INTEGER              | 登录失败尝试次数                  |
| `locked_until`          | DATETIME             | 账户锁定过期时间（如果被锁定）    |

### 会话表 {/* #sessions-table */}

存储用户会话数据以进行身份验证和安全控制。

#### 字段 {/* #fields-4 */}

| 字段              | 类型              | 描述                                                               |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | 会话标识符                                                         |
| `user_id`         | TEXT              | 引用用户表（未认证会话可为空）                                       |
| `created_at`      | DATETIME          | 会话创建时间戳                                                     |
| `last_accessed`   | DATETIME          | 最后访问时间戳                                                     |
| `expires_at`      | DATETIME NOT NULL | 会话过期时间戳                                                     |
| `ip_address`      | TEXT              | 会话来源的 IP 地址                                                 |
| `user_agent`    | TEXT                              | 用户代理字符串                                                 |
| `csrf_token`      | TEXT              | 会话的 CSRF 令牌                                                   |
| `csrf_expires_at` | DATETIME          | CSRF 令牌过期时间                                                  |

### 审计日志表 {/* #audit-log-table */}

存储用户操作和系统事件的审计轨迹。

#### 字段 {/* #fields-5 */}

| 字段            | 类型                                | 描述                                                                |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | 唯一审计日志条目标识符                                              |
| `timestamp`     | DATETIME                          | 事件时间戳                                                          |
| `user_id`       | TEXT                              | 引用用户表（可为空）                                                |
| `username`      | TEXT                              | 操作时的用户名                                                      |
| `action`        | TEXT NOT NULL                     | 执行的操作                                                          |
| `category`      | TEXT NOT NULL                     | 操作类别（例如 'authentication'、'settings'、'backup'）             |
| `target_type`   | TEXT                              | 目标类型（例如 'server'、'backup'、'user'）                 |
| `target_id`     | TEXT                              | 目标标识符                                              |
| `details`       | TEXT                              | 额外详情（JSON）                                         |
| `ip_address`    | TEXT                              | 请求者的 IP 地址                                           |
| `user_agent`    | TEXT                              | 用户代理字符串                                                 |
| `status`        | TEXT NOT NULL                     | 操作状态（'success'、'failure'、'error'）                  |
| `error_message` | TEXT                              | 操作失败时的错误消息                                    |

### API 密钥表 {/* #api-keys-table */}

存储外部 HTTP API 的哈希 API 密钥。明文密钥仅在创建时显示一次，不会被存储。

#### 字段 {/* #fields-6 */}

| 字段          | 类型             | 描述                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | 唯一密钥标识符                                    |
| `name`         | TEXT NOT NULL    | 显示名称                                             |
| `key_hash`     | TEXT UNIQUE      | 密钥的 SHA-256 哈希                               |
| `key_prefix`   | TEXT             | 密钥的前四个字符（用于指纹识别）   |
| `key_suffix`   | TEXT             | 密钥的后四个字符（用于指纹识别）    |
| `scope`        | TEXT NOT NULL    | `upload` 或 `read`                                       |
| `description`  | TEXT             | 可选描述                                     |
| `enabled`      | INTEGER          | 密钥激活时为 `1`                               |
| `created_at`   | DATETIME         | 创建时间戳                                       |
| `created_by`   | TEXT             | 创建密钥的管理员的用户 ID         |
| `expires_at`   | DATETIME         | 可选过期时间                                          |
| `last_used_at` | DATETIME         | 上次成功使用时间                                      |
| `usage_count`  | INTEGER          | 成功使用次数                                     |

相关配置键在 `configurations` 表中：`external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`。

### 每日摘要发送表 {/* #daily-summary-deliveries-table */}

用于每日摘要邮件发送的每通道分类账。旧版本行可能包含早期版本中的 `ntfy` 通道。每个计划执行（或唯一的手动发送）每个通道最多有一行。发送前存储渲染后的有效载荷，以便重试时保持相同的快照。超过30天的行将被清理。

如果进程在提供商接受消息后但在记录成功之前终止，则该通道可能会重试（至少一次）。

#### 字段 {/* #fields-7 */}

| 字段              | 类型             | 描述                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | 唯一发送标识符                                                  |
| `occurrence_key`   | TEXT NOT NULL    | 计划密钥 `scheduled:UTC:{date}:{HH:mm}` 或 `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` 或 `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, 或 `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | 快照的本地日历日期                                        |
| `time_zone`        | TEXT NOT NULL    | 已保存的IANA时区                                                         |
| `payload_json`     | TEXT             | 渲染后的主题、HTML、文本和NTFY字段                               |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, 或 `failed`                                   |
| `attempt_count`    | INTEGER          | 发送尝试次数                                                           |
| `next_retry_at`    | DATETIME         | 失败通道可再次被认领的时间                                  |
| `lease_expires_at` | DATETIME         | 认领租约；可以回收陈旧的租约                                 |
| `error`            | TEXT             | 最后错误（如果有）                                                          |
| `created_at`       | DATETIME         | 行创建时间戳                                                              |
| `updated_at`       | DATETIME         | 最后更新时间戳                                                           |
| `sent_at`          | DATETIME         | 成功时间戳                                                           |

`(occurrence_key, channel)` 上的唯一索引可防止在同一通道上重复发送相同的事件。

## 会话管理 {/* #session-management */}

### 数据库支持的会话存储 {/* #database-backed-session-storage */}

会话存储在数据库中，具有内存回退：
- **主存储**：数据库支持的会话表
- **回退**：内存存储（旧版支持或错误情况）
- **会话 ID**：加密安全的随机字符串
- **过期**：可配置的会话超时
- **CSRF 保护**：跨站请求伪造保护
- **自动清理**：过期会话会自动删除

### 会话 API 端点 {/* #session-api-endpoints */}

- `POST /api/session`：创建新会话
- `GET /api/session`：验证现有会话
- `DELETE /api/session`：销毁会话
- `GET /api/csrf`：获取 CSRF 令牌

## 索引 {/* #indexes */}

数据库包含多个索引以实现最佳查询性能：

- **主键**：所有表都有主键索引
- **外键**：备份表中的服务器引用、会话和审计日志中的用户引用
- **查询优化**：经常查询字段上的索引
- **日期索引**：日期字段上的索引用于基于时间的查询
- **用户索引**：用户名索引用于快速用户查找
- **会话索引**：过期和 user_id 索引用于会话管理
- **审计索引**：时间戳、user_id、操作、类别和状态索引用于审计查询
- **API 密钥索引**：唯一哈希，以及用于身份验证的启用/范围查找

## 关系 {/* #relationships */}

- **服务器 → 备份**：一对多关系
- **用户 → 会话**：一对多关系（会话可以在没有用户的情况下存在）
- **用户 → 审计日志**：一对多关系（审计条目可以在没有用户的情况下存在）
- **用户 → API 密钥**：通过 `created_by` 的一对多关系（用户删除后密钥仍然保留）
- **备份 → 消息**：嵌入式 JSON 数组
- **配置**：键值存储

## 数据类型 {/* #data-types */}

- **TEXT**：字符串数据、JSON 数组
- **INTEGER**：数值数据、文件计数、大小
- **REAL**：浮点数、持续时间
- **DATETIME**：时间戳数据
- **BOOLEAN**：真/假值

## 备份状态值 {/* #backup-status-values */}

- **Success**：备份成功完成
- **Warning**：备份完成但有警告
- **Error**：备份完成但有错误
- **Fatal**：备份致命失败

## 常见查询 {/* #common-queries */}

### 获取服务器的最新备份 {/* #get-latest-backup-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### 获取服务器的所有备份 {/* #get-all-backups-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### 获取服务器摘要 {/* #get-server-summary */}

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

### 获取总体摘要 {/* #get-overall-summary */}

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

### 数据库清理 {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON 到数据库映射 {/* #json-to-database-mapping */}

### API 请求体到数据库列映射 {/* #api-request-body-to-database-columns-mapping */}

当 duplicati 通过 HTTP POST 发送备份数据时，JSON 结构被映射到数据库列：

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

**注意**：备份表中的 `size` 字段存储 `SizeOfExaminedFiles`，`uploaded_size` 存储备份操作中实际上传/传输的大小。
