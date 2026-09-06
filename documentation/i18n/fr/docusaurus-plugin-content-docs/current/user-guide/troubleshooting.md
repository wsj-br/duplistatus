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

- **Vérifier la Configuration de Duplicati**: Confirmez que Duplicati est configuré correctement pour envoyer du JSON à **duplistatus**. Sur Duplicati 2.0.9.106 et ultérieur, utilisez `--send-http-json-urls` pointant vers `/api/upload`. Sur les versions antérieures de Duplicati, utilisez `--send-http-url` avec `--send-http-result-output-format=Json`. Voir [Configuration du Serveur Duplicati](../installation/duplicati-server-configuration.md).
- **Vérifier la Connectivité Réseau**: Assurez-vous que le serveur Duplicati peut se connecter au serveur **duplistatus**. Confirmez que le port est correct (par défaut: `9666`).
- **HTTP 401**: Les clés API sont requises et l'URL de téléchargement manque d'une clé de portée de téléchargement valide. Ajoutez `?api_key=` comme décrit dans [Clés API](settings/api-keys-settings.md).
- **HTTP 403**: La portée de la clé est incorrecte (une clé de lecture ne peut pas télécharger), ou l'hôte Duplicati n'est pas sur la [liste d'adresses IP autorisées de l'API externe](settings/ip-allowlist-settings.md).
- **HTTP 413**: Le rapport JSON est plus grand que la limite de taille de téléchargement (par défaut 5 Mo). Réduisez `--send-http-max-log-lines` ou augmentez la limite dans Paramètres → Clés API.
- **HTTP 429**: La limite de taux de téléchargement par IP a été dépassée. Attendez `Retry-After`, ou augmentez les limites si de nombreux travaux se terminent en même temps.
- **Vérifier les Journaux de Duplicati**: Vérifiez les erreurs de requête HTTP dans les journaux de Duplicati.
- **Double reporting**: Si vous envoyez également des rapports de formulaire à [Duplicati Monitoring](https://www.duplicati-monitoring.com/), un échec ou une erreur HTTP 500 de ce service peut empêcher Duplicati d'envoyer le rapport JSON à **duplistatus**. Les URL de formulaire sont envoyées en premier. Voir [Reporting to duplistatus and Duplicati Monitoring](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Serveurs en double sur le tableau de bord {#duplicate-servers-on-the-dashboard}

Si le même serveur apparaît plusieurs fois sur le tableau de bord, cela se produit le plus souvent après la [collecte des journaux de sauvegarde](collect-backup-logs.md), ou après la réinstallation ou la mise à niveau du serveur Duplicati.

**Causes :**

- **`machine_id` modifié** : Quand vous réinstallez ou mettez à niveau Duplicati, le `machine_id` du serveur peut changer, et **duplistatus** le traite alors comme un nouveau serveur.
- **Bogue de l'API Duplicati** : Dans les versions plus récentes de Duplicati, il existe un bogue où certains points de terminaison de l'API mélangent l'identifiant `identity` et le `machine_id`. Cette incohérence amène **duplistatus** à enregistrer le même serveur sous différents identifiants, générant des doublons.

**Solution de contournement :**

1.  Sur le **serveur Duplicati**, effectuez **l'une** des opérations suivantes :
    - Modifiez les fichiers `identity.txt` et `machineid.txt` afin que les deux fichiers contiennent le **même** identifiant ; ou
    - Ouvrez **Duplicati → Paramètres → Options avancées → Machine-id** et définissez une valeur (elle est remplie automatiquement — acceptez simplement la valeur suggérée).
2.  **Redémarrez** le serveur Duplicati pour que la modification prenne effet.
3.  Dans **duplistatus**, consolidez les entrées en double en utilisant [Paramètres → Maintenance de la base de données → Fusionner les serveurs en double](settings/database-maintenance.md#merge-duplicate-servers).

### Notifications non fonctionnelles (Détaillé) {#notifications-not-working-detailed}

Si les notifications ne sont pas envoyées ou reçues :

- **Vérifier la configuration NTFY** : Assurez-vous que l'URL NTFY et le sujet sont corrects. Utilisez le bouton **Envoyer une notification de test** pour tester.
- **Vérifier la connectivité réseau** : Vérifiez que **duplistatus** peut atteindre votre serveur NTFY. Vérifiez les paramètres du pare-feu le cas échéant.
- **Vérifier les paramètres de notification** : Confirmez que les notifications sont activées pour les sauvegardes pertinentes.

### Versions disponibles non affichées {#available-versions-not-appearing}

Si les versions de sauvegarde ne s'affichent pas sur le tableau de bord ou la page de détails :

- **Vérifier la configuration de Duplicati**: Assurez-vous que `send-http-log-level=Information` et `send-http-max-log-lines=500` sont configurés dans les options avancées de Duplicati. Duplicati conserve les N premières lignes de journal. Si la liste des versions est toujours manquante, augmentez la limite ou utilisez `0` lorsque vous n'envoyez pas de rapports à Duplicati Monitoring. Le **nombre** de versions peut toujours apparaître à partir des statistiques JSON lorsque la liste détaillée est manquante. Voir [Lignes de journal et versions disponibles](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

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

- Sur **Duplicati 2.4 et versions ultérieures**, `/api/v1/systeminfo` répertorie `machine-id` avec une valeur par défaut vide. **duplistatus** lit l'identifiant configuré dans les paramètres du serveur Duplicati. Si la collection ne peut toujours pas identifier le serveur, définissez **Duplicati → Paramètres → Options avancées → Machine-id** et réessayez.

### Mise à niveau depuis une version antérieure (avant 0.9.x) et impossible de se connecter {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** depuis la version 0.9.x nécessite une authentification utilisateur. Un compte `admin` par défaut est créé automatiquement lors de la première installation de l'application ou lors de la mise à niveau à partir d'une version antérieure :
    - Nom d'utilisateur : `admin`
    - Mot de passe : `Duplistatus09`

Vous pouvez créer des comptes utilisateurs supplémentaires dans [Paramètres > Utilisateurs](settings/user-management-settings.md) après la première connexion.

### Mot de passe Admin perdu ou compte verrouillé {#lost-admin-password-or-locked-out}

Si vous avez perdu votre mot de passe administrateur ou été verrouillé hors de votre compte (vous pouvez toujours ouvrir `/login`):

- **Utiliser le script de récupération Admin** : Consultez le guide [Admin Account Recovery](admin-recovery.md) pour obtenir des instructions sur la récupération de l'accès administrateur dans les environnements Docker.
- **Vérifier l'accès au conteneur** : Assurez-vous que vous avez accès à Docker exec au conteneur pour exécuter le script de récupération.

Si le navigateur affiche **Accès refusé** (HTTP 403) avant la connexion, il s'agit d'un [verrouillage de la liste d'adresses IP autorisées](#locked-out-by-ip-allowlist), et non d'un mot de passe oublié. Le script de récupération d'administration ne peut pas le contourner.

### Verrouillé par la liste d'adresses IP autorisées {#locked-out-by-ip-allowlist}

Si Paramètres → [Liste d'adresses IP autorisées](settings/ip-allowlist-settings.md) est activé avec un CIDR manquant ou incorrect, le proxy rejette la demande avant l'authentification. Symptômes typiques:

- Les pages (`/`, `/login`, `/settings`, …) retournent un texte brut **Accès refusé** (HTTP 403).
- Les API de session et d'administration retournent JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` et `/api/ping` répondent toujours (ils sont exemptés). Les cookies de connexion n'aident pas.

Le chemin d'enregistrement essaie d'empêcher cela: vous ne pouvez pas activer la liste **admin** sauf si votre IP actuelle est déjà dans les CIDRs (sauf lors de l'enregistrement depuis la boucle locale). Vous pouvez toujours vous verrouiller en utilisant un CIDR qui correspond maintenant mais pas plus tard (VPN, DHCP, un autre réseau), en configurant mal les proxies de confiance, ou en activant la liste depuis `127.0.0.1` / `::1` sans ajouter cette adresse.

Les variables d'environnement remplacent la base de données, donc vous pouvez récupérer sans l'interface utilisateur. Elles ne réécrivent pas les paramètres; un redémarrage est nécessaire pour que le processus les prenne en compte.

**Désactivez la liste admin** (récupération habituelle):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Ou conservez-la activée et injectez un CIDR qui inclut votre IP actuelle:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Puis redémarrez l'application:

- **Docker Compose**: définissez les mêmes clés sous `environment` dans `docker-compose.yml` (le fichier inclut des exemples commentés) et recréez le conteneur de l'application. `docker exec` ne change pas les variables d'environnement d'un conteneur en cours d'exécution.
- **Local / systemd**: exportez la variable dans l'environnement du service et redémarrez le processus Next.js (pas seulement le service cron).

Après que vous pouvez ouvrir l'interface utilisateur à nouveau:

1. Connectez-vous et corrigez les CIDRs et les proxies de confiance dans Paramètres → Liste d'adresses IP autorisées.
2. Supprimez le remplacement d'environnement pour que les paramètres soient à nouveau la source de vérité.

La liste d'adresses IP **externe API** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) ne verrouille pas le tableau de bord. Récupérez-la de la même manière avec `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` ou `EXTERNAL_API_IP_ALLOWLIST`. Si les téléchargements de Duplicati échouent avec HTTP 403 après avoir activé cette liste, voir [New Backups Not Showing](#new-backups-not-showing). La récupération des proxies de confiance utilise `IP_TRUSTED_PROXIES` (une valeur non vide implique également la confiance-proxy).

Voir [Liste d'adresses IP autorisées](settings/ip-allowlist-settings.md#environment-overrides) et [Variables d'environnement](../installation/environment-variables.md).

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
