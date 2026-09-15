# Plantillas {/* #templates */}

**duplistatus** utiliza cuatro plantillas para los mensajes de notificación. Los cuerpos de los correos electrónicos son Markdown (encabezados, listas, enlaces y tablas). NTFY para Éxito, Advertencia/Error y Vencida utiliza el mismo cuerpo Markdown, enviado con `Markdown: yes` para que los clientes de ntfy puedan renderizarlo. Cualquier tabla GFM omite su fila de encabezado y envía el cuerpo como texto plano, porque ntfy no renderiza tablas. El Resumen Diario es solo para correo electrónico.

La página incluye un selector de **Idioma de la plantilla** que establece la configuración regional para las plantillas predeterminadas. Cambiar el idioma actualiza la configuración regional para los nuevos valores predeterminados, pero **no** cambia el texto de las plantillas existentes. Para aplicar un nuevo idioma a sus plantillas, edítelas manualmente o utilice **Restablecer esta plantilla a valores predeterminados** (para la pestaña actual) o **Restablecer todo a valores predeterminados** (para todas las plantillas).

![plantillas de notificación](../../assets/screen-settings-templates.png)

| Plantilla           | Descripción                                         |
| :----------------- | :-------------------------------------------------- |
| **Éxito**        | Se utiliza cuando las copias de seguridad se completan con éxito.            |
| **Advertencia/Error**  | Se utiliza cuando las copias de seguridad se completan con advertencias o errores. |
| **Copia de seguridad vencida** | Se utiliza cuando las copias de seguridad están vencidas.                      |
| **Resumen Diario**  | Plantilla de correo electrónico en Markdown para la instantánea diaria opcional. |

<br/>

## Idioma de la plantilla {/* #template-language */}

Un selector de **Idioma de la plantilla** en la parte superior de la página le permite elegir el idioma para las plantillas predeterminadas (inglés, alemán, francés, español, portugués, hindi y chino simplificado). Cambiar el idioma actualiza la configuración regional para los valores predeterminados, pero las plantillas personalizadas existentes conservan su texto actual hasta que las actualice o utilice uno de los botones de restablecimiento.

<br/>

## Acciones Disponibles {/* #available-actions */}

| Botón                                                              | Descripción                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración de la plantilla" />                      | Guarda la configuración al cambiar la plantilla. El botón guarda la plantilla que se está mostrando (Éxito, Advertencia/Error, Copia de seguridad vencida o Resumen Diario). |
| <IconButton icon="lucide:send" label="Enviar notificación de prueba"/>     | Comprueba la plantilla después de actualizarla. Las variables se reemplazarán con sus nombres para la prueba. Para las notificaciones por correo electrónico, el título de la plantilla se convierte en la línea de asunto del correo electrónico. No disponible en la pestaña Resumen Diario. |
| <IconButton icon="lucide:rotate-ccw" label="Restablecer esta plantilla a valores predeterminados"/> | Restaura la plantilla predeterminada para la **plantilla seleccionada** (la pestaña actual). Recuerde guardar después de restablecer. |
| <IconButton icon="lucide:rotate-ccw" label="Restablecer todo a valores predeterminados"/> | Restaura todas las plantillas (Éxito, Advertencia/Error, Copia de seguridad vencida y Resumen Diario) a los valores predeterminados para el Idioma de la plantilla seleccionado. Recuerde guardar después de restablecer. |

<br/>

## Variables {/* #variables */}

Los cuerpos de los correos electrónicos son Markdown. Se admiten encabezados, listas, enlaces y tablas. Los valores de los marcadores de posición se insertan como texto escapado y no pueden introducir Markdown o HTML. El HTML sin procesar incrustado anteriormente en plantillas personalizadas ahora está escapado. NTFY recibe el mismo Markdown, excepto las tablas GFM: la fila de encabezado se omite y las filas del cuerpo se envían como texto plano, para cualquier diseño de columna.

Los cuerpos predeterminados de Éxito, Advertencia/Error y Vencida utilizan el mismo estilo Markdown que el Resumen Diario: un encabezado, valores en negrita y una tabla de vista general. Los valores predeterminados sin modificar se actualizan al cargar; las plantillas personalizadas se conservan.

Todas las plantillas de Éxito, Advertencia/Error y Vencida admiten variables que se reemplazarán con valores reales. La siguiente tabla muestra las variables disponibles:

