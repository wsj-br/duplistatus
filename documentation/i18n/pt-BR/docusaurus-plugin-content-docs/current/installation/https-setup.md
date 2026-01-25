# Configuração HTTPS (Opcional)

Para implantações em produção, é recomendado servir o **duplistatus** via HTTPS usando um proxy reverso. Esta seção fornece exemplos de configuração para soluções populares de proxy reverso.

### Opção 1: Nginx com Certbot (Let's Encrypt)

[Nginx](https://nginx.org/) é um servidor web popular que pode atuar como proxy reverso, e o [Certbot](https://certbot.eff.org/) fornece certificados SSL gratuitos do Let's Encrypt.

**Pré-requisitos:**

- Nome de domínio apontando para seu servidor
- Nginx instalado em seu sistema
- Certbot instalado para seu sistema operacional

**Passo 1: Instalar Nginx e Certbot**

Para Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Passo 2: Criar configuração do Nginx**

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

**Passo 3: Habilitar o site e obter certificado SSL**

```bash
# Habilitar o site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obter certificado SSL
sudo certbot --nginx -d your-domain.com
```

O Certbot atualizará automaticamente sua configuração do Nginx para incluir as configurações SSL e redirecionar HTTP para HTTPS.

**Documentação:**

- [Documentação do Nginx](https://nginx.org/en/docs/)
- [Documentação do Certbot](https://certbot.eff.org/instructions)
- [Documentação do Let's Encrypt](https://letsencrypt.org/docs/)

### Opção 2: Caddy

[Caddy](https://caddyserver.com/) é um servidor web moderno com HTTPS automático que simplifica o gerenciamento de certificados SSL.

**Pré-requisitos:**

- Nome de domínio apontando para seu servidor
- Caddy instalado em seu sistema

**Passo 1: Instalar Caddy**

Siga o [guia de instalação oficial](https://caddyserver.com/docs/install) para seu sistema operacional.

**Passo 2: Criar Caddyfile**

Crie um `Caddyfile` com o seguinte conteúdo:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Passo 3: Executar Caddy**

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

### Notas Importantes

:::info[IMPORTANT]
Após configurar o HTTPS, lembre-se de atualizar a configuração do servidor Duplicati para usar a URL HTTPS:

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::

:::tip

- Substitua `your-domain.com` pelo seu nome de domínio real
- Certifique-se de que o registro A do DNS do seu domínio aponta para o endereço IP do seu servidor
- Ambas as soluções renovarão automaticamente os certificados SSL
- Considere configurar um firewall para permitir apenas tráfego HTTP/HTTPS
  :::

