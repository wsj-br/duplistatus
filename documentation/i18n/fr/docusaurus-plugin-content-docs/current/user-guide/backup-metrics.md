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
