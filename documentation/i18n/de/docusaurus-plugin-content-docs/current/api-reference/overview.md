---
translation_last_updated: '2026-04-18T00:01:58.013Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: fe4cf26fcdad9ea7ff5f3f4cb9f9533b46f148bea17589644eeef65398578b86
translation_language: de
source_file_path: documentation/docs/api-reference/overview.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# API-Übersicht {#api-overview}

Dieses Dokument beschreibt alle verfügbaren API-Endpunkte für die duplistatus-Anwendung. Die API folgt REST-Prinzipien und bietet umfassende Funktionen zur Backup-Überwachung, Benachrichtigungsverwaltung und Systemadministration.

:::note
**Englisch (EN):** Die API-Dokumentation ist nur auf Englisch verfügbar.               <br/>
**Deutsch (DE):** Die API-Dokumentation ist nur auf Englisch verfügbar.              <br/>
**Französisch (FR):** La documentation de l'API est disponible uniquement en anglais.    <br/>
**Spanisch (ES):** La documentación de la API solo está disponible en inglés.        <br/>
**Portugiesisch (PT-BR):** A documentação da API está disponível apenas em inglês.    
:::

## API-Struktur {#api-structure}

Für eine schnelle Übersicht über alle Endpunkte siehe die [API-Endpunktliste](api-endpoint-list).

Die API ist in logische Gruppen unterteilt:
- **[Externe APIs](external-apis)**: Zusammenfassungsdaten, aktueller Backup-Status und Backup-Daten-Uploads von Duplicati
- **[Kernoperationen](core-operations)**: Dashboard-Daten, Serververwaltung und detaillierte Backup-Informationen
- **[Diagrammdaten](chart-data-apis)**: Aggregierte und server-spezifische Zeitreihendaten zur Visualisierung und Analyse
- **[Konfigurationsverwaltung](configuration-apis)**: E-Mail-, Benachrichtigungs-, Backup-Einstellungen und Systemkonfiguration
- **[Benachrichtigungssystem](notification-apis)**: Test von Benachrichtigungen, Überprüfung verspäteter Backups und Verwaltung von Benachrichtigungen
- **[Cron-Dienste](cron-service-apis)**: Verwaltung von Cron-Diensten
- **[Überwachung & Zustand](monitoring-apis)**: Zustandsprüfungen und Statusüberwachung
- **[Administration](administration-apis)**: Datenbankwartung, Bereinigungsoperationen und Systemverwaltung
- **[Sitzungsverwaltung](session-management-apis)**: Sitzungsverwaltung und Erstellung von Sitzungen
- **[Authentifizierung & Sicherheit](authentication-security)**: Authentifizierung und Sicherheit

Für eine schnelle Übersicht über alle Endpunkte siehe die [API-Endpunktliste](api-endpoint-list).

## Antwortformat {#response-format}

Alle API-Antworten werden im JSON-Format mit konsistenten Fehlernbehandlungsmustern zurückgegeben. Erfolgreiche Antworten enthalten typischerweise ein `status`-Feld, während Fehlerantworten die Felder `error` und `message` enthalten.

---

## Fehlerbehandlung {#error-handling}

Alle Endpunkte folgen einem konsistenten Muster zur Fehlerbehandlung:

- **400 Ungültige Anfrage**: Ungültige Anfragedaten oder fehlende erforderliche Felder
- **401 Nicht autorisiert**: Ungültige oder fehlende Sitzung, abgelaufene Sitzung oder fehlgeschlagene CSRF-Token-Validierung
- **403 Verboten**: Vorgang nicht erlaubt (z. B. Löschung von Backups in der Produktion) oder fehlgeschlagene CSRF-Token-Validierung
- **404 Nicht gefunden**: Ressource nicht gefunden
- **409 Konflikt**: Doppeldaten (bei Upload-Endpunkten)
- **500 Interner Serverfehler**: Serverseitige Fehler mit detaillierten Fehlermeldungen
- **503 Dienst nicht verfügbar**: Fehler bei Zustandsprüfungen, Datenbankverbindungsprobleme oder Cron-Dienst nicht verfügbar

Fehlerantworten enthalten:
- `error`: Für Menschen lesbare Fehlermeldung
- `message`: Technische Fehlerdetails (im Entwicklungsmodus)
- `stack`: Fehlerstack-Trace (im Entwicklungsmodus)
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
