# Administração {/* #administration */}

## Coletar Backups - `/api/backups/collect` {/* #collect-backups---apibackupscollect */}
- **Endpoint**: `/api/backups/collect`
- **Método**: POST
- **Descrição**: Coleta dados de backup diretamente de um servidor Duplicati por meio de sua API. Este endpoint detecta automaticamente o melhor protocolo de conexão (HTTPS com validação SSL, HTTPS com certificados autoassinados ou HTTP como fallback) e se conecta ao servidor Duplicati para recuperar as informações do backup e processá-las no banco de dados local.
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
  - `400`: Parâmetros de solicitação inválidos ou Falha na Conexão
  - `500`: Erro do servidor durante a coleta de backup
- **Notas**: 
  - O endpoint detecta automaticamente o protocolo de conexão ideal (HTTPS → HTTPS com autoassinado → HTTP)
  - As tentativas de detecção de protocolo são feitas em ordem de preferência de segurança
  - Os tempos limite de conexão são configuráveis por meio de variáveis de ambiente
  - Registra os dados coletados no modo de desenvolvimento para depuração
  - Garante que as configurações de backup estejam completas para todos os servidores e todos os backups
  - Usa a porta padrão 8200 se não for especificada
  - O protocolo detectado e a URL do servidor são armazenados automaticamente no banco de dados
  - `serverAlias` é recuperado do banco de dados e pode estar vazio se nenhum alias estiver definido
  - O frontend deve usar `serverAlias || serverName` para fins de exibição
  - Suporta os métodos de download de JSON e coleta direta por API

## Limpar Backups - `/api/backups/cleanup` {/* #cleanup-backups---apibackupscleanup */}
- **Endpoint**: `/api/backups/cleanup`
- **Método**: POST
- **Descrição**: Exclui dados de backup antigos com base no período de retenção. Este endpoint ajuda a gerenciar o tamanho do banco de dados removendo registros de backup desatualizados, preservando dados recentes e importantes.
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
  - `400`: Período de retenção especificado inválido
  - `500`: Erro do servidor durante a operação de limpeza com informações detalhadas do erro
- **Notas**: 
  - A operação de limpeza é irreversível
  - Os dados de backup são excluídos permanentemente do banco de dados
  - Os registros da máquina são preservados mesmo se todos os backups forem excluídos
  - Quando "Excluir todos os dados" é selecionado, todas as máquinas e backups são removidos e a configuração é limpa
  - O relatório de erros aprimorado inclui detalhes e rastreamento de pilha no modo de desenvolvimento
  - Suporta retenção baseada em tempo e exclusão completa de dados

## Excluir Tarefa de Backup - `/api/backups/delete-job` {/* #delete-backup-job---apibackupsdelete-job */}
- **Endpoint**: `/api/backups/delete-job`
- **Método**: DELETE
- **Descrição**: Exclui todos os registros de backup para uma combinação específica de servidor e backup. Este endpoint está disponível apenas no modo de desenvolvimento.
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
  - `403`: A exclusão da tarefa de backup está disponível apenas no modo de desenvolvimento
  - `400`: O ID do Servidor e o Nome do Backup são obrigatórios
  - `404`: Nenhum backup encontrado para excluir
  - `500`: Erro do servidor durante a exclusão com informações detalhadas do erro
- **Notas**: 
  - Esta operação está disponível apenas no modo de desenvolvimento
  - Esta operação é irreversível
  - Todos os registros de backup para a combinação especificada de servidor e backup serão excluídos permanentemente
  - Retorna a contagem de backups excluídos e informações do servidor
  - Usa o Alias do servidor para exibição, se disponível, caso contrário, usa o Nome do Servidor

## Sincronizar Agendamentos de Backup - `/api/backups/sync-schedule` {/* #sync-backup-schedules---apibackupssync-schedule */}
- **Endpoint**: `/api/backups/sync-schedule`
- **Método**: POST
- **Descrição**: Sincroniza informações de agendamento de backup de um servidor Duplicati. Este endpoint se conecta ao servidor, recupera informações de agendamento para todos os backups e atualiza as configurações de backup locais com detalhes do agendamento, incluindo intervalos de repetição, dias da semana permitidos e horários agendados.
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
  - `400`: Parâmetros de solicitação inválidos, nome do host/senha ausentes quando serverId não é fornecido, ou falha na conexão
  - `404`: Servidor não encontrado (quando serverId é fornecido) ou nenhuma senha armazenada para o servidor
  - `500`: Erro no servidor durante a sincronização de agendamento
