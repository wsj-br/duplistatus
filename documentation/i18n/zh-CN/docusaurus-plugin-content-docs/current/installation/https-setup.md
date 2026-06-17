

# HTTPS 设置（可选） {#https-setup-optional}

对于生产部署，建议通过反向代理以 HTTPS 提供 **duplistatus** 服务。本节提供常用反向代理解决方案的配置示例。

### 选项 1：Nginx 与 Certbot（Let's Encrypt） {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) 是常用 Web 服务器，可作为反向代理；[Certbot](https://certbot.eff.org/) 提供 Let's Encrypt 免费 SSL 证书。

**前提条件：**

- 指向服务器的域名
- 系统已安装 Nginx
- 已安装适用于操作系统的 Certbot

**步骤 1：安装 Nginx 和 Certbot**

Ubuntu/Debian：

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

Certbot 将自动更新 Nginx 配置以包含 SSL 设置并将 HTTP 重定向到 HTTPS。

**文档：**

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/instructions)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### 选项 2：Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) 是现代 Web 服务器，具有自动 HTTPS 功能，简化 SSL 证书管理。

**前提条件：**

- 指向服务器的域名
- 系统已安装 Caddy

**步骤 1：安装 Caddy**

请遵循适用于操作系统的[官方安装指南](https://caddyserver.com/docs/install)。

**步骤 2：创建 Caddyfile**

创建包含以下内容的 `Caddyfile`：

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**步骤 3：运行 Caddy**

```bash
sudo caddy run --config Caddyfile
```

或作为系统服务运行：

```bash
sudo caddy start --config Caddyfile
```

Caddy 将自动从 Let's Encrypt 获取并管理 SSL 证书。

**文档：**

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Caddy Reverse Proxy Guide](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### 重要说明 {#important-notes}

:::info[IMPORTANT]
设置 HTTPS 后，请记得更新 Duplicati 服务器配置以使用 HTTPS URL：

```bash
--send-http-url=https://your-domain.com/api/upload
```
:::

:::tip

- 将 `your-domain.com` 替换为实际域名
- 确保域名的 DNS A 记录指向服务器 IP 地址
- 两种方案都会自动续期 SSL 证书
- 建议配置防火墙，仅允许 HTTP/HTTPS 流量
:::

