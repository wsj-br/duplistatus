# Vorlagen {/* #templates */}

**duplistatus** verwendet vier Vorlagen für Benachrichtigungsnachrichten. E-Mail-Inhalte sind im Markdown-Format (Überschriften, Listen, Links und Tabellen). NTFY für Erfolg, Warnung/Fehler und Überfällig verwendet denselben Markdown-Text, der mit `Markdown: yes` gesendet wird, sodass ntfy-Clients ihn darstellen können. Jede GFM-Tabelle lässt ihre Kopfzeile weg und sendet den Inhalt als Klartext, da ntfy keine Tabellen darstellt. Die tägliche Zusammenfassung ist nur per E-Mail verfügbar.

Die Seite enthält einen **Vorlagensprache**-Auswahlschalter, der die Sprache für Standardvorlagen festlegt. Wenn Sie die Sprache ändern, wird das Gebietsschema für neue Standards aktualisiert, aber der Text vorhandener Vorlagen wird **nicht** geändert. Um eine neue Sprache auf Ihre Vorlagen anzuwenden, bearbeiten Sie diese entweder manuell oder verwenden Sie **Diese Vorlage auf Standardwerte zurücksetzen** (für den aktuellen Tab) oder **Alle auf Standard zurücksetzen** (für alle Vorlagen).

![Benachrichtigungsvorlagen](../../assets/screen-settings-templates.png)

| Vorlage            | Beschreibung                                        |
| :----------------- | :-------------------------------------------------- |
| **Erfolgreich**    | Wird verwendet, wenn Sicherungen erfolgreich abgeschlossen werden.            |
| **Warnung/Fehler** | Wird verwendet, wenn Sicherungen mit Warnungen oder Fehlern abgeschlossen werden. |
| **Überfällige Sicherung** | Wird verwendet, wenn Sicherungen überfällig sind.                      |
| **Tägliche Zusammenfassung**  | Markdown-E-Mail-Vorlage für die optionale tägliche Momentaufnahme. |

<br/>

## Vorlagensprache {/* #template-language */}

Ein **Vorlagensprache**-Auswahlschalter am oberen Rand der Seite ermöglicht es Ihnen, die Sprache für Standardvorlagen auszuwählen (Englisch, Deutsch, Französisch, Spanisch, Portugiesisch, Hindi und Vereinfachtes Chinesisch). Wenn Sie die Sprache ändern, wird das Gebietsschema für die Standards aktualisiert, aber bestehende angepasste Vorlagen behalten ihren aktuellen Text bei, bis Sie sie aktualisieren oder einen der Zurücksetzen-Schaltflächen verwenden.

<br/>

## Verfügbare Aktionen {/* #available-actions */}

| Schaltfläche                                                        | Beschreibung                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Vorlageneinstellungen speichern" />                      | Speichert die Einstellungen beim Ändern der Vorlage. Die Schaltfläche speichert die aktuell angezeigte Vorlage (Erfolgreich, Warnung/Fehler, Überfällige Sicherung oder Tägliche Zusammenfassung). |
| <IconButton icon="lucide:send" label="Testbenachrichtigung senden"/>     | Prüft die Vorlage nach der Aktualisierung. Die Variablen werden durch ihre Namen für den Test ersetzt. Bei E-Mail-Benachrichtigungen wird der Vorlagentitel zur Betreffzeile der E-Mail. Nicht verfügbar im Tab Tägliche Zusammenfassung. |
| <IconButton icon="lucide:rotate-ccw" label="Diese Vorlage auf Standardwerte zurücksetzen"/> | Stellt die Standardvorlage für die **ausgewählte Vorlage** wieder her (den aktuellen Tab). Denken Sie daran zu speichern, nachdem Sie zurückgesetzt haben. |
| <IconButton icon="lucide:rotate-ccw" label="Alle auf Standard zurücksetzen"/> | Stellt alle Vorlagen (Erfolgreich, Warnung/Fehler, Überfällige Sicherung und Tägliche Zusammenfassung) auf die Standards für die ausgewählte Vorlagensprache zurück. Denken Sie daran zu speichern, nachdem Sie zurückgesetzt haben. |

<br/>

## Variablen {/* #variables */}

E-Mail-Inhalte sind im Markdown-Format. Überschriften, Listen, Links und Tabellen werden unterstützt. Platzhalterwerte werden als maskierter Text eingefügt und können kein Markdown oder HTML einführen. Zuvor eingebettetes Roh-HTML in angepassten Vorlagen wird jetzt maskiert. NTFY erhält dasselbe Markdown, außer GFM-Tabellen: Die Kopfzeile wird weggelassen und die Inhaltszeilen werden als Klartext gesendet, für jedes Spaltenlayout.

Die Standardvorlagen für Erfolg, Warnung/Fehler und Überfällig verwenden denselben Markdown-Stil wie die tägliche Zusammenfassung: Eine Überschrift, fettgedruckte Werte und eine Übersichtstabelle. Unveränderte gespeicherte Standards werden beim Laden aktualisiert; angepasste Vorlagen bleiben erhalten.

