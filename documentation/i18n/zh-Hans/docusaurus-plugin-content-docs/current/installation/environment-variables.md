# 环境变量 {#environment-variables}

应用程序支持以下环境变量用于配置：

| 变量                  | 描述                                                                                 | 默认                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | 主要网页应用程序的端口                                                           | `9666`                     |
| `CRON_PORT`               | 计划服务（cron）的端口。如果未设置，则使用 `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | cron 服务监听的地址。默认使用回环地址，因此控制 API 不会暴露。          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | 当服务未绑定到回环地址时，修改 cron-service 路由所需的共享密钥。Next.js 代理将其转发为 `X-Cron-Service-Secret`。 | 未设置（如果不是回环地址则为必填项） |
| `NODE_ENV`                | Node.js 环境（`development` 或 `production`）                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | 禁用 Next.js 遥测（在所有 Next.js 脚本和 Docker 中设置）                        | `1`                        |
| `TZ`                      | 应用程序的时区                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | 设置为 `false` 以禁用密码复杂性要求（大写、小写、数字）。 | 强制执行（完整验证） |
| `PWD_MIN_LEN`             | 密码的最小长度（字符）（始终强制执行）                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | 以逗号分隔的反向代理的CIDR，允许设置`X-Forwarded-For`                   | 未设置                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | 覆盖管理员IP白名单启用标志（`true` / `false`)                           | 未设置（使用设置）       |
| `ADMIN_IP_ALLOWLIST`      | 管理界面的以逗号分隔的CIDR                                               | 未设置                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | 覆盖外部API白名单启用标志（`true` / `false`)                | 未设置（使用设置）       |
| `EXTERNAL_API_IP_ALLOWLIST` | 以逗号分隔的CIDR用于`/api/upload`、`/api/summary`和`/api/lastbackup*`           | 未设置                      |

`NEXT_TELEMETRY_DISABLED=1` 由 Docker 镜像和 `pnpm build`、`pnpm build-local`、`pnpm start`、`pnpm start-local` 和 `pnpm dev` 设置，因此 Next.js 不会收集匿名 CLI 遥测。要在用户配置中持久化选择退出，请运行 `npx next telemetry disable`。
