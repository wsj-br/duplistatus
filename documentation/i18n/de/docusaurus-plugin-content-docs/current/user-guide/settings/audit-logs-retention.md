---
translation_last_updated: '2026-05-06T23:22:06.580Z'
source_file_mtime: '2026-05-06T23:18:51.442Z'
source_file_hash: e3e4bfa89172763e996fda191dad072d6156ecad610292ea1c564e416018e41e
translation_language: de
source_file_path: documentation/docs/user-guide/settings/audit-logs-retention.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Audit-Log-Aufbewahrung {#audit-log-retention}

Konfigurieren Sie, wie lange Audit-Protokolle vor der automatischen Bereinigung beibehalten werden.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Einstellung | Beschreibung | Standardwert |
|:-------|:-----------|:-------------|
| **Aufbewahrung (Tage)** | Anzahl der Tage zur Aufbewahrung von Audit-Protokollen vor automatischer Löschung | **90 Tage** |

## Aufbewahrungseinstellungen {#retention-settings}

- **Zeitraum**: 30 bis 365 Tage
- **Automatische Bereinigung**: Läuft täglich um 02:00 UTC (nicht konfigurierbar)
- **Manuelle Bereinigung**: Verfügbar über die API für Administratoren (siehe [Audit-Logs bereinigen](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
