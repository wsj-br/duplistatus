---
translation_last_updated: '2026-04-17T23:59:33.416Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: e8daf2dcb7456f01747c2576f18ec55fa9ca80d2816091104bc8cdef9ae84fb7
translation_language: es
source_file_path: documentation/docs/api-reference/chart-data-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Datos del gráfico {#chart-data}

## Obtener datos agregados del gráfico - `/api/chart-data/aggregated` {#get-aggregated-chart-data-apichart-dataaggregated}
- **Endpoint**: `/api/chart-data/aggregated`
- **Método**: GET
- **Descripción**: Recupera datos agregados del gráfico con filtrado opcional por rango de tiempo.
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
  - `500`: Error del servidor al recuperar los datos del gráfico
- **Notas**:
  - Admite filtrado por rango de tiempo con los parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve datos agregados de todos los servidores

## Obtener datos del gráfico del servidor - `/api/chart-data/server/:serverId` {#get-server-chart-data-apichart-dataserverserverid}
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Método**: GET
- **Descripción**: Recupera los datos del gráfico para un servidor específico con filtrado opcional por rango de tiempo.
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
  - `500`: Error del servidor al recuperar los datos del gráfico
- **Notas**:
  - Admite filtrado por rango de tiempo con los parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve los datos del gráfico para un servidor específico

## Obtener datos del gráfico de respaldo del servidor - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data-apichart-dataserverserveridbackupbackupname}
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Método**: GET
- **Descripción**: Recupera los datos del gráfico para un servidor y respaldo específicos con filtrado opcional por rango de tiempo.
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
  - `500`: Error del servidor al recuperar los datos del gráfico
- **Notas**:
  - Admite filtrado por rango de tiempo con los parámetros startDate y endDate
  - Valida el formato de fecha antes del procesamiento
  - Devuelve los datos del gráfico para una combinación específica de servidor y respaldo
  - El nombre del respaldo debe estar codificado en URL
