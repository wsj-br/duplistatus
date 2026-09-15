# NTFY {/* #ntfy */}

[NTFY](https://github.com/binwiederhier/ntfy) es un servicio de notificaciones simple que puede enviar notificaciones push a tu teléfono o escritorio. Esta sección te permite configurar la conexión y autenticación de tu servidor de notificaciones.

![Configuración de NTFY](../../assets/screen-settings-ntfy.png)

| Configuración               | Descripción                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **URL de NTFY**          | La URL de tu servidor NTFY (por defecto, se usa el servidor público `https://ntfy.sh/`).                                                                      |
| **Tema de NTFY**        | Un identificador único para tus notificaciones. El sistema generará automáticamente un tema aleatorio si lo dejas vacío, o puedes especificar el tuyo propio. |
| **Token de acceso NTFY** | Un token de acceso opcional para servidores NTFY autenticados. Deja este campo en blanco si tu servidor no requiere autenticación.               |

<br/>

Un icono verde <IIcon2 icon="lucide:message-square" color="green"/> junto a **NTFY** en la barra lateral indica que tus configuraciones son válidas. Si el icono es <IIcon2 icon="lucide:message-square" color="yellow"/> amarillo, tus configuraciones no son válidas.
Cuando la configuración no es válida, las casillas de verificación de NTFY en la pestaña [`Backup Notifications`](backup-notifications-settings.md) también estarán desactivadas.

## Acciones Disponibles {/* #available-actions */}

| Botón                                                                | Descripción                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Guardar Configuración" />                                  | Guardar cualquier cambio realizado en la configuración de NTFY.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Enviar Mensaje de Prueba"/> | Enviar un mensaje de prueba a tu servidor NTFY para comprobar tu configuración.                                         |
| <IconButton icon="lucide:qr-code" label="Configurar Dispositivo"/>          | Mostrar un código QR que te permite configurar rápidamente tu dispositivo móvil o escritorio para notificaciones NTFY. |

## Configuración del Dispositivo {/* #device-configuration */}

Debes instalar la aplicación NTFY en tu dispositivo antes de configurarlo ([ver aquí](https://ntfy.sh/)). Haciendo clic en el botón <IconButton icon="lucide:qr-code" label="Configurar Dispositivo"/>, o haciendo clic derecho en el icono <SvgButton svgFilename="ntfy.svg" /> en la barra de herramientas de la aplicación, se mostrará un código QR. Escanear este código QR configurará automáticamente tu dispositivo con el tema de NTFY correcto para las notificaciones.

<br/>

<br/>

:::caution
Si usas el servidor público **ntfy.sh** sin un token de acceso, cualquiera con el nombre de tu tema puede ver tus
notificaciones. 
 
Para proporcionar un grado de privacidad, se genera un tema aleatorio de 12 caracteres, ofreciendo más de
3 sextillones (3,000,000,000,000,000,000,000) combinaciones posibles, lo que dificulta adivinarlo.

Para mejorar la seguridad, considera usar [autenticación con token de acceso](https://docs.ntfy.sh/config/#access-tokens) y [listas de control de acceso](https://docs.ntfy.sh/config/#access-control-list-acl) para proteger tus temas, o [autoalojar NTFY](https://docs.ntfy.sh/install/#docker) para tener control total.

⚠️ **Eres responsable de asegurar tus temas de NTFY. Por favor, usa este servicio bajo tu propia responsabilidad.**
:::

<br/>
<br/>

:::note
 Todos los nombres de productos, logotipos y marcas registradas son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.
:::
