---
translation_last_updated: '2026-03-01T00:45:16.497Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: faafdd8670f3c3f8
translation_language: es
source_file_path: user-guide/settings/ntfy-settings.md
---
# NTFY {#ntfy}

[NTFY](https://github.com/binwiederhier/ntfy) es un servicio de notificaciones simple que puede enviar notificaciones push a su teléfono o escritorio. Esta sección le permite configurar la conexión del servidor de notificaciones y la autenticación.

![Ntfy settings](../../assets/screen-settings-ntfy.png)

| Configuración         | Descripción                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **URL NTFY**          | La URL de su servidor NTFY (por defecto es el público `https://ntfy.sh/`).                                                                      |
| **Tema NTFY**        | Un identificador único para sus notificaciones. El sistema generará automáticamente un tema aleatorio si se deja vacío, o puede especificar el suyo. |
| **Token de acceso NTFY** | Un token de acceso opcional para servidores NTFY autenticados. Deje este campo en blanco si su servidor no requiere autenticación.               |

<br/>

Un icono <IIcon2 icon="lucide:message-square" color="green"/> verde junto a **NTFY** en la barra lateral significa que su configuración es válida. Si el icono es <IIcon2 icon="lucide:message-square" color="yellow"/> amarillo, su configuración no es válida.
Cuando la configuración no es válida, las casillas de verificación de NTFY en la pestaña [`Notificaciones de backup`](backup-notifications-settings.md) también estarán deshabilitadas.

## Acciones disponibles {#available-actions}

| Botón                                                                | Descripción                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar configuración" />                                  | Guarde los cambios realizados en la configuración de NTFY.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Enviar mensaje de prueba"/> | Envíe un mensaje de prueba a su servidor NTFY para verificar su configuración.                                         |
| <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/>          | Muestre un código QR que le permite configurar rápidamente su dispositivo móvil o escritorio para notificaciones NTFY. |

## Configuración del dispositivo {#device-configuration}

Debe instalar la aplicación NTFY en su dispositivo antes de configurarlo ([consulte aquí](https://ntfy.sh/)). Al hacer clic en el botón <IconButton icon="lucide:qr-code" label="Configurar dispositivo"/> o hacer clic derecho en el icono <SvgButton svgFilename="ntfy.svg" /> en la barra de herramientas de la aplicación, se mostrará un código QR. Al escanear este código QR, su dispositivo se configurará automáticamente con el tema NTFY correcto para las notificaciones.

<br/>

<br/>

:::caution
Si utiliza el servidor público **ntfy.sh** sin un token de acceso, cualquier persona que conozca el nombre de su tema puede ver sus notificaciones.

Para proporcionar un grado de privacidad, se genera un tema aleatorio de 12 caracteres, ofreciendo más de 3 sextillones (3.000.000.000.000.000.000.000) de combinaciones posibles, lo que dificulta su adivinación.

Para mejorar la seguridad, considere utilizar [autenticación por token de acceso](https://docs.ntfy.sh/config/#access-tokens) y [listas de control de acceso](https://docs.ntfy.sh/config/#access-control-list-acl) para proteger sus temas, u [alojar NTFY por su cuenta](https://docs.ntfy.sh/install/#docker) para tener control total.

⚠️ **Usted es responsable de asegurar sus temas de NTFY. Por favor, utilice este servicio bajo su propio criterio.**
:::

<br/>
<br/>

:::note
Todos los nombres de productos, logotipos y marcas registradas son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.
:::
