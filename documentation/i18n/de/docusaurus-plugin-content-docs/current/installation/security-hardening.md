# Sicherheitshärtung {/* #security-hardening */}

Die Produktionshärtung für **duplistatus** ist schichtweise und optional. Jede hier beschriebene Funktion ist standardmäßig deaktiviert, sodass eine frische Installation weiter funktioniert, bis Sie sie aktivieren.

- **API-Schlüssel** — bereichsspezifische Geheimnisse für die externen Upload- und Lese-APIs; in der Regel der einfachste erste Schritt in einem Homelab
- **IP-Zulassungslisten** — CIDR-Einschränkungen für den Administrationsinterface, die externen APIs oder beide
- **HTTPS-Reverse-Proxy** — verschlüsselte Datenübertragung, mit Port `9666` außerhalb des öffentlichen Internets

## Empfohlene Reihenfolge {/* #recommended-order */}

1. Halten Sie Port `9666` außerhalb des öffentlichen Internets: Binden Sie die Anwendung an localhost oder ein privates Netzwerk.
2. Erstellen Sie [API-Schlüssel](#api-keys) und aktivieren Sie **API-Schlüssel für externe APIs erfordern**. Dies funktioniert ohne Reverse-Proxy und ist der schnellste Erfolg.
3. Servieren Sie **duplistatus** über einen [Reverse-Proxy mit HTTPS](#https-with-a-reverse-proxy).
4. Fügen Sie die TCP-Peer-Adresse des Proxys zu **Vertrauenswürdige Proxies** hinzu (oder `IP_TRUSTED_PROXIES`), falls Sie Zulassungslisten verwenden möchten.
5. Optional können Sie die Admin- und externen [IP-Zulassungslisten](#ip-allowlist) aktivieren, wobei Sie **Erkannte IP** und die Vorschläge für kürzlich verwendete IPs verwenden, um sich nicht selbst auszuschließen.

## Zugriff mit API-Schlüsseln und IP-Zulassungsliste einschränken {/* #restrict-access-with-api-keys-and-ip-allowlists */}

Diese beiden Einstellungen begrenzen, wer auf das Dashboard und die externen Daten-APIs zugreifen kann. Sie sind unabhängig: Wenn beide aktiviert sind, muss eine Anfrage **beide** Prüfungen bestehen.

### API-Schlüssel {/* #api-keys */}

[API-Schlüssel](../user-guide/settings/api-keys-settings.md) sind die einfachste Schutzmaßnahme, insbesondere in einem Homelab. Erstellen Sie bereichsspezifische Geheimnisse für Duplicati-Uploads und Homepage-Widgets und erfordern Sie sie — kein Reverse-Proxy oder CIDR-Planung nötig.

| Bereich | Endpunkte |
|--------|-----------|
| Hochladen | `POST /api/upload` |
| Lesen | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Erstellen Sie mindestens einen Upload-Schlüssel und einen Lese-Schlüssel **bevor** Sie **API-Schlüssel für externe APIs erfordern** aktivieren. Andernfalls stoppen Duplicati-Uploads und Homepage-Widgets, sobald der Schalter aktiviert ist.

Duplicati kann keine benutzerdefinierten Header in seinen Anfragen einbeziehen, sodass Sie seinen API-Schlüssel hinzufügen müssen, indem Sie `?api_key=…` zur Report-URL hinzufügen. Beachten Sie, dass die Verwendung der Abfragezeichenfolge den API-Schlüssel in den Zugriffsprotokollen des Reverse-Proxys offenlegt. Für andere Clients, die benutzerdefinierte Header unterstützen, wird empfohlen, stattdessen den `X-Api-Key`-Header oder den `Authorization: Bearer`-Header zu verwenden, um die Sicherheit zu erhöhen.

Das Upload-Größenlimit und die pro-IP-Rate-Limits auf der gleichen Einstellungsseite gelten auch, wenn Schlüssel optional sind. API-Schlüssel schützen die externen Daten-APIs nur; sie beschränken nicht den Admin-Interface, der durch Login und optional durch die Admin-IP-Zulassungsliste geschützt ist.

### IP-Zulassungsliste {/* #ip-allowlist */}

[IP-Zulassungsliste](../user-guide/settings/ip-allowlist-settings.md) bietet zwei separate CIDR-Listen, beide standardmäßig deaktiviert:

- **Administrationsinterface** — Seiten, Anmeldung, CSRF und Sitzungs-APIs
- **Externe APIs** — `/api/upload`, `/api/summary` und `/api/lastbackup*`
- **Gesundheits- und Ping-APIs** — `/api/health` und `/api/ping` bleiben öffentlich, solange beide Listen aus sind. Wann eine der Listen an ist, akzeptieren sie Loopback plus CIDRs aus der Admin- **oder** externen Liste, und nicht-Loopback-Clients werden rate-limited. App-Ebene-Limits stoppen keinen volumetrischen Verbindungsflood; fügen Sie `limit_req` / Caddy `rate_limit` auf dem Reverse-Proxy hinzu, wenn die Instanz internetzugänglich ist.

Bevor Sie eine der Listen aktivieren, überprüfen Sie **Erkannte IP** unter **Einstellungen → IP-Zulassungsliste** und vergleichen Sie die **Peer-IP** mit der **Zulassungsliste-IP**. Verwenden Sie **Aktuelle IP hinzufügen** oder die Vorschläge für kürzlich verwendete IPs, damit Sie sich nicht selbst ausschließen. Wiederherstellungsschritte finden Sie unter [Durch IP-Zulassungsliste gesperrt](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

Wenn **duplistatus** hinter einem Reverse-Proxy liegt, konfigurieren Sie **Vertrauenswürdige Proxies** zuerst (siehe [Vertrauenswürdige Proxies für IP-Zulassungslisten](#trusted-proxies-for-ip-allowlists) unten). Ohne diese Einstellung werden Zulassungslisten-Entscheidungen gegen die Adresse des Proxys statt gegen die Adresse des Clients getroffen.

## HTTPS mit einem Reverse-Proxy {/* #https-with-a-reverse-proxy */}

Für Produktionsumgebungen servieren Sie **duplistatus** über HTTPS hinter einem Reverse-Proxy. Die Beispiele unten decken zwei beliebte Optionen ab.

### Option 1: Nginx mit Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) ist ein weit verbreiteter Webserver, der als Reverse-Proxy fungieren kann, und [Certbot](https://certbot.eff.org/) stellt kostenlose TLS-Zertifikate von Let's Encrypt aus.

**Voraussetzungen:**

- Eine Domain, deren DNS A- (oder AAAA-) Datensatz auf Ihren Server verweist
- Nginx installiert auf Ihrem System
- Certbot installiert für Ihr Betriebssystem

**Schritt 1: Nginx und Certbot installieren**

Auf Ubuntu/Debian:

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

Dieses Beispiel **überschreibt** `X-Forwarded-For` und `X-Real-IP` mit `$remote_addr`. Verwenden Sie nicht `$proxy_add_x_forwarded_for`: es hängt an das an, was der Client gesendet hat, und lässt Client-gesteuerte Werte in einem Header, auf den die Zulassungsliste angewiesen ist.

**Schritt 3: Aktivieren Sie die Website und erhalten Sie das Zertifikat**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot fügt die TLS-Einstellungen zu Ihrer Nginx-Konfiguration hinzu und leitet HTTP zu HTTPS um. Es installiert auch einen Erneuerungstimer, den Sie mit folgendem Befehl überprüfen können:

```bash
sudo certbot renew --dry-run
```

**Dokumentation:**

- [Nginx-Dokumentation](https://nginx.org/en/docs/)
- [Certbot-Dokumentation](https://certbot.eff.org/instructions)
- [Let's Encrypt-Dokumentation](https://letsencrypt.org/docs/)

### Option 2: Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) ist ein moderner Webserver, der TLS-Zertifikate automatisch beantragt und erneuert, was die meisten Zertifikatsverwaltungsarbeiten entfernt.

**Voraussetzungen:**

- Ein Domainname, dessen DNS A- (oder AAAA-) Datensatz auf Ihren Server zeigt
- Caddy, das auf Ihrem System installiert ist

**Schritt 1: Caddy installieren**

Folgen Sie der [offiziellen Installationsanleitung](https://caddyserver.com/docs/install) für Ihr Betriebssystem.

**Schritt 2: Erstellen Sie die Caddyfile**

Paketinstallationen lesen `/etc/caddy/Caddyfile`. Setzen Sie den Inhalt auf:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

Die `reverse_proxy`-Direktive von Caddy setzt die Client-IP-Header für Sie. Sie müssen die TCP-Peer-Adresse des Proxys unter **Vertrauenswürdige Proxies** auflisten, wenn Sie IP-Zulassungslisten verwenden (siehe [unten](#trusted-proxies-for-ip-allowlists)).

**Schritt 3: Starten oder neu laden Sie Caddy**

Wenn Sie Caddy aus einem Paket installiert haben, wenden Sie die Konfiguration über den verwalteten Dienst an:

```bash
sudo systemctl reload caddy
```

Um Caddy stattdessen manuell auszuführen — zum Beispiel aus einer Caddyfile im aktuellen Verzeichnis — stoppen Sie zuerst den verwalteten Dienst, um die Ports 80 und 443 freizugeben, und führen Sie dann aus:

```bash
sudo caddy run --config Caddyfile
```

Caddy beantragt das Zertifikat beim ersten Servieren der Website und erneuert es vor Ablauf.

**Dokumentation:**

- [Caddy-Dokumentation](https://caddyserver.com/docs/)
- [Caddy-Anleitung für Reverse Proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Vertrauenswürdige Proxies für IP-Zulassungsliste {/* #trusted-proxies-for-ip-allowlists */}

Binden Sie **duplistatus** an localhost oder an ein privates Netzwerk, sodass der Reverse-Proxy der einzige öffentliche Listener ist. Port `9666` sollte niemals aus dem Internet erreichbar sein.

Wenn [IP-Zulassungslisten](../user-guide/settings/ip-allowlist-settings.md) aktiviert sind, listen Sie den Proxy unter **Vertrauenswürdige Proxies** auf (oder setzen Sie `IP_TRUSTED_PROXIES`). Die Anwendung berücksichtigt `X-Forwarded-For` und `X-Real-IP` nur, wenn der TCP-Peer ein vertrauenswürdiger Proxy ist; andernfalls ignoriert sie sie.

- Konfigurieren Sie den Proxy so, dass er diese Header mit der Adresse des verbundenen Clients **überschreibt**, wie im obigen Nginx-Beispiel. Hängen Sie nicht an.
- Wenn der Proxy auf dem Host läuft und **duplistatus** in einem Container läuft, ist die **Peer-IP** normalerweise das Docker-Bridge-Gateway (zum Beispiel `172.17.0.1`). Geben Sie diese Adresse oder CIDR in **Vertrauenswürdige Proxies** ein und die echten Client-CIDRs in der Admin- oder externen Zulassungsliste.
- Bevor Sie eine Zulassungsliste aktivieren, öffnen Sie **Einstellungen → IP-Zulassungsliste** und prüfen Sie **Erkannte IP**: Die **Peer-IP** sollte der Proxy (oder das Bridge-Gateway) sein und die **Zulassungs-IP** sollte der Client sein. Wenn die Zulassungs-IP immer noch den Proxy anzeigt, ist die vertrauenswürdige Proxy-Konfiguration noch nicht korrekt.

### Nach dem Aktivieren von HTTPS {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[WICHTIG]
Aktualisieren Sie Ihre Duplicati-Serverkonfiguration, um die HTTPS-URL zu verwenden:


Fügen Sie `?api_key=YOUR_UPLOAD_KEY` an, wenn API-Schlüssel erforderlich sind. Bei Duplicati älter als 2.0.9.106 verwenden Sie `--send-http-url=https://your-domain.com/api/upload` zusammen mit `--send-http-result-output-format=Json`. Siehe [Duplicati Server Configuration](duplicati-server-configuration.md).
:::

:::tip

- Ersetzen Sie `your-domain.com` in allen Beispielen durch Ihren eigenen Domainnamen.
- Bestätigen Sie, dass der DNS A- (oder AAAA-) Datensatz des Domains zu Ihrem Server auflöst, bevor Sie ein Zertifikat anfordern.
- Beide Optionen erneuern Zertifikate automatisch: Certbot über seinen systemd-Timer, Caddy über seinen integrierten Zertifikatsmanager.
- Beschränken Sie die Host-Firewall auf Port 443 und halten Sie `80` und `9666` für den Außenbereich geschlossen.
:::
