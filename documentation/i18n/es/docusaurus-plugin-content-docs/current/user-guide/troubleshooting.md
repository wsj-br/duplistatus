# Solución de problemas {/* #troubleshooting */}

### Panel no se carga {/* #dashboard-not-loading */}
- Compruebe si el contenedor está en ejecución: `docker ps`
- Verifique que el puerto 9666 sea accesible
- Compruebe los registros del contenedor: `docker logs duplistatus`
- Si está utilizando un proxy inverso, compruebe los registros del proxy inverso en busca de errores
- Si está utilizando listas de IPs permitidas, compruebe los registros de la lista de IPs permitidas en busca de errores

### No hay datos de copia de seguridad {/* #no-backup-data */}
- Verifique la configuración del servidor Duplicati
- Compruebe la conectividad de red entre servidores
- Revise los registros de duplistatus en busca de errores
- Asegúrese de que los trabajos de copia de seguridad se estén ejecutando
- Si está utilizando claves de API, asegúrese de que la clave de API sea correcta, el ámbito sea correcto y no esté expirado (una clave de lectura no puede subir)

### Notificaciones no funcionan {/* #notifications-not-working */}
- Compruebe la configuración de notificaciones
- Verifique la conectividad del servidor NTFY (si está utilizando NTFY)
- Pruebe la configuración de notificaciones
- Compruebe los registros de notificaciones

### Nuevas copias de seguridad no aparecen {/* #new-backups-not-showing */}

Si ve advertencias del servidor Duplicati como `HTTP Response request failed for:` y `Failed to send message: System.Net.Http.HttpRequestException:`, y las nuevas copias de seguridad no aparecen en el panel o en el historial de copias de seguridad:

