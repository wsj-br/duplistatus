# Servicio Cron {/* #cron-service */}

La aplicación incluye un servicio cron separado para manejar tareas programadas:

## Iniciar el servicio cron en modo desarrollo {/* #start-cron-service-in-development-mode */}

`pnpm dev` ya inicia el servicio cron junto con Next.js. Para ejecutar cron por separado (por ejemplo, en una segunda terminal):

```bash
pnpm cron:dev
```

## Iniciar el servicio cron en modo producción {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Iniciar el servicio cron localmente (para pruebas) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

El servicio cron se ejecuta en un puerto separado (8667 en desarrollo, 9667 en producción) y maneja tareas programadas como notificaciones de copias de seguridad vencidas. El puerto se puede configurar usando la variable de entorno `CRON_PORT`.

El servicio cron incluye:
- **Punto de verificación de salud**: `/health` - Devuelve el estado del servicio y las tareas activas
- **Activación manual de tareas**: `POST /trigger/:taskName` - Ejecutar manualmente tareas programadas. La tarea `daily-summary-dispatch` se rechaza en esta ruta; use Configuración → Resumen Diario **Enviar resumen ahora** en su lugar
- **Gestión de tareas**: `POST /start/:taskName` y `POST /stop/:taskName` - Controlar tareas individuales
- **Recarga de configuración**: `POST /reload-config` - Recargar la configuración desde la base de datos
- **Reinicio automático**: El servicio se reinicia automáticamente si se produce un fallo (gestionado por `docker-entrypoint.sh` en despliegues de Docker)
- **Modo de observación**: El modo desarrollo incluye la observación de archivos para reinicios automáticos en cambios de código
- **Monitoreo de copias de seguridad vencidas**: Comprobación y notificación automáticas de copias de seguridad vencidas (se ejecuta cada 5 minutos por defecto)
- **Envío de resumen diario**: Envía una instantánea del estado actual una vez al día a la hora UTC almacenada para el Resumen Diario (`minute hour * * *`). El valor predeterminado para nuevas instalaciones es las 01:00 UTC. Cambiar la hora de envío recarga este horario. La tarea se envía si el Resumen Diario está habilitado y no vuelve a comprobar el reloj.
- **Limpieza del registro de auditoría**: Limpieza automática de entradas antiguas del registro de auditoría (se ejecuta diariamente a las 2 AM UTC)
- **Compactación de la base de datos**: Domingo a las 04:00 UTC. Elimina filas de copia de seguridad cuyo servidor ya no existe, filas de servidor sin copias de seguridad restantes, claves `backup_settings` y `overdue_notifications` sobrantes, poda de filas de entrega de Resumen Diario antiguas y ejecuta SQLite `VACUUM`
- **Actualización de la versión de Duplicati**: Actualiza las versiones más recientes de los canales de Duplicati almacenadas en caché desde GitHub Releases. El valor predeterminado es diario a las 3 AM UTC; los administradores pueden cambiar el intervalo y la hora de inicio en [Configuración → Versiones de Duplicati](../user-guide/settings/duplicati-versions.md).
- **Programación flexible**: Expresiones cron configurables para diferentes tareas
- **Integración con la base de datos**: Comparte la misma base de datos SQLite con la aplicación principal
- **API RESTful**: API completa para la gestión y el monitoreo del servicio
- **Enlace local**: Escucha en `127.0.0.1` por defecto (`CRON_BIND_HOST`). Los enlaces no de bucle de retorno requieren `CRON_SERVICE_SECRET`
