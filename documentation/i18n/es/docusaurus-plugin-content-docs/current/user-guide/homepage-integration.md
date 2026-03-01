---
translation_last_updated: '2026-03-01T00:45:15.904Z'
source_file_mtime: '2026-02-16T00:30:39.431Z'
source_file_hash: 5b8fdae17a34ff83
translation_language: es
source_file_path: user-guide/homepage-integration.md
---
# Integración de la Página de Inicio (Opcional) {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) es una aplicación de panel de control personalizable. Para integrar **duplistatus** con Homepage, añada un widget a su archivo `services.yaml` utilizando el [tipo de widget Custom API](https://gethomepage.dev/widgets/services/customapi/).

## Widget de Resumen {#summary-widget}

Este widget muestra las estadísticas generales del backup en tu panel de control de la página de inicio.

```yaml
- Dashboard:
    icon: mdi-cloud-upload
    href: http://your-server:9666/
    widget:
      type: customapi
      url: http://your-server:9666/api/summary
      display: list
      refreshInterval: 60000
      mappings:
        - field: totalServers
          label: Servers
        - field: totalBackups
          label: Backups received
        - field: secondsSinceLastBackup
          label: Last backup
          format: duration
        - field: totalBackupSize
          label: Backed up size
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalStorageUsed
          label: Storage used
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalUploadedSize
          label: Uploaded size
          format: number
          scale: 0.000000001
          suffix: GB
```

**Visualización de Widget:**

![Homepage Summary Widget](/img/homepage-summary.png)

## Widget de Información de Última Copia de Seguridad {#last-backup-information-widget}

Este widget muestra la información del backup más reciente para una máquina específica.

```yaml
- Test Machine 1:
    icon: mdi-test-tube
    widget:
      type: customapi
      url: http://your-server:9666/api/lastbackup/Test%20Machine%201
      display: list
      refreshInterval: 60000
      mappings:
        - field: latest_backup.name
          label: Backup name
        - field: latest_backup.status
          label: Result
        - field: latest_backup.date
          label: Date
          format: relativeDate
        - field: latest_backup.duration
          label: Duration
        - field: latest_backup.uploadedSize
          label: Bytes Uploaded
          format: number
          scale: 0.000001
          suffix: MB
        - field: latest_backup.backup_list_count
          label: Versions
```

**Visualización de Widget:**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## Notas de Configuración {#configuration-notes}

- Reemplace `your-server` con la dirección IP o nombre de host de su servidor.
- Ajuste el `refreshInterval` según sea necesario (en milisegundos).
- Reemplace espacios en nombres de máquinas con `%20` en la URL (por ejemplo, `Test Machine 1` se convierte en `Test%20Machine%201`).
- Los valores de `scale` convierten bytes a unidades más legibles (GB, MB).
