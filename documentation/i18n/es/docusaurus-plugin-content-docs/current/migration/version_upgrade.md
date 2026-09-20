# Guía de migración {/* #migration-guide */}

Esta guía explica cómo actualizar entre versiones de duplistatus. Las migraciones son automáticas: el esquema de la base de datos se actualiza solo cuando inicias una nueva versión.

Solo se requieren pasos manuales si has personalizado plantillas de notificación (la versión 0.8.x cambió las variables de plantilla) o integraciones de API externas que necesitan actualización (la versión 0.7.x cambió los nombres de campos de API, la versión 0.9.x requiere autenticación).

## Vista general {/* #overview */}

duplistatus migra automáticamente tu esquema de base de datos al actualizar. El sistema:

1. Crea una copia de seguridad de tu base de datos antes de realizar cambios
2. Actualiza el esquema de la base de datos a la versión más reciente
3. Conserva todos los datos existentes (servidores, copias de seguridad, configuración)
4. Verifica que la migración se haya completado correctamente

## Crear copia de seguridad de tu base de datos antes de la migración {/* #backing-up-your-database-before-migration */}

Antes de actualizar a una nueva versión, se recomienda crear una copia de seguridad de tu base de datos. Esto garantiza que puedas restaurar tus datos si algo sale mal durante el proceso de migración.

### Si estás ejecutando la versión 1.2.1 o posterior {/* #if-youre-running-version-121-or-later */}

Utiliza la función integrada de copia de seguridad de base de datos:

1. Navega a [Configuración → Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md) en la interfaz web
2. En la sección **Copia de seguridad de base de datos**, selecciona un formato de copia de seguridad:
   - **Archivo de base de datos (.db)**: Formato binario: copia de seguridad más rápida, conserva exactamente toda la estructura de la base de datos
   - **Volcado SQL (.sql)**: Formato de texto: instrucciones SQL legibles por humanos
3. Haz clic en **Descargar copia de seguridad**
4. El archivo de copia de seguridad se descargará en tu equipo con un nombre de archivo con marca de tiempo

Para más detalles, consulta la documentación de [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-backup).

### Si estás ejecutando una versión anterior a 1.2.1 {/* #if-youre-running-a-version-before-121 */}

#### Copia de seguridad {/* #backup */}

Debes hacer manualmente una copia de seguridad de la base de datos antes de continuar. El archivo de base de datos está ubicado en `/app/data/backups.db` dentro del contenedor.

##### Para usuarios de Linux {/* #for-linux-users */}
Si estás en Linux, no te preocupes por iniciar contenedores auxiliares. Puedes usar el comando nativo `cp` para extraer directamente la base de datos desde el contenedor en ejecución hacia tu host.

###### Usando Docker o Podman: {/* #using-docker-or-podman */}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Si usas Podman, simplemente reemplaza `docker` con `podman` en el comando anterior.)

##### Para usuarios de Windows {/* #for-windows-users */}
Si estás ejecutando Docker Desktop en Windows, tienes dos formas sencillas de manejar esto sin usar la línea de comandos:

###### Opción A: Usar Docker Desktop (más fácil) {/* #option-a-use-docker-desktop-easiest */}
1. Abre el panel de control de Docker Desktop.
2. Ve a la pestaña Contenedores y haz clic en tu contenedor duplistatus.
3. Haz clic en la pestaña Archivos.
4. Navega a `/app/data/`.
5. Haz clic derecho en `backups.db` y selecciona **Guardar como...** para descargarlo a tus carpetas de Windows.

###### Opción B: Usar PowerShell {/* #option-b-use-powershell */}
Si prefiere la terminal, puede usar PowerShell para copiar el archivo a su escritorio:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Si Usa Montajes de Vínculo {/* #if-you-use-bind-mounts */}
Si configuró originalmente su contenedor usando un montaje de vínculo (por ejemplo, mapeó una carpeta local como `/opt/duplistatus` al contenedor), no necesita comandos de Docker en absoluto. Simplemente copie el archivo usando su administrador de archivos:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Simplemente copie el archivo en **Explorador de archivos** desde la carpeta que designó durante la instalación.

#### Restaurando Sus Datos {/* #restoring-your-data */}
Si necesita restaurar su base de datos desde una copia de seguridad anterior, siga los pasos a continuación según su sistema operativo.

:::info[IMPORTANTE] 
Detenga el contenedor antes de restaurar la base de datos para evitar corrupción de archivos.
:::