- **Notas**: 
  - O endpoint detecta automaticamente o protocolo de conexão ideal (HTTPS → HTTPS com certificado autoassinado → HTTP)
  - Pode ser chamado apenas com serverId para usar as credenciais armazenadas do servidor
  - Pode ser chamado com serverId e novas credenciais para atualizar os detalhes de conexão do servidor
  - Pode ser chamado com nome do host/porta/senha sem serverId para novos servidores
  - Atualiza as configurações de backup com informações de agendamento, incluindo:
    - `expectedInterval`: O intervalo de repetição (por exemplo, "Diário", "Semanal", "Mensal")
    - `allowedWeekDays`: Array de dias da semana permitidos (0=Domingo, 1=Segunda-feira, etc.)
    - `time`: A hora agendada para o backup
  - Processa todos os backups encontrados no servidor
  - Retorna estatísticas sobre os backups processados e quaisquer erros encontrados
  - Registra eventos de auditoria para operações de sincronização bem-sucedidas e com falha
  - Usa a porta padrão 8200 se não for especificada

## Testar Conexão do Servidor - `/api/servers/test-connection` {/* #test-server-connection---apiserverstest-connection */}
- **Endpoint**: `/api/servers/test-connection`
- **Método**: POST
- **Descrição**: Testa a conexão com um servidor duplicati para verificar se está acessível.
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
  - `500`: Erro no servidor durante o teste de conexão
- **Notas**: 
  - O endpoint valida o formato da URL e testa a conectividade
  - Retorna sucesso se o servidor responder com um status 401 (esperado para o endpoint de login sem credenciais)
  - Testa a conexão com o endpoint de login do servidor duplicati
  - Suporta os protocolos HTTP e HTTPS
  - Usa a configuração de tempo limite para o teste de conexão

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

- **Respostas de Erro**:
  - `404`: Servidor não encontrado
  - `500`: Erro no servidor
- **Notas**:
  - Retorna a URL do servidor para um servidor específico
  - Usado para gerenciamento de conexão do servidor
  - Retorna uma string vazia se nenhuma URL do servidor estiver definida

## Atualizar URL do Servidor - `/api/servers/:serverId/server-url` {/* #update-server-url---apiserversserveridserver-url */}
- **Endpoint**: `/api/servers/:serverId/server-url`
- **Método**: PATCH
- **Descrição**: Atualiza a URL do servidor para um servidor específico.
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
  - `500`: Erro no servidor durante a atualização
- **Notas**: 
  - O endpoint valida o formato da URL antes de atualizar
  - URLs de servidor vazias ou nulas são permitidas
  - Suporta os protocolos HTTP e HTTPS
  - Retorna as informações atualizadas do servidor

## Obter Senha do Servidor - `/api/servers/:serverId/password` {/* #get-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Método**: GET
- **Descrição**: Recupera um token CSRF para operações de senha do servidor.
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
  - Retorna token CSRF para uso com operações de atualização de senha
  - A sessão deve ser válida para gerar o token

## Atualizar Senha do Servidor - `/api/servers/:serverId/password` {/* #update-server-password---apiserversserveridpassword */}
- **Endpoint**: `/api/servers/:serverId/password`
- **Método**: PATCH
- **Descrição**: Atualiza a senha para um servidor específico.
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
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Falha ao atualizar a senha
- **Notas**:
  - A senha pode ser uma string vazia para limpar a senha
  - A senha é armazenada com segurança usando o sistema de gerenciamento de segredos

## Gerenciamento de Usuários {/* #user-management */}

