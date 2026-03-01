---
translation_last_updated: '2026-03-01T00:45:14.562Z'
source_file_mtime: '2026-02-16T00:30:39.431Z'
source_file_hash: f18ae0bd1263eac9
translation_language: es
source_file_path: migration/version_upgrade.md
---
# Guía de Migración {#migration-guide}

Esta guía explica cómo actualizar entre versiones de duplistatus. Las migraciones son automáticas: el esquema de la base de datos se actualiza a sí mismo cuando inicia una nueva versión.

Los pasos manuales solo son requeridos si ha personalizado Plantillas de notificación (la versión 0.8.x cambió variables de plantilla) o Integraciones de API externas que necesitan actualización (la versión 0.7.x cambió nombres de campos de API, la versión 0.9.x requiere autenticación).

## Resumen {#overview}

duplistatus migra automáticamente el esquema de su base de datos al actualizar. El sistema:

1. Crea un backup de su base de datos antes de realizar cambios
2. Actualiza el esquema de la base de datos a la versión más reciente
3. Preserva todos los datos existentes (servidores, backups, configuración)
4. Verifica que la migración se completó exitosamente

## Copia de seguridad de su base de datos antes de la migración {#backing-up-your-database-before-migration}

Antes de actualizar a una nueva versión, se recomienda crear un backup de su base de datos. Esto garantiza que pueda restaurar sus datos si algo sale mal durante el proceso de migración.

### Si está ejecutando la Versión 1.2.1 o posterior {#if-youre-running-version-121-or-later}

Utilice la función de backup de base de datos integrada:

1. Navegue a [Configuración → Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md) en la interfaz web
2. En la sección **Backup de base de datos**, seleccione un formato de backup:
   - **Archivo de base de datos (.db)**: Formato binario - backup más rápido, preserva exactamente toda la estructura de la base de datos
   - **Volcado SQL (.sql)**: Formato de texto - sentencias SQL legibles por humanos
3. Haga clic en **Descargar backup**
4. El archivo de backup se descargará en su computadora con un nombre de archivo con marca de tiempo

Para más detalles, consulte la documentación de [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-backup).

### Si está ejecutando una versión anterior a 1.2.1 {#if-youre-running-a-version-before-121}

#### Backup {#backup}

Debe hacer una copia de seguridad manual de la base de datos antes de continuar. El archivo de base de datos se encuentra en `/app/data/backups.db` dentro del contenedor.

##### Para Usuarios de Linux {#for-linux-users}
Si está en Linux, no se preocupe por ejecutar contenedores auxiliares. Puede utilizar el comando nativo `cp` para extraer la base de datos directamente del contenedor en ejecución a su host.

###### Uso de Docker o Podman: {#using-docker-or-podman}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Si utiliza Podman, simplemente reemplace `docker` con `podman` en el comando anterior.)

##### Para Usuarios de Windows {#for-windows-users}
Si está ejecutando Docker Desktop en Windows, tiene dos formas simples de manejar esto sin utilizar la línea de comandos:

###### Opción A: Usar Docker Desktop (La más fácil) {#option-a-use-docker-desktop-easiest}
1. Abra el Panel de control de Docker Desktop.
2. Vaya a la pestaña Contenedores y haga clic en su contenedor duplistatus.
3. Haga clic en la pestaña Archivos.
4. Navegue a `/app/data/`.
5. Haga clic derecho en `backups.db` y seleccione **Guardar como...** para descargarlo a sus carpetas de Windows.

