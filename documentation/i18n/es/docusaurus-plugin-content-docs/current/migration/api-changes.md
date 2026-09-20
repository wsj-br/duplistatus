# Cambios de API incompatibles con versiones anteriores {/* #backward-incompatible-api-changes */}

Este documento describe los cambios que rompen la compatibilidad en los puntos finales de la API externa a través de diferentes versiones de duplistatus. Los puntos finales de la API externa son aquellos diseñados para ser utilizados por otras aplicaciones e integraciones (por ejemplo, integración con Homepage).

## Vista general {/* #overview */}

Este documento cubre los cambios que rompen la compatibilidad en los puntos finales de la API externa que afectan a las integraciones, scripts y aplicaciones que consumen estos puntos finales. Para los puntos finales de la API interna utilizados por la interfaz web, los cambios se gestionan automáticamente y no requieren actualizaciones manuales.

:::note
Los puntos finales de la API externa se mantienen con compatibilidad hacia atrás cuando es posible. Los cambios que rompen la compatibilidad solo se introducen cuando son necesarios para garantizar la coherencia, seguridad o mejoras funcionales.
:::

## Cambios específicos por versión {/* #version-specific-changes */}

### Versión 1.3.0 {/* #version-130 */}

**No hay cambios que rompan la compatibilidad con los puntos finales de la API externa**

### Versión 1.2.1 {/* #version-121 */}

**No hay cambios que rompan la compatibilidad con los puntos finales de la API externa**

### Versión 1.1.x {/* #version-11x */}

**No hay cambios que rompan la compatibilidad con los puntos finales de la API externa**

### Versión 1.0.x {/* #version-10x */}

**No hay cambios que rompan la compatibilidad con los puntos finales de la API externa**

### Versión 0.9.x {/* #version-09x */}

**No hay cambios que rompan la compatibilidad con los puntos finales de la API externa**

La versión 0.9.x introduce autenticación y requiere que todos los usuarios inicien sesión. Al actualizar desde la versión 0.8.x:

