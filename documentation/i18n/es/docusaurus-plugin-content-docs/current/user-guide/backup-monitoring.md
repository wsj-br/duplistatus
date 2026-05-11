---
translation_last_updated: '2026-05-11T14:27:46.215Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: 74e68a394e4fc2ec0fae355e9467377c4f1bde23f973fd6555e67a0ca86af518
translation_language: es
source_file_path: documentation/docs/user-guide/backup-monitoring.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
import { ZoomMermaid } from '@site/src/components/ZoomMermaid';

# Monitoreo de Backups {#backup-monitoring}

La función de monitoreo de backups le permite rastrear y alertar sobre backups que están retrasados. Las notificaciones pueden ser a través de NTFY o Correo electrónico.

En la interfaz de usuario, los backups retrasados se muestran con un icono de advertencia. Al pasar el cursor sobre el icono se muestran los detalles del backup retrasado, incluida la última hora del backup, la hora del backup esperado, el período de tolerancia y la hora del próximo backup esperado.

## Proceso de Verificación Retrasada {#overdue-check-process}

**Cómo funciona:**

| **Paso** | **Valor**                  | **Descripción**                                   | **Ejemplo**        |
|:--------:|:---------------------------|:--------------------------------------------------|:-------------------|
|    1     | **Última copia de seguridad**            | La marca de tiempo de la última copia de seguridad exitosa.      | `2024-01-01 08:00` |
|    2     | **Intervalo Esperado**      | La frecuencia de copia de seguridad configurada.                  | `1 day`            |
|    3     | **Próxima copia de seguridad calculada** | `Last Backup` + `Expected Interval`               | `2024-01-02 08:00` |
|    4     | **Tolerancia**              | El período de gracia configurado (tiempo adicional permitido). | `1 hour`           |
|    5     | **Próxima copia de seguridad esperada**   | `Calculated Next Backup` + `Tolerance`            | `2024-01-02 09:00` |

Una copia de seguridad se considera **retrasada** si la hora actual es posterior a la hora de `Siguiente Backup Esperado`.

<ZoomMermaid>

```mermaid
gantt
    title Backup Schedule Timeline with Tolerance
    dateFormat  YYYY-MM-DD HH:mm
    axisFormat %m/%d %H:%M

    Last Backup Received    :done, last-backup, 2024-01-01 08:00, 0.5h

    Interval                :active, interval, 2024-01-01 08:00, 24h
    Calculated Next Backup                :milestone, expected, 2024-01-02 08:00, 0h
    Tolerance Period        :active, tolerance period, 2024-01-02 08:00, 1h

    Expected Next Backup               :milestone, adjusted, 2024-01-02 09:00, 0h

    Check 1 : milestone, deadline, 2024-01-01 21:00, 0h
    Check 2 : milestone, deadline, 2024-01-02 08:30, 0h
    Check 3 : milestone, deadline, 2024-01-02 10:00, 0h

```

</ZoomMermaid>

**Ejemplos basados en la cronología anterior:**

- A las `2024-01-01 21:00` (🔹Verificación 1), el backup está **a tiempo**.
- A las `2024-01-02 08:30` (🔹Verificación 2), el backup está **a tiempo**, ya que aún se encuentra dentro del período de tolerancia.
- A las `2024-01-02 10:00` (🔹Verificación 3), el backup está **retrasado**, ya que esto es después de la hora de `Expected Next Backup`.

## Comprobaciones Periódicas {#periodic-checks}

**duplistatus** realiza comprobaciones periódicas de backups retrasados en intervalos configurables. El intervalo por defecto es 20 minutos, pero puede configurarlo en [Configuración → Monitoreo de Backups](settings/backup-monitoring-settings.md).

## Configuración Automática {#automatic-configuration}

Cuando recopila logs de backup de un servidor Duplicati, **duplistatus** automáticamente:

- Extrae la programación de backups de la Configuración de Duplicati
- Actualiza los intervalos de monitoreo de backups para que coincidan exactamente
- Sincroniza los días de la semana permitidos y las horas programadas
- Preserva sus preferencias de notificación

:::tip
Para obtener los mejores resultados, recopile logs de backup después de cambiar los intervalos de trabajos de backup en su servidor Duplicati. Esto garantiza que **duplistatus** se mantenga sincronizado con su configuración actual.
:::

Revise la sección [Configuración de Monitoreo de Backups](settings/backup-monitoring-settings.md) para opciones de configuración detalladas.
