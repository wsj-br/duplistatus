# 环境变量 {/* #environment-variables */}

应用程序支持以下环境变量进行配置：

| 变量                  | 描述                                                                                 | 默认值                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | 主 Web 应用程序的端口                                                           | `9666`                     |
| `CRON_PORT`               | cron 服务（调度）的端口。如果未设置，则使用 `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | cron 服务监听的地址。默认为环回地址，因此控制 API 不会暴露。          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | 当服务未绑定到环回地址时，修改 cron 服务路由所需的共享密钥。Next.js 代理将其作为 `X-Cron-Service-Secret` 转发。 | 未设置（如果不是环回地址则必需） |
| `NODE_ENV`                | Node.js 环境（`development` 或 `production`）                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | 禁用 Next.js 遥测（在所有 Next.js 脚本和 Docker 中设置）                        | `1`                        |
| `TZ`                      | 应用程序的时区                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | 设置为 `false` 以禁用密码复杂性要求（大写字母、小写字母、数字）。 | 强制执行（完全验证） |
| `PWD_MIN_LEN`             | 最小密码长度（字符数）（始终强制执行）                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | 允许设置 `X-Forwarded-For` 的反向代理的 CIDR 列表（以逗号分隔）                   | 未设置                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | 覆盖管理界面 IP白名单启用标志（`true` / `false`）                           | 未设置（使用设置）       |
| `ADMIN_IP_ALLOWLIST`      | 管理界面的 CIDR 列表（以逗号分隔）                                               | 未设置                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | 覆盖外部 API 白名单启用标志（`true` / `false`）                | 未设置（使用设置）       |
| `EXTERNAL_API_IP_ALLOWLIST` | `/api/upload`、`/api/summary` 和 `/api/lastbackup*` 的 CIDR 列表（以逗号分隔）           | 未设置                      |
| `DUPLISTATUS_PUBLIC_URL`    | duplistatus Web UI 的公共基础 URL（无尾部斜杠）。设置后，将覆盖设置 → 每日摘要 **公共仪表板 URL**，并且每日摘要电子邮件包含 `{duplistatus_link}`。未设置时，使用已保存的设置；如果该设置也为空，则不添加仪表板链接。 | 未设置                      |

`NEXT_TELEMETRY_DISABLED=1` 由 Docker 镜像和 `pnpm build`、`pnpm build-local`、`pnpm start`、`pnpm start-local` 和 `pnpm dev` 设置，因此 Next.js 不会收集匿名 CLI 遥测数据。在使用新的开发环境或从源代码编译时，还要在用户配置中持久化选择退出，运行 `npx next telemetry disable`。
