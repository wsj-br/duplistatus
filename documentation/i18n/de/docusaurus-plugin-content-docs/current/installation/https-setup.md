# HTTPS-Einrichtung (Optional)

Für Produktionsumgebungen wird empfohlen, **duplistatus** über HTTPS mit einem Reverse-Proxy bereitzustellen. Dieser Abschnitt enthält Konfigurationsbeispiele für gängige Reverse-Proxy-Lösungen.

### Option 1: Nginx mit Certbot (Let's Encrypt)

[Nginx](https://nginx.org/) ist ein beliebter Webserver, der als Reverse-Proxy fungieren kann, und [Certbot](https://certbot.eff.org/) stellt kostenlose SSL-Zertifikate von Let's Encrypt bereit.

**Voraussetzungen:**

- Domainname, der auf Ihren Server verweist
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

**Schritt 3: Website aktivieren und SSL-Zertifikat erhalten**

```bash
# Website aktivieren
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL-Zertifikat erhalten
sudo certbot --nginx -d your-domain.com
```

Certbot aktualisiert automatisch Ihre Nginx-Konfiguration, um SSL-Einstellungen einzuschließen und HTTP auf HTTPS umzuleiten.

**Dokumentation:**

- [Nginx-Dokumentation](https://nginx.org/en/docs/)
- [Certbot-Dokumentation](https://certbot.eff.org/instructions)
- [Let's Encrypt-Dokumentation](https://letsencrypt.org/docs/)

### Option 2: Caddy

[Caddy](https://caddyserver.com/) ist ein moderner Webserver mit automatischem HTTPS, der die SSL-Zertifikatsverwaltung vereinfacht.

**Voraussetzungen:**

- Domainname, der auf Ihren Server verweist
- Caddy auf Ihrem System installiert

**Schritt 1: Caddy installieren**

Folgen Sie der [offiziellen Installationsanleitung](https://caddyserver.com/docs/install) für Ihr Betriebssystem.

**Schritt 2: Caddyfile erstellen**

Erstellen Sie ein `Caddyfile` mit folgendem Inhalt:

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

Caddy wird automatisch SSL-Zertifikate von Let's Encrypt beziehen und verwalten.

**Dokumentation:**

- [Caddy-Dokumentation](https://caddyserver.com/docs/)
- [Caddy Reverse-Proxy-Anleitung](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Wichtige Hinweise

:::info[IMPORTANT]
Denken Sie nach der Einrichtung von HTTPS daran, Ihre Duplicati-Serverkonfiguration zu aktualisieren, um die HTTPS-URL zu verwenden:

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::

:::tip

- Ersetzen Sie `your-domain.com` durch Ihren tatsächlichen Domainnamen
- Stellen Sie sicher, dass der DNS-A-Eintrag Ihrer Domain auf die IP-Adresse Ihres Servers verweist
- Beide Lösungen erneuern SSL-Zertifikate automatisch
- Erwägen Sie die Einrichtung einer Firewall, um nur HTTP/HTTPS-Verkehr zuzulassen
  :::

