# Dados do Gráfico {/* #chart-data */}

## Obter Dados Agregados do Gráfico - `/api/chart-data/aggregated` {/* #get-aggregated-chart-data---apichart-dataaggregated */}
- **Endpoint**: `/api/chart-data/aggregated`
- **Método**: GET
- **Descrição**: Recupera dados agregados do gráfico com filtragem opcional por intervalo de tempo.
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
  - `500`: Erro de servidor ao buscar dados do gráfico
- **Notas**:
  - Suporta filtragem por intervalo de tempo com parâmetros startDate e endDate
  - Valida formato de data antes do processamento
  - Retorna dados agregados em todos os servidores

## Obter Dados do Gráfico do Servidor - `/api/chart-data/server/:serverId` {/* #get-server-chart-data---apichart-dataserverserverid */}
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Método**: GET
- **Descrição**: Recupera dados do gráfico para um servidor específico com filtragem opcional por intervalo de tempo.
- **Parâmetros**:
  - `serverId`: o identificador do servidor
- **Parâmetros de Consulta**:
  - `startDate` (opcional): Data inicial para filtragem (formato ISO)
  - `endDate` (opcional): Data final para filtragem (formato ISO)
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
  - `500`: Erro de servidor ao buscar dados do gráfico
- **Notas**:
  - Suporta filtragem por intervalo de tempo com parâmetros startDate e endDate
  - Valida formato de data antes do processamento
  - Retorna dados do gráfico para servidor específico

## Obter Dados do Gráfico de Backup do Servidor - `/api/chart-data/server/:serverId/backup/:backupName` {/* #get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname */}
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Método**: GET
- **Descrição**: Recupera dados do gráfico para um servidor e backup específicos com filtragem opcional por intervalo de tempo.
- **Parâmetros**:
  - `serverId`: o identificador do servidor
  - `backupName`: o nome do backup (codificado em URL)
- **Parâmetros de Consulta**:
  - `startDate` (opcional): Data inicial para filtragem (formato ISO)
  - `endDate` (opcional): Data final para filtragem (formato ISO)
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
  - `500`: Erro de servidor ao buscar dados do gráfico
- **Notas**:
  - Suporta filtragem por intervalo de tempo com parâmetros startDate e endDate
  - Valida formato de data antes do processamento
  - Retorna dados do gráfico para combinação específica de servidor e backup
  - O nome do backup deve ser codificado em URL
