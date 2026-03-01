---
translation_last_updated: '2026-03-01T00:45:07.726Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: 462b7eda950bd23d
translation_language: fr
source_file_path: user-guide/settings/database-maintenance.md
---
# Maintenance de la base de données {#database-maintenance}

Gérez vos données de sauvegarde et optimisez les performances grâce aux opérations de maintenance de la base de données.

![Database maintenance](../../assets/screen-settings-database-maintenance.png)

<br/>

## Sauvegarde de la base de données {#database-backup}

Créez une sauvegarde de l'intégralité de votre base de données à titre de précaution ou pour des besoins de migration.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Dans la section **Sauvegarde de la base de données**, sélectionnez un format de sauvegarde :
    - **Fichier de base de données (.db)** : Format binaire - sauvegarde la plus rapide, préserve exactement toute la structure de la base de données
    - **Dump SQL (.sql)** : Format texte - instructions SQL lisibles par l'homme, peuvent être modifiées avant la restauration
3.  Cliquez sur <IconButton icon="lucide:download" label="Télécharger la sauvegarde" />.
4.  Le fichier de sauvegarde sera téléchargé sur votre ordinateur avec un nom de fichier horodaté.

**Formats de sauvegarde :**

- **.db format** : Recommandé pour les sauvegardes régulières. Crée une copie exacte du fichier de base de données en utilisant l'API de sauvegarde de SQLite, garantissant la cohérence même pendant que la base de données est en cours d'utilisation.
- **.sql format** : Utile pour la migration, l'inspection, ou quand vous avez besoin de modifier les données avant la restauration. Contient tous les relevés SQL nécessaires pour recréer la base de données.

**Bonnes pratiques :**

- Créer des sauvegardes régulières avant les opérations majeures (nettoyage, fusion, etc.)
- Stocker les sauvegardes dans un emplacement sûr séparé de l'application
- Tester les procédures de restauration périodiquement pour assurer que les sauvegardes sont valides

<br/>

## Restauration de la base de données {#database-restore}

Restaurez votre base de données à partir d'un fichier de sauvegarde créé précédemment.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Dans la section **Restauration de la base de données**, cliquez sur l'entrée de fichier et sélectionnez un fichier de sauvegarde :
    - Formats pris en charge : `.db`, `.sql`, `.sqlite`, `.sqlite3`
    - Taille maximale des fichiers : 100 Mo
3.  Cliquez sur <IconButton icon="lucide:upload" label="Restaurer la base de données" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Processus de Restauration :**

- Une sauvegarde de sécurité de la base de données actuelle est automatiquement créée avant la restauration
- La base de données actuelle est remplacée par le fichier de sauvegarde
- Toutes les sessions sont effacées pour des raisons de sécurité (les utilisateurs doivent se connecter à nouveau)
- L'intégrité de la base de données est vérifiée après la restauration
- Tous les caches sont effacés pour garantir des données actualisées

**Formats de restauration :**

- **Fichiers .db** : Le fichier de base de données est directement remplacé. Méthode de restauration la plus rapide.
- **Fichiers .sql** : Les instructions SQL sont exécutées pour recréer la base de données. Permet une restauration sélective si nécessaire.

:::warning
La restauration d'une base de données **remplacera toutes les données actuelles**. Cette action ne peut pas être annulée.  
Une sauvegarde de sécurité est créée automatiquement, mais il est recommandé de créer votre propre sauvegarde avant de restaurer.
 
**Important :** Après la restauration, toutes les sessions utilisateur sont effacées pour des raisons de sécurité. Vous devrez vous reconnecter.
:::

**Dépannage :**

- Si la restauration échoue, la base de données d'origine est automatiquement restaurée à partir de la sauvegarde de sécurité
- Assurez-vous que le fichier de sauvegarde n'est pas corrompu et qu'il correspond au format attendu
- Pour les grandes bases de données, le processus de restauration peut prendre plusieurs minutes

<br/>

---

<br/>

:::note
Ceci s'applique à toutes les fonctions de maintenance ci-dessous : toutes les statistiques du tableau de bord, des pages de détail et des graphiques sont calculées à partir des données de la base de données **duplistatus**. La suppression d'anciennes informations aura un impact sur ces calculs.

