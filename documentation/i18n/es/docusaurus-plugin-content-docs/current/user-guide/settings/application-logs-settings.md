---
translation_last_updated: '2026-01-31T00:51:29.113Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: c28f44d7440e4fdb
translation_language: es
source_file_path: user-guide/settings/application-logs-settings.md
---
# Logs de aplicación {#application-logs}

El Visor de Logs de aplicación permite a los administradores monitorear todos los Logs de aplicación en un solo lugar, con filtrado, Exportar y actualizaciones en tiempo real directamente desde la interfaz web.

![Application Log Viewer](/assets/screen-settings-application-logs.png)

<br/>

## Acciones disponibles {#available-actions}

| Botón                                                               | Descripción                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Actualizar" />            | Recargue manualmente los logs del archivo seleccionado. Muestra un indicador de carga mientras se actualiza y reinicia el seguimiento para la detección de nuevas líneas. |
| <IconButton icon="lucide:copy" label="Copiar al portapapeles" />         | Copie todas las líneas de logs filtradas a su portapapeles. Respeta el filtro de búsqueda actual. Útil para compartir rápidamente o pegar en otras herramientas. |
| <IconButton icon="lucide:download" label="Exportar" />               | Descargue los logs como archivo de texto. Exporta desde la versión del archivo seleccionada actualmente y aplica el filtro de búsqueda actual (si existe). Formato de nombre de archivo: `duplistatus-logs-YYYY-MM-DD.txt` (fecha en formato ISO). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Salte rápidamente al inicio de los logs mostrados. Útil cuando el desplazamiento automático está deshabilitado o cuando navega por archivos de logs largos. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Salte rápidamente al final de los logs mostrados. Útil cuando el desplazamiento automático está deshabilitado o cuando navega por archivos de logs largos. |

<br/>

## Controles y Filtros {#controls-and-filters}

| Control | Descripción |
|:--------|:-----------|
| **Versión del archivo** | Seleccione qué archivo de registro ver: **Actual** (archivo activo) o archivos rotados (`.1`, `.2`, etc., donde los números más altos son más antiguos). |
| **Líneas a mostrar** | Muestre las **100**, **500**, **1000** (por defecto), **5000**, o **10000** líneas más recientes del archivo seleccionado. |
| **Desplazamiento automático** | Cuando está habilitado (por defecto para el archivo actual), se desplaza automáticamente a las nuevas entradas de registro y se actualiza cada 2 segundos. Solo funciona para la versión de archivo `Actual`. |
| **Buscar** | Filtre líneas de registro por texto (sin distinción de mayúsculas y minúsculas). Los filtros se aplican a las líneas actualmente mostradas. |

<br/>

El encabezado de visualización del registro muestra el recuento de líneas filtradas, líneas totales, tamaño de archivos y marca de tiempo de última modificación.

<br/>
