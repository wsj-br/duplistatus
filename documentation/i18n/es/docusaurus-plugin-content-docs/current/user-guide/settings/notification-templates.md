# Plantillas {#templates}

**duplistatus** utiliza cuatro plantillas para los mensajes de notificación. Los cuerpos de los correos electrónicos son Markdown (encabezados, listas, enlaces y tablas). NTFY para Éxito, Advertencia/Error y Vencida se derivan del mismo contenido; el Resumen Diario tiene una plantilla NTFY separada y compacta.

La página incluye un selector de **Idioma de la plantilla** que establece la configuración regional para las plantillas predeterminadas. Cambiar el idioma actualiza la configuración regional para los nuevos valores predeterminados, pero **no** cambia el texto de las plantillas existentes. Para aplicar un nuevo idioma a sus plantillas, edítelas manualmente o utilice **Restablecer esta plantilla a valores predeterminados** (para la pestaña actual) o **Restablecer todo a valores predeterminados** (para todas las plantillas).

![plantillas de notificación](../../assets/screen-settings-templates.png)

| Plantilla           | Descripción                                         |
| :----------------- | :-------------------------------------------------- |
| **Éxito**        | Se utiliza cuando las copias de seguridad finalizan correctamente.            |
| **Advertencia/Error**  | Se utiliza cuando las copias de seguridad finalizan con advertencias o errores. |
| **Copia de seguridad retrasada** | Se utiliza cuando las copias de seguridad están retrasadas.                      |
| **Resumen Diario**  | Plantillas de correo electrónico y NTFY compactas para la instantánea diaria opcional. |

<br/>

## Idioma de Plantilla {#template-language}

Un selector de **Idioma de la plantilla** en la parte superior de la página le permite elegir el idioma de las plantillas predeterminadas (inglés, alemán, francés, español, portugués, hindi (romano) y chino simplificado). Cambiar el idioma actualiza la configuración regional de los valores predeterminados, pero las plantillas personalizadas existentes mantienen su texto actual hasta que las actualice o utilice uno de los botones de restablecimiento.

<br/>

## Acciones disponibles {#available-actions}

| Botón                                                              | Descripción                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración de la plantilla" />                      | Guarda la configuración al cambiar la plantilla. El botón guarda la plantilla que se está mostrando (Éxito, Advertencia/Error, Copia de seguridad vencida o Resumen Diario). |
| <IconButton icon="lucide:send" label="Enviar notificación de prueba"/>     | Comprueba la plantilla después de actualizarla. Las variables se sustituirán por sus nombres para la prueba. Para las notificaciones por correo, el título de la plantilla se convierte en la línea de asunto del correo. |
| <IconButton icon="lucide:rotate-ccw" label="Restablecer esta plantilla a los valores predeterminados"/> | Restablece la plantilla predeterminada para la **plantilla seleccionada** (la pestaña actual). Recuerde guardar después de restablecer. |
| <IconButton icon="lucide:rotate-ccw" label="Restablecer todo a valores predeterminados"/> | Restaura todas las plantillas (Éxito, Advertencia/Error, Copia de seguridad vencida y Resumen Diario) a los valores predeterminados para el Idioma de la plantilla seleccionado. Recuerde guardar después de restablecer. |

<br/>

## Variables {#variables}

Los cuerpos de los correos electrónicos son Markdown. Se admiten encabezados, listas, enlaces y tablas. Los valores de los marcadores de posición se insertan como texto escapado y no pueden introducir Markdown o HTML. El HTML sin procesar incrustado anteriormente en las plantillas personalizadas ahora está escapado.

Todas las plantillas de Éxito, Advertencia/Error y Vencida admiten variables que se reemplazarán con valores reales. La siguiente tabla muestra las variables disponibles:

| Variable               | Descripción                                     | Disponible en     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Nombre del servidor.                             | Éxito, Advertencia, Vencida |
| `{server_alias}`       | Alias del servidor.                            | Éxito, Advertencia, Vencida |
| `{server_note}`        | Nota del servidor.                            | Éxito, Advertencia, Vencida |
| `{server_url}`         | URL de la configuración web del servidor Duplicati   | Éxito, Advertencia, Vencida |
| `{backup_name}`        | Nombre de la copia de seguridad.                             | Éxito, Advertencia, Vencida |
| `{status}`             | Estado de la copia de seguridad (Éxito, Advertencia, Error, Fatal). | Éxito, Advertencia |
| `{backup_date}`        | Fecha y hora de la copia de seguridad.                    | Éxito, Advertencia |
| `{duration}`           | Duración de la copia de seguridad.                         | Éxito, Advertencia |
| `{uploaded_size}`      | Cantidad de datos subidos.                        | Éxito, Advertencia |
| `{storage_size}`       | Información sobre el uso del almacenamiento.                      | Éxito, Advertencia |
| `{available_versions}` | Número de versiones de respaldo disponibles.            | Éxito, Advertencia |
| `{file_count}`         | Número de archivos procesados.                      | Éxito, Advertencia |
| `{file_size}`          | Tamaño total de los archivos respaldados.                  | Éxito, Advertencia |
| `{messages_count}`     | Número de mensajes.                             | Éxito, Advertencia |
| `{warnings_count}`     | Número de advertencias.                             | Éxito, Advertencia |
| `{errors_count}`       | Número de errores.                               | Éxito, Advertencia |
| `{log_text}`           | Mensajes de registro (advertencias y errores)              | Éxito, Advertencia |
| `{last_backup_date}`   | Fecha de la última copia de seguridad.                        | Retrasado          |
| `{last_elapsed}`       | Tiempo transcurrido desde la última copia de seguridad.             | Retrasado          |
| `{expected_date}`      | Fecha esperada de la copia de seguridad.                           | Retrasado          |
| `{expected_elapsed}`   | Tiempo transcurrido desde la fecha esperada.           | Retrasado          |
| `{backup_interval}`    | Cadena de intervalo (por ejemplo, "1D", "2S", "1M").       | Retrasado          |
| `{overdue_tolerance}`  | Configuración de tolerancia retrasada.                      | Retrasado          |

Las plantillas de Resumen Diario utilizan un conjunto diferente de variables para la instantánea de estado actual:

| Variable | Descripción |
|:---------|:------------|
| `{summary_date}` | Fecha del calendario local de la instantánea |
| `{generated_at}` | Fecha y hora en que se generó la instantánea |
| `{time_zone}` | Zona horaria IANA guardada |
| `{server_count}` / `{job_count}` | Servidores y trabajos conocidos |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | Cubetas de estado mutuamente excluyentes |
| `{overdue_count}` | Trabajos vencidos (ortogonales al estado) |
| `{problem_table}` / `{all_jobs_table}` | Tablas generadas de trabajos pendientes de atención y todos los trabajos. Columnas: Servidor, Copia de seguridad, Vencida, Últ. estado, Últ. resultado, Duración, Advertencias, Errores, Subido. |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | Totales de resultados más recientes |

Use **Vista previa** to render HTML del correo electrónico, texto plano, y NTFY without sending. The preview opens in a dialog. HTML del correo electrónico follows the current light or dark theme.
