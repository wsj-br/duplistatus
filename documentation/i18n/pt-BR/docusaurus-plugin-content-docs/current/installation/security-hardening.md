# Reforço de Segurança {/* #security-hardening */}

O reforço de segurança em produção para o **duplistatus** é em camadas e opcional. Cada recurso descrito aqui está desativado por padrão, então uma nova instalação continua funcionando até que você escolha ativar. Há três camadas independentes:

- **Chaves de API** — segredos com escopo para as APIs externas de carregamento e leitura; geralmente o primeiro passo mais fácil em um homelab
- **Listas de permissões de IP** — restrições CIDR na interface de administração, nas APIs externas ou em ambas
- **Proxy reverso HTTPS** — tráfego criptografado, com a porta `9666` mantida fora da internet pública

## Ordem recomendada {/* #recommended-order */}

1. Mantenha a porta `9666` fora da internet pública: vincule a aplicação ao localhost ou a uma rede privada.
2. Crie [chaves de API](#api-keys) e ative **Exigir chaves de API para APIs externas**. Isso funciona sem um proxy reverso e é a vitória mais rápida.
3. Sirva **duplistatus** através de um [proxy reverso com HTTPS](#https-with-a-reverse-proxy).
4. Adicione o endereço TCP do par do proxy a **Proxies confiáveis** (ou `IP_TRUSTED_PROXIES`) se você pretender usar listas de permissões.
5. Opcionalmente, ative as [listas de permissões de IP](#ip-allowlist) de administrador e externas, usando **IP detectado** e as sugestões de IP recente para evitar se bloquear.

## Restrinja o acesso com chaves de API e listas de permissões de IP {/* #restrict-access-with-api-keys-and-ip-allowlists */}

Esses dois recursos de Configurações limitam quem pode acessar o painel e as APIs de dados externas. Eles são independentes: quando ambos estão ativados, uma solicitação deve passar em **ambas** as verificações.

### Chaves de API {/* #api-keys */}

[Chaves de API](../user-guide/settings/api-keys-settings.md) são a proteção mais simples de adicionar, especialmente em um homelab. Crie segredos com escopo para carregamentos do Duplicati e widgets do Homepage, depois exija-os — nenhum proxy reverso ou planejamento CIDR necessário.

| Escopo | Endpoints |
|-------|-----------|
| Carregar | `POST /api/upload` |
| Leitura | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Crie pelo menos uma chave de carregamento e uma chave de leitura **antes** de ativar **Exigir chaves de API para APIs externas**. Caso contrário, os carregamentos do Duplicati e os widgets do Homepage param de funcionar assim que a opção é ativada.

O Duplicati não pode incluir cabeçalhos personalizados em suas solicitações, portanto você deve fornecer sua chave de API adicionando `?api_key=…` à URL do relatório. Observe que usar a string de consulta expõe a chave de API nos logs de acesso do proxy reverso. Para outros clientes que suportam cabeçalhos personalizados, é recomendado usar o cabeçalho `X-Api-Key` ou o cabeçalho `Authorization: Bearer` em vez disso para maior segurança.

O limite de tamanho de carregamento e os limites de taxa por IP na mesma página de Configurações se aplicam mesmo enquanto as chaves são opcionais. As chaves de API protegem apenas as APIs de dados externas; elas não restringem a interface de administração, que é protegida por login e, opcionalmente, pela lista de permissões de IP do administrador.

### Lista de permissões de IP {/* #ip-allowlist */}

[Lista de permissões de IP](../user-guide/settings/ip-allowlist-settings.md) fornece duas listas CIDR separadas, ambas desativadas por padrão:

- **Interface de administração** — páginas, login, CSRF e APIs de sessão
- **APIs externas** — `/api/upload`, `/api/summary` e `/api/lastbackup*`
- **Saúde e ping** — `/api/health` e `/api/ping` permanecem públicos enquanto ambas as listas estão desativadas. Quando uma das listas está ativada, elas aceitam loopback mais CIDRs da lista de administrador **ou** externa, e clientes não-loopback são limitados por taxa. Os limites no nível do aplicativo não impedem uma inundação de conexão volumétrica; adicione `limit_req` / Caddy `rate_limit` no proxy reverso se a instância estiver voltada para a internet.

Antes de ativar uma das listas, verifique **IP detectado** em **Configurações → Lista de permissões de IP** e compare o **IP do par** com o **Permitir IP**. Use **Adicionar IP atual** ou as sugestões de IP recente para que você não se bloqueie. As etapas de recuperação estão em [Bloqueado pela lista de permissões de IP](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

Se **duplistatus** estiver atrás de um proxy reverso, configure **Proxies confiáveis** primeiro (consulte [Proxies confiáveis para listas de permissões de IP](#trusted-proxies-for-ip-allowlists) abaixo). Sem isso, as decisões da lista de permissões são tomadas contra o endereço do proxy em vez do cliente.

## HTTPS com um proxy reverso {/* #https-with-a-reverse-proxy */}

Para implantações em produção, sirva **duplistatus** sobre HTTPS atrás de um proxy reverso. Os exemplos abaixo cobrem duas opções populares.

### Opção 1: Nginx com Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) é um servidor web amplamente utilizado que pode atuar como proxy reverso, e [Certbot](https://certbot.eff.org/) emite certificados TLS gratuitos do Let's Encrypt.

**Pré-requisitos:**

- Um nome de domínio cujo registro DNS A (ou AAAA) aponta para seu servidor
- Nginx instalado em seu sistema
- Certbot instalado para seu sistema operacional

**Etapa 1: Instalar Nginx e Certbot**

No Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Etapa 2: Criar a configuração do Nginx**

Crie `/etc/nginx/sites-available/duplistatus`:

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

Este exemplo **sobrescreve** `X-Forwarded-For` e `X-Real-IP` com `$remote_addr`. Não use `$proxy_add_x_forwarded_for` em seu lugar: ele acrescenta ao que o cliente enviou, deixando valores controlados pelo cliente em um cabeçalho no qual as listas de permissão se baseiam.

**Etapa 3: Ativar o site e obter o certificado**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

O Certbot adiciona as configurações de TLS à sua configuração do Nginx e redireciona HTTP para HTTPS. Ele também instala um temporizador de renovação, que você pode verificar com:

```bash
sudo certbot renew --dry-run
```

**Documentação:**

- [Documentação do Nginx](https://nginx.org/en/docs/)
- [Documentação do Certbot](https://certbot.eff.org/instructions)
- [Documentação do Let's Encrypt](https://letsencrypt.org/docs/)

### Opção 2: Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) é um servidor web moderno que obtém e renova certificados TLS automaticamente, o que remove a maior parte do trabalho de gerenciamento de certificados.

**Pré-requisitos:**

- Um nome de domínio cujo registro DNS A (ou AAAA) aponta para seu servidor
- Caddy instalado em seu sistema

**Etapa 1: Instalar Caddy**

Siga o [guia oficial de instalação](https://caddyserver.com/docs/install) para seu sistema operacional.

**Etapa 2: Criar o Caddyfile**

As instalações de pacotes leem `/etc/caddy/Caddyfile`. Defina seu conteúdo como:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

A diretiva `reverse_proxy` do Caddy define os cabeçalhos de IP do cliente para você. Você ainda precisa listar o endereço TCP do par do proxy em **Proxies confiáveis** ao usar listas de permissões de IP (veja [abaixo](#trusted-proxies-for-ip-allowlists)).

**Etapa 3: Iniciar ou recarregar o Caddy**

Se você instalou o Caddy a partir de um pacote, aplique a configuração através do serviço gerenciado:

```bash
sudo systemctl reload caddy
```

Para executar o Caddy manualmente — por exemplo a partir de um Caddyfile no diretório atual — primeiro interrompa o serviço gerenciado para liberar as portas 80 e 443, depois execute:

```bash
sudo caddy run --config Caddyfile
```

O Caddy obtém o certificado na primeira vez que serve o site e o renova antes do vencimento.

**Documentação:**

- [Documentação do Caddy](https://caddyserver.com/docs/)
- [Guia de Proxy Reverso do Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Proxies confiáveis para listas de permissões de IP {/* #trusted-proxies-for-ip-allowlists */}

Vincule **duplistatus** ao localhost ou a uma rede privada para que o proxy reverso seja o único ouvinte público. A porta `9666` nunca deve ser acessível pela internet.

Quando [listas de permissões de IP](../user-guide/settings/ip-allowlist-settings.md) estão habilitadas, liste o proxy em **Proxies confiáveis** (ou defina `IP_TRUSTED_PROXIES`). A aplicação honra `X-Forwarded-For` e `X-Real-IP` apenas quando o par TCP é um proxy confiável; caso contrário, os ignora.

- Configure o proxy para **sobrescrever** esses cabeçalhos com o endereço do cliente conectado, como no exemplo do Nginx acima. Não acrescente.
- Quando o proxy é executado no host e **duplistatus** é executado em um contêiner, o **IP do par** é geralmente o gateway da ponte Docker (por exemplo `172.17.0.1`). Coloque esse endereço ou CIDR em **Proxies confiáveis** e coloque os CIDRs do cliente real na lista de permissões do administrador ou externa.
- Antes de habilitar uma lista de permissões, abra **Configurações → Lista de permissões de IP** e verifique **IP detectado**: o **IP do par** deve ser o proxy (ou gateway da ponte) e o **Permitir IP** deve ser o cliente. Se o Permitir IP ainda mostrar o proxy, a configuração de proxy confiável ainda não está correta.

### Após habilitar HTTPS {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[IMPORTANTE]
Atualize a configuração do servidor Duplicati para usar a URL HTTPS:


Acrescente `?api_key=YOUR_UPLOAD_KEY` se as chaves de API forem necessárias. No Duplicati anterior à versão 2.0.9.106, use `--send-http-url=https://your-domain.com/api/upload` junto com `--send-http-result-output-format=Json`. Veja [Configuração do Servidor Duplicati](duplicati-server-configuration.md).
:::

:::tip

- Substitua `your-domain.com` por seu próprio domínio em todos os exemplos.
- Confirme que o registro DNS A (ou AAAA) do domínio é resolvido para seu servidor antes de solicitar um certificado.
- Ambas as opções renovam certificados automaticamente: Certbot através de seu temporizador systemd, Caddy através de seu gerenciador de certificados integrado.
- Restrinja o firewall do host à porta 443 e mantenha `80` e `9666` fechados para o exterior.
:::
