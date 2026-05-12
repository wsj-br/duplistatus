# Administração {#administration}

## Coletar Backups - `/api/backups/collect` {#collect-backups---apibackupscollect}
- **Endpoint**: `/api/backups/collect`
- **Method**: POST
- **Description**: Coleta dados de backup diretamente de um servidor Duplicati por meio de sua API. Este endpoint detecta automaticamente o melhor protocolo de conexão (HTTPS com validação SSL, HTTPS com certificados autoassinados ou HTTP como alternativa) e se conecta ao servidor Duplicati para recuperar as informações de backup e processá-las no banco de dados local.
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

- **Respostas de Erro**:
  - `400`: Parâmetros de requisição inválidos ou falha na conexão
  - `500`: Erro do servidor durante a coleta de backup
- **Notas**: 
  - O endpoint detecta automaticamente o protocolo de conexão ideal (HTTPS → HTTPS com certificado autoassinado → HTTP)
  - As tentativas de detecção de protocolo são feitas na ordem de preferência de segurança
  - Os tempos limite de conexão podem ser configurados por meio de variáveis de ambiente
  - Registra dados coletados no modo de desenvolvimento para depuração
  - Garante que as configurações de backup estejam completas para todos os servidores e backups
  - Usa a porta padrão 8200 se não for especificada
  - O protocolo detectado e a URL do servidor são armazenados automaticamente no banco de dados
  - `serverAlias` é recuperado do banco de dados e pode estar vazio se nenhum apelido for definido
  - A interface deve usar `serverAlias || serverName` para fins de exibição
  - Suporta métodos de download JSON e coleta direta via API

