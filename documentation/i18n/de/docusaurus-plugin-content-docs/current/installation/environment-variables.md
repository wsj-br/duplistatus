# Umgebungsvariablen {#environment-variables}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                                                                 | Standard                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port für die Haupt-Webanwendung                                                           | `9666`                     |
| `CRON_PORT`               | Port für den Cron-Service (Zeitplanung). Wenn nicht gesetzt, wird `PORT + 1` verwendet                                      | `9667`                     |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deaktiviert Next.js-Telemetrie                                                                   | `1`                        |
| `TZ`                      | Zeitzone für die Anwendung                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Auf `false` setzen, um Passwortkomplexitätsanforderungen (Großbuchstaben, Kleinbuchstaben, Zahlen) zu deaktivieren. | Enforced (vollständige Validierung) |
| `PWD_MIN_LEN`             | Mindestpasswortlänge in Zeichen (immer erzwungen)                                    | `8`                        |
