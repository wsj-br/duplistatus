---
translation_last_updated: '2026-01-31T00:51:29.213Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: de0fa34e2062bf57
translation_language: es
source_file_path: user-guide/settings/overview.md
---
# Resumen {#overview}

La página de Configuración ofrece una interfaz unificada para configurar todos los aspectos de **duplistatus**. Puede acceder a ella haciendo clic en el botón <IconButton icon="lucide:settings" /> `Configuración` en la [Barra de herramientas de la aplicación](../overview#application-toolbar). Tenga en cuenta que los usuarios normales verán un menú simplificado con menos opciones en comparación con los administradores.

## Vista del Administrador {#administrator-view}

Los administradores ven toda la configuración disponible.

<table>
  <tr>
    <td>
      <img src="/assets/screen-settings-left-panel-admin.png" alt="Settings Sidebar - Admin View" />
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificaciones</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificaciones de Backup</a>: Configurar opciones de notificación por backup</li>
            <li><a href="overdue-settings.md">Monitoreo de Retrasados</a>: Configurar detección de backups retrasados y alertas</li>
            <li><a href="notification-templates.md">Plantillas</a>: Personalizar plantillas de mensajes de notificación</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integraciones</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Configurar servicio de notificaciones push NTFY</li>
            <li><a href="email-settings.md">Correo electrónico</a>: Configurar notificaciones de correo electrónico SMTP</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Sistema</strong>
          <ul>
            <li><a href="server-settings.md">Servidores</a>: Gestionar configuraciones del servidor Duplicati</li>
            <li><a href="display-settings.md">Pantalla</a>: Configurar preferencias de visualización</li>
            <li><a href="database-maintenance.md">Mantenimiento de Base de Datos</a>: Realizar limpieza de base de datos (solo admin)</li>
            <li><a href="user-management-settings.md">Usuarios</a>: Gestionar cuentas de usuario (solo admin)</li>
            <li><a href="audit-logs-viewer.md">Log de Auditoría</a>: Ver logs de auditoría del sistema</li>
            <li><a href="audit-logs-retention.md">Retención del log de auditoría</a>: Configurar retención del log de auditoría (solo admin)</li>
            <li><a href="application-logs-settings.md">Logs de aplicación</a>: Ver y exportar logs de aplicación (solo admin)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Vista de no administrador {#non-administrator-view}

Los usuarios normales ven un conjunto limitado de configuración.

<table>
  <tr>
    <td>
      <img src="/assets/screen-settings-left-panel-non-admin.png" alt="Barra lateral de configuración - Vista de no administrador" />
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificaciones</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificaciones de Backup</a>: Ver configuración de notificaciones por backup (solo lectura)</li>
            <li><a href="overdue-settings.md">Monitoreo de Retrasados</a>: Ver configuración de backups retrasados (solo lectura)</li>
            <li><a href="notification-templates.md">Plantillas</a>: Ver plantillas de notificación (solo lectura)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integraciones</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Ver configuración de NTFY (solo lectura)</li>
            <li><a href="email-settings.md">Correo electrónico</a>: Ver configuración de correo electrónico (solo lectura)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Sistema</strong>
          <ul>
            <li><a href="server-settings.md">Servidores</a>: Ver configuraciones de servidor (solo lectura)</li>
            <li><a href="display-settings.md">Pantalla</a>: Configurar preferencias de visualización</li>
            <li><a href="audit-logs-viewer.md">Log de auditoría</a>: Ver logs de auditoría del sistema (solo lectura)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Iconos de Estado {#status-icons}

La barra lateral muestra iconos de estado junto a la **NTFY** y la configuración de integración de **Correo electrónico**:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Icono verde**: Su configuración es válida y está configurada correctamente
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Icono amarillo**: Su configuración no es válida o no está configurada

Cuando la configuración no es válida, las casillas de verificación correspondientes en la pestaña [`Notificaciones de backup`](backup-notifications-settings.md) aparecerán atenuadas y deshabilitadas. Para más detalles, consulte las páginas [Configuración de NTFY](ntfy-settings.md) y [Configuración de correo electrónico](email-settings.md).

<br/>

:::important
Un icono verde no necesariamente significa que las notificaciones estén funcionando correctamente. Siempre utilice las funciones de prueba disponibles para confirmar que sus notificaciones están funcionando antes de depender de ellas.
:::

<br/>
