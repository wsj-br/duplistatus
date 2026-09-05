# Versiones de Duplicati {#duplicati-versions}

Esta página muestra las últimas versiones de lanzamiento de Duplicati almacenadas en la caché **duplistatus** y permite a los administradores configurar con qué frecuencia se actualizan esas versiones desde GitHub.

![Versiones de Duplicati](../../assets/screen-settings-duplicati-versions.png)

La caché se utiliza en el [panel](../dashboard.md#duplicati-server-version) y en la página [Servidores](server-settings.md) para colorear cada versión del servidor y mostrar si está actualizada o desactualizada.

## Últimas versiones del canal {#latest-channel-versions}

La tabla enumera la última versión en caché para cada canal de Duplicati:

| Canal          | Descripción                                      |
|:---------------|:-------------------------------------------------|
| **Estable**     | Último lanzamiento estable                            |
| **Beta**       | Último lanzamiento beta                              |
| **Experimental** | Último lanzamiento experimental                    |
| **Canario**     | Último lanzamiento canario                            |

La última hora de actualización exitosa de GitHub se muestra encima de la tabla. Si un canal aún no se ha encontrado, o la caché nunca se ha actualizado, la página muestra que la versión no está disponible.

Los administradores pueden hacer clic en **Actualizar ahora** para obtener los últimos lanzamientos inmediatamente. Esto no requiere que el servicio cron esté en ejecución. Si no se puede acceder a GitHub, **duplistatus** mantiene la caché anterior.

## Programación de comprobación de versión {#version-check-schedule}

**Mostrar versión en el panel** activa o desactiva la insignia de versión en la vista de tarjetas del [panel](../dashboard.md#duplicati-server-version). La tabla del panel siempre muestra la columna **Versión**. Está activada por defecto y también está disponible en [Configuración de visualización](display-settings.md). Esta es una preferencia de visualización por usuario.

Los administradores pueden elegir con qué frecuencia **duplistatus** comprueba GitHub para nuevas versiones de Duplicati:

| Intervalo          | Ejecuta                                                      |
|:-------------------|:-------------------------------------------------------------|
| **Una vez al día**     | Una vez a la hora de inicio configurada                            |
| **Cada 12 horas** | A la hora de inicio y 12 horas después                         |
| **Cada 6 horas**  | A la hora de inicio y cada 6 horas después de eso               |

La hora de inicio se selecciona y se muestra en la zona horaria de su navegador. **duplistatus** almacena esa hora en UTC y el servicio cron ejecuta la comprobación en UTC.

Ejemplos:

- Diariamente con una hora de inicio de 06:00 se ejecuta a las 06:00.
- Cada 12 horas con una hora de inicio de 08:00 se ejecuta a las 08:00 y 20:00.
- Cada 6 horas con una hora de inicio de 02:00 se ejecuta a las 02:00, 08:00, 14:00 y 20:00.

Al iniciar, **duplistatus** también actualiza la caché si es más antigua que el intervalo seleccionado (24 horas, 12 horas o 6 horas). Las actualizaciones fallidas mantienen las últimas versiones en caché.

Los usuarios regulares pueden ver las versiones en caché y el horario, y pueden activar o desactivar **Mostrar versión en el panel**. Solo los administradores pueden cambiar el intervalo, la hora de inicio o forzar una actualización.

:::note
Cambiar el horario escribe una entrada `duplicati_version_check_updated` en el [registro de auditoría](audit-logs-viewer.md). Las actualizaciones de GitHub exitosas y fallidas se registran como `duplicati_version_refresh` con un desencadenante de `startup`, `cron` o `manual`.
:::
