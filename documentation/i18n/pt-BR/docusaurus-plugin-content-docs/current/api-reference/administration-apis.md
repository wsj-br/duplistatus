# Administração {/* #administration */}

## Coletar Backups - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpoint**: `/api/backups/collect`
- **Método**: POST
- **Descrição**: Coleta dados de backup diretamente de um servidor Duplicati por meio de sua API. Este endpoint detecta automaticamente o melhor protocolo de conexão (HTTPS com validação SSL, HTTPS com certificados autoassinados ou HTTP como fallback) e se conecta ao servidor Duplicati para recuperar informações de backup e processá-las no banco de dados local.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "downloadJson": false
  }
  ```

- **Resposta**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "serverAlias": "My Server",
    "stats": {
      "processed": 5,
      "skipped": 2,
      "errors": 0
    },
    "backupSettings": {
      "added": 2,
      "total": 7
    }
  }
  ```

- **Respostas de erro**:
  - `400`: Parâmetros de requisição inválidos ou falha na conexão
  - `500`: Erro do servidor durante a coleta de backups
- **Observações**: 
  - O endpoint detecta automaticamente o protocolo de conexão ideal (HTTPS → HTTPS com autoassinado → HTTP)
  - As tentativas de detecção de protocolo são feitas em ordem de preferência de segurança
  - Os tempos limite de conexão são configuráveis por meio de variáveis de ambiente
  - Registra os dados coletados em modo de desenvolvimento para depuração
  - Garante que as configurações de backup estejam completas para todos os servidores e backups
  - Usa a porta padrão 8200 se não especificada
  - O protocolo detectado e a URL do servidor são armazenados automaticamente no banco de dados
  - `serverAlias` é recuperado do banco de dados e pode estar vazio se nenhum alias for definido
  - O frontend deve usar `serverAlias || serverName` para fins de exibição
  - Suporta tanto métodos de download em JSON quanto de coleta direta via API

## Limpeza de Backups - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpoint**: `/api/backups/cleanup`
- **Método**: POST
- **Descrição**: Exclui dados antigos de backup com base no período de retenção. Este endpoint ajuda a gerenciar o tamanho do banco de dados removendo registros de backup desatualizados e preservando dados recentes e importantes.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Períodos de retenção**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
- **Resposta**:

  ```json
  {
    "message": "Successfully deleted 15 old backups",
    "status": 200
  }
  ```

Para a opção "Excluir todos os dados":

  ```json
  {
    "message": "Successfully deleted all 15 backups and 3 servers, and cleared configuration settings",
    "status": 200
  }
  ```

- **Respostas de erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: Período de retenção especificado inválido
  - `500`: Erro do servidor durante a operação de limpeza com informações detalhadas do erro
- **Observações**: 
  - A operação de limpeza é irreversível
  - Os dados de backup são excluídos permanentemente do banco de dados
  - Os registros das máquinas são preservados mesmo se todos os backups forem excluídos
  - Quando "Excluir todos os dados" é selecionado, todas as máquinas e backups são removidos e a configuração é limpa
  - O relatório de erros aprimorado inclui detalhes e rastreamento de pilha (stack trace) no modo de desenvolvimento
  - Suporta retenção baseada em tempo e exclusão completa de dados

