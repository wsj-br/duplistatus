---
translation_last_updated: '2026-02-05T19:08:54.275Z'
source_file_mtime: '2026-02-02T19:14:50.094Z'
source_file_hash: f469b5229723b21f
translation_language: es
source_file_path: user-guide/server-details.md
---
# Detalles del Servidor {#server-details}

Al hacer clic en un servidor desde el panel de control se abre una página con una lista de backups para ese servidor. Puede ver todas las copias de seguridad o seleccionar una específica si el servidor tiene múltiples backups configurados.

![Server Details](../assets/screen-server-backup-list.png)

## Estadísticas del servidor/backup {#serverbackup-statistics}

Esta sección muestra estadísticas para todas las copias de seguridad en el servidor o un backup individual seleccionado.

- **TOTAL DE TRABAJOS DE BACKUP**: Número total de trabajos de backup configurados en este servidor.
- **TOTAL DE EJECUCIONES DE BACKUP**: Número total de ejecuciones de backup realizadas (según lo reportado por el servidor Duplicati).
- **VERSIONES DISPONIBLES**: Número de versiones disponibles (según lo reportado por el servidor Duplicati).
- **PROMEDIO DE DURACIÓN**: Duración promedio (media) de los backups registrada en la base de datos **duplistatus**.
- **TAMAÑO DEL ÚLTIMO BACKUP**: Tamaño de los archivos de origen del último registro de backup recibido.
- **ALMACENAMIENTO TOTAL USADO**: Almacenamiento usado en el destino de backup, según lo reportado en el último registro de backup.
- **TOTAL ENVIADO**: Suma de todos los datos enviados registrados en la base de datos **duplistatus**.

Si este backup o cualquiera de los backups en el servidor (cuando `All Backups` está seleccionado) está retrasado, aparece un mensaje debajo del resumen.

![Server Details - Overdue Scheduled Backups](../assets/screen-server-overdue-message.png)

Haga clic en <IconButton icon="lucide:settings" href="settings/overdue-settings" label="Configurar"/> para ir a [`Configuración → Monitoreo de Retrasados`](settings/overdue-settings.md). O haga clic en <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> en la barra de herramientas para abrir la interfaz web del servidor Duplicati y verificar los logs.

<br/>

## Historial de backups {#backup-history}

Esta tabla enumera los logs de backup para el servidor seleccionado.

![Backup History](../assets/screen-backup-history.png)

- **Nombre de backup**: El nombre del backup en el servidor Duplicati.
- **Fecha**: La marca de tiempo del backup y el tiempo transcurrido desde la última actualización de pantalla.
- **Estado**: El estado del backup (Éxito, Advertencia, Error, Fatal).
- **Advertencias/Errores**: El número de advertencias/errores reportados en el registro del backup.
- **Versiones disponibles**: El número de versiones de backup disponibles en el destino del backup. Si el icono está deshabilitado, no se recibió información detallada.
- **Cantidad de archivos, Tamaño de archivos, Tamaño cargado, Duración, Tamaño de almacenamiento**: Valores según lo reportado por el servidor Duplicati.

:::tip Consejos
• Utilice el menú desplegable en la sección **Historial de backups** para seleccionar `todas las copias de seguridad` o un backup específico para este servidor.

• Puede ordenar cualquier columna haciendo clic en su encabezado; haga clic nuevamente para invertir el orden de clasificación.
 
• Haga clic en cualquier lugar de una fila para ver los [Detalles del backup](#backup-details).

::: 

:::note
Cuándo se selecciona `todas las copias de seguridad`, la lista muestra todos los backups ordenados de más reciente a más antiguo por defecto.
:::

<br/>

## Detalles del backup {#backup-details}

Al hacer clic en una insignia de estado en el panel de control (vista de tabla) o en cualquier fila de la tabla del historial de backups se muestra la información detallada del backup.

![Backup Details](../assets/screen-backup-detail.png)

- **Detalles del servidor**: nombre del servidor, alias y nota.
- **Información del backup**: la marca de tiempo del backup y su ID.
- **Estadísticas del backup**: un resumen de los contadores, tamaños y duración reportados.
- **Resumen del registro**: el número de mensajes reportados.
- **Versiones disponibles**: una lista de versiones disponibles (solo se muestra si la información se recibió en los logs).
- **Mensajes/Advertencias/Errores**: los logs de ejecución completos. El subtítulo indica si el log fue truncado por el servidor de Duplicati.

<br/>

:::note
Consulte las [instrucciones de Configuración de Duplicati](../installation/duplicati-server-configuration.md) para aprender cómo configurar el servidor de Duplicati para enviar logs de ejecución completos y evitar truncamiento.
:::
