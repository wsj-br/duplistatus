---
translation_last_updated: '2026-04-18T00:01:05.678Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: fe4cf26fcdad9ea7ff5f3f4cb9f9533b46f148bea17589644eeef65398578b86
translation_language: es
source_file_path: documentation/docs/api-reference/overview.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Resumen de la API {#api-overview}

Este documento describe todos los puntos finales de la API disponibles para la aplicación duplistatus. La API sigue principios RESTful y proporciona capacidades completas de monitoreo de copias de seguridad, gestión de notificaciones y administración del sistema.

:::note
**Español (ES):** La documentación de la API solo está disponible en inglés.        <br/>
**Portuguese (PT-BR):** A documentação da API está disponível apenas em inglês.    
**German (DE):** Die API-Dokumentation ist nur auf Englisch verfügbar.              <br/>
**French (FR):** La documentation de l'API est disponible uniquement en anglais.    <br/>
**English (EN):** The API documentation is available only in English.               <br/>
:::

## Estructura de la API {#api-structure}

Para una referencia rápida de todos los puntos finales, consulte la [Lista de puntos finales de la API](api-endpoint-list).

La API está organizada en grupos lógicos:
- **[APIs externas](external-apis)**: Datos resumidos, estado más reciente de la copia de seguridad y cargas de datos de copia de seguridad desde Duplicati
- **[Operaciones principales](core-operations)**: Datos del panel, gestión del servidor e información detallada de la copia de seguridad
- **[Datos de gráficos](chart-data-apis)**: Datos agregados y específicos del servidor en series temporales para visualización y análisis
- **[Gestión de configuración](configuration-apis)**: Correo electrónico, notificaciones, configuración de copias de seguridad y configuración del sistema
- **[Sistema de notificaciones](notification-apis)**: Pruebas de notificaciones, verificación de copias de seguridad retrasadas y gestión de notificaciones
- **[Servicios Cron](cron-service-apis)**: Gestión de servicios Cron
- **[Monitoreo y estado](monitoring-apis)**: Verificaciones de estado y monitoreo del estado
- **[Administración](administration-apis)**: Mantenimiento de la base de datos, operaciones de limpieza y gestión del sistema
- **[Gestión de sesiones](session-management-apis)**: Gestión de sesiones y creación de sesiones
- **[Autenticación y seguridad](authentication-security)**: Autenticación y seguridad

Para una referencia rápida de todos los puntos finales, consulte la [Lista de puntos finales de la API](api-endpoint-list).

## Formato de respuesta {#response-format}

Todas las respuestas de la API se devuelven en formato JSON con patrones consistentes de manejo de errores. Las respuestas exitosas incluyen típicamente un campo `status`, mientras que las respuestas de error incluyen los campos `error` y `message`.

---

## Manejo de errores {#error-handling}

Todos los puntos finales siguen un patrón consistente de manejo de errores:

- **400 Solicitud incorrecta**: Datos de solicitud inválidos o campos obligatorios faltantes
- **401 No autorizado**: Sesión inválida o faltante, sesión expirada o falla en la validación del token CSRF
- **403 Prohibido**: Operación no permitida (por ejemplo, eliminación de copia de seguridad en producción) o falla en la validación del token CSRF
- **404 No encontrado**: Recurso no encontrado
- **409 Conflicto**: Datos duplicados (para puntos finales de carga)
- **500 Error interno del servidor**: Errores del lado del servidor con mensajes detallados
- **503 Servicio no disponible**: Fallas en verificaciones de estado, problemas de conexión a la base de datos o servicio cron no disponible

Las respuestas de error incluyen:
- `error`: Mensaje de error legible para humanos
- `message`: Detalles técnicos del error (en modo desarrollo)
- `stack`: Traza del error (en modo desarrollo)
- `timestamp`: Cuándo ocurrió el error

## Notas sobre tipos de datos {#data-type-notes}

### Arrays de mensajes {#message-arrays}
Los campos `messages_array`, `warnings_array` y `errors_array` se almacenan como cadenas JSON en la base de datos y se devuelven como arrays en las respuestas de la API. Estos contienen los mensajes reales de registro, advertencias y errores de las operaciones de copia de seguridad de Duplicati.

### Copias de seguridad disponibles {#available-backups}
El campo `available_backups` contiene un array de marcas de tiempo de versiones de copia de seguridad (en formato ISO) disponibles para restauración. Esto se extrae de los mensajes de registro de la copia de seguridad.

### Campos de duración {#duration-fields}
- `duration`: Formato legible para humanos (por ejemplo, "00:38:31")
- `duration_seconds`: Duración bruta en segundos
- `durationInMinutes`: Duración convertida a minutos con fines de representación gráfica

### Campos de tamaño de archivo {#file-size-fields}
Todos los campos de tamaño de archivo se devuelven en bytes como números, no como cadenas formateadas. La interfaz es responsable de convertir estos valores a formatos legibles (KB, MB, GB, etc.).

<br/>

:::caution
 No exponga el servidor **duplistatus** a Internet público. Úselo en una red segura 
(por ejemplo, una LAN local protegida por un firewall).

Exponer la interfaz **duplistatus** a Internet público 
sin medidas de seguridad adecuadas podría provocar acceso no autorizado.
:::