##### Para Usuarios de Linux {/* #for-linux-users-1 */}
La forma más fácil de restaurar es "empujar" el archivo de copia de seguridad de vuelta a la ruta de almacenamiento interna del contenedor.

###### Usando Docker o Podman: {/* #using-docker-or-podman-1 */}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Para Usuarios de Windows {/* #for-windows-users-1 */}
Si está usando Docker Desktop, puede realizar la restauración mediante la interfaz gráfica o PowerShell.

###### Opción A: Usar Docker Desktop (Interfaz gráfica) {/* #option-a-use-docker-desktop-gui */}
1. Asegúrese de que el contenedor duplistatus esté en ejecución (Docker Desktop requiere que el contenedor esté activo para subir archivos mediante la interfaz gráfica).
2. Vaya a la pestaña Archivos en la configuración de su contenedor.
3. Navegue hasta `/app/data/`.
4. Haga clic derecho en el archivo backups.db existente y seleccione Eliminar.
5. Haga clic en el botón Importar (o haga clic derecho en el área de la carpeta) y seleccione su archivo de copia de seguridad desde su computadora.

Cambie el nombre del archivo importado a exactamente backups.db si tiene una marca de tiempo en el nombre.

Reinicie el contenedor.

###### Opción B: Usar PowerShell {/* #option-b-use-powershell-1 */}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Si Usa Montajes de Vínculo {/* #if-you-use-bind-mounts-1 */}
Si está usando una carpeta local mapeada al contenedor, no necesita comandos especiales.

1. Detenga el contenedor.
2. Copie manualmente su archivo de copia de seguridad en su carpeta mapeada (por ejemplo, `/opt/duplistatus` o `C:\duplistatus_data`).
3. Asegúrese de que el archivo se llame exactamente `backups.db`.
4. Inicie el contenedor.

:::note
Si restaura la base de datos manualmente, podría encontrar errores de permisos.

