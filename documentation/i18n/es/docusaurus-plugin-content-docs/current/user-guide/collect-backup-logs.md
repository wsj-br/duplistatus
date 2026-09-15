# Recopilar registros de copias de seguridad {/* #collect-backup-logs */}

**duplistatus** puede recuperar registros de copias de seguridad directamente desde los servidores Duplicati para poblar la base de datos o restaurar datos de registros perdidos. La aplicación omite automáticamente cualquier registro duplicado que ya exista en la base de datos.

## Pasos para recopilar registros de copias de seguridad {/* #steps-to-collect-backup-logs */}

### Recopilación manual {/* #manual-collection */}

1.  Haga clic en el icono **Recopilar registros de copias de seguridad** <IconButton icon="lucide:download" /> en la [barra de herramientas de la aplicación](overview.md#application-toolbar).

![Ventana emergente Recopilar registros de copias de seguridad](../assets/screen-collect-button-popup.png)

2.  Seleccionar servidor

Si tienes direcciones de servidores configuradas en [Configuración → Configuración del servidor](settings/server-settings.md), selecciona una de la lista desplegable para recopilar instantáneamente. Si no tienes servidores configurados, puedes ingresar manualmente los detalles del servidor Duplicati.

3.  Ingresa los detalles del servidor Duplicati:
    - **Nombre de host**: El nombre de host o la dirección IP del servidor Duplicati. Puedes ingresar múltiples nombres de host separados por comas, por ejemplo `192.168.1.23,someserver.local,192.168.1.89`
    - **Puerto**: El número de puerto utilizado por el servidor Duplicati (predeterminado: `8200`).
    - **Contraseña**: Ingresa la contraseña de autenticación si es requerida.
    - **Descargar datos JSON recopilados**: Activa esta opción para descargar los datos recopilados por duplistatus.
4.  Haz clic en **Recopilar copias de seguridad**.

***Notas:***
- Si ingresas múltiples nombres de host, la recopilación se realizará utilizando el mismo puerto y contraseña para todos los servidores.
- **duplistatus** detectará automáticamente el mejor protocolo de conexión (HTTPS o HTTP). Primero intenta HTTPS (con validación SSL adecuada), luego HTTPS con certificados autofirmados y finalmente HTTP como opción de respaldo.

:::tip
<IconButton icon="lucide:download" /> están disponibles en [Configuración → Monitoreo de copias de seguridad](settings/backup-monitoring-settings.md) y [Configuración → Configuración del servidor](settings/server-settings.md) para la recopilación de un solo servidor.
:::

<br/>

### Recopilación masiva {/* #bulk-collection */}

_Haz clic derecho_ en el botón **Recopilar registros de copias de seguridad** <IconButton icon="lucide:download" /> de la barra de herramientas de la aplicación para recopilar desde todos los servidores configurados.

![Menú de clic derecho Recopilar todo](../assets/screen-collect-button-right-click-popup.png)

:::tip
También puedes usar el botón <IconButton icon="lucide:import" label="Recopilar todos"/> en las páginas [Configuración → Monitoreo de copias de seguridad](settings/backup-monitoring-settings.md) y [Configuración → Configuración del servidor](settings/server-settings.md) para recopilar datos de todos los servidores configurados.
:::

## Cómo funciona el proceso de recopilación {/* #how-the-collection-process-works */}

- **duplistatus** detecta automáticamente el mejor protocolo de conexión y se conecta al servidor Duplicati especificado.
- Recupera el historial de copias de seguridad, la información de los registros y la configuración de las copias de seguridad (para el monitoreo de copias de seguridad).
- Cualquier registro ya presente en la base de datos de **duplistatus** se omite.
- Los nuevos datos se procesan y almacenan en la base de datos local, incluyendo la versión de Duplicati reportada en cada registro de copia de seguridad. La [versión del panel de control](dashboard.md#duplicati-server-version) se toma del último registro almacenado — **duplistatus** no lee la versión que se está ejecutando actualmente en el servidor. Después de una actualización de Duplicati, recopila o espera una nueva copia de seguridad para que el panel pueda mostrar la nueva versión.
- La URL utilizada (con el protocolo detectado) se almacenará o actualizará en la base de datos local.
- Si se selecciona la opción de descarga, se descargará el JSON de los datos recopilados siempre que se reciban datos del servidor Duplicati — incluso si los registros fallan la validación o no pueden importarse a la base de datos. El nombre del archivo tendrá el siguiente formato: `[serverName]_collected_[Timestamp].json`. La marca de tiempo usa el formato de fecha ISO 8601 (AAAA-MM-DDTHH:MM:SS).
- El panel se actualiza para reflejar la nueva información.

:::note ¿Ves servidores duplicados después de recopilar?
Si el mismo servidor aparece más de una vez después de recopilar registros de copias de seguridad (o después de una reinstalación/actualización de Duplicati), suele ser causado por un cambio en el `machine_id` o por un error de la API de Duplicati que mezcla el `identity` id y el `machine_id`. La solución es alinear los ids en el servidor Duplicati (editar `identity.txt`/`machineid.txt` o establecer **Duplicati → Configuración → Opciones avanzadas → Machine-id**), reiniciar Duplicati y luego fusionar las entradas en **duplistatus** a través de [Configuración → Mantenimiento de base de datos → Combinar servidores duplicados](settings/database-maintenance.md#merge-duplicate-servers). Consulta [Servidores duplicados en el panel de control](troubleshooting.md#duplicate-servers-on-the-dashboard) para ver los pasos completos.
:::

## Solución de problemas de recopilación {/* #troubleshooting-collection-issues */}

La recopilación de registros de copia de seguridad requiere que el servidor Duplicati sea accesible desde la instalación de **duplistatus**. Si encuentras problemas, verifica lo siguiente:

- Confirma que el nombre de host (o dirección IP) y el número de puerto son correctos. Puedes probar esto accediendo a la interfaz de usuario de Duplicati en tu navegador (por ejemplo, `http://hostname:port`).
- Comprueba que **duplistatus** pueda conectarse al servidor Duplicati. Un problema común es la resolución de nombres DNS (el sistema no puede encontrar el servidor por su nombre de host). Consulta más información en la [sección de solución de problemas](troubleshooting.md#collect-backup-logs-not-working).
- Asegúrate de que la contraseña que proporcionaste sea correcta.
- En Duplicati 2.4+, la recopilación lee el ID de la máquina de la configuración del servidor Duplicati cuando la opción de systeminfo está vacía por defecto.
