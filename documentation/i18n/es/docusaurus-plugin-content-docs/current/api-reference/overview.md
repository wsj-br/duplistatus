# Vista general de la API {/* #api-overview */}

Este documento describe todos los puntos finales de la API disponibles para la aplicación duplistatus. La API sigue los principios RESTful y proporciona capacidades completas de monitoreo de copias de seguridad, gestión de notificaciones y administración del sistema.

## Estructura de la API {/* #api-structure */}

Para una referencia rápida de todos los puntos finales, consulte la [Lista de puntos finales de la API](api-endpoint-list).

La API está organizada en grupos lógicos:
- [**APIs externas**](external-apis): Datos resumidos, último estado de copia de seguridad y subidas de datos de copia de seguridad desde Duplicati
- [**Operaciones principales**](core-operations): Datos del panel, gestión del servidor y información detallada de copia de seguridad
- [**Datos de gráficos**](chart-data-apis): Datos de series temporales agregados y específicos del servidor para visualización y análisis
- [**Gestión de configuración**](configuration-apis): Configuración de correo electrónico, notificaciones, copia de seguridad y sistema
- [**Sistema de notificaciones**](notification-apis): Pruebas de notificaciones, comprobación de copias de seguridad vencidas y gestión de notificaciones
- [**Servicios Cron**](cron-service-apis): Gestión de servicios Cron
- [**Monitoreo y salud**](monitoring-apis): Comprobaciones de salud y monitoreo de estado
- [**Administración**](administration-apis): Mantenimiento de base de datos, operaciones de limpieza y gestión del sistema
- [**Gestión de sesiones**](session-management-apis): Gestión de sesiones y creación de sesiones
- [**Autenticación y seguridad**](authentication-security): Autenticación y seguridad

Para una referencia rápida de todos los puntos finales, consulte la [Lista de puntos finales de la API](api-endpoint-list).

## Formato de respuesta {/* #response-format */}

Todas las respuestas de la API se devuelven en formato JSON con patrones de manejo de errores consistentes. Las respuestas exitosas suelen incluir un campo `status`, mientras que las respuestas de error incluyen los campos `error` y `message`.

---

## Manejo de errores {/* #error-handling */}

Todos los puntos finales siguen un patrón de manejo de errores consistente:

- **400 Solicitud incorrecta**: Datos de solicitud no válidos o campos obligatorios faltantes
- **401 No autorizado**: Sesión no válida o faltante, sesión expirada o falló la validación del token CSRF
- **403 Prohibido**: Operación no permitida (por ejemplo, eliminación de copia de seguridad en producción) o falló la validación del token CSRF
- **404 No encontrado**: Recurso no encontrado
- **409 Conflicto**: Datos duplicados (para puntos finales de carga)
- **413 Entidad demasiado grande**: El cuerpo `/api/upload` excede el límite de tamaño configurado
- **429 Demasiadas solicitudes**: Límite de velocidad excedido para carga, API de lectura o fallos de autenticación
- **500 Error interno del servidor**: Errores del lado del servidor con mensajes de error detallados
- **503 Servicio no disponible**: Fallos en comprobaciones de salud, problemas de conexión a la base de datos o servicio Cron no disponible

Las respuestas de error incluyen:
- `error`: Mensaje de error legible por humanos
- `message`: Detalles técnicos del error (en modo de desarrollo)
- `stack`: Traza de pila de error (en modo de desarrollo)
- `timestamp`: Cuando ocurrió el error

## Notas sobre tipos de datos {/* #data-type-notes */}

### Arreglos de mensajes {/* #message-arrays */}
Los campos `messages_array`, `warnings_array` y `errors_array` se almacenan como cadenas JSON en la base de datos y se devuelven como arreglos en las respuestas de la API. Estos contienen los mensajes de registro reales, advertencias y errores de las operaciones de copia de seguridad de Duplicati.

### Copias de seguridad disponibles {/* #available-backups */}
El campo `available_backups` contiene un arreglo de marcas de tiempo de versiones de copia de seguridad (en formato ISO) que están disponibles para restauración. Esto se extrae de los mensajes de registro de copia de seguridad.

### Campos de Duración {/* #duration-fields */}
- `duration`: Formato legible por humanos (ej. "00:38:31")
- `duration_seconds`: Duración en segundos sin procesar
- `durationInMinutes`: Duración convertida a minutos para fines de gráficos

### Campos de Tamaño de Archivo {/* #file-size-fields */}
Todos los campos de tamaño de archivo se devuelven en bytes como números, no como cadenas formateadas. El frontend es responsable de convertir estos a formatos legibles por humanos (KB, MB, GB, etc.).

<br/>

:::caution
 No exponga el servidor **duplistatus** a internet público. Úselo en una red segura 
(ej., LAN local protegida por un firewall).

Exponer la interfaz **duplistatus** a internet público sin medidas de seguridad adecuadas podría llevar a accesos no autorizados.
:::
