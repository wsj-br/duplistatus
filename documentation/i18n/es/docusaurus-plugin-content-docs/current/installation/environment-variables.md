---
translation_last_updated: '2026-04-18T00:01:45.931Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: 781281113de4e41e8ca020c5d122aaa0d1fe40599ea1612477312ced4f7eb83a
translation_language: es
source_file_path: documentation/docs/installation/environment-variables.md
translation_models:
  - anthropic/claude-haiku-4.5
---
# Variables de Entorno {#environment-variables}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                                                                 | Por defecto                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Puerto para la aplicación web principal                                                           | `9666`                     |
| `CRON_PORT`               | Puerto para el servicio cron (programación). Si no se establece, utiliza `PORT + 1`                                      | `9667`                     |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desactivar telemetría de Next.js                                                                   | `1`                        |
| `TZ`                      | Zona horaria para la aplicación                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Establecer en `false` para desactivar requisitos de complejidad de contraseña (mayúsculas, minúsculas, números). | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de contraseña en caracteres (siempre aplicado)                                    | `8`                        |
