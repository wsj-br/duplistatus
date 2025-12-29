

# HTTPS Setup (Optional)

For production deployments, it's recommended to serve **duplistatus** over HTTPS using a reverse proxy. This section provides configuration examples for popular reverse proxy solutions.

### Option 1: Nginx with Certbot (Let's Encrypt)

[Nginx](https://nginx.org/) is a popular web server that can act as a reverse proxy, and [Certbot](https://certbot.eff.org/) provides free SSL certificates from Let's Encrypt.

**Prerequisites:**

- Domain name pointing to your server
- Nginx installed on your system
- Certbot installed for your operating system

**Step 1: Install Nginx and Certbot**

For Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Step 2: Create Nginx configuration**

Create `/etc/nginx/sites-available/duplistatus`:

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

**Step 3: Enable the site and obtain SSL certificate**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot will automatically update your Nginx configuration to include SSL settings and redirect HTTP to HTTPS.

**Documentation:**

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/instructions)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### Option 2: Caddy

[Caddy](https://caddyserver.com/) is a modern web server with automatic HTTPS that simplifies SSL certificate management.

**Prerequisites:**

- Domain name pointing to your server
- Caddy installed on your system

**Step 1: Install Caddy**

Follow the [official installation guide](https://caddyserver.com/docs/install) for your operating system.

**Step 2: Create Caddyfile**

Create a `Caddyfile` with the following content:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Step 3: Run Caddy**

```bash
sudo caddy run --config Caddyfile
```

Or use it as a system service:

```bash
sudo caddy start --config Caddyfile
```

Caddy will automatically obtain and manage SSL certificates from Let's Encrypt.

**Documentation:**

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Caddy Reverse Proxy Guide](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Important Notes

> [!IMPORTANT]
> After setting up HTTPS, remember to update your Duplicati server configuration to use the HTTPS URL:
>
> ```bash
> --send-http-url=https://your-domain.com/api/upload
> ```

> [!TIP]
>
> - Replace `your-domain.com` with your actual domain name
> - Ensure your domain's DNS A record points to your server's IP address
> - Both solutions will automatically renew SSL certificates
> - Consider setting up a firewall to only allow HTTP/HTTPS traffic

