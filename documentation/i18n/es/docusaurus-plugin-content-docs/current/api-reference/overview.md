# Descripción general de la API {/* #api-overview */}

Este documento describe todos los puntos finales de API disponibles para la aplicación duplistatus. La API sigue principios RESTful y proporciona capacidades completas de monitoreo de copias de seguridad, gestión de notificaciones y administración del sistema.

## Estructura de la API {/* #api-structure */}

Para una referencia rápida de todos los puntos finales, consulte la [Lista de puntos finales de API](api-endpoint-list).

La API se organiza en grupos lógicos:
- [**APIs externas**](external-apis): Datos de resumen, estado de copia de seguridad más reciente y cargas de datos de copia de seguridad desde Duplicati
- [**Operaciones principales**](core-operations): Datos del panel, gestión del servidor e información detallada de copias de seguridad
- [**Datos de gráficos**](chart-data-apis): Datos de series temporales agregados y específicos del servidor para visualización y análisis
- [**Gestión de configuración**](configuration-apis): Correo electrónico, notificaciones, configuración de copias de seguridad y configuración del sistema
- [**Sistema de notificaciones**](notification-apis): Prueba de notificaciones, comprobaciones de copias de seguridad vencidas y gestión de notificaciones
- [**Servicios Cron**](cron-service-apis): Gestión de servicios Cron
- [**Monitoreo y estado**](monitoring-apis): Comprobaciones de estado y monitoreo de estado
- [**Administración**](administration-apis): Mantenimiento de base de datos, operaciones de limpieza y gestión del sistema
- [**Gestión de sesiones**](session-management-apis): Gestión de sesiones y creación de sesiones
- [**Autenticación y seguridad**](authentication-security): Autenticación y seguridad

Para una referencia rápida de todos los puntos finales, consulte la [Lista de puntos finales de API](api-endpoint-list).

## Formato de respuesta {/* #response-format */}

Todas las respuestas de la API se devuelven en formato JSON con patrones de manejo de errores consistentes. Las respuestas exitosas típicamente incluyen un campo `status`, mientras que las respuestas de error incluyen campos `error` e `message`.

---

## Manejo de errores {/* #error-handling */}

Todos los puntos finales siguen un patrón de manejo de errores consistente:

- **400 Solicitud incorrecta**: Datos de solicitud inválidos o campos requeridos faltantes
- **401 No autorizado**: Sesión inválida o faltante, sesión expirada o validación de token CSRF fallida
- **403 Prohibido**: Operación no permitida (por ejemplo, eliminación de copia de seguridad en producción) o validación de token CSRF fallida
- **404 No encontrado**: Recurso no encontrado
- **409 Conflicto**: Datos duplicados (para puntos finales de carga)
- **413 Carga útil demasiado grande**: El cuerpo `/api/upload` excede el límite de tamaño configurado
- **429 Demasiadas solicitudes**: Límite de velocidad de carga, API de lectura o fallo de autenticación excedido
- **500 Error interno del servidor**: Errores del lado del servidor con mensajes de error detallados
- **503 Servicio no disponible**: Fallos en comprobaciones de estado, problemas de conexión a la base de datos o servicio Cron no disponible

Las respuestas de error incluyen:
- `error`: Mensaje de error legible para humanos
- `message`: Detalles técnicos del error (en modo de desarrollo)
- `stack`: Seguimiento de pila de errores (en modo de desarrollo)
- `timestamp`: Cuándo ocurrió el error

## Notas sobre tipos de datos {/* #data-type-notes */}

### Matrices de mensajes {/* #message-arrays */}
Los campos `messages_array`, `warnings_array` e `errors_array` se almacenan como cadenas JSON en la base de datos y se devuelven como matrices en las respuestas de la API. Estos contienen los mensajes de registro reales, advertencias y errores de las operaciones de copia de seguridad de Duplicati.

### Copias de seguridad disponibles {/* #available-backups */}
El campo `available_backups` contiene una matriz de marcas de tiempo de versión de copia de seguridad (en formato ISO) que están disponibles para restauración. Esto se extrae de los mensajes de registro de copia de seguridad.

### Campos de Duración {/* #duration-fields */}
- `duration`: Formato legible por humanos (p. ej., "00:38:31")
- `duration_seconds`: Duración sin procesar en segundos
- `durationInMinutes`: Duración convertida a minutos para fines de gráficos

### Campos de Tamaño de Archivo {/* #file-size-fields */}
Todos los campos de tamaño de archivo se devuelven en bytes como números, no como cadenas formateadas. El frontend es responsable de convertir estos a formatos legibles por humanos (KB, MB, GB, etc.).

<br/>

:::caution
 No exponga el servidor de **duplistatus** a la red pública de internet. Utilícelo en una red segura 
(p. ej., una LAN local protegida por un cortafuegos).

Exponer la interfaz de **duplistatus** a la red pública
 de internet sin las medidas de seguridad adecuadas podría provocar accesos no autorizados.
:::
