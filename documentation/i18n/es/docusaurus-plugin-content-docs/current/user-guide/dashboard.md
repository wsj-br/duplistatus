# Panel de control {/* #dashboard */}

## Resumen del panel de control {/* #dashboard-summary */}

Esta sección muestra estadísticas agregadas para todas las copias de seguridad.

![Resumen del panel de control - vista general](../assets/screen-dashboard-summary.png)
![Resumen del panel de control - tabla](../assets/screen-dashboard-summary-table.png)

- **Total de servidores**: El número de servidores que se están supervisando.                                                                                                             
- **Total de trabajos de copia de seguridad**: El número total de trabajos de copia de seguridad (tipos) configurados para todos los servidores.                                                                                
- **Total de ejecuciones de copia de seguridad**: El número total de registros de copia de seguridad de ejecuciones recibidas o recopiladas para todos los servidores.                                                                   
- **Tamaño total de copia de seguridad**: El tamaño combinado de todos los datos de origen, basado en los últimos registros de copia de seguridad recibidos.                                                                    
- **Almacenamiento total usado**: El espacio de almacenamiento total utilizado por las copias de seguridad en el destino de la copia de seguridad (por ejemplo, almacenamiento en la nube, servidor FTP, unidad local), basado en los últimos registros de copia de seguridad.                
- **Tamaño total cargado**: La cantidad total de datos subidos desde el servidor Duplicati al destino (por ejemplo, almacenamiento local, FTP, proveedor de la nube).                                       
- **Copias de seguridad pendientes** (tabla): El número de copias de seguridad que están vencidas. Consulte [Configuración de notificaciones de copia de seguridad](settings/backup-notifications-settings.md)                          
- **Alternancia de diseño**: Cambia entre el diseño de tarjetas (predeterminado) y el diseño de tabla.

