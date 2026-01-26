# Guía de Migración

Esta guía explica cómo actualizar entre versiones de duplistatus. Las migraciones son automáticas: el esquema de la base de datos se actualiza a sí mismo cuando inicia una nueva Versión.

Los pasos manuales solo son necesarios si ha personalizado Plantillas de notificación (la Versión 0.8.x cambió variables de plantilla) o Integraciones de API externas que necesitan actualización (la Versión 0.7.x cambió nombres de campos de API, la Versión 0.9.x requiere autenticación).

## resumen

duplistatus migra automáticamente el esquema de su base de datos al actualizar. El Sistema:

1. Crea un backup de su base de datos antes de realizar cambios
2. Actualiza el esquema de la base de datos a la última Versión
3. Preserva Todos los datos existentes (Servidores, Backups, configuración)
4. Verifica que la migración se completó exitosamente

## Realizando Backup de Su Base de Datos Antes de la Migración

Antes de actualizar a una nueva Versión, se recomienda crear un backup de su base de datos. Esto asegura que pueda restaurar sus datos si algo sale mal durante el proceso de migración.

### Si Está Ejecutando la Versión 1.2.1 o Posterior

Utilice la función de backup de base de datos integrada:

1. Navegue a `Configuración → Mantenimiento de base de datos` en la interfaz web
2. En la sección **Backup de base de datos**, Seleccionar un formato de backup:
   - **Archivo de base de datos (.db)**: Formato binario - backup más rápido, preserva Todos la estructura de la base de datos exactamente
   - **Volcado SQL (.sql)**: Formato de texto - sentencias SQL legibles por humanos
3. Haga clic en `Descargar backup`
4. El archivo de backup se Descargará a su computadora con un nombre de archivo con marca de tiempo

Para más Detalles, consulte la documentación de [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-backup).

### Si Está Ejecutando una Versión Anterior a 1.2.1

#### backup

Debe realizar un backup manual de la base de datos antes de continuar. El Archivo de base de datos se encuentra en `/app/data/backups.db` dentro del contenedor.

##### Para Usuarios de Linux

Si está en Linux, no se preocupe por iniciar contenedores auxiliares. Puede usar el comando nativo `cp` para extraer la base de datos directamente del contenedor en ejecución a su Host.

###### Usando Docker o Podman:

```bash
# Reemplace 'duplistatus' con el nombre real de su contenedor si es diferente
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Si usa Podman, simplemente reemplace `docker` con `podman` en el comando anterior.)

##### Para Usuarios de Windows

Si está ejecutando Docker Desktop en Windows, tiene dos formas simples de manejar esto sin usar la línea de comandos:

###### Opción A: Usar Docker Desktop (Lo más fácil)

1. Abra el Panel de control de Docker Desktop.
2. Vaya a la pestaña Contenedores y haga clic en su contenedor duplistatus.
3. Haga clic en la pestaña Archivos.
4. Navegue a `/app/data/`.
5. Haga clic derecho en `backups.db` y Seleccionar **Guardar como...** para Descargar a sus carpetas de Windows.

###### Opción B: Usar PowerShell

Si prefiere la terminal, puede usar PowerShell para Copiar el Archivo a su Escritorio:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Si Usa Montajes de Vinculación

Si originalmente configuró su contenedor usando un montaje de vinculación (por ejemplo, asignó una carpeta local como `/opt/duplistatus` al contenedor), no necesita comandos de Docker en absoluto. Solo Copiar el Archivo usando su administrador de Archivos:

- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Simplemente Copiar el Archivo en **Explorador de Archivos** desde la carpeta que designó durante la configuración.

#### Restaurando Sus Datos

Si necesita restaurar su base de datos desde un backup Anterior, siga los pasos a continuación según su Sistema operativo.

:::info[IMPORTANT]
Detenga el contenedor antes de restaurar la base de datos para evitar corrupción de Archivos.
:::

##### Para Usuarios de Linux

La forma más fácil de restaurar es "empujar" el archivo de backup nuevamente a la ruta de almacenamiento interno del contenedor.

###### Usando Docker o Podman:

```bash
# detener el contenedor
docker stop duplistatus

