# Bienvenido a duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Monitorea Múltiples Servidores [Duplicati](https://github.com/duplicati/duplicati) desde un Único Panel de Control

## Características {/* #features */}

- **Configuración Rápida**: Despliegue sencillo en contenedores, con imágenes disponibles en Docker Hub y GitHub.
- **Panel de Control Unificado**: Visualiza el estado de las copias de seguridad, historial, versión de Duplicati y detalles de todos los servidores en un solo lugar.
- **Monitoreo de Copias de Seguridad**: Verificación automatizada y alertas para copias de seguridad programadas vencidas.
- **Visualización de Datos y Registros**: Gráficos interactivos y recopilación automática de registros de servidores Duplicati.
- **Notificaciones y Alertas**: Soporte integrado para NTFY y correo electrónico SMTP para alertas de copia de seguridad, incluyendo notificaciones de copia de seguridad vencida.
- **Gestión de Usuarios**: Inicio de sesión con roles de Administrador y Usuario, políticas de contraseña configurables, bloqueo de cuentas y administración de usuarios.
- **Protección de Seguridad**: Protección adicional opcional, claves de API para cargas de Duplicati y widgets de Homepage (con límites de tamaño y velocidad de carga), listas de permitidos de IP independientes para la interfaz de administración y las APIs externas, protección anti-spoofing y guía de proxy inverso HTTPS.
- **Registro de Auditoría**: Registro completo de todos los cambios del sistema y acciones de los usuarios con filtros avanzados, capacidades de exportación y períodos de retención configurables.
- **Visor de Registros de Aplicación**: Interfaz solo para administradores para ver, buscar y exportar registros de la aplicación directamente desde la interfaz web con capacidades de monitoreo en tiempo real.
- **Soporte Multilingüe**: Interfaz y documentación disponibles en inglés, francés, alemán, español, portugués brasileño, hindi y chino simplificado.

## Instalación {/* #installation */}

La aplicación puede ser desplegada utilizando Docker, Portainer Stacks o Podman. 
Consulta los detalles en la [Guía de Instalación](installation/installation.md).

- Si estás actualizando desde una versión anterior, tu base de datos será automáticamente
  [migrada](migration/version_upgrade.md) al nuevo esquema durante el proceso de actualización.

- Cuando se utiliza Podman (ya sea como contenedor independiente o dentro de un pod), y si se requieren configuraciones DNS personalizadas 
(como para Tailscale MagicDNS, redes corporativas o otras configuraciones DNS personalizadas), puedes especificar manualmente 
los servidores DNS y dominios de búsqueda. Consulta la guía de instalación para más detalles.

## Configuración de Servidores Duplicati (Obligatoria) {/* #duplicati-servers-configuration-required */}

Una vez que tu servidor **duplistatus** esté en funcionamiento, necesitas configurar tus servidores **Duplicati** para 
enviar registros de copia de seguridad a **duplistatus**, como se detalla en la sección [Configuración de Duplicati](installation/duplicati-server-configuration.md) 
de la Guía de Instalación. Sin esta configuración, el panel no recibirá datos de copia de seguridad de tus servidores Duplicati.

## Guía del Usuario {/* #user-guide */}

Consulta la [Guía del Usuario](user-guide/overview.md) para obtener instrucciones detalladas sobre cómo configurar y utilizar **duplistatus**, incluyendo la configuración inicial, configuración de características y solución de problemas.

## Capturas de Pantalla {/* #screenshots */}

### Panel de Control {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Historial de Copias de Seguridad {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### Detalles de la Copia de Seguridad {/* #backup-details */}

![backup-detail](assets/screen-backup-detail.png)

### Copias de seguridad pendientes {/* #overdue-backups */}

![copias de seguridad pendientes](assets/screen-overdue-backup-hover-card.png)

### Notificaciones pendientes en tu teléfono {/* #overdue-notifications-on-your-phone */}

![mensaje pendiente de ntfy](/img/screen-overdue-notification.png)

## Referencia de API {/* #api-reference */}

Consulta la [Documentación de los puntos finales de la API](api-reference/overview.md) para obtener detalles sobre los puntos finales disponibles, los formatos de solicitud/respuesta y los ejemplos.

## Desarrollo {/* #development */}

Para obtener instrucciones sobre cómo descargar, cambiar o ejecutar el código, consulta [Configuración de desarrollo](development/setup.md).

Este proyecto se construyó principalmente con ayuda de IA. Para aprender cómo, consulta [Cómo construí esta aplicación usando herramientas de IA](development/how-i-build-with-ai).

## Créditos {/* #credits */}

- En primer lugar, gracias a Kenneth Skovhede por crear Duplicati, esta increíble herramienta de copia de seguridad. También gracias a todos los colaboradores.

💙 Si encuentras [Duplicati](https://www.duplicati.com) útil, por favor considera apoyar al desarrollador. Más detalles están disponibles en su sitio web o página de GitHub.

- Idea/implementación de claves de API y listas de permitidos de IP por `henmohr` en el problema [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Icono SVG de Duplicati de https://dashboardicons.com/icons/duplicati
- Icono SVG de ntfy de https://dashboardicons.com/icons/ntfy
- Icono SVG de GitHub de https://github.com/logos

:::note
 Todos los nombres de productos, logotipos y marcas registradas son propiedad de sus respectivos propietarios. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.
:::

## Licencia {/* #license */}

El proyecto está licenciado bajo la [Licencia Apache 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Nota sobre traducciones de la interfaz y la documentación:** Todos los idiomas de la interfaz y la documentación excepto el inglés (Reino Unido) se tradujeron con IA usando [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); el lenguaje puede ser impreciso o contener errores.

</small>
