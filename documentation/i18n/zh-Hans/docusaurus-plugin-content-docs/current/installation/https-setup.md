# HTTPS 设置（可选） {#https-setup-optional}

对于生产环境部署，建议使用反向代理服务器通过 HTTPS 提供 **duplistatus**。本节提供流行的反向代理解决方案的配置示例。

### 选项 1：使用 Certbot（Let's Encrypt）的 Nginx {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) 是一种流行的 Web 服务器，可以作为反向代理服务器，而 [Certbot](https://certbot.eff.org/) 提供来自 Let's Encrypt 的免费 SSL 证书。

**先决条件：**

- 指向您的服务器的域名
- 您的系统上安装的 Nginx
- 为您的操作系统安装的 Certbot

**步骤 1：安装 Nginx 和 Certbot**

对于 Ubuntu/Debian：

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

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**步骤 3：启用站点并获取 SSL 证书**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot 将自动更新您的 Nginx 配置以包含 SSL 设置并将 HTTP 重定向到 HTTPS。

**文档：**

- [Nginx 文档](https://nginx.org/en/docs/)
- [Certbot 文档](https://certbot.eff.org/instructions)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)

### 选项 2：Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) 是一种具有自动 HTTPS 的现代 Web 服务器，简化了 SSL 证书管理。

**先决条件：**

- 指向您的服务器的域名
- 您的系统上安装的 Caddy

**步骤 1：安装 Caddy**

按照 [官方安装指南](https://caddyserver.com/docs/install) 为您的操作系统安装 Caddy。

**步骤 2：创建 Caddyfile**

创建一个 `Caddyfile`，内容如下：

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**步骤 3：运行 Caddy**

```bash
sudo caddy run --config Caddyfile
```

或者作为系统服务使用：

```bash
sudo caddy start --config Caddyfile
```

Caddy 将自动从 Let's Encrypt 获得和管理 SSL 证书。

**文档：**

- [Caddy 文档](https://caddyserver.com/docs/)
- [Caddy 反向代理指南](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### 重要注意事项 {#important-notes}

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::info[IMPORTANT]
设置 HTTPS 后，请记得更新 Duplicati 服务器配置以使用 HTTPS URL：

:::

:::tip

- 用您的实际域名替换 `your-domain.com`
- 确保您的域名的 DNS A 记录指向您的服务器的 IP 地址
- 两个解决方案都将自动续期 SSL 证书
- 考虑设置防火墙仅允许 HTTP/HTTPS 流量
:::
