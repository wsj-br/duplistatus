# Ajuste de seguridad {/* #security-hardening */}

El endurecimiento de producción para **duplistatus** está organizado en capas y es opcional. Cada característica descrita aquí está desactivada por defecto, por lo que una instalación nueva sigue funcionando hasta que elijas activarla. Hay tres capas independientes:

- **Claves de API** — secretos con ámbito para las APIs externas de subida y lectura; generalmente el primer paso más fácil en un homelab
- **Listas de IPs permitidas** — restricciones CIDR en la interfaz de administración, las APIs externas o ambas
- **Proxy inverso HTTPS** — tráfico cifrado, con el puerto `9666` mantenido fuera de Internet público

## Orden recomendado {/* #recommended-order */}

1. Mantén el puerto `9666` fuera de Internet público: vincula la aplicación a localhost o a una red privada.
2. Crea [claves de API](#api-keys) y activa **Exigir claves de API para APIs externas**. Esto funciona sin un proxy inverso y es la solución más rápida.
3. Sirve **duplistatus** a través de un [proxy inverso con HTTPS](#https-with-a-reverse-proxy).
4. Añade la dirección TCP del par del proxy a **Proxies de confianza** (o `IP_TRUSTED_PROXIES`) si piensas usar listas de IPs permitidas.
5. Opcionalmente, activa las [listas de IPs permitidas](#ip-allowlist) de la interfaz de administración y las APIs externas, usando la **IP detectada** y las sugerencias de IP recientes para evitar bloquearte a ti mismo.

## Restringir el acceso con claves de API y listas de IPs permitidas {/* #restrict-access-with-api-keys-and-ip-allowlists */}

Estas dos características de Configuración limitan quién puede acceder al panel y a las APIs de datos externas. Son independientes: cuando ambas están activadas, una solicitud debe pasar **ambas** comprobaciones.

### Claves de API {/* #api-keys */}

Las [Claves de API](../user-guide/settings/api-keys-settings.md) son la protección más sencilla de añadir, especialmente en un homelab. Crea secretos con ámbito para las subidas de Duplicati y los widgets de la página de inicio, luego exígelos — no se necesita un proxy inverso o planificación CIDR.

| Ámbito | Endpoints |
|-------|-----------|
| Subir | `POST /api/upload` |
| Leer | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Crea al menos una clave de subida y una clave de lectura **antes** de activar **Exigir claves de API para APIs externas**. De lo contrario, las subidas de Duplicati y los widgets de la página de inicio dejarán de funcionar tan pronto como se active el interruptor.

Duplicati no puede incluir encabezados personalizados en sus solicitudes, por lo que debe proporcionar su clave API añadiendo `?api_key=…` a la URL del informe. Tenga en cuenta que el uso de la cadena de consulta expone la clave API en los registros de acceso del proxy inverso. Para otros clientes que admitan encabezados personalizados, se recomienda utilizar el encabezado `X-Api-Key` o el encabezado `Authorization: Bearer` en su lugar para mayor seguridad.

El límite de tamaño de subida y los límites de velocidad por IP en la misma página de Configuración se aplican incluso mientras las claves son opcionales. Las claves de API protegen las APIs de datos externas solo; no restringen la interfaz de administración, que está protegida por el inicio de sesión y, opcionalmente, por la lista de IPs permitidas de la interfaz de administración.

### Lista de IPs permitidas {/* #ip-allowlist */}

La [Lista de IPs permitidas](../user-guide/settings/ip-allowlist-settings.md) proporciona dos listas CIDR separadas, ambas desactivadas por defecto:

- **Interfaz de administración** — páginas, inicio de sesión, CSRF y APIs de sesión
- **APIs externas** — `/api/upload`, `/api/summary` y `/api/lastbackup*`
- **Salud y ping** — `/api/health` y `/api/ping` permanecen públicas mientras ambas listas están desactivadas. Cuando alguna lista está activada, aceptan bucles de retorno más CIDRs de la lista de administradores **o** externa, y los clientes no de bucles de retorno están limitados por tasa. Los límites a nivel de aplicación no detienen un ataque de inundación de conexiones volumétricas; añadir `limit_req` / Caddy `rate_limit` en el proxy inverso si la instancia es de acceso público.

Antes de activar cualquiera de las listas, comprueba la **IP detectada** en **Configuración → Lista de IPs permitidas** y compara la **IP del par** con la **IP de la lista de permitidos**. Usa **Añadir IP actual** o las sugerencias de IP recientes para que no te bloquees a ti mismo. Los pasos de recuperación están en [Bloqueado por Lista de IPs permitidas](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

Si **duplistatus** está detrás de un proxy inverso, configura **Proxies de confianza** primero (ver [Proxies de confianza para listas de IPs permitidas](#trusted-proxies-for-ip-allowlists) a continuación). Sin él, las decisiones de la lista de permitidos se toman contra la dirección del proxy en lugar de la del cliente.

## HTTPS con un proxy inverso {/* #https-with-a-reverse-proxy */}

Para despliegues en producción, sirve **duplistatus** sobre HTTPS detrás de un proxy inverso. Los ejemplos a continuación cubren dos opciones populares.

### Opción 1: Nginx con Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) es un servidor web ampliamente utilizado que puede actuar como proxy inverso, y [Certbot](https://certbot.eff.org/) emite certificados TLS gratuitos de Let's Encrypt.

**Requisitos previos:**

- Un nombre de dominio cuyo registro DNS A (o AAAA) apunta a tu servidor
- Nginx instalado en tu sistema
- Certbot instalado para tu sistema operativo

**Paso 1: Instalar Nginx y Certbot**

En Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Paso 2: Crear la configuración de Nginx**

Crear `/etc/nginx/sites-available/duplistatus`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Nginx defaults to 1 MB, which is below the upload limit on
    # Settings → API Keys (5 MB by default). Keep this at or above it.
    client_max_body_size 10m;

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Este ejemplo **sobreescribe** `X-Forwarded-For` y `X-Real-IP` con `$remote_addr`. No utilice `$proxy_add_x_forwarded_for` en su lugar: anexa lo que el cliente envió, dejando valores controlados por el cliente en un encabezado en el que las listas de permitidos confían.

**Paso 3: Activar el sitio y obtener el certificado**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot añade la configuración TLS a su configuración de Nginx y redirige HTTP a HTTPS. También instala un temporizador de renovación, que puede verificar con:

```bash
sudo certbot renew --dry-run
```

**Documentación:**

- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de Certbot](https://certbot.eff.org/instructions)
- [Documentación de Let's Encrypt](https://letsencrypt.org/docs/)

### Opción 2: Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) es un servidor web moderno que obtiene y renueva certificados TLS automáticamente, lo que elimina gran parte del trabajo de gestión de certificados.

**Requisitos previos:**

- Un nombre de dominio cuyo registro DNS A (o AAAA) apunta a su servidor
- Caddy instalado en su sistema

**Paso 1: Instalar Caddy**

Siga la [guía oficial de instalación](https://caddyserver.com/docs/install) para su sistema operativo.

**Paso 2: Crear el Caddyfile**

Las instalaciones de paquetes leen `/etc/caddy/Caddyfile`. Establezca su contenido a:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

La directiva `reverse_proxy` de Caddy establece los encabezados de IP del cliente por usted. Todavía tiene que listar la dirección TCP del par del proxy bajo **Proxies de confianza** al usar listas de IPs permitidas (ver [abajo](#trusted-proxies-for-ip-allowlists)).

**Paso 3: Iniciar o recargar Caddy**

Si instaló Caddy desde un paquete, aplique la configuración a través del servicio gestionado:

```bash
sudo systemctl reload caddy
```

Para ejecutar Caddy manualmente en su lugar — por ejemplo desde un Caddyfile en el directorio actual — detenga primero el servicio gestionado para liberar los puertos 80 y 443, luego ejecute:

```bash
sudo caddy run --config Caddyfile
```

Caddy obtiene el certificado la primera vez que sirve el sitio y lo renueva antes de que expire.

**Documentación:**

- [Documentación de Caddy](https://caddyserver.com/docs/)
- [Guía de Proxy Inverso de Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Proxies de confianza para listas de IP permitidas {/* #trusted-proxies-for-ip-allowlists */}

Asocie **duplistatus** a localhost o a una red privada para que el proxy inverso sea el único oyente público. El puerto `9666` nunca debe ser alcanzable desde Internet.

Cuando las [listas de IPs permitidas](../user-guide/settings/ip-allowlist-settings.md) están habilitadas, liste el proxy bajo **Proxies de confianza** (o establezca `IP_TRUSTED_PROXIES`). La aplicación honra `X-Forwarded-For` y `X-Real-IP` solo cuando el par TCP es un proxy de confianza; de lo contrario, los ignora.

- Configure el proxy para **sobreescribir** esos encabezados con la dirección del cliente conectado, como en el ejemplo de Nginx anterior. No anexe.
- Cuando el proxy se ejecuta en el host y **duplistatus** se ejecuta en un contenedor, la **IP del par** suele ser la puerta de enlace del puente Docker (por ejemplo `172.17.0.1`). Ponga esa dirección o CIDR en **Proxies de confianza**, y ponga los CIDR reales del cliente en la lista de permitidos de administración o externa.
- Antes de habilitar una lista de permitidos, abra **Configuración → Lista de IPs permitidas** y compruebe **IP detectada**: la **IP del par** debería ser el proxy (o la puerta de enlace del puente) y la **IP de la lista de permitidos** debería ser el cliente. Si la IP de la lista de permitidos sigue mostrando el proxy, la configuración de proxy de confianza aún no es correcta.

### Después de habilitar HTTPS {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[IMPORTANTE]
Actualice su configuración del servidor Duplicati para usar la URL HTTPS:


Añada `?api_key=YOUR_UPLOAD_KEY` si se requieren claves de API. En Duplicati anterior a 2.0.9.106, use `--send-http-url=https://your-domain.com/api/upload` junto con `--send-http-result-output-format=Json`. Vea [Configuración del servidor Duplicati](duplicati-server-configuration.md).
:::

:::tip

- Reemplace `your-domain.com` con su propio dominio en todos los ejemplos.
- Confirme que el registro DNS A (o AAAA) del dominio resuelve a su servidor antes de solicitar un certificado.
- Ambas opciones renuevan certificados automáticamente: Certbot a través de su temporizador systemd, Caddy a través de su gestor de certificados integrado.
- Restringir el firewall del host al puerto 443, y mantener `80` y `9666` cerrados al exterior.
:::
