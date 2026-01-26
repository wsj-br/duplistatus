# Cambios que rompen la API

Este documento describe los cambios que rompen la compatibilidad de los puntos finales de la API externa en diferentes versiones de duplistatus. Los puntos finales de la API externa son aquellos diseñados para ser utilizados por otras aplicaciones e Integraciones (por ejemplo, integración de página de inicio).

## resumen

Este documento cubre los cambios que rompen la compatibilidad de los puntos finales de la API externa que afectan a Integraciones, scripts y aplicaciones que consumen estos puntos finales. Para los puntos finales de la API interna utilizados por la interfaz web, los cambios se manejan automáticamente y no requieren actualizaciones manuales.

:::note
Los puntos finales de la API externa se mantienen para compatibilidad hacia atrás Cuándo es posible. Los cambios que rompen la compatibilidad se introducen solo Cuándo es necesario para mejoras de consistencia, Seguridad o funcionalidad.
:::

## Cambios específicos de versión

### Versión 1.3.0

**No hay cambios que rompan la compatibilidad de los puntos finales de la API externa**

### Versión 1.2.1

**No hay cambios que rompan la compatibilidad de los puntos finales de la API externa**

### Versión 1.1.x

**No hay cambios que rompan la compatibilidad de los puntos finales de la API externa**

### Versión 1.0.x

**No hay cambios que rompan la compatibilidad de los puntos finales de la API externa**

### Versión 0.9.x

**No hay cambios que rompan la compatibilidad de los puntos finales de la API externa**

La Versión 0.9.x introduce autenticación y requiere que todos los Usuarios inicien sesión. Al actualizar desde la Versión 0.8.x:

1. **Autenticación requerida**: Todas las Páginas y puntos finales de la API interna ahora requieren autenticación
2. **Cuenta de administrador predeterminada**: Se crea automáticamente una cuenta de administrador Por defecto:
   - Nombre de usuario: `admin`
   - Contraseña: `Duplistatus09` (debe cambiarse en el primer Iniciar sesión)
3. **Invalidación de sesión**: Todos los sesiones existentes se invalidan
4. **Acceso a la API externa**: Los puntos finales de la API externa (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) permanecen sin autenticar para compatibilidad con Integraciones y Duplicati

### Versión 0.8.x

**No hay cambios que rompan la compatibilidad de los puntos finales de la API externa**

La Versión 0.8.x no introduce ningún cambio que rompa la compatibilidad de los puntos finales de la API externa. Los siguientes puntos finales permanecen sin cambios:

- `/api/summary` - Estructura de respuesta sin cambios
- `/api/lastbackup/{serverId}` - Estructura de respuesta sin cambios
- `/api/lastbackups/{serverId}` - Estructura de respuesta sin cambios
- `/api/upload` - Formato de solicitud/respuesta sin cambios

#### Mejoras de Seguridad

Aunque no se realizaron cambios que rompan la compatibilidad de los puntos finales de la API externa, la Versión 0.8.x incluye mejoras de Seguridad:

- **Protección CSRF**: La validación del token CSRF se aplica para solicitudes de API que cambian estado, pero las API externas permanecen compatibles
- **Seguridad de Contraseña**: Los puntos finales de Contraseña se restringen a la interfaz de Usuario por razones de Seguridad

:::note
Estas mejoras de Seguridad no afectan a los puntos finales de la API externa utilizados para leer datos de backup. Si tiene scripts Personalizado que utilizan puntos finales internos, es posible que requieran manejo de token CSRF.
:::

### Versión 0.7.x

La Versión 0.7.x introduce varios cambios que rompen la compatibilidad de los puntos finales de la API externa que requieren actualizaciones de Integraciones externas.

#### Cambios que rompen la compatibilidad

##### Cambio de nombre de campo

- **`totalMachines`** → **`totalServers`** en el punto final `/api/summary`
- **`machine`** → **`server`** en objetos de respuesta de API
- **`backup_types_count`** → **`backup_jobs_count`** en el punto final `/api/lastbackups/{serverId}`

##### Cambios de ruta de punto final

- Todos los puntos finales de API que anteriormente usaban `/api/machines/...` Ahora usan `/api/servers/...`
- Los nombres de parámetros cambiaron de `machine_id` a `server_id` (la codificación de URL aún funciona con ambos)

#### Cambios en la estructura de respuesta

La estructura de respuesta para varios puntos finales se ha actualizado para mayor consistencia:

##### `/api/summary`

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
  "totalServers": 3,  // Cambió de "totalMachines"
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

**Antes (0.6.x y anteriores):**

```json
{
  "machine": {  // Cambió a "server"
    "id": "unique-server-id",
    "name": "Nombre del servidor",
    "backup_name": "Nombre de backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Detalles
  },
  "status": 200
}
```

