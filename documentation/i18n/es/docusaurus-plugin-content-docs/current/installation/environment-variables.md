---
translation_last_updated: '2026-02-06T22:33:36.423Z'
source_file_mtime: '2026-01-25T02:45:42.745Z'
source_file_hash: d1761516332c96f7
translation_language: es
source_file_path: installation/environment-variables.md
---
# Variables de Entorno {#environment-variables}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                            | Por defecto     |
| ------------------------- | ------------------------------------------------------ | :-------------- |
| `PORT`                    | Puerto para la aplicación web principal                | `9666`          |
| `CRON_PORT`               | Puerto para el servicio cron. Si no está establecido, utiliza `PORT + 1` | `9667`          |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)      | `production`    |
| `NEXT_TELEMETRY_DISABLED` | Desactivar telemetría de Next.js                       | `1`             |
| `TZ`                      | Zona horaria para la aplicación                        | `Europe/London` |
| `LANG`                    | Configuración regional para la aplicación (p. ej., `en_US`, `pt_BR`) | `en_GB`         |
| `PWD_ENFORCE`             | Establecer en `false` para desactivar requisitos de complejidad de contraseña (mayúsculas, minúsculas, números). La longitud mínima siempre se aplica. | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de contraseña en caracteres            | `8`             |
