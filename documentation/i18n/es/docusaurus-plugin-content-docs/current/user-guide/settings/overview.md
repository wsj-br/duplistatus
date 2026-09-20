# Vista general {/* #overview */}

La página de Configuración ofrece una interfaz unificada para configurar todos los aspectos de **duplistatus**. Puede acceder a ella haciendo clic en el botón <IconButton icon="lucide:settings" /> **Configuración** en la [Barra de herramientas de la aplicación](../overview.md#application-toolbar). Tenga en cuenta que los usuarios normales verán un menú simplificado con menos opciones en comparación con los administradores.

## Vista del Administrador {/* #administrator-view */}

Los administradores ven todas las configuraciones disponibles.

<table>
  <tr>
    <td>
      ![Barra lateral de configuración - Vista de administrador](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificaciones</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificaciones de Copia de Seguridad</a>: Configurar la configuración de notificación por copia de seguridad</li>
            <li><a href="backup-monitoring-settings.md">Monitoreo de copias de seguridad</a>: Configurar la detección y alertas de copias de seguridad vencidas</li>
            <li><a href="daily-summary-settings.md">Resumen Diario</a>: Instantánea opcional diaria que reemplaza los correos electrónicos al destinatario predeterminado (los destinos adicionales continúan)</li>
            <li><a href="notification-templates.md">Plantillas</a>: Personalizar plantillas de mensajes de notificación</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integraciones</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Configurar el servicio de notificaciones push NTFY</li>
            <li><a href="email-settings.md">Correo electrónico</a>: Configurar notificaciones por correo electrónico SMTP</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Sistema</strong>
          <ul>
            <li><a href="server-settings.md">Servidores</a>: Administrar configuraciones del servidor Duplicati</li>
            <li><a href="display-settings.md">Configuración de visualización</a>: Configurar tema, rango de tiempo de gráfico, estilo de gráfico, configuración regional, intervalo de actualización automática, orden de clasificación de tarjetas e inicio de semana</li>
            <li><a href="duplicati-versions.md">Versiones de Duplicati</a>: Ver versiones de lanzamiento de Duplicati almacenadas en caché y configurar la programación de verificación de versión</li>
            <li><a href="database-maintenance.md">Mantenimiento de base de datos</a>: Realizar limpieza de base de datos (solo administrador)</li>
            <li><a href="api-keys-settings.md">Claves de API</a>: Administrar claves con alcance y protección de API externa (solo administrador)</li>
            <li><a href="ip-allowlist-settings.md">Lista de IPs permitidas</a>: Restringir la interfaz de administración y las APIs externas (solo administrador)</li>
            <li><a href="user-management-settings.md">Usuarios</a>: Administrar cuentas de usuario (solo administrador)</li>
            <li><a href="audit-logs-viewer.md">Registro de auditoría</a>: Ver registros de auditoría del sistema</li>
            <li><a href="audit-logs-retention.md">Retención de Registro de Auditoría</a>: Configurar retención de registro de auditoría (solo administrador)</li>
            <li><a href="application-logs-settings.md">Registros de la Aplicación</a>: Ver y exportar registros de la aplicación (solo administrador)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Vista de No Administrador {/* #non-administrator-view */}

Los usuarios normales ven un conjunto limitado de configuraciones.

<table>
  <tr>
    <td>
      ![Barra lateral de Configuración - Vista de usuario no administrador](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificaciones</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificaciones de Copia de Seguridad</a>: Ver la configuración de notificaciones por copia de seguridad (solo lectura)</li>
            <li><a href="backup-monitoring-settings.md">Monitoreo de copias de seguridad</a>: Ver la configuración de copias de seguridad vencidas (solo lectura)</li>
            <li><a href="daily-summary-settings.md">Resumen Diario</a>: Ver la configuración del resumen diario (solo lectura)</li>
            <li><a href="notification-templates.md">Plantillas</a>: Ver las plantillas de notificación (solo lectura)</li>
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
            <li><a href="display-settings.md">Visualización</a>: Configurar tema, rango de tiempo de gráfico, estilo de gráfico, configuración regional, intervalo de actualización automática, orden de clasificación de tarjetas y día de inicio de semana</li>
            <li><a href="duplicati-versions.md">Versiones de Duplicati</a>: Ver las versiones de lanzamiento de Duplicati almacenadas en caché (los cambios de programación solo pueden hacerse desde la cuenta de administrador)</li>
            <li><a href="audit-logs-viewer.md">Registro de auditoría</a>: Ver los registros de auditoría del sistema (solo lectura)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Iconos de Estado {/* #status-icons */}

La barra lateral muestra iconos de estado junto a la configuración de integración **NTFY** y **Correo electrónico**:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Icono verde**: Su configuración es válida y está configurada correctamente
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Icono amarillo**: Su configuración no es válida o no está configurada

Cuando la configuración no es válida, las casillas de verificación correspondientes en la pestaña [Notificaciones de Copia de Seguridad](backup-notifications-settings.md) se atenuarán y desactivarán. Para más detalles, consulte las páginas [Configuración de NTFY](ntfy-settings.md) y [Configuración de Correo Electrónico](email-settings.md).

<br/>

:::important
Un icono verde no significa necesariamente que las notificaciones estén funcionando correctamente. Utilice siempre las funciones de prueba disponibles para confirmar que sus notificaciones están funcionando antes de depender de ellas.
:::

<br/>
