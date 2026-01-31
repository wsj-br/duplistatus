---
translation_last_updated: '2026-01-31T00:51:29.250Z'
source_file_mtime: '2026-01-31T00:23:03.813Z'
source_file_hash: ccb921e081ad2c50
translation_language: es
source_file_path: user-guide/troubleshooting.md
---
# Solución de problemas {#troubleshooting}

### Panel de control no se carga {#dashboard-not-loading}
- Verificar si el contenedor se está ejecutando: `docker ps`
- Verificar que el puerto 9666 sea accesible
- Verificar los logs del contenedor: `docker logs duplistatus`

### No Backup Data {#no-backup-data}
- Verificar la configuración del servidor Duplicati
- Verificar la conectividad de red entre servidores
- Revisar los logs de duplistatus para errores
- Asegurar que los trabajos de backup se estén ejecutando

### Notificaciones no funcionan {#notifications-not-working}
- Verificar la configuración de notificaciones
- Verificar la conectividad del servidor NTFY (si utiliza NTFY)
- Probar la configuración de notificaciones
- Verificar los logs de notificaciones

### Nuevos Backups No Se Muestran {#new-backups-not-showing}

Si ve advertencias del servidor Duplicati como `HTTP Response request failed for:` y `Failed to send message: System.Net.Http.HttpRequestException:`, y los nuevos backups no aparecen en el panel de control o en el historial de backups:

- **Verificar Configuración de Duplicati**: Confirmar que Duplicati esté configurado correctamente para enviar datos a **duplistatus**. Verificar la configuración de URL HTTP en Duplicati.
- **Verificar Conectividad de Red**: Asegurar que el servidor Duplicati pueda conectarse al servidor **duplistatus**. Confirmar que el puerto sea correcto (por defecto: `9666`).
- **Revisar Logs de Duplicati**: Verificar errores de solicitud HTTP en los logs de Duplicati.

### Notificaciones No Funcionan (Detallado) {#notifications-not-working-detailed}

Si las notificaciones no se están enviando ni recibiendo:

- **Verificar Configuración NTFY**: Asegúrese de que la URL NTFY y el tema sean correctos. Utilice el botón `Enviar notificación de prueba` para probar.
- **Verificar conectividad de red**: Verifique que **duplistatus** pueda alcanzar su servidor NTFY. Revise la configuración del firewall si es aplicable.
- **Verificar Configuración de notificaciones**: Confirme que las notificaciones estén habilitadas para los backups relevantes.

### Versiones disponibles que no aparecen {#available-versions-not-appearing}

Si las versiones de backup no se muestran en el panel de control o en la página de detalles:

- **Verificar Configuración de Duplicati**: Asegúrese de que `send-http-log-level=Information` y `send-http-max-log-lines=0` estén configurados en las opciones avanzadas de Duplicati.

### Alertas de Backup Retrasado No Funcionan {#overdue-backup-alerts-not-working}

Si las notificaciones de backup retrasado no se están enviando:

- **Verificar Configuración de retrasos**: Confirmar que el monitoreo de backups retrasados esté habilitado para el backup. Verificar la configuración del intervalo esperado y la tolerancia.
- **Verificar Frecuencia de notificaciones**: Si se establece en `One time`, las alertas se envían solo una vez por evento de backup retrasado.
- **Verificar Servicio Cron**: Asegurar que el servicio cron que monitorea los backups retrasados se esté ejecutando correctamente. Verificar los logs de aplicación para errores. Verificar que el servicio cron sea accesible en el puerto configurado (por defecto: `8667`).

### Recopilar logs de backup no funciona {#collect-backup-logs-not-working}

Si la recopilación manual del registro de backup falla:

