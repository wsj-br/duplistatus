# Prüfprotokoll-Aufbewahrung {/* #audit-log-retention */}

Konfigurieren Sie, wie lange Prüfprotokolle vor der automatischen Bereinigung aufbewahrt werden.

![Prüfprotokoll-Aufbewahrung](../../assets/screen-settings-audit-retention.png)

| Einstellung | Beschreibung | Standardwert |
|:-------|:-----------|:-------------|
| **Aufbewahrung (Tage)** | Anzahl der Tage, für die Prüfprotokolle vor der automatischen Löschung aufbewahrt werden | **90 Tage** |

## Aufbewahrungseinstellungen {/* #retention-settings */}

- **Bereich**: 30 bis 365 Tage
- **Automatische Bereinigung**: Wird täglich um 02:00 UTC ausgeführt (nicht konfigurierbar)
- **Manuelle Bereinigung**: Über die API für Administratoren verfügbar (siehe [Prüfprotokolle bereinigen](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
