# Dépannage {/* #troubleshooting */}

### Tableau de bord ne se charge pas {/* #dashboard-not-loading */}
- Vérifier si le conteneur est en cours d'exécution : `docker ps`
- Vérifier que le port 9666 est accessible
- Vérifier les journaux du conteneur : `docker logs duplistatus`
- Si vous utilisez un reverse proxy, vérifiez les journaux du reverse proxy pour les erreurs
- Si vous utilisez des listes d'adresses IP autorisées, vérifiez les journaux des listes d'adresses IP pour les erreurs

### Aucune donnée de sauvegarde {/* #no-backup-data */}
- Vérifier la configuration du serveur Duplicati
- Vérifier la connectivité réseau entre les serveurs
- Vérifier les journaux duplistatus pour les erreurs
- S'assurer que les tâches de sauvegarde sont en cours d'exécution
- Si vous utilisez des clés API, assurez-vous que la clé API est correcte, que la portée est correcte et non expirée (une clé de lecture ne peut pas télécharger)

### Notifications ne fonctionnent pas {/* #notifications-not-working */}
- Vérifier la configuration des notifications
- Vérifier la connectivité du serveur NTFY (si vous utilisez NTFY)
- Tester les paramètres de notification
- Vérifier les journaux des notifications

### Nouvelles sauvegardes ne s'affichent pas {/* #new-backups-not-showing */}

Si vous voyez des avertissements du serveur Duplicati comme `HTTP Response request failed for:` et `Failed to send message: System.Net.Http.HttpRequestException:`, et que les nouvelles sauvegardes n'apparaissent pas dans le tableau de bord ou l'historique des sauvegardes :

