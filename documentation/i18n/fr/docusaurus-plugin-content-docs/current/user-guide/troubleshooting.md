# Dépannage {#troubleshooting}

### Tableau de bord ne se charge pas {#dashboard-not-loading}

- Vérifier si le conteneur est en cours d'exécution : `docker ps`
- Vérifier que le Port 9666 est accessible
- Vérifier les journaux du conteneur : `docker logs duplistatus`

### Aucune donnée de sauvegarde {#no-backup-data}

- Vérifier la configuration du serveur Duplicati
- Vérifier la connectivité réseau entre les Serveurs
- Examiner les Journaux duplistatus pour les Erreurs
- S'assurer que les tâches de sauvegarde sont en cours d'exécution

### Notifications ne fonctionnent pas {#notifications-not-working}

- Vérifier la configuration des Notifications
- Vérifier la connectivité du serveur NTFY (si vous utilisez NTFY)
- Tester les Paramètres de notification
- Vérifier les Journaux des Notifications

### Les nouvelles sauvegardes ne s'affichent pas {#new-backups-not-showing}

Si vous voyez des avertissements du serveur Duplicati comme `HTTP Response request failed for:` et `Failed to send message: System.Net.Http.HttpRequestException:`, et que les nouvelles sauvegardes n'apparaissent pas dans le Tableau de bord ou l'Historique des sauvegardes :

- **Vérifier la Configuration Duplicati** : Confirmer que Duplicati est configuré correctement pour envoyer des données à **duplistatus**. Vérifier les Paramètres d'URL HTTP dans Duplicati.
- **Vérifier la connectivité réseau** : S'assurer que le serveur Duplicati peut se connecter au serveur **duplistatus**. Confirmer que le Port est correct (Par défaut : `9666`).
- **Examiner les Journaux Duplicati** : Vérifier les erreurs de requête HTTP dans les Journaux Duplicati.

### Notifications ne fonctionnent pas (Détaillé) {#notifications-not-working-detailed}

Si les Notifications ne sont pas envoyées ou reçues :

- **Vérifier la Configuration NTFY** : S'assurer que l'URL NTFY et le sujet sont corrects. Utiliser le bouton `Envoyer une notification de test` pour tester.
- **Vérifier la connectivité réseau** : Vérifier que **duplistatus** peut atteindre votre serveur NTFY. Examiner les Paramètres de pare-feu si applicable.
- **Vérifier les Paramètres de notification** : Confirmer que les Notifications sont activées pour les Sauvegardes pertinentes.

### Versions disponibles ne s'affichent pas {#available-versions-not-appearing}

Si les versions de sauvegarde ne s'affichent pas sur le Tableau de bord ou la Page de Détails :

- **Vérifier la Configuration Duplicati** : S'assurer que `send-http-log-level=Information` et `send-http-max-log-lines=0` sont configurés dans les options avancées de Duplicati.

### Les alertes de sauvegarde en retard ne fonctionnent pas {#overdue-backup-alerts-not-working}

Si les Notifications de Sauvegarde en retard ne sont pas envoyées :

- **Vérifier la Configuration des retards** : Confirmer que la Surveillance des sauvegardes en retard est activée pour la sauvegarde. Vérifier les Paramètres d'Intervalle attendu et de tolérance.
- **Vérifier la fréquence des Alertes** : Si défini sur `Une fois`, les Alertes ne sont envoyées qu'une seule fois par événement en retard.
- **Vérifier le service Cron** : S'assurer que le service cron qui surveille les Sauvegardes en retard fonctionne correctement. Vérifier les Journaux d'application pour les Erreurs. Vérifier que le service cron est accessible au Port configuré (Par défaut : `8667`).

### Collecter les journaux de sauvegarde ne fonctionne pas {#collect-backup-logs-not-working}

Si la collecte manuelle des Journaux de sauvegarde échoue :

