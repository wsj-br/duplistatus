---
sidebar_position: 4
---

# Chart Data

<br/>

## Get Aggregated Chart Data - `/api/chart-data/aggregated`
- **Endpoint**: `/api/chart-data/aggregated`
- **Method**: GET
- **Description**: Retrieves aggregated chart data with optional time range filtering.
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (ISO format)
  - `endDate` (optional): End date for filtering (ISO format)
- **Response**:
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
- **Error Responses**:
  - `400`: Invalid date parameters
  - `500`: Server error fetching chart data
- **Notes**:
  - Supports time range filtering with startDate and endDate parameters
  - Validates date format before processing
  - Returns aggregated data across all servers

<br/>

## Get Server Chart Data - `/api/chart-data/server/:serverId`
- **Endpoint**: `/api/chart-data/server/:serverId`
- **Method**: GET
- **Description**: Retrieves chart data for a specific server with optional time range filtering.
- **Parameters**:
  - `serverId`: the server identifier
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (ISO format)
  - `endDate` (optional): End date for filtering (ISO format)
- **Response**:
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
- **Error Responses**:
  - `400`: Invalid date parameters
  - `500`: Server error fetching chart data
- **Notes**:
  - Supports time range filtering with startDate and endDate parameters
  - Validates date format before processing
  - Returns chart data for specific server

<br/>

## Get Server Backup Chart Data - `/api/chart-data/server/:serverId/backup/:backupName`
- **Endpoint**: `/api/chart-data/server/:serverId/backup/:backupName`
- **Method**: GET
- **Description**: Retrieves chart data for a specific server and backup with optional time range filtering.
- **Parameters**:
  - `serverId`: the server identifier
  - `backupName`: the backup name (URL encoded)
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (ISO format)
  - `endDate` (optional): End date for filtering (ISO format)
- **Response**:
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
- **Error Responses**:
  - `400`: Invalid date parameters
  - `500`: Server error fetching chart data
- **Notes**:
  - Supports time range filtering with startDate and endDate parameters
  - Validates date format before processing
  - Returns chart data for specific server and backup combination
  - Backup name must be URL encoded
