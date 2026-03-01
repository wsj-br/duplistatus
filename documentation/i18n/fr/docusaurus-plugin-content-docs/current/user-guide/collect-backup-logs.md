---
translation_last_updated: '2026-03-01T00:45:07.108Z'
source_file_mtime: '2026-02-16T00:30:39.431Z'
source_file_hash: f960ed5694a25582
translation_language: fr
source_file_path: user-guide/collect-backup-logs.md
---
# Collecter les journaux de sauvegarde {#collect-backup-logs}

**duplistatus** peut récupérer les journaux de sauvegarde directement à partir des serveurs Duplicati pour remplir la base de données ou restaurer les données de journaux manquantes. L'application ignore automatiquement tous les journaux en double qui existent déjà dans la base de données.

## Étapes pour collecter les journaux de sauvegarde {#steps-to-collect-backup-logs}

### Collecte manuelle {#manual-collection}

1.  Cliquez sur l'icône <IconButton icon="lucide:download" /> **Collecter les journaux de sauvegarde** dans la [Barre d'outils de l'application](overview#application-toolbar).

![Collect Backup Logs Popup](../assets/screen-collect-button-popup.png)

2.  Sélectionner le serveur

Si vous avez des adresses de serveurs configurées dans [Paramètres → Paramètres des serveurs](settings/server-settings.md), sélectionnez-en une dans la liste déroulante pour une collecte instantanée. Si vous n'avez pas de serveurs configurés, vous pouvez entrer les détails du serveur Duplicati manuellement.

3.  Entrez les détails du serveur Duplicati :
    - **Nom d'hôte** : Le nom d'hôte ou l'adresse IP du serveur Duplicati. Vous pouvez entrer plusieurs noms d'hôte séparés par des virgules, par exemple `192.168.1.23,someserver.local,192.168.1.89`
    - **Port** : Le numéro de port utilisé par le serveur Duplicati (par défaut : `8200`).
    - **Mot de passe** : Entrez le mot de passe d'authentification si requis.
    - **Télécharger les données JSON collectées** : Activez cette option pour télécharger les données collectées par duplistatus.
4.  Cliquez sur **Collecter les sauvegardes**.

***Notes :***
- Si vous entrez plusieurs noms d'hôte, la collecte sera effectuée en utilisant le même port et le même mot de passe pour tous les serveurs.
- **duplistatus** détectera automatiquement le meilleur protocole de connexion (HTTPS ou HTTP). Il essaie d'abord HTTPS (avec validation SSL appropriée), puis HTTPS avec des certificats auto-signés, et enfin HTTP comme solution de secours.

:::tip
Les boutons <IconButton icon="lucide:download" /> sont disponibles dans [Paramètres → Surveillance des sauvegardes](settings/backup-monitoring-settings.md) et [Paramètres → Paramètres des serveurs](settings/server-settings.md) pour la collecte sur un seul serveur.
:::

<br/>

### Collecte en masse {#bulk-collection}

_Cliquez avec le bouton droit_ sur le bouton <IconButton icon="lucide:download" /> **Collecter les journaux de sauvegarde** dans la barre d'outils de l'application pour collecter à partir de tous les serveurs configurés.

![Collect All Right-Click Menu](../assets/screen-collect-button-right-click-popup.png)

:::tip
Vous pouvez également utiliser le bouton <IconButton icon="lucide:import" label="Tout collecter"/> dans les pages [Paramètres → Surveillance des sauvegardes](settings/backup-monitoring-settings.md) et [Paramètres → Paramètres des serveurs](settings/server-settings.md) pour collecter à partir de tous les serveurs configurés.
:::

## Comment fonctionne le processus de collecte {#how-the-collection-process-works}

- **duplistatus** détecte automatiquement le meilleur protocole de connexion et se connecte au serveur Duplicati spécifié.
- Il récupère l'historique des sauvegardes, les informations de journaux et les paramètres de sauvegarde (pour la surveillance des sauvegardes).
- Tous les journaux déjà présents dans la base de données **duplistatus** sont ignorés.
- Les nouvelles données sont traitées et stockées dans la base de données locale.
- L'URL utilisée (avec le protocole détecté) sera stockée ou mise à jour dans la base de données locale.
- Si l'option de téléchargement est sélectionnée, elle téléchargera les données JSON collectées. Le nom du fichier sera dans ce format : `[serverName]_collected_[Timestamp].json`. L'horodatage utilise le format de date ISO 8601 (YYYY-MM-DDTHH:MM:SS).
- Le tableau de bord se met à jour pour refléter les nouvelles informations.

## Dépannage des problèmes de collection {#troubleshooting-collection-issues}

La collecte des journaux de sauvegarde nécessite que le Serveur Duplicati soit accessible à partir de l'installation **duplistatus**. Si vous rencontrez des problèmes, veuillez vérifier les éléments suivants :

- Confirmer que le nom d'hôte (ou l'adresse IP) et le numéro de port sont corrects. Vous pouvez tester cela en accédant à l'interface utilisateur du serveur Duplicati dans votre navigateur (par exemple, `http://hostname:port`).
- Vérifier que **duplistatus** peut se connecter au serveur Duplicati. Un problème courant est la résolution des noms DNS (le système ne peut pas trouver le serveur par son nom d'hôte). Voir plus dans la [section dépannage](troubleshooting.md#collect-backup-logs-not-working).
- S'assurer que le mot de passe que vous avez fourni est correct.
