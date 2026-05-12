# Dados do Gráfico {#chart-data}

## Obter Dados do Gráfico Agregado - `/api/chart-data/aggregated` {#get-aggregated-chart-data---apichart-dataaggregated}
- **Endpoint**: `/api/chart-data/aggregated`
- **Method**: GET
- **Description**: Recupera dados agregados do gráfico com filtro opcional de intervalo de tempo.
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
  - Suporta filtragem por intervalo de tempo com os parâmetros startDate e endDate
  - Valida o formato da data antes do processamento
  - Retorna dados agregados de todos os servidores

## Obter Dados do Gráfico do Servidor - `/api/chart-data/server/:serverId` {#get-server-chart-data---apichart-dataserverserverid}
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Method**: GET
- **Description**: Recupera dados do gráfico para um servidor específico com filtro opcional de intervalo de tempo.
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
  - Suporta filtragem por intervalo de tempo com os parâmetros startDate e endDate
  - Valida o formato da data antes do processamento
  - Retorna dados do gráfico para um servidor específico

## Obter Dados do Gráfico de Backup do Servidor - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname}
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Method**: GET
- **Description**: Recupera dados do gráfico para um servidor e backup específicos com filtro opcional de intervalo de tempo.
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
  - Suporta filtragem por intervalo de tempo com os parâmetros startDate e endDate
  - Valida o formato da data antes do processamento
  - Retorna dados do gráfico para uma combinação específica de servidor e backup
  - O nome do backup deve estar codificado em URL
