# Sicherheitshärtung {/* #security-hardening */}

Die Produktionshärtung für **duplistatus** ist in Schichten aufgebaut und optional. Jede hier beschriebene Funktion ist standardmäßig deaktiviert, sodass eine frische Installation weiterhin funktioniert, bis Sie sich entscheiden, sie zu aktivieren. Es gibt drei unabhängige Schichten:

- **API-Schlüssel** — bereichsspezifische Geheimnisse für die externen Upload- und Lese-APIs; in der Regel der einfachste erste Schritt in einem Homelab
- **IP-Zulassungsliste** — CIDR-Einschränkungen für den Administrationsinterface, die externen APIs oder beides
- **HTTPS-Reverse-Proxy** — verschlüsselte Datenübertragung, mit Port `9666` außerhalb des öffentlichen Internets

## Empfohlene Reihenfolge {/* #recommended-order */}

1. Halten Sie Port `9666` außerhalb des öffentlichen Internets: binden Sie die Anwendung an localhost oder ein privates Netzwerk.
2. Erstellen Sie [API-Schlüssel](#api-keys) und aktivieren Sie **API-Schlüssel für externe APIs erfordern**. Dies funktioniert ohne Reverse-Proxy und ist der schnellste Erfolg.
3. Stellen Sie **duplistatus** über einen [Reverse-Proxy mit HTTPS](#https-with-a-reverse-proxy) bereit.
4. Fügen Sie die TCP-Peer-Adresse des Proxys zu **Vertrauenswürdige Proxies** hinzu (oder `IP_TRUSTED_PROXIES`), wenn Sie Zulassungslisten verwenden möchten.
5. Optional können Sie die Admin- und externen [IP-Zulassungslisten](#ip-allowlist) aktivieren, indem Sie **Erkannte IP** und die Vorschläge für kürzlich verwendete IPs verwenden, um sich selbst nicht auszuschließen.

## Zugriffseinschränkung mit API-Schlüsseln und IP-Zulassungslisten {/* #restrict-access-with-api-keys-and-ip-allowlists */}

Diese beiden Einstellungsfunktionen begrenzen, wer auf das Dashboard und die externen Daten-APIs zugreifen kann. Sie sind unabhängig voneinander: wenn beide aktiviert sind, muss eine Anfrage **beide** Prüfungen bestehen.

### API-Schlüssel {/* #api-keys */}

[API-Schlüssel](../user-guide/settings/api-keys-settings.md) sind das einfachste Schutzmittel, insbesondere in einem Homelab. Erstellen Sie bereichsspezifische Geheimnisse für Duplicati-Uploads und Homepage-Widgets, dann erfordern Sie sie — kein Reverse-Proxy oder CIDR-Planning nötig.

| Bereich | Endpunkte |
|--------|-----------|
| Upload | `POST /api/upload` |
| Lesen | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Erstellen Sie mindestens einen Upload-Schlüssel und einen Lese-Schlüssel **bevor** Sie **API-Schlüssel für externe APIs erfordern** aktivieren. Andernfalls stoppen Duplicati-Uploads und Homepage-Widgets sofort, sobald der Schalter aktiviert ist.

Duplicati kann keine benutzerdefinierten Header in seinen Anfragen einbeziehen, sodass Sie seinen API-Schlüssel durch Hinzufügen von `?api_key=…` zur Berichts-URL bereitstellen müssen. Beachten Sie, dass die Verwendung der Abfragezeichenfolge den API-Schlüssel in den Zugriffsprotokollen des Reverse-Proxys offenlegt. Für andere Clients, die benutzerdefinierte Header unterstützen, wird empfohlen, stattdessen den `X-Api-Key`-Header oder den `Authorization: Bearer`-Header zu verwenden, um die Sicherheit zu erhöhen.

Das Upload-Größenlimit und die pro-IP-Ratenlimits auf derselben Einstellungsseite gelten auch dann, wenn Schlüssel optional sind. API-Schlüssel schützen die externen Daten-APIs nur; sie beschränken nicht den Administrationsinterface, der durch Anmeldung und optional durch die Admin-IP-Zulassungsliste geschützt ist.

### IP-Zulassungsliste {/* #ip-allowlist */}

[IP-Zulassungsliste](../user-guide/settings/ip-allowlist-settings.md) bietet zwei separate CIDR-Listen, beide standardmäßig deaktiviert:

- **Administrationsinterface** — Seiten, Anmeldung, CSRF und Sitzungs-APIs
- **Externe APIs** — `/api/upload`, `/api/summary`, und `/api/lastbackup*`
- **Gesundheits- und Ping-APIs** — `/api/health` und `/api/ping` bleiben öffentlich, solange beide Listen aus sind. Wenn eine der Listen aktiviert ist, akzeptieren sie Loopback plus CIDRs aus der Admin- **oder** externen Liste, und nicht-Loopback-Clients werden ratenbegrenzt. App-Ebene-Limits stoppen keine volumetrische Verbindungsflut; fügen Sie `limit_req` / Caddy `rate_limit` auf dem Reverse-Proxy hinzu, wenn die Instanz internetfähig ist.

Bevor Sie eine der Listen aktivieren, überprüfen Sie **Erkannte IP** unter **Einstellungen → IP-Zulassungsliste** und vergleichen Sie die **Peer-IP** mit der **Zulassungs-IP**. Verwenden Sie **Aktuelle IP hinzufügen** oder die Vorschläge für kürzlich verwendete IPs, damit Sie sich nicht selbst aussperren. Wiederherstellungsschritte finden Sie unter [Gesperrt durch IP-Zulassungsliste](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

Wenn **duplistatus** hinter einem Reverse-Proxy liegt, konfigurieren Sie **Vertrauenswürdige Proxies** zuerst (siehe [Vertrauenswürdige Proxies für IP-Zulassungslisten](#trusted-proxies-for-ip-allowlists) unten). Ohne diese Einstellung werden Zulassungsentscheidungen gegen die Adresse des Proxys statt gegen die Adresse des Clients getroffen.

## HTTPS mit einem Reverse-Proxy {/* #https-with-a-reverse-proxy */}

Für Produktionsumgebungen sollten Sie **duplistatus** über HTTPS hinter einem Reverse-Proxy bereitstellen. Die folgenden Beispiele decken zwei beliebte Optionen ab.

### Option 1: Nginx mit Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) ist ein weit verbreiteter Webserver, der als Reverse-Proxy fungieren kann, und [Certbot](https://certbot.eff.org/) stellt kostenlose TLS-Zertifikate von Let's Encrypt aus.

**Voraussetzungen:**

- Ein Domainname, dessen DNS A- (oder AAAA-) Datensatz auf Ihren Server zeigt
- Nginx installiert auf Ihrem System
- Certbot für Ihr Betriebssystem installiert

**Schritt 1: Installieren Sie Nginx und Certbot**

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

Diese Beispielkonfiguration **überschreibt** `X-Forwarded-For` und `X-Real-IP` mit `$remote_addr`. Verwenden Sie nicht `$proxy_add_x_forwarded_for`: es hängt an, was der Client gesendet hat, und lässt Client-kontrollierte Werte in einem Header, auf den Allowlists vertrauen.

**Schritt 3: Aktivieren Sie die Website und erhalten Sie das Zertifikat**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot fügt die TLS-Einstellungen zu Ihrer Nginx-Konfiguration hinzu und leitet HTTP zu HTTPS um. Es installiert auch einen Erneuerungs-Timer, den Sie mit folgendem Befehl überprüfen können:

```bash
sudo certbot renew --dry-run
```

**Dokumentation:**

- [Nginx-Dokumentation](https://nginx.org/en/docs/)
- [Certbot-Dokumentation](https://certbot.eff.org/instructions)
- [Let's Encrypt-Dokumentation](https://letsencrypt.org/docs/)

### Option 2: Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) ist ein moderner Webserver, der TLS-Zertifikate automatisch beantragt und erneuert, was die meisten Arbeiten zur Zertifikatsverwaltung entfernt.

**Voraussetzungen:**

- Ein Domainname, dessen DNS A- (oder AAAA-) Datensatz auf Ihren Server zeigt
- Caddy installiert auf Ihrem System

**Schritt 1: Installieren Sie Caddy**

Folgen Sie der [offiziellen Installationsanleitung](https://caddyserver.com/docs/install) für Ihr Betriebssystem.

**Schritt 2: Erstellen Sie die Caddyfile**

Paketinstallationen lesen `/etc/caddy/Caddyfile`. Setzen Sie den Inhalt wie folgt:

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

Caddy erhält das Zertifikat beim ersten Servieren der Website und erneuert es vor dem Ablauf.

**Dokumentation:**

- [Caddy-Dokumentation](https://caddyserver.com/docs/)
- [Caddy-Reverse-Proxy-Anleitung](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Vertrauenswürdige Proxies für IP-Zulassungslisten {/* #trusted-proxies-for-ip-allowlists */}

Binden Sie **duplistatus** an localhost oder an ein privates Netzwerk, sodass der Reverse-Proxy der einzige öffentliche Listener ist. Port `9666` sollte niemals aus dem Internet erreichbar sein.

Wenn [IP-Zulassungslisten](../user-guide/settings/ip-allowlist-settings.md) aktiviert sind, listen Sie den Proxy unter **Vertrauenswürdige Proxies** auf (oder setzen Sie `IP_TRUSTED_PROXIES`). Die Anwendung berücksichtigt `X-Forwarded-For` und `X-Real-IP` nur, wenn der TCP-Peer ein vertrauenswürdiger Proxy ist; andernfalls ignoriert sie sie.

- Konfigurieren Sie den Proxy so, dass er diese Header mit der Adresse des verbundenen Clients **überschreibt**, wie im Nginx-Beispiel oben. Nicht anhängen.
- Wann der Proxy auf dem Host läuft und **duplistatus** in einem Container läuft, ist die **Peer-IP** normalerweise das Docker-Bridge-Gateway (z.B. `172.17.0.1`). Setzen Sie diese Adresse oder CIDR in **Vertrauenswürdige Proxies** und setzen Sie die echten Client-CIDRs in die Admin- oder externe Zulassungsliste.
- Bevor Sie eine Zulassungsliste aktivieren, öffnen Sie **Einstellungen → IP-Zulassungsliste** und überprüfen Sie **Erkannte IP**: die **Peer-IP** sollte der Proxy (oder Bridge-Gateway) sein und die **Allowlist-IP** sollte der Client sein. Wenn die Allowlist-IP immer noch den Proxy anzeigt, ist die Konfiguration der vertrauenswürdigen Proxies noch nicht korrekt.

### Nach dem Aktivieren von HTTPS {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[WICHTIG]
Aktualisieren Sie Ihre Duplicati-Serverkonfiguration, um die HTTPS-URL zu verwenden:


Fügen Sie `?api_key=YOUR_UPLOAD_KEY` hinzu, wenn API-Schlüssel erforderlich sind. Bei Duplicati älter als 2.0.9.106 verwenden Sie `--send-http-url=https://your-domain.com/api/upload` zusammen mit `--send-http-result-output-format=Json`. Siehe [Duplicati-Serverkonfiguration](duplicati-server-configuration.md).
:::

:::tip

- Ersetzen Sie `your-domain.com` überall in den Beispielen durch Ihre eigene Domain.
- Stellen Sie sicher, dass der DNS A- (oder AAAA-) Eintrag der Domain zu Ihrem Server auflöst, bevor Sie ein Zertifikat anfordern.
- Beide Optionen erneuern Zertifikate automatisch: Certbot über seinen systemd-Timer, Caddy über seinen integrierten Zertifikatsmanager.
- Beschränken Sie die Host-Firewall auf Port 443 und halten Sie `80` und `9666` für die Außenwelt geschlossen.
:::
