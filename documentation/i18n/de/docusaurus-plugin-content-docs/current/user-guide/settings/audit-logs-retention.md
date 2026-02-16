---
translation_last_updated: '2026-02-16T02:21:37.317Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: f21e4b84808c8bcb
translation_language: de
source_file_path: user-guide/settings/audit-logs-retention.md
---
# Audit-Log-Aufbewahrung {#audit-log-retention}

Konfigurieren Sie, wie lange Audit-Protokolle vor der automatischen Bereinigung beibehalten werden.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Einstellung | Beschreibung | Standardwert |
|:-------|:-----------|:-------------|
| **Aufbewahrung (Tage)** | Anzahl der Tage zur Aufbewahrung von Audit-Protokollen vor automatischer Löschung | **90 Tage** |

## Aufbewahrungseinstellungen {#retention-settings}

- **Bereich**: 30 bis 365 Tage
- **Automatische Bereinigung**: Läuft täglich um 02:00 UTC (nicht konfigurierbar)
- **Manuelle Bereinigung**: Verfügbar über API für Administratoren (siehe [Audit-Protokolle bereinigen](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
