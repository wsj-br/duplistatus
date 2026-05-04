---
translation_last_updated: '2026-04-17T23:59:41.774Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: e8daf2dcb7456f01747c2576f18ec55fa9ca80d2816091104bc8cdef9ae84fb7
translation_language: pt-BR
source_file_path: documentation/docs/api-reference/chart-data-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Dados do Gráfico {#chart-data}

## Obter Dados Agregados do Gráfico - `/api/chart-data/aggregated` {#get-aggregated-chart-data-apichart-dataaggregated}
- **Endpoint**: `/api/chart-data/aggregated`
- **Método**: GET
- **Descrição**: Recupera dados agregados do gráfico com filtro opcional de intervalo de tempo.
- **Parâmetros de Consulta**:
  - `startDate` (opcional): Data de início para filtragem (formato ISO)
  - `endDate` (opcional): Data de término para filtragem (formato ISO)
- **Resposta**:

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Respostas de Erro**:
  - `400`: Parâmetros de data inválidos
  - `500`: Erro no servidor ao buscar dados do gráfico
- **Notas**:
  - Suporta filtragem de intervalo de tempo com os parâmetros startDate e endDate
  - Valida o formato da data antes do processamento
  - Retorna dados agregados de todos os servidores

## Obter Dados do Gráfico do Servidor - `/api/chart-data/server/:serverId` {#get-server-chart-data-apichart-dataserverserverid}
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Método**: GET
- **Descrição**: Recupera dados do gráfico para um servidor específico com filtro opcional de intervalo de tempo.
- **Parâmetros**:
  - `serverId`: o identificador do servidor
- **Parâmetros de Consulta**:
  - `startDate` (opcional): Data de início para filtragem (formato ISO)
  - `endDate` (opcional): Data de término para filtragem (formato ISO)
- **Resposta**:

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Respostas de Erro**:
  - `400`: Parâmetros de data inválidos
  - `500`: Erro no servidor ao buscar dados do gráfico
- **Notas**:
  - Suporta filtragem de intervalo de tempo com os parâmetros startDate e endDate
  - Valida o formato da data antes do processamento
  - Retorna dados do gráfico para um servidor específico

## Obter Dados do Gráfico de Backup do Servidor - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data-apichart-dataserverserveridbackupbackupname}
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Método**: GET
- **Descrição**: Recupera dados do gráfico para um servidor e backup específicos com filtro opcional de intervalo de tempo.
- **Parâmetros**:
  - `serverId`: o identificador do servidor
  - `backupName`: o nome do backup (codificado em URL)
- **Parâmetros de Consulta**:
  - `startDate` (opcional): Data de início para filtragem (formato ISO)
  - `endDate` (opcional): Data de término para filtragem (formato ISO)
- **Resposta**:

  ```json
  [
    {
      "date": "20/03/2024",
      "isoDate": "2024-03-20T10:00:00Z",
      "uploadedSize": 331318892,
      "duration": 38,
      "fileCount": 249426,
      "fileSize": 113395849938,
      "storageSize": 27203688543,
      "backupVersions": 10
    }
  ]
  ```

- **Respostas de Erro**:
  - `400`: Parâmetros de data inválidos
  - `500`: Erro no servidor ao buscar dados do gráfico
- **Notas**:
  - Suporta filtragem de intervalo de tempo com os parâmetros startDate e endDate
  - Valida o formato da data antes do processamento
  - Retorna dados do gráfico para uma combinação específica de servidor e backup
  - O nome do backup deve estar codificado em URL
