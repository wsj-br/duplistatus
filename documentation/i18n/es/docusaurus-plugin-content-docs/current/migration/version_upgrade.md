# Guía de migración {/* #migration-guide */}

Esta guía explica cómo actualizar entre versiones de duplistatus. Las migraciones son automáticas: el esquema de la base de datos se actualiza automáticamente cuando inicia una nueva versión.

Los pasos manuales solo son necesarios si ha personalizado las plantillas de notificación (la versión 0.8.x cambió las variables de plantilla) o tiene integraciones de API externas que necesitan actualizarse (la versión 0.7.x cambió los nombres de los campos de la API, la versión 0.9.x requiere autenticación).

## Vista general {/* #overview */}

duplistatus migra automáticamente el esquema de su base de datos al actualizar. El sistema:

1. Crea una copia de seguridad de su base de datos antes de realizar cambios
2. Actualiza el esquema de la base de datos a la versión más reciente
3. Conserva todos los datos existentes (servidores, copias de seguridad, configuración)
4. Verifica que la migración se haya completado correctamente

## Crear una copia de seguridad de su base de datos antes de la migración {/* #backing-up-your-database-before-migration */}

Antes de actualizar a una nueva versión, se recomienda crear una copia de seguridad de su base de datos. Esto le permite restaurar sus datos si algo sale mal durante el proceso de migración.

### Si está ejecutando la versión 1.2.1 o posterior {/* #if-youre-running-version-121-or-later */}

Utilice la función de copia de seguridad de la base de datos incorporada:

1. Navegue a [Configuración → Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md) en la interfaz web
2. En la sección **Copia de seguridad de base de datos**, seleccione un formato de copia de seguridad:
   - **Archivo de base de datos (.db)**: Formato binario - copia de seguridad más rápida, preserva toda la estructura de la base de datos exactamente
   - **Volcado SQL (.sql)**: Formato de texto - instrucciones SQL legibles por humanos
3. Haga clic en **Descargar copia de seguridad**
4. El archivo de copia de seguridad se descargará a su computadora con un nombre de archivo con marca de tiempo

Para más detalles, consulte la documentación de [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-backup).

### Si está ejecutando una versión anterior a 1.2.1 {/* #if-youre-running-a-version-before-121 */}

#### Copia de seguridad {/* #backup */}

Debe realizar una copia de seguridad manual de la base de datos antes de continuar. El archivo de la base de datos se encuentra en `/app/data/backups.db` dentro del contenedor.

##### Para usuarios de Linux {/* #for-linux-users */}
Si está en Linux, no se preocupe por iniciar contenedores auxiliares. Puede usar el comando nativo `cp` para extraer la base de datos directamente del contenedor en ejecución a su host.

###### Usando Docker o Podman: {/* #using-docker-or-podman */}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Si está utilizando Podman, simplemente reemplace `docker` con `podman` en el comando anterior.)

##### Para usuarios de Windows {/* #for-windows-users */}
Si está ejecutando Docker Desktop en Windows, tiene dos formas sencillas de manejar esto sin usar la línea de comandos:

###### Opción A: Use Docker Desktop (Más fácil) {/* #option-a-use-docker-desktop-easiest */}
1. Abra el Panel de Docker Desktop.
2. Vaya a la pestaña Contenedores y haga clic en su contenedor de duplistatus.
3. Haga clic en la pestaña Archivos.
4. Navega a `/app/data/`.
5. Haz clic derecho en `backups.db` y selecciona **Guardar como...** para descargarlo a tus carpetas de Windows.

###### Opción B: Usar PowerShell {/* #option-b-use-powershell */}
Si prefieres la terminal, puedes usar PowerShell para copiar el archivo a tu Escritorio:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Si Usas Montajes de Volumen {/* #if-you-use-bind-mounts */}
Si configuraste originalmente tu contenedor usando un montaje de volumen (por ejemplo, mapeaste una carpeta local como `/opt/duplistatus` al contenedor), no necesitas comandos de Docker. Simplemente copia el archivo usando tu administrador de archivos:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Copia el archivo en **Explorador de archivos** desde la carpeta que designaste durante la configuración.

#### Restaurando Tus Datos {/* #restoring-your-data */}
Si necesitas restaurar tu base de datos desde una copia de seguridad anterior, sigue los pasos a continuación según tu sistema operativo.

