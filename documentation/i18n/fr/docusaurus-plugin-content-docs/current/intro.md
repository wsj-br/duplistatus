# Bienvenue dans duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Surveiller plusieurs serveurs [Duplicati](https://github.com/duplicati/duplicati) depuis un seul tableau de bord

## Fonctionnalités {/* #features */}

- **Configuration rapide** : Déploiement simple en conteneurs, avec des images disponibles sur Docker Hub et GitHub.
- **Tableau de bord unifié** : Visualisez l'état des sauvegardes, l'historique, la version de Duplicati et les détails de tous les serveurs en un seul endroit.
- **Surveillance des sauvegardes** : Vérification automatisée et alertes pour les sauvegardes planifiées en retard.
- **Visualisation des données et journaux** : Graphiques interactifs et collecte automatique des journaux des serveurs Duplicati.
- **Notifications et alertes** : Prise en charge intégrée de NTFY et SMTP pour les alertes de sauvegarde, y compris les notifications de sauvegarde en retard.
- **Gestion des utilisateurs** : Connexion avec des rôles Admin et Utilisateur, politiques de mot de passe configurables, verrouillage de compte et administration des utilisateurs.
- **Renforcement de la sécurité** : Protection supplémentaire optionnelle, clés API pour les téléchargements Duplicati et les widgets Homepage (avec limites de taille et de débit de téléchargement), listes d'adresses IP autorisées indépendantes pour l'interface d'administration et les API externes, protection anti-spoofing et guidance pour le reverse-proxy HTTPS.
- **Journalisation d'audit** : Trace complète de toutes les modifications du système et des actions des utilisateurs avec filtrage avancé, capacités d'exportation et périodes de rétention configurables.
- **Visionneuse de journaux d'application** : Interface réservée aux administrateurs pour visualiser, rechercher et exporter les journaux d'application directement depuis l'interface web avec des capacités de surveillance en temps réel.
- **Prise en charge multilingue** : Interface et documentation disponibles en anglais, français, allemand, espagnol, portugais brésilien, hindi et chinois simplifié.

## Installation {/* #installation */}

L'application peut être déployée à l'aide de Docker, Portainer Stacks ou Podman. 
Consultez les détails dans le [Guide d'installation](installation/installation.md).

- Si vous effectuez une mise à niveau à partir d'une version antérieure, votre base de données sera automatiquement
  [migrée](migration/version_upgrade.md) vers le nouveau schéma pendant le processus de mise à niveau.

- Lorsque vous utilisez Podman (en tant que conteneur autonome ou dans un pod), et si vous avez besoin de paramètres DNS personnalisés 
(tels que pour Tailscale MagicDNS, les réseaux d'entreprise ou d'autres configurations DNS personnalisées), vous pouvez spécifier manuellement 
les serveurs DNS et les domaines de recherche. Consultez le guide d'installation pour plus de détails.

## Configuration des serveurs Duplicati (requis) {/* #duplicati-servers-configuration-required */}

Une fois que votre serveur **duplistatus** est opérationnel, vous devez configurer vos serveurs **Duplicati** pour 
envoyer des journaux de sauvegarde à **duplistatus**, comme indiqué dans la section [Configuration de Duplicati](installation/duplicati-server-configuration.md) 
du guide d'installation. Sans cette configuration, le tableau de bord ne recevra pas les données de sauvegarde de vos serveurs Duplicati.

## Guide de l'utilisateur {/* #user-guide */}

Consultez le [Guide de l'utilisateur](user-guide/overview.md) pour des instructions détaillées sur la configuration et l'utilisation de **duplistatus**, y compris la configuration initiale, la configuration des fonctionnalités et le dépannage.

## Captures d'écran {/* #screenshots */}

### Tableau de bord {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Historique des sauvegardes {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### Détails de la sauvegarde {/* #backup-details */}

![backup-detail](assets/screen-backup-detail.png)

### Sauvegardes en retard {/* #overdue-backups */}

![sauvegardes en retard](assets/screen-overdue-backup-hover-card.png)

### Notifications en retard sur votre téléphone {/* #overdue-notifications-on-your-phone */}

![message ntfy en retard](/img/screen-overdue-notification.png)

## Référence API {/* #api-reference */}

Consultez la [Documentation des points de terminaison API](api-reference/overview.md) pour plus de détails sur les points de terminaison disponibles, les formats de requête/réponse et les exemples.

## Développement {/* #development */}

Pour des instructions sur le téléchargement, la modification ou l'exécution du code, consultez [Configuration du développement](development/setup.md).

Ce projet a été principalement construit avec l'aide d'IA. Pour en savoir plus, consultez [Comment j'ai construit cette application en utilisant des outils d'IA](development/how-i-build-with-ai).

## Crédits {/* #credits */}

- Tout d'abord, merci à Kenneth Skovhede pour avoir créé Duplicati—cet outil de sauvegarde incroyable. Merci également à tous les contributeurs.

💙 Si vous trouvez [Duplicati](https://www.duplicati.com) utile, veuillez envisager de soutenir le développeur. Plus de détails sont disponibles sur leur site web ou page GitHub.

- Idée/Implémentation des clés API et des listes de contrôle d'accès par IP de `henmohr` dans l'issue [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Icône SVG de Duplicati de https://dashboardicons.com/icons/duplicati
- Icône SVG de ntfy de https://dashboardicons.com/icons/ntfy
- Icône SVG de GitHub de https://github.com/logos

:::note
 Tous les noms de produits, logos et marques de commerce sont la propriété de leurs propriétaires respectifs. Les icônes et noms sont utilisés à des fins d'identification uniquement et n'impliquent pas d'approbation.
:::

## Licence {/* #license */}

Le projet est sous licence [Apache License 2.0](LICENSE.md).

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Note sur les traductions de l'interface et de la documentation:** Toutes les langues de l'interface et de la documentation, sauf l'anglais (Royaume-Uni), ont été traduites avec l'IA en utilisant [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); le vocabulaire peut être imprécis ou contenir des erreurs.

</small>
