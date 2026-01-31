---
translation_last_updated: '2026-01-31T00:51:23.158Z'
source_file_mtime: '2026-01-31T00:23:03.813Z'
source_file_hash: ccb921e081ad2c50
translation_language: fr
source_file_path: user-guide/troubleshooting.md
---
# Dépannage {#troubleshooting}

### Tableau de bord non chargé {#dashboard-not-loading}
- Vérifier si le conteneur est en cours d'exécution : `docker ps`
- Vérifier que le port 9666 est accessible
- Vérifier les journaux du conteneur : `docker logs duplistatus`

### Non Sauvegarde de Données {#no-backup-data}
- Vérifier la configuration du serveur Duplicati
- Vérifier la connectivité réseau entre les serveurs
- Examiner les journaux de duplistatus pour les erreurs
- S'assurer que les tâches de sauvegarde s'exécutent

### Les notifications ne fonctionnent pas {#notifications-not-working}
- Vérifier la configuration des notifications
- Vérifier la connectivité du serveur NTFY (si vous utilisez NTFY)
- Tester les paramètres de notification
- Vérifier les journaux de notification

### Les Nouvelles Sauvegardes N'Apparaissent Pas {#new-backups-not-showing}

Si vous voyez des avertissements du serveur Duplicati comme « HTTP Response request failed for: » et « Failed to send message: System.Net.Http.HttpRequestException: », et que les nouvelles sauvegardes n'apparaissent pas dans le tableau de bord ou l'historique des sauvegardes :

- **Vérifier la Configuration Duplicati** : Confirmer que Duplicati est configuré correctement pour envoyer des données à **duplistatus**. Vérifier les paramètres d'URL HTTP dans Duplicati.
- **Vérifier la Connectivité Réseau** : S'assurer que le serveur Duplicati peut se connecter au serveur **duplistatus**. Confirmer que le port est correct (par défaut : `9666`).
- **Consulter les Journaux Duplicati** : Vérifier les erreurs de requête HTTP dans les journaux Duplicati.

### Les Notifications ne Fonctionnent pas (Détaillé) {#notifications-not-working-detailed}

Si les notifications ne sont pas envoyées ou reçues :

- **Vérifier la configuration NTFY** : Assurez-vous que l'URL NTFY et le sujet sont corrects. Utilisez le bouton `Send Test Notification` pour tester.
- **Vérifier la connectivité réseau** : Vérifiez que **duplistatus** peut atteindre votre serveur NTFY. Examinez les paramètres du pare-feu le cas échéant.
- **Vérifier les paramètres de notification** : Confirmez que les notifications sont activées pour les sauvegardes pertinentes.

### Versions disponibles n'apparaissant pas {#available-versions-not-appearing}

Si les versions de sauvegarde ne s'affichent pas sur le tableau de bord ou la page de détails :

- **Vérifier Configuration Duplicati** : Assurez-vous que `send-http-log-level=Information` et `send-http-max-log-lines=0` sont configurés dans les options avancées de Duplicati.

### Alertes de Sauvegarde en retard non fonctionnelles {#overdue-backup-alerts-not-working}

Si les notifications de sauvegarde en retard ne sont pas envoyées :

- **Vérifier la configuration des retards** : Confirmer que la surveillance des sauvegardes en retard est activée pour la sauvegarde. Vérifier les paramètres d'intervalle attendu et de tolérance.
- **Vérifier la fréquence des notifications** : Si elle est définie sur « One time », les alertes ne sont envoyées qu'une seule fois par événement de sauvegarde en retard.
- **Vérifier le service Cron** : S'assurer que le service cron qui surveille les sauvegardes en retard fonctionne correctement. Vérifier les journaux d'application pour les erreurs. Vérifier que le service cron est accessible au port configuré (par défaut : `8667`).

### Collecter les journaux de sauvegarde ne fonctionne pas {#collect-backup-logs-not-working}

Si la collecte manuelle du journal de sauvegarde échoue :

