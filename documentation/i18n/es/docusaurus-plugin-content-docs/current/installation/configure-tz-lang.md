# Zona horaria y configuración regional

La fecha y hora de la interfaz de usuario de la aplicación se mostrarán según la configuración del navegador. Sin embargo, para fines de registro y notificación, la aplicación utilizará el valor definido en las variables de entorno `TZ` y `LANG` para usar las zonas horarias correctas y formatear los valores de números, fechas y horas.

Los valores predeterminados son `TZ=Europe/London` y `LANG=en_GB` si estas variables de entorno no están configuradas.

## Configuración de la zona horaria

La fecha y hora de la interfaz de usuario de la aplicación se mostrarán según la configuración del navegador. Sin embargo, para fines de registro y notificación, la aplicación utilizará el valor definido en la variable de entorno `TZ` para formatear las zonas horarias.

El valor predeterminado es `TZ=Europe/London` si esta variable de entorno no está configurada.

Por ejemplo, para cambiar la zona horaria a São Paulo, agregue estas líneas al archivo `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

o pase la variable de entorno en la línea de comandos:

```bash
  --env TZ=America/Sao_Paulo
```

### Uso de la configuración de Linux

Para obtener la configuración de su host Linux, puede ejecutar:

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Lista de zonas horarias

Puede encontrar una lista de zonas horarias aquí: [Wikipedia: Lista de zonas horarias de la base de datos tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Configuración de la configuración regional

Las fechas y números de la interfaz de usuario de la aplicación se mostrarán según la configuración del navegador. Sin embargo, para fines de registro y notificación, la aplicación utilizará el valor definido en la variable de entorno `LANG` para formatear fechas y números.

El valor predeterminado es `LANG=en_GB` si esta variable de entorno no está configurada.

Por ejemplo, para cambiar la configuración regional a portugués brasileño, agregue estas líneas al archivo `compose.yml` en el directorio `duplistatus`:

```yaml
environment:
  - LANG=pt_BR
```

o pase la variable de entorno en la línea de comandos:

```bash
  --env LANG=pt_BR
```

### Uso de la configuración de Linux

Para obtener la configuración de su host Linux, puede ejecutar:

```bash
echo ${LANG%.*}
```

### Lista de configuraciones regionales

Puede encontrar una lista de configuraciones regionales aquí: [LocalePlanet: Componentes internacionales para Unicode (ICU) Data](https://www.localeplanet.com/icu/)

