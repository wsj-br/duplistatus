# Lista de IPs permitidas {/* #ip-allowlist */}

Los administradores pueden restringir quién accede a la interfaz de administración y a las APIs de datos externas. Las dos listas son independientes. Ambas están desactivadas por defecto.

![Lista de IPs permitidas](../../assets/screen-settings-ip-allowlist.png)

La aplicación lee la dirección TCP del par desde una cabecera interna establecida por `scripts/peer-ip.cjs`. Un cliente no puede falsificar esa cabecera. **IP detectada** muestra la **IP del par** y la **IP de la lista de permitidos** utilizadas para las decisiones de acceso (coinciden a menos que se apliquen cabeceras de proxy de confianza).

Las solicitudes denegadas devuelven HTTP 403 (`IP_NOT_ALLOWED` en rutas de API). No se escriben en el registro de auditoría. Se emite una línea de `console.warn` limitada a la salida estándar de la aplicación (por ejemplo, `docker logs`) — como máximo un registro por IP de cliente y superficie (admin, externa o de prueba) por minuto, y diez por hora — para que los escáneres no puedan inundar los registros.

## Proxies de confianza {/* #trusted-proxies */}

Active **Confiar en las cabeceras del proxy inverso** solo cuando duplistatus no es accesible excepto a través de un proxy inverso que **sobreescribe** `X-Forwarded-For` / `X-Real-IP` (no añada). Añada cada CIDR de proxy con **Añadir** (o pegue una lista separada por comas o saltos de línea). Las entradas aparecen como chips eliminables. Cuando el par TCP no está en esa lista, se ignoran las cabeceras reenviadas.

## Interfaz de administración {/* #admin-interface */}

Cuando está activada, las páginas, el inicio de sesión, las APIs de CSRF y las sesiones aceptan solo las CIDRs listadas. Añada entradas con **Añadir**; su **IP de la lista de permitidos** actual se etiqueta como **IP actual** cuando está en la lista. **127.0.0.1** y **::1** están incluidos por defecto y no pueden ser eliminados. **Añadir IP actual** y **IPs de inicio de sesión recientes de administrador** (del registro de auditoría) ofrecen sugerencias rápidas. No puede activar esta lista a menos que su IP actual ya esté incluida (o se conecte desde loopback). Un bloqueo puede recuperarse con:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

o añadiendo su CIDR a `ADMIN_IP_ALLOWLIST`. Los pasos completos de recuperación (Docker recrear, luego corregir Configuración y eliminar la anulación) están en [Bloqueado por Lista de IPs Permitidas](../troubleshooting.md#locked-out-by-ip-allowlist).

## APIs externas {/* #external-apis */}

Cuando está activada, `/api/upload`, `/api/summary` y `/api/lastbackup*` aceptan solo las CIDRs listadas.

`/api/health` y `/api/ping` no están solos en la lista externa (la ping del panel de control proviene de la IP de la interfaz de administración). Cuando **cualquiera** de las listas de permitidos está activada, esas pruebas aceptan loopback (`127.0.0.1`, `::1`) y CIDRs de la **lista de administración o externa**. Las IPs no listadas reciben HTTP 403. Cuando ambas listas están desactivadas, las pruebas permanecen públicas.

Las solicitudes de prueba no de loopback también están limitadas por tasa (HTTP 429, `PROBE_RATE_LIMITED`): `/api/ping` 60/minuto y 600/hora; `/api/health` 30/minuto y 120/hora. Las comprobaciones de Docker en contenedor golpean localhost y nunca se limitan. Los límites a nivel de aplicación no detienen un ataque de inundación de conexiones; póngalo en el proxy inverso.

Esta lista es la protección a utilizar cuando las claves de API no son requeridas. Añada CIDRs como chips como la lista de administración. **127.0.0.1** y **::1** están incluidos por defecto y no pueden ser eliminados. **IPs recientes de origen de carga** del registro de auditoría se ofrecen como sugerencias de añadir rápido.

Si esta lista de permitidos y las claves de API son requeridas, una solicitud debe pasar **ambas**.

## Anulaciones de entorno {/* #environment-overrides */}

| Variable | Propósito |
|----------|---------|
| `IP_TRUSTED_PROXIES` | CIDRs de proxy de confianza separadas por comas (también implica trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDRs separadas por comas |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por comas |

Los valores del entorno anulan la base de datos, por lo que se puede recuperar un bloqueo sin la interfaz de usuario.
