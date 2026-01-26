# Configuración HTTPS (opcional) {#https-setup-optional}

Para implementaciones en producción, se recomienda servir **duplistatus** sobre HTTPS utilizando un proxy inverso. Esta sección proporciona ejemplos de configuración para soluciones populares de proxy inverso.

### Opción 1: Nginx con Certbot (Let's Encrypt) {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) es un servidor web popular que puede actuar como proxy inverso, y [Certbot](https://certbot.eff.org/) proporciona certificados SSL gratuitos de Let's Encrypt.

**Requisitos previos:**

- Nombre de dominio apuntando a su Servidor
- Nginx instalado en su Sistema
- Certbot instalado para su Sistema operativo

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

**Paso 3: Activar el sitio y obtener certificado SSL**

```bash
# Activar el sitio {#enable-the-site}
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtener certificado SSL {#obtain-ssl-certificate}
sudo certbot --nginx -d your-domain.com
```

Certbot actualizará automáticamente su configuración de Nginx para incluir configuración SSL y redirigir HTTP a HTTPS.

**Documentación:**

- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de Certbot](https://certbot.eff.org/instructions)
- [Documentación de Let's Encrypt](https://letsencrypt.org/docs/)

### Opción 2: Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) es un Servidor web moderno con HTTPS automático que simplifica la gestión de certificados SSL.

**Requisitos previos:**

- Nombre de dominio apuntando a su Servidor
- Caddy instalado en su Sistema

**Paso 1: Instalar Caddy**

Siga la [guía de instalación oficial](https://caddyserver.com/docs/install) para su Sistema operativo.

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

O úselo como un Servicio del Sistema:

```bash
sudo caddy start --config Caddyfile
```

Caddy obtendrá y gestionará automáticamente certificados SSL de Let's Encrypt.

**Documentación:**

- [Documentación de Caddy](https://caddyserver.com/docs/)
- [Guía de Proxy Inverso de Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Notas Importantes {#important-notes}

:::info[IMPORTANT]
Después de configurar HTTPS, recuerde actualizar la configuración de su Servidor Duplicati para usar la URL HTTPS:

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::

:::tip

- Reemplace `your-domain.com` con su nombre de dominio real
- Asegúrese de que el registro DNS A de su dominio apunte a la Dirección IP de su Servidor
- Ambas soluciones renovarán automáticamente los certificados SSL
- Considere configurar un firewall para permitir solo tráfico HTTP/HTTPS
  :::

