# Configuración de Duplicati {/* #duplicati-configuration */}

El botón <SvgButton svgFilename="duplicati_logo.svg" /> en la [barra de herramientas de la aplicación](overview.md#application-toolbar) abre la interfaz web del servidor Duplicati en una nueva pestaña.

Puedes seleccionar un servidor desde la lista desplegable. Si ya has seleccionado un servidor (haciendo clic en su tarjeta) o estás viendo sus detalles, el botón abrirá directamente la configuración de Duplicati de ese servidor específico.

![Configuración de Duplicati](../assets/screen-duplicati-configuration.png)

- La lista de servidores mostrará la `server name` o la `server alias (server name)`.
- Las direcciones de servidores se configuran en [Configuración → Servidor](settings/server-settings.md).
- La aplicación guarda automáticamente la URL de un servidor cuando utiliza la función <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [Recopilar registros de copias de seguridad](collect-backup-logs.md).
- Los servidores no aparecerán en la lista de servidores si su dirección no ha sido configurada.

## Acceder a la interfaz de usuario antigua de Duplicati {/* #accessing-the-old-duplicati-ui */}

Si experimentas problemas de inicio de sesión con la nueva interfaz web de Duplicati (`/ngclient/`), puedes hacer clic derecho en el botón <SvgButton svgFilename="duplicati_logo.svg" /> o en cualquier elemento del servidor en el popover de selección de servidores para abrir la interfaz de usuario antigua de Duplicati (`/ngax/`) en una nueva pestaña.

<br/><br/>

:::note
 Todos los nombres de productos, logotipos y marcas registradas son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.
:::
