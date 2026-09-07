# 安全加固 {/* #security-hardening */}

生产环境加固 **duplistatus** 是分层的且可选的。这里描述的每个功能默认都是关闭的，因此新安装的系统会继续正常工作，直到您选择启用它。有三个独立的层：

- **API 密钥** — 用于外部上传和读取 API 的范围密钥；通常是家庭实验室的最简单第一步
- **IP 白名单** — 管理界面、外部 API 或两者的 CIDR 限制
- **HTTPS 反向代理** — 加密流量，端口 `9666` 保持在公共互联网之外

## 推荐顺序 {/* #recommended-order */}

1. 将端口 `9666` 保持在公共互联网之外：将应用程序绑定到本地主机或私有网络。
2. 创建 [API 密钥](#api-keys) 并启用 **要求外部 API 使用 API 密钥**。这可以在没有反向代理的情况下工作，并且是最快的胜利。
3. 通过 [HTTPS 反向代理](#https-with-a-reverse-proxy) 提供 **duplistatus**。
4. 如果您打算使用白名单，请将代理的 TCP 对等地址添加到 **受信任的代理**（或 `IP_TRUSTED_PROXIES`）。
5. 可选地启用管理和外部 [IP 白名单](#ip-allowlist)，使用 **检测到的 IP** 和最近的 IP 建议，以避免锁定自己。

## 使用 API 密钥和 IP白名单限制访问 {/* #restrict-access-with-api-keys-and-ip-allowlists */}

这两个设置功能限制了谁可以访问仪表板和外部数据 API。它们是独立的：当两者都启用时，请求必须通过 **两者** 检查。

### API 密钥 {/* #api-keys */}

[API 密钥](../user-guide/settings/api-keys-settings.md) 是添加最简单的保护，特别是在家庭实验室中。为 Duplicati 上传和主页小部件创建范围密钥，然后要求它们 — 不需要反向代理或 CIDR 规划。

| 范围 | 端点 |
|-------|-----------|
| 上传 | `POST /api/upload` |
| 读取 | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

创建至少一个上传密钥和一个读取密钥 **在** 开启 **要求外部 API 使用 API 密钥** 之前。否则，一旦启用该开关，Duplicati 上传和主页小部件将停止工作。

Duplicati 不能在其请求中包含自定义标头，因此您必须通过将 `?api_key=…` 添加到报告 URL 来提供其 API 密钥。请注意，使用查询字符串会在反向代理访问日志中暴露 API 密钥。对于支持自定义标头的其他客户端，建议改用 `X-Api-Key` 标头或 `Authorization: Bearer` 标头以增强安全性。

同一设置页面上的上传大小限制和每 IP 速率限制即使在密钥是可选的情况下也适用。API 密钥仅保护外部数据 API；它们不限制管理界面，管理界面由登录和可选的管理 IP 白名单保护。

### IP白名单 {/* #ip-allowlist */}

[IP 白名单](../user-guide/settings/ip-allowlist-settings.md) 提供两个单独的 CIDR 列表，两者默认均为关闭：

- **管理界面** — 页面、登录、CSRF和会话API
- **外部API** — `/api/upload`、`/api/summary`和`/api/lastbackup*`
- **健康检查和ping** — `/api/health`和`/api/ping`在两个列表都关闭时保持公开。当任一列表开启时，它们接受回环地址加上管理**或**外部列表中的CIDR，非回环地址的客户端将被限速。应用级限制无法阻止大量连接洪水；如果实例面向互联网，请在反向代理上添加`limit_req` / Caddy `rate_limit`。

在启用任一列表之前，请检查 **设置 → IP 白名单** 上的 **检测到的 IP** 并将 **对等 IP** 与 **允许列表 IP** 进行比较。使用 **添加当前 IP** 或最近的 IP 建议，以避免锁定自己。恢复步骤在 [IP 白名单锁定](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist) 中。

如果 **duplistatus** 位于反向代理之后，请先配置 **受信任的代理**（见下文 [IP 白名单的受信任代理](#trusted-proxies-for-ip-allowlists))。如果没有它，白名单决策将针对代理的地址而不是客户端的地址。

## 使用反向代理实现 HTTPS {/* #https-with-a-reverse-proxy */}

对于生产部署，请通过反向代理提供 HTTPS **duplistatus**。以下示例涵盖两个流行的选项。

### 选项 1：使用 Certbot（Let's Encrypt）的 Nginx {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) 是一个广泛使用的 Web 服务器，可以充当反向代理，而 [Certbot](https://certbot.eff.org/) 从 Let's Encrypt 签发免费的 TLS 证书。

**先决条件：**

- 一个 DNS A（或 AAAA）记录指向您的服务器的域名
- 在您的系统上安装的 Nginx
- 为您的操作系统安装的 Certbot

**步骤 1：安装 Nginx 和 Certbot**

在 Ubuntu/Debian 上：

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**步骤 2：创建 Nginx 配置**

创建 `/etc/nginx/sites-available/duplistatus`：

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

此示例**覆盖** `X-Forwarded-For` 和 `X-Real-IP` 为 `$remote_addr`。不要使用 `$proxy_add_x_forwarded_for` 代替：它会附加客户端发送的内容，从而将客户端控制的值留在白名单依赖的标头中。

**步骤 3：启用站点并获取证书**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot 会将 TLS 设置添加到您的 Nginx 配置中，并将 HTTP 重定向到 HTTPS。它还会安装一个续订计时器，您可以通过以下命令验证：

```bash
sudo certbot renew --dry-run
```

**文档：**

- [Nginx 文档](https://nginx.org/en/docs/)
- [Certbot 文档](https://certbot.eff.org/instructions)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)

### 选项 2：Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) 是一个现代 Web 服务器，它会自动获取和续订 TLS 证书，从而消除大部分证书管理工作。

**先决条件：**

- 一个 DNS A（或 AAAA）记录指向您的服务器的域名
- 在您的系统上安装的 Caddy

**步骤 1：安装 Caddy**

按照 [官方安装指南](https://caddyserver.com/docs/install) 为您的操作系统安装 Caddy。

**步骤 2：创建 Caddyfile**

软件包安装会读取 `/etc/caddy/Caddyfile`。将其内容设置为：

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

Caddy 的 `reverse_proxy` 指令会为您设置客户端 IP 标头。在使用 IP 白名单时，您仍然需要在 **受信任的代理** 下列出代理的 TCP 对等地址（请参阅[下文](#trusted-proxies-for-ip-allowlists))。

**步骤 3：启动或重新加载 Caddy**

如果您是从软件包安装的 Caddy，请通过托管服务应用配置：

```bash
sudo systemctl reload caddy
```

要手动运行 Caddy 代替 — 例如从当前目录中的 Caddyfile — 首先停止托管服务以释放端口 80 和 443，然后运行：

```bash
sudo caddy run --config Caddyfile
```

Caddy 在首次提供站点时获取证书，并在到期前续订它。

**文档：**

- [Caddy 文档](https://caddyserver.com/docs/)
- [Caddy 反向代理指南](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### 用于IP白名单的受信任的代理 {/* #trusted-proxies-for-ip-allowlists */}

将 **duplistatus** 绑定到本地主机或私有网络，以便反向代理是唯一的公共监听器。端口 `9666` 永远不应从互联网访问。

当[IP 白名单](../user-guide/settings/ip-allowlist-settings.md)启用时，将代理列在 **受信任的代理** 下（或设置 `IP_TRUSTED_PROXIES`）。当 TCP 对等是受信任的代理时，应用程序仅在 `X-Forwarded-For` 和 `X-Real-IP` 中使用；否则它会忽略它们。

- 配置代理以**覆盖**这些标头，并使用连接客户端的地址，如上文中的 Nginx 示例。不要附加。
- 当代理在主机上运行且 **duplistatus** 在容器中运行时，**对等 IP** 通常是 Docker 桥接网关（例如 `172.17.0.1`）。将该地址或 CIDR 放入 **受信任的代理** 中，并将真实客户端 CIDR 放入管理员或外部白名单中。
- 在启用白名单之前，打开 **设置 → IP 白名单** 并检查 **检测到的 IP**：**对等 IP** 应该是代理（或桥接网关），而 **白名单 IP** 应该是客户端。如果白名单 IP 仍然显示代理，则受信任的代理配置尚未正确。

### 启用 HTTPS 后 {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[重要]
更新您的 Duplicati 服务器配置以使用 HTTPS URL：


如果需要 API 密钥，请附加 `?api_key=YOUR_UPLOAD_KEY`。在 Duplicati 早于 2.0.9.106 的版本中，请使用 `--send-http-url=https://your-domain.com/api/upload` 与 `--send-http-result-output-format=Json` 一起使用。请参阅 [Duplicati 服务器配置](duplicati-server-configuration.md)。
:::

:::tip

- 在整个示例中替换 `your-domain.com` 为您自己的域名。
- 在请求证书之前，确认域名的 DNS A（或 AAAA）记录解析到您的服务器。
- 两个选项都会自动续订证书：Certbot 通过其 systemd 计时器，Caddy 通过其内置的证书管理器。
- 将主机防火墙限制为端口 443，并将 `80` 和 `9666` 关闭到外部。
:::
