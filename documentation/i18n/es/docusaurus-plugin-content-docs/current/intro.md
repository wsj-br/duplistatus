# Bienvenido a duplistatus

**duplistatus** - Otro panel de control para [Duplicati](https://github.com/duplicati/duplicati)

## Características

- **Configuración Rápida**: Implementación simple en contenedores, con imágenes disponibles en Docker Hub y GitHub.
- **Panel de Control Unificado**: Vea el estado de las copias de seguridad, historial y detalles de todos los servidores en un solo lugar.
- **Monitoreo de Copias Atrasadas**: Verificación automatizada y alertas para copias de seguridad programadas atrasadas.
- **Visualización de Datos y Registros**: Gráficos interactivos y recopilación automática de registros de los servidores Duplicati.
- **Notificaciones y Alertas**: Soporte integrado de NTFY y correo electrónico SMTP para alertas de copias de seguridad, incluyendo notificaciones de copias atrasadas.
- **Control de Acceso de Usuarios y Seguridad**: Sistema de autenticación seguro con control de acceso basado en roles (roles de Administrador/Usuario), políticas de contraseñas configurables, protección de bloqueo de cuentas y gestión integral de usuarios.
- **Registro de Auditoría**: Registro de auditoría completo de todos los cambios del sistema y acciones de usuarios con filtrado avanzado, capacidades de exportación y períodos de retención configurables.
- **Visor de Logs de aplicación**: Interfaz exclusiva para administradores para ver, buscar y exportar Logs de aplicación directamente desde la interfaz web con capacidades de monitoreo en tiempo real.

## Instalación

La aplicación puede implementarse usando Docker, Portainer Stacks o Podman.
Vea los detalles en la [Guía de Instalación](installation/installation.md).

- Si está actualizando desde una versión anterior, su base de datos será automáticamente
  [migrada](migration/version_upgrade.md) al nuevo esquema durante el proceso de actualización.

- Al usar Podman (ya sea como contenedor independiente o dentro de un pod), y si requiere configuraciones DNS personalizadas
  (como para Tailscale MagicDNS, redes corporativas u otras configuraciones DNS personalizadas), puede especificar manualmente
  servidores DNS y dominios de búsqueda. Consulte la guía de instalación para más detalles.

## Configuración de Servidores Duplicati (Requerido)

Una vez que su servidor **duplistatus** esté en funcionamiento, necesita configurar sus servidores **Duplicati** para
enviar registros de copias de seguridad a **duplistatus**, como se describe en la sección [Configuración de Duplicati](installation/duplicati-server-configuration.md)
de la Guía de Instalación. Sin esta configuración, el panel de control no recibirá datos de copias de seguridad de sus servidores Duplicati.

## Guía del Usuario

Consulte la [Guía del Usuario](user-guide/overview.md) para instrucciones detalladas sobre cómo configurar y usar **duplistatus**, incluyendo configuración inicial, configuración de características y solución de problemas.

## Capturas de Pantalla

### Panel de Control

![dashboard](/img/screen-main-dashboard-card-mode.png)

### Historial de Copias de Seguridad

![server-detail](/img/screen-server-backup-list.png)

### Detalles de Copia de Seguridad

![backup-detail](/img/screen-backup-detail.png)

### Copias de Seguridad Atrasadas

![overdue backups](/img/screen-overdue-backup-hover-card.png)

### Notificaciones de copias atrasadas en su teléfono

![ntfy overdue message](/img/screen-overdue-notification.png)

## Referencia de API

Consulte la [Documentación de Endpoints de API](api-reference/overview.md) para detalles sobre los endpoints disponibles, formatos de solicitud/respuesta y ejemplos.

## Desarrollo

Para instrucciones sobre cómo descargar, modificar o ejecutar el código, consulte [Configuración de Desarrollo](development/setup.md).

Este proyecto fue construido principalmente con ayuda de IA. Para aprender cómo, consulte [Cómo Construí esta Aplicación usando herramientas de IA](development/how-i-build-with-ai).

## Créditos

- Ante todo, gracias a Kenneth Skovhede por crear Duplicati—esta increíble herramienta de copias de seguridad. Gracias también a todos los colaboradores.

  💙 Si encuentra útil [Duplicati](https://www.duplicati.com), por favor considere apoyar al desarrollador. Más detalles están disponibles en su sitio web o página de GitHub.

- Icono SVG de Duplicati de https://dashboardicons.com/icons/duplicati

- Icono SVG de Notify de https://dashboardicons.com/icons/ntfy

- Icono SVG de GitHub de https://github.com/logos

> [!NOTE]
> Todos los nombres de productos, marcas comerciales y marcas registradas son propiedad de sus respectivos dueños. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.

## Licencia

El proyecto está licenciado bajo la [Licencia Apache 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**