### Listar Usuários - `/api/users` {/* #list-users---apiusers */}
- **Endpoint**: `/api/users`
- **Método**: GET
- **Descrição**: Lista todos os usuários com paginação e filtragem de pesquisa opcional. Retorna informações do usuário, incluindo histórico de login e status da conta.
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
        "accessAllServers": true,
        "serverIds": [],
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
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - Suporta paginação e filtragem de pesquisa
  - Retorna o status da conta do usuário, incluindo o status de bloqueio

### Criar Usuário - `/api/users` {/* #create-user---apiusers */}
- **Endpoint**: `/api/users`
- **Método**: POST
- **Descrição**: Cria uma nova conta de usuário. Pode gerar uma senha temporária ou usar uma senha fornecida.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "username": "newuser",
    "password": "optional-password",
    "isAdmin": false,
    "requirePasswordChange": true,
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- `username`: Obrigatório, deve ter de 3 a 50 caracteres e ser único
  - `password`: Opcional; se não for fornecido, uma senha temporária segura será gerada
  - `isAdmin`: Opcional, padrão falso. Usuários administradores sempre recebem todos os servidores
  - `requirePasswordChange`: Opcional, padrão verdadeiro
  - `accessAllServers`: Opcional, padrão verdadeiro. Quando falso, `serverIds` é o único conjunto de servidores que o usuário pode ver
  - `serverIds`: Array opcional de IDs de servidores existentes. IDs desconhecidos são rejeitados. Ignorado quando o usuário é um administrador ou `accessAllServers` não é falso
