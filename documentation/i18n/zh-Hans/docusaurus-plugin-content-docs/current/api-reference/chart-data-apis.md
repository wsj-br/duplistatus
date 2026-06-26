# 图表数据 {#chart-data}

## 获取聚合图表数据 - `/api/chart-data/aggregated` {#get-aggregated-chart-data---apichart-dataaggregated}
- **端点**: `/api/chart-data/aggregated`
- **方法**: GET
- **描述**: 检索聚合图表数据，支持可选的时间范围过滤。
- **查询参数**:
  - `startDate` （可选）: 过滤的开始日期（ISO 格式）
  - `endDate` （可选）: 过滤的结束日期（ISO 格式）
- **响应**:

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

- **错误响应**:
  - `400`: 无效日期参数
  - `500`: 服务器错误，无法获取图表数据
- **备注**:
  - 支持使用 startDate 和 endDate 参数进行时间范围过滤
  - 在处理前验证日期格式
  - 返回所有服务器的聚合数据

## 获取服务器图表数据 - `/api/chart-data/server/:serverId` {#get-server-chart-data---apichart-dataserverserverid}
- **端点**: `/api/chart-data/server/:serverId`
- **方法**: GET
- **描述**: 检索特定服务器的图表数据，支持可选的时间范围过滤。
- **参数**:
  - `serverId`: 服务器标识符
- **查询参数**:
  - `startDate` （可选）: 过滤的开始日期（ISO 格式）
  - `endDate` （可选）: 过滤的结束日期（ISO 格式）
- **响应**:

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

- **错误响应**:
  - `400`: 无效日期参数
  - `500`: 服务器错误，无法获取图表数据
- **备注**:
  - 支持使用 startDate 和 endDate 参数进行时间范围过滤
  - 在处理前验证日期格式
  - 返回特定服务器的图表数据

## 获取服务器备份图表数据 - `/api/chart-data/server/:serverId/backup/:backupName` {#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname}
- **端点**: `/api/chart-data/server/:serverId/backup/:backupName`
- **方法**: GET
- **描述**: 检索特定服务器和备份的图表数据，支持可选的时间范围过滤。
- **参数**:
  - `serverId`: 服务器标识符
  - `backupName`: 备份名称（URL 编码）
- **查询参数**:
  - `startDate` （可选）: 过滤的开始日期（ISO 格式）
  - `endDate` （可选）: 过滤的结束日期（ISO 格式）
- **响应**:

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

- **错误响应**:
  - `400`: 无效日期参数
  - `500`: 服务器错误，无法获取图表数据
- **备注**:
  - 支持使用 startDate 和 endDate 参数进行时间范围过滤
  - 在处理前验证日期格式
  - 返回特定服务器和备份组合的图表数据
  - 备份名称必须是 URL 编码
