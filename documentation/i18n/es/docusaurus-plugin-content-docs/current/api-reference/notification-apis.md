# Sistema de notificaciones {/* #notification-system */}

## Notificación de prueba - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Punto final**: `/api/notifications/test`
- **Método**: POST
- **Descripción**: Envía notificaciones de prueba (simples, basadas en plantillas o correo electrónico) para verificar la configuración de notificaciones.
- **Autenticación**: Requiere sesión de administrador y token CSRF
- **Cuerpo de la solicitud**:
  Para prueba simple:

    ```json
    {
      "type": "simple",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      }
    }
    ```

Para prueba de plantilla:

    ```json
    {
      "type": "template",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      },
      "template": {
        "title": "Test Title",
        "message": "Test message with {variable}",
        "priority": "default",
        "tags": "test"
      }
    }
    ```

Para prueba de correo electrónico:

    ```json
    {
      "type": "email"
    }
    ```

- **Respuesta**:
  Para prueba simple:

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

Para prueba de plantilla:

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

Para prueba de correo electrónico:

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

El contenido del correo de prueba muestra:
  - Nombre de host y puerto del servidor SMTP
  - Tipo de conexión (SMTP simple, STARTTLS o SSL/TLS directo)
  - Estado del requisito de autenticación SMTP
  - Nombre de usuario SMTP (solo se muestra cuando se requiere autenticación)
  - Correo electrónico del destinatario
  - Dirección de origen y nombre del remitente utilizados para el correo electrónico
  - Marca de tiempo de la prueba
- **Respuestas de error**:
  - `401`: No autorizado - Sesión inválida o token CSRF incorrecto
  - `400`: Se requiere configuración de NTFY, configuración inválida o correo electrónico no configurado
  - `500`: Error al enviar notificación de prueba con detalles del error
- **Notas**:
  - Admite mensajes de prueba simples, notificaciones basadas en plantillas y pruebas de correo electrónico
  - Las pruebas de plantilla utilizan datos de ejemplo para reemplazar variables de plantilla
  - Incluye marca de tiempo en el mensaje de prueba
  - Las pruebas de NTFY utilizan la configuración de NTFY almacenada; no se utiliza una URL de NTFY proporcionada por el cliente
  - Utiliza el campo `accessToken` para autenticación cuando se almacena
  - Para pruebas de plantilla, envía notificaciones tanto a NTFY como a correo electrónico (si está configurado)
  - Las pruebas de correo electrónico requieren que la configuración SMTP esté configurada
  - El punto final de prueba de correo electrónico borra la caché de solicitud antes de leer la configuración SMTP, lo que garantiza que los scripts externos puedan actualizar la configuración y que se refleje inmediatamente en los correos de prueba
  - Las pruebas de plantilla y el envío inmediato de Resumen Diario omiten la supresión por copia de seguridad

## Vista previa de plantilla de notificación - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Punto final**: `/api/notifications/preview`
- **Método**: POST
- **Descripción**: Representa una plantilla de notificación con el procesador Markdown de producción sin enviar. El cuerpo incluye `kind` (`success`, `warning`, `overdueBackup` o `dailySummaryEmail`) y la plantilla que se está editando. Las vistas previas de Resumen Diario utilizan la instantánea real actual; otros tipos utilizan valores de ejemplo deterministas. El HTML del correo electrónico está destinado a un iframe aislado. Éxito, Advertencia/Error y Vencida también devuelven la carga útil de NTFY (`ntfyMessage`);  se omite cualquier encabezado de tabla GFM y las filas del cuerpo son texto plano.
- **Autenticación**: Requiere sesión válida y token CSRF

## Comprobar copias de seguridad vencidas - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Punto final**: `/api/notifications/check-overdue`
- **Método**: POST
- **Descripción**: Activa manualmente la comprobación de copia de seguridad vencida y envía notificaciones.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "message": "Overdue backup check completed",
    "statistics": {
      "totalBackupConfigs": 5,
      "checkedBackups": 5,
      "overdueBackupsFound": 2,
      "notificationsSent": 2
    }
  }
  ```

- **Respuestas de error**:
  - `500`: Error al comprobar las copias de seguridad vencidas
- **Notas**:
  - Activa manualmente la comprobación de copias de seguridad vencidas
  - Devuelve estadísticas sobre el proceso de comprobación
  - Envía notificaciones para las copias de seguridad vencidas encontradas

## Alertas de canales de notificación - `/api/notification-channel-alerts` {/* #notification-channel-alerts---apinotification-channel-alerts */}

- **Endpoint**: `/api/notification-channel-alerts`
- **Método**: GET, POST
- **Descripción**: Enumera los errores de entrega de correo electrónico y ntfy abiertos para el administrador que ha iniciado sesión, o borra los canales enumerados hasta que se registre un error más reciente.
- **Autenticación**: Requiere una sesión de administrador. POST también requiere un token CSRF en el encabezado `X-CSRF-Token`.
- **Cuerpo de la solicitud** (POST):

  ```json
  {
    "channels": ["email", "ntfy"]
  }
  ```

`channels` debe contener uno o ambos de `email` y `ntfy`.
- **Respuesta**:

  ```json
  {
    "alerts": [
      {
        "channel": "email",
        "error": "SMTP authentication failed",
        "latestTimestamp": "2026-09-23 22:10:00",
        "failureCount": 3,
        "settingsTab": "email",
        "host": "smtp.gmail.com"
      }
    ]
  }
  ```

Cada alerta incluye `channel`, `error` (como máximo 500 caracteres), `latestTimestamp`, `failureCount` y `settingsTab` (`email` o `ntfy`). Las alertas de correo electrónico pueden incluir `host`. Las alertas de NTFY pueden incluir `topic`.
- **Respuestas de error**:
  - `400` `INVALID_CONFIGURATION`: Falta el cuerpo del POST, o `channels` está vacío o contiene un valor desconocido
  - `500` `INTERNAL_ERROR`: Intento fallido de leer o borrar las alertas
- **Notas**:
  - GET devuelve los canales que siguen fallando para este administrador
  - POST registra una acción de borrar por administrador para cada canal enumerado que esté abierto actualmente, y luego devuelve las alertas restantes
  - Un error posterior muestra el canal de nuevo, incluso cuando el texto del error no ha cambiado
  - Una entrega posterior con éxito para ese canal lo mantiene oculto
  - El marcador de borrar se almacena en la configuración y no incluye secretos

## Borrar marcas de tiempo de copias de seguridad vencidas - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Punto final**: `/api/notifications/clear-overdue-timestamps`
- **Método**: POST
- **Descripción**: Borra todas las marcas de tiempo de notificación de copia de seguridad vencida, permitiendo que se envíen notificaciones nuevamente.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Respuestas de error**:
  - `500`: Error al borrar las marcas de tiempo de las copias de seguridad vencidas
- **Notas**:
  - Borra todas las marcas de tiempo de notificación de copias de seguridad vencidas
  - Permite que las notificaciones se envíen nuevamente
  - Útil para probar el sistema de notificaciones
