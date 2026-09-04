

# Environment Variables {#environment-variables}

The application supports the following environment variables for configuration:

| Variable                  | Description                                                                                 | Default                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port for the main web application                                                           | `9666`                     |
| `CRON_PORT`               | Port for the cron service (scheduling). If not set, uses `PORT + 1`                                      | `9667`                     |
| `NODE_ENV`                | Node.js environment (`development` or `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry                                                                   | `1`                        |
| `TZ`                      | Timezone for the application                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Set to `false` to disable password complexity requirements (uppercase, lowercase, numbers). | Enforced (full validation) |
| `PWD_MIN_LEN`             | Minimum password length in characters  (always enforced)                                    | `8`                        |

`NEXT_TELEMETRY_DISABLED=1` is set by the Docker image and by `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, and `pnpm dev`, so Next.js does not collect anonymous CLI telemetry. To persist the opt-out in your user config instead, run `npx next telemetry disable`.

