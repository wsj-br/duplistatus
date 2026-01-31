---
translation_last_updated: '2026-01-31T00:51:29.226Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: 4ebf820e9494ced0
translation_language: es
source_file_path: user-guide/settings/server-settings.md
---
# Servidor {#server}

Puede configurar un nombre alternativo (alias) para sus servidores, una nota para describir su función y las direcciones web de sus servidores Duplicati aquí.

![server settings](/assets/screen-settings-server.png)

| Setting                         | Descripción                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nombre del servidor**                 | Nombre del servidor configurado en el servidor Duplicati. Un <IIcon2 icon="lucide:key-round" color="#42A5F5"/> aparecerá si se establece una contraseña para el servidor.                                         |
| **Alias**                       | Un apodo o nombre legible de su servidor. Al pasar el cursor sobre un alias, se mostrará su nombre; en algunos casos, para aclarar, mostrará el alias y el nombre entre corchetes. |
| **Nota**                        | Texto libre para describir la funcionalidad del servidor, lugar de instalación u otra información. Cuando se configure, se mostrará junto al nombre o alias del servidor.                 |
| **Dirección de interfaz web (URL)** | Configure la URL para acceder a la interfaz de usuario del servidor Duplicati. Se admiten URLs `HTTP` y `HTTPS`.                                                                                           |
| **Estado**                      | Mostrar los resultados de la prueba o recopilar logs de backup                                                                                                                                              |
| **Acciones**                     | Puede probar, abrir la interfaz Duplicati, recopilar logs y establecer una contraseña; consulte a continuación para obtener más detalles.                                                                                         |

<br/>

:::note
Si la Dirección de interfaz web (URL) no está configurada, el botón <SvgIcon svgFilename="duplicati_logo.svg" /> 
estará deshabilitado en todas las páginas y el servidor no se mostrará en la lista de [`Configuración de Duplicati`](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/>.
:::

<br/>

## Acciones disponibles para cada servidor {#available-actions-for-each-server}

| Botón                                                                                                       | Descripción                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>                                                               | Probar la conexión al servidor de Duplicati.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Abrir la interfaz web del servidor de Duplicati en una nueva pestaña del navegador.         |
| <IconButton icon="lucide:download" />                                                                       | Recopilar logs de backup del servidor de Duplicati.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; o <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Cambiar o establecer una contraseña para el servidor de Duplicati a los backups recopilados. |

<br/>

:::info[IMPORTANTE]

Para proteger su seguridad, solo puede realizar las siguientes acciones:
- Establecer una contraseña para el servidor
- Eliminar la contraseña por completo
 
La contraseña se almacena cifrada en la base de datos y nunca se muestra en la interfaz de usuario.
:::

<br/>

## Acciones disponibles para todos los servidores {#available-actions-for-all-servers}

| Botón                                                      | Descripción                                          |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Guardar cambios" />                     | Guardar los cambios realizados en la configuración del servidor.   |
| <IconButton icon="lucide:fast-forward" label="Probar todo"/>  | Probar la conexión a todos los servidores Duplicati.   |
| <IconButton icon="lucide:import" label="Recopilar todo (#)"/> | Recopilar logs de backup de todos los servidores Duplicati. |

<br/>
