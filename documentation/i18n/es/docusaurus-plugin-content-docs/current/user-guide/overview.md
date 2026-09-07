# Vista general {/* #overview */}

Bienvenido a la guía del usuario de duplistatus. Este documento completo proporciona instrucciones detalladas para usar duplistatus para monitorear y gestionar sus operaciones de copia de seguridad de Duplicati en múltiples servidores.

## ¿Qué es duplistatus? {/* #what-is-duplistatus */}

duplistatus es un potente panel de monitoreo diseñado específicamente para sistemas de copia de seguridad de Duplicati. Proporciona:

- Monitoreo centralizado de múltiples servidores de Duplicati desde una sola interfaz
- Seguimiento del estado en tiempo real de todas las operaciones de copia de seguridad
- Detección automática de copias de seguridad vencidas con alertas configurables
- Métricas completas y visualización del rendimiento de las copias de seguridad
- Sistema de notificaciones flexible a través de NTFY y correo electrónico
- Características opcionales de [fortalecimiento de seguridad](../installation/security-hardening.md)
- Soporte multilingüe (inglés, francés, alemán, español, portugués brasileño, hindi y chino simplificado).

## Instalación {/* #installation */}

Para requisitos previos e instrucciones detalladas de instalación, consulte la [Guía de Instalación](../installation/installation.md).

## Accediendo al Panel {/* #accessing-the-dashboard */}

Después de la instalación exitosa, acceda a la interfaz web de duplistatus siguiendo estos pasos:

1. Abra su navegador web preferido
2. Navegue a `http://your-server-ip:9666`
   - Reemplace `your-server-ip` con la dirección IP o el nombre de host real de su servidor duplistatus
   - El puerto predeterminado es `9666`
3. Se le presentará una página de inicio de sesión.

Utilice estas credenciales para el primer uso (o después de una actualización desde versiones anteriores a 0.9.x):
    - nombre de usuario: `admin`
    - contraseña: `Duplistatus09`

Seleccione el idioma de la interfaz de usuario en la esquina superior derecha <IconButton icon="lucide:languages" label="Idioma" />, o en <IconButton icon="lucide:user" label="nombre de usuario" /> después de iniciar sesión (ver abajo).

4. Después de iniciar sesión, el panel principal se mostrará automáticamente (sin datos en el primer uso)

## Vista general de la Interfaz de Usuario {/* #user-interface-overview */}

duplistatus proporciona un panel intuitivo para monitorear las operaciones de copia de seguridad de Duplicati en toda su infraestructura.

![Resumen del panel](../assets/screen-main-dashboard-card-mode.png)

La interfaz de usuario está organizada en varias secciones clave para proporcionar una experiencia de monitoreo clara y completa:

