# Solución de problemas {#troubleshooting}

### Panel de control no se carga {#dashboard-not-loading}
- Verificar si el contenedor se está ejecutando: `docker ps`
- Verificar que el puerto 9666 sea accesible
- Verificar los logs del contenedor: `docker logs duplistatus`

### Sin datos de respaldo {#no-backup-data}
- Verificar la configuración del servidor Duplicati
- Verificar la conectividad de red entre servidores
- Revisar los registros de duplistatus para errores
- Asegúrese de que los trabajos de copia de seguridad estén en ejecución

### Las notificaciones no funcionan {#notifications-not-working}
- Verificar la configuración de notificaciones
- Verificar la conectividad del servidor NTFY (si se usa NTFY)
- Probar la configuración de notificaciones
- Revise los registros de notificaciones

### Las nuevas copias de seguridad no se muestran {#new-backups-not-showing}

Si ve advertencias del servidor Duplicati como `HTTP Response request failed for:` y `Failed to send message: System.Net.Http.HttpRequestException:`, y los nuevos backups no aparecen en el panel de control o en el historial de backups:

- **Comprobar Configuración de Duplicati**: Asegúrese de que Duplicati esté configurado correctamente para enviar JSON a **duplistatus**. En Duplicati 2.0.9.106 y posteriores, use `--send-http-json-urls` apuntando a `/api/upload`. En versiones anteriores de Duplicati, use `--send-http-url` con `--send-http-result-output-format=Json`. Consulte [Configuración del Servidor Duplicati](../installation/duplicati-server-configuration.md).
- **Comprobar Conectividad de Red**: Asegúrese de que el servidor Duplicati pueda conectarse al servidor **duplistatus**. Confirme que el puerto es correcto (predeterminado: `9666`).
- **HTTP 401**: Se requieren claves de API y la URL de subida no tiene una clave de ámbito de subida válida. Añada `?api_key=` como se describe en [Claves de API](settings/api-keys-settings.md).
- **HTTP 403**: El ámbito de la clave es incorrecto (una clave de lectura no puede subir), o el host de Duplicati no está en la [lista de IPs permitidas de la API externa](settings/ip-allowlist-settings.md).
- **HTTP 413**: El informe JSON es más grande que el límite de tamaño de subida (predeterminado 5 MB). Baje `--send-http-max-log-lines` o aumente el límite en Configuración → Claves de API.
- **HTTP 429**: Se superó el límite de velocidad de subida por IP. Espere `Retry-After`, o aumente los límites si muchos trabajos finalizan al mismo tiempo.
- **Revisar Registros de Duplicati**: Busque errores de solicitud HTTP en los registros de Duplicati.
- **Informe dual**: Si también envía informes de formulario a [Duplicati Monitoring](https://www.duplicati-monitoring.com/), un error o HTTP 500 de ese servicio puede detener a Duplicati de enviar el informe JSON a **duplistatus**. Las URLs de formulario se envían primero. Consulte [Informes a duplistatus y Duplicati Monitoring](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Servidores duplicados en el panel de control {#duplicate-servers-on-the-dashboard}

Si el mismo servidor aparece más de una vez en el panel, esto ocurre con mayor frecuencia después de [recopilar registros de copia de seguridad](collect-backup-logs.md), o después de reinstalar o actualizar el servidor Duplicati.

**Causas:**

- **`machine_id` cambiado**: Cuándo reinstala o actualiza Duplicati, el `machine_id` del servidor puede cambiar y **duplistatus** entonces lo trata como un servidor nuevo.
- **Error de la API de Duplicati**: En las versiones más recientes de Duplicati hay un error en el que algunos endpoints de la API mezclan el id de `identity` y `machine_id`. Esta incoherencia hace que **duplistatus** registre el mismo servidor con diferentes ID, generando duplicados.

**Solución alternativa:**

1.  En el **servidor Duplicati**, realice **una** de las siguientes acciones:
    - Edite los archivos `identity.txt` y `machineid.txt` para que ambos archivos contengan el **mismo** id; o
    - Abra **Duplicati → Configuración → Opciones avanzadas → Machine-id** y establezca un valor (se autocompleta; simplemente acepte el valor sugerido).
2.  **Reinicie** el servidor Duplicati para que el cambio surta efecto.
3.  En **duplistatus**, consolide las entradas duplicadas mediante [Configuración → Mantenimiento de base de datos → Combinar servidores duplicados](settings/database-maintenance.md#merge-duplicate-servers).

### Notificaciones No Funcionan (Detallado) {#notifications-not-working-detailed}

Si las notificaciones no se están enviando o recibiendo:

- **Verificar configuración NTFY**: Asegúrese de que la URL NTFY y el tema sean correctos. Utilice el botón **Enviar notificación de prueba** para probar.
- **Verificar conectividad de red**: Verifique que **duplistatus** pueda alcanzar su servidor NTFY. Revise la configuración del firewall si es aplicable.
- **Verificar configuración de notificaciones**: Confirme que las notificaciones estén habilitadas para los backups relevantes.

### Versiones disponibles no aparecen {#available-versions-not-appearing}

Si las versiones de backup no se muestran en el panel de control o en la página de detalles:

- **Comprobar la configuración de Duplicati**: Asegúrese de que `send-http-log-level=Information` y `send-http-max-log-lines=500` estén configurados en las opciones avanzadas de Duplicati. Duplicati mantiene las primeras N líneas de registro. Si la lista de versiones sigue faltando, aumente el límite o use `0` cuando no esté enviando informes a Duplicati Monitoring. El **conteo** de versiones aún puede aparecer de las estadísticas JSON cuando falte la lista detallada. Consulte [Líneas de registro y versiones disponibles](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Alertas de Backup Retrasado No Funcionan {#overdue-backup-alerts-not-working}

Si las notificaciones de backup retrasado no se están enviando:

- **Verificar configuración de retrasos**: Confirme que la supervisión de backups esté habilitada para el backup. Verifique la configuración del intervalo esperado y la tolerancia.
- **Verificar frecuencia de notificaciones**: Si está configurado como **Una vez**, las alertas se envían solo una vez por evento retrasado.
- **Verificar servicio cron**: Asegúrese de que el servicio cron que supervisa los backups retrasados se esté ejecutando correctamente. Verifique los logs de aplicación para detectar errores. Verifique que el servicio cron sea accesible en el puerto configurado (por defecto: `8667`).

### Recopilar logs de backup No Funciona {#collect-backup-logs-not-working}

Si la recopilación manual del registro de backup falla:

- **Verificar Acceso al Servidor Duplicati**: Verificar que el nombre de host y puerto del servidor Duplicati sean correctos. Confirmar que el acceso remoto esté habilitado en Duplicati. Asegurar que la contraseña de autenticación sea correcta.
- **Verificar Conectividad de Red**: Probar la conectividad desde **duplistatus** al servidor Duplicati. Confirmar que el puerto del servidor Duplicati sea accesible (por defecto: `8200`).
  Por ejemplo, si está utilizando Docker, puede usar `docker exec -it <container-name> /bin/sh` para acceder a la línea de comandos del contenedor y ejecutar herramientas de red como `ping` y `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Verificar también la configuración de DNS dentro del contenedor (consulta más en [DNS Configuration for Podman Containers](../installation/installation.md#configuring-dns-for-podman-containers))

- En **Duplicati 2.4 y versiones posteriores**, `/api/v1/systeminfo` enumera `machine-id` con un valor predeterminado vacío. **duplistatus** lee el id configurado desde la configuración del servidor Duplicati. Si la colección no puede identificar el servidor, configure **Duplicati → Configuración → Opciones avanzadas → Machine-id** y vuelva a intentarlo.

### Actualización desde una versión anterior (antes de 0.9.x) y no se puede iniciar sesión {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** desde la versión 0.9.x requiere autenticación de usuario. Una cuenta `admin` por defecto se crea automáticamente al instalar la aplicación por primera vez o al actualizar desde una versión anterior:
    - Nombre de usuario: `admin`
    - Contraseña: `Duplistatus09`

Puede crear cuentas de usuario adicionales en [Configuración > Usuarios](settings/user-management-settings.md) después del primer inicio de sesión.

### Contraseña de Admin Perdida o Bloqueado {#lost-admin-password-or-locked-out}

Si has perdido tu contraseña de administrador o has sido bloqueado de tu cuenta (aún puedes abrir `/login`):

- **Usar Script de Recuperación de Admin**: Consulte la guía [Recuperación de Cuenta de Admin](admin-recovery.md) para obtener instrucciones sobre cómo recuperar el acceso de administrador en entornos Docker.
- **Verificar Acceso al Contenedor**: Asegúrese de tener acceso Docker exec al contenedor para ejecutar el script de recuperación.

Si el navegador muestra **Acceso denegado** (HTTP 403) antes de iniciar sesión, se trata de un [bloqueo por lista de IPs permitidas](#locked-out-by-ip-allowlist), no de una contraseña olvidada. El script de recuperación de administrador no puede superarlo.

### Bloqueado por Lista de IPs Permitidas {#locked-out-by-ip-allowlist}

Si Configuración → [Lista de IPs permitidas](settings/ip-allowlist-settings.md) está habilitada con un CIDR faltante o incorrecto, el proxy rechaza la solicitud antes de la autenticación. Síntomas típicos:

- Las páginas (`/`, `/login`, `/settings`, …) devuelven **Acceso denegado** en texto plano (HTTP 403).
- Las APIs de sesión y administrador devuelven JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` y `/api/ping` aún responden (están exentos). Las cookies de inicio de sesión no ayudan.

La ruta de guardado intenta prevenir esto: no puedes habilitar la lista **admin** a menos que tu IP actual ya esté en los CIDRs (excepto al guardar desde loopback). Aún puedes bloquearte a ti mismo usando un CIDR que coincida ahora pero no más tarde (VPN, DHCP, otra red), configurando mal los proxies de confianza, o habilitando la lista desde `127.0.0.1` / `::1` sin agregar esa dirección.

Las variables de entorno anulan la base de datos, por lo que puedes recuperarte sin la interfaz de usuario. No reescriben Configuración; se requiere reiniciar para que el proceso las capture.

**Deshabilita la lista de administradores** (recuperación usual):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**O mantén la lista habilitada e inyecta un CIDR que incluya tu IP actual:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Luego reinicia la aplicación:

- **Docker Compose**: establece las mismas claves bajo `environment` en `docker-compose.yml` (el archivo incluye ejemplos comentados) y recrea el contenedor de la aplicación. `docker exec` no cambia las variables de entorno de un contenedor en ejecución.
- **Local / systemd**: exporta la variable en el entorno del servicio y reinicia el proceso de Next.js (no solo el servicio de cron).

Después de poder abrir la interfaz de usuario nuevamente:

1. Inicia sesión y corrige los CIDRs y los proxies de confianza en Configuración → Lista de IPs permitidas.
2. Elimina la anulación de entorno para que Configuración sea nuevamente la fuente de verdad.

La lista de permitidos de la **API externa** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) no bloquea el panel de control. Recupérala de la misma manera con `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` o `EXTERNAL_API_IP_ALLOWLIST`. Si las subidas de Duplicati fallan con HTTP 403 después de habilitar esa lista, consulta [Nuevas Copias de Seguridad No Mostradas](#new-backups-not-showing). La recuperación de proxies de confianza usa `IP_TRUSTED_PROXIES` (un valor no vacío también implica confianza en el proxy).

Consulta [Lista de IPs Permitidas](settings/ip-allowlist-settings.md#environment-overrides) y [Variables de Entorno](../installation/environment-variables.md).

### Backup de base de datos y migración {#database-backup-and-migration}

Cuándo migrar desde versiones anteriores o crear un backup de base de datos:

**Si está ejecutando la versión 1.2.1 o posterior:**
- Use la función integrada de copia de seguridad de la base de datos en [Configuración → Mantenimiento de la base de datos](user-guide/settings/database-maintenance.md)
- Seleccione el formato deseado (.db o .sql) y haga clic en **Descargar copia de seguridad**
- El archivo de copia de seguridad se descargará a su equipo
- Consulte [Mantenimiento de la base de datos](settings/database-maintenance.md#database-backup) para instrucciones detalladas

**Si está ejecutando una versión anterior a 1.2.1:**
- Deberá realizar un backup manual. Consulte la [Guía de Migración](../migration/version_upgrade.md#backing-up-your-database-before-migration) para obtener más información.

Si aún experimenta problemas, intente los siguientes pasos:

1.  **Revise los registros de la aplicación**: Si está usando Docker, ejecute `docker logs <container-name>` para revisar información detallada de errores.
2.  **Valide la configuración**: Verifique cuidadosamente todos los ajustes de configuración en su herramienta de gestión de contenedores (Docker, Portainer, Podman, etc.), incluyendo puertos, red y permisos.
3.  **Verifique la conectividad de red**: Confirme que todas las conexiones de red sean estables. 
4.  **Compruebe el servicio cron**: Asegúrese de que el servicio cron se esté ejecutando junto con la aplicación principal. Revise los registros de ambos servicios.
5.  **Consulte la documentación**: Consulte la Guía de instalación y el archivo README para obtener más información.
6.  **Informe de problemas**: Si el problema persiste, envíe un informe detallado en el [repositorio de duplistatus en GitHub](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos Adicionales {#additional-resources}

- **Guía de instalación**: [Guía de instalación](../installation/installation.md)
- **Documentación de Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentación de la API**: [Referencia de la API](../api-reference/overview.md)
- **Repositorio de GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guía de desarrollo**: [Guía de desarrollo](../development/setup.md)
- **Esquema de la base de datos**: [Documentación de la base de datos](../development/database)

### Soporte {#support}
- **GitHub Issues**: [Reportar errores o solicitar funcionalidades](https://github.com/wsj-br/duplistatus/issues)
