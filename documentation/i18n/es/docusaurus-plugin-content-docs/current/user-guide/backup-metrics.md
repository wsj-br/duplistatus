---
translation_last_updated: '2026-01-31T00:51:29.028Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 338e6488953bc930
translation_language: es
source_file_path: user-guide/backup-metrics.md
---
# Métricas de Backup {#backup-metrics}

Se muestra un gráfico de métricas de backup a lo largo del tiempo tanto en el panel de control (vista de tabla) como en la página de detalles del servidor.

- **Panel de control**, el gráfico muestra el número total de backups registrados en la base de datos de **duplistatus**. Si utiliza el diseño de tarjetas, puede seleccionar un servidor para ver sus métricas consolidadas (cuando el panel lateral muestra métricas).
- Página de **Detalles del Servidor**, el gráfico muestra métricas para el servidor seleccionado (para todos sus backups) o para un backup específico individual.

![Backup Metrics](/assets/screen-metrics.png)

- **Tamaño cargado**: Cantidad total de datos enviados/transmitidos durante los backups desde el servidor Duplicati al destino (almacenamiento local, FTP, proveedor de nube, ...) por día.
- **Duración**: La duración total de todos los backups recibidos por día en HH:MM.
- **Cantidad de archivos**: La suma del contador de cantidad de archivos recibido para todos los backups por día.
- **Tamaño de archivos**: La suma del tamaño de archivos reportado por el servidor Duplicati para todos los backups recibidos por día.
- **Tamaño de almacenamiento**: La suma del tamaño de almacenamiento usado en el destino de backup reportado por el servidor Duplicati por día.
- **Versiones disponibles**: La suma de todas las versiones disponibles para todos los backups por día.

:::note
Puede utilizar el control de [Configuración de pantalla](settings/display-settings.md) para configurar el rango de tiempo del gráfico.
:::