1. [Barra de herramientas de la aplicación](#application-toolbar): Acceso rápido a funciones y configuraciones esenciales
2. [Resumen del panel](dashboard.md#dashboard-summary): Estadísticas generales para todos los servidores monitoreados
3. Vista general de servidores: [Diseño de tarjetas](dashboard.md#cards-layout) o [diseño de tabla](dashboard.md#table-layout) que muestra el estado más reciente de todas las copias de seguridad, incluida la [versión del servidor Duplicati](dashboard.md#duplicati-server-version) del último registro de copia de seguridad recibido
4. [Detalles de vencimiento](dashboard.md#overdue-details): Advertencias visuales para copias de seguridad vencidas con información detallada al pasar el cursor
5. [Versiones de copia de seguridad disponibles](dashboard.md#available-backup-versions): Haga clic en el icono azul para ver las versiones de copia de seguridad disponibles en el destino
6. [Métricas de copia de seguridad](backup-metrics.md): Gráficos interactivos que muestran el rendimiento de la copia de seguridad a lo largo del tiempo
7. [Detalles del servidor](server-details.md): Lista completa de copias de seguridad registradas para servidores específicos, incluyendo estadísticas detalladas
8. [Detalles de la copia de seguridad](server-details.md#backup-details): Información detallada para copias de seguridad individuales, incluyendo registros de ejecución, advertencias y errores

## Barra de Herramientas de la Aplicación {/* #application-toolbar */}

La barra de herramientas de la aplicación proporciona acceso conveniente a funciones y configuraciones clave, organizadas para un flujo de trabajo eficiente.

![Barra de herramientas de la aplicación](../assets/duplistatus_toolbar.svg)

| Botón                                                                                                                                           | Descripción                                                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:search" /> &nbsp; Filtrar                                                                                           | Buscar y filtrar servidores por ID, URL o nombre del trabajo de copia de seguridad.                                                      |
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Actualizar pantalla                                                                                    | Ejecutar una actualización manual inmediata de todos los datos                                                                                                                                     |
| <IconButton label="Auto-refresh" />                                                                                                              | Activar o desactivar la funcionalidad de actualización automática. Configurar en [Configuración de visualización](settings/display-settings.md) <br/> _Haga clic derecho_ para abrir la página de Configuración de visualización                         |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; Abrir NTFY                                                                                            | Acceder al sitio web ntfy.sh para su tema de notificación configurado. <br/> _Haga clic derecho_ para mostrar un código QR para configurar su dispositivo para recibir notificaciones de duplistatus.               |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Configuración de Duplicati](duplicati-configuration.md)       | Abrir la interfaz web del servidor Duplicati seleccionado <br/> _Haga clic derecho_ para abrir la interfaz de usuario heredada de Duplicati (`/ngax`) en una nueva pestaña                                                              |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Recopilar registros](collect-backup-logs.md)                                   | Conectar a servidores Duplicati y recuperar registros de copia de seguridad <br/> _Haga clic derecho_ para recopilar registros de todos los servidores configurados                                                                       |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Configuración](settings/backup-notifications-settings.md) | Configurar notificaciones, monitoreo, servidor SMTP y plantillas de notificación                                                                                                               |
| <IconButton icon="lucide:user" label="username" />                                                                                               | Mostrar el usuario conectado, tipo de usuario (`Admin`, `User`), haga clic para el menú de usuario (incluye selección de idioma). Ver más en [Gestión de usuarios](settings/user-management-settings.md)               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Guía del usuario                                                                    | Abrir la [Guía del usuario](overview.md) en la sección relevante a la página que está viendo actualmente. El tooltip muestra "Ayuda para [Nombre de la página]" para indicar qué documentación se abrirá. |

### Menú de Usuario {/* #user-menu */}

Al hacer clic en el botón de usuario se abre un menú desplegable con opciones específicas del usuario. Las opciones del menú difieren según si ha iniciado sesión como administrador o como usuario regular. Ambos roles pueden cambiar el idioma de la interfaz a través del submenú **Idioma**. El idioma seleccionado se guarda por usuario en este navegador (no como configuración del sistema), por lo que diferentes cuentas pueden mantener diferentes idiomas. Idiomas admitidos: inglés, francés, alemán, español, portugués brasileño, hindi y chino simplificado.

<table>
  <tr>
    <th>Administrador</th>
    <th>Usuario Regular</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}>![Menú de Usuario - Admin](../assets/screen-user-menu-admin.png)</td>
    <td style={{verticalAlign: 'top'}}>![Menú de Usuario - Usuario](../assets/screen-user-menu-user.png)</td>
  </tr>
</table>

## Configuración Esencial {/* #essential-configuration */}

1. Configura tus [servidores de duplicati](../installation/duplicati-server-configuration.md) para enviar mensajes de registro de copias de seguridad a duplistatus (obligatorio).
2. Recopila registros de copias de seguridad iniciales – utiliza la función [Recopilar registros de copias de seguridad](collect-backup-logs.md) para poblar la base de datos con datos históricos de copias de seguridad de todos tus servidores de duplicati. Esto también actualiza automáticamente los intervalos de monitoreo de copias de seguridad según la configuración de cada servidor.
3. Configura los ajustes del servidor – establece alias y notas del servidor en [Configuración → Servidor](settings/server-settings.md) para hacer que tu panel de control sea más informativo.
4. Configura los ajustes de NTFY – establece notificaciones a través de NTFY en [Configuración → NTFY](settings/ntfy-settings.md).
5. Configura la configuración de correo electrónico – establece notificaciones por correo electrónico en [Configuración → Correo electrónico](settings/email-settings.md).
6. Configura las notificaciones de copia de seguridad – establece notificaciones por copia de seguridad o por servidor en [Configuración → Notificaciones de Copia de Seguridad](settings/backup-notifications-settings.md).
7. Opcionalmente restringe el acceso – crea [claves de API](settings/api-keys-settings.md) y/o [listas de permitidos de IP](settings/ip-allowlist-settings.md) si deseas proteger `/api/upload` y la interfaz de administración. Ambos están desactivados por defecto.

<br/>

:::info[IMPORTANTE]
Recuerda configurar los servidores de duplicati para enviar registros de copias de seguridad a duplistatus, como se detalla en la sección [Configuración de Duplicati](../installation/duplicati-server-configuration.md).
:::

<br/>

:::note
Todos los nombres de productos, logotipos y marcas comerciales son propiedad de sus respectivos propietarios. Los íconos y nombres se utilizan solo con fines de identificación y no implican respaldo.
:::

<small>

> **Nota sobre traducciones de la interfaz y la documentación:** Todos los idiomas de la interfaz y la documentación, excepto el inglés (Reino Unido), se tradujeron con IA utilizando [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); el vocabulario puede ser impreciso o contener errores.

</small>
