

# 最常用命令 {#most-used-commands}

## 以开发模式运行 {#run-in-dev-mode}

```bash
pnpm dev
```

- **JSON 文件存储**：所有接收到的备份数据以 JSON 文件形式存储在 `data` 目录中。这些文件使用接收时的时间戳命名，格式为 `YYYY-MM-DDTHH-mm-ss-sssZ.json`（UTC 时间）。此功能仅在开发模式下激活，通过保留从 Duplicati 接收的原始数据来帮助调试。

- **详细日志**：开发模式下，应用程序记录有关数据库操作和 API 请求的更详细信息。

- **版本更新**：开发服务器启动前自动更新版本信息，确保应用程序显示最新版本。

- **备份删除**：在服务器详情页，备份表格中会出现删除按钮，允许删除单个备份。此功能对测试和调试逾期备份功能特别有用。


## 启动生产服务器（在开发环境中） {#start-the-production-server-in-development-environment}

首先，为本地生产环境构建应用程序：

```bash
pnpm build-local
```

然后启动生产服务器：

```bash
pnpm start-local
```

## 启动 Docker 堆栈（Docker Compose） {#start-a-docker-stack-docker-compose}

```bash
pnpm docker:up
```

或手动：
```bash
docker compose up --build -d
```

## 停止 Docker 堆栈（Docker Compose） {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker:down
```

或手动：
```bash
docker compose down
```

## 清理 Docker 环境 {#clean-docker-environment}

```bash
pnpm docker:clean
```

或手动：
```bash
./scripts/clean-docker.sh
```

此脚本执行完整的 Docker 清理，适用于：
- 释放磁盘空间
- 删除旧/未使用的 Docker 产物
- 开发或测试会话后的清理
- 保持干净的 Docker 环境

## 创建开发镜像（用于本地或 Podman 测试） {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
