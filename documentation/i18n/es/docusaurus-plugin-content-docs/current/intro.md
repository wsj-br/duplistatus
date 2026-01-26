# Bienvenido a duplistatus {#welcome-to-duplistatus}

**duplistatus** - Otro [Panel de control](https://github.com/duplicati/duplicati) de Duplicati

## Características {#features}

- **Configuración rápida**: Implementación simple en contenedores, con imágenes disponibles en Docker Hub y GitHub.
- **Panel de control unificado**: Ver Estado de backup, historial y Detalles para Todos los Servidores en un solo lugar.
- **Monitoreo de backups retrasados**: Verificación automatizada y alertas para backups programados retrasados.
- **Visualización de datos y Logs**: Gráficos interactivos y recopilación automática de Logs de Servidores Duplicati.
- **Notificaciones y Alertas**: Soporte integrado de NTFY y Correo electrónico SMTP para Notificaciones de backup, incluidas Notificaciones de Backups retrasados.
- **Control de acceso de Usuario y Seguridad**: Sistema de autenticación seguro con control de acceso basado en Roles (Roles Admin/Usuario), políticas de Contraseña configurables, protección de bloqueo de cuenta y Gestión de usuarios integral.
- **Log de Auditoría**: Registro completo de Todos los cambios del Sistema y Acciones de Usuario con filtrado avanzado, capacidades de Exportar y períodos de retención configurables.
- **Visor de Logs de aplicación**: Interfaz solo para Admin para Ver, Buscar y Exportar Logs directamente desde la interfaz web con capacidades de monitoreo en tiempo real.

## Instalación {#installation}

La aplicación se puede implementar usando Docker, Portainer Stacks o Podman.
Ver Detalles en la [Guía de instalación](installation/installation.md).

- Si está actualizando desde una versión anterior, su base de datos será automáticamente [migrada](migration/version_upgrade.md) al nuevo esquema durante el proceso de actualización.

- Cuando use Podman (ya sea como un contenedor independiente o dentro de un pod), y si requiere Configuración de DNS personalizada (como para Tailscale MagicDNS, redes corporativas u otras Configuraciones de DNS personalizadas), puede especificar manualmente Servidores de DNS y dominios de Búsqueda. Ver la guía de instalación para más Detalles.

## Configuración de Servidores Duplicati (requerido) {#duplicati-servers-configuration-required}

Una vez que su servidor **duplistatus** esté en funcionamiento, debe Configurar sus servidores **Duplicati** para enviar Logs de backup a **duplistatus**, como se describe en la sección [Configuración de Duplicati](installation/duplicati-server-configuration.md) de la Guía de instalación. Sin esta Configuración, el Panel de control no recibirá datos de backup de sus Servidores Duplicati.

## Guía de Usuario {#user-guide}

Ver la [Guía de Usuario](user-guide/overview.md) para instrucciones detalladas sobre cómo Configurar y usar **duplistatus**, incluida la configuración inicial, configuración de características y solución de problemas.

## Capturas de pantalla {#screenshots}

### Panel de control {#dashboard}

![Panel de control](/img/screen-main-dashboard-card-mode.png)

### Historial de backups {#backup-history}

![server-detail](/img/screen-server-backup-list.png)

### Detalles de backup {#backup-details}

![backup-detail](/img/screen-backup-detail.png)

### Backups retrasados {#overdue-backups}

![Backups retrasados](/img/screen-overdue-backup-hover-card.png)

### Notificaciones retrasadas en su teléfono {#overdue-notifications-on-your-phone}

![Mensaje NTFY retrasado](/img/screen-overdue-notification.png)

## Referencia de API {#api-reference}

Ver la [Documentación de puntos finales de API](api-reference/overview.md) para Detalles sobre puntos finales disponibles, formatos de solicitud/respuesta y ejemplos.

## Desarrollo {#development}

Para instrucciones sobre cómo Descargar, cambiar o ejecutar el código, ver [Configuración de desarrollo](development/setup.md).

Este proyecto fue construido principalmente con Ayuda de IA. Para aprender cómo, ver [Cómo construí esta aplicación usando herramientas de IA](development/how-i-build-with-ai).

## Créditos {#credits}

- Primero que nada, gracias a Kenneth Skovhede por crear Duplicati, esta increíble herramienta de backup. Gracias también a Todos los colaboradores.

  💙 Si encuentra [Duplicati](https://www.duplicati.com) útil, considere apoyar al desarrollador. Más Detalles están disponibles en su sitio web o Página de GitHub.

- Icono SVG de Duplicati de https://dashboardicons.com/icons/duplicati

- Icono SVG de Notify de https://dashboardicons.com/icons/ntfy

- Icono SVG de GitHub de https://github.com/logos

> [!NOTA]
> Todos los nombres de productos, marcas registradas y marcas registradas son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.

## Licencia {#license}

El proyecto está licenciado bajo la [Licencia Apache 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**

