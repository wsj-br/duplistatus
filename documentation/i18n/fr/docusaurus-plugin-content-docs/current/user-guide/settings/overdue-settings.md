# Notifications en retard {#overdue-notifications}

![Alertes de sauvegarde](/img/screen-settings-overdue.png)

## Configurer les paramètres de sauvegarde en retard par sauvegarde {#configure-per-backup-overdue-settings}

- **Nom du serveur** : Le nom du serveur à surveiller pour les sauvegardes en retard.
  - Cliquez sur <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> pour ouvrir l'interface web du serveur Duplicati
  - Cliquez sur <IIcon2 icon="lucide:download" height="18"/> pour collecter les journaux de sauvegarde de ce serveur.
- **Nom de sauvegarde** : Le nom de la sauvegarde à surveiller pour les sauvegardes en retard.
- **Prochaine exécution** : L'heure de la prochaine sauvegarde planifiée affichée en vert si planifiée dans le futur, ou en rouge si en retard. Survoler la valeur « Prochaine exécution » affiche une infobulle montrant l'horodatage de la dernière sauvegarde de la base de données, formaté avec la date/heure complète et l'heure relative.
- **Surveillance des sauvegardes en retard** : Activer ou désactiver la surveillance des sauvegardes en retard pour cette sauvegarde.
- **Intervalle de sauvegarde attendu** : L'intervalle de sauvegarde attendu.
- **Unité** : L'unité de l'intervalle attendu.
- **Jours autorisés** : Les jours de la semaine autorisés pour la sauvegarde.

Si les icônes à côté du nom du serveur sont grisées, le serveur n'est pas configuré dans [`Paramètres → Paramètres du serveur`](server-settings.md).

:::note
Lorsque vous collectez les journaux de sauvegarde d'un serveur Duplicati, **duplistatus** met automatiquement à jour les intervalles et configurations de surveillance des sauvegardes en retard.
:::

:::tip
Pour de meilleurs résultats, collectez les journaux de sauvegarde après avoir modifié la configuration des intervalles de travail de sauvegarde sur votre serveur Duplicati. Cela garantit que **duplistatus** reste synchronisé avec votre configuration actuelle.
:::

## Configurations globales {#global-configurations}

Ces paramètres s'appliquent à toutes les sauvegardes :

| Paramètre                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tolérance en retard**                                  | La période de grâce (temps supplémentaire autorisé) ajoutée à l'heure de sauvegarde attendue avant de marquer comme en retard. Par défaut, c'est `1 heure`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Intervalle de surveillance des sauvegardes en retard** | Fréquence à laquelle le système vérifie les sauvegardes en retard. Par défaut, c'est `5 minutes`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Fréquence de notification**                            | Fréquence d'envoi des notifications de sauvegarde en retard : <br/> `Une fois` : Envoyer **une seule** notification lorsque la sauvegarde devient en retard. <br/> `Chaque jour` : Envoyer des notifications **quotidiennes** tant que la sauvegarde est en retard (par défaut). <br/> `Chaque semaine` : Envoyer des notifications **hebdomadaires** tant que la sauvegarde est en retard. <br/> `Chaque mois` : Envoyer des notifications **mensuelles** tant que la sauvegarde est en retard. |

## Actions disponibles {#available-actions}

| Bouton                                                                                      | Description                                                                                                                                                                                                                           |
| :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <IconButton label="Enregistrer les paramètres de surveillance des sauvegardes en retard" /> | Enregistre les paramètres, efface les minuteurs pour les sauvegardes désactivées et exécute une vérification des sauvegardes en retard.                                                                               |
| <IconButton icon="lucide:import" label="Collecter tous (#)"/>                               | Collectez les journaux de sauvegarde de tous les serveurs configurés, entre parenthèses le nombre de serveurs à collecter.                                                                                            |
| <IconButton icon="lucide:download" label="Télécharger CSV"/>                                | Télécharge un fichier CSV contenant tous les paramètres de surveillance des sauvegardes en retard et l'« Horodatage de la dernière sauvegarde (BD) » de la base de données.                        |
| <IconButton icon="lucide:refresh-cw" label="Vérifier maintenant"/>                          | Exécute la vérification des sauvegardes en retard immédiatement. Ceci est utile après modification des configurations. Il déclenche également un recalcul de « Prochaine exécution ». |
| <IconButton icon="lucide:timer-reset" label="Réinitialiser les notifications"/>             | Réinitialise la dernière notification de sauvegarde en retard envoyée pour toutes les sauvegardes.                                                                                                                    |


