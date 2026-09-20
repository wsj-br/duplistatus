# 审计日志保留 {/* #audit-log-retention */}

配置审计日志在自动清理前保留多长时间。

![审计日志保留](../../assets/screen-settings-audit-retention.png)

| 设置 | 说明 | 默认值 |
|:-------|:-----------|:-------------|
| **保留时间（天）** | 审计日志保留的天数，超过此天数后自动删除 | **90 天** |

## 保留设置 {/* #retention-settings */}

- **范围**：30 至 365 天
- **自动清理**：每天 02:00 UTC 运行（不可配置）
- **手动清理**：管理员可通过 API 使用（参见 [清理审计日志](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup)）
