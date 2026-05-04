---
translation_last_updated: '2026-04-18T00:01:59.440Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: c41071b1ca07d5e1429c3ffe82eda783ae96f0bf0d8132f43f1e985f96153d9e
translation_language: es
source_file_path: documentation/docs/user-guide/settings/backup-monitoring-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
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

| Setting                         | Description                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Backup Tolerance**            | El período de gracia (tiempo extra permitido) añadido al tiempo esperado de respaldo antes de marcarlo como atrasado. El valor predeterminado es **1 hora**.                                                                                                                                                                               |
| **Backup Monitoring Interval** | Con qué frecuencia el sistema verifica la existencia de respaldos atrasados. El valor predeterminado es **5 minutos**.                                                                                                                                                                                                                   |
| **Notification Frequency**      | Con qué frecuencia enviar notificaciones de retraso: <br/> **Una vez`: Send **just one** notification when the backup becomes overdue. <br/> `Todos los días`: Send **daily** notifications while overdue (default). <br/> `Cada semana`: Send **weekly** notifications while overdue. <br/> `Cada mes**: Envía notificaciones **mensuales** mientras haya retraso. |

## Acciones disponibles {#available-actions}

| Botón                                                              | Descripción                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración de monitoreo de backup" />              | Guarda la configuración, borra temporizadores para cualquier backup deshabilitado y ejecuta una verificación de backups retrasados.                                                |
| <IconButton icon="lucide:import" label="Recopilar todo (#)"/>          | Recopila logs de backup de todos los servidores configurados, entre paréntesis el número de servidores de los que recopilar.                                   |
| <IconButton icon="lucide:download" label="Descargar CSV"/>           | Descarga un archivo CSV que contiene todas las configuraciones de monitoreo de backup y la "Marca de tiempo del último backup (BD)" de la base de datos.               |
| <IconButton icon="lucide:refresh-cw" label="Verificar ahora"/>            | Ejecuta la verificación de backup retrasado inmediatamente. Esto es útil después de cambiar configuraciones. También activa un recálculo de "Próxima ejecución". |
| <IconButton icon="lucide:timer-reset" label="Restablecer notificaciones"/> | Restablece la última notificación de backup retrasado enviada para todos los backups.                                                                            |
