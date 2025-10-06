---
sidebar_position: 4
---

# Environment Variables

The application supports the following environment variables for configuration:

| Variable                  | Description                                            | Default         |
| ------------------------- | ------------------------------------------------------ | :-------------- |
| `PORT`                    | Port for the main web application                      | `9666`          |
| `CRON_PORT`               | Port for the cron service. If not set, uses `PORT + 1` | `8667`          |
| `NODE_ENV`                | Node.js environment (`development` or `production`)    | `production`    |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry                              | `1`             |
| `TZ`                      | Timezone for the application                           | `Europe/London` |
| `LANG`                    | Locale for the application (e.g., `en_US`, `pt_BR`)    | `en_GB`         |

<br/>

> [!NOTE] > **Email Notifications Configuration:**
>
> - Email notifications are enabled by default, but will only work if they are properly configured.
> - Email notifications can be used alongside, or as an alternative to, NTFY notifications.
> - Settings are configured in the web interface under `Settings → Email Configuration`.
> - Refer to the [User Guide](../user-guide/email-configuration.md) for detailed setup instructions.
