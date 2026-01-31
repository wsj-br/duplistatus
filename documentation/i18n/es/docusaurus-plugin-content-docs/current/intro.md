---
translation_last_updated: '2026-01-31T00:51:28.846Z'
source_file_mtime: '2026-01-28T15:01:51.247Z'
source_file_hash: d9d6e23762c8524f
translation_language: es
source_file_path: intro.md
---
# Bienvenido a duplistatus {#welcome-to-duplistatus}

**duplistatus** - Monitoree Múltiples Servidores [Duplicati](https://github.com/duplicati/duplicati) desde un Único Panel de Control

## Características {#features}

- **Configuración rápida**: Implementación containerizada simple, con imágenes disponibles en Docker Hub y GitHub.
- **Panel de control unificado**: Vea el estado del backup, historial y detalles de todos los servidores en un solo lugar.
- **Monitoreo de backups retrasados**: Verificación automatizada y alertas para backups programados retrasados.
- **Visualización de datos y Logs**: Gráficos interactivos y recopilación automática de logs desde servidores Duplicati.
- **Notificaciones y Alertas**: Soporte integrado de NTFY y correo electrónico SMTP para alertas de backup, incluidas notificaciones de backups retrasados.
- **Control de acceso de usuarios y Seguridad**: Sistema de autenticación seguro con control de acceso basado en roles (roles Admin/Usuario), políticas de contraseña configurables, protección contra bloqueo de cuentas y gestión integral de usuarios.
- **Auditoría de registros**: Registro de auditoría completo de todos los cambios del sistema y acciones de usuarios con filtrado avanzado, capacidades de exportación y períodos de retención configurables.
- **Visor de Logs de aplicación**: Interfaz exclusiva para administradores para ver, buscar y exportar logs de aplicación directamente desde la interfaz web con capacidades de monitoreo en tiempo real.

## Instalación {#installation}

La aplicación puede implementarse utilizando Docker, Portainer Stacks o Podman. 
Consulte los detalles en la [Guía de instalación](installation/installation.md).

- Si está actualizando desde una versión anterior, su base de datos será automáticamente
[migrada](migration/version_upgrade.md) al nuevo esquema durante el proceso de actualización.

- Cuándo usar Podman (ya sea como contenedor independiente o dentro de un pod), y si requiere configuración de DNS personalizada (como para Tailscale MagicDNS, redes corporativas u otras configuraciones de DNS personalizadas), puede especificar manualmente servidores DNS y dominios de búsqueda. Consulte la guía de instalación para obtener más detalles.

## Configuración de Servidores Duplicati (Requerido) {#duplicati-servers-configuration-required}

Una vez que su servidor **duplistatus** esté en funcionamiento, debe configurar sus servidores **Duplicati** para enviar logs de backup a **duplistatus**, tal como se describe en la sección [Configuración de Duplicati](installation/duplicati-server-configuration.md) de la Guía de Instalación. Sin esta configuración, el panel de control no recibirá datos de backup de sus servidores Duplicati.

## Guía del Usuario {#user-guide}

Consulte la [Guía del Usuario](user-guide/overview.md) para obtener instrucciones detalladas sobre cómo configurar y utilizar **duplistatus**, incluida la configuración inicial, la configuración de funciones y la solución de problemas.

## Capturas de pantalla {#screenshots}

### Panel de control {#dashboard}

![dashboard](/assets/screen-main-dashboard-card-mode.png)

### Historial de backups {#backup-history}

![server-detail](/assets/screen-server-backup-list.png)

### Detalles del backup {#backup-details}

![backup-detail](/assets/screen-backup-detail.png)

### Backups retrasados {#overdue-backups}

![overdue backups](/assets/screen-overdue-backup-hover-card.png)

### Notificaciones retrasadas en su teléfono {#overdue-notifications-on-your-phone}

![ntfy overdue message](/assets/screen-overdue-notification.png)

## Referencia de API {#api-reference}

Consulte la [Documentación de Puntos de Acceso de API](api-reference/overview.md) para obtener detalles sobre los puntos de acceso disponibles, formatos de solicitud/respuesta y ejemplos.

## Desarrollo {#development}

Para obtener instrucciones sobre cómo descargar, cambiar o ejecutar el código, consulte [Development Setup](development/setup.md).

Este proyecto fue construido principalmente con ayuda de IA. Para aprender cómo, consulte [Cómo construí esta aplicación usando herramientas de IA](development/how-i-build-with-ai).

## Créditos {#credits}

- En primer lugar, gracias a Kenneth Skovhede por crear Duplicati, esta increíble herramienta de backup. También gracias a todos los colaboradores.

💙 Si encuentra útil [Duplicati](https://www.duplicati.com), considere apoyar al desarrollador. Hay más detalles disponibles en su sitio web o página de GitHub.

- Icono SVG de Duplicati desde https://dashboardicons.com/icons/duplicati
- Icono SVG de Notify desde https://dashboardicons.com/icons/ntfy
- Icono SVG de GitHub desde https://github.com/logos

>[!NOTE]
> Todos los nombres de productos, marcas comerciales y marcas registradas son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.

## Licencia {#license}

El proyecto está licenciado bajo la [Licencia Apache 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**