## Excluir Tarefa de Backup - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpoint**: `/api/backups/delete-job`
- **Método**: DELETE
- **Descrição**: Exclui todos os registros de backup para uma combinação específica de servidor-backup. Este endpoint está disponível apenas no modo de desenvolvimento.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "serverId": "server-id",
    "backupName": "Backup Name"
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Successfully deleted 5 backup record(s) for \"Files\" from server \"My Server\"",
    "status": 200,
    "deletedCount": 5,
    "serverName": "My Server",
    "backupName": "Files"
  }
  ```

- **Respostas de erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: A exclusão de tarefas de backup só está disponível no modo de desenvolvimento
  - `400`: ID do Servidor e Nome do Backup são obrigatórios
  - `404`: Nenhum backup encontrado para excluir
  - `500`: Erro do servidor durante a exclusão com informações detalhadas do erro
- **Observações**: 
  - Esta operação está disponível apenas no modo de desenvolvimento
  - Esta operação é irreversível
  - Todos os registros de backup para a combinação servidor-backup especificada serão permanentemente deletados
  - Retorna a contagem de backups deletados e informações do servidor
  - Usa alias do servidor para exibição se disponível, caso contrário volta para o nome do servidor

## Sincronizar Agendamentos de Backup - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Endpoint**: `/api/backups/sync-schedule`
- **Método**: POST
- **Descrição**: Sincroniza informações de agendamento de backup de um servidor Duplicati. Este endpoint se conecta ao servidor, recupera informações de agendamento para todos os backups e atualiza as configurações locais de backup com detalhes de agendamento, incluindo intervalos de repetição, dias da semana permitidos e horários de agendamento.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "hostname": "duplicati-server.local",
    "port": 8200,
    "password": "your-password",
    "serverId": "optional-server-id"
  }
  ```

Ou apenas com serverId (usa senha armazenada):

  ```json
  {
    "serverId": "server-id"
  }
  ```

Ou com serverId e credenciais atualizadas:

  ```json
  {
    "serverId": "server-id",
    "hostname": "new-hostname.local",
    "port": 8200,
    "password": "new-password"
  }
  ```

- **Resposta**:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 5,
      "errors": 0
    }
  }
  ```

Com erros:

  ```json
  {
    "success": true,
    "serverName": "Server Name",
    "stats": {
      "processed": 3,
      "errors": 2
    },
    "errors": [
      "Backup Name 1: Error message",
      "Backup Name 2: Error message"
    ]
  }
  ```

- **Respostas de Erro**:
  - `400`: Parâmetros de requisição inválidos, nome do host/senha ausentes quando serverId não fornecido, ou falha na conexão
  - `404`: Servidor não encontrado (quando serverId fornecido) ou nenhuma senha armazenada para o servidor
  - `500`: Erro do servidor durante sincronização de agendamento
- **Notas**: 
  - O endpoint detecta automaticamente o protocolo de conexão ideal (HTTPS → HTTPS com auto-assinado → HTTP)
  - Pode ser chamado apenas com serverId para usar credenciais do servidor armazenadas
  - Pode ser chamado com serverId e novas credenciais para atualizar detalhes de conexão do servidor
  - Pode ser chamado com nome do host/porta/senha sem serverId para novos servidores
  - Atualiza configurações de backup com informações de agendamento, incluindo:
    - `expectedInterval`: O intervalo de repetição (por exemplo, "Diário", "Semanal", "Mensal")
    - `allowedWeekDays`: Array de dias da semana permitidos (0=Domingo, 1=Segunda, etc.)
    - `time`: A hora agendada para o backup
  - Processa todos os backups encontrados no servidor
  - Retorna estatísticas sobre backups processados e quaisquer erros encontrados
  - Registra eventos de auditoria para operações de sincronização bem-sucedidas e falhadas
  - Usa porta padrão 8200 se não especificada

## Testar Conexão do Servidor - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **Endpoint**: `/api/servers/test-connection`
- **Método**: POST
- **Descrição**: Testa a conexão com um servidor Duplicati para verificar se está acessível.
- **Corpo da Requisição**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Resposta**:

  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

- **Respostas de Erro**:
  - `400`: Formato de URL inválido ou URL do servidor ausente
  - `500`: Erro do servidor durante teste de conexão
- **Notas**: 
  - O endpoint valida o formato da URL e testa a conectividade
  - Retorna sucesso se o servidor responder com status 401 (esperado para endpoint de login sem credenciais)
  - Testa conexão com o endpoint de login do servidor Duplicati
  - Suporta protocolos HTTP e HTTPS
  - Usa configuração de timeout para teste de conexão

## Obter URL do Servidor - `/api/servers/:serverId/server-url` {/* #get-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Método**: GET
- **Descrição**: Recupera a URL do servidor para um servidor específico.
- **Parâmetros**:
  - `serverId`: o identificador do servidor

- **Resposta**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Respostas de erro**:
  - `404`: Servidor não encontrado
  - `500`: Erro no servidor
- **Observações**:
  - Retorna a URL do servidor para um servidor específico
  - Usado para o gerenciamento de conexão do servidor
  - Retorna uma string vazia se nenhuma URL de servidor estiver definida

## Atualizar URL do Servidor - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Método**: PATCH
- **Descrição**: Atualiza a URL do servidor para um servidor específico.
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros**:
  - `serverId`: o identificador do servidor
- **Corpo da requisição**:

  ```json
  {
    "server_url": "http://localhost:8200"
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Server URL updated successfully",
    "serverId": "server-id",
    "serverName": "Server Name",
    "server_url": "http://localhost:8200"
  }
  ```

- **Respostas de erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: Formato de URL inválido
  - `404`: Servidor não encontrado
  - `500`: Erro no servidor durante a atualização
- **Observações**: 
  - O endpoint valida o formato da URL antes de atualizar
  - URLs de servidor vazias ou nulas são permitidas
  - Suporta os protocolos HTTP e HTTPS
  - Retorna informações atualizadas do servidor

## Obter Senha do Servidor - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Método**: GET
- **Descrição**: Recupera um token CSRF para operações com a senha do servidor.
- **Autenticação**: Requer sessão válida
- **Parâmetros**:
  - `serverId`: o identificador do servidor
- **Resposta**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "serverId": "server-id"
  }
  ```

