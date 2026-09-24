# 安全配置 {/* #security-configuration */}

在生产环境中保护 **duplistatus** 是分层进行的，并且每一层都是可选的。此处描述的每个功能默认都处于关闭状态，因此全新安装的系统会保持正常工作，直到您选择启用它们。共有三个独立的层：

- **API 密钥** — 外部上传和读取 API 的作用域密钥；通常是在家庭实验室中的第一步
- **IP 白名单** — 对管理界面、外部 API 或两者进行 CIDR 限制
- **HTTPS 反向代理** — 加密流量，端口 `9666` 不公开到互联网

## 推荐顺序 {/* #recommended-order */}

1. 避免将端口 `9666` 暴露在公共互联网上：将应用程序绑定到 localhost 或专用网络。
2. 创建 [API 密钥](#api-keys) 并启用**要求外部 API 使用 API 密钥**。此方法无需反向代理即可生效，是最简单的第一步。
3. 通过[带有 HTTPS 的反向代理](#https-with-a-reverse-proxy)提供 **duplistatus** 服务。
4. 如果您打算使用允许列表，请将代理的连接地址添加到**受信任的代理**（或 `IP_TRUSTED_PROXIES`）中。
5. 可选启用管理员和外部 [IP 允许列表](#ip-allowlist)，使用**检测到的 IP** 和最近的 IP 建议来避免阻止您自己的访问。

## 使用 API 密钥和 IP 白名单限制访问 {/* #restrict-access-with-api-keys-and-ip-allowlists */}

这两个设置功能限制了谁可以访问仪表板和外部数据 API。它们是独立的：当两者都启用时，请求必须通过 **两个** 检查。

### API 密钥 {/* #api-keys */}

[API 密钥](../user-guide/settings/api-keys-settings.md) 是最简单的保护措施，尤其是在家庭实验室中。为 Duplicati 上传和 Homepage 小部件创建作用域密钥，然后要求它们 — 无需反向代理或 CIDR 规划。

| 作用域 | 端点 |
|-------|-----------|
| 上传 | `POST /api/upload` |
| 读取 | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

在开启 **要求外部 API 使用 API 密钥** 之前，至少创建一个上传密钥和一个读取密钥 **before**。否则，一旦启用开关，Duplicati 上传和 Homepage 小部件就会停止工作。

Duplicati 无法在其请求中包含自定义标头，因此您必须通过在报告 URL 中添加 `?api_key=…` 来提供其 API 密钥。请注意，使用查询字符串会在反向代理访问日志中暴露 API 密钥。对于支持自定义标头的其他客户端，建议改用 `X-Api-Key` 标头或 `Authorization: Bearer` 标头以增加安全性。

上传大小限制和同一设置页面上的每 IP 速率限制即使在密钥可选时也适用。API 密钥仅保护外部数据 API；它们不限制管理界面，管理界面由登录保护，以及可选的管理 IP 白名单保护。

### IP 白名单 {/* #ip-allowlist */}

[IP 白名单](../user-guide/settings/ip-allowlist-settings.md) 提供两个独立的 CIDR 列表，默认都是关闭的：

- **管理界面** — 页面、登录、CSRF 和会话 API
- **外部 API** — `/api/upload`, `/api/summary` 和 `/api/lastbackup*`
- **健康检查和 ping** — 当两个列表都关闭时，`/api/health` 和 `/api/ping` 保持公开。当任一列表开启时，它们接受回环加上管理员 **或** 外部列表的 CIDR，并且非回环客户端受到速率限制。应用级限制无法阻止大量连接洪水；如果实例面向互联网，请在反向代理上添加 `limit_req` / Caddy `rate_limit`。

在启用任一列表之前，请检查 **设置 → IP 白名单** 上的 **检测到的 IP**，并将 **对等 IP** 与 **白名单 IP** 进行比较。使用 **添加当前IP** 或最近 IP 建议，以免将自己锁定。恢复步骤请参见 [被 IP 白名单锁定](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist)。

如果 **duplistatus** 位于反向代理后面，请先配置 **受信任的代理**（参见下面的 [IP 白名单的受信任代理](#trusted-proxies-for-ip-allowlists)）。没有它，白名单决策将针对代理地址而不是客户端地址做出。

## 使用反向代理的 HTTPS {/* #https-with-a-reverse-proxy */}

对于生产部署，在反向代理后面通过 HTTPS 提供 **duplistatus** 服务。以下示例涵盖两种流行的选择。

### 选项 1：Nginx 配合 Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) 是一个广泛使用的 Web 服务器，可以充当反向代理，[Certbot](https://certbot.eff.org/) 从 Let's Encrypt 颁发免费的 TLS 证书。

**前提条件：**

- 一个域名，其 DNS A 记录（或 AAAA 记录）指向您的服务器
- 在系统上安装了 Nginx
- 为操作系统安装了 Certbot

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

此示例 **覆盖** `X-Forwarded-For` 和 `X-Real-IP` 为 `$remote_addr`。不要使用 `$proxy_add_x_forwarded_for` 来代替：它会追加到客户端发送的内容中，保留客户端控制的值到依赖白名单的头部中。

**步骤 3：启用站点并获取证书**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot 将 TLS 设置添加到您的 Nginx 配置中，并将 HTTP 重定向到 HTTPS。它还会安装续订计时器，您可以通过以下命令验证：

```bash
sudo certbot renew --dry-run
```

**文档：**

- [Nginx 文档](https://nginx.org/en/docs/)
- [Certbot 文档](https://certbot.eff.org/instructions)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)

### 选项 2：Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) 是一个现代 Web 服务器，可自动获取和续订 TLS 证书，这消除了大部分证书管理工作。

**前提条件：**

- 一个域名，其 DNS A 记录（或 AAAA 记录）指向您的服务器
- 在系统上安装了 Caddy

**步骤 1：安装 Caddy**

按照适用于您操作系统的[官方安装指南](https://caddyserver.com/docs/install)进行操作。

**步骤 2：创建 Caddyfile**

软件包安装会读取 `/etc/caddy/Caddyfile`。将其内容设置为：

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

Caddy 的 `reverse_proxy` 指令会为您设置客户端 IP 标头。使用 IP 允许列表时，您仍需在**受信任的代理**下列出代理的连接地址（参见[下文](#trusted-proxies-for-ip-allowlists)）。

**步骤 3：启动或重新加载 Caddy**

如果您从软件包安装了 Caddy，请通过托管服务应用配置：

```bash
sudo systemctl reload caddy
```

要改为手动运行 Caddy —— 例如从当前目录中的 Caddyfile 运行 —— 首先停止托管服务以释放端口 80 和 443，然后运行：

```bash
sudo caddy run --config Caddyfile
```

Caddy 在首次提供站点服务时获取证书，并在到期前续订。

**文档：**

- [Caddy 文档](https://caddyserver.com/docs/)
- [Caddy 反向代理指南](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### IP 允许列表的受信任代理 {/* #trusted-proxies-for-ip-allowlists */}

将 **duplistatus** 绑定到本地主机或私有网络，以便反向代理是唯一的公共监听器。端口 `9666` 永远不应能从互联网访问。

启用 [IP 允许列表](../user-guide/settings/ip-allowlist-settings.md) 后，请将代理列在**受信任的代理**下（或设置 `IP_TRUSTED_PROXIES`）。只有当连接地址是受信任的代理时，应用程序才会采用 `X-Forwarded-For` 和 `X-Real-IP`；否则会忽略它们。

- 配置代理以**覆盖**这些头信息，使用连接客户端的地址，如上面的 Nginx 示例所示。不要追加。
- 当代理在主机上运行且 **duplistatus** 在容器中运行时，**对等 IP** 通常是 Docker 网桥网关（例如 `172.17.0.1`）。将该地址或 CIDR 放入 **受信任的代理**，并将真实客户端 CIDR 放入管理员或外部允许列表。
- 启用允许列表之前，打开 **设置 → IP 白名单** 并检查 **检测到的 IP**：**对等 IP** 应该是代理（或网桥网关），**允许列表 IP** 应该是客户端。如果允许列表 IP 仍然显示代理，则受信任代理配置尚未正确。

### 启用 HTTPS 后 {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[重要]
更新您的 Duplicati 服务器配置以使用 HTTPS URL：


如果需要 API 密钥，请附加 `?api_key=YOUR_UPLOAD_KEY`。对于早于 2.0.9.106 版本的 Duplicati，请一起使用 `--send-http-url=https://your-domain.com/api/upload` 和 `--send-http-result-output-format=Json`。参见[Duplicati 服务器配置](duplicati-server-configuration.md)。
:::

:::tip

- 在所有示例中将 `your-domain.com` 替换为您自己的域名。
- 在请求证书之前确认域名的 DNS A（或 AAAA）记录解析到您的服务器。
- 两种选项都会自动续订证书：Certbot 通过其 systemd 定时器，Caddy 通过其内置证书管理器。
- 将主机防火墙限制为端口 443，并保持 `80` 和 `9666` 对外关闭。
:::
