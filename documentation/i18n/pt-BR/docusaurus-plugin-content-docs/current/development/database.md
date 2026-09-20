# Esquema do Banco de Dados {/* #database-schema */}

Este documento descreve o esquema do banco de dados SQLite usado pelo duplistatus para armazenar dados de operações de backup.

## Localização do Banco de Dados {/* #database-location */}

O banco de dados fica armazenado no diretório de dados da aplicação:
- **Localização Padrão**: `/app/data/backups.db`
- **Volume Docker**: `duplistatus_data:/app/data`
- **Nome do Arquivo**: `backups.db`

## Sistema de Migração do Banco de Dados {/* #database-migration-system */}

O duplistatus usa um sistema de migração automatizado para lidar com alterações no esquema do banco de dados entre versões.

### Histórico de Versões de Migração {/* #migration-version-history */}

A seguir estão as versões históricas de migração que levaram o banco de dados ao seu estado atual:

- **Esquema v1.0** (Aplicação v0.6.x e anteriores): Esquema inicial do banco de dados com as tabelas machines e backups
- **Esquema v2.0** (Aplicação v0.7.x): Adição de colunas ausentes e da tabela configurations
- **Esquema v3.0** (Aplicação v0.7.x): Renomeação da tabela machines para servers, adição da coluna server_url
- **Esquema v3.1** (Aplicação v0.8.x): Aprimoramento dos campos de dados de backup, adição da coluna server_password
- **Esquema v4.0** (Aplicação v0.9.x / v1.0.x): Adição de controle de acesso de usuários (tabelas users, sessions, audit_log)
- **Esquema v4.1** (Aplicação v1.5.x): Adição de `api_keys` e chaves de configuração padrão para autenticação opcional por chave de API, listas de permissão de IP e limites de upload
- **Esquema v4.2** (Aplicação v1.5.x): Adição do livro-razão `daily_summary_deliveries` e da configuração padrão `daily_summary` para notificações opcionais de resumo diário

A versão atual da aplicação (v1.5.x) usa o **Esquema v4.2** como a versão mais recente do esquema do banco de dados.

### Processo de Migração {/* #migration-process */}

1. **Backup Automático**: Cria um backup antes da migração
2. **Atualização do Esquema**: Atualiza a estrutura do banco de dados
3. **Migração de Dados**: Preserva os dados existentes
4. **Verificação**: Confirma o sucesso da migração

## Tabelas {/* #tables */}

### Tabela de Servidores {/* #servers-table */}

Armazena informações sobre os servidores Duplicati monitorados.

#### Campos {/* #fields */}

| Campo             | Tipo             | Descrição                          |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | Identificador exclusivo do servidor |
| `name`            | TEXT NOT NULL    | Nome do Servidor a partir do Duplicati |
| `server_url`      | TEXT             | URL do servidor Duplicati          |
| `alias`           | TEXT             | Nome amigável definido pelo usuário |
| `note`            | TEXT             | Notas/descrição definidas pelo usuário |
| `server_password` | TEXT             | Senha do servidor para autenticação |
| `created_at`      | DATETIME         | Timestamp de criação do servidor   |

### Tabela de Backups {/* #backups-table */}

Armazena dados de operações de backup recebidos dos servidores Duplicati.

#### Campos principais {/* #key-fields */}

