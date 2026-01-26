# Guia de Instalação {#installation-guide}

A aplicação pode ser implantada usando Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), ou Podman. Após a instalação, você pode querer configurar o FUSO HORÁRIO e IDIOMA, conforme descrito em [Configurar Fuso horário e Idioma](./configure-tz-lang.md) e precisa configurar os Servidores do Duplicati para enviar logs de backup para **duplistatus**, conforme descrito na seção [Configuração do Duplicati](./duplicati-server-configuration.md).

## Pré-requisitos {#prerequisites}

Certifique-se de ter o seguinte instalado:

- Docker Engine - [Guia de instalação Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guia de instalação Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (opcional) - [Guia de instalação Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (opcional) - [Guia de instalação](http://podman.io/docs/installation#debian)

## Autenticação {#authentication}

**duplistatus** desde a versão 0.9.x requer autenticação de Usuário. Uma conta `admin` padrão é criada automaticamente ao instalar a aplicação pela primeira vez ou ao atualizar de uma versão anterior:
\- nome de usuário: `admin`
\- senha: `Duplistatus09`

Você pode criar contas de Usuários adicionais em [Configurações > Usuários](../user-guide/settings/user-management-settings.md) após o primeiro Login.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Imagens de Container {#container-images}

Você pode usar as imagens de:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Opção 1: Usando Docker Compose {#option-1-using-docker-compose}

Este é o método recomendado para implantações locais ou quando você quer personalizar a configuração. Ele usa um arquivo `docker compose` para definir e executar o container com todas as suas Configurações.

```bash
# baixar o arquivo compose {#download-the-compose-file}
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# iniciar o container {#start-the-container}
docker compose -f duplistatus.yml up -d
```

Verifique a seção [Fuso horário e Locale](./configure-tz-lang.md) para mais Detalhes sobre como ajustar o fuso horário e o formato de número/Data/Formato de hora.

### Opção 2: Usando Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Vá para "Stacks" no seu servidor [Portainer](https://docs.portainer.io/user/docker/stacks) e clique em "Adicionar stack".
2. Nomeie seu stack (por exemplo, "duplistatus").
3. Escolha "Build method" como "Web editor".
4. Copie e cole isto no editor web:

```yaml
# duplistatus production compose.yml {#duplistatus-production-composeyml}
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

5. Verifique a seção [Fuso horário e Locale](./configure-tz-lang.md) para mais Detalhes sobre como ajustar o fuso horário e o formato de número/Data/Formato de hora.
6. Clique em "Deploy the stack".

### Opção 3: Usando Portainer Stacks (Repositório GitHub) {#option-3-using-portainer-stacks-github-repository}

1. Em [Portainer](https://docs.portainer.io/user/docker/stacks), vá para "Stacks" e clique em "Adicionar stack".
2. Nomeie seu stack (por exemplo, "duplistatus").
3. Escolha "Build method" como "Repository".
4. Digite a URL do repositório: `https://github.com/wsj-br/duplistatus.git`
5. No campo "Compose path", digite: `production.yml`
6. (opcional) Defina as variáveis de ambiente `TZ`, `LANG`, `PWD_ENFORCE` e `PWD_MIN_LEN` na seção "Environment variables". Verifique a seção [Fuso horário e Locale](./configure-tz-lang.md) para mais Detalhes sobre como ajustar o fuso horário e o formato de número/Data/Formato de hora.
7. Clique em "Deploy the stack".

### Opção 4: Usando Docker CLI {#option-4-using-docker-cli}

```bash
# Criar o volume {#create-the-volume}
docker volume create duplistatus_data

# Iniciar o container {#start-the-container}
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- O volume `duplistatus_data` é usado para armazenamento persistente. A imagem do container usa `Europe/London` como o fuso horário Padrão e `en_GB` como o locale Padrão (Idioma).

### Opção 5: Usando Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

Para configurações básicas, você pode iniciar o container sem configuração de DNS:

```bash
mkdir -p ~/duplistatus_data
# Iniciar o container (standalone) {#start-the-container-standalone}
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Configurando DNS para Containers Podman {#configuring-dns-for-podman-containers}

Se você precisar de configuração de DNS personalizada (por exemplo, para Tailscale MagicDNS, redes corporativas ou configurações de DNS personalizadas), você pode configurar manualmente Servidores DNS e domínios de Pesquisar.

**Encontrando sua configuração de DNS:**

1. **Para sistemas systemd-resolved** (a maioria das distribuições Linux modernas):
   ```bash
   # Obter Servidores DNS
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'

   # Obter domínios de Pesquisar DNS
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Para sistemas não-systemd** ou como fallback:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

   Procure por linhas começando com `nameserver` (para Servidores DNS) e `search` (para domínios de Pesquisar). Se você não tiver certeza sobre suas Configurações de DNS ou domínios de Pesquisar de rede, consulte seu administrador de rede para obter essas informações.

**Exemplo com configuração de DNS:**

```bash
mkdir -p ~/duplistatus_data
# Iniciar o container com configuração de DNS {#start-the-container-with-dns-configuration}
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

Você pode especificar múltiplos Servidores DNS adicionando múltiplos sinalizadores `--dns`:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Você pode especificar múltiplos domínios de Pesquisar adicionando múltiplos sinalizadores `--dns-search`:

```bash
--dns-search example.com --dns-search internal.local
```

**Nota**: Pule endereços IPv6 (contendo `:`) e endereços localhost (como `127.0.0.53`) ao configurar Servidores DNS.

Verifique a seção [Fuso horário e Locale](./configure-tz-lang.md) para mais Detalhes sobre como ajustar o fuso horário e o formato de número/Data/Formato de hora.

### Opção 6: Usando Podman Pods {#option-6-using-podman-pods}

Podman pods permitem que você execute múltiplos containers em um namespace de rede compartilhado. Isto é útil para testes ou quando você precisa executar duplistatus junto com outros containers.

**Configuração básica do pod:**

```bash
mkdir -p ~/duplistatus_data

# Criar o pod {#create-the-pod}
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Criar o container no pod {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar o pod {#start-the-pod}
podman pod start duplistatus-pod
```

#### Configurando DNS para Podman Pods {#configuring-dns-for-podman-pods}

Quando usando pods, a configuração de DNS deve ser definida no nível do pod, não no nível do container.
Use os mesmos métodos descritos na Opção 5 para encontrar seus Servidores DNS e domínios de Pesquisar.

**Exemplo com configuração de DNS:**

```bash
mkdir -p ~/duplistatus_data

# Criar o pod com configuração de DNS {#create-the-pod-with-dns-configuration}
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Criar o container no pod {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar o pod {#start-the-pod}
podman pod start duplistatus-pod
```

**Gerenciando o pod:**

```bash
# Parar o pod (para todos os containers no pod) {#stop-the-pod-stops-all-containers-in-the-pod}
podman pod stop duplistatus-pod

# Iniciar o pod {#start-the-pod}
podman pod start duplistatus-pod

# Remover o pod e todos os containers {#remove-the-pod-and-all-containers}
podman pod rm -f duplistatus-pod
```

## Configuração Essencial {#essential-configuration}

1. Configure seus [Servidores do Duplicati](duplicati-server-configuration.md) para enviar Mensagens de log de backup para duplistatus (obrigatório).
2. Entrar em duplistatus – veja as instruções no [Guia do Usuário](../user-guide/overview.md#accessing-the-dashboard).
3. Coletar logs de backup iniciais – use o recurso [Coletar logs de backup](../user-guide/collect-backup-logs.md) para preencher o banco de dados com dados de backup históricos de Todos os seus Servidores do Duplicati. Isto também atualiza automaticamente os intervalos de monitoramento de backups atrasados com base na configuração de cada Servidores.
4. Configurar Configurações de servidores – configure apelidos de Servidores e Notas em [Configurações → Servidor](../user-guide/settings/server-settings.md) para tornar seu Painel mais informativo.
5. Configurar Configurações de NTFY – configure notificações via NTFY em [Configurações → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configurar Configurações de e-mail – configure Notificações por e-mail em [Configurações → E-mail](../user-guide/settings/email-settings.md).
7. Configurar Notificações de backup – configure notificações por backup ou por Servidores em [Configurações → Notificações de backup](../user-guide/settings/backup-notifications-settings.md).

Veja as seções a seguir para configurar Configurações opcionais como fuso horário, formato de números e HTTPS.
