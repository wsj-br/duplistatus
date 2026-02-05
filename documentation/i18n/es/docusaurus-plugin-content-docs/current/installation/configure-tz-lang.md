---
translation_last_updated: '2026-02-05T19:08:51.068Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 67bb94741185f3d9
translation_language: es
source_file_path: installation/configure-tz-lang.md
---
# Zona horaria y configuración regional {#timezone-and-locale}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. Sin embargo, para fines de registro y notificaciones, la aplicación utilizará el valor definido en las variables de entorno `TZ` y `LANG` para usar las zonas horarias correctas y para formatear los valores numéricos, de fecha y hora.

Los valores por defecto son `TZ=Europe/London` y `LANG=en_GB` si estas variables de entorno no están establecidas.

## Configuración de la Zona horaria {#configuring-the-timezone}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. Sin embargo, para propósitos de registro y notificaciones, la aplicación utilizará el valor definido en la variable de entorno `TZ` para formatear zonas horarias.

El valor por defecto es `TZ=Europe/London` si esta variable de entorno no está establecida.

Por ejemplo, para cambiar la zona horaria a São Paulo, añada estas líneas al `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

o pasar la variable de entorno en la línea de comandos:

```bash
  --env TZ=America/Sao_Paulo
```

### Uso de tu configuración de Linux {#using-your-linux-configuration}

Para obtener la configuración de su host Linux, puede ejecutar:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Lista de Zonas Horarias {#list-of-timezones}

Puede encontrar una lista de zonas horarias aquí: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Configuración de la Configuración Regional {#configuring-the-locale}

La interfaz de usuario de la aplicación mostrará fechas y números de acuerdo con la configuración del navegador. Sin embargo, para propósitos de registro y notificaciones, la aplicación utilizará el valor definido en la variable de entorno `LANG` para formatear fechas y números.

El valor por defecto es `LANG=en_GB` si esta variable de entorno no está establecida.

Por ejemplo, para cambiar la configuración regional a portugués brasileño, añada estas líneas al archivo `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - LANG=pt_BR
```

o pasar la variable de entorno en la línea de comandos:

```bash
  --env LANG=pt_BR
```

### Uso de tu configuración de Linux {#using-your-linux-configuration}

Para obtener la configuración de su host Linux, puede ejecutar:

```bash
echo ${LANG%.*}
```

### Lista de Locales {#list-of-locales}

Puede encontrar una lista de configuraciones regionales aquí: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)
