# Resumen Diario {#daily-summary}

Resumen Diario es un modo de notificación opcional que envía **una** instantánea localizada de cada trabajo de copia de seguridad conocido a una hora local exacta. Mientras esté habilitado, los mensajes de **correo electrónico** individuales de copia de seguridad y vencidos se pausarán, incluyendo destinos de correo electrónico adicionales por trabajo. Las notificaciones NTFY por trabajo continúan. Esos ajustes se almacenan y se activan nuevamente tan pronto como se desactive el Resumen Diario.

La instantánea es el **estado actual** en el momento del envío (el último resultado para cada trabajo). No es un historial de las ejecuciones del día anterior.

![Configuración del Resumen Diario](../../assets/screen-settings-left-panel-admin.png)

## Requisitos {#requirements}

- SMTP debe estar configurado. El correo electrónico siempre se envía una vez al destinatario SMTP.
- La entrega programada requiere el servicio cron. El despachador verifica cada minuto en UTC cuando está en funcionamiento.

## ¿Qué se incluye? {#what-is-included}

Los trabajos conocidos son la unión de:

- la última copia de seguridad observada para cada servidor y nombre de copia de seguridad
- configuraciones por trabajo explícitas cuyo servidor aún existe

Un trabajo configurado que nunca ha enviado un informe se etiqueta como **No se recibió informe**. Los grupos de estado (Éxito, Advertencia, Error, Fatal, Desconocido, No se recibió informe) son mutuamente exclusivos y suman el recuento de trabajos. **Vencida** se cuenta por separado: un trabajo exitoso vencido sigue siendo Éxito y también vencido.

## Programación {#schedule}

Elija un `HH:mm` tiempo exacto en su **zona horaria del navegador**. duplistatus almacena el horario como UTC y muestra ambos valores en la Página (mismo patrón que **Versiones de Duplicati**). Los cambios en esta Página se guardan automáticamente.

- Habilitar o cambiar la programación comienza en la **próxima ocurrencia futura**, nunca un envío sorpresivo inmediato.
- Reiniciar más tarde el mismo día local aún captura después de la hora configurada.
- Los días completamente perdidos no se reproducen.
- Los tiempos perdidos en la transición de primavera se ejecutan en el primer minuto válido después del intervalo. Las horas repetidas en el otoño se envían una vez.

## URL del panel público {#public-dashboard-url}

La **URL del panel público** opcional en esta página alimenta el marcador `{duplistatus_link}` en los correos electrónicos de Resumen Diario. Utiliza una URL `http://` o `https://` sin barra diagonal al final. Déjalo vacío para omitir el enlace.

Cuando `DUPLISTATUS_PUBLIC_URL` está configurado en el entorno, anula la configuración guardada (ver [Variables de Entorno](/installation/environment-variables)).

## Comportamiento de reemplazo {#replacement-behaviour}

Cuando el Resumen Diario está activado:

- no se envían correos electrónicos de subida y vencidos
- las notificaciones NTFY por trabajo continúan
- las marcas de tiempo vencidas no avanzan, por lo que las alertas vencidas pueden reanudarse inmediatamente cuando se desactiva el modo
- la vista previa de la plantilla, las pruebas de transporte y **Enviar resumen ahora** siguen funcionando

**Enviar resumen ahora** es un envío adicional. No consume la próxima ocurrencia programada.

## Plantillas {#templates}

Edita la plantilla de correo electrónico de Resumen Diario (Markdown) en [Configuración → Plantillas](/user-guide/settings/notification-templates). Los cuerpos de correo electrónico para Éxito, Advertencia/Error, Vencida y Resumen Diario utilizan Markdown. La plantilla predeterminada incluye `{duplistatus_link}` al final cuando se configura una URL del panel público en esta página o a través de `DUPLISTATUS_PUBLIC_URL`.

**Generar vista previa** en esta página abre un diálogo con la instantánea actual. El HTML del correo electrónico sigue el tema claro u oscuro actual.
