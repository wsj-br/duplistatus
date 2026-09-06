# Umgebungsvariablen {#environment-variables}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                                                                 | Standard                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port für die Haupt-Webanwendung                                                           | `9666`                     |
| `CRON_PORT`               | Port für den Cron-Service (Zeitplanung). Wenn nicht gesetzt, wird `PORT + 1` verwendet                                      | `9667`                     |
| `CRON_BIND_HOST`          | Adresse, auf der der Cron-Dienst hört. Standardmäßig wird die Schleife verwendet, sodass die Steuerungs-API nicht exponiert wird.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Gemeinsames Geheimnis, das für die Veränderung von Cron-Dienst-Routen erforderlich ist, wenn der Dienst nicht an die Schleife gebunden ist. Der Next.js-Proxy leitet es als `X-Cron-Service-Secret` weiter. | nicht festgelegt (erforderlich, wenn nicht Schleife) |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deaktivieren Sie die Next.js-Telemetrie (für alle Next.js-Skripte und in Docker)                        | `1`                        |
| `TZ`                      | Zeitzone für die Anwendung                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Auf `false` setzen, um Passwortkomplexitätsanforderungen (Großbuchstaben, Kleinbuchstaben, Zahlen) zu deaktivieren. | Enforced (vollständige Validierung) |
| `PWD_MIN_LEN`             | Mindestpasswortlänge in Zeichen (immer erzwungen)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | Komma-getrennte CIDRs der Reverse-Proxies, die `X-Forwarded-For` setzen dürfen                   | unset                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Überschreiben Sie die Admin-IP-Zulassungslisten-Flag (`true` / `false`)                           | unset (verwende Einstellungen)       |
| `ADMIN_IP_ALLOWLIST`      | Komma-getrennte CIDRs für die Administrationsinterface                                               | unset                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Überschreiben Sie die externe-API-Zulassungslisten-Flag (`true` / `false`)                | unset (verwende Einstellungen)       |
| `EXTERNAL_API_IP_ALLOWLIST` | Komma-getrennte CIDRs für `/api/upload`, `/api/summary`, und `/api/lastbackup*`           | unset                      |

`NEXT_TELEMETRY_DISABLED=1` wird durch das Docker-Image und durch `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` und `pnpm dev` gesetzt, sodass Next.js keine anonymen CLI-Telemetrie sammelt. Um die Opt-Out-Option in Ihrer Benutzerkonfiguration zu persistieren, führen Sie `npx next telemetry disable` aus.
