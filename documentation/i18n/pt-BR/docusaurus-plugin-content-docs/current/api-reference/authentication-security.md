---
translation_last_updated: '2026-04-17T23:59:32.102Z'
source_file_mtime: '2026-04-10T18:19:13.212Z'
source_file_hash: c9534dd52e365d0fa8362267d222bf25774890c9b7530524b456434c7f74b287
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/authentication-security.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Autenticação e Segurança {#authentication-security}

A API usa uma combinação de autenticação baseada em sessão e proteção CSRF para todas as operações de gravação no banco de dados, a fim de impedir acesso não autorizado e possíveis ataques de negação de serviço. APIs externas (usadas pelo Duplicati) permanecem sem autenticação por compatibilidade.

## Autenticação Baseada em Sessão {#session-based-authentication}

Endpoints protegidos exigem um cookie de sessão válido e um token CSRF. O sistema de sessão fornece autenticação segura para todas as operações protegidas.

### Gerenciamento de Sessão {#session-management}
1. **Criar Sessão**: POST para `/api/session` para criar uma nova sessão
2. **Obter Token CSRF**: GET `/api/csrf` para obter um token CSRF para a sessão
3. **Incluir nas Requisições**: Enviar cookie de sessão e token CSRF com requisições protegidas
4. **Validar Sessão**: GET `/api/session` para verificar se a sessão ainda é válida
5. **Excluir Sessão**: DELETE `/api/session` para encerrar a sessão e limpar os dados

### Proteção CSRF {#csrf-protection}
Todas as operações que alteram o estado exigem um token CSRF válido que corresponda à sessão atual. O token CSRF deve ser incluído no cabeçalho `X-CSRF-Token` para endpoints protegidos.

### Endpoints Protegidos {#protected-endpoints}
Todos os endpoints que modificam dados no banco de dados exigem autenticação de sessão e token CSRF:

- **Gerenciamento de Servidor**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **Gerenciamento de Configuração**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST)
- **Sistema de Notificações**: `/api/notifications/test` (POST)
- **Configuração de Cron**: `/api/cron-config` (GET, POST)
- **Proxy de Cron**: `/api/cron/*` (GET, POST) - repassa requisições ao serviço cron
- **Gerenciamento de Sessão**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **Dados de Gráficos**: `/api/chart-data/*` (GET)
- **Painel**: `/api/dashboard` (GET)
- **Detalhes do Servidor**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **Registro de Auditoria**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - administrador exigido para operações de gravação
- **Gerenciamento de Usuários**: `/api/users` (GET, POST, PATCH, DELETE) - administrador exigido
- **Gerenciamento de Banco de Dados**: `/api/database/backup` (GET), `/api/database/restore` (POST) - administrador exigido
- **Logs da Aplicação**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - administrador exigido
- **Coleção de Backup**: `/api/backups/collect` (POST) - exige sessão e token CSRF
- **Sincronização de Agendamento de Backup**: `/api/backups/sync-schedule` (POST) - exige sessão e token CSRF
- **Verificação de Atraso**: `/api/notifications/check-overdue` (POST) - exige sessão e token CSRF
- **Limpar Carimbos de Tempo Atrasados**: `/api/notifications/clear-overdue-timestamps` (POST) - exige sessão e token CSRF

### Endpoints Não Protegidos {#unprotected-endpoints}
APIs externas permanecem sem autenticação para integração com o Duplicati:

- `/api/upload` - Uploads de dados de backup do Duplicati
- `/api/lastbackup/:serverId` - Status do último backup
- `/api/lastbackups/:serverId` - Status dos últimos backups
- `/api/summary` - Dados resumidos gerais
- `/api/health` - Endpoint de verificação de saúde

### Exemplo de Uso (Sessão + CSRF) {#usage-example-session-csrf}

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

## Endpoints de Autenticação {#authentication-endpoints}

### Login - `/api/auth/login` {#login-apiauthlogin}
- **Endpoint**: `/api/auth/login`
- **Método**: POST
- **Descrição**: Autentica um usuário e cria uma sessão. Suporta bloqueio de conta após tentativas falhas e exigência de alteração de senha.
- **Autenticação**: Exige sessão válida e token CSRF (mas sem usuário logado)
- **Corpo da Requisição**:

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

- **Respostas de Erro**: Todas as respostas de erro incluem `error` (mensagem em inglês) e `errorCode` (código estável para tradução no cliente).
  - `400`: Nome de usuário ou senha ausentes — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: Nome de usuário ou senha inválidos — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: Conta bloqueada devido a muitas tentativas falhas de login — `errorCode: "ACCOUNT_LOCKED"` (inclui `lockedUntil`, `minutesRemaining`)
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
  - `503`: Banco de dados não está pronto — `errorCode: "DATABASE_NOT_READY"`
- **Observações**:
  - A conta é bloqueada após 5 tentativas falhas de login por 15 minutos
  - Tentativas de login falhas são rastreadas e registradas
  - O cookie de sessão é automaticamente definido na resposta
  - Se o usuário tiver a flag `mustChangePassword` definida, ele deve ser redirecionado para a página de alteração de senha
  - Todas as tentativas de login (bem-sucedidas e falhas) são registradas no registro de auditoria

