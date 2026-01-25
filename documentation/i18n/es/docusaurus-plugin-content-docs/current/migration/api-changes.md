# Cambios Incompatibles de la API

Este documento describe los cambios incompatibles en los endpoints de API externos en las diferentes versiones de duplistatus. Los endpoints de API externos son aquellos diseñados para ser utilizados por otras aplicaciones e integraciones (por ejemplo, integración con Homepage).

## Descripción general

Este documento cubre los cambios incompatibles en los endpoints de API externos que afectan a integraciones, scripts y aplicaciones que consumen estos endpoints. Para los endpoints de API internos utilizados por la interfaz web, los cambios se manejan automáticamente y no requieren actualizaciones manuales.

:::note
Los endpoints de API externos se mantienen retrocompatibles cuando es posible. Los cambios incompatibles solo se introducen cuando son necesarios para la consistencia, seguridad o mejoras de funcionalidad.
:::

## Cambios por Versión

### Versión 1.3.0

**Sin cambios incompatibles en los endpoints de API externos**

### Versión 1.2.1

**Sin cambios incompatibles en los endpoints de API externos**


### Versión 1.1.x

**Sin cambios incompatibles en los endpoints de API externos**

### Versión 1.0.x

**Sin cambios incompatibles en los endpoints de API externos**


### Versión 0.9.x

**Sin cambios incompatibles en los endpoints de API externos**

La versión 0.9.x introduce autenticación y requiere que todos los usuarios inicien sesión. Al actualizar desde la versión 0.8.x:

1. **Autenticación requerida**: Todas las páginas y endpoints de API internos ahora requieren autenticación
2. **Cuenta de administrador predeterminada**: Se crea automáticamente una cuenta de administrador predeterminada:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09` (debe cambiarse en el primer inicio de sesión)
3. **Invalidación de sesiones**: Todas las sesiones existentes son invalidadas
4. **Acceso a API externa**: Los endpoints de API externos (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecen sin autenticación para compatibilidad con integraciones y Duplicati

### Versión 0.8.x

**Sin cambios incompatibles en los endpoints de API externos**

La versión 0.8.x no introduce cambios incompatibles en los endpoints de API externos. Los siguientes endpoints permanecen sin cambios:

- `/api/summary` - Estructura de respuesta sin cambios
- `/api/lastbackup/{serverId}` - Estructura de respuesta sin cambios
- `/api/lastbackups/{serverId}` - Estructura de respuesta sin cambios
- `/api/upload` - Formato de solicitud/respuesta sin cambios

#### Mejoras de seguridad

Aunque no se realizaron cambios incompatibles en los endpoints de API externos, la versión 0.8.x incluye mejoras de seguridad:

- **Protección CSRF**: La validación de token CSRF se aplica para solicitudes de API que modifican estado, pero las APIs externas permanecen compatibles
- **Seguridad de contraseñas**: Los endpoints de contraseña están restringidos a la interfaz de usuario por razones de seguridad

:::note
Estas mejoras de seguridad no afectan a los endpoints de API externos utilizados para leer datos de respaldo. Si tiene scripts personalizados que usan endpoints internos, pueden requerir manejo de tokens CSRF.
:::

### Versión 0.7.x

La versión 0.7.x introduce varios cambios incompatibles en los endpoints de API externos que requieren actualizaciones en las integraciones externas.

#### Cambios Incompatibles

##### Renombrado de campos

- **`totalMachines`** → **`totalServers`** en el endpoint `/api/summary`
- **`machine`** → **`server`** en objetos de respuesta de API
- **`backup_types_count`** → **`backup_jobs_count`** en el endpoint `/api/lastbackups/{serverId}`

##### Cambios en rutas de endpoints

- Todos los endpoints de API que usaban `/api/machines/...` ahora usan `/api/servers/...`
- Los nombres de parámetros cambiaron de `machine_id` a `server_id` (la codificación URL sigue funcionando con ambos)

#### Cambios en la estructura de respuesta

La estructura de respuesta para varios endpoints ha sido actualizada para mayor consistencia:

##### `/api/summary`

**Antes (0.6.x y anterior):**
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
  "totalServers": 3,  // Cambiado de "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}`

