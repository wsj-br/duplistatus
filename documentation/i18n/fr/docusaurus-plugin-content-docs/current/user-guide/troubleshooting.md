# Dépannage {/* #troubleshooting */}

### Tableau de bord ne se chargeant pas {/* #dashboard-not-loading */}
- Vérifiez si le conteneur est en cours d'exécution : `docker ps`
- Vérifiez que le port 9666 est accessible
- Consultez les journaux du conteneur : `docker logs duplistatus`
- Si vous utilisez un proxy inverse, vérifiez les journaux du proxy inverse pour détecter les erreurs
- Si vous utilisez des listes d'adresses IP autorisées, consultez les journaux de la liste d'adresses IP autorisées pour détecter les erreurs

### Aucune donnée de sauvegarde {/* #no-backup-data */}
- Vérifiez la configuration du serveur Duplicati
- Vérifiez la connectivité réseau entre les serveurs
- Examinez les journaux de duplistatus pour détecter les erreurs
- Assurez-vous que les tâches de sauvegarde sont en cours d'exécution
- Si vous utilisez des clés API, assurez-vous que la clé API est correcte, que la portée est correcte et qu'elle n'est pas expirée (une clé de lecture ne peut pas télécharger)

### Notifications ne fonctionnant pas {/* #notifications-not-working */}
- Vérifiez la configuration des notifications
- Vérifiez la connectivité au serveur NTFY (si NTFY est utilisé)
- Testez les paramètres de notification
- Consultez les journaux des notifications

### Nouvelles sauvegardes ne s'affichant pas {/* #new-backups-not-showing */}

Si vous voyez des avertissements du serveur Duplicati comme `HTTP Response request failed for:` et `Failed to send message: System.Net.Http.HttpRequestException:`, et que les nouvelles sauvegardes n'apparaissent pas dans le tableau de bord ou l'historique des sauvegardes :

