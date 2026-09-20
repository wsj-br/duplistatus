# Claves de API {/* #api-keys */}

Los administradores pueden crear claves de API con ámbito para las APIs HTTP externas que utilizan Duplicati y Homepage. Las claves son opcionales por defecto, por lo que los trabajos existentes de Duplicati siguen funcionando.

![Claves de API](../../assets/screen-settings-api-keys.png)

## Ámbitos {/* #scopes */}

| Ámbito | Puntos finales |
|-------|-----------|
| Subida | `POST /api/upload` |
| Lectura | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Una clave de subida no puede llamar a las APIs de lectura, y una clave de lectura no puede subir informes.

## Creación de una clave {/* #creating-a-key */}

1. Abra **Configuración → Claves de API**.
2. Haga clic en **Crear clave de API** en la parte inferior de la tarjeta de Claves de API.
3. Introduzca un nombre, elija un ámbito y opcionalmente establezca una fecha de expiración (`YYYY-MM-DD`).
4. Genere la clave y copie inmediatamente el secreto. Solo se muestra una vez en el cuadro de diálogo.
5. La lista posterior muestra una huella digital como `Qk7v…3xTa` (primeros y últimos cuatro caracteres), la fecha de expiración y el estado. La misma huella digital aparece en el registro de auditoría.

### Desactivar o eliminar {/* #disable-or-delete */}

Utilice la casilla de verificación en la columna **Acciones** para desactivar una clave sin eliminarla. Las claves desactivadas no pueden autenticarse. Marque la casilla de nuevo para volver a activar la clave. Las claves caducadas no se pueden activar; cree una nueva clave en su lugar. Eliminar elimina permanentemente la clave.

### Caducidad {/* #expiry */}

Una fecha opcional de caducidad es el último día del calendario en que la clave sigue siendo válida. Expira a las **23:59:59 de ese día en la zona horaria local del navegador**, no a medianoche al comienzo del día.

Al elegir `2026-12-01` se compila `2026-12-01T23:59:59` localmente, y luego almacena ese instante como UTC. Para un navegador en UTC+1 eso es `2026-12-01T22:59:59.000Z`. La clave permanece válida hasta el 1 de diciembre y se considera caducada desde las 23:59:59 locales en adelante (`expires_at <= now`). La tabla de claves de API muestra la fecha de caducidad (o **Nunca** si no se estableció ninguna). Después de ese instante, la insignia de Estado cambia a **Expirado** (gris); las claves caducadas no pueden autenticarse aunque se hayan dejado habilitadas.

## Uso de una clave {/* #using-a-key */}

Duplicati no puede establecer encabezados personalizados. Coloque la clave en la URL del informe:

```bash
--send-http-json-urls=https://your-host/api/upload?api_key=YOUR_KEY
```

Los widgets de Homepage pueden usar el mismo parámetro de consulta:

```yaml
url: http://your-host/api/summary?api_key=YOUR_READ_KEY
```

Los clientes que puedan enviar encabezados pueden utilizar `X-Api-Key` o `Authorization: Bearer` en su lugar. Las claves de cadena de consulta aparecen en los registros de acceso del proxy inverso.

## Requerir claves {/* #require-keys */}

El interruptor **Exigir claves de API para APIs externas** está desactivado por defecto. Mientras esté desactivado, se permiten las solicitudes sin clave. Si un cliente aún envía una clave, se acepta y registra una clave válida con ámbito coincidente; una clave inválida, deshabilitada, caducada o con ámbito incorrecto se ignora y la solicitud aún se permite. Cuando active el interruptor, las cuatro APIs de datos externas devuelven `401` sin una clave válida (y rechazan claves incorrectas). Habilite al menos una clave de subida y una clave de lectura primero, o las cargas de Duplicati y los widgets de Homepage se detendrán. Los cambios se guardan automáticamente.

## Protección de API externa {/* #external-api-protection */}

La misma página puede requerir claves de API para las API públicas de subida y lectura, y configura un tamaño máximo del cuerpo (predeterminado 5 MB) y límites de frecuencia por dirección IP para `/api/upload`. Los límites de tamaño y frecuencia se aplican incluso cuando las claves son opcionales y constituyen la principal defensa contra inundaciones. Los interruptores y campos de límite se guardan automáticamente; no hay un botón Guardar independiente.

Véase también [Lista de IPs permitidas](ip-allowlist-settings.md). La lista de IPs permitidas y las claves de API son características independientes; puedes usar una u otra o ambas juntas. Habilitar ambas aumenta la seguridad al restringir el acceso según la dirección IP y exigir una clave de API.
