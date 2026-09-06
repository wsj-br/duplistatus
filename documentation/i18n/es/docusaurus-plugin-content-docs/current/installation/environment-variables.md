# Variables de Entorno {#environment-variables}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                                                                 | Por defecto                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Puerto para la aplicación web principal                                                     | `9666`                     |
| `CRON_PORT`               | Puerto para el servicio cron (programación). Si no se establece, utiliza `PORT + 1`                      | `9667`                     |
| `CRON_BIND_HOST`          | Dirección en la que escucha el servicio cron. El bucle de retroalimentación es la predeterminada, por lo que la API de control no está expuesta.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Secreto compartido requerido para mutar rutas del servicio cron cuando el servicio no está vinculado al bucle de retroalimentación. El proxy de Next.js lo reenvía como `X-Cron-Service-Secret`. | sin configurar (requerido si no es bucle de retroalimentación) |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deshabilitar la telemetría de Next.js (configurado en todos los scripts de Next.js y en Docker) | `1`                        |
| `TZ`                      | Zona horaria para la aplicación                                                             | `Europe/London`            |
| `PWD_ENFORCE`             | Establecer como `false` para desactivar los requisitos de complejidad de contraseña (mayúsculas, minúsculas, números). | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de la contraseña en caracteres (siempre aplicado)                           | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs separados por comas de los servidores proxy inversos permitidos para establecer `X-Forwarded-For`                   | sin configurar                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Anular la bandera de habilitación de la lista de IPs permitidas del administrador (`true` / `false`)                           | sin configurar (usar Configuración)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs separados por comas para la interfaz de administración                                               | sin configurar                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Anular la bandera de habilitación de la lista de IPs permitidas de la API externa (`true` / `false`)                | sin configurar (usar Configuración)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por comas para `/api/upload`, `/api/summary`, y `/api/lastbackup*`           | sin configurar                      |

`NEXT_TELEMETRY_DISABLED=1` está configurado por la imagen de Docker y por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, y `pnpm dev`, por lo que Next.js no recopila telemetría CLI anónima. Para persistir la opción de no participación en su configuración de usuario, ejecute `npx next telemetry disable`.
