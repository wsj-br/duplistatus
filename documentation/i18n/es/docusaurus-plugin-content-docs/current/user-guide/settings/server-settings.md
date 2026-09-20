# Servidor {/* #server */}

Puede configurar un nombre alternativo (alias) para sus servidores, una nota para describir su función y las direcciones web de sus servidores Duplicati aquí.

![configuración del servidor](../../assets/screen-settings-server.png)

| Configuración                   | Descripción                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nombre del servidor**         | Nombre del servidor configurado en el servidor Duplicati. Aparecerá un <IIcon2 icon="lucide:key-round" color="#42A5F5"/> si se establece una contraseña para el servidor.                                         |
| **Alias**                       | Un apodo o nombre legible por humanos de su servidor. Al pasar el cursor sobre un alias se mostrará su nombre; en algunos casos, para dejarlo claro, se mostrará el alias y el nombre entre paréntesis. |
| **Nota**                        | Texto libre para describir la funcionalidad del servidor, lugar de instalación o cualquier otra información. Cuando esté configurado, se mostrará junto al nombre o alias del servidor.                 |
| **Versión**                     | La versión de Duplicati del último registro de copia de seguridad, con el mismo color y descripción emergente que el [panel de control](../dashboard.md#duplicati-server-version). El texto atenuado indica actual o no disponible; el amarillo de advertencia indica obsoleto. |
| **Dirección de Interfaz Web (URL)** | Configure la URL para acceder a la interfaz de usuario del Servidor Duplicati. Se admiten tanto URLs `HTTP` como `HTTPS`.                                                                                           |
| **Estado**                      | Muestra los resultados de la prueba o recopilación de registros de copia de seguridad                                                                                                                                              |
| **Acciones**                    | Puede probar, abrir la interfaz de Duplicati, recopilar registros y establecer una contraseña; consulte más detalles a continuación.                                                                                         |

<br/>

:::note
Si la Dirección de Interfaz Web (URL) no está configurada, el botón <SvgIcon svgFilename="duplicati_logo.svg" /> 
estará desactivado en todas las páginas y el servidor no se mostrará en la lista [Configuración de Duplicati](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/>.
:::

<br/>

## Acciones disponibles para cada servidor {/* #available-actions-for-each-server */}

| Botón                                                                                                      | Descripción                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Probar"/>                                                               | Probar la conexión con el servidor Duplicati.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Abrir la interfaz web del servidor Duplicati en una nueva pestaña del navegador.         |
| <IconButton icon="lucide:download" />                                                                       | Recopilar registros de copia de seguridad del servidor Duplicati.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; o <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Cambiar o establecer una contraseña para el servidor Duplicati para recopilar copias de seguridad. |

<br/>

:::info[IMPORTANTE]

Para proteger su seguridad, solo puede realizar las siguientes acciones:
- Establecer una contraseña para el servidor
- Eliminar (borrar) completamente la contraseña
 
La contraseña se almacena cifrada en la base de datos y nunca se muestra en la interfaz de usuario.
:::

<br/>

## Acciones disponibles para todos los servidores {/* #available-actions-for-all-servers */}

| Botón                                                     | Descripción                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Guardar cambios" />                        | Guardar los cambios realizados en la configuración del servidor.   |
| <IconButton icon="lucide:fast-forward" label="Probar todos"/>  | Probar la conexión a todos los servidores Duplicati.   |
| <IconButton icon="lucide:import" label="Recopilar todo (#)"/> | Recopilar registros de copias de seguridad de todos los servidores Duplicati. |

<br/>
