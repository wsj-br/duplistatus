---
translation_last_updated: '2026-02-06T22:33:31.493Z'
source_file_mtime: '2026-02-06T21:13:34.856Z'
source_file_hash: d6bdf0e9f9ddb899
translation_language: de
source_file_path: installation/configure-tz.md
---
# Zeitzone {#timezone}

Die Benutzeroberfläche der Anwendung zeigt Datum und Uhrzeit gemäß den Browsereinstellungen an. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariablen `TZ` definierten Wert zur Formatierung von Zeitzonen.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht gesetzt ist.

:::note
Das Gebietsschema (Zahlen- und Datumsformat) für Benachrichtigungen wird in [Einstellungen → Benachrichtigungsvorlagen](../user-guide/settings/notification-templates.md) konfiguriert.
:::

## Konfigurieren der Zeitzone {#configuring-the-timezone}

Die Benutzeroberfläche der Anwendung zeigt Datum und Uhrzeit gemäß den Browsereinstellungen an. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariablen `TZ` definierten Wert zur Formatierung von Zeitzonen.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht gesetzt ist.

Zum Beispiel, um die Zeitzone auf São Paulo zu ändern, fügen Sie diese Zeilen zur `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile:

```bash
  --env TZ=America/Sao_Paulo
```

### Verwendung Ihrer Linux-Konfiguration {#using-your-linux-configuration}

Um die Konfiguration Ihres Linux-Hosts zu erhalten, können Sie Folgendes ausführen:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste der Zeitzonen {#list-of-timezones}

Sie können hier eine Liste von Zeitzonen finden: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
