

# Timezone and Locale

The application user interface date and time will be displayed according to the browser's settings. However, for logging and notification purposes, the application will use the value defined in the `TZ` and `LANG` environment variables to use the correct time zones and to format number, date and time values.

The default values are `TZ=Europe/London` and `LANG=en_GB` if these environment variables are not set.

## Configuring the Timezone

The application user interface date and time will be displayed according to the browser's settings. However, for logging and notification purposes, the application will use the value defined in the `TZ` environment variable to format time zones.

The default value is `TZ=Europe/London` if this environment variable is not set.

For example, to change the timezone to São Paulo, add these lines to the `compose.yml` in directory `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

or pass the environment variable in the command line:

```bash
  --env TZ=America/Sao_Paulo
```

### Using your Linux Configuration

To obtain your Linux host's configuration, you can execute:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### List of Timezones

You can find a list of timezones here: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Configuring the Locale

The application user interface dates and numbers will be displayed according to the browser's settings. However, for logging and notification purposes, the application will use the value defined in the `LANG` environment variable to format dates and numbers.

The default value is `LANG=en_GB` if this environment variable is not set.

For example, to change the locale to Brazilian Portuguese, add these lines to the `compose.yml` in directory `duplistatus`:

```yaml
environment:
  - LANG=pt_BR
```

or pass the environment variable in the command line:

```bash
  --env LANG=pt_BR
```

### Using your Linux Configuration

To obtain your Linux host's configuration, you can execute:

```bash
echo ${LANG%.*}
```

### List of Locales

You can find a list of locales here: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)

