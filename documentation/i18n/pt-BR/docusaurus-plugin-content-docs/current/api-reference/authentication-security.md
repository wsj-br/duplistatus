# Autenticação e Segurança {/* #authentication--security */}

A API usa uma combinação de autenticação baseada em sessão e proteção CSRF para todas as operações de gravação no banco de dados para evitar acesso não autorizado e possíveis ataques de negação de serviço. As APIs externas usadas pelo Duplicati e pelo Homepage permanecem isentas de CSRF. Elas podem, opcionalmente, exigir uma chave de API com escopo e/ou uma lista de permissões de IP (ambos desativados por padrão). `/api/upload` também possui um limite configurável de tamanho de corpo e limite de taxa.

## Autenticação Baseada em Sessão {/* #session-based-authentication */}

Endpoints protegidos exigem um cookie de sessão válido e um token CSRF. O sistema de sessão fornece autenticação segura para todas as operações protegidas.

### Gerenciamento de Sessão {/* #session-management */}
1. **Criar Sessão**: POST para `/api/session` para criar uma nova sessão
2. **Obter Token CSRF**: GET `/api/csrf` para obter um token CSRF para a sessão
3. **Incluir nas Requisições**: Envie o cookie de sessão e o token CSRF com requisições protegidas
4. **Validar Sessão**: GET `/api/session` para verificar se a sessão ainda é válida
5. **Excluir Sessão**: DELETE `/api/session` para fazer logout e limpar a sessão

### Proteção CSRF {/* #csrf-protection */}
Todas as operações que alteram o estado exigem um token CSRF válido que corresponda à sessão atual. O token CSRF deve ser incluído no cabeçalho `X-CSRF-Token` para endpoints protegidos.

### Endpoints Protegidos {/* #protected-endpoints */}
Todos os endpoints que modificam dados do banco de dados exigem autenticação de sessão e token CSRF:

- **Gerenciamento do Servidor**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Gerenciamento de Configurações**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **Sistema de Notificação**: `/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **Configuração do Cron**: `/api/cron-config` (GET, POST)
- **Proxy do Cron**: `/api/cron/*` (GET, POST) - encaminha requisições para o serviço do cron. O método POST requer um administrador. O processo do cron vincula-se a `127.0.0.1` por padrão; rotas mutantes do serviço do cron exigem `X-Cron-Service-Secret` quando `CRON_SERVICE_SECRET` estiver definido.
- **Gerenciamento de Sessão**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Dados do Gráfico**: `/api/chart-data/*` (GET)
- **Dashboard**: `/api/dashboard` (GET)
- **Detalhes do Servidor**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Log de Auditoria**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - administrador necessário para operações de gravação
- **Gerenciamento de Usuários**: `/api/users` (GET, POST, PATCH, DELETE) - administrador necessário
- **Gerenciamento do Banco de Dados**: `/api/database/backup` (GET), `/api/database/restore` (POST) - administrador necessário
- **Logs do Aplicativo**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - administrador necessário
- **Coleta de Backup**: `/api/backups/collect` (POST) - requer sessão e token CSRF
- **Sincronização de Agendamento de Backup**: `/api/backups/sync-schedule` (POST) - requer sessão e token CSRF
- **Verificação de Atraso**: `/api/notifications/check-overdue` (POST) - requer sessão e token CSRF
- **Limpar Timestamps de Atraso**: `/api/notifications/clear-overdue-timestamps` (POST) - requer sessão e token CSRF

### Endpoints Externos {/* #external-endpoints */}
Estas rotas não utilizam cookies de sessão nem CSRF. A autenticação é opcional e configurada em Configurações:

- `/api/upload` - Envios de dados de backup do Duplicati (chave com escopo de upload, limites de tamanho e taxa)
- `/api/lastbackup/:serverId` - Status do backup mais recente (chave com escopo de leitura)
- `/api/lastbackups/:serverId` - Status dos backups mais recentes (chave com escopo de leitura)
- `/api/summary` - Dados de resumo geral (chave com escopo de leitura)
- `/api/health` - Endpoint de verificação de integridade (nunca exige chave; teste simples no SQLite; limite de taxa por IP)
- `/api/ping` - Teste de conectividade (nunca exige chave; limite de taxa por IP)

