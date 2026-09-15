# Vorlagen {/* #templates */}

**duplistatus** verwendet vier Vorlagen für Benachrichtigungsnachrichten. E-Mail-Körper sind Markdown (Überschriften, Listen, Links und Tabellen). NTFY für Erfolg, Warnung/Fehler und Überfällig verwendet denselben Markdown-Körper, der mit `Markdown: yes` gesendet wird, damit ntfy-Clients ihn rendern können. Jede GFM-Tabelle ohne ihre Kopfzeile und der Körper wird als Klartext gesendet, da ntfy keine Tabellen rendert. Die Tägliche Zusammenfassung ist nur für E-Mails.

Die Seite enthält einen **Vorlagensprach**-Auswahldialog, der die Sprache für Standardvorlagen festlegt. Das Ändern der Sprache aktualisiert die Sprache für neue Standardeinstellungen, aber es ändert **nicht** den Text der vorhandenen Vorlagen. Um eine neue Sprache auf Ihre Vorlagen anzuwenden, bearbeiten Sie sie manuell oder verwenden Sie **Diese Vorlage auf Standardwerte zurücksetzen** (für die aktuelle Registerkarte) oder **Alle auf Standard zurücksetzen** (für alle Vorlagen).

![Benachrichtigungsvorlagen](../../assets/screen-settings-templates.png)

| Vorlage           | Beschreibung                                         |
| :----------------- | :-------------------------------------------------- |
| **Erfolgreich**        | Wird verwendet, wenn Sicherungen erfolgreich abgeschlossen sind.            |
| **Warnung/Fehler**  | Wird verwendet, wenn Sicherungen mit Warnungen oder Fehlern abgeschlossen sind. |
| **Überfällige Sicherung** | Wird verwendet, wenn Sicherungen überfällig sind.                      |
| **Tägliche Zusammenfassung**  | Markdown-E-Mail-Vorlage für die optionale tägliche Momentaufnahme. |

<br/>

## Vorlagensprache {/* #template-language */}

Ein **Vorlagensprach**-Auswahldialog oben auf der Seite ermöglicht die Auswahl der Sprache für Standardvorlagen (Englisch, Deutsch, Französisch, Spanisch, Portugiesisch, Hindi und Chinesisch). Das Ändern der Sprache aktualisiert die Sprache für Standardeinstellungen, aber vorhandene angepasste Vorlagen behalten ihren aktuellen Text, bis Sie sie aktualisieren oder eine der Zurücksetzen-Schaltflächen verwenden.

<br/>

## Verfügbare Aktionen {/* #available-actions */}

| Schaltfläche                                                              | Beschreibung                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Vorlageinstellungen speichern" />                      | Speichert die Einstellungen beim Ändern der Vorlage. Die Schaltfläche speichert die angezeigte Vorlage (Erfolgreich, Warnung/Fehler, Überfällige Sicherung oder Tägliche Zusammenfassung). |
| <IconButton icon="lucide:send" label="Testbenachrichtigung senden"/>     | Prüft die Vorlage nach dem Aktualisieren. Die Variablen werden durch ihre Namen ersetzt. Für E-Mail-Benachrichtigungen wird der Vorlagentitel zur E-Mail-Betreffzeile. Nicht verfügbar auf der Registerkarte Tägliche Zusammenfassung. |
| <IconButton icon="lucide:rotate-ccw" label="Diese Vorlage auf Standardwerte zurücksetzen"/> | Stellt die Standardvorlage für die **ausgewählte Vorlage** (die aktuelle Registerkarte) wieder her. Denken Sie daran, nach dem Zurücksetzen zu speichern. |
| <IconButton icon="lucide:rotate-ccw" label="Alle auf Standard zurücksetzen"/> | Stellt alle Vorlagen (Erfolgreich, Warnung/Fehler, Überfällige Sicherung und Tägliche Zusammenfassung) auf die Standardeinstellungen für die ausgewählte Vorlagensprache zurück. Denken Sie daran, nach dem Zurücksetzen zu speichern. |

<br/>

## Variablen {/* #variables */}

E-Mail-Körper sind Markdown. Überschriften, Listen, Links und Tabellen werden unterstützt. Platzhalterwerte werden als escapierter Text eingefügt und können kein Markdown oder HTML einführen. Bisher eingebettetes rohes HTML in angepassten Vorlagen wird jetzt escapiert. NTFY erhält denselben Markdown, außer GFM-Tabellen: Die Kopfzeile wird weggelassen und die Körperzeilen werden als Klartext für jede Spaltenanordnung gesendet.

Die Standardvorlagen für Erfolg, Warnung/Fehler und Überfällig verwenden denselben Markdown-Stil wie die Tägliche Zusammenfassung: eine Überschrift, fettgedruckte Werte und eine Übersichtstabelle. Unveränderte gespeicherte Standardeinstellungen werden beim Laden aktualisiert; angepasste Vorlagen werden beibehalten.

