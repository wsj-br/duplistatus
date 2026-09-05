# 环境变量 {#environment-variables}

应用程序支持以下环境变量用于配置：

| 变量                  | 描述                                                                                 | 默认                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | 主要网页应用程序的端口                                                           | `9666`                     |
| `CRON_PORT`               | 计划服务（cron）的端口。如果未设置，则使用 `PORT + 1`                                      | `9667`                     |
| `NODE_ENV`                | Node.js 环境（`development` 或 `production`）                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | 禁用 Next.js 遥测（在所有 Next.js 脚本和 Docker 中设置）                        | `1`                        |
| `TZ`                      | 应用程序的时区                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | 设置为 `false` 以禁用密码复杂性要求（大写、小写、数字）。 | 强制执行（完整验证） |
| `PWD_MIN_LEN`             | 密码的最小长度（字符）（始终强制执行）                                    | `8`                        |

`NEXT_TELEMETRY_DISABLED=1` 由 Docker 镜像和 `pnpm build`、`pnpm build-local`、`pnpm start`、`pnpm start-local` 和 `pnpm dev` 设置，因此 Next.js 不会收集匿名 CLI 遥测。要在用户配置中持久化选择退出，请运行 `npx next telemetry disable`。
