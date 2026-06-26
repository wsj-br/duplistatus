# Podman 测试 {#podman-testing}

在 Podman 测试服务器上，复制并执行位于 `scripts/podman_testing` 的脚本。

## 初始设置和管理 {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`：将 Docker 镜像从本地 Docker 守护进程复制到 Podman（用于本地测试）。
2. `copy.docker.duplistatus.remote`：将 Docker 镜像从远程开发服务器复制到 Podman（需要 SSH 访问权限）。
   - 使用 `docker build . -t wsj-br/duplistatus:devel` 在开发服务器上创建镜像：
3. `start.duplistatus`：以无根模式启动容器。
4. `pod.testing`：在 Podman pod 内测试容器（具有 root 权限）。
5. `stop.duplistatus`：停止 pod 并移除容器。
6. `clean.duplistatus`：停止容器，移除 pod，并清理旧镜像。

## DNS 配置 {#dns-configuration}

脚本会自动检测并配置来自主机系统的 DNS 设置：

- **自动检测**：使用 `resolvectl status` (systemd-resolved) 提取 DNS 服务器和搜索域
- **后备支持**：在非 systemd 系统上回退到解析 `/etc/resolv.conf`
- **智能过滤**：自动过滤掉 localhost 地址和 IPv6 名称服务器
- **适用于**：
  - Tailscale MagicDNS (100.100.100.100)
  - 企业 DNS 服务器
  - 标准网络配置
  - 自定义 DNS 设置

无需手动配置 DNS - 脚本会自动处理！

## 监控和健康检查 {#monitoring-and-health-checks}

- `check.duplistatus`：检查日志、连接性和应用程序健康状况。

## 调试命令 {#debugging-commands}

- `logs.duplistatus`：显示 pod 的日志。
- `exec.shell.duplistatus`：在容器中打开 shell。
- `restart.duplistatus`：停止 pod，移除容器，复制镜像，创建容器，并启动 pod。

## 使用工作流 {#usage-workflow}

### 开发服务器 {#development-server}

在开发服务器上创建 Docker 镜像：

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman 服务器 {#podman-server}

1. 传输 Docker 镜像：
   - 如果 Docker 和 Podman 在同一台机器上，使用 `./copy.docker.duplistatus.local`
   - 如果从远程开发服务器复制，使用 `./copy.docker.duplistatus.remote`（需要包含 `REMOTE_USER` 和 `REMOTE_HOST` 的 `.env` 文件）
2. 使用 `./start.duplistatus` 启动容器（独立，无根）
   - 或使用 `./pod.testing` 在 pod 模式下测试（具有 root 权限）
3. 使用 `./check.duplistatus` 和 `./logs.duplistatus` 进行监控
4. 完成后使用 `./stop.duplistatus` 停止
5. 使用 `./restart.duplistatus` 进行完整的重启循环（停止、复制镜像、启动）
   - **注释**: 此脚本目前引用 `copy.docker.duplistatus`，应该替换为 `.local` 或 `.remote` 变体
6. 使用 `./clean.duplistatus` 删除容器、Pod 和旧镜像

# 测试应用程序 {#testing-the-application}

如果您在同一台机器上运行 Podman 服务器，请使用 `http://localhost:9666`。

如果您在另一台服务器上，请使用以下命令获取 URL：

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## 重要说明 {#important-notes}

### Podman Pod 网络 {#podman-pod-networking}

何时运行在 Podman Pod 中，应用程序需要：
- 显式 DNS 配置（由 `pod.testing` 脚本自动处理）
- 将端口绑定到所有接口（`0.0.0.0:9666`）

脚本自动处理这些要求 - 无需手动配置。

### 无根模式与根模式 {#rootless-vs-root-mode}

- **独立模式** (`start.duplistatus`): 以无根方式运行，使用 `--userns=keep-id`
- **Pod 模式** (`pod.testing`): 以根方式在 Pod 中运行，用于测试目的

两种模式都能与自动 DNS 检测正确工作。

## 环境配置 {#environment-configuration}

两者 `copy.docker.duplistatus.local` 和 `copy.docker.duplistatus.remote` 都需要 `.env` 文件在 `scripts/podman_testing` 目录中：

**用于本地复制** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**用于远程复制** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

`start.duplistatus` 脚本需要一个 `.env` 文件，至少包含 `IMAGE` 变量：

```
IMAGE=wsj-br/duplistatus:devel
```

**注释**: 脚本的错误消息提到了 `REMOTE_USER` 和 `REMOTE_HOST`，但这些并不是由 `start.duplistatus` 使用的 - 只需要 `IMAGE`。
