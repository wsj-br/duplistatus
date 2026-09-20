# Gestión de la configuración {/* #configuration-management */}

## Obtener configuración de correo electrónico - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **Endpoint**: `/api/configuration/email`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de notificaciones por correo electrónico y si las notificaciones por correo electrónico están habilitadas/configuradas.
- **Autenticación**: Requiere una sesión y un token CSRF válidos
- **Respuesta** (configurado):

  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "message": "Email is configured and ready to use."
  }
  ```

- **Respuesta** (no configurado):

  ```json
  {
    "configured": false,
    "config": null,
    "message": "Email is not configured. Please configure SMTP settings."
  }
  ```

- **Respuestas de error**:
  - `400`: La clave maestra no es válida - Todos los ajustes y contraseñas cifrados deben volver a configurarse
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `500`: Fallo al obtener la configuración del correo electrónico
- **Notas**:
  - Devuelve la configuración sin la contraseña por motivos de seguridad
  - Incluye el campo `hasPassword` para indicar si la contraseña está configurada
  - Incluye los campos `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` y `requireAuth`
  - Indica si las notificaciones por correo electrónico están disponibles para pruebas y para su uso en producción
  - Gestiona de forma fluida los errores de validación de la clave maestra

## Actualizar la configuración de correo electrónico - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **Endpoint**: `/api/configuration/email`
- **Método**: POST
- **Descripción**: Actualiza la configuración de notificaciones por correo electrónico SMTP.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "username": "user@example.com",
    "password": "password",
    "mailto": "admin@example.com"
  }
  ```

- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```

- **Respuestas de error**:
  - `400`: Faltan campos obligatorios o el número de puerto no es válido
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `500`: Fallo al guardar la configuración de SMTP
- **Notas**:
  - Todos los campos (host, port, username, password, mailto) son obligatorios
  - El puerto debe ser un número válido entre 1 y 65535
  - El campo secure es booleano (true para SSL/TLS)
  - La contraseña se gestiona por separado a través del endpoint de contraseña

## Eliminar configuración de correo electrónico - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **Endpoint**: `/api/configuration/email`
- **Método**: DELETE
- **Descripción**: Elimina la configuración de notificaciones por correo electrónico SMTP.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `404`: No se ha encontrado ninguna configuración de SMTP para eliminar
  - `500`: Fallo al eliminar la configuración de SMTP
- **Notas**:
  - Esta operación elimina permanentemente la configuración de SMTP
  - Devuelve 404 si no existe ninguna configuración para eliminar
  - Devuelve 400 mientras el modo de Resumen Diario esté habilitado, ya que ese modo requiere SMTP

## Actualizar la contraseña de correo electrónico - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **Endpoint**: `/api/configuration/email/password`
- **Método**: PATCH
- **Descripción**: Actualiza la contraseña de correo electrónico para la autenticación SMTP.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "password": "new-password",
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com"
    }
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Email password updated successfully"
  }
  ```

- **Respuestas de error**:
  - `400`: La contraseña debe ser una cadena o faltan campos de configuración requeridos
  - `401`: No autorizado - Sesión inválida o token CSRF incorrecto
  - `500`: Error al actualizar la contraseña de correo electrónico
- **Notas**:
  - La contraseña puede ser una cadena vacía para borrar la contraseña
  - Si no existe configuración SMTP, crea una mínima a partir de la configuración proporcionada
  - El parámetro de configuración es obligatorio cuando no existe configuración SMTP existente
  - La contraseña se almacena de forma segura mediante cifrado

## Obtener token CSRF de contraseña de correo electrónico - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
- **Punto de conexión**: `/api/configuration/email/password`
- **Método**: GET
- **Descripción**: Recupera un token CSRF para operaciones de contraseña de correo electrónico.
- **Autenticación**: Requiere sesión válida
- **Respuesta**:

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **Respuestas de error**:
  - `401`: Sesión inválida o expirada
  - `500`: Error al generar token CSRF
- **Notas**:
  - Devuelve token CSRF para usar con operaciones de actualización de contraseña
  - La sesión debe ser válida para generar el token