:::info[IMPORTANTE] 
Detén el contenedor antes de restaurar la base de datos para evitar la corrupción de archivos.
:::

##### Para Usuarios de Linux {/* #for-linux-users-1 */}
La forma más fácil de restaurar es "empujar" el archivo de copia de seguridad de nuevo al almacenamiento interno del contenedor.

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
Si estás usando Docker Desktop, puedes realizar la restauración a través de la interfaz gráfica o PowerShell.

###### Opción A: Usar Docker Desktop (GUI) {/* #option-a-use-docker-desktop-gui */}
1. Asegúrate de que el contenedor duplistatus esté en Ejecución (Docker Desktop requiere que el contenedor esté activo para subir archivos a través de la GUI).
2. Ve a la pestaña Archivos en la configuración de tu contenedor.
3. Navega a `/app/data/`.
4. Haz clic derecho en el archivo backups.db existente y selecciona Eliminar.
5. Haz clic en el botón Importar (o haz clic derecho en el área de la carpeta) y selecciona tu archivo de copia de seguridad desde tu computadora.

Renombra el archivo importado a exactamente backups.db si tiene una marca de tiempo en el nombre.

Reinicia el contenedor.

###### Opción B: Usar PowerShell {/* #option-b-use-powershell-1 */}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Si Usas Montajes de Volumen {/* #if-you-use-bind-mounts-1 */}
Si estás usando una carpeta local mapeada al contenedor, no necesitas comandos especiales.

1. Detén el contenedor.
2. Copia manualmente tu archivo de copia de seguridad a tu carpeta mapeada (por ejemplo, `/opt/duplistatus` o `C:\duplistatus_data`).
3. Asegúrate de que el archivo se llame exactamente `backups.db`.
4. Inicia el contenedor.

:::note
Si restauras la base de datos manualmente, es posible que encuentres errores de permisos. 

