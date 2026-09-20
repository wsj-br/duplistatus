# Prüfprotokoll-Aufbewahrung {/* #audit-log-retention */}

Konfigurieren Sie, wie lange Audit-Protokolle vor der automatischen Bereinigung aufbewahrt werden.

![Prüfprotokoll-Aufbewahrung](../../assets/screen-settings-audit-retention.png)

| Einstellung | Beschreibung | Standardwert |
|:-------|:-----------|:-------------|
| **Aufbewahrung (Tage)** | Anzahl der Tage, für die Audit-Protokolle vor der automatischen Löschung aufbewahrt werden | **90 Tage** |

## Aufbewahrungs-Einstellungen {/* #retention-settings */}

- **Bereich**: 30 bis 365 Tage
- **Automatische Bereinigung**: Wird täglich um 02:00 UTC ausgeführt (nicht konfigurierbar)
- **Manuelle Bereinigung**: Verfügbar über API für Administratoren (siehe [Audit-Protokolle bereinigen](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
