# Operações Principais {/* #core-operations */}

## Obter Dados do Painel (Consolidado) - `/api/dashboard` {/* #get-dashboard-data-consolidated---apidashboard */}
- **Endpoint**: `/api/dashboard`
- **Method**: GET
- **Descrição**: Recupera todos os dados do painel em uma única resposta consolidada, incluindo resumos de servidores, resumo geral e dados de gráficos.
- **Resposta**:

  ```json
  {
    "serversSummary": [
      {
        "id": "server-id",
        "name": "Server Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastBackupStatus": "Success",
        "lastBackupDuration": "00:38:31",
        "lastBackupListCount": 10,
        "lastBackupName": "Backup Name",
        "lastBackupId": "backup-id",
        "backupCount": 15,
        "totalWarnings": 5,
        "totalErrors": 0,
        "availableBackups": ["v1", "v2", "v3"],
        "isBackupOverdue": false,
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago",
        "lastOverdueCheck": "2024-03-20T12:00:00Z",
        "lastNotificationSent": "N/A"
      }
    ],
    "overallSummary": {
      "totalServers": 3,
      "totalBackups": 9,
      "totalUploadedSize": 2397229507,
      "totalStorageUsed": 43346796938,
      "totalBackupSize": 126089687807,
      "overdueBackupsCount": 2,
      "secondsSinceLastBackup": 7200
    },
    "chartData": [
      {
        "date": "20/03/2024",
        "isoDate": "2024-03-20T10:00:00Z",
        "uploadedSize": 1024000,
        "duration": 45,
        "fileCount": 1500,
        "fileSize": 2048000,
        "storageSize": 3072000,
        "backupVersions": 5
      }
    ]
  }
  ```

- **Respostas de Erro**:
  - `500`: Erro no servidor ao buscar dados do painel
- **Notas**:
  - Este endpoint consolida o endpoint `/api/servers-summary` anterior (que foi removido)
  - O campo `overallSummary` contém os mesmos dados que `/api/summary` (que é mantido para aplicações externas)
  - O campo `chartData` contém os mesmos dados que `/api/chart-data/aggregated` (que ainda existe para acesso direto)
  - Proporciona melhor desempenho ao reduzir múltiplas chamadas de API para uma única requisição
  - Todos os dados são buscados em paralelo para um desempenho ideal
  - O campo `secondsSinceLastBackup` exibe o tempo em segundos desde o último backup em todos os servidores

## Obter Todos os Servidores - `/api/servers` {/* #get-all-servers---apiservers */}
- **Endpoint**: `/api/servers`
- **Method**: GET
- **Descrição**: Recupera uma lista de todos os servidores com suas informações básicas. Opcionalmente, inclui informações de backup.
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros de Consulta**:
  - `includeBackups` (opcional): Defina como `true` para incluir informações de backup de cada servidor
- **Resposta** (sem parâmetros):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "alias": "Server Alias",
      "note": "Additional notes about the server"
    }
  ]
  ```

- **Resposta** (com `includeBackups=true`):

  ```json
  [
    {
      "id": "server-id",
      "name": "Server Name",
      "backupName": "Backup Name",
      "server_url": "http://localhost:8200",
      "alias": "Server Alias",
      "note": "Additional notes about the server",
      "hasPassword": true
    }
  ]
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `500`: Erro no servidor ao buscar servidores
- **Notas**:
  - Retorna informações do servidor, incluindo os campos de alias e nota
  - Quando `includeBackups=true`, retorna combinações de servidor-backup com URLs e status da senha
  - Consolida o endpoint `/api/servers-with-backups` anterior (que foi removido)
  - Usado para seleção, exibição e fins de configuração de servidores
  - Inclui o campo `hasPassword` para indicar se o servidor possui senha armazenada

## Obter Detalhes do Servidor - `/api/servers/:id` {/* #get-server-details---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Method**: GET
- **Descrição**: Recupera informações sobre um servidor específico. Pode retornar informações básicas do servidor ou informações detalhadas, incluindo backups e dados de gráficos.
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros**:
  - `id`: o identificador do servidor
- **Parâmetros de Consulta**:
  - `includeBackups` (opcional): Defina como `true` para incluir dados de backup
  - `includeChartData` (opcional): Defina como `true` para incluir dados de gráficos