Alle Erfolg-, Warnung/Fehler- und Überfällig-Vorlagen unterstützen Variablen, die durch tatsächliche Werte ersetzt werden. Die folgende Tabelle zeigt die verfügbaren Variablen:

| Variable               | Beschreibung                                    | Verfügbar in     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Name des Servers.                               | Erfolgreich, Warnung, Überfällig |
| `{server_alias}`       | Alias des Servers.                              | Erfolgreich, Warnung, Überfällig |
| `{server_note}`        | Notiz für den Server.                            | Erfolgreich, Warnung, Überfällig |
| `{server_url}`         | URL der Duplicati-Server-Webkonfiguration   | Erfolgreich, Warnung, Überfällig |
| `{backup_name}`        | Name des Backups.                             | Erfolgreich, Warnung, Überfällig |
| `{status}`             | Backup-Status (Erfolgreich, Warnung, Fehler, Fatal). | Erfolgreich, Warnung |
| `{backup_date}`        | Datum und Zeit des Backups.                    | Erfolgreich, Warnung |
| `{duration}`           | Dauer des Backups.                         | Erfolgreich, Warnung |
| `{uploaded_size}`      | Menge an hochgeladenen Daten.                        | Erfolgreich, Warnung |
| `{storage_size}`       | Speichernutzungsinformationen.                      | Erfolgreich, Warnung |
| `{available_versions}` | Anzahl verfügbarer Sicherungsversionen.            | Erfolgreich, Warnung |
| `{file_count}`         | Anzahl der verarbeiteten Dateien.                      | Erfolgreich, Warnung |
| `{file_size}`          | Gesamtgröße der gesicherten Dateien.                  | Erfolgreich, Warnung |
| `{messages_count}`     | Anzahl der Nachrichten.                             | Erfolgreich, Warnung |
| `{warnings_count}`     | Anzahl der Warnungen.                             | Erfolgreich, Warnung |
| `{errors_count}`       | Anzahl der Fehler.                               | Erfolgreich, Warnung |
| `{log_text}`           | Nur Warnungs- und Fehler-Protokollzeilen (keine vollständigen Informationsprotokolle). NTFY verwendet eine Kurzfassung und kann abschneiden. | Erfolgreich, Warnung |
| `{last_backup_date}`   | Datum der letzten Sicherung.                        | Überfällig          |
| `{last_elapsed}`       | Seit der letzten Sicherung vergangene Zeit.             | Überfällig          |
| `{expected_date}`      | Erwartetes Sicherungsdatum.                           | Überfällig          |
| `{expected_elapsed}`   | Seit dem erwarteten Datum vergangene Zeit.           | Überfällig          |
| `{backup_interval}`    | Intervall-Zeichenfolge (z.B. "1D", "2W", "1M").       | Überfällig          |
| `{overdue_tolerance}`  | Einstellung für Überfällig-Toleranz.                      | Überfällig          |

Vorlagen für tägliche Zusammenfassungen verwenden einen anderen Satz an Variablen für den aktuellen Status-Snapshot:

| Variable | Beschreibung |
|:---------|:------------|
| `{summary_date}` | Lokales Kalenderdatum des Snapshots |
| `{generated_at}` | Datum und Uhrzeit, zu der der Snapshot generiert wurde |
| `{time_zone}` | Gespeicherte IANA-Zeitzone |
| `{server_count}` / `{job_count}` | Server und bekannte Jobs |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | Gegenseitig ausschließende Status-Bereiche |
| `{overdue_count}` | Überfällige Jobs (unabhängig vom Status; kann sich mit den oben genannten Bereichen überschneiden) |
| `{problem_table}` / `{all_jobs_table}` | Generierte Tabellen von Jobs mit Aufmerksamkeitsbedarf und allen Jobs. Spalten: Server, Sicherung, Überfällig, Letzter Status, Letztes Ergebnis, Dauer, Warnungen, Fehler, Hochgeladen. |
| `{duplistatus_link}` | Link zum duplistatus Dashboard (wird weggelassen, wenn keine öffentliche URL konfiguriert ist). Bevorzugen Sie dies gegenüber manuell erstellten Markdown-Links. |
| `{duplistatus_url}` | Gleiche URL als Klartext (leer, wenn keine öffentliche URL konfiguriert ist). |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | Aktuelle Ergebnisgesamtsummen |

Der Standardbetreff für die tägliche Zusammenfassungs-E-Mail lautet:

```text
Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal
```

Unveränderte gespeicherte Standardbetriffe werden auf dieses Format aktualisiert. Angepasste Betriffe bleiben unverändert. `{unknown_count}` und `{no_report_count}` verbleiben im E-Mail-Textkörper, nicht im Standardbetreff.

Verwenden Sie **Vorschau**, um den E-Mail-Betreff, HTML und Klartext ohne Senden darzustellen. Vorschauen für Erfolg, Warnung/Fehler und Überfällig enthalten auch die NTFY Markdown-Nutzlast. Die Vorschau öffnet sich in einem Dialog. E-Mail HTML / Klartext / NTFY Schaltflächen befinden sich oberhalb des Betreffs. E-Mail HTML folgt dem aktuellen hellen oder dunklen Design.
