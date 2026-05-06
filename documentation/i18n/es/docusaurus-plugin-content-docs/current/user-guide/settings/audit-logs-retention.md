---
translation_last_updated: '2026-05-06T23:21:20.165Z'
source_file_mtime: '2026-05-06T23:18:51.442Z'
source_file_hash: e3e4bfa89172763e996fda191dad072d6156ecad610292ea1c564e416018e41e
translation_language: es
source_file_path: documentation/docs/user-guide/settings/audit-logs-retention.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Retención del log de auditoría {#audit-log-retention}

Configurar cuánto tiempo se retienen los logs de auditoría antes de la limpieza automática.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Configuración | Descripción | Valor por defecto |
|:-------|:-----------|:-------------|
| **Retención (días)** | Número de días para retener logs de auditoría antes de la eliminación automática | **90 días** |

## Configuración de Retención {#retention-settings}

- **Rango**: de 30 a 365 días
- **Limpieza automática**: Se ejecuta diariamente a las 02:00 UTC (no configurable)
- **Limpieza manual**: Disponible mediante API para administradores (ver [Limpiar registros de auditoría](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
