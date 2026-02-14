---
translation_last_updated: '2026-02-14T04:57:41.094Z'
source_file_mtime: '2026-02-01T03:16:19.469Z'
source_file_hash: 5182562d16f18184
translation_language: de
source_file_path: installation/https-setup.md
---
# HTTPS-Setup (Optional) {#https-setup-optional}

Für Produktionsbereitstellungen wird empfohlen, **duplistatus** über HTTPS mit einem Reverse Proxy bereitzustellen. Dieser Abschnitt enthält Konfigurationsbeispiele für beliebte Reverse-Proxy-Lösungen.

### Option 1: Nginx mit Certbot (Let's Encrypt) {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) ist ein beliebter Webserver, der als Reverse Proxy fungieren kann, und [Certbot](https://certbot.eff.org/) stellt kostenlose SSL-Zertifikate von Let's Encrypt bereit.

**Voraussetzungen:**

- Domänenname, der auf Ihren Server verweist
- Nginx auf Ihrem System installiert
- Certbot für Ihr Betriebssystem installiert

**Schritt 1: Nginx und Certbot installieren**

Für Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Schritt 2: Nginx-Konfiguration erstellen**

Erstellen Sie `/etc/nginx/sites-available/duplistatus`:

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

**Schritt 3: Website aktivieren und SSL-Zertifikat abrufen**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot aktualisiert automatisch Ihre Nginx-Konfiguration, um SSL-Einstellungen einzubeziehen und HTTP zu HTTPS umzuleiten.

**Dokumentation:**

- [Nginx-Dokumentation](https://nginx.org/en/docs/)
- [Certbot-Dokumentation](https://certbot.eff.org/instructions)
- [Let's Encrypt-Dokumentation](https://letsencrypt.org/docs/)

### Option 2: Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) ist ein moderner Webserver mit automatischem HTTPS, der die SSL-Zertifikatverwaltung vereinfacht.

**Voraussetzungen:**

- Domänenname, der auf Ihren Server verweist
- Caddy auf Ihrem System installiert

**Schritt 1: Caddy installieren**

Folgen Sie der [offiziellen Installationsanleitung](https://caddyserver.com/docs/install) für Ihr Betriebssystem.

**Schritt 2: Caddyfile erstellen**

Erstellen Sie eine `Caddyfile` mit folgendem Inhalt:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Schritt 3: Caddy ausführen**

```bash
sudo caddy run --config Caddyfile
```

Oder verwenden Sie es als Systemdienst:

```bash
sudo caddy start --config Caddyfile
```

Caddy wird SSL-Zertifikate von Let's Encrypt automatisch abrufen und verwalten.

**Dokumentation:**

- [Caddy-Dokumentation](https://caddyserver.com/docs/)
- [Caddy-Anleitung für Reverse Proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Wichtige Hinweise {#important-notes}

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::info[WICHTIG]
Nach der Einrichtung von HTTPS müssen Sie die Konfiguration Ihres Duplicati-Servers aktualisieren, um die HTTPS-URL zu verwenden:

:::

:::tip

- Ersetzen Sie `your-domain.com` durch Ihren tatsächlichen Domänennamen
- Stellen Sie sicher, dass der DNS-A-Eintrag Ihrer Domäne auf die IP-Adresse Ihres Servers verweist
- Beide Lösungen erneuern SSL-Zertifikate automatisch
- Erwägen Sie, eine Firewall einzurichten, um nur HTTP/HTTPS-Datenverkehr zuzulassen
:::
