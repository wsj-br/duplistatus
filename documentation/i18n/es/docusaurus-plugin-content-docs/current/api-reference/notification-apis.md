# Sistema de notificaciones {#notification-system}

## Probar notificación - `/api/notifications/test` {#test-notification---apinotificationstest}
- **Punto de conexión**: `/api/notifications/test`
- **Método**: POST
- **Descripción**: Envía notificaciones de prueba (simples, basadas en plantilla o por correo electrónico) para verificar la configuración de notificaciones.
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
  - Tipo de conexión (SMTP plano, STARTTLS o SSL/TLS directo)
  - Estado del requisito de autenticación SMTP
  - Nombre de usuario SMTP (solo se muestra cuando se requiere autenticación)
  - Dirección de correo electrónico del destinatario
  - Dirección de origen y nombre del remitente utilizados para el correo
  - Marca de tiempo de la prueba
- **Respuestas de error**:
  - `401`: No autorizado - Sesión o token CSRF inválido
  - `400`: Se requiere configuración de NTFY, configuración inválida o correo electrónico no configurado
  - `500`: No se pudo enviar la notificación de prueba con detalles del error
- **Notas**:
  - Admite mensajes de prueba simples, notificaciones basadas en plantilla y pruebas de correo electrónico
  - La prueba de plantilla utiliza datos de ejemplo para reemplazar las variables de la plantilla
  - Incluye marca de tiempo en el mensaje de prueba
  - Las pruebas de NTFY usan la configuración de NTFY almacenada; no se usa una URL de NTFY proporcionada por el cliente
  - Usa el campo `accessToken` para la autenticación cuando está almacenado
  - Para pruebas de plantillas, envía notificaciones a NTFY y correo electrónico (si está configurado)
  - Las pruebas de correo electrónico requieren que la configuración SMTP esté configurada
  - El punto final de correo electrónico de prueba borra la caché de la solicitud antes de leer la configuración SMTP, asegurando que los scripts externos puedan actualizar la configuración y reflejarla inmediatamente en los correos electrónicos de prueba
  - Las pruebas de plantillas y el envío inmediato del Resumen Diario omiten la supresión por copia de seguridad

## Vista previa de la plantilla de notificación - `/api/notifications/preview` {#preview-notification-template---apinotificationspreview}
- **Punto final**: `/api/notifications/preview`
- **Método**: POST
- **Descripción**: Representa una plantilla de notificación con el renderizador de Markdown de producción sin enviar. El cuerpo incluye `kind` (`success`, `warning`, `overdueBackup`, o `dailySummaryEmail`) y la plantilla que se está editando. Las vistas previas del Resumen Diario usan la Actual instantánea real; otros tipos usan valores de muestra deterministas. El HTML del correo electrónico está destinado a un iframe sandboxed.
- **Autenticación**: Requiere una sesión válida y un token CSRF

## Verificar respaldos atrasados - `/api/notifications/check-overdue` {#check-overdue-backups---apinotificationscheck-overdue}
- **Punto de conexión**: `/api/notifications/check-overdue`
- **Método**: POST
- **Descripción**: Dispara manualmente la verificación de respaldos atrasados y envía notificaciones.
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
  - `500`: No se pudo verificar la existencia de respaldos atrasados
- **Notas**:
  - Dispara manualmente la verificación de respaldos atrasados
  - Devuelve estadísticas sobre el proceso de verificación
  - Envía notificaciones para los respaldos atrasados encontrados

## Borrar marcas de tiempo de respaldo retrasado - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps}
- **Punto de conexión**: `/api/notifications/clear-overdue-timestamps`
- **Método**: POST
- **Descripción**: Borra todas las marcas de tiempo de notificación de respaldo atrasado, permitiendo que las notificaciones se envíen nuevamente.
- **Autenticación**: Requiere sesión válida y token CSRF
- **Respuesta**:

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Respuestas de error**:
  - `500`: No se pudieron borrar las marcas de tiempo de respaldos atrasados
- **Notas**:
  - Borra todas las marcas de tiempo de notificación de respaldos atrasados
  - Permite que las notificaciones se envíen nuevamente
  - Útil para probar el sistema de notificaciones
