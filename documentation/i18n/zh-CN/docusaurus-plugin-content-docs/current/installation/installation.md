

# 安装指南 {#installation-guide}

可使用 Docker、[Portainer Stacks](https://docs.portainer.io/user/docker/stacks) 或 Podman 部署应用程序。安装后，您可能需要配置时区，详见[配置时区](./configure-tz.md)；还需配置 Duplicati 服务器向 **duplistatus** 发送备份日志，详见 [Duplicati 配置](./duplicati-server-configuration.md) 部分。

## 前提条件 {#prerequisites}

请确保已安装以下组件：

- Docker Engine - [Debian 安装指南](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux 安装指南](https://docs.docker.com/compose/install/linux/)
- Portainer（可选）- [Docker 安装指南](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman（可选）- [安装指南](http://podman.io/docs/installation#debian)


## 身份验证 {#authentication}

自 0.9.x 版本起，**duplistatus** 需要用户身份验证。首次安装应用程序或从较早版本升级时，将自动创建默认 `admin` 账户：
    - 用户名：`admin`
    - 密码：`Duplistatus09`

首次登录后，可在[设置 > 用户](../user-guide/settings/user-management-settings.md)中创建其他用户账户。


::::info[IMPORTANT]
系统强制要求密码最小长度和复杂度。可通过 `PWD_ENFORCE` 和 `PWD_MIN_LEN` [环境变量](environment-variables.md)调整这些要求。使用复杂度不足或过短的密码可能危及安全。请谨慎使用这些设置。
::::


### 容器镜像 {#container-images}

可使用以下镜像：

- **Docker Hub**：`docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**：`ghcr.io/wsj-br/duplistatus:latest`

### 选项 1：使用 Docker Compose {#option-1-using-docker-compose}

这是本地部署或需要自定义配置时的推荐方式。使用 `docker compose` 文件定义并运行容器及其全部设置。

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

有关如何调整时区以及数字/日期/时间格式，请参阅[时区](./configure-tz.md)部分。

### 选项 2：使用 Portainer Stacks（Docker Compose） {#option-2-using-portainer-stacks-docker-compose}

1. 在 [Portainer](https://docs.portainer.io/user/docker/stacks) 服务器中进入「Stacks」，点击「Add stack」。
2. 为 Stack 命名（例如「duplistatus」）。
3. 将「Build method」选为「Web editor」。
4. 在 Web 编辑器中复制粘贴以下内容：
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

5. 有关如何调整时区以及数字/日期/时间格式，请参阅[时区](./configure-tz.md)部分。
6. 点击「Deploy the stack」。

### 选项 3：使用 Portainer Stacks（GitHub 仓库） {#option-3-using-portainer-stacks-github-repository}

1. 在 [Portainer](https://docs.portainer.io/user/docker/stacks) 中进入「Stacks」，点击「Add stack」。
2. 为 Stack 命名（例如「duplistatus」）。
3. 将「Build method」选为「Repository」。
4. 输入仓库 URL：`https://github.com/wsj-br/duplistatus.git`
5. 在「Compose path」字段输入：`production.yml`
6. （可选）在「Environment variables」部分设置 `TZ`、`LANG`、`PWD_ENFORCE` 和 `PWD_MIN_LEN` 环境变量。有关如何调整时区以及数字/日期/时间格式，请参阅[时区](./configure-tz.md)部分。
6. 点击「Deploy the stack」。

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

- `duplistatus_data` 卷用于持久化存储。容器镜像默认时区为 `Europe/London`，默认区域设置为 `en_GB`（语言）。

### 选项 5：使用 Podman（CLI）`rootless` {#option-5-using-podman-cli-rootless}

对于基本设置，可在不配置 DNS 的情况下启动容器：

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

若需要自定义 DNS 配置（例如 Tailscale MagicDNS、企业网络或自定义 DNS 设置），可手动配置 DNS 服务器和搜索域。

**查找 DNS 配置：**

1. **对于 systemd-resolved 系统**（大多数现代 Linux 发行版）：
   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **对于非 systemd 系统**或作为备选：
   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```
   
   查找以 `nameserver` 开头的行（DNS 服务器）和 `search` 开头的行（搜索域）。若不确定 DNS 设置或网络搜索域，请咨询网络管理员。

**带 DNS 配置的示例：**

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

可通过添加多个 `--dns` 标志指定多个 DNS 服务器：
```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

可通过添加多个 `--dns-search` 标志指定多个搜索域：
```bash
--dns-search example.com --dns-search internal.local
```

**注意**：配置 DNS 服务器时请跳过 IPv6 地址（含 `:`）和 localhost 地址（如 `127.0.0.53`）。

有关如何调整时区以及数字/日期/时间格式，请参阅[时区](./configure-tz.md)部分。

### 选项 6：使用 Podman Pods {#option-6-using-podman-pods}

Podman Pod 允许在共享网络命名空间中运行多个容器。适用于测试或需要与其他容器一起运行 duplistatus 的场景。

**基本 Pod 设置：**

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

#### 为 Podman Pod 配置 DNS {#configuring-dns-for-podman-pods}

使用 Pod 时，DNS 配置必须在 Pod 级别设置，而非容器级别。
使用选项 5 中描述的相同方法查找 DNS 服务器和搜索域。

**带 DNS 配置的示例：**

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


## 必要配置 {#essential-configuration}

1. 配置 [Duplicati 服务器](duplicati-server-configuration.md)向 duplistatus 发送备份日志消息（必需）。
2. 登录 duplistatus — 说明见[用户指南](../user-guide/overview.md#accessing-the-dashboard)。
3. 采集初始备份日志 — 使用[采集备份日志](../user-guide/collect-backup-logs.md)功能，从所有 Duplicati 服务器填充历史备份数据。这还会根据各服务器配置自动更新备份监控间隔。
4. 配置服务器设置 — 在[设置 → 服务器](../user-guide/settings/server-settings.md)中设置服务器别名和备注，使仪表板信息更丰富。
5. 配置 NTFY 设置 — 在[设置 → NTFY](../user-guide/settings/ntfy-settings.md)中设置 NTFY 通知。
6. 配置电子邮件设置 — 在[设置 → 电子邮件](../user-guide/settings/email-settings.md)中设置邮件通知。
7. 配置备份通知 — 在[设置 → 备份通知](../user-guide/settings/backup-notifications-settings.md)中设置按备份或按服务器的通知。

请参阅以下部分配置时区、数字格式和 HTTPS 等可选设置。
