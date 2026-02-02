---
translation_last_updated: '2026-01-31T00:51:29.185Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: ce396051346ba380
translation_language: es
source_file_path: user-guide/settings/notification-templates.md
---
# Plantillas {#templates}

**duplistatus** utiliza tres plantillas para mensajes de notificación. Estas plantillas se utilizan tanto para notificaciones NTFY como para Notificaciones por correo electrónico:

![notification templates](../../assets/screen-settings-templates.png)

| Plantilla          | Descripción                                              |
| :----------------- | :------------------------------------------------------- |
| **Éxito**          | Se utiliza cuando los backups se completan exitosamente. |
| **Advertencia/Error** | Se utiliza cuando los backups se completan con advertencias o errores. |
| **Backup retrasado** | Se utiliza cuando los backups están retrasados.         |

<br/>

## Acciones disponibles {#available-actions}

| Botón                                                              | Descripción                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración de plantilla" />                      | Guarda la configuración al cambiar la plantilla. El botón guarda la plantilla que se muestra (Éxito, Advertencia/Error o Backup retrasado). |
| <IconButton icon="lucide:send" label="Enviar notificación de prueba"/>     | Verifica la plantilla después de actualizarla. Las variables se reemplazarán con sus nombres para la prueba. Para notificaciones por correo electrónico, el título de la plantilla se convierte en la línea de asunto del correo electrónico. |
| <IconButton icon="lucide:rotate-ccw" label="Restablecer a predeterminado"/>     | Restaura la plantilla predeterminada para la **plantilla seleccionada**. Recuerde guardarla después de restablecerla.  |

<br/>

## Variables {#variables}

Todas las plantillas admiten variables que se reemplazarán con valores reales. La siguiente tabla muestra las variables disponibles:

| Variable               | Descripción                                     | Disponible en   |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Nombre del servidor.                            | Todas las plantillas    |
| `{server_alias}`       | Alias del servidor.                            | Todas las plantillas    |
| `{server_note}`        | Nota para el servidor.                            | Todas las plantillas    |
| `{server_url}`         | URL del servidor Duplicati de configuración web   | Todas las plantillas    |
| `{backup_name}`        | Nombre del backup.                             | Todas las plantillas    |
| `{status}`             | Estado del backup (Éxito, Advertencia, Error, Fatal). | Éxito, Advertencia |
| `{backup_date}`        | Fecha y hora del backup.                    | Éxito, Advertencia |
| `{duration}`           | Duración del backup.                         | Éxito, Advertencia |
| `{uploaded_size}`      | Cantidad de datos enviados.                        | Éxito, Advertencia |
| `{storage_size}`       | Información de uso de almacenamiento.                      | Éxito, Advertencia |
| `{available_versions}` | Número de versiones de backup disponibles.            | Éxito, Advertencia |
| `{file_count}`         | Número de archivos procesados.                      | Éxito, Advertencia |
| `{file_size}`          | Tamaño total de archivos respaldados.                  | Éxito, Advertencia |
| `{messages_count}`     | Número de mensajes.                             | Éxito, Advertencia |
| `{warnings_count}`     | Número de advertencias.                             | Éxito, Advertencia |
| `{errors_count}`       | Número de errores.                               | Éxito, Advertencia |
| `{log_text}`           | Mensajes de registro (advertencias y errores)              | Éxito, Advertencia |
| `{last_backup_date}`   | Fecha del último backup.                        | Retrasado          |
| `{last_elapsed}`       | Tiempo transcurrido desde el último backup.             | Retrasado          |
| `{expected_date}`      | Fecha de backup esperada.                           | Retrasado          |
| `{expected_elapsed}`   | Tiempo transcurrido desde la fecha esperada.           | Retrasado          |
| `{backup_interval}`    | Cadena de intervalo (p. ej., "1D", "2W", "1M").       | Retrasado          |
| `{overdue_tolerance}`  | Configuración de tolerancia de retraso.                      | Retrasado          |
