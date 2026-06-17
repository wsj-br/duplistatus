# 审计日志保留 {#audit-log-retention}

配置审计日志在自动清理前保留的时间。

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Setting | Description | Default Value |
|:-------|:-----------|:-------------|
| **Retention (days)** | 自动删除前保留审计日志的天数 | **90 days** |

## 保留设置 {#retention-settings}

- **Range**：30 至 365 天
- **Automatic Cleanup**：每天 02:00 UTC 运行（不可配置）
- **Manual Cleanup**：管理员可通过 API 手动清理（参见 [Cleanup Audit Logs](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup)）
