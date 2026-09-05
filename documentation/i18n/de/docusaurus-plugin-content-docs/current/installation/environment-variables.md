# Umgebungsvariablen {#environment-variables}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                                                                 | Standard                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port für die Haupt-Webanwendung                                                           | `9666`                     |
| `CRON_PORT`               | Port für den Cron-Service (Zeitplanung). Wenn nicht gesetzt, wird `PORT + 1` verwendet                                      | `9667`                     |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deaktivieren Sie die Next.js-Telemetrie (für alle Next.js-Skripte und in Docker)                        | `1`                        |
| `TZ`                      | Zeitzone für die Anwendung                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Auf `false` setzen, um Passwortkomplexitätsanforderungen (Großbuchstaben, Kleinbuchstaben, Zahlen) zu deaktivieren. | Enforced (vollständige Validierung) |
| `PWD_MIN_LEN`             | Mindestpasswortlänge in Zeichen (immer erzwungen)                                    | `8`                        |

`NEXT_TELEMETRY_DISABLED=1` wird durch das Docker-Image und durch `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` und `pnpm dev` gesetzt, sodass Next.js keine anonymen CLI-Telemetrie sammelt. Um die Opt-Out-Option in Ihrer Benutzerkonfiguration zu persistieren, führen Sie `npx next telemetry disable` aus.