# Reemplace 'duplistatus-backup.db' con el nombre real de su archivo de backup
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Reiniciar el contenedor
docker start duplistatus
```

##### Para Usuarios de Windows

Si está usando Docker Desktop, puede realizar la restauración a través de la GUI o PowerShell.

###### Opción A: Usar Docker Desktop (GUI)

1. Asegúrese de que el contenedor duplistatus esté Activo (Docker Desktop requiere que el contenedor esté activo para Subir Archivos a través de la GUI).
2. Vaya a la pestaña Archivos en la configuración de su contenedor.
3. Navegue a `/app/data/`.
4. Haga clic derecho en el backups.db existente y Seleccionar Eliminar.
5. Haga clic en el botón Importar (o haga clic derecho en el área de carpeta) y Seleccionar su archivo de backup de su computadora.

Cambie el nombre del Archivo importado exactamente a backups.db si tiene una marca de tiempo en el nombre.

Reinicie el contenedor.

###### Opción B: Usar PowerShell

```powershell
# Copiar el Archivo desde su Escritorio nuevamente al contenedor
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Reiniciar el contenedor
docker start duplistatus
```

##### Si Usa Montajes de Vinculación

Si está usando una carpeta local asignada al contenedor, no necesita comandos especiales.

1. Detenga el contenedor.
2. Copiar manualmente su archivo de backup a su carpeta asignada (por ejemplo, `/opt/duplistatus` o `C:\duplistatus_data`).
3. Asegúrese de que el Archivo se nombre exactamente `backups.db`.
4. Inicie el contenedor.

:::note
Si restaura la base de datos manualmente, puede encontrar Errores de permisos.

Verifique los registros del contenedor y ajuste los permisos si es necesario. Consulte la sección [Solución de problemas](#troubleshooting-your-restore--rollback) a continuación para más información.
:::

## Proceso de Migración Automática

Cuando inicia una nueva Versión, las migraciones se ejecutan automáticamente:

1. **Creación de Backup**: Se crea un Backup con marca de tiempo en su directorio de datos
2. **Actualización de Esquema**: Las tablas y campos de la base de datos se actualizan según sea necesario
3. **Migración de Datos**: Todos los datos existentes se preservan y se migran
4. **Verificación**: El Éxito de la migración se registra

### Monitoreando la Migración

Verifique los Logs de Docker para monitorear el progreso de la migración:

```bash
docker logs <container-name>
```

Busque Mensajes como:

- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Notas de Migración Específicas de Versión

### Actualización a la Versión 0.9.x o Posterior (Esquema v4.0)

:::warning
**La autenticación ahora es obligatoria.** Todos los Usuarios deben Iniciar sesión después de actualizar.
:::

#### Qué Cambia Automáticamente

- El esquema de la base de datos se migra de v3.1 a v4.0
- Nuevas tablas Creado: `users`, `sessions`, `audit_log`
- Cuenta de Admin Por defecto Creado automáticamente
- Todos las sesiones existentes invalidadas

#### Qué Debe Hacer

1. **Iniciar sesión** con credenciales de Admin Por defecto:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09`
2. **Cambiar la Contraseña** cuando se le solicite (requerido en el primer Iniciar sesión)
3. **Crear usuario** cuentas para otros Usuarios (Configuración → Usuarios)
4. **Actualizar Integraciones de API externas** para incluir autenticación (consulte [Cambios de ruptura de API](api-changes.md))
5. **Configurar** retención del Log de Auditoría si es necesario (Configuración → Log de Auditoría)

#### Si Está Bloqueado

Utilice la herramienta de recuperación de Admin:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Consulte [Guía de Recuperación de Admin](../user-guide/admin-recovery.md) para Detalles.

### Actualización a la Versión 0.8.x

#### Qué Cambia Automáticamente

- Esquema de base de datos actualizado a v3.1
- Clave maestra generada para Cifrado (almacenada en `.duplistatus.key`)
- Sesiones invalidadas (nuevas sesiones protegidas por CSRF Creado)
- Contraseñas cifradas usando nuevo Sistema

#### Qué Debe Hacer

