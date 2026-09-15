# 最常用的命令 {/* #most-used-commands */}

## 在开发模式下运行 {/* #run-in-dev-mode */}

```bash
pnpm dev
```

这将同时启动 Next.js 应用程序（端口 8666）和 cron 服务（端口 8667）。按 CTRL-C 停止两者。使用 `pnpm dev:next` 或 `pnpm cron:dev` 单独运行其中一个进程。

- **JSON 文件存储**：所有接收到的备份数据都以 JSON 文件的形式存储在 `data` 目录中。这些文件使用接收到它们的时间戳进行命名，格式为 `YYYY-MM-DDTHH-mm-ss-sssZ.json`（UTC 时间）。此功能仅在开发模式下激活，并通过保留从 Duplicati 接收到的原始数据来帮助调试。

- **详细日志**：在开发模式下运行时，应用程序会记录有关数据库操作和 API 请求的更多详细信息。

- **版本更新**：开发服务器在启动前自动更新版本信息，确保应用程序中显示最新版本。

- **备份删除**：在服务器详细信息页面上，备份表中会出现一个删除按钮，允许您删除单个备份。此功能对于测试和调试过期备份功能特别有用。

## 在开发环境中启动生产服务器 {/* #start-the-production-server-in-development-environment */}

首先，为本地生产构建应用程序：

```bash
pnpm build-local
```

然后启动生产服务器：

```bash
pnpm start-local
```

## 启动 Docker 堆栈（Docker Compose） {/* #start-a-docker-stack-docker-compose */}

```bash
pnpm docker:up
```

或者手动：

```bash
docker compose up --build -d
```

## 停止 Docker 堆栈（Docker Compose） {/* #stop-a-docker-stack-docker-compose */}

```bash
pnpm docker:down
```

或者手动：

```bash
docker compose down
```

## 清理 Docker 环境 {/* #clean-docker-environment */}

```bash
pnpm docker:clean
```

或者手动：

```bash
./scripts/clean-docker.sh
```

此脚本执行完整的 Docker 清理，这对于以下情况很有用：
- 释放磁盘空间
- 删除旧的/未使用的 Docker 工件
- 在开发或测试会话后进行清理
- 保持 Docker 环境的干净

## 创建开发镜像（用于本地测试或与 Podman 一起使用） {/* #create-a-development-image-to-test-locally-or-with-podman */}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
