---
translation_last_updated: '2026-03-01T00:45:05.246Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: da5148730ecb385b
translation_language: fr
source_file_path: installation/duplicati-server-configuration.md
---
# Configuration du Serveur Duplicati (Requis) {#duplicati-server-configuration-required}

Pour que cette application fonctionne correctement, chacun de vos serveurs Duplicati doit être configuré pour envoyer des rapports HTTP pour chaque exécution de sauvegarde au serveur **duplistatus**.

Appliquez cette configuration à chacun de vos serveurs Duplicati :

1. **Autoriser l'accès à distance :** Se connecter à [l'interface utilisateur de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), sélectionner `Settings`, et autoriser l'accès à distance, y compris une liste de noms d'hôtes (ou utiliser `*`).

![Duplicati settings](/img/duplicati-settings.png)

:::caution
    N'activez l'accès à distance que si votre serveur Duplicati est protégé par un réseau sécurisé
    (par exemple, VPN, LAN privé ou règles de pare-feu). Exposer l'interface Duplicati à l'Internet public
    sans mesures de sécurité appropriées pourrait entraîner un accès non autorisé.
    :::

2. **Configurer la création de rapports de résultats de sauvegarde :** Sur la page Configuration Duplicati, sélectionnez `Settings` et, dans la section `Default Options`, incluez les options suivantes. Remplacez « my.local.server » par le nom de votre serveur ou l'adresse IP où **duplistatus** est en cours d'exécution.

| Option avancée                   | Valeur                                   |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Vous pouvez également cliquer sur `Edit as text` et copier les lignes ci-dessous, en remplaçant `my.local.server` par l'adresse réelle de votre serveur.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Duplicati configuration](/img/duplicati-options.png)

**Notes importantes sur les messages envoyés par Duplicati :**

- Si vous omettez `--send-http-log-level=Information`, aucun message de journal ne sera envoyé à **duplistatus**, uniquement les statistiques. Cela empêchera la fonctionnalité Versions disponibles de fonctionner.
- La configuration recommandée est `--send-http-max-log-lines=0` pour les messages illimités, car la valeur par défaut de Duplicati de 100 messages peut empêcher la réception des versions disponibles dans le journal.
- Si vous limitez le nombre de messages, les messages de journal requis pour obtenir les versions de sauvegarde disponibles peuvent ne pas être reçus. Cela empêchera l'affichage de ces versions pour cette exécution de sauvegarde.

:::tip
Après avoir configuré le serveur **duplistatus**, collectez les journaux de sauvegarde pour tous vos serveurs Duplicati en utilisant [Collecter les journaux de sauvegarde](../user-guide/collect-backup-logs.md).
:::
