# Vorlagen {#templates}

**duplistatus** verwendet drei Vorlagen für Benachrichtigungsnachrichten. Diese Vorlagen werden sowohl für NTFY- als auch für E-Mail-Benachrichtigungen verwendet:

![Benachrichtigungsvorlagen](/img/screen-settings-templates.png)

| Vorlage                   | Beschreibung                                                                                      |
| :------------------------ | :------------------------------------------------------------------------------------------------ |
| **Erfolg**                | Wird verwendet, wenn Sicherungen erfolgreich abgeschlossen werden.                |
| **Warnung/Fehler**        | Wird verwendet, wenn Sicherungen mit Warnungen oder Fehlern abgeschlossen werden. |
| **Überfällige Sicherung** | Wird verwendet, wenn Sicherungen überfällig sind.                                 |

<br/>

## Verfügbare Aktionen {#available-actions}

| Schaltfläche                                                             | Beschreibung                                                                                                                                                                                                                            |
| :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton label="Vorlageneinstellungen speichern" />                   | Speichert die Einstellungen beim Ändern der Vorlage. Die Schaltfläche speichert die angezeigte Vorlage (Erfolg, Warnung/Fehler oder Überfällige Sicherung).                          |
| <IconButton icon="lucide:send" label="Testbenachrichtigung senden"/>     | Prüft die Vorlage nach dem Aktualisieren. Die Variablen werden für den Test durch ihre Namen ersetzt. Bei E-Mail-Benachrichtigungen wird der Vorlagentitel zur Betreffzeile der E-Mail. |
| <IconButton icon="lucide:rotate-ccw" label="Auf Standard zurücksetzen"/> | Stellt die Standardvorlage für die **ausgewählte Vorlage** wieder her. Denken Sie daran, sie nach dem Zurücksetzen zu speichern.                                                                        |

<br/>

## Variablen {#variables}

Alle Vorlagen unterstützen Variablen, die durch tatsächliche Werte ersetzt werden. Die folgende Tabelle zeigt die verfügbaren Variablen:

| Variable               | Beschreibung                                                                                                       | Verfügbar in    |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------- | :-------------- |
| `{server_name}`        | Name des Servers.                                                                                  | Alle Vorlagen   |
| `{server_alias}`       | Alias des Servers.                                                                                 | Alle Vorlagen   |
| `{server_note}`        | Notiz für den Server.                                                                              | Alle Vorlagen   |
| `{server_url}`         | Duplicati-Server-URL                                                                                               | Alle Vorlagen   |
| `{backup_name}`        | Name der Sicherung.                                                                                | Alle Vorlagen   |
| `{status}`             | Sicherungsstatus (Erfolg, Warnung, Fehler, Kritisch).                           | Erfolg, Warnung |
| `{backup_date}`        | Datum und Uhrzeit der Sicherung.                                                                   | Erfolg, Warnung |
| `{duration}`           | Dauer der Sicherung.                                                                               | Erfolg, Warnung |
| `{uploaded_size}`      | Menge der hochgeladenen Daten.                                                                     | Erfolg, Warnung |
| `{storage_size}`       | Speicherplatznutzungsinformationen.                                                                | Erfolg, Warnung |
| `{available_versions}` | Verfügbare Sicherungsversionen.                                                                    | Erfolg, Warnung |
| `{file_count}`         | Anzahl der verarbeiteten Dateien.                                                                  | Erfolg, Warnung |
| `{file_size}`          | Gesamtgröße der gesicherten Dateien.                                                               | Erfolg, Warnung |
| `{messages_count}`     | Anzahl der Nachrichten.                                                                            | Erfolg, Warnung |
| `{warnings_count}`     | Anzahl der Warnungen.                                                                              | Erfolg, Warnung |
| `{errors_count}`       | Anzahl der Fehler.                                                                                 | Erfolg, Warnung |
| `{log_text}`           | Protokollnachrichten (Warnungen und Fehler)                                                     | Erfolg, Warnung |
| `{last_backup_date}`   | Datum der letzten Sicherung.                                                                       | Überfällig      |
| `{last_elapsed}`       | Seit der letzten Sicherung verstrichene Zeit.                                                      | Überfällig      |
| `{expected_date}`      | Erwartetes Sicherungsdatum.                                                                        | Überfällig      |
| `{expected_elapsed}`   | Seit dem erwarteten Datum verstrichene Zeit.                                                       | Überfällig      |
| `{backup_interval}`    | Intervallzeichenfolge (z. B. "1D", "2W", "1M"). | Überfällig      |
| `{overdue_tolerance}`  | Einstellung der Überfälligkeitstoleranz.                                                           | Überfällig      |




