# Sistema de Notificaciones {/* #notification-system */}

## Probar Notificación - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Punto final**: `/api/notifications/test`
- **Método**: POST
- **Descripción**: Envía notificaciones de prueba (sencillas, basadas en plantillas o por correo electrónico) para verificar la configuración de notificaciones.
- **Autenticación**: Requiere sesión de administrador y token CSRF
- **Cuerpo de la solicitud**:
  Para prueba sencilla:

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
  Para prueba sencilla:

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

El contenido del correo electrónico de prueba muestra:
  - Nombre de host y puerto del servidor SMTP
  - Tipo de conexión (SMTP simple, STARTTLS o SSL/TLS directo)
  - Estado de la autenticación SMTP
  - Nombre de usuario SMTP (solo se muestra cuando se requiere autenticación)
  - Dirección de correo electrónico del destinatario
  - Dirección de origen y nombre del remitente utilizados para el correo electrónico
  - Marca de tiempo de la prueba
- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF no válido
  - `400`: Se requiere configuración de NTFY, configuración no válida o correo electrónico no configurado
  - `500`: Error al enviar notificación de prueba con detalles del error
- **Notas**:
  - Soporta mensajes de prueba simples, notificaciones basadas en plantillas y pruebas de correo electrónico
  - La prueba de plantillas utiliza datos de muestra para reemplazar variables de plantilla
  - Incluye marca de tiempo en el mensaje de prueba
  - Las pruebas de NTFY utilizan la configuración de NTFY almacenada; no se utiliza una URL de NTFY proporcionada por el cliente
  - Utiliza el campo `accessToken` para autenticación cuando está almacenado
  - Para pruebas de plantillas, envía notificaciones a NTFY y correo electrónico (si está configurado)
  - Las pruebas de correo electrónico requieren que la configuración SMTP esté configurada
  - El punto final del correo electrónico de prueba borra la caché de solicitudes antes de leer la configuración SMTP, asegurando que los scripts externos puedan actualizar la configuración y reflejarla inmediatamente en los correos electrónicos de prueba
  - Las pruebas de plantillas y el Resumen Diario envían ahora sin tener en cuenta la supresión por copia de seguridad

## Vista previa de plantilla de notificación - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Punto final**: `/api/notifications/preview`
- **Método**: POST
- **Descripción**: Representa una plantilla de notificación con el renderizador de Markdown de producción sin enviar. El cuerpo incluye `kind` (`success`, `warning`, `overdueBackup`, o `dailySummaryEmail`) y la plantilla que se está editando. Las vistas previas del Resumen Diario utilizan la instantánea real actual; otros tipos utilizan valores de muestra deterministas. El HTML del correo electrónico está destinado a un iframe sandboxed. Éxito, Advertencia/Error y Vencida también devuelven la carga útil de NTFY (`ntfyMessage`); cualquier encabezado de tabla GFM se omite y las filas del cuerpo son texto plano.
- **Autenticación**: Requiere sesión y token CSRF válidos

## Comprobar copias de seguridad vencidas - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Punto final**: `/api/notifications/check-overdue`
- **Método**: POST
- **Descripción**: Activa manualmente la comprobación de copias de seguridad vencidas y envía notificaciones.
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

## Borrar marcas de tiempo de copias de seguridad vencidas - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Punto final**: `/api/notifications/clear-overdue-timestamps`
- **Método**: POST
- **Descripción**: Borra todas las marcas de tiempo de notificación de copias de seguridad vencidas, permitiendo que se envíen notificaciones nuevamente.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Respuestas de error**:
  - `500`: Error al borrar las marcas de tiempo de copias de seguridad vencidas
- **Notas**:
  - Borra todas las marcas de tiempo de notificación de copias de seguridad vencidas
  - Permite reenviar notificaciones
  - Útil para probar el sistema de notificaciones
