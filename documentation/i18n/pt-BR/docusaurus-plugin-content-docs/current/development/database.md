---
translation_last_updated: '2026-02-14T04:57:48.314Z'
source_file_mtime: '2026-02-06T21:19:17.347Z'
source_file_hash: 21d21cb01acea43b
translation_language: pt-BR
source_file_path: development/database.md
---
# Esquema de Banco de Dados {#database-schema}

Este documento descreve o esquema de banco de dados SQLite utilizado pelo duplistatus para armazenar dados de operações de backup.

## Localização do Banco de Dados {#database-location}

O banco de dados é armazenado no diretório de dados da aplicação:
- **Localização Padrão**: `/app/data/backups.db`
- **Volume Docker**: `duplistatus_data:/app/data`
- **Nome do Arquivo**: `backups.db`

## Sistema de Migração de Banco de Dados {#database-migration-system}

duplistatus usa um sistema de migração automatizado para lidar com alterações de esquema de banco de dados entre versões.

### Histórico de Versões de Migração {#migration-version-history}

As seguintes são versões históricas de migração que trouxeram o banco de dados ao seu estado atual:

- **Schema v1.0** (Aplicação v0.6.x e anteriores): Schema de banco de dados inicial com tabelas de máquinas e backups
- **Schema v2.0** (Aplicação v0.7.x): Adicionadas colunas ausentes e tabela de configurações
- **Schema v3.0** (Aplicação v0.7.x): Tabela de máquinas renomeada para servidores, adicionada coluna server_url
- **Schema v3.1** (Aplicação v0.8.x): Campos de dados de backup aprimorados, adicionada coluna server_password
- **Schema v4.0** (Aplicação v0.9.x / v1.0.x): Adicionado Controle de Acesso de Usuários (tabelas de usuários, sessões e audit_log)

Versão atual da aplicação (v1.3.x) usa **Schema v4.0** como a versão mais recente do esquema de banco de dados.

### Processo de Migração {#migration-process}

1. **Backup Automático**: Cria backup antes da migração
2. **Atualização de Schema**: Atualiza a estrutura do banco de dados
3. **Migração de Dados**: Preserva dados existentes
4. **Verificação**: Confirma migração bem-sucedida

## Tabelas {#tables}

### Tabela de Servidores {#servers-table}

Armazena informações sobre servidores Duplicati sendo monitorados.

#### Campos {#fields}

| Campo            | Tipo             | Descrição                          |
|------------------|------------------|------------------------------------|
| `id`             | TEXT PRIMARY KEY | Identificador único do servidor    |
| `name`           | TEXT NOT NULL    | Nome do servidor do Duplicati      |
| `server_url`     | TEXT             | URL do servidor Duplicati          |
| `alias`          | TEXT             | Nome amigável definido pelo usuário|
| `note`           | TEXT             | Notas/descrição definidas pelo usuário|
| `server_password`| TEXT             | Senha do servidor para autenticação|
| `created_at`     | DATETIME         | Data e hora de criação do servidor |

### Tabela de Backups {#backups-table}

Armazena dados de operação de backup recebidos de servidores Duplicati.

#### Campos-Chave {#key-fields}

