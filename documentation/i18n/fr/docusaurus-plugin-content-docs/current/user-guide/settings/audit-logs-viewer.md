# Journaux d'audit {/* #audit-logs */}

Le journal d'audit fournit un enregistrement complet de tous les changements système et actions des utilisateurs dans **duplistatus**. Cela permet de suivre les modifications de configuration, les activités des utilisateurs et les opérations du système à des fins de sécurité et de dépannage.

![Journal d'audit](../../assets/screen-settings-audit.png)

## Visionneuse de journaux d'audit {/* #audit-log-viewer */}

La visionneuse de journaux d'audit affiche une liste chronologique de tous les événements enregistrés avec les informations suivantes :

- **Horodatage** : Quand l'événement s'est produit
- **Utilisateur** : Le nom d'utilisateur ayant effectué l'action (ou "Système" pour les actions automatisées)
- **Action** : L'action spécifique qui a été effectuée
- **Catégorie** : La catégorie de l'action (Authentification, Gestion des utilisateurs, Configuration, Opérations de sauvegarde, Gestion du serveur, Opérations système)
- **Statut** : Si l'action a réussi ou échoué
- **Cible** : L'objet qui a été affecté (le cas échéant)
- **Détails** : Informations supplémentaires sur l'action

### Affichage des détails du journal {/* #viewing-log-details */}

Cliquez sur l'icône <IconButton icon="lucide:eye" /> œil située à côté de n'importe quelle entrée de journal pour afficher des informations détaillées, notamment :
- Horodatage complet
- Informations sur l'utilisateur
- Détails complets de l'action (par exemple : champs modifiés, statistiques, etc.)
- Adresse IP et agent utilisateur
- Messages d'erreur (si l'action a échoué)

### Exportation des journaux d'audit {/* #exporting-audit-logs */}

Vous pouvez exporter les journaux d'audit filtrés dans deux formats :

| Bouton | Description |
|:------|:-----------|
| <IconButton icon="lucide:download" label="CSV"/> | Exporter les journaux au format CSV pour une analyse par tableur |
| <IconButton icon="lucide:download" label="JSON"/> | Exporter les journaux au format JSON pour une analyse programmée |

:::note
Les exports incluent uniquement les journaux actuellement visibles selon vos filtres actifs. Pour exporter tous les journaux, effacez d'abord tous les filtres.
:::
