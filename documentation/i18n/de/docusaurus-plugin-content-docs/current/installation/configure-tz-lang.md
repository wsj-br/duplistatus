# Zeitzone und Gebietsschema

Datum und Uhrzeit der Anwendungsbenutzeroberfläche werden entsprechend den Browsereinstellungen angezeigt. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch die in den Umgebungsvariablen `TZ` und `LANG` definierten Werte, um die korrekten Zeitzonen zu verwenden und Zahlen-, Datums- und Uhrzeitwerte zu formatieren.

Die Standardwerte sind `TZ=Europe/London` und `LANG=en_GB`, wenn diese Umgebungsvariablen nicht gesetzt sind.

## Konfigurieren der Zeitzone

Datum und Uhrzeit der Anwendungsbenutzeroberfläche werden entsprechend den Browsereinstellungen angezeigt. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariable `TZ` definierten Wert, um Zeitzonen zu formatieren.

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

### Verwenden Ihrer Linux-Konfiguration

Um die Konfiguration Ihres Linux-Hosts zu erhalten, können Sie Folgendes ausführen:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste der Zeitzonen

Eine Liste der Zeitzonen finden Sie hier: [Wikipedia: Liste der tz-Datenbank-Zeitzonen](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Konfigurieren des Gebietsschemas

Datumsangaben und Zahlen der Anwendungsbenutzeroberfläche werden entsprechend den Browsereinstellungen angezeigt. Für Protokollierungs- und Benachrichtigungszwecke verwendet die Anwendung jedoch den in der Umgebungsvariable `LANG` definierten Wert, um Datumsangaben und Zahlen zu formatieren.

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

### Verwenden Ihrer Linux-Konfiguration

Um die Konfiguration Ihres Linux-Hosts zu erhalten, können Sie Folgendes ausführen:

```bash
echo ${LANG%.*}
```

### Liste der Gebietsschemas

Eine Liste der Gebietsschemas finden Sie hier: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)

