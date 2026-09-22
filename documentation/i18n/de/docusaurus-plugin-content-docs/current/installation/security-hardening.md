# Sicherheitsabsicherung {/* #security-hardening */}

Die Produktionsabsicherung für **duplistatus** ist schichtweise und optional. Jede hier beschriebene Funktion ist standardmäßig ausgeschaltet, sodass eine frische Installation weiterhin funktioniert, bis Sie sich entscheiden, sie zu aktivieren. Es gibt drei unabhängige Schichten:

- **API-Schlüssel** — Bereichsbezogene Geheimnisse für die externen Upload- und Lese-APIs; normalerweise der einfachste erste Schritt in einem Heimlabor
- **IP-Zulassungslisten** — CIDR-Einschränkungen auf das Administrationsinterface, die externen APIs oder beides
- **HTTPS-Reverse-Proxy** — verschlüsselter Datenverkehr, wobei Port `9666` vom öffentlichen Internet ferngehalten wird

## Empfohlene Reihenfolge {/* #recommended-order */}

1. Halten Sie Port `9666` vom öffentlichen Internet fern: Binden Sie die Anwendung an localhost oder an ein privates Netzwerk.
2. Erstellen Sie [API-Schlüssel](#api-keys) und aktivieren Sie **API-Schlüssel für externe APIs erfordern**. Dies funktioniert ohne Reverse-Proxy und ist der schnellste Erfolg.
3. Stellen Sie **duplistatus** über einen [Reverse-Proxy mit HTTPS](#https-with-a-reverse-proxy) bereit.
4. Fügen Sie die TCP-Peer-Adresse des Proxys zu **Vertrauenswürdige Proxies** (oder `IP_TRUSTED_PROXIES`) hinzu, wenn Sie Zulassungslisten verwenden möchten.
5. Optional können Sie die Admin- und externen [IP-Zulassungslisten](#ip-allowlist) aktivieren und dabei **Erkannte IP** sowie die Vorschläge für kürzlich verwendete IPs nutzen, um sich nicht selbst auszusperren.

## Zugriff mit API-Schlüsseln und IP-Zulassungslisten beschränken {/* #restrict-access-with-api-keys-and-ip-allowlists */}

Diese beiden Einstellungsfeatures begrenzen, wer auf das Dashboard und die externen Daten-APIs zugreifen kann. Sie sind unabhängig voneinander: Wenn beide aktiviert sind, muss eine Anfrage **beide** Prüfungen bestehen.

### API-Schlüssel {/* #api-keys */}

[API-Schlüssel](../user-guide/settings/api-keys-settings.md) sind der einfachste Schutz, den man hinzufügen kann, besonders in einem Heimlabor. Erstellen Sie bereichsbezogene Geheimnisse für Duplicati-Uploads und Homepage-Widgets und fordern Sie diese dann an — kein Reverse-Proxy oder CIDR-Planung erforderlich.

| Bereich | Endpunkte |
|-------|-----------|
| Upload | `POST /api/upload` |
| Lesen | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Erstellen Sie mindestens einen Upload-Schlüssel und einen Lese-Schlüssel **bevor** Sie **API-Schlüssel für externe APIs erfordern** aktivieren. Andernfalls funktionieren Duplicati-Uploads und Homepage-Widgets nicht mehr, sobald der Schalter aktiviert ist.

Duplicati kann keine benutzerdefinierten Header in seine Anfragen einfügen, daher müssen Sie den API-Schlüssel für Duplicati bereitstellen, indem Sie `?api_key=…` zur Berichts-URL hinzufügen. Beachten Sie, dass die Verwendung der Abfragezeichenkette den API-Schlüssel in den Zugriffsprotokollen des Reverse-Proxys sichtbar macht. Für andere Clients, die benutzerdefinierte Header unterstützen, wird empfohlen, stattdessen den `X-Api-Key`-Header oder den `Authorization: Bearer`-Header zu verwenden, um zusätzliche Sicherheit zu gewährleisten.

Das Upload-Größenlimit und die pro-IP-Ratenlimits auf derselben Einstellungsseite gelten auch, während Schlüssel optional sind. API-Schlüssel schützen nur die externen Daten-APIs; sie beschränken nicht das Administrationsinterface, das durch Anmeldung und optional durch die Admin-IP-Zulassungsliste geschützt ist.

### IP-Zulassungsliste {/* #ip-allowlist */}

[IP-Zulassungsliste](../user-guide/settings/ip-allowlist-settings.md) bietet zwei separate CIDR-Listen, beide standardmäßig ausgeschaltet:

- **Administrationsinterface** — Seiten, Anmeldung, CSRF- und Sitzungs-APIs
- **Externe APIs** — `/api/upload`, `/api/summary` und `/api/lastbackup*`
- **Status und Ping** — `/api/health` und `/api/ping` bleiben öffentlich, solange beide Listen ausgeschaltet sind. Wenn eine Liste eingeschaltet ist, akzeptieren sie Loopback plus CIDRs aus der Admin-**oder** externen Liste, und Nicht-Loopback-Clients werden ratenbegrenzt. Anwendungsebene Limits stoppen keinen massiven Verbindungsüberlauf; fügen Sie `limit_req` / Caddy `rate_limit` auf dem Reverse-Proxy hinzu, wenn die Instanz dem Internet gegenüber steht.

Bevor Sie eine der Listen aktivieren, prüfen Sie **Erkannte IP** unter **Einstellungen → IP-Zulassungsliste** und vergleichen Sie die **Peer-IP** mit der **IP zur Whitelist hinzufügen**. Verwenden Sie **Aktuelle IP hinzufügen** oder die Vorschläge für kürzlich verwendete IPs, damit Sie sich nicht selbst aussperren. Wiederherstellungsschritte finden Sie unter [Von IP-Zulassungsliste ausgesperrt](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

Wenn **duplistatus** hinter einem Reverse-Proxy steht, konfigurieren Sie zuerst **Vertrauenswürdige Proxies** (siehe unten [Vertrauenswürdige Proxies für IP-Zulassungslisten](#trusted-proxies-for-ip-allowlists)). Ohne dies werden Zulassungsentscheidungen gegen die Adresse des Proxys statt der Client-Adresse getroffen.

## HTTPS mit einem Reverse-Proxy {/* #https-with-a-reverse-proxy */}

Verwenden Sie für Produktionsbereitstellungen **duplistatus** über HTTPS hinter einem Reverse-Proxy. Die folgenden Beispiele behandeln zwei beliebte Optionen.

### Option 1: Nginx mit Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) ist ein weit verbreiteter Webserver, der als Reverse-Proxy fungieren kann, und [Certbot](https://certbot.eff.org/) stellt kostenlose TLS-Zertifikate von Let's Encrypt aus.

**Voraussetzungen:**

- Ein Domainname, dessen DNS-A- (oder AAAA-) Eintrag auf Ihren Server zeigt
- Auf Ihrem System installiertes Nginx
- Für Ihr Betriebssystem installiertes Certbot

**Schritt 1: Installieren Sie Nginx und Certbot**

Unter Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Schritt 2: Erstellen Sie die Nginx-Konfiguration**

Erstellen Sie `/etc/nginx/sites-available/duplistatus`:

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

Dieses Beispiel **überschreibt** `X-Forwarded-For` und `X-Real-IP` mit `$remote_addr`. Verwenden Sie nicht `$proxy_add_x_forwarded_for` stattdessen: Es hängt an, was der Client gesendet hat, wodurch clientseitig kontrollierte Werte in einem Header verbleiben, auf den sich Allowlisten verlassen.

**Schritt 3: Aktivieren Sie die Website und erhalten Sie das Zertifikat**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot fügt Ihrer Nginx-Konfiguration die TLS-Einstellungen hinzu und leitet HTTP auf HTTPS um. Außerdem installiert es einen Erneuerungstimer, den Sie wie folgt überprüfen können:

```bash
sudo certbot renew --dry-run
```

**Dokumentation:**

- [Nginx-Dokumentation](https://nginx.org/en/docs/)
- [Certbot-Dokumentation](https://certbot.eff.org/instructions)
- [Let's Encrypt-Dokumentation](https://letsencrypt.org/docs/)

### Option 2: Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) ist ein moderner Webserver, der automatisch TLS-Zertifikate bezieht und erneuert, wodurch der größte Teil der Zertifikatsverwaltung entfällt.

**Voraussetzungen:**

- Ein Domainname, dessen DNS-A- (oder AAAA-) Eintrag auf Ihren Server zeigt
- Auf Ihrem System installiertes Caddy

**Schritt 1: Installieren Sie Caddy**

Folgen Sie dem [offiziellen Installationshandbuch](https://caddyserver.com/docs/install) für Ihr Betriebssystem.

**Schritt 2: Erstellen der Caddyfile**

Paketinstallationen lesen `/etc/caddy/Caddyfile`. Legen Sie deren Inhalt wie folgt fest:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

Die `reverse_proxy`-Direktive von Caddy legt die Client-IP-Header für Sie fest. Sie müssen die TCP-Peer-Adresse des Proxys weiterhin unter **Vertrauenswürdige Proxies** auflisten, wenn IP-Zulassungslisten verwendet werden (siehe [unten](#trusted-proxies-for-ip-allowlists)).

**Schritt 3: Caddy starten oder neu laden**

Wenn Sie Caddy aus einem Paket installiert haben, wenden Sie die Konfiguration über den verwalteten Dienst an:

```bash
sudo systemctl reload caddy
```

Um Caddy stattdessen manuell auszuführen – beispielsweise aus einer Caddyfile im aktuellen Verzeichnis – stoppen Sie zuerst den verwalteten Dienst, um die Ports 80 und 443 freizugeben, und führen Sie dann Folgendes aus:

```bash
sudo caddy run --config Caddyfile
```

Caddy bezieht das Zertifikat beim ersten Mal, wenn es die Website bereitstellt, und erneuert es vor Ablauf.

**Dokumentation:**

- [Caddy-Dokumentation](https://caddyserver.com/docs/)
- [Caddy-Reverse-Proxy-Anleitung](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Vertrauenswürdige Proxies für IP-Zulassungslisten {/* #trusted-proxies-for-ip-allowlists */}

Binden Sie **duplistatus** an localhost oder an ein privates Netzwerk, sodass der Reverse-Proxy der einzige öffentliche Listener ist. Der Port `9666` sollte niemals aus dem Internet heraus erreichbar sein.

Wenn [IP-Zulassungslisten](../user-guide/settings/ip-allowlist-settings.md) aktiviert sind, listen Sie den Proxy unter **Vertrauenswürdige Proxies** auf (oder setzen Sie `IP_TRUSTED_PROXIES`). Die Anwendung berücksichtigt `X-Forwarded-For` und `X-Real-IP` nur, wenn der TCP-Peer ein vertrauenswürdiger Proxy ist; andernfalls ignoriert sie diese.

- Konfigurieren Sie den Proxy so, dass diese Header mit der Adresse des verbindenden Clients **überschrieben** werden, wie im obigen Nginx-Beispiel gezeigt. Fügen Sie nicht an.
- Wenn der Proxy auf dem Host läuft und **duplistatus** in einem Container ausgeführt wird, ist die **Peer-IP** normalerweise das Docker-Bridge-Gateway (z. B. `172.17.0.1`). Fügen Sie diese Adresse oder CIDR zu **Vertrauenswürdige Proxies** hinzu und die echten Client-CIDRs in die Admin- oder externe Zulassungsliste.
- Bevor Sie eine Zulassungsliste aktivieren, öffnen Sie **Einstellungen → IP-Zulassungsliste** und prüfen Sie **Erkannte IP**: Die **Peer-IP** sollte der Proxy (oder das Bridge-Gateway) sein und die **IP zur Whitelist hinzufügen** sollte der Client sein. Wenn die IP zur Whitelist immer noch den Proxy anzeigt, ist die Konfiguration des vertrauenswürdigen Proxys noch nicht korrekt.

### Nach Aktivierung von HTTPS {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[WICHTIG]
Aktualisieren Sie Ihre Duplicati-Serverkonfiguration, um die HTTPS-URL zu verwenden:


Hängen Sie `?api_key=YOUR_UPLOAD_KEY` an, falls API-Schlüssel erforderlich sind. Bei Duplicati älter als 2.0.9.106 verwenden Sie `--send-http-url=https://your-domain.com/api/upload` zusammen mit `--send-http-result-output-format=Json`. Siehe [Duplicati-Serverkonfiguration](duplicati-server-configuration.md).
:::

:::tip

- Ersetzen Sie `your-domain.com` in allen Beispielen durch Ihre eigene Domain.
- Stellen Sie sicher, dass der DNS-A- (oder AAAA-) Eintrag Ihrer Domain auf Ihren Server verweist, bevor Sie ein Zertifikat anfordern.
- Beide Optionen erneuern Zertifikate automatisch: Certbot über seinen systemd-Timer, Caddy über seinen integrierten Zertifikatsmanager.
- Beschränken Sie die Host-Firewall auf Port 443 und lassen Sie `80` und `9666` nach außen geschlossen.
:::
