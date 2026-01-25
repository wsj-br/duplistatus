# Bienvenue sur duplistatus

**duplistatus** - Un autre tableau de bord pour [Duplicati](https://github.com/duplicati/duplicati)

## Fonctionnalités

- **Configuration rapide** : Déploiement conteneurisé simple, avec des images disponibles sur Docker Hub et GitHub.
- **Tableau de bord unifié** : Visualisez l'état des sauvegardes, l'historique et les détails de tous les serveurs en un seul endroit.
- **Surveillance des retards** : Vérification et alertes automatisées pour les sauvegardes planifiées en retard.
- **Visualisation des données et journaux** : Graphiques interactifs et collecte automatique des journaux depuis les serveurs Duplicati.
- **Notifications et alertes** : Support intégré de NTFY et des e-mails SMTP pour les alertes de sauvegarde, y compris les notifications de sauvegardes en retard.
- **Contrôle d'accès utilisateur et sécurité** : Système d'authentification sécurisé avec contrôle d'accès basé sur les rôles (rôles Admin/Utilisateur), politiques de mot de passe configurables, protection contre le verrouillage de compte et gestion complète des utilisateurs.
- **Journalisation d'audit** : Piste d'audit complète de tous les changements système et actions utilisateur avec filtrage avancé, capacités d'export et périodes de rétention configurables.
- **Visualiseur de journaux d'application** : Interface réservée aux administrateurs pour visualiser, rechercher et exporter les journaux d'application directement depuis l'interface web avec capacités de surveillance en temps réel.

## Installation

L'application peut être déployée en utilisant Docker, Portainer Stacks ou Podman.
Voir les détails dans le [Guide d'installation](installation/installation.md).

- Si vous effectuez une mise à niveau depuis une version antérieure, votre base de données sera automatiquement
  [migrée](migration/version_upgrade.md) vers le nouveau schéma pendant le processus de mise à niveau.

- Lors de l'utilisation de Podman (soit en tant que conteneur autonome, soit au sein d'un pod), et si vous avez besoin de paramètres DNS personnalisés
  (tels que pour Tailscale MagicDNS, les réseaux d'entreprise ou d'autres configurations DNS personnalisées), vous pouvez spécifier manuellement
  les serveurs DNS et les domaines de recherche. Consultez le guide d'installation pour plus de détails.

## Configuration des serveurs Duplicati (Requis)

Une fois que votre serveur **duplistatus** est opérationnel, vous devez configurer vos serveurs **Duplicati** pour
envoyer les journaux de sauvegarde à **duplistatus**, comme indiqué dans la section [Configuration Duplicati](installation/duplicati-server-configuration.md)
du Guide d'installation. Sans cette configuration, le tableau de bord ne recevra pas les données de sauvegarde de vos serveurs Duplicati.

## Guide de l'utilisateur

Consultez le [Guide de l'utilisateur](user-guide/overview.md) pour des instructions détaillées sur la configuration et l'utilisation de **duplistatus**, y compris la configuration initiale, la configuration des fonctionnalités et le dépannage.

## Captures d'écran

### Tableau de bord

![tableau de bord](/img/screen-main-dashboard-card-mode.png)

### Historique des sauvegardes

![détail du serveur](/img/screen-server-backup-list.png)

### Détails de la sauvegarde

![détail de la sauvegarde](/img/screen-backup-detail.png)

### Sauvegardes en retard

![sauvegardes en retard](/img/screen-overdue-backup-hover-card.png)

### Notifications de retard sur votre téléphone

![message ntfy de retard](/img/screen-overdue-notification.png)

## Référence API

Consultez la [Documentation des points de terminaison API](api-reference/overview.md) pour plus de détails sur les points de terminaison disponibles, les formats de requête/réponse et les exemples.

## Développement

Pour des instructions sur le téléchargement, la modification ou l'exécution du code, consultez [Configuration de développement](development/setup.md).

Ce projet a été principalement construit avec l'aide de l'IA. Pour savoir comment, consultez [Comment j'ai construit cette application en utilisant des outils d'IA](development/how-i-build-with-ai).

## Crédits

- Tout d'abord, merci à Kenneth Skovhede pour avoir créé Duplicati, cet incroyable outil de sauvegarde. Merci également à tous les contributeurs.

  💙 Si vous trouvez [Duplicati](https://www.duplicati.com) utile, veuillez envisager de soutenir le développeur. Plus de détails sont disponibles sur leur site web ou leur page GitHub.

- Icône SVG Duplicati de https://dashboardicons.com/icons/duplicati

- Icône SVG Notify de https://dashboardicons.com/icons/ntfy

- Icône SVG GitHub de https://github.com/logos

> [!NOTE]
> Tous les noms de produits, marques commerciales et marques déposées sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à des fins d'identification uniquement et n'impliquent aucune approbation.

## Licence

Le projet est sous licence [Apache License 2.0](LICENSE.md).

**Copyright © 2025 Waldemar Scudeller Jr.**

