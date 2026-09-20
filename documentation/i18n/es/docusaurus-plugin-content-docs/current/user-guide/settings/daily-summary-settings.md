# Resumen Diario {/* #daily-summary */}

Resumen Diario es un modo opcional de notificación que envía **una** instantánea localizada de cada trabajo conocido de copia de seguridad a una hora local exacta. Mientras esté habilitado, los correos electrónicos de copia de seguridad y vencimientos al destinatario predeterminado de Correo Electrónico (Configuración → Correo electrónico → Correo electrónico del destinatario) se pausan. Los destinos adicionales de correo electrónico configurados en [Notificaciones de Copia de Seguridad](backup-notifications-settings.md) continúan recibiendo eventos coincidentes. Las notificaciones NTFY por trabajo continúan. Esas configuraciones permanecen almacenadas y se vuelven activas nuevamente tan pronto como se desactive el Resumen Diario.

La instantánea es el estado **actual** en el momento de envío (el último resultado para cada trabajo). No es un historial de las ejecuciones del día anterior.

![Configuración de Resumen Diario](../../assets/screen-settings-daily-summary.png)

## Requisitos {/* #requirements */}

- SMTP debe estar configurado. El correo electrónico se envía una vez, al **Sobrecribir destinatario SMTP** si uno está guardado, de lo contrario al destinatario SMTP desde [Configuración de correo electrónico](/user-guide/settings/email-settings).
- Verifique su configuración SMTP y asegúrese de que funcione antes de confiar en Resumen Diario.
- La entrega programada requiere el servicio cron. El despachador se activa una vez al día a la hora de envío UTC almacenada.

## Qué está incluido {/* #what-is-included */}

Los trabajos conocidos son la **última copia de seguridad observada** para cada servidor y nombre de copia de seguridad — el mismo conjunto que el panel y Configuración → Monitoreo de copias de seguridad.

Los contenedores de estado (Éxito, Advertencia, Error, Fatal, Desconocido) son mutuamente excluyentes y suman la cantidad total de trabajos. **Vencida** se cuenta por separado: un trabajo vencido exitoso sigue siendo Éxito y también vencido.

## Programación {/* #schedule */}

Elija una hora `HH:mm` exacta en su **zona horaria del navegador**. duplistatus almacena la programación como UTC y muestra ambos valores en la página (mismo patrón que **Versiones de Duplicati**). Los cambios en esta página se guardan automáticamente. La hora predeterminada de envío para nuevas instalaciones es **01:00 UTC**.

- Habilitar o cambiar la programación comienza en la próxima ocurrencia **futura**, nunca un envío sorpresa inmediato.
- La hora programada siempre envía cuando se activa la tarea cron. **Enviar resumen ahora**, un reintento o un envío anterior el mismo día no lo omite.

## URL del panel público {/* #public-dashboard-url */}

El **URL del panel público** opcional en esta página alimenta el marcador de posición `{duplistatus_link}` en los correos electrónicos de Resumen Diario. Utilice una URL `http://` o `https://` sin barra final. Déjelo vacío para omitir el enlace.

Cuando `DUPLISTATUS_PUBLIC_URL` está establecido en el entorno, sobreescribe la configuración guardada (ver [Variables de Entorno](/installation/environment-variables)).

## Sobrecribir destinatario SMTP {/* #override-smtp-recipient */}

El **Sobrecribir destinatario SMTP** opcional envía el Resumen Diario a una dirección diferente que el destinatario en la configuración de correo electrónico. Déjelo vacío para seguir usando ese valor predeterminado. El valor se almacena en la clave de configuración `daily_summary` (`smtpRecipient`) y se utiliza para envíos programados, **Enviar resumen ahora** y reintentos. Las API de envío aún no aceptan un destinatario en la solicitud.

## Comportamiento de reemplazo {/* #replacement-behaviour */}

Cuando Resumen Diario está activado:

- no se envían correos electrónicos de subida y vencimiento al destinatario predeterminado de correo electrónico
- los destinos adicionales de correo electrónico en Notificaciones de Copia de Seguridad siguen recibiendo eventos coincidentes (vencido se considera una Advertencia para ese filtro)
- las notificaciones NTFY por trabajo continúan
- las marcas de tiempo vencidas no se avanzan cuando no se envió nada, por lo que las alertas vencidas pueden reanudarse inmediatamente cuando se desactiva el modo
- vista previa de plantilla, pruebas de transporte y **Enviar resumen ahora** aún funcionan

**Enviar resumen ahora** es una entrega adicional. No consume la próxima ocurrencia programada.

Las entregas programadas, **Enviar resumen ahora** y los reintentos se registran en el [registro de auditoría](audit-logs-viewer.md) como `daily_summary_sent` (Operaciones del Sistema). Guardar configuración es `daily_summary_updated` (Configuración).

## Plantillas {/* #templates */}

Edite la plantilla de correo electrónico del Resumen Diario (Markdown) en [Configuración → Plantillas](/user-guide/settings/notification-templates). El asunto predeterminado incluye `{summary_date}` más los recuentos de Éxito, Advertencia, Vencida, Error y Fatal para que la línea de bandeja de entrada resuma la instantánea. Las tareas vencidas pueden solaparse con los recuentos de estado. Los cuerpos de correo electrónico para Éxito, Advertencia/Error, Vencida y Resumen Diario usan todos Markdown. La plantilla predeterminada incluye `{duplistatus_link}` al final cuando una URL de panel público está configurada en esta página o mediante `DUPLISTATUS_PUBLIC_URL`.

**Generar vista previa** en esta página abre el mismo diálogo de vista previa que [Configuración → Plantillas](/user-guide/settings/notification-templates): asunto del correo electrónico más HTML del correo electrónico y texto plano. El HTML del correo electrónico sigue el tema claro u oscuro actual.
