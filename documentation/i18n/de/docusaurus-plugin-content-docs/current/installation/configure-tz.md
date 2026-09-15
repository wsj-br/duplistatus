# Zeitzone {/* #timezone */}

Das Benutzerinterface der Anwendung zeigt Datum und Uhrzeit entsprechend den Browsereinstellungen an. Logging verwendet weiterhin die `TZ` Umgebungsvariable. Tägliche Zusammenfassung Benachrichtigungen verwenden die IANA Zeitzone, die in [Einstellungen → Tägliche Zusammenfassung](../user-guide/settings/daily-summary-settings.md) gespeichert ist, nicht `TZ`. Andere Benachrichtigungszeitstempel, die keine Tägliche Zusammenfassung sind, folgen weiterhin `TZ`.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht festgelegt ist.

:::note
Die Sprache und Gebietsschema-Einstellungen (Zahlen- und Datumsformate) für Benachrichtigungen können in den [Einstellungen → Vorlagen](../user-guide/settings/notification-templates.md) konfiguriert werden.
:::

## Konfigurieren der Zeitzone {/* #configuring-the-timezone */}

Das Benutzerinterface der Anwendung zeigt Datum und Uhrzeit entsprechend den Browsereinstellungen an. Logging verwendet weiterhin die `TZ` Umgebungsvariable. Tägliche Zusammenfassung Benachrichtigungen verwenden die IANA Zeitzone, die in [Einstellungen → Tägliche Zusammenfassung](../user-guide/settings/daily-summary-settings.md) gespeichert ist, nicht `TZ`. Andere Benachrichtigungszeitstempel, die keine Tägliche Zusammenfassung sind, folgen weiterhin `TZ`.

Der Standardwert ist `TZ=Europe/London`, wenn diese Umgebungsvariable nicht festgelegt ist.

Zum Beispiel, um die Zeitzone auf São Paulo zu ändern, fügen Sie diese Zeilen zur `compose.yml` im Verzeichnis `duplistatus` hinzu:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

oder übergeben Sie die Umgebungsvariable in der Befehlszeile (Docker oder Podman):

```bash
  --env TZ=America/Sao_Paulo
```

### Verwendung Ihrer Linux-Konfiguration {/* #using-your-linux-configuration */}

Um die Konfiguration Ihres Linux-Hosts zu erhalten, können Sie ausführen:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste der Zeitzonen {/* #list-of-timezones */}

Sie können eine Liste der Zeitzonen hier finden: [Wikipedia: Liste der tz-Datenbank Zeitzonen](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
