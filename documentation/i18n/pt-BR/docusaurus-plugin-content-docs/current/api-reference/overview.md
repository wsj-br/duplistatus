# Visão Geral da API {/* #api-overview */}

Este documento descreve todos os endpoints da API disponíveis para a aplicação duplistatus. A API segue os princípios RESTful e fornece monitoramento abrangente de backups, gerenciamento de notificações e capacidades de administração do sistema.

## Estrutura da API {/* #api-structure */}

Para uma referência rápida de todos os endpoints, consulte a [Lista de Endpoints da API](api-endpoint-list).

A API é organizada em grupos lógicos:
- [**APIs Externas**](external-apis): Dados resumidos, último status do backup e uploads de dados de backup do Duplicati
- [**Operações Principais**](core-operations): Dados do painel, gerenciamento do servidor e informações detalhadas do backup
- [**Dados de Gráficos**](chart-data-apis): Dados de séries temporais agregados e específicos do servidor para visualização e análise
- [**Gerenciamento de Configuração**](configuration-apis): Configurações de e-mail, notificações, backup e configuração do sistema
- [**Sistema de Notificação**](notification-apis): Teste de notificações, verificação de backups atrasados e gerenciamento de notificações
- [**Serviços Cron**](cron-service-apis): Gerenciamento de serviços cron
- [**Monitoramento e Saúde**](monitoring-apis): Verificações de saúde e monitoramento de status
- [**Administração**](administration-apis): Manutenção do banco de dados, operações de limpeza e gerenciamento do sistema
- [**Gerenciamento de Sessão**](session-management-apis): Gerenciamento de sessão e criação de sessão
- [**Autenticação e Segurança**](authentication-security): Autenticação e segurança

Para uma referência rápida de todos os endpoints, consulte a [Lista de Endpoints da API](api-endpoint-list).

## Formato de Resposta {/* #response-format */}

Todas as respostas da API são retornadas em formato JSON com padrões consistentes de tratamento de erros. Respostas bem-sucedidas geralmente incluem um campo `status`, enquanto respostas de erro incluem campos `error` e `message`.

---

## Tratamento de Erros {/* #error-handling */}

Todos os endpoints seguem um padrão consistente de tratamento de erros:

- **400 Bad Request**: Dados de solicitação inválidos ou campos obrigatórios ausentes
- **401 Unauthorized**: Sessão inválida ou ausente, sessão expirada ou validação do token CSRF falhou
- **403 Forbidden**: Operação não permitida (por exemplo, exclusão de backup em produção) ou validação do token CSRF falhou
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Dados duplicados (para endpoints de upload)
- **413 Payload Too Large**: O corpo `/api/upload` excede o limite de tamanho configurado
- **429 Too Many Requests**: Limite de taxa excedido para upload, API de leitura ou falha na autenticação
- **500 Internal Server Error**: Erros do lado do servidor com mensagens de erro detalhadas
- **503 Service Unavailable**: Falhas na verificação de saúde, problemas de conexão com o banco de dados ou serviço cron indisponível

Respostas de erro incluem:
- `error`: Mensagem de erro legível por humanos
- `message`: Detalhes técnicos do erro (em modo de desenvolvimento)
- `stack`: Rastreamento de pilha de erro (em modo de desenvolvimento)
- `timestamp`: Quando o erro ocorreu

## Notas sobre Tipos de Dados {/* #data-type-notes */}

### Arrays de Mensagens {/* #message-arrays */}
Os campos `messages_array`, `warnings_array` e `errors_array` são armazenados como strings JSON no banco de dados e retornados como arrays nas respostas da API. Esses contêm as mensagens de log reais, avisos e erros das operações de backup do Duplicati.

### Backups Disponíveis {/* #available-backups */}
O campo `available_backups` contém um array de carimbos de data/hora de versões de backup (no formato ISO) que estão disponíveis para restauração. Isso é extraído das mensagens de log do backup.

### Campos de Duração {/* #duration-fields */}
- `duration`: Formato legível por humanos (ex.: "00:38:31")
- `duration_seconds`: Duração bruta em segundos
- `durationInMinutes`: Duração convertida para minutos para fins de gráficos

### Campos de Tamanho do Arquivo {/* #file-size-fields */}
Todos os campos de tamanho do arquivo são retornados em bytes como números, não como strings formatadas. O frontend é responsável por converter esses valores para formatos legíveis por humanos (KB, MB, GB, etc.).

<br/>

:::caution
 Não exponha o servidor **duplistatus** à internet pública. Use-o em uma rede segura 
(e.g., LAN local protegida por um firewall).

Expor a interface **duplistatus** à internet pública
 sem medidas de segurança adequadas pode levar a acesso não autorizado.
:::
