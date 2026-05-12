# Datos del gráfico {#chart-data}

## Obtener datos agregados del gráfico - `/api/chart-data/aggregated` {#get-aggregated-chart-data---apichart-dataaggregated}
- **Endpoint**: `/api/chart-data/aggregated`
- **Method**: GET
- **Description**: Recupera datos agregados del gráfico con filtrado opcional por rango de tiempo.
- **Parámetros de consulta**:
  - `startDate` (opcional): Fecha de inicio para filtrado (formato ISO)
  - `endDate` (opcional): Fecha de finalización para filtrado (formato ISO)
- **Respuesta**:

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

- **Respuestas de error**:
  - `400`: Parámetros de fecha no válidos
  - `500`: Error del servidor al obtener los datos del gráfico
- **Notas**:
  - Admite filtrado por rango de tiempo con los parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve datos agregados de todos los servidores

## Obtener datos del gráfico del servidor - `/api/chart-data/server/:serverId` {#get-server-chart-data---apichart-dataserverserverid}
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Method**: GET
- **Description**: Recupera datos del gráfico para un servidor específico con filtrado opcional por rango de tiempo.
- **Parámetros**:
  - `serverId`: el identificador del servidor
- **Parámetros de consulta**:
  - `startDate` (opcional): Fecha de inicio para filtrado (formato ISO)
  - `endDate` (opcional): Fecha de finalización para filtrado (formato ISO)
- **Respuesta**:

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

- **Respuestas de error**:
  - `400`: Parámetros de fecha no válidos
  - `500`: Error del servidor al obtener los datos del gráfico
- **Notas**:
  - Admite filtrado por rango de tiempo con los parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve los datos del gráfico para un servidor específico

## Obtener datos del gráfico de copia de seguridad del servidor - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname}
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Method**: GET
- **Description**: Recupera datos del gráfico para un servidor y una copia de seguridad específicos con filtrado opcional por rango de tiempo.
- **Parámetros**:
  - `serverId`: el identificador del servidor
  - `backupName`: el nombre del respaldo (codificado en URL)
- **Parámetros de consulta**:
  - `startDate` (opcional): Fecha de inicio para filtrado (formato ISO)
  - `endDate` (opcional): Fecha de finalización para filtrado (formato ISO)
- **Respuesta**:

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

- **Respuestas de error**:
  - `400`: Parámetros de fecha no válidos
  - `500`: Error del servidor al obtener los datos del gráfico
- **Notas**:
  - Admite filtrado por rango de tiempo con los parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve los datos del gráfico para una combinación específica de servidor y respaldo
  - El nombre del respaldo debe estar codificado en URL
