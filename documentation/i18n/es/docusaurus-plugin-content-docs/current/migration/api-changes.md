---
translation_last_updated: '2026-02-15T20:57:40.471Z'
source_file_mtime: '2026-02-15T20:27:31.910Z'
source_file_hash: 7de89d625f466245
translation_language: es
source_file_path: migration/api-changes.md
---
# Cambios de API incompatibles con versiones anteriores {#api-breaking-changes}

Este documento describe los cambios disruptivos en los puntos finales de la API externa en diferentes versiones de duplistatus. Los puntos finales de la API externa son aquellos diseñados para ser utilizados por otras aplicaciones e integraciones (por ejemplo, integración de Homepage).

## Resumen {#overview}

Este documento cubre cambios disruptivos en los puntos finales de API externos que afectan a las integraciones, scripts y aplicaciones que consumen estos puntos finales. Para los puntos finales de API internos utilizados por la interfaz web, los cambios se manejan automáticamente y no requieren actualizaciones manuales.

:::note
Los puntos finales de API externos se mantienen para compatibilidad hacia atrás cuando es posible. Los cambios disruptivos solo se introducen cuando es necesario para mejoras de consistencia, seguridad o funcionalidad.
:::

## Cambios Específicos de Versión {#version-specific-changes}

### Versión 1.3.0 {#version-130}

**Sin cambios disruptivos en los puntos finales de la API externa**

### Versión 1.2.1 {#version-121}

**Sin cambios disruptivos en los puntos finales de la API externa**

### Versión 1.1.x {#version-11x}

**Sin cambios disruptivos en los puntos finales de la API externa**

### Versión 1.0.x {#version-10x}

**Sin cambios disruptivos en los puntos finales de la API externa**

### Versión 0.9.x {#version-09x}

**Sin cambios disruptivos en los puntos finales de la API externa**

La versión 0.9.x introduce autenticación y requiere que todos los usuarios inicien sesión. Al actualizar desde la versión 0.8.x:

