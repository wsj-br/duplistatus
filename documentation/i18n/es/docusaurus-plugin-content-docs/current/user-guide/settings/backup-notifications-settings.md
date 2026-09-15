# Notificaciones de Copia de Seguridad {/* #backup-notifications */}

Utilice esta configuración para enviar notificaciones cuando se reciba un [nuevo registro de copia de seguridad](../../installation/duplicati-server-configuration.md).

![Alertas de copia de seguridad](../../assets/screen-settings-notifications.png)

La tabla de notificaciones de copia de seguridad está organizada por servidor. El formato de visualización depende de cuántas copias de seguridad tenga un servidor:
- **Múltiples copias de seguridad**: Muestra una fila de encabezado del servidor con filas individuales de copia de seguridad debajo de él. Haga clic en el encabezado del servidor para expandir o contraer la lista de copias de seguridad.
- **Una sola copia de seguridad**: Muestra una **fila combinada** con un borde izquierdo azul, mostrando:
  - **Nombre del servidor : Nombre de copia de seguridad** si no se ha configurado un alias de servidor, o
  - **Alias del servidor (Nombre del servidor) : Nombre de copia de seguridad** si está configurado.

Esta página tiene una función de guardado automático. Cualquier cambio que realice se guardará automáticamente.

Cuando **Resumen Diario** está habilitado, los correos electrónicos al destinatario predeterminado de correo electrónico se suprimen. Los destinos adicionales de correo electrónico en esta página continúan recibiendo eventos coincidentes. La configuración de esta página se preserva y vuelve a estar activa cuando se desactiva el Resumen Diario. Consulte [Resumen Diario](daily-summary-settings.md).

<br/>

## Filtrar {/* #filter */}

Utilice el campo **Filtrar por Nombre de Servidor** en la parte superior de la página para encontrar rápidamente copias de seguridad específicas por nombre de servidor o alias. La tabla filtrará automáticamente para mostrar solo las entradas coincidentes.

<br/>

## Configurar Configuración de Notificaciones por Copia de Seguridad {/* #configure-per-backup-notification-settings */}

| Configuración                  | Descripción                                               | Valor Predeterminado |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **Eventos de notificación**       | Configure cuándo enviar notificaciones para nuevos registros de copia de seguridad. | **Advertencias**    |
| **NTFY**                      | Habilite o deshabilite las notificaciones NTFY para esta copia de seguridad.     | **Habilitado**     |
| **Correo electrónico**                     | Habilite o deshabilite las notificaciones por correo electrónico para esta copia de seguridad.    | **Habilitado**    |

**Opciones de Eventos de Notificación:**

- **todos**: Enviar notificaciones para todos los eventos de copia de seguridad.
- **advertencias**: Enviar notificaciones para advertencias y errores solo (predeterminado).
- **errores**: Enviar notificaciones para errores solo.
- **desactivado**: Desactivar notificaciones para nuevos registros de copia de seguridad para esta copia de seguridad.

<br/>

## Destinos Adicionales {/* #additional-destinations */}

Los destinos adicionales de notificación le permiten enviar notificaciones a direcciones de correo electrónico específicas o temas NTFY más allá de la configuración global. El sistema utiliza un modelo de herencia jerárquica donde las copias de seguridad pueden heredar la configuración predeterminada de su servidor, o anularla con valores específicos de la copia de seguridad.

La configuración de destinos adicionales se indica mediante iconos contextuales junto a los nombres de servidor y copia de seguridad:

- **Icono del servidor** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />: Aparece junto a los nombres de servidor cuando se configuran destinos adicionales predeterminados a nivel de servidor.

- **Icono de copia de seguridad** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> (azul): Aparece junto a los nombres de copia de seguridad cuando se configuran destinos adicionales personalizados (anulando los valores predeterminados del servidor).

- **Icono de copia de seguridad** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} /> (gris): Aparece junto a los nombres de copia de seguridad cuando la copia de seguridad está heredando destinos adicionales de los valores predeterminados del servidor.

Si no se muestra ningún icono, el servidor o la copia de seguridad no tiene destinos adicionales configurados.

![Destinos adicionales a nivel de servidor](../../assets/screen-settings-notifications-server.png)

### Predeterminados a nivel de servidor {/* #server-level-defaults */}

Puede configurar destinos adicionales predeterminados a nivel de servidor que todas las copias de seguridad de ese servidor heredarán automáticamente.

1. Navegue a [Configuración → Notificaciones de Copia de Seguridad](backup-notifications-settings.md).
2. La tabla está agrupada por servidor, con filas de encabezado de servidor distintas que muestran el nombre del servidor, el alias y el número de copias de seguridad.
   - **Nota**: Para servidores con solo una copia de seguridad, se muestra una fila fusionada en lugar de un encabezado de servidor separado. No se pueden configurar los predeterminados del servidor directamente desde las filas fusionadas. Si necesita configurar los predeterminados del servidor para un servidor con una sola copia de seguridad, puede hacerlo agregando temporalmente otra copia de seguridad a ese servidor, o las Destinos adicionales de la copia de seguridad heredarán automáticamente de cualquier predeterminado del servidor existente.
3. Haga clic en cualquier lugar de una fila de servidor para expandir la sección **Destinos adicionales predeterminados para este servidor**.
4. Configure los siguientes ajustes predeterminados:
   - **Evento de notificación**: Elija qué eventos desencadenan notificaciones a los destinos adicionales (**todos**, **advertencias**, **errores**, o **desactivado**).
   - **Correos electrónicos adicionales**: Ingrese una o más direcciones de correo electrónico (separadas por comas) que recibirán notificaciones para todas las copias de seguridad de este servidor. Haga clic en el botón de icono <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> para enviar un correo electrónico de prueba a las direcciones del campo.
   - **Tema NTFY adicional**: Ingrese un nombre de tema NTFY personalizado donde se publicarán las notificaciones para todas las copias de seguridad de este servidor. Haga clic en el botón de icono <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> para enviar una notificación de prueba al tema, o haga clic en el botón de icono <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> para mostrar un código QR del tema para configurar su dispositivo para recibir notificaciones.

