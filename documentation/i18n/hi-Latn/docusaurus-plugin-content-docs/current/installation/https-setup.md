# HTTPS Setup (Vaikalpik) {#https-setup-optional}

Utpadan pariyon ke lie, yah salaah di jaati hai ki **duplistatus** ko HTTPS par reverse proxy ka upayog karke serve karen. Yah vibhaag lokapriy reverse proxy samadhaanon ke lie configuration udaharanon ko prastut karta hai.

### Vikalp 1: Certbot (Let's Encrypt) ke saath Nginx {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) ek lokapriy web server hai jo reverse proxy ke roop mein kaam kar sakta hai, aur [Certbot](https://certbot.eff.org/) Let's Encrypt se muft SSL pramaanapatr pradaan karta hai.

**Poorvavartitaen:**

- Aapke server ko sanket karta hua domain naam
- Aapke pranali par Nginx sthaapit
- Aapke operating system ke lie Certbot sthaapit

**Charan 1: Nginx aur Certbot sthaapit karen**

Ubuntu/Debian ke lie:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Charan 2: Nginx configuration banaen**

`/etc/nginx/sites-available/duplistatus` banaen:

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

**Charan 3: Site sakriy karen aur SSL pramaanapatr praapt karen**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot svachaalit roop se aapke Nginx configuration ko SSL settingon ko shaamil karne aur HTTP ko HTTPS par redirect karne ke lie update karega.

**Dastaavez:**

- [Nginx Dastaavezeekaran](https://nginx.org/en/docs/)
- [Certbot Dastaavezeekaran](https://certbot.eff.org/instructions)
- [Let's Encrypt Dastaavezeekaran](https://letsencrypt.org/docs/)

### Vikalp 2: Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) ek aadhunik web server hai jismein svachaalit HTTPS hai jo SSL pramaanapatr prabandhan ko saral banaata hai.

**Poorvavartitaen:**

- Aapke server ko sanket karta hua domain naam
- Aapke pranali par Caddy sthaapit

**Charan 1: Caddy sthaapit karen**

Aapke operating system ke lie [aadhikaarik sthaapana maargadarshika](https://caddyserver.com/docs/install) ka anupalan karen.

**Charan 2: Caddyfile banayein**

Neeche diye gaye content ke saath ek `Caddyfile` banayein:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Charan 3: Caddy chalayein**

```bash
sudo caddy run --config Caddyfile
```

Ya ise system service ke roop mein istemaal karein:

```bash
sudo caddy start --config Caddyfile
```

Caddy svatah hi Let's Encrypt se SSL certificate prapt aur manage karega.

**Dastaavez:**

- [Caddy Dastaavez](https://caddyserver.com/docs/)
- [Caddy Reverse Proxy Guide](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Mahatvapurna Suchanaayein {#important-notes}

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::info[IMPORTANT]
HTTPS setup karne ke baad, apne Duplicati server configuration ko HTTPS URL ka istemaal karne ke liye update karna yaad rakhein:

:::

:::tip

- `your-domain.com` ko apne vastavik domain naam se badlein
- Sunishchit karein ki aapke domain ka DNS A record aapke server ke IP pata ki taraf ishara karta hai
- Dono solutions svatah hi SSL certificate renew karenge
- Firewall setup karne par vichar karein taaki kewal HTTP/HTTPS traffic ki anumati ho
:::
