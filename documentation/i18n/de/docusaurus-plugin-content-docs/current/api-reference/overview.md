# API-Übersicht {#api-overview}

Dieses Dokument beschreibt alle verfügbaren API-Endpunkte für die duplistatus-Anwendung. Die API folgt REST-Prinzipien und bietet umfassende Funktionen zur Backup-Überwachung, Benachrichtigungsverwaltung und Systemadministration.

## API-Struktur {#api-structure}

Für eine schnelle Übersicht über alle Endpunkte siehe die [API-Endpunktliste](api-endpoint-list).

Die API ist in logische Gruppen unterteilt:
- [**Externe APIs**](external-apis): Zusammenfassungsdaten, aktueller Sicherungsstatus und Uploads von Sicherungsdaten von Duplicati
- [**Kernoperationen**](core-operations): Dashboard-Daten, Serververwaltung und detaillierte Sicherungsinformationen
- [**Diagrammdaten**](chart-data-apis): Aggregierte und server-spezifische Zeitreihendaten zur Visualisierung und Analyse
- [**Konfigurationsverwaltung**](configuration-apis): E-Mail-, Benachrichtigungs-, Sicherungseinstellungen und Systemkonfiguration
- [**Benachrichtigungssystem**](notification-apis): Test von Benachrichtigungen, Überprüfung verspäteter Sicherungen und Verwaltung von Benachrichtigungen
- [**Cron-Dienste**](cron-service-apis): Verwaltung von Cron-Diensten
- [**Überwachung & Zustand**](monitoring-apis): Zustandsprüfungen und Statusüberwachung
- [**Administration**](administration-apis): Datenbankwartung, Bereinigungsvorgänge und Systemverwaltung
- [**Sitzungsverwaltung**](session-management-apis): Sitzungsverwaltung und Erstellung von Sitzungen
- [**Authentifizierung & Sicherheit**](authentication-security): Authentifizierung und Sicherheit

Für eine schnelle Übersicht über alle Endpunkte siehe die [API-Endpunktliste](api-endpoint-list).

## Antwortformat {#response-format}

Alle API-Antworten werden im JSON-Format mit konsistenten Fehlernbehandlungsmustern zurückgegeben. Erfolgreiche Antworten enthalten typischerweise ein `status`-Feld, während Fehlerantworten die Felder `error` und `message` enthalten.

---

## Fehlerbehandlung {#error-handling}

Alle Endpunkte folgen einem konsistenten Muster zur Fehlerbehandlung:

- **400 Bad Request**: Ungültige Anfragedaten oder fehlende erforderliche Felder
- **401 Unauthorized**: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder fehlgeschlagene CSRF-Token-Validierung
- **403 Forbidden**: Vorgang nicht erlaubt (z. B. Löschung einer Sicherung in der Produktionsumgebung) oder fehlgeschlagene CSRF-Token-Validierung
- **404 Not Found**: Ressource nicht gefunden
- **409 Conflict**: Doppeldaten (bei Upload-Endpunkten)
- **500 Internal Server Error**: Serverseitige Fehler mit detaillierten Fehlermeldungen
- **503 Service Unavailable**: Fehler bei Zustandsprüfungen, Probleme mit der Datenbankverbindung oder nicht verfügbarer Cron-Dienst

Fehlerantworten enthalten:
- `error`: Menschlich lesbare Fehlermeldung
- `message`: Technische Fehlerdetails (im Entwicklungsmodus)
- `stack`: Fehler-Stack-Trace (im Entwicklungsmodus)
- `timestamp`: Wann der Fehler aufgetreten ist

## Hinweise zu Datentypen {#data-type-notes}

### Nachrichten-Arrays {#message-arrays}
Die Felder `messages_array`, `warnings_array` und `errors_array` werden als JSON-Zeichenketten in der Datenbank gespeichert und als Arrays in den API-Antworten zurückgegeben. Diese enthalten die tatsächlichen Protokollmeldungen, Warnungen und Fehler aus Duplicati-Backup-Operationen.

### Verfügbare Backups {#available-backups}
Das Feld `available_backups` enthält ein Array von Zeitstempeln der Backup-Versionen (im ISO-Format), die für die Wiederherstellung verfügbar sind. Dies wird aus den Backup-Protokollmeldungen extrahiert.

### Dauer-Felder {#duration-fields}
- `duration`: Menschlich lesbare Formatierung (z. B. "00:38:31")
- `duration_seconds`: Rohdauer in Sekunden
- `durationInMinutes`: Dauer in Minuten umgerechnet für Diagrammdarstellungen

### Dateigrößen-Felder {#file-size-fields}
Alle Dateigrößen-Felder werden als Zahlen in Byte zurückgegeben, nicht als formatierte Zeichenketten. Die Frontend-Anwendung ist dafür verantwortlich, diese in menschlich lesbare Formate (KB, MB, GB usw.) umzuwandeln.

<br/>

:::caution
 Stellen Sie den **duplistatus**-Server nicht dem öffentlichen Internet zur Verfügung. Nutzen Sie ihn in einem sicheren Netzwerk 
(z. B. lokales LAN, geschützt durch eine Firewall).

Die Bereitstellung der **duplistatus**-Schnittstelle im öffentlichen Internet 
 ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
:::
