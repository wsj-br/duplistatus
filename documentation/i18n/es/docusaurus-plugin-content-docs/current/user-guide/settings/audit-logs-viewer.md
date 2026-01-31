---
translation_last_updated: '2026-01-31T00:51:29.130Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 67b8a05c2d43879d
translation_language: es
source_file_path: user-guide/settings/audit-logs-viewer.md
---
# Logs de auditoría {#audit-logs}

El log de auditoría proporciona un registro completo de todos los cambios del sistema y las acciones de los usuarios en **duplistatus**. Esto ayuda a rastrear cambios de configuración, actividades de usuarios y operaciones del sistema con fines de seguridad y solución de problemas.

![Audit Log](/assets/screen-settings-audit.png)

## Visor de log de auditoría {#audit-log-viewer}

El visor de log de auditoría muestra una lista cronológica de todos los eventos registrados con la siguiente información:

- **Marca de tiempo**: Cuándo ocurrió el evento
- **Usuario**: El nombre de usuario que realizó la acción (o "Sistema" para acciones automatizadas)
- **Acción**: La acción específica que se realizó
- **Categoría**: La categoría de la acción (Autenticación, Gestión de usuarios, Configuración, Operaciones de backup, Gestión de servidores, Operaciones del sistema)
- **Estado**: Si la acción tuvo éxito o falló
- **Objetivo**: El objeto que fue afectado (si aplica)
- **Detalles**: Información adicional sobre la acción

### Visualización de Detalles de Registro {#viewing-log-details}

Haga clic en el icono de ojo <IconButton icon="lucide:eye" /> junto a cualquier entrada de registro para ver información detallada, incluyendo:
- Marca de tiempo completa
- Información del usuario
- Detalles de acción completos (por ejemplo: campos modificados, estadísticas, etc.)
- Dirección IP y agente de usuario
- Mensajes de error (si la acción falló)

### Exportar Logs de Auditoría {#exporting-audit-logs}

Puede exportar logs de auditoría filtrados en dos formatos:

| Botón | Descripción |
|:------|:-----------|
| <IconButton icon="lucide:download" label="CSV"/> | Exportar logs como archivo CSV para análisis en hojas de cálculo |
| <IconButton icon="lucide:download" label="JSON"/> | Exportar logs como archivo JSON para análisis programático |

:::note
Las exportaciones incluyen solo los logs actualmente visibles según sus filtros activos. Para exportar todos los logs, limpie primero todos los filtros.
:::
