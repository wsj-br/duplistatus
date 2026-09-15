# Gestión de Configuración {/* #configuration-management */}

## Obtener Configuración de Correo Electrónico - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **Punto final**: `/api/configuration/email`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de notificaciones por correo electrónico y si las notificaciones por correo electrónico están habilitadas/configuradas.
- **Autenticación**: Requiere sesión válida y token CSRF
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

- **Respuestas de Error**:
  - `400`: La clave maestra es inválida - Todas las contraseñas y configuraciones cifradas deben ser reconfiguradas
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error al obtener la configuración de correo electrónico
- **Notas**:
  - Devuelve la configuración sin contraseña por seguridad
  - Incluye el campo `hasPassword` para indicar si la contraseña está configurada
  - Incluye los campos `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress`, y `requireAuth`
  - Indica si las notificaciones por correo electrónico están disponibles para uso de prueba y producción
  - Maneja errores de validación de la clave maestra de manera elegante

## Actualizar Configuración de Correo Electrónico - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **Punto final**: `/api/configuration/email`
- **Método**: POST
- **Descripción**: Actualiza la configuración de notificaciones por correo electrónico SMTP.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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

- **Respuestas de Error**:
  - `400`: Campos requeridos faltantes o número de puerto inválido
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error al guardar la configuración SMTP
- **Notas**:
  - Todos los campos (host, port, username, password, mailto) son requeridos
  - El puerto debe ser un número válido entre 1 y 65535
  - El campo seguro es booleano (true para SSL/TLS)
  - La contraseña se gestiona por separado a través del punto final de contraseña

## Eliminar Configuración de Correo Electrónico - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **Punto final**: `/api/configuration/email`
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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `404`: No se encontró configuración SMTP para eliminar
  - `500`: Error al eliminar la configuración SMTP
- **Notas**:
  - Esta operación elimina permanentemente la configuración SMTP
  - Devuelve 404 si no existe configuración para eliminar
  - Devuelve 400 mientras el modo Resumen Diario está habilitado, porque ese modo requiere SMTP

## Actualizar Contraseña de Correo Electrónico - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **Punto final**: `/api/configuration/email/password`
- **Método**: PATCH
- **Descripción**: Actualiza la contraseña de correo electrónico para la autenticación SMTP.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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

- **Respuestas de Error**:
  - `400`: La contraseña debe ser una cadena o faltan campos de configuración requeridos
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error al actualizar la contraseña de correo electrónico
- **Notas**:
  - La contraseña puede ser una cadena vacía para borrar la contraseña
  - Si no existe configuración SMTP, crea una mínima a partir de la configuración proporcionada
  - El parámetro de configuración es requerido cuando no existe configuración SMTP existente
  - La contraseña se almacena de manera segura usando cifrado

## Obtener Token CSRF de Contraseña de Correo Electrónico - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
- **Punto final**: `/api/configuration/email/password`
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
  - `401`: Sesión no válida o expirada
  - `500`: Error al generar el token CSRF
- **Notas**:
  - Devuelve el token CSRF para su uso con operaciones de actualización de contraseña
  - La sesión debe ser válida para generar el token

## Obtener configuración unificada - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **Endpoint**: `/api/configuration/unified`
- **Método**: GET
- **Descripción**: Recupera un objeto de configuración unificada que contiene todos los datos de configuración, incluyendo la configuración de cron, la frecuencia de notificación y los servidores con copias de seguridad.
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
  - Devuelve todos los datos de configuración en una sola respuesta
  - Incluye la configuración de cron, la frecuencia de notificación y los servidores con copias de seguridad
  - La configuración de correo electrónico incluye el campo `hasPassword` pero no la contraseña real
  - Recupera todos los datos en paralelo para mejorar el rendimiento

## Obtener configuración de NTFY - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **Endpoint**: `/api/configuration/ntfy`
- **Método**: GET
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

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error al recuperar la configuración de NTFY
- **Notas**:
  - Devuelve la configuración actual de NTFY
  - Se utiliza para la gestión del sistema de notificaciones
  - Requiere autenticación para acceder a los datos de configuración

## Obtener configuración de notificaciones - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **Endpoint**: `/api/configuration/notifications`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de la frecuencia de notificación.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: Error al recuperar la configuración
- **Notas**:
  - Recupera la configuración actual de la frecuencia de notificación
  - Se utiliza para la gestión de notificaciones de copias de seguridad vencidas
  - Devuelve uno de: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Actualizar configuración de notificaciones - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **Endpoint**: `/api/configuration/notifications`
- **Método**: POST
- **Descripción**: Actualiza la configuración de notificaciones (configuración de NTFY o frecuencia de notificación).
- **Autenticación**: Requiere sesión y token CSRF válidos
- **Cuerpo de la solicitud**:
  Para la configuración de NTFY:

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

Para la frecuencia de notificación:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Respuesta**:
  Para la configuración de NTFY:

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

Para la frecuencia de notificación:

  ```json
  {
    "value": "every_week"
  }
  ```

- **Valores disponibles**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `400`: Configuración de NTFY es requerida o valor inválido
  - `500`: Error del servidor al actualizar la configuración de notificaciones
- **Notas**:
  - Soporta la actualización de configuración de NTFY y frecuencia de notificación
  - Actualiza solo la configuración de NTFY cuando se proporciona el campo ntfy
  - Actualiza la frecuencia de notificación cuando se proporciona el campo valor
  - Genera un tema predeterminado si no se proporciona ninguno
  - Preserva la configuración existente
  - Usa el campo `accessToken` en lugar de campos de nombre de usuario y contraseña separados
  - Valida el valor de la frecuencia de notificación contra las opciones permitidas
  - Afecta la frecuencia con la que se envían notificaciones de copias de seguridad vencidas

