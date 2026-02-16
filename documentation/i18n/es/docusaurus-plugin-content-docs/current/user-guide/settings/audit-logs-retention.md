---
translation_last_updated: '2026-02-16T02:21:41.577Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: f21e4b84808c8bcb
translation_language: es
source_file_path: user-guide/settings/audit-logs-retention.md
---
# Retención del log de auditoría {#audit-log-retention}

Configurar cuánto tiempo se retienen los logs de auditoría antes de la limpieza automática.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Configuración | Descripción | Valor por defecto |
|:-------|:-----------|:-------------|
| **Retención (días)** | Número de días para retener logs de auditoría antes de la eliminación automática | **90 días** |

## Configuración de Retención {#retention-settings}

- **Rango**: 30 a 365 días
- **Limpieza automática**: Se ejecuta diariamente a las 02:00 UTC (no configurable)
- **Limpieza manual**: Disponible a través de API para administradores (consulte [Cleanup Audit Logs](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
