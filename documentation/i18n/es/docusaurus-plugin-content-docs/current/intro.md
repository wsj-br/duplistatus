# Bienvenido a duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Monitorear Múltiples Servidores [Duplicati](https://github.com/duplicati/duplicati) desde un único panel de control

## Características {/* #features */}

- **Configuración Rápida**: Despliegue sencillo mediante contenedores, con imágenes disponibles en Docker Hub y GitHub.
- **Panel Unificado**: Vea el estado de las copias de seguridad, historial, versión de Duplicati y detalles de todos los servidores en un solo lugar.
- **Monitoreo de Copias de Seguridad**: Verificación automatizada y alertas para copias de seguridad programadas vencidas.
- **Visualización de Datos y Registros**: Gráficos interactivos y recopilación automática de registros desde servidores Duplicati.
- **Notificaciones y Alertas**: Soporte integrado para NTFY y correo electrónico SMTP para alertas de copias de seguridad, incluyendo notificaciones de copias de seguridad vencidas.
- **Gestión de Usuarios**: Acceso con roles de Administrador y Usuario, políticas de contraseña configurables, bloqueo de cuentas y administración de usuarios.
- **Refuerzo de Seguridad**: Protección adicional opcional, claves de API para subidas a Duplicati y widgets de Homepage (con límites de tamaño y tasa de subida), listas blancas de IP independientes para la interfaz de administración y las APIs externas, protección contra suplantación y guía para proxy inverso HTTPS.
- **Registro de Auditoría**: Registro completo de todos los cambios en el sistema y acciones de usuario con filtros avanzados, capacidades de exportación y períodos de retención configurables.
- **Visor de Registros de Aplicación**: Interfaz exclusiva para administradores para ver, buscar y exportar registros de aplicación directamente desde la interfaz web con capacidades de monitoreo en tiempo real.
- **Soporte Multilingüe**: Interfaz y documentación disponibles en inglés, francés, alemán, español, portugués brasileño, hindi y chino simplificado.

## Instalación {/* #installation */}

La aplicación puede desplegarse usando Docker, Portainer Stacks o Podman. 
Consulte los detalles en la [Guía de Instalación](installation/installation.md).

- Si está actualizando desde una versión anterior, su base de datos se migrará automáticamente
  [migrada](migration/version_upgrade.md) al nuevo esquema durante el proceso de actualización.

- Al usar Podman (ya sea como contenedor independiente o dentro de un pod), y si requiere configuraciones personalizadas de DNS 
(como para Tailscale MagicDNS, redes corporativas u otras configuraciones personalizadas de DNS), puede especificar manualmente 
servidores DNS y dominios de búsqueda. Consulte la guía de instalación para más detalles.

## Configuración de Servidores Duplicati (Obligatorio) {/* #duplicati-servers-configuration-required */}

Una vez que su servidor **duplistatus** esté operativo, debe configurar sus servidores **Duplicati** para 
enviar registros de copias de seguridad a **duplistatus**, como se describe en la sección [Configuración de Duplicati](installation/duplicati-server-configuration.md) 
de la Guía de Instalación. Sin esta configuración, el panel no recibirá datos de copia de seguridad de sus servidores Duplicati.

## Guía de Usuario {/* #user-guide */}

Consulte la [Guía de Usuario](user-guide/overview.md) para instrucciones detalladas sobre cómo configurar y usar **duplistatus**, incluyendo la configuración inicial, configuración de características y solución de problemas.

## Capturas de Pantalla {/* #screenshots */}

### Panel de Control {/* #dashboard */}

![panel de control](assets/screen-main-dashboard-card-mode.png)

### Historial de Copias de Seguridad {/* #backup-history */}

![detalle del servidor](assets/screen-server-backup-list.png)

### Detalles de la Copia de Seguridad {/* #backup-details */}

![detalle-de-copia-de-seguridad](assets/screen-backup-detail.png)

### Copias de seguridad vencidas {/* #overdue-backups */}

![copias de seguridad vencidas](assets/screen-overdue-backup-hover-card.png)

### Notificaciones vencidas en tu teléfono {/* #overdue-notifications-on-your-phone */}

![mensaje vencido de ntfy](/img/screen-overdue-notification.png)

## Referencia de API {/* #api-reference */}

Consulta la [documentación de puntos finales de API](api-reference/overview.md) para obtener detalles sobre los puntos finales disponibles, formatos de solicitud y respuesta, y ejemplos.

## Desarrollo {/* #development */}

Para instrucciones sobre cómo descargar, modificar o ejecutar el código, consulta [Configuración de desarrollo](development/setup.md).

Este proyecto fue construido principalmente con ayuda de IA. Para aprender cómo, consulta [Cómo construyo esta aplicación usando herramientas de IA](development/how-i-build-with-ai).

## Créditos {/* #credits */}

- Ante todo, gracias a Kenneth Skovhede por crear Duplicati—esta increíble herramienta de copia de seguridad. Gracias también a todos los colaboradores.

💙 Si encuentras útil [Duplicati](https://www.duplicati.com), por favor considera apoyar al desarrollador. Más detalles están disponibles en su sitio web o página de GitHub.

- Idea/implementación de Claves de API y listas de IPs permitidas por `henmohr` en el issue [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Icono SVG de Duplicati de https://dashboardicons.com/icons/duplicati
- Icono SVG de ntfy de https://dashboardicons.com/icons/ntfy
- Icono SVG de GitHub de https://github.com/logos

:::note
 Todos los nombres de productos, logotipos y marcas comerciales son propiedad de sus respectivos dueños. Los iconos y nombres se utilizan únicamente con fines de identificación y no implican respaldo.
:::

## Licencia {/* #license */}

El proyecto está licenciado bajo la [Licencia Apache 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Nota sobre traducciones de interfaz y documentación:** Todos los idiomas de interfaz y documentación excepto inglés (Reino Unido) fueron traducidos con IA usando [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); la redacción puede ser imprecisa o contener errores.

</small>
