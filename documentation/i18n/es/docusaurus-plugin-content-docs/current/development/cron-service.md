---
translation_last_updated: '2026-04-18T00:01:13.239Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: d96b8a208e1a506c80e1a45e3190044bd8a8d6b789fda92a5bc3d91cec00ef2f
translation_language: es
source_file_path: documentation/docs/development/cron-service.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
---
# Servicio Cron {#cron-service}

La aplicación incluye un servicio cron separado para manejar tareas programadas:

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

El servicio de cron incluye:
- **Punto de verificación de salud**: `/health` - Devuelve el estado del servicio y las tareas activas
- **Activación manual de tareas**: `POST /trigger/:taskName` - Ejecutar manualmente tareas programadas
- **Gestión de tareas**: `POST /start/:taskName` y `POST /stop/:taskName` - Controlar tareas individuales
- **Recarga de configuración**: `POST /reload-config` - Recargar configuración desde la base de datos
- **Reinicio automático**: El servicio se reinicia automáticamente si falla (gestionado por `docker-entrypoint.sh` en despliegues de Docker)
- **Modo de observación**: El modo de desarrollo incluye la observación de archivos para reinicios automáticos al cambiar el código
- **Monitoreo de backups retrasados**: Verificación y notificación automatizada de backups retrasados (se ejecuta cada 5 minutos por defecto)
- **Limpieza de log de auditoría**: Limpieza automatizada de entradas antiguas del log de auditoría (se ejecuta diariamente a las 2 AM UTC)
- **Programación flexible**: Expresiones cron configurables para diferentes tareas
- **Integración de base de datos**: Comparte la misma base de datos SQLite con la aplicación principal
- **API RESTful**: API completa para gestión y monitoreo del servicio