- **Resposta**:

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "newuser",
      "isAdmin": false,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
    },
    "temporaryPassword": "generated-password-123"
  }
  ```

- `temporaryPassword` só é incluído se uma senha foi gerada automaticamente
- **Respostas de Erro**:
  - `400`: Formato de nome de usuário inválido, violação da política de senha ou erros de validação
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `409`: Nome de usuário já existe
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - O nome de usuário não diferencia maiúsculas de minúsculas e é armazenado em minúsculas
  - Se a senha não for fornecida, uma senha segura de 12 caracteres é gerada
  - As senhas temporárias geradas são retornadas apenas uma vez na resposta
  - A criação do usuário é registrada no log de auditoria

### Atualizar Usuário - `/api/users/:id` {/* #update-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: PATCH
- **Descrição**: Atualiza as informações do usuário, incluindo nome de usuário, status de administrador, exigência de alteração de senha e redefinição de senha.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros**:
  - `id`: ID do usuário a ser atualizado
- **Corpo da Requisição**:

  ```json
  {
    "username": "updated-username",
    "isAdmin": true,
    "requirePasswordChange": false,
    "resetPassword": true,
    "password": "optional-custom-password",
    "accessAllServers": false,
    "serverIds": ["server-id"]
  }
  ```

- Todos os campos são opcionais
  - `accessAllServers` e `serverIds`: Mesmas regras da criação. Promover um usuário a administrador armazena o acesso a todos os servidores. Rebaixar um administrador reinicia o acesso a todos os servidores, a menos que uma lista personalizada seja enviada na mesma requisição
  - `resetPassword`: Se verdadeiro, define uma nova senha. `password`, quando fornecido, é usado após as verificações de política. Quando `password` é omitido, uma senha temporária é gerada
  - `requirePasswordChange`: Com `resetPassword`, o padrão é verdadeiro. Envie `false` para limpar a sinalização de alteração obrigatória de senha
- **Resposta** (com redefinição de senha):

  ```json
  {
    "user": {
      "id": "user-id",
      "username": "updated-username",
      "isAdmin": true,
      "mustChangePassword": true,
      "accessAllServers": true,
      "serverIds": []
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
      "mustChangePassword": false,
      "accessAllServers": true,
      "serverIds": []
    }
  }
  ```

- **Respostas de Erro**:
  - `400`: Entrada inválida ou erros de validação
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `404`: Usuário não encontrado
  - `409`: Nome de usuário já existe (se estiver alterando o Nome de usuário)
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - As alterações de Nome de usuário são validadas quanto à unicidade
  - Uma redefinição de senha omitida gera uma Senha Temporária segura de 12 caracteres, retornada apenas uma vez
  - Uma senha de redefinição fornecida deve atender à política de senhas e não é retornada
  - Todas as alterações são registradas no Log de Auditoria

### Excluir Usuário - `/api/users/:id` {/* #delete-user---apiusersid */}
- **Endpoint**: `/api/users/:id`
- **Método**: DELETE
- **Descrição**: Exclui uma conta de usuário. Impede a exclusão da sua própria conta ou do último usuário administrador.
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
  - `400`: Não é possível excluir sua própria conta ou o último usuário administrador
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `404`: Usuário não encontrado
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - Não é possível excluir sua própria conta
  - Não é possível excluir o último usuário administrador (pelo menos um administrador deve permanecer)
  - A exclusão do usuário é registrada no log de auditoria
  - As sessões associadas são excluídas automaticamente (cascata)

## Gerenciamento do Log de Auditoria {/* #audit-log-management */}

### Listar Logs de Auditoria - `/api/audit-log` {/* #list-audit-logs---apiaudit-log */}
- **Endpoint**: `/api/audit-log`
- **Método**: GET
- **Descrição**: Recupera entradas do log de auditoria com recursos de filtragem, paginação e pesquisa. Suporta paginação baseada em página e baseada em deslocamento.
- **Autenticação**: Requer sessão válida e token CSRF (usuário conectado obrigatório)
- **Parâmetros de Consulta**:
  - `page` (opcional): Número da página para paginação baseada em página
  - `offset` (opcional): Deslocamento para paginação baseada em deslocamento (tem precedência sobre a página)
  - `limit` (opcional): Itens por página (padrão: 50)
  - `startDate` (opcional): Filtrar logs a partir desta data (formato ISO)
  - `endDate` (opcional): Filtrar logs até esta data (formato ISO)
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
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Erro interno do servidor
- **Observações**:
  - Suporta paginação baseada em página (`page`) e baseada em deslocamento (`offset`)
  - O campo `details` contém JSON analisado com contexto adicional
  - Todas as consultas de log de auditoria são registradas

### Obter Valores de Filtro do Log de Auditoria - `/api/audit-log/filters` {/* #get-audit-log-filter-values---apiaudit-logfilters */}
- **Endpoint**: `/api/audit-log/filters`
- **Método**: GET
- **Descrição**: Recupera valores de filtro exclusivos disponíveis para filtrar logs de auditoria. Retorna todas as ações, categorias e status distintos que existem no banco de dados de log de auditoria. Útil para preencher menus suspensos de filtro na interface do usuário.
- **Autenticação**: Requer sessão válida e token CSRF (usuário conectado obrigatório)
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
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Erro interno do servidor
- **Observações**:
  - Retorna arrays de valores exclusivos do banco de dados de log de auditoria
  - Os valores são ordenados alfabeticamente
  - Arrays vazios são retornados se não houver dados ou em caso de erro
  - Usado pelo Visualizador de Log de Auditoria para preencher menus suspensos de filtro dinamicamente

### Baixar Logs de Auditoria - `/api/audit-log/download` {/* #download-audit-logs---apiaudit-logdownload */}
- **Endpoint**: `/api/audit-log/download`
- **Método**: GET
- **Descrição**: Baixa logs de auditoria no formato CSV ou JSON com filtragem opcional. Útil para análise externa e geração de relatórios.
- **Autenticação**: Requer sessão válida e token CSRF (usuário conectado obrigatório)
- **Parâmetros de Consulta**:
  - `format` (opcional): Formato de exportação - `csv` ou `json` (padrão: `csv`)
  - `startDate` (opcional): Filtrar logs a partir desta data (formato ISO)
  - `endDate` (opcional): Filtrar logs até esta data (formato ISO)
  - `userId` (opcional): Filtrar por ID de usuário
  - `username` (opcional): Filtrar por nome de usuário
  - `action` (opcional): Filtrar por nome da ação
  - `category` (opcional): Filtrar por categoria
  - `status` (opcional): Filtrar por status
- **Resposta** (CSV):
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.csv"`
  - Arquivo CSV com cabeçalhos: ID, Timestamp, ID do Usuário, Nome de usuário, Ação, Categoria, Tipo de Destino, ID do Destino, Status, Endereço IP, Agente do Usuário, Detalhes, Mensagem de Erro
