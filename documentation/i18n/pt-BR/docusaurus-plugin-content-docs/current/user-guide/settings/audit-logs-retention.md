---
translation_last_updated: '2026-02-16T02:21:45.886Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: f21e4b84808c8bcb
translation_language: pt-BR
source_file_path: user-guide/settings/audit-logs-retention.md
---
# Retenção de log de auditoria {#audit-log-retention}

Configurar por quanto tempo os logs de auditoria são retidos antes da limpeza automática.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Configuração | Descrição | Valor Padrão |
|:-------|:-----------|:-------------|
| **Retenção (dias)** | Número de dias para manter logs de auditoria antes da exclusão automática | **90 dias** |

## Configurações de Retenção {#retention-settings}

- **Intervalo**: 30 a 365 dias
- **Limpeza Automática**: Executada diariamente às 02:00 UTC (não configurável)
- **Limpeza Manual**: Disponível via API para administradores (consulte [Cleanup Audit Logs](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
