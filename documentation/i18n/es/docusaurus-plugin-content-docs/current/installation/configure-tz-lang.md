# Zona horaria y Configuración regional {#timezone-and-locale}

La fecha y hora de la interfaz de usuario de la aplicación se mostrarán de acuerdo con la Configuración del navegador. Sin embargo, para fines de registro y Notificaciones, la aplicación utilizará el valor definido en las variables de entorno `TZ` y `LANG` para utilizar las zonas horarias correctas y para formatear los valores de número, Fecha y hora.

Los valores Por defecto son `TZ=Europe/London` y `LANG=en_GB` si estas variables de entorno no están No establecido.

## Configuración de la Zona horaria {#configuring-the-timezone}

La fecha y hora de la interfaz de usuario de la aplicación se mostrarán de acuerdo con la Configuración del navegador. Sin embargo, para fines de registro y Notificaciones, la aplicación utilizará el valor definido en la variable de entorno `TZ` para formatear zonas horarias.

El valor Por defecto es `TZ=Europe/London` si esta variable de entorno no está No establecido.

Por ejemplo, para cambiar la Zona horaria a São Paulo, Añadir estas líneas al `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

o pasar la variable de entorno en la línea de comandos:

```bash
  --env TZ=America/Sao_Paulo
```

### Usando su Configuración de Linux {#using-your-linux-configuration}

Para obtener la Configuración del Host de Linux, puede ejecutar:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Lista de Zonas horarias {#list-of-timezones}

Puede encontrar una lista de Zonas horarias aquí: [Wikipedia: Lista de zonas horarias de la base de datos tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Configuración de la Configuración regional {#configuring-the-locale}

Las fechas y números de la interfaz de usuario de la aplicación se mostrarán de acuerdo con la Configuración del navegador. Sin embargo, para fines de registro y Notificaciones, la aplicación utilizará el valor definido en la variable de entorno `LANG` para formatear fechas y números.

El valor Por defecto es `LANG=en_GB` si esta variable de entorno no está No establecido.

Por ejemplo, para cambiar la Configuración regional a portugués brasileño, Añadir estas líneas al `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - LANG=pt_BR
```

o pasar la variable de entorno en la línea de comandos:

```bash
  --env LANG=pt_BR
```

### Usando su Configuración de Linux {#using-your-linux-configuration}

Para obtener la Configuración del Host de Linux, puede ejecutar:

```bash
echo ${LANG%.*}
```

### Lista de Configuraciones regionales {#list-of-locales}

Puede encontrar una lista de Configuraciones regionales aquí: [LocalePlanet: Componentes internacionales para Unicode (ICU) Data](https://www.localeplanet.com/icu/)

