---
translation_last_updated: '2026-01-31T00:51:29.204Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: bc396f3559d5e9a0
translation_language: es
source_file_path: user-guide/settings/overdue-settings.md
---
# Notificaciones Retrasadas {#overdue-notifications}

![Backup alerts](../../assets/screen-settings-overdue.png)

## Configurar Configuración de Backup Retrasado por Backup {#configure-per-backup-overdue-settings}

-  **Nombre del servidor**: El nombre del servidor a monitorear para backups retrasados. 
   - Haga clic en <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> para abrir la interfaz web del servidor Duplicati
   - Haga clic en <IIcon2 icon="lucide:download" height="18"/> para recopilar logs de backup de este servidor.
- **Nombre de backup**: El nombre del backup a monitorear para backups retrasados.
- **Próxima ejecución**: La próxima hora de backup programada se muestra en verde si está programada en el futuro, o en rojo si está retrasada. Al pasar el cursor sobre el valor "Próxima ejecución" se muestra un tooltip que indica la marca de tiempo del último backup de la base de datos, formateado con fecha/hora completa y tiempo relativo.
- **Monitoreo de backups retrasados**: Activar o desactivar el monitoreo de backups retrasados para este backup.
- **Intervalo de backup esperado**: El intervalo de backup esperado.
- **Unidad**: La unidad del intervalo esperado.
- **Días permitidos**: Los días de la semana permitidos para el backup.

Si los iconos al lado del Nombre del servidor están atenuados, el servidor no está configurado en la [`Configuración → Configuración del servidor`](server-settings.md).

:::note
Cuándo recopila logs de backup desde un servidor Duplicati, **duplistatus** actualiza automáticamente los intervalos de monitoreo de backups retrasados y las configuraciones.
:::

:::tip
Para obtener los mejores resultados, recopile logs de backup después de cambiar la configuración de intervalos de trabajos de backup en su Servidor Duplicati. Esto garantiza que **duplistatus** se mantenga sincronizado con su configuración actual.
:::

## Configuraciones Globales {#global-configurations}

Estas configuraciones se aplican a todas las copias de seguridad:

| Configuración                          | Descripción                                                                                                                                                                                                                                                                                           |
|:---------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Tolerancia de retraso**              | El período de gracia (tiempo adicional permitido) agregado al tiempo de backup esperado antes de marcar como retrasado. Por defecto es `1 hora`.                                                                                                                                                       |
| **Intervalo de monitoreo de backups retrasados** | Con qué frecuencia el sistema verifica si hay backups retrasados. Por defecto es `5 minutos`.                                                                                                                                                                                                        |
| **Frecuencia de notificaciones**       | Con qué frecuencia enviar notificaciones de backups retrasados: <br/> `Una sola vez`: Enviar **una única** notificación cuando el backup se retrase. <br/> `Cada día`: Enviar notificaciones **diarias** mientras esté retrasado (por defecto). <br/> `Cada semana`: Enviar notificaciones **semanales** mientras esté retrasado. <br/> `Cada mes`: Enviar notificaciones **mensuales** mientras esté retrasado. |

## Acciones disponibles {#available-actions}

| Botón                                                               | Descripción                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración de monitoreo de backups retrasados" />             | Guarda la configuración, borra los temporizadores para cualquier backup deshabilitado y ejecuta una verificación de backups retrasados.              |
| <IconButton icon="lucide:import" label="Recopilar todo (#)"/>          | Recopila logs de backup de todos los servidores configurados, entre paréntesis el número de servidores desde los que se recopilará. |
| <IconButton icon="lucide:download" label="Descargar CSV"/>            | Descarga un archivo CSV que contiene todas las configuraciones de monitoreo de backups retrasados y la "Marca de tiempo del último backup (BD)" de la base de datos. |
| <IconButton icon="lucide:refresh-cw" label="Verificar ahora"/>            | Ejecuta la verificación de backups retrasados inmediatamente. Esto es útil después de cambiar configuraciones. También activa un recálculo de "Próxima ejecución". |
| <IconButton icon="lucide:timer-reset" label="Restablecer notificaciones"/> | Restablece la última notificación de backup retrasado enviada para todos los backups.                                          |
