---
translation_last_updated: '2026-01-31T00:51:26.405Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: a4aa296b36d4dd44
translation_language: es
source_file_path: development/cron-service.md
---
# Servicio Cron {#cron-service}

La aplicación incluye un servicio cron separado para gestionar tareas programadas:

## Iniciar servicio cron en modo de desarrollo {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## Iniciar servicio cron en modo de producción {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## Iniciar servicio cron localmente (para pruebas) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

El servicio cron se ejecuta en un puerto separado (8667 en desarrollo, 9667 en producción) y gestiona tareas programadas como notificaciones de backup retrasado. El puerto se puede configurar utilizando la variable de entorno `CRON_PORT`.

El servicio cron incluye:
- **Endpoint de verificación de salud**: `/health` - Devuelve el estado del servicio y las tareas activas
- **Activación manual de tareas**: `POST /trigger/:taskName` - Ejecutar manualmente tareas programadas
- **Gestión de tareas**: `POST /start/:taskName` y `POST /stop/:taskName` - Controlar tareas individuales
- **Recarga de configuración**: `POST /reload-config` - Recargar la configuración desde la base de datos
- **Reinicio automático**: El servicio se reinicia automáticamente si falla (gestionado por `duplistatus-cron.sh`)
- **Modo de vigilancia**: El modo de desarrollo incluye vigilancia de archivos para reiniciar automáticamente ante cambios de código
- **Monitoreo de backups retrasados**: Verificación automatizada y notificación de backups retrasados (se ejecuta cada 5 minutos por defecto)
- **Limpieza del Log de Auditoría**: Limpieza automatizada de entradas antiguas del Log de Auditoría (se ejecuta diariamente a las 2 AM UTC)
- **Programación flexible**: Expresiones cron configurables para diferentes tareas
- **Integración de base de datos**: Comparte la misma base de datos SQLite con la aplicación principal
- **API RESTful**: API completa para la gestión y monitoreo del servicio
