# API-Übersicht {/* #api-overview */}

Dieses Dokument beschreibt alle verfügbaren API-Endpunkte für die duplistatus-Anwendung. Die API folgt den RESTful-Prinzipien und bietet umfassende Backup-Überwachung, Benachrichtigungsverwaltung und Systemadministrationsfunktionen.

## API-Struktur {/* #api-structure */}

Für eine schnelle Referenz aller Endpunkte siehe die [API-Endpunktliste](api-endpoint-list).

Die API ist in logische Gruppen organisiert:
- [**Externe APIs**](external-apis): Zusammenfassungsdaten, aktueller Backup-Status und Backup-Daten-Uploads von Duplicati
- [**Kernoperationen**](core-operations): Dashboard-Daten, Serververwaltung und detaillierte Backup-Informationen
- [**Chart-Daten**](chart-data-apis): Aggregierte und server-spezifische Zeitreihendaten für Visualisierung und Analyse
- [**Konfigurationsverwaltung**](configuration-apis): E-Mail, Benachrichtigungen, Backup-Einstellungen und Systemkonfiguration
- [**Benachrichtigungssystem**](notification-apis): Benachrichtigungstests, Überprüfung überfälliger Backups und Benachrichtigungsverwaltung
- [**Cron-Dienste**](cron-service-apis): Cron-Dienstverwaltung
- [**Überwachung & Gesundheit**](monitoring-apis): Gesundheitsprüfungen und Statusüberwachung
- [**Administration**](administration-apis): Datenbankwartung, Bereinigungsoperationen und Systemverwaltung
- [**Sitzungsverwaltung**](session-management-apis): Sitzungsverwaltung und Sitzungserstellung
- [**Authentifizierung & Sicherheit**](authentication-security): Authentifizierung und Sicherheit

Für eine schnelle Referenz aller Endpunkte siehe die [API-Endpunktliste](api-endpoint-list).

## Antwortformat {/* #response-format */}

Alle API-Antworten werden im JSON-Format zurückgegeben mit konsistenter Fehlerbehandlung. Erfolgsantworten enthalten typischerweise ein `status`-Feld, während Fehlerantworten `error` und `message`-Felder enthalten.

---

## Fehlerbehandlung {/* #error-handling */}

Alle Endpunkte folgen einem konsistenten Fehlerbehandlungsmuster:

- **400 Bad Request**: Ungültige Anfragedaten oder fehlende Pflichtfelder
- **401 Unauthorized**: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder CSRF-Token-Validierung fehlgeschlagen
- **403 Forbidden**: Operation nicht erlaubt (z. B. Backup-Löschung in Produktion) oder CSRF-Token-Validierung fehlgeschlagen
- **404 Not Found**: Ressource nicht gefunden
- **409 Conflict**: Doppelte Daten (für Upload-Endpunkte)
- **413 Payload Too Large**: `/api/upload`-Körper überschreitet das konfigurierte Größenlimit
- **429 Too Many Requests**: Upload-, Lese-API- oder Authentifizierungsfehler-Rate-Limit überschritten
- **500 Internal Server Error**: Serverseitige Fehler mit detaillierten Fehlermeldungen
- **503 Service Unavailable**: Gesundheitsprüfungsfehler, Datenbankverbindungsprobleme oder Cron-Dienst nicht verfügbar

Fehlerantworten enthalten:
- `error`: Menschlich lesbare Fehlermeldung
- `message`: Technische Fehlerdetails (im Entwicklungsmodus)
- `stack`: Fehler-Stack-Trace (im Entwicklungsmodus)
- `timestamp`: Wann der Fehler aufgetreten ist

## Datentyp-Hinweise {/* #data-type-notes */}

### Nachrichten-Arrays {/* #message-arrays */}
Die `messages_array`, `warnings_array` und `errors_array`-Felder werden in der Datenbank als JSON-Strings gespeichert und in den API-Antworten als Arrays zurückgegeben. Diese enthalten die tatsächlichen Protokollnachrichten, Warnungen und Fehler aus den Duplicati-Backup-Operationen.

### Verfügbare Backups {/* #available-backups */}
Das `available_backups`-Feld enthält ein Array von Backup-Versionszeitstempeln (im ISO-Format), die für die Wiederherstellung verfügbar sind. Dies wird aus den Backup-Protokollnachrichten extrahiert.

### Dauerfelder {/* #duration-fields */}
- `duration`: Menschlesbares Format (z. B. "00:38:31")
- `duration_seconds`: Rohdauer in Sekunden
- `durationInMinutes`: Dauer in Minuten für Diagrammzwecke umgewandelt

### Dateigrößenfelder {/* #file-size-fields */}
Alle Dateigrößenfelder werden in Bytes als Zahlen zurückgegeben, nicht als formatierte Zeichenfolgen. Die Benutzeroberfläche ist dafür verantwortlich, diese in menschlesbare Formate (KB, MB, GB, etc.) umzuwandeln.

<br/>

:::caution
 Stellen Sie den **duplistatus**-Server nicht ins öffentliche Internet. Verwenden Sie ihn in einem sicheren Netzwerk 
(z. B. einem lokalen LAN, das durch eine Firewall geschützt ist).

Die Offenlegung der **duplistatus**-Schnittstelle im öffentlichen Internet ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
:::
