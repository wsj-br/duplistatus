# Surveillance des sauvegardes {/* #backup-monitoring */}

![Alertes de sauvegarde](../../assets/screen-settings-monitoring.png)

## Filtrage des serveurs {/* #server-filtering */}

La liste des serveurs sur cette page peut être filtrée à l'aide du champ de filtre.

Lorsque **Résumé quotidien** est activé, la détection des retards continue mais l'e-mail de retard à l'adresse E-mail par défaut est supprimé. Les destinations E-mail supplémentaires continuent pour les événements correspondants (les retards comptent comme un Avertissement). Voir [Résumé quotidien](daily-summary-settings.md).

**Correspondances de filtre:**
- ID du serveur
- URL du serveur
- Noms des tâches de sauvegarde

Cela facilite la localisation rapide de serveurs ou de sauvegardes spécifiques dans les paramètres de surveillance lorsque vous gérez de nombreux systèmes.

## Configurer les paramètres de surveillance par sauvegarde {/* #configure-per-backup-monitoring-settings */}

- **Nom du serveur**: Le nom du serveur à surveiller pour les sauvegardes en retard.
   - Cliquez sur <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> pour ouvrir l'interface web de Duplicati.
   - Cliquez sur <IIcon2 icon="lucide:download" height="18"/> pour collecter les journaux de sauvegarde de ce serveur.
- **Nom de la sauvegarde**: Le nom de la sauvegarde à surveiller pour les sauvegardes en retard.
- **Prochaine exécution**: L'heure de la prochaine sauvegarde planifiée affichée en vert si elle est prévue dans le futur, ou en rouge si elle est en retard. Survolez la valeur "Prochaine exécution" pour afficher une info-bulle montrant l'horodatage de la dernière sauvegarde de la base de données, formaté avec la date/heure complète et le temps relatif.
- **Surveillance des sauvegardes**: Activez ou désactivez la surveillance des sauvegardes pour cette sauvegarde.
- **Intervalle de sauvegarde attendu**: L'intervalle de sauvegarde attendu.
- **Unité**: L'unité de l'intervalle attendu.
- **Jours autorisés**: Les jours de la semaine autorisés pour la sauvegarde.

Si les icônes à côté du nom du serveur sont grisées, le serveur n'est pas configuré dans les [Paramètres → Paramètres du serveur](/user-guide/settings/server-settings).

:::note
Lorsque vous collectez des journaux de sauvegarde à partir d'un serveur Duplicati, **duplistatus** met automatiquement à jour les intervalles et configurations de surveillance des sauvegardes.
:::

:::tip
Pour de meilleurs résultats, collectez les journaux de sauvegarde après avoir modifié la configuration des intervalles des tâches de sauvegarde dans votre serveur Duplicati. Cela garantit que **duplistatus** reste synchronisé avec votre configuration actuelle.
:::

## Configurations globales {/* #global-configurations */}

Ces paramètres s'appliquent à toutes les sauvegardes:

| Paramètre                      | Description                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Tolérance de sauvegarde**            | La période de grâce (temps supplémentaire autorisé) ajoutée à l'heure de sauvegarde attendue avant de marquer comme en retard. La valeur par défaut est **1 heure**.                                                                                                                                                                                                             |
| **Intervalle de surveillance des sauvegardes** | La fréquence à laquelle le système vérifie les sauvegardes en retard. La valeur par défaut est **5 minutes**.                                                                                                                                                                                                                                                            |
| **Fréquence de notification**      | La fréquence d'envoi des notifications de retard: <br/> **Une fois`: Send **just one** notification when the backup becomes overdue. <br/> `Tous les jours`: Send **daily** notifications while overdue (default). <br/> `Toutes les semaines`: Send **weekly** notifications while overdue. <br/> `Tous les mois**: Envoyer des notifications **mensuelles** tant que la sauvegarde est en retard. |

## Actions disponibles {/* #available-actions */}

| Bouton                                                               | Description                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres de surveillance des sauvegardes" />              | Enregistre les paramètres, efface les minuteries pour les sauvegardes désactivées et exécute une vérification des sauvegardes en retard.                                                |
| <IconButton icon="lucide:import" label="Tout collecter (#)"/>          | Collecte les journaux de sauvegarde de tous les serveurs configurés, entre parenthèses le nombre de serveurs à collecter.                                   |
| <IconButton icon="lucide:download" label="Télécharger CSV"/>           | Télécharge un fichier CSV contenant tous les paramètres de surveillance des sauvegardes et le "Dernier horodatage de sauvegarde (BDD)" depuis la base de données.               |
| <IconButton icon="lucide:refresh-cw" label="Vérifier maintenant"/>            | Exécute immédiatement la vérification des sauvegardes en retard. Cela est utile après avoir modifié les configurations. Il déclenche également un recalcul de "Prochaine exécution". |
| <IconButton icon="lucide:timer-reset" label="Réinitialiser les notifications"/> | Réinitialise la dernière notification en retard envoyée pour toutes les sauvegardes.                                                                            |