| Campo              | Tipo              | Descrição                                      |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | Identificador exclusivo do backup              |
| `server_id`        | TEXT NOT NULL     | Referência à tabela de servidores              |
| `backup_name`      | TEXT NOT NULL     | Nome da tarefa de backup                       |
| `backup_id`        | TEXT NOT NULL     | ID do backup do Duplicati                      |
| `date`             | DATETIME NOT NULL | Hora de execução do backup                     |
| `status`           | TEXT NOT NULL     | Status do backup (Sucesso, Aviso, Erro, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | Duração em segundos                            |
| `size`             | INTEGER           | Tamanho dos arquivos de origem                 |
| `uploaded_size`    | INTEGER           | Tamanho de dados carregados                    |
| `examined_files`   | INTEGER           | Número de arquivos examinados                  |
| `warnings`         | INTEGER           | Número de avisos                               |
| `errors`           | INTEGER           | Número de erros                                |
| `created_at`       | DATETIME          | Timestamp de criação do registro               |

#### Arrays de mensagens (armazenamento em JSON) {/* #message-arrays-json-storage */}

| Campo               | Tipo | Descrição                               |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | Matriz JSON de mensagens de log         |
| `warnings_array`    | TEXT | Matriz JSON de mensagens de aviso       |
| `errors_array`      | TEXT | Matriz JSON de mensagens de erro        |
| `available_backups` | TEXT | Matriz JSON de Versões de Backup Disponíveis |

#### Campos de operação de arquivo {/* #file-operation-fields */}

| Campo                 | Tipo    | Descrição                    |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | Arquivos examinados durante o Backup |
| `opened_files`        | INTEGER | Arquivos abertos para Backup |
| `added_files`         | INTEGER | Novos arquivos adicionados ao Backup |
| `modified_files`      | INTEGER | Arquivos modificados no Backup |
| `deleted_files`       | INTEGER | Arquivos excluídos do Backup |
| `deleted_folders`     | INTEGER | Pastas excluídas do Backup   |
| `added_folders`       | INTEGER | Pastas adicionadas ao Backup |
| `modified_folders`    | INTEGER | Pastas modificadas no Backup |
| `not_processed_files` | INTEGER | Arquivos não processados     |
| `too_large_files`     | INTEGER | Arquivos grandes demais para processar |
| `files_with_error`    | INTEGER | Arquivos com erros           |
| `added_symlinks`      | INTEGER | Links simbólicos adicionados |
| `modified_symlinks`   | INTEGER | Links simbólicos modificados |
| `deleted_symlinks`    | INTEGER | Links simbólicos excluídos   |

#### Campos de Tamanho do Arquivo {/* #file-size-fields */}

| Campo                    | Tipo    | Descrição                            |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Tamanho dos arquivos examinados durante o backup |
| `size_of_opened_files`   | INTEGER | Tamanho dos arquivos abertos para backup      |
| `size_of_added_files`    | INTEGER | Tamanho dos novos arquivos adicionados ao backup    |
| `size_of_modified_files` | INTEGER | Tamanho dos arquivos modificados no backup     |

#### Campos de Status da Operação {/* #operation-status-fields */}

| Campo                    | Tipo              | Descrição                      |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Resultado analisado da operação        |
| `main_operation`         | TEXT NOT NULL     | Tipo principal de operação            |
| `interrupted`            | BOOLEAN           | Se o backup foi interrompido           |
| `partial_backup`         | BOOLEAN           | Se o backup foi parcial               |
| `dryrun`                 | BOOLEAN           | Se o backup foi uma simulação         |
| `version`                | TEXT              | Versão do Duplicati utilizada         |
| `begin_time`             | DATETIME NOT NULL | Hora de início do backup              |
| `end_time`               | DATETIME NOT NULL | Hora de término do backup             |
| `warnings_actual_length` | INTEGER           | Contagem real de avisos               |
| `errors_actual_length`   | INTEGER           | Contagem real de erros                 |
| `messages_actual_length` | INTEGER           | Contagem real de mensagens             |

#### Campos de Estatísticas do Backend {/* #backend-statistics-fields */}

| Campo                            | Tipo     | Descrição                         |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Bytes baixados do destino         |
| `known_file_size`                | INTEGER  | Tamanho de arquivo conhecido no destino |
| `last_backup_date`               | DATETIME | Data do Último Backup no destino   |
| `backup_list_count`              | INTEGER  | Número de versões de backup         |
| `reported_quota_error`           | BOOLEAN  | Erro de cota relatado              |
| `reported_quota_warning`         | BOOLEAN  | Aviso de cota relatado            |
| `backend_main_operation`         | TEXT     | Operação principal do backend            |
| `backend_parsed_result`          | TEXT     | Resultado analisado do backend             |
| `backend_interrupted`            | BOOLEAN  | Operação do backend interrompida     |
| `backend_version`                | TEXT     | Versão do backend                   |
| `backend_begin_time`             | DATETIME | Hora de início da operação do backend      |
| `backend_duration`               | TEXT     | Duração da operação do backend        |
| `backend_warnings_actual_length` | INTEGER  | Contagem de Avisos do backend            |
| `backend_errors_actual_length`   | INTEGER  | Contagem de Erros do backend              |

### Tabela Configurations {/* #configurations-table */}

Armazena as definições de configuração do aplicativo.

#### Campos {/* #fields-1 */}

| Campo   | Tipo                      | Descrição                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Chave de configuração          |
| `value` | TEXT                      | Valor de configuração (JSON) |

#### Chaves de Configuração Comuns {/* #common-configuration-keys */}

- `email_config`: Configurações de notificação por E-mail
- `ntfy_config`: Configurações de notificação por NTFY
- `overdue_tolerance`: Configurações de tolerância de Backup Atrasado
- `notification_templates`: Modelos de mensagens de notificação
- `daily_summary`: Modo do Resumo Diário, agendamento, fuso horário, URL do painel público opcional e substituição opcional de Destinatário SMTP (`smtpRecipient`; se vazio, usa as Configurações de E-mail)
- `cron_service`: Agendamentos de tarefas cron, incluindo `daily-summary-dispatch` (`minute hour * * *` de `daily_summary.utcTime`)
- `audit_retention_days`: Período de Retenção de Log de Auditoria (Padrão: 90 dias)

### Tabela de Versão do Banco de Dados {/* #database-version-table */}

Rastreia a versão do esquema do banco de dados para fins de migração.

#### Campos {/* #fields-2 */}

| Campo        | Tipo             | Descrição                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | Versão do banco de dados           |
| `applied_at` | DATETIME         | Quando a migração foi aplicada |

### Tabela de Usuários {/* #users-table */}

Armazena informações de conta de usuário para autenticação e controle de acesso.

#### Campos {/* #fields-3 */}

| Campo                   | Tipo                 | Descrição                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | Identificador único de usuário              |
| `username`              | TEXT UNIQUE NOT NULL | Nome de usuário para login                  |
| `password_hash`         | TEXT NOT NULL        | Senha com hash Bcrypt              |
| `is_admin`              | BOOLEAN NOT NULL     | Se o usuário possui privilégios de administrador   |
| `must_change_password`  | BOOLEAN              | Se a alteração de senha é obrigatória |
| `created_at`            | DATETIME             | Timestamp de criação da conta          |
| `updated_at`       | DATETIME         | Timestamp de última atualização                                             |
| `last_login_at`         | DATETIME             | Timestamp do último login bem-sucedido     |
| `last_login_ip`         | TEXT                 | Endereço IP do último login            |
| `failed_login_attempts` | INTEGER              | Contagem de tentativas de login com falha      |
| `locked_until`          | DATETIME             | Expiração do bloqueio da conta (se bloqueado) |

### Tabela de Sessões {/* #sessions-table */}

Armazena dados de sessão do usuário para autenticação e segurança.

#### Campos {/* #fields-4 */}

| Campo             | Tipo              | Descrição                                                        |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | Identificador da sessão                                          |
| `user_id`         | TEXT              | Referência à tabela de usuários (anulável para sessões não autenticadas) |
| `created_at`      | DATETIME          | Timestamp de criação da sessão                                   |
| `last_accessed`   | DATETIME          | Timestamp do último acesso                                       |
| `expires_at`      | DATETIME NOT NULL | Timestamp de expiração da sessão                                 |
| `ip_address`      | TEXT              | Endereço IP de origem da sessão                                  |
| `user_agent`    | TEXT                              | String de Agente do Usuário                                       |
| `csrf_token`      | TEXT              | Token CSRF para a sessão                                         |
| `csrf_expires_at` | DATETIME          | Expiração do token CSRF                                          |

### Tabela de Log de Auditoria {/* #audit-log-table */}

Armazena a trilha de auditoria de ações do usuário e eventos do sistema.

#### Campos {/* #fields-5 */}

| Campo           | Tipo                              | Descrição                                                         |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador exclusivo da entrada do log de auditoria           |
| `timestamp`     | DATETIME                          | Timestamp do evento                                               |
| `user_id`       | TEXT                              | Referência à tabela de usuários (anulável)                         |
| `username`      | TEXT                              | Nome de usuário na hora da ação                                   |
| `action`        | TEXT NOT NULL                     | Ação realizada                                                    |
| `category`      | TEXT NOT NULL                     | Categoria da ação (ex.: 'authentication', 'settings', 'backup')   |
| `target_type`   | TEXT                              | Tipo de destino (por exemplo, 'server', 'backup', 'user')                 |
| `target_id`     | TEXT                              | Identificador do destino                                          |
| `details`       | TEXT                              | Detalhes adicionais (JSON)                                         |
| `ip_address`    | TEXT                              | Endereço IP do solicitante                                           |
| `user_agent`    | TEXT                              | String de Agente do Usuário                                       |
| `status`        | TEXT NOT NULL                     | Status da ação ('success', 'failure', 'error')                  |
| `error_message` | TEXT                              | Mensagem de erro se a ação falhou                                 |

### Tabela de Chaves de API {/* #api-keys-table */}

Armazena chaves de API com hash para as APIs HTTP externas. O segredo em texto simples é exibido uma vez na criação e nunca é armazenado.

#### Campos {/* #fields-6 */}

| Campo          | Tipo             | Descrição                                                |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | Identificador exclusivo de chave                         |
| `name`         | TEXT NOT NULL    | Nome de exibição                                         |
| `key_hash`     | TEXT UNIQUE      | Hash SHA-256 do segredo                                  |
| `key_prefix`   | TEXT             | Quatro primeiros caracteres do segredo (para impressões digitais) |
| `key_suffix`   | TEXT             | Quatro últimos caracteres do segredo (para impressões digitais)    |
| `scope`        | TEXT NOT NULL    | `upload` ou `read`                                       |
| `description`  | TEXT             | Descrição opcional                                       |
| `enabled`      | INTEGER          | `1` quando a chave estiver ativa                           |
| `created_at`   | DATETIME         | Timestamp de criação                                     |
| `created_by`   | TEXT             | ID de usuário do administrador que criou a chave         |
| `expires_at`   | DATETIME         | Expiração opcional                                       |
| `last_used_at` | DATETIME         | Último uso bem-sucedido                                   |
| `usage_count`  | INTEGER          | Contagem de usos bem-sucedidos                            |

Chaves de configuração relacionadas na tabela `configurations`: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`.

### Tabela de Entregas do Resumo Diário {/* #daily-summary-deliveries-table */}

Registro por canal para a entrega de e-mail do Resumo Diário. Linhas legadas podem incluir um canal `ntfy` de versões anteriores. Cada ocorrência agendada (ou envio manual exclusivo) tem no máximo uma linha por canal. Os payloads renderizados são armazenados antes do envio para que as novas tentativas mantenham o mesmo snapshot. Linhas com mais de 30 dias são removidas.

Se o processo for encerrado após um provedor aceitar uma mensagem, mas antes de o sucesso ser registrado, esse canal poderá ser tentado novamente (pelo menos uma vez).

#### Campos {/* #fields-7 */}

| Campo              | Tipo             | Descrição                                                                   |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | Identificador exclusivo de entrega                                          |
| `occurrence_key`   | TEXT NOT NULL    | Chave agendada `scheduled:UTC:{date}:{HH:mm}` ou `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` ou `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual` ou `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | Data do calendário local para o snapshot                                    |
| `time_zone`        | TEXT NOT NULL    | Fuso horário IANA salvo                                                         |
| `payload_json`     | TEXT             | Campos renderizados de assunto, HTML, texto e NTFY                          |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent` ou `failed`                                   |
| `attempt_count`    | INTEGER          | Tentativas de entrega                                                       |
| `next_retry_at`    | DATETIME         | Quando um canal com falha pode ser reivindicado novamente                   |
| `lease_expires_at` | DATETIME         | Concessão de reivindicação; uma concessão obsoleta pode ser recuperada      |
| `error`            | TEXT             | Último erro, se houver                                                      |
| `created_at`       | DATETIME         | Timestamp de criação da linha                                               |
| `updated_at`       | DATETIME         | Timestamp de última atualização                                             |
| `sent_at`          | DATETIME         | Timestamp de sucesso                                                        |

Um índice exclusivo em `(occurrence_key, channel)` evita envios duplicados da mesma ocorrência no mesmo canal.

## Gerenciamento de Sessão {/* #session-management */}

### Armazenamento de Sessão Baseado em Banco de Dados {/* #database-backed-session-storage */}

As sessões são armazenadas no banco de dados com fallback em memória:
- **Armazenamento Primário**: Tabela de sessões baseada em banco de dados
- **Fallback**: Armazenamento em memória (suporte a legado ou casos de erro)
- **ID de Sessão**: Cadeia de caracteres aleatória criptograficamente segura
- **Expiração**: Tempo limite de sessão configurável
- **Proteção contra CSRF**: Proteção contra cross-site request forgery
- **Limpeza Automática**: Sessões expiradas são removidas automaticamente

### Endpoints da API de Sessão {/* #session-api-endpoints */}

- `POST /api/session`: Cria uma nova sessão
- `GET /api/session`: Valida a sessão existente
- `DELETE /api/session`: Destrói a sessão
- `GET /api/csrf`: Obtém o token CSRF

## Índices {/* #indexes */}

O banco de dados inclui vários índices para otimizar o desempenho das consultas:

- **Chaves Primárias**: Todas as tabelas possuem índices de chave primária
- **Chaves Estrangeiras**: Referências de servidor na tabela de backups, referências de usuário em sessions e audit_log
- **Otimização de Consultas**: Índices em campos consultados com frequência
- **Índices de Data**: Índices em campos de data para consultas baseadas em tempo
- **Índices de Usuário**: Índice de nome de usuário para buscas rápidas de usuários
- **Índices de Sessão**: Índices de expiração e user_id para gerenciamento de sessões
- **Índices de Auditoria**: Índices de timestamp, user_id, action, category e status para consultas de auditoria
- **Índices de Chave de API**: Hash exclusivo, além de buscas por habilitado/escopo para autenticação

## Relacionamentos {/* #relationships */}

- **Servidores → Backups**: Relacionamento de um para muitos
- **Usuários → Sessões**: Relacionamento de um para muitos (as sessões podem existir sem usuários)
- **Usuários → Log de Auditoria**: Relacionamento de um para muitos (entradas de auditoria podem existir sem usuários)
- **Usuários → Chaves de API**: Relacionamento de um para muitos via `created_by` (as chaves permanecem após a exclusão do usuário)
- **Backups → Mensagens**: Matrizes JSON incorporadas
- **Configurações**: Armazenamento chave-valor

## Tipos de Dados {/* #data-types */}

- **TEXT**: Dados de cadeia de caracteres, matrizes JSON
- **INTEGER**: Dados numéricos, contagens de arquivos, tamanhos
- **REAL**: Números de ponto flutuante, durações
- **DATETIME**: Dados de timestamp
- **BOOLEAN**: Valores true/false

## Valores de Status de Backup {/* #backup-status-values */}

- **Sucesso**: Backup concluído com sucesso
- **Aviso**: Backup concluído com avisos
- **Erro**: Backup concluído com erros
- **Fatal**: Backup falhou fatalmente

## Consultas Comuns {/* #common-queries */}

### Obter o Backup Mais Recente de um Servidor {/* #get-latest-backup-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### Obter todos os backups de um Servidor {/* #get-all-backups-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### Obter Resumo do Servidor {/* #get-server-summary */}

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

### Obter Resumo Geral {/* #get-overall-summary */}

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

### Limpeza do Banco de Dados {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## Mapeamento de JSON para o Banco de Dados {/* #json-to-database-mapping */}

### Mapeamento do Corpo da Requisição da API para Colunas do Banco de Dados {/* #api-request-body-to-database-columns-mapping */}

Quando o Duplicati envia dados de backup via HTTP POST, a estrutura JSON é mapeada para as colunas do banco de dados:

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
