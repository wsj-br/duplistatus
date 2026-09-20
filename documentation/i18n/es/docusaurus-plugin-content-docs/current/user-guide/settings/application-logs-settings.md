# Registros de la Aplicación {/* #application-logs */}

El visor de Registros de la Aplicación permite a los administradores monitorear todos los registros de aplicaciones en un solo lugar, con filtrado, exportación y actualizaciones en tiempo real directamente desde la interfaz web.

![Visor de Registros de Aplicación](../../assets/screen-settings-application-logs.png)

<br/>

## Acciones Disponibles {/* #available-actions */}

| Botón                                                               | Descripción                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Actualizar" />            | Recarga manualmente los registros del archivo seleccionado. Muestra un indicador de carga mientras se actualiza y restablece el seguimiento para la detección de nuevas líneas. |
| <IconButton icon="lucide:copy" label="Copiar al portapapeles" />         | Copia todas las líneas de registro filtradas al portapapeles. Respeta el filtro de búsqueda actual. Útil para compartir rápidamente o pegar en otras herramientas. |
| <IconButton icon="lucide:download" label="Exportar" />               | Descarga los registros como un archivo de texto. Exporta desde la versión de archivo actualmente seleccionada y aplica el filtro de búsqueda actual (si existe). Formato de nombre de archivo: `duplistatus-logs-YYYY-MM-DD.txt` (fecha en formato ISO). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Salta rápidamente al principio de los registros mostrados. Útil cuando el desplazamiento automático está desactivado o al navegar por archivos de registro largos. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Salta rápidamente al final de los registros mostrados. Útil cuando el desplazamiento automático está desactivado o al navegar por archivos de registro largos. |

<br/>

## Controles y Filtros {/* #controls-and-filters */}

| Control | Descripción |
|:--------|:-----------|
| **Versión de Archivo** | Selecciona qué archivo de registro ver: **Actual** (archivo activo) o archivos rotados (`.1`, `.2`, etc., donde los números más altos son más antiguos). |
| **Líneas a mostrar** | Muestra las **100**, **500**, **1000** (predeterminada), **5000** o **10000** líneas más recientes del archivo seleccionado. |
| **Desplazamiento automático** | Cuando está habilitado (predeterminado para archivo actual), se desplaza automáticamente hacia nuevas entradas de registro y se actualiza cada 2 segundos. Solo funciona para la versión de archivo **Actual**. |
| **Buscar** | Filtra las líneas de registro por texto (no distingue mayúsculas/minúsculas). Los filtros se aplican a las líneas mostradas actualmente. |

<br/>

La cabecera de visualización de registros muestra el recuento de líneas filtradas, el total de líneas, el tamaño del archivo y la marca de tiempo de la última modificación.

<br/>
