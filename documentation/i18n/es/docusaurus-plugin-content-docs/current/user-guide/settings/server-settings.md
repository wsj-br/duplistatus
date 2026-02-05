---
translation_last_updated: '2026-02-05T19:08:55.107Z'
source_file_mtime: '2026-02-02T19:14:50.094Z'
source_file_hash: d5a3cd822d80561c
translation_language: es
source_file_path: user-guide/settings/server-settings.md
---
# Servidor {#server}

Puede configurar un nombre alternativo (alias) para sus servidores, una nota para describir su función y las direcciones web de sus servidores Duplicati aquí.

![server settings](../../assets/screen-settings-server.png)

| Configuración                   | Descripción                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nombre del servidor**         | Nombre del servidor configurado en el servidor Duplicati. Aparecerá un <IIcon2 icon="lucide:key-round" color="#42A5F5"/> si se ha establecido una contraseña para el servidor.            |
| **Alias**                       | Un apodo o nombre legible por humanos de su servidor. Al pasar el cursor sobre un alias, se mostrará su nombre; en algunos casos, para aclarar, mostrará el alias y el nombre entre corchetes. |
| **Nota**                        | Texto libre para describir la funcionalidad del servidor, lugar de instalación u otra información. Cuándo se configure, se mostrará junto al nombre o alias del servidor.                   |
| **Dirección de interfaz web (URL)** | Configure la URL para acceder a la interfaz de usuario del servidor Duplicati. Se admiten URLs `HTTP` y `HTTPS`.                                                                           |
| **Estado**                      | Mostrar los resultados de los logs de prueba o recopilación de backup                                                                                                                       |
| **Acciones**                    | Puede probar, abrir la interfaz Duplicati, recopilar logs y establecer una contraseña; consulte a continuación para más detalles.                                                          |

<br/>

:::note
Si la Dirección de interfaz web (URL) no está configurada, el botón <SvgIcon svgFilename="duplicati_logo.svg" /> 
estará deshabilitado en todas las páginas y el servidor no se mostrará en la lista [`Duplicati Configuration`](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/>.
:::

<br/>

## Acciones disponibles para cada servidor {#available-actions-for-each-server}

| Botón                                                                                                       | Descripción                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>                                                               | Probar la conexión al servidor Duplicati.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Abrir la interfaz web del servidor Duplicati en una nueva pestaña del navegador.         |
| <IconButton icon="lucide:download" />                                                                       | Recopilar logs de backup del servidor Duplicati.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; or <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Cambiar o establecer una contraseña para el servidor Duplicati a los backups recopilados. |

<br/>

:::info[IMPORTANTE]

Para proteger su seguridad, solo puede realizar las siguientes acciones:
- Establecer una contraseña para el servidor
- Eliminar (borrar) la contraseña completamente
 
La contraseña se almacena cifrada en la base de datos y nunca se muestra en la interfaz de usuario.
:::

<br/>

## Acciones disponibles para todos los servidores {#available-actions-for-all-servers}

| Botón                                                      | Descripción                                                    |
|:-----------------------------------------------------------|:---------------------------------------------------------------|
| <IconButton label="Guardar cambios" />                     | Guardar los cambios realizados en la configuración del servidor. |
| <IconButton icon="lucide:fast-forward" label="Probar todo"/>| Probar la conexión a todos los servidores Duplicati.           |
| <IconButton icon="lucide:import" label="Recopilar todo (#)"/>| Recopilar logs de backup de todos los servidores Duplicati.    |

<br/>