- **Vérifier l'accès au serveur Duplicati** : Vérifier que le Nom d'hôte et le Port du serveur Duplicati sont corrects. Confirmer que l'accès à distance est activé dans Duplicati. S'assurer que le Mot de passe d'authentification est correct.
- **Vérifier la connectivité réseau** : Tester la connectivité de **duplistatus** au serveur Duplicati. Confirmer que le Port du serveur Duplicati est accessible (Par défaut : `8200`).
  Par exemple, si vous utilisez Docker, vous pouvez utiliser `docker exec -it <container-name> /bin/sh` pour accéder à la ligne de commande du conteneur et exécuter des outils réseau comme `ping` et `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

  Vérifiez également la configuration DNS à l'intérieur du conteneur (voir plus à [Configuration DNS pour les conteneurs Podman](../installation/installation.md#configuring-dns-for-podman-containers))

### Mise à niveau à partir d'une version antérieure (\<0.9.x) et impossible de se connecter {#upgrade-from-an-earlier-version-09x-and-cant-login}

**duplistatus** depuis la version 0.9.x nécessite l'authentification des Utilisateurs. Un compte `admin` Par défaut est créé automatiquement lors de l'installation de l'application pour la première fois ou lors de la mise à niveau à partir d'une version antérieure :
\- Nom d'utilisateur : `admin`
\- Mot de passe : `Duplistatus09`

Vous pouvez créer des comptes Utilisateurs supplémentaires dans [Paramètres > Utilisateurs](settings/user-management-settings.md) après la première Connexion.

### Mot de passe Admin perdu ou compte verrouillé {#lost-admin-password-or-locked-out}

Si vous avez perdu votre Mot de passe administrateur ou avez été verrouillé de votre compte :

- **Utiliser le script de récupération Admin** : Consultez le guide [Récupération du compte Admin](admin-recovery.md) pour obtenir des instructions sur la récupération de l'accès administrateur dans les environnements Docker.
- **Vérifier l'accès au conteneur** : S'assurer que vous avez accès à Docker exec au conteneur pour exécuter le script de récupération.

### Sauvegarde et migration de la base de données {#database-backup-and-migration}

Lors de la migration à partir de versions précédentes ou de la création d'une Sauvegarde de la base de données :

**Si vous exécutez la Version 1.2.1 ou ultérieure :**

- Utiliser la fonction de Sauvegarde de la base de données intégrée dans `Paramètres → Maintenance de la base de données`
- Sélectionner votre format préféré (.db ou .sql) et cliquer sur `Télécharger la sauvegarde`
- Le fichier de Sauvegarde sera téléchargé sur votre ordinateur
- Consultez [Maintenance de la base de données](settings/database-maintenance.md#database-backup) pour des instructions détaillées

**Si vous exécutez une Version antérieure à 1.2.1 :**

- Vous devrez effectuer une Sauvegarde manuelle.  consultez le [Guide de migration](../migration/version_upgrade.md#backing-up-your-database-before-migration) pour plus d'informations.

Si vous rencontrez toujours des problèmes, essayez les étapes suivantes :

1. **Inspecter les Journaux d'application** : Si vous utilisez Docker, exécutez `docker logs <container-name>` pour examiner les informations d'erreur détaillées.
2. **Valider la configuration** : Vérifier à nouveau tous les Paramètres de configuration dans votre outil de gestion de conteneur (Docker, Portainer, Podman, etc.) y compris les Ports, le réseau et les autorisations.
3. **Vérifier la connectivité réseau** : Confirmer que tous les connexions réseau sont stables.
4. **Vérifier le service Cron** : S'assurer que le service cron s'exécute aux côtés de l'application principale. Vérifier les Journaux pour les deux services.
5. **Consulter la documentation** : Reportez-vous au Guide d'installation et au README pour plus d'informations.
6. **Signaler les problèmes** : Si le problème persiste, veuillez soumettre un problème détaillé sur le [référentiel duplistatus GitHub](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Ressources supplémentaires {#additional-resources}

- **Guide d'installation** : [Guide d'installation](../installation/installation.md)
- **Documentation Duplicati** : [docs.duplicati.com](https://docs.duplicati.com)
- **Documentation API** : [Référence API](../api-reference/overview.md)
- **Référentiel GitHub** : [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guide de développement** : [Guide de développement](../development/setup.md)
- **Schéma de base de données** : [Documentation de la base de données](../development/database)

### Support {#support}

- **Problèmes GitHub** : [Signaler les bogues ou demander des fonctionnalités](https://github.com/wsj-br/duplistatus/issues)
