# Panel de control {#dashboard}

## Panel de control {#dashboard-summary}

Esta sección muestra estadísticas agregadas para todas las copias de seguridad.

![Resumen del panel de control - resumen](../assets/screen-dashboard-summary.png)
![Resumen del panel de control - tabla](../assets/screen-dashboard-summary-table.png)

- **Total Servidores**: El número de servidores que se están supervisando.                                                                                                             
- **Total Trabajos de Respaldo**: El número total de trabajos de respaldo (tipos) configurados para todos los servidores.                                                                                
- **Total Ejecuciones de Respaldo**: El número total de registros de respaldo de ejecuciones recibidos o recopilados para todos los servidores.                                                                   
- **Tamaño Total de Respaldo**: El tamaño combinado de todos los datos de origen, basado en los últimos registros de respaldo recibidos.                                                                    
- **Almacenamiento Total Usado**: El espacio total de almacenamiento utilizado por las copias de seguridad en el destino de respaldo (por ejemplo, almacenamiento en la nube, servidor FTP, unidad local), basado en los últimos registros de respaldo recibidos. 
- **Tamaño Total Subido**: La cantidad total de datos subidos desde el servidor Duplicati al destino (por ejemplo, almacenamiento local, FTP, proveedor en la nube).                       
- **Respaldos Atrasados** (tabla): El número de respaldos que están retrasados. Consulte [Configuración de notificaciones de copia de seguridad](settings/backup-notifications-settings.md)                          
- **Alternar diseño**: Cambia entre el diseño de Tarjetas (por defecto) y el diseño de Tabla.

