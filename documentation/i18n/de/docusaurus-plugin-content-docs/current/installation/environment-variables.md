# Umgebungsvariablen {/* #environment-variables */}

Die Anwendung unterstützt die folgenden Umgebungsvariablen zur Konfiguration:

| Variable                  | Beschreibung                                                                                 | Standard                   |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port für die Haupt-Webanwendung                                                              | `9666`                     |
| `CRON_PORT`               | Port für den Cron-Dienst (Planung). Wenn nicht festgelegt, wird `PORT + 1` verwendet.                                      | `9667`                     |
| `CRON_BIND_HOST`          | Adresse, auf der der Cron-Dienst lauscht. Loopback ist der Standard, sodass die Steuer-API nicht exponiert wird.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Gemeinsames Geheimnis, das erforderlich ist, um die Routen des Cron-Dienstes zu ändern, wenn der Dienst nicht an Loopback gebunden ist. Der Next.js-Proxy leitet es als `X-Cron-Service-Secret` weiter. | unset (erforderlich, wenn nicht Loopback) |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deaktivieren Sie die Next.js-Telemetrie (in allen Next.js-Skripten und in Docker festgelegt)                        | `1`                        |
| `TZ`                      | Zeitzone für die Anwendung                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Auf `false` setzen, um die Anforderungen an die Passwortkomplexität (Großbuchstaben, Kleinbuchstaben, Zahlen) zu deaktivieren. | Durchgesetzt (vollständige Validierung) |
| `PWD_MIN_LEN`             | Minimale Passwortlänge in Zeichen (immer durchgesetzt)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | Komma-getrennte CIDRs von Reverse-Proxys, die `X-Forwarded-For` setzen dürfen                   | unset                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Überschreiben Sie das Aktivierungsflag der IP-Zulassungsliste für Admin (`true` / `false`)                           | unset (Einstellungen verwenden)       |
| `ADMIN_IP_ALLOWLIST`      | Komma-getrennte CIDRs für das Administrationsinterface                                               | unset                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Überschreiben Sie das Aktivierungsflag der externen API-Zulassungsliste (`true` / `false`)                | unset (Einstellungen verwenden)       |
| `EXTERNAL_API_IP_ALLOWLIST` | Komma-getrennte CIDRs für `/api/upload`, `/api/summary` und `/api/lastbackup*`           | unset                      |
| `DUPLISTATUS_PUBLIC_URL`    | Öffentliche Basis-URL der duplistatus-Web-UI (ohne abschließenden Schrägstrich). Wenn festgelegt, überschreibt sie die Einstellungen → Tägliche Zusammenfassung **Öffentliche Dashboard-URL** und die E-Mails der Täglichen Zusammenfassung enthalten `{duplistatus_link}`. Wenn nicht festgelegt, wird die gespeicherte Einstellung verwendet; wenn diese ebenfalls leer ist, wird kein Dashboard-Link hinzugefügt. | unset                      |

`NEXT_TELEMETRY_DISABLED=1` wird durch das Docker-Image und durch `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` und `pnpm dev` festgelegt, sodass Next.js keine anonymen CLI-Telemetrie sammelt. Wann Sie eine neue Entwicklungsumgebung verwenden oder aus der Quelle kompilieren, speichern Sie die Opt-out-Option auch in Ihrer Benutzerkonfiguration. Führen Sie `npx next telemetry disable` aus.
