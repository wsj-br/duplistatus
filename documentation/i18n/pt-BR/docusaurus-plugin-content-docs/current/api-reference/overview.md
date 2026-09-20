# Visão geral da API {/* #api-overview */}

Este documento descreve todos os endpoints de API disponíveis para o aplicativo duplistatus. A API segue os princípios RESTful e oferece recursos abrangentes de monitoramento de backup, gerenciamento de notificações e administração do sistema.

## Estrutura da API {/* #api-structure */}

Para uma consulta rápida de todos os endpoints, consulte a [Lista de Endpoints da API](api-endpoint-list).

A API é organizada em grupos lógicos:
- [**APIs externas**](external-apis): dados de resumo, status do backup mais recente e uploads de dados de backup do Duplicati
- [**Operações Principais**](core-operations): dados do painel, gerenciamento de servidores e informações do backup detalhadas
- [**Dados de Gráficos**](chart-data-apis): dados de séries temporais agregados e específicos do servidor para visualização e análise
- [**Gerenciamento de Configuração**](configuration-apis): e-mail, notificações, configurações de backup e configuração do sistema
- [**Sistema de Notificações**](notification-apis): testes de notificação, verificações de backup atrasado e gerenciamento de notificações
- [**Serviços Cron**](cron-service-apis): gerenciamento de serviços cron
- [**Monitoramento e Integridade**](monitoring-apis): verificações de integridade e monitoramento de status
- [**Administração**](administration-apis): manutenção do banco de dados, operações de limpeza e gerenciamento do sistema
- [**Gerenciamento de Sessão**](session-management-apis): gerenciamento de sessão e criação de sessão
- [**Autenticação e Segurança**](authentication-security): autenticação e segurança

Para uma consulta rápida de todos os endpoints, consulte a [Lista de Endpoints da API](api-endpoint-list).

## Formato de Resposta {/* #response-format */}

Todas as respostas da API são retornadas no formato JSON com padrões consistentes de tratamento de erros. Respostas bem-sucedidas geralmente incluem um campo `status`, enquanto respostas de erro incluem os campos `error` e `message`.

---

## Tratamento de Erros {/* #error-handling */}

Todos os endpoints seguem um padrão consistente de tratamento de erros:

- **400 Bad Request**: dados de solicitação inválidos ou campos obrigatórios ausentes
- **401 Unauthorized**: sessão inválida ou ausente, sessão expirada ou falha na validação do token CSRF
- **403 Forbidden**: operação não permitida (por exemplo, exclusão de backup em produção) ou falha na validação do token CSRF
- **404 Not Found**: recurso não encontrado
- **409 Conflict**: dados duplicados (para endpoints de upload)
- **413 Payload Too Large**: o corpo `/api/upload` excede o limite de tamanho configurado
- **429 Too Many Requests**: limite de taxa de upload, leitura de API ou falha de autenticação excedido
- **500 Internal Server Error**: erros do lado do servidor com mensagens de erro detalhadas
- **503 Service Unavailable**: falhas na verificação de integridade, problemas de conexão com o banco de dados ou serviço cron indisponível

As respostas de erro incluem:
- `error`: mensagem de erro legível para humanos
- `message`: detalhes técnicos do erro (em modo de desenvolvimento)
- `stack`: stack trace do erro (em modo de desenvolvimento)
- `timestamp`: quando o erro ocorreu

## Observações sobre Tipos de Dados {/* #data-type-notes */}

### Matrizes de Mensagens {/* #message-arrays */}
Os campos `messages_array`, `warnings_array` e `errors_array` são armazenados como strings JSON no banco de dados e retornados como matrizes nas respostas da API. Eles contêm as mensagens de log, avisos e erros reais das operações de backup do Duplicati.

### Backups Disponíveis {/* #available-backups */}
O campo `available_backups` contém uma matriz de carimbos de data/hora das versões de backup (no formato ISO) que estão disponíveis para restauração. Isso é extraído das mensagens de log de backup.

### Campos de Duração {/* #duration-fields */}
- `duration`: Formato legível por humanos (por exemplo, "00:38:31")
- `duration_seconds`: Duração bruta em segundos
- `durationInMinutes`: Duração convertida em minutos para fins de gráficos

### Campos de Tamanho do Arquivo {/* #file-size-fields */}
Todos os campos de tamanho do arquivo são retornados em bytes como números, e não como strings formatadas. O frontend é responsável por converter esses valores para formatos legíveis por humanos (KB, MB, GB, etc.).

<br/>

:::caution
 Não exponha o servidor **duplistatus** à internet pública. Use-o em uma rede segura 
(por exemplo, uma LAN local protegida por firewall).

Expor a interface do **duplistatus** à internet pública
 sem as medidas de segurança adequadas pode resultar em acesso não autorizado.
:::