- **Vérifier l'accès au serveur Duplicati** : Vérifier que le nom d'hôte et le port du serveur Duplicati sont corrects. Confirmer que l'accès à distance est activé dans Duplicati. S'assurer que le mot de passe d'authentification est correct.
- **Vérifier la connectivité réseau** : Tester la connectivité de **duplistatus** vers le serveur Duplicati. Confirmer que le port du serveur Duplicati est accessible (par défaut : `8200`).
  Par exemple, si vous utilisez Docker, vous pouvez utiliser `docker exec -it <container-name> /bin/sh` pour accéder à la ligne de commande du conteneur et exécuter des outils réseau comme `ping` et `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Vérifiez également la configuration DNS à l'intérieur du conteneur (voir plus à [DNS Configuration for Podman Containers](../installation/installation.md#configuring-dns-for-podman-containers))

### Mise à niveau depuis une version antérieure (antérieure à 0.9.x) et impossible de se connecter {#upgrade-from-an-earlier-version-09x-and-cant-login}

**duplistatus** depuis la version 0.9.x nécessite une authentification utilisateur. Un compte `admin` par défaut est créé automatiquement lors de l'installation de l'application pour la première fois ou lors de la mise à niveau à partir d'une version antérieure :
    - Nom d'utilisateur : `admin`
    - Mot de passe : `Duplistatus09`

Vous pouvez créer des comptes utilisateurs supplémentaires dans [Paramètres > Utilisateurs](settings/user-management-settings.md) après la première connexion.

### Mot de passe Admin perdu ou compte verrouillé {#lost-admin-password-or-locked-out}

Si vous avez perdu votre mot de passe d'administrateur ou avez été verrouillé de votre compte :

- **Utiliser le script de récupération Admin** : Consultez le guide [Récupération du compte Admin](admin-recovery.md) pour obtenir des instructions sur la récupération de l'accès administrateur dans les environnements Docker.
- **Vérifier l'accès au conteneur** : Assurez-vous que vous disposez de l'accès Docker exec au conteneur pour exécuter le script de récupération.

### Sauvegarde de la base de données et migration {#database-backup-and-migration}

Quand migrer à partir de versions précédentes ou créer une sauvegarde de la base de données :

**Si vous utilisez la version 1.2.1 ou ultérieure :**
- Utilisez la fonction de sauvegarde de base de données intégrée dans `Paramètres → Maintenance de la base de données`
- Sélectionnez votre format préféré (.db ou .sql) et cliquez sur `Télécharger la sauvegarde`
- Le fichier de sauvegarde sera téléchargé sur votre ordinateur
- Consultez [Maintenance de la base de données](settings/database-maintenance.md#database-backup) pour des instructions détaillées

**Si vous exécutez une version antérieure à 1.2.1 :**
- Vous devrez effectuer une sauvegarde manuelle. Consultez le [Guide de migration](../migration/version_upgrade.md#backing-up-your-database-before-migration) pour plus d'informations.

Si vous rencontrez toujours des problèmes, essayez les étapes suivantes :

1.  **Inspectez les Journaux d'application** : Si vous utilisez Docker, exécutez `docker logs <container-name>` pour examiner les informations d'erreur détaillées.
2.  **Validez la Configuration** : Vérifiez à nouveau tous les paramètres de configuration dans votre outil de gestion de conteneurs (Docker, Portainer, Podman, etc.) y compris les ports, le réseau et les autorisations.
3.  **Vérifiez la Connectivité Réseau** : Confirmez que toutes les connexions réseau sont stables.
4.  **Vérifiez le Service Cron** : Assurez-vous que le service cron s'exécute aux côtés de l'application principale. Vérifiez les journaux des deux services.
5.  **Consultez la Documentation** : Reportez-vous au Guide d'installation et au README pour plus d'informations.
6.  **Signalez les Problèmes** : Si le problème persiste, veuillez soumettre un problème détaillé sur le [dépôt GitHub duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Ressources Supplémentaires {#additional-resources}

- **Guide d'Installation** : [Guide d'Installation](../installation/installation.md)
- **Documentation Duplicati** : [docs.duplicati.com](https://docs.duplicati.com)
- **Documentation API** : [Référence API](../api-reference/overview.md)
- **Référentiel GitHub** : [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guide de Développement** : [Guide de Développement](../development/setup.md)
- **Schéma de Base de Données** : [Documentation de Base de Données](../development/database)

### Support {#support}
- **Problèmes GitHub** : [Signaler des bogues ou demander des fonctionnalités](https://github.com/wsj-br/duplistatus/issues)
