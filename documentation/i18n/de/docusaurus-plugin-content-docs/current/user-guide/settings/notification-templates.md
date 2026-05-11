---
translation_last_updated: '2026-05-11T14:27:48.071Z'
source_file_mtime: '2026-05-06T23:18:51.446Z'
source_file_hash: 80141305b3c0238b589afcd457332db981c79b94ea2f13640c56b2203599bbd7
translation_language: de
source_file_path: documentation/docs/user-guide/settings/notification-templates.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Vorlagen {#templates}

**duplistatus** verwendet drei Vorlagen für Benachrichtigungsnachrichten. Diese Vorlagen werden sowohl für NTFY- als auch für E-Mail-Benachrichtigungen verwendet.

Die Seite enthält einen **Vorlagensprache**-Selektor, der das Gebietsschema für Standard-Vorlagen festlegt. Das Ändern der Sprache aktualisiert das Gebietsschema für neue Standards, ändert aber **nicht** den Text vorhandener Vorlagen. Um eine neue Sprache auf Ihre Vorlagen anzuwenden, bearbeiten Sie diese entweder manuell oder verwenden Sie **Diese Vorlage auf Standard zurücksetzen** (für die aktuelle Registerkarte) oder **Alle auf Standard zurücksetzen** (für alle drei Vorlagen).

![notification templates](../../assets/screen-settings-templates.png)

| Vorlage              | Beschreibung                                         |
| :----------------- | :-------------------------------------------------- |
| **Erfolg**        | Wird verwendet, wenn Sicherungen erfolgreich abgeschlossen wurden.            |
| **Warnung/Fehler**  | Wird verwendet, wenn Sicherungen mit Warnungen oder Fehlern abgeschlossen wurden. |
| **Verspätete Sicherung** | Wird verwendet, wenn Sicherungen überfällig sind.                      |

<br/>

## Vorlagen-Sprache {#template-language}

Ein **Vorlagensprache**-Wähler oben auf der Seite ermöglicht es Ihnen, die Sprache für Standard-Vorlagen (Englisch, Deutsch, Französisch, Spanisch, Portugiesisch) auszuwählen. Das Ändern der Sprache aktualisiert das Gebietsschema für Standards, aber vorhandene angepasste Vorlagen behalten ihren aktuellen Text bei, bis Sie diese aktualisieren oder eine der Schaltflächen zum Zurücksetzen verwenden.

<br/>

## Verfügbare Aktionen {#available-actions}

| Button                                                              | Beschreibung                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Vorlageneinstellungen speichern" />                      | Speichert die Einstellungen beim Ändern der Vorlage. Der Button speichert die gerade angezeigte Vorlage (Erfolg, Warnung/Fehler oder Verspätete Sicherung). |
| <IconButton icon="lucide:send" label="Testbenachrichtigung senden"/>     | Überprüft die Vorlage nach der Aktualisierung. Die Variablen werden für den Test durch ihre Namen ersetzt. Bei E-Mail-Benachrichtigungen wird der Vorlagentitel zur Betreffzeile der E-Mail. |
| <IconButton icon="lucide:rotate-ccw" label="Diese Vorlage auf Standard zurücksetzen"/> | Stellt die Standardvorlage für die **ausgewählte Vorlage** (der aktuelle Tab) wieder her. Denken Sie daran, nach dem Zurücksetzen zu speichern. |
| <IconButton icon="lucide:rotate-ccw" label="Alle auf Standard zurücksetzen"/> | Stellt alle drei Vorlagen (Erfolg, Warnung/Fehler, Verspätete Sicherung) auf die Standardsprache der ausgewählten Vorlagensprache zurück. Denken Sie daran, nach dem Zurücksetzen zu speichern. |

<br/>

## Variablen {#variables}

Alle Vorlagen unterstützen Variablen, die durch tatsächliche Werte ersetzt werden. Die folgende Tabelle zeigt die verfügbaren Variablen:

| Variable               | Beschreibung                                     | Verfügbar in     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Name des Servers.                             | Alle Vorlagen    |
| `{server_alias}`       | Alias des Servers.                            | Alle Vorlagen    |
| `{server_note}`        | Hinweis für den Server.                            | Alle Vorlagen    |
| `{server_url}`         | URL der Duplicati-Server-Webkonfiguration   | Alle Vorlagen    |
| `{backup_name}`        | Name der Sicherung.                             | Alle Vorlagen    |
| `{status}`             | Status der Sicherung (Erfolg, Warnung, Fehler, Schwerwiegend). | Erfolg, Warnung |
| `{backup_date}`        | Datum und Uhrzeit der Sicherung.                    | Erfolg, Warnung |
| `{duration}`           | Dauer der Sicherung.                         | Erfolg, Warnung |
| `{uploaded_size}`      | Menge der hochgeladenen Daten.                        | Erfolg, Warnung |
| `{storage_size}`       | Informationen zur Speichernutzung.                      | Erfolg, Warnung |
| `{available_versions}` | Anzahl der verfügbaren Sicherungsversionen.            | Erfolg, Warnung |
| `{file_count}`         | Anzahl der verarbeiteten Dateien.                      | Erfolg, Warnung |
| `{file_size}`          | Gesamtgröße der gesicherten Dateien.                  | Erfolg, Warnung |
| `{messages_count}`     | Anzahl der Nachrichten.                             | Erfolg, Warnung |
| `{warnings_count}`     | Anzahl der Warnungen.                             | Erfolg, Warnung |
| `{errors_count}`       | Anzahl der Fehler.                               | Erfolg, Warnung |
| `{log_text}`           | Protokollnachrichten (Warnungen und Fehler)              | Erfolg, Warnung |
| `{last_backup_date}`   | Datum der letzten Sicherung.                        | Überfällig          |
| `{last_elapsed}`       | Seit der letzten Sicherung verstrichene Zeit.             | Überfällig          |
| `{expected_date}`      | Erwartetes Sicherungsdatum.                           | Überfällig          |
| `{expected_elapsed}`   | Seit dem erwarteten Datum verstrichene Zeit.           | Überfällig          |
| `{backup_interval}`    | Intervallangabe (z. B. „1D“, „2W“, „1M“).       | Überfällig          |
| `{overdue_tolerance}`  | Überfällig-Toleranz-Einstellung.                      | Überfällig          |
