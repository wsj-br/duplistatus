---
translation_last_updated: '2026-01-31T00:51:30.944Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 67b8a05c2d43879d
translation_language: pt-BR
source_file_path: user-guide/settings/audit-logs-viewer.md
---
# Logs de Auditoria {#audit-logs}

O log de auditoria fornece um registro abrangente de todas as alterações de sistema e ações de usuário no **duplistatus**. Isso ajuda a rastrear alterações de configuração, atividades de usuário e operações de sistema para fins de segurança e resolução de problemas.

![Audit Log](../../assets/screen-settings-audit.png)

## Visualizador de log de auditoria {#audit-log-viewer}

O Visualizador de log de auditoria exibe uma lista cronológica de todos os eventos registrados com as seguintes informações:

- **Data e hora**: Quando o evento ocorreu
- **Usuário**: O nome de usuário que realizou a ação (ou "Sistema" para ações automatizadas)
- **Ação**: A ação específica que foi realizada
- **Categoria**: A categoria da ação (Autenticação, Gerenciamento de usuários, Configuração, Operações de backup, Gerenciamento de servidores, Operações do sistema)
- **Status**: Se a ação foi bem-sucedida ou falhou
- **Destino**: O objeto que foi afetado (se aplicável)
- **Detalhes**: Informações adicionais sobre a ação

### Visualizando Detalhes do Log {#viewing-log-details}

Clique no ícone de olho <IconButton icon="lucide:eye" /> ao lado de qualquer entrada de log para visualizar informações detalhadas, incluindo:
- Data e hora completa
- Informações do usuário
- Detalhes completos da ação (por exemplo: campos alterados, estatísticas, etc.)
- Endereço IP e agente do usuário
- Mensagens de erro (se a ação falhou)

### Exportando Logs de Auditoria {#exporting-audit-logs}

Você pode exportar logs de auditoria filtrados em dois formatos:

| Botão | Descrição |
|:------|:-----------|
| <IconButton icon="lucide:download" label="CSV"/> | Exportar logs como um arquivo CSV para análise em planilha |
| <IconButton icon="lucide:download" label="JSON"/> | Exportar logs como um arquivo JSON para análise programática |

:::note
As exportações incluem apenas os logs atualmente visíveis com base nos seus filtros ativos. Para exportar todos os logs, limpe todos os filtros primeiro.
:::
