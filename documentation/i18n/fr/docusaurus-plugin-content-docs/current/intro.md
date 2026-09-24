# Bienvenue sur duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Surveiller plusieurs serveurs [Duplicati](https://github.com/duplicati/duplicati) à partir d'un seul tableau de bord

## Fonctionnalités {/* #features */}

- **Configuration rapide** : déploiement conteneurisé simple, avec des images disponibles sur Docker Hub et GitHub.
- **Tableau de bord unifié** : consultez l'état des sauvegardes, l'historique, la version de Duplicati et les détails de tous les serveurs en un seul endroit.
- **Surveillance des sauvegardes** : vérification automatisée et alertes pour les sauvegardes planifiées en retard.
- **Visualisation des données et journaux** : graphiques interactifs et collecte automatique des journaux à partir des serveurs Duplicati.
- **Notifications et alertes** : Prise en charge intégrée de NTFY et des e-mails SMTP pour les alertes de sauvegarde, y compris les notifications de sauvegarde en retard.
- **Gestion des utilisateurs** : Connexion avec les rôles Admin et Utilisateur, politiques de mot de passe configurables, verrouillage de compte et administration des utilisateurs.
- **Configuration de la sécurité** : Protection supplémentaire optionnelle, Clés API pour les téléchargements duplicati et les widgets de la page d'accueil (avec des limites de taille de téléchargement et de débit), listes d'autorisation IP indépendantes pour l'Interface d'administration et les API externes, protection contre l'usurpation d'identité et directives pour le proxy inverse HTTPS.
- **Journalisation d'audit** : Journal d'audit complet de tout changement du système et des actions des utilisateurs avec un filtrage avancé, des capacités d'exportation et des périodes de rétention configurables.
- **Visionneuse de journaux d'application** : interface réservée aux administrateurs pour afficher, rechercher et exporter les journaux d'application directement depuis l'interface web avec capacités de surveillance en temps réel.
- **Support multilingue** : interface et documentation disponibles en anglais, français, allemand, espagnol, portugais brésilien, hindi et chinois simplifié.

## Installation {/* #installation */}

L'application peut être déployée à l'aide de Docker, Portainer Stacks ou Podman.
Consultez les détails dans le [Guide d'installation](installation/installation.md).

- Si vous effectuez une mise à niveau à partir d'une version antérieure, votre base de données sera automatiquement
  [migrée](migration/version_upgrade.md) vers le nouveau schéma pendant le processus de mise à niveau.

- Lors de l'utilisation de Podman (soit en tant que conteneur autonome, soit au sein d'un pod), et si vous avez besoin de paramètres DNS personnalisés
(par exemple pour Tailscale MagicDNS, les réseaux d'entreprise ou d'autres configurations DNS personnalisées), vous pouvez spécifier manuellement
les serveurs DNS et les domaines de recherche. Consultez le guide d'installation pour plus de détails.

## Configuration des serveurs Duplicati (requis) {/* #duplicati-servers-configuration-required */}

Une fois que votre serveur **duplistatus** est opérationnel, vous devez configurer vos serveurs **Duplicati** pour
envoyer les journaux de sauvegarde à **duplistatus**, comme décrit dans la section [Configuration de Duplicati](installation/duplicati-server-configuration.md)
du Guide d'installation. Sans cette configuration, le tableau de bord ne recevra pas les données de sauvegarde de vos serveurs Duplicati.

## Guide de l'utilisateur {/* #user-guide */}

Consultez le [Guide de l'utilisateur](user-guide/overview.md) pour des instructions détaillées sur la configuration et l'utilisation de **duplistatus**, y compris la configuration initiale, la configuration des fonctionnalités et le dépannage.

## Captures d'écran {/* #screenshots */}

### Tableau de bord {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Historique des sauvegardes {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### Détails de la sauvegarde {/* #backup-details */}

![détails-sauvegarde](assets/screen-backup-detail.png)

### Sauvegardes en retard {/* #overdue-backups */}

![sauvegardes en retard](assets/screen-overdue-backup-hover-card.png)

### Notifications en retard sur votre téléphone {/* #overdue-notifications-on-your-phone */}

![message en retard ntfy](/img/screen-overdue-notification.png)

## Référence API {/* #api-reference */}

Consultez la [Documentation des points de terminaison API](api-reference/overview.md) pour plus de détails sur les points de terminaison disponibles, les formats de requête/réponse et les exemples.

## Développement {/* #development */}

Pour obtenir des instructions sur le téléchargement, la modification ou l'exécution du code, consultez [Configuration du développement](development/setup.md).

Ce projet a été principalement construit avec l'aide de l'IA. Pour en savoir plus, consultez [Comment j'ai construit cette application avec les outils IA](development/how-i-build-with-ai).

## Crédits {/* #credits */}

- Avant tout, merci à Kenneth Skovhede d'avoir créé duplicati—cet incroyable outil de sauvegarde. Merci aussi à tous les contributeurs.

💙 Si vous trouvez [duplicati](https://www.duplicati.com) utile, veuillez envisager de soutenir le développeur. Plus de détails sont disponibles sur son site Web ou sa page GitHub.

- Idée/implémentation des Clés API et des listes d'adresses IP autorisées par `henmohr` dans le problème [N°79](https://github.com/wsj-br/duplistatus/issues/79)
- Icône SVG duplicati de https://dashboardicons.com/icons/duplicati
- Icône SVG NTFY de https://dashboardicons.com/icons/ntfy
- Icône SVG GitHub de https://github.com/logos

:::note
 Tous les noms de produits, logos et marques commerciales sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à des fins d'identification uniquement et n'impliquent pas une approbation.
:::

## Licence {/* #license */}

Le projet est sous licence [Apache License 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Note sur les traductions de l'interface utilisateur et de la documentation :** Toutes les langues de l'interface et de la documentation autres que l'anglais (Royaume-Uni) ont été traduites avec l'IA à l'aide de [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/) ; la formulation peut être imprécise ou contenir des erreurs.

</small>
