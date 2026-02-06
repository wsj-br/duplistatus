---
translation_last_updated: '2026-02-06T22:33:33.981Z'
source_file_mtime: '2026-02-02T01:09:34.944Z'
source_file_hash: cf92c351f5e4592a
translation_language: de
source_file_path: user-guide/settings/audit-logs-retention.md
---
# Audit-Log-Aufbewahrung {#audit-log-retention}

Konfigurieren Sie, wie lange Audit-Protokolle vor der automatischen Bereinigung beibehalten werden.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Einstellung | Beschreibung | Standardwert |
|:-------|:-----------|:-------------|
| **Aufbewahrung (Tage)** | Anzahl der Tage zur Aufbewahrung von Audit-Protokollen vor automatischem Löschen | `90 Tage` |

## Aufbewahrungseinstellungen {#retention-settings}

- **Bereich**: 30 bis 365 Tage
- **Automatische Bereinigung**: Läuft täglich um 02:00 UTC (nicht konfigurierbar)
- **Manuelle Bereinigung**: Verfügbar über API für Administratoren (siehe [Audit-Protokolle bereinigen](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
