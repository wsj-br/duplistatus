---
translation_last_updated: '2026-05-11T14:27:46.105Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: c4dde05981ada21800990adcdda2efbb6881d3b1d7ae4921922c4c12ca813552
translation_language: fr
source_file_path: documentation/docs/user-guide/backup-metrics.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Métriques de sauvegarde {#backup-metrics}

Un graphique des métriques de sauvegarde au fil du temps est affiché à la fois sur le tableau de bord (vue tableau) et sur la page de détails du serveur.

- **Tableau de bord**, le graphique affiche le nombre total de sauvegardes enregistrées dans la base de données **duplistatus**. Si vous utilisez la disposition Cartes, vous pouvez sélectionner un serveur pour voir ses métriques consolidées (quand le panneau latéral affiche les métriques).
- **Page Détails du serveur**, le graphique affiche les métriques du serveur sélectionné (pour toutes ses sauvegardes) ou pour une sauvegarde spécifique unique.

![Backup Metrics](../assets/screen-metrics.png)

- **Taille téléchargée** : Quantité totale de données téléchargées/transmises lors des sauvegardes depuis le serveur Duplicati vers la destination (stockage local, FTP, fournisseur de cloud, etc.) par jour.
- **Durée** : Durée totale de toutes les sauvegardes reçues par jour au format HH:MM.
- **Nombre de fichiers** : Somme du compteur du nombre de fichiers reçu pour toutes les sauvegardes par jour.
- **Taille du fichier** : Somme de la taille des fichiers signalée par le serveur Duplicati pour toutes les sauvegardes reçues par jour.
- **Taille du stockage** : Somme de l'espace de stockage utilisé sur la destination de sauvegarde signalé par le serveur Duplicati par jour.
- **Versions disponibles** : Somme de toutes les versions disponibles pour toutes les sauvegardes par jour.

:::note
Vous pouvez utiliser le contrôle [Paramètres d'affichage](settings/display-settings.md) pour configurer la plage horaire du graphique.
:::
