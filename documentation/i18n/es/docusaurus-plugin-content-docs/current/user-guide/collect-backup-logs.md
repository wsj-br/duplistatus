# Recopilar Registros de Copias de Seguridad {/* #collect-backup-logs */}

**duplistatus** puede recuperar directamente los registros de copias de seguridad desde los servidores de Duplicati para poblar la base de datos o restaurar datos de registro faltantes. La aplicación omite automáticamente cualquier registro duplicado que ya exista en la base de datos.

## Pasos para Recopilar Registros de Copias de Seguridad {/* #steps-to-collect-backup-logs */}

### Recolección Manual {/* #manual-collection */}

1.  Haga clic en el icono <IconButton icon="lucide:download" /> **Recopilar Registros de Copias de Seguridad** en la [Barra de Herramientas de Aplicación](overview.md#application-toolbar).

![Ventana Emergente de Recopilación de Registros de Copias de Seguridad](../assets/screen-collect-button-popup.png)

2.  Seleccionar Servidor

Si tiene direcciones de servidor configuradas en [Configuración → Configuración de Servidor](settings/server-settings.md), seleccione una de la lista desplegable para recolección instantánea. Si no tiene ningún servidor configurado, puede ingresar manualmente los detalles del servidor Duplicati.

3.  Ingrese los detalles del servidor Duplicati:
    - **Nombre de host**: El nombre de host o dirección IP del servidor Duplicati. Puede ingresar múltiples nombres de host separados por comas, por ejemplo `192.168.1.23,someserver.local,192.168.1.89`
    - **Puerto**: El número de puerto utilizado por el servidor Duplicati (predeterminado: `8200`).
    - **Contraseña**: Ingrese la contraseña de autenticación si es requerida.
    - **Descargar datos JSON recopilados**: Active esta opción para descargar los datos recopilados por duplistatus.
4.  Haga clic en **Recopilar Copias de Seguridad**.

***Notas:***
- Si ingresa múltiples nombres de host, la recolección se realizará utilizando el mismo puerto y contraseña para todos los servidores.
- **duplistatus** detectará automáticamente el mejor protocolo de conexión (HTTPS o HTTP). Intenta primero HTTPS (con validación SSL adecuada), luego HTTPS con certificados autofirmados y finalmente HTTP como alternativa.

:::tip
Los botones <IconButton icon="lucide:download" /> están disponibles en [Configuración → Monitoreo de Copias de Seguridad](settings/backup-monitoring-settings.md) y [Configuración → Configuración de Servidor](settings/server-settings.md) para recolección de un solo servidor.
:::

<br/>

### Recolección Masiva {/* #bulk-collection */}

_Haga clic derecho_ en el botón <IconButton icon="lucide:download" /> **Recopilar Registros de Copias de Seguridad** en la barra de herramientas de la aplicación para recolectar de todos los servidores configurados.

![Menú contextual Recopilar Todo](../assets/screen-collect-button-right-click-popup.png)

:::tip
También puede usar el botón <IconButton icon="lucide:import" label="Recopilar todo"/> en las páginas [Configuración → Monitoreo de Copias de Seguridad](settings/backup-monitoring-settings.md) y [Configuración → Configuración de Servidor](settings/server-settings.md) para recolectar de todos los servidores configurados.
:::

## Cómo Funciona el Proceso de Recolección {/* #how-the-collection-process-works */}

- **duplistatus** detecta automáticamente el mejor protocolo de conexión y se conecta al servidor Duplicati especificado.
- Recupera historial de copias de seguridad, información de registros y configuraciones de copia de seguridad (para monitoreo de copias de seguridad).
- Se omiten cualquier registro ya presente en la base de datos de **duplistatus**.
- Los nuevos datos son procesados y almacenados en la base de datos local, incluyendo la versión de Duplicati reportada en cada registro de copia de seguridad. La [versión del panel](dashboard.md#duplicati-server-version) se toma del último registro almacenado — **duplistatus** no lee la versión que actualmente se ejecuta en el servidor. Después de una actualización de Duplicati, recoja o espere una nueva copia de seguridad para que el panel pueda mostrar la nueva versión.
- La URL utilizada (con el protocolo detectado) será almacenada o actualizada en la base de datos local.
- Si se selecciona la opción de descarga, descargará los datos JSON recopilados siempre que se reciban datos del servidor Duplicati — incluso si los registros fallan la validación o no pueden importarse a la base de datos. El nombre del archivo tendrá este formato: `[serverName]_collected_[Timestamp].json`. La marca de tiempo utiliza el formato de fecha ISO 8601 (AAAA-MM-DDTHH:MM:SS).
- El panel se actualiza para reflejar la nueva información.

:::note ¿Ve servidores duplicados después de recolectar?
Si el mismo servidor aparece más de una vez después de recolectar registros de copias de seguridad (o después de reinstalar/actualizar Duplicati), generalmente está causado por un `machine_id` cambiado o por un error en la API de Duplicati que mezcla el id `identity` y el `machine_id`. La solución es alinear los ids en el servidor Duplicati (editar `identity.txt`/`machineid.txt` o configurar **Duplicati → Configuración → Opciones Avanzadas → Id de máquina**), reiniciar Duplicati, y luego combinar las entradas en **duplistatus** a través de [Configuración → Mantenimiento de Base de Datos → Combinar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers). Vea [Servidores Duplicados en el Panel](troubleshooting.md#duplicate-servers-on-the-dashboard) para ver los pasos completos.
:::

## Solución de Problemas de Recolección {/* #troubleshooting-collection-issues */}

La recopilación del registro de copia de seguridad requiere que el servidor Duplicati sea accesible desde la instalación de **duplistatus**. Si encuentra problemas, por favor verifique lo siguiente:

- Confirme que el nombre de host (o dirección IP) y el número de puerto son correctos. Puede probar esto accediendo a la interfaz de usuario del servidor Duplicati en su navegador (por ejemplo, `http://hostname:port`).
- Compruebe que **duplistatus** puede conectarse al servidor Duplicati. Un problema común es la resolución de nombres DNS (el sistema no puede encontrar el servidor por su nombre de host). Vea más en [sección de solución de problemas](troubleshooting.md#collect-backup-logs-not-working).
- Asegúrese de que la contraseña proporcionada es correcta.
- En Duplicati 2.4+, la recopilación lee el ID de máquina desde la configuración del servidor Duplicati cuando la opción systeminfo predeterminada está vacía.
