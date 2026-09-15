# Métriques de sauvegarde {/* #backup-metrics */}

Un graphique des métriques de sauvegarde au fil du temps est affiché à la fois sur le tableau de bord (vue tableau) et sur la page des détails du serveur.

- **Tableau de bord**, le graphique montre le nombre total de sauvegardes enregistrées dans la base de données **duplistatus**. Si vous utilisez la disposition des cartes, vous pouvez sélectionner un serveur pour voir ses métriques consolidées (quand le panneau latéral affiche les métriques).
- **Page des détails du serveur**, le graphique montre les métriques pour le serveur sélectionné (pour toutes ses sauvegardes) ou pour une seule sauvegarde spécifique.

![Métriques de sauvegarde](../assets/screen-metrics.png)

## Contrôles de graphique en ligne {/* #inline-chart-controls */}

Des contrôles d'accès rapides sont disponibles directement dans les en-têtes des panneaux de graphique pour une configuration facile sans naviguer vers les paramètres d'affichage :

### Sélecteur de plage horaire {/* #time-range-selector */}

Des boutons en forme de pilule apparaissent dans l'en-tête du graphique pour une sélection rapide de la plage horaire : **1S | 2S | 1M | 3M**

- **1S** : 7 derniers jours (fenêtre glissante)
- **2S** : 14 derniers jours (fenêtre glissante)
- **1M** : 30 derniers jours (fenêtre glissante, par défaut)
- **3M** : 90 derniers jours (fenêtre glissante)

Les modifications apportées ici sont synchronisées avec vos paramètres d'affichage, donc votre préférence est conservée entre les actualisations de page.

### Bascule de style de graphique {/* #chart-style-toggle */}

Un bouton de bascule dans l'en-tête du graphique vous permet de passer entre :

- **Lignes lissées** : Afficher les points de données connectés avec des courbes lisses
- **Graphique à barres** : Afficher les données sous forme de barres discrètes pour chaque période de temps

Les deux modes utilisent l'agrégation par compartiment de temps pour un affichage optimal. Les périodes vides en mode barre n'affichent pas de barre. Votre préférence persiste entre les actualisations de page et est synchronisée avec les paramètres d'affichage.

## Consolidation des données du graphique {/* #chart-data-consolidation */}

Lorsque plusieurs sauvegardes se produisent le même jour, **duplistatus** consolide les données avant de les afficher sur les graphiques :

- **SOMME** : Utilisé pour les métriques cumulatives (Durée, Nombre de fichiers, Taille de fichier, Taille téléchargée)
- **DERNIER** : Utilisé pour la taille de stockage (la valeur la plus récente du jour)
- **MAX** : Utilisé pour les versions disponibles (le nombre le plus élevé du jour)

Cette consolidation se fait avant l'application du compartimentage temporel, garantissant des métriques agrégées précises. Par exemple, deux sauvegardes le 5/12/26 produiront un seul point de données consolidé sur le graphique.

## Définitions des métriques {/* #metric-definitions */}

- **Taille téléchargée** : Quantité totale de données téléchargées/transmises pendant les sauvegardes du serveur Duplicati vers la destination (stockage local, FTP, fournisseur de cloud, ...) par jour.
- **Durée** : Durée totale de toutes les sauvegardes reçues par jour en HH:MM.
- **Nombre de fichiers** : Somme du compteur de nombre de fichiers reçu pour toutes les sauvegardes par jour.
- **Taille de fichier** : Somme de la taille de fichier rapportée par le serveur Duplicati pour toutes les sauvegardes reçues par jour.
- **Taille de stockage** : La somme de l'espace de stockage utilisé sur la destination de sauvegarde rapportée par le serveur Duplicati par jour.
- **Versions disponibles** : La somme de toutes les versions disponibles pour toutes les sauvegardes par jour.

:::note
Vous pouvez utiliser le contrôle [Paramètres d'affichage](settings/display-settings.md) pour configurer la plage horaire du graphique.
:::
