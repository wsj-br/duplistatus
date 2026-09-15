# Panel de control {/* #dashboard */}

## Resumen del panel de control {/* #dashboard-summary */}

Esta sección muestra estadísticas agregadas para todas las copias de seguridad.

![Resumen del panel de control - vista general](../assets/screen-dashboard-summary.png)
![Resumen del panel de control - tabla](../assets/screen-dashboard-summary-table.png)

- **Total de servidores**: El número de servidores que están siendo monitoreados.                                                                                                             
- **Total de trabajos de copia de seguridad**: El número total de trabajos de copia de seguridad (tipos) configurados para todos los servidores.                                                                                
- **Total de ejecuciones de copia de seguridad**: El número total de registros de copia de seguridad de ejecuciones recibidas o recopiladas para todos los servidores.                                                                   
- **Tamaño total de copia de seguridad**: El tamaño combinado de todos los datos de origen, basado en los últimos registros de copia de seguridad recibidos.                                                                    
- **Almacenamiento total usado**: El espacio de almacenamiento total usado por las copias de seguridad en el destino de copia de seguridad (por ejemplo, almacenamiento en la nube, servidor FTP, unidad local), basado en los últimos registros de copia de seguridad.                
- **Tamaño total cargado**: La cantidad total de datos cargados desde el servidor Duplicati al destino (por ejemplo, almacenamiento local, FTP, proveedor de nube).                                       
- **Copias de seguridad pendientes** (tabla): El número de copias de seguridad que están pendientes. Ver [Configuración de notificaciones de copia de seguridad](settings/backup-notifications-settings.md)                          
- **Alternar diseño**: Cambia entre el diseño de Tarjetas (predeterminado) y el diseño de Tabla.

