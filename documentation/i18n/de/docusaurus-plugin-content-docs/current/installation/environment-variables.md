---
translation_last_updated: '2026-02-06T22:33:31.542Z'
source_file_mtime: '2026-01-25T02:45:42.745Z'
source_file_hash: d1761516332c96f7
translation_language: de
source_file_path: installation/environment-variables.md
---
# Umgebungsvariablen {#environment-variables}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                            | Standard         |
| ------------------------- | ------------------------------------------------------ | :-------------- |
| `PORT`                    | Port für die Hauptwebanwendung                      | `9666`          |
| `CRON_PORT`               | Port für den Cron-Dienst. Wenn nicht gesetzt, verwendet `PORT + 1` | `9667`          |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)    | `production`    |
| `NEXT_TELEMETRY_DISABLED` | Deaktivieren Sie Next.js-Telemetrie                              | `1`             |
| `TZ`                      | Zeitzone für die Anwendung                           | `Europe/London` |
| `LANG`                    | Gebietsschema für die Anwendung (z. B. `en_US`, `pt_BR`)    | `en_GB`         |
| `PWD_ENFORCE`             | Auf `false` setzen, um Anforderungen an die Passwortkomplexität zu deaktivieren (Großbuchstaben, Kleinbuchstaben, Zahlen). Die Mindestlänge wird immer erzwungen. | Erzwungen (vollständige Validierung) |
| `PWD_MIN_LEN`             | Mindestpasswortlänge in Zeichen                 | `8`             |
