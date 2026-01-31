---
translation_last_updated: '2026-01-31T00:51:29.195Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: 07586afae4356ecc
translation_language: es
source_file_path: user-guide/settings/ntfy-settings.md
---
# NTFY {#ntfy}

NTFY es un [servicio de notificaciones](https://github.com/binwiederhier/ntfy) de [código abierto](https://github.com/binwiederhier/ntfy) simple que puede enviar notificaciones push a su teléfono o escritorio. Esta sección le permite configurar la conexión del servidor de notificaciones y la autenticación.

![Ntfy settings](/assets/screen-settings-ntfy.png)

| Configuración         | Descripción                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **URL NTFY**          | La URL de su servidor NTFY (por defecto es la pública `https://ntfy.sh/`).                                                                      |
| **Tema NTFY**        | Un identificador único para sus notificaciones. El sistema generará automáticamente un tema aleatorio si se deja vacío, o puede especificar el suyo propio. |
| **Token de Acceso NTFY** | Un token de acceso opcional para servidores NTFY autenticados. Deje este campo en blanco si su servidor no requiere autenticación.               |

<br/>

A <IIcon2 icon="lucide:message-square" color="green"/> icono verde junto a `NTFY` en la barra lateral significa que su configuración es válida. Si el icono es <IIcon2 icon="lucide:message-square" color="yellow"/> amarillo, su configuración no es válida.
Cuándo la configuración no es válida, las casillas de verificación de NTFY en la pestaña [`Notificaciones de Backup`](backup-notifications-settings.md) también estarán deshabilitadas.

## Acciones disponibles {#available-actions}

| Botón                                                                 | Descripción                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración" />                          | Guardar cualquier cambio realizado en la configuración de NTFY.                                              |
| <IconButton icon="lucide:send-horizontal" label="Enviar mensaje de prueba"/> | Enviar un mensaje de prueba a su servidor NTFY para verificar su configuración.                              |
| <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/>    | Mostrar un código QR que le permite configurar rápidamente su dispositivo móvil o de escritorio para notificaciones NTFY. |

## Configuración del dispositivo {#device-configuration}

Debe instalar la aplicación NTFY en su dispositivo antes de configurarla ([consulte aquí](https://ntfy.sh/)). Al hacer clic en el botón <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/> o al hacer clic derecho en el icono <SvgButton svgFilename="ntfy.svg" /> en la barra de herramientas de la aplicación, se mostrará un código QR. Al escanear este código QR, su dispositivo se configurará automáticamente con el tema NTFY correcto para las notificaciones.

<br/>

<br/>

:::caution
Si utiliza el servidor público `ntfy.sh` sin un token de acceso, cualquier persona que conozca el nombre de su tema puede ver sus notificaciones.

Para proporcionar un grado de privacidad, se genera un tema aleatorio de 12 caracteres, ofreciendo más de 3 sextillones (3.000.000.000.000.000.000.000) de combinaciones posibles, lo que dificulta su adivinación.

Para mejorar la seguridad, considere utilizar [autenticación por token de acceso](https://docs.ntfy.sh/config/#access-tokens) y [listas de control de acceso](https://docs.ntfy.sh/config/#access-control-list-acl) para proteger sus temas, o [alojar NTFY por su cuenta](https://docs.ntfy.sh/install/#docker) para tener control total.

⚠️ **Usted es responsable de asegurar sus temas de NTFY. Por favor, utilice este servicio bajo su propio criterio.**
:::

<br/>
<br/>

:::note
Todos los nombres de productos, marcas registradas y marcas comerciales son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.
:::
