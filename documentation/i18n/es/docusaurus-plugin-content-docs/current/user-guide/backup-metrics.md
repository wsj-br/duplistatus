# Métricas de Backup {#backup-metrics}

Se muestra un gráfico de métricas de backup a lo largo del tiempo tanto en el Panel de control (vista de tabla) como en la página de detalles del servidor.

- **Panel de control**, el gráfico muestra el número total de backups registrados en la base de datos **duplistatus**. Si utiliza el diseño de Tarjetas, puede seleccionar un servidor para ver sus métricas consolidadas (cuando el panel lateral muestra métricas).
- **Página de Detalles del Servidor**, el gráfico muestra métricas para el servidor seleccionado (para todos sus backups) o para un backup específico individual.

![Backup Metrics](../assets/screen-metrics.png)

## Controles en línea del Gráfico {#inline-chart-controls}

Controles de acceso rápido están disponibles directamente en los encabezados del panel de gráficos para una configuración fácil sin navegar a Configuración de visualización:

### Selector de Rango de Tiempo {#time-range-selector}

Botones de pastilla aparecen en el encabezado del gráfico para selección rápida de rango de tiempo: **1S | 2S | 1M | 3M**

- **1S**: Últimos 7 días (ventana móvil)
- **2S**: Últimos 14 días (ventana móvil)
- **1M**: Últimos 30 días (ventana móvil, predeterminada)
- **3M**: Últimos 90 días (ventana móvil)

Los cambios realizados aquí se sincronizan con su Configuración de visualización, por lo que su preferencia se recuerda entre actualizaciones de página.

### Alternador de Estilo de Gráfico {#chart-style-toggle}

Un botón de alternancia en el encabezado del gráfico le permite cambiar entre:

- **Líneas suaves**: Mostrar puntos de datos conectados con curvas suaves
- **Gráfico de barras**: Mostrar datos como barras discretas para cada período de tiempo

Ambos modos utilizan agregación de cubos de tiempo para una visualización óptima. Los períodos vacíos en modo de barras no muestran barra. Su preferencia persiste entre actualizaciones de página y se sincroniza con Configuración de visualización.

## Consolidación de Datos del Gráfico {#chart-data-consolidation}

Cuando ocurren múltiples copias de seguridad en el mismo día, **duplistatus** consolida los datos antes de mostrarlos en los gráficos:

- **SUM**: Usado para métricas acumulativas (Duración, Número de Archivos, Tamaño de Archivo, Tamaño Subido)
- **LAST**: Usado para Tamaño de Almacenamiento (el valor más reciente del día)
- **MAX**: Usado para Versiones disponibles (el recuento más alto del día)

Esta consolidación ocurre antes de aplicar la agrupación por tiempo, asegurando métricas agregadas precisas. Por ejemplo, dos copias de seguridad el 5/12/26 producirán un punto de datos consolidado en el gráfico.

## Definiciones de Métricas {#metric-definitions}

- **Tamaño subido**: Cantidad total de datos cargados/transmitidos durante las copias de seguridad desde el servidor Duplicati al destino (almacenamiento local, FTP, proveedor en la nube, ...) por día.
- **Duración**: La duración total de todas las copias de seguridad recibidas por día en HH:MM.
- **Cantidad de archivos**: La suma del contador de cantidad de archivos recibido para todas las copias de seguridad por día.
- **Tamaño del archivo**: La suma del tamaño de archivo informado por el servidor Duplicati para todas las copias de seguridad recibidas por día.
- **Tamaño de almacenamiento**: La suma del espacio de almacenamiento utilizado en el destino de la copia de seguridad informado por el servidor Duplicati por día.
- **Versiones disponibles**: La suma de todas las versiones disponibles para todas las copias de seguridad por día.

:::note
Puede utilizar el control [Configuración de pantalla](settings/display-settings.md) para configurar el rango de tiempo del gráfico.
:::
