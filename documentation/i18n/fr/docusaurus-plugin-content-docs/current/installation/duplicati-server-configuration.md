# Configuration du serveur Duplicati (requis) {/* #duplicati-server-configuration-required */}

Pour que cette application fonctionne correctement, chacun de vos serveurs Duplicati doit être configuré pour envoyer des rapports HTTP pour chaque exécution de sauvegarde au serveur **duplistatus**.

Appliquez cette configuration à chacun de vos serveurs Duplicati :

1. **Configurer la génération de rapports de résultats de sauvegarde :** Sur la page de configuration de Duplicati, sélectionnez `Settings` et, dans la section `Default Options`, incluez les options suivantes.

![Configuration de Duplicati](/img/duplicati-options.png)

Remplacez `my.local.server` par le nom d'hôte ou l'adresse IP que le serveur Duplicati utilise pour atteindre **duplistatus**. Consultez [Duplicati et duplistatus sur le même hôte](#duplicati-and-duplistatus-on-the-same-host) si les deux s'exécutent sur une seule machine.

Consultez la documentation [Notifications HTTP](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) de Duplicati pour la référence des options.

### Options recommandées (Duplicati 2.0.9.106 et versions ultérieures) {/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` envoie déjà du JSON, donc `--send-http-result-output-format=Json` n'est pas requis (et est ignoré pour ces URL).

| Option avancée            | Valeur                                   |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (ajoutez `?api_key=` quand les clés API sont requises) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Vous pouvez également cliquer sur `Edit as text` et copier les lignes ci-dessous, en remplaçant `my.local.server` par l'adresse réelle de votre serveur.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Quand les [clés API](../user-guide/settings/api-keys-settings.md) sont requises, ajoutez la clé de portée de téléchargement à l'URL :

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati ne peut pas définir d'en-têtes HTTP personnalisés. Le paramètre de requête est le moyen pris en charge pour envoyer la clé. Les journaux d'accès du proxy inverse contiendront le secret, alors limitez qui peut lire ces journaux.

`--send-http-max-log-lines=500` maintient le rapport JSON bien en dessous de la limite de taille de téléchargement par défaut de 5 Mo. `--send-http-max-log-lines=0` (illimité) peut dépasser cette limite et renvoyer HTTP 413. Augmentez la limite dans Paramètres → Clés API si vous avez besoin de rapports plus volumineux.

### Versions anciennes de Duplicati {/* #older-duplicati-versions */}

Si votre serveur Duplicati est antérieur à 2.0.9.106, utilisez l'option URL héritée et définissez le format de résultat sur JSON :

| Option avancée                   | Valeur                                   |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=500
```

### Lignes de journal et versions disponibles {/* #log-lines-and-available-versions */}

**Notes importantes sur les messages envoyés par Duplicati :**

- Si vous omettez `--send-http-log-level=Information`, aucun message de journal ne sera envoyé à **duplistatus**, uniquement les statistiques. Cela empêchera la **liste** des versions disponibles de fonctionner.
- La valeur par défaut de Duplicati est `--send-http-max-log-lines=100`. La valeur recommandée est `500`. Duplicati conserve les **premiers** N lignes de journal. Les lignes utilisées pour la liste des versions disponibles (`Backups to consider`) se trouvent généralement dans ces premiers centaines de lignes ; `100` est souvent trop peu.
- `--send-http-max-log-lines=0` signifie illimité. Utilisez cela uniquement si la liste des versions est toujours manquante et que vous n'envoyez **pas** également des rapports à [Duplicati Monitoring](https://www.duplicati-monitoring.com/). Les journaux illimités peuvent faire que ce service retourne HTTP 500 sur les grandes tâches.
- Le **nombre** de versions disponibles provient toujours des statistiques JSON (`BackupListCount`) même quand la liste détaillée d'horodatage est manquante. Si l'icône de liste est grisée, augmentez la limite (ou utilisez `0` lors de la création de rapports uniquement à **duplistatus**).

:::tip
Après avoir configuré le serveur **duplistatus**, collectez les journaux de sauvegarde pour tous vos serveurs Duplicati en utilisant [Collecter les journaux de sauvegarde](../user-guide/collect-backup-logs.md).
:::

### Création de rapports vers duplistatus et Duplicati Monitoring {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

Vous pouvez envoyer des rapports du **même** serveur Duplicati à **duplistatus** et à [Duplicati Monitoring](https://www.duplicati-monitoring.com/) en même temps. **duplistatus** doit recevoir du JSON. Duplicati Monitoring attend des rapports codés en formulaire. Ne pointez pas `--send-http-form-urls` vers `/api/upload`.

Sur ce serveur Duplicati, définissez les options par défaut sur :

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Remplacez `<your-endpoint>` par l'URL de votre compte Duplicati Monitoring.

- Préférez ces options dédiées. Ne conservez pas également `--send-http-url` pointant vers les mêmes destinations à moins que vous ayez toujours besoin de l'option héritée.
- `--send-http-log-level` et `--send-http-max-log-lines` s'appliquent à **chaque** cible HTTP. Vous ne pouvez pas envoyer un journal complet à **duplistatus** et un rapport court à Duplicati Monitoring.
- Utilisez `500`, pas `0`. Si Duplicati Monitoring retourne toujours HTTP 500 sur les grandes tâches, abaissez davantage la limite (ou omettez `Information`) en sachant que la **liste** des versions peut être manquante. Si la liste est manquante mais que Monitoring fonctionne bien, augmentez la limite. Sinon, créez des rapports uniquement à **duplistatus** pour ces tâches.

:::caution
Si une cible HTTP échoue (panne ou HTTP 500), Duplicati peut ne pas envoyer les rapports restants. Les URL de formulaire sont envoyées en premier, puis les URL JSON. Une panne ou un 500 de Duplicati Monitoring peut donc bloquer le rapport JSON vers **duplistatus**.
:::

[Collecter les journaux de sauvegarde](../user-guide/collect-backup-logs.md) ne dépend pas de la création de rapports HTTP. Utilisez-le pour remplir une exécution qui n'a pas été reçue.

### Duplicati et duplistatus sur le même hôte {/* #duplicati-and-duplistatus-on-the-same-host */}

L'URL de téléchargement doit être accessible **depuis le processus Duplicati**, pas depuis votre navigateur.

- **duplicati sur l'hôte, duplistatus dans Docker avec le port `9666` publié :** `http://127.0.0.1:9666/api/upload` (ou l'IP LAN de l'hôte).
- **Les deux dans Docker sur un réseau partagé :** `http://duplistatus:9666/api/upload` (le nom du service Compose ou du conteneur). `localhost` dans le conteneur duplicati correspond à ce conteneur, et non à **duplistatus**.
- **Proxy inverse HTTPS sur le même hôte :** utilisez l'URL HTTPS publique comme dans [Configuration de la sécurité](security-configuration.md).

Collecter les journaux de sauvegarde est la direction inverse : depuis le conteneur **duplistatus**, `localhost:8200` n'est pas Duplicati sur l'hôte. Utilisez l'IP de l'hôte, `host.docker.internal` (Docker Desktop, ou un hôte supplémentaire que vous avez configuré), ou le nom du conteneur Duplicati.

2. **Facultatif - Autoriser l'accès à l'interface utilisateur à distance :** Si vous souhaitez accéder directement à l'interface web de Duplicati depuis les liens du tableau de bord **duplistatus**, connectez-vous à [l'interface utilisateur de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), sélectionnez `Settings`, et autorisez l'accès à distance, y compris une liste de noms d'hôtes (ou utilisez `*`). Si vous ignorez cette étape, **duplistatus** recevra toujours les rapports de sauvegarde, mais les liens directs vers l'interface utilisateur de Duplicati ne fonctionneront pas.

:::info
Si vous n'activez pas l'accès à distance dans Duplicati, les liens dans **Duplistatus** pour accéder à l'__interface utilisateur de Duplicati__ ne fonctionneront pas.
:::

![Paramètres de Duplicati](/img/duplicati-settings.png)

:::caution
N'activez l'accès à distance que si votre serveur Duplicati est protégé par un réseau sécurisé
(par exemple, VPN, LAN privé ou règles de pare-feu). Exposer l'interface Duplicati à l'Internet public
sans mesures de sécurité appropriées pourrait entraîner un accès non autorisé.

Il est recommandé d'utiliser Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ou des solutions similaires pour accéder de manière sécurisée à vos serveurs depuis l'extérieur de votre réseau local.
:::
