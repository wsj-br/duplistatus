---
translation_last_updated: '2026-02-05T00:21:10.096Z'
source_file_mtime: '2026-01-29T17:58:29.895Z'
source_file_hash: 5182562d16f18184
translation_language: pt-BR
source_file_path: installation/https-setup.md
---
# Configuração HTTPS (Opcional) {#https-setup-optional}

Para implantações em produção, é recomendado servir **duplistatus** via HTTPS usando um proxy reverso. Esta seção fornece exemplos de configuração para soluções populares de proxy reverso.

### Opção 1: Nginx com Certbot (Let's Encrypt) {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) é um servidor web popular que pode atuar como um proxy reverso, e [Certbot](https://certbot.eff.org/) fornece certificados SSL gratuitos da Let's Encrypt.

**Pré-requisitos:**

- Nome de domínio apontando para seu servidor
- Nginx instalado em seu sistema
- Certbot instalado para seu sistema operacional

**Etapa 1: Instalar Nginx e Certbot**

Para Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Etapa 2: Criar configuração do Nginx**

Crie `/etc/nginx/sites-available/duplistatus`:

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

**Etapa 3: Ativar o site e obter certificado SSL**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

O Certbot atualizará automaticamente sua configuração do Nginx para incluir configurações de SSL e redirecionar HTTP para HTTPS.

**Documentação:**

- [Documentação do Nginx](https://nginx.org/en/docs/)
- [Documentação do Certbot](https://certbot.eff.org/instructions)
- [Documentação do Let's Encrypt](https://letsencrypt.org/docs/)

### Opção 2: Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) é um servidor web moderno com HTTPS automático que simplifica o gerenciamento de certificados SSL.

**Pré-requisitos:**

- Nome de domínio apontando para seu servidor
- Caddy instalado em seu sistema

**Etapa 1: Instalar Caddy**

Siga o [guia oficial de instalação](https://caddyserver.com/docs/install) para seu sistema operacional.

**Etapa 2: Criar Caddyfile**

Crie um `Caddyfile` com o seguinte conteúdo:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Etapa 3: Executar Caddy**

```bash
sudo caddy run --config Caddyfile
```

Ou use-o como um serviço do sistema:

```bash
sudo caddy start --config Caddyfile
```

O Caddy obterá e gerenciará automaticamente certificados SSL do Let's Encrypt.

**Documentação:**

- [Documentação do Caddy](https://caddyserver.com/docs/)
- [Guia de Proxy Reverso do Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Notas Importantes {#important-notes}

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::info[IMPORTANTE]
Após configurar HTTPS, lembre-se de atualizar a configuração do seu servidor Duplicati para usar a URL HTTPS:

:::

:::tip

- Substitua `your-domain.com` pelo seu nome de domínio real
- Certifique-se de que o registro DNS A do seu domínio aponta para o endereço IP do seu servidor
- Ambas as soluções renovarão automaticamente os certificados SSL
- Considere configurar um firewall para permitir apenas tráfego HTTP/HTTPS
:::
