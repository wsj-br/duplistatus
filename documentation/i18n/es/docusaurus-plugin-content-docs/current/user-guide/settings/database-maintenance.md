# Mantenimiento de base de datos {/* #database-maintenance */}

Gestione sus datos de copia de seguridad y optimice el rendimiento mediante operaciones de mantenimiento de base de datos.

![Mantenimiento de base de datos](../../assets/screen-settings-database-maintenance.png)

<br/>

## Copia de seguridad de base de datos {/* #database-backup */}

Cree una copia de seguridad de toda su base de datos para resguardo o con fines de migración.

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  En la sección **Copia de seguridad de base de datos**, seleccione un formato de copia de seguridad:
    - **Archivo de base de datos (.db)**: Formato binario - copia de seguridad más rápida, preserva exactamente toda la estructura de la base de datos
    - **Volcado SQL (.sql)**: Formato de texto - instrucciones SQL legibles por humanos, pueden editarse antes de restaurar
3.  Haga clic en <IconButton icon="lucide:download" label="Descargar copia de seguridad" />.
4.  El archivo de copia de seguridad se descargará en su computadora con un nombre de archivo con marca de tiempo.

**Formatos de copia de seguridad:**

- **Formato .db**: Recomendado para copias de seguridad regulares. Crea una copia exacta del archivo de base de datos utilizando la API de copia de seguridad de SQLite, asegurando consistencia incluso mientras la base de datos está en uso.
- **Formato .sql**: Útil para migración, inspección o cuando necesita editar los datos antes de restaurar. Contiene todas las instrucciones SQL necesarias para recrear la base de datos.

**Mejores prácticas:**

- Cree copias de seguridad regulares antes de operaciones importantes (limpieza, fusión, etc.)
- Almacene las copias de seguridad en una ubicación segura separada de la aplicación
- Pruebe periódicamente los procedimientos de restauración para asegurar que las copias de seguridad son válidas

<br/>

## Restauración de base de datos {/* #database-restore */}

Restaure su base de datos desde un archivo de copia de seguridad creado previamente.

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  En la sección **Restauración de base de datos**, haga clic en la entrada de archivo y seleccione un archivo de copia de seguridad:
    - Formatos admitidos: `.db`, `.sql`, `.sqlite`, `.sqlite3`
    - Tamaño máximo de archivo: 100MB
3.  Haga clic en <IconButton icon="lucide:upload" label="Restaurar base de datos" />.
4.  Confirme la acción en el cuadro de diálogo.

**Proceso de restauración:**

- Se crea automáticamente una copia de seguridad de seguridad de la base de datos actual antes de la restauración
- La base de datos actual se reemplaza con el archivo de copia de seguridad
- Todas las sesiones se borran por seguridad (los usuarios deben iniciar sesión nuevamente)
- Se verifica la integridad de la base de datos después de la restauración
- Se borran todas las cachés para asegurar datos nuevos

**Formatos de restauración:**

- **Archivos .db**: El archivo de base de datos se reemplaza directamente. Método de restauración más rápido.
- **Archivos .sql**: Se ejecutan instrucciones SQL para recrear la base de datos. Permite restauración selectiva si es necesario.

:::warning
Restaurar una base de datos **reemplazará todos los datos actuales**. Esta acción no se puede deshacer.  
Se crea automáticamente una copia de seguridad de seguridad, pero se recomienda crear su propia copia de seguridad antes de restaurar.
 
**Importante:** Después de la restauración, todas las sesiones de usuario se borran por seguridad. Deberá iniciar sesión nuevamente.
:::

**Solución de problemas:**

- Si la restauración falla, la base de datos original se restaura automáticamente desde la copia de seguridad de seguridad
- Asegúrese de que el archivo de copia de seguridad no esté dañado y coincida con el formato esperado
- Para bases de datos grandes, el proceso de restauración puede tardar varios minutos

<br/>

---

<br/>

:::note
Esto se aplica a todas las funciones de mantenimiento a continuación: todas las estadísticas en el panel, páginas detalladas y gráficos se calculan utilizando datos de la base de datos **duplistatus**. Eliminar información antigua afectará estos cálculos.
 
Si elimina accidentalmente datos, puede restaurarlos usando la función [Recopilar registros de copias de seguridad](../collect-backup-logs.md).
:::

El servicio cron también **compacta** la base de datos cada domingo a las 04:00 UTC. Ese proceso elimina filas de copia de seguridad cuyo servidor ya no existe, filas de servidor sin informes de copia de seguridad restantes, configuraciones sobrantes de monitoreo de copias de seguridad y notificaciones vencidas, filas antiguas de entrega de resumen diario, y ejecuta SQLite `VACUUM` para reclamar espacio de archivo. Eliminar un servidor o trabajo de copia de seguridad aún limpia las configuraciones coincidentes inmediatamente.

