# Zona horaria {/* #timezone */}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. Los registros aún usan la variable de entorno `TZ`. Las notificaciones de Resumen Diario usan la zona horaria IANA guardada en [Configuración → Resumen Diario](../user-guide/settings/daily-summary-settings.md), no `TZ`. Otras marcas de tiempo de notificación que no son Resumen Diario siguen `TZ`.

El valor predeterminado es `TZ=Europe/London` si esta variable de entorno no está establecida.

:::note
La configuración de idioma y configuración regional (formatos de número y fecha) para notificaciones se puede configurar en [Configuración → Plantillas](../user-guide/settings/notification-templates.md).
:::

## Configuración de la zona horaria {/* #configuring-the-timezone */}

La interfaz de usuario de la aplicación mostrará la fecha y hora según la configuración del navegador. Los registros aún usan la variable de entorno `TZ`. Las notificaciones de Resumen Diario usan la zona horaria IANA guardada en [Configuración → Resumen Diario](../user-guide/settings/daily-summary-settings.md), no `TZ`. Otras marcas de tiempo de notificación que no son Resumen Diario siguen `TZ`.

El valor predeterminado es `TZ=Europe/London` si esta variable de entorno no está establecida.

Por ejemplo, para cambiar la zona horaria a São Paulo, agregue estas líneas a `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

o pase la variable de entorno en la línea de comandos (Docker o Podman):

```bash
  --env TZ=America/Sao_Paulo
```

### Usando la configuración de Linux {/* #using-your-linux-configuration */}

Para obtener la configuración del host Linux, puede ejecutar:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Lista de zonas horarias {/* #list-of-timezones */}

Puede encontrar una lista de zonas horarias aquí: [Wikipedia: Lista de zonas horarias de la base de datos tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