Alle Erfolg-, Warnung/Fehler- und Überfällig-Vorlagen unterstützen Variablen, die durch tatsächliche Werte ersetzt werden. Die folgende Tabelle zeigt die verfügbaren Variablen:

| Variable               | Beschreibung                                     | Verfügbar in     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Name des Servers.                             | Erfolg, Warnung, Überfällig |
| `{server_alias}`       | Alias des Servers.                            | Erfolg, Warnung, Überfällig |
| `{server_note}`        | Notiz für den Server.                            | Erfolgreich, Warnung, Überfällig |
| `{server_url}`         | URL der Duplicati-Server-Webkonfiguration   | Erfolgreich, Warnung, Überfällig |
| `{backup_name}`        | Name des Backups.                             | Erfolgreich, Warnung, Überfällig |
| `{status}`             | Backup-Status (Erfolgreich, Warnung, Fehler, Fatal). | Erfolgreich, Warnung |
| `{backup_date}`        | Datum und Uhrzeit des Backups.                    | Erfolgreich, Warnung |
| `{duration}`           | Dauer des Backups.                         | Erfolgreich, Warnung |
| `{uploaded_size}`      | Menge der hochgeladenen Daten.                        | Erfolgreich, Warnung |
| `{storage_size}`       | Speicherauslastungsinformationen.                      | Erfolgreich, Warnung |
| `{available_versions}` | Anzahl der verfügbaren Sicherungsversionen.            | Erfolgreich, Warnung |
| `{file_count}`         | Anzahl der verarbeiteten Dateien.                      | Erfolgreich, Warnung |
| `{file_size}`          | Gesamtgröße der gesicherten Dateien.                  | Erfolgreich, Warnung |
| `{messages_count}`     | Anzahl der Nachrichten.                             | Erfolgreich, Warnung |
| `{warnings_count}`     | Anzahl der Warnungen.                             | Erfolgreich, Warnung |
| `{errors_count}`       | Anzahl der Fehler.                               | Erfolgreich, Warnung |
| `{log_text}`           | Nur Warnungs- und Fehlerprotokollzeilen (keine vollständigen Informationsprotokolle). NTFY verwendet eine kurze Zusammenfassung und kann kürzen. | Erfolgreich, Warnung |
| `{last_backup_date}`   | Datum der letzten Sicherung.                        | Überfällig          |
| `{last_elapsed}`       | Verstrichene Zeit seit der letzten Sicherung.             | Überfällig          |
| `{expected_date}`      | Erwartetes Sicherungsdatum.                           | Überfällig          |
| `{expected_elapsed}`   | Verstrichene Zeit seit dem erwarteten Datum.           | Überfällig          |
| `{backup_interval}`    | Intervallzeichenfolge (z. B. "1D", "2W", "1M").       | Überfällig          |
| `{overdue_tolerance}`  | Einstellung für die Überfällig-Toleranz.                      | Überfällig          |

Vorlagen für die tägliche Zusammenfassung verwenden eine andere Gruppe von Variablen für den aktuellen Status-Snapshot:

| Variable | Beschreibung |
|:---------|:------------|
| `{summary_date}` | Lokales Kalenderdatum des Snapshots |
| `{generated_at}` | Datum und Uhrzeit, zu der der Snapshot generiert wurde |
| `{time_zone}` | Gespeicherte IANA-Zeitzone |
| `{server_count}` / `{job_count}` | Server und bekannte Jobs |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | gegenseitig ausschließende Status-Buckets |
| `{overdue_count}` | Überfällige Jobs (orthogonal zum Status; kann die Buckets oben überschneiden) |
| `{problem_table}` / `{all_jobs_table}` | Generierte Tabellen mit Aufmerksamkeitspflicht und allen Jobs. Spalten: Server, Sicherung, Überfällig, Letzter Status, Letztes Ergebnis, Dauer, Warnungen, Fehler, Hochgeladen. |
| `{duplistatus_link}` | Link zum duplistatus-Dashboard (wird weggelassen, wenn keine öffentliche URL konfiguriert ist). Bevorzuge dies gegenüber handgebauten Markdown-Links. |
| `{duplistatus_url}` | Gleiche URL als Klartext (leer, wenn keine öffentliche URL konfiguriert ist). |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | Letzte-Ergebnis-Totals |

Der Standard-Betreff der täglichen Zusammenfassung lautet:

```text
Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal
```

Unveränderte gespeicherte Standard-Betreffs werden auf dieses Format aktualisiert. Angepasste Betreffs bleiben unverändert. `{unknown_count}` und `{no_report_count}` bleiben im E-Mail-Body, nicht im Standard-Betreff.

Verwende **Vorschau**, um den E-Mail-Betreff, HTML und Klartext ohne Senden zu rendern. Erfolg, Warnung/Fehler und Überfällig-Vorschauen enthalten auch die NTFY Markdown-Payload. Die Vorschau öffnet sich in einem Dialog. E-Mail HTML / Klartext / NTFY-Buttons befinden sich über dem Betreff. E-Mail HTML folgt dem aktuellen hellen oder dunklen Design.
