---
translation_last_updated: '2026-04-18T00:01:19.660Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: fe4cf26fcdad9ea7ff5f3f4cb9f9533b46f148bea17589644eeef65398578b86
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/overview.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Visão Geral da API {#api-overview}

Este documento descreve todos os endpoints da API disponíveis para o aplicativo duplistatus. A API segue princípios RESTful e fornece recursos abrangentes de monitoramento de backup, gerenciamento de notificações e administração do sistema.

:::note
**Português (PT-BR):** A documentação da API está disponível apenas em inglês.    
**Inglês (EN):** A documentação da API está disponível apenas em inglês.               <br/>
**Alemão (DE):** Die API-Dokumentation ist nur auf Englisch verfügbar.              <br/>
**Francês (FR):** La documentation de l'API est disponible uniquement en anglais.    <br/>
**Espanhol (ES):** La documentación de la API solo está disponible en inglés.        <br/>
:::

## Estrutura da API {#api-structure}

Para uma referência rápida de todos os endpoints, consulte a [Lista de Endpoints da API](api-endpoint-list).

A API é organizada em grupos lógicos:
- **[APIs Externas](external-apis)**: Dados resumidos, status mais recente do backup e uploads de dados de backup do Duplicati
- **[Operações Principais](core-operations)**: Dados do painel, gerenciamento do servidor e informações detalhadas do backup
- **[Dados de Gráficos](chart-data-apis)**: Dados agregados e específicos do servidor em série temporal para visualização e análise
- **[Gerenciamento de Configuração](configuration-apis)**: E-mail, notificações, configurações de backup e configuração do sistema
- **[Sistema de Notificações](notification-apis)**: Teste de notificações, verificação de backups atrasados e gerenciamento de notificações
- **[Serviços Cron](cron-service-apis)**: Gerenciamento de serviços cron
- **[Monitoramento e Saúde](monitoring-apis)**: Verificações de saúde e monitoramento de status
- **[Administração](administration-apis)**: Manutenção do banco de dados, operações de limpeza e gerenciamento do sistema
- **[Gerenciamento de Sessão](session-management-apis)**: Gerenciamento de sessão e criação de sessão
- **[Autenticação e Segurança](authentication-security)**: Autenticação e segurança

Para uma referência rápida de todos os endpoints, consulte a [Lista de Endpoints da API](api-endpoint-list).

## Formato de Resposta {#response-format}

Todas as respostas da API são retornadas no formato JSON com padrões consistentes de tratamento de erros. Respostas bem-sucedidas normalmente incluem um campo `status`, enquanto respostas de erro incluem os campos `error` e `message`.

---

## Tratamento de Erros {#error-handling}

Todos os endpoints seguem um padrão consistente de tratamento de erros:

- **400 Requisição Inválida**: Dados de requisição inválidos ou campos obrigatórios ausentes
- **401 Não Autorizado**: Sessão inválida ou ausente, sessão expirada ou falha na validação do token CSRF
- **403 Proibido**: Operação não permitida (por exemplo, exclusão de backup em produção) ou falha na validação do token CSRF
- **404 Não Encontrado**: Recurso não encontrado
- **409 Conflito**: Dados duplicados (para endpoints de upload)
- **500 Erro Interno do Servidor**: Erros no lado do servidor com mensagens detalhadas
- **503 Serviço Indisponível**: Falhas na verificação de saúde, problemas de conexão com o banco de dados ou serviço cron indisponível

As respostas de erro incluem:
- `error`: Mensagem de erro legível para humanos
- `message`: Detalhes técnicos do erro (no modo de desenvolvimento)
- `stack`: Rastreamento do erro (no modo de desenvolvimento)
- `timestamp`: Quando o erro ocorreu

## Notas sobre Tipos de Dados {#data-type-notes}

### Arrays de Mensagens {#message-arrays}
Os campos `messages_array`, `warnings_array` e `errors_array` são armazenados como strings JSON no banco de dados e retornados como arrays nas respostas da API. Eles contêm as mensagens de log, avisos e erros reais das operações de backup do Duplicati.

### Backups Disponíveis {#available-backups}
O campo `available_backups` contém um array de carimbos de data/hora das versões de backup (no formato ISO) disponíveis para restauração. Isso é extraído das mensagens de log do backup.

### Campos de Duração {#duration-fields}
- `duration`: Formato legível (por exemplo, "00:38:31")
- `duration_seconds`: Duração bruta em segundos
- `durationInMinutes`: Duração convertida em minutos para fins de gráficos

### Campos de Tamanho de Arquivo {#file-size-fields}
Todos os campos de tamanho de arquivo são retornados em bytes como números, não como strings formatadas. A interface é responsável por converter esses valores em formatos legíveis (KB, MB, GB, etc.).

<br/>

:::caution
 Não exponha o servidor **duplistatus** à internet pública. Use-o em uma rede segura 
(por exemplo, LAN local protegida por firewall).

Expor a interface **duplistatus** à internet pública 
sem medidas de segurança adequadas pode resultar em acesso não autorizado.
:::