:::tip ¿Ve servidores duplicados?
Si el mismo servidor aparece más de una vez en el panel de control, utilice [Configuración → Mantenimiento de base de datos → Combinar servidores duplicados](settings/database-maintenance.md#merge-duplicate-servers) para consolidarlos. Las duplicaciones pueden ocurrir cuando reinstala o actualiza Duplicati, porque el `machine_id` del servidor puede cambiar y **duplistatus** lo trata entonces como un nuevo servidor.
:::

## Filtrado de servidores {/* #server-filtering */}

Puede filtrar los servidores y copias de seguridad mostrados en el panel de control utilizando el campo de búsqueda en la barra de herramientas de la aplicación. Haga clic en el icono de filtro <IconButton icon="lucide:search" /> para mostrar el campo de búsqueda.

**Coincidencias de filtro:**
- ID del servidor
- URL del servidor
- Nombres de trabajos de copia de seguridad

**Ámbito:**
- Filtra tanto las vistas de tarjetas como de tabla en el panel de control
- El estado de sesión se mantiene mediante el proveedor de filtro de servidor del panel de control
- Se borra al actualizar o salir del panel de control

Esto facilita localizar rápidamente servidores o copias de seguridad específicos entre muchos sistemas supervisados.

## Diseño de tarjetas {/* #cards-layout */}

El diseño de tarjetas muestra el estado del registro de la copia de seguridad más reciente recibido para cada copia de seguridad.

![Diseño de tarjeta](../assets/duplistatus_dash-cards.svg)

- **Nombre del servidor**: Nombre del servidor Duplicati (o el alias)
  - Al pasar el cursor sobre el **Nombre del servidor** se mostrará el nombre del servidor y la nota
- **Estado general**: El estado del servidor. Las copias de seguridad vencidas se mostrarán con un estado de **Advertencia**
- **Versión**: La versión de Duplicati del último registro de copia de seguridad, mostrada a la izquierda del indicador de estado. Consulte [Versión del servidor Duplicati](#duplicati-server-version).
- **Información resumida**: El número consolidado de archivos, tamaño y almacenamiento utilizado para todas las copias de seguridad de este servidor. También muestra el tiempo transcurrido de la copia de seguridad más reciente recibida (pase el cursor para mostrar la marca de tiempo)
- **Lista de copias de seguridad**: Una tabla con todas las copias de seguridad configuradas para este servidor, con 3 columnas:
  - **Nombre de copia de seguridad**: Nombre de la copia de seguridad en el servidor Duplicati
  - **Historial de estado**: Estado de las últimas 10 copias de seguridad recibidas.
  - **Última copia de seguridad recibida**: El tiempo transcurrido desde la hora actual del último registro recibido. Mostrará un icono de advertencia si la copia de seguridad está vencida.
    - La hora se muestra en formato abreviado: `m` para minutos, `h` para horas, `d` para días, `w` para semanas, `mo` para meses, `y` para años.

El orden de clasificación de tarjetas y otras configuraciones se pueden establecer en la [Configuración de visualización](settings/display-settings.md).

La vista de panel ofrece dos pantallas informativas, accesibles haciendo clic en el botón superior derecho del panel lateral:

- Estado: Muestra estadísticas de los trabajos de copia de seguridad por estado, con una lista de copias de seguridad vencidas y trabajos de copia de seguridad con estado de advertencias/errores.

![panel de estado](../assets/screen-overview-side-status.png)

- Métricas: Muestra gráficos con duración, tamaño de archivo y tamaño de almacenamiento a lo largo del tiempo para el servidor agregado o seleccionado.

![panel de gráficos](../assets/screen-overview-side-charts.png)

### Detalles de la Copia de Seguridad {/* #backup-details */}

Al pasar el cursor sobre una copia de seguridad en la lista se muestran detalles del último registro de copia de seguridad recibido y cualquier información pendiente.

![Detalles de vencimiento](../assets/screen-backup-tooltip.png)

- **Nombre del servidor : Copia de seguridad**: El nombre o alias del servidor y copia de seguridad de Duplicati, también mostrará el nombre del servidor y la nota.
  - El alias y la nota se pueden configurar en [Configuración → Configuración del servidor](settings/server-settings.md).
- **Notificación**: Un icono que muestra la configuración de [notificación configurada](#notifications-icons) para nuevos registros de copia de seguridad.
- **Fecha**: La marca de tiempo de la copia de seguridad y el tiempo transcurrido desde la última actualización de pantalla.
- **Estado**: El estado de la última copia de seguridad recibida (Éxito, Advertencia, Error, Fatal).
- **Duración, Número de archivos, Tamaño de archivo, Tamaño de almacenamiento, Tamaño subido**: Valores según los informados por el servidor Duplicati.
- **Versiones disponibles**: El número de versiones de copia de seguridad almacenadas en el destino de copia de seguridad en el momento de la copia de seguridad.

Si esta copia de seguridad está vencida, la información emergente también muestra:

- **Copia de seguridad esperada**: La hora en que se esperaba la copia de seguridad, incluido el período de gracia configurado (tiempo adicional permitido antes de marcarla como vencida).

También puede hacer clic en los botones en la parte inferior para abrir [Configuración → Notificaciones de copia de seguridad](settings/backup-notifications-settings.md) para configurar las opciones de monitoreo o abrir la interfaz web del servidor Duplicati.

## Diseño de tabla {/* #table-layout */}

El diseño de tabla enumera los registros de copia de seguridad más recientes recibidos para todos los servidores y copias de seguridad.

![Modo de tabla del panel](../assets/screen-main-dashboard-table-mode.png)

- **Nombre del servidor**: El nombre del servidor Duplicati (o alias)
  - Debajo del nombre está la nota del servidor
- **Nombre de copia de seguridad**: El nombre de la copia de seguridad en el servidor Duplicati.
- **Versión**: La versión de Duplicati del último registro de copia de seguridad para ese trabajo de copia de seguridad. Consulte [Versión del servidor Duplicati](#duplicati-server-version).
- **Versiones disponibles**: El número de versiones de copia de seguridad almacenadas en el destino de copia de seguridad. Si el icono está atenuado, no se recibió información detallada en el registro. Consulte las [instrucciones de configuración de Duplicati](../installation/duplicati-server-configuration.md) para obtener más detalles.
- **Número de copias de seguridad**: El número de copias de seguridad reportadas por el servidor Duplicati.
- **Fecha de última copia de seguridad**: La marca de tiempo del último registro de copia de seguridad recibido y el tiempo transcurrido desde la última actualización de pantalla.
- **Estado de última copia de seguridad**: El estado de la última copia de seguridad recibida (Éxito, Advertencia, Error, Fatal).
- **Duración**: La duración de la copia de seguridad en HH:MM:SS.
- **Advertencias/Errores**: El número de advertencias y errores reportados en el registro de copia de seguridad, mostrados como `warnings/errors` (por ejemplo `0/0`).
- **Configuración**:
  - **Notificación**: Un icono que muestra la configuración de notificación configurada para nuevos registros de copia de seguridad.
  - **Configuración de Duplicati**: Un botón para abrir la interfaz web del servidor Duplicati

Puede usar la [Configuración de visualización](settings/display-settings.md) para configurar el tamaño de la tabla y otras configuraciones.

### Iconos de notificaciones {/* #notifications-icons */}

| Icono                                                                                                                              | Opción de notificación | Descripción                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Desactivado            | No se enviarán notificaciones cuando se reciba un nuevo registro de copia de seguridad             |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Todos                  | Se enviarán notificaciones para cada nuevo registro de copia de seguridad, independientemente de su estado. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Advertencias          | Las notificaciones se enviarán solo para registros de copia de seguridad con un estado de Advertencia, Desconocido, Error o Fatal. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Errores               | Las notificaciones se enviarán solo para registros de copia de seguridad con un estado de Error o Fatal.                     |

:::note
Esta configuración de notificación solo se aplica cuando **duplistatus** recibe un nuevo registro de copia de seguridad de un servidor Duplicati. Las notificaciones de vencimiento se configuran por separado y se enviarán independientemente de esta configuración.
:::

### Detalles de Vencimiento {/* #overdue-details */}

Al pasar el cursor sobre el icono de advertencia de vencimiento se muestran detalles sobre la copia de seguridad vencida.

![Detalles de vencimiento](../assets/screen-overdue-backup-hover-card.png)

- **Comprobado**: Cuándo se realizó la última comprobación de vencimiento. Configure la frecuencia en [Configuración de Notificaciones de Copia de Seguridad](settings/backup-notifications-settings.md).
- **Última Copia de Seguridad**: Cuándo se recibió el último registro de copia de seguridad.
- **Copia de Seguridad Esperada**: La hora en que se esperaba la copia de seguridad, incluido el período de gracia configurado (tiempo adicional permitido antes de marcar como vencida).
- **Última Notificación**: Cuándo se envió la última notificación de vencimiento.

## Versión del Servidor Duplicati {/* #duplicati-server-version */}

El panel muestra la versión de Duplicati reportada en el último registro de copia de seguridad para cada servidor (vista de tarjetas) o trabajo de copia de seguridad (vista de tabla).

- **Dónde aparece**: A la izquierda del indicador de estado en las tarjetas, y en la columna **Versión** en la tabla (después de **Pendiente / Próxima ejecución**). Puede ocultar la insignia de la tarjeta desde [Configuración de Visualización](settings/display-settings.md) o [Versiones de Duplicati](settings/duplicati-versions.md). La columna de la tabla siempre permanece visible.
- **Color**: El texto gris significa que la versión coincide con la última versión publicada para ese canal (o la comparación no está disponible). El amarillo de advertencia significa que la versión es más antigua que la última versión publicada para ese canal.
- **Información sobre herramientas**: Pase el cursor o haga clic en el número de versión para ver el canal de actualización (`stable`, `beta`, `experimental` o `canary`), la versión del servidor y la última versión disponible para ese canal.

**duplistatus** compara la versión del registro de copia de seguridad contra las últimas versiones de Duplicati publicadas en GitHub. Los administradores pueden ver las versiones de canal almacenadas en caché y configurar el intervalo de comprobación y la hora de inicio en [Configuración → Versiones de Duplicati](settings/duplicati-versions.md). La caché también se actualiza al iniciar cuando es más antigua que el intervalo seleccionado. Las actualizaciones exitosas y fallidas de GitHub se registran en el [registro de auditoría](settings/audit-logs-viewer.md) como `duplicati_version_refresh` (iniciado por `startup`, `cron` o `manual`).

:::important
**duplistatus** no consulta al servidor Duplicati para obtener la versión que se está ejecutando actualmente. Utiliza la versión almacenada en el último registro de copia de seguridad que se recibió o [recopiló](collect-backup-logs.md). Después de actualizar Duplicati, el panel seguirá mostrando la versión anterior hasta que llegue un nuevo registro de copia de seguridad.
:::

### Versiones de Copia de Seguridad Disponibles {/* #available-backup-versions */}

Al hacer clic en el icono azul del reloj se abre una lista de versiones de copia de seguridad disponibles en el momento de la copia de seguridad, según lo reportado por el servidor Duplicati.

![Versiones disponibles](../assets/screen-available-backups-modal.png)

- **Detalles de Copia de Seguridad**: Muestra el nombre del servidor y alias, nota del servidor, nombre de la copia de seguridad y cuándo se ejecutó la copia de seguridad.
- **Detalles de Versión**: Muestra el número de versión, fecha de creación y antigüedad.

:::note
Si el icono está deshabilitado en gris, significa que no se recibió información detallada en los registros de mensajes.
Consulte las [instrucciones de Configuración de Duplicati](../installation/duplicati-server-configuration.md) para obtener más detalles.
:::
