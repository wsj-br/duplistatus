# Umgebungsvariablen {/* #environment-variables */}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                                                                 | Standard                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port für die Haupt-Webanwendung                                                           | `9666`                     |
| `CRON_PORT`               | Port für den Cron-Dienst (Zeitplanung). Wenn nicht festgelegt, wird `PORT + 1` verwendet.                                      | `9667`                     |
| `CRON_BIND_HOST`          | Adresse, auf der der Cron-Dienst lauscht. Standardmäßig wird die Loopback-Adresse verwendet, sodass die Steuerungs-API nicht verfügbar ist.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Gemeinsames Geheimnis, das für die Mutation von Cron-Dienst-Routen erforderlich ist, wenn der Dienst nicht an die Loopback-Adresse gebunden ist. Der Next.js-Proxy leitet es als `X-Cron-Service-Secret` weiter. | nicht festgelegt (erforderlich, wenn nicht Loopback) |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deaktivieren Sie die Next.js-Telemetrie (setzen Sie dies in allen Next.js-Skripten und in Docker).                        | `1`                        |
| `TZ`                      | Zeitzone für die Anwendung                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Legen Sie dies auf `false` fest, um die Anforderungen an die Passwortkomplexität (Großbuchstaben, Kleinbuchstaben, Zahlen) zu deaktivieren. | Erzwungen (volle Validierung) |
| `PWD_MIN_LEN`             | Mindestlänge des Passworts in Zeichen (immer erzwungen)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | Komma-getrennte CIDRs der Reverse-Proxies, die `X-Forwarded-For` festlegen dürfen                   | nicht festgelegt                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Überschreiben Sie die Aktivierungsflagge für die Admin-IP-Zulassungsliste (`true` / `false`)                           | nicht festgelegt (verwenden Sie Einstellungen)       |
| `ADMIN_IP_ALLOWLIST`      | Komma-getrennte CIDRs für die Administrationsinterface                                               | nicht festgelegt                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Überschreiben Sie die Aktivierungsflagge für die externe-API-Zulassungsliste (`true` / `false`)                | nicht festgelegt (verwenden Sie Einstellungen)       |
| `EXTERNAL_API_IP_ALLOWLIST` | Komma-getrennte CIDRs für `/api/upload`, `/api/summary` und `/api/lastbackup*`           | nicht festgelegt                      |
| `DUPLISTATUS_PUBLIC_URL`    | Öffentliche Basis-URL der duplistatus-Weboberfläche (kein abschließender Schrägstrich). Wenn festgelegt, wird die Einstellung Einstellungen → Tägliche Zusammenfassung **Öffentliche Dashboard-URL** überschrieben und die E-Mails zur Täglichen Zusammenfassung enthalten `{duplistatus_link}`. Wenn nicht festgelegt, wird die gespeicherte Einstellung verwendet; wenn diese ebenfalls leer ist, wird kein Dashboard-Link hinzugefügt. | nicht festgelegt                      |

`NEXT_TELEMETRY_DISABLED=1` wird von dem Docker-Image und von `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` und `pnpm dev` festgelegt, sodass Next.js keine anonyme CLI-Telemetrie sammelt. Wenn Sie eine neue Entwicklungsumgebung verwenden oder aus der Quelle kompilieren, speichern Sie die Opt-Out-Option auch in Ihrer Benutzerkonfiguration und führen Sie `npx next telemetry disable` aus.
