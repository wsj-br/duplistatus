---
translation_last_updated: '2026-04-18T00:02:53.149Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: 781281113de4e41e8ca020c5d122aaa0d1fe40599ea1612477312ced4f7eb83a
translation_language: de
source_file_path: documentation/docs/installation/environment-variables.md
translation_models:
  - anthropic/claude-haiku-4.5
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
