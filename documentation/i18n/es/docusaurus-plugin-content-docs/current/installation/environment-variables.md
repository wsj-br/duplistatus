# Variables de entorno {/* #environment-variables */}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                                                                 | Predeterminada            |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Puerto para la aplicación web principal                                                     | `9666`                     |
| `CRON_PORT`               | Puerto para el servicio cron (programación). Si no se establece, utiliza `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Dirección en la que escucha el servicio cron. El bucle de retorno es el predeterminado, por lo que la API de control no está expuesta.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Secreto compartido requerido para mutar las rutas del servicio cron cuando el servicio no está vinculado al bucle de retorno. El proxy de Next.js lo reenvía como `X-Cron-Service-Secret`. | no establecido (requerido si no es bucle de retorno) |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desactivar la telemetría de Next.js (establecido en todos los scripts de Next.js y en Docker)                        | `1`                        |
| `TZ`                      | Zona horaria para la aplicación                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Establecer en `false` para desactivar los requisitos de complejidad de la contraseña (mayúsculas, minúsculas, números). | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de la contraseña en caracteres (siempre aplicada)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs separados por comas de los proxies inversos permitidos para establecer `X-Forwarded-For`                   | no establecido                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Sobrescribir la bandera de habilitación de la lista de IPs permitidas del administrador (`true` / `false`)                           | no establecido (usar Configuración)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs separados por comas para la interfaz de administración                                               | no establecido                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Sobrescribir la bandera de habilitación de la lista de permitidos de la API externa (`true` / `false`)                | no establecido (usar Configuración)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por comas para `/api/upload`, `/api/summary` y `/api/lastbackup*`           | no establecido                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL base pública de la interfaz web de duplistatus (sin barra diagonal al final). Cuando se establece, sobrescribe Configuración → Resumen Diario **URL del panel público** y los correos electrónicos del Resumen Diario incluyen `{duplistatus_link}`. Cuando no está establecido, se utiliza la configuración guardada; si eso también está vacío, no se añade ningún enlace al panel. | no establecido                      |

`NEXT_TELEMETRY_DISABLED=1` se establece por la imagen de Docker y por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local` y `pnpm dev`, por lo que Next.js no recopila telemetría CLI anónima. Cuando se usa un nuevo entorno de desarrollo o se compila desde el código fuente, también persiste la opción de no participar en la configuración del usuario, ejecuta `npx next telemetry disable`.