- **Vérifiez la configuration de Duplicati** : Confirmez que Duplicati est correctement configuré pour envoyer du JSON à **duplistatus**. Sur Duplicati 2.0.9.106 et versions ultérieures, utilisez `--send-http-json-urls` pointant vers `/api/upload`. Sur les anciennes versions de Duplicati, utilisez `--send-http-url` avec `--send-http-result-output-format=Json`. Voir [Configuration du serveur Duplicati](../installation/duplicati-server-configuration.md).
- **Vérifiez la connectivité réseau** : Assurez-vous que le serveur Duplicati peut se connecter au serveur **duplistatus**. Confirmez que le port est correct (par défaut : `9666`).
- **HTTP 401** : Les clés API sont requises et l'URL de téléchargement ne comporte pas de clé de portée de téléchargement valide. Ajoutez `?api_key=` comme décrit dans [Clés API](settings/api-keys-settings.md).
- **HTTP 403** : La portée de la clé est incorrecte (une clé de lecture ne peut pas télécharger), ou l'hôte Duplicati n'est pas sur la [liste d'adresses IP autorisées de l'API externe](settings/ip-allowlist-settings.md).
- **HTTP 413** : Le rapport JSON est plus volumineux que la limite de taille de téléchargement (5 Mo par défaut). Réduisez `--send-http-max-log-lines` ou augmentez la limite dans Paramètres → Clés API.
- **HTTP 429** : La limite de débit de téléchargement par IP a été dépassée. Attendez `Retry-After`, ou augmentez les limites si de nombreuses tâches se terminent en même temps.
- **Consultez les journaux de Duplicati** : Recherchez les erreurs de requête HTTP dans les journaux de Duplicati.
- **Double rapport** : Si vous envoyez également des rapports de formulaire à [Surveillance Duplicati](https://www.duplicati-monitoring.com/), un échec ou une erreur HTTP 500 provenant de ce service peut empêcher Duplicati d'envoyer le rapport JSON à **duplistatus**. Les URL de formulaire sont envoyées en premier. Voir [Rapport à duplistatus et Surveillance Duplicati](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Serveurs en double sur le tableau de bord {/* #duplicate-servers-on-the-dashboard */}

Si le même serveur apparaît plusieurs fois sur le tableau de bord, cela arrive généralement après [la collecte des journaux de sauvegarde](collect-backup-logs.md), ou après une réinstallation ou une mise à niveau du serveur Duplicati.

**Causes :**

- **Changement de `machine_id`** : Lorsque vous réinstallez ou mettez à niveau Duplicati, le `machine_id` du serveur peut changer, et **duplistatus** le traite alors comme un nouveau serveur.
- **Bug de l'API Duplicati** : Dans les versions récentes de Duplicati, il existe un bug où certains points de terminaison de l'API mélangent l'id `identity` et le `machine_id`. Cette incohérence amène **duplistatus** à enregistrer le même serveur sous différents identifiants, générant des doublons.

**Solution :**

1.  Sur le **serveur Duplicati**, faites **l'une** des opérations suivantes :
    - Modifiez les fichiers `identity.txt` et `machineid.txt` afin que les deux fichiers contiennent le **même** identifiant ; ou
    - Ouvrez **Duplicati → Paramètres → Options avancées → Identifiant machine** et définissez une valeur (elle est pré-remplie — acceptez simplement la valeur suggérée).
2.  **Redémarrez** le serveur Duplicati pour que la modification prenne effet.
3.  Dans **duplistatus**, consolidez les entrées en double en utilisant [Paramètres → Maintenance de la base de données → Fusionner les serveurs en double](settings/database-maintenance.md#merge-duplicate-servers).

### Notifications ne fonctionnant pas (en détail) {/* #notifications-not-working-detailed */}

Si les notifications ne sont pas envoyées ou reçues :

- **Vérifiez la configuration NTFY** : Assurez-vous que l'URL et le sujet NTFY sont corrects. Utilisez le bouton **Envoyer une notification de test** pour tester.
- **Vérifiez la connectivité réseau** : Vérifiez que **duplistatus** peut atteindre votre serveur NTFY. Consultez les paramètres du pare-feu si nécessaire.
- **Vérifiez les paramètres de notification** : Confirmez que les notifications sont activées pour les sauvegardes concernées.

### Versions disponibles ne s'affichant pas {/* #available-versions-not-appearing */}

Si les versions de sauvegarde ne sont pas affichées sur le tableau de bord ou la page de détails :

- **Vérifier la configuration de Duplicati** : Assurez-vous que `send-http-log-level=Information` et `send-http-max-log-lines=500` sont configurés dans les options avancées de Duplicati. Duplicati conserve les N premières lignes de journal. Si la liste des versions est toujours manquante, augmentez la limite ou utilisez `0` lorsque vous n'envoyez pas également de rapports à la surveillance Duplicati. Le **nombre** de versions peut toujours apparaître à partir des statistiques JSON lorsque la liste détaillée est absente. Voir [Lignes de journal et versions disponibles](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Les alertes de sauvegarde en retard ne fonctionnent pas {/* #overdue-backup-alerts-not-working */}

Si les notifications de sauvegarde en retard ne sont pas envoyées :

- **Vérifier la configuration en retard** : Confirmez que la surveillance de sauvegarde est activée pour la sauvegarde. Vérifiez les paramètres d'intervalle et de tolérance attendus.
- **Vérifier la fréquence des notifications** : Si réglé sur **Une fois**, les alertes ne sont envoyées qu'une seule fois par événement de retard.
- **Vérifier le service Cron** : Assurez-vous que le service cron qui surveille les sauvegardes en retard fonctionne correctement. Consultez les journaux de l'application pour détecter les erreurs. Vérifiez que le service cron est accessible sur le port configuré (par défaut : `8667`).

### La collecte des journaux de sauvegarde ne fonctionne pas {/* #collect-backup-logs-not-working */}

Si la collecte manuelle des journaux de sauvegarde échoue :

- **Vérifier l'accès au serveur Duplicati** : Vérifiez que le nom d'hôte et le port du serveur Duplicati sont corrects. Confirmez que l'accès distant est activé dans Duplicati. Assurez-vous que le mot de passe d'authentification est correct.
- **Vérifier la connectivité réseau** : Testez la connectivité depuis **duplistatus** vers le serveur Duplicati. Confirmez que le port du serveur Duplicati est accessible (par défaut : `8200`).
  Par exemple, si vous utilisez Docker, vous pouvez utiliser `docker exec -it <container-name> /bin/sh` pour accéder à la ligne de commande du conteneur et exécuter des outils réseau comme `ping` et `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Vérifiez également la configuration DNS à l'intérieur du conteneur (voir plus d'informations dans [Configuration DNS pour les conteneurs Podman](../installation/installation.md#configuring-dns-for-podman-containers))

- Sur **Duplicati 2.4 et versions ultérieures**, `/api/v1/systeminfo` liste `machine-id` avec une valeur par défaut vide. **duplistatus** lit l'identifiant configuré à partir des paramètres du serveur Duplicati. Si la collecte ne parvient toujours pas à identifier le serveur, définissez **Duplicati → Paramètres → Options avancées → Machine-id** et réessayez.

### Mise à niveau à partir d'une version antérieure (avant 0.9.x) et impossible de se connecter {/* #upgrade-from-an-earlier-version-before-09x-and-cant-login */}

**duplistatus** à partir de la version 0.9.x nécessite une authentification utilisateur. Un compte `admin` par défaut est créé automatiquement lors de la première installation de l'application ou lors de la mise à niveau à partir d'une version antérieure : 
    - nom d'utilisateur : `admin`
    - mot de passe : `Duplistatus09`

Vous pouvez créer des comptes d'utilisateurs supplémentaires dans [Paramètres > Utilisateurs](settings/user-management-settings.md) après la première connexion.

### Mot de passe Admin perdu ou compte verrouillé {/* #lost-admin-password-or-locked-out */}

Si vous avez perdu votre mot de passe administrateur ou que vous êtes bloqué hors de votre compte (vous pouvez toujours ouvrir `/login`) :

- **Utiliser le script de récupération Admin** : Consultez le guide [Récupération du compte Admin](admin-recovery.md) pour obtenir des instructions sur la récupération de l'accès administrateur dans les environnements Docker.
- **Vérifier l'accès au conteneur** : Assurez-vous d'avoir un accès Docker exec au conteneur pour exécuter le script de récupération.

Si le navigateur affiche **Accès refusé** (HTTP 403) avant la connexion, il s'agit d'un [verrouillage par liste d'adresses IP autorisées](#locked-out-by-ip-allowlist), et non d'un mot de passe oublié. Le script de récupération admin ne peut pas le contourner.

### Verrouillé par liste d'adresses IP autorisées {/* #locked-out-by-ip-allowlist */}

Si Paramètres → [Liste d'adresses IP autorisées](settings/ip-allowlist-settings.md) est activé avec un CIDR manquant ou incorrect, le proxy rejette la requête avant l'authentification. Symptômes typiques :

- Les pages (`/`, `/login`, `/settings`, …) renvoient du texte brut **Accès refusé** (HTTP 403).
- Les API de session et d'admin renvoient du JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` et `/api/ping` renvoient également 403 depuis une IP non listée lorsque l'une ou l'autre liste d'autorisation est activée. Elles répondent toujours depuis loopback. Les cookies de connexion ne permettent pas de contourner cela.

Pour confirmer que l'application est active pendant un verrouillage, exécutez la sonde depuis l'intérieur du conteneur (la boucle locale est toujours autorisée) :

```bash
docker exec duplistatus curl -sf http://127.0.0.1:9666/api/ping
```

Le chemin d'enregistrement tente d'empêcher cela : vous ne pouvez pas activer la liste **admin** à moins que votre IP actuelle figure déjà dans les CIDR (sauf lors de l'enregistrement depuis loopback). Vous pouvez toujours vous verrouiller en utilisant un CIDR qui correspond maintenant mais pas plus tard (VPN, DHCP, un autre réseau), en configurant incorrectement les proxies de confiance ou en activant la liste depuis `127.0.0.1` / `::1` sans ajouter cette adresse.

Les variables d'environnement remplacent la base de données, donc vous pouvez récupérer sans l'interface utilisateur. Elles ne réécrivent pas les Paramètres ; un redémarrage est nécessaire pour que le processus les prenne en compte.

**Désactiver la liste admin** (récupération habituelle) :

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Ou laissez-la activée et injectez un CIDR incluant votre IP actuelle :**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Puis redémarrez l'application :

- **Docker Compose** : définissez les mêmes clés sous `environment` dans `docker-compose.yml` (le fichier inclut des exemples commentés) et recréez le conteneur de l'application. `docker exec` ne modifie pas les variables d'environnement d'un conteneur en cours d'exécution.
- **Local / systemd** : exportez la variable dans l'environnement du service et redémarrez le processus Next.js (pas seulement le service cron).

Après avoir pu rouvrir l'interface utilisateur :

1. Connectez-vous et corrigez les CIDR et les proxys de confiance dans Paramètres → Liste d'adresses IP autorisées.
2. Supprimez la substitution d'environnement pour que les Paramètres redeviennent la source de vérité.

La liste d'autorisation de l'**API externe** (`/api/upload`, `/api/summary`, `/api/lastbackup*`) ne verrouille pas le tableau de bord. Récupérez-le de la même manière avec `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` ou `EXTERNAL_API_IP_ALLOWLIST`. Si les téléchargements Duplicati échouent avec HTTP 403 après avoir activé cette liste, consultez [Nouvelles sauvegardes non affichées](#new-backups-not-showing). La récupération via proxy de confiance utilise `IP_TRUSTED_PROXIES` (une valeur non vide implique également la confiance au proxy).

Voir [Liste d'adresses IP autorisées](settings/ip-allowlist-settings.md#environment-overrides) et [Variables d'environnement](../installation/environment-variables.md).

### Sauvegarde et migration de base de données {/* #database-backup-and-migration */}

Lors de la migration depuis des versions antérieures ou de la création d'une sauvegarde de base de données :

**Si vous utilisez la version 1.2.1 ou ultérieure :**
- Utilisez la fonction intégrée de sauvegarde de base de données dans [Paramètres → Maintenance de la base de données](user-guide/settings/database-maintenance.md)
- Sélectionnez le format souhaité (.db ou .sql) et cliquez sur **Télécharger la sauvegarde**
- Le fichier de sauvegarde sera téléchargé sur votre ordinateur
- Voir [Maintenance de la base de données](settings/database-maintenance.md#database-backup) pour des instructions détaillées

**Si vous utilisez une version antérieure à 1.2.1 :**
- Vous devrez effectuer une sauvegarde manuelle. Consultez le [Guide de migration](../migration/version_upgrade.md#backing-up-your-database-before-migration) pour plus d'informations.

Si vous rencontrez toujours des problèmes, essayez les étapes suivantes :

1. **Examiner les journaux de l'application** : Si vous utilisez Docker, exécutez `docker logs <container-name>` pour consulter les informations détaillées sur les erreurs.
2. **Valider la configuration** : Vérifiez attentivement tous les paramètres de configuration dans votre outil de gestion de conteneurs (Docker, Portainer, Podman, etc.), y compris les ports, le réseau et les autorisations.
3. **Vérifier la connectivité réseau** : Confirmez que toutes les connexions réseau sont stables.
4. **Vérifier le service cron** : Assurez-vous que le service cron s'exécute en parallèle de l'application principale. Consultez les journaux des deux services.
5. **Consulter la documentation** : Reportez-vous au guide d'installation et au fichier README pour plus d'informations.
6. **Signaler des problèmes** : Si le problème persiste, veuillez soumettre un problème détaillé sur le [dépôt GitHub duplistatus](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Ressources supplémentaires {/* #additional-resources */}

- **Guide d'installation** : [Guide d'installation](../installation/installation.md)
- **Documentation de Duplicati** : [docs.duplicati.com](https://docs.duplicati.com)
- **Documentation de l'API** : [Référence de l'API](../api-reference/overview.md)
- **Dépôt GitHub** : [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Guide de développement** : [Guide de développement](../development/setup.md)
- **Schéma de base de données** : [Documentation de la base de données](../development/database)

### Support {/* #support */}
- **Problèmes GitHub** : [Signaler des bugs ou demander des fonctionnalités](https://github.com/wsj-br/duplistatus/issues)
