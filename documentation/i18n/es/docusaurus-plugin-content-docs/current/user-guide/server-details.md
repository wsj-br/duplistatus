# Detalles del Servidor {/* #server-details */}

Al hacer clic en un servidor desde el panel de control, se abre una página con una lista de copias de seguridad para ese servidor. Puede ver todas las copias de seguridad o seleccionar una específica si el servidor tiene varias copias de seguridad configuradas.

![Detalles del Servidor](../assets/screen-server-backup-list.png)

## Estadísticas del Servidor/Copia de Seguridad {/* #serverbackup-statistics */}

Esta sección muestra estadísticas para todas las copias de seguridad en el servidor o para una copia de seguridad seleccionada.

- **TOTAL DE TRABAJOS DE COPIA DE SEGURIDAD**: Número total de trabajos de copia de seguridad configurados en este servidor.
- **TOTAL DE EJECUCIONES DE COPIA DE SEGURIDAD**: Número total de ejecuciones de copia de seguridad realizadas (según lo informado por el servidor Duplicati).
- **VERSIONES DISPONIBLES**: Número de versiones disponibles (según lo informado por el servidor Duplicati).
- **DURACIÓN PROMEDIO**: Duración promedio (media) de las copias de seguridad registradas en la base de datos **duplistatus**.
- **TAMAÑO ÚLTIMA COPIA DE SEGURIDAD**: Tamaño de los archivos de origen de la última copia de seguridad recibida.
- **ALMACENAMIENTO TOTAL USADO**: Almacenamiento usado en el destino de la copia de seguridad, según lo informado en el último registro de copia de seguridad.
- **TOTAL SUBIDO**: Suma de todos los datos subidos registrados en la base de datos **duplistatus**.

Si esta copia de seguridad o alguna de las copias de seguridad en el servidor (cuando se selecciona **Todas las Copias de Seguridad**) está vencida, aparece un mensaje debajo del resumen.

![Detalles del Servidor - Copias de Seguridad Programadas Vencidas](../assets/screen-server-overdue-message.png)

Haga clic en el <IconButton icon="lucide:settings" href="settings/backup-monitoring-settings" label="Configurar"/> para ir a [Configuración → Monitoreo de Copias de Seguridad](settings/backup-monitoring-settings.md). O haga clic en el <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> en la barra de herramientas para abrir la interfaz web del servidor Duplicati y revisar los registros.

<br/>

## Historial de Copias de Seguridad {/* #backup-history */}

Esta tabla enumera los registros de copia de seguridad para el servidor seleccionado.

![Historial de Copias de Seguridad](../assets/screen-backup-history.png)

- **Nombre de la Copia de Seguridad**: El nombre de la copia de seguridad en el servidor Duplicati.
- **Fecha**: La marca de tiempo de la copia de seguridad y el tiempo transcurrido desde la última actualización de la pantalla.
- **Estado**: El estado de la copia de seguridad (Éxito, Advertencia, Error, Fatal).
- **Advertencias/Errores**: El número de advertencias/errores reportados en el registro de copia de seguridad.
- **Versiones Disponibles**: El número de versiones de copia de seguridad disponibles en el destino de la copia de seguridad. Si el icono está desactivado, no se recibió información detallada.
- **Número de Archivos, Tamaño de Archivo, Tamaño Subido, Duración, Tamaño de Almacenamiento**: Valores según lo informado por el servidor Duplicati.

:::tip Consejos
• Use el menú desplegable en la sección **Historial de Copias de Seguridad** para seleccionar **Todas las Copias de Seguridad** o una copia de seguridad específica para este servidor.

• Puede ordenar cualquier columna haciendo clic en su encabezado, haga clic nuevamente para invertir el orden de clasificación.
 
• Haga clic en cualquier parte de una fila para ver los [Detalles de la Copia de Seguridad](#backup-details).

:::

:::note
Cuando se selecciona **Todas las Copias de Seguridad**, la lista muestra todas las copias de seguridad ordenadas de la más reciente a la más antigua por defecto.
:::

<br/>

## Detalles de la Copia de Seguridad {/* #backup-details */}

Al hacer clic en una insignia de estado en el panel de control (vista de tabla) o en cualquier fila de la tabla de historial de copias de seguridad, se muestra la información detallada de la copia de seguridad.

![Detalles de la Copia de Seguridad](../assets/screen-backup-detail.png)

- **Detalles del servidor**: nombre del servidor, alias y nota.
- **Información de Copia de seguridad**: la marca de tiempo de la copia de seguridad y su ID.
- **Estadísticas de Copia de seguridad**: un resumen de los contadores reportados, tamaños y duración.
- **Resumen de Registro**: el número de mensajes reportados.
- **Versiones disponibles**: una lista de versiones disponibles (solo se muestra si la información se recibió en los registros).
- **Mensajes/Advertencias/Errores**: los registros de ejecución completos. El subtítulo indica si el registro fue truncado por el servidor Duplicati.

<br/>

:::note
Consulte las [instrucciones de Configuración de Duplicati](../installation/duplicati-server-configuration.md) para aprender cómo configurar el servidor Duplicati para enviar registros de ejecución completos y evitar la truncación.
:::
