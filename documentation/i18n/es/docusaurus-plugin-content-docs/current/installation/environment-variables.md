# Variables de entorno {/* #environment-variables */}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                                                                 | Predeterminada                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Puerto para la aplicación web principal                                                           | `9666`                     |
| `CRON_PORT`               | Puerto para el servicio cron (programación). Si no se establece, utiliza `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Dirección en la que escucha el servicio cron. El bucle local es el valor predeterminado para que la API de control no esté expuesta.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Secreto compartido necesario para mutar rutas del servicio cron cuando el servicio no está enlazado al bucle local. El proxy de Next.js lo reenvía como `X-Cron-Service-Secret`. | no establecido (requerido si no es bucle local) |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Desactivar telemetría de Next.js (establecido en todos los scripts de Next.js y en Docker)                        | `1`                        |
| `TZ`                      | Zona horaria para la aplicación                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Establecer en `false` para deshabilitar los requisitos de complejidad de contraseña (mayúsculas, minúsculas, números). | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de contraseña en caracteres (siempre aplicado)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | Lista separada por comas de CIDR de proxies inversos permitidos para establecer `X-Forwarded-For`                   | no establecido                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Anular el indicador de activación de la lista de IPs permitidas del administrador (`true` / `false`)                           | no establecido (usar Configuración)       |
| `ADMIN_IP_ALLOWLIST`      | Lista separada por comas de CIDR para la interfaz de administración                                               | no establecido                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Anular el indicador de activación de la lista permitida de la API externa (`true` / `false`)                | no establecido (usar Configuración)       |
| `EXTERNAL_API_IP_ALLOWLIST` | Lista separada por comas de CIDR para `/api/upload`, `/api/summary`, y `/api/lastbackup*`           | no establecido                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL base pública de la interfaz web de duplistatus (sin barra final). Cuando se establece, anula Configuración → Resumen Diario **URL del panel público** y los correos electrónicos del Resumen Diario incluyen `{duplistatus_link}`. Cuando no se establece, se utiliza la configuración guardada; si también está vacía, no se agrega ningún enlace al panel. | no establecido                      |

`NEXT_TELEMETRY_DISABLED=1` está establecido por la imagen de Docker y por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, y `pnpm dev`, por lo que Next.js no recopila telemetría CLI anónima. Al usar un nuevo entorno de desarrollo o compilar desde el código fuente, también persista la exclusión en su configuración de usuario, ejecute `npx next telemetry disable`.
