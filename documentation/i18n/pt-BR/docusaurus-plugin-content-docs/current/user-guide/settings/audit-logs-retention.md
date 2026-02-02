---
translation_last_updated: '2026-01-31T00:51:30.936Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 94eead26e2126982
translation_language: pt-BR
source_file_path: user-guide/settings/audit-logs-retention.md
---
# Retenção de log de auditoria {#audit-log-retention}

Configurar por quanto tempo os logs de auditoria são retidos antes da limpeza automática.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Setting | Descrição | Valor Padrão |
|:-------|:-----------|:-------------|
| **Retenção (dias)** | Número de dias para reter logs de auditoria antes da exclusão automática | `90 dias` |

## Configurações de Retenção {#retention-settings}

- **Intervalo**: 30 a 365 dias
- **Limpeza Automática**: Executada diariamente às 02:00 UTC (não configurável)
- **Limpeza Manual**: Disponível via API para administradores (consulte [Limpeza de Logs de Auditoria](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