### Sair - `/api/auth/logout` {#logout-apiauthlogout}
- **Endpoint**: `/api/auth/logout`
- **Método**: POST
- **Descrição**: Encerra a sessão do usuário atual e destrói a sessão.
- **Autenticação**: Requer sessão válida e token CSRF
- **Resposta** (sucesso):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **Respostas de erro**: Incluem `error` e `errorCode` para tradução no lado do cliente.
  - `400`: Nenhuma sessão ativa — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - O cookie de sessão é limpo na resposta
  - O logout é registrado no registro de auditoria
  - A sessão é imediatamente invalidada

### Obter Usuário Atual - `/api/auth/me` {#get-current-user-apiauthme}
- **Endpoint**: `/api/auth/me`
- **Método**: GET
- **Descrição**: Retorna as informações do usuário autenticado atual, ou indica se nenhum usuário está logado.
- **Autenticação**: Requer sessão válida (mas não exige usuário logado)
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

- **Respostas de erro**: Incluem `error` e `errorCode` para tradução no lado do cliente.
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - Pode ser chamado sem usuário logado (retorna `authenticated: false`)
  - Útil para verificar o status de autenticação ao carregar a página

### Alterar Senha - `/api/auth/change-password` {#change-password-apiauthchange-password}
- **Endpoint**: `/api/auth/change-password`
- **Método**: POST
- **Descrição**: Altera a senha do usuário autenticado atual. Se `mustChangePassword` for definido, a verificação da senha atual será ignorada.
- **Autenticação**: Requer sessão válida e token CSRF (usuário logado obrigatório)
- **Corpo da Requisição**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: Opcional se `mustChangePassword` for verdadeiro, obrigatório caso contrário
  - `newPassword`: Obrigatório, deve atender aos requisitos da política de senhas
- **Resposta** (sucesso):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **Respostas de erro**: Incluem `error` e `errorCode` para tradução no lado do cliente. Violação da política pode incluir `validationErrors` (array de strings).
  - `400`: Nova senha ausente — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: Violação da política de senha — `errorCode: "POLICY_NOT_MET"` (pode incluir `validationErrors`)
  - `400`: Nova senha igual à atual — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: A senha atual está incorreta — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: Usuário não encontrado — `errorCode: "USER_NOT_FOUND"`
  - `500`: Erro interno do servidor — `errorCode: "INTERNAL_ERROR"`
- **Notas**:
  - A nova senha deve atender aos requisitos da política de senhas (tamanho, complexidade, etc.)
  - Se a flag `mustChangePassword` estiver definida, a verificação da senha atual será ignorada
  - Após a alteração bem-sucedida da senha, a flag `mustChangePassword` é limpa
  - Alterações de senha são registradas no registro de auditoria
  - A nova senha deve ser diferente da senha atual

### Verificar se o Administrador Deve Alterar Senha - `/api/auth/admin-must-change-password` {#check-admin-must-change-password-apiauthadmin-must-change-password}
- **Endpoint**: `/api/auth/admin-must-change-password`
- **Método**: GET
- **Descrição**: Verifica se o usuário administrador deve alterar sua senha. Este endpoint é público (sem autenticação necessária), pois apenas retorna uma flag booleana.
- **Resposta**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **Respostas de erro**:
  - `500`: Erro interno do servidor (retorna `mustChangePassword: false` em caso de erro para evitar exibir a dica se houver problema no banco de dados)
- **Notas**:
  - Endpoint público, sem autenticação necessária
  - Retorna `false` se o usuário administrador não existir
  - Usado para determinar se a dica de alteração de senha deve ser exibida
  - Em caso de erro, retorna `false` para evitar exibir a dica se houver problema no banco de dados

### Obter Política de Senha - `/api/auth/password-policy` {#get-password-policy-apiauthpassword-policy}
- **Endpoint**: `/api/auth/password-policy`
- **Método**: GET
- **Descrição**: Retorna a configuração atual da política de senhas. Este endpoint é público (sem autenticação necessária), pois é necessário para validação no frontend.
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

- **Respostas de erro**: Incluem `error` e `errorCode` para tradução no lado do cliente.
  - `500`: Falha ao recuperar política de senha — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **Notas**:
  - Endpoint público, sem autenticação necessária
  - Usado por componentes do frontend para exibir os requisitos de senha e validar senhas antes do envio
  - A política é configurada por meio de variáveis de ambiente (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - A verificação padrão (impedir o uso da senha padrão do administrador) é sempre aplicada, independentemente das configurações da política

### Códigos de erro e sucesso da API de autenticação (i18n) {#auth-api-error-and-success-codes-i18n}

Os endpoints de autenticação retornam um `errorCode` estável (e, em caso de sucesso, `successCode`) além do campo legível por humanos `error` ou `message`. Os valores `error` e `message` estão em inglês. Os clientes devem usar os códigos para pesquisar strings localizadas, de modo que a interface exiba mensagens no idioma selecionado pelo usuário.

| Endpoint | Código de sucesso | Códigos de erro |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### Respostas de Erro {#error-responses}
- `401 Unauthorized`: Sessão inválida ou ausente, sessão expirada ou falha na validação do token CSRF
- `403 Forbidden`: Falha na validação do token CSRF ou operação não permitida

:::caution
 Não exponha o servidor **duplistatus** à internet pública. Use-o em uma rede segura 
(por exemplo, LAN local protegida por firewall).

Expor a interface **duplistatus** à internet pública 
sem medidas de segurança adequadas pode resultar em acesso não autorizado.
:::