###### Opción B: Usar PowerShell {#option-b-use-powershell}
Si prefiere la terminal, puede usar PowerShell para copiar el archivo a su Escritorio:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Si Utiliza Bind Mounts {#if-you-use-bind-mounts}
Si originalmente configuró su contenedor utilizando un bind mount (por ejemplo, asignó una carpeta local como `/opt/duplistatus` al contenedor), no necesita comandos de Docker en absoluto. Solo copie el archivo usando su gestor de archivos:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Simplemente copie el archivo en el **Explorador de archivos** desde la carpeta que designó durante la configuración.

#### Restaurar Sus Datos {#restoring-your-data}
Si necesita restaurar su base de datos desde un backup anterior, siga los pasos a continuación según su sistema operativo.

:::info[IMPORTANTE] 
Detenga el contenedor antes de restaurar la base de datos para evitar corrupción de archivos.
:::

##### Para Usuarios de Linux {#for-linux-users}
La forma más fácil de restaurar es "enviar" el archivo de backup de vuelta a la ruta de almacenamiento interno del contenedor.

###### Uso de Docker o Podman: {#using-docker-or-podman}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Para Usuarios de Windows {#for-windows-users}
Si está utilizando Docker Desktop, puede realizar la restauración a través de la GUI o PowerShell.

###### Opción A: Usar Docker Desktop (GUI) {#option-a-use-docker-desktop-gui}
1. Asegúrese de que el contenedor duplistatus esté Activo (Docker Desktop requiere que el contenedor esté activo para subir archivos a través de la GUI).
2. Vaya a la pestaña Archivos en la Configuración de su contenedor.
3. Navegue a `/app/data/`.
4. Haga clic derecho en el archivo backups.db existente y seleccione Eliminar.
5. Haga clic en el botón Importar (o haga clic derecho en el área de la carpeta) y seleccione su archivo de backup desde su computadora.

Cambie el nombre del archivo importado a exactamente backups.db si tiene una marca de tiempo en el nombre.

Reinicia el contenedor.

###### Opción B: Usar PowerShell {#option-b-use-powershell}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Si Usa Bind Mounts {#if-you-use-bind-mounts}
Si está utilizando una carpeta local asignada al contenedor, no necesita ningún comando especial.

1. Detener el contenedor.
2. Copiar manualmente su archivo de backup en su carpeta asignada (por ejemplo, `/opt/duplistatus` o `C:\duplistatus_data`).
3. Asegurarse de que el archivo se denomina exactamente `backups.db`.
4. Iniciar el contenedor.

```bash
docker logs <container-name>
```

:::note
Si restaura la base de datos manualmente, puede encontrar errores de permisos. 

Verifique los logs del contenedor y ajuste los permisos si es necesario. Consulte la sección [Solución de problemas](#troubleshooting-your-restore--rollback) a continuación para obtener más información.
::: 

## Proceso de migración automática {#automatic-migration-process}

Cuándo inicia una nueva versión, las migraciones se ejecutan automáticamente:

1. **Creación de backup**: Se crea un backup con marca de tiempo en su directorio de datos
2. **Actualización de esquema**: Las tablas y campos de la base de datos se actualizan según sea necesario
3. **Migración de datos**: Todos los datos existentes se preservan y se migran
4. **Verificación**: El éxito de la migración se registra

### Monitoreo de migración {#monitoring-migration}

Verifique los logs de Docker para monitorear el progreso de la migración:


Busque mensajes como:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Notas de migración específicas de versión {#version-specific-migration-notes}

### Actualización a versión 0.9.x o posterior (esquema v4.0) {#upgrading-to-version-09x-or-later-schema-v40}

:::warning
**La autenticación ahora es requerida.** Todos los usuarios deben iniciar sesión después de actualizar.
:::

#### Qué Cambia Automáticamente {#what-changes-automatically}

- El esquema de base de datos se migra de v3.1 a v4.0
- Nuevas tablas creadas: `users`, `sessions`, `audit_log`
- Cuenta de admin por defecto creada automáticamente
- Todas las sesiones existentes invalidadas

#### Lo que Debe Hacer {#what-you-must-do}

1. **Iniciar sesión** con las credenciales de admin por defecto:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09`
2. **Cambiar la contraseña** cuando se solicite (requerido en el primer inicio de sesión)
3. **Crear cuentas de usuario** para otros usuarios (Configuración → Usuarios)
4. **Actualizar integraciones de API externas** para incluir autenticación (ver [Cambios de API incompatibles hacia atrás](api-changes.md))
5. **Configurar la retención del log de auditoría** si es necesario (Configuración → Log de Auditoría)

#### Si Estás Bloqueado {#if-youre-locked-out}

Utiliza la herramienta de recuperación de admin:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Consulte la [Guía de Recuperación de Admin](../user-guide/admin-recovery.md) para obtener más detalles.

### Actualización a la Versión 0.8.x {#upgrading-to-version-08x}

#### Qué Cambia Automáticamente {#what-changes-automatically}

- Esquema de base de datos actualizado a v3.1
- Clave maestra generada para cifrado (almacenada en `.duplistatus.key`)
- Sesiones invalidadas (nuevas sesiones protegidas contra CSRF creadas)
- Contraseñas cifradas usando el nuevo sistema

#### Lo que Debe Hacer {#what-you-must-do}

1. **Actualizar plantillas de notificación** si las personalizó:
   - Reemplace `{backup_interval_value}` y `{backup_interval_type}` con `{backup_interval}`
   - Las plantillas por defecto se actualizan automáticamente

#### Notas de Seguridad {#security-notes}

- Asegúrese de que el archivo `.duplistatus.key` esté respaldado (tiene permisos 0400)
- Las sesiones expiran después de 24 horas

### Actualización a la Versión 0.7.x {#upgrading-to-version-07x}

#### Qué Cambia Automáticamente {#what-changes-automatically}

- tabla `machines` renombrada a `servers`
- campos `machine_id` renombrados a `server_id`
- Nuevos campos añadidos: `alias`, `notes`, `created_at`, `updated_at`

#### Lo que Debe Hacer {#what-you-must-do}

1. **Actualizar integraciones de API externas**:
   - Cambiar `totalMachines` → `totalServers` en `/api/summary`
   - Cambiar `machine` → `server` en objetos de respuesta de API
   - Cambiar `backup_types_count` → `backup_jobs_count` en `/api/lastbackups/{serverId}`
   - Actualizar rutas de extremos de `/api/machines/...` a `/api/servers/...`
2. **Actualizar Plantillas de notificación**:
   - Reemplazar `{machine_name}` con `{server_name}`

Ver [Cambios de API incompatibles hacia atrás](api-changes.md) para pasos detallados de migración de API.

## Lista de Verificación Posterior a la Migración {#post-migration-checklist}

Después de actualizar, verificar:

- [ ] Todos los servidores aparecen correctamente en el panel de control
- [ ] El historial de backups está completo y es accesible
- [ ] Las notificaciones funcionan (probar NTFY/correo electrónico)
- [ ] Las integraciones de API externas funcionan (si aplica)
- [ ] La configuración es accesible y correcta
- [ ] El monitoreo de backup funciona correctamente
- [ ] Sesión iniciada correctamente (0.9.x+)
- [ ] Contraseña de admin por defecto cambiada (0.9.x+)
- [ ] Cuentas de usuario creadas para otros usuarios (0.9.x+)
- [ ] Integraciones de API externas actualizadas con autenticación (0.9.x+)

## Solución de problemas {#troubleshooting}

### La migración falla {#migration-fails}

1. Verificar espacio en disco (el backup requiere espacio)
2. Verificar permisos de escritura en el directorio de datos
3. Revisar los logs del contenedor para errores específicos
4. Restaurar desde backup si es necesario (consulte Rollback a continuación)

### Datos Faltantes Después de la Migración {#data-missing-after-migration}

1. Verificar que el backup fue creado (verificar el directorio de datos)
2. Revisar los logs del contenedor para mensajes de creación de backup
3. Verificar la integridad del archivo de base de datos

### Problemas de Autenticación (0.9.x+) {#authentication-issues-09x}

1. Verificar que la cuenta admin por defecto existe (verificar logs)
2. Intentar credenciales por defecto: `admin` / `Duplistatus09`
3. Usar herramienta de recuperación admin si está bloqueado
4. Verificar que la tabla `users` existe en la base de datos

### Errores de API {#api-errors}

1. Revisar [Cambios de API incompatibles hacia atrás](api-changes.md) para actualizaciones de endpoints
2. Actualizar integraciones externas con nuevos nombres de campos
3. Añadir autenticación a las solicitudes de API (0.9.x+)
4. Probar endpoints de API después de la migración

### Problemas de Clave Maestra (0.8.x+) {#master-key-issues-08x}

1. Asegúrese de que el archivo `.duplistatus.key` sea accesible
2. Verificar que los permisos del archivo sean 0400
3. Verificar los logs del contenedor para errores de generación de claves

### Configuración de DNS de Podman {#podman-dns-configuration}

Si está utilizando Podman y experimenta problemas de conectividad de red después de actualizar, es posible que deba configurar los parámetros de DNS para su contenedor. Consulte la [sección de configuración de DNS](../installation/installation.md#configuring-dns-for-podman-containers) en la guía de instalación para obtener más detalles.

## Procedimiento de Reversión {#rollback-procedure}

Si necesita revertir a una versión anterior:

1. **Detener el contenedor**: `docker stop <container-name>` (o `podman stop <container-name>`)
2. **Encontrar su backup**: 
   - Si creó un backup usando la interfaz web (versión 1.2.1+), use ese archivo de backup descargado
   - Si creó un backup manual de volumen, extráigalo primero
   - Los backups de migración automática se encuentran en el directorio de datos (archivos `.db` con marca de tiempo)
3. **Restaurar la base de datos**: 
   - **Para backups de interfaz web (versión 1.2.1+)**: Use la función de restauración en `Configuración → Mantenimiento de base de datos` (consulte [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-restore))
   - **Para backups manuales**: Reemplace `backups.db` en su directorio de datos/volumen con el archivo de backup
4. **Usar versión de imagen anterior**: Descargue y ejecute la imagen de contenedor anterior
5. **Iniciar el contenedor**: Inicie con la versión anterior

:::warning
La reversión puede causar pérdida de datos si el esquema más nuevo es incompatible con la versión anterior. Asegúrese siempre de tener un backup reciente antes de intentar la reversión.
:::

### Solución de problemas de su restauración / reversión {#troubleshooting-your-restore--rollback}

Si la aplicación no se inicia o sus datos no aparecen después de una restauración o reversión, verifique los siguientes problemas comunes:

#### 1. Permisos de Archivo de Base de Datos (Linux/Podman) {#1-database-file-permissions-linuxpodman}

Si restauró el archivo como usuario `root`, es posible que la aplicación dentro del contenedor no tenga permiso para leerlo o escribir en él.

* **El síntoma:** Los logs muestran "Permission Denied" o "Read-only database."
* **La solución:** Restablezca los permisos del archivo dentro del contenedor para garantizar que sea accesible.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Nombre de archivo incorrecto {#2-incorrect-filename}

La aplicación busca específicamente un archivo denominado `backups.db`.

* **El síntoma:** La aplicación se inicia pero se ve "vacía" (como una instalación nueva).
* **La solución:** Verifique el directorio `/app/data/`. Si su archivo se llama `duplistatus-backup-2024.db` o tiene una extensión `.sqlite`, la aplicación lo ignorará. Utilice el comando `mv` o la interfaz gráfica de Docker Desktop para renombrarlo exactamente a `backups.db`.

#### 3. Contenedor No Reiniciado {#3-container-not-restarted}

En algunos sistemas, el uso de `docker cp` mientras el contenedor se está ejecutando puede no "actualizar" inmediatamente la conexión de la aplicación a la base de datos.

* **La solución:** Siempre realice un reinicio completo después de una restauración:

```bash
docker restart duplistatus
```

#### 4. Desajuste de Versión de Base de Datos {#4-database-version-mismatch}

Si está restaurando un backup de una versión mucho más nueva de duplistatus en una versión anterior de la aplicación, el esquema de la base de datos podría ser incompatible.

* **La solución:** Asegúrese siempre de que está ejecutando la misma versión (o una más reciente) de la imagen duplistatus que la que creó el backup. Verifique su versión con:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versiones del Esquema de Base de Datos {#database-schema-versions}

| Versión de Aplicación      | Versión de Schema | Cambios Clave                                      |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x y anteriores         | v1.0           | Schema inicial                                     |
| 0.7.x                      | v2.0, v3.0     | Configuraciones añadidas, servidores renombrados (máquinas → servidores)   |
| 0.8.x                      | v3.1           | Campos de backup mejorados, soporte de Cifrado         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Control de acceso de Usuario, autenticación, registro de auditoría |

## Obtener Ayuda {#getting-help}

- **Documentación**: [Guía de usuario](../user-guide/overview.md)
- **Referencia de API**: [Documentación de API](../api-reference/overview.md)
- **Cambios de API**: [Cambios de API incompatibles hacia atrás](api-changes.md)
- **Notas de la versión**: Verificar las notas de la versión específica para cambios detallados
- **Comunidad**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Problemas**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
