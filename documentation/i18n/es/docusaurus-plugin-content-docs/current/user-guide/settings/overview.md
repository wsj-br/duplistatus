# Vista general {/* #overview */}

La página de Configuración ofrece una interfaz unificada para configurar todos los aspectos de **duplistatus**. Puedes acceder a ella haciendo clic en el botón <IconButton icon="lucide:settings" /> **Configuración** en la [Barra de Herramientas de la Aplicación](../overview.md#application-toolbar). Ten en cuenta que los usuarios regulares verán un menú simplificado con menos opciones en comparación con los administradores.

## Vista de Administrador {/* #administrator-view */}

Los administradores ven todas las configuraciones disponibles.

<table>
  <tr>
    <td>
      ![Barra lateral de Configuración - Vista de Administrador](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notificaciones</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notificaciones de Copia de Seguridad</a>: Configurar ajustes de notificación por copia de seguridad</li>
            <li><a href="backup-monitoring-settings.md">Monitoreo de Copias de Seguridad</a>: Configurar la detección y alertas de copias de seguridad vencidas</li>
            <li><a href="daily-summary-settings.md">Resumen Diario</a>: Instantánea diaria opcional que reemplaza los correos electrónicos al destinatario predeterminado (los destinos adicionales continúan)</li>
            <li><a href="notification-templates.md">Plantillas</a>: Personalizar las plantillas de mensajes de notificación</li>
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
            <li><a href="server-settings.md">Servidores</a>: Gestionar las configuraciones del servidor Duplicati</li>
            <li><a href="display-settings.md">Configuración de visualización</a>: Configurar tema, rango de tiempo del gráfico, estilo del gráfico, configuración regional, intervalo de actualización automática, orden de clasificación de tarjetas y día de inicio de la semana</li>
            <li><a href="duplicati-versions.md">Versiones de Duplicati</a>: Ver las versiones de lanzamiento de Duplicati en caché y configurar el programa de verificación de versiones</li>
            <li><a href="database-maintenance.md">Mantenimiento de base de datos</a>: Realizar la limpieza de la base de datos (solo administrador)</li>
            <li><a href="api-keys-settings.md">Claves de API</a>: Gestionar claves con ámbito y protección de APIs externas (solo administrador)</li>
            <li><a href="ip-allowlist-settings.md">Lista de IPs permitidas</a>: Restringir la interfaz de administración y las APIs externas (solo administrador)</li>
            <li><a href="user-management-settings.md">Usuarios</a>: Gestionar cuentas de usuario (solo administrador)</li>
            <li><a href="audit-logs-viewer.md">Registro de auditoría</a>: Ver los registros de auditoría del sistema</li>
            <li><a href="audit-logs-retention.md">Retención de Registro de Auditoría</a>: Configurar la retención de registros de auditoría (solo administrador)</li>
            <li><a href="application-logs-settings.md">Registros de la Aplicación</a>: Ver y exportar los registros de la aplicación (solo administrador)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Vista de No Administrador {/* #non-administrator-view */}

Los usuarios regulares ven un conjunto limitado de configuraciones.

<table>
  <tr>
    <td>
      ![Barra lateral de configuración - Vista de no administrador](../../assets/screen-settings-left-panel-non-admin.png)
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
            <li><a href="display-settings.md">Mostrar</a>: Configurar tema, rango de tiempo de gráfico, estilo de gráfico, configuración regional, intervalo de actualización automática, orden de clasificación de tarjetas y inicio de semana</li>
            <li><a href="duplicati-versions.md">Versiones de Duplicati</a>: Ver las versiones de lanzamiento en caché de duplicati (los cambios de programación son solo para administradores)</li>
            <li><a href="audit-logs-viewer.md">Registro de auditoría</a>: Ver los registros de auditoría del sistema (solo lectura)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Iconos de Estado {/* #status-icons */}

La barra lateral muestra iconos de estado junto a la configuración de integraciones **NTFY** y **Correo electrónico**:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Icono verde**: Tus configuraciones son válidas y están configuradas correctamente
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Icono amarillo**: Tus configuraciones no son válidas o no están configuradas

Cuando la configuración es inválida, las casillas correspondientes en la pestaña [Notificaciones de Copia de Seguridad](backup-notifications-settings.md) estarán atenuadas y desactivadas. Para más detalles, consulta las páginas de [Configuración de NTFY](ntfy-settings.md) y [Configuración de correo electrónico](email-settings.md).

<br/>

:::important
Un icono verde no significa necesariamente que las notificaciones estén funcionando correctamente. Siempre utiliza las funciones de prueba disponibles para confirmar que tus notificaciones están funcionando antes de confiar en ellas. 
:::

<br/>
