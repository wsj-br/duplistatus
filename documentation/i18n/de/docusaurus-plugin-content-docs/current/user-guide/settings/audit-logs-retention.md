# Audit-Log-Aufbewahrung {#audit-log-retention}

Konfigurieren Sie, wie lange Audit-Logs vor der automatischen Bereinigung aufbewahrt werden.

![Audit-Log-Aufbewahrung](/assets/screen-settings-audit-retention.png)

| Einstellung                                | Beschreibung                                                                         | Standardwert |
| :----------------------------------------- | :----------------------------------------------------------------------------------- | :----------- |
| **Aufbewahrung (Tage)** | Anzahl der Tage, für die Audit-Logs vor der automatischen Löschung aufbewahrt werden | `90 Tage`    |

## Aufbewahrungseinstellungen {#retention-settings}

- **Bereich**: 30 bis 365 Tage
- **Automatische Bereinigung**: Läuft täglich um 02:00 UTC (nicht konfigurierbar)
- **Manuelle Bereinigung**: Verfügbar über API für Administratoren (siehe [Audit-Logs bereinigen](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