1. **Autenticación requerida**: Todas las páginas y puntos finales de API internos ahora requieren autenticación
2. **Cuenta Admin por defecto**: Una cuenta admin por defecto se crea automáticamente:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09` (debe cambiarse al iniciar sesión por primera vez)
3. **Invalidación de sesiones**: Todas las sesiones existentes se invalidan
4. **Acceso a API externa**: Los puntos finales de API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecen sin autenticación para compatibilidad con integraciones y Duplicati

### Versión 0.8.x {#version-08x}

**Sin cambios disruptivos en los puntos finales de la API externa**

Versión 0.8.x no introduce cambios disruptivos en los puntos finales de API externos. Los siguientes puntos finales permanecen sin cambios:

- `/api/summary` - Estructura de respuesta sin cambios
- `/api/lastbackup/{serverId}` - Estructura de respuesta sin cambios
- `/api/lastbackups/{serverId}` - Estructura de respuesta sin cambios
- `/api/upload` - Formato de solicitud/respuesta sin cambios

#### Mejoras de Seguridad {#security-enhancements}

Aunque no se realizaron cambios importantes en los puntos finales de la API externa, la versión 0.8.x incluye mejoras de seguridad:

- **Protección CSRF**: La validación de token CSRF se aplica para solicitudes de API que cambian estado, pero las API externas siguen siendo compatibles
- **Seguridad de Contraseña**: Los puntos finales de contraseña están restringidos a la interfaz de usuario por razones de seguridad

:::note
Estas mejoras de seguridad no afectan los puntos finales de API externos utilizados para leer datos de backup. Si tiene scripts personalizados que utilizan puntos finales internos, es posible que requieran manejo de tokens CSRF.
:::

### Versión 0.7.x {#version-07x}

La versión 0.7.x introduce varios cambios disruptivos en los puntos finales de la API externa que requieren actualizaciones en las integraciones externas.

#### Cambios Importantes {#breaking-changes}

##### Cambio de Nombre de Campo {#field-renaming}

- **`totalMachines`** → **`totalServers`** en el endpoint `/api/summary`
- **`machine`** → **`server`** en objetos de respuesta de API
- **`backup_types_count`** → **`backup_jobs_count`** en el endpoint `/api/lastbackups/{serverId}`

##### Cambios en la Ruta del Endpoint {#endpoint-path-changes}

- Todos los puntos finales de API que anteriormente utilizaban `/api/machines/...` ahora utilizan `/api/servers/...`
- Los nombres de parámetros cambiaron de `machine_id` a `server_id` (la codificación de URL sigue funcionando con ambos)

#### Cambios en la Estructura de Respuesta {#response-structure-changes}

La estructura de respuesta para varios endpoints ha sido actualizada por consistencia:

##### `/api/summary` {#apisummary}

**Antes (0.6.x y anteriores):**

```json
{
  "totalMachines": 3,
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

**Después (0.7.x+):**

```json
{
  "totalServers": 3,  // Changed from "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}` {#apilastbackupserverid}

**Antes (0.6.x y anteriores):**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

**Después (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}` {#apilastbackupsserverid}

**Antes (0.6.x y anteriores):**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Changed to "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Después (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Changed from "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Pasos de Migración {#migration-steps}

Si está actualizando desde una versión anterior a 0.7.x, siga estos pasos:

1. **Actualizar Referencias de Campo**: Reemplaza todas las referencias a nombres de campo antiguos con los nuevos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Actualizar Claves de Objeto**: Cambiar `machine` a `server` en el análisis de respuestas
   - Actualizar cualquier código que acceda a `response.machine` a `response.server`

3. **Actualizar Rutas de Endpoints**: Cambiar cualquier endpoint que use `/api/machines/...` a `/api/servers/...`
   - Nota: Los parámetros aún pueden aceptar identificadores antiguos; las rutas deben actualizarse

4. **Integración de Pruebas**: Verificar que su integración funciona con la nueva estructura de API
   - Probar todos los puntos finales que utiliza su aplicación
   - Verificar que el análisis de respuestas maneja correctamente los nuevos nombres de campos

5. **Actualizar Documentación**: Actualizar cualquier documentación interna que haga referencia a la API antigua
   - Actualizar ejemplos de API y referencias de nombres de campos

## Compatibilidad {#compatibility}

### Compatibilidad hacia atrás {#backward-compatibility}

- **Versión 1.2.1**: Totalmente compatible hacia atrás con la estructura de API 1.1.x
- **Versión 1.1.x**: Totalmente compatible hacia atrás con la estructura de API 1.0.x
- **Versión 1.0.x**: Totalmente compatible hacia atrás con la estructura de API 0.9.x
- **Versión 0.9.x**: Totalmente compatible hacia atrás con la estructura de API 0.8.x
- **Versión 0.8.x**: Totalmente compatible hacia atrás con la estructura de API 0.7.x
- **Versión 0.7.x**: No es compatible hacia atrás con versiones anteriores a 0.7.x
  - Los nombres de campo antiguos no funcionarán
  - Las rutas de extremo antiguas no funcionarán

### Soporte Futuro {#future-support}

- Los nombres de campo antiguos de versiones anteriores a 0.7.x no son compatibles
- Las rutas de punto de conexión antiguas de versiones anteriores a 0.7.x no son compatibles
- Las versiones futuras mantendrán la estructura de API actual a menos que sean necesarios cambios importantes

## Resumen de Puntos Finales de API Externos {#summary-of-external-api-endpoints}

Los siguientes puntos finales de API externos se mantienen por compatibilidad con versiones anteriores y permanecen sin autenticación:

| Endpoint | Método | Descripción | Cambios Incompatibles |
|----------|--------|-------------|----------------------|
| `/api/summary` | GET | Resumen general de operaciones de backup | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Último backup para un servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Últimos backups para todos los trabajos de backup | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Subir datos de backup desde Duplicati | No hay cambios incompatibles |

## ¿Necesita ayuda? {#need-help}

Si necesita asistencia para actualizar su integración:

- **Referencia de API**: Verifique la [Referencia de API](../api-reference/overview.md) para la documentación actual de puntos finales
- **APIs Externas**: Consulte [APIs Externas](../api-reference/external-apis.md) para documentación detallada de puntos finales
- **Guía de Migración**: Revise la [Guía de Migración](version_upgrade.md) para información general de migración
- **Notas de la Versión**: Revise las [Notas de la Versión](../release-notes/0.8.x.md) específicas de la versión para contexto adicional
- **Soporte**: Abra un problema en [GitHub](https://github.com/wsj-br/duplistatus/issues) para obtener soporte
