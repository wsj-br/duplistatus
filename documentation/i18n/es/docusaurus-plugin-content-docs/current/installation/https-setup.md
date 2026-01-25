# Configuración HTTPS (Opcional)

Para implementaciones en producción, se recomienda servir **duplistatus** a través de HTTPS utilizando un proxy inverso. Esta sección proporciona ejemplos de configuración para soluciones populares de proxy inverso.

### Opción 1: Nginx con Certbot (Let's Encrypt)

[Nginx](https://nginx.org/) es un servidor web popular que puede actuar como proxy inverso, y [Certbot](https://certbot.eff.org/) proporciona certificados SSL gratuitos de Let's Encrypt.

**Requisitos previos:**

- Nombre de dominio apuntando a su servidor
- Nginx instalado en su sistema
- Certbot instalado para su sistema operativo

**Paso 1: Instalar Nginx y Certbot**

Para Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Paso 2: Crear configuración de Nginx**

Crear `/etc/nginx/sites-available/duplistatus`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Paso 3: Habilitar el sitio y obtener certificado SSL**

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtener certificado SSL
sudo certbot --nginx -d your-domain.com
```

Certbot actualizará automáticamente su configuración de Nginx para incluir la configuración SSL y redirigir HTTP a HTTPS.

**Documentación:**

- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de Certbot](https://certbot.eff.org/instructions)
- [Documentación de Let's Encrypt](https://letsencrypt.org/docs/)

### Opción 2: Caddy

[Caddy](https://caddyserver.com/) es un servidor web moderno con HTTPS automático que simplifica la gestión de certificados SSL.

**Requisitos previos:**

- Nombre de dominio apuntando a su servidor
- Caddy instalado en su sistema

**Paso 1: Instalar Caddy**

Siga la [guía de instalación oficial](https://caddyserver.com/docs/install) para su sistema operativo.

**Paso 2: Crear Caddyfile**

Crear un `Caddyfile` con el siguiente contenido:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Paso 3: Ejecutar Caddy**

```bash
sudo caddy run --config Caddyfile
```

O usarlo como un servicio del sistema:

```bash
sudo caddy start --config Caddyfile
```

Caddy obtendrá y gestionará automáticamente los certificados SSL de Let's Encrypt.

**Documentación:**

- [Documentación de Caddy](https://caddyserver.com/docs/)
- [Guía de Proxy Inverso de Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Notas Importantes

:::info[IMPORTANT]
Después de configurar HTTPS, recuerde actualizar la configuración de su servidor Duplicati para usar la URL HTTPS:

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::

:::tip

- Reemplace `your-domain.com` con su nombre de dominio real
- Asegúrese de que el registro A de DNS de su dominio apunte a la dirección IP de su servidor
- Ambas soluciones renovarán automáticamente los certificados SSL
- Considere configurar un firewall para permitir solo tráfico HTTP/HTTPS
  :::

