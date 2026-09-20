# Lista de IPs permitidas {/* #ip-allowlist */}

Los administradores pueden restringir quién accede a la interfaz de administración y a las APIs de datos externos. Las dos listas son independientes. Ambas están desactivadas por defecto.

![Lista de IPs permitidas](../../assets/screen-settings-ip-allowlist.png)

La aplicación lee la dirección del par TCP desde una cabecera interna establecida por `scripts/peer-ip.cjs`. Un cliente no puede suplantar esa cabecera. **IP detectada** muestra la **IP del par** y la **IP permitida** utilizada para tomar decisiones de acceso (coinciden a menos que se apliquen cabeceras de proxy de confianza).

Las solicitudes denegadas devuelven HTTP 403 (`IP_NOT_ALLOWED` en rutas de API). No se escriben en el registro de auditoría. Se emite una línea de `console.warn` con limitación de tasa a la salida estándar de la aplicación (por ejemplo `docker logs`) — como máximo un registro por IP de cliente y superficie (administrador, externo o sonda) por minuto, y diez por hora — para que los escáneres no inunden los registros.

## Proxies de confianza {/* #trusted-proxies */}

Active **Confiar en las cabeceras del proxy inverso** solo cuando duplistatus no sea accesible excepto a través de un proxy inverso que **sobrescriba** `X-Forwarded-For` / `X-Real-IP` (no añadir). Añada cada CIDR de proxy con **Añadir** (o pegue una lista separada por comas o saltos de línea). Las entradas aparecen como chips eliminables. Cuando el par TCP no está en esa lista, se ignoran las cabeceras reenviadas.

## Interfaz de administración {/* #admin-interface */}

Cuando está activada, las páginas, inicio de sesión, CSRF y las APIs de sesión aceptan solo CIDRs incluidos en la lista. Añada entradas con **Añadir**; su **IP permitida** actual se etiqueta como **IP actual** cuando está en la lista. **127.0.0.1** y **::1** se incluyen por defecto y no se pueden eliminar. **Añadir IP actual** y **IPs de inicio de sesión recientes de administrador** (del registro de auditoría) ofrecen sugerencias rápidas. No puede activar esta lista a menos que su IP actual ya esté incluida (o esté conectándose desde loopback). Se puede recuperar un bloqueo con:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

o añadiendo su CIDR a `ADMIN_IP_ALLOWLIST`. Los pasos completos de recuperación (recrear Docker, luego corregir Configuración y eliminar la anulación) están en [Bloqueado por lista de IPs permitidas](../troubleshooting.md#locked-out-by-ip-allowlist).

## APIs externas {/* #external-apis */}

Cuando está activada, `/api/upload`, `/api/summary` y `/api/lastbackup*` aceptan solo CIDRs incluidos en la lista.

`/api/health` y `/api/ping` no están en la lista externa sola (el ping del panel proviene de la IP de la interfaz de administración). Cuando **cualquiera** de las listas de permitidos está activada, esas sondas aceptan loopback (`127.0.0.1`, `::1`) y CIDRs de la lista **de administrador o externa**. Las IPs no incluidas reciben HTTP 403. Cuando ambas listas están desactivadas, las sondas permanecen públicas.

Las solicitudes de sonda no locales también tienen limitación de tasa (HTTP 429, `PROBE_RATE_LIMITED`): `/api/ping` 60 por minuto y 600 por hora; `/api/health` 30 por minuto y 120 por hora. Las verificaciones de Docker dentro del contenedor acceden a localhost y nunca se limitan. Los límites a nivel de aplicación no detienen una inundación masiva de conexiones; coloque eso en el proxy inverso.

Esta lista es la protección a usar cuando no se requieren claves de API. Añada CIDRs como chips al igual que en la lista de administrador. **127.0.0.1** y **::1** se incluyen por defecto y no se pueden eliminar. Se ofrecen como sugerencias rápidas las **IPs recientes de origen de carga** del registro de auditoría.

Si se requieren tanto esta lista de permitidos como claves de API, una solicitud debe pasar **ambas**.

## Anulaciones de entorno {/* #environment-overrides */}

| Variable | Propósito |
|----------|---------|
| `IP_TRUSTED_PROXIES` | CIDRs de proxy de confianza separados por comas (también implica trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDRs separados por comas |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDR separados por comas |

Los valores de entorno anulan la base de datos para que un bloqueo sea recuperable sin la interfaz de usuario.
