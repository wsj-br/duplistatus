# Bienvenido a duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Supervisar múltiples [servidores de Duplicati](https://github.com/duplicati/duplicati) desde un único Panel de control

## Características {/* #features */}

- **Configuración rápida**: Implementación sencilla en contenedores, con imágenes disponibles en Docker Hub y GitHub.
- **Panel unificado**: Visualiza el estado de las copias de seguridad, el historial, la versión de Duplicati y los detalles de todos los servidores en un solo lugar.
- **Monitoreo de copias de seguridad**: Comprobación automatizada y alertas para copias de seguridad programadas vencidas.
- **Visualización de datos y registros**: Gráficos interactivos y recopilación automática de registros de los servidores Duplicati.
- **Notificaciones y Alertas**: Soporte integrado de NTFY y SMTP para correo electrónico de alertas de copia de seguridad, incluyendo notificaciones de copias de seguridad vencidas.
- **Gestión de Usuarios**: Inicio de sesión con roles de Administrador y Usuario, políticas de contraseña configurables, bloqueo de cuenta y administración de usuarios.
- **Fortificación de Seguridad**: Protección adicional opcional, claves de API para subir a Duplicati y widgets de la página de inicio (con límites de tamaño y velocidad de subida), listas de permitidos de IP independientes para la interfaz de administración y las APIs externas, protección contra suplantación y guía de proxy inverso HTTPS.
- **Registro de Auditoría**: Registro completo de todos los cambios del sistema y acciones de los usuarios con filtrado avanzado, capacidades de exportación y períodos de retención configurables.
- **Visor de Registros de Aplicación**: Interfaz solo para administradores para ver, buscar y exportar registros de la aplicación directamente desde la interfaz web con capacidades de monitoreo en tiempo real.
- **Soporte Multilingüe**: Interfaz y documentación disponibles en inglés, francés, alemán, español, portugués brasileño, hindi y chino simplificado.

## Instalación {/* #installation */}

La aplicación puede implementarse usando Docker, Portainer Stacks o Podman. Consulte los detalles en la [Guía de Instalación](installation/installation.md).

- Si está actualizando desde una versión anterior, su base de datos será [migrada automáticamente](migration/version_upgrade.md) al nuevo esquema durante el proceso de actualización.

- Al usar Podman (como contenedor independiente o dentro de un pod), y si requiere configuraciones DNS personalizadas (como para Tailscale MagicDNS, redes corporativas u otras configuraciones DNS personalizadas), puede especificar manualmente servidores DNS y dominios de búsqueda. Consulte la guía de instalación para más detalles.

## Configuración de Servidores Duplicati (obligatorio) {/* #duplicati-servers-configuration-required */}

Una vez que su servidor **duplistatus** esté en marcha, debe configurar sus servidores **Duplicati** para enviar logs de backups a **duplistatus**, según lo descrito en la [sección de Configuración de Duplicati](installation/duplicati-server-configuration.md) de la Guía de Instalación. Sin esta configuración, el panel no recibirá datos de backups de sus servidores.

## Guía del Usuario {/* #user-guide */}

Consulte la [Guía de usuario](user-guide/overview.md) para instrucciones detalladas sobre cómo configurar y usar **duplistatus**, incluyendo configuración inicial, configuración de características y solución de problemas.

## Capturas de Pantalla {/* #screenshots */}

### Tablero {/* #dashboard */}

![panel de control](assets/screen-main-dashboard-card-mode.png)

### Historial de Copias de Seguridad {/* #backup-history */}

![detalle del servidor](assets/screen-server-backup-list.png)

### Detalles de la Copia de Seguridad {/* #backup-details */}

![detalle de la copia de seguridad](assets/screen-backup-detail.png)

### Copias de seguridad pendientes {/* #overdue-backups */}

![Copias de seguridad pendientes](assets/screen-overdue-backup-hover-card.png)

### Notificaciones vencidas en tu teléfono {/* #overdue-notifications-on-your-phone */}

![mensaje de NTFY de copia de seguridad vencida](/img/screen-overdue-notification.png)

## Referencia de API {/* #api-reference */}

Consulte la [Documentación de puntos de conexión de la API](api-reference/overview.md) para detalles sobre endpoints disponibles, formatos de solicitud/respuesta y ejemplos.

## Desarrollo {/* #development */}

Para obtener instrucciones sobre cómo descargar, modificar o ejecutar el código, consulte [Configuración de Desarrollo](development/setup.md).

Este proyecto fue construido principalmente con ayuda de IA. Para aprender cómo, consulte [Cómo construí esta aplicación usando herramientas de IA](development/how-i-build-with-ai).

## Créditos {/* #credits */}

- En primer lugar, gracias a Kenneth Skovhede por crear Duplicati—esta increíble herramienta de respaldo. Agradecimiento también a todos los contribuyentes.

💙 Si encuentra [Duplicati](https://www.duplicati.com) útil, por favor considere apoyar al desarrollador. Más detalles están disponibles en su sitio web o página de GitHub.

- Idea/implementación de Claves de API y Listas de Permitidos de IP por `henmohr` en el issue [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Icono SVG de Duplicati de https://dashboardicons.com/icons/duplicati
- Icono SVG de ntfy de https://dashboardicons.com/icons/ntfy
- Icono SVG de GitHub de https://github.com/logos

:::note
Todos los nombres de productos, logotipos y marcas comerciales son propiedad de sus respectivos propietarios. Los íconos y nombres se utilizan solo con fines de identificación y no implican respaldo.
:::

## Licencia {/* #license */}

El proyecto está bajo la [Apache License 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Nota sobre traducciones de la interfaz y la documentación:** Todos los idiomas de la interfaz y la documentación, excepto el inglés (Reino Unido), se tradujeron con IA utilizando [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); el vocabulario puede ser impreciso o contener errores.

</small>
