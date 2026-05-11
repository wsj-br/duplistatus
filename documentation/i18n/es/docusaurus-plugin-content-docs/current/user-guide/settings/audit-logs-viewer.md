---
translation_last_updated: '2026-05-11T14:27:47.196Z'
source_file_mtime: '2026-05-06T23:18:51.442Z'
source_file_hash: 80be5481828e5ef8fd45f7d5798ad511ae84f6dde487dd8920d6b2f458c1e1b8
translation_language: es
source_file_path: documentation/docs/user-guide/settings/audit-logs-viewer.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Logs de Auditoría {#audit-logs}

El log de auditoría proporciona un registro completo de todos los cambios del sistema y las acciones del usuario en **duplistatus**. Esto ayuda a rastrear cambios de configuración, actividades del usuario y operaciones del sistema para propósitos de seguridad y solución de problemas.

![Audit Log](../../assets/screen-settings-audit.png)

## Visor de log de auditoría {#audit-log-viewer}

El visor de log de auditoría muestra una lista cronológica de todos los eventos registrados con la siguiente información:

- **Marca de tiempo**: Cuándo ocurrió el evento
- **Usuario**: El nombre de usuario que realizó la acción (o "Sistema" para acciones automatizadas)
- **Acción**: La acción específica que se realizó
- **Categoría**: La categoría de la acción (Autenticación, Gestión de usuarios, Configuración, Operaciones de copia de seguridad, Gestión del servidor, Operaciones del sistema)
- **Estado**: Si la acción tuvo éxito o falló
- **Destino**: El objeto que se vio afectado (si corresponde)
- **Detalles**: Información adicional sobre la acción

### Ver Detalles del Registro {#viewing-log-details}

Haga clic en el icono de <IconButton icon="lucide:eye" /> ojo junto a cualquier entrada del registro para ver información detallada, incluyendo:
- Marca de tiempo completa
- Información del usuario
- Detalles completos de la acción (por ejemplo: campos modificados, estadísticas, etc.)
- Dirección IP y agente de usuario
- Mensajes de error (si la acción falló)

### Exportación de Logs de Auditoría {#exporting-audit-logs}

Puede exportar logs de auditoría filtrados en dos formatos:

| Botón | Descripción |
|:------|:-----------|
| <IconButton icon="lucide:download" label="CSV"/> | Exportar registros como un archivo CSV para análisis en hojas de cálculo |
| <IconButton icon="lucide:download" label="JSON"/> | Exportar registros como un archivo JSON para análisis mediante programación |

:::note
Las exportaciones incluyen solo los logs actualmente visibles según sus filtros activos. Para exportar todos los logs, primero limpie todos los filtros.
:::
