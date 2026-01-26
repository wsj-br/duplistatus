# Journaux d'application {#application-logs}

Le Visualiseur de journaux d'application permet aux administrateurs de surveiller tous les journaux d'application en un seul endroit, avec filtrage, export et mises à jour en temps réel directement depuis l'interface web.

![Visualiseur de journaux d'application](/img/screen-settings-application-logs.png)

<br/>

## Actions disponibles {#available-actions}

| Bouton                                                                  | Description                                                                                                                                                                                                                                                                                                                                                                    |
| :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton icon="lucide:refresh-cw" label="Actualiser" />              | Rechargez manuellement les journaux à partir du fichier sélectionné. Affiche un indicateur de chargement lors de l'actualisation et réinitialise le suivi pour la détection de nouvelles lignes.                                                                                                                                               |
| <IconButton icon="lucide:copy" label="Copier dans le presse-papiers" /> | Copiez toutes les lignes de journal filtrées dans votre presse-papiers. Respecte le filtre de recherche actuel. Utile pour un partage rapide ou un collage dans d'autres outils.                                                                                                                                               |
| <IconButton icon="lucide:download" label="Exporter" />                  | Téléchargez les journaux sous forme de fichier texte. Exporte à partir de la version de fichier actuellement sélectionnée et applique le filtre de recherche actuel (le cas échéant). Format du nom de fichier : `duplistatus-logs-YYYY-MM-DD.txt` (date au format ISO). |
| <IconButton icon="lucide:arrow-down-from-line" />                       | Accédez rapidement au début des journaux affichés. Utile lorsque le défilement automatique est désactivé ou lors de la navigation dans de longs fichiers journaux.                                                                                                                                                                             |
| <IconButton icon="lucide:arrow-down-to-line" />                         | Accédez rapidement à la fin des journaux affichés. Utile lorsque le défilement automatique est désactivé ou lors de la navigation dans de longs fichiers journaux.                                                                                                                                                                             |

<br/>

## Contrôles et filtres {#controls-and-filters}

| Contrôle                   | Description                                                                                                                                                                                                                                                                |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Version du fichier**     | Sélectionnez le fichier journal à afficher : **Actuel** (fichier actif) ou fichiers archivés (`.1`, `.2`, etc., où les numéros plus élevés sont plus anciens).                       |
| **Lignes à afficher**      | Affiche les **100**, **500**, **1000** (par défaut), **5000** ou **10000** lignes les plus récentes du fichier sélectionné.                                                                                                             |
| **Défilement automatique** | Lorsqu'il est activé (par défaut pour le fichier actuel), défile automatiquement vers les nouvelles entrées de journal et s'actualise toutes les 2 secondes. Fonctionne uniquement pour la version de fichier `Actuel`. |
| **Rechercher**             | Filtrez les lignes de journal par texte (insensible à la casse). Les filtres s'appliquent aux lignes actuellement affichées.                                                                                            |

<br/>

L'en-tête d'affichage du journal affiche le nombre de lignes filtrées, le nombre total de lignes, la taille du fichier et l'horodatage de la dernière modification.

<br/>


