# Zona horaria {/* #timezone */}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. El registro aún utiliza la variable de entorno `TZ`. Las notificaciones del Resumen Diario utilizan la zona horaria IANA guardada en [Configuración → Resumen Diario](../user-guide/settings/daily-summary-settings.md), no `TZ`. Otras marcas de tiempo de notificaciones que no sean Resumen Diario aún siguen `TZ`.

El valor predeterminado es `TZ=Europe/London` si esta variable de entorno no está establecida.

:::note
La configuración de idioma y configuración regional (formatos de número y fecha) para las notificaciones se puede configurar en [Configuración → Plantillas](../user-guide/settings/notification-templates.md).
:::

## Configurar la zona horaria {/* #configuring-the-timezone */}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. El registro aún utiliza la variable de entorno `TZ`. Las notificaciones del Resumen Diario utilizan la zona horaria IANA guardada en [Configuración → Resumen Diario](../user-guide/settings/daily-summary-settings.md), no `TZ`. Otras marcas de tiempo de notificaciones que no sean Resumen Diario aún siguen `TZ`.

El valor predeterminado es `TZ=Europe/London` si esta variable de entorno no está establecida.

Por ejemplo, para cambiar la zona horaria a São Paulo, añada estas líneas al `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

o pase la variable de entorno en la línea de comandos (Docker o Podman):

```bash
  --env TZ=America/Sao_Paulo
```

### Usando su configuración de Linux {/* #using-your-linux-configuration */}

Para obtener la configuración de su host Linux, puede ejecutar:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Lista de zonas horarias {/* #list-of-timezones */}

Puede encontrar una lista de zonas horarias aquí: [Wikipedia: Lista de zonas horarias de la base de datos tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