1. **Autenticación requerida**: Todas las páginas y puntos finales de la API interna ahora requieren autenticación
2. **Cuenta de administrador predeterminada**: Se crea automáticamente una cuenta de administrador predeterminada:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09` (debe cambiarse en el primer inicio de sesión)
3. **Invalidación de sesiones**: Todas las sesiones existentes se invalidan
4. **Acceso a la API externa**: Los puntos finales de la API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecen sin autenticar para mantener la compatibilidad con las integraciones y Duplicati

### Versión 0.8.x {/* #version-08x */}

**No hay cambios que rompan la compatibilidad con los puntos finales de la API externa**

La versión 0.8.x no introduce ningún cambio que rompa la compatibilidad con los puntos finales de la API externa. Los siguientes puntos finales permanecen sin cambios:

- `/api/summary` - Estructura de respuesta sin cambios
- `/api/lastbackup/{serverId}` - Estructura de respuesta sin cambios
- `/api/lastbackups/{serverId}` - Estructura de respuesta sin cambios
- `/api/upload` - Formato de solicitud/respuesta sin cambios

#### Mejoras de Seguridad {/* #security-enhancements */}

Aunque no se realizaron cambios que rompen la compatibilidad en los puntos finales de las APIs externas, la versión 0.8.x incluye mejoras de seguridad:

- **Protección CSRF**: La validación del token CSRF se aplica a las solicitudes de API que cambian el estado, pero las APIs externas siguen siendo compatibles
- **Seguridad de Contraseña**: Los puntos finales de contraseña están restringidos a la interfaz de usuario por razones de seguridad

:::note
Estas mejoras de seguridad no afectan los puntos finales de API externos utilizados para leer datos de copia de seguridad. Si tiene scripts personalizados que usan puntos finales internos, pueden requerir manejo de token CSRF.
:::

### Versión 0.7.x {/* #version-07x */}

La versión 0.7.x introduce varios cambios que rompen la compatibilidad en los puntos finales de API externos que requieren actualizaciones en las integraciones externas.

#### Cambios que rompen la compatibilidad {/* #breaking-changes */}

##### Cambio de nombre de campos {/* #field-renaming */}

- `totalMachines` → `totalServers` en punto final `/api/summary`
- `machine` → `server` en objetos de respuesta de API
- `backup_types_count` → `backup_jobs_count` en punto final `/api/lastbackups/{serverId}`

##### Cambios en rutas de puntos finales {/* #endpoint-path-changes */}

- Todos los puntos finales de API que anteriormente usaban `/api/machines/...` ahora usan `/api/servers/...`
- Los nombres de parámetros cambiaron de `machine_id` a `server_id` (la codificación URL aún funciona con ambos)

#### Cambios en estructura de respuesta {/* #response-structure-changes */}

La estructura de respuesta para varios puntos finales ha sido actualizada para lograr consistencia:

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

## Pasos de migración {/* #migration-steps */}

Si está actualizando desde una versión anterior a 0.7.x, siga estos pasos:

1. **Actualizar referencias de campo**: Reemplace todas las referencias a los nombres de campo antiguos con los nuevos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Actualizar claves de objeto**: Cambie `machine` a `server` en el análisis de respuestas
   - Actualice cualquier código que acceda a `response.machine` a `response.server`

3. **Actualizar rutas de punto final**: Cambie cualquier punto final que use `/api/machines/...` a `/api/servers/...`
   - Nota: Los parámetros aún pueden aceptar identificadores antiguos; las rutas deben actualizarse

4. **Probar integración**: Verifique que su integración funcione con la nueva estructura de API
   - Pruebe todos los puntos finales que usa su aplicación
   - Verifique que el análisis de respuestas maneje correctamente los nuevos nombres de campo

5. **Actualizar documentación**: Actualice cualquier documentación interna que haga referencia a la antigua API
   - Actualice ejemplos de API y referencias de nombres de campo

## Compatibilidad {/* #compatibility */}

### Compatibilidad hacia atrás {/* #backward-compatibility */}

- **Versión 1.2.1**: Totalmente compatible hacia atrás con la estructura de API 1.1.x
- **Versión 1.1.x**: Totalmente compatible hacia atrás con la estructura de API 1.0.x
- **Versión 1.0.x**: Totalmente compatible hacia atrás con la estructura de API 0.9.x
- **Versión 0.9.x**: Totalmente compatible hacia atrás con la estructura de API 0.8.x
- **Versión 0.8.x**: Totalmente compatible hacia atrás con la estructura de API 0.7.x
- **Versión 0.7.x**: No compatible hacia atrás con versiones anteriores a 0.7.x
  - Los nombres de campo antiguos no funcionarán
  - Las rutas de punto final antiguas no funcionarán

### Soporte futuro {/* #future-support */}

- No se admiten nombres de campo antiguos de versiones anteriores a 0.7.x
- No se admiten rutas de punto final antiguas de versiones anteriores a 0.7.x
- Las versiones futuras mantendrán la estructura de API actual a menos que sean necesarios cambios importantes

## Resumen de puntos finales de API externos {/* #summary-of-external-api-endpoints */}

Los siguientes puntos finales de API externos se mantienen para compatibilidad hacia atrás y permanecen sin autenticar:

| Punto final | Método | Descripción | Cambios importantes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Resumen general de operaciones de copia de seguridad | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Última copia de seguridad para un servidor | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Copias de seguridad más recientes para todos los trabajos de copia de seguridad | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Subir datos de copia de seguridad desde duplicati | Sin cambios que rompan la compatibilidad |

## ¿Necesita Ayuda? {/* #need-help */}

Si necesita ayuda para actualizar su integración:

- **Referencia de API**: Compruebe la [Referencia de API](../api-reference/overview.md) para obtener documentación actualizada sobre puntos finales
- **APIs externas**: Vea [APIs externas](../api-reference/external-apis.md) para obtener documentación detallada sobre puntos finales
- **Guía de migración**: Revise la [Guía de migración](version_upgrade.md) para obtener información general sobre la migración
- **Notas de versión**: Revise las [Notas de versión](../release-notes/0.8.x.md) específicas de cada versión para obtener contexto adicional
- **Soporte**: Abra un problema en [GitHub](https://github.com/wsj-br/duplistatus/issues) para obtener soporte
