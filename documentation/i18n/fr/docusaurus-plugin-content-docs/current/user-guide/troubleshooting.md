---
translation_last_updated: '2026-05-11T14:27:48.618Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: 561c33c1aa4c9a64d87a028ff06a261a2d66fc0342313d2513077cd2a35a957c
translation_language: fr
source_file_path: documentation/docs/user-guide/troubleshooting.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Dépannage {#troubleshooting}

### Tableau de bord non chargé {#dashboard-not-loading}
- Vérifier si le conteneur est en cours d'exécution : `docker ps`
- Vérifier que le port 9666 est accessible
- Vérifier les journaux du conteneur : `docker logs duplistatus`

### Aucune donnée de sauvegarde {#no-backup-data}
- Vérifier la configuration du serveur Duplicati
- Vérifier la connectivité réseau entre les serveurs
- Examiner les journaux duplistatus pour détecter les erreurs
- Assurez-vous que les tâches de sauvegarde sont en cours d'exécution

### Les notifications ne fonctionnent pas {#notifications-not-working}
- Vérifier la configuration des notifications
- Vérifier la connectivité du serveur NTFY (si NTFY est utilisé)
- Tester les paramètres de notification
- Consultez les journaux des notifications

### Les nouvelles sauvegardes ne s'affichent pas {#new-backups-not-showing}

Si vous voyez des avertissements du serveur Duplicati tels que `HTTP Response request failed for:` et `Failed to send message: System.Net.Http.HttpRequestException:`, et que les nouvelles sauvegardes n'apparaissent pas dans le tableau de bord ou dans l'historique des sauvegardes :

- **Vérifier la Configuration Duplicati** : Confirmer que Duplicati est configuré correctement pour envoyer des données à **duplistatus**. Vérifier les paramètres d'URL HTTP dans Duplicati.
- **Vérifier la Connectivité Réseau** : S'assurer que le serveur Duplicati peut se connecter au serveur **duplistatus**. Confirmer que le port est correct (par défaut : `9666`).
- **Examiner les Journaux Duplicati** : Vérifier les erreurs de requête HTTP dans les journaux Duplicati.

### Notifications non fonctionnelles (Détaillé) {#notifications-not-working-detailed}

Si les notifications ne sont pas envoyées ou reçues :

- **Vérifier la configuration NTFY** : Assurez-vous que l'URL NTFY et le sujet sont corrects. Utilisez le bouton **Envoyer une notification de test** pour tester.
- **Vérifier la connectivité réseau** : Vérifiez que **duplistatus** peut atteindre votre serveur NTFY. Vérifiez les paramètres du pare-feu le cas échéant.
- **Vérifier les paramètres de notification** : Confirmez que les notifications sont activées pour les sauvegardes pertinentes.

### Versions disponibles non affichées {#available-versions-not-appearing}

Si les versions de sauvegarde ne s'affichent pas sur le tableau de bord ou la page de détails :

- **Vérifier la Configuration Duplicati** : Assurez-vous que `send-http-log-level=Information` et `send-http-max-log-lines=0` sont configurés dans les options avancées de Duplicati.

### Alertes de Sauvegarde en Retard Non Fonctionnelles {#overdue-backup-alerts-not-working}

Si les notifications de sauvegarde en retard ne sont pas envoyées :

- **Vérifier la configuration des retards** : Confirmez que la surveillance des sauvegardes est activée pour la sauvegarde. Vérifiez les paramètres d'intervalle attendu et de tolérance.
- **Vérifier la fréquence des notifications** : Si elle est définie sur **Une fois**, les alertes ne sont envoyées qu'une seule fois par événement en retard.
- **Vérifier le service Cron** : Assurez-vous que le service cron qui surveille les sauvegardes en retard fonctionne correctement. Vérifiez les journaux d'application pour les erreurs. Vérifiez que le service cron est accessible au port configuré (par défaut : `8667`).

### Collecter les journaux de sauvegarde Non fonctionnel {#collect-backup-logs-not-working}

Si la collecte du journal de sauvegarde manuel échoue :

- **Vérifier l'accès au serveur Duplicati** : Vérifiez que le nom d'hôte et le port du serveur Duplicati sont corrects. Confirmez que l'accès à distance est activé dans Duplicati. Assurez-vous que le mot de passe d'authentification est correct.
- **Vérifier la connectivité réseau** : Testez la connectivité de **duplistatus** vers le serveur Duplicati. Confirmez que le port du serveur Duplicati est accessible (par défaut : `8200`).
  Par exemple, si vous utilisez Docker, vous pouvez utiliser `docker exec -it <container-name> /bin/sh` pour accéder à la ligne de commande du conteneur et exécuter des outils réseau comme `ping` et `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Vérifiez également la configuration DNS à l'intérieur du conteneur (voir plus à [DNS Configuration for Podman Containers](../installation/installation.md#configuring-dns-for-podman-containers))

### Mise à niveau depuis une version antérieure (avant 0.9.x) et impossible de se connecter {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** depuis la version 0.9.x nécessite une authentification utilisateur. Un compte `admin` par défaut est créé automatiquement lors de la première installation de l'application ou lors de la mise à niveau à partir d'une version antérieure :
    - Nom d'utilisateur : `admin`
    - Mot de passe : `Duplistatus09`

Vous pouvez créer des comptes utilisateurs supplémentaires dans [Paramètres > Utilisateurs](settings/user-management-settings.md) après la première connexion.

### Mot de passe Admin perdu ou compte verrouillé {#lost-admin-password-or-locked-out}

Si vous avez perdu votre mot de passe administrateur ou êtes verrouillé de votre compte :

- **Utiliser le script de récupération Admin** : Consultez le guide [Admin Account Recovery](admin-recovery.md) pour obtenir des instructions sur la récupération de l'accès administrateur dans les environnements Docker.
- **Vérifier l'accès au conteneur** : Assurez-vous que vous avez accès à Docker exec au conteneur pour exécuter le script de récupération.

### Sauvegarde de la base de données et Migration {#database-backup-and-migration}

Lors de la migration à partir de versions précédentes ou de la création d'une sauvegarde de la base de données :

**Si vous utilisez la version 1.2.1 ou ultérieure :**
- Utilisez la fonction intégrée de sauvegarde de la base de données dans [Paramètres → Maintenance de la base de données](user-guide/settings/database-maintenance.md)
- Sélectionnez le format souhaité (.db ou .sql) puis cliquez sur **Télécharger la sauvegarde**
- Le fichier de sauvegarde sera téléchargé sur votre ordinateur
- Voir [Maintenance de la base de données](settings/database-maintenance.md#database-backup) pour des instructions détaillées

**Si vous exécutez une version antérieure à 1.2.1 :**
- Vous devrez effectuer une sauvegarde manuelle. Consultez le [Guide de migration](../migration/version_upgrade.md#backing-up-your-database-before-migration) pour plus d'informations.

Si vous rencontrez toujours des problèmes, essayez les étapes suivantes :

1.  **Inspecter les journaux de l'application** : Si vous utilisez Docker, exécutez `docker logs <container-name>` pour consulter les informations détaillées sur les erreurs.
2.  **Valider la configuration** : Vérifiez soigneusement tous les paramètres de configuration dans votre outil de gestion de conteneurs (Docker, Portainer, Podman, etc.), notamment les ports, le réseau et les permissions.
3.  **Vérifier la connectivité réseau** : Assurez-vous que toutes les connexions réseau sont stables.
4.  **Vérifier le service cron** : Assurez-vous que le service cron s'exécute en parallèle avec l'application principale. Consultez les journaux des deux services.
5.  **Consulter la documentation** : Reportez-vous au guide d'installation et au fichier README pour plus d'informations.
6.  **Signaler les problèmes** : Si le problème persiste, veuillez soumettre un rapport détaillé sur le [dépôt GitHub duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Ressources supplémentaires {#additional-resources}

- **Guide d'installation** : [Guide d'installation](../installation/installation.md)
- **Documentation Duplicati** : [docs.duplicati.com](https://docs.duplicati.com)
- **Documentation de l'API** : [Référence de l'API](../api-reference/overview.md)
- **Dépôt GitHub** : [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guide de développement** : [Guide de développement](../development/setup.md)
- **Schéma de la base de données** : [Documentation de la base de données](../development/database)

### Support {#support}
- **Problèmes GitHub** : [Signaler des bogues ou demander des fonctionnalités](https://github.com/wsj-br/duplistatus/issues)
