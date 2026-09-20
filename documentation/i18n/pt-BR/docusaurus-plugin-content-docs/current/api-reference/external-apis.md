# APIs externas {/* #external-apis */}

Esses endpoints são projetados para uso por outros aplicativos e integrações, por exemplo [Página Inicial](../user-guide/homepage-integration.md). Eles estão isentos de CSRF e não usam cookies de sessão.

A autenticação é opcional e desativada por padrão. Embora as chaves sejam opcionais, os clientes podem omitir a chave ou enviar uma: uma chave válida de escopo correspondente é aceita e registrada; uma chave inválida é ignorada e a solicitação ainda prossegue. Quando **Requerer chaves de API** está habilitado em [Chaves de API](../user-guide/settings/api-keys-settings.md), envie a chave como `?api_key=`, `X-Api-Key` ou `Authorization: Bearer`. Chaves de upload funcionam apenas em `POST /api/upload`. Chaves de leitura funcionam apenas em `/api/summary` e `/api/lastbackup*`. Chaves de string de consulta aparecem nos logs de acesso do proxy reverso.

Uma [lista de permissões de IP](../user-guide/settings/ip-allowlist-settings.md) também pode restringir essas rotas. `/api/health` e `/api/ping` permanecem públicos enquanto ambas as listas estiverem desativadas; quando qualquer lista é habilitada, elas aceitam loopback e CIDRs da lista de administrador ou externa, e clientes não-loopback têm limite de taxa.

## Obter Resumo Geral - `/api/summary` {/* #get-overall-summary---apisummary */}
- **Endpoint**: `/api/summary`
- **Método**: GET
- **Descrição**: Recupera um resumo de todas as operações de backup em todos os servidores.
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
  - `401`: Chave de API ausente ou inválida quando as chaves são necessárias
  - `403`: O escopo da chave não é `read`, ou o IP do cliente não está na lista de permissões externa
  - `429`: Limite de taxa da API de leitura excedido
  - `500`: Erro do servidor ao buscar dados de resumo
- **Notas**:
  - Na versão 0.5.x, o campo `totalBackupedSize` foi substituído por `totalBackupSize`
  - Na versão 0.7.x, o campo `totalMachines` foi substituído por `totalServers`
  - O campo `overdueBackupsCount` mostra o número de backups atualmente atrasados
  - O campo `secondsSinceLastBackup` mostra o tempo em segundos desde o último backup em todos os servidores
  - Retorna resposta de fallback com zeros se a busca de dados falhar
  - **Nota**: Para uso interno do painel, considere usar `/api/dashboard` que inclui esses dados mais informações adicionais

## Obter Último Backup - `/api/lastbackup/:serverId` {/* #get-latest-backup---apilastbackupserverid */}
- **Endpoint**: `/api/lastbackup/:serverId`
- **Método**: GET
- **Descrição**: Recupera as informações do último backup para um servidor específico.
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
  - `401`: Chave de API ausente ou inválida quando as chaves são necessárias
  - `403`: O escopo da chave não é `read`, ou o IP do cliente não está na lista de permissões externa
  - `404`: Servidor não encontrado
  - `429`: Limite de taxa da API de leitura excedido
  - `500`: Erro interno do servidor
- **Notas**:
  - Na versão 0.7.x, a chave do objeto de resposta mudou de `machine` para `server`
  - O identificador do servidor pode ser ID ou nome
  - Retorna nulo para latest_backup se não existirem backups
  - Inclui cabeçalhos de controle de cache para evitar cache

## Obter Últimos Backups - `/api/lastbackups/:serverId` {/* #get-latest-backups---apilastbackupsserverid */}
- **Endpoint**: `/api/lastbackups/:serverId`
- **Método**: GET
- **Descrição**: Recupera as informações do último backup para todos os backups configurados (por exemplo, 'Arquivos', 'Bancos de Dados') em um servidor específico.
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
  - `401`: Chave de API ausente ou inválida quando as chaves são necessárias
  - `403`: O escopo da chave não é `read`, ou o IP do cliente não está na lista de permissões externa
  - `404`: Servidor não encontrado
  - `429`: Limite de taxa da API de leitura excedido
  - `500`: Erro interno do servidor
- **Notas**:
  - Na versão 0.7.x, a chave do objeto de resposta mudou de `machine` para `server`, e o campo `backup_types_count` foi renomeado para `backup_jobs_count`
  - O identificador do servidor pode ser ID ou nome
  - Retorna o último backup para cada trabalho de backup (backup_name) que o servidor possui
  - Diferente de `/api/lastbackup/:serverId` que retorna apenas o backup mais recente do servidor (independente do trabalho de backup)
  - Inclui cabeçalhos de controle de cache para evitar cache

## Carregar Dados de Backup - `/api/upload` {/* #upload-backup-data---apiupload */}
- **Endpoint**: `/api/upload`
- **Método**: POST
- **Descrição**: Carrega dados da operação de backup para um servidor. Suporta detecção de execução de backup duplicado e envia notificações.
- **Corpo da Solicitação**: JSON enviado pelo duplicati com as seguintes opções:

  ```bash
  --send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
  --send-http-log-level=Information
  --send-http-max-log-lines=500
```

Em Duplicati anterior a 2.0.9.106, use `--send-http-url` com `--send-http-result-output-format=Json`. Veja [Configuração do Servidor Duplicati](../installation/duplicati-server-configuration.md).

- **Resposta**:

  ```json
  {
    "success": true
  }
  ```

- **Respostas de Erro**:
  - `400`: Campos obrigatórios ausentes nas seções Extra ou Dados, ou MainOperation inválido
  - `401`: Chave API ausente ou inválida quando chaves são necessárias
  - `403`: Escopo da chave não é `upload`, ou o IP do cliente não está na lista de permissão externa
  - `409`: Dados de backup duplicados (ignorados)
  - `413`: O corpo da solicitação excede o limite de tamanho de upload configurado (padrão 5 MB)
  - `429`: Limite de taxa de falha de upload ou autenticação excedido (`Retry-After` está definido)
  - `500`: Erro do servidor ao processar dados de backup
- **Notas**:
  - Apenas processa operações de backup (MainOperation deve ser "Backup")
  - Valida campos obrigatórios na seção Extra: machine-id, machine-name, backup-name, backup-id
  - Valida campos obrigatórios na seção Dados: ParsedResult, BeginTime, Duração
  - Detecta automaticamente execuções de backup duplicadas e retorna status 409
  - Envia notificações após a inserção bem-sucedida do backup (se configurado)
  - Registra dados da solicitação em um arquivo no diretório `data` na raiz do projeto em modo de desenvolvimento para depuração
  - Usa transação para consistência de dados