- **Resposta** (sem parâmetros):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200"
  }
  ```

- **Resposta** (com parâmetros):

  ```json
  {
    "id": "server-id",
    "name": "Server Name",
    "alias": "Server Alias",
    "note": "Additional notes about the server",
    "server_url": "http://localhost:8200",
    "backups": [
      { ... }
    ],
    "chartData": [
      { ... }
    ]
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `404`: Servidor não encontrado
  - `500`: Erro no servidor ao buscar detalhes do servidor
- **Notas**:
  - Retorna informações básicas do servidor quando nenhum parâmetro de consulta é fornecido
  - Definir `includeBackups` ou `includeChartData` como `true` retorna os dados completos do servidor, incluindo backups e chartData
  - Usado para configurações do servidor e visualizações detalhadas

## Atualizar Servidor - `/api/servers/:id` {/* #update-server---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Method**: PATCH
- **Descrição**: Atualiza os detalhes do servidor, incluindo alias, nota e URL do servidor.
- **Autenticação**: Requer sessão válida e token CSRF
- **Parâmetros**:
  - `id`: o identificador do servidor
- **Corpo da Requisição**:

  ```json
  {
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Resposta**:

  ```json
  {
    "message": "Server updated successfully",
    "serverId": "server-id",
    "server_url": "http://localhost:8200",
    "alias": "Server Alias",
    "note": "Additional notes about the server"
  }
  ```

- **Respostas de Erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `404`: Servidor não encontrado
  - `500`: Erro no servidor durante a atualização
- **Notas**:
  - Atualiza o alias do servidor, a nota e a URL do servidor
  - Todos os campos são opcionais
  - Strings vazias são permitidas para todos os campos

## Excluir Servidor - `/api/servers/:id` {/* #delete-server---apiserversid */}
- **Endpoint**: `/api/servers/:id`
- **Método**: DELETE
- **Descrição**: Exclui um servidor e todos os backups associados a ele.
- **Autenticação**: Requer sessão e token CSRF válidos
- **Parâmetros**:
  - `id`: o identificador do servidor

- **Resposta**:

  ```json
  {
    "message": "Successfully deleted server and 15 backups",
    "status": 200,
    "changes": {
      "backupChanges": 15,
      "serverChanges": 1
    }
  }
  ```

- **Respostas de erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `404`: Servidor não encontrado
  - `500`: Erro no servidor durante a exclusão
- **Notas**: 
  - Esta operação é irreversível
  - Todos os dados de backup associados ao servidor serão excluídos permanentemente
  - O próprio registro do servidor também será removido
  - Retorna a contagem de backups e servidores excluídos

## Obter dados do servidor com informações de backup atrasado - `/api/detail/:serverId` {/* #get-server-data-with-overdue-info---apidetailserverid */}
- **Endpoint**: `/api/detail/:serverId`
- **Método**: GET
- **Descrição**: Recupera informações detalhadas do servidor, incluindo o status de backup atrasado.
- **Parâmetros**:
  - `serverId`: o identificador do servidor

- **Resposta**:

  ```json
  {
    "server": {
      "id": "server-id",
      "name": "Server Name",
      "backups": [...]
    },
    "overdueBackups": [
      {
        "serverName": "Server Name",
        "backupName": "Backup Name",
        "lastBackupDate": "2024-03-20T10:00:00Z",
        "lastNotificationSent": "2024-03-20T12:00:00Z",
        "notificationEvent": "all",
        "expectedBackupDate": "2024-03-21T10:00:00Z",
        "expectedBackupElapsed": "2 hours ago"
      }
    ],
    "lastOverdueCheck": "2024-03-20T12:00:00Z"
  }
  ```

- **Respostas de erro**:
  - `404`: Servidor não encontrado
  - `500`: Erro no servidor ao buscar detalhes do servidor
- **Notas**:
  - Retorna dados do servidor com informações de backup atrasado
  - Inclui detalhes e carimbos de data/hora do backup atrasado
  - Usado para gerenciamento e monitoramento de backups atrasados

## Obter Servidores Duplicados - `/api/servers/duplicates` {/* #get-duplicate-servers---apiserversduplicates */}
- **Endpoint**: `/api/servers/duplicates`
- **Método**: GET
- **Descrição**: Recupera uma lista de servidores duplicados com base no ID da máquina. Servidores duplicados são servidores que compartilham o mesmo ID de máquina, mas são armazenados como registros separados no banco de dados.
- **Autenticação**: Requer sessão válida, token CSRF e acesso de administrador
- **Resposta**:

  ```json
  [
    {
      "machineId": "machine-id-123",
      "servers": [
        {
          "id": "server-id-1",
          "name": "Server Name 1",
          "alias": "Server Alias 1",
          "server_url": "http://localhost:8200",
          "backupCount": 5
        },
        {
          "id": "server-id-2",
          "name": "Server Name 2",
          "alias": "Server Alias 2",
          "server_url": "http://localhost:8200",
          "backupCount": 3
        }
      ]
    }
  ]
  ```

- **Respostas de erro**:
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Acesso de administrador obrigatório
  - `500`: Erro no servidor ao buscar servidores duplicados
- **Notas**:
  - Apenas administradores podem acessar este endpoint
  - Retorna grupos de servidores que compartilham o mesmo ID de máquina
  - Cada grupo contém todos os servidores com o mesmo ID de máquina
  - Usado para identificar e mesclar registros de servidores duplicados
  - Inclui detalhes do servidor e contagens de backup para cada duplicata

## Mesclar Servidores - `/api/servers/merge` {/* #merge-servers---apiserversmerge */}
- **Endpoint**: `/api/servers/merge`
- **Método**: POST
- **Descrição**: Mescla vários servidores em um servidor de destino. Todos os backups dos servidores de origem são transferidos para o servidor de destino, e os servidores de origem são excluídos.
- **Autenticação**: Requer sessão válida, token CSRF e acesso de administrador
- **Corpo da requisição**:

  ```json
  {
    "oldServerIds": ["server-id-1", "server-id-2"],
    "targetServerId": "server-id-3"
  }
  ```

- **Resposta**:

  ```json
  {
    "success": true,
    "message": "Successfully merged 2 server(s) into target server",
    "backupIdsNormalized": 1
  }
  ```

- **Respostas de erro**:
  - `400`: Corpo da requisição inválido, campos obrigatórios ausentes ou o servidor de destino está na lista de servidores a serem mesclados
  - `401`: Não autorizado - Sessão ou token CSRF inválido
  - `403`: Acesso de administrador obrigatório
  - `500`: Erro no servidor durante a operação de mesclagem
- **Notas**:
  - Apenas administradores podem realizar operações de mesclagem
  - O servidor de destino não deve estar na lista de servidores a serem mesclados
  - Todos os backups dos servidores de origem são transferidos para o servidor de destino
  - Valores duplicados de `backup_id` para o mesmo `backup_name` no servidor mesclado são normalizados para o ID da linha de backup mais recente
  - Os servidores de origem são excluídos após a mesclagem bem-sucedida
  - Esta operação é irreversível
  - Usado para consolidar registros de servidor duplicados
  - Valida se oldServerIds é um array não vazio
  - Valida se targetServerId é fornecido e é uma string
