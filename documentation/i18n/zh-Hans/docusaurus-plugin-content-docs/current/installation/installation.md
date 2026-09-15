# 安装指南 {/* #installation-guide */}

该应用程序可以使用 Docker、[Portainer Stacks](https://docs.portainer.io/user/docker/stacks)、或 Podman 进行部署。安装后，您可能需要配置 TIMEZONE，如 [配置时区](./configure-tz.md) 中所述，并需要配置 Duplicati 服务器以将备份日志发送到 **duplistatus**，如 [Duplicati 配置](./duplicati-server-configuration.md) 部分所述。

## 先决条件 {/* #prerequisites */}

确保您已安装以下内容：

- Docker Engine - [Debian 安装指南](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux 安装指南](https://docs.docker.com/compose/install/linux/)
- Portainer（可选） - [Docker 安装指南](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman（可选） - [安装指南](http://podman.io/docs/installation#debian)

## 认证 {/* #authentication */}

**duplistatus** 从版本 0.9.x 开始需要用户认证。在首次安装应用程序或从早期版本升级时，会自动创建一个默认的 `admin` 帐户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

您可以在首次登录后，在 [设置 > 用户](../user-guide/settings/user-management-settings.md) 中创建其他用户帐户。

管理员还可以选择为 Duplicati 和 Homepage 要求 [API 密钥](../user-guide/settings/api-keys-settings.md)，并通过 [IP 允许列表](../user-guide/settings/ip-allowlist-settings.md) 限制访问。两者默认均为关闭状态。

::::info[重要]
系统强制执行最小密码长度和复杂性要求。这些要求可以使用 `PWD_ENFORCE` 和 `PWD_MIN_LEN` [环境变量](environment-variables.md) 进行调整。使用复杂性不足或长度过短的密码可能会危及安全。请谨慎使用这些设置。
::::

### 容器镜像 {/* #container-images */}

您可以使用以下镜像：

- **Docker Hub**：`docker.io/wsjbr/duplistatus:latest`
- **GitHub 容器注册表**：`ghcr.io/wsj-br/duplistatus:latest`

### 选项 1：使用 Docker Compose {/* #option-1-using-docker-compose */}

这是本地部署或自定义配置时的推荐方法。它使用 `docker compose` 文件来定义并运行所有设置的容器。

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

查看 [时区](./configure-tz.md) 部分以获取更多关于调整时区和数字/日期/时间格式的详细信息。

### 选项 2：使用 Portainer Stacks（Docker Compose）{/* #option-2-using-portainer-stacks-docker-compose */}

1. 在您的 [Portainer](https://docs.portainer.io/user/docker/stacks) 服务器中转到“Stacks”并点击“Add stack”。
2. 为您的 stack 命名（例如，“duplistatus”）。
3. 将“Build method”设置为“Web editor”。
4. 在 Web 编辑器中复制并粘贴以下内容：

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

5. 查看 [时区](./configure-tz.md) 部分以获取更多关于调整时区和数字/日期/时间格式的详细信息。
6. 点击“Deploy the stack”。

### 选项 3：使用 Portainer Stacks（GitHub 仓库）{/* #option-3-using-portainer-stacks-github-repository */}

1. 在 [Portainer](https://docs.portainer.io/user/docker/stacks) 中，转到“Stacks”并点击“Add stack”。
2. 为您的 stack 命名（例如，“duplistatus”）。
3. 将“Build method”设置为“Repository”。
4. 输入仓库 URL：`https://github.com/wsj-br/duplistatus.git`
5. 在“Compose path”字段中输入：`production.yml`
6. （可选）在“Environment variables”部分设置`TZ`、`LANG`、`PWD_ENFORCE`和`PWD_MIN_LEN`环境变量。查看[Timezone](./configure-tz.md)部分以获取更多关于调整时区和数字/日期/时间格式的详细信息。
6. 点击“Deploy the stack”。

### 选项4：使用Docker CLI {/* #option-4-using-docker-cli */}

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

- `duplistatus_data`卷用于持久存储。容器镜像使用`Europe/London`作为默认时区和`en_GB`作为默认区域设置（语言）。

### 选项5：使用Podman（CLI）`rootless` {/* #option-5-using-podman-cli-rootless */}

对于基本设置，您可以在不配置DNS的情况下启动容器：

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

#### 配置Podman容器的DNS {/* #configuring-dns-for-podman-containers */}

如果您需要自定义DNS配置（例如，用于Tailscale MagicDNS、企业网络或自定义DNS设置），您可以手动配置DNS服务器和搜索域。

**查找您的DNS配置：**

1. **对于systemd-resolved系统**（大多数现代Linux发行版）：

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **对于非systemd系统**或作为后备：

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

查找以`nameserver`（用于DNS服务器）和`search`（用于搜索域）开头的行。如果您不确定您的DNS设置或网络搜索域，请咨询您的网络管理员以获取这些信息。

**带有DNS配置的示例：**

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

您可以通过添加多个`--dns`标志来指定多个DNS服务器：

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

您可以通过添加多个`--dns-search`标志来指定多个搜索域：

```bash
--dns-search example.com --dns-search internal.local
```

**注意**：配置DNS服务器时，请跳过IPv6地址（包含`:`）和本地主机地址（如`127.0.0.53`）。

查看[Timezone](./configure-tz.md)部分以获取更多关于调整时区和数字/日期/时间格式的详细信息。

### 选项6：使用Podman Pods {/* #option-6-using-podman-pods */}

Podman pods允许您在共享网络命名空间中运行多个容器。这对于测试或需要与其他容器一起运行duplistatus时非常有用。

**基本pod设置：**

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

#### 配置Podman Pods的DNS {/* #configuring-dns-for-podman-pods */}

在使用pod时，DNS配置必须在pod级别设置，而不是在容器级别设置。
使用选项5中描述的相同方法来查找您的DNS服务器和搜索域。

**带有DNS配置的示例：**

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

**管理pod：**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## 基本配置 {/* #essential-configuration */}

1. 配置您的[Duplicati服务器](duplicati-server-configuration.md)以将备份日志消息发送到duplistatus（必需）。在Duplicati 2.0.9.106及更高版本中，使用该指南中描述的`--send-http-json-urls`。
2. 登录到duplistatus——请参阅[用户指南](../user-guide/overview.md#accessing-the-dashboard)。
3. 收集初始备份日志——使用[收集备份日志](../user-guide/collect-backup-logs.md)功能将历史备份数据从所有Duplicati服务器填充到数据库中。这也会自动更新每个服务器的备份监控间隔。
4. 配置服务器设置——在[设置→服务器](../user-guide/settings/server-settings.md)中设置服务器别名和注释，以使您的仪表板更具信息性。
5. 配置NTFY设置——在[设置→NTFY](../user-guide/settings/ntfy-settings.md)中通过NTFY设置通知。
6. 配置电子邮件设置——在[设置→电子邮件](../user-guide/settings/email-settings.md)中设置电子邮件通知。
7. 配置备份通知——在[设置→备份通知](../user-guide/settings/backup-notifications-settings.md)中设置每个备份或每个服务器的通知。

请参阅以下部分以配置可选设置，例如时区、数字格式和[安全加固](security-hardening.md)。