- **Respostas de erro**:
  - `401`: Sessão inválida ou expirada
  - `500`: Falha ao gerar o token CSRF
- **Observações**:
  - Retorna o token CSRF para uso em operações de atualização de senha
  - A sessão deve ser válida para gerar o token

## Atualizar Senha do Servidor - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Método**: PATCH
- **Descrição**: Atualiza a senha de um servidor específico.
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros**:
  - `serverId`: o identificador do servidor
- **Corpo da requisição**:

  ```json
  {
    "password": "new-password"
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Password updated successfully",
    "serverId": "server-id"
  }
  ```

- **Respostas de erro**:
  - `400`: A senha deve ser uma string
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao atualizar a senha
- **Observações**:
  - A senha pode ser uma string vazia para limpar a senha
  - A senha é armazenada com segurança usando o sistema de gerenciamento de segredos

## Gerenciamento de Usuários {/* #user-management */}

### Listar Usuários - `/api/users` {/* #list-users---apiusers */}
- **Endpoint**: `/api/users`
- **Método**: GET
- **Descrição**: Lista todos os usuários com paginação e filtragem de pesquisa opcional. Retorna informações do usuário, incluindo histórico de login e status da conta.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de consulta**:
  - `page` (opcional): Número da página (padrão: 1)
  - `limit` (opcional): Itens por página (padrão: 50)
  - `search` (opcional): termo de Pesquisar para Filtrar por nome de usuário
