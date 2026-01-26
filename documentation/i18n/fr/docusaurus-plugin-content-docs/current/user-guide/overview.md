# Vue d'ensemble {#overview}

Bienvenue dans le guide utilisateur de duplistatus. Ce document complet fournit des instructions détaillées pour utiliser duplistatus afin de surveiller et gérer vos opérations de sauvegarde Duplicati sur plusieurs serveurs.

## Qu'est-ce que duplistatus ? {#what-is-duplistatus}

duplistatus est un puissant tableau de bord de surveillance conçu spécifiquement pour les systèmes de sauvegarde Duplicati. Il fournit :

- Surveillance centralisée de plusieurs serveurs Duplicati à partir d'une seule interface
- Suivi du statut en temps réel de toutes les opérations de sauvegarde
- Détection automatique des sauvegardes en retard avec alertes configurables
- Métriques complètes et visualisation des performances de sauvegarde
- Système de notification flexible via NTFY et e-mail

## Installation {#installation}

Pour les prérequis et les instructions d'installation détaillées, veuillez consulter le [Guide d'installation](../installation/installation.md).

## Accès au tableau de bord {#accessing-the-dashboard}

Après une installation réussie, accédez à l'interface web de duplistatus en suivant ces étapes :

1. Ouvrez votre navigateur web préféré
2. Accédez à `http://your-server-ip:9666`
   - Remplacez `your-server-ip` par l'adresse IP réelle ou le nom d'hôte de votre serveur duplistatus
   - Le port par défaut est `9666`
3. Une page de connexion vous sera présentée. Utilisez ces identifiants pour la première utilisation (ou après une mise à niveau à partir de versions antérieures à 0.9.x) :
   - nom d'utilisateur : `admin`
   - mot de passe : `Duplistatus09`
4. Après la connexion, le tableau de bord principal s'affichera automatiquement (sans données lors de la première utilisation)

## Vue d'ensemble de l'interface utilisateur {#user-interface-overview}

duplistatus fournit un tableau de bord intuitif pour surveiller les opérations de sauvegarde Duplicati dans toute votre infrastructure.

