---
translation_last_updated: '2026-02-05T00:20:50.237Z'
source_file_mtime: '2026-02-02T19:14:50.094Z'
source_file_hash: 853222a91e36f6f6
translation_language: fr
source_file_path: intro.md
---
# Bienvenue dans duplistatus {#welcome-to-duplistatus}

**duplistatus** - Surveiller plusieurs serveurs [Duplicati](https://github.com/duplicati/duplicati) à partir d'un seul Tableau de bord

## Fonctionnalités {#features}

- **Configuration rapide** : Déploiement conteneurisé simple, avec des images disponibles sur Docker Hub et GitHub.
- **Tableau de bord unifié** : Afficher le statut de sauvegarde, l'historique et les détails de tous les serveurs en un seul endroit.
- **Surveillance des sauvegardes en retard** : Vérification automatisée et alertes pour les sauvegardes planifiées en retard.
- **Visualisation des données et journaux** : Graphiques interactifs et collecte automatique des journaux à partir des serveurs Duplicati.
- **Notifications et alertes** : Support intégré de NTFY et SMTP pour les alertes de sauvegarde, y compris les notifications de sauvegardes en retard.
- **Contrôle d'accès utilisateur et sécurité** : Système d'authentification sécurisé avec contrôle d'accès basé sur les rôles (rôles Admin/Utilisateur), politiques de mot de passe configurables, protection contre le verrouillage de compte et gestion complète des utilisateurs.
- **Journalisation d'audit** : Piste d'audit complète de tous les changements système et actions utilisateur avec filtrage avancé, capacités d'export et périodes de rétention configurables.
- **Visualiseur de journaux d'application** : Interface réservée aux administrateurs pour afficher, rechercher et exporter les journaux d'application directement à partir de l'interface web avec capacités de surveillance en temps réel.

## Installation {#installation}

L'application peut être déployée à l'aide de Docker, Portainer Stacks ou Podman. 
Consultez les détails dans le [Guide d'installation](installation/installation.md).

- Si vous effectuez une mise à niveau à partir d'une version antérieure, votre base de données sera automatiquement [migrée](migration/version_upgrade.md) vers le nouveau schéma pendant le processus de mise à niveau.

- Quand vous utilisez Podman (soit en tant que conteneur autonome, soit au sein d'un pod), et si vous avez besoin de paramètres DNS personnalisés (par exemple pour Tailscale MagicDNS, les réseaux d'entreprise ou d'autres configurations DNS personnalisées), vous pouvez spécifier manuellement les serveurs DNS et les domaines de recherche. Consultez le guide d'installation pour plus de détails.

## Configuration des serveurs Duplicati (Requis) {#duplicati-servers-configuration-required}

Une fois que votre serveur **duplistatus** est opérationnel, vous devez configurer vos serveurs **Duplicati** pour envoyer les journaux de sauvegarde à **duplistatus**, comme décrit dans la section [Configuration Duplicati](installation/duplicati-server-configuration.md) du Guide d'installation. Sans cette configuration, le tableau de bord ne recevra pas de données de sauvegarde de vos serveurs Duplicati.

## Guide de l'utilisateur {#user-guide}

Consultez le [Guide de l'utilisateur](user-guide/overview.md) pour des instructions détaillées sur la façon de configurer et d'utiliser **duplistatus**, y compris la configuration initiale, la configuration des fonctionnalités et la résolution des problèmes.

## Captures d'écran {#screenshots}

### Tableau de bord {#dashboard}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Historique des sauvegardes {#backup-history}

![server-detail](assets/screen-server-backup-list.png)

### Détails de la sauvegarde {#backup-details}

![backup-detail](assets/screen-backup-detail.png)

### Sauvegardes en retard {#overdue-backups}

![overdue backups](assets/screen-overdue-backup-hover-card.png)

### Notifications en retard sur votre téléphone {#overdue-notifications-on-your-phone}

![ntfy overdue message](/img/screen-overdue-notification.png)

## Référence API {#api-reference}

Consultez la [Documentation des points de terminaison API](api-reference/overview.md) pour des détails sur les points de terminaison disponibles, les formats de requête/réponse et les exemples.

## Développement {#development}

Pour obtenir des instructions sur le téléchargement, la modification ou l'exécution du code, consultez [Configuration du développement](development/setup.md).

Ce projet a été principalement construit avec l'aide de l'IA. Pour en savoir plus, consultez [Comment j'ai construit cette application en utilisant des outils IA](development/how-i-build-with-ai).

## Crédits {#credits}

- Tout d'abord, merci à Kenneth Skovhede d'avoir créé Duplicati—cet outil de sauvegarde extraordinaire. Merci également à tous les contributeurs.

💙 Si vous trouvez [Duplicati](https://www.duplicati.com) utile, veuillez envisager de soutenir le développeur. Plus de détails sont disponibles sur son site Web ou sa page GitHub.

- Icône SVG Duplicati depuis https://dashboardicons.com/icons/duplicati
- Icône SVG Notify depuis https://dashboardicons.com/icons/ntfy
- Icône SVG GitHub depuis https://github.com/logos

>[!NOTE]
> Tous les noms de produits, marques commerciales et marques déposées sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à des fins d'identification uniquement et n'impliquent pas une approbation.

## Licence {#license}

Le projet est sous licence [Apache License 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**
