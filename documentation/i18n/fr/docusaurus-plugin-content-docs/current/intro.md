---
translation_last_updated: '2026-05-11T14:27:42.874Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: 18c3808b355ca85cf99e63f258dc6c18f79f738a87a5623a96e332a06ea24ee7
translation_language: fr
source_file_path: documentation/docs/intro.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - 'nvidia/nemotron-nano-12b-v2-vl:free'
  - qwen/qwen3-235b-a22b-2507
---
# Bienvenue sur duplistatus {#welcome-to-duplistatus}

**duplistatus** - Surveiller plusieurs [serveurs de Duplicati](https://github.com/duplicati/duplicati) à partir d'un seul tableau de bord

## Fonctionnalités {#features}

- **Configuration rapide** : Déploiement simple en conteneur, avec des images disponibles sur Docker Hub et GitHub.
- **Tableau de bord unifié** : Affichez le statut des sauvegardes, l'historique et les détails pour tous les serveurs au même endroit.
- **Surveillance des sauvegardes** : Vérification automatisée et alertes pour les sauvegardes planifiées en retard.
- **Visualisation des données et journaux** : Graphiques interactifs et collecte automatique des journaux à partir des serveurs Duplicati.
- **Notifications et alertes** : Prise en charge intégrée de NTFY et du courrier électronique SMTP pour les alertes de sauvegarde, y compris les notifications de sauvegardes en retard.
- **Contrôle d'accès et sécurité des utilisateurs** : Système d'authentification sécurisé avec contrôle d'accès basé sur les rôles (rôles Administrateur/Utilisateur), politiques de mot de passe configurables, protection contre le verrouillage de compte et gestion complète des utilisateurs.
- **Journalisation d'audit** : Journal complet de toutes les modifications du système et des actions des utilisateurs, avec des filtres avancés, des fonctionnalités d'exportation et des périodes de rétention configurables.
- **Visionneuse des journaux d'application** : Interface réservée aux administrateurs pour afficher, rechercher et exporter les journaux d'application directement depuis l'interface web, avec des capacités de surveillance en temps réel.
- **Prise en charge multilingue** : Interface et documentation disponibles en anglais, français, allemand, espagnol et portugais brésilien.

## Installation {#installation}

L'application peut être déployée via Docker, Portainer Stacks ou Podman. Consultez les détails dans le [guide d'installation](installation/installation.md).

- Si vous mettez à jour depuis une version antérieure, votre base de données sera automatiquement [migrée](migration/version_upgrade.md) vers le nouveau schéma pendant le processus de mise à jour.

- Lors de l'utilisation de Podman (en tant que conteneur autonome ou dans un pod), et si vous avez besoin de paramètres DNS personnalisés (comme pour Tailscale MagicDNS, réseaux d'entreprise, ou autres configurations DNS personnalisées), vous pouvez spécifier manuellement les serveurs DNS et les domaines de recherche. Consultez le guide d'installation pour plus de détails.

## Configuration des serveurs Duplicati (obligatoire) {#duplicati-servers-configuration-required}

Une fois votre serveur **duplistatus** en marche, vous devez configurer vos serveurs **Duplicati** pour envoyer les journaux de sauvegarde à **duplistatus**, comme indiqué dans la [section de configuration de Duplicati](installation/duplicati-server-configuration.md) du guide d'installation. Sans cette configuration, le tableau de bord ne recevra pas les données de sauvegarde de vos serveurs Duplicati.

## Guide utilisateur {#user-guide}

Consultez le [guide utilisateur](user-guide/overview.md) pour des instructions détaillées sur la configuration et l'utilisation de **duplistatus**, y compris la mise en place initiale, la configuration des fonctionnalités et la résolution des problèmes.

## Captures d'écran {#screenshots}

### Tableau de bord {#dashboard}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Historique des sauvegardes {#backup-history}

![server-detail](assets/screen-server-backup-list.png)

### Détails de la sauvegarde {#backup-details}

![backup-detail](assets/screen-backup-detail.png)

### Sauvegardes en retard {#overdue-backups}

![overdue backups](assets/screen-overdue-backup-hover-card.png)

### Notifications sur votre téléphone {#overdue-notifications-on-your-phone}

![ntfy overdue message](/img/screen-overdue-notification.png)

## Référence API {#api-reference}

Consultez la [documentation des points de terminaison API](api-reference/overview.md) pour obtenir des informations sur les endpoints disponibles, les formats de requête/réponse et des exemples.

## Développement {#développement}

Pour obtenir des instructions sur le téléchargement, la modification ou l'exécution du code, consultez [Mise en place du développement](development/setup.md).

Ce projet a été principalement développé avec l'aide de l'IA. Pour en savoir plus, consultez [Comment j'ai construit cette application en utilisant des outils d'IA](development/how-i-build-with-ai).

## Crédits {#crédits}

- Avant tout, merci à Kenneth Skovhede pour la création de Duplicati— cet outil de sauvegarde remarquable. Merci également à tous les contributeurs.

💙 Si vous trouvez [Duplicati](https://www.duplicati.com) utile, veuillez envisager de soutenir le développeur. Plus de détails sont disponibles sur leur site web ou leur page GitHub.

- Icône SVG Duplicati de https://dashboardicons.com/icons/duplicati
- Icône SVG ntfy de https://dashboardicons.com/icons/ntfy
- Icône SVG GitHub de https://github.com/logos

:::note
 Tous les noms de produits, logos et marques commerciales sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à des fins d'identification uniquement et n'impliquent pas une approbation.
:::


## Licence {#license}

Le projet est sous licence [Apache License 2.0](LICENSE.md).   

**Copyright © 2026 Waldemar Scudeller Jr.**
