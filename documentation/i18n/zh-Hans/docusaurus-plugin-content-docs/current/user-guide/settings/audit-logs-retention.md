# 审计日志保留期 {#audit-log-retention}

配置审计日志在自动清理之前保留的时间长度。

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| 设置 | 描述 | 默认值 |
|:-------|:-----------|:-------------|
| **保留期（天）** | 审计日志在自动删除之前保留的天数 | **90 天** |

## 保留设置 {#retention-settings}

- **范围**：30 至 365 天
- **自动清理**：每天 02:00 UTC 运行（不可配置）
- **手动清理**：管理员可通过 API 进行（参见 [清理审计日志](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
