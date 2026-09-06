# Resumen {#overview}

La página de Configuración ofrece una interfaz unificada para configurar todos los aspectos de **duplistatus**. Puedes acceder a ella haciendo clic en el botón **Configuración** <IconButton icon="lucide:settings" /> en la [Barra de herramientas de la aplicación](../overview.md#application-toolbar). Ten en cuenta que los usuarios regulares verán un menú simplificado con menos opciones en comparación con los administradores.

## Vista de Administrador {#administrator-view}

Los administradores ven todas las configuraciones disponibles.

<table>
  <tr>
    <td>
      ![Settings Sidebar - Admin View](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificaciones</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificaciones de Copia de Seguridad</a>: Configurar la configuración de notificaciones por cada copia de seguridad</li>
            <li><a href="backup-monitoring-settings.md">Monitoreo de copias de seguridad</a>: Configurar la detección y las alertas de copias de seguridad vencidas</li>
            <li><a href="daily-summary-settings.md">Resumen Diario</a>: Instantánea diaria opcional que sustituye a las notificaciones individuales de copia de seguridad y de vencimiento</li>
            <li><a href="notification-templates.md">Plantillas</a>: Personalizar las plantillas de mensajes de notificación</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integraciones</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Configurar el servicio de notificaciones push NTFY</li>
            <li><a href="email-settings.md">Correo electrónico</a>: Configurar las notificaciones por correo electrónico SMTP</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Sistema</strong>
          <ul>
            <li><a href="server-settings.md">Servidores</a>: Gestionar las configuraciones del servidor Duplicati</li>
            <li><a href="display-settings.md">Configuración de visualización</a>: Configurar el tema, el rango de tiempo de gráfico, el estilo de gráfico, la configuración regional, el intervalo de actualización automática, el orden de clasificación de las tarjetas y el inicio de la semana</li>
            <li><a href="duplicati-versions.md">Versiones de Duplicati</a>: Ver las versiones de lanzamiento de Duplicati almacenadas en caché y configurar el programa de comprobación de versiones</li>
            <li><a href="database-maintenance.md">Mantenimiento de base de datos</a>: Realizar la limpieza de la base de datos (solo administrador)</li>
            <li><a href="api-keys-settings.md">Claves de API</a>: Gestionar claves con alcance limitado y la protección de API externa (solo administrador)</li>
            <li><a href="ip-allowlist-settings.md">Lista de IPs permitidas</a>: Restringir la interfaz de administración y las APIs externas (solo administrador)</li>
            <li><a href="user-management-settings.md">Usuarios</a>: Gestionar las cuentas de usuario (solo administrador)</li>
            <li><a href="audit-logs-viewer.md">Registro de auditoría</a>: Ver los registros de auditoría del sistema</li>
            <li><a href="audit-logs-retention.md">Retención de Registro de Auditoría</a>: Configurar la retención del registro de auditoría (solo administrador)</li>
            <li><a href="application-logs-settings.md">Registros de la Aplicación</a>: Ver y exportar los registros de la aplicación (solo administrador)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Vista de No Administrador {#non-administrator-view}

Los usuarios regulares ven un conjunto limitado de configuraciones.

<table>
  <tr>
    <td>
      ![Barra lateral de Configuración - Vista de No Administrador](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificaciones</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificaciones de Copia de Seguridad</a>: Ver la configuración de notificaciones por copia de seguridad (solo lectura)</li>
            <li><a href="backup-monitoring-settings.md">Monitoreo de copias de seguridad</a>: Ver la configuración de copias de seguridad vencidas (solo lectura)</li>
            <li><a href="daily-summary-settings.md">Resumen Diario</a>: Ver la configuración de resumen diario (solo lectura)</li>
            <li><a href="notification-templates.md">Plantillas</a>: Ver las plantillas de notificaciones (solo lectura)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integraciones</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Ver la configuración de NTFY (solo lectura)</li>
            <li><a href="email-settings.md">Correo electrónico</a>: Ver la configuración de correo electrónico (solo lectura)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Sistema</strong>
          <ul>
            <li><a href="server-settings.md">Servidores</a>: Ver las configuraciones del servidor (solo lectura)</li>
            <li><a href="display-settings.md">Visualización</a>: Configurar tema, rango de tiempo de gráfico, estilo de gráfico, configuración regional, intervalo de actualización automática, orden de clasificación de tarjetas y inicio de semana</li>
            <li><a href="duplicati-versions.md">Versiones de Duplicati</a>: Ver las versiones de lanzamiento de Duplicati en caché (los cambios de programación son solo para administradores)</li>
            <li><a href="audit-logs-viewer.md">Registro de auditoría</a>: Ver los registros de auditoría del sistema (solo lectura)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Iconos de Estado {#status-icons}

La barra lateral muestra iconos de estado junto a las configuraciones de integración **NTFY** y **Correo electrónico**:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Icono verde**: Sus configuraciones son válidas y están configuradas correctamente
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Icono amarillo**: Sus configuraciones no son válidas o no están configuradas

Cuando la configuración no es válida, las casillas de verificación correspondientes en la pestaña [Notificaciones de backup](backup-notifications-settings.md) aparecerán atenuadas y deshabilitadas. Para más detalles, consulte las páginas [Configuración de NTFY](ntfy-settings.md) y [Configuración de correo electrónico](email-settings.md).

<br/>

:::important
Un icono verde no significa necesariamente que las notificaciones estén funcionando correctamente. Utilice siempre las funciones de prueba disponibles para confirmar que sus notificaciones están funcionando antes de depender de ellas.
:::

<br/>