- **Compruebe la configuración de Duplicati**: Confirme que Duplicati está configurado correctamente para enviar JSON a **duplistatus**. En Duplicati 2.0.9.106 y posteriores, use `--send-http-json-urls` apuntando a `/api/upload`. En versiones anteriores de Duplicati, use `--send-http-url` con `--send-http-result-output-format=Json`. Consulte [Configuración del servidor Duplicati](../installation/duplicati-server-configuration.md).
- **Compruebe la conectividad de red**: Asegúrese de que el servidor Duplicati pueda conectarse al servidor **duplistatus**. Confirme que el puerto es correcto (predeterminado: `9666`).
- **HTTP 401**: Se requieren claves de API y la URL de carga falta una clave de ámbito de carga válida. Añada `?api_key=` como se describe en [Claves de API](settings/api-keys-settings.md).
- **HTTP 403**: El ámbito de la clave es incorrecto (una clave de lectura no puede subir), o el host de Duplicati no está en la [lista de IPs externas de API](settings/ip-allowlist-settings.md).
- **HTTP 413**: El informe JSON es más grande que el límite de tamaño de carga (predeterminado 5 MB). Baje `--send-http-max-log-lines` o aumente el límite en Configuración → Claves de API.
- **HTTP 429**: Se superó el límite de carga por IP. Espere `Retry-After`, o aumente los límites si muchos trabajos finalizan al mismo tiempo.
- **Revise los registros de Duplicati**: Compruebe los errores de solicitud HTTP en los registros de Duplicati.
- **Informe dual**: Si también envía informes de formulario a [Duplicati Monitoring](https://www.duplicati-monitoring.com/), un fallo o HTTP 500 de ese servicio puede detener a Duplicati de enviar el informe JSON a **duplistatus**. Las URLs de formulario se envían primero. Consulte [Informes a duplistatus y Duplicati Monitoring](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Servidores duplicados en el panel {/* #duplicate-servers-on-the-dashboard */}

Si el mismo servidor aparece más de una vez en el panel, esto ocurre con mayor frecuencia después de [recopilar registros de copia de seguridad](collect-backup-logs.md), o después de reinstalar o actualizar el servidor Duplicati.

**Causas:**

- **`machine_id` cambiado**: Cuando reinstala o actualiza Duplicati, el `machine_id` del servidor puede cambiar, y **duplistatus** lo trata como un nuevo servidor.
- **Error de API de Duplicati**: En versiones más recientes de Duplicati hay un error en el que algunos puntos finales de la API mezclan el `identity` id y el `machine_id`. Esta inconsistencia hace que **duplistatus** registre el mismo servidor bajo diferentes IDs, generando duplicados.

**Solución:**

1.  En el **servidor Duplicati**, haga **uno** de lo siguiente:
    - Edite los archivos `identity.txt` y `machineid.txt` para que ambos archivos contengan el **mismo** id; o
    - Abra **Duplicati → Configuración → Opciones avanzadas → Machine-id** y establezca un valor (se rellena automáticamente — solo acepte el valor sugerido).
2.  **Reinicie** el servidor Duplicati para que el cambio surta efecto.
3.  En **duplistatus**, consolide las entradas duplicadas utilizando [Configuración → Mantenimiento de base de datos → Combinar servidores duplicados](settings/database-maintenance.md#merge-duplicate-servers).

### Notificaciones no funcionan (Detallado) {/* #notifications-not-working-detailed */}

Si las notificaciones no se están enviando o recibiendo:

- **Compruebe la configuración de NTFY**: Asegúrese de que la URL y el tema de NTFY son correctos. Use el botón **Enviar notificación de prueba** para probar.
- **Compruebe la conectividad de red**: Verifique que **duplistatus** pueda llegar a su servidor NTFY. Revise la configuración del firewall si es aplicable.
- **Compruebe la configuración de notificaciones**: Confirme que las notificaciones están habilitadas para las copias de seguridad relevantes.

### Versiones disponibles no aparecen {/* #available-versions-not-appearing */}

Si las versiones de copia de seguridad no aparecen en el panel de control o en la página de detalles:

- **Comprobar configuración de Duplicati**: Asegúrese de que `send-http-log-level=Information` y `send-http-max-log-lines=500` estén configurados en las opciones avanzadas de Duplicati. Duplicati mantiene las primeras N líneas de registro. Si la lista de versiones sigue faltando, aumente el límite o use `0` cuando no esté enviando informes a Duplicati Monitoring. El **conteo** de versiones aún puede aparecer de las estadísticas JSON cuando falta la lista detallada. Consulte [Líneas de registro y versiones disponibles](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Alertas de copia de seguridad vencida no funcionan {/* #overdue-backup-alerts-not-working */}

Si las notificaciones de copia de seguridad vencida no se están enviando:

- **Comprobar configuración vencida**: Confirme que el monitoreo de copias de seguridad esté habilitado para la copia de seguridad. Verifique la configuración del intervalo esperado y la tolerancia.
- **Comprobar frecuencia de notificación**: Si está configurado como **Una vez**, las alertas solo se envían una vez por evento vencido.
- **Comprobar servicio cron**: Asegúrese de que el servicio cron que monitorea las copias de seguridad vencidas esté funcionando correctamente. Revise los registros de la aplicación en busca de errores. Verifique que el servicio cron sea accesible en el puerto configurado (predeterminado: `8667`).

### No se pueden recopilar registros de copia de seguridad {/* #collect-backup-logs-not-working */}

Si la recolección manual de registros de copia de seguridad falla:

- **Comprobar acceso al servidor Duplicati**: Verifique que el nombre de host y el puerto del servidor Duplicati sean correctos. Confirme que el acceso remoto esté habilitado en Duplicati. Asegúrese de que la contraseña de autenticación sea correcta.
- **Comprobar conectividad de red**: Pruebe la conectividad desde **duplistatus** al servidor Duplicati. Confirme que el puerto del servidor Duplicati sea accesible (predeterminado: `8200`).
  Por ejemplo, si está utilizando Docker, puede usar `docker exec -it <container-name> /bin/sh` para acceder a la línea de comandos del contenedor y ejecutar herramientas de red como `ping` y `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

También verifique la configuración de DNS dentro del contenedor (consulte más en [Configuración de DNS para contenedores Podman](../installation/installation.md#configuring-dns-for-podman-containers))

- En **Duplicati 2.4 y posteriores**, `/api/v1/systeminfo` lista `machine-id` con un valor predeterminado vacío. **duplistatus** lee el id configurado desde la configuración del servidor Duplicati. Si la colección aún no puede identificar el servidor, configure **Duplicati → Configuración → Opciones avanzadas → Machine-id** y vuelva a intentarlo.

### Actualización desde una versión anterior (antes de 0.9.x) y no puede iniciar sesión {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** desde la versión 0.9.x requiere autenticación de usuario. Se crea automáticamente una cuenta `admin` predeterminada al instalar la aplicación por primera vez o al actualizar desde una versión anterior: 
    - nombre de usuario: `admin`
    - contraseña: `Duplistatus09`

Puede crear cuentas de usuario adicionales en [Configuración > Usuarios](settings/user-management-settings.md) después del primer inicio de sesión.

### Contraseña de administrador perdida o bloqueado {/* #lost-admin-password-or-locked-out */}

Si ha perdido su contraseña de administrador o ha sido bloqueado de su cuenta (aún puede abrir `/login`):

- **Usar script de recuperación de administrador**: Consulte la guía [Recuperación de cuenta de administrador](admin-recovery.md) para obtener instrucciones sobre cómo recuperar el acceso de administrador en entornos Docker.
- **Verificar acceso al contenedor**: Asegúrese de tener acceso Docker exec al contenedor para ejecutar el script de recuperación.

Si el navegador muestra **Acceso denegado** (HTTP 403) antes del inicio de sesión, eso es un [bloqueo de lista de IPs permitidas](#locked-out-by-ip-allowlist), no una contraseña olvidada. El script de recuperación de administrador no puede evitarlo.

### Bloqueado por lista de IPs permitidas {/* #locked-out-by-ip-allowlist */}

Si Configuración → [Lista de IPs permitidas](settings/ip-allowlist-settings.md) está habilitada con un CIDR faltante o incorrecto, el proxy rechaza la solicitud antes de la autenticación. Síntomas típicos:

- Las páginas (`/`, `/login`, `/settings`, …) devuelven **Acceso denegado** en texto plano (HTTP 403).
- Las APIs de sesión y administrador devuelven JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` y `/api/ping` también devuelven 403 desde una IP no listada cuando cualquiera de las listas de permisos esté habilitada. Aún responden desde el bucle de retroalimentación. Las cookies de inicio de sesión no ayudan.

Para confirmar que la aplicación está en funcionamiento durante un bloqueo, ejecute la prueba desde dentro del contenedor (el bucle de retorno siempre está permitido):

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

La ruta de guardado intenta evitar esto: no puede activar la lista de **administradores** a menos que su IP actual ya esté en las CIDRs (excepto cuando se guarda desde el bucle de retorno). Todavía puede bloquearse a sí mismo usando una CIDR que coincida ahora pero no más tarde (VPN, DHCP, otra red), configurando mal los proxies de confianza o activando la lista desde `127.0.0.1` / `::1` sin agregar esa dirección.

Las variables de entorno anulan la base de datos, por lo que puede recuperarse sin la interfaz de usuario. No reescriben Configuración; se requiere reiniciar para que el proceso las capture.

**Desactive la lista de administradores** (recuperación usual):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**O mantenga la lista habilitada e inyecte una CIDR que incluya su IP actual:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Luego, reinicie la aplicación:

- **Docker Compose**: establezca las mismas claves bajo `environment` en `docker-compose.yml` (el archivo incluye ejemplos comentados) y recree el contenedor de la aplicación. `docker exec` no cambia las variables de entorno de un contenedor en ejecución.
- **Local / systemd**: exporte la variable en el entorno del servicio y reinicie el proceso de Next.js (no solo el servicio cron).

Después de que pueda abrir la interfaz de usuario nuevamente:

1. Inicie sesión y corrija las CIDRs y los proxies de confianza en Configuración → Lista de IPs permitidas.
2. Elimine la anulación de entorno para que Configuración sea nuevamente la fuente de verdad.

La lista de permitidos de la **API externa** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) no bloquea el panel de control. Recupérela de la misma manera con `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` o `EXTERNAL_API_IP_ALLOWLIST`. Si las cargas de Duplicati fallan con HTTP 403 después de habilitar esa lista, consulte [Nuevas copias de seguridad no se muestran](#new-backups-not-showing). La recuperación de proxies de confianza usa `IP_TRUSTED_PROXIES` (un valor no vacío también implica trust-proxy).

Consulte [Lista de IPs permitidas](settings/ip-allowlist-settings.md#environment-overrides) y [Variables de entorno](../installation/environment-variables.md).

### Copia de seguridad y migración de base de datos {/* #database-backup-and-migration */}

Al migrar desde versiones anteriores o crear una copia de seguridad de la base de datos:

**Si está ejecutando la versión 1.2.1 o posterior:**
- Use la función de copia de seguridad de la base de datos incorporada en [Configuración → Mantenimiento de base de datos](user-guide/settings/database-maintenance.md)
- Seleccione su formato preferido (.db o .sql) y haga clic en **Descargar copia de seguridad**
- El archivo de copia de seguridad se descargará a su computadora
- Consulte [Mantenimiento de base de datos](settings/database-maintenance.md#database-backup) para obtener instrucciones detalladas

**Si está ejecutando una versión anterior a 1.2.1:**
- Deberá realizar una copia de seguridad manualmente. consulte la [Guía de migración](../migration/version_upgrade.md#backing-up-your-database-before-migration) para obtener más información.

Si aún experimenta problemas, intente los siguientes pasos:

1. **Inspeccionar registros de la aplicación**: Si usa Docker, ejecute `docker logs <container-name>` para revisar información detallada de errores.
2. **Validar configuración**: Verifique todas las configuraciones en su herramienta de gestión de contenedores (Docker, Portainer, Podman, etc.) incluyendo puertos, red y permisos.
3. **Verificar conectividad de red**: Confirme que todas las conexiones de red son estables. 
4. **Comprobar servicio cron**: Asegúrese de que el servicio cron se esté ejecutando junto con la aplicación principal. Revise los registros de ambos servicios.
5. **Consultar documentación**: Consulte la Guía de instalación y el README para obtener más información.
6. **Reportar problemas**: Si el problema persiste, envíe un informe detallado en el [repositorio de GitHub de duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos adicionales {/* #additional-resources */}

- **Guía de instalación**: [Guía de instalación](../installation/installation.md)
- **Documentación de Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentación de API**: [Referencia de API](../api-reference/overview.md)
- **Repositorio de GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guía de desarrollo**: [Guía de desarrollo](../development/setup.md)
- **Esquema de base de datos**: [Documentación de base de datos](../development/database)

### Soporte {/* #support */}
- **Problemas de GitHub**: [Informar errores o solicitar características](https://github.com/wsj-br/duplistatus/issues)
