# API-Übersicht {/* #api-overview */}

Dieses Dokument beschreibt alle verfügbaren API-Endpunkte für die duplistatus-Anwendung. Die API folgt RESTful-Prinzipien und bietet umfassende Backup-Überwachung, Benachrichtigungsverwaltung und Systemadministrationsfunktionen.

## API-Struktur {/* #api-structure */}

Eine Kurzreferenz aller Endpunkte finden Sie in der [API-Endpunktliste](api-endpoint-list).

Die API ist in logische Gruppen organisiert:
- [**Externe APIs**](external-apis): Zusammenfassungsdaten, neuester Sicherungsstatus und Sicherungsdaten-Uploads von Duplicati
- [**Kernoperationen**](core-operations): Dashboard-Daten, Serververwaltung und detaillierte Sicherungsinformationen
- [**Diagrammdaten**](chart-data-apis): Aggregierte und serverspezifische Zeitreihendaten für Visualisierung und Analytik
- [**Konfigurationsverwaltung**](configuration-apis): E-Mail-, Benachrichtigungs-, Sicherungs- und Systemkonfiguration
- [**Benachrichtigungssystem**](notification-apis): Benachrichtigungstests, Prüfung überfälliger Sicherungen und Benachrichtigungsverwaltung
- [**Cron-Dienste**](cron-service-apis): Cron-Dienstverwaltung
- [**Überwachung & Gesundheit**](monitoring-apis): Integritätsprüfungen und Statusüberwachung
- [**Verwaltung**](administration-apis): Datenbankverwaltung, Bereinigungsvorgänge und Systemverwaltung
- [**Sitzungsverwaltung**](session-management-apis): Sitzungsverwaltung und Sitzungserstellung
- [**Authentifizierung & Sicherheit**](authentication-security): Authentifizierung und Sicherheit

Eine Kurzreferenz aller Endpunkte finden Sie in der [API-Endpunktliste](api-endpoint-list).

## Antwortformat {/* #response-format */}

Alle API-Antworten werden im JSON-Format mit konsistenten Fehlerbehandlungsmustern zurückgegeben. Erfolgreiche Antworten enthalten normalerweise ein `status`-Feld, während Fehlerantworten `error`- und `message`-Felder enthalten.

---

## Fehlerbehandlung {/* #error-handling */}

Alle Endpunkte folgen einem konsistenten Fehlerbehandlungsmuster:

- **400 Ungültige Anfrage**: Ungültige Anfragedaten oder fehlende erforderliche Felder
- **401 Nicht autorisiert**: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder CSRF-Token-Validierung fehlgeschlagen
- **403 Verboten**: Operation nicht zulässig (z. B. Sicherungslöschung in der Produktion) oder CSRF-Token-Validierung fehlgeschlagen
- **404 Nicht gefunden**: Ressource nicht gefunden
- **409 Konflikt**: Duplizierte Daten (für Upload-Endpunkte)
- **413 Nutzlast zu groß**: `/api/upload`-Text überschreitet das konfigurierte Größenlimit
- **429 Zu viele Anfragen**: Upload-, Lese-API- oder Authentifizierungsfehlerate-Limit überschritten
- **500 Interner Serverfehler**: Serverfehler mit detaillierten Fehlermeldungen
- **503 Dienst nicht verfügbar**: Integritätsprüfungsfehler, Datenbankverbindungsprobleme oder Cron-Dienst nicht verfügbar

Fehlerantworten enthalten:
- `error`: Benutzerfreundliche Fehlermeldung
- `message`: Technische Fehlerdetails (im Entwicklungsmodus)
- `stack`: Fehler-Stack-Trace (im Entwicklungsmodus)
- `timestamp`: Zeitpunkt des Fehlers

## Datentypnotizen {/* #data-type-notes */}

### Nachrichtenarrays {/* #message-arrays */}
Die `messages_array`-, `warnings_array`- und `errors_array`-Felder werden als JSON-Strings in der Datenbank gespeichert und als Arrays in den API-Antworten zurückgegeben. Diese enthalten die tatsächlichen Protokollmeldungen, Warnungen und Fehler von Duplicati-Sicherungsvorgängen.

### Verfügbare Sicherungen {/* #available-backups */}
Das `available_backups`-Feld enthält ein Array von Sicherungsversionszeitstempeln (im ISO-Format), die für die Wiederherstellung verfügbar sind. Dies wird aus den Sicherungsprotokollmeldungen extrahiert.

### Dauer-Felder {/* #duration-fields */}
- `duration`: Lesbares Format (z. B. "00:38:31")
- `duration_seconds`: Rohe Dauer in Sekunden
- `durationInMinutes`: Dauer in Minuten für Diagrammzwecke konvertiert

### Dateigröße-Felder {/* #file-size-fields */}
Alle Dateigröße-Felder werden als Zahlen in Bytes zurückgegeben, nicht als formatierte Zeichenketten. Das Frontend ist verantwortlich für die Konvertierung in lesbare Formate (KB, MB, GB usw.).

<br/>

:::caution
 Den **duplistatus**-Server nicht für das öffentliche Internet freigeben. Verwenden Sie ihn in einem sicheren Netzwerk 
(z. B. lokales LAN, das durch eine Firewall geschützt ist).

Die Freigabe der **duplistatus**-Benutzeroberfläche für das öffentliche
 Internet ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
:::