Revisa los registros del contenedor y ajusta los permisos si es necesario. Consulta la sección [Solución de problemas](#troubleshooting-your-restore--rollback) a continuación para más información.
:::

## Proceso de Migración Automática {/* #automatic-migration-process */}

Cuando inicias una nueva versión, las migraciones se ejecutan automáticamente:

1. **Creación de Copia de Seguridad**: Se crea una copia de seguridad con marca de tiempo en tu directorio de datos
2. **Actualización de Esquema**: Las tablas y campos de la base de datos se actualizan según sea necesario
3. **Migración de Datos**: Todos los datos existentes se conservan y migran
4. **Verificación**: Se registra el éxito de la migración

### Monitoreo de Migración {/* #monitoring-migration */}

Compruebe los registros de Docker para supervisar el progreso de la migración:

```bash
docker logs <container-name>
```

Busque mensajes como:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Notas de migración específicas de la versión {/* #version-specific-migration-notes */}

### Actualizando a la versión 0.9.x o posterior (Esquema v4.0) {/* #upgrading-to-version-09x-or-later-schema-v40 */}

:::warning
**Se requiere autenticación.** Todos los usuarios deben iniciar sesión después de la actualización.
:::

#### Qué cambia automáticamente {/* #what-changes-automatically */}

- El esquema de la base de datos se migra de la v3.1 a la v4.0
- Se crean nuevas tablas: `users`, `sessions`, `audit_log`
- Se crea automáticamente una cuenta de administrador predeterminada
- Todas las sesiones existentes se invalidan

#### Lo que debe hacer {/* #what-you-must-do */}

1. **Inicie sesión** con las credenciales de administrador predeterminadas:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09`
2. **Cambie la contraseña** cuando se le solicite (requerido en el primer inicio de sesión)
3. **Cree cuentas de usuario** para otros usuarios (Configuración → Usuarios)
4. **Actualice las integraciones de API externas** para incluir autenticación (consulte [Cambios en la API incompatibles con versiones anteriores](api-changes.md))
5. **Configure la retención del registro de auditoría** si es necesario (Configuración → Registro de auditoría)

#### Si se bloquea {/* #if-youre-locked-out */}

Utilice la herramienta de recuperación de administrador:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Consulte la [Guía de recuperación de administrador](../user-guide/admin-recovery.md) para obtener más detalles.

### Actualizando a la versión 0.8.x {/* #upgrading-to-version-08x */}

#### Qué cambia automáticamente {/* #what-changes-automatically-1 */}

- El esquema de la base de datos se actualiza a la v3.1
- Se genera una clave maestra para la encriptación (almacenada en `.duplistatus.key`)
- Sesiones invalidadas (se crean nuevas sesiones protegidas contra CSRF)
- Las contraseñas se encriptan utilizando el nuevo sistema

#### Lo que debe hacer {/* #what-you-must-do-1 */}

1. **Actualice las plantillas de notificación** si las personalizó:
   - Reemplace `{backup_interval_value}` y `{backup_interval_type}` con `{backup_interval}`
   - Las plantillas predeterminadas se actualizan automáticamente

#### Notas de seguridad {/* #security-notes */}

- Asegúrese de que el archivo `.duplistatus.key` esté respaldado (tiene permisos 0400)
- Las sesiones expiran después de 24 horas

### Actualización a la Versión 0.7.x {/* #upgrading-to-version-07x */}

#### Qué Cambia Automáticamente {/* #what-changes-automatically-2 */}

- Tabla `machines` renombrada a `servers`
- Campos `machine_id` renombrados a `server_id`
- Nuevos campos añadidos: `alias`, `notes`, `created_at`, `updated_at`

#### Qué Debe Hacer {/* #what-you-must-do-2 */}

1. **Actualizar integraciones de API externas**:
   - Cambiar `totalMachines` → `totalServers` en `/api/summary`
   - Cambiar `machine` → `server` en objetos de respuesta de API
   - Cambiar `backup_types_count` → `backup_jobs_count` en `/api/lastbackups/{serverId}`
   - Actualizar rutas de endpoint de `/api/machines/...` a `/api/servers/...`
2. **Actualizar plantillas de notificaciones**:
   - Reemplazar `{machine_name}` con `{server_name}`

Consulte [Cambios de API no compatibles con versiones anteriores](api-changes.md) para obtener pasos detallados de migración de API.

## Lista de Verificación Post-Migración {/* #post-migration-checklist */}

Después de actualizar, verifique:

- [ ] Todos los servidores aparecen correctamente en el panel de control
- [ ] El historial de copias de seguridad está completo y accesible
- [ ] Las notificaciones funcionan (pruebe NTFY/correo electrónico)
- [ ] Las integraciones de API externas funcionan (si aplica)
- [ ] La configuración es accesible y correcta
- [ ] El monitoreo de copias de seguridad funciona correctamente
- [ ] Inició sesión correctamente (0.9.x+)
- [ ] Cambió la contraseña del administrador predeterminada (0.9.x+)
- [ ] Creó cuentas de usuario para otros usuarios (0.9.x+)
- [ ] Actualizó las integraciones de API externas con autenticación (0.9.x+)

## Solución de problemas {/* #troubleshooting */}

### Fallo en la Migración {/* #migration-fails */}

1. Compruebe el espacio en disco (la copia de seguridad requiere espacio)
2. Verifique los permisos de escritura en el directorio de datos
3. Revise los registros del contenedor para errores específicos
4. Restaure desde la copia de seguridad si es necesario (consulte Reversión a continuación)

### Datos Perdidos Después de la Migración {/* #data-missing-after-migration */}

1. Verifique que se haya creado la copia de seguridad (revise el directorio de datos)
2. Revise los registros del contenedor para mensajes de creación de copia de seguridad
3. Compruebe la integridad del archivo de la base de datos

### Problemas de Autenticación (0.9.x+) {/* #authentication-issues-09x */}

1. Verifique que exista la cuenta de administrador predeterminada (revise los registros)
2. Intente con las credenciales predeterminadas: `admin` / `Duplistatus09`
3. Use la herramienta de recuperación de administrador si está bloqueado
4. Verifique que exista la tabla `users` en la base de datos

### Errores de API {/* #api-errors */}

1. Revisar [cambios incompatibles con versiones anteriores en la API](api-changes.md) para actualizaciones de puntos finales
2. Actualizar integraciones externas con nuevos nombres de campos
3. Añadir autenticación a las solicitudes de la API (0.9.x+)
4. Probar los puntos finales de la API después de la migración

### Problemas con la clave maestra (0.8.x+) {/* #master-key-issues-08x */}

1. Asegúrese de que el archivo `.duplistatus.key` sea accesible
2. Verifique que los permisos del archivo sean 0400
3. Compruebe los registros del contenedor para errores de generación de claves

### Configuración de DNS de Podman {/* #podman-dns-configuration */}

Si está utilizando Podman y experimenta problemas de conectividad de red después de actualizar, es posible que deba configurar la configuración de DNS para su contenedor. Consulte la [sección de configuración de DNS](../installation/installation.md#configuring-dns-for-podman-containers) en la guía de instalación para obtener más detalles.

## Procedimiento de reversión {/* #rollback-procedure */}

Si necesita revertir a una versión anterior:

1. **Detener el contenedor**: `docker stop <container-name>` (o `podman stop <container-name>`)
2. **Encontrar su copia de seguridad**: 
   - Si creó una copia de seguridad utilizando la interfaz web (versión 1.2.1+), utilice ese archivo de copia de seguridad descargado
   - Si creó una copia de seguridad manual de volumen, extráigala primero
   - Las copias de seguridad de migración automáticas se encuentran en el directorio de datos (archivos `.db` con marca de tiempo)
3. **Restaurar la base de datos**: 
   - **Para copias de seguridad de la interfaz web (versión 1.2.1+)**: Utilice la función de restauración en `Settings → Database Maintenance` (consulte [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-restore))
   - **Para copias de seguridad manuales**: Reemplace `backups.db` en su directorio/volumen de datos con el archivo de copia de seguridad
4. **Usar la versión anterior de la imagen**: Extraiga y ejecute la imagen del contenedor anterior
5. **Iniciar el contenedor**: Iniciar con la versión anterior

:::warning
Revertir puede causar pérdida de datos si el nuevo esquema es incompatible con la versión anterior. Asegúrese siempre de tener una copia de seguridad reciente antes de intentar revertir.
:::

### Solución de problemas de su restauración / reversión {/* #troubleshooting-your-restore--rollback */}

Si la aplicación no se inicia o sus datos no aparecen después de una restauración o reversión, compruebe los siguientes problemas comunes:

#### 1. Permisos de archivos de base de datos (Linux/Podman) {/* #1-database-file-permissions-linuxpodman */}

Si restauró el archivo como el usuario `root`, la aplicación dentro del contenedor puede no tener permiso para leerlo o escribir en él.

* **El síntoma:** Los registros muestran "Permiso denegado" o "Base de datos de solo lectura."
* **La solución:** Restablezca los permisos del archivo dentro del contenedor para asegurarse de que sea accesible.

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

En algunos sistemas, el uso de `docker cp` mientras el contenedor está en ejecución puede no actualizar inmediatamente la conexión de la aplicación a la base de datos.

* **La solución:** Siempre realiza un reinicio completo después de una restauración:

```bash
docker restart duplistatus
```

#### 4. Incompatibilidad de versiones de la base de datos {/* #4-database-version-mismatch */}

Si estás restaurando una copia de seguridad de una versión mucho más nueva de duplistatus en una versión más antigua de la aplicación, el esquema de la base de datos podría ser incompatible.

* **La solución:** Asegúrate siempre de que estás ejecutando la misma (o una versión más nueva) de la imagen de duplistatus que la que creó la copia de seguridad. Comprueba tu versión con:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versiones del esquema de la base de datos {/* #database-schema-versions */}

| Versión de la aplicación        | Versión del esquema | Cambios clave                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x y anteriores          | v1.0           | Esquema inicial                                     |
| 0.7.x                      | v2.0, v3.0     | Configuraciones añadidas, máquinas renombradas → servidores   |
| 0.8.x                      | v3.1           | Campos de copia de seguridad mejorados, soporte de cifrado         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Control de acceso de usuario, autenticación, registro de auditoría |

## Obtener ayuda {/* #getting-help */}

- **Documentación**: [Guía del usuario](../user-guide/overview.md)
- **Referencia de API**: [Documentación de API](../api-reference/overview.md)
- **Cambios de API**: [Cambios de API no compatibles con versiones anteriores](api-changes.md)
- **Notas de lanzamiento**: Consulta las notas de lanzamiento específicas de la versión para obtener cambios detallados
- **Comunidad**: [Discusiones de GitHub](https://github.com/wsj-br/duplistatus/discussions)
- **Problemas**: [Problemas de GitHub](https://github.com/wsj-br/duplistatus/issues)