1. **Actualizar Plantillas de notificación** si las personalizó:
   - Reemplace `{backup_interval_value}` y `{backup_interval_type}` con `{backup_interval}`
   - Las Plantillas Por defecto se actualizan automáticamente

#### Notas de Seguridad

- Asegúrese de que el Archivo `.duplistatus.key` tenga backup (tiene permisos 0400)
- Las sesiones expiran después de 24 horas

### Actualización a la Versión 0.7.x

#### Qué Cambia Automáticamente

- La tabla `machines` se renombró a `servers`
- Los campos `machine_id` se renombraron a `server_id`
- Nuevos campos Añadido: `alias`, `notes`, `created_at`, `updated_at`

#### Qué Debe Hacer

1. **Actualizar Integraciones de API externas**:
   - Cambiar `totalMachines` → `totalServers` en `/api/summary`
   - Cambiar `machine` → `server` en objetos de respuesta de API
   - Cambiar `backup_types_count` → `backup_jobs_count` en `/api/lastbackups/{serverId}`
   - Actualizar rutas de punto final de `/api/machines/...` a `/api/servers/...`
2. **Actualizar Plantillas de notificación**:
   - Reemplace `{machine_name}` con `{server_name}`

Consulte [Cambios de ruptura de API](api-changes.md) para pasos detallados de migración de API.

## Lista de Verificación Posterior a la Migración

Después de actualizar, verifique:

- [ ] Todos los Servidores aparecen correctamente en el Panel de control
- [ ] El Historial de backups está completo y es accesible
- [ ] Las Notificaciones funcionan (prueba NTFY/Correo electrónico)
- [ ] Las Integraciones de API externas funcionan (si corresponde)
- [ ] La Configuración es accesible y correcta
- [ ] El Monitoreo de backups retrasados funciona correctamente
- [ ] Iniciar sesión exitosamente (0.9.x+)
- [ ] Cambió la Contraseña de Admin Por defecto (0.9.x+)
- [ ] Creado cuentas de Usuario para otros Usuarios (0.9.x+)
- [ ] Actualizar Integraciones de API externas con autenticación (0.9.x+)

## Solución de Problemas

### La Migración Falla

1. Verifique el espacio en disco (el backup requiere espacio)
2. Verifique los permisos de escritura en el directorio de datos
3. Revise los Logs del contenedor para Errores específicos
4. Restaurar desde backup si es necesario (consulte Reversión a continuación)

### Datos Faltantes Después de la Migración

1. Verifique que se Creado el backup (Verifique el directorio de datos)
2. Revise los Logs del contenedor para Mensajes de creación de backup
3. Verifique la integridad del Archivo de base de datos

### Problemas de Autenticación (0.9.x+)

1. Verifique que la cuenta de Admin Por defecto existe (Verifique los Logs)
2. Intente credenciales Por defecto: `admin` / `Duplistatus09`
3. Utilice la herramienta de recuperación de Admin si está Bloqueado
4. Verifique que la tabla `users` existe en la base de datos

### Errores de API

1. Revise [Cambios de ruptura de API](api-changes.md) para actualizaciones de punto final
2. Actualizar Integraciones externas con nuevos nombres de campos
3. Añadir autenticación a solicitudes de API (0.9.x+)
4. Probar puntos finales de API después de la migración

### Problemas de Clave Maestra (0.8.x+)

1. Asegúrese de que el Archivo `.duplistatus.key` sea accesible
2. Verifique que los permisos de Archivo sean 0400
3. Verifique los Logs del contenedor para Errores de generación de claves

### Configuración de DNS de Podman