## Limpar Backups - `/api/backups/cleanup` {#cleanup-backups---apibackupscleanup}
- **Endpoint**: `/api/backups/cleanup`
- **Method**: POST
- **Description**: Exclui dados antigos de backup com base no período de retenção. Este endpoint ajuda a gerenciar o tamanho do banco de dados removendo registros de backup desatualizados, preservando dados recentes e importantes.
- **Autenticação**: Requer sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "retentionPeriod": "6 months"
  }
  ```

- **Períodos de Retenção**: `"6 months"`, `"1 year"`, `"2 years"`, `"Delete all data"`
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

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: Período de retenção inválido especificado
  - `500`: Erro do servidor durante a operação de limpeza com informações detalhadas do erro
- **Notas**: 
  - A operação de limpeza é irreversível
  - Os dados de backup são permanentemente excluídos do banco de dados
  - Os registros de máquinas são preservados mesmo que todos os backups sejam excluídos
  - Quando "Excluir todos os dados" é selecionado, todas as máquinas e backups são removidos e a configuração é limpa
  - O relatório de erros aprimorado inclui detalhes e rastreamento de pilha no modo de desenvolvimento
  - Suporta retenção baseada em tempo e exclusão completa de dados

## Excluir Tarefa de Backup - `/api/backups/delete-job` {#delete-backup-job---apibackupsdelete-job}
- **Endpoint**: `/api/backups/delete-job`
- **Method**: DELETE
- **Description**: Exclui todos os registros de backup para uma combinação específica de servidor e backup. Este endpoint está disponível apenas no modo de desenvolvimento.
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

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: A exclusão de tarefa de backup está disponível apenas no modo de desenvolvimento
  - `400`: ID do servidor e nome do backup são obrigatórios
  - `404`: Nenhum backup encontrado para exclusão
  - `500`: Erro do servidor durante a exclusão com informações detalhadas do erro
- **Notas**: 
  - Esta operação está disponível apenas no modo de desenvolvimento
  - Esta operação é irreversível
  - Todos os registros de backup para a combinação servidor-backup especificada serão permanentemente excluídos
  - Retorna a contagem de backups excluídos e as informações do servidor
  - Usa o apelido do servidor para exibição, se disponível; caso contrário, usa o nome do servidor

## Sincronizar Agendamentos de Backup - `/api/backups/sync-schedule` {#sync-backup-schedules---apibackupssync-schedule}
- **Endpoint**: `/api/backups/sync-schedule`
- **Method**: POST
- **Description**: Sincroniza as informações de agendamento de backup de um servidor Duplicati. Este endpoint se conecta ao servidor, recupera as informações de agendamento para todos os backups e atualiza as configurações locais de backup com detalhes do agendamento, incluindo intervalos de repetição, dias da semana permitidos e horários do agendamento.
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

Ou apenas com serverId (usa a senha armazenada):

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
  - `404`: Servidor não encontrado (quando serverId fornecido) ou senha não armazenada para o servidor
  - `500`: Erro do servidor durante a sincronização do agendamento
- **Notas**:
  - O endpoint detecta automaticamente o protocolo de conexão ideal (HTTPS → HTTPS com certificado autoassinado → HTTP)
  - Pode ser chamado apenas com serverId para usar as credenciais armazenadas do servidor
  - Pode ser chamado com serverId e novas credenciais para atualizar os detalhes de conexão do servidor
  - Pode ser chamado com hostname/porta/senha sem serverId para novos servidores
  - Atualiza as configurações de backup com informações de agendamento, incluindo:
    - `expectedInterval`: O intervalo de repetição (por exemplo, "Diariamente", "Semanalmente", "Mensalmente")
    - `allowedWeekDays`: Array dos dias da semana permitidos (0=Domingo, 1=Segunda, etc.)
    - `time`: O horário agendado para o backup
  - Processa todos os backups encontrados no servidor
  - Retorna estatísticas sobre os backups processados e quaisquer erros encontrados
  - Registra eventos de auditoria para operações de sincronização bem-sucedidas e com falha
  - Usa a porta padrão 8200 se não especificada

## Testar Conexão com o Servidor - `/api/servers/test-connection` {#test-server-connection---apiserverstest-connection}
- **Endpoint**: `/api/servers/test-connection`
- **Method**: POST
- **Description**: Testa a conexão com um servidor Duplicati para verificar se ele está acessível.
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
  - `500`: Erro do servidor durante o teste de conexão
- **Notas**:
  - O endpoint valida o formato da URL e testa a conectividade
  - Retorna sucesso se o servidor responder com status 401 (esperado para o endpoint de login sem credenciais)
  - Testa a conexão com o endpoint de login do servidor Duplicati
  - Suporta os protocolos HTTP e HTTPS
  - Usa a configuração de tempo limite para o teste de conexão

## Obter URL do Servidor - `/api/servers/:serverId/server-url` {#get-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: GET
- **Description**: Recupera a URL do servidor para um servidor específico.
- **Parâmetros**:
  - `serverId`: o identificador do servidor

- **Resposta**:

  ```json
  {
    "serverId": "server-id",
    "server_url": "http://localhost:8200"
  }
  ```

- **Respostas de Erro**:
  - `404`: Servidor não encontrado
  - `500`: Erro do servidor
- **Notas**:
  - Retorna a URL do servidor para o servidor específico
  - Utilizado para gerenciamento de conexão do servidor
  - Retorna string vazia se nenhuma URL do servidor estiver definida

## Atualizar URL do Servidor - `/api/servers/:serverId/server-url` {#update-server-url---apiserversserveridserver-url}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Method**: PATCH
- **Description**: Atualiza a URL do servidor para um servidor específico.
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros**:
  - `serverId`: o identificador do servidor
- **Corpo da Requisição**:

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

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `400`: Formato de URL inválido
  - `404`: Servidor não encontrado
  - `500`: Erro do servidor durante a atualização
- **Notas**:
  - O endpoint valida o formato da URL antes da atualização
  - URLs de servidor vazias ou nulas são permitidas
  - Suporta os protocolos HTTP e HTTPS
  - Retorna as informações atualizadas do servidor

## Obter Senha do Servidor - `/api/servers/:serverId/password` {#get-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: GET
- **Description**: Recupera um token CSRF para operações de senha do servidor.
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

- **Respostas de Erro**:
  - `401`: Sessão inválida ou expirada
  - `500`: Falha ao gerar token CSRF
- **Notas**:
  - Retorna token CSRF para uso em operações de atualização de senha
  - A sessão deve ser válida para gerar o token

## Atualizar Senha do Servidor - `/api/servers/:serverId/password` {#update-server-password---apiserversserveridpassword}
- **Endpoint**: `/api/servers/:serverId/password`
- **Method**: PATCH
- **Description**: Atualiza a senha de um servidor específico.
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros**:
  - `serverId`: o identificador do servidor
- **Corpo da Requisição**:

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

- **Respostas de Erro**:
  - `400`: A senha deve ser uma string
  - `401`: Não autorizado - Sessão ou token CSRF inválidos
  - `500`: Falha ao atualizar a senha
- **Notas**:
  - A senha pode ser uma string vazia para limpar a senha
  - A senha é armazenada com segurança usando o sistema de gerenciamento de segredos

## Gerenciamento de Usuários {#user-management}

### Listar Usuários - `/api/users` {#list-users---apiusers}
- **Endpoint**: `/api/users`
- **Method**: GET
- **Description**: Lista todos os usuários com paginação e filtro de pesquisa opcional. Retorna informações do usuário, incluindo histórico de login e status da conta.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de Consulta**:
  - `page` (opcional): Número da página (padrão: 1)
  - `limit` (opcional): Itens por página (padrão: 50)
  - `search` (opcional): Termo de pesquisa para filtrar por nome de usuário
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
  - `401`: Não autorizado - Sessão ou token CSRF inválidos
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Erro interno do servidor
- **Notas**:
  - Apenas acessível para usuários administradores
  - Suporta paginação e filtro de pesquisa
  - Retorna o status da conta do usuário, incluindo status de bloqueio

### Criar Usuário - `/api/users` {#create-user---apiusers}
- **Endpoint**: `/api/users`
- **Method**: POST
- **Description**: Cria uma nova conta de usuário. Pode gerar uma senha temporária ou usar uma senha fornecida.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da requisição**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true
  }
  ```

