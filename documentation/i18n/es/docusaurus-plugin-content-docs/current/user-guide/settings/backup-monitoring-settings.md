---
translation_last_updated: '2026-02-15T20:57:42.166Z'
source_file_mtime: '2026-02-14T23:50:05.434Z'
source_file_hash: 2672cf118dec1a53
translation_language: es
source_file_path: user-guide/settings/backup-monitoring-settings.md
---
# Monitoreo de Backups {#backup-monitoring}

![Backup alerts](../../assets/screen-settings-monitoring.png)

## Configurar la configuración de monitoreo por backup {#configure-per-backup-monitoring-settings}

-  **Nombre del servidor**: El nombre del servidor a monitorear para detectar backups retrasados. 
   - Haga clic en <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> para abrir la interfaz web del servidor Duplicati
   - Haga clic en <IIcon2 icon="lucide:download" height="18"/> para recopilar logs de backup de este servidor.
- **Nombre de backup**: El nombre del backup a monitorear para detectar backups retrasados.
- **Próxima ejecución**: La próxima hora de backup programada se muestra en verde si está programada en el futuro, o en rojo si está retrasada. Al pasar el cursor sobre el valor "Próxima ejecución" se muestra un tooltip con la marca de tiempo del último backup de la base de datos, formateada con fecha/hora completa y tiempo relativo.
- **Monitoreo de backup**: Activar o desactivar el monitoreo de backup para este backup.
- **Intervalo de backup esperado**: El intervalo de backup esperado.
- **Unidad**: La unidad del intervalo esperado.
- **Días permitidos**: Los días de la semana permitidos para el backup.

Si los iconos al lado del nombre del servidor están atenuados, el servidor no está configurado en [Configuración → Configuración del servidor](/user-guide/settings/server-settings).

:::note
Cuando recopila logs de backup de un servidor Duplicati, **duplistatus** actualiza automáticamente los intervalos de monitoreo de backup y las configuraciones.
:::

:::tip
Para obtener los mejores resultados, recopile logs de backup después de cambiar la configuración de intervalos de trabajos de backup en su servidor Duplicati. Esto garantiza que **duplistatus** se mantenga sincronizado con su configuración actual.
:::

## Configuraciones Globales {#global-configurations}

Estas configuraciones se aplican a todas las copias de seguridad:

| Configuración                         | Descripción                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Tolerancia de backup**            | El período de gracia (tiempo extra permitido) agregado al tiempo de backup esperado antes de marcar como retrasado. El valor predeterminado es **1 hora**.                                                                                                                                                                                                             |
| **Intervalo de monitoreo de backup** | Con qué frecuencia el sistema verifica si hay backups retrasados. El valor predeterminado es **5 minutos**.                                                                                                                                                                                                                                                            |
| **Frecuencia de notificaciones**      | Con qué frecuencia enviar notificaciones de backup retrasado: <br/> **Una sola vez**: Enviar **solo una** notificación cuando el backup se retrase. <br/> `Cada día`: Enviar notificaciones **diarias** mientras esté retrasado (predeterminado). <br/> `Cada semana`: Enviar notificaciones **semanales** mientras esté retrasado. <br/> `Cada mes`: Enviar notificaciones **mensuales** mientras esté retrasado. |

## Acciones disponibles {#available-actions}

| Botón                                                              | Descripción                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración de monitoreo de backup" />              | Guarda la configuración, borra temporizadores para cualquier backup deshabilitado y ejecuta una verificación de backups retrasados.                                                |
| <IconButton icon="lucide:import" label="Recopilar todo (#)"/>          | Recopila logs de backup de todos los servidores configurados, entre paréntesis el número de servidores de los que recopilar.                                   |
| <IconButton icon="lucide:download" label="Descargar CSV"/>           | Descarga un archivo CSV que contiene todas las configuraciones de monitoreo de backup y la "Marca de tiempo del último backup (BD)" de la base de datos.               |
| <IconButton icon="lucide:refresh-cw" label="Verificar ahora"/>            | Ejecuta la verificación de backup retrasado inmediatamente. Esto es útil después de cambiar configuraciones. También activa un recálculo de "Próxima ejecución". |
| <IconButton icon="lucide:timer-reset" label="Restablecer notificaciones"/> | Restablece la última notificación de backup retrasado enviada para todos los backups.                                                                            |
