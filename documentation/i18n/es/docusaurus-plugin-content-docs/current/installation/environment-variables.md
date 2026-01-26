# Variables de Entorno {#environment-variables}

La aplicación admite las siguientes variables de entorno para la configuración:

| Variable                  | Descripción                                                                                                                                                                                                   | Por defecto                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| `PORT`                    | Puerto para la aplicación web principal                                                                                                                                                                       | `9666`                                            |
| `CRON_PORT`               | Puerto para el servicio cron. Si no está establecido, utiliza `PORT + 1`                                                                                                                      | `9667`                                            |
| `NODE_ENV`                | Entorno de Node.js (`development` o `production`)                                                                                                                          | `production`                                      |
| `NEXT_TELEMETRY_DISABLED` | Desactivar telemetría de Next.js                                                                                                                                                              | `1`                                               |
| `TZ`                      | Zona horaria para la aplicación                                                                                                                                                                               | `Europe/London`                                   |
| `LANG`                    | Configuración regional para la aplicación (p. ej., `en_US`, `pt_BR`)                                                                                       | `en_GB`                                           |
| `PWD_ENFORCE`             | Establezca en `false` para desactivar los requisitos de complejidad de contraseña (mayúsculas, minúsculas, números). La longitud mínima siempre se aplica. | Aplicado (validación completa) |
| `PWD_MIN_LEN`             | Longitud mínima de contraseña en caracteres                                                                                                                                                                   | `8`                                               |

