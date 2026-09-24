# Solución de problemas {/* #troubleshooting */}

### Panel no se carga {/* #dashboard-not-loading */}
- Compruebe si el contenedor está en ejecución: `docker ps`
- Verifique que el puerto 9666 sea accesible
- Consulte los registros del contenedor: `docker logs duplistatus`
- Si está utilizando un proxy inverso, compruebe los registros del proxy inverso para detectar errores
- Si está utilizando listas de IPs permitidas, compruebe los registros de la lista de IPs permitidas para detectar errores

### Sin datos de copia de seguridad {/* #no-backup-data */}
- Verifique la configuración del servidor Duplicati
- Compruebe la conectividad de red entre servidores
- Revise los registros de duplistatus para detectar errores
- Asegúrese de que los trabajos de copia de seguridad se estén ejecutando
- Si utiliza claves de API, asegúrese de que la clave de API sea correcta, que el ámbito sea correcto y no haya expirado (una clave de lectura no puede subir)

### Notificaciones no funcionan {/* #notifications-not-working */}
- Compruebe la configuración de notificaciones
- Verifique la conectividad con el servidor NTFY (si usa NTFY)
- Pruebe la configuración de notificaciones
- Comprobar los registros de notificaciones
- Si es administrador, busque la sirena roja en la barra de herramientas y abra la página de configuración de Correo electrónico o NTFY vinculada. Consulte [Errores de entrega](overview.md#delivery-failures).

### Nuevas copias de seguridad no aparecen {/* #new-backups-not-showing */}

Si ve advertencias del servidor Duplicati como `HTTP Response request failed for:` y `Failed to send message: System.Net.Http.HttpRequestException:`, y las nuevas copias de seguridad no aparecen en el panel o en el historial de copias de seguridad:

- **Compruebe la configuración de Duplicati**: Confirme que Duplicati esté configurado correctamente para enviar JSON a **duplistatus**. En Duplicati 2.0.9.106 y posteriores, utilice `--send-http-json-urls` apuntando a `/api/upload`. En versiones anteriores de Duplicati, utilice `--send-http-url` con `--send-http-result-output-format=Json`. Vea [Configuración del servidor Duplicati](../installation/duplicati-server-configuration.md).
- **Compruebe la conectividad de red**: Asegúrese de que el servidor Duplicati pueda conectarse al servidor **duplistatus**. Confirme que el puerto sea correcto (predeterminado: `9666`).
- **HTTP 401**: Se requieren claves de API y falta una clave con ámbito de subida válida en la URL de subida. Agregue `?api_key=` como se describe en [Claves de API](settings/api-keys-settings.md).
- **HTTP 403**: El ámbito de la clave es incorrecto (una clave de lectura no puede subir), o el host de Duplicati no está en la [lista de IPs permitidas de API externa](settings/ip-allowlist-settings.md).
- **HTTP 413**: El informe JSON es más grande que el límite de tamaño de subida (predeterminado 5 MB). Reduzca `--send-http-max-log-lines` o aumente el límite en Configuración → Claves de API.
- **HTTP 429**: Se excedió el límite de tasa de subida por IP. Espere `Retry-After`, o aumente los límites si muchos trabajos finalizan al mismo tiempo.
- **Revise los registros de Duplicati**: Busque errores de solicitud HTTP en los registros de Duplicati.
- **Doble informe**: Si también envía informes de formulario a [Monitoreo de Duplicati](https://www.duplicati-monitoring.com/), un fallo o HTTP 500 de ese servicio puede detener que Duplicati envíe el informe JSON a **duplistatus**. Las URL de formulario se envían primero. Vea [Informe a duplistatus y monitoreo de Duplicati](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Servidores duplicados en el panel {/* #duplicate-servers-on-the-dashboard */}

Si el mismo servidor aparece más de una vez en el panel, esto suele suceder después de [recopilar registros de copia de seguridad](collect-backup-logs.md), o después de reinstalar o actualizar el servidor Duplicati.

**Causas:**

- **`machine_id` cambiado**: Cuando reinstala o actualiza Duplicati, el `machine_id` del servidor puede cambiar, y entonces **duplistatus** lo trata como un servidor nuevo.
- **Error en la API de Duplicati**: En versiones más recientes de Duplicati hay un error donde algunos puntos finales de la API mezclan el id `identity` y el `machine_id`. Esta inconsistencia hace que **duplistatus** registre el mismo servidor bajo diferentes ID, generando duplicados.

**Solución:**

1.  En el **servidor Duplicati**, haga **una** de las siguientes acciones:
    - Edite los archivos `identity.txt` y `machineid.txt` para que ambos contengan el **mismo** id; o
    - Abra **Duplicati → Configuración → Opciones avanzadas → Id de máquina** y establezca un valor (se completa automáticamente — simplemente acepte el valor sugerido).
2.  **Reinicie** el servidor Duplicati para que el cambio surta efecto.
3.  En **duplistatus**, consolide las entradas duplicadas usando [Configuración → Mantenimiento de base de datos → Combinar servidores duplicados](settings/database-maintenance.md#merge-duplicate-servers).

### Notificaciones no funcionan (detallado) {/* #notifications-not-working-detailed */}

Si las notificaciones no se están enviando o recibiendo:

- **Compruebe la configuración de NTFY**: Asegúrese de que la URL y el tema de NTFY sean correctos. Utilice el botón **Enviar notificación de prueba** para probar.
- **Compruebe la conectividad de red**: Verifique que **duplistatus** pueda acceder a su servidor NTFY. Revise la configuración del firewall si corresponde.
- **Compruebe la configuración de notificaciones**: Confirme que las notificaciones estén habilitadas para las copias de seguridad relevantes.

### Versiones disponibles no aparecen {/* #available-versions-not-appearing */}

Si las versiones de copia de seguridad no se muestran en el panel o en la página de detalles:

- **Comprobar configuración de Duplicati**: Asegúrese de que `send-http-log-level=Information` y `send-http-max-log-lines=500` estén configurados en las opciones avanzadas de Duplicati. Duplicati mantiene las primeras N líneas de registro. Si la lista de versiones aún falta, aumente el límite o utilice `0` cuando no esté enviando informes también al monitoreo de Duplicati. El **número** de versiones aún puede aparecer desde las estadísticas JSON cuando falta la lista detallada. Vea [Líneas de registro y versiones disponibles](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Alertas de copia de seguridad vencida no funcionan {/* #overdue-backup-alerts-not-working */}

Si las notificaciones de copia de seguridad vencida no se están enviando:

- **Comprobar configuración vencida**: Confirme que el monitoreo de copia de seguridad está habilitado para la copia de seguridad. Verifique los ajustes de intervalo y tolerancia esperados.
- **Comprobar frecuencia de notificación**: Si está configurado como **Una vez**, las alertas solo se envían una vez por evento vencido.
- **Comprobar servicio Cron**: Asegúrese de que el servicio cron que monitorea las copias de seguridad vencidas se esté ejecutando correctamente. Compruebe los registros de la aplicación en busca de errores. Verifique que el servicio cron sea accesible en el puerto configurado (predeterminado: `8667`).

### Recolección de registros de copia de seguridad no funciona {/* #collect-backup-logs-not-working */}

Si falla la recolección manual de registros de copia de seguridad:

- **Comprobar acceso al servidor Duplicati**: Verifique que el nombre de host y el puerto del servidor Duplicati sean correctos. Confirme que el acceso remoto está habilitado en Duplicati. Asegúrese de que la contraseña de autenticación sea correcta.
- **Comprobar conectividad de red**: Pruebe la conectividad desde **duplistatus** al servidor Duplicati. Confirme que el puerto del servidor Duplicati sea accesible (predeterminado: `8200`).
  Por ejemplo, si está utilizando Docker, puede usar `docker exec -it <container-name> /bin/sh` para acceder a la línea de comandos del contenedor y ejecutar herramientas de red como `ping` y `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

También verifique la configuración de DNS dentro del contenedor (ver más en [Configuración de DNS para contenedores de Podman](../installation/installation.md#configuring-dns-for-podman-containers))

- En **Duplicati 2.4 y posteriores**, `/api/v1/systeminfo` enumera `machine-id` con un valor predeterminado vacío. **duplistatus** lee el id configurado desde la configuración del servidor Duplicati. Si la recopilación aún no puede identificar el servidor, configure **Duplicati → Configuración → Opciones avanzadas → Id de máquina** y vuelva a intentarlo.

### Actualizar desde una versión anterior (antes de 0.9.x) y no puedo iniciar sesión {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** desde la versión 0.9.x requiere autenticación de usuario. Se crea automáticamente una cuenta `admin` predeterminada cuando se instala la aplicación por primera vez o se actualiza desde una versión anterior: 
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

- Las páginas (`/`, `/login`, `/settings`, …) devuelven texto sin formato **Acceso denegado** (HTTP 403).
- Las API de sesión y administrador devuelven JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` y `/api/ping` también devuelven 403 desde una IP no incluida cuando cualquiera de las listas de permitidos está habilitada. Todavía responden desde loopback. Las cookies de inicio de sesión no ayudan.

Para confirmar que la aplicación está activa durante un bloqueo, ejecute la sonda desde dentro del contenedor (el bucle local siempre está permitido):

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

La ruta de guardado intenta evitar esto: no puede activar la lista de **administrador** a menos que su IP actual ya esté en los CIDR (excepto al guardar desde el bucle local). Aún puede bloquearse usted mismo usando un CIDR que coincida ahora pero no más tarde (VPN, DHCP, otra red), configurando incorrectamente proxies de confianza o activando la lista desde `127.0.0.1` / `::1` sin agregar esa dirección.

Las variables de entorno anulan la base de datos, por lo que puede recuperarse sin la interfaz de usuario. No reescriben la Configuración; se requiere reinicio para que el proceso las tome.

**Desactivar la lista de administrador** (recuperación habitual):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**O mantenerla activada e inyectar un CIDR que incluya su IP actual:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Luego reinicie la aplicación:

- **Docker Compose**: establezca las mismas claves bajo `environment` en `docker-compose.yml` (el archivo incluye ejemplos comentados) y vuelva a crear el contenedor de la aplicación. `docker exec` no cambia las variables de entorno de un contenedor en ejecución.
- **Local / systemd**: exporte la variable en el entorno del servicio y reinicie el proceso de Next.js (no solo el servicio cron).

Después de poder abrir la interfaz de usuario nuevamente:

1. Inicie sesión y corrija los CIDR y proxies de confianza en Configuración → Lista de IPs permitidas.
2. Elimine la anulación de entorno para que la Configuración vuelva a ser la fuente de verdad.

La lista de IPs permitidas de la **API externa** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) no bloquea el panel de control. Recupérelo de la misma manera con `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` o `EXTERNAL_API_IP_ALLOWLIST`. Si las subidas de Duplicati fallan con HTTP 403 después de activar esa lista, consulte [Nuevas copias de seguridad no aparecen](#new-backups-not-showing). La recuperación mediante proxy de confianza utiliza `IP_TRUSTED_PROXIES` (un valor no vacío también implica proxy de confianza).

Vea [Lista de IPs permitidas](settings/ip-allowlist-settings.md#environment-overrides) y [Variables de entorno](../installation/environment-variables.md).

### Copia de seguridad y migración de base de datos {/* #database-backup-and-migration */}

Al migrar desde versiones anteriores o crear una copia de seguridad de base de datos:

**Si está ejecutando la versión 1.2.1 o posterior:**
- Utilice la función integrada de copia de seguridad de base de datos en [Configuración → Mantenimiento de base de datos](user-guide/settings/database-maintenance.md)
- Seleccione su formato preferido (.db o .sql) y haga clic en **Descargar copia de seguridad**
- El archivo de copia de seguridad se descargará en su computadora
- Vea [Mantenimiento de base de datos](settings/database-maintenance.md#database-backup) para instrucciones detalladas

**Si está ejecutando una versión anterior a 1.2.1:**
- Deberá hacer una copia de seguridad manualmente. Consulte la [Guía de migración](../migration/version_upgrade.md#backing-up-your-database-before-migration) para obtener más información.

Si aún experimenta problemas, intente los siguientes pasos:

1.  **Inspeccionar registros de la aplicación**: Si usa Docker, ejecute `docker logs <container-name>` para revisar información detallada de errores.
2.  **Validar configuración**: Verifique dos veces todos los ajustes de configuración en su herramienta de gestión de contenedores (Docker, Portainer, Podman, etc.), incluyendo puertos, red y permisos.
3.  **Verificar conectividad de red**: Confirme que todas las conexiones de red son estables.
4.  **Comprobar servicio cron**: Asegúrese de que el servicio cron se esté ejecutando junto con la aplicación principal. Revise los registros de ambos servicios.
5.  **Consultar documentación**: Consulte la Guía de instalación y el README para obtener más información.
6.  **Reportar problemas**: Si el problema persiste, envíe un informe detallado en el [repositorio de duplistatus en GitHub](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Recursos adicionales {/* #additional-resources */}

- **Guía de instalación**: [Guía de instalación](../installation/installation.md)
- **Documentación de Duplicati**: [docs.duplicati.com](https://docs.duplicati.com)
- **Documentación de la API**: [Referencia de la API](../api-reference/overview.md)
- **Repositorio de GitHub**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guía de desarrollo**: [Guía de desarrollo](../development/setup.md)
- **Esquema de base de datos**: [Documentación de la base de datos](../development/database)

### Soporte {/* #support */}
- **Incidencias en GitHub**: [Informar errores o solicitar funciones](https://github.com/wsj-br/duplistatus/issues)