**Antes (0.6.x y anterior):**
```json
{
  "machine": {  // Cambiado a "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... detalles del respaldo
  },
  "status": 200
}
```

**Después (0.7.x+):**
```json
{
  "server": {  // Cambiado de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... detalles del respaldo
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}`

**Antes (0.6.x y anterior):**
```json
{
  "machine": {  // Cambiado a "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... array de respaldos
  ],
  "backup_types_count": 2,  // Cambiado a "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**Después (0.7.x+):**
```json
{
  "server": {  // Cambiado de "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... array de respaldos
  ],
  "backup_jobs_count": 2,  // Cambiado de "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Pasos de migración

Si está actualizando desde una versión anterior a 0.7.x, siga estos pasos:

1. **Actualizar referencias de campos**: Reemplace todas las referencias a nombres de campos antiguos por los nuevos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Actualizar claves de objeto**: Cambie `machine` a `server` al analizar respuestas
   - Actualice cualquier código que acceda a `response.machine` a `response.server`

3. **Actualizar rutas de endpoints**: Cambie todos los endpoints que usen `/api/machines/...` a `/api/servers/...`
   - Nota: Los parámetros pueden seguir aceptando identificadores antiguos; las rutas deben actualizarse

4. **Probar la integración**: Verifique que su integración funcione con la nueva estructura de API
   - Pruebe todos los endpoints que usa su aplicación
   - Verifique que el análisis de respuestas maneje correctamente los nuevos nombres de campos

5. **Actualizar documentación**: Actualice cualquier documentación interna que haga referencia a la API antigua
   - Actualice ejemplos de API y referencias de nombres de campos

## Compatibilidad

### Retrocompatibilidad

- **Versión 1.2.1**: Completamente retrocompatible con la estructura de API 1.1.x
- **Versión 1.1.x**: Completamente retrocompatible con la estructura de API 1.0.x
- **Versión 1.0.x**: Completamente retrocompatible con la estructura de API 0.9.x
- **Versión 0.9.x**: Completamente retrocompatible con la estructura de API 0.8.x
- **Versión 0.8.x**: Completamente retrocompatible con la estructura de API 0.7.x
- **Versión 0.7.x**: No retrocompatible con versiones anteriores a 0.7.x
  - Los nombres de campos antiguos no funcionarán
  - Las rutas de endpoints antiguas no funcionarán

### Soporte futuro

- Los nombres de campos antiguos de versiones anteriores a 0.7.x no son soportados
- Las rutas de endpoints antiguas de versiones anteriores a 0.7.x no son soportadas
- Las versiones futuras mantendrán la estructura de API actual a menos que se necesiten cambios incompatibles

## Resumen de endpoints de API externos

Los siguientes endpoints de API externos se mantienen para retrocompatibilidad y permanecen sin autenticación:

| Endpoint | Método | Descripción | Cambios incompatibles |
|----------|--------|-------------|----------------------|
| `/api/summary` | GET | Resumen general de operaciones de respaldo | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Último respaldo para un servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Últimos respaldos para todos los trabajos | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Subir datos de respaldo desde Duplicati | Sin cambios incompatibles |

## ¿Necesita ayuda?

Si necesita asistencia para actualizar su integración:

- **Referencia de API**: Consulte la [Referencia de API](../api-reference/overview.md) para documentación actual de endpoints
- **APIs externas**: Vea [APIs externas](../api-reference/external-apis.md) para documentación detallada de endpoints
- **Guía de migración**: Revise la [Guía de migración](version_upgrade.md) para información general de migración
- **Notas de versión**: Revise las [Notas de versión](../release-notes/0.8.x.md) específicas para contexto adicional
- **Soporte**: Abra un issue en [GitHub](https://github.com/wsj-br/duplistatus/issues) para obtener soporte