:::tip ¿Viendo servidores duplicados?
Si el mismo servidor aparece más de una vez en el panel de control, usa [Configuración → Mantenimiento de base de datos → Combinar servidores duplicados](settings/database-maintenance.md#merge-duplicate-servers) para consolidarlos. Los duplicados pueden ocurrir cuando reinstalas o actualizas Duplicati, porque el `machine_id` del servidor puede cambiar y **duplistatus** lo trata como un nuevo servidor.
:::

## Filtrado de servidores {/* #server-filtering */}

Puedes filtrar los servidores y las copias de seguridad mostradas en el panel de control usando el campo de búsqueda en la barra de herramientas de la aplicación. Haz clic en el icono de filtro <IconButton icon="lucide:search" /> para revelar el campo de búsqueda.

**Coincidencias de filtro:**
- ID del servidor
- URL del servidor
- Nombres de trabajos de copia de seguridad

**Ámbito:**
- Filtra tanto las vistas de tarjetas como de tabla en el panel de control
- El estado de la sesión se mantiene a través del Proveedor de Filtro de Servidores del Panel de Control
- Se borra cuando actualizas o sales del panel de control

Esto facilita la ubicación rápida de servidores o copias de seguridad específicas entre muchos sistemas monitoreados.

## Diseño de tarjetas {/* #cards-layout */}

El diseño de tarjetas muestra el estado del último registro de copia de seguridad recibido para cada copia de seguridad.

![Diseño de tarjetas](../assets/duplistatus_dash-cards.svg)

- **Nombre del servidor**: Nombre del servidor Duplicati (o el alias)
  - Al pasar el cursor sobre el **Nombre del servidor**, se mostrará el nombre del servidor y la nota
- **Estado general**: El estado del servidor. Las copias de seguridad pendientes se mostrarán como un estado de **Advertencia**
- **Versión**: La versión de Duplicati del último registro de copia de seguridad, mostrada a la izquierda del indicador de estado. Ver [Versión del servidor Duplicati](#duplicati-server-version).
- **Información resumida**: El número consolidado de archivos, tamaño y almacenamiento usado para todas las copias de seguridad de este servidor. También muestra el tiempo transcurrido de la última copia de seguridad recibida (pasa el cursor para mostrar la marca de tiempo)
- **Lista de copias de seguridad**: Una tabla con todas las copias de seguridad configuradas para este servidor, con 3 columnas:
  - **Nombre de la copia de seguridad**: Nombre de la copia de seguridad en el servidor Duplicati
  - **Historial de estado**: Estado de las últimas 10 copias de seguridad recibidas.
  - **Última copia de seguridad recibida**: El tiempo transcurrido desde la hora actual del último registro recibido. Mostrará un icono de advertencia si la copia de seguridad está pendiente.
    - El tiempo se muestra en formato abreviado: `m` para minutos, `h` para horas, `d` para días, `w` para semanas, `mo` para meses, `y` para años.

El orden de clasificación de las tarjetas y otras configuraciones pueden establecerse en la [Configuración de visualización](settings/display-settings.md).

La vista de panel ofrece dos visualizaciones informativas, accesibles haciendo clic en el botón de la parte superior derecha del panel lateral:

- Estado: Mostrar estadísticas de los trabajos de copia de seguridad por estado, con una lista de copias de seguridad pendientes y trabajos de copia de seguridad con estado de advertencias/errores.

![panel de estado](../assets/screen-overview-side-status.png)

- Métricas: Mostrar gráficos con duración, tamaño de archivo y tamaño de almacenamiento a lo largo del tiempo para el servidor agregado o seleccionado.

![panel de gráficos](../assets/screen-overview-side-charts.png)

### Detalles de la Copia de Seguridad {/* #backup-details */}

Al pasar el cursor sobre una copia de seguridad en la lista se muestran los detalles del último registro de copia de seguridad recibido y cualquier información de vencimiento.

![Detalles de vencimiento](../assets/screen-backup-tooltip.png)

- **Nombre del servidor : Copia de seguridad**: El nombre o alias del servidor Duplicati y la copia de seguridad, también mostrará el nombre del servidor y la nota.
  - El alias y la nota se pueden configurar en [Configuración → Configuración del servidor](settings/server-settings.md).
- **Notificación**: Un ícono que muestra la [notificación configurada](#notifications-icons) para nuevos registros de copia de seguridad.
- **Fecha**: La marca de tiempo de la copia de seguridad y el tiempo transcurrido desde la última actualización de pantalla.
- **Estado**: El estado de la última copia de seguridad recibida (Éxito, Advertencia, Error, Fatal).
- **Duración, Número de Archivos, Tamaño de Archivo, Tamaño de Almacenamiento, Tamaño Subido**: Valores reportados por el servidor Duplicati.
- **Versiones disponibles**: El número de versiones de copia de seguridad almacenadas en el destino de copia de seguridad en el momento de la copia de seguridad.

Si esta copia de seguridad está vencida, el tooltip también muestra:

- **Copia de seguridad esperada**: El momento en que se esperaba la copia de seguridad, incluyendo el período de gracia configurado (tiempo extra permitido antes de marcar como vencida).

También puedes hacer clic en los botones en la parte inferior para abrir [Configuración → Notificaciones de Copia de Seguridad](settings/backup-notifications-settings.md) para configurar las opciones de monitoreo o abrir la interfaz web del servidor Duplicati.

## Diseño de Tabla {/* #table-layout */}

El diseño de la tabla lista los registros de copia de seguridad más recientes recibidos para todos los servidores y copias de seguridad.

![Modo de Tabla del Panel de Control](../assets/screen-main-dashboard-table-mode.png)

- **Nombre del servidor**: El nombre del servidor Duplicati (o alias)
  - Debajo del nombre está la nota del servidor
- **Nombre de copia de seguridad**: El nombre de la copia de seguridad en el servidor Duplicati.
- **Versión**: La versión de Duplicati del último registro de copia de seguridad para ese trabajo de copia de seguridad. Ver [Versión del Servidor Duplicati](#duplicati-server-version).
- **Versiones disponibles**: El número de versiones de copia de seguridad almacenadas en el destino de copia de seguridad. Si el ícono está atenuado, no se recibió información detallada en el registro. Ver las [instrucciones de configuración de Duplicati](../installation/duplicati-server-configuration.md) para más detalles.
- **Número de copias de seguridad**: El número de copias de seguridad reportadas por el servidor Duplicati.
- **Fecha de última copia de seguridad**: La marca de tiempo del último registro de copia de seguridad recibido y el tiempo transcurrido desde la última actualización de pantalla.
- **Estado de última copia de seguridad**: El estado de la última copia de seguridad recibida (Éxito, Advertencia, Error, Fatal).
- **Duración**: La duración de la copia de seguridad en HH:MM:SS.
- **Advertencias/Errores**: El número de advertencias y errores reportados en el registro de copia de seguridad, mostrados como `warnings/errors` (por ejemplo `0/0`).
- **Configuración**:
  - **Notificación**: Un ícono que muestra la configuración de notificación configurada para nuevos registros de copia de seguridad.
  - **Configuración de Duplicati**: Un botón para abrir la interfaz web del servidor Duplicati.

Puedes usar la [Configuración de visualización](settings/display-settings.md) para configurar el tamaño de la tabla y otras configuraciones.

### Íconos de Notificaciones {/* #notifications-icons */}

| Icon                                                                                                                               | Opción de Notificación | Descripción                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Desactivado                 | No se enviarán notificaciones cuando se reciba un nuevo registro de copia de seguridad                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Todos                 | Se enviarán notificaciones para cada nuevo registro de copia de seguridad, independientemente de su estado.                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Advertencias            | Se enviarán notificaciones solo para registros de copia de seguridad con un estado de Advertencia, Desconocido, Error o Fatal. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Errores              | Se enviarán notificaciones solo para registros de copia de seguridad con un estado de Error o Fatal.                    |

:::note
Esta configuración de notificación solo se aplica cuando **duplistatus** recibe un nuevo registro de copia de seguridad de un servidor Duplicati. Las notificaciones vencidas se configuran por separado y se enviarán independientemente de esta configuración.
:::

### Detalles de Vencimiento {/* #overdue-details */}

Al pasar el cursor sobre el icono de advertencia de vencimiento, se muestran detalles sobre la copia de seguridad vencida.

![Detalles de vencimiento](../assets/screen-overdue-backup-hover-card.png)

- **Comprobado**: Cuando se realizó la última comprobación de vencimiento. Configure la frecuencia en [Configuración de Notificaciones de Copia de Seguridad](settings/backup-notifications-settings.md).
- **Última Copia de Seguridad**: Cuando se recibió el último registro de copia de seguridad.
- **Copia de Seguridad Esperada**: La hora en que se esperaba la copia de seguridad, incluyendo el período de gracia configurado (tiempo adicional permitido antes de marcar como vencida).
- **Última Notificación**: Cuando se envió la última notificación de vencimiento.

## Versión del Servidor Duplicati {/* #duplicati-server-version */}

El panel muestra la versión de Duplicati reportada en el último registro de copia de seguridad para cada servidor (vista de tarjeta) o trabajo de copia de seguridad (vista de tabla).

- **Dónde aparece**: A la izquierda del indicador de estado en las tarjetas, y en la columna **Versión** de la tabla (después de **Pendiente / Próxima ejecución**). Puedes ocultar la insignia de la tarjeta desde [Configuración de visualización](settings/display-settings.md) o [Versiones de Duplicati](settings/duplicati-versions.md). La columna de la tabla siempre permanece visible.
- **Color**: El texto gris significa que la versión coincide con la última versión para ese canal (o la comparación no está disponible). El amarillo de advertencia significa que la versión es anterior a la última versión para ese canal.
- **Información sobre herramientas**: Pasa el cursor o haz clic en el número de versión para ver el canal de actualización (`stable`, `beta`, `experimental`, o `canary`), la versión del servidor y la última versión disponible para ese canal.

**duplistatus** compara la versión del registro de copia de seguridad con las últimas versiones de Duplicati publicadas en GitHub. Los administradores pueden ver las versiones de canal en caché y configurar el intervalo de comprobación y la hora de inicio en [Configuración → Versiones de Duplicati](settings/duplicati-versions.md). La caché también se actualiza al iniciar cuando es más antigua que el intervalo seleccionado. Las actualizaciones de GitHub exitosas y fallidas se registran en el [registro de auditoría](settings/audit-logs-viewer.md) como `duplicati_version_refresh` (iniciado por `startup`, `cron`, o `manual`).

:::important
**duplistatus** no consulta el servidor Duplicati para la versión que se está ejecutando actualmente. Utiliza la versión almacenada en el último registro de copia de seguridad que se recibió o [recopiló](collect-backup-logs.md). Después de actualizar Duplicati, el panel sigue mostrando la versión anterior hasta que llegue un nuevo registro de copia de seguridad.
:::

### Versiones de Copia de Seguridad Disponibles {/* #available-backup-versions */}

Hacer clic en el icono de reloj azul abre una lista de versiones de copia de seguridad disponibles en el momento de la copia de seguridad, según lo reportado por el servidor Duplicati.

![Versiones disponibles](../assets/screen-available-backups-modal.png)

- **Detalles de la Copia de Seguridad**: Muestra el nombre del servidor y el alias, la nota del servidor, el nombre de la copia de seguridad y cuándo se ejecutó la copia de seguridad.
- **Detalles de la Versión**: Muestra el número de versión, la fecha de creación y la antigüedad.

:::note
Si el icono está desactivado, significa que no se recibió información detallada en los registros de mensajes.
Consulte las [instrucciones de Configuración de Duplicati](../installation/duplicati-server-configuration.md) para más detalles.
:::