## Actualizar configuración de copias de seguridad - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **Endpoint**: `/api/configuration/backup-settings`
- **Método**: POST
- **Descripción**: Actualiza la configuración de notificaciones de copias de seguridad para servidores/copias de seguridad específicas.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `400`: backupSettings es requerido
  - `500`: Error del servidor al actualizar la configuración de copias de seguridad
- **Notas**:
  - Actualiza la configuración de notificaciones de copia de seguridad para servidores/copias de seguridad específicas
  - Limpia las notificaciones de copia de seguridad vencidas para copias de seguridad desactivadas
  - Borra las notificaciones cuando cambian los ajustes de tiempo de espera

## Actualizar Plantillas de Notificaciones - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **Endpoint**: `/api/configuration/templates`
- **Método**: POST
- **Descripción**: Actualiza las plantillas de notificaciones.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `400`: Se requieren plantillas
  - `500`: Error del servidor al actualizar las plantillas de notificaciones
- **Notas**:
  - Actualiza las plantillas de notificaciones para diferentes estados de copia de seguridad
  - Conserva la configuración existente
  - Las plantillas admiten cuerpos de correo electrónico en Markdown y sustitución de `{placeholder}`
  - Se requiere una plantilla de correo electrónico `dailySummary` (asunto y cuerpo en Markdown)

## Resumen Diario - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **Endpoint**: `/api/configuration/daily-summary`
- **Método**: GET, POST
- **Descripción**: Lee o actualiza el modo Resumen Diario. GET devuelve la configuración sanitizada, la salud del despachador, la próxima ocurrencia y el estado de entrega del correo electrónico. POST guarda `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (zona horaria IANA del navegador de la última guardada), `publicUrl` opcional y `smtpRecipient` opcional (vacío usa el destinatario SMTP de la configuración de correo electrónico). La activación requiere SMTP válido. Cambiar `utcTime` actualiza `daily-summary-dispatch` a `minute hour * * *` UTC y recarga el servicio cron. Cambiar el horario establece la próxima ocurrencia **futura**.
- **Autenticación**: GET requiere una sesión y un token CSRF válidos. POST requiere una sesión de administrador y un token CSRF.
- **Respuestas de Error**:
  - `400`: Hora/hora no válida, URL pública no válida, destinatario SMTP no válido o falta SMTP
  - `401`: No autorizado
  - `500`: Error al leer o actualizar el Resumen Diario

## Enviar Resumen Diario - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **Endpoint**: `/api/configuration/daily-summary/send`
- **Método**: POST
- **Descripción**: Envía una instantánea de estado actual adicional. No consume la próxima ocurrencia programada. Usa el SMTP almacenado. Envía a `daily_summary.smtpRecipient` cuando esté configurado, de lo contrario al destinatario de la configuración de correo electrónico. No acepta direcciones de destinatario en la solicitud. Registra `daily_summary_sent` en el registro de auditoría (sistema).
- **Autenticación**: Requiere sesión de administrador y token CSRF

## Reintentar Resumen Diario - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **Endpoint**: `/api/configuration/daily-summary/retry`
- **Método**: POST
- **Descripción**: Reintenta los canales fallidos desde el payload persistente. Cuerpo `{ "occurrenceKey": "..." }` opcional; de lo contrario, reintenta el último envío de correo electrónico fallido.
- **Autenticación**: Requiere sesión de administrador y token CSRF

## Vista Previa del Resumen Diario - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **Endpoint**: `/api/configuration/daily-summary/preview`
- **Método**: POST
- **Descripción**: Representa la instantánea actual sin enviar y sin escribir filas del registro de entrega.
- **Autenticación**: Requiere sesión y token CSRF válidos

## Obtener Tolerancia de Vencimiento - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de tolerancia de vencimiento.
- **Respuesta**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Respuestas de Error**:
  - `500`: Error al obtener la tolerancia de vencimiento
- **Notas**:
  - Devuelve la configuración actual de tolerancia de vencimiento
  - Usado para mostrar la configuración actual

## Actualizar Tolerancia de Vencimiento - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: POST
- **Descripción**: Actualiza la configuración de tolerancia de vencimiento.
- **Autenticación**: Requiere una sesión válida y un token CSRF
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

- **Respuestas de Error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `400`: Se requiere overdue_tolerance
  - `500`: Error del servidor al actualizar la tolerancia de vencimiento
- **Notas**:
  - Actualiza la configuración de tolerancia de vencimiento (acepta formato de cadena como `"1h"`, `"2h"`, etc.; el valor predeterminado para nuevas instalaciones es `2h`)
  - Afecta cuándo se consideran las copias de seguridad vencidas
  - Usado por el verificador de copias de seguridad vencidas

## Seguridad de APIs externas - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **Punto final**: `/api/configuration/external-api-security`
- **Métodos**: GET, PATCH
- **Descripción**: Lee o actualiza si las APIs externas requieren una clave, además del tamaño de `/api/upload` y los límites de velocidad.
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
- **Punto final**: `/api/configuration/ip-allowlist`
- **Métodos**: GET, PATCH
- **Descripción**: Lee o actualiza los proxies de confianza y las listas de CIDR permitidas para administradores y APIs externas. Habilitar la lista de administradores fallará a menos que la IP del cliente actual ya esté en la lista (el bucle de retroalimentación está exento).
- **Autenticación**: Requiere privilegios de administrador, sesión válida y token CSRF