## Obtener configuración unificada - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **Punto de conexión**: `/api/configuration/unified`
- **Método**: GET
- **Descripción**: Recupera un objeto de configuración unificado que contiene todos los datos de configuración, incluida la configuración de cron, la frecuencia de notificación y los servidores con copias de seguridad.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en-GB",
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {server_name}",
        "message": "The backup {backup_name} is overdue on {server_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      },
      "dailySummary": {
        "email": {
          "title": "Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal",
          "message": "## Daily backup summary"
        }
      }
    },
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "overdue_tolerance": "2h",
    "backup_settings": {
      "server1:backup1": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours",
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    },
    "serverAddresses": [
      {
        "id": "server1",
        "name": "Server 1",
        "server_url": "http://localhost:8200"
      }
    ],
    "cronConfig": {
      "cronExpression": "*/20 * * * *",
      "enabled": true
    },
    "notificationFrequency": "every_day",
    "serversWithBackups": [
      {
        "id": "server1",
        "name": "Server 1",
        "backupName": "backup1",
        "server_url": "http://localhost:8200",
        "alias": "My Server",
        "note": "Primary backup server",
        "hasPassword": true,
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    ]
  }
  ```

- **Respuestas de error**:
  - `500`: Error del servidor al recuperar la configuración unificada
- **Notas**:
  - Devuelve todos los datos de configuración en una única respuesta
  - Incluye configuración de cron, frecuencia de notificación y servidores con copias de seguridad
  - La configuración de correo electrónico incluye el campo `hasPassword` pero no la contraseña real
  - Recupera todos los datos en paralelo para mejor rendimiento

## Obtener Configuración de NTFY - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **Endpoint**: `/api/configuration/ntfy`
- **Method**: GET
- **Descripción**: Recupera la configuración actual de NTFY.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión inválida o token CSRF incorrecto
  - `500`: Fallido al obtener Configuración de NTFY
- **Notas**:
- Devuelve la Configuración de NTFY actual
- Se utiliza para la gestión del sistema de notificaciones
- Requiere autenticación para acceder a los datos de configuración

## Obtener configuración de notificación - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **Punto de conexión**: `/api/configuration/notifications`
- **Método**: GET
- **Descripción**: Recupera la configuración de frecuencia de notificación actual.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión inválida o token CSRF incorrecto
  - `500`: Error al recuperar la configuración
- **Notas**:
  - Recupera la configuración de frecuencia de notificación actual
  - Se utiliza para la gestión de notificaciones de copia de seguridad vencida
  - Devuelve uno de: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Actualizar Configuración de Notificaciones - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **Endpoint**: `/api/configuration/notifications`
- **Method**: POST
- **Descripción**: Actualiza la configuración de notificaciones (Configuración de NTFY o frecuencia de notificaciones).
- **Autenticación**: Requiere una sesión válida y un token CSRF
- **Cuerpo de la solicitud**:
  Para la Configuración de NTFY:

  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Para la Frecuencia de notificación:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Respuesta**:
  Para la Configuración de NTFY:

  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Para la Frecuencia de notificación:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Valores disponibles**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `400`: La Configuración de NTFY es obligatoria o el valor no es válido
  - `500`: Error del Servidor al actualizar la configuración de Notificaciones
- **Notas**:
  - Admite actualizaciones tanto de la Configuración de NTFY como de la Frecuencia de notificación
  - Actualiza únicamente la Configuración de NTFY cuando se proporciona el campo ntfy
  - Actualiza la Frecuencia de notificación cuando se proporciona el campo value
  - Genera un tema predeterminado si no se proporciona ninguno
  - Conserva los ajustes de configuración existentes
  - Usos del campo `accessToken` en lugar de campos independientes para Nombre de usuario/Contraseña
  - Valida el valor de la Frecuencia de notificación comparándolo con las opciones permitidas
  - Afecta a la frecuencia con la que se envían las Notificaciones de Copia de seguridad Vencida

## Actualizar la configuración de la Copia de seguridad - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **Endpoint**: `/api/configuration/backup-settings`
- **Método**: POST
- **Descripción**: Actualiza la configuración de las Notificaciones de Copia de Seguridad para Servidores/copias de seguridad específicos.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    }
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `400`: backupSettings es obligatorio
  - `500`: Error del Servidor al actualizar la configuración de la Copia de seguridad
- **Notas**:
  - Actualiza la configuración de las Notificaciones de Copia de Seguridad para Servidores/copias de seguridad específicos
  - Limpia las Notificaciones de Copia de Seguridad Vencida para copias de seguridad en estado Desactivado
  - Borra las Notificaciones cuando cambia la configuración del tiempo de espera

## Actualizar Plantillas de Notificaciones - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **Endpoint**: `/api/configuration/templates`
- **Método**: POST
- **Descripción**: Actualiza las Plantillas de notificación.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      }
    }
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válidos
  - `400`: templates es obligatorio
  - `500`: Error del Servidor al actualizar las Plantillas de notificación
- **Notas**:
  - Actualiza las Plantillas de notificación para distintos estados de Copia de seguridad
  - Conserva los ajustes de configuración existentes
  - Las Plantillas admiten cuerpos de Correo electrónico en Markdown y sustitución de `{placeholder}`
  - Se requiere una plantilla de Correo electrónico `dailySummary` (Asunto y cuerpo en Markdown)

## Resumen Diario - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **Endpoint**: `/api/configuration/daily-summary`
- **Método**: GET, POST
- **Descripción**: Lee o actualiza el Modo resumen diario. GET devuelve la configuración saneada, el estado del despachador, la Siguiente ejecución y el Estado de entrega del Correo electrónico. POST guarda `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (zona horaria IANA del navegador del último Guardar), `publicUrl` opcional y `smtpRecipient` opcional (si está vacío, utiliza el Destinatario SMTP de la Configuración de correo electrónico). La activación requiere un SMTP válido. Modificar `utcTime` actualiza `daily-summary-dispatch` a `minute hour * * *` UTC y recarga el servicio cron. Modificar la programación establece la **próxima** ejecución futura.
- **Autenticación**: GET requiere una sesión válida y token CSRF. POST requiere una sesión de administrador y token CSRF.
- **Respuestas de error**:
  - `400`: Hora/zona horaria no válida, URL pública no válida, destinatario SMTP no válido o SMTP faltante
  - `401`: No autorizado
  - `500`: Error al leer o actualizar Resumen Diario

