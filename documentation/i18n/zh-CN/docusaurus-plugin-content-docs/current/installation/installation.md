# 安装指南 {#installation-guide}

该应用可以通过 Docker、[Portainer Stacks](https://docs.portainer.io/user/docker/stacks) 或 Podman 部署。安装完成后，您可能需要按照 [配置时区](./configure-tz.md) 中的说明配置 TIMEZONE，并按照 [Duplicati 配置](./duplicati-server-configuration.md) 部分中的说明配置 Duplicati 服务器，以将备份日志发送到 **duplistatus**。

## 前置条件 {#prerequisites}

请确保已安装以下内容：

- Docker Engine - [Debian 安装指南](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux 安装指南](https://docs.docker.com/compose/install/linux/)
- Portainer（可选） - [Docker 安装指南](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman（可选） - [安装指南](http://podman.io/docs/installation#debian)

## 认证 {#authentication}

**duplistatus** 从 0.9.x 版本开始需要用户认证。首次安装或从早期版本升级时，会自动创建一个默认的 `admin` 账户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

首次登录后，您可以在 [设置 > 用户](../user-guide/settings/user-management-settings.md) 中创建额外的用户账户。

::::info[重要]
系统强制要求密码的最小长度和复杂度。这些要求可以通过 `PWD_ENFORCE` 和 `PWD_MIN_LEN` [环境变量](environment-variables.md) 进行调整。使用复杂度不足或长度过短的密码可能会危及安全性。请谨慎使用这些设置。
::::

### 容器镜像 {#container-images}

您可以使用以下来源的镜像：

- **Docker Hub**：`docker.io/wsjbr/duplistatus:latest`
- **GitHub 容器注册表**：`ghcr.io/wsj-br/duplistatus:latest`

### 选项 1：使用 Docker Compose {#option-1-using-docker-compose}

这是本地部署或需要自定义配置时的推荐方法。它使用一个 `docker compose` 文件来定义并运行包含所有设置的容器。

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

查看 [时区](./configure-tz.md) 部分以获取有关如何调整时区及数字/日期/时间格式的更多详细信息。

### 选项 2：使用 Portainer Stacks（Docker Compose）{#option-2-using-portainer-stacks-docker-compose}

1. 在您的 [Portainer](https://docs.portainer.io/user/docker/stacks) 服务器中进入“Stacks”页面，然后点击“Add stack”。
2. 为您的堆栈命名（例如，“duplistatus”）。
3. 选择“Build method”为“Web editor”。
4. 将以下内容复制粘贴到网页编辑器中：

```yaml
# duplistatus production compose.yml
services:
  duplistatus:
    image: ghcr.io/wsj-br/duplistatus:latest
    container_name: duplistatus
    restart: unless-stopped
    environment:
      - TZ=Europe/London
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

5. 查看 [时区](./configure-tz.md) 部分以获取有关如何调整时区及数字/日期/时间格式的更多详细信息。
6. 点击“Deploy the stack”。

### 选项 3：使用 Portainer Stacks（GitHub 仓库）{#option-3-using-portainer-stacks-github-repository}

1. 在 [Portainer](https://docs.portainer.io/user/docker/stacks) 中，进入“Stacks”页面并点击“Add stack”。
2. 为您的堆栈命名（例如，“duplistatus”）。
3. 选择“Build method”为“Repository”。
4. 输入仓库 URL：`https://github.com/wsj-br/duplistatus.git`
5. 在“Compose path”字段中输入：`production.yml`
6. （可选）在“Environment variables”部分设置 `TZ`、`LANG`、`PWD_ENFORCE` 和 `PWD_MIN_LEN` 环境变量。查看 [时区](./configure-tz.md) 部分以获取有关如何调整时区及数字/日期/时间格式的更多详细信息。
6. 点击“Deploy the stack”。

### 选项 4：使用 Docker CLI {#option-4-using-docker-cli}

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

- `duplistatus_data` 卷用于持久化存储。容器镜像使用 `Europe/London` 作为默认时区，使用 `en_GB` 作为默认区域设置（语言）。

### 选项 5：使用 Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

对于基础设置，您可以在没有 DNS 配置的情况下启动容器：

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

#### 为 Podman 容器配置 DNS {#configuring-dns-for-podman-containers}

如果您需要自定义 DNS 配置（例如，用于 Tailscale MagicDNS、公司网络或自定义 DNS 设置），您可以手动配置 DNS 服务器和搜索域。

**查找您的 DNS 配置：**

1. **对于 systemd-resolved 系统**（大多数现代 Linux 发行版）：

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **对于非 systemd 系统**或作为备选方案：

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

查找以 `nameserver`（用于 DNS 服务器）和 `search`（用于搜索域）开头的行。如果您不确定您的 DNS 设置或网络搜索域，请咨询您的网络管理员以获取此信息。

**DNS 配置示例：**

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

您可以通过添加多个 `--dns` 标志来指定多个 DNS 服务器：

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

您可以通过添加多个 `--dns-search` 标志来指定多个搜索域：

```bash
--dns-search example.com --dns-search internal.local
```

**备注**：在配置 DNS 服务器时，请跳过 IPv6 地址（包含 `:`）和本地主机地址（如 `127.0.0.53`）。

检查 [时区](./configure-tz.md) 部分以获取有关如何调整时区和数字/日期/时间格式的更多详情。

### 选项 6：使用 Podman Pods {#option-6-using-podman-pods}

Podman pods 允许您在共享的网络命名空间中运行多个容器。这在测试或需要将 duplistatus 与其他容器一起运行时非常有用。

**基础 pod 设置：**

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

#### 为 Podman Pods 配置 DNS {#configuring-dns-for-podman-pods}

使用 pods 时，DNS 配置必须在 pod 级别设置，而不是在容器级别。
使用选项 5 中描述的相同方法来查找您的 DNS 服务器和搜索域。

**DNS 配置示例：**

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

**管理 Pod：**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## 核心配置 {#essential-configuration}

1. 配置您的 [Duplicati 服务器](duplicati-server-configuration.md) 以将备份日志消息发送至 duplistatus（必填）。
2. 登录 duplistatus – 请参阅 [用户指南](../user-guide/overview.md#accessing-the-dashboard) 中的说明。
3. 采集初始备份日志 – 使用 [采集备份日志](../user-guide/collect-backup-logs.md) 功能，将所有 Duplicati 服务器的历史备份数据填充到数据库中。此操作还会根据每台服务器的配置自动更新备份监控间隔。
4. 配置服务器设置 – 在 [设置 → 服务器](../user-guide/settings/server-settings.md) 中设置服务器别名和备注，使您的仪表板提供更丰富的信息。
5. 配置 NTFY 设置 – 在 [设置 → NTFY](../user-guide/settings/ntfy-settings.md) 中设置通过 NTFY 发送通知。
6. 配置邮件设置 – 在 [设置 → 邮件](../user-guide/settings/email-settings.md) 中设置邮件通知。
7. 配置备份通知 – 在 [设置 → 备份通知](../user-guide/settings/backup-notifications-settings.md) 中设置针对单个备份或单个服务器的通知。

请参阅以下章节以配置可选设置，例如时区、数字格式和 HTTPS。