- **Resposta**:

  ```json
  {
    "users": [
      {
        "id": "user-id",
        "username": "admin",
        "isAdmin": true,
        "mustChangePassword": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-15T10:30:00Z",
        "lastLoginIp": "192.168.1.100",
        "failedLoginAttempts": 0,
        "lockedUntil": null,
        "isLocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador obrigatórios
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - Suporta paginação e filtragem de busca
  - Retorna o status da conta do usuário, incluindo o status de bloqueio

### Criar Usuário - `/api/users` {/* #create-user---apiusers */}
- **Endpoint**: `/api/users`
- **Método**: POST
- **Descrição**: Cria uma nova conta de usuário. Pode gerar uma Senha Temporária ou usar uma Senha fornecida.
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF
- **Request Body**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Obrigatório, deve ter de 3 a 50 caracteres, exclusivo
  - `password`: Opcional, se não for fornecido, uma Senha Temporária segura será gerada
  - `isAdmin`: Opcional, Padrão false
  - `requirePasswordChange`: Opcional, Padrão true
- **Resposta**:

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` só é incluído se uma senha tiver sido gerada automaticamente
- **Respostas de Erro**:
  - `400`: Formato inválido de Nome de usuário, violação da política de senhas ou Erros de validação
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador obrigatórios
  - `409`: O Nome de usuário já existe
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - O Nome de usuário não diferencia maiúsculas de minúsculas e é armazenado em letras minúsculas
  - Se a senha não for fornecida, uma senha segura de 12 caracteres será gerada
  - As senhas temporárias geradas só são retornadas uma vez na resposta
  - A criação do usuário é registrada no Log de Auditoria

### Atualizar Usuário - `/api/users/:id` {/* #update-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: PATCH
- **Descrição**: Atualiza as informações do usuário, incluindo Nome de usuário, Status de Administrador, exigência de alteração de senha e Redefinição de Senha.
- **Autenticação**: Requer privilégios de Administrador, sessão válida e token CSRF
- **Parâmetros**:
  - `id`: ID do Usuário a ser atualizado
- **Corpo da Requisição**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- Todos os campos são opcionais
  - `resetPassword`: Se for true, gera uma nova Senha Temporária e define `requirePasswordChange` como true
