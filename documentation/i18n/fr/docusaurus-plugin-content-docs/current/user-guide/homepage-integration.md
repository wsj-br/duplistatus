# Intégration Homepage (optionnel) {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) est une application de tableau de bord personnalisable. Pour intégrer **duplistatus** avec Homepage, ajoutez un widget à votre fichier `services.yaml` en utilisant le [type de widget API personnalisé](https://gethomepage.dev/widgets/services/customapi/).

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
          label: Serveurs
        - field: totalBackups
          label: Sauvegardes reçues
        - field: secondsSinceLastBackup
          label: Dernière sauvegarde
          format: duration
        - field: totalBackupSize
          label: Taille sauvegardée
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalStorageUsed
          label: Stockage utilisé
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalUploadedSize
          label: Taille téléversée
          format: number
          scale: 0.000000001
          suffix: GB
```

**Affichage du widget:**

![Homepage Summary Widget](/img/homepage-summary.png)

## Widget Informations de Dernière Sauvegarde {#last-backup-information-widget}

Ce widget affiche les informations de sauvegarde les plus récentes pour une machine spécifique.

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
          label: Nom de sauvegarde
        - field: latest_backup.status
          label: Résultat
        - field: latest_backup.date
          label: Date
          format: relativeDate
        - field: latest_backup.duration
          label: Durée
        - field: latest_backup.uploadedSize
          label: Octets téléversés
          format: number
          scale: 0.000001
          suffix: MB
        - field: latest_backup.backup_list_count
          label: Versions
```

**Affichage du widget:**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## Notes de Configuration {#configuration-notes}

- Remplacez `your-server` par l'adresse IP ou le nom d'hôte de votre serveur.
- Ajustez le `refreshInterval` selon vos besoins (en millisecondes).
- Remplacez les espaces dans les noms de machines par `%20` dans l'URL (par exemple, `Test Machine 1` devient `Test%20Machine%201`).
- Les valeurs `scale` convertissent les octets en unités plus lisibles (GB, MB).

