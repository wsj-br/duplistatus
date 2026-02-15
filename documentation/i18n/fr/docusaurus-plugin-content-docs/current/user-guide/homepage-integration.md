---
translation_last_updated: '2026-02-15T20:57:33.202Z'
source_file_mtime: '2026-01-25T02:45:42.747Z'
source_file_hash: 5b8fdae17a34ff83
translation_language: fr
source_file_path: user-guide/homepage-integration.md
---
# Intégration de la page d'accueil (Optionnel) {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) est une application de tableau de bord personnalisable. Pour intégrer **duplistatus** avec Homepage, ajoutez un widget à votre fichier `services.yaml` en utilisant le [type de widget Custom API](https://gethomepage.dev/widgets/services/customapi/).

## Widget Résumé {#summary-widget}

Ce widget affiche les statistiques de sauvegarde globales sur votre tableau de bord Homepage.

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

**Affichage du widget :**

![Homepage Summary Widget](/img/homepage-summary.png)

## Widget Informations de dernière sauvegarde {#last-backup-information-widget}

Ce widget affiche les dernières informations de sauvegarde pour une machine spécifique.

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

**Affichage du widget :**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## Notes de Configuration {#configuration-notes}

- Remplacez `your-server` par l'adresse IP ou le nom d'hôte de votre serveur.
- Ajustez l'intervalle `refreshInterval` selon vos besoins (en millisecondes).
- Remplacez les espaces dans les noms de machines par `%20` dans l'URL (par exemple, `Test Machine 1` devient `Test%20Machine%201`).
- Les valeurs `scale` convertissent les octets en unités plus lisibles (Go, Mo).