Revise los registros del contenedor y ajuste los permisos si es necesario. Consulte la sección [Solución de problemas](#troubleshooting-your-restore--rollback) a continuación para obtener más información.
:::

## Proceso de Migración Automática {/* #automatic-migration-process */}

Cuando inicia una nueva versión, las migraciones se ejecutan automáticamente:

1. **Creación de copia de seguridad**: Se crea una copia de seguridad con marca de tiempo en su directorio de datos
2. **Actualización de esquema**: Las tablas y campos de la base de datos se actualizan según sea necesario
3. **Migración de datos**: Todos los datos existentes se conservan y migran
4. **Verificación**: El éxito de la migración se registra

### Supervisión de la Migración {/* #monitoring-migration */}

Revise los registros de Docker para supervisar el progreso de la migración:

```bash
docker logs <container-name>
```

Busque mensajes como:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Notas de migración específicas de versión {/* #version-specific-migration-notes */}

### Actualización a la versión 0.9.x o posterior (esquema v4.0) {/* #upgrading-to-version-09x-or-later-schema-v40 */}

:::warning
**Ahora se requiere autenticación.** Todos los usuarios deben iniciar sesión después de la actualización.
:::

#### Qué cambia automáticamente {/* #what-changes-automatically */}

- El esquema de base de datos se migra de v3.1 a v4.0
- Se crean nuevas tablas: `users`, `sessions`, `audit_log`
- Se crea automáticamente una cuenta de administrador predeterminada
- Todas las sesiones existentes se invalidan

#### Qué debe hacer usted {/* #what-you-must-do */}

1. **Inicie sesión** con las credenciales predeterminadas de administrador:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09`
2. **Cambie la contraseña** cuando se le solicite (obligatorio en el primer inicio de sesión)
3. **Cree cuentas de usuario** para otros usuarios (Configuración → Usuarios)
4. **Actualice las integraciones de API externas** para incluir autenticación (consulte [Cambios de API incompatibles con versiones anteriores](api-changes.md))
5. **Configure la retención del registro de auditoría** si es necesario (Configuración → Registro de auditoría)

#### Si está bloqueado {/* #if-youre-locked-out */}

Utilice la herramienta de recuperación de administrador:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Consulte la [Guía de recuperación de administrador](../user-guide/admin-recovery.md) para obtener más detalles.

### Actualización a la versión 0.8.x {/* #upgrading-to-version-08x */}

#### Qué cambia automáticamente {/* #what-changes-automatically-1 */}

- El esquema de base de datos se actualiza a v3.1
- Se genera una clave maestra para cifrado (almacenada en `.duplistatus.key`)
- Sesiones invalidadas (se crean nuevas sesiones protegidas por CSRF)
- Las contraseñas se cifran utilizando el nuevo sistema

#### Qué debe hacer usted {/* #what-you-must-do-1 */}

1. **Actualice las plantillas de notificación** si las personalizó:
   - Reemplace `{backup_interval_value}` y `{backup_interval_type}` con `{backup_interval}`
   - Las plantillas predeterminadas se actualizan automáticamente

#### Notas de seguridad {/* #security-notes */}

- Asegúrese de que el archivo `.duplistatus.key` esté respaldado (tiene permisos 0400)
- Las sesiones expiran después de 24 horas

### Actualización a la versión 0.7.x {/* #upgrading-to-version-07x */}

#### Qué Cambia Automáticamente {/* #what-changes-automatically-2 */}

- Tabla `machines` renombrada a `servers`
- Campos `machine_id` renombrados a `server_id`
- Nuevos campos añadidos: `alias`, `notes`, `created_at`, `updated_at`

#### Qué Debes Hacer {/* #what-you-must-do-2 */}

1. **Actualizar las integraciones de API externas**:
   - Cambiar `totalMachines` → `totalServers` en `/api/summary`
   - Cambiar `machine` → `server` en objetos de respuesta de API
   - Cambiar `backup_types_count` → `backup_jobs_count` en `/api/lastbackups/{serverId}`
   - Actualizar rutas de punto final de `/api/machines/...` a `/api/servers/...`
2. **Actualizar plantillas de notificación**:
   - Reemplazar `{machine_name}` con `{server_name}`

Consulte [Cambios de API no compatibles con versiones anteriores](api-changes.md) para ver los pasos detallados de migración de API.

## Lista de Verificación Post-Migración {/* #post-migration-checklist */}

Después de la actualización, verifique:

- [ ] Todos los servidores aparecen correctamente en el panel
- [ ] El historial de copias de seguridad está completo y accesible
- [ ] Las notificaciones funcionan (probar NTFY/correo electrónico)
- [ ] Las integraciones de API externas funcionan (si corresponde)
- [ ] La configuración es accesible y correcta
- [ ] El monitoreo de copias de seguridad funciona correctamente
- [ ] Inicio de sesión exitoso (0.9.x+)
- [ ] Contraseña predeterminada de administrador cambiada (0.9.x+)
- [ ] Cuentas de usuario creadas para otros usuarios (0.9.x+)
- [ ] Integraciones de API externas actualizadas con autenticación (0.9.x+)

## Solución de problemas {/* #troubleshooting */}

### Falla de Migración {/* #migration-fails */}

1. Compruebe el espacio en disco (la copia de seguridad requiere espacio)
2. Verifique los permisos de escritura en el directorio de datos
3. Revise los registros del contenedor para ver errores específicos
4. Restaure desde la copia de seguridad si es necesario (ver Reversión más abajo)

### Datos Perdidos Después de la Migración {/* #data-missing-after-migration */}

1. Verifique que se haya creado la copia de seguridad (compruebe el directorio de datos)
2. Revise los registros del contenedor para ver mensajes de creación de copia de seguridad
3. Compruebe la integridad del archivo de base de datos

### Problemas de Autenticación (0.9.x+) {/* #authentication-issues-09x */}

1. Verifique que exista la cuenta predeterminada de administrador (compruebe los registros)
2. Intente credenciales predeterminadas: `admin` / `Duplistatus09`
3. Utilice la herramienta de recuperación de administrador si está bloqueado
4. Verifique que exista la tabla `users` en la base de datos

### Errores de API {/* #api-errors */}

1. Revise [Cambios de API no compatibles con versiones anteriores](api-changes.md) para actualizaciones de puntos finales
2. Actualice las integraciones externas con nuevos nombres de campo
3. Añada autenticación a las solicitudes de API (0.9.x+)
4. Pruebe los puntos finales de API después de la migración

### Problemas con la Clave Maestra (0.8.x+) {/* #master-key-issues-08x */}

1. Asegúrese de que el archivo `.duplistatus.key` sea accesible
2. Verifique que los permisos del archivo sean 0400
3. Compruebe los registros del contenedor para errores de generación de claves

### Configuración de DNS de Podman {/* #podman-dns-configuration */}

Si está utilizando Podman y experimenta problemas de conectividad de red después de una actualización, puede necesitar configurar la configuración de DNS para su contenedor. Consulte la [sección de configuración de DNS](../installation/installation.md#configuring-dns-for-podman-containers) en la guía de instalación para obtener más detalles.

## Procedimiento de reversión {/* #rollback-procedure */}

Si necesita revertir a una versión anterior:

1. **Detenga el contenedor**: `docker stop <container-name>` (o `podman stop <container-name>`)
2. **Encuentre su copia de seguridad**: 
   - Si creó una copia de seguridad mediante la interfaz web (versión 1.2.1+), utilice ese archivo de copia de seguridad descargado
   - Si creó una copia de seguridad manual de volumen, extráigala primero
   - Las copias de seguridad automáticas de migración se encuentran en el directorio de datos (archivos con marca de tiempo `.db`)
3. **Restaure la base de datos**: 
   - **Para copias de seguridad de interfaz web (versión 1.2.1+)**: Utilice la función de restauración en `Settings → Database Maintenance` (consulte [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-restore))
   - **Para copias de seguridad manuales**: Reemplace `backups.db` en su directorio/volumen de datos con el archivo de copia de seguridad
4. **Utilice la versión de imagen anterior**: Descargue y ejecute la imagen de contenedor anterior
5. **Inicie el contenedor**: Inicie con la versión anterior

:::warning
La reversión puede causar pérdida de datos si el esquema más reciente es incompatible con la versión anterior. Siempre asegúrese de tener una copia de seguridad reciente antes de intentar la reversión.
:::

### Solución de problemas de su restauración/reversión {/* #troubleshooting-your-restore--rollback */}

Si la aplicación no se inicia o sus datos no aparecen después de una restauración o reversión, compruebe los siguientes problemas comunes:

#### 1. Permisos de archivo de base de datos (Linux/Podman) {/* #1-database-file-permissions-linuxpodman */}

Si restauró el archivo como usuario `root`, la aplicación dentro del contenedor podría no tener permiso para leer o escribir en él.

* **El síntoma:** Los registros muestran "Permiso denegado" o "Base de datos de solo lectura."
* **La solución:** Restablezca los permisos del archivo dentro del contenedor para asegurar que sea accesible.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Nombre de archivo incorrecto {/* #2-incorrect-filename */}

La aplicación busca específicamente un archivo llamado `backups.db`.

* **El síntoma:** La aplicación se inicia pero parece "vacía" (como una instalación nueva).
* **La solución:** Compruebe el directorio `/app/data/`. Si su archivo se llama `duplistatus-backup-2024.db` o tiene una extensión `.sqlite`, la aplicación lo ignorará. Utilice el comando `mv` o la interfaz gráfica de Docker Desktop para renombrarlo exactamente a `backups.db`.

#### 3. Contenedor no reiniciado {/* #3-container-not-restarted */}

En algunos sistemas, utilizar `docker cp` mientras el contenedor está en ejecución puede no "actualizar" inmediatamente la conexión de la aplicación a la base de datos.

* **La solución:** Realice siempre un reinicio completo después de una restauración:

```bash
docker restart duplistatus
```

#### 4. Incompatibilidad de versión de base de datos {/* #4-database-version-mismatch */}

Si está restaurando una copia de seguridad de una versión mucho más reciente de duplistatus en una versión anterior de la aplicación, el esquema de base de datos podría ser incompatible.

* **La solución:** Asegúrese siempre de ejecutar la misma versión (o una más reciente) de la imagen de duplistatus que la que creó la copia de seguridad. Compruebe su versión con:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versiones de esquema de base de datos {/* #database-schema-versions */}

| Versión de la aplicación   | Versión del esquema | Cambios clave                                      |
|----------------------------|---------------------|----------------------------------------------------|
| 0.6.x y anteriores         | v1.0                | Esquema inicial                                    |
| 0.7.x                      | v2.0, v3.0          | Configuraciones añadidas, máquinas renombradas a servidores |
| 0.8.x                      | v3.1                | Campos de copia de seguridad mejorados, compatibilidad con cifrado |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Control de acceso de usuario, autenticación, registro de auditoría |

## Obtener ayuda {/* #getting-help */}

- **Documentación**: [Guía de usuario](../user-guide/overview.md)
- **Referencia de API**: [Documentación de API](../api-reference/overview.md)
- **Cambios en la API**: [Cambios incompatibles hacia atrás en la API](api-changes.md)
- **Notas de lanzamiento**: Consulte las notas de lanzamiento específicas de cada versión para obtener cambios detallados
- **Comunidad**: [Discusiones de GitHub](https://github.com/wsj-br/duplistatus/discussions)
- **Incidencias**: [Incidencias de GitHub](https://github.com/wsj-br/duplistatus/issues)
