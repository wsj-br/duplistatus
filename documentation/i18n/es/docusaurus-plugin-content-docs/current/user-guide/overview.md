---
translation_last_updated: '2026-01-31T00:51:29.089Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 01c00018de62e450
translation_language: es
source_file_path: user-guide/overview.md
---
# Resumen {#overview}

Bienvenido a la guía del usuario de duplistatus. Este documento completo proporciona instrucciones detalladas para utilizar duplistatus y monitorear y gestionar sus operaciones de backup de Duplicati en múltiples servidores.

## ¿Qué es duplistatus? {#what-is-duplistatus}

duplistatus es un potente panel de control de monitoreo diseñado específicamente para sistemas de backup de Duplicati. Proporciona:

- Monitoreo centralizado de múltiples servidores Duplicati desde una única interfaz
- Seguimiento de estado en tiempo real de todas las operaciones de backup
- Detección automatizada de backups retrasados con alertas configurables
- Métricas exhaustivas y visualización del rendimiento de backup
- Sistema flexible de notificaciones a través de NTFY y correo electrónico

## Instalación {#installation}

Para obtener información sobre los requisitos previos e instrucciones de instalación detalladas, consulte la [Guía de instalación](../installation/installation.md).

## Acceso al Panel de control {#accessing-the-dashboard}

Después de la instalación exitosa, acceda a la interfaz web de duplistatus siguiendo estos pasos:

1. Abra su navegador web preferido
2. Navegue a `http://your-server-ip:9666`
   - Reemplace `your-server-ip` con la dirección IP real o el nombre de host de su servidor duplistatus
   - El puerto por defecto es `9666`
3. Se le presentará una página de inicio de sesión. Utilice estas credenciales para el primer uso (o después de una actualización desde versiones anteriores a 0.9.x):
    - nombre de usuario: `admin`
    - contraseña: `Duplistatus09` 
4. Después de iniciar sesión, el panel de control principal se mostrará automáticamente (sin datos en el primer uso)

## Resumen de la Interfaz de Usuario {#user-interface-overview}

duplistatus proporciona un panel de control intuitivo para monitorear operaciones de backup de Duplicati en toda su infraestructura.

![Dashboard Overview](/assets/screen-main-dashboard-card-mode.png)

La interfaz de usuario está organizada en varias secciones clave para proporcionar una experiencia de monitoreo clara y completa:

1. [Barra de herramientas de la aplicación](#application-toolbar): Acceso rápido a funciones y configuraciones esenciales
2. [Resumen del Panel de control](dashboard.md#dashboard-summary): Estadísticas de resumen para todos los servidores monitoreados
3. Resumen de servidores: [Diseño de tarjetas](dashboard.md#cards-layout) o [diseño de tabla](dashboard.md#table-layout) que muestran el estado más reciente de todas las copias de seguridad
4. [Detalles de retrasos](dashboard.md#overdue-details): Advertencias visuales para backups retrasados con información detallada al pasar el cursor
5. [Versiones de backup disponibles](dashboard.md#available-backup-versions): Haga clic en el icono azul para ver las versiones de backup disponibles en el destino
6. [Métricas de Backup](backup-metrics.md): Gráficos interactivos que muestran el rendimiento del backup a lo largo del tiempo
7. [Detalles del Servidor](server-details.md): Lista completa de backups registrados para servidores específicos, incluidas estadísticas detalladas
8. [Detalles del Backup](server-details.md#backup-details): Información detallada para backups individuales, incluidos logs de ejecución, advertencias y errores

## Barra de herramientas de la aplicación {#application-toolbar}

La barra de herramientas de la aplicación proporciona acceso conveniente a funciones clave y Configuración, organizados para un flujo de trabajo eficiente.

![application toolbar](/img/duplistatus_toolbar.png)

| Botón                                                                                                                                        | Descripción                                                                                                                                                                  |
|----------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Actualizar pantalla                                                                            | Ejecutar una actualización manual inmediata de la pantalla de todos los datos                                                                                                 |
| <IconButton label="Auto-refresh" />                                                                                                          | Activar o desactivar la funcionalidad de actualización automática. Configurar en [Configuración de pantalla](settings/display-settings.md) <br/> _Clic derecho_ para abrir la página de Configuración de pantalla           |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; Abrir NTFY                                                                                        | Acceder al sitio web ntfy.sh para su tema de notificación configurado. <br/> _Clic derecho_ para mostrar un código QR para configurar su dispositivo para recibir notificaciones de duplistatus. |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Configuración de Duplicati](duplicati-configuration.md)       | Abrir la interfaz web del servidor Duplicati seleccionado <br/> _Clic derecho_ para abrir la interfaz heredada de Duplicati (`/ngax`) en una pestaña nueva                                                                                                                           |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Recopilar logs](collect-backup-logs.md)                                   | Conectar a los servidores Duplicati y recuperar logs de backup <br/> _Clic derecho_ para recopilar logs de todos los servidores configurados                                                         |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Configuración](settings/backup-notifications-settings.md) | Configurar notificaciones, monitoreo, servidor SMTP y plantillas de notificación                                                                                                 |
| <IconButton icon="lucide:user" label="username" />                                                                                           | Mostrar el usuario conectado, tipo de usuario (`Admin`, `Usuario`), hacer clic para el menú de usuario. Consulte más en [Gestión de usuarios](settings/user-management-settings.md)                               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Guía del usuario                                                                    | Abre la [Guía del usuario](overview.md) en la sección relevante de la página que está viendo actualmente. La información sobre herramientas muestra "Ayuda para [Nombre de página]" para indicar qué documentación se abrirá.                                                                           |

### Menú de Usuario {#user-menu}

Al hacer clic en el botón de usuario se abre un menú desplegable con opciones específicas del usuario. Las opciones del menú varían según si ha iniciado sesión como administrador o como usuario regular.

<table>
  <tr>
    <th>Administrador</th>
    <th>Usuario Regular</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}><img src="/assets/screen-user-menu-admin.png" alt="User Menu - Admin" /></td>
    <td style={{verticalAlign: 'top'}}><img src="/assets/screen-user-menu-user.png" alt="User Menu - User" /></td>
  </tr>
</table>

## Configuración Esencial {#essential-configuration}

1. Configura tus [servidores Duplicati](../installation/duplicati-server-configuration.md) para enviar mensajes de logs de backup a duplistatus (requerido).
2. Recopila logs de backup iniciales – utiliza la función [Recopilar logs de backup](collect-backup-logs.md) para completar la base de datos con datos históricos de backup de todos tus servidores Duplicati. Esto también actualiza automáticamente los intervalos de monitoreo de backups retrasados según la configuración de cada servidor.
3. Configura ajustes del servidor – establece alias de servidor y notas en [Configuración → Servidor](settings/server-settings.md) para hacer tu panel de control más informativo.
4. Configura ajustes de NTFY – establece notificaciones a través de NTFY en [Configuración → NTFY](settings/ntfy-settings.md).
5. Configura ajustes de correo electrónico – establece notificaciones por correo electrónico en [Configuración → Correo electrónico](settings/email-settings.md).
6. Configura notificaciones de backup – establece notificaciones por backup o por servidor en [Configuración → Notificaciones de backup](settings/backup-notifications-settings.md).

<br/>

:::info[IMPORTANTE]
Recuerde configurar los servidores de Duplicati para enviar logs de backup a duplistatus, como se describe en la sección [Configuración de Duplicati](../installation/duplicati-server-configuration.md).
:::

<br/>

:::note
Todos los nombres de productos, marcas registradas y marcas comerciales son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.
:::
