# Zeitzone {/* #timezone */}

Das Datum und die Uhrzeit der Anwendungsbenutzeroberfläche werden gemäß den Browsereinstellungen angezeigt. Die Protokollierung verwendet weiterhin die Umgebungsvariable `TZ`. Tägliche-Zusammenfassungs-Benachrichtigungen verwenden die in [Einstellungen → Tägliche Zusammenfassung](../user-guide/settings/daily-summary-settings.md) gespeicherte IANA-Zeitzone, nicht `TZ`. Andere Benachrichtigungszeitstempel, die keine Tägliche Zusammenfassung sind, folgen weiterhin `TZ`.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht festgelegt ist.

:::note
Die Sprach- und Ländereinstellungen (Zahlen- und Datumsformate) für Benachrichtigungen können in [Einstellungen → Vorlagen](../user-guide/settings/notification-templates.md) konfiguriert werden.
:::

## Konfigurieren der Zeitzone {/* #configuring-the-timezone */}

Das Datum und die Uhrzeit der Anwendungsbenutzeroberfläche werden gemäß den Browsereinstellungen angezeigt. Die Protokollierung verwendet weiterhin die Umgebungsvariable `TZ`. Tägliche-Zusammenfassungs-Benachrichtigungen verwenden die in [Einstellungen → Tägliche Zusammenfassung](../user-guide/settings/daily-summary-settings.md) gespeicherte IANA-Zeitzone, nicht `TZ`. Andere Benachrichtigungszeitstempel, die keine Tägliche Zusammenfassung sind, folgen weiterhin `TZ`.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht festgelegt ist.

Um beispielsweise die Zeitzone auf São Paulo zu ändern, fügen Sie diese Zeilen zu `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile (Docker oder Podman):

```bash
  --env TZ=America/Sao_Paulo
```

### Verwendung Ihrer Linux-Konfiguration {/* #using-your-linux-configuration */}

Um Ihre Linux-Host-Konfiguration zu erhalten, können Sie Folgendes ausführen:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste der Zeitzonen {/* #list-of-timezones */}

Sie finden eine Liste der Zeitzonen hier: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
