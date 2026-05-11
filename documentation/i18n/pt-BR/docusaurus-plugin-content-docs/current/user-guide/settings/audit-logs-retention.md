---
translation_last_updated: '2026-05-11T14:27:47.111Z'
source_file_mtime: '2026-05-06T23:18:51.442Z'
source_file_hash: e3e4bfa89172763e996fda191dad072d6156ecad610292ea1c564e416018e41e
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/settings/audit-logs-retention.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
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
- **Limpeza Manual**: Disponível via API para administradores (consulte [Limpar Logs de Auditoria](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
