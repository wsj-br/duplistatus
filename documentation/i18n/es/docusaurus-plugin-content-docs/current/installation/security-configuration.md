# Configuración de seguridad {/* #security-configuration */}

La seguridad de **duplistatus** en producción se implementa en capas, y cada capa es opcional. Todas las funciones descritas aquí están desactivadas de forma predeterminada, por lo que una instalación nueva sigue funcionando hasta que decida activarlas. Hay tres capas independientes:

- **Claves de API** — secretos con ámbito para las APIs externas de subida y lectura; normalmente el primer paso más sencillo en un homelab
- **Listas de IPs permitidas** — restricciones CIDR en la interfaz de administración, las APIs externas o ambas
- **Proxy inverso HTTPS** — tráfico cifrado, manteniendo el puerto `9666` fuera de internet público

## Orden recomendado {/* #recommended-order */}

1. Mantenga el puerto `9666` fuera de la Internet pública: vincule la aplicación a localhost o a una red privada.
2. Cree [Claves de API](#api-keys) y active **Exigir claves de API para APIs externas**. Esto funciona sin un proxy inverso y es el primer paso más sencillo.
3. Sirva **duplistatus** a través de un [proxy inverso con HTTPS](#https-with-a-reverse-proxy).
4. Añada la dirección de conexión del proxy a **Proxies de confianza** (o `IP_TRUSTED_PROXIES`) si tiene la intención de usar listas de permitidos.
5. Opcionalmente, active las [listas de IPs permitidas](#ip-allowlist) de administrador y externas, utilizando la **IP detectada** y las sugerencias de IP recientes para evitar bloquear su propio acceso.

## Restringir acceso con claves de API y listas de IPs permitidas {/* #restrict-access-with-api-keys-and-ip-allowlists */}

Estas dos características de Configuración limitan quién puede acceder al panel y a las APIs de datos externos. Son independientes: cuando ambas están activadas, una solicitud debe pasar **ambas** comprobaciones.

### Claves de API {/* #api-keys */}

[Claves de API](../user-guide/settings/api-keys-settings.md) es la protección más sencilla de añadir, especialmente en un homelab. Crea secretos con ámbito para subidas de Duplicati y widgets de Homepage, luego requiérelos — no se necesita proxy inverso ni planificación CIDR.

| Ámbito | Puntos finales |
|-------|-----------|
| Subida | `POST /api/upload` |
| Lectura | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Crea al menos una clave de subida y una clave de lectura **antes** de activar **Exigir claves de API para APIs externas**. De lo contrario, las subidas de Duplicati y los widgets de Homepage dejarán de funcionar tan pronto como se active el interruptor.

Duplicati no puede incluir cabeceras personalizadas en sus solicitudes, por lo que debes proporcionar su clave de API añadiendo `?api_key=…` a la URL del informe. Ten en cuenta que usar la cadena de consulta expone la clave de API en los registros de acceso del proxy inverso. Para otros clientes que admiten cabeceras personalizadas, se recomienda usar la cabecera `X-Api-Key` o la cabecera `Authorization: Bearer` en su lugar para mayor seguridad.

El límite de tamaño de subida y los límites de tasa por IP en la misma página de Configuración se aplican incluso mientras las claves son opcionales. Las claves de API protegen solo las APIs de datos externos; no restringen la interfaz de administración, que está protegida por inicio de sesión y, opcionalmente, por la lista de IPs permitidas de administrador.

### Lista de IPs permitidas {/* #ip-allowlist */}

[Lista de IPs permitidas](../user-guide/settings/ip-allowlist-settings.md) proporciona dos listas CIDR separadas, ambas desactivadas de forma predeterminada:

- **Interfaz de administración** — páginas, inicio de sesión, CSRF y APIs de sesión
- **APIs externas** — `/api/upload`, `/api/summary` y `/api/lastbackup*`
- **Estado y ping** — `/api/health` y `/api/ping` permanecen públicos mientras ambas listas estén desactivadas. Cuando alguna lista está activa, aceptan bucle invertido más CIDRs de la lista de administrador **o** externa, y los clientes no locales tienen límite de tasa. Los límites a nivel de aplicación no detienen una inundación masiva de conexiones; añade `limit_req` / Caddy `rate_limit` en el proxy inverso si la instancia está orientada a internet.

Antes de activar alguna lista, comprueba **IP detectada** en **Configuración → Lista de IPs permitidas** y compara la **IP del par** con la **IP permitida**. Usa **Añadir IP actual** o las sugerencias de IP recientes para no bloquearte a ti mismo. Los pasos de recuperación están en [Bloqueado por lista de IPs permitidas](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

Si **duplistatus** está detrás de un proxy inverso, configura primero **Proxies de confianza** (ver [Proxies de confianza para listas de IPs permitidas](#trusted-proxies-for-ip-allowlists) a continuación). Sin ello, las decisiones de lista permitida se hacen contra la dirección del proxy en lugar de la del cliente.

## HTTPS con un proxy inverso {/* #https-with-a-reverse-proxy */}

Para implementaciones de producción, sirva **duplistatus** a través de HTTPS detrás de un proxy inverso. Los ejemplos siguientes cubren dos opciones populares.

### Opción 1: Nginx con Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) es un servidor web ampliamente utilizado que puede actuar como proxy inverso, y [Certbot](https://certbot.eff.org/) emite certificados TLS gratuitos de Let's Encrypt.

**Requisitos previos:**

- Un nombre de dominio cuyo registro DNS A (o AAAA) apunte a su servidor
- Nginx instalado en su sistema
- Certbot instalado para su sistema operativo

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

    # Nginx defaults to 1 MB. Keep this at or above database restore (200 MB)
    # and the upload limit on Settings → API Keys (5 MB by default).
    client_max_body_size 256m;

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Esta muestra **sobrescribe** `X-Forwarded-For` y `X-Real-IP` con `$remote_addr`. No utilice `$proxy_add_x_forwarded_for` en su lugar: se añade a lo que el cliente envió, dejando valores controlados por el cliente en una cabecera que las listas blancas utilizan.

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

[Caddy](https://caddyserver.com/) es un servidor web moderno que obtiene y renueva certificados TLS automáticamente, lo que elimina la mayor parte del trabajo de gestión de certificados.

**Requisitos previos:**

- Un nombre de dominio cuyo registro DNS A (o AAAA) apunte a su servidor
- Caddy instalado en su sistema

**Paso 1: Instalar Caddy**

Siga la [guía oficial de instalación](https://caddyserver.com/docs/install) para su sistema operativo.

**Paso 2: Cree el archivo Caddyfile**

Las instalaciones de paquetes leen `/etc/caddy/Caddyfile`. Establezca su contenido como:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

La directiva `reverse_proxy` de Caddy configura las cabeceras de IP del cliente por usted. Aún así, debe incluir la dirección de conexión del proxy en **Proxies de confianza** cuando utilice listas de IPs permitidas (consulte [a continuación](#trusted-proxies-for-ip-allowlists)).

**Paso 3: Inicie o recargue Caddy**

Si instaló Caddy desde un paquete, aplique la configuración a través del servicio administrado:

```bash
sudo systemctl reload caddy
```

Para ejecutar Caddy manualmente en su lugar, por ejemplo desde un archivo Caddyfile en el directorio actual, detenga primero el servicio administrado para liberar los puertos 80 y 443, luego ejecute:

```bash
sudo caddy run --config Caddyfile
```

Caddy obtiene el certificado la primera vez que sirve el sitio y lo renueva antes de su vencimiento.

**Documentación:**

- [Documentación de Caddy](https://caddyserver.com/docs/)
- [Guía de proxy inverso de Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Proxies de confianza para listas de IPs permitidas {/* #trusted-proxies-for-ip-allowlists */}

Enlace **duplistatus** a localhost o a una red privada para que el proxy inverso sea el único oyente público. El puerto `9666` nunca debería ser accesible desde Internet.

Cuando las [listas de IPs permitidas](../user-guide/settings/ip-allowlist-settings.md) están habilitadas, incluya el proxy en **Proxies de confianza** (o configure `IP_TRUSTED_PROXIES`). La aplicación respeta `X-Forwarded-For` y `X-Real-IP` solo cuando la dirección de conexión es un proxy de confianza; de lo contrario, las ignora.

- Configure el proxy para **sobrescribir** esos encabezados con la dirección del cliente conectado, como en el ejemplo de Nginx anterior. No agregue.
- Cuando el proxy se ejecuta en el host y **duplistatus** se ejecuta en un contenedor, la **IP del par** suele ser la puerta de enlace del puente Docker (por ejemplo `172.17.0.1`). Coloque esa dirección o CIDR en **Proxies de confianza**, y coloque los CIDR reales del cliente en la lista de IPs permitidas del administrador o externa.
- Antes de habilitar una lista de IPs permitidas, abra **Configuración → Lista de IPs permitidas** y compruebe la **IP detectada**: la **IP del par** debería ser el proxy (o la puerta de enlace del puente) y la **IP permitida** debería ser el cliente. Si la IP permitida aún muestra el proxy, la configuración de proxy de confianza aún no es correcta.

### Después de habilitar HTTPS {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[IMPORTANTE]
Actualice la configuración de su servidor Duplicati para usar la URL HTTPS:


Agregue `?api_key=YOUR_UPLOAD_KEY` si se requieren claves de API. En Duplicati anterior a 2.0.9.106, use `--send-http-url=https://your-domain.com/api/upload` junto con `--send-http-result-output-format=Json`. Consulte [Configuración del servidor Duplicati](duplicati-server-configuration.md).
:::

:::tip

- Reemplace `your-domain.com` con su propio dominio en todos los ejemplos.
- Confirme que el registro DNS A (o AAAA) del dominio resuelve a su servidor antes de solicitar un certificado.
- Ambas opciones renuevan certificados automáticamente: Certbot a través de su temporizador systemd, Caddy a través de su administrador de certificados integrado.
- Restrinja el firewall del host al puerto 443, y mantenga `80` y `9666` cerrados al exterior.
:::
