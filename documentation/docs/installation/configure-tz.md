

# Timezone {#timezone}

The application user interface date and time will be displayed according to the browser's settings. However, for logging and notification purposes, the application will use the value defined in the `TZ` environment variable to format time zones.

The default value is `TZ=Europe/London` if this environment variable is not set.

:::note
The language and locale settings (number and date formats) for notifications can be configured in the [Settings → Templates](../user-guide/settings/notification-templates.md).
:::

## Configuring the Timezone {#configuring-the-timezone}

The application user interface date and time will be displayed according to the browser's settings. However, for logging and notification purposes, the application will use the value defined in the `TZ` environment variable to format time zones.

The default value is `TZ=Europe/London` if this environment variable is not set.

For example, to change the timezone to São Paulo, add these lines to the `compose.yml` in directory `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

or pass the environment variable in the command line (Docker or Podman):

```bash
  --env TZ=America/Sao_Paulo
```

### Using your Linux Configuration {#using-your-linux-configuration}

To obtain your Linux host's configuration, you can execute:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### List of Timezones {#list-of-timezones}

You can find a list of timezones here: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

