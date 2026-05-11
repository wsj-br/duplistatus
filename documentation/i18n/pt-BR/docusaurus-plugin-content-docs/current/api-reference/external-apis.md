---
translation_last_updated: '2026-05-11T14:27:39.123Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: 59b045e2f0ca88a7be16ce8ed6d2ae4476eed38416d4d0284b2f590183c45b81
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/external-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# APIs Externas {#external-apis}

Esses endpoints são projetados para uso por outras aplicações e integrações, por exemplo [Homepage](../user-guide/homepage-integration.md).

## Obter Resumo Geral - `/api/summary` {#get-overall-summary---apisummary}
- **Endpoint**: `/api/summary`
- **Method**: GET
- **Description**: Recupera um resumo de todas as operações de backup em todos os servidores.
- **Resposta**:

  ```json
  {
    "totalServers": 3,
    "totalBackupsRuns": 9,
    "totalBackups": 9,
    "totalUploadedSize": 2397229507,
    "totalStorageUsed": 43346796938,
    "totalBackupSize": 126089687807,
    "overdueBackupsCount": 2,
    "secondsSinceLastBackup": 7200
  }
  ```

- **Respostas de Erro**:
  - `500`: Erro do servidor ao buscar dados do resumo
- **Notas**:
  - Na versão 0.5.x, o campo `totalBackupedSize` foi substituído por `totalBackupSize`
  - Na versão 0.7.x, o campo `totalMachines` foi substituído por `totalServers`
  - O campo `overdueBackupsCount` mostra o número de backups atualmente atrasados
  - O campo `secondsSinceLastBackup` mostra o tempo em segundos desde o último backup em todos os servidores
  - Retorna resposta de contingência com zeros se a busca de dados falhar
  - **Observação**: Para uso interno no painel, considere usar `/api/dashboard`, que inclui esses dados mais informações adicionais

## Obter Último Backup - `/api/lastbackup/:serverId` {#get-latest-backup---apilastbackupserverid}
- **Endpoint**: `/api/lastbackup/:serverId`
- **Method**: GET
- **Description**: Recupera as informações do último backup para um servidor específico.
- **Parâmetros**:
  - `serverId`: o identificador do servidor (ID ou nome)

:::note
O identificador do servidor deve ser codificado em URL.
:::

- **Resposta**:

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Backup Name",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "server_id": "unique-server-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "messages": 150,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "uploadedSize": 331318892,
      "duration": "00:38:31",
      "duration_seconds": 2311.6018052,
      "durationInMinutes": 38.52669675333333,
      "knownFileSize": 27203688543,
      "backup_list_count": 10,
      "messages_array": ["message1", "message2"],
      "warnings_array": ["warning1"],
      "errors_array": [],
      "available_backups": ["v1", "v2", "v3"]
    },
    "status": 200
  }
  ```

- **Respostas de Erro**:
  - `404`: Servidor não encontrado
  - `500`: Erro interno do servidor
- **Notas**:
  - Na versão 0.7.x, a chave do objeto de resposta mudou de `machine` para `server`
  - O identificador do servidor pode ser ID ou nome
  - Retorna null para latest_backup se não houver backups
  - Inclui cabeçalhos de controle de cache para evitar armazenamento em cache

## Obter Últimos Backups - `/api/lastbackups/:serverId` {#get-latest-backups---apilastbackupsserverid}
- **Endpoint**: `/api/lastbackups/:serverId`
- **Method**: GET
- **Description**: Recupera as informações dos últimos backups para todos os backups configurados (por exemplo, 'Arquivos', 'Bancos de Dados') em um servidor específico.
- **Parâmetros**:
  - `serverId`: o identificador do servidor (ID ou nome)

:::note
O identificador do servidor deve ser codificado em URL.
:::

- **Resposta**:

  ```json
  {
    "server": {
      "id": "unique-server-id",
      "name": "Server Name",
      "backup_name": "Default Backup",
      "backup_id": "backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backups": [
      {
        "id": "backup1",
        "server_id": "unique-server-id",
        "name": "Files",
        "date": "2024-03-20T10:00:00Z",
        "status": "Success",
        "warnings": 0,
        "errors": 0,
        "messages": 150,
        "fileCount": 249426,
        "fileSize": 113395849938,
        "uploadedSize": 331318892,
        "duration": "00:38:31",
        "duration_seconds": 2311.6018052,
        "durationInMinutes": 38.52669675333333,
        "knownFileSize": 27203688543,
        "backup_list_count": 10,
        "messages_array": "[\"message1\", \"message2\"]",
        "warnings_array": "[\"warning1\"]",
        "errors_array": "[]",
        "available_backups": ["v1", "v2", "v3"]
      },
      {
        "id": "backup2",
        "server_id": "unique-server-id",
        "name": "Databases",
        "date": "2024-03-20T11:00:00Z",
        "status": "Success",
        "warnings": 1,
        "errors": 0,
        "messages": 75,
        "fileCount": 125000,
        "fileSize": 56789012345,
        "uploadedSize": 123456789,
        "duration": "00:25:15",
        "duration_seconds": 1515.1234567,
        "durationInMinutes": 25.25205761166667,
        "knownFileSize": 12345678901,
        "backup_list_count": 5,
        "messages_array": ["message1"],
        "warnings_array": ["warning1"],
        "errors_array": [],
        "available_backups": ["v1", "v2"]
      }
    ],
    "backup_jobs_count": 2,
    "backup_names": ["Files", "Databases"],
    "status": 200
  }
  ```

- **Respostas de Erro**:
  - `404`: Servidor não encontrado
  - `500`: Erro interno do servidor
- **Notas**:
  - Na versão 0.7.x, a chave do objeto de resposta mudou de `machine` para `server`, e o campo `backup_types_count` foi renomeado para `backup_jobs_count`
  - O identificador do servidor pode ser ID ou nome
  - Retorna o último backup para cada tarefa de backup (backup_name) que o servidor possui
  - Diferentemente de `/api/lastbackup/:serverId`, que retorna apenas o backup mais recente do servidor (independente da tarefa de backup)
  - Inclui cabeçalhos de controle de cache para evitar armazenamento em cache

## Enviar Dados de Backup - `/api/upload` {#upload-backup-data---apiupload}
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Envia dados da operação de backup para um servidor. Suporta detecção de execuções duplicadas de backup e envia notificações.
- **Corpo da Requisição**: JSON enviado pelo Duplicati com as seguintes opções:

  ```bash
  --send-http-url=http://my.local.server:9666/api/upload
  --send-http-result-output-format=Json
  --send-http-log-level=Information
  ```

- **Resposta**:

  ```json
  {
    "success": true
  }
  ```

- **Respostas de Erro**:
  - `400`: Campos obrigatórios ausentes nas seções Extra ou Data, ou MainOperation inválido
  - `409`: Dados de backup duplicados (ignorados)
  - `500`: Erro do servidor ao processar dados de backup
- **Notas**:
  - Processa apenas operações de backup (MainOperation deve ser "Backup")
  - Valida campos obrigatórios na seção Extra: machine-id, machine-name, backup-name, backup-id
  - Valida campos obrigatórios na seção Data: ParsedResult, BeginTime, Duration
  - Detecta automaticamente execuções duplicadas de backup e retorna status 409
  - Envia notificações após a inserção bem-sucedida do backup (se configurado)
  - Registra os dados da requisição em um arquivo no diretório `data` na raiz do projeto em modo de desenvolvimento para depuração
  - Usa transação para consistência de dados
