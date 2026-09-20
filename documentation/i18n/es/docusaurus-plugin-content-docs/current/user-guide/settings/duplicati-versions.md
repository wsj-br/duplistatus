# Versiones de Duplicati {/* #duplicati-versions */}

Esta página muestra las últimas versiones publicadas de Duplicati almacenadas en la caché **duplistatus** y permite a los administradores configurar con qué frecuencia se actualizan esas versiones desde GitHub.

![Versiones de Duplicati](../../assets/screen-settings-duplicati-versions.png)

La caché es utilizada por el [panel](../dashboard.md#duplicati-server-version) y la página de [Servidores](server-settings.md) para colorear cada versión de servidor y mostrar si está actualizada o desactualizada.

## Versiones del canal más reciente {/* #latest-channel-versions */}

La tabla enumera la última versión almacenada en caché para cada canal de Duplicati:

| Canal          | Descripción                                                |
|:---------------|:-----------------------------------------------------------|
| **Estable**    | Última versión estable publicada                           |
| **Beta**       | Última versión beta publicada                              |
| **Experimental** | Última versión experimental publicada                    |
| **Canario**    | Última versión canario publicada                           |

La hora del último intento exitoso de actualización desde GitHub se muestra encima de la tabla. Si aún no se ha encontrado un canal o la caché nunca ha sido actualizada, la página indica que la versión no está disponible.

Los administradores pueden hacer clic en **Actualizar ahora** para obtener las últimas versiones inmediatamente. Esto no requiere que el servicio cron esté en ejecución. Si no se puede acceder a GitHub, **duplistatus** mantiene la caché anterior.

## Programación de comprobación de versiones {/* #version-check-schedule */}

**Mostrar versión en el panel** activa o desactiva la insignia de versión en la vista de tarjetas del [panel](../dashboard.md#duplicati-server-version). La tabla del panel siempre muestra la columna **Versión**. Está activada por defecto y también está disponible en [Configuración de visualización](display-settings.md). Esta es una preferencia de visualización por usuario.

Los administradores pueden elegir con qué frecuencia **duplistatus** comprueba GitHub en busca de nuevas versiones de Duplicati:

| Intervalo            | Ejecuciones                                                      |
|:---------------------|:-----------------------------------------------------------------|
| **Una vez al día**   | Una vez a la hora de inicio configurada                          |
| **Cada 12 horas**    | A la hora de inicio y 12 horas después                           |
| **Cada 6 horas**     | A la hora de inicio y cada 6 horas a partir de entonces          |

La hora de inicio se elige en la zona horaria de su navegador usando el mismo control de tiempo compacto que el Resumen Diario. Elija cualquier hora `HH:mm`. **duplistatus** almacena ese valor en UTC y el servicio cron ejecuta la comprobación en UTC.

Ejemplos:

- Diario con una hora de inicio de 06:00 se ejecuta a las 06:00.
- Diario con una hora de inicio de 06:30 se ejecuta a las 06:30.
- Cada 12 horas con una hora de inicio de 08:15 se ejecuta a las 08:15 y 20:15.
- Cada 6 horas con una hora de inicio de 02:45 se ejecuta a las 02:45, 08:45, 14:45 y 20:45.

Al iniciarse, **duplistatus** también actualiza la caché si es más antigua que el intervalo seleccionado (24 horas, 12 horas o 6 horas), incluyendo en una base de datos nueva vacía. Se vuelven a intentar fallos transitorios de GitHub como HTTP 504. Las actualizaciones fallidas mantienen las últimas versiones almacenadas en caché.

Los usuarios regulares pueden ver las versiones almacenadas en caché y el horario, y pueden activar o desactivar **Mostrar versión en el panel**. Solo los administradores pueden cambiar el intervalo, la hora de inicio o forzar una actualización.

:::note
Cambiar el horario escribe una entrada `duplicati_version_check_updated` en el [registro de auditoría](audit-logs-viewer.md). Las actualizaciones exitosas y fallidas de GitHub se registran como `duplicati_version_refresh` con un disparador de `startup`, `cron` o `manual`.
:::
