# Servicio Cron {/* #cron-service */}

La aplicación incluye un servicio cron separado para gestionar tareas programadas:

## Iniciar servicio cron en modo desarrollo {/* #start-cron-service-in-development-mode */}

`pnpm dev` ya inicia el servicio cron junto con Next.js. Para ejecutar cron solo (por ejemplo en una segunda terminal):

```bash
pnpm cron:dev
```

## Iniciar servicio cron en modo producción {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Iniciar servicio cron localmente (para pruebas) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

El servicio cron se ejecuta en un puerto separado (8667 en desarrollo, 9667 en producción) y gestiona tareas programadas como Notificaciones de Copia de Seguridad vencidas. El Puerto se puede configurar mediante la variable de entorno `CRON_PORT`.

El servicio cron incluye:
- **Punto de comprobación de estado**: `/health` - Devuelve el estado del servicio y las tareas activas
- **Activación manual de tareas**: `POST /trigger/:taskName` - Ejecutar manualmente tareas programadas. La tarea `daily-summary-dispatch` se rechaza en esta ruta; utiliza Configuración → Resumen Diario **Enviar resumen ahora** en su lugar
- **Gestión de tareas**: `POST /start/:taskName` y `POST /stop/:taskName` - Controlar tareas individuales
- **Recarga de configuración**: `POST /reload-config` - Recarga la configuración desde la base de datos
- **Reinicio automático**: El servicio se reinicia automáticamente si se bloquea (administrado por `docker-entrypoint.sh` en implementaciones de Docker)
- **Modo de vigilancia**: El modo de desarrollo incluye vigilancia de archivos para reinicios automáticos en cambios de código
- **Monitoreo de copias de seguridad vencidas**: Verificación automatizada y notificación de copias de seguridad vencidas (se ejecuta cada 5 minutos de forma predeterminada)
- **Envío de resumen diario**: Envía una instantánea del estado actual una vez al día a la hora UTC de Resumen Diario almacenada (`minute hour * * *`). El valor predeterminado para nuevas instalaciones es 01:00 UTC. Cambiar la hora de envío recarga esta programación. La tarea se envía si Resumen Diario está habilitado y no vuelve a comprobar el reloj.
- **Limpieza de registro de auditoría**: Limpieza automatizada de entradas antiguas del registro de auditoría (se ejecuta diariamente a las 2 AM UTC)
- **Compactación de base de datos**: Domingo semanal 04:00 UTC. Elimina filas de copia de seguridad cuyo servidor ya no existe, filas de servidor sin copias de seguridad restantes, claves `backup_settings` y `overdue_notifications` sobrantes, depura filas antiguas de entrega de Resumen Diario y ejecuta `VACUUM` de SQLite
- **Actualización de versión de Duplicati**: Actualiza las versiones de canal de Duplicati más recientes en caché desde GitHub Releases. El valor predeterminado es diariamente a las 3 AM UTC; los administradores pueden cambiar el intervalo y la hora de inicio en [Configuración → Versiones de Duplicati](../user-guide/settings/duplicati-versions.md).
- **Programación flexible**: Expresiones cron configurables para diferentes tareas
- **Integración de base de datos**: Comparte la misma base de datos SQLite con la aplicación principal
- **API RESTful**: API completa para gestión y monitoreo del servicio
- **Vinculación local**: Escucha en `127.0.0.1` de forma predeterminada (`CRON_BIND_HOST`). Los enlaces que no son de bucle invertido requieren `CRON_SERVICE_SECRET`
