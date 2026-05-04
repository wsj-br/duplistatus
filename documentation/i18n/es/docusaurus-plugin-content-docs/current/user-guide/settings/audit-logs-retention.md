---
translation_last_updated: '2026-04-18T00:01:56.475Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: aa2aee4865635902ba009cc73f39b48515884d5bc15c131a8e1fddf38c78e479
translation_language: es
source_file_path: documentation/docs/user-guide/settings/audit-logs-retention.md
translation_models:
  - anthropic/claude-haiku-4.5
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
