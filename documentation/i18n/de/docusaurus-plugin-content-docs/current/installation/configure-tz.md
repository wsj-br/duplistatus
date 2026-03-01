---
translation_last_updated: '2026-03-01T00:45:09.573Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: 2ddcfddd1763c2b6
translation_language: de
source_file_path: installation/configure-tz.md
---
# Zeitzone {#timezone}

Die Benutzeroberfläche der Anwendung zeigt Datum und Uhrzeit gemäß den Browsereinstellungen an. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariablen `TZ` definierten Wert zur Formatierung von Zeitzonen.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht gesetzt ist.

:::note
Die Sprache und Gebietsschema-Einstellungen (Zahlen- und Datumsformate) für Benachrichtigungen können in [Einstellungen → Vorlagen](../user-guide/settings/notification-templates.md) konfiguriert werden.
:::

## Konfigurieren der Zeitzone {#configuring-the-timezone}

Die Benutzeroberfläche der Anwendung zeigt Datum und Uhrzeit gemäß den Browsereinstellungen an. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariablen `TZ` definierten Wert zur Formatierung von Zeitzonen.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht gesetzt ist.

Zum Beispiel, um die Zeitzone auf São Paulo zu ändern, fügen Sie diese Zeilen zur `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile (Docker oder Podman):

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
