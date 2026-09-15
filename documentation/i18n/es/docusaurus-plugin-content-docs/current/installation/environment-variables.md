# Variables de Entorno {/* #environment-variables */}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                                                                 | Predeterminada                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Puerto para la aplicación web principal                                                           | `9666`                     |
| `CRON_PORT`               | Puerto para el servicio cron (programación). Si no se establece, usa `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Dirección a la que escucha el servicio cron. La dirección de loopback es la predeterminada, por lo que la API de control no está expuesta.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Secreto compartido requerido para mutar rutas del servicio cron cuando el servicio no está vinculado a loopback. El proxy de Next.js lo reenvía como `X-Cron-Service-Secret`. | no establecido (requerido si no es loopback) |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desactivar la telemetría de Next.js (establecer en todos los scripts de Next.js y en Docker)                        | `1`                        |
| `TZ`                      | Zona horaria para la aplicación                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Establecer en `false` para desactivar los requisitos de complejidad de contraseña (mayúsculas, minúsculas, números). | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de la contraseña en caracteres (siempre aplicado)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs separados por comas de los proxies inversos permitidos para establecer `X-Forwarded-For`                   | no establecido                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Anular la bandera de activación de la lista de IPs permitidas de la interfaz de administración (`true` / `false`)                           | no establecido (usar Configuración)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs separados por comas para la interfaz de administración                                               | no establecido                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Anular la bandera de activación de la lista de IPs permitidas de la API externa (`true` / `false`)                | no establecido (usar Configuración)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por comas para `/api/upload`, `/api/summary`, y `/api/lastbackup*`           | no establecido                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL base pública de la interfaz web de duplistatus (sin barra final). Cuando se establece, anula Configuración → Resumen Diario **URL del panel público** y los correos electrónicos del Resumen Diario incluyen `{duplistatus_link}`. Cuando no se establece, se usa la configuración guardada; si también está vacía, no se agrega ningún enlace al panel. | no establecido                      |

`NEXT_TELEMETRY_DISABLED=1` está establecido por la imagen de Docker y por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, y `pnpm dev`, por lo que Next.js no recopila telemetría CLI anónima. Al usar un nuevo entorno de desarrollo o compilar desde el código fuente, también persista la opción de no participación en tu configuración de usuario y ejecuta `npx next telemetry disable`.