| Variable               | Descripción                                     | Disponible en     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Nombre del servidor.                             | Éxito, Advertencia, Vencida |
| `{server_alias}`       | Alias del servidor.                            | Éxito, Advertencia, Vencida |
| `{server_note}`        | Nota para el servidor.                            | Éxito, Advertencia, Vencida |
| `{server_url}`         | URL de la configuración web del servidor Duplicati   | Éxito, Advertencia, Vencida |
| `{backup_name}`        | Nombre de la copia de seguridad.                             | Éxito, Advertencia, Vencida |
| `{status}`             | Estado de la copia de seguridad (Éxito, Advertencia, Error, Fatal). | Éxito, Advertencia |
| `{backup_date}`        | Fecha y hora de la copia de seguridad.                    | Éxito, Advertencia |
| `{duration}`           | Duración de la copia de seguridad.                         | Éxito, Advertencia |
| `{uploaded_size}`      | Cantidad de datos subidos.                        | Éxito, Advertencia |
| `{storage_size}`       | Información de uso de almacenamiento.                      | Éxito, Advertencia |
| `{available_versions}` | Número de versiones de copia de seguridad disponibles.            | Éxito, Advertencia |
| `{file_count}`         | Número de archivos procesados.                      | Éxito, Advertencia |
| `{file_size}`          | Tamaño total de los archivos respaldados.                  | Éxito, Advertencia |
| `{messages_count}`     | Número de mensajes.                             | Éxito, Advertencia |
| `{warnings_count}`     | Número de advertencias.                             | Éxito, Advertencia |
| `{errors_count}`       | Número de errores.                               | Éxito, Advertencia |
| `{log_text}`           | Líneas de registro de advertencias y errores (no registros de información completos). NTFY usa un resumen corto y puede truncar. | Éxito, Advertencia |
| `{last_backup_date}`   | Fecha de la última copia de seguridad.                        | Vencida          |
| `{last_elapsed}`       | Tiempo transcurrido desde la última copia de seguridad.             | Vencida          |
| `{expected_date}`      | Fecha esperada de la copia de seguridad.                           | Vencida          |
| `{expected_elapsed}`   | Tiempo transcurrido desde la fecha esperada.           | Vencida          |
| `{backup_interval}`    | Cadena de intervalo (por ejemplo, "1D", "2W", "1M").       | Vencida          |
| `{overdue_tolerance}`  | Configuración de tolerancia para trabajos vencidos.                      | Vencida          |

Las plantillas de Resumen Diario usan un conjunto diferente de variables para la instantánea del estado actual:

| Variable | Descripción |
|:---------|:------------|
| `{summary_date}` | Fecha del calendario local de la instantánea |
| `{generated_at}` | Fecha y hora en que se generó la instantánea |
| `{time_zone}` | Zona horaria IANA guardada |
| `{server_count}` / `{job_count}` | Servidores y trabajos conocidos |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | Cubetas de estado mutuamente excluyentes |
| `{overdue_count}` | Trabajos vencidos (ortogonales al estado; pueden solaparse con las cubetas anteriores) |
| `{problem_table}` / `{all_jobs_table}` | Tablas generadas de trabajos que requieren atención y todos los trabajos. Columnas: Servidor, Copia de seguridad, Vencida, Últ. estado, Últ. resultado, Duración, Advertencias, Errores, Subido. |
| `{duplistatus_link}` | Enlace al panel de duplistatus (omitido cuando no se configura una URL pública). Prefiera esto sobre enlaces de Markdown construidos manualmente. |
| `{duplistatus_url}` | Misma URL como texto plano (vacío cuando no se configura una URL pública). |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | Totales de últimos resultados |

El asunto del correo electrónico de Resumen Diario predeterminado es:

```text
Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal
```

Los asuntos predeterminados almacenados sin modificar se actualizan a este formato. Los asuntos personalizados se dejan sin cambios. `{unknown_count}` y `{no_report_count}` permanecen en el cuerpo del correo electrónico, no en el asunto predeterminado.

Use **Vista previa** para renderizar el asunto del correo electrónico, HTML y texto plano sin enviar. Las vistas previas de Éxito, Advertencia/Error y Vencida también incluyen la carga útil de Markdown de NTFY. La vista previa se abre en un diálogo. Los botones de HTML del correo electrónico / texto plano / NTFY se sitúan encima del asunto. El HTML del correo electrónico sigue el tema claro u oscuro actual.
