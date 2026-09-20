# 安装指南 {/* #installation-guide */}

可以使用 Docker、[Portainer 堆栈](https://docs.portainer.io/user/docker/stacks) 或 Podman 部署应用程序。安装后，您可能需要配置时区，如[配置时区](./configure-tz.md)中所述，并且需要配置 Duplicati 服务器以将备份日志发送到 **duplistatus**，如[Duplicati 配置](./duplicati-server-configuration.md)部分所述。

## 先决条件 {/* #prerequisites */}

确保您已安装以下组件：

- Docker 引擎 - [Debian 安装指南](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux 安装指南](https://docs.docker.com/compose/install/linux/)
- Portainer（可选）- [Docker 安装指南](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman（可选）- [安装指南](http://podman.io/docs/installation#debian)

## 身份验证 {/* #authentication */}

**duplistatus**从 0.9.x 版本开始需要用户身份验证。首次安装应用程序或从早期版本升级时，会自动创建一个默认的 `admin` 账户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

首次登录后，您可以在[设置 > 用户](../user-guide/settings/user-management-settings.md)中创建其他用户账户。

管理员还可以选择性地要求为 Duplicati 和 Homepage 使用[API 密钥](../user-guide/settings/api-keys-settings.md)，并使用[IP 白名单](../user-guide/settings/ip-allowlist-settings.md)限制访问。两者默认都是关闭的。

::::info[重要]
系统强制执行最小密码长度和复杂度要求。这些要求可以使用 `PWD_ENFORCE` 和 `PWD_MIN_LEN` [环境变量](environment-variables.md)进行调整。使用复杂度不足或长度过短的密码可能会危及安全性。请谨慎使用这些设置。
::::

### 容器镜像 {/* #container-images */}

您可以使用来自以下位置的镜像：

- **Docker Hub**：`docker.io/wsjbr/duplistatus:latest`
- **GitHub 容器注册表**：`ghcr.io/wsj-br/duplistatus:latest`

### 选项 1：使用 Docker Compose {/* #option-1-using-docker-compose */}

这是本地部署或需要自定义配置时推荐的方法。它使用 `docker compose` 文件来定义并运行容器及其所有设置。

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

查看[时区](./configure-tz.md)部分了解如何调整时区和数字/日期/时间格式的更多详细信息。

### 选项 2：使用 Portainer 堆栈（Docker Compose） {/* #option-2-using-portainer-stacks-docker-compose */}

1. 在您的 [Portainer](https://docs.portainer.io/user/docker/stacks) 服务器中转到“堆栈”并单击“添加堆栈”。
2. 为您的堆栈命名（例如，“duplistatus”）。
3. 选择“构建方法”为“Web 编辑器”。
4. 在 Web 编辑器中复制并粘贴此内容：

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

5. 查看[时区](./configure-tz.md)部分了解如何调整时区和数字/日期/时间格式的更多详细信息。
6. 单击“部署堆栈”。

### 选项 3：使用 Portainer 堆栈（GitHub 仓库） {/* #option-3-using-portainer-stacks-github-repository */}

1. 在 [Portainer](https://docs.portainer.io/user/docker/stacks) 中，转到“堆栈”并单击“添加堆栈”。
2. 为您的堆栈命名（例如，“duplistatus”）。
3. 选择“构建方法”为“仓库”。
4. 输入仓库 URL：`https://github.com/wsj-br/duplistatus.git`
5. 在“Compose 路径”字段中，输入：`production.yml`
6. （可选）在“环境变量”部分设置 `TZ`、`LANG`、`PWD_ENFORCE` 和 `PWD_MIN_LEN` 环境变量。查看[时区](./configure-tz.md)部分了解如何调整时区和数字/日期/时间格式的详细信息。
6. 单击“部署堆栈”。

### 选项 4：使用 Docker CLI {/* #option-4-using-docker-cli */}

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

- `duplistatus_data` 卷用于持久存储。容器镜像使用 `Europe/London` 作为默认时区，使用 `en_GB` 作为默认区域设置（语言）。

### 选项 5：使用 Podman (CLI) `rootless` {/* #option-5-using-podman-cli-rootless */}

对于基本设置，您可以在不配置 DNS 的情况下启动容器：

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

#### 为 Podman 容器配置 DNS {/* #configuring-dns-for-podman-containers */}

如果您需要自定义 DNS 配置（例如，用于 Tailscale MagicDNS、企业网络或自定义 DNS 设置），您可以手动配置 DNS 服务器和搜索域。

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

查找以 `nameserver` 开头的行（用于 DNS 服务器）和 `search`（用于搜索域）。如果您不确定您的 DNS 设置或网络搜索域，请咨询您的网络管理员获取此信息。

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

**注意**：配置 DNS 服务器时跳过 IPv6 地址（包含 `:`）和本地地址（如 `127.0.0.53`）。

查看[时区](./configure-tz.md)部分了解如何调整时区和数字/日期/时间格式的更多详细信息。

### 选项 6：使用 Podman Pod {/* #option-6-using-podman-pods */}

Podman pod 允许您在共享网络命名空间中运行多个容器。这对于测试或当您需要与其它容器一起运行 duplistatus 时很有用。

**基本 pod 设置：**

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

#### 为 Podman Pod 配置 DNS {/* #configuring-dns-for-podman-pods */}

使用 Pod 时，DNS 配置必须在 Pod 级别设置，而不是容器级别。
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

## 基本配置 {/* #essential-configuration */}

1. 配置您的 [Duplicati 服务器](duplicati-server-configuration.md) 向 duplistatus 发送备份日志消息（必需）。对于 Duplicati 2.0.9.106 及更高版本，请按照该指南中所述使用 `--send-http-json-urls`。
2. 登录到 duplistatus – 请参阅 [用户指南](../user-guide/overview.md#accessing-the-dashboard) 中的说明。
3. 收集初始备份日志 – 使用 [收集备份日志](../user-guide/collect-backup-logs.md) 功能从您所有的 Duplicati 服务器向数据库填充历史备份数据。这也会根据每个服务器的配置自动更新备份监控间隔。
4. 配置服务器设置 – 在 [设置 → 服务器](../user-guide/settings/server-settings.md) 中设置服务器别名和注释，使您的仪表板更具信息性。
5. 配置 NTFY 设置 – 在 [设置 → NTFY](../user-guide/settings/ntfy-settings.md) 中通过 NTFY 设置通知。
6. 配置电子邮件设置 – 在 [设置 → 电子邮件](../user-guide/settings/email-settings.md) 中设置电子邮件通知。
7. 配置备份通知 – 在 [设置 → 备份通知](../user-guide/settings/backup-notifications-settings.md) 中设置每个备份或每个服务器的通知。

请参阅以下章节以配置可选设置，如时区、数字格式和 [安全加固](security-hardening.md)。