Si vous supprimez accidentellement des données, vous pouvez les restaurer à l'aide de la fonctionnalité [Collecter les journaux de sauvegarde](../collect-backup-logs.md).
:::

<br/>

## Période de nettoyage des données {#data-cleanup-period}

Supprimez les enregistrements de sauvegarde obsolètes pour libérer de l'espace de stockage et améliorer les performances du système.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Choisissez une période de rétention :
    - **6 mois** : Conserver les enregistrements des 6 derniers mois.
    - **1 an** : Conserver les enregistrements de l'année dernière.
    - **2 ans** : Conserver les enregistrements des 2 dernières années (par défaut).
    - **Supprimer toutes les données** : Supprimer tous les enregistrements de sauvegarde et les serveurs.
3.  Cliquez sur <IconButton icon="lucide:trash-2" label="Effacer les anciens enregistrements" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Effets de nettoyage :**

- Supprime les enregistrements de sauvegarde antérieurs à la période sélectionnée
- Met à jour toutes les statistiques et métriques associées

:::warning

La sélection de l'option « Supprimer toutes les données » **supprimera définitivement tous les enregistrements de sauvegarde et les paramètres de configuration** du système.

Il est fortement recommandé de créer une sauvegarde de la base de données avant de procéder à cette action.

:::

<br/>

## Supprimer le travail de sauvegarde {#delete-backup-job-data}

Supprimer les données d'une tâche de sauvegarde spécifique (type).

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Sélectionnez un travail de sauvegarde dans la liste déroulante.
    - Les sauvegardes seront classées par alias du serveur ou nom, puis par nom de sauvegarde.
3.  Cliquez sur <IconButton icon="lucide:folder-open" label="Supprimer le travail de sauvegarde" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Effets de la suppression :**

- Supprime définitivement toutes les données associées à cette Tâche de sauvegarde / Serveur.
- Nettoie les paramètres de configuration associés.
- Met à jour les statistiques du tableau de bord en conséquence.

<br/>

## Supprimer les données du serveur {#delete-server-data}

Supprimer un Serveur spécifique et toutes ses données de sauvegarde associées.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Sélectionnez un serveur dans la liste déroulante.
3.  Cliquez sur <IconButton icon="lucide:server" label="Supprimer les données du serveur" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Effets de la suppression :**

- Supprime définitivement le serveur sélectionné et tous ses enregistrements de sauvegarde
- Nettoie les paramètres de configuration associés
- Met à jour les statistiques du tableau de bord en conséquence

<br/>

## Fusionner les serveurs en double {#merge-duplicate-servers}

Détecter et fusionner les serveurs en double qui ont le même nom mais des ID différents. Utilisez cette fonctionnalité pour les consolider en une seule entrée de serveur.

Cela peut se produire quand l'`machine-id` de Duplicati change après une mise à niveau ou une réinstallation. Les serveurs en double ne s'affichent que s'ils existent. Si aucun doublon n'est détecté, la section affichera un message indiquant que tous les serveurs ont des noms uniques.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Si des serveurs en double sont détectés, une section **Fusionner les serveurs en double** apparaîtra.
3.  Examinez la liste des groupes de serveurs en double :
    - Chaque groupe affiche les serveurs portant le même nom mais avec des identifiants différents
    - Le **Serveur cible** (le plus récent par date de création) est mis en évidence
    - Les **anciens identifiants de serveur** qui seront fusionnés sont listés séparément
4.  Sélectionnez les groupes de serveurs que vous souhaitez fusionner en cochant la case à côté de chaque groupe.
5.  Cliquez sur <IconButton icon="lucide:git-merge" label="Fusionner les serveurs sélectionnés" />.
6.  Confirmez l'action dans la boîte de dialogue.

**Processus de fusion :**

- Tous les anciens identifiants de serveur sont fusionnés dans le serveur cible (le plus récent par date de création)
- Tous les enregistrements de sauvegarde et les configurations sont transférés vers le serveur cible
- Les anciennes entrées de serveur sont supprimées
- Les statistiques du tableau de bord sont mises à jour automatiquement

:::info[IMPORTANT]
Cette action ne peut pas être annulée. Une sauvegarde de la base de données est recommandée avant de confirmer.  
:::

<br/>
