---
translation_last_updated: '2026-01-31T00:51:23.370Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 67bb94741185f3d9
translation_language: de
source_file_path: installation/configure-tz-lang.md
---
# Zeitzone und Gebietsschema {#timezone-and-locale}

Die Benutzeroberfläche der Anwendung zeigt Datum und Uhrzeit gemäß den Browsereinstellungen an. Für Protokollierung und Benachrichtigungen verwendet die Anwendung jedoch die in den Umgebungsvariablen `TZ` und `LANG` definierten Werte, um die korrekten Zeitzonen zu verwenden und Zahlen-, Datums- und Zeitwerte korrekt zu formatieren.

Die Standardwerte sind `TZ=Europe/London` und `LANG=en_GB`, wenn diese Umgebungsvariablen nicht gesetzt sind.

## Konfigurieren der Zeitzone {#configuring-the-timezone}

Die Benutzeroberfläche der Anwendung zeigt Datum und Uhrzeit gemäß den Browsereinstellungen an. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den Wert der Umgebungsvariablen `TZ`, um Zeitzonen zu formatieren.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht gesetzt ist.

Um beispielsweise die Zeitzone auf São Paulo zu ändern, fügen Sie diese Zeilen zur `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile:

```bash
  --env TZ=America/Sao_Paulo
```

### Verwendung Ihrer Linux-Konfiguration {#using-your-linux-configuration}

Um die Konfiguration Ihres Linux-Hosts zu erhalten, können Sie folgendes ausführen:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste von Zeitzonen {#list-of-timezones}

Sie finden eine Liste von Zeitzonen hier: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Konfigurieren des Gebietsschemas {#configuring-the-locale}

Die Benutzeroberfläche der Anwendung zeigt Daten und Zahlen gemäß den Einstellungen des Browsers an. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariablen `LANG` definierten Wert zur Formatierung von Daten und Zahlen.

Der Standardwert ist `LANG=en_GB`, wenn diese Umgebungsvariable nicht gesetzt ist.

Um beispielsweise das Gebietsschema auf brasilianisches Portugiesisch zu ändern, fügen Sie diese Zeilen zur `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - LANG=pt_BR
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile:

```bash
  --env LANG=pt_BR
```

### Verwendung Ihrer Linux-Konfiguration {#using-your-linux-configuration}

Um die Konfiguration Ihres Linux-Hosts zu erhalten, können Sie folgendes ausführen:

```bash
echo ${LANG%.*}
```

### Liste von Locales {#list-of-locales}

Sie können eine Liste von Locales hier finden: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)
