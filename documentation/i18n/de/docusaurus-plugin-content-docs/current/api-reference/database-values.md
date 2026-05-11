---
translation_last_updated: '2026-05-11T14:27:38.963Z'
source_file_mtime: '2026-05-06T23:18:51.410Z'
source_file_hash: ccf0b5d9282c57ab9d01796a3974e790ac31e069ecc8a6880cf29c92b410210a
translation_language: de
source_file_path: documentation/docs/api-reference/database-values.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Beispiel-Backup-Bericht (Datenbankwerte) {#database-values}

Dieses Dokument enthält ein Beispiel für die JSON-Nutzlast, die von Duplicati gesendet wird, wenn die `--send-http-url`-Option verwendet wird. Es veranschaulicht die Struktur und die Felder, die von duplistatus empfangen und gespeichert werden. Einige Felder können in diesem Beispiel gelöscht oder geschwärzt sein.

```json
{
  "Data": {
    "DeletedFiles": 0,
    "DeletedFolders": 0,
    "ModifiedFiles": 0,
    "ExaminedFiles": 15399,
    "OpenedFiles": 1861,
    "AddedFiles": 1861,
    "SizeOfModifiedFiles": 0,
    "SizeOfAddedFiles": 13450481,
    "SizeOfExaminedFiles": 11086692615,
    "SizeOfOpenedFiles": 13450481,
    "NotProcessedFiles": 0,
    "AddedFolders": 419,
    "TooLargeFiles": 0,
    "FilesWithError": 0,
    "ModifiedFolders": 0,
    "ModifiedSymlinks": 0,
    "AddedSymlinks": 0,
    "DeletedSymlinks": 0,
    "PartialBackup": false,
    "Dryrun": false,
    "MainOperation": "Backup",
    "ParsedResult": "Success",
    "Interrupted": false,
    "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)",
    "EndTime": "2025-04-21T23:46:38.3568274Z",
    "BeginTime": "2025-04-21T23:45:46.9712217Z",
    "Duration": "00:00:51.3856057",
    "WarningsActualLength": 0,
    "ErrorsActualLength": 0,
    "BackendStatistics": {
      "BytesUploaded": 8290314,
      "BytesDownloaded": 53550393,
      "KnownFileSize": 9920312634,
      "LastBackupDate": "2025-04-22T00:45:46+01:00",
      "BackupListCount": 6,
      "ReportedQuotaError": false,
      "ReportedQuotaWarning": false,
      "MainOperation": "Backup",
      "ParsedResult": "Success",
      "Interrupted": false,
      "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)",
      "BeginTime": "2025-04-21T23:45:46.9712252Z",
      "Duration": "00:00:00",
      "WarningsActualLength": 0,
      "ErrorsActualLength": 0
    }
  },
  "Extra": {
    "OperationName": "Backup",
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65",
    "machine-name": "WSJ-SER5",
    "backup-name": "WSJ-SER5 Local files",
    "backup-id": "DB-2"
  }
}
```
