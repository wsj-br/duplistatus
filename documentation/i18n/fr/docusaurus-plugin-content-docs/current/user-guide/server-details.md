# Détails du serveur {#server-details}

Cliquer sur un serveur du tableau de bord ouvre une page avec une liste de sauvegardes pour ce serveur. Vous pouvez afficher toutes les sauvegardes ou sélectionner une sauvegarde spécifique si le serveur a plusieurs sauvegardes configurées.

![Détails du serveur](/img/screen-server-backup-list.png)

## Serveur/Statistiques de sauvegarde {#serverbackup-statistics}

Cette section affiche les statistiques pour toutes les sauvegardes du serveur ou une sauvegarde sélectionnée unique.

- **TOTAL DES TÂCHES DE SAUVEGARDE** : Nombre total de tâches de sauvegarde configurées sur ce serveur.
- **TOTAL DES EXÉCUTIONS DE SAUVEGARDE** : Nombre total d'exécutions de sauvegarde effectuées (tel que rapporté par le serveur Duplicati).
- **VERSIONS DISPONIBLES** : Nombre de versions disponibles (tel que rapporté par le serveur Duplicati).
- **DURÉE MOYENNE** : Durée moyenne (moyenne) des sauvegardes enregistrées dans la base de données **duplistatus**.
- **TAILLE DE LA DERNIÈRE SAUVEGARDE** : Taille des fichiers source de la dernière sauvegarde reçue.
- **STOCKAGE TOTAL UTILISÉ** : Stockage utilisé sur la destination de sauvegarde, tel que rapporté dans le dernier journal de sauvegarde.
- **TOTAL TÉLÉVERSÉ** : Somme de toutes les données téléversées enregistrées dans la base de données **duplistatus**.

Si cette sauvegarde ou l'une des sauvegardes du serveur (quand `Toutes les sauvegardes` est sélectionné) est en retard, un message apparaît sous le résumé.

![Détails du serveur - Sauvegardes planifiées en retard](/img/screen-server-overdue-message.png)

Cliquez sur le <IconButton icon="lucide:settings" href="settings/overdue-settings" label="Configurer"/> pour accéder à [`Paramètres → Surveillance des sauvegardes en retard`](settings/overdue-settings.md). Ou cliquez sur le <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> dans la barre d'outils pour ouvrir l'interface web du serveur Duplicati et vérifier les journaux.

<br/>

## Historique des sauvegardes {#backup-history}

Ce tableau liste les journaux de sauvegarde pour le serveur sélectionné.

![Historique des sauvegardes](/img/screen-backup-history.png)

- **Nom de sauvegarde** : Le nom de la sauvegarde dans le serveur Duplicati.
- **Date** : L'horodatage de la sauvegarde et le temps écoulé depuis la dernière actualisation de l'écran.
- **Statut** : Le statut de la sauvegarde (Succès, Avertissement, Erreur, Fatal).
- **Avertissements/Erreurs** : Le nombre d'avertissements/erreurs rapportés dans le journal de sauvegarde.
- **Versions disponibles** : Le nombre de versions de sauvegarde disponibles sur la destination de sauvegarde. Si l'icône est grisée, les informations détaillées n'ont pas été reçues.
- **Nombre de fichiers, Taille du fichier, Taille téléversée, Durée, Taille du stockage** : Valeurs telles que rapportées par le serveur Duplicati.

:::tip Conseils
• Utilisez le menu déroulant dans la section **Historique des sauvegardes** pour sélectionner `Toutes les sauvegardes` ou une sauvegarde spécifique pour ce serveur.

• Vous pouvez trier n'importe quelle colonne en cliquant sur son en-tête, cliquez à nouveau pour inverser l'ordre de tri.

• Cliquez n'importe où sur une ligne pour afficher les [Détails de la sauvegarde](#backup-details).

:::

:::note
Quand `Toutes les sauvegardes` est sélectionné, la liste affiche toutes les sauvegardes ordonnées du plus récent au plus ancien par défaut.
:::

<br/>

## Détails de la sauvegarde {#backup-details}

Cliquer sur un badge de statut dans le tableau de bord (vue tableau) ou n'importe quelle ligne du tableau d'historique de sauvegarde affiche les informations détaillées de la sauvegarde.

![Détails de la sauvegarde](/img/screen-backup-detail.png)

- **Détails du serveur** : nom du serveur, alias et note.
- **Informations de sauvegarde** : L'horodatage de la sauvegarde et son ID.
- **Statistiques de sauvegarde** : Un résumé des compteurs, tailles et durée rapportés.
- **Résumé du journal** : Le nombre de messages rapportés.
- **Versions disponibles** : Une liste de versions disponibles (affichée uniquement si les informations ont été reçues dans les journaux).
- **Messages/Avertissements/Erreurs** : Les journaux d'exécution complets. Le sous-titre indique si le journal a été tronqué par le serveur Duplicati.

<br/>

:::note
Reportez-vous aux [instructions de configuration Duplicati](../installation/duplicati-server-configuration.md) pour apprendre comment configurer le serveur Duplicati pour envoyer les journaux d'exécution complets et éviter la troncature.
:::
