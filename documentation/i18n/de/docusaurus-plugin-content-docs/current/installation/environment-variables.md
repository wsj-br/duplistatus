---
translation_last_updated: '2026-02-16T02:21:35.217Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: 73f503de6e910445
translation_language: de
source_file_path: installation/environment-variables.md
---
# Umgebungsvariablen {#environment-variables}

Die Anwendung unterstützt die folgenden Umgebungsvariablen für die Konfiguration:

| Variable                  | Beschreibung                                                                                 | Standard                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port für die Hauptwebanwendung                                                           | `9666`                     |
| `CRON_PORT`               | Port für den Cron-Dienst (Planung). Falls nicht gesetzt, verwendet `PORT + 1`                                      | `9667`                     |
| `NODE_ENV`                | Node.js-Umgebung (`development` oder `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deaktivieren Sie Next.js-Telemetrie                                                                   | `1`                        |
| `TZ`                      | Zeitzone für die Anwendung                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Auf `false` setzen, um Passwort-Komplexitätsanforderungen (Großbuchstaben, Kleinbuchstaben, Zahlen) zu deaktivieren. | Erzwungen (vollständige Validierung) |
| `PWD_MIN_LEN`             | Mindestlänge des Passworts in Zeichen (immer erzwungen)                                    | `8`                        |
