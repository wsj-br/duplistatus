# Métricas de Backup {#backup-metrics}

Se muestra un gráfico de métricas de backup a lo largo del tiempo tanto en el Panel de control (vista de tabla) como en la página de detalles del servidor.

- **Panel de control**, el gráfico muestra el número total de backups registrados en la base de datos **duplistatus**. Si utiliza el diseño de Tarjetas, puede seleccionar un servidor para ver sus métricas consolidadas (cuando el panel lateral muestra métricas).
- **Página de Detalles del Servidor**, el gráfico muestra métricas para el servidor seleccionado (para todos sus backups) o para un backup específico individual.

![Backup Metrics](../assets/screen-metrics.png)

- **Tamaño subido**: Cantidad total de datos cargados/transmitidos durante las copias de seguridad desde el servidor Duplicati al destino (almacenamiento local, FTP, proveedor en la nube, ...) por día.
- **Duración**: La duración total de todas las copias de seguridad recibidas por día en HH:MM.
- **Cantidad de archivos**: La suma del contador de cantidad de archivos recibido para todas las copias de seguridad por día.
- **Tamaño del archivo**: La suma del tamaño de archivo informado por el servidor Duplicati para todas las copias de seguridad recibidas por día.
- **Tamaño de almacenamiento**: La suma del espacio de almacenamiento utilizado en el destino de la copia de seguridad informado por el servidor Duplicati por día.
- **Versiones disponibles**: La suma de todas las versiones disponibles para todas las copias de seguridad por día.

:::note
Puede utilizar el control [Configuración de pantalla](settings/display-settings.md) para configurar el rango de tiempo del gráfico.
:::
