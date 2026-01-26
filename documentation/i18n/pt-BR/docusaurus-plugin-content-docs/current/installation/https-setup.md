# Configuração HTTPS (opcional) {#https-setup-optional}

Para implantações em produção, é recomendado servir **duplistatus** sobre HTTPS usando um proxy reverso. Esta seção fornece exemplos de configuração para soluções populares de proxy reverso.

### Opção 1: Nginx com Certbot (Let's Encrypt) {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) é um servidor web popular que pode atuar como um proxy reverso, e [Certbot](https://certbot.eff.org/) fornece certificados SSL gratuitos do Let's Encrypt.

**Pré-requisitos:**

- Nome de domínio apontando para seu Servidores
- Nginx instalado em seu Sistema
- Certbot instalado para seu sistema operacional

**Etapa 1: Instalar Nginx e Certbot**

Para Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Etapa 2: Criar configuração do Nginx**

Criar `/etc/nginx/sites-available/duplistatus`:

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
# Ativar o site {#enable-the-site}
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obter certificado SSL {#obtain-ssl-certificate}
sudo certbot --nginx -d your-domain.com
```

Certbot atualizará automaticamente sua configuração do Nginx para incluir Configurações de SSL e redirecionar HTTP para HTTPS.

**Documentação:**

- [Documentação do Nginx](https://nginx.org/en/docs/)
- [Documentação do Certbot](https://certbot.eff.org/instructions)
- [Documentação do Let's Encrypt](https://letsencrypt.org/docs/)

### Opção 2: Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) é um servidor web moderno com HTTPS automático que simplifica o gerenciamento de certificados SSL.

**Pré-requisitos:**

- Nome de domínio apontando para seu Servidores
- Caddy instalado em seu Sistema

**Etapa 1: Instalar Caddy**

Siga o [guia de instalação oficial](https://caddyserver.com/docs/install) para seu Sistema.

**Etapa 2: Criar Caddyfile**

Criar um `Caddyfile` com o seguinte conteúdo:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Etapa 3: Executar Caddy**

```bash
sudo caddy run --config Caddyfile
```

Ou use-o como um serviço do Sistema:

```bash
sudo caddy start --config Caddyfile
```

Caddy obterá e gerenciará automaticamente certificados SSL do Let's Encrypt.

**Documentação:**

- [Documentação do Caddy](https://caddyserver.com/docs/)
- [Guia de Proxy Reverso do Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Notas Importantes {#important-notes}

:::info[IMPORTANT]
Após configurar HTTPS, lembre-se de atualizar a configuração do seu Servidores Duplicati para usar a URL HTTPS:

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::

:::tip

- Substitua `your-domain.com` pelo seu nome de domínio real
- Certifique-se de que o registro DNS A do seu domínio aponta para o Endereço IP do seu Servidores
- Ambas as soluções renovarão automaticamente certificados SSL
- Considere configurar um firewall para permitir apenas tráfego HTTP/HTTPS
  :::