:::tip ¿Ve servidores duplicados?
Si el mismo servidor aparece más de una vez en el panel de control, use [Configuración → Mantenimiento de base de datos → Combinar servidores duplicados](settings/database-maintenance.md#merge-duplicate-servers) para consolidarlos. Los duplicados pueden ocurrir cuando reinstala o actualiza Duplicati, ya que el `machine_id` del servidor puede cambiar y **duplistatus** entonces lo trata como un servidor nuevo.
:::

## Filtrado de servidores {#server-filtering}

Puede filtrar los servidores y backups mostrados en el panel de control utilizando el campo de búsqueda en la barra de herramientas de la aplicación. Haga clic en el icono de filtro <IconButton icon="lucide:search" /> para mostrar el campo de búsqueda.

**Coincidencias de filtro:**
- ID del servidor
- URL del servidor
- Nombres de trabajos de copia de seguridad

**Alcance:**
- Filtra tanto la vista de tarjetas como la vista de tabla en el panel
- El estado de la sesión se mantiene a través del Proveedor de Filtro de Servidores del Panel
- Se borra cuando actualiza o sale del panel

Esto facilita la localización rápida de servidores o copias de seguridad específicos entre muchos sistemas monitoreados.

## Diseño de Tarjetas {#cards-layout}

El diseño de tarjetas muestra el estado del registro de backup más reciente recibido para cada backup.

![Diseño de tarjetas](../assets/duplistatus_dash-cards.svg)

- **Nombre del servidor**: Nombre del servidor Duplicati (o el Alias)
  - Al pasar el ratón sobre el **Nombre del servidor** se mostrará el nombre del servidor y una nota
- **Estado general**: El estado del servidor. Las copias de seguridad pendientes se mostrarán con un estado de **Advertencia**
- **Versión**: La versión de Duplicati del último registro de copia de seguridad, que se muestra a la izquierda del indicador de estado. Consulte [Versión del servidor Duplicati](#duplicati-server-version).
- **Información de resumen**: El número consolidado de archivos, el tamaño y el Alm. utilizado para todas las copias de seguridad de este servidor. También muestra el tiempo transcurrido de la copia de seguridad más reciente recibida (pase el ratón por encima para mostrar la marca de tiempo)
- **Lista de copias de seguridad**: Una tabla con todas las copias de seguridad configuradas para este servidor, con 3 columnas:
  - **Nombre de copia de seguridad**: Nombre de la copia de seguridad en el servidor Duplicati
  - **Historial de estado**: Estado de las últimas 10 copias de seguridad recibidas.
  - **Última copia de seguridad recibida**: El tiempo transcurrido desde la hora actual del último registro recibido. Mostrará un icono de advertencia si la copia de seguridad está vencida.
    - El tiempo se muestra en formato abreviado: `m` para minutos, `h` para horas, `d` para días, `w` para semanas, `mo` para meses, `y` para años.

El orden de clasificación de las tarjetas y otras configuraciones se pueden establecer en la [Configuración de pantalla](settings/display-settings.md).

La vista de panel ofrece dos pantallas informativas, accesibles haciendo clic en el botón de la esquina superior derecha del panel lateral:

- Estado: Mostrar estadísticas de los trabajos de backup por estado, con una lista de backups retrasados y trabajos de backup con estado de advertencias/errores.

![panel de estado](../assets/screen-overview-side-status.png)

- Métricas: Mostrar gráficos con Duración, Tamaño de archivos y Tamaño de almacenamiento a lo largo del tiempo para el Servidor agregado o seleccionado.

![panel de gráficos](../assets/screen-overview-side-charts.png)

### Detalles del backup {#backup-details}

Al pasar el cursor sobre un backup en la lista se muestran los detalles del último registro de backup recibido y cualquier información retrasada.

![Detalles de Vencimiento](../assets/screen-backup-tooltip.png)

- **Nombre del servidor : Respaldo**: El nombre o alias del servidor Duplicati y del respaldo; también mostrará el nombre del servidor y la nota.
  - El alias y la nota se pueden configurar en [Configuración → Configuración del servidor](settings/server-settings.md).
- **Notificaciones**: Un icono que muestra la [configuración de notificación](#notifications-icons) establecida para nuevos registros de respaldo.
- **Fecha**: La marca de tiempo del respaldo y el tiempo transcurrido desde la última actualización de pantalla.
- **Estado**: El estado del último respaldo recibido (Éxito, Advertencia, Error, Fatal).
- **Duración, Cantidad de archivos, Tamaño del archivo, Tamaño de almacenamiento, Tamaño subido**: Valores informados por el servidor Duplicati.
- **Versiones disponibles**: El número de versiones de respaldo almacenadas en el destino de respaldo en el momento del respaldo.

Si este backup está retrasado, la información sobre herramientas también muestra:

- **Backup esperado**: La hora en que se esperaba el backup, incluido el período de gracia configurado (tiempo adicional permitido antes de marcar como retrasado).

También puede hacer clic en los botones en la parte inferior para abrir [Configuración → Notificaciones de backup](settings/backup-notifications-settings.md) para configurar los ajustes de monitoreo o abrir la interfaz web del servidor Duplicati.

## Diseño de Tabla {#table-layout}

La disposición de la tabla enumera los logs de backup más recientes recibidos para todos los servidores y backups.

![Modo de tabla del panel de control](../assets/screen-main-dashboard-table-mode.png)

- **Nombre del servidor**: El nombre del servidor Duplicati (o Alias)
  - Debajo del nombre se encuentra la nota del servidor
- **Nombre de copia de seguridad**: El nombre de la copia de seguridad en el servidor Duplicati.
- **Versión**: La versión de Duplicati del último registro de copia de seguridad para ese trabajo de copia de seguridad. Consulte [Versión del servidor Duplicati](#duplicati-server-version).
- **Versiones disponibles**: El número de versiones de copia de seguridad almacenadas en el destino de la copia de seguridad. Si el icono está atenuado, no se recibió información detallada en el registro. Consulte las [instrucciones de Configuración de Duplicati](../installation/duplicati-server-configuration.md) para obtener más detalles.
- **Número de copias de seguridad**: El número de copias de seguridad reportadas por el servidor Duplicati.
- **Fecha de última copia de seguridad**: La marca de tiempo del último registro de copia de seguridad recibido y el tiempo transcurrido desde la última actualización de la pantalla.
- **Estado de última copia de seguridad**: El estado de la última copia de seguridad recibida (Éxito, Advertencia, Error, Fatal).
- **Duración**: La duración de la copia de seguridad en HH:MM:SS.
- **Advertencias/Errores**: El número de advertencias y errores reportados en el registro de la copia de seguridad, mostrado como `warnings/errors` (por ejemplo `0/0`).
- **Configuración**:
  - **Notificación**: Un icono que muestra la configuración de notificación establecida para los nuevos registros de copia de seguridad.
  - **Configuración de Duplicati**: Un botón para abrir la interfaz web del servidor Duplicati

Puede utilizar la [Configuración de pantalla](settings/display-settings.md) para configurar el tamaño de la tabla y otras configuraciones.

### Iconos de Notificaciones {#notifications-icons}

| Icono                                                                                                                              | Opción de notificación | Descripción                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Apagado                 | No se enviarán notificaciones cuando se reciba un nuevo registro de respaldo                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Todo                 | Se enviarán notificaciones para cada nuevo registro de respaldo, independientemente de su estado.                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Advertencias            | Se enviarán notificaciones solo para registros de respaldo con un estado de Advertencia, Desconocido, Error o Fatal. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Errores              | Se enviarán notificaciones solo para registros de respaldo con un estado de Error o Fatal.                    |

:::note
Esta configuración de notificación solo se aplica cuando **duplistatus** recibe un nuevo registro de backup de un servidor Duplicati. Las notificaciones de backup retrasado se configuran por separado y se enviarán independientemente de esta configuración.
:::

### Detalles de retrasos {#overdue-details}

Al pasar el cursor sobre el icono de advertencia de backup retrasado se muestran los detalles acerca del backup retrasado.

![Detalles de Vencimiento](../assets/screen-overdue-backup-hover-card.png)

- **Verificado**: Cuándo se realizó la última verificación retrasada. Configure la frecuencia en [Configuración de Notificaciones de backup](settings/backup-notifications-settings.md).
- **Último backup**: Cuándo se recibió el último registro de backup.
- **Backup esperado**: La hora en que se esperaba el backup, incluido el período de gracia configurado (tiempo adicional permitido antes de marcar como retrasado).
- **Última notificación**: Cuándo se envió la última notificación de retrasado.

## Versión del servidor Duplicati {#duplicati-server-version}

El panel de control muestra la versión de Duplicati reportada en el último registro de copia de seguridad para cada servidor (vista de tarjetas) o trabajo de copia de seguridad (vista de tabla).

- **Dónde aparece**: A la izquierda del indicador de estado en las tarjetas, y en la columna **Versión** de la tabla (después de **Pendiente / Próxima ejecución**).
- **Color**: El texto atenuado significa que la versión coincide con el último lanzamiento para ese canal (o que la comparación no está disponible). El amarillo de advertencia significa que la versión es anterior al último lanzamiento para ese canal.
- **Información sobre herramientas**: Pase el ratón o haga clic en el número de versión para ver el canal de actualización (`stable`, `beta`, `experimental` o `canary`), la versión del servidor y la última versión disponible para ese canal.

**duplistatus** compara la versión del registro de copia de seguridad con los últimos lanzamientos de Duplicati publicados en GitHub. Las últimas versiones por canal se actualizan una vez al día (y al iniciar si la caché es anterior a 24 horas).

:::important
**duplistatus** no consulta al servidor Duplicati para obtener la versión que se está ejecutando actualmente. Utiliza la versión almacenada en el último registro de copia de seguridad que fue recibido o [Recopilado](collect-backup-logs.md). Después de actualizar Duplicati, el panel de control seguirá mostrando la versión anterior hasta que llegue un nuevo registro de copia de seguridad.
:::

### Versiones de backup disponibles {#available-backup-versions}

Al hacer clic en el icono de reloj azul se abre una lista de versiones de backup disponibles en el momento del backup, según lo reportado por el Servidor Duplicati.

![Versiones disponibles](../assets/screen-available-backups-modal.png)

- **Detalles del backup**: Muestra el nombre del servidor y alias, nota del servidor, nombre de backup, y cuándo se ejecutó el backup.
- **Detalles de versión**: Muestra el número de versión, fecha de creación, y antigüedad.

:::note
Si el icono está atenuado, significa que no se recibió información detallada en los logs de mensajes.
Consulte las [instrucciones de Configuración de Duplicati](../installation/duplicati-server-configuration.md) para obtener más detalles.
:::
