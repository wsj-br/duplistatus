# Variables de Entorno {#environment-variables}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                                                                 | Por defecto                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Puerto para la aplicación web principal                                                     | `9666`                     |
| `CRON_PORT`               | Puerto para el servicio cron (programación). Si no se establece, utiliza `PORT + 1`                      | `9667`                     |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Deshabilitar la telemetría de Next.js (configurado en todos los scripts de Next.js y en Docker) | `1`                        |
| `TZ`                      | Zona horaria para la aplicación                                                             | `Europe/London`            |
| `PWD_ENFORCE`             | Establecer como `false` para desactivar los requisitos de complejidad de contraseña (mayúsculas, minúsculas, números). | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de la contraseña en caracteres (siempre aplicado)                           | `8`                        |

`NEXT_TELEMETRY_DISABLED=1` está configurado por la imagen de Docker y por `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, y `pnpm dev`, por lo que Next.js no recopila telemetría CLI anónima. Para persistir la opción de no participación en su configuración de usuario, ejecute `npx next telemetry disable`.
