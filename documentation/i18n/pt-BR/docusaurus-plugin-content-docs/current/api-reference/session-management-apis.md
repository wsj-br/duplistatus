# Gerenciamento de sessão {/* #session-management */}

## Criar sessão - `/api/session` {/* #create-session---apisession */}
- **Endpoint**: `/api/session`
- **Método**: POST
- **Descrição**: Cria uma nova sessão para o usuário.
- **Resposta**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao criar sessão
- **Notas**:
  - Cria uma nova sessão com expiração de 24 horas
  - Define cookie de sessão somente HTTP
  - Necessário para acessar endpoints protegidos

## Validar sessão - `/api/session` {/* #validate-session---apisession */}
- **Endpoint**: `/api/session`
- **Método**: GET
- **Descrição**: Valida uma sessão existente.
- **Resposta** (válida):

  ```json
  {
    "valid": true,
    "sessionId": "session-id-string"
  }
  ```

- **Resposta** (inválida):

  ```json
  {
    "valid": false,
    "error": "No session cookie"
  }
  ```

- **Respostas de Erro**:
  - `401`: Nenhum cookie de sessão ou ID de sessão
  - `500`: Falha ao validar sessão
- **Notas**:
  - Verifica se o cookie de sessão existe e é válido
  - Retorna ID da sessão se válida

## Excluir sessão - `/api/session` {/* #delete-session---apisession */}
- **Endpoint**: `/api/session`
- **Método**: DELETE
- **Descrição**: Exclui a sessão atual (logout).
- **Resposta**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao excluir sessão
- **Notas**:
  - Limpa a sessão do servidor e cliente
  - Remove o cookie de sessão

## Obter token CSRF - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **Endpoint**: `/api/csrf`
- **Método**: GET
- **Descrição**: Gera um token CSRF para a sessão atual.
- **Resposta**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Respostas de Erro**:
  - `401`: Nenhuma sessão encontrada ou sessão inválida/expirada
  - `500`: Falha ao gerar token CSRF
- **Notas**:
  - Requer uma sessão válida
  - O token CSRF é necessário para todas as operações que alteram estado
  - O token está vinculado à sessão atual