- **Resposta** (JSON):
  - Content-Type: `application/json`
  - Content-Disposition: `attachment; filename="audit-log-YYYY-MM-DD.json"`
  - Array JSON de entradas do log de auditoria
- **Respostas de Erro**:
  - `400`: Nenhum log para exportar
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Erro interno do servidor
- **Observações**:
  - O limite de exportação é de 10.000 registros
  - O formato CSV escapa caracteres especiais corretamente
  - O campo Detalhes no CSV é formatado como string JSON
  - O nome do arquivo inclui a data atual

### Limpar Logs de Auditoria - `/api/audit-log/cleanup` {/* #cleanup-audit-logs---apiaudit-logcleanup */}
- **Endpoint**: `/api/audit-log/cleanup`
- **Método**: POST
- **Descrição**: Aciona manualmente a limpeza de logs de auditoria antigos com base no período de retenção. Suporta modo de simulação para visualização do que seria excluído.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "retentionDays": 90,
    "dryRun": false
  }
  ```

- `retentionDays` (opcional): Substituir dias de retenção (30-365), caso contrário, usa o valor configurado
  - `dryRun` (opcional): Se verdadeiro, retorna apenas o que seria excluído sem excluir de fato
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

- **Respostas de Erro**:
  - `400`: Dias de retenção inválidos (deve ser 30-365)
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - A retenção padrão é de 90 dias se não configurado
  - A operação de limpeza é registrada no Log de Auditoria
  - O modo de simulação é útil para visualizar o impacto da limpeza

### Obter Retenção de Log de Auditoria - `/api/audit-log/retention` {/* #get-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: GET
- **Descrição**: Recupera a configuração atual de retenção do Log de Auditoria em dias.
- **Autenticação**: Requer sessão válida e token CSRF (nenhum usuário conectado necessário)
- **Resposta**:

  ```json
  {
    "retentionDays": 90
  }
  ```

- **Respostas de Erro**:
  - `500`: Erro interno do servidor
- **Observações**:
  - A retenção padrão é de 90 dias se não configurado
  - Pode ser acessado sem autenticação (somente leitura)

### Atualizar Retenção de Log de Auditoria - `/api/audit-log/retention` {/* #update-audit-log-retention---apiaudit-logretention */}
- **Endpoint**: `/api/audit-log/retention`
- **Método**: PATCH
- **Descrição**: Atualiza o período de retenção do Log de Auditoria em dias. Esta configuração determina por quanto tempo os logs de auditoria são mantidos antes da limpeza automática.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da Requisição**:

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

- **Respostas de Erro**:
  - `400`: Dias de retenção inválidos (deve ser 30-365)
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `500`: Erro interno do servidor
- **Observações**:
  - Acessível apenas para usuários administradores
  - A alteração de configuração é registrada no Log de Auditoria
  - O período de retenção afeta as operações de limpeza automática e manual

## Chaves de API {/* #api-keys */}

### Listar Chaves de API - `/api/api-keys` {/* #list-api-keys---apiapi-keys */}
- **Endpoint**: `/api/api-keys`
- **Método**: GET
- **Descrição**: Lista todas as Chaves de API. Os segredos nunca são retornados; cada chave inclui uma impressão digital (`Qk7v…3xTa`).
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `500`: Erro interno do servidor

### Criar chave de API - `/api/api-keys` {/* #create-api-key---apiapi-keys */}
- **Endpoint**: `/api/api-keys`
- **Método**: POST
- **Descrição**: Cria uma chave de API com escopo. O segredo em texto simples é retornado apenas nesta resposta.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da Requisição**:

  ```json
  {
    "name": "Duplicati uploads",
    "scope": "upload",
    "description": "Optional",
    "expiresAt": null
  }
  ```

- **Respostas de Erro**:
  - `400`: Nome ausente ou escopo inválido (`upload` ou `read`)
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `500`: Erro interno do servidor

### Atualizar chave de API - `/api/api-keys/:id` {/* #update-api-key---apiapi-keysid */}
- **Endpoint**: `/api/api-keys/:id`
- **Método**: PATCH
- **Descrição**: Habilita ou desabilita uma chave.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF

### Excluir chave de API - `/api/api-keys/:id` {/* #delete-api-key---apiapi-keysid */}
- **Endpoint**: `/api/api-keys/:id`
- **Método**: DELETE
- **Descrição**: Exclui uma chave. Os clientes existentes que usam esse segredo perdem o acesso imediatamente.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF

## Gerenciamento de Banco de Dados {/* #database-management */}

### Backup do Banco de Dados - `/api/database/backup` {/* #backup-database---apidatabasebackup */}
- **Endpoint**: `/api/database/backup`
- **Método**: GET
- **Descrição**: Cria um Backup do banco de dados em formato binário (.db) ou SQL (.sql). O arquivo de backup é baixado automaticamente com um nome de arquivo com carimbo de data/hora.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de Consulta**:
  - `format` (opcional): Formato de Backup - `db` (binário) ou `sql` (dump SQL). Padrão: `db`
- **Resposta**:
  - Content-Type: `application/octet-stream` (para .db) ou `text/plain` (para .sql)
  - Content-Disposition: `attachment; filename="duplistatus-backup-YYYY-MM-DDTHH-MM-SS.db"` ou `.sql`
  - Conteúdo de arquivo binário (para .db) ou conteúdo de texto SQL (para .sql)
- **Respostas de Erro**:
  - `400`: Formato inválido (deve ser "db" ou "sql")
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `500`: Falha ao criar o Backup do Banco de Dados
- **Notas**:
  - Acessível apenas para usuários administradores
  - O formato binário utiliza o método de Backup do SQLite para integridade
  - O formato SQL cria um dump de texto de todo o conteúdo do banco de dados
  - O Timestamp no nome do arquivo usa o fuso horário local do servidor
  - A operação de Backup é registrada no Log de Auditoria
  - Arquivos temporários são limpos automaticamente após o download

### Restaurar Banco de Dados - `/api/database/restore` {/* #restore-database---apidatabaserestore */}
- **Endpoint**: `/api/database/restore`
- **Método**: POST
- **Descrição**: Restaura o banco de dados a partir de um arquivo de Backup (formato .db ou .sql). Cria um Backup de segurança antes da restauração e limpa todas as sessões após a restauração por motivos de segurança.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Corpo da requisição**: FormData com um campo de arquivo chamado `database`
  - O arquivo deve ser `.db`, `.sqlite`, `.sqlite3` (formato binário) ou `.sql` (formato SQL)
  - Tamanho máximo do arquivo: 200MB
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
  - `400`: Nenhum arquivo fornecido, o Tamanho do Arquivo excede o limite, formato de arquivo inválido ou falha na verificação de integridade do banco de dados
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `500`: Falha ao restaurar o banco de dados (o banco de dados original é restaurado a partir do Backup de segurança se a restauração falhar)
- **Notas**:
  - Acessível apenas para usuários administradores
  - Cria automaticamente um Backup de segurança antes da restauração
  - Suporta os formatos binário (.db) e SQL (.sql)
  - Valida a integridade do banco de dados após a restauração
  - Se a restauração falhar, restaura automaticamente a partir do Backup de segurança
  - Todas as sessões são limpas após uma restauração bem-sucedida por motivos de segurança
  - Retorna `requiresReauth: true` para indicar que o usuário precisa Entrar novamente
  - A operação de restauração é registrada no Log de Auditoria
  - Para o formato SQL, valida o conteúdo SQL antes da execução
  - A conexão com o banco de dados é reinicializada após a restauração
  - Todos os caches são invalidados após a restauração

## Timestamps de Backup {/* #backup-timestamps */}

### Obter Timestamps do Último Backup - `/api/backups/last-timestamps` {/* #get-last-backup-timestamps---apibackupslast-timestamps */}
- **Endpoint**: `/api/backups/last-timestamps`
- **Método**: GET
- **Descrição**: Recupera o Timestamp do Último Backup para cada combinação de Servidor e Backup. Retorna um mapa para consulta fácil.
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
  - `500`: Falha ao buscar os Timestamps do Último Backup
- **Notas**:
  - Retorna tanto um mapa (para consulta fácil por `server_id:backup_name`) quanto o formato de array bruto
  - Inclui cabeçalhos de controle de cache para evitar armazenamento em cache
  - Útil para rastrear os horários do Último Backup em todas as combinações de Servidor e Backup
  - Os Timestamps estão no formato ISO

## Gerenciamento de Logs do Aplicativo {/* #application-logs-management */}

### Obter Logs do Aplicativo - `/api/application-logs` {/* #get-application-logs---apiapplication-logs */}
- **Endpoint**: `/api/application-logs`
- **Método**: GET
- **Descrição**: Recupera entradas de log dos arquivos de log. Suporta a Leitura de arquivos de log atuais e rotacionados com funcionalidade de tail.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de Consulta**:
  - `file` (opcional): Nome do arquivo de log para Leitura - `application.log`, `application.log.1`, `application.log.2`, etc. Se não fornecido, retorna a lista de Arquivos disponíveis
  - `tail` (opcional): Número de linhas a retornar do final do arquivo (Padrão: 1000, Mín: 1, máx: 10000)
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

- **Respostas de Erro**:
  - `400`: Parâmetro tail inválido (deve ser 1-10000) ou formato de parâmetro de arquivo inválido
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de Administrador necessários
  - `404`: Arquivo de log não encontrado
  - `500`: Falha ao ler o arquivo de log
- **Notas**:
  - Acessível apenas para usuários administradores
  - Suporta a Leitura do arquivo de log Atual e arquivos de log rotacionados (até 10 arquivos rotacionados)
  - Retorna as últimas N linhas (tail) do arquivo de log especificado
  - O nome do arquivo de log é determinado pela variável de ambiente (Padrão: `application.log`)
  - Retorna a lista de arquivos de log disponíveis quando o parâmetro de arquivo não é fornecido
  - Os nomes dos arquivos são validados para evitar ataques de travessia de diretório
  - Os arquivos rotacionados são numerados sequencialmente (`.1`, `.2`, etc.)

### Exportar Logs do Aplicativo - `/api/application-logs/export` {/* #export-application-logs---apiapplication-logsexport */}
- **Endpoint**: `/api/application-logs/export`
- **Método**: GET
- **Descrição**: Exporta entradas de log do aplicativo em formato de texto filtrado. Suporta filtragem por nível de log e string de pesquisa.
- **Autenticação**: Requer privilégios de administrador, sessão válida e token CSRF
- **Parâmetros de Consulta**:
  - `file` (obrigatório): Nome do arquivo de log a ser exportado - `application.log`, `application.log.1`, `application.log.2`, etc.
  - `logLevels` (opcional): Lista separada por vírgulas de níveis de log a serem incluídos - `INFO`, `WARN`, `ERROR` (padrão: `INFO,WARN,ERROR`)
  - `search` (opcional): String de pesquisa para filtrar linhas de log (não diferencia maiúsculas de minúsculas)
- **Resposta**:
  - Content-Type: `text/plain`
  - Content-Disposition: `attachment; filename="duplistatus-logs-YYYY-MM-DDTHH-MM-SS.txt"`
  - Conteúdo de log filtrado como texto simples
- **Respostas de Erro**:
  - `400`: O parâmetro de arquivo é obrigatório ou o formato do parâmetro de arquivo é inválido
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Proibido - Privilégios de administrador necessários
  - `500`: Falha ao exportar logs
- **Observações**:
  - Acessível apenas para usuários administradores
  - Exporta entradas de log filtradas com base no nível de log e nos critérios de pesquisa
  - Suporta filtragem por níveis de log: `INFO`, `WARN`, `ERROR`
  - A filtragem por string de pesquisa não diferencia maiúsculas de minúsculas
  - Linhas vazias são filtradas automaticamente
  - O nome do arquivo de log é determinado pela variável de ambiente (padrão: `application.log`)
  - Os nomes dos arquivos são validados para evitar ataques de travessia de diretório
  - O arquivo exportado inclui um timestamp no nome do arquivo
  - Útil para análise externa e solução de problemas