**Después (0.7.x+):**

```json
{
  "server": {  // Cambió de "machine"
    "id": "unique-server-id",
    "name": "Nombre del servidor",
    "backup_name": "Nombre de backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... Detalles
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}`

**Antes (0.6.x y anteriores):**

```json
{
  "machine": {  // Cambió a "server"
    "id": "unique-server-id",
    "name": "Nombre del servidor",
    "backup_name": "Backup Por defecto",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... matriz de backup
  ],
  "backup_types_count": 2,  // Cambió a "backup_jobs_count"
  "backup_names": ["Archivos", "Databases"],
  "status": 200
}
```

**Después (0.7.x+):**

```json
{
  "server": {  // Cambió de "machine"
    "id": "unique-server-id",
    "name": "Nombre del servidor",
    "backup_name": "Backup Por defecto",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... matriz de backup
  ],
  "backup_jobs_count": 2,  // Cambió de "backup_types_count"
  "backup_names": ["Archivos", "Databases"],
  "status": 200
}
```

## Pasos de migración

Si está actualizando desde una Versión anterior a 0.7.x, siga estos pasos:

1. **Actualizar referencias de campo**: Reemplace Todos las referencias a nombres de campo antiguos con nuevos
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Actualizar claves de objeto**: Cambie `machine` a `server` en el análisis de respuesta
   - Actualice cualquier código que acceda a `response.machine` a `response.server`

3. **Actualizar rutas de punto final**: Cambie cualquier punto final que use `/api/machines/...` a `/api/servers/...`
   - Nota: Los parámetros aún pueden aceptar identificadores antiguos; las rutas deben actualizarse

4. **Probar integración**: Verificar que su Integraciones funcione con la nueva estructura de API
   - Probar Todos los puntos finales que utiliza su aplicación
   - Verificar que el análisis de respuesta maneje correctamente los nuevos nombres de campo

5. **Actualizar documentación**: Actualice cualquier documentación interna que haga referencia a la API antigua
   - Actualizar ejemplos de API y referencias de nombres de campo

## Compatibilidad

### Compatibilidad hacia atrás

- **Versión 1.2.1**: Totalmente compatible hacia atrás con la estructura de API 1.1.x
- **Versión 1.1.x**: Totalmente compatible hacia atrás con la estructura de API 1.0.x
- **Versión 1.0.x**: Totalmente compatible hacia atrás con la estructura de API 0.9.x
- **Versión 0.9.x**: Totalmente compatible hacia atrás con la estructura de API 0.8.x
- **Versión 0.8.x**: Totalmente compatible hacia atrás con la estructura de API 0.7.x
- **Versión 0.7.x**: No es compatible hacia atrás con versiones anteriores a 0.7.x
  - Los nombres de campo antiguos no funcionarán
  - Las rutas de punto final antiguas no funcionarán

### Soporte futuro

- Los nombres de campo antiguos de versiones anteriores a 0.7.x no son No compatible
- Las rutas de punto final antiguas de versiones anteriores a 0.7.x no son No compatible
- Las versiones futuras mantendrán la estructura de API Actual a menos que sean necesarios cambios que rompan la compatibilidad

## Resumen de puntos finales de la API externa

Los siguientes puntos finales de la API externa se mantienen para compatibilidad hacia atrás y permanecen sin autenticar:

| Punto final                   | Método | Descripción                                       | Cambios que rompen la compatibilidad                                                                                    |
| ----------------------------- | ------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/api/summary`                | GET    | Resumen general de operaciones de backup          | 0.7.x: `totalMachines` → `totalServers`                                 |
| `/api/lastbackup/{serverId}`  | GET    | Último backup para un Servidores                  | 0.7.x: `machine` → `server`                                             |
| `/api/lastbackups/{serverId}` | GET    | Últimos Backups para Todos los trabajos de backup | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload`                 | POST   | Subir datos de backup desde Duplicati             | No hay cambios que rompan la compatibilidad                                                                             |

## ¿Necesita ayuda? {#need-help}

Si necesita asistencia para actualizar su Integraciones:

- **Referencia de API**: Verificar la [Referencia de API](../api-reference/overview.md) para documentación de punto final Actual
- **API externas**: Consulte [API externas](../api-reference/external-apis.md) para documentación detallada de puntos finales
- **Guía de migración**: Revise la [Guía de migración](version_upgrade.md) para información de migración General
- **Notas de la versión**: Revise las [Notas de la versión](../release-notes/0.8.x.md) específicas de la Versión para contexto adicional
- **Soporte**: Abra un problema en [GitHub](https://github.com/wsj-br/duplistatus/issues) para obtener soporte
