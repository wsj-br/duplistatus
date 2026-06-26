# 最常用命令 {#most-used-commands}

## 以开发模式运行 {#run-in-dev-mode}

```bash
pnpm dev
```

- **JSON 文件存储**: 所有接收到的备份数据都存储为 `data` 目录中的 JSON 文件。这些文件的名称使用接收时的时间戳，格式为 `YYYY-MM-DDTHH-mm-ss-sssZ.json`（UTC 时间）。此功能仅在开发模式下激活，有助于通过保留从 Duplicati 接收的原始数据来进行调试。

- **详细日志**: 应用程序在开发模式下运行时，会记录有关数据库操作和 API 请求的更详细信息。

- **版本更新**: 开发服务器在启动前自动更新版本信息，以确保在应用程序中显示最新版本。

- **备份删除**: 在服务器详细信息页面上，备份表中会出现一个删除按钮，允许您删除个别备份。此功能对于测试和调试逾期备份功能尤其有用。

## 启动生产服务器（在开发环境中） {#start-the-production-server-in-development-environment}

首先，构建应用程序以进行本地生产:

```bash
pnpm build-local
```

然后启动生产服务器:

```bash
pnpm start-local
```

## 启动 Docker 栈（Docker Compose） {#start-a-docker-stack-docker-compose}

```bash
pnpm docker:up
```

或者手动:

```bash
docker compose up --build -d
```

## 停止 Docker 栈（Docker Compose） {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker:down
```

或者手动:

```bash
docker compose down
```

## 清理 Docker 环境 {#clean-docker-environment}

```bash
pnpm docker:clean
```

或者手动:

```bash
./scripts/clean-docker.sh
```

此脚本执行完整的 Docker 清理，这对于以下方面很有用:
- 释放磁盘空间
- 删除旧的/未使用的 Docker 构件
- 清理开发或测试会话后
- 维护清洁的 Docker 环境

## 创建开发镜像（用于本地测试或使用 Podman） {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
