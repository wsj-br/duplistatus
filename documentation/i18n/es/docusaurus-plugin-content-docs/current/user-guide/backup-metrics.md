# Métricas de Copias de Seguridad {/* #backup-metrics */}

Un gráfico de métricas de copias de seguridad a lo largo del tiempo se muestra tanto en el panel de control (vista de tabla) como en la página de detalles del servidor.

- **Panel de control**, el gráfico muestra el número total de copias de seguridad registradas en la base de datos **duplistatus**. Si utiliza el diseño de tarjetas, puede seleccionar un servidor para ver sus métricas consolidadas (cuando el panel lateral muestra métricas).
- **Página de detalles del servidor**, el gráfico muestra métricas para el servidor seleccionado (para todas sus copias de seguridad) o para una copia de seguridad específica.

![Métricas de Copias de Seguridad](../assets/screen-metrics.png)

## Controles del Gráfico Inline {/* #inline-chart-controls */}

Controles de acceso rápido están disponibles directamente en los encabezados de los paneles de gráficos para una fácil configuración sin navegar a Configuración de Visualización:

### Selector de Rango de Tiempo {/* #time-range-selector */}

Botones de pestañas aparecen en el encabezado del gráfico para una selección rápida de rango de tiempo: **1S | 2S | 1M | 3M**

- **1S**: Últimos 7 días (ventana móvil)
- **2S**: Últimos 14 días (ventana móvil)
- **1M**: Últimos 30 días (ventana móvil, predeterminado)
- **3M**: Últimos 90 días (ventana móvil)

Los cambios realizados aquí se sincronizan con su Configuración de Visualización, por lo que su preferencia se recuerda entre actualizaciones de página.

### Alternador de Estilo de Gráfico {/* #chart-style-toggle */}

Un botón de alternancia en el encabezado del gráfico le permite cambiar entre:

- **Líneas Suaves**: Muestra puntos de datos conectados con curvas suaves
- **Gráfico de Barras**: Muestra datos como barras discretas para cada período de tiempo

Ambos modos utilizan agregación por cubeta de tiempo para una visualización óptima. Los períodos vacíos en el modo de barras no muestran ninguna barra. Su preferencia persiste entre actualizaciones de página y se sincroniza con Configuración de Visualización.

## Consolidación de Datos del Gráfico {/* #chart-data-consolidation */}

Cuando varias copias de seguridad ocurren en el mismo día, **duplistatus** consolida los datos antes de mostrarlos en los gráficos:

- **SUM**: Utilizado para métricas acumulativas (Duración, Número de Archivos, Tamaño de Archivo, Tamaño Subido)
- **LAST**: Utilizado para Tamaño de Almacenamiento (el valor más reciente del día)
- **MAX**: Utilizado para Versiones Disponibles (el recuento más alto del día)

Esta consolidación ocurre antes de que se aplique la cubeta de tiempo, asegurando métricas agregadas precisas. Por ejemplo, dos copias de seguridad el 5/12/26 producirán un solo punto de datos consolidado en el gráfico.

## Definiciones de Métricas {/* #metric-definitions */}

- **Tamaño Subido**: Cantidad total de datos subidos/transmitidos durante las copias de seguridad desde el servidor Duplicati hasta el destino (almacenamiento local, FTP, proveedor de nube, ...) por día.
- **Duración**: La duración total de todas las copias de seguridad recibidas por día en HH:MM.
- **Número de Archivos**: La suma del contador de número de archivos recibido para todas las copias de seguridad por día.
- **Tamaño de Archivo**: La suma del tamaño de archivo reportado por el servidor Duplicati para todas las copias de seguridad recibidas por día.
- **Tamaño de Almacenamiento**: La suma del tamaño de almacenamiento usado en el destino de la copia de seguridad informado por el servidor Duplicati por día.
- **Versiones disponibles**: La suma de todas las versiones disponibles para todas las copias de seguridad por día.

:::note
Puede usar el control [Configuración de visualización](settings/display-settings.md) para configurar el rango de tiempo para el gráfico.
:::