## Enviar Resumen Diario - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **Endpoint**: `/api/configuration/daily-summary/send`
- **Método**: POST
- **Descripción**: Envía una instantánea de estado actual adicional inmediatamente. No consume la siguiente ocurrencia programada. Utiliza SMTP almacenado. Envía a `daily_summary.smtpRecipient` cuando está configurado, de lo contrario al destinatario de configuración de correo electrónico. No acepta direcciones de destinatarios en la solicitud. Registra `daily_summary_sent` en el registro de auditoría (sistema).
- **Autenticación**: Requiere sesión de administrador y token CSRF

## Reintentar Resumen Diario - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **Endpoint**: `/api/configuration/daily-summary/retry`
- **Método**: POST
- **Descripción**: Reintenta canales fallidos de la carga persistida. Cuerpo opcional `{ "occurrenceKey": "..." }`; de lo contrario, reintenta el último envío de correo electrónico fallido.
- **Autenticación**: Requiere sesión de administrador y token CSRF

## Vista previa de Resumen Diario - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **Endpoint**: `/api/configuration/daily-summary/preview`
- **Método**: POST
- **Descripción**: Representa la instantánea actual sin enviar y sin escribir filas del registro de entrega.
- **Autenticación**: Requiere sesión válida y token CSRF

## Obtener Tolerancia de Vencimiento - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: GET
- **Descripción**: Recupera la configuración de tolerancia de vencimiento actual.
- **Respuesta**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Respuestas de error**:
  - `500`: Error al obtener tolerancia de vencimiento
- **Notas**:
  - Devuelve la configuración de tolerancia de vencimiento actual
  - Se utiliza para mostrar la configuración actual

## Actualizar Tolerancia de Vencimiento - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: POST
- **Descripción**: Actualiza la configuración de tolerancia de vencimiento.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Respuesta**:

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `400`: overdue_tolerance es obligatorio
  - `500`: Error del servidor al actualizar tolerancia de vencimiento
- **Notas**:
  - Actualiza la configuración de tolerancia de vencimiento (acepta formato de cadena como `"1h"`, `"2h"`, etc.; el valor predeterminado para nuevas instalaciones es `2h`)
  - Afecta cuándo se consideran vencidas las copias de seguridad
  - Utilizado por el verificador de copia de seguridad vencida

## Seguridad de APIs Externas - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **Endpoint**: `/api/configuration/external-api-security`
- **Métodos**: GET, PATCH
- **Descripción**: Lee o actualiza si las APIs externas requieren una clave, además del tamaño de `/api/upload` y límites de velocidad.
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
- **Cuerpo PATCH**:

  ```json
  {
    "requireApiKey": false,
    "uploadLimits": {
      "enabled": true,
      "maxBytes": 5242880,
      "perMinute": 20,
      "perHour": 200
    }
  }
  ```

## Lista de IPs permitidas - `/api/configuration/ip-allowlist` {/* #ip-allowlist---apiconfigurationip-allowlist */}
- **Endpoint**: `/api/configuration/ip-allowlist`
- **Métodos**: GET, PATCH
- **Descripción**: Lee o actualiza proxies de confianza y listas CIDR de permitidos para administrador / API externa. Habilitar la lista de administrador falla a menos que la IP del cliente actual ya esté en la lista (loopback está exento).
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
