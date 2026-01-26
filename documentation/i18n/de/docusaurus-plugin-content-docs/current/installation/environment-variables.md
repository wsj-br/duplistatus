# Umgebungsvariablen {#environment-variables}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                                                                                                                                                                                          | Standard                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| `PORT`                    | Port für die Hauptwebanwendung                                                                                                                                                                                        | `9666`                                                  |
| `CRON_PORT`               | Port für den Cron-Dienst. Falls nicht gesetzt, verwendet `PORT + 1`                                                                                                                                   | `9667`                                                  |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                                                                                                                 | `production`                                            |
| `NEXT_TELEMETRY_DISABLED` | Next.js-Telemetrie deaktivieren                                                                                                                                                                       | `1`                                                     |
| `TZ`                      | Zeitzone für die Anwendung                                                                                                                                                                                            | `Europe/London`                                         |
| `LANG`                    | Gebietsschema für die Anwendung (z. B. `en_US`, `pt_BR`)                                                                                                           | `en_GB`                                                 |
| `PWD_ENFORCE`             | Auf `false` setzen, um Anforderungen an die Passwort-Komplexität (Großbuchstaben, Kleinbuchstaben, Zahlen) zu deaktivieren. Die Mindestlänge wird immer erzwungen. | Erzwungen (vollständige Validierung) |
| `PWD_MIN_LEN`             | Mindestlänge des Passworts in Zeichen                                                                                                                                                                                 | `8`                                                     |

