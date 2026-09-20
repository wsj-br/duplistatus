# Detalles del Servidor {/* #server-details */}

Al hacer clic en un servidor desde el panel de control se abre una página con una lista de copias de seguridad para ese servidor. Puede ver todas las copias de seguridad o seleccionar una específica si el servidor tiene varias copias de seguridad configuradas.

![Detalles del Servidor](../assets/screen-server-backup-list.png)

## Estadísticas de Servidor/Copia de Seguridad {/* #serverbackup-statistics */}

Esta sección muestra estadísticas ya sea para todas las copias de seguridad en el servidor o para una copia de seguridad seleccionada individual.

- **TOTAL DE TRABAJOS DE COPIA DE SEGURIDAD**: Número total de trabajos de copia de seguridad configurados en este servidor.
- **TOTAL DE EJECUCIONES DE COPIA DE SEGURIDAD**: Número total de ejecuciones de copia de seguridad realizadas (según lo informado por el servidor Duplicati).
- **VERSIONES DISPONIBLES**: Número de versiones disponibles (según lo informado por el servidor Duplicati).
- **DURACIÓN PROMEDIO**: Duración promedio (media) de las copias de seguridad registradas en la base de datos **duplistatus**.
- **TAMAÑO ÚLTIMA COPIA DE SEGURIDAD**: Tamaño de los archivos fuente del último registro de copia de seguridad recibido.
- **ALMACENAMIENTO TOTAL USADO**: Almacenamiento utilizado en el destino de la copia de seguridad, según lo informado en el último registro de copia de seguridad.
- **TOTAL SUBIDO**: Suma de todos los datos subidos registrados en la base de datos **duplistatus**.

Si esta copia de seguridad o cualquiera de las copias de seguridad en el servidor (cuando **Todas las copias de seguridad** está seleccionado) está vencida, aparece un mensaje debajo del resumen.

![Detalles del Servidor - Copias de Seguridad Programadas Vencidas](../assets/screen-server-overdue-message.png)

Haga clic en <IconButton icon="lucide:settings" href="settings/backup-monitoring-settings" label="Configurar"/> para ir a [Configuración → Monitoreo de copias de seguridad](settings/backup-monitoring-settings.md). O haga clic en <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> en la barra de herramientas para abrir la interfaz web del servidor Duplicati y comprobar los registros.

<br/>

## Historial de Copias de Seguridad {/* #backup-history */}

Esta tabla enumera los registros de copias de seguridad para el servidor seleccionado.

![Historial de Copias de Seguridad](../assets/screen-backup-history.png)

- **Nombre de copia de seguridad**: El nombre de la copia de seguridad en el servidor Duplicati.
- **Fecha**: La marca de tiempo de la copia de seguridad y el tiempo transcurrido desde la última actualización de pantalla.
- **Estado**: El estado de la copia de seguridad (Éxito, Advertencia, Error, Fatal).
- **Advertencias/Errores**: El número de advertencias/errores reportados en el registro de copia de seguridad.
- **Versiones disponibles**: El número de versiones de copia de seguridad disponibles en el destino de la copia de seguridad. Si el icono está deshabilitado, no se recibió información detallada.
- **Número de Archivos, Tamaño de Archivo, Tamaño Subido, Duración, Tamaño de Almacenamiento**: Valores según lo informado por el servidor Duplicati.

:::tip Consejos
• Utilice el menú desplegable en la sección **Historial de Copias de Seguridad** para seleccionar **Todas las copias de seguridad** o una copia de seguridad específica para este servidor.

• Puede ordenar cualquier columna haciendo clic en su encabezado, haga clic nuevamente para invertir el orden.
 
• Haga clic en cualquier lugar de una fila para ver los [Detalles de Copia de Seguridad](#backup-details).

:::

:::note
Cuando **Todas las copias de seguridad** está seleccionado, la lista muestra todas las copias de seguridad ordenadas de más reciente a más antigua por defecto.
:::

<br/>

## Detalles de Copia de Seguridad {/* #backup-details */}

Al hacer clic en una insignia de estado en el panel de control (vista de tabla) o en cualquier fila de la tabla de historial de copias de seguridad se muestran la información detallada de la copia de seguridad.

![Detalles de Copia de Seguridad](../assets/screen-backup-detail.png)

- **Detalles del servidor**: nombre del servidor, alias y nota.
- **Información de Copia de Seguridad**: La marca de tiempo de la copia de seguridad y su ID.
- **Estadísticas de Copia de Seguridad**: Un resumen de los contadores reportados, tamaños y duración.
- **Resumen de Registro**: El número de mensajes reportados.
- **Versiones disponibles**: Una lista de versiones disponibles (solo se muestra si la información fue recibida en los registros).
- **Mensajes/Advertencias/Errores**: Los registros de ejecución completos. El subtítulo indica si el registro fue truncado por el servidor Duplicati.

<br/>

:::note
Consulte las [instrucciones de Configuración de Duplicati](../installation/duplicati-server-configuration.md) para aprender cómo configurar el servidor Duplicati para enviar registros de ejecución completos y evitar el truncamiento.
:::