- `username`: Obrigatório, deve ter entre 3 e 50 caracteres, único
  - `password`: Opcional, se não fornecido, uma senha temporária segura será gerada
  - `isAdmin`: Opcional, padrão false
  - `requirePasswordChange`: Opcional, padrão true
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

- `temporaryPassword` é incluído apenas se uma senha foi gerada automaticamente
- **Respostas de Erro**:
  - `400`: Formato de nome de usuário inválido, violação da política de senhas ou erros de validação
  - `401`: Não autorizado - Sessão ou token CSRF inválidos
  - `403`: Proibido - Privilégios de administrador necessários
  - `409`: Nome de usuário já existe
  - `500`: Erro interno do servidor
- **Notas**:
  - Apenas acessível para usuários administradores
  - O nome de usuário é sem distinção de maiúsculas e minúsculas e armazenado em letras minúsculas
  - Se a senha não for fornecida, uma senha segura de 12 caracteres será gerada
  - Senhas temporárias geradas são retornadas apenas uma vez na resposta
  - A criação de usuário é registrada no Registro de Auditoria

### Atualizar Usuário - `/api/users/:id` {#update-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: PATCH
- **Description**: Atualiza as informações do usuário, incluindo nome de usuário, status de administrador, exigência de alteração de senha e redefinição de senha.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros**:
  - `id`: ID do usuário a ser atualizado