![Vue d'ensemble du tableau de bord](/img/screen-main-dashboard-card-mode.png)

L'interface utilisateur est organisée en plusieurs sections clés pour offrir une expérience de surveillance claire et complète :

1. [Barre d'outils de l'application](#application-toolbar) : Accès rapide aux fonctions essentielles et aux configurations
2. [Résumé du tableau de bord](dashboard.md#dashboard-summary) : Statistiques de vue d'ensemble pour tous les serveurs surveillés
3. Vue d'ensemble des serveurs : [Disposition en cartes](dashboard.md#cards-layout) ou [disposition en tableau](dashboard.md#table-layout) affichant le dernier statut de toutes les sauvegardes
4. [Détails des retards](dashboard.md#overdue-details) : Avertissements visuels pour les sauvegardes en retard avec des informations détaillées au survol
5. [Versions de sauvegarde disponibles](dashboard.md#available-backup-versions) : Cliquez sur l'icône bleue pour afficher les versions de sauvegarde disponibles à la destination
6. [Métriques de sauvegarde](backup-metrics.md) : Graphiques interactifs affichant les performances de sauvegarde au fil du temps
7. [Détails du serveur](server-details.md) : Liste complète des sauvegardes enregistrées pour des serveurs spécifiques, y compris des statistiques détaillées
8. [Détails de la sauvegarde](server-details.md#backup-details) : Informations approfondies pour les sauvegardes individuelles, y compris les journaux d'exécution, les avertissements et les erreurs

## Barre d'outils de l'application {#application-toolbar}

La barre d'outils de l'application fournit un accès pratique aux fonctions clés et aux paramètres, organisés pour un flux de travail efficace.

![barre d'outils de l'application](/img/duplistatus_toolbar.png)

| Bouton                                                                                                                                                                 | Description                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Actualiser l'écran                                                                                  | Exécutez une actualisation manuelle immédiate de l'écran de toutes les données                                                                                                                                                                                                                          |
| <IconButton label="Actualisation automatique" />                                                                                                                       | Activez ou désactivez la fonctionnalité d'actualisation automatique. Configurez dans [Paramètres d'affichage](settings/display-settings.md) <br/> _Clic droit_ pour ouvrir la page Paramètres d'affichage                                                                               |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; Ouvrir NTFY                                                                                            | Accédez au site web ntfy.sh pour votre sujet de notification configuré. <br/> _Clic droit_ pour afficher un code QR pour configurer votre appareil afin de recevoir des notifications de duplistatus.                                                   |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Configuration Duplicati](duplicati-configuration.md)         | Ouvrez l'interface web du serveur Duplicati sélectionné <br/> _Clic droit_ pour ouvrir l'interface utilisateur héritée Duplicati (`/ngax`) dans un nouvel onglet                                                                                                                     |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Collecter les journaux](collect-backup-logs.md)                           | Connectez-vous aux serveurs Duplicati et récupérez les journaux de sauvegarde <br/> _Clic droit_ pour collecter les journaux de tous les serveurs configurés                                                                                                                                            |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Paramètres](settings/backup-notifications-settings.md) | Configurez les notifications, la surveillance, le serveur SMTP et les modèles de notification                                                                                                                                                                                                           |
| <IconButton icon="lucide:user" label="nom d'utilisateur" />                                                                                                            | Affiche l'utilisateur connecté, le type d'utilisateur (`Admin`, `Utilisateur`), cliquez pour le menu utilisateur. Voir plus dans [Gestion des utilisateurs](settings/user-management-settings.md)                                                                    |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Guide utilisateur                                                               | Ouvre le [Guide utilisateur](overview.md) à la section pertinente pour la page que vous consultez actuellement. L'infobulle affiche « Aide pour [Nom de la page] » pour indiquer quelle documentation sera ouverte. |

### Menu utilisateur {#user-menu}

Cliquer sur le bouton utilisateur ouvre un menu déroulant avec des options spécifiques à l'utilisateur. Les options du menu diffèrent selon que vous êtes connecté en tant qu'administrateur ou utilisateur ordinaire.

<table>
  <tbody><tr>
    <th>Administrateur</th>
    <th>Utilisateur ordinaire</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}><img src="/assets/screen-user-menu-admin.png" alt="User Menu - Admin" /></td>
    <td style={{verticalAlign: 'top'}}><img src="/assets/screen-user-menu-user.png" alt="User Menu - User" /></td>
  </tr>
</tbody></table>

## Configuration essentielle {#essential-configuration}

1. Configurez vos [serveurs Duplicati](../installation/duplicati-server-configuration.md) pour envoyer les messages du journal de sauvegarde à duplistatus (requis).
2. Collectez les journaux de sauvegarde initiaux – utilisez la fonctionnalité [Collecter les journaux de sauvegarde](collect-backup-logs.md) pour remplir la base de données avec les données de sauvegarde historiques de tous vos serveurs Duplicati. Cela met également à jour automatiquement les intervalles de surveillance des sauvegardes en retard en fonction de la configuration de chaque serveur.
3. Configurez les paramètres du serveur – configurez les alias de serveur et les notes dans [Paramètres → Serveur](settings/server-settings.md) pour rendre votre tableau de bord plus informatif.
4. Configurez les paramètres NTFY – configurez les notifications via NTFY dans [Paramètres → NTFY](settings/ntfy-settings.md).
5. Configurez les paramètres e-mail – configurez les notifications par e-mail dans [Paramètres → E-mail](settings/email-settings.md).
6. Configurez les notifications de sauvegarde – configurez les notifications par sauvegarde ou par serveur dans [Paramètres → Notifications de sauvegarde](settings/backup-notifications-settings.md).

<br/>

:::info[IMPORTANT]
N'oubliez pas de configurer les serveurs Duplicati pour envoyer les journaux de sauvegarde à duplistatus, comme indiqué dans la section [Configuration Duplicati](../installation/duplicati-server-configuration.md).
:::

<br/>

:::note
Tous les noms de produits, marques commerciales et marques déposées sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à titre d'identification uniquement et n'impliquent pas une approbation.
:::
