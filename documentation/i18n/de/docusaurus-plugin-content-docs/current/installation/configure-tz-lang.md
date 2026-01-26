# Zeitzone und Gebietsschema {#timezone-and-locale}

Das Datum und die Uhrzeit der Benutzeroberfläche der Anwendung werden gemäß den Einstellungen des Browsers angezeigt. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in den Umgebungsvariablen `TZ` und `LANG` definierten Wert, um die korrekten Zeitzonen zu verwenden und Zahlen-, Datums- und Zeitwerte zu formatieren.

Die Standardwerte sind `TZ=Europe/London` und `LANG=en_GB`, wenn diese Umgebungsvariablen nicht gesetzt sind.

## Konfigurieren der Zeitzone {#configuring-the-timezone}

Das Datum und die Uhrzeit der Benutzeroberfläche der Anwendung werden gemäß den Einstellungen des Browsers angezeigt. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariablen `TZ` definierten Wert, um Zeitzonen zu formatieren.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht gesetzt ist.

Um beispielsweise die Zeitzone auf São Paulo zu ändern, fügen Sie diese Zeilen in der Datei `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile:

```bash
  --env TZ=America/Sao_Paulo
```

### Verwendung Ihrer Linux-Konfiguration {#using-your-linux-configuration}

Um die Konfiguration Ihres Linux-Host zu erhalten, können Sie Folgendes ausführen:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste von Zeitzonen {#list-of-timezones}

Sie können eine Liste von Zeitzonen hier finden: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Konfigurieren des Gebietsschemas {#configuring-the-locale}

Die Daten und Zahlen der Benutzeroberfläche der Anwendung werden gemäß den Einstellungen des Browsers angezeigt. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariablen `LANG` definierten Wert, um Daten und Zahlen zu formatieren.

Der Standardwert ist `LANG=en_GB`, wenn diese Umgebungsvariable nicht gesetzt ist.

Um beispielsweise das Gebietsschema auf brasilianisches Portugiesisch zu ändern, fügen Sie diese Zeilen in der Datei `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - LANG=pt_BR
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile:

```bash
  --env LANG=pt_BR
```

### Verwendung Ihrer Linux-Konfiguration {#using-your-linux-configuration}

Um die Konfiguration Ihres Linux-Host zu erhalten, können Sie Folgendes ausführen:

```bash
echo ${LANG%.*}
```

### Liste von Gebietsschemas {#list-of-locales}

Sie können eine Liste von Gebietsschemas hier finden: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)

