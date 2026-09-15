# Monitoreo de Copias de Seguridad {/* #backup-monitoring */}

![Alertas de copia de seguridad](../../assets/screen-settings-monitoring.png)

## Filtrado de servidores {/* #server-filtering */}

La lista de servidores en esta página se puede filtrar utilizando el campo de filtro.

Cuando **Resumen Diario** está habilitado, la detección de vencimiento continúa pero el correo electrónico de vencimiento al destinatario de correo electrónico predeterminado se suprime. Los destinos de correo electrónico adicionales continúan para eventos coincidentes (los vencimientos se consideran una Advertencia). Consulte [Resumen Diario](daily-summary-settings.md).

**Coincidencias de filtro:**
- ID del servidor
- URL del servidor
- Nombres de trabajos de copia de seguridad

Esto facilita la ubicación rápida de servidores o copias de seguridad específicas en la configuración de monitoreo cuando se gestionan muchos sistemas.

## Configurar Configuración de Monitoreo por Copia de Seguridad {/* #configure-per-backup-monitoring-settings */}

- **Nombre del servidor**: El nombre del servidor para monitorear copias de seguridad vencidas. 
   - Haga clic en <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> para abrir la interfaz web de Duplicati del servidor
   - Haga clic en <IIcon2 icon="lucide:download" height="18"/> para recopilar registros de copias de seguridad de este servidor.
- **Nombre de la copia de seguridad**: El nombre de la copia de seguridad para monitorear copias de seguridad vencidas.
- **Próxima ejecución**: La próxima hora de copia de seguridad programada se muestra en verde si está programada en el futuro, o en rojo si está vencida. Al pasar el cursor sobre el valor de "Próxima ejecución", se muestra un tooltip que muestra la marca de tiempo de la última copia de seguridad de la base de datos, formateada con fecha/hora completa y tiempo relativo.
- **Monitoreo de copias de seguridad**: Habilitar o deshabilitar el monitoreo de copias de seguridad para esta copia de seguridad.
- **Intervalo de copia de seguridad esperado**: El intervalo de copia de seguridad esperado.
- **Unidad**: La unidad del intervalo esperado.
- **Días permitidos**: Los días de la semana permitidos para la copia de seguridad.

Si los iconos a la derecha del nombre del servidor están desactivados, el servidor no está configurado en [Configuración → Configuración del servidor](/user-guide/settings/server-settings).

:::note
Al recopilar registros de copias de seguridad de un servidor Duplicati, **duplistatus** actualiza automáticamente los intervalos y configuraciones de monitoreo de copias de seguridad.
:::

:::tip
Para obtener los mejores resultados, recopile registros de copias de seguridad después de cambiar la configuración de intervalos de trabajos de copia de seguridad en su servidor Duplicati. Esto asegura que **duplistatus** se mantenga sincronizado con su configuración actual.
:::

## Configuraciones Globales {/* #global-configurations */}

Estas configuraciones se aplican a todas las copias de seguridad:

| Configuración                     | Descripción                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Tolerancia de copia de seguridad**            | El período de gracia (tiempo adicional permitido) agregado al tiempo de copia de seguridad esperado antes de marcar como vencido. El valor predeterminado es **1 hora**.                                                                                                                                                                                                             |
| **Intervalo de monitoreo de copias de seguridad** | Con qué frecuencia el sistema verifica las copias de seguridad vencidas. El valor predeterminado es **5 minutos**.                                                                                                                                                                                                                                                            |
| **Frecuencia de notificaciones**      | Con qué frecuencia enviar notificaciones de vencimiento: <br/> **Una vez`: Send **just one** notification when the backup becomes overdue. <br/> `Todos los días`: Send **daily** notifications while overdue (default). <br/> `Cada semana`: Send **weekly** notifications while overdue. <br/> `Cada mes**: Enviar notificaciones **mensuales** mientras estén vencidas. |

## Acciones Disponibles {/* #available-actions */}

| Botón                                                               | Descripción                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración de monitoreo de copias de seguridad" />              | Guarda la configuración, borra los temporizadores de cualquier copia de seguridad desactivada y ejecuta una comprobación de vencimiento.                                                |
| <IconButton icon="lucide:import" label="Recopilar todo (#)"/>          | Recopila los registros de copias de seguridad de todos los servidores configurados, entre paréntesis el número de servidores de los que se recopilarán.                                   |
| <IconButton icon="lucide:download" label="Descargar CSV"/>           | Descarga un archivo CSV que contiene todas las configuraciones de monitoreo de copias de seguridad y la "Marca de tiempo de la última copia de seguridad (BD)" de la base de datos.               |
| <IconButton icon="lucide:refresh-cw" label="Comprobar ahora"/>            | Ejecuta la comprobación de copias de seguridad vencidas de inmediato. Esto es útil después de cambiar las configuraciones. También desencadena un recálculo de "Próxima ejecución". |
| <IconButton icon="lucide:timer-reset" label="Restablecer notificaciones"/> | Restablece la última notificación vencida enviada para todas las copias de seguridad.                                                                            |
