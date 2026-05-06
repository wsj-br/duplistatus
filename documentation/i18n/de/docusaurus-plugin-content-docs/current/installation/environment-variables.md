---
translation_last_updated: '2026-05-06T23:20:30.955Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 781281113de4e41e8ca020c5d122aaa0d1fe40599ea1612477312ced4f7eb83a
translation_language: de
source_file_path: documentation/docs/installation/environment-variables.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
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