- **Vérifier la configuration de Duplicati** : Confirmez que Duplicati est configuré correctement pour envoyer du JSON à **duplistatus**. Sur Duplicati 2.0.9.106 et versions ultérieures, utilisez `--send-http-json-urls` pointant vers `/api/upload`. Sur les versions antérieures de Duplicati, utilisez `--send-http-url` avec `--send-http-result-output-format=Json`. Voir [Configuration du serveur Duplicati](../installation/duplicati-server-configuration.md).
- **Vérifier la connectivité réseau** : Assurez-vous que le serveur Duplicati peut se connecter au serveur **duplistatus**. Confirmez que le port est correct (par défaut : `9666`).
- **HTTP 401** : Les clés API sont requises et l'URL de téléchargement manque d'une clé valide avec une portée de téléchargement. Ajoutez `?api_key=` comme décrit dans [Clés API](settings/api-keys-settings.md).
- **HTTP 403** : La portée de la clé est incorrecte (une clé de lecture ne peut pas télécharger), ou l'hôte Duplicati n'est pas sur la [liste d'adresses IP autorisées de l'API externe](settings/ip-allowlist-settings.md).
- **HTTP 413** : Le rapport JSON est plus grand que la limite de taille de téléchargement (par défaut 5 Mo). Réduisez `--send-http-max-log-lines` ou augmentez la limite dans Paramètres → Clés API.
- **HTTP 429** : La limite de débit de téléchargement par adresse IP a été dépassée. Attendez `Retry-After`, ou augmentez les limites si de nombreuses tâches se terminent en même temps.
- **Vérifier les journaux de Duplicati** : Vérifiez les erreurs de requête HTTP dans les journaux de Duplicati.
- **Double reporting** : Si vous envoyez également des rapports de formulaire à [Duplicati Monitoring](https://www.duplicati-monitoring.com/), un échec ou un HTTP 500 de ce service peut empêcher Duplicati d'envoyer le rapport JSON à **duplistatus**. Les URL de formulaire sont envoyées en premier. Voir [Reporting to duplistatus and Duplicati Monitoring](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Serveurs en double sur le tableau de bord {/* #duplicate-servers-on-the-dashboard */}

Si le même serveur apparaît plus d'une fois sur le tableau de bord, cela se produit le plus souvent après [la collecte des journaux de sauvegarde](collect-backup-logs.md), ou après avoir réinstallé ou mis à jour le serveur Duplicati.

**Causes :**

- **`machine_id` modifié** : Lorsque vous réinstallez ou mettez à jour Duplicati, l'`machine_id` du serveur peut changer, et **duplistatus** le traite alors comme un nouveau serveur.
- **Bug de l'API Duplicati** : Dans les nouvelles versions de Duplicati, il y a un bug où certains points de terminaison de l'API mélangent l'`identity` id et l'`machine_id`. Cette incohérence fait que **duplistatus** enregistre le même serveur sous différents ID, générant des doublons.

**Solution :**

1.  Sur le **serveur Duplicati**, faites **l'un** des éléments suivants :
    - Modifier les fichiers `identity.txt` et `machineid.txt` pour que les deux fichiers contiennent le **même** id ; ou
    - Ouvrir **Duplicati → Paramètres → Options avancées → Machine-id** et définir une valeur (elle est pré-remplie — il suffit d'accepter la valeur suggérée).
2.  **Redémarrer** le serveur Duplicati pour que le changement prenne effet.
3.  Dans **duplistatus**, consolidez les entrées en double en utilisant [Paramètres → Maintenance de la base de données → Fusionner les serveurs en double](settings/database-maintenance.md#merge-duplicate-servers).

### Notifications ne fonctionnent pas (Détails) {/* #notifications-not-working-detailed */}

Si les notifications ne sont pas envoyées ou reçues :

- **Vérifier la configuration NTFY** : Assurez-vous que l'URL NTFY et le sujet sont corrects. Utilisez le bouton **Envoyer une notification de test** pour tester.
- **Vérifier la connectivité réseau** : Vérifiez que **duplistatus** peut atteindre votre serveur NTFY. Vérifiez les paramètres du pare-feu si applicable.
- **Vérifier les paramètres de notification** : Confirmez que les notifications sont activées pour les sauvegardes pertinentes.

### Versions disponibles non affichées {/* #available-versions-not-appearing */}

Si les versions de sauvegarde ne s'affichent pas sur le tableau de bord ou la page de détails :

- **Vérifier la configuration de Duplicati** : Assurez-vous que `send-http-log-level=Information` et `send-http-max-log-lines=500` sont configurés dans les options avancées de Duplicati. Duplicati conserve les N premières lignes de journal. Si la liste des versions est toujours manquante, augmentez le plafond ou utilisez `0` lorsque vous n'envoyez pas également de rapports à Duplicati Monitoring. Le **nombre** de versions peut toujours apparaître à partir des statistiques JSON lorsque la liste détaillée est manquante. Voir [Lignes de journal et versions disponibles](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Alertes de sauvegarde en retard ne fonctionnent pas {/* #overdue-backup-alerts-not-working */}

Si les notifications de sauvegarde en retard ne sont pas envoyées :

- **Vérifier la configuration en retard** : Confirmez que la surveillance des sauvegardes est activée pour la sauvegarde. Vérifiez les paramètres de l'intervalle attendu et de la tolérance.
- **Vérifier la fréquence des notifications** : Si définie sur **Une fois**, les alertes ne sont envoyées qu'une fois par événement en retard.
- **Vérifier le service cron** : Assurez-vous que le service cron qui surveille les sauvegardes en retard fonctionne correctement. Vérifiez les journaux de l'application pour les erreurs. Vérifiez que le service cron est accessible au port configuré (par défaut : `8667`).

### Collecte des journaux de sauvegarde ne fonctionne pas {/* #collect-backup-logs-not-working */}

Si la collecte manuelle des journaux de sauvegarde échoue :

- **Vérifier l'accès au serveur Duplicati** : Vérifiez que le nom d'hôte et le port du serveur Duplicati sont corrects. Confirmez que l'accès distant est activé dans Duplicati. Assurez-vous que le mot de passe d'authentification est correct.
- **Vérifier la connectivité réseau** : Testez la connectivité depuis **duplistatus** vers le serveur Duplicati. Confirmez que le port du serveur Duplicati est accessible (par défaut : `8200`).
  Par exemple, si vous utilisez Docker, vous pouvez utiliser `docker exec -it <container-name> /bin/sh` pour accéder à la ligne de commande du conteneur et exécuter des outils réseau comme `ping` et `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Vérifiez également la configuration DNS à l'intérieur du conteneur (voir plus à [Configuration DNS pour les conteneurs Podman](../installation/installation.md#configuring-dns-for-podman-containers))

- Sur **Duplicati 2.4 et ultérieur**, `/api/v1/systeminfo` liste `machine-id` avec une valeur par défaut vide. **duplistatus** lit l'identifiant configuré à partir des paramètres du serveur Duplicati. Si la collecte ne peut toujours pas identifier le serveur, définissez **Duplicati → Paramètres → Options avancées → Machine-id** et réessayez.

### Mise à niveau depuis une version antérieure (avant 0.9.x) et impossible de se connecter {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** depuis la version 0.9.x nécessite une authentification utilisateur. Un compte `admin` par défaut est créé automatiquement lors de la première installation de l'application ou lors de la mise à niveau depuis une version antérieure : 
    - nom d'utilisateur : `admin`
    - mot de passe : `Duplistatus09`

Vous pouvez créer des comptes d'utilisateurs supplémentaires dans [Paramètres > Utilisateurs](settings/user-management-settings.md) après la première connexion.

### Mot de passe administrateur perdu ou accès refusé {/* #lost-admin-password-or-locked-out */}

Si vous avez perdu votre mot de passe administrateur ou été bloqué hors de votre compte (vous pouvez toujours ouvrir `/login`) :

- **Utiliser le script de récupération d'administrateur** : Consultez le guide [Récupération du compte administrateur](admin-recovery.md) pour les instructions sur la récupération de l'accès administrateur dans les environnements Docker.
- **Vérifier l'accès au conteneur** : Assurez-vous d'avoir l'accès Docker exec au conteneur pour exécuter le script de récupération.

Si le navigateur affiche **Accès refusé** (HTTP 403) avant la connexion, il s'agit d'un [blocage de liste d'adresses IP](#locked-out-by-ip-allowlist), et non d'un mot de passe oublié. Le script de récupération d'administrateur ne peut pas le contourner.

### Accès refusé par la liste d'adresses IP {/* #locked-out-by-ip-allowlist */}

Si Paramètres → [Liste d'adresses IP autorisées](settings/ip-allowlist-settings.md) est activé avec un CIDR manquant ou incorrect, le proxy rejette la requête avant l'authentification. Symptômes typiques :

- Les pages (`/`, `/login`, `/settings`, …) retournent un texte brut **Accès refusé** (HTTP 403).
- Les API de session et d'administration retournent JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` et `/api/ping` retournent également 403 depuis une adresse IP non listée lorsque l'une des listes d'adresses IP est activée. Ils répondent toujours depuis la boucle locale. Les cookies de connexion n'aident pas.

Pour confirmer que l'application est en cours d'exécution pendant un verrouillage, exécutez la sonde à l'intérieur du conteneur (la boucle locale est toujours autorisée) :

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

Le chemin de sauvegarde tente d'empêcher cela : vous ne pouvez pas activer la liste **admin** sauf si votre IP actuelle est déjà dans les CIDRs (sauf lors de la sauvegarde depuis la boucle locale). Vous pouvez toujours vous verrouiller en utilisant un CIDR qui correspond maintenant mais pas plus tard (VPN, DHCP, un autre réseau), en configurant mal les proxies de confiance, ou en activant la liste depuis `127.0.0.1` / `::1` sans ajouter cette adresse.

Les variables d'environnement remplacent la base de données, donc vous pouvez récupérer sans l'interface utilisateur. Elles ne réécrivent pas les Paramètres ; un redémarrage est nécessaire pour que le processus les prenne en compte.

**Désactivez la liste admin** (récupération habituelle) :

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Ou conservez-la activée et injectez un CIDR qui inclut votre IP actuelle :**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Puis redémarrez l'application :

- **Docker Compose** : définissez les mêmes clés sous `environment` dans `docker-compose.yml` (le fichier inclut des exemples commentés) et recréez le conteneur de l'application. `docker exec` ne change pas les variables d'environnement d'un conteneur en cours d'exécution.
- **Local / systemd** : exportez la variable dans l'environnement du service et redémarrez le processus Next.js (pas seulement le service cron).

Après que vous puissiez ouvrir l'interface utilisateur à nouveau :

1. Connectez-vous et corrigez les CIDRs et les proxies de confiance dans Paramètres → Liste d'adresses IP autorisées.
2. Supprimez le remplacement d'environnement pour que les Paramètres soient à nouveau la source de vérité.

La liste d'autorisation de l'**API externe** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) ne verrouille pas le tableau de bord. Récupérez-la de la même manière avec `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` ou `EXTERNAL_API_IP_ALLOWLIST`. Si les téléchargements Duplicati échouent avec HTTP 403 après avoir activé cette liste, consultez [Nouveaux sauvegardes non affichées](#new-backups-not-showing). La récupération des proxies de confiance utilise `IP_TRUSTED_PROXIES` (une valeur non vide implique également trust-proxy).

Consultez [Liste d'adresses IP autorisées](settings/ip-allowlist-settings.md#environment-overrides) et [Variables d'environnement](../installation/environment-variables.md).

### Sauvegarde et migration de la base de données {/* #database-backup-and-migration */}

Lors de la migration depuis des versions précédentes ou de la création d'une sauvegarde de la base de données :

**Si vous utilisez la version 1.2.1 ou ultérieure :**
- Utilisez la fonction de sauvegarde de la base de données intégrée dans [Paramètres → Maintenance de la base de données](user-guide/settings/database-maintenance.md)
- Sélectionnez le format de votre choix (.db ou .sql) et cliquez sur **Télécharger la sauvegarde**
- Le fichier de sauvegarde sera téléchargé sur votre ordinateur
- Consultez [Maintenance de la base de données](settings/database-maintenance.md#database-backup) pour des instructions détaillées

**Si vous utilisez une version antérieure à 1.2.1 :**
- Vous devrez effectuer une sauvegarde manuellement. Consultez le [Guide de migration](../migration/version_upgrade.md#backing-up-your-database-before-migration) pour plus d'informations.

Si vous rencontrez toujours des problèmes, essayez les étapes suivantes :

1.  **Inspecter les Journaux de l'application** : Si vous utilisez Docker, exécutez `docker logs <container-name>` pour examiner les informations détaillées sur les erreurs.
2.  **Valider la configuration** : Vérifiez soigneusement tous les paramètres de configuration dans votre outil de gestion de conteneurs (Docker, Portainer, Podman, etc.) y compris les ports, le réseau et les autorisations.
3.  **Vérifier la connectivité réseau** : Confirmez que toutes les connexions réseau sont stables. 
4.  **Vérifier le service cron** : Assurez-vous que le service cron fonctionne en parallèle avec l'application principale. Vérifiez les journaux des deux services.
5.  **Consulter la documentation** : Consultez le Guide d'installation et le README pour plus d'informations.
6.  **Signaler les problèmes** : Si le problème persiste, veuillez soumettre un problème détaillé sur le [dépôt GitHub duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Ressources supplémentaires {/* #additional-resources */}

- **Guide d'installation** : [Guide d'installation](../installation/installation.md)
- **Documentation Duplicati** : [docs.duplicati.com](https://docs.duplicati.com)
- **Documentation de l'API** : [Référence de l'API](../api-reference/overview.md)
- **Dépôt GitHub** : [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guide de développement** : [Guide de développement](../development/setup.md)
- **Schéma de base de données** : [Documentation de la base de données](../development/database)

### Support {/* #support */}
- **Problèmes GitHub** : [Signaler des bugs ou demander des fonctionnalités](https://github.com/wsj-br/duplistatus/issues)
