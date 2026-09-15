# Mantenimiento de base de datos {/* #database-maintenance */}

Gestiona tus datos de copia de seguridad y optimiza el rendimiento mediante operaciones de mantenimiento de base de datos.

![Mantenimiento de base de datos](../../assets/screen-settings-database-maintenance.png)

<br/>

## Copia de seguridad de base de datos {/* #database-backup */}

Crea una copia de seguridad de toda tu base de datos para fines de almacenamiento seguro o migración.

1.  Navega a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  En la sección **Copia de seguridad de base de datos**, selecciona un formato de copia de seguridad:
    - **Archivo de base de datos (.db)**: Formato binario - copia de seguridad más rápida, preserva toda la estructura de la base de datos exactamente
    - **Volcado SQL (.sql)**: Formato de texto - declaraciones SQL legibles por humanos, se pueden editar antes de restaurar
3.  Haz clic en <IconButton icon="lucide:download" label="Descargar copia de seguridad" />.
4.  El archivo de copia de seguridad se descargará a tu computadora con un nombre de archivo con marca de tiempo.

**Formatos de copia de seguridad:**

- **Formato .db**: Recomendado para copias de seguridad regulares. Crea una copia exacta del archivo de la base de datos utilizando la API de copia de seguridad de SQLite, asegurando la consistencia incluso mientras la base de datos está en uso.
- **Formato .sql**: Útil para migración, inspección o cuando necesitas editar los datos antes de restaurar. Contiene todas las declaraciones SQL necesarias para recrear la base de datos.

**Mejores prácticas:**

- Crea copias de seguridad regulares antes de operaciones importantes (limpieza, fusión, etc.)
- Almacena las copias de seguridad en un lugar seguro separado de la aplicación
- Prueba los procedimientos de restauración periódicamente para asegurarte de que las copias de seguridad son válidas

<br/>

## Restauración de base de datos {/* #database-restore */}

Restaura tu base de datos desde un archivo de copia de seguridad previamente creado.

1.  Navega a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  En la sección **Restauración de base de datos**, haz clic en la entrada de archivo y selecciona un archivo de copia de seguridad:
    - Formatos admitidos: `.db`, `.sql`, `.sqlite`, `.sqlite3`
    - Tamaño máximo de archivo: 100MB
3.  Haz clic en <IconButton icon="lucide:upload" label="Restaurar base de datos" />.
4.  Confirma la acción en el cuadro de diálogo.

**Proceso de restauración:**

- Se crea automáticamente una copia de seguridad de seguridad de la base de datos actual antes de la restauración
- La base de datos actual se reemplaza con el archivo de copia de seguridad
- Todas las sesiones se borran por seguridad (los usuarios deben iniciar sesión nuevamente)
- Se verifica la integridad de la base de datos después de la restauración
- Todas las cachés se borran para asegurar datos frescos

**Formatos de restauración:**

- **Archivos .db**: El archivo de la base de datos se reemplaza directamente. Método de restauración más rápido.
- **Archivos .sql**: Se ejecutan las declaraciones SQL para recrear la base de datos. Permite la restauración selectiva si es necesario.

:::warning
Restaurar una base de datos **reemplazará todos los datos actuales**. Esta acción no se puede deshacer.  
Se crea automáticamente una copia de seguridad de seguridad, pero se recomienda crear tu propia copia de seguridad antes de restaurar.
 
**Importante:** Después de la restauración, todas las sesiones de usuario se borran por seguridad. Necesitarás iniciar sesión nuevamente.
:::

**Solución de problemas:**

- Si la restauración falla, la base de datos original se restaura automáticamente desde la copia de seguridad de seguridad
- Asegúrese de que el archivo de copia de seguridad no esté dañado y coincida con el formato esperado
- Para bases de datos grandes, el proceso de restauración puede tardar varios minutos

<br/>

---

<br/>

:::note
Esto aplica a todas las funciones de mantenimiento a continuación: todas las estadísticas en el panel, las páginas de detalles y los gráficos se calculan utilizando datos de la base de datos **duplistatus**. Eliminar información antigua afectará estos cálculos.
 
Si elimina datos accidentalmente, puede restaurarlos utilizando la función [Recopilar registros de copias de seguridad](../collect-backup-logs.md).
:::

El servicio cron también **compacta** la base de datos cada domingo a las 04:00 UTC. Esa pasada elimina las filas de copia de seguridad cuyo servidor ya no existe, las filas de servidores sin informes de copia de seguridad restantes, la configuración de monitoreo de copias de seguridad y las notificaciones de vencimiento, las filas de entrega de resumen diario antiguas y ejecuta SQLite `VACUUM` para recuperar espacio en el archivo. Eliminar un servidor o un trabajo de copia de seguridad aún limpia la configuración coincidente de inmediato.

