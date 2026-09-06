

# Environment Variables {#environment-variables}

The application supports the following environment variables for configuration:

| Variable                  | Description                                                                                 | Default                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port for the main web application                                                           | `9666`                     |
| `CRON_PORT`               | Port for the cron service (scheduling). If not set, uses `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Address the cron service listens on. Loopback is the default so the control API is not exposed.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Shared secret required for mutating cron-service routes when the service is not bound to loopback. The Next.js proxy forwards it as `X-Cron-Service-Secret`. | unset (required if not loopback) |
| `NODE_ENV`                | Node.js environment (`development` or `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry (set on all Next.js scripts and in Docker)                        | `1`                        |
| `TZ`                      | Timezone for the application                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Set to `false` to disable password complexity requirements (uppercase, lowercase, numbers). | Enforced (full validation) |
| `PWD_MIN_LEN`             | Minimum password length in characters  (always enforced)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | Comma-separated CIDRs of reverse proxies allowed to set `X-Forwarded-For`                   | unset                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Override the admin IP allowlist enable flag (`true` / `false`)                           | unset (use Settings)       |
| `ADMIN_IP_ALLOWLIST`      | Comma-separated CIDRs for the admin interface                                               | unset                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Override the external-API allowlist enable flag (`true` / `false`)                | unset (use Settings)       |
| `EXTERNAL_API_IP_ALLOWLIST` | Comma-separated CIDRs for `/api/upload`, `/api/summary`, and `/api/lastbackup*`           | unset                      |
| `DUPLISTATUS_PUBLIC_URL`    | Public base URL of the duplistatus web UI (no trailing slash). When set, overrides Settings → Daily Summary **Public dashboard URL** and Daily Summary emails include `{duplistatus_link}`. When unset, the saved setting is used; if that is also empty, no dashboard link is added. | unset                      |

`NEXT_TELEMETRY_DISABLED=1` is set by the Docker image and by `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, and `pnpm dev`, so Next.js does not collect anonymous CLI telemetry. To persist the opt-out in your user config instead, run `npx next telemetry disable`.

