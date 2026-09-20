# Détails du serveur {/* #server-details */}

Cliquer sur un serveur depuis le tableau de bord ouvre une page avec une liste de sauvegardes pour ce serveur. Vous pouvez afficher toutes les sauvegardes ou sélectionner une sauvegarde spécifique si le serveur dispose de plusieurs sauvegardes configurées.

![Détails du serveur](../assets/screen-server-backup-list.png)

## Statistiques du serveur/de la sauvegarde {/* #serverbackup-statistics */}

Cette section affiche les statistiques pour l'ensemble des sauvegardes sur le serveur ou pour une seule sauvegarde sélectionnée.

- **TOTAL DES TÂCHES DE SAUVEGARDE** : Nombre total de tâches de sauvegarde configurées sur ce serveur.
- **TOTAL DES EXÉCUTIONS DE SAUVEGARDE** : Nombre total d'exécutions de sauvegarde effectuées (tel que rapporté par le serveur Duplicati).
- **VERSIONS DISPONIBLES** : Nombre de versions disponibles (tel que rapporté par le serveur Duplicati).
- **DURÉE MOYENNE** : Durée moyenne (moyenne arithmétique) des sauvegardes enregistrées dans la base de données **duplistatus**.
- **TAILLE DE LA DERNIÈRE SAUVEGARDE** : Taille des fichiers sources à partir du dernier journal de sauvegarde reçu.
- **STOCKAGE TOTAL UTILISÉ** : Stockage utilisé sur la destination de sauvegarde, tel que rapporté dans le dernier journal de sauvegarde.
- **TOTAL TÉLÉCHARGÉ** : Somme de toutes les données téléchargées enregistrées dans la base de données **duplistatus**.

Si cette sauvegarde ou l'une des sauvegardes sur le serveur (lorsque **Toutes les sauvegardes** est sélectionné) est en retard, un message apparaît sous le résumé.

![Détails du serveur - Sauvegardes planifiées en retard](../assets/screen-server-overdue-message.png)

Cliquez sur <IconButton icon="lucide:settings" href="settings/backup-monitoring-settings" label="Configurer"/> pour accéder à [Paramètres → Surveillance des sauvegardes](settings/backup-monitoring-settings.md). Ou cliquez sur <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> dans la barre d'outils pour ouvrir l'interface web du serveur Duplicati et vérifier les journaux.

<br/>

## Historique des sauvegardes {/* #backup-history */}

Ce tableau liste les journaux de sauvegarde pour le serveur sélectionné.

![Historique des sauvegardes](../assets/screen-backup-history.png)

- **Nom de la sauvegarde** : Le nom de la sauvegarde sur le serveur Duplicati.
- **Date** : L'horodatage de la sauvegarde et le temps écoulé depuis le dernier rafraîchissement de l'écran.
- **Statut** : Le statut de la sauvegarde (Succès, Avertissement, Erreur, Fatal).
- **Avertissements/Erreurs** : Le nombre d'avertissements/erreurs signalés dans le journal de sauvegarde.
- **Versions disponibles** : Le nombre de versions de sauvegarde disponibles sur la destination de sauvegarde. Si l'icône est grisée, les informations détaillées n'ont pas été reçues.
- **Nombre de fichiers, Taille de fichier, Taille téléchargée, Durée, Taille de stockage** : Valeurs telles que rapportées par le serveur Duplicati.

:::tip Conseils
• Utilisez le menu déroulant dans la section **Historique des sauvegardes** pour sélectionner **Toutes les sauvegardes** ou une sauvegarde spécifique pour ce serveur.

• Vous pouvez trier n'importe quelle colonne en cliquant sur son en-tête, cliquez à nouveau pour inverser l'ordre de tri.
 
• Cliquez n'importe où sur une ligne pour afficher les [Détails de la sauvegarde](#backup-details).

:::

:::note
Lorsque **Toutes les sauvegardes** est sélectionné, la liste affiche toutes les sauvegardes classées du plus récent au plus ancien par défaut.
:::

<br/>

## Détails de la sauvegarde {/* #backup-details */}

Cliquer sur un badge de statut dans le tableau de bord (vue tableau) ou sur n'importe quelle ligne du tableau d'historique des sauvegardes affiche les informations détaillées de la sauvegarde.

![Détails de la sauvegarde](../assets/screen-backup-detail.png)

- **Détails du serveur** : nom du serveur, alias et note.
- **Informations de sauvegarde** : horodatage de la sauvegarde et son identifiant.
- **Statistiques de sauvegarde** : un résumé des compteurs, tailles et durée signalés.
- **Résumé du journal** : le nombre de messages signalés.
- **Versions disponibles** : une liste des versions disponibles (affichée uniquement si l'information a été reçue dans les journaux).
- **Messages/Avertissements/Erreurs** : les journaux d'exécution complets. Le sous-titre indique si le journal a été tronqué par le serveur Duplicati.

<br/>

:::note
Reportez-vous aux [instructions de configuration de Duplicati](../installation/duplicati-server-configuration.md) pour apprendre comment configurer le serveur Duplicati afin d'envoyer des journaux d'exécution complets et éviter les troncatures.
:::