<br/>

## Período de limpieza de datos {/* #data-cleanup-period */}

Elimine registros de copia de seguridad obsoletos para liberar espacio de almacenamiento y mejorar el rendimiento del sistema.

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Elija un período de retención:
    - **6 meses**: Conservar registros de los últimos 6 meses.
    - **1 año**: Conservar registros del último año.
    - **2 años**: Conservar registros de los últimos 2 años (predeterminado).
    - **Eliminar todos los datos**: Eliminar todos los registros de copia de seguridad y servidores. 
3.  Haga clic en <IconButton icon="lucide:trash-2" label="Borrar registros antiguos" />.
4.  Confirme la acción en el cuadro de diálogo.

**Efectos de la limpieza:**

- Elimina registros de copia de seguridad más antiguos que el período seleccionado
- Actualiza todas las estadísticas y métricas relacionadas

:::warning

Seleccionar la opción "Eliminar todos los datos" eliminará **permanentemente todos los registros de copia de seguridad y configuraciones** del sistema.

Se recomienda encarecidamente crear una copia de seguridad de la base de datos antes de proceder con esta acción.

:::

<br/>

## Eliminar datos de trabajo de copia de seguridad {/* #delete-backup-job-data */}

Eliminar datos de un trabajo de copia de seguridad específico (tipo).

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Seleccione un trabajo de copia de seguridad de la lista desplegable.
    - Las copias de seguridad se ordenarán por alias o nombre del servidor, luego por el nombre de la copia de seguridad.
3.  Haga clic en <IconButton icon="lucide:folder-open" label="Eliminar trabajo de copia de seguridad" />.
4.  Confirme la acción en el cuadro de diálogo.

**Efectos de la eliminación:**

- Elimina permanentemente todos los datos asociados con este trabajo de copia de seguridad / servidor.
- Limpia las configuraciones asociadas.
- Actualiza las estadísticas del panel en consecuencia.

<br/>

## Eliminar datos del servidor {/* #delete-server-data */}

Eliminar un servidor específico y todos sus datos de copia de seguridad asociados.

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Seleccione un servidor de la lista desplegable.
3.  Haga clic en <IconButton icon="lucide:server" label="Eliminar datos del servidor" />.
4.  Confirme la acción en el cuadro de diálogo.

**Efectos de la eliminación:**

- Elimina permanentemente el servidor seleccionado y todos sus registros de copia de seguridad
- Limpia las configuraciones asociadas
- Actualiza las estadísticas del panel en consecuencia

<br/>

## Combinar servidores duplicados {/* #merge-duplicate-servers */}

Detecte y combine servidores duplicados que tengan el mismo nombre pero diferentes IDs. Utilice esta función para consolidarlos en una única entrada de servidor.

Esto puede ocurrir cuando el `machine-id` de Duplicati cambia después de una actualización o reinstalación. Los servidores duplicados solo se muestran cuando existen. Si no se detectan duplicados, la sección mostrará un mensaje indicando que todos los servidores tienen nombres únicos.

1.  Vaya a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Si se detectan servidores duplicados, aparecerá una sección **Combinar servidores duplicados**.
3.  Revise la lista de grupos de servidores duplicados:
    - Cada grupo muestra servidores con el mismo nombre pero diferentes IDs
    - El **Servidor destino** (más reciente por fecha de creación) está resaltado
    - Los **IDs de servidores antiguos** que se combinarán se enumeran por separado
4.  Seleccione los grupos de servidores que desea combinar marcando la casilla junto a cada grupo.
5.  Haga clic en <IconButton icon="lucide:git-merge" label="Combinar servidores seleccionados" />.
6.  Confirme la acción en el cuadro de diálogo.

**Proceso de combinación:**

- Todos los IDs de servidores antiguos se combinan en el servidor destino (más reciente por fecha de creación)
- Todos los registros y configuraciones de copias de seguridad se transfieren al servidor destino
- Los valores duplicados de `backup_id` para el mismo nombre de copia de seguridad se consolidan en un único ID (prevalece la fila de copia de seguridad más reciente)
- Las entradas de servidores antiguos se eliminan
- Las estadísticas del panel de control se actualizan automáticamente

:::info[IMPORTANTE]
Esta acción no se puede deshacer. Se recomienda realizar una copia de seguridad de la base de datos antes de confirmar.  
:::

<br/>