- **Resposta** (com Redefinição de Senha):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true
    },
    "temporaryPassword": "new-temp-password-456"
  }
  ```

- **Resposta** (sem Redefinição de Senha):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Respostas de Erro**:
  - `400`: Entrada inválida ou Erros de validação
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador obrigatórios
  - `404`: Usuário não encontrado
  - `409`: O Nome de usuário já existe (se estiver alterando o Nome de usuário)
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - As alterações de Nome de usuário são validadas para garantir exclusividade
  - A Redefinição de Senha gera uma Senha Temporária segura de 12 caracteres
  - Todas as alterações são registradas no Log de Auditoria

### Excluir Usuário - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: DELETE
- **Descrição**: Exclui uma conta de Usuário. Impede a exclusão de si mesmo ou da última conta de Administrador.
- **Autenticação**: Requer privilégios de Administrador, sessão válida e token CSRF
- **Parâmetros**:
  - `id`: ID do Usuário a Excluir
- **Resposta**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Respostas de erro**:
  - `400`: Não é possível excluir a sua própria conta ou a última conta de administrador
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `404`: Usuário não encontrado
  - `500`: Erro interno do servidor
- **Notas**:
  - Acessível apenas para usuários administradores
  - Não é possível excluir a sua própria conta
  - Não é possível excluir o último usuário administrador (pelo menos um administrador deve permanecer)
  - A exclusão de usuário é registrada no log de auditoria
  - Sessões associadas são excluídas automaticamente (cascata)

## Gerenciamento de Log de Auditoria {/* #audit-log-management */}

### Listar logs de auditoria - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpoint**: `/api/audit-log`
- **Método**: GET
- **Descrição**: Recupera entradas do log de auditoria com recursos de filtragem, paginação e pesquisa. Suporta tanto paginação baseada em página quanto baseada em deslocamento (offset).
- **Autenticação**: Requer sessão válida e token CSRF (necessário usuário conectado)
- **Parâmetros de consulta**:
  - `page` (opcional): Número da página para paginação baseada em página
  - `offset` (opcional): Deslocamento para paginação baseada em deslocamento (tem precedência sobre a página)
  - `limit` (opcional): Itens por página (padrão: 50)
  - `startDate` (opcional): Filtrar logs a partir desta data (formato ISO)
  - `endDate` (opcional): Filtrar logs até esta data (formato ISO)
  - `userId` (opcional): Filtrar por ID do usuário
  - `username` (opcional): Filtrar por nome de usuário
  - `action` (opcional): Filtrar por nome da ação
  - `category` (opcional): Filtrar por categoria (`auth`, `user_management`, `config`, `backup`, `server`)
  - `status` (opcional): Filtrar por status (`success`, `failure`, `error`)
- **Resposta**:

  ```json
  {
    "logs": [
      {
        "id": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-id",
        "username": "admin",
        "action": "login",
        "category": "auth",
        "targetType": "user",
        "targetId": "user-id",
        "status": "success",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "is_admin": true
        },
        "errorMessage": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
  ```

- **Respostas de erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Erro interno do servidor
- **Notas**:
  - Suporta tanto paginação baseada em página (`page`) quanto baseada em deslocamento (`offset`)
  - O campo `details` contém JSON analisado com contexto adicional
  - Todas as consultas ao log de auditoria são registradas

### Obter valores de filtro do log de auditoria - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Endpoint**: `/api/audit-log/filters`
- **Método**: GET
- **Descrição**: Recupera valores de filtro exclusivos disponíveis para filtrar logs de auditoria. Retorna todas as ações, categorias e status distintos existentes no banco de dados do log de auditoria. Útil para preencher menus suspensos de filtro na interface.
- **Autenticação**: Requer sessão válida e token CSRF (necessário usuário conectado)
- **Resposta**:

  ```json
  {
    "actions": [
      "login",
      "logout",
      "user_created",
      "user_updated",
      "config_updated"
    ],
    "categories": [
      "auth",
      "user_management",
      "config",
      "backup",
      "server"
    ],
    "statuses": [
      "success",
      "failure",
      "error"
    ]
  }
  ```

- **Respostas de erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Erro interno do servidor
- **Notas**:
  - Retorna matrizes de valores exclusivos do banco de dados do log de auditoria
  - Os valores são ordenados em ordem alfabética
  - Matrizes vazias são retornadas se nenhum dado existir ou em caso de erro
  - Usado pelo visualizador de log de auditoria para preencher menus suspensos de filtro dinamicamente

### Baixar logs de auditoria - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpoint**: `/api/audit-log/download`
- **Método**: GET
- **Descrição**: Baixa logs de auditoria no formato CSV ou JSON com filtragem opcional. Útil para análises externas e relatórios.
- **Autenticação**: Requer sessão válida e token CSRF (necessário usuário conectado)
- **Parâmetros de consulta**:
  - `format` (opcional): Formato de exportação - `csv` ou `json` (padrão: `csv`)
  - `startDate` (opcional): Filtrar logs a partir desta data (formato ISO)
  - `endDate` (opcional): Filtrar logs até esta data (formato ISO)
  - `userId` (opcional): Filtrar por ID do usuário
  - `username` (opcional): Filtrar por nome de usuário
  - `action` (opcional): Filtrar por nome da ação
  - `category` (opcional): Filtrar por categoria
  - `status` (opcional): Filtrar por status
- **Resposta** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Arquivo CSV com cabeçalhos: ID, Timestamp, User ID, Username, Action, Category, Target Type, Target ID, Status, IP Address, User Agent, Details, Error Message
- **Resposta** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Array JSON de entradas do log de auditoria
- **Error Responses**:
  - `400`: Não há logs para exportar
  - `401`: Unauthorized - Sessão ou token CSRF inválido
  - `500`: Erro interno do servidor
- **Notes**:
  - O limite de exportação é de 10.000 registros
  - O formato CSV escapa caracteres especiais adequadamente
  - O campo Detalhes no CSV é convertido em string JSON
  - O nome do arquivo inclui a data atual

### Limpeza de Logs de Auditoria - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Descrição**: Aciona manualmente a limpeza de logs de auditoria antigos com base no período de retenção. Suporta o modo de simulação (dry-run) para visualizar o que seria excluído.
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF
- **Request Body**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (opcional): Substitui os dias de retenção (30-365); caso contrário, usa o valor configurado
  - `dryRun` (opcional): Se verdadeiro, retorna apenas o que seria excluído sem realmente excluir
- **Response** (simulação):

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Response** (limpeza real):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Error Responses**:
  - `400`: Dias de retenção inválidos (deve ser entre 30 e 365)
  - `401`: Unauthorized - Sessão ou token CSRF inválido
  - `403`: Forbidden - Privilégios de administrador necessários
  - `500`: Erro interno do servidor
- **Notes**:
  - Acessível apenas para usuários administradores
  - A retenção padrão é de 90 dias se não configurado
  - A operação de limpeza é registrada no log de auditoria
  - O modo de simulação é útil para visualizar o impacto da limpeza

### Obter Retenção de Log de Auditoria - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: GET
- **Descrição**: Recupera a configuração atual de retenção de log de auditoria em dias.
- **Authentication**: Requer sessão válida e token CSRF (nenhum usuário conectado é necessário)
- **Response**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Error Responses**:
  - `500`: Erro interno do servidor
- **Notes**:
  - A retenção padrão é de 90 dias se não configurado
  - Pode ser acessado sem autenticação (somente leitura)

### Atualizar Retenção de Log de Auditoria - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Method**: PATCH
- **Descrição**: Atualiza o período de retenção do log de auditoria em dias. Esta configuração determina por quanto tempo os logs de auditoria são mantidos antes da limpeza automática.
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF
- **Request Body**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Obrigatório, deve ser entre 30 e 365 dias
- **Response**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Error Responses**:
  - `400`: Dias de retenção inválidos (deve ser entre 30 e 365)
  - `401`: Unauthorized - Sessão ou token CSRF inválido
  - `403`: Forbidden - Privilégios de administrador necessários
  - `500`: Erro interno do servidor
- **Notes**:
  - Acessível apenas para usuários administradores
  - A alteração de configuração é registrada no log de auditoria
  - O período de retenção afeta as operações de limpeza automática e manual

## Chaves de API {/* #api-keys */}

### List API Keys - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Endpoint**: `/api/api-keys`
- **Method**: GET
- **Descrição**: Lista todas as chaves de API. Os segredos nunca são retornados; cada chave inclui uma impressão digital (`Qk7v…3xTa`).
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF
- **Error Responses**:
  - `401`: Unauthorized - Sessão ou token CSRF inválido
  - `403`: Forbidden - Privilégios de administrador obrigatórios
  - `500`: Erro interno do servidor

### Criar chave de API - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Endpoint**: `/api/api-keys`
- **Method**: POST
- **Descrição**: Cria uma chave de API com escopo definido. O segredo em texto simples é retornado apenas nesta resposta.
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF
- **Request Body**:

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **Error Responses**:
  - `400`: Nome ausente ou escopo inválido (`upload` ou `read`)
  - `401`: Unauthorized - Sessão ou token CSRF inválido
  - `403`: Forbidden - Privilégios de administrador obrigatórios
  - `500`: Erro interno do servidor

### Update API Key - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Endpoint**: `/api/api-keys/:id`
- **Method**: PATCH
- **Descrição**: Habilita ou desabilita uma chave.
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF

### Excluir chave de API - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Endpoint**: `/api/api-keys/:id`
- **Method**: DELETE
- **Descrição**: Exclui uma chave. Clientes existentes que usam esse segredo perdem o acesso imediatamente.
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF

## Gerenciamento de Banco de Dados {/* #database-management */}

### Fazer Backup do Banco de Dados - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Endpoint**: `/api/database/backup`
- **Method**: GET
- **Descrição**: Cria um backup do banco de dados no formato binário (.db) ou SQL (.sql). O download do arquivo de backup é feito automaticamente com um nome contendo timestamp.
- **Authentication**: Requer privilégios de administrador, sessão válida e token CSRF
- **Query Parameters**:
  - `format` (opcional): Formato de Backup - `db` (binário) ou `sql` (dump SQL). Padrão: `db`
- **Response**:
  - Content-Type: `application/octet-stream` (para .db) ou `text/plain` (para .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ou `.sql`
  - Conteúdo do arquivo binário (para .db) ou conteúdo do texto SQL (para .sql)
- **Error Responses**:
  - `400`: Formato inválido (deve ser "db" ou "sql")
  - `401`: Unauthorized - Sessão ou token CSRF inválido
  - `403`: Forbidden - Privilégios de administrador obrigatórios
  - `500`: Falha ao criar backup do banco de dados
- **Notes**:
  - Acessível apenas para usuários administradores
  - O formato binário usa o método de backup do SQLite para integridade
  - O formato SQL cria um dump de texto de todo o conteúdo do banco de dados
  - O timestamp no nome do arquivo usa o fuso horário local do servidor
  - A operação de backup é registrada no log de auditoria
  - Os arquivos temporários são limpos automaticamente após o download

### Restaurar Banco de Dados - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Endpoint**: `/api/database/restore`
- **Method**: POST
- **Descrição**: Restaura o banco de dados a partir de um arquivo de backup (formato .db ou .sql). Cria um backup de segurança antes da restauração e limpa todas as sessões após a restauração por motivos de segurança.
- **Autenticação**: requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da requisição**: FormData com um campo de arquivo chamado `database`
  - O arquivo deve ser `.db`, `.sqlite`, `.sqlite3` (formato binário) ou `.sql` (formato SQL)
  - Tamanho máximo do arquivo: 100 MB
- **Resposta**:

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **Respostas de erro**:
  - `400`: nenhum arquivo fornecido, tamanho do arquivo excede o limite, formato de arquivo inválido ou falha na verificação de integridade do banco de dados
  - `401`: não autorizado - Sessão ou token CSRF inválido
  - `403`: proibido - Privilégios de administrador necessários
  - `500`: falha ao restaurar banco de dados (o banco de dados original é restaurado a partir do backup de segurança se a restauração falhar)
- **Observações**:
  - Acessível apenas para usuários administradores
  - Cria automaticamente um backup de segurança antes da restauração
  - Suporta formatos binários (.db) e SQL (.sql)
  - Valida a integridade do banco de dados após a restauração
  - Se a restauração falhar, restaura automaticamente a partir do backup de segurança
  - Todas as sessões são limpas após uma restauração bem-sucedida por segurança
  - Retorna `requiresReauth: true` para indicar que o usuário precisa entrar novamente
  - A operação de restauração é registrada no log de auditoria
  - Para o formato SQL, valida o conteúdo SQL antes da execução
  - A conexão com o banco de dados é reinicializada após a restauração
  - Todos os caches são invalidados após a restauração

## Timestamps de backup {/* #backup-timestamps */}

### Obter timestamps do último backup - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Endpoint**: `/api/backups/last-timestamps`
- **Método**: GET
- **Descrição**: recupera o timestamp do último backup para cada combinação de servidor-backup. Retorna um mapa para facilitar a consulta.
- **Autenticação**: requer sessão válida e token CSRF
- **Resposta**:

  ```json
  {
    "timestamps": {
      "server-id-1:Backup Name 1": "2024-03-20T10:00:00Z",
      "server-id-1:Backup Name 2": "2024-03-20T11:00:00Z",
      "server-id-2:Backup Name 1": "2024-03-20T12:00:00Z"
    },
    "raw": [
      {
        "server_name": "Server Name",
        "server_id": "server-id-1",
        "backup_name": "Backup Name 1",
        "date": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```

- **Respostas de erro**:
  - `401`: não autorizado - Sessão ou token CSRF inválido
  - `500`: falha ao buscar timestamps do último backup
- **Observações**:
  - Retorna tanto um mapa (para facilitar a consulta por `server_id:backup_name`) quanto o formato de array bruto
  - Inclui cabeçalhos de controle de cache para evitar armazenamento em cache
  - Útil para rastrear horários do último backup em todas as combinações de servidor-backup
  - Os timestamps estão no formato ISO

## Gerenciamento de logs do aplicativo {/* #application-logs-management */}

### Obter logs do aplicativo - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpoint**: `/api/application-logs`
- **Método**: GET
- **Descrição**: recupera entradas de log do aplicativo a partir de arquivos de log. Suporta a leitura de arquivos de log atuais e rotacionados com funcionalidade de tail.
- **Autenticação**: requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de consulta**:
  - `file` (opcional): nome do arquivo de log a ser lido - `application.log`, `application.log.1`, `application.log.2`, etc. Se não fornecido, retorna a lista de arquivos disponíveis
  - `tail` (opcional): número de linhas a retornar a partir do final do arquivo (padrão: 1000, mín: 1, máx: 10000)
- **Resposta** (com parâmetro de arquivo):

  ```json
  {
    "logs": "log content as string...",
    "fileSize": 1024000,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 5000,
    "currentFile": "application.log",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Resposta** (sem parâmetro de arquivo):

  ```json
  {
    "logs": "",
    "fileSize": 0,
    "lastModified": "2024-03-20T10:00:00Z",
    "lineCount": 0,
    "currentFile": "",
    "availableFiles": ["application.log", "application.log.1", "application.log.2"]
  }
  ```

- **Respostas de erro**:
  - `400`: parâmetro tail inválido (deve ser de 1 a 10000) ou formato inválido do parâmetro file
  - `401`: não autorizado - Sessão ou token CSRF inválido
  - `403`: proibido - Privilégios de administrador necessários
  - `404`: arquivo de log não encontrado
  - `500`: falha ao ler o arquivo de log
- **Observações**:
  - Acessível apenas para usuários administradores
  - Suporta a leitura do arquivo de log atual e de arquivos de log rotacionados (até 10 arquivos rotacionados)
  - Retorna as últimas N linhas (tail) do arquivo de log especificado
  - O nome do arquivo de log é determinado pela variável de ambiente (padrão: `application.log`)
  - Retorna a lista de arquivos de log disponíveis quando o parâmetro file não é fornecido
  - Os nomes dos arquivos são validados para evitar ataques de directory traversal
  - Os arquivos rotacionados são numerados sequencialmente (`.1`, `.2`, etc.)

### Exportar Logs do Aplicativo - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Endpoint**: `/api/application-logs/export`
- **Método**: GET
- **Descrição**: Exporta entradas de log do aplicativo em formato de texto filtrado. Suporta filtragem por nível de log e string de pesquisa.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de consulta**:
  - `file` (obrigatório): Nome do arquivo de log a ser exportado - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (opcional): Lista separada por vírgulas de níveis de log a incluir - `INFO`, `WARN`, `ERROR` (padrão: `INFO,WARN,ERROR`)
  - `search` (opcional): String de pesquisa para filtrar linhas de log (não diferencia maiúsculas de minúsculas)
- **Resposta**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Conteúdo do log filtrado como texto simples
- **Respostas de erro**:
  - `400`: O parâmetro file é obrigatório ou o formato do parâmetro file é inválido
  - `401`: Unauthorized - Sessão ou token CSRF inválido
  - `403`: Forbidden - Privilégios de administrador necessários
  - `500`: Falha ao exportar logs
- **Notas**:
  - Acessível apenas para usuários administradores
  - Exporta entradas de log filtradas com base no nível de log e nos critérios de pesquisa
  - Suporta filtragem pelos níveis de log: `INFO`, `WARN`, `ERROR`
  - A filtragem por string de pesquisa não diferencia maiúsculas de minúsculas
  - Linhas vazias são filtradas automaticamente
  - O nome do arquivo de log é determinado pela variável de ambiente (padrão: `application.log`)
  - Os nomes dos arquivos são validados para evitar ataques de directory traversal
  - O arquivo exportado inclui timestamp no nome do arquivo
  - Útil para análise externa e solução de problemas
