---
translation_last_updated: '2026-04-18T00:01:27.909Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: dcaa22d702c5a5e8506cf1be74b453ae66a255a11f09d5d169b57e890ae439c2
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/session-management-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gerenciamento de Sessão {#session-management}

## Criar Sessão - `/api/session` {#create-session-apisession}
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
  - Define cookie de sessão HTTP-only
  - Necessário para acessar endpoints protegidos

## Validar Sessão - `/api/session` {#validate-session-apisession}
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
  - `401`: Sem cookie de sessão ou ID de sessão
  - `500`: Falha ao validar sessão
- **Notas**:
  - Verifica se o cookie de sessão existe e é válido
  - Retorna o ID da sessão se for válido

## Excluir Sessão - `/api/session` {#delete-session-apisession}
- **Endpoint**: `/api/session`
- **Método**: DELETE
- **Descrição**: Exclui a sessão atual (sair).
- **Resposta**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Respostas de Erro**:
  - `500`: Falha ao excluir sessão
- **Notas**:
  - Limpa a sessão do servidor e do cliente
  - Remove o cookie de sessão

## Obter Token CSRF - `/api/csrf` {#get-csrf-token-apicsrf}
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
