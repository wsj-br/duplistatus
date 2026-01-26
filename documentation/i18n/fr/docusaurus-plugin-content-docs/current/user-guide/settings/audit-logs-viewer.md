# Journaux d'Audit {#audit-logs}

Le Journal d'Audit fournit un enregistrement complet de tous les changements de Système et Actions des Utilisateurs dans **duplistatus**. Cela aide à suivre les changements de configuration, les activités des Utilisateurs et les opérations du Système à des fins de Sécurité et de dépannage.

![Journal d'Audit](/img/screen-settings-audit.png)

## Visualiseur de journal d'audit {#audit-log-viewer}

Le visualiseur de journal d'audit affiche une liste chronologique de Tous les événements enregistrés avec les informations suivantes :

- **Horodatage** : Quand l'événement s'est produit
- **Utilisateur** : Le Nom d'utilisateur qui a effectué l'Action (ou "Système" pour les Actions automatisées)
- **Action** : L'Action spécifique qui a été effectuée
- **Catégorie** : La Catégorie de l'Action (Authentification, Gestion des utilisateurs, Configuration, Opérations de sauvegarde, Gestion des serveurs, Opérations du Système)
- **Statut** : Si l'Action a réussi ou a échoué
- **Cible** : L'objet qui a été affecté (le cas échéant)
- **Détails** : Informations supplémentaires À propos de l'Action

### Affichage des Détails des Journaux {#viewing-log-details}

Cliquez sur l'icône <IconButton icon="lucide:eye" /> en Suivant n'importe quelle entrée de journal pour Afficher des informations détaillées, notamment :

- Horodatage complet
- Informations sur l'Utilisateur
- Détails complets de l'Action (par exemple : champs modifiés, Statistiques, etc.)
- Adresse IP et Agent utilisateur
- Messages d'erreur (si l'Action a échoué)

### Exportation des Journaux d'Audit {#exporting-audit-logs}

Vous pouvez Exporter les Journaux d'Audit filtrés dans deux formats :

| Bouton                                            | Description                                                                         |
| :------------------------------------------------ | :---------------------------------------------------------------------------------- |
| <IconButton icon="lucide:download" label="CSV"/>  | Exporter les Journaux sous forme de fichier CSV pour l'analyse de feuille de calcul |
| <IconButton icon="lucide:download" label="JSON"/> | Exporter les Journaux sous forme de fichier JSON pour l'analyse programmatique      |

:::note
Les Exportations incluent uniquement les Journaux actuellement visibles en fonction de vos Filtres Actifs. Pour Exporter Tous les Journaux, Effacez d'abord Tous les Filtres.
:::
