# Guia de Instalação

A aplicação pode ser implantada usando Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks) ou Podman. Após a instalação, você pode querer configurar o TIMEZONE e LANGUAGE, conforme descrito em [Configurar Fuso Horário e Idioma](./configure-tz-lang.md) e precisa configurar os servidores Duplicati para enviar logs de backup para o **duplistatus**, conforme descrito na seção [Configuração do Duplicati](./duplicati-server-configuration.md).

## Pré-requisitos

Certifique-se de ter o seguinte instalado:

- Docker Engine - [Guia de instalação no Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guia de instalação no Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (opcional) - [Guia de instalação no Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (opcional) - [Guia de instalação](http://podman.io/docs/installation#debian)

## Autenticação

O **duplistatus** desde a versão 0.9.x requer autenticação de usuário. Uma conta `admin` padrão é criada automaticamente ao instalar a aplicação pela primeira vez ou ao atualizar de uma versão anterior:
\- nome de usuário: `admin`
\- senha: `Duplistatus09`

Você pode criar contas de usuários adicionais em [Configurações > Usuários](../user-guide/settings/user-management-settings.md) após o primeiro login.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Imagens de Contêiner

Você pode usar as imagens de:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Opção 1: Usando Docker Compose

Este é o método recomendado para implantações locais ou quando você deseja personalizar a configuração. Ele usa um arquivo `docker compose` para definir e executar o contêiner com todas as suas configurações.

```bash
# baixar o arquivo compose
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# iniciar o contêiner
docker compose -f duplistatus.yml up -d
```

Consulte a seção [Fuso Horário e Localidade](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora.

### Opção 2: Usando Portainer Stacks (Docker Compose)

1. Vá para "Stacks" no seu servidor [Portainer](https://docs.portainer.io/user/docker/stacks) e clique em "Add stack".
2. Nomeie sua stack (por exemplo, "duplistatus").
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

5. Consulte a seção [Fuso Horário e Localidade](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora.
6. Clique em "Deploy the stack".

### Opção 3: Usando Portainer Stacks (Repositório GitHub)

1. No [Portainer](https://docs.portainer.io/user/docker/stacks), vá para "Stacks" e clique em "Add stack".
2. Nomeie sua stack (por exemplo, "duplistatus").
3. Escolha "Build method" como "Repository".
4. Insira a URL do repositório: `https://github.com/wsj-br/duplistatus.git`
5. No campo "Compose path", insira: `production.yml`
6. (opcional) Defina as variáveis de ambiente `TZ`, `LANG`, `PWD_ENFORCE` e `PWD_MIN_LEN` na seção "Environment variables". Consulte a seção [Fuso Horário e Localidade](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora.
7. Clique em "Deploy the stack".

### Opção 4: Usando Docker CLI

```bash
# Criar o volume
docker volume create duplistatus_data

# Iniciar o contêiner
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- O volume `duplistatus_data` é usado para armazenamento persistente. A imagem do contêiner usa `Europe/London` como fuso horário padrão e `en_GB` como localidade padrão (idioma).

### Opção 5: Usando Podman (CLI) `rootless`

Para configurações básicas, você pode iniciar o contêiner sem configuração de DNS:

```bash
mkdir -p ~/duplistatus_data
# Iniciar o contêiner (standalone)
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

Se você precisar de configuração de DNS personalizada (por exemplo, para Tailscale MagicDNS, redes corporativas ou configurações de DNS personalizadas), você pode configurar manualmente os servidores DNS e domínios de pesquisa.

**Encontrando sua configuração de DNS:**

1. **Para sistemas systemd-resolved** (a maioria das distribuições Linux modernas):
   ```bash
   # Obter servidores DNS
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'

   # Obter domínios de pesquisa DNS
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Para sistemas não-systemd** ou como alternativa:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

   Procure por linhas começando com `nameserver` (para servidores DNS) e `search` (para domínios de pesquisa). Se você não tiver certeza sobre suas configurações de DNS ou domínios de pesquisa de rede, consulte seu administrador de rede para obter essas informações.

**Exemplo com configuração de DNS:**

```bash
mkdir -p ~/duplistatus_data
# Iniciar o contêiner com configuração de DNS
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

**Nota**: Ignore endereços IPv6 (contendo `:`) e endereços localhost (como `127.0.0.53`) ao configurar servidores DNS.

Consulte a seção [Fuso Horário e Localidade](./configure-tz-lang.md) para mais detalhes sobre como ajustar o fuso horário e o formato de número/data/hora.

### Opção 6: Usando Podman Pods

Os pods do Podman permitem que você execute múltiplos contêineres em um namespace de rede compartilhado. Isso é útil para testes ou quando você precisa executar o duplistatus junto com outros contêineres.

**Configuração básica de pod:**

```bash
mkdir -p ~/duplistatus_data

# Criar o pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Criar o contêiner no pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar o pod
podman pod start duplistatus-pod
```

#### Configurando DNS para Podman Pods

Ao usar pods, a configuração de DNS deve ser definida no nível do pod, não no nível do contêiner.
Use os mesmos métodos descritos na Opção 5 para encontrar seus servidores DNS e domínios de pesquisa.

**Exemplo com configuração de DNS:**

```bash
mkdir -p ~/duplistatus_data

# Criar o pod com configuração de DNS
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Criar o contêiner no pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar o pod
podman pod start duplistatus-pod
```

**Gerenciando o pod:**

```bash
# Parar o pod (para todos os contêineres no pod)
podman pod stop duplistatus-pod

# Iniciar o pod
podman pod start duplistatus-pod

# Remover o pod e todos os contêineres
podman pod rm -f duplistatus-pod
```

## Configuração Essencial

1. Configure seus [servidores Duplicati](duplicati-server-configuration.md) para enviar mensagens de log de backup para o duplistatus (obrigatório).
2. Faça login no duplistatus – veja as instruções no [Guia do Usuário](../user-guide/overview.md#accessing-the-dashboard).
3. Colete logs de backup iniciais – use o recurso [Coletar Logs de Backup](../user-guide/collect-backup-logs.md) para popular o banco de dados com dados históricos de backup de todos os seus servidores Duplicati. Isso também atualiza automaticamente os intervalos de monitoramento de atraso com base na configuração de cada servidor.
4. Configure as definições do servidor – configure aliases e notas do servidor em [Configurações → Servidor](../user-guide/settings/server-settings.md) para tornar seu painel mais informativo.
5. Configure as definições do NTFY – configure notificações via NTFY em [Configurações → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configure as definições de email – configure notificações por email em [Configurações → Email](../user-guide/settings/email-settings.md).
7. Configure notificações de backup – configure notificações por backup ou por servidor em [Configurações → Notificações de Backup](../user-guide/settings/backup-notifications-settings.md).

Consulte as seções a seguir para configurar definições opcionais como fuso horário, formato de número e HTTPS.