<br/>

## Período de Limpieza de Datos {/* #data-cleanup-period */}

Elimina los registros de copia de seguridad obsoletos para liberar espacio de almacenamiento y mejorar el rendimiento del sistema.

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Elija un período de retención:
    - **6 meses**: Mantiene los registros de los últimos 6 meses.
    - **1 año**: Mantiene los registros del último año.
    - **2 años**: Mantiene los registros de los últimos 2 años (predeterminado).
    - **Eliminar todos los datos**: Elimina todos los registros de copia de seguridad y servidores. 
3.  Haga clic en <IconButton icon="lucide:trash-2" label="Borrar Registros Antiguos" />.
4.  Confirme la acción en el cuadro de diálogo.

**Efectos de la Limpieza:**

- Elimina los registros de copia de seguridad más antiguos que el período seleccionado
- Actualiza todas las estadísticas y métricas relacionadas

:::warning

Seleccionar la opción "Eliminar todos los datos" eliminará **permanentemente todos los registros de copia de seguridad y la configuración del sistema**.

Se recomienda encarecidamente crear una copia de seguridad de la base de datos antes de proceder con esta acción.

:::

<br/>

## Eliminar Datos del Trabajo de Copia de Seguridad {/* #delete-backup-job-data */}

Elimina los datos de un trabajo de copia de seguridad específico (tipo).

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Seleccione un trabajo de copia de seguridad de la lista desplegable.
    - Las copias de seguridad se ordenarán por alias o nombre del servidor, luego por el nombre de la copia de seguridad.
3.  Haga clic en <IconButton icon="lucide:folder-open" label="Eliminar Trabajo de Copia de Seguridad" />.
4.  Confirme la acción en el cuadro de diálogo.

**Efectos de la Eliminación:**

- Elimina permanentemente todos los datos asociados con este trabajo de copia de seguridad / servidor.
- Limpia la configuración asociada.
- Actualiza las estadísticas del panel de control en consecuencia.

<br/>

## Eliminar Datos del Servidor {/* #delete-server-data */}

Elimina un servidor específico y todos sus datos de copia de seguridad asociados.

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Seleccione un servidor de la lista desplegable.
3.  Haga clic en <IconButton icon="lucide:server" label="Eliminar Datos del Servidor" />.
4.  Confirme la acción en el cuadro de diálogo.

**Efectos de la Eliminación:**

- Elimina permanentemente el servidor seleccionado y todos sus registros de copia de seguridad
- Limpia la configuración asociada
- Actualiza las estadísticas del panel de control en consecuencia

<br/>

## Combinar Servidores Duplicados {/* #merge-duplicate-servers */}

Detectar y combinar servidores duplicados que tienen el mismo nombre pero diferentes IDs. Utilice esta función para consolidarlos en una sola entrada de servidor.

Esto puede ocurrir cuando Duplicati's `machine-id` cambia después de una actualización o reinstalación. Los servidores duplicados solo se muestran cuando existen. Si no se detectan duplicados, la sección mostrará un mensaje indicando que todos los servidores tienen nombres únicos.

1.  Navegue a [Configuración → Mantenimiento de base de datos](database-maintenance.md).
2.  Si se detectan servidores duplicados, aparecerá una sección **Combinar servidores duplicados**.
3.  Revise la lista de grupos de servidores duplicados:
    - Cada grupo muestra servidores con el mismo nombre pero diferentes IDs
    - El **Servidor de destino** (el más nuevo por fecha de creación) está resaltado
    - Los **IDs de servidores antiguos** que se combinarán se enumeran por separado
4.  Seleccione los grupos de servidores que desea combinar marcando la casilla de verificación junto a cada grupo.
5.  Haga clic en <IconButton icon="lucide:git-merge" label="Combinar servidores seleccionados" />.
6.  Confirme la acción en el cuadro de diálogo.

**Proceso de combinación:**

- Todos los IDs de servidores antiguos se combinan en el servidor de destino (el más nuevo por fecha de creación)
- Todos los registros de copias de seguridad y configuraciones se transfieren al servidor de destino
- Los valores duplicados de `backup_id` para el mismo nombre de copia de seguridad se consolidan en un solo ID (la fila de copia de seguridad más reciente gana)
- Las entradas de servidores antiguas se eliminan
- Las estadísticas del panel se actualizan automáticamente

:::info[IMPORTANTE]
Esta acción no se puede deshacer. Se recomienda realizar una copia de seguridad de la base de datos antes de confirmar.  
:::

<br/>
