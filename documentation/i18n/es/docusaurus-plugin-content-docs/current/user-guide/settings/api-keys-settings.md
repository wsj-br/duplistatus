# Claves de API {/* #api-keys */}

Los administradores pueden crear claves de API con ámbito para las API HTTP externas que Duplicati y Homepage usan. Las claves son opcionales por defecto, por lo que los trabajos de Duplicati existentes siguen funcionando.

![Claves de API](../../assets/screen-settings-api-keys.png)

## Ámbitos {/* #scopes */}

| Ámbito | Endpoints |
|-------|-----------|
| Subir | `POST /api/upload` |
| Leer | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Una clave de subida no puede llamar a las API de lectura, y una clave de lectura no puede subir informes.

## Crear una clave {/* #creating-a-key */}

1. Abre **Configuración → Claves de API**.
2. Haz clic en **Crear clave de API** en la parte inferior de la tarjeta de Claves de API.
3. Introduce un nombre, elige un ámbito y, opcionalmente, establece una fecha de caducidad (`YYYY-MM-DD`).
4. Genera la clave y copia el secreto inmediatamente. Solo se muestra una vez en el diálogo.
5. La lista después muestra una huella digital como `Qk7v…3xTa` (primeros y últimos cuatro caracteres), la fecha de caducidad y el estado. La misma huella digital aparece en el registro de auditoría.

### Desactivar o eliminar {/* #disable-or-delete */}

Usa la casilla de verificación en la columna **Acciones** para desactivar una clave sin eliminarla. Las claves desactivadas no pueden autenticarse. Marca la casilla de verificación de nuevo para reactivar la clave. Las claves caducadas no se pueden activar; crea una nueva clave en su lugar. Eliminar elimina la clave permanentemente.

### Caducidad {/* #expiry */}

Una fecha de caducidad opcional es el último día del calendario en el que la clave sigue siendo válida. Caduca a las **23:59:59 de ese día en la zona horaria local del navegador**, no a medianoche al inicio del día.

Elegir `2026-12-01` construye `2026-12-01T23:59:59` localmente y luego almacena ese instante como UTC. Para un navegador en UTC+1, eso es `2026-12-01T22:59:59.000Z`. La clave sigue siendo válida hasta el 1 de diciembre y se trata como caducada a partir de las 23:59:59 locales (`expires_at <= now`). La tabla de Claves de API muestra la fecha de caducidad (o **Nunca** si no se estableció ninguna). Después de ese instante, la insignia de Estado cambia a **Expirado** (gris); las claves caducadas no pueden autenticarse aunque se dejaran habilitadas.

## Usar una clave {/* #using-a-key */}

Duplicati no puede establecer encabezados personalizados. Pon la clave en la URL del informe:

```bash
--send-http-json-urls=https://your-host/api/upload?api_key=YOUR_KEY
```

Los widgets de Homepage pueden usar el mismo parámetro de consulta:

```yaml
url: http://your-host/api/summary?api_key=YOUR_READ_KEY
```

Los clientes que pueden enviar encabezados pueden usar `X-Api-Key` o `Authorization: Bearer` en su lugar. Las claves de cadena de consulta aparecen en los registros de acceso de los proxies inversos.

## Exigir claves {/* #require-keys */}

El interruptor **Exigir claves de API para APIs externas** está desactivado por defecto. Mientras esté desactivado, las solicitudes sin una clave son permitidas. Si un cliente sigue enviando una clave, se acepta una clave válida con ámbito coincidente y se registra; una clave inválida, desactivada, caducada o con ámbito incorrecto se ignora y la solicitud sigue siendo permitida. Cuando activas el interruptor, las cuatro APIs de datos externas devuelven `401` sin una clave válida (y rechazan claves malas). Activa al menos una clave de subida y una clave de lectura primero, o Duplicati dejará de subir y los widgets de Homepage dejarán de funcionar. Los cambios se guardan automáticamente.

## Protección de API externa {/* #external-api-protection */}

La misma página puede requerir claves de API para las APIs públicas de subir y leer, y configura un tamaño máximo del cuerpo (predeterminado 5 MB) y límites de velocidad por dirección IP para `/api/upload`. Los límites de tamaño y velocidad se aplican incluso cuando las claves son opcionales y son la principal defensa contra inundaciones. Los interruptores y los campos de límite se guardan automáticamente; no hay un botón Guardar separado.

Consulte también [Lista de IPs permitidas](ip-allowlist-settings.md). Lista de IPs permitidas y Claves de API son características independientes; puede usar una o ambas. Habilitar ambas aumenta la seguridad al restringir el acceso basado en dirección IP y requerir una clave de API.
