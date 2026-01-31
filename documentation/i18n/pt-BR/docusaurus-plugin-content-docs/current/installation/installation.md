---
translation_last_updated: '2026-01-31T00:51:30.631Z'
source_file_mtime: '2026-01-31T00:51:08.107Z'
source_file_hash: 31f0b5f50ece70d4
translation_language: pt-BR
source_file_path: installation/installation.md
---
# Guia de Instalação {#installation-guide}

A aplicação pode ser implantada usando Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), ou Podman. Após a instalação, você pode querer configurar o TIMEZONE e LANGUAGE, conforme descrito em [Configurar Fuso horário e Idioma](./configure-tz-lang.md) e precisará configurar os servidores Duplicati para enviar logs de backup para **duplistatus**, conforme descrito na seção [Configuração do Duplicati](./duplicati-server-configuration.md).

## Pré-requisitos {#prerequisites}

Certifique-se de que você tem o seguinte instalado:

- Docker Engine - [Guia de instalação Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guia de instalação Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (opcional) - [Guia de instalação Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (opcional) - [Guia de instalação](http://podman.io/docs/installation#debian)

## Autenticação {#authentication}

**duplistatus** a partir da versão 0.9.x requer autenticação de usuário. Uma conta `admin` padrão é criada automaticamente ao instalar a aplicação pela primeira vez ou ao atualizar de uma versão anterior:
    - Nome de usuário: `admin`
    - Senha: `Duplistatus09`

Você pode criar contas de usuários adicionais em [Configurações > Usuários](../user-guide/settings/user-management-settings.md) após o primeiro login.

::::info[IMPORTANTE]
O sistema impõe um comprimento mínimo de senha e complexidade. Esses requisitos podem ser ajustados usando as [variáveis de ambiente](environment-variables.md) `PWD_ENFORCE` e `PWD_MIN_LEN`. Usar uma senha sem complexidade suficiente ou com comprimento curto pode comprometer a segurança. Use essas configurações com cuidado.
::::

### Imagens de Container {#container-images}

Você pode usar as imagens de:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Opção 1: Usando Docker Compose {#option-1-using-docker-compose}

Este é o método recomendado para implantações locais ou quando você deseja personalizar a configuração. Ele usa um arquivo `docker compose` para definir e executar o contêiner com todas as suas configurações.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Verifique a seção [Fuso horário e Localidade](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora.

### Opção 2: Usando Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Acesse "Stacks" no seu servidor [Portainer](https://docs.portainer.io/user/docker/stacks) e clique em "Adicionar stack".
2. Nomeie seu stack (por exemplo, "duplistatus").
3. Escolha "Build method" como "Web editor".
4. Copie e cole isto no editor web:

```yaml
# duplistatus production compose.yml
services:
  duplistatus:
    image: ghcr.io/wsj-br/duplistatus:latest
    container_name: duplistatus
    restart: unless-stopped
    environment:
      - TZ=Europe/London
      - LANG=en_GB
      - PWD_ENFORCE=true
      - PWD_MIN_LEN=8
    ports:
      - "9666:9666"
    volumes:
      - duplistatus_data:/app/data
    networks:
      - duplistatus_network

networks:
  duplistatus_network:
    driver: bridge

volumes:
  duplistatus_data:
    name: duplistatus_data
``` 

5. Verifique a seção [Fuso horário e idioma](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora.
6. Clique em "Deploy the stack".

### Opção 3: Usando Portainer Stacks (Repositório GitHub) {#option-3-using-portainer-stacks-github-repository}

1. Em [Portainer](https://docs.portainer.io/user/docker/stacks), vá para "Stacks" e clique em "Add stack".
2. Nomeie sua stack (por exemplo, "duplistatus").
3. Escolha "Build method" como "Repository".
4. Digite a URL do repositório: `https://github.com/wsj-br/duplistatus.git`
5. No campo "Compose path", digite: `production.yml`
6. (opcional) Defina as variáveis de ambiente `TZ`, `LANG`, `PWD_ENFORCE` e `PWD_MIN_LEN` na seção "Environment variables". Verifique a seção [Timezone and Locale](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora. 
6. Clique em "Deploy the stack".

### Opção 4: Usando Docker CLI {#option-4-using-docker-cli}

```bash
# Create the volume
docker volume create duplistatus_data

# Start the container
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- O volume `duplistatus_data` é utilizado para Armazenamento persistente. A imagem do container utiliza `Europe/London` como o Fuso horário padrão e `en_GB` como a localidade padrão (Idioma).

### Opção 5: Usando Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

Para configurações básicas, você pode iniciar o container sem configuração de DNS:

```bash
mkdir -p ~/duplistatus_data
# Start the container (standalone)
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Configurando DNS para Contêineres Podman {#configuring-dns-for-podman-containers}

Se você precisar de configuração de DNS personalizada (por exemplo, para Tailscale MagicDNS, redes corporativas ou configurações de DNS personalizadas), você pode configurar manualmente servidores DNS e domínios de pesquisa.

**Encontrando sua configuração de DNS:**

1. **Para sistemas systemd-resolved** (a maioria das distribuições Linux modernas):

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Para sistemas sem systemd** ou como alternativa:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

Procure por linhas que começam com `nameserver` (para servidores DNS) e `search` (para domínios de pesquisa). Se você não tiver certeza sobre suas configurações de DNS ou domínios de pesquisa de rede, consulte seu administrador de rede para obter essas informações.

# Exemplo com configuração de DNS:

```bash
mkdir -p ~/duplistatus_data
# Start the container with DNS configuration
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  --dns 100.100.100.100 \
  --dns-search example.com \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

Você pode especificar múltiplos servidores DNS adicionando múltiplas flags `--dns`:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Você pode especificar múltiplos domínios de pesquisa adicionando múltiplas flags `--dns-search`:

```bash
--dns-search example.com --dns-search internal.local
```

**Nota**: Pule endereços IPv6 (contendo `:`) e endereços localhost (como `127.0.0.53`) ao configurar servidores DNS.

Verifique a seção [Fuso horário e Localidade](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora.

### Opção 6: Usando Pods do Podman {#option-6-using-podman-pods}

Os pods do Podman permitem que você execute múltiplos contêineres em um namespace de rede compartilhado. Isto é útil para testes ou quando você precisa executar duplistatus junto com outros contêineres.

**Configuração básica do pod:**

```bash
mkdir -p ~/duplistatus_data

# Create the pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

#### Configurando DNS para Pods do Podman {#configuring-dns-for-podman-pods}

Quando usar pods, a configuração de DNS deve ser definida no nível do pod, não no nível do contêiner.
Use os mesmos métodos descritos na Opção 5 para encontrar seus servidores DNS e domínios de pesquisa.

# Exemplo com configuração de DNS:

```bash
mkdir -p ~/duplistatus_data

# Create the pod with DNS configuration
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

**Gerenciando o pod:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## Configuração Essencial {#essential-configuration}

1. Configure seus [servidores Duplicati](duplicati-server-configuration.md) para enviar mensagens de log de backup para duplistatus (obrigatório).
2. Entre no duplistatus – consulte as instruções no [Guia do Usuário](../user-guide/overview.md#accessing-the-dashboard).
3. Colete logs de backup iniciais – use o recurso [Coletar logs de backup](../user-guide/collect-backup-logs.md) para popular o banco de dados com dados históricos de backup de todos os seus servidores Duplicati. Isso também atualiza automaticamente os intervalos de monitoramento de backups atrasados com base na configuração de cada servidor.
4. Configure as configurações do servidor – configure aliases e notas do servidor em [Configurações → Servidor](../user-guide/settings/server-settings.md) para tornar seu painel mais informativo.
5. Configure as configurações do NTFY – configure notificações via NTFY em [Configurações → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configure as configurações de e-mail – configure notificações por e-mail em [Configurações → E-mail](../user-guide/settings/email-settings.md).
7. Configure as notificações de backup – configure notificações por backup ou por servidor em [Configurações → Notificações de backup](../user-guide/settings/backup-notifications-settings.md).

Consulte as seções a seguir para Configurar configurações opcionais, como Fuso horário, Formato de números e HTTPS.
