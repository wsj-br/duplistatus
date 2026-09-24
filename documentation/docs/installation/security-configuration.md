
# Security Configuration {/* #security-configuration */}

Securing **duplistatus** in production is done in layers, and every layer is optional. Every feature described here is off by default, so a fresh install keeps working until you choose to enable it. There are three independent layers:

- **API keys** — scoped secrets for the external upload and read APIs; usually the easiest first step in a homelab
- **IP allowlists** — CIDR restrictions on the admin interface, the external APIs, or both
- **HTTPS reverse proxy** — encrypted traffic, with port `9666` kept off the public internet

## Recommended order {/* #recommended-order */}

1. Keep port `9666` off the public internet: bind the application to localhost or to a private network.
2. Create [API keys](#api-keys) and enable **Require API keys for external APIs**. This works without a reverse proxy and is the easiest first step.
3. Serve **duplistatus** through a [reverse proxy with HTTPS](#https-with-a-reverse-proxy).
4. Add the proxy's connecting address to **Trusted proxies** (or `IP_TRUSTED_PROXIES`) if you intend to use allowlists.
5. Optionally enable the admin and external [IP allowlists](#ip-allowlist), using **Detected IP** and the recent-IP suggestions to avoid blocking your own access.

## Restrict access with API keys and IP allowlists {/* #restrict-access-with-api-keys-and-ip-allowlists */}

These two Settings features limit who can reach the dashboard and the external data APIs. They are independent: when both are enabled, a request must pass **both** checks.

### API Keys {/* #api-keys */}

[API Keys](../user-guide/settings/api-keys-settings.md) are the simplest protection to add, especially in a homelab. Create scoped secrets for Duplicati uploads and Homepage widgets, then require them — no reverse proxy or CIDR planning needed.

| Scope | Endpoints |
|-------|-----------|
| Upload | `POST /api/upload` |
| Read | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Create at least one upload key and one read key **before** turning on **Require API keys for external APIs**. Otherwise Duplicati uploads and Homepage widgets stop working as soon as the switch is enabled.

Duplicati cannot include custom headers in its requests, so you must provide its API key by adding `?api_key=…` to the report URL. Note that using the query string exposes the API key in reverse proxy access logs. For other clients that support custom headers, it is recommended to use the `X-Api-Key` header or the `Authorization: Bearer` header instead for added security.

The upload size limit and the per-IP rate limits on the same Settings page apply even while keys are optional. API keys protect the external data APIs only; they do not restrict the admin interface, which is guarded by login and, optionally, by the admin IP allowlist.

### IP Allowlist {/* #ip-allowlist */}

[IP Allowlist](../user-guide/settings/ip-allowlist-settings.md) provides two separate CIDR lists, both off by default:

- **Admin interface** — pages, login, CSRF, and session APIs
- **External APIs** — `/api/upload`, `/api/summary`, and `/api/lastbackup*`
- **Health and ping** — `/api/health` and `/api/ping` stay public while both lists are off. When either list is on, they accept loopback plus CIDRs from the admin **or** external list, and non-loopback clients are rate-limited. App-level limits do not stop a volumetric connection flood; add `limit_req` / Caddy `rate_limit` on the reverse proxy if the instance is internet-facing.

Before enabling either list, check **Detected IP** on **Settings → IP Allowlist** and compare the **Peer IP** with the **Allowlist IP**. Use **Add current IP** or the recent-IP suggestions so that you do not lock yourself out. Recovery steps are in [Locked Out by IP Allowlist](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

If **duplistatus** sits behind a reverse proxy, configure **Trusted proxies** first (see [Trusted proxies for IP allowlists](#trusted-proxies-for-ip-allowlists) below). Without it, allowlist decisions are made against the proxy's address rather than the client's.

## HTTPS with a reverse proxy {/* #https-with-a-reverse-proxy */}

For production deployments, serve **duplistatus** over HTTPS behind a reverse proxy. The examples below cover two popular options.

### Option 1: Nginx with Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) is a widely used web server that can act as a reverse proxy, and [Certbot](https://certbot.eff.org/) issues free TLS certificates from Let's Encrypt.

**Prerequisites:**

- A domain name whose DNS A (or AAAA) record points to your server
- Nginx installed on your system
- Certbot installed for your operating system

**Step 1: Install Nginx and Certbot**

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Step 2: Create the Nginx configuration**

Create `/etc/nginx/sites-available/duplistatus`:

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

This sample **overwrites** `X-Forwarded-For` and `X-Real-IP` with `$remote_addr`. Do not use `$proxy_add_x_forwarded_for` instead: it appends to whatever the client sent, leaving client-controlled values in a header that allowlists rely on.

**Step 3: Enable the site and obtain the certificate**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot adds the TLS settings to your Nginx configuration and redirects HTTP to HTTPS. It also installs a renewal timer, which you can verify with:

```bash
sudo certbot renew --dry-run
```

**Documentation:**

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/instructions)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### Option 2: Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) is a modern web server that obtains and renews TLS certificates automatically, which removes most of the certificate management work.

**Prerequisites:**

- A domain name whose DNS A (or AAAA) record points to your server
- Caddy installed on your system

**Step 1: Install Caddy**

Follow the [official installation guide](https://caddyserver.com/docs/install) for your operating system.

**Step 2: Create the Caddyfile**

Package installations read `/etc/caddy/Caddyfile`. Set its contents to:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

Caddy's `reverse_proxy` directive sets the client IP headers for you. You still have to list the proxy's connecting address under **Trusted proxies** when using IP allowlists (see [below](#trusted-proxies-for-ip-allowlists)).

**Step 3: Start or reload Caddy**

If you installed Caddy from a package, apply the configuration through the managed service:

```bash
sudo systemctl reload caddy
```

To run Caddy manually instead — for example from a Caddyfile in the current directory — stop the managed service first to free ports 80 and 443, then run:

```bash
sudo caddy run --config Caddyfile
```

Caddy obtains the certificate the first time it serves the site and renews it before expiry.

**Documentation:**

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Caddy Reverse Proxy Guide](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Trusted proxies for IP allowlists {/* #trusted-proxies-for-ip-allowlists */}

Bind **duplistatus** to localhost or to a private network so that the reverse proxy is the only public listener. Port `9666` should never be reachable from the internet.

When [IP allowlists](../user-guide/settings/ip-allowlist-settings.md) are enabled, list the proxy under **Trusted proxies** (or set `IP_TRUSTED_PROXIES`). The application honours `X-Forwarded-For` and `X-Real-IP` only when the connecting address is a trusted proxy; otherwise it ignores them.

- Configure the proxy to **overwrite** those headers with the connecting client's address, as in the Nginx sample above. Do not append.
- When the proxy runs on the host and **duplistatus** runs in a container, the **Peer IP** is usually the Docker bridge gateway (for example `172.17.0.1`). Put that address or CIDR in **Trusted proxies**, and put the real client CIDRs in the admin or external allowlist.
- Before enabling an allowlist, open **Settings → IP Allowlist** and check **Detected IP**: the **Peer IP** should be the proxy (or bridge gateway) and the **Allowlist IP** should be the client. If the Allowlist IP still shows the proxy, the trusted-proxy configuration is not yet correct.

### After enabling HTTPS {/* #after-enabling-https */}

:::info[IMPORTANT]
Update your Duplicati server configuration to use the HTTPS URL:

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

Append `?api_key=YOUR_UPLOAD_KEY` if API keys are required. On Duplicati older than 2.0.9.106, use `--send-http-url=https://your-domain.com/api/upload` together with `--send-http-result-output-format=Json`. See [Duplicati Server Configuration](duplicati-server-configuration.md).
:::

:::tip

- Replace `your-domain.com` with your own domain throughout the examples.
- Confirm that the domain's DNS A (or AAAA) record resolves to your server before requesting a certificate.
- Both options renew certificates automatically: Certbot through its systemd timer, Caddy through its built-in certificate manager.
- Restrict the host firewall to port 443, and keep `80` and `9666` closed to the outside.
:::
