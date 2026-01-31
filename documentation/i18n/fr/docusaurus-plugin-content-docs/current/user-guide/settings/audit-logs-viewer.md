---
translation_last_updated: '2026-01-31T00:51:22.991Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 67b8a05c2d43879d
translation_language: fr
source_file_path: user-guide/settings/audit-logs-viewer.md
---
# Journaux d'audit {#audit-logs}

Le journal d'audit fournit un enregistrement complet de tous les changements système et actions utilisateur dans **duplistatus**. Cela aide à suivre les modifications de configuration, les activités des utilisateurs et les opérations système à des fins de sécurité et de dépannage.

![Audit Log](/assets/screen-settings-audit.png)

## Visualiseur de journal d'audit {#audit-log-viewer}

Le visualiseur de journal d'audit affiche une liste chronologique de tous les événements enregistrés avec les informations suivantes :

- **Horodatage** : Quand l'événement s'est produit
- **Utilisateur** : Le nom d'utilisateur qui a effectué l'action (ou « Système » pour les actions automatisées)
- **Action** : L'action spécifique qui a été effectuée
- **Catégorie** : La catégorie de l'action (Authentification, Gestion des utilisateurs, Configuration, Opérations de sauvegarde, Gestion des serveurs, Opérations système)
- **Statut** : Si l'action a réussi ou échoué
- **Cible** : L'objet qui a été affecté (le cas échéant)
- **Détails** : Informations supplémentaires sur l'action

### Affichage des détails du journal {#viewing-log-details}

Cliquez sur l'icône <IconButton icon="lucide:eye" /> en forme d'œil à côté de n'importe quelle entrée de journal pour afficher des informations détaillées, notamment :
- Horodatage complet
- Informations sur l'utilisateur
- Détails complets de l'action (par exemple : champs modifiés, statistiques, etc.)
- Adresse IP et agent utilisateur
- Messages d'erreur (si l'action a échoué)

### Exportation des journaux d'audit {#exporting-audit-logs}

Vous pouvez exporter les journaux d'audit filtrés dans deux formats :

| Bouton | Description |
|:------|:-----------|
| <IconButton icon="lucide:download" label="CSV"/> | Exporter les journaux sous forme de fichier CSV pour une analyse dans un tableur |
| <IconButton icon="lucide:download" label="JSON"/> | Exporter les journaux sous forme de fichier JSON pour une analyse programmatique |

:::note
Les exports incluent uniquement les journaux actuellement visibles en fonction de vos filtres actifs. Pour exporter tous les journaux, effacez d'abord tous les filtres.
:::