Quando **Require API keys** está desativado, as primeiras quatro rotas aceitam requisições com ou sem chave: uma chave válida com escopo correspondente é registrada; uma chave incorreta é ignorada. Quando a opção está ativada, elas retornam `401` sem uma chave válida e `403` quando o escopo da chave não corresponder. `/api/health` e `/api/ping` nunca usam chaves. Consulte [Chaves de API](../user-guide/settings/api-keys-settings.md) e [Lista de permissões de IP](../user-guide/settings/ip-allowlist-settings.md).

### Exemplo de Uso (Sessão + CSRF) {/* #usage-example-session--csrf */}

```typescript
// 1. Create session
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. Get CSRF token
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. Make protected request
const response = await fetch('/api/servers/server-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'Cookie': `session=${sessionId}`
  },
  body: JSON.stringify({
    alias: 'Updated Server Name',
    note: 'Updated notes'
  })
});
```

## Endpoints de Autenticação {/* #authentication-endpoints */}

### Login - `/api/auth/login` {/* #login---apiauthlogin */}
- **Endpoint**: `/api/auth/login`
- **Método**: POST
- **Descrição**: Autentica um usuário e cria uma sessão. Suporta bloqueio de conta após tentativas com falha e requisitos de alteração de senha.
- **Autenticação**: Requer sessão válida e token CSRF (mas nenhum usuário conectado)
- **Corpo da requisição**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Resposta** (sucesso):

  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    },
    "keyChanged": false
  }
  ```

- **Respostas de Erro**: Todas as respostas de erro incluem `error` (mensagem em inglês) e `errorCode` (código estável para tradução no lado do cliente).
  - `400`: Nome de usuário ou senha ausente — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Nome de usuário ou senha inválidos — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Conta bloqueada devido a muitas tentativas de login falhas — `errorCode: "ACCOUNT_LOCKED"` (inclui `lockedUntil`, `minutesRemaining`)
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
  - `503`: Banco de dados não está pronto — `errorCode: "DATABASE_NOT_READY"`
- **Notas**:
  - A conta é bloqueada após 5 tentativas de login falhas por 15 minutos
  - Tentativas de login falhas são rastreadas e registradas
  - O cookie de sessão é definido automaticamente na resposta
  - Se o usuário tiver o sinalizador `mustChangePassword` definido, ele deve ser redirecionado para a página de alteração de senha
  - Todas as tentativas de login (bem-sucedidas e falhas) são registradas no log de auditoria

### Logout - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **Endpoint**: `/api/auth/logout`
- **Método**: POST
- **Descrição**: Desconecta o usuário atual e destrói sua sessão.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta** (sucesso):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Respostas de Erro**: Inclui `error` e `errorCode` para tradução no lado do cliente.
  - `400`: Nenhuma sessão ativa — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - O cookie de sessão é limpo na resposta
  - O logout é registrado no log de auditoria
  - A sessão é imediatamente invalidada

### Obter Usuário Atual - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **Endpoint**: `/api/auth/me`
- **Método**: GET
- **Descrição**: Retorna as informações do usuário autenticado atual ou indica se nenhum usuário está conectado.
- **Autenticação**: Requer sessão válida (mas nenhum usuário conectado é exigido)
- **Resposta** (autenticado):

  ```json
  {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **Resposta** (não autenticado):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **Respostas de Erro**: Inclui `error` e `errorCode` para tradução no lado do cliente.
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - Pode ser chamado sem um usuário logado (retorna `authenticated: false`)
  - Útil para verificar o status de autenticação ao carregar a página

### Alterar Senha - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **Endpoint**: `/api/auth/change-password`
- **Método**: POST
- **Descrição**: Altera a senha do usuário autenticado atual. Se `mustChangePassword` estiver definido, a verificação da senha atual será ignorada.
- **Autenticação**: Requer sessão válida e token CSRF (usuário conectado obrigatório)
- **Corpo da requisição**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Opcional se `mustChangePassword` for verdadeiro, obrigatório caso contrário
  - `newPassword`: Obrigatório, deve atender aos requisitos da política de senha
- **Resposta** (sucesso):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Respostas de Erro**: Inclui `error` e `errorCode` para tradução no lado do cliente. Violação de política pode incluir `validationErrors` (array de strings).
  - `400`: Nova senha ausente — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Violação da política de senha — `errorCode: "POLICY_NOT_MET"` (pode incluir `validationErrors`)
  - `400`: Nova senha igual à atual — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: Senha atual está incorreta — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: Usuário não encontrado — `errorCode: "USER_NOT_FOUND"`
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - A nova senha deve atender aos requisitos da política de senha (comprimento, complexidade, etc.)
  - Se o sinalizador `mustChangePassword` estiver definido, a verificação da senha atual é ignorada
  - Após a alteração bem-sucedida da senha, o sinalizador `mustChangePassword` é limpo
  - Alterações de senha são registradas no log de auditoria
  - A nova senha deve ser diferente da senha atual

### Verificar se o Administrador Deve Alterar Senha - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **Endpoint**: `/api/auth/admin-must-change-password`
- **Método**: GET
- **Descrição**: Verifica se o Usuário administrador deve alterar sua senha. Esse endpoint é público (nenhuma autenticação necessária), pois retorna apenas uma flag booleana.
- **Resposta**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Respostas de Erro**:
  - `500`: Erro interno do servidor (retorna `mustChangePassword: false` em caso de erro para evitar mostrar dica se houver problema no banco de dados)
- **Notas**:
  - Endpoint público, nenhuma autenticação necessária
  - Retorna `false` se o usuário administrador não existir
  - Usado para determinar se a dica de alteração de senha deve ser mostrada
  - Em caso de erro, retorna `false` para evitar mostrar dica se houver problema no banco de dados

### Obter política de senhas - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **Endpoint**: `/api/auth/password-policy`
- **Método**: GET
- **Descrição**: Retorna a configuração atual da política de senhas. Esse endpoint é público (nenhuma autenticação necessária), pois é necessário para a validação no frontend.
- **Resposta**:

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **Respostas de Erro**: Inclui `error` e `errorCode` para tradução no lado do cliente.
  - `500`: Falha ao recuperar política de senha — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Notas**:
  - Endpoint público, nenhuma autenticação necessária
  - Usado pelos componentes frontend para exibir requisitos de senha e validar senhas antes do envio
  - A política é configurada por meio de variáveis de ambiente (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - A verificação padrão de senha (impedindo o uso da senha padrão do administrador) é sempre aplicada independentemente das configurações de política

### Códigos de erro e sucesso da API de autenticação (i18n) {/* #auth-api-error-and-success-codes-i18n */}

Os endpoints de autenticação retornam um `errorCode` estável (e, em caso de sucesso, `successCode`), além do campo `error` ou `message` legível por humanos. Os valores `error` e `message` estão em inglês. Os clientes devem usar os códigos para buscar strings localizadas para que a interface exiba mensagens no idioma selecionado pelo usuário.

| Endpoint | Código de sucesso | Códigos de erro |
|----------|-------------------|-----------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Respostas de erro {/* #error-responses */}
- `401 Unauthorized`: Sessão inválida ou ausente, sessão expirada ou falha na validação do token CSRF
- `403 Forbidden`: Falha na validação do token CSRF ou operação não permitida

:::caution
 Não exponha o servidor **duplistatus** à internet pública. Use-o em uma rede segura 
(por exemplo, uma LAN local protegida por firewall).

Expor a interface do **duplistatus** à internet pública
 sem as medidas de segurança adequadas pode resultar em acesso não autorizado.
:::
