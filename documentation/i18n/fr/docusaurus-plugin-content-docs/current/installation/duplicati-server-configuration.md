---
translation_last_updated: '2026-05-11T14:27:42.333Z'
source_file_mtime: '2026-05-10T19:00:19.989Z'
source_file_hash: c3785bbdf46a519aee1f05ff2845a158534f37927bd8ac3eade9f28f6acdb51b
translation_language: fr
source_file_path: documentation/docs/installation/duplicati-server-configuration.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Configuration du Serveur Duplicati (Requis) {#duplicati-server-configuration-required}

Pour que cette application fonctionne correctement, chacun de vos serveurs Duplicati doit être configuré pour envoyer des rapports HTTP pour chaque exécution de sauvegarde au serveur **duplistatus**.

Appliquez cette configuration à chacun de vos serveurs Duplicati :

1. **Configurer la création de rapports de sauvegarde :** Sur la page de configuration de Duplicati, sélectionnez `Settings` et, dans la section `Default Options`, incluez les options suivantes.

![Duplicati configuration](/img/duplicati-options.png)

Remplacez 'my.local.server' par le nom de votre serveur ou l'adresse IP où **duplistatus** est en cours d'exécution.

| Option avancée                   | Valeur                                     |
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

**Notes importantes sur les messages envoyés par Duplicati :**

- Si vous omettez `--send-http-log-level=Information`, aucun message de journal ne sera envoyé à **duplistatus**, uniquement les statistiques. Cela empêchera la fonctionnalité Versions disponibles de fonctionner.
- La configuration recommandée est `--send-http-max-log-lines=0` pour les messages illimités, car la valeur par défaut de Duplicati de 100 messages peut empêcher la réception des versions disponibles dans le journal.
- Si vous limitez le nombre de messages, les messages de journal requis pour obtenir les versions de sauvegarde disponibles peuvent ne pas être reçus. Cela empêchera l'affichage de ces versions pour cette exécution de sauvegarde.

:::tip
Après avoir configuré le serveur **duplistatus**, collectez les journaux de sauvegarde pour tous vos serveurs Duplicati en utilisant [Collecter les journaux de sauvegarde](../user-guide/collect-backup-logs.md).
:::

2. **Optionnel - Autoriser l'accès à l'interface distante :** Si vous voulez accéder à l'interface web de Duplicati directement depuis les liens du tableau de bord **duplistatus**, connectez-vous à [l'interface utilisateur de Duplicati](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), sélectionnez `Settings`, et autorisez l'accès distant, en incluant une liste de noms d'hôtes (ou utilisez `*`). Si vous ignorez cette étape, **duplistatus** recevra toujours les rapports de sauvegarde, mais les liens directs vers l'interface utilisateur de Duplicati ne fonctionneront pas.

:::info
Si vous n'activez pas l'accès distant dans Duplicati, les liens dans **Duplistatus** pour accéder à l'__interface utilisateur de Duplicati__ ne fonctionneront pas.
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
N'activez l'accès distant que si votre serveur Duplicati est protégé par un réseau sécurisé
(par exemple, VPN, réseau local privé ou règles de pare-feu). Exposer l'interface de Duplicati à l'Internet public
sans mesures de sécurité appropriées pourrait conduire à un accès non autorisé.

Il est recommandé d'utiliser Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ou des solutions similaires pour accéder en toute sécurité à vos serveurs depuis l'extérieur de votre réseau local.
:::
