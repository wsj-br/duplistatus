# Correo electrónico {/* #email */}

**duplistatus** admite el envío de notificaciones por correo electrónico a través de SMTP como alternativa o complemento a las notificaciones NTFY. La configuración de correo electrónico ahora se gestiona a través de la interfaz web con almacenamiento cifrado en la base de datos para mayor seguridad.

![Configuración de correo electrónico](../../assets/screen-settings-email.png)

| Configuración            | Descripción                                                      |
|:------------------------|:-----------------------------------------------------------------|
| **Servidor SMTP**    | Servidor SMTP de tu proveedor de correo electrónico (por ejemplo, `smtp.gmail.com`).      |
| **Puerto del servidor SMTP**    | Número de puerto (generalmente `25` para SMTP simple, `587` para STARTTLS o `465` para SSL/TLS directo). |
| **Tipo de conexión**     | Selecciona entre SMTP simple, STARTTLS o SSL/TLS directo. Por defecto, se establece en SSL/TLS directo para nuevas configuraciones. |
| **Autenticación SMTP** | Activa o desactiva la autenticación SMTP. Cuando está desactivada, los campos de nombre de usuario y contraseña no son necesarios. |
| **Nombre de usuario SMTP**       | Tu dirección de correo electrónico o nombre de usuario (requerido cuando la autenticación está activada). |
| **Contraseña SMTP**       | Tu contraseña de correo electrónico o contraseña específica de la aplicación (requerida cuando la autenticación está activada). |
| **Nombre del remitente**         | Nombre de visualización mostrado como remitente en las notificaciones por correo electrónico (opcional, por defecto "duplistatus"). |
| **Dirección de origen**        | Dirección de correo electrónico mostrada como remitente. Requerida para conexiones SMTP simples o cuando la autenticación está desactivada. Por defecto, se establece en el nombre de usuario SMTP cuando la autenticación está activada. Ten en cuenta que algunos proveedores de correo electrónico pueden anular el `From Address` con el `SMTP Server Username`. |
| **Correo electrónico del destinatario**     | La dirección de correo electrónico para recibir notificaciones. Debe ser una dirección de correo electrónico válida. |

Un icono verde <IIcon2 icon="lucide:mail" color="green"/> junto a **Correo electrónico** en la barra lateral indica que tus configuraciones son válidas. Si el icono es <IIcon2 icon="lucide:mail" color="yellow"/> amarillo, tus configuraciones no son válidas o no están configuradas.

El icono muestra verde cuando todos los campos requeridos están configurados: Servidor SMTP, Puerto del servidor SMTP, Correo electrónico del destinatario y, ya sea (Nombre de usuario SMTP + Contraseña cuando la autenticación es requerida) o (Dirección de origen cuando la autenticación no es requerida).

Cuando la configuración no está completamente configurada, se muestra una alerta amarilla informándote de que no se enviarán correos electrónicos hasta que la configuración de correo electrónico se complete correctamente. Las casillas de verificación de correo electrónico en la pestaña [Notificaciones de Copia de Seguridad](backup-notifications-settings.md) también se mostrarán en gris y con la etiqueta "(desactivado)".

<br/>

## Acciones Disponibles {/* #available-actions */}

| Botón                                                           | Descripción                                              |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="Guardar Configuración" />                             | Guardar los cambios realizados en la configuración de NTFY.              |
| <IconButton icon="lucide:mail" label="Enviar Correo Electrónico de Prueba"/>         | Envía un mensaje de correo electrónico de prueba utilizando la configuración SMTP. El correo electrónico de prueba muestra el nombre de host del servidor SMTP, puerto, tipo de conexión, estado de autenticación, nombre de usuario (si corresponde), correo electrónico del destinatario, dirección de origen, nombre del remitente y la marca de tiempo de la prueba. |
| <IconButton icon="lucide:trash-2" label="Eliminar Configuración SMTP"/> | Eliminar / Borrar la configuración SMTP. Desactivado mientras [Resumen Diario](daily-summary-settings.md) está activado, porque ese modo requiere correo electrónico. |

<br/>

:::info[IMPORTANTE]
  Debes usar el botón <IconButton icon="lucide:mail" label="Enviar Correo Electrónico de Prueba"/> para asegurarte de que tu configuración de correo electrónico funciona antes de confiar en ella para notificaciones.

 Aunque puedas ver un icono <IIcon2 icon="lucide:mail" color="green"/> verde y todo parezca configurado, es posible que no se envíen correos electrónicos.
 
 **duplistatus** solo verifica si tus configuraciones SMTP están completas, no si los correos electrónicos pueden ser entregados realmente.
:::

<br/>

## Proveedores SMTP comunes {/* #common-smtp-providers */}

**Gmail:**

- Host: `smtp.gmail.com`
- Puerto: `587` (STARTTLS) o `465` (SSL/TLS directo)
- Tipo de conexión: STARTTLS para el puerto 587, SSL/TLS directo para el puerto 465
- Nombre de usuario: Tu dirección de Gmail
- Contraseña: Usa una contraseña de aplicación (no tu contraseña regular). Genera una en https://myaccount.google.com/apppasswords
- Autenticación: Requerida

**Outlook/Hotmail:**

- Host: `smtp-mail.outlook.com`
- Puerto: `587`
- Tipo de conexión: STARTTLS
- Nombre de usuario: Tu dirección de correo de Outlook
- Contraseña: Tu contraseña de cuenta
- Autenticación: Requerida

**Yahoo Mail:**

- Host: `smtp.mail.yahoo.com`
- Puerto: `587`
- Tipo de conexión: STARTTLS
- Nombre de usuario: Tu dirección de correo de Yahoo
- Contraseña: Usa una contraseña de aplicación
- Autenticación: Requerida

### Prácticas recomendadas de seguridad {/* #security-best-practices */}

- Considera usar una cuenta de correo dedicada para notificaciones
 - Prueba tu configuración usando el botón "Enviar correo de prueba"
 - La configuración se cifra y se almacena de forma segura en la base de datos
 - **Usa conexiones cifradas** - STARTTLS y SSL/TLS directo se recomiendan para uso en producción
 - Las conexiones SMTP simples (puerto 25) están disponibles para redes locales de confianza pero no se recomiendan para uso en producción sobre redes no confiables