Si está usando Podman y experimenta problemas de conectividad de red después de actualizar, es posible que deba Configurar los ajustes de DNS para su contenedor. Consulte la [sección de configuración de DNS](../installation/installation.md#configuring-dns-for-podman-containers) en la guía de instalación para Detalles.

## Procedimiento de Reversión

Si necesita revertir a una Versión Anterior:

1. **Detenga el contenedor**: `docker stop <container-name>` (o `podman stop <container-name>`)
2. **Encuentre su backup**:
   - Si creó un backup usando la interfaz web (Versión 1.2.1+), use ese archivo de backup Descargado
   - Si creó un backup de volumen manual, extráigalo primero
   - Los backups de migración automática se encuentran en el directorio de datos (Archivos `.db` con marca de tiempo)
3. **Restaurar la base de datos**:
   - **Para backups de interfaz web (Versión 1.2.1+)**: Utilice la función de restauración en `Configuración → Mantenimiento de base de datos` (consulte [Mantenimiento de base de datos](../user-guide/settings/database-maintenance.md#database-restore))
   - **Para backups manuales**: Reemplace `backups.db` en su directorio/volumen de datos con el archivo de backup
4. **Utilice la Versión de imagen Anterior**: Extraiga y ejecute la imagen de contenedor Anterior
5. **Inicie el contenedor**: Inicie con la Versión Anterior

:::warning
La reversión puede causar pérdida de datos si el esquema más nuevo es incompatible con la Versión anterior. Siempre asegúrese de tener un backup reciente antes de intentar la reversión.
:::

### Solución de Problemas de Su Restauración / Reversión

Si la aplicación no Inicia o sus datos no aparecen después de una restauración o reversión, Verifique los siguientes problemas comunes:

#### 1. Permisos de Archivo de Base de Datos (Linux/Podman)

Si restauró el Archivo como el Usuario `root`, la aplicación dentro del contenedor podría no tener permiso para leerlo o escribir en él.

- **El Síntoma:** Los Logs Mostrar "Permission Denied" o "Read-only database."
- **La Solución:** Restablezca los permisos del Archivo dentro del contenedor para asegurar que sea accesible.

```bash
# Establecer propiedad (generalmente UID 1000 o el Usuario de la aplicación)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Establecer permisos de lectura/escritura
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Nombre de Archivo Incorrecto

La aplicación busca específicamente un Archivo llamado `backups.db`.

- **El Síntoma:** La aplicación Inicia pero se ve "vacía" (como una instalación nueva).
- **La Solución:** Verifique el directorio `/app/data/`. Si su Archivo se llama `duplistatus-backup-2024.db` o tiene una extensión `.sqlite`, la aplicación lo ignorará. Utilice el comando `mv` o la GUI de Docker Desktop para renombrarlo exactamente a `backups.db`.

#### 3. Contenedor No Reiniciado

En algunos Sistemas, usar `docker cp` mientras el contenedor está en ejecución puede no "actualizar" inmediatamente la conexión de la aplicación a la base de datos.

- **La Solución:** Siempre realice un reinicio completo después de una restauración:

```bash
docker restart duplistatus
```

#### 4. Desajuste de Versión de Base de Datos

Si está restaurando un backup de una Versión mucho más nueva de duplistatus en una Versión anterior de la aplicación, el esquema de la base de datos podría ser incompatible.

- **La Solución:** Siempre asegúrese de estar ejecutando la misma (o una más nueva) Versión de la imagen duplistatus que la que Creado el backup. Verifique su Versión con:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Versiones de Esquema de Base de Datos

| Versión de Aplicación                                                                                                                                                                             | Versión de Esquema                         | Cambios Clave                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| 0.6.x y anteriores                                                                                                                                                | v1.0                       | Esquema inicial                                               |
| 0.7.x                                                                                                                                                             | v2.0, v3.0 | Configuraciones Añadido, máquinas renombradas → Servidores    |
| 0.8.x                                                                                                                                                             | v3.1                       | Campos de backup mejorados, soporte de Cifrado                |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0                       | Control de acceso de Usuario, autenticación, Log de Auditoría |

## Obteniendo Ayuda

- **Documentación**: [Guía de Usuario](../user-guide/overview.md)
- **Referencia de API**: [Documentación de API](../api-reference/overview.md)
- **Cambios de API**: [Cambios de ruptura de API](api-changes.md)
- **Notas de Lanzamiento**: Verifique las notas de lanzamiento específicas de la Versión para cambios detallados
- **Comunidad**: [Discusiones de GitHub](https://github.com/wsj-br/duplistatus/discussions)
- **Problemas**: [Problemas de GitHub](https://github.com/wsj-br/duplistatus/issues)
