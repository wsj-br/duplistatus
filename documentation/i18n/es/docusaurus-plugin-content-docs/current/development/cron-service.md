# Servicio Cron {/* #cron-service */}

La aplicación incluye un servicio cron separado para manejar tareas programadas:

## Iniciar el servicio cron en modo de desarrollo {/* #start-cron-service-in-development-mode */}

`pnpm dev` ya inicia el servicio cron junto con Next.js. Para ejecutar cron solo (por ejemplo, en una segunda terminal):

```bash
pnpm cron:dev
```

## Iniciar el servicio cron en modo de producción {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Iniciar el servicio cron localmente (para pruebas) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

El servicio cron se ejecuta en un puerto separado (8667 en desarrollo, 9667 en producción) y gestiona tareas programadas como notificaciones de backup retrasado. El puerto se puede configurar utilizando la variable de entorno `CRON_PORT`.

El servicio cron incluye:
- **Punto de conexión de comprobación de salud**: `/health` - Devuelve el estado del servicio y las tareas activas
- **Activación manual de tareas**: `POST /trigger/:taskName` - Ejecuta manualmente las tareas programadas. La tarea `daily-summary-dispatch` se rechaza en esta ruta; usa Configuración → Resumen Diario **Enviar resumen ahora** en su lugar
- **Gestión de tareas**: `POST /start/:taskName` y `POST /stop/:taskName` - Controla las tareas individuales
- **Recarga de configuración**: `POST /reload-config` - Recargar la configuración desde la base de datos
- **Reinicio automático**: El servicio se reinicia automáticamente si falla (gestionado por `docker-entrypoint.sh` en despliegues con Docker)
- **Modo vigilancia**: El modo desarrollo incluye la vigilancia de archivos para reinicios automáticos ante cambios en el código
- **Monitoreo de respaldos atrasados**: Verificación automatizada y notificación de respaldos retrasados (se ejecuta cada 5 minutos por defecto)
- **Envío del resumen diario**: Envía una instantánea del estado actual una vez al día a la hora UTC del Resumen Diario almacenada (`minute hour * * *`). La configuración predeterminada para nuevas instalaciones es las 01:00 UTC. Cambiar la hora de envío recarga este horario. La tarea se envía si el Resumen Diario está habilitado y no vuelve a comprobar el reloj.
- **Limpieza del registro de auditoría**: Limpieza automatizada de las entradas antiguas del registro de auditoría (se ejecuta diariamente a las 2 AM UTC)
- **Compactación de la base de datos**: Domingo a las 04:00 UTC. Elimina las filas de copia de seguridad cuyo servidor ya no existe, las filas de servidor sin copias de seguridad restantes, las claves `backup_settings` y `overdue_notifications` sobrantes, poda las filas de entrega del Resumen Diario antiguas y ejecuta SQLite `VACUUM`
- **Actualización de la versión de Duplicati**: Actualiza las versiones de canal más recientes de Duplicati en caché desde GitHub Releases. La configuración predeterminada es diaria a las 3 AM UTC; los administradores pueden cambiar el intervalo y la hora de inicio en [Configuración → Versiones de Duplicati](../user-guide/settings/duplicati-versions.md).
- **Programación flexible**: Expresiones cron configurables para diferentes tareas
- **Integración de base de datos**: Comparte la misma base de datos SQLite con la aplicación principal
- **API RESTful**: API completa para la gestión y supervisión del servicio
- **Enlace local**: Escucha en `127.0.0.1` por defecto (`CRON_BIND_HOST`). Los enlaces no de bucle requieren `CRON_SERVICE_SECRET`
