---
translation_last_updated: '2026-02-15T20:57:39.990Z'
source_file_mtime: '2026-02-15T18:21:42.048Z'
source_file_hash: 73f503de6e910445
translation_language: es
source_file_path: installation/environment-variables.md
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
