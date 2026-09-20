# Surveillance des sauvegardes {/* #backup-monitoring */}

![Alertes de sauvegarde](../../assets/screen-settings-monitoring.png)

## Filtrage des serveurs {/* #server-filtering */}

La liste des serveurs sur cette page peut être filtrée à l'aide du champ de filtre.

Lorsque le **Résumé quotidien** est activé, la détection des retards continue mais l'e-mail envoyé au destinataire par défaut est supprimé. Les destinations e-mail supplémentaires continuent d'être notifiées pour les événements correspondants (les retards sont considérés comme un Avertissement). Voir [Résumé quotidien](daily-summary-settings.md).

**Correspondances du filtre :**
- ID du serveur
- URL du serveur
- Noms des tâches de sauvegarde

Cela permet de localiser rapidement des serveurs ou des sauvegardes spécifiques dans les paramètres de surveillance lors de la gestion de nombreux systèmes.

## Configurer les paramètres de surveillance par sauvegarde {/* #configure-per-backup-monitoring-settings */}

-  **Nom du serveur** : Le nom du serveur à surveiller pour les sauvegardes en retard. 
   - Cliquez sur <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> pour ouvrir l'interface web du serveur Duplicati
   - Cliquez sur <IIcon2 icon="lucide:download" height="18"/> pour collecter les journaux de sauvegarde depuis ce serveur.
- **Nom de la sauvegarde** : Le nom de la sauvegarde à surveiller pour les sauvegardes en retard.
- **Prochaine exécution** : L'heure de la prochaine sauvegarde planifiée, affichée en vert si elle est prévue dans le futur, ou en rouge si elle est en retard. Passer la souris sur la valeur « Prochaine exécution » affiche une info-bulle indiquant l'horodatage de la dernière sauvegarde provenant de la base de données, formaté avec la date/heure complète et le temps relatif.
- **Surveillance des sauvegardes** : Activer ou désactiver la surveillance des sauvegardes pour cette sauvegarde.
- **Intervalle de sauvegarde attendu** : L'intervalle de sauvegarde attendu.
- **Unité** : L'unité de l'intervalle attendu.
- **Jours autorisés** : Les jours de la semaine autorisés pour la sauvegarde.

Si les icônes situées sur le côté du nom du serveur sont griséess, le serveur n'est pas configuré dans les [Paramètres → Paramètres du serveur](/user-guide/settings/server-settings).

:::note
Lorsque vous collectez les journaux de sauvegarde depuis un serveur Duplicati, **duplistatus** met automatiquement à jour les intervalles et configurations de surveillance des sauvegardes.
:::

:::tip
Pour de meilleurs résultats, collectez les journaux de sauvegarde après avoir modifié la configuration des intervalles des tâches de sauvegarde sur votre serveur Duplicati. Cela garantit que **duplistatus** reste synchronisé avec votre configuration actuelle.
:::

## Configurations globales {/* #global-configurations */}

Ces paramètres s'appliquent à toutes les sauvegardes :

| Paramètre                       | Description                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Tolérance de sauvegarde**     | La période de grâce (temps supplémentaire autorisé) ajoutée au moment prévu pour la sauvegarde avant de la marquer comme en retard. La valeur par défaut est **1 heure**.                                                                                                                                                                     |
| **Intervalle de surveillance des sauvegardes** | Fréquence à laquelle le système vérifie les sauvegardes en retard. La valeur par défaut est **5 minutes**.                                                                                                                                                                                                                                    |
| **Fréquence des notifications** | Fréquence d'envoi des notifications de retard : <br/> **Une fois`: Send **just one** notification when the backup becomes overdue. <br/> `Tous les jours`: Send **daily** notifications while overdue (default). <br/> `Toutes les semaines`: Send **weekly** notifications while overdue. <br/> `Tous les mois** : Envoyer des notifications **mensuelles** tant que la sauvegarde est en retard. |

## Actions disponibles {/* #available-actions */}

| Bouton                                                            | Description                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres de surveillance des sauvegardes" />              | Enregistre les paramètres, efface les minuteurs pour toutes les sauvegardes désactivées et effectue une vérification des sauvegardes en retard.                                                |
| <IconButton icon="lucide:import" label="Tout collecter (#)"/>          | Collecte les journaux de sauvegarde depuis tous les serveurs configurés, entre parenthèses le nombre de serveurs à collecter.                                   |
| <IconButton icon="lucide:download" label="Télécharger CSV"/>           | Télécharge un fichier CSV contenant tous les paramètres de surveillance des sauvegardes et le « Dernier horodatage de sauvegarde (base de données) » provenant de la base de données.               |
| <IconButton icon="lucide:refresh-cw" label="Vérifier maintenant"/>            | Exécute immédiatement la vérification des sauvegardes en retard. Ceci est utile après avoir modifié les configurations. Cela déclenche également un recalcul de la « Prochaine exécution ». |
| <IconButton icon="lucide:timer-reset" label="Réinitialiser les notifications"/> | Réinitialise la dernière notification de retard envoyée pour toutes les sauvegardes.                                                                            |
