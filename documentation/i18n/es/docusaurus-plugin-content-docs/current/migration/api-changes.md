# Cambios incompatibles con versiones anteriores en la API {/* #backward-incompatible-api-changes */}

Este documento describe los cambios incompatibles con versiones anteriores en los puntos finales de la API externa en diferentes versiones de duplistatus. Los puntos finales de la API externa son aquellos diseñados para ser utilizados por otras aplicaciones e integraciones (por ejemplo, integración de la página de inicio).

## Vista general {/* #overview */}

Este documento cubre los cambios incompatibles con versiones anteriores en los puntos finales de la API externa que afectan a las integraciones, scripts y aplicaciones que consumen estos puntos finales. Para los puntos finales de la API interna utilizados por la interfaz web, los cambios se manejan automáticamente y no requieren actualizaciones manuales.

:::note
Los puntos finales de la API externa se mantienen para la compatibilidad con versiones anteriores cuando sea posible. Los cambios incompatibles solo se introducen cuando sea necesario para garantizar la consistencia, la seguridad o las mejoras en la funcionalidad.
:::

## Cambios específicos de la versión {/* #version-specific-changes */}

### Versión 1.3.0 {/* #version-130 */}

**No hay cambios incompatibles con versiones anteriores en los puntos finales de la API externa**

### Versión 1.2.1 {/* #version-121 */}

**No hay cambios incompatibles con versiones anteriores en los puntos finales de la API externa**

### Versión 1.1.x {/* #version-11x */}

**No hay cambios incompatibles con versiones anteriores en los puntos finales de la API externa**

### Versión 1.0.x {/* #version-10x */}

**No hay cambios incompatibles con versiones anteriores en los puntos finales de la API externa**

### Versión 0.9.x {/* #version-09x */}

**No hay cambios incompatibles con versiones anteriores en los puntos finales de la API externa**

La versión 0.9.x introduce autenticación y requiere que todos los usuarios inicien sesión. Al actualizar desde la versión 0.8.x:

1. **Autenticación requerida**: Todas las páginas y puntos finales de la API interna ahora requieren autenticación
2. **Cuenta de administrador predeterminada**: Se crea automáticamente una cuenta de administrador predeterminada:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09` (debe cambiarse en el primer inicio de sesión)
3. **Invalidación de sesión**: Todas las sesiones existentes se invalidan
4. **Acceso a la API externa**: Los puntos finales de la API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) siguen siendo no autenticados para garantizar la compatibilidad con las integraciones y Duplicati

### Versión 0.8.x {/* #version-08x */}

**No hay cambios incompatibles con versiones anteriores en los puntos finales de la API externa**

La versión 0.8.x no introduce cambios de ruptura en los puntos finales de las API externas. Los siguientes puntos finales permanecen sin cambios:

- `/api/summary` - Estructura de respuesta sin cambios
- `/api/lastbackup/{serverId}` - Estructura de respuesta sin cambios
- `/api/lastbackups/{serverId}` - Estructura de respuesta sin cambios
- `/api/upload` - Formato de solicitud/respuesta sin cambios

#### Mejoras de seguridad {/* #security-enhancements */}

Aunque no se realizaron cambios de ruptura en los puntos finales de las API externas, la versión 0.8.x incluye mejoras de seguridad:

- **Protección CSRF**: La validación de tokens CSRF se aplica a las solicitudes de API que cambian el estado, pero las API externas siguen siendo compatibles
- **Seguridad de contraseña**: Los puntos finales de contraseña están restringidos a la interfaz de usuario por razones de seguridad

:::note
Estas mejoras de seguridad no afectan los puntos finales de las API externas utilizados para leer datos de copia de seguridad. Si tiene scripts personalizados que utilizan puntos finales internos, es posible que necesiten el manejo de tokens CSRF.
:::

### Versión 0.7.x {/* #version-07x */}

La versión 0.7.x introduce varios cambios de ruptura en los puntos finales de las API externas que requieren actualizaciones en las integraciones externas.

#### Cambios de ruptura {/* #breaking-changes */}

##### Renombrado de campos {/* #field-renaming */}

- `totalMachines` → `totalServers` en el punto final `/api/summary`
- `machine` → `server` en los objetos de respuesta de la API
- `backup_types_count` → `backup_jobs_count` en el punto final `/api/lastbackups/{serverId}`

##### Cambios en las rutas de los puntos finales {/* #endpoint-path-changes */}

- Todos los puntos finales de la API que anteriormente usaban `/api/machines/...` ahora usan `/api/servers/...`
- Los nombres de los parámetros cambiaron de `machine_id` a `server_id` (la codificación URL sigue funcionando con ambos)

#### Cambios en la estructura de respuesta {/* #response-structure-changes */}

La estructura de respuesta para varios puntos finales se ha actualizado para garantizar la consistencia:

##### `/api/summary` {/* #apisummary */}

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

##### `/api/lastbackup/{serverId}` {/* #apilastbackupserverid */}

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

##### `/api/lastbackups/{serverId}` {/* #apilastbackupsserverid */}

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

## Pasos de Migración {/* #migration-steps */}

Si estás actualizando desde una versión anterior a 0.7.x, sigue estos pasos:

1. **Actualizar Referencias de Campos**: Reemplaza todas las referencias a los nombres de campos antiguos con los nuevos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Actualizar Claves de Objetos**: Cambia `machine` a `server` en el análisis de respuestas
   - Actualiza cualquier código que acceda a `response.machine` a `response.server`

3. **Actualizar Rutas de Endpoints**: Cambia cualquier endpoint que use `/api/machines/...` a `/api/servers/...`
   - Nota: Los parámetros aún pueden aceptar identificadores antiguos; las rutas deben actualizarse

4. **Probar Integración**: Verifica que tu integración funcione con la nueva estructura de la API
   - Probar todos los endpoints que tu aplicación usa
   - Verifica que el análisis de respuestas maneje correctamente los nuevos nombres de campos

5. **Actualizar Documentación**: Actualiza cualquier documentación interna que haga referencia a la API antigua
   - Actualiza ejemplos de API y referencias de nombres de campos

## Compatibilidad {/* #compatibility */}

### Compatibilidad Hacia Atrás {/* #backward-compatibility */}

- **Versión 1.2.1**: Totalmente compatible hacia atrás con la estructura de API 1.1.x
- **Versión 1.1.x**: Totalmente compatible hacia atrás con la estructura de API 1.0.x
- **Versión 1.0.x**: Totalmente compatible hacia atrás con la estructura de API 0.9.x
- **Versión 0.9.x**: Totalmente compatible hacia atrás con la estructura de API 0.8.x
- **Versión 0.8.x**: Totalmente compatible hacia atrás con la estructura de API 0.7.x
- **Versión 0.7.x**: No es compatible hacia atrás con versiones anteriores a 0.7.x
  - Los nombres de campos antiguos no funcionarán
  - Las rutas de endpoints antiguas no funcionarán

### Soporte Futuro {/* #future-support */}

- Los nombres de campos antiguos de versiones pre-0.7.x no son compatibles
- Las rutas de endpoints antiguas de versiones pre-0.7.x no son compatibles
- Las versiones futuras mantendrán la estructura actual de la API a menos que sea necesario realizar cambios importantes

## Resumen de Endpoints de API Externos {/* #summary-of-external-api-endpoints */}

Los siguientes endpoints de API externos se mantienen para compatibilidad hacia atrás y siguen siendo no autenticados:

| Endpoint | Método | Descripción | Cambios Importantes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Resumen general de operaciones de copia de seguridad | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Última copia de seguridad para un servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Últimas copias de seguridad para todos los trabajos de copia de seguridad | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Subir datos de copia de seguridad desde Duplicati | Sin cambios importantes |

## ¿Necesitas ayuda? {/* #need-help */}

Si necesitas ayuda para actualizar tu integración:

- **Referencia de API**: Consulta la [Referencia de API](../api-reference/overview.md) para obtener la documentación actual de los puntos finales
- **APIs externas**: Consulta las [APIs externas](../api-reference/external-apis.md) para obtener documentación detallada de los puntos finales
- **Guía de migración**: Revisa la [Guía de migración](version_upgrade.md) para obtener información general sobre la migración
- **Notas de versión**: Revisa las [Notas de versión](../release-notes/0.8.x.md) específicas de la versión para obtener más contexto
- **Soporte**: Abre un problema en [GitHub](https://github.com/wsj-br/duplistatus/issues) para obtener soporte
