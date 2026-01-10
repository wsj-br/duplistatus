

# Environment Variables

The application supports the following environment variables for configuration:

| Variable                  | Description                                            | Default         |
| ------------------------- | ------------------------------------------------------ | :-------------- |
| `PORT`                    | Port for the main web application                      | `9666`          |
| `CRON_PORT`               | Port for the cron service. If not set, uses `PORT + 1` | `9667`          |
| `NODE_ENV`                | Node.js environment (`development` or `production`)    | `production`    |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry                              | `1`             |
| `TZ`                      | Timezone for the application                           | `Europe/London` |
| `LANG`                    | Locale for the application (e.g., `en_US`, `pt_BR`)    | `en_GB`         |
| `PWD_ENFORCE`             | Set to `false` to disable password complexity requirements (uppercase, lowercase, numbers). Minimum length is always enforced. | Enforced (full validation) |
| `PWD_MIN_LEN`             | Minimum password length in characters                 | `8`             |

