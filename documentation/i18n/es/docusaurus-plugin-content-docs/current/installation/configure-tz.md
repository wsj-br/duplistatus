---
translation_last_updated: '2026-02-16T00:13:36.800Z'
source_file_mtime: '2026-02-15T19:17:43.632Z'
source_file_hash: 2ddcfddd1763c2b6
translation_language: es
source_file_path: installation/configure-tz.md
---
# Zona horaria {#timezone}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. Sin embargo, para propósitos de registro y notificaciones, la aplicación utilizará el valor definido en la variable de entorno `TZ` para formatear zonas horarias.

El valor por defecto es `TZ=Europe/London` si esta variable de entorno no está establecida.

:::note
La configuración de idioma y configuración regional (formatos de número y fecha) para notificaciones se puede configurar en [Configuración → Plantillas](../user-guide/settings/notification-templates.md).
:::

## Configuración de la Zona horaria {#configuring-the-timezone}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. Sin embargo, para propósitos de registro y notificaciones, la aplicación utilizará el valor definido en la variable de entorno `TZ` para formatear zonas horarias.

El valor por defecto es `TZ=Europe/London` si esta variable de entorno no está establecida.

Por ejemplo, para cambiar la zona horaria a São Paulo, añada estas líneas al `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

o pasar la variable de entorno en la línea de comandos (Docker o Podman):

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
