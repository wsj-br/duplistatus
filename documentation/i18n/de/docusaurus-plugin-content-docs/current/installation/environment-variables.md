# Umgebungsvariablen {/* #environment-variables */}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                                                                | Standard                     |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port für die Haupt-Webanwendung                                                             | `9666`                     |
| `CRON_PORT`               | Port für den Cron-Dienst (Planung). Falls nicht festgelegt, wird `PORT + 1` verwendet                                  | `9667`                     |
| `CRON_BIND_HOST`          | Adresse, auf der der Cron-Dienst lauscht. Loopback ist der Standard, sodass die Steuerungs-API nicht offengelegt wird.         | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Gemeinsames Geheimnis, das zum Ändern von Cron-Dienstrouten erforderlich ist, wenn der Dienst nicht an Loopback gebunden ist. Der Next.js-Proxy leitet es als `X-Cron-Service-Secret` weiter. | Nicht festgelegt (erforderlich, falls nicht Loopback) |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                          | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deaktiviert Next.js-Telemetrie (wird in allen Next.js-Skripten und in Docker gesetzt)                        | `1`                        |
| `TZ`                      | Zeitzone für die Anwendung                                                                  | `Europe/London`            |
| `PWD_ENFORCE`             | Auf `false` setzen, um Passwort-Komplexitätsanforderungen zu deaktivieren (Großbuchstaben, Kleinbuchstaben, Zahlen). | Erzwungen (vollständige Validierung) |
| `PWD_MIN_LEN`             | Minimale Passwortlänge in Zeichen (immer erzwungen)                                       | `8`                        |
| `IP_TRUSTED_PROXIES`      | Durch Kommas getrennte CIDRs von Reverse-Proxies, denen das Festlegen von `X-Forwarded-For` erlaubt ist              | Nicht festgelegt                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Überschreibt das Aktivierungsflag der Admin-IP-Zulassungsliste (`true` / `false`)                          | Nicht festgelegt (Einstellungen verwenden)       |
| `ADMIN_IP_ALLOWLIST`      | Durch Kommas getrennte CIDRs für das Administrationsinterface                             | Nicht festgelegt                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Überschreibt das Aktivierungsflag der externen API-Zulassungsliste (`true` / `false`)                 | Nicht festgelegt (Einstellungen verwenden)       |
| `EXTERNAL_API_IP_ALLOWLIST` | Durch Kommas getrennte CIDRs für `/api/upload`, `/api/summary` und `/api/lastbackup*`           | Nicht festgelegt                      |
| `DUPLISTATUS_PUBLIC_URL`    | Öffentliche Basis-URL der duplistatus Web-Oberfläche (kein abschließender Schrägstrich). Wenn festgelegt, überschreibt dies Einstellungen → Tägliche Zusammenfassung **Öffentliche Dashboard-URL** und tägliche Zusammenfassungs-E-Mails enthalten `{duplistatus_link}`. Wenn nicht festgelegt, wird die gespeicherte Einstellung verwendet; falls diese ebenfalls leer ist, wird kein Dashboard-Link hinzugefügt. | Nicht festgelegt                      |

`NEXT_TELEMETRY_DISABLED=1` wird vom Docker-Image und von `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` und `pnpm dev` gesetzt, sodass Next.js keine anonyme CLI-Telemetrie sammelt. Bei Verwendung einer neuen Entwicklungsumgebung oder Kompilierung aus dem Quellcode, persistiere auch den Opt-Out in deiner Benutzerkonfiguration, führe `npx next telemetry disable` aus.
