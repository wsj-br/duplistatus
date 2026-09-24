# Tableau de bord {/* #dashboard */}

## Résumé du tableau de bord {/* #dashboard-summary */}

Cette section affiche les statistiques agrégées pour les serveurs que l'utilisateur connecté peut voir. Les administrateurs voient tous les serveurs. Un utilisateur non administrateur voit tous les serveurs, à moins qu'un administrateur ne limite ce compte dans [Utilisateurs](settings/user-management-settings.md#server-visibility).

![Résumé du tableau de bord - aperçu](../assets/screen-dashboard-summary.png)
![Résumé du tableau de bord - tableau](../assets/screen-dashboard-summary-table.png)

- **Total des serveurs** : Le nombre de serveurs surveillés.                                                                                                             
- **Total des tâches de sauvegarde** : Le nombre total de tâches de sauvegarde (types) configurées pour tous les serveurs.                                                                                
- **Total des exécutions de sauvegarde** : Le nombre total de journaux de sauvegarde provenant des exécutions reçus ou collectés pour tous les serveurs.                                                                   
- **Taille totale de sauvegarde** : La taille combinée de toutes les données sources, basée sur les derniers journaux de sauvegarde reçus.                                                                    
- **Stockage total utilisé** : L'espace de stockage total utilisé par les sauvegardes sur la destination de sauvegarde (par exemple, stockage cloud, serveur FTP, disque local), basé sur les derniers journaux de sauvegarde.                
- **Taille totale téléchargée** : La quantité totale de données téléchargées depuis le serveur Duplicati vers la destination (par exemple, stockage local, FTP, fournisseur cloud).                                       
- **Sauvegardes en retard** (tableau) : Le nombre de sauvegardes qui sont en retard. Voir [Paramètres des notifications de sauvegarde](settings/backup-notifications-settings.md)                          
- **Basculer l'agencement** : Bascule entre l'agencement Cartes (par défaut) et l'agencement Tableau.

:::tip Vous voyez des serveurs en double ?
Si le même serveur apparaît plusieurs fois sur le tableau de bord, utilisez [Paramètres → Maintenance de la base de données → Fusionner les serveurs en double](settings/database-maintenance.md#merge-duplicate-servers) pour les regrouper. Les doublons peuvent survenir lorsque vous réinstallez ou mettez à niveau Duplicati, car l'`machine_id` du serveur peut changer et **duplistatus** le traite alors comme un nouveau serveur.
:::

## Filtrage des serveurs {/* #server-filtering */}

Vous pouvez filtrer les serveurs et les sauvegardes affichés sur le tableau de bord à l'aide du champ de recherche dans la barre d'outils de l'application. Cliquez sur l'icône de filtre <IconButton icon="lucide:search" /> pour afficher le champ de recherche.

**Correspondances du filtre :**
- ID du serveur
- URL du serveur
- Noms des tâches de sauvegarde

**Portée :**
- Filtre à la fois les vues cartes et tableau sur le tableau de bord
- L'état de session est maintenu via le fournisseur de filtre de serveur du tableau de bord
- S'efface lorsque vous actualisez ou quittez le tableau de bord

Cela permet de localiser rapidement des serveurs ou des sauvegardes spécifiques parmi de nombreux systèmes surveillés.

## Agencement des cartes {/* #cards-layout */}

L'agencement des cartes montre l'état du dernier journal de sauvegarde reçu pour chaque sauvegarde.

![Agencement des cartes](../assets/duplistatus_dash-cards.svg)

- **Nom du serveur** : Nom du serveur Duplicati (ou l'alias)
  - Passer la souris sur le **Nom du serveur** affichera le nom du serveur et la note
- **Statut global** : Le statut du serveur. Les sauvegardes en retard s'afficheront avec le statut **Avertissement**
- **Version** : La version Duplicati issue du dernier journal de sauvegarde, affichée à gauche de l'indicateur de statut. Voir [Version du serveur Duplicati](#duplicati-server-version).
- **Informations récapitulatives** : Le nombre consolidé de fichiers, la taille et le stockage utilisé pour toutes les sauvegardes de ce serveur. Affiche également le temps écoulé depuis la dernière sauvegarde reçue (passez la souris dessus pour voir l'horodatage)
- **Liste des sauvegardes** : Un tableau avec toutes les sauvegardes configurées pour ce serveur, avec 3 colonnes :
  - **Nom de la sauvegarde** : Nom de la sauvegarde dans le serveur Duplicati
  - **Historique du statut** : Statut des 10 dernières sauvegardes reçues.
  - **Dernière sauvegarde reçue** : Le temps écoulé depuis l'heure actuelle du dernier journal reçu. Affichera une icône d'avertissement si la sauvegarde est en retard.
    - L'heure est indiquée au format abrégé : `m` pour les minutes, `h` pour les heures, `d` pour les jours, `w` pour les semaines, `mo` pour les mois, `y` pour les années.

L'ordre de tri des cartes et autres configurations peuvent être définis dans les [Paramètres d'affichage](settings/display-settings.md).

La vue panneau propose deux affichages d'informations, accessibles en cliquant sur le bouton en haut à droite du panneau latéral :

- Statut : Affiche les statistiques des tâches de sauvegarde par statut, avec une liste des sauvegardes en retard et des tâches de sauvegarde avec des statuts d'avertissements/erreurs.

![panneau d'état](../assets/screen-overview-side-status.png)

- Métriques : Affiche des graphiques avec la durée, la taille des fichiers et la taille de stockage au fil du temps pour le serveur agrégé ou sélectionné.

![panneau de graphiques](../assets/screen-overview-side-charts.png)

### Détails de la sauvegarde {/* #backup-details */}

Le survol d'une sauvegarde dans la liste affiche les détails du dernier journal de sauvegarde reçu ainsi que toute information relative aux retards.

![Détails du retard](../assets/screen-backup-tooltip.png)

- **Nom du serveur : Sauvegarde** : Le nom ou l'alias du serveur Duplicati et de la sauvegarde, affichera également le nom du serveur et la note.
  - L'alias et la note peuvent être configurés dans [Paramètres → Paramètres du serveur](settings/server-settings.md).
- **Notification** : Une icône indiquant le paramètre de [notification configuré](#notifications-icons) pour les nouveaux journaux de sauvegarde.
- **Date** : L'horodatage de la sauvegarde et le temps écoulé depuis le dernier rafraîchissement de l'écran.
- **Statut** : Le statut de la dernière sauvegarde reçue (Succès, Avertissement, Erreur, Fatal).
- **Durée, Nombre de fichiers, Taille de fichier, Taille de stockage, Taille téléchargée** : Valeurs telles que rapportées par le serveur Duplicati.
- **Versions disponibles** : Le nombre de versions de sauvegarde stockées sur la destination de sauvegarde au moment de la sauvegarde.

Si cette sauvegarde est en retard, l'infobulle affiche également :

- **Sauvegarde attendue** : L'heure à laquelle la sauvegarde était attendue, incluant la période de grâce configurée (temps supplémentaire autorisé avant de marquer comme en retard).

Vous pouvez également cliquer sur les boutons en bas pour ouvrir [Paramètres → Notifications de sauvegarde](settings/backup-notifications-settings.md) afin de configurer les paramètres de surveillance ou ouvrir l'interface web du serveur Duplicati.

## Mise en page du tableau {/* #table-layout */}

La mise en page du tableau répertorie les journaux de sauvegarde les plus récents reçus pour tous les serveurs et sauvegardes.

![Mode tableau du tableau de bord](../assets/screen-main-dashboard-table-mode.png)

- **Nom du serveur** : Le nom du serveur Duplicati (ou alias)
  - Sous le nom figure la note du serveur
- **Nom de la sauvegarde** : Le nom de la sauvegarde dans le serveur Duplicati.
- **Version** : La version de Duplicati issue du dernier journal de sauvegarde pour cette tâche de sauvegarde. Voir [Version du serveur Duplicati](#duplicati-server-version).
- **Versions disponibles** : Le nombre de versions de sauvegarde stockées sur la destination de sauvegarde. Si l'icône est grisée, les informations détaillées n'ont pas été reçues dans le journal. Reportez-vous aux [instructions de configuration de Duplicati](../installation/duplicati-server-configuration.md) pour plus de détails.
- **Nombre de sauvegardes** : Le nombre de sauvegardes signalées par le serveur Duplicati.
- **Date de dernière sauvegarde** : L'horodatage du dernier journal de sauvegarde reçu et le temps écoulé depuis le dernier rafraîchissement de l'écran.
- **Statut de dernière sauvegarde** : Le statut de la dernière sauvegarde reçue (Succès, Avertissement, Erreur, Fatal).
- **Durée** : La durée de la sauvegarde au format HH:MM:SS.
- **Avertissements/Erreurs** : Le nombre d'avertissements et d'erreurs signalés dans le journal de sauvegarde, affiché sous la forme `warnings/errors` (par exemple `0/0`).
- **Paramètres** :
  - **Notification** : Une icône indiquant le paramètre de notification configuré pour les nouveaux journaux de sauvegarde.
  - **Configuration de Duplicati** : Un bouton pour ouvrir l'interface web du serveur Duplicati

Vous pouvez utiliser les [Paramètres d'affichage](settings/display-settings.md) pour configurer la taille du tableau et d'autres paramètres.

### Icônes de notifications {/* #notifications-icons */}

| Icône                                                                                                                              | Option de notification | Description                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Désactivé              | Aucune notification ne sera envoyée lorsqu'un nouveau journal de sauvegarde est reçu                |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Tout                   | Des notifications seront envoyées pour chaque nouveau journal de sauvegarde, quel que soit son statut. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Avertissements        | Les notifications seront envoyées uniquement pour les journaux de sauvegarde ayant un statut d'Avertissement, Inconnu, Erreur ou Fatal. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Erreurs               | Les notifications seront envoyées uniquement pour les journaux de sauvegarde ayant un statut d'Erreur ou Fatal.                   |

:::note
Ce paramètre de notification ne s'applique que lorsque **duplistatus** reçoit un nouveau journal de sauvegarde d'un serveur Duplicati. Les notifications de retard sont configurées séparément et seront envoyées indépendamment de ce paramètre.
:::

### Détails du retard {/* #overdue-details */}

Le survol de l'icône d'avertissement de retard affiche les détails concernant la sauvegarde en retard.

![Détails du retard](../assets/screen-overdue-backup-hover-card.png)

- **Vérifié** : Date à laquelle la dernière vérification de retard a été effectuée. Configurez la fréquence dans [Paramètres des notifications de sauvegarde](settings/backup-notifications-settings.md).
- **Dernière sauvegarde** : Date à laquelle le dernier journal de sauvegarde a été reçu.
- **Sauvegarde prévue** : Heure à laquelle la sauvegarde était attendue, incluant la période de grâce configurée (temps supplémentaire autorisé avant de marquer comme en retard).
- **Dernière notification** : Date à laquelle la dernière notification de retard a été envoyée.

## Version du serveur Duplicati {/* #duplicati-server-version */}

Le tableau de bord affiche la version Duplicati indiquée dans le dernier journal de sauvegarde pour chaque serveur (vue carte) ou tâche de sauvegarde (vue tableau).

- **Où cela apparaît** : À gauche de l'indicateur d'état sur les cartes, et dans la colonne **Version** sur le tableau (après **En retard / Prochaine exécution**). Vous pouvez masquer le badge de la carte depuis [Paramètres d'affichage](settings/display-settings.md) ou [Versions de Duplicati](settings/duplicati-versions.md). La colonne du tableau reste toujours visible.
- **Couleur** : Le texte gris signifie que la version correspond à la dernière version publiée pour cette chaîne (ou la comparaison n'est pas disponible). Le jaune d'avertissement signifie que la version est plus ancienne que la dernière version publiée pour cette chaîne.
- **Infobulle** : Survolez ou cliquez sur le numéro de version pour voir la chaîne de mise à jour (`stable`, `beta`, `experimental` ou `canary`), la version du serveur et la dernière version disponible pour cette chaîne.

**duplistatus** compare la version provenant du journal de sauvegarde avec les dernières versions Duplicati publiées sur GitHub. Les administrateurs peuvent consulter les versions de chaîne mises en cache et configurer l'intervalle de vérification et l'heure de début dans [Paramètres → Versions de Duplicati](settings/duplicati-versions.md). Le cache est également actualisé au démarrage lorsqu'il est plus ancien que l'intervalle sélectionné. Les mises à jour GitHub réussies et échouées sont enregistrées dans le [journal d'audit](settings/audit-logs-viewer.md) sous forme de `duplicati_version_refresh` (démarré par `startup`, `cron` ou `manual`).

:::important
**duplistatus** n'interroge pas le serveur Duplicati pour obtenir la version actuellement en cours d'exécution. Il utilise la version stockée dans le dernier journal de sauvegarde reçu ou [collecté](collect-backup-logs.md). Après avoir mis à jour Duplicati, le tableau de bord continue d'afficher la version précédente jusqu'à l'arrivée d'un nouveau journal de sauvegarde.
:::

### Versions de sauvegarde disponibles {/* #available-backup-versions */}

Cliquer sur l'icône bleue de l'horloge ouvre une liste des versions de sauvegarde disponibles au moment de la sauvegarde, telles qu'indiquées par le serveur Duplicati.

![Versions disponibles](../assets/screen-available-backups-modal.png)

- **Détails de la sauvegarde** : Affiche le nom du serveur et l'alias, la note du serveur, le nom de la sauvegarde et quand la sauvegarde a été exécutée.
- **Détails de la version** : Affiche le numéro de version, la date de création et l'âge.

:::note
Si l'icône est grisée, cela signifie qu'aucune information détaillée n'a été reçue dans les journaux de messages.
Consultez les [instructions de configuration de Duplicati](../installation/duplicati-server-configuration.md) pour plus de détails.
:::