**Gestión de Predeterminados del Servidor:**

- **Sincronizar a todos**: Borra todas las anulaciones de copia de seguridad, haciendo que todas las copias de seguridad hereden de los predeterminados del servidor.
- **Limpiar todo**: Borra todos los destinos adicionales de los predeterminados del servidor y todas las copias de seguridad, manteniendo la estructura de herencia.

### Configuración por copia de seguridad {/* #per-backup-configuration */}

Las copias de seguridad individuales heredan automáticamente los predeterminados del servidor, pero puede anularlos para trabajos de copia de seguridad específicos.

1. Haga clic en cualquier lugar de una fila de copia de seguridad para expandir su sección **Destinos adicionales**.
2. Configure los siguientes ajustes:
   - **Evento de notificación**: Elija qué eventos desencadenan notificaciones a los destinos adicionales (**todos**, **advertencias**, **errores**, o **desactivado**).
   - **Correos electrónicos adicionales**: Ingrese una o más direcciones de correo electrónico (separadas por comas) que recibirán notificaciones además del destinatario global. Haga clic en el botón de icono <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> para enviar un correo electrónico de prueba a las direcciones del campo.
   - **Tema NTFY adicional**: Ingrese un nombre de tema NTFY personalizado donde se publicarán las notificaciones además del tema predeterminado. Haga clic en el botón de icono <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> para enviar una notificación de prueba al tema, o haga clic en el botón de icono <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> para mostrar un código QR del tema para configurar su dispositivo para recibir notificaciones.

**Indicadores de Herencia:**

- **Icono de enlace** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> en azul: Indica que el valor se hereda de los predeterminados del servidor. Hacer clic en el campo creará una anulación para editar.
- **Icono de enlace roto** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> en azul: Indica que el valor ha sido anulado. Haga clic en el icono para revertir a la herencia.

**Comportamiento de Destinos Adicionales:**

- Las notificaciones se envían tanto a la configuración global como a los destinos adicionales cuando están configurados.
- La configuración del evento de notificación para los destinos adicionales es independiente de la configuración principal del evento de notificación.
- Si los destinos adicionales están configurados en **desactivado**, no se enviarán notificaciones a esos destinos, pero las notificaciones principales seguirán funcionando según los ajustes principales.
- Las alertas **vencidas** se cuentan como una **advertencia** para el filtro de eventos de notificación adicionales: se envían cuando el evento es **todos** o **advertencias**, y no cuando es **errores** o **desactivado**. El mismo filtro se aplica a los temas NTFY adicionales.
- Cuando una copia de seguridad hereda de los valores predeterminados del servidor, cualquier cambio en los valores predeterminados del servidor se aplicará automáticamente a esa copia de seguridad (a menos que se haya anulado).
- Mientras [Resumen Diario](daily-summary-settings.md) esté habilitado, los destinos de correo electrónico adicionales aún reciben eventos coincidentes; solo el destinatario de correo electrónico predeterminado se suprime.

<br/>

## Edición masiva {/* #bulk-edit */}

Puede editar la configuración de destinos adicionales para varias copias de seguridad a la vez utilizando la función de edición masiva. Esto es especialmente útil cuando necesita aplicar los mismos destinos adicionales a muchos trabajos de copia de seguridad.

![Diálogo de edición masiva](../../assets/screen-settings-notifications-bulk.png)

1. Navegue a [Configuración → Notificaciones de Copia de Seguridad](backup-notifications-settings.md).
2. Utilice las casillas de verificación en la primera columna para seleccionar las copias de seguridad o servidores que desea editar.
   - Utilice la casilla de verificación en la fila de encabezado para seleccionar o deseleccionar todas las copias de seguridad visibles.
   - Puede utilizar el filtro para reducir la lista antes de seleccionar.
3. Una vez seleccionadas las copias de seguridad, aparecerá una barra de acción masiva que mostrará el número de copias de seguridad seleccionadas.
4. Haga clic en **Edición masiva** para abrir el diálogo de edición.
5. Configure la configuración de destinos adicionales:
   - **Evento de notificación**: Establezca el evento de notificación para todas las copias de seguridad seleccionadas.
   - **Correos electrónicos adicionales**: Ingrese direcciones de correo electrónico (separadas por comas) para aplicar a todas las copias de seguridad seleccionadas.
   - **Tema NTFY adicional**: Ingrese un nombre de tema NTFY para aplicar a todas las copias de seguridad seleccionadas.
   - Los botones de prueba están disponibles en el diálogo de edición masiva para verificar las direcciones de correo electrónico y los temas NTFY antes de aplicarlos a varias copias de seguridad.
6. Haga clic en **Guardar** para aplicar la configuración a todas las copias de seguridad seleccionadas.

**Borrado masivo:**

Para eliminar todos los ajustes de destinos adicionales de las copias de seguridad seleccionadas:

1. Seleccione las copias de seguridad que desea borrar.
2. Haga clic en **Borrado masivo** en la barra de acción masiva.
3. Confirme la acción en el cuadro de diálogo.

Esto eliminará todas las direcciones de correo electrónico adicionales, los temas NTFY y el evento de notificación para las copias de seguridad seleccionadas. Después de borrar, las copias de seguridad volverán a heredar de los valores predeterminados del servidor (si están configurados).

<br/>
