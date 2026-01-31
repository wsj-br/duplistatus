---
translation_last_updated: '2026-01-31T00:51:26.622Z'
source_file_mtime: '2026-01-29T17:58:29.895Z'
source_file_hash: 5182562d16f18184
translation_language: es
source_file_path: installation/https-setup.md
---
# Configuración HTTPS (Opcional) {#https-setup-optional}

Para implementaciones en producción, se recomienda servir **duplistatus** sobre HTTPS utilizando un proxy inverso. Esta sección proporciona ejemplos de configuración para soluciones populares de proxy inverso.

### Opción 1: Nginx con Certbot (Let's Encrypt) {#option-1-nginx-with-certbot-lets-encrypt}

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

**Paso 2: Crear la configuración de Nginx**

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

**Paso 3: Activar el sitio y obtener certificado SSL**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot actualizará automáticamente su configuración de Nginx para incluir la configuración de SSL y redirigir HTTP a HTTPS.

**Documentación:**

- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de Certbot](https://certbot.eff.org/instructions)
- [Documentación de Let's Encrypt](https://letsencrypt.org/docs/)

### Opción 2: Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) es un Servidor web moderno con HTTPS automático que simplifica la gestión de certificados SSL.

**Requisitos previos:**

- Nombre de dominio apuntando a su servidor
- Caddy instalado en su sistema

**Paso 1: Instalar Caddy**

Siga la [guía oficial de instalación](https://caddyserver.com/docs/install) para su sistema operativo.

**Paso 2: Crear Caddyfile**

Cree un `Caddyfile` con el siguiente contenido:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Paso 3: Ejecutar Caddy**

```bash
sudo caddy run --config Caddyfile
```

O úselo como un servicio del sistema:

```bash
sudo caddy start --config Caddyfile
```

Caddy obtendrá y administrará automáticamente certificados SSL de Let's Encrypt.

**Documentación:**

- [Documentación de Caddy](https://caddyserver.com/docs/)
- [Guía de Proxy Inverso de Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Notas Importantes {#important-notes}

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::info[IMPORTANTE]
Después de configurar HTTPS, recuerde actualizar la configuración del servidor Duplicati para utilizar la URL HTTPS:

:::

:::tip

- Reemplaza `your-domain.com` con tu nombre de dominio real
- Asegúrate de que el registro DNS A de tu dominio apunte a la Dirección IP de tu Servidor
- Ambas soluciones renovarán automáticamente los certificados SSL
- Considera configurar un firewall para permitir solo tráfico HTTP/HTTPS
:::
