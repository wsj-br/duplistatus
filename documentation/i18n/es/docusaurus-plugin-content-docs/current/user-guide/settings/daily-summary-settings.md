# Resumen Diario {/* #daily-summary */}

El Resumen Diario es un modo de notificación opcional que envía **una** instantánea localizada de cada trabajo de copia de seguridad conocido a una hora exacta local. Mientras está habilitado, los correos electrónicos de copia de seguridad y los avisos de vencimiento al destinatario de correo electrónico predeterminado (Configuración → Correo electrónico → Correo electrónico del destinatario) se pausan. Los destinos adicionales de correo electrónico configurados en [Notificaciones de Copia de Seguridad](backup-notifications-settings.md) siguen recibiendo eventos coincidentes. Las notificaciones NTFY por trabajo continúan. Estos ajustes se mantienen almacenados y se activan nuevamente tan pronto como se desactiva el Resumen Diario.

La instantánea es el **estado actual** en el momento del envío (el último resultado para cada trabajo). No es un historial de las ejecuciones del día anterior.

![Configuración del Resumen Diario](../../assets/screen-settings-daily-summary.png)

## Requisitos {/* #requirements */}

- Debe configurarse SMTP. El correo electrónico se envía una vez, al **destinatario SMTP de sobreescritura** si se ha guardado, de lo contrario, al destinatario SMTP de la [Configuración de correo electrónico](/user-guide/settings/email-settings).
- Compruebe su configuración SMTP y asegúrese de que funcione antes de confiar en el Resumen Diario.
- La entrega programada requiere el servicio cron. El despachador se activa una vez al día a la hora de envío UTC almacenada.

## Qué está incluido {/* #what-is-included */}

Los trabajos conocidos son las **últimas copias de seguridad observadas** para cada servidor y nombre de copia de seguridad — el mismo conjunto que el panel y Configuración → Monitoreo de copias de seguridad.

Los grupos de estado (Éxito, Advertencia, Error, Fatal, Desconocido) son mutuamente excluyentes y suman el recuento de trabajos. **Vencida** se cuenta por separado: un trabajo exitoso vencido sigue siendo Éxito y también vencido.

## Cronograma {/* #schedule */}

Elija una hora exacta `HH:mm` en su **zona horaria del navegador**. duplistatus almacena el horario como UTC y muestra ambos valores en la página (mismo patrón que **Versiones de Duplicati**). Los cambios en esta página se guardan automáticamente. La hora de envío predeterminada para nuevas instalaciones es **01:00 UTC**.

- Habilitar o cambiar el horario comienza en la **próxima ocurrencia futura**, nunca un envío sorpresivo inmediato.
- La hora programada siempre se envía cuando se activa el trabajo cron. **Enviar resumen ahora**, un reintento o un envío anterior el mismo día no lo omite.

## URL del panel público {/* #public-dashboard-url */}

La **URL del panel público** opcional en esta página alimenta el marcador `{duplistatus_link}` en los correos electrónicos de Resumen Diario. Utiliza una URL `http://` o `https://` sin barra diagonal al final. Déjalo vacío para omitir el enlace.

Cuando `DUPLISTATUS_PUBLIC_URL` está configurado en el entorno, anula la configuración guardada (ver [Variables de Entorno](/installation/environment-variables)).

## Sobrecribir destinatario SMTP {/* #override-smtp-recipient */}

Opcional **Sobrecribir destinatario SMTP** envía el Resumen Diario a una dirección diferente a la del destinatario en la Configuración de correo electrónico. Déjelo vacío para seguir usando la Predeterminada. El valor se almacena en la clave de configuración `daily_summary` (`smtpRecipient`) y se utiliza para envíos programados, **Enviar resumen ahora** y reintentos. Las API de envío aún no aceptan un destinatario en la solicitud.

## Comportamiento de reemplazo {/* #replacement-behaviour */}

Cuando el Resumen Diario está activado:

- los correos electrónicos de carga y vencimiento al destinatario de correo electrónico predeterminado no se envían
- los destinos adicionales de correo electrónico en Notificaciones de Copia de Seguridad siguen recibiendo eventos coincidentes (los vencimientos se consideran una Advertencia para ese filtro)
- las notificaciones NTFY por trabajo continúan
- las marcas de tiempo de vencimiento no avanzan cuando no se envía nada, por lo que las alertas de vencimiento pueden reanudarse inmediatamente cuando se desactiva el modo
- la vista previa de la plantilla, las pruebas de transporte y **Enviar resumen ahora** siguen funcionando

**Enviar resumen ahora** es un envío adicional. No consume la próxima ocurrencia programada.

Las entregas programadas, **Enviar resumen ahora** y los reintentos se registran en el [registro de auditoría](audit-logs-viewer.md) como `daily_summary_sent` (Operaciones del sistema). Guardar la configuración es `daily_summary_updated` (Configuración).

## Plantillas {/* #templates */}

Edita la plantilla de correo electrónico de Resumen Diario (Markdown) en [Configuración → Plantillas](/user-guide/settings/notification-templates). Los cuerpos de correo electrónico para Éxito, Advertencia/Error, Vencida y Resumen Diario utilizan Markdown. La plantilla predeterminada incluye `{duplistatus_link}` al final cuando se configura una URL del panel público en esta página o a través de `DUPLISTATUS_PUBLIC_URL`.

**Generar vista previa** en esta página abre un diálogo con la instantánea actual. El HTML del correo electrónico sigue el tema claro u oscuro actual.