- **Verificar el acceso al servidor Duplicati**: Verifique que el nombre de host y el puerto del servidor Duplicati sean correctos. Confirme que el acceso remoto esté habilitado en Duplicati. Asegúrese de que la contraseña de autenticación sea correcta.
- **Verificar la conectividad de red**: Pruebe la conectividad desde **duplistatus** al servidor Duplicati. Confirme que el puerto del servidor Duplicati sea accesible (por defecto: `8200`).
  Por ejemplo, si está utilizando Docker, puede usar `docker exec -it <container-name> /bin/sh` para acceder a la línea de comandos del contenedor y ejecutar herramientas de red como `ping` y `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Verificar también la configuración de DNS dentro del contenedor (consulte más en [DNS Configuration for Podman Containers](../installation/installation.md#configuring-dns-for-podman-containers))

### Actualizar desde una versión anterior (anterior a 0.9.x) y no puedo iniciar sesión {#upgrade-from-an-earlier-version-09x-and-cant-login}

**duplistatus** desde la versión 0.9.x requiere autenticación de usuario. Una cuenta `admin` por defecto se crea automáticamente al instalar la aplicación por primera vez o al actualizar desde una versión anterior:
    - Nombre de usuario: `admin`
    - Contraseña: `Duplistatus09`

Puede crear cuentas de usuario adicionales en [Configuración > Usuarios](settings/user-management-settings.md) después del primer inicio de sesión.

### Contraseña de Admin Perdida o Bloqueado {#lost-admin-password-or-locked-out}

Si ha perdido su contraseña de administrador o ha sido bloqueado de su cuenta:

- **Usar Script de Recuperación de Admin**: Consulte la guía [Recuperación de Cuenta de Admin](admin-recovery.md) para obtener instrucciones sobre cómo recuperar el acceso de administrador en entornos Docker.
- **Verificar Acceso al Contenedor**: Asegúrese de tener acceso a Docker exec al contenedor para ejecutar el script de recuperación.

### Backup de base de datos y migración {#database-backup-and-migration}

Cuando migre desde versiones anteriores o cree un backup de base de datos:

**Si está ejecutando la versión 1.2.1 o posterior:**
- Utilice la función de backup de base de datos integrada en `Configuración → Mantenimiento de base de datos`
- Seleccione su formato preferido (.db o .sql) y haga clic en `Descargar Backup`
- El archivo de backup será descargado a su computadora
- Consulte [Mantenimiento de base de datos](settings/database-maintenance.md#database-backup) para obtener instrucciones detalladas

**Si está ejecutando una versión anterior a 1.2.1:**
- Deberá realizar un backup manual. Consulte la [Guía de Migración](../migration/version_upgrade.md#backing-up-your-database-before-migration) para obtener más información.

Si aún experimenta problemas, intente los siguientes pasos:

1.  **Inspeccionar Logs de aplicación**: Si utiliza Docker, ejecute `docker logs <container-name>` para revisar información detallada de errores.
2.  **Validar Configuración**: Verifique nuevamente todos los parámetros de configuración en su herramienta de gestión de contenedores (Docker, Portainer, Podman, etc.) incluyendo puertos, red y permisos.
3.  **Verificar Conectividad de Red**: Confirme que todas las conexiones de red sean estables.
4.  **Verificar Servicio Cron**: Asegúrese de que el servicio cron se esté ejecutando junto con la aplicación principal. Verifique los logs de ambos servicios.
5.  **Consultar Documentación**: Consulte la Guía de Instalación y el README para obtener más información.
6.  **Reportar Problemas**: Si el problema persiste, envíe un problema detallado en el [repositorio de GitHub de duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos Adicionales {#additional-resources}

- **Guía de Instalación**: [Guía de Instalación](../installation/installation.md)
- **Documentación de Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentación de API**: [Referencia de API](../api-reference/overview.md)
- **Repositorio de GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guía de Desarrollo**: [Guía de Desarrollo](../development/setup.md)
- **Esquema de Base de Datos**: [Documentación de Base de Datos](../development/database)

### Soporte {#support}
- **GitHub Issues**: [Reportar errores o solicitar funcionalidades](https://github.com/wsj-br/duplistatus/issues)
