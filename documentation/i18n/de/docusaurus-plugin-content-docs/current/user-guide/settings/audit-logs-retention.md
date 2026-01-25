# Audit Log Retention

Configure how long audit logs are retained before automatic cleanup.

![Audit Log Retention](/img/screen-settings-audit-retention.png)

| Setting                                 | Description                                                   | Default Value |
| :-------------------------------------- | :------------------------------------------------------------ | :------------ |
| **Retention (days)** | Number of days to retain audit logs before automatic deletion | `90 days`     |

## Retention Settings

- **Range**: 30 to 365 days
- **Automatic Cleanup**: Runs daily at 02:00 UTC (not configurable)
- **Manual Cleanup**: Available via API for administrators (see [Cleanup Audit Logs](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