- **Corpo da Solicitação**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true
  }
  ```

- Todos os campos são opcionais
  - `resetPassword`: Se verdadeiro, gera uma nova senha temporária e define `requirePasswordChange` como verdadeiro
- **Resposta** (com redefinição de senha):

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

- **Resposta** (sem redefinição de senha):

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
  - `400`: Entrada inválida ou erros de validação
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `403`: Proibido - Privilégios de administrador necessários
  - `404`: Usuário não encontrado
  - `409`: Nome de usuário já existe (se alterar o nome de usuário)
  - `500`: Erro interno do servidor
- **Notas**:
  - Apenas acessível para usuários administradores
  - Alterações de nome de usuário são validadas quanto à unicidade
  - A redefinição de senha gera uma senha temporária segura de 12 caracteres
  - Todas as alterações são registradas no log de auditoria

### Excluir Usuário - `/api/users/:id` {#delete-user---apiusersid}
- **Endpoint**: `/api/users/:id`
- **Method**: DELETE
- **Description**: Exclui uma conta de usuário. Impede a exclusão do próprio usuário ou da última conta de administrador.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros**:
  - `id`: ID do usuário a ser excluído
- **Resposta**:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- **Respostas de Erro**:
  - `400`: Não é possível excluir sua própria conta ou a última conta de administrador
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `403`: Proibido - Privilégios de administrador necessários
  - `404`: Usuário não encontrado
  - `500`: Erro interno do servidor
- **Notas**:
  - Apenas acessível para usuários administradores
  - Não é possível excluir sua própria conta
  - Não é possível excluir a última conta de administrador (pelo menos um administrador deve permanecer)
  - A exclusão do usuário é registrada no log de auditoria
  - As sessões associadas são automaticamente excluídas (em cascata)

## Gerenciamento de Registro de Auditoria {#audit-log-management}

### Listar Registros de Auditoria - `/api/audit-log` {#list-audit-logs---apiaudit-log}
- **Endpoint**: `/api/audit-log`
- **Method**: GET
- **Description**: Recupera entradas do registro de auditoria com filtros, paginação e capacidade de pesquisa. Suporta paginação baseada em página e baseada em deslocamento.
- **Autenticação**: Requer sessão válida e token CSRF (usuário logado necessário)
- **Parâmetros de Consulta**:
  - `page` (opcional): Número da página para paginação baseada em página
  - `offset` (opcional): Deslocamento para paginação baseada em offset (tem precedência sobre a página)
  - `limit` (opcional): Itens por página (padrão: 50)
  - `startDate` (opcional): Filtrar registros a partir desta data (formato ISO)
  - `endDate` (opcional): Filtrar registros até esta data (formato ISO)
  - `userId` (opcional): Filtrar por ID de usuário
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

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `500`: Erro interno do servidor
- **Notas**:
  - Suporta paginação baseada em página (`page`) e baseada em offset (`offset`)
  - O campo `details` contém JSON analisado com contexto adicional
  - Todas as consultas ao registro de auditoria são registradas

### Obter Valores de Filtro do Registro de Auditoria - `/api/audit-log/filters` {#get-audit-log-filter-values---apiaudit-logfilters}
- **Endpoint**: `/api/audit-log/filters`
- **Method**: GET
- **Description**: Recupera valores exclusivos de filtro disponíveis para filtrar registros de auditoria. Retorna todas as ações, categorias e status distintos existentes no banco de dados do registro de auditoria. Útil para preencher listas suspensas de filtro na interface do usuário.
- **Autenticação**: Requer sessão válida e token CSRF (usuário logado necessário)
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

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão inválida ou token CSRF
  - `500`: Erro interno do servidor
- **Notas**:
  - Retorna arrays com valores únicos do banco de dados do registro de auditoria
  - Os valores são ordenados alfabeticamente
  - Arrays vazios são retornados se não houver dados ou em caso de erro
  - Utilizado pelo visualizador de log de auditoria para preencher dinamicamente as listas suspensas de filtro

### Baixar Registros de Auditoria - `/api/audit-log/download` {#download-audit-logs---apiaudit-logdownload}
- **Endpoint**: `/api/audit-log/download`
- **Method**: GET
- **Description**: Baixa registros de auditoria nos formatos CSV ou JSON com filtro opcional. Útil para análise externa e relatórios.
- **Autenticação**: Requer sessão válida e token CSRF (usuário logado necessário)
- **Parâmetros de consulta**:
  - `format` (opcional): Formato de exportação - `csv` ou `json` (padrão: `csv`)
  - `startDate` (opcional): Filtra registros a partir desta data (formato ISO)
  - `endDate` (opcional): Filtra registros até esta data (formato ISO)
  - `userId` (opcional): Filtra por ID do usuário
  - `username` (opcional): Filtrar por nome de usuário
  - `action` (opcional): Filtra por nome da ação
  - `category` (opcional): Filtra por categoria
  - `status` (opcional): Filtra por status
- **Resposta** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Arquivo CSV com cabeçalhos: ID, Data e hora, ID do Usuário, Nome de usuário, Ação, Categoria, Tipo de Destino, ID do Destino, Status, Endereço IP, Agente do Usuário, Detalhes, Mensagem de erro
- **Resposta** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Array JSON de entradas de registro de auditoria
- **Respostas de erro**:
  - `400`: Nenhum registro para exportar
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Erro interno do servidor
- **Observações**:
  - Limite de exportação é de 10.000 registros
  - Formato CSV escapa corretamente caracteres especiais
  - Campo Detalhes no CSV é serializado em JSON
  - Nome do arquivo inclui a data atual

### Limpar Registros de Auditoria - `/api/audit-log/cleanup` {#cleanup-audit-logs---apiaudit-logcleanup}
- **Endpoint**: `/api/audit-log/cleanup`
- **Method**: POST
- **Description**: Aciona manualmente a limpeza de registros de auditoria antigos com base no período de retenção. Suporta o modo de simulação para visualizar o que será excluído.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da requisição**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (opcional): Substitui os dias de retenção (30-365), caso contrário usa o valor configurado
  - `dryRun` (opcional): Se verdadeiro, apenas retorna o que seria excluído sem realmente excluir
- **Resposta** (simulação):

  ```json
  {
    "dryRun": true,
    "wouldDeleteCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90,
    "cutoffDate": "2024-01-01"
  }
  ```

- **Resposta** (limpeza real):

  ```json
  {
    "success": true,
    "deletedCount": 50,
    "oldestRemaining": "2024-01-01T00:00:00Z",
    "retentionDays": 90
  }
  ```

- **Respostas de erro**:
  - `400`: Dias de retenção inválidos (deve ser entre 30 e 365)
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Erro interno do servidor
- **Observações**:
  - Apenas acessível para usuários administradores
  - Retenção padrão é de 90 dias se não configurado
  - Operação de limpeza é registrada no log de auditoria
  - Modo de simulação é útil para visualizar o impacto da limpeza

### Obter Retenção de Log de Auditoria - `/api/audit-log/retention` {#get-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: GET
- **Descrição**: Recupera a configuração atual de retenção de log de auditoria em dias.
- **Autenticação**: Requer sessão válida e token CSRF (nenhum usuário logado necessário)
- **Resposta**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Respostas de erro**:
  - `500`: Erro interno do servidor
- **Observações**:
  - Retenção padrão é de 90 dias se não configurado
  - Pode ser acessado sem autenticação (somente leitura)

### Atualizar Retenção de Log de Auditoria - `/api/audit-log/retention` {#update-audit-log-retention---apiaudit-logretention}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: PATCH
- **Descrição**: Atualiza o período de retenção de log de auditoria em dias. Esta configuração determina por quanto tempo os logs de auditoria são mantidos antes da limpeza automática.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da requisição**:

  ```json
  {
    "retentionDays": 120
  }
  ```

- `retentionDays`: Obrigatório, deve estar entre 30 e 365 dias
- **Resposta**:

  ```json
  {
    "success": true,
    "retentionDays": 120
  }
  ```

- **Respostas de erro**:
  - `400`: Dias de retenção inválidos (deve ser entre 30 e 365)
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Erro interno do servidor
- **Notas**:
  - Apenas acessível para usuários administradores
  - A alteração de configuração é registrada no Registro de Auditoria
  - O período de retenção afeta operações de limpeza automáticas e manuais

## Gerenciamento de Banco de Dados {#database-management}

### Fazer Backup do Banco de Dados - `/api/database/backup` {#backup-database---apidatabasebackup}
- **Endpoint**: `/api/database/backup`
- **Método**: GET
- **Descrição**: Cria um backup do banco de dados em formato binário (.db) ou SQL (.sql). O arquivo de backup é automaticamente baixado com um nome contendo carimbo de data/hora.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de Consulta**:
  - `format` (opcional): Formato do backup - `db` (binário) ou `sql` (dump SQL). Padrão: `db`
- **Resposta**:
  - Content-Type: `application/octet-stream` (para .db) ou `text/plain` (para .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ou `.sql`
  - Conteúdo binário do arquivo (para .db) ou conteúdo textual SQL (para .sql)
- **Respostas de Erro**:
  - `400`: Formato inválido (deve ser "db" ou "sql")
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Falha ao criar backup do banco de dados
- **Notas**:
  - Apenas acessível para usuários administradores
  - O formato binário utiliza o método de backup do SQLite para garantir integridade
  - O formato SQL cria um dump textual de todo o conteúdo do banco de dados
  - A data e hora no nome do arquivo utiliza o fuso horário local do servidor
  - A operação de backup é registrada no Registro de Auditoria
  - Arquivos temporários são automaticamente removidos após o download

### Restaurar Banco de Dados - `/api/database/restore` {#restore-database---apidatabaserestore}
- **Endpoint**: `/api/database/restore`
- **Método**: POST
- **Descrição**: Restaura o banco de dados a partir de um arquivo de backup (formato .db ou .sql). Cria um backup de segurança antes da restauração e limpa todas as sessões após a restauração por motivos de segurança.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da Requisição**: FormData com um campo de arquivo chamado `database`
  - O arquivo deve ser `.db`, `.sqlite`, `.sqlite3` (formato binário) ou `.sql` (formato SQL)
  - Tamanho máximo do arquivo: 100MB
- **Resposta**:

  ```json
  {
    "success": true,
    "message": "Database restored successfully from DB file",
    "safetyBackupPath": "duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db",
    "requiresReauth": true
  }
  ```

- **Respostas de Erro**:
  - `400`: Nenhum arquivo fornecido, tamanho do arquivo excede o limite, formato inválido ou falha na verificação de integridade do banco de dados
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Falha ao restaurar banco de dados (banco de dados original restaurado a partir do backup de segurança se a restauração falhar)
- **Notas**:
  - Apenas acessível para usuários administradores
  - Cria automaticamente um backup de segurança antes da restauração
  - Suporta formatos binário (.db) e SQL (.sql)
  - Valida a integridade do banco de dados após a restauração
  - Se a restauração falhar, restaura automaticamente a partir do backup de segurança
  - Todas as sessões são limpas após restauração bem-sucedida por segurança
  - Retorna `requiresReauth: true` para indicar que o usuário precisa fazer login novamente
  - A operação de restauração é registrada no Registro de Auditoria
  - Para o formato SQL, valida o conteúdo SQL antes da execução
  - A conexão com o banco de dados é reinitializada após a restauração
  - Todos os caches são invalidados após a restauração

## Timestamps de Backup {#backup-timestamps}

### Obter Carimbos de Data/Hora do Último Backup - `/api/backups/last-timestamps` {#get-last-backup-timestamps---apibackupslast-timestamps}
- **Endpoint**: `/api/backups/last-timestamps`
- **Método**: GET
- **Descrição**: Recupera o carimbo de data/hora do último backup para cada combinação servidor-backup. Retorna um mapa para facilitar a consulta.
- **Autenticação**: Requer sessão válida e token CSRF
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

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao buscar últimas data e hora dos backups
- **Notas**:
  - Retorna tanto um mapa (para fácil consulta por `server_id:backup_name`) quanto o formato de array bruto
  - Inclui cabeçalhos de controle de cache para evitar armazenamento em cache
  - Útil para rastrear os horários do último backup em todas as combinações de servidor e backup
  - Os carimbos de data/hora estão no formato ISO

## Gerenciamento de Logs da Aplicação {#application-logs-management}

### Obter Logs da Aplicação - `/api/application-logs` {#get-application-logs---apiapplication-logs}
- **Endpoint**: `/api/application-logs`
- **Método**: GET
- **Descrição**: Recupera entradas de log da aplicação a partir dos arquivos de log. Suporta leitura de arquivos de log atuais e rotacionados com funcionalidade de tail.
- **Autenticação**: Exige privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de consulta**:
  - `file` (opcional): Nome do arquivo de log a ser lido - `application.log`, `application.log.1`, `application.log.2`, etc. Se não for fornecido, retorna a lista de arquivos disponíveis
  - `tail` (opcional): Número de linhas a retornar do final do arquivo (padrão: 1000, mínimo: 1, máximo: 10000)
- **Resposta** (com o parâmetro de arquivo):

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

- **Resposta** (sem o parâmetro de arquivo):

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
  - `400`: Parâmetro tail inválido (deve estar entre 1 e 10000) ou formato inválido do parâmetro de arquivo
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `404`: Arquivo de log não encontrado
  - `500`: Falha ao ler o arquivo de log
- **Observações**:
  - Acesso permitido apenas a usuários administradores
  - Oferece suporte à leitura do arquivo de log atual e arquivos de log rotacionados (até 10 arquivos rotacionados)
  - Retorna as últimas N linhas (tail) do arquivo de log especificado
  - O nome do arquivo de log é determinado pela variável de ambiente (padrão: `application.log`)
  - Retorna a lista de arquivos de log disponíveis quando o parâmetro de arquivo não é fornecido
  - Os nomes de arquivos são validados para evitar ataques de travessia de diretório
  - Os arquivos rotacionados são numerados sequencialmente (`.1`, `.2`, etc.)

### Exportar Logs da Aplicação - `/api/application-logs/export` {#export-application-logs---apiapplication-logsexport}
- **Endpoint**: `/api/application-logs/export`
- **Método**: GET
- **Descrição**: Exporta entradas de log da aplicação em formato de texto filtrado. Suporta filtragem por nível de log e string de pesquisa.
- **Autenticação**: Exige privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de consulta**:
  - `file` (obrigatório): Nome do arquivo de log a ser exportado - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (opcional): Lista separada por vírgulas dos níveis de log a incluir - `INFO`, `WARN`, `ERROR` (padrão: `INFO,WARN,ERROR`)
  - `search` (opcional): String de pesquisa para filtrar linhas de log (não diferencia maiúsculas e minúsculas)
- **Resposta**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Conteúdo do log filtrado como texto simples
- **Respostas de erro**:
  - `400`: O parâmetro de arquivo é obrigatório ou possui formato inválido
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Falha ao exportar os logs
- **Observações**:
  - Acesso permitido apenas a usuários administradores
  - Exporta entradas de log filtradas com base no nível de log e nos critérios de pesquisa
  - Oferece suporte à filtragem por níveis de log: `INFO`, `WARN`, `ERROR`
  - A filtragem por string de pesquisa não diferencia maiúsculas e minúsculas
  - Linhas vazias são automaticamente filtradas
  - O nome do arquivo de log é determinado pela variável de ambiente (padrão: `application.log`)
  - Os nomes de arquivos são validados para evitar ataques de travessia de diretório
  - O arquivo exportado inclui o carimbo de data/hora no nome do arquivo
  - Útil para análise externa e solução de problemas
