---
translation_last_updated: '2026-04-17T23:59:49.987Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: 5e308885291fd834e969c761cd470e1b54c82eee0c672140c1203f8d9cfca674
translation_language: es
source_file_path: documentation/docs/api-reference/configuration-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Gestión de configuración {#configuration-management}

## Obtener configuración de correo electrónico - `/api/configuration/email` {#get-email-configuration-apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de notificaciones por correo y si las notificaciones por correo están habilitadas/configuradas.
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

- **Respuestas de error**:
  - `400`: La clave maestra no es válida - Todas las contraseñas y configuraciones cifradas deben reconfigurarse
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `500`: No se pudo obtener la configuración de correo
- **Notas**:
  - Devuelve la configuración sin la contraseña por seguridad
  - Incluye el campo `hasPassword` para indicar si la contraseña está establecida
  - Incluye los campos `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` y `requireAuth`
  - Indica si las notificaciones por correo están disponibles para uso de prueba y producción
  - Maneja los errores de validación de clave maestra correctamente

## Actualizar configuración de correo electrónico - `/api/configuration/email` {#update-email-configuration-apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Método**: POST
- **Descripción**: Actualiza la configuración de notificaciones por correo SMTP.
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
  - `400`: Faltan campos obligatorios o número de puerto no válido
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `500`: No se pudo guardar la configuración SMTP
- **Notas**:
  - Todos los campos (host, puerto, nombre de usuario, contraseña, mailto) son obligatorios
  - El puerto debe ser un número válido entre 1 y 65535
  - El campo secure es booleano (verdadero para SSL/TLS)
  - La contraseña se gestiona por separado a través del endpoint de contraseña

## Eliminar configuración de correo electrónico - `/api/configuration/email` {#delete-email-configuration-apiconfigurationemail}
- **Endpoint**: `/api/configuration/email`
- **Método**: DELETE
- **Descripción**: Elimina la configuración de notificaciones por correo SMTP.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `404`: No se encontró configuración SMTP para eliminar
  - `500`: No se pudo eliminar la configuración SMTP
- **Notas**:
  - Esta operación elimina permanentemente la configuración SMTP
  - Devuelve 404 si no existe ninguna configuración para eliminar

## Actualizar contraseña de correo electrónico - `/api/configuration/email/password` {#update-email-password-apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
- **Método**: PATCH
- **Descripción**: Actualiza la contraseña de correo para autenticación SMTP.
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
  - `400`: La contraseña debe ser una cadena o faltan campos de configuración obligatorios
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `500`: No se pudo actualizar la contraseña de correo electrónico
- **Notas**:
  - La contraseña puede ser una cadena vacía para borrar la contraseña
  - Si no existe una configuración SMTP, crea una mínima a partir de la configuración proporcionada
  - El parámetro de configuración es obligatorio cuando no existe una configuración SMTP existente
  - La contraseña se almacena de forma segura mediante cifrado

## Obtener token CSRF de contraseña de correo electrónico - `/api/configuration/email/password` {#get-email-password-csrf-token-apiconfigurationemailpassword}
- **Endpoint**: `/api/configuration/email/password`
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
  - `500`: Falló la generación del token CSRF
- **Notas**:
  - Devuelve el token CSRF para usarlo con operaciones de actualización de contraseña
  - La sesión debe ser válida para generar el token

## Obtener configuración unificada - `/api/configuration/unified` {#get-unified-configuration-apiconfigurationunified}
- **Endpoint**: `/api/configuration/unified`
- **Método**: GET
- **Descripción**: Recupera un objeto de configuración unificada que contiene todos los datos de configuración, incluyendo ajustes de cron, frecuencia de notificaciones y servidores con copias de seguridad.
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
      "language": "en",
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
    "overdue_tolerance": "1h",
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
  - `500`: Error del servidor al obtener la configuración unificada
- **Notas**:
  - Devuelve todos los datos de configuración en una sola respuesta
  - Incluye ajustes de cron, frecuencia de notificaciones y servidores con copias de seguridad
  - La configuración de correo incluye el campo `hasPassword` pero no la contraseña real
  - Obtiene todos los datos en paralelo para un mejor rendimiento

## Obtener configuración de NTFY - `/api/configuration/ntfy` {#get-ntfy-configuration-apiconfigurationntfy}
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
  - `500`: No se pudo obtener la configuración de NTFY
- **Notas**:
  - Devuelve la configuración actual de NTFY
  - Se utiliza para la gestión del sistema de notificaciones
  - Requiere autenticación para acceder a los datos de configuración

## Obtener configuración de notificación - `/api/configuration/notifications` {#get-notification-configuration-apiconfigurationnotifications}
- **Endpoint**: `/api/configuration/notifications`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de frecuencia de notificación.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `500`: No se pudo obtener la configuración
- **Notas**:
  - Recupera la configuración actual de frecuencia de notificación
  - Se utiliza para la gestión de notificaciones de copia de seguridad retrasada
  - Devuelve uno de: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Actualizar configuración de notificación - `/api/configuration/notifications` {#update-notification-configuration-apiconfigurationnotifications}
- **Endpoint**: `/api/configuration/notifications`
- **Método**: POST
- **Descripción**: Actualiza la configuración de notificación (ajustes de NTFY o frecuencia de notificación).
- **Autenticación**: Requiere sesión válida y token CSRF
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
  - `400`: La configuración de NTFY es obligatoria o el valor es inválido
  - `500`: Error del servidor al actualizar la configuración de notificación
- **Notas**:
  - Admite actualizaciones de configuración de NTFY y de frecuencia de notificación
  - Actualiza solo la configuración de NTFY cuando se proporciona el campo ntfy
  - Actualiza la frecuencia de notificación cuando se proporciona el campo value
  - Genera un tema predeterminado si no se proporciona ninguno
  - Conserva la configuración existente
  - Usa el campo `accessToken` en lugar de campos separados de nombre de usuario/contraseña
  - Valida el valor de frecuencia de notificación contra las opciones permitidas
  - Afecta la frecuencia con la que se envían las notificaciones retrasadas

## Actualizar configuración de copia de seguridad - `/api/configuration/backup-settings` {#update-backup-settings-apiconfigurationbackup-settings}
- **Endpoint**: `/api/configuration/backup-settings`
- **Método**: POST
- **Descripción**: Actualiza la configuración de notificación de copia de seguridad para servidores/copias específicas.
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
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `400`: backupSettings es obligatorio
  - `500`: Error del servidor al actualizar la configuración de copia de seguridad
- **Notas**:
  - Actualiza la configuración de notificación de copia de seguridad para servidores/copias específicas
  - Limpia las notificaciones de copia de seguridad retrasada para copias deshabilitadas
  - Borra las notificaciones cuando cambian los ajustes de tiempo de espera

## Actualizar plantillas de notificación - `/api/configuration/templates` {#update-notification-templates-apiconfigurationtemplates}
- **Endpoint**: `/api/configuration/templates`
- **Método**: POST
- **Descripción**: Actualiza las plantillas de notificación.
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
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `400`: las plantillas son obligatorias
  - `500`: Error del servidor al actualizar las plantillas de notificación
- **Notas**:
  - Actualiza las plantillas de notificación para diferentes estados de copia de seguridad
  - Conserva la configuración existente
  - Las plantillas admiten sustitución de variables

## Obtener tolerancia de retraso - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance-apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: GET
- **Descripción**: Recupera la configuración actual de tolerancia de retraso.
- **Respuesta**:

  ```json
  {
    "overdue_tolerance": "1h"
  }
  ```

- **Respuestas de error**:
  - `500`: No se pudo obtener la tolerancia de retraso
- **Notas**:
  - Devuelve la configuración actual de tolerancia de retraso
  - Se utiliza para mostrar la configuración actual

## Actualizar tolerancia de retraso - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance-apiconfigurationoverdue-tolerance}
- **Endpoint**: `/api/configuration/overdue-tolerance`
- **Método**: POST
- **Descripción**: Actualiza la configuración de tolerancia de retraso.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Cuerpo de la solicitud**:

  ```json
  {
    "overdue_tolerance": "1h"
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
  - `500`: Error del servidor al actualizar la tolerancia de retraso
- **Notas**:
  - Actualiza la configuración de tolerancia de retraso (acepta formato de cadena como "1h", "2h", etc.)
  - Afecta cuándo se consideran retrasadas las copias de seguridad
  - Utilizado por el comprobador de copia de seguridad retrasada
