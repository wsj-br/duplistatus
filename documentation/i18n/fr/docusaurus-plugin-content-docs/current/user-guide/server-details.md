---
translation_last_updated: '2026-01-31T00:51:22.932Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 9f3164f160479a94
translation_language: fr
source_file_path: user-guide/server-details.md
---
# Détails du Serveur {#server-details}

En cliquant sur un serveur depuis le Tableau de bord, vous ouvrez une Page avec une liste de Sauvegardes pour ce Serveur. Vous pouvez Afficher toutes les sauvegardes ou Sélectionner une spécifique si le Serveur a plusieurs Sauvegardes configurées.

![Server Details](/assets/screen-server-backup-list.png)

## Statistiques de serveur/sauvegarde {#serverbackup-statistics}

Cette section affiche les statistiques pour toutes les sauvegardes sur le Serveur ou une sauvegarde unique sélectionnée.

- **TOTAL DES TÂCHES DE SAUVEGARDE** : Nombre total de tâches de sauvegarde configurées sur ce serveur.
- **TOTAL DES EXÉCUTIONS DE SAUVEGARDE** : Nombre total d'exécutions de sauvegarde effectuées (tel que signalé par le serveur Duplicati).
- **VERSIONS DISPONIBLES** : Nombre de versions disponibles (tel que signalé par le serveur Duplicati).
- **DURÉE MOYENNE** : Durée moyenne (arithmétique) des sauvegardes enregistrées dans la base de données **duplistatus**.
- **TAILLE DE LA DERNIÈRE SAUVEGARDE** : Taille des fichiers source du dernier journal de sauvegarde reçu.
- **STOCKAGE TOTAL UTILISÉ** : Stockage utilisé sur la destination de sauvegarde, tel que signalé dans le dernier journal de sauvegarde.
- **TOTAL TÉLÉVERSÉ** : Somme de toutes les données téléversées enregistrées dans la base de données **duplistatus**.

Si cette sauvegarde ou l'une des sauvegardes sur le serveur (quand « Toutes les sauvegardes » est sélectionné) est en retard, un message apparaît sous le résumé.

![Server Details - Overdue Scheduled Backups](/assets/screen-server-overdue-message.png)

Cliquez sur <IconButton icon="lucide:settings" href="settings/overdue-settings" label="Configurer"/> pour accéder à [`Paramètres → Overdue Monitoring`](settings/overdue-settings.md). Ou cliquez sur <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> dans la barre d'outils pour ouvrir l'interface web du serveur duplistatus et vérifier les journaux.

<br/>

## Historique des sauvegardes {#backup-history}

Ce tableau répertorie les journaux de sauvegarde pour le serveur sélectionné.

![Backup History](/assets/screen-backup-history.png)

- **Nom de sauvegarde** : Le nom de la sauvegarde sur le serveur Duplicati.
- **Date** : L'horodatage de la sauvegarde et le temps écoulé depuis la dernière actualisation de l'écran.
- **Statut** : Le statut de la sauvegarde (Succès, Avertissement, Erreur, Fatal).
- **Avertissements/Erreurs** : Le nombre d'avertissements/erreurs signalés dans le journal de sauvegarde.
- **Versions disponibles** : Le nombre de versions de sauvegarde disponibles sur la destination de sauvegarde. Si l'icône est grisée, les informations détaillées n'ont pas été reçues.
- **Nombre de fichiers, Taille des fichiers, Taille téléversée, Durée, Taille de stockage** : Valeurs telles que signalées par le serveur Duplicati.

:::tip Conseils
• Utilisez le menu déroulant dans la section **Historique des sauvegardes** pour sélectionner `Toutes les sauvegardes` ou une sauvegarde spécifique pour ce serveur.

• Vous pouvez trier n'importe quelle colonne en cliquant sur son en-tête, cliquez à nouveau pour inverser l'ordre de tri.
 
• Cliquez n'importe où sur une ligne pour afficher les [Détails de la sauvegarde](#backup-details).

::: 

:::note
Quand `Toutes les sauvegardes` est sélectionné, la liste affiche toutes les sauvegardes ordonnées de la plus récente à la plus ancienne par défaut.
:::

<br/>

## Détails de la sauvegarde {#backup-details}

En cliquant sur un badge de statut dans le Tableau de bord (vue tableau) ou sur n'importe quelle ligne du tableau Historique des sauvegardes, les Informations de sauvegarde détaillées s'affichent.

![Backup Details](/assets/screen-backup-detail.png)

- **Détails du serveur** : nom du serveur, alias et note.
- **Informations de sauvegarde** : l'horodatage de la sauvegarde et son ID.
- **Statistiques de sauvegarde** : un résumé des compteurs signalés, des tailles et de la durée.
- **Résumé du journal** : le nombre de messages signalés.
- **Versions disponibles** : une liste des versions disponibles (affichée uniquement si l'information a été reçue dans les journaux).
- **Messages/Avertissements/Erreurs** : les journaux d'exécution complets. Le sous-titre indique si le journal a été tronqué par le serveur Duplicati.

<br/>

:::note
Reportez-vous aux [instructions de Configuration Duplicati](../installation/duplicati-server-configuration.md) pour apprendre comment configurer le serveur Duplicati afin d'envoyer les journaux d'exécution complets et d'éviter la troncature.
:::
