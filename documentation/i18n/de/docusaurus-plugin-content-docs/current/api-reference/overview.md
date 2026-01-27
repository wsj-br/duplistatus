# API-Übersicht {#api-overview}

Dieses Dokument beschreibt alle verfügbaren API-Endpunkte für die duplistatus-Anwendung. Die API folgt RESTful-Prinzipien und bietet umfassende Sicherungsüberwachung, Benachrichtigungsverwaltung und Systemverwaltungsfunktionen.

## API-Struktur {#api-structure}

Eine Schnellreferenz aller Endpunkte finden Sie in der [API-Endpunktliste](api-endpoint-list).

Die API ist in logische Gruppen unterteilt:

- **[Externe APIs](external-apis)**: Zusammenfassungsdaten, neuester Sicherungsstatus und Sicherungsdaten-Uploads von Duplicati
- **[Kernoperationen](core-operations)**: Dashboard-Daten, Serververwaltung und detaillierte Sicherungsinformationen
- **[Diagrammdaten](chart-data-apis)**: Aggregierte und serverspezifische Zeitreihendaten für Visualisierung und Analytik
- **[Konfigurationsverwaltung](configuration-apis)**: E-Mail-, Benachrichtigungs-, Sicherungseinstellungen und Systemkonfiguration
- **[Benachrichtigungssystem](notification-apis)**: Benachrichtigungstests, Überprüfung überfälliger Sicherungen und Benachrichtigungsverwaltung
- **[Cron-Dienste](cron-service-apis)**: Cron-Dienstverwaltung
- **[Überwachung & Integrität](monitoring-apis)**: Integritätsprüfungen und Statusüberwachung
- **[Verwaltung](administration-apis)**: Datenbankwartung, Bereinigungsvorgänge und Systemverwaltung
- **[Sitzungsverwaltung](session-management-apis)**: Sitzungsverwaltung und Sitzungserstellung
- **[Authentifizierung & Sicherheit](authentication-security)**: Authentifizierung und Sicherheit

Eine Schnellreferenz aller Endpunkte finden Sie in der [API-Endpunktliste](api-endpoint-list).

## Antwortformat {#response-format}

Alle API-Antworten werden im JSON-Format mit konsistenten Fehlerbehandlungsmustern zurückgegeben. Erfolgreiche Antworten enthalten typischerweise ein `status`-Feld, während Fehlerantworten `error`- und `message`-Felder enthalten.

---

## Fehlerbehandlung {#error-handling}

Alle Endpunkte folgen einem konsistenten Fehlerbehandlungsmuster:

- **400 Ungültige Anfrage**: Ungültige Anfragedaten oder fehlende erforderliche Felder
- **401 Nicht autorisiert**: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder CSRF-Token-Validierung fehlgeschlagen
- **403 Verboten**: Vorgang nicht erlaubt (z. B. Sicherungslöschung in der Produktion) oder CSRF-Token-Validierung fehlgeschlagen
- **404 Nicht gefunden**: Ressource nicht gefunden
- **409 Konflikt**: Duplizierte Daten (für Upload-Endpunkte)
- **500 Interner Serverfehler**: Serverfehler mit detaillierten Fehlermeldungen
- **503 Dienst nicht verfügbar**: Integritätsprüfungsfehler, Datenbankverbindungsprobleme oder Cron-Dienst nicht verfügbar

Fehlerantworten enthalten:

- `error`: Benutzerfreundliche Fehlermeldung
- `message`: Technische Fehlerdetails (im Entwicklungsmodus)
- `stack`: Fehler-Stack-Trace (im Entwicklungsmodus)
- `timestamp`: Zeitpunkt des Fehlers

## Hinweise zu Datentypen {#data-type-notes}

### Nachrichtenarrays {#message-arrays}

Die Felder `messages_array`, `warnings_array` und `errors_array` werden als JSON-Strings in der Datenbank gespeichert und als Arrays in den API-Antworten zurückgegeben. Diese enthalten die tatsächlichen Protokollmeldungen, Warnungen und Fehler aus Duplicati-Sicherungsvorgängen.

### Verfügbare Sicherungen {#available-backups}

Das Feld `available_backups` enthält ein Array von Sicherungsversionszeitstempeln (im ISO-Format), die für die Wiederherstellung verfügbar sind. Dies wird aus den Sicherungsprotokollmeldungen extrahiert.

### Dauerfelder {#duration-fields}

- `duration`: Benutzerfreundliches Format (z. B. "00:38:31")
- `duration_seconds`: Rohe Dauer in Sekunden
- `durationInMinutes`: Dauer in Minuten für Diagrammzwecke konvertiert

### Dateigröße-Felder {#file-size-fields}

Alle Dateigröße-Felder werden in Bytes als Zahlen zurückgegeben, nicht als formatierte Strings. Das Frontend ist verantwortlich für die Konvertierung dieser in benutzerfreundliche Formate (KB, MB, GB usw.).

<br/>

:::caution
Setzen Sie den **duplistatus**-Server nicht dem öffentlichen Internet aus. Use it in a secure network
(e.g., local LAN protected by a firewall).

Exposing the **duplistatus** interface to the public
internet without proper security measures could lead to unauthorized access.
:::
