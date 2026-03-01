---
translation_last_updated: '2026-03-01T00:45:07.417Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: 4bde5224faa7c371
translation_language: fr
source_file_path: user-guide/settings/application-logs-settings.md
---
# Journaux d'application {#application-logs}

Le Visualiseur de journaux d'application permet aux administrateurs de surveiller tous les journaux d'application au même endroit, avec filtrage, export et mises à jour en temps réel directement depuis l'interface web.

![Application Log Viewer](../../assets/screen-settings-application-logs.png)

<br/>

## Actions disponibles {#available-actions}

| Bouton                                                              | Description                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Actualiser" />            | Recharger manuellement les journaux à partir du fichier sélectionné. Affiche un indicateur de chargement lors de l'actualisation et réinitialise le suivi pour la détection de nouvelles lignes. |
| <IconButton icon="lucide:copy" label="Copier dans le presse-papiers" />         | Copier toutes les lignes de journal filtrées dans votre presse-papiers. Respecte le filtre de recherche actuel. Utile pour partager rapidement ou coller dans d'autres outils. |
| <IconButton icon="lucide:download" label="Exporter" />               | Télécharger les journaux sous forme de fichier texte. Exporte à partir de la version de fichier actuellement sélectionnée et applique le filtre de recherche actuel (le cas échéant). Format du nom de fichier : `duplistatus-logs-YYYY-MM-DD.txt` (date au format ISO). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Accéder rapidement au début des journaux affichés. Utile quand le défilement automatique est désactivé ou lors de la navigation dans de longs fichiers journaux. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Accéder rapidement à la fin des journaux affichés. Utile quand le défilement automatique est désactivé ou lors de la navigation dans de longs fichiers journaux. |

<br/>

## Contrôles et Filtres {#controls-and-filters}

| Contrôle | Description |
|:--------|:-----------|
| **Version du fichier** | Sélectionnez le fichier journal à afficher : **Actuel** (fichier actif) ou fichiers archivés (`.1`, `.2`, etc., où les numéros plus élevés sont plus anciens). |
| **Lignes à afficher** | Afficher les **100**, **500**, **1000** (par défaut), **5000**, ou **10000** lignes les plus récentes du fichier sélectionné. |
| **Défilement automatique** | Quand activé (par défaut pour le fichier actuel), défile automatiquement vers les nouvelles entrées du journal et s'actualise toutes les 2 secondes. Fonctionne uniquement pour la version de fichier **Actuel**. |
| **Rechercher** | Filtrer les lignes du journal par texte (insensible à la casse). Les filtres s'appliquent aux lignes actuellement affichées. |

<br/>

L'en-tête d'affichage du journal affiche le nombre de lignes filtrées, le nombre total de lignes, la taille des fichiers et l'horodatage de la dernière modification.

<br/>
