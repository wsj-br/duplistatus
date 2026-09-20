# Datos del gráfico {/* #chart-data */}

## Obtener datos agregados del gráfico - `/api/chart-data/aggregated` {/* #get-aggregated-chart-data---apichart-dataaggregated */}
- **Endpoint**: `/api/chart-data/aggregated`
- **Método**: GET
- **Descripción**: Recupera datos agregados del gráfico con filtrado opcional por rango de tiempo.
- **Parámetros de consulta**:
  - `startDate` (opcional): Fecha de inicio para el filtrado (formato ISO)
  - `endDate` (opcional): Fecha de finalización para el filtrado (formato ISO)
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
  - `500`: Error del servidor al obtener datos del gráfico
- **Notas**:
  - Admite filtrado de rango de tiempo con parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve datos agregados en todos los servidores

## Obtener datos del gráfico del servidor - `/api/chart-data/server/:serverId` {/* #get-server-chart-data---apichart-dataserverserverid */}
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Método**: GET
- **Descripción**: Recupera datos del gráfico para un servidor específico con filtrado opcional por rango de tiempo.
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
  - `500`: Error del servidor al obtener datos del gráfico
- **Notas**:
  - Admite filtrado de rango de tiempo con parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve datos del gráfico para un servidor específico

## Obtener datos del gráfico de copia de seguridad del servidor - `/api/chart-data/server/:serverId/backup/:backupName` {/* #get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname */}
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Método**: GET
- **Descripción**: Recupera datos del gráfico para un servidor y copia de seguridad específicos con filtrado opcional por rango de tiempo.
- **Parámetros**:
  - `serverId`: el identificador del servidor
  - `backupName`: el nombre de la copia de seguridad (codificado en URL)
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
  - `500`: Error del servidor al obtener datos del gráfico
- **Notas**:
  - Admite filtrado de rango de tiempo con parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve datos del gráfico para una combinación específica de servidor y copia de seguridad
  - El nombre de la copia de seguridad debe estar codificado en URL
