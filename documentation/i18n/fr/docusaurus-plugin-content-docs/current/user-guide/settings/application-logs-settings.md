# Journaux de l'application {/* #application-logs */}

La visionneuse de journaux d'application permet aux administrateurs de surveiller tous les journaux d'application en un seul endroit, avec filtrage, export et mises à jour en temps réel directement depuis l'interface web.

![Visionneuse de journaux d'application](../../assets/screen-settings-application-logs.png)

<br/>

## Actions disponibles {/* #available-actions */}

| Bouton                                                              | Description                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Actualiser" />            | Recharge manuellement les journaux à partir du fichier sélectionné. Affiche un indicateur de chargement pendant le rafraîchissement et réinitialise le suivi pour la détection des nouvelles lignes. |
| <IconButton icon="lucide:copy" label="Copier dans le presse-papiers" />         | Copie toutes les lignes de journal filtrées dans votre presse-papiers. Respecte le filtre de recherche actuel. Utile pour un partage rapide ou pour coller dans d'autres outils. |
| <IconButton icon="lucide:download" label="Exporter" />               | Télécharger les journaux sous forme de fichier texte. Exporte à partir de la version de fichier actuellement sélectionnée et applique le filtre de recherche actuel (s'il y en a un). Format du nom de fichier : `duplistatus-logs-YYYY-MM-DD.txt` (date au format ISO). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Aller rapidement au début des journaux affichés. Utile lorsque le défilement automatique est désactivé ou lors de la navigation dans de longs fichiers de journal. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Aller rapidement à la fin des journaux affichés. Utile lorsque le défilement automatique est désactivé ou lors de la navigation dans de longs fichiers de journal. |

<br/>

## Contrôles et filtres {/* #controls-and-filters */}

| Contrôle | Description |
|:--------|:-----------|
| **Version du fichier** | Sélectionnez quel fichier de journal visualiser : **Actuel** (fichier actif) ou fichiers tournants (`.1`, `.2`, etc., où les numéros plus élevés sont plus anciens). |
| **Lignes à afficher** | Affiche les **100**, **500**, **1000** (par défaut), **5000** ou **10000** lignes les plus récentes du fichier sélectionné. |
| **Défilement automatique** | Lorsqu'activé (par défaut pour le fichier actuel), fait défiler automatiquement vers les nouvelles entrées de journal et rafraîchit toutes les 2 secondes. Fonctionne uniquement pour la version de fichier **Actuel**. |
| **Rechercher** | Filtre les lignes de journal par texte (insensible à la casse). Les filtres s'appliquent aux lignes actuellement affichées. |

<br/>

L'en-tête d'affichage des journaux montre le nombre de lignes filtrées, le nombre total de lignes, la taille du fichier et l'horodatage de la dernière modification.

<br/>