| Campo              | Tipo              | Descrição                                      |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Identificador único do backup                  |
| `server_id`        | TEXT NOT NULL     | Referência à tabela de servidores              |
| `backup_name`      | TEXT NOT NULL     | Nome do trabalho de backup                     |
| `backup_id`        | TEXT NOT NULL     | ID do backup do Duplicati                      |
| `date`             | DATETIME NOT NULL | Hora de execução do backup                     |
| `status`           | TEXT NOT NULL     | Status do backup (Sucesso, Aviso, Erro, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Duração em segundos                            |
| `size`             | INTEGER           | Tamanho dos arquivos de origem                 |
| `uploaded_size`    | INTEGER           | Tamanho dos dados enviados                     |
| `examined_files`   | INTEGER           | Número de arquivos examinados                  |
| `warnings`         | INTEGER           | Número de avisos                               |
| `errors`           | INTEGER           | Número de erros                                |
| `created_at`       | DATETIME          | Data e hora de criação do registro             |

#### Matrizes de Mensagens (Armazenamento JSON) {#message-arrays-json-storage}

| Campo              | Tipo | Descrição                                    |
|---------------------|------|----------------------------------------------|
| `messages_array`    | TEXT | Array JSON de mensagens de log               |
| `warnings_array`    | TEXT | Array JSON de mensagens de aviso             |
| `errors_array`      | TEXT | Array JSON de mensagens de erro              |
| `available_backups` | TEXT | Array JSON de versões de backup disponíveis  |

#### Campos de Operação de Arquivo {#file-operation-fields}

| Campo                 | Tipo    | Descrição                           |
|-----------------------|---------|-------------------------------------|
| `examined_files`      | INTEGER | Arquivos examinados durante backup  |
| `opened_files`        | INTEGER | Arquivos abertos para backup        |
| `added_files`         | INTEGER | Novos arquivos adicionados ao backup|
| `modified_files`      | INTEGER | Arquivos modificados no backup      |
| `deleted_files`       | INTEGER | Arquivos deletados do backup        |
| `deleted_folders`     | INTEGER | Pastas deletadas do backup          |
| `added_folders`       | INTEGER | Pastas adicionadas ao backup        |
| `modified_folders`    | INTEGER | Pastas modificadas no backup        |
| `not_processed_files` | INTEGER | Arquivos não processados            |
| `too_large_files`     | INTEGER | Arquivos muito grandes para processar|
| `files_with_error`    | INTEGER | Arquivos com erros                  |
| `added_symlinks`      | INTEGER | Links simbólicos adicionados        |
| `modified_symlinks`   | INTEGER | Links simbólicos modificados        |
| `deleted_symlinks`    | INTEGER | Links simbólicos deletados          |

#### Campos de Tamanho dos arquivos {#file-size-fields}

| Campo                    | Tipo    | Descrição                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Tamanho de arquivos examinados durante o backup |
| `size_of_opened_files`   | INTEGER | Tamanho de arquivos abertos para backup      |
| `size_of_added_files`    | INTEGER | Tamanho de novos arquivos adicionados ao backup    |
| `size_of_modified_files` | INTEGER | Tamanho de arquivos modificados no backup     |

#### Campos de Status da Operação {#operation-status-fields}

| Campo                    | Tipo              | Descrição                      |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Resultado da operação analisado |
| `main_operation`         | TEXT NOT NULL     | Tipo de operação principal     |
| `interrupted`            | BOOLEAN           | Se o backup foi interrompido   |
| `partial_backup`         | BOOLEAN           | Se o backup foi parcial        |
| `dryrun`                 | BOOLEAN           | Se o backup foi uma execução de teste |
| `version`                | TEXT              | Versão do Duplicati utilizada  |
| `begin_time`             | DATETIME NOT NULL | Hora de início do backup       |
| `end_time`               | DATETIME NOT NULL | Hora de término do backup      |
| `warnings_actual_length` | INTEGER           | Contagem real de avisos        |
| `errors_actual_length`   | INTEGER           | Contagem real de erros         |
| `messages_actual_length` | INTEGER           | Contagem real de mensagens     |

#### Campos de Estatísticas do Backend {#backend-statistics-fields}

| Campo                            | Tipo     | Descrição                              |
|----------------------------------|----------|----------------------------------------|
| `bytes_downloaded`               | INTEGER  | Bytes baixados do destino               |
| `known_file_size`                | INTEGER  | Tamanho dos arquivos conhecido no destino |
| `last_backup_date`               | DATETIME | Data do último backup no destino       |
| `backup_list_count`              | INTEGER  | Número de versões de backup            |
| `reported_quota_error`           | BOOLEAN  | Erro de cota reportado                 |
| `reported_quota_warning`         | BOOLEAN  | Aviso de cota reportado                |
| `backend_main_operation`         | TEXT     | Operação principal do backend          |
| `backend_parsed_result`          | TEXT     | Resultado analisado do backend         |
| `backend_interrupted`            | BOOLEAN  | Operação do backend interrompida       |
| `backend_version`                | TEXT     | Versão do backend                      |
| `backend_begin_time`             | DATETIME | Hora de início da operação do backend  |
| `backend_duration`               | TEXT     | Duração da operação do backend         |
| `backend_warnings_actual_length` | INTEGER  | Contagem de avisos do backend          |
| `backend_errors_actual_length`   | INTEGER  | Contagem de erros do backend           |

### Tabela de Configurações {#configurations-table}

Armazena as configurações de aplicação.

#### Campos {#fields}

| Campo   | Tipo                      | Descrição                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Chave de configuração          |
| `value` | TEXT                      | Valor de configuração (JSON) |

#### Chaves de Configuração Comuns {#common-configuration-keys}

- `email_config`: Configurações de notificação por e-mail
- `ntfy_config`: Configurações de notificação NTFY
- `overdue_tolerance`: Configurações de tolerância de backup atrasado
- `notification_templates`: Modelos de mensagens de notificação
- `audit_retention_days`: Período de retenção de log de auditoria (padrão: 90 dias)

### Tabela de Versão do Banco de Dados {#database-version-table}

Rastreia a versão do esquema do banco de dados para fins de migração.

#### Campos {#fields}

| Campo        | Tipo             | Descrição                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Versão do banco de dados           |
| `applied_at` | DATETIME         | Quando a migração foi aplicada |

### Tabela de Usuários {#users-table}

Armazena informações de conta de usuário para autenticação e controle de acesso.

#### Campos {#fields}

| Campo                   | Tipo                 | Descrição                                    |
|-------------------------|----------------------|----------------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identificador único do usuário               |
| `username`              | TEXT UNIQUE NOT NULL | Nome de usuário para login                   |
| `password_hash`         | TEXT NOT NULL        | Senha com hash Bcrypt                        |
| `is_admin`              | BOOLEAN NOT NULL     | Se o usuário possui privilégios de admin     |
| `must_change_password`  | BOOLEAN              | Se a alteração de senha é obrigatória        |
| `created_at`            | DATETIME             | Data e hora de criação da conta              |
| `updated_at`            | DATETIME             | Data e hora da última atualização            |
| `last_login_at`         | DATETIME             | Data e hora do último login bem-sucedido     |
| `last_login_ip`         | TEXT                 | Endereço IP do último login                  |
| `failed_login_attempts` | INTEGER              | Contagem de tentativas de login com falha    |
| `locked_until`          | DATETIME             | Expiração do bloqueio da conta (se bloqueada)|

### Tabela de Sessões {#sessions-table}

Armazena dados de sessão do usuário para autenticação e segurança.

#### Campos {#fields}

| Campo            | Tipo              | Descrição                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Identificador de sessão                                               |
| `user_id`         | TEXT              | Referência à tabela de usuários (anulável para sessões não autenticadas) |
| `created_at`      | DATETIME          | Data e hora de criação da sessão                                       |
| `last_accessed`   | DATETIME          | Data e hora do último acesso                                            |
| `expires_at`      | DATETIME NOT NULL | Data e hora de expiração da sessão                                     |
| `ip_address`      | TEXT              | Endereço IP de origem da sessão                                     |
| `user_agent`      | TEXT              | String de agente do usuário                                                |
| `csrf_token`      | TEXT              | Token CSRF para a sessão                                       |
| `csrf_expires_at` | DATETIME          | Expiração do token CSRF                                            |

### Log de Auditoria {#audit-log-table}

Armazena a trilha de auditoria de ações do usuário e eventos do sistema.

#### Campos {#fields}

| Campo           | Tipo                              | Descrição                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador único da entrada do log de auditoria                                 |
| `timestamp`     | DATETIME                          | Data e hora do evento                                                   |
| `user_id`       | TEXT                              | Referência à tabela de usuários (anulável)                               |
| `username`      | TEXT                              | Nome de usuário no momento da ação                                        |
| `action`        | TEXT NOT NULL                     | Ação executada                                                  |
| `category`      | TEXT NOT NULL                     | Categoria da ação (ex: 'authentication', 'settings', 'backup') |
| `target_type`   | TEXT                              | Tipo de destino (ex: 'server', 'backup', 'user')                 |
| `target_id`     | TEXT                              | Identificador do destino                                              |
| `details`       | TEXT                              | Detalhes adicionais (JSON)                                         |
| `ip_address`    | TEXT                              | Endereço IP do solicitante                                           |
| `user_agent`    | TEXT                              | String do agente do usuário                                                 |
| `status`        | TEXT NOT NULL                     | Status da ação ('success', 'failure', 'error')                  |
| `error_message` | TEXT                              | Mensagem de erro se a ação falhar                                    |

## Gerenciamento de Sessão {#session-management}

### Armazenamento de Sessão com Suporte a Banco de Dados {#database-backed-session-storage}

As sessões são armazenadas no banco de dados com fallback em memória:
- **Armazenamento Primário**: Tabela de sessões com suporte de banco de dados
- **Fallback**: Armazenamento em memória (suporte legado ou casos de erro)
- **ID de Sessão**: String aleatória criptograficamente segura
- **Expiração**: Tempo limite excedido de sessão configurável
- **Proteção CSRF**: Proteção contra falsificação de solicitação entre sites
- **Limpeza Automática**: Sessões expiradas são removidas automaticamente

### Endpoints da API de Sessão {#session-api-endpoints}

- `POST /api/session`: Criar nova sessão
- `GET /api/session`: Validar sessão existente
- `DELETE /api/session`: Destruir sessão
- `GET /api/csrf`: Obter token CSRF

## Índices {#indexes}

O banco de dados inclui vários índices para desempenho ideal de consultas:

- **Chaves Primárias**: Todos as tabelas possuem índices de chave primária
- **Chaves Estrangeiras**: Referências de Servidor na tabela backups, referências de Usuário em sessions e audit_log
- **Otimização de Consultas**: Índices em campos consultados frequentemente
- **Índices de Data**: Índices em campos de data para consultas baseadas em tempo
- **Índices de Usuário**: Índice de nome de usuário para buscas rápidas de usuários
- **Índices de Sessão**: Índices de expiração e user_id para gerenciamento de sessões
- **Índices de Auditoria**: Índices de data e hora, user_id, ação, categoria e status para consultas de auditoria

## Relacionamentos {#relationships}

- **Servidores → Backups**: Relacionamento um-para-muitos
- **Usuários → Sessões**: Relacionamento um-para-muitos (sessões podem existir sem usuários)
- **Usuários → Log de Auditoria**: Relacionamento um-para-muitos (entradas de auditoria podem existir sem usuários)
- **Backups → Mensagens**: Arrays JSON incorporados
- **Configurações**: Armazenamento de chave-valor

## Tipos de Dados {#data-types}

- **TEXTO**: Dados de string, arrays JSON
- **INTEIRO**: Dados numéricos, contagem de arquivos, tamanhos
- **REAL**: Números de ponto flutuante, durações
- **DATA E HORA**: Dados de data e hora
- **BOOLEANO**: Valores verdadeiro/falso

## Valores de Status de Backup {#backup-status-values}

- **Sucesso**: Backup concluído com sucesso
- **Aviso**: Backup concluído com avisos
- **Erro**: Backup concluído com erros
- **Fatal**: Backup falhou fatalmente

## Consultas Comuns {#common-queries}

### Obter Último Backup para um Servidor {#get-latest-backup-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Obter Todos os Backups de um Servidor {#get-all-backups-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Obter Resumo do Servidor {#get-server-summary}

```sql
SELECT 
  s.name,
  s.alias,
  COUNT(b.id) as backup_count,
  MAX(b.date) as last_backup,
  b.status as last_status
FROM servers s
LEFT JOIN backups b ON s.id = b.server_id
GROUP BY s.id;
```

### Obter Resumo Geral {#get-overall-summary}

```sql
SELECT 
  COUNT(DISTINCT s.id) as total_servers,
  COUNT(b.id) as total_backups_runs,
  COUNT(DISTINCT s.id || ':' || b.backup_name) as total_backups,
  COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
  (
    SELECT COALESCE(SUM(b2.known_file_size), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_storage_used,
  (
    SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_backuped_size
FROM servers s
LEFT JOIN backups b ON b.server_id = s.id;
```

### Limpeza de Banco de Dados {#database-cleanup}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## Mapeamento de JSON para Banco de Dados {#json-to-database-mapping}

### Mapeamento do Corpo da Requisição da API para Colunas do Banco de Dados {#api-request-body-to-database-columns-mapping}

Quando o Duplicati envia dados de backup via HTTP POST, a estrutura JSON é mapeada para colunas do banco de dados:

```json
{
  "Data": {
    "ExaminedFiles": 15399,           // → examined_files
    "OpenedFiles": 1861,              // → opened_files
    "AddedFiles": 1861,               // → added_files
    "SizeOfExaminedFiles": 11086692615, // → size_of_examined_files
    "SizeOfOpenedFiles": 13450481,    // → size_of_opened_files
    "SizeOfAddedFiles": 13450481,     // → size_of_added_files
    "SizeOfModifiedFiles": 0,         // → size_of_modified_files
    "ParsedResult": "Success",        // → status
    "BeginTime": "2025-04-21T23:45:46.9712217Z", // → begin_time and date
    "Duration": "00:00:51.3856057",   // → duration_seconds (calculated)
    "WarningsActualLength": 0,        // → warnings_actual_length
    "ErrorsActualLength": 0           // → errors_actual_length
  },
  "Extra": {
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", // → server_id
    "machine-name": "WSJ-SER5",       // → server name
    "backup-name": "WSJ-SER5 Local files", // → backup_name
    "backup-id": "DB-2"               // → backup_id
  }
}
```

**Nota**: O campo `size` na tabela de backups armazena `SizeOfExaminedFiles` e `uploaded_size` armazena o tamanho real enviado/transferido da operação de backup.
