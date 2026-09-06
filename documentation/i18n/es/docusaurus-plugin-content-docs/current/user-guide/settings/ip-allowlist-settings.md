# Lista de IPs permitidas {#ip-allowlist}

Los administradores pueden restringir quién accede a la interfaz de administración y a las APIs de datos externas. Las dos listas son independientes. Ambas están desactivadas por defecto.

![Lista de IPs permitidas](../../assets/screen-settings-ip-allowlist.png)

La aplicación lee la dirección del par TCP desde una cabecera interna establecida por `scripts/peer-ip.cjs`. Un cliente no puede falsificar esa cabecera. **Detected IP** muestra la **Peer IP** TCP y la **Allowlist IP** utilizada para tomar decisiones de acceso (coinciden a menos que se apliquen cabeceras de proxy de confianza).

## Proxies de confianza {#trusted-proxies}

Habilite **Trust reverse proxy headers** solo cuando duplistatus no es accesible excepto a través de un proxy inverso que **sobreescribe** `X-Forwarded-For` / `X-Real-IP` (no añada). Añada cada CIDR de proxy con **Add** (o pegue una lista separada por comas o saltos de línea). Las entradas aparecen como chips eliminables. Cuando el par TCP no está en esa lista, las cabeceras reenviadas se ignoran.

## Interfaz de administración {#admin-interface}

Cuando está habilitado, las páginas, las API de inicio de sesión, CSRF y sesión aceptan solo las CIDRs enumeradas. Añade entradas con **Añadir**; tu **IP permitida** se etiqueta como **IP actual** cuando está en la lista. **127.0.0.1** y **::1** se incluyen de forma predeterminada y no pueden ser eliminados. **Añadir IP actual** y las **IPs de inicio de sesión recientes de administrador** (del registro de auditoría) ofrecen sugerencias rápidas. No puedes habilitar esta lista a menos que tu IP actual ya esté incluida (o te estés conectando desde loopback). Un bloqueo puede ser recuperado con:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

o añadiendo tu CIDR a `ADMIN_IP_ALLOWLIST`. Los pasos completos para la recuperación (recrear Docker, luego corregir Configuración y eliminar la anulación) se encuentran en [Bloqueado por Lista de IPs permitidas](../troubleshooting.md#locked-out-by-ip-allowlist).

## APIs externas {#external-apis}

Cuando está habilitada, `/api/upload`, `/api/summary`, y `/api/lastbackup*` aceptan solo los CIDRs listados. `/api/health` y `/api/ping` permanecen abiertos para que las comprobaciones de salud de Docker y la sonda de conectividad sigan funcionando.

Esta lista es la protección a utilizar cuando las claves de API no son necesarias. Añade CIDRs como chips como la lista de administradores. **127.0.0.1** y **::1** se incluyen de forma predeterminada y no pueden ser eliminados. Las **IPs recientes de origen de carga** del registro de auditoría se ofrecen como sugerencias de añadir rápidamente.

Si esta lista de permitidos y las claves de API son requeridas, una solicitud debe pasar **ambas**.

## Sobrescrituras de entorno {#environment-overrides}

| Variable | Propósito |
|----------|---------|
| `IP_TRUSTED_PROXIES` | CIDRs de proxy de confianza separados por comas (también implica trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDRs separados por comas |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs separados por comas |

Los valores del entorno sobrescriben la base de datos para que un bloqueo se pueda recuperar sin la interfaz de usuario.
