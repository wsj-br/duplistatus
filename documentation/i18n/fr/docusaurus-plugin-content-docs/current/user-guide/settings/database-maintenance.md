# Maintenance de la base de données {/* #database-maintenance */}

Gérez vos données de sauvegarde et optimisez les performances grâce aux opérations de maintenance de la base de données.

![Maintenance de la base de données](../../assets/screen-settings-database-maintenance.png)

<br/>

## Sauvegarde de la base de données {/* #database-backup */}

Créez une sauvegarde de l'ensemble de votre base de données à des fins de conservation ou de migration.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Dans la section **Sauvegarde de la base de données**, sélectionnez un format de sauvegarde :
    - **Fichier de base de données (.db)** : Format binaire - sauvegarde la plus rapide, préserve exactement toute la structure de la base de données
    - **Dump SQL (.sql)** : Format texte - instructions SQL lisibles par l'homme, peuvent être modifiées avant la restauration
3.  Cliquez sur <IconButton icon="lucide:download" label="Télécharger la sauvegarde" />.
4.  Le fichier de sauvegarde sera téléchargé sur votre ordinateur avec un nom de fichier horodaté.

**Formats de sauvegarde :**

- **Format .db** : Recommandé pour les sauvegardes régulières. Crée une copie exacte du fichier de base de données à l'aide de l'API de sauvegarde de SQLite, garantissant la cohérence même lorsque la base de données est utilisée.
- **Format .sql** : Utile pour la migration, l'inspection ou lorsque vous devez modifier les données avant la restauration. Contient toutes les instructions SQL nécessaires pour recréer la base de données.

**Bonnes pratiques :**

- Créez des sauvegardes régulières avant les opérations majeures (nettoyage, fusion, etc.)
- Stockez les sauvegardes dans un emplacement sécurisé séparé de l'application
- Testez périodiquement les procédures de restauration pour vous assurer que les sauvegardes sont valides

<br/>

## Restauration de la base de données {/* #database-restore */}

Restaurez votre base de données à partir d'un fichier de sauvegarde créé précédemment.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Dans la section **Restauration de la base de données**, cliquez sur le champ de sélection de fichier et sélectionnez un fichier de sauvegarde :
    - Formats pris en charge : `.db`, `.sql`, `.sqlite`, `.sqlite3`
    - Taille maximale du fichier : 200 Mo
3.  Cliquez sur <IconButton icon="lucide:upload" label="Restauration de la base de données" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Processus de restauration :**

- Une sauvegarde de sécurité de la base de données actuelle est automatiquement créée avant la restauration
- La base de données actuelle est remplacée par le fichier de sauvegarde
- Toutes les sessions sont effacées pour des raisons de sécurité (les utilisateurs doivent se reconnecter)
- L'intégrité de la base de données est vérifiée après la restauration
- Tous les caches sont effacés pour garantir des données fraîches

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
- Assurez-vous que le fichier de sauvegarde n'est pas corrompu et correspond au format attendu
- Pour les grandes bases de données, le processus de restauration peut prendre plusieurs minutes

<br/>

---

<br/>

:::note
Cela s'applique à toutes les fonctions de maintenance ci-dessous : toutes les statistiques sur le tableau de bord, les pages détaillées et les graphiques sont calculées à l'aide des données de la base de données **duplistatus**. La suppression d'anciennes informations affectera ces calculs.
 
Si vous supprimez accidentellement des données, vous pouvez les restaurer à l'aide de la fonction [Collecter les journaux de sauvegarde](../collect-backup-logs.md).
:::

Le service cron **compacte** également la base de données chaque dimanche à 04h00 UTC. Cette opération supprime les lignes de sauvegarde dont le serveur n'existe plus, les lignes de serveur sans rapports de sauvegarde restants, les paramètres de surveillance des sauvegardes et de notifications en retard restants, les anciennes lignes de livraison du résumé quotidien, et exécute `VACUUM` SQLite pour récupérer l'espace fichier. La suppression d'un serveur ou d'une tâche de sauvegarde nettoie toujours immédiatement les paramètres correspondants.

<br/>

## Période de nettoyage des données {/* #data-cleanup-period */}

Supprimez les enregistrements de sauvegarde obsolètes pour libérer de l'espace de stockage et améliorer les performances du système.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Choisissez une période de rétention :
    - **6 mois** : Conserver les enregistrements des 6 derniers mois.
    - **1 an** : Conserver les enregistrements de la dernière année.
    - **2 ans** : Conserver les enregistrements des 2 dernières années (par défaut).
    - **Supprimer toutes les données** : Supprimer tous les enregistrements de sauvegarde et serveurs. 
3.  Cliquez sur <IconButton icon="lucide:trash-2" label="Effacer les anciens enregistrements" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Effets du nettoyage :**

- Supprime les enregistrements de sauvegarde antérieurs à la période sélectionnée
- Met à jour toutes les statistiques et métriques associées

:::warning

La sélection de l'option "Supprimer toutes les données" entraînera la **suppression permanente de tous les enregistrements de sauvegarde et des paramètres de configuration** du système.

Il est fortement recommandé de créer une sauvegarde de la base de données avant de procéder à cette action.

:::

<br/>

## Supprimer les données de la tâche de sauvegarde {/* #delete-backup-job-data */}

Supprimez les données d'une tâche de sauvegarde spécifique (type).

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Sélectionnez une tâche de sauvegarde dans la liste déroulante.
    - Les sauvegardes seront triées par alias ou nom du serveur, puis par nom de la sauvegarde.
3.  Cliquez sur <IconButton icon="lucide:folder-open" label="Supprimer la tâche de sauvegarde" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Effets de la suppression :**

- Supprime définitivement toutes les données associées à cette tâche de sauvegarde / serveur.
- Nettoie les paramètres de configuration associés.
- Met à jour les statistiques du tableau de bord en conséquence.

<br/>

## Supprimer les données du serveur {/* #delete-server-data */}

Supprimez un serveur spécifique et toutes ses données de sauvegarde associées.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Sélectionnez un serveur dans la liste déroulante.
3.  Cliquez sur <IconButton icon="lucide:server" label="Supprimer les données du serveur" />.
4.  Confirmez l'action dans la boîte de dialogue.

**Effets de la suppression :**

- Supprime définitivement le serveur sélectionné et tous ses enregistrements de sauvegarde
- Nettoie les paramètres de configuration associés
- Met à jour les statistiques du tableau de bord en conséquence

<br/>

## Fusionner les serveurs en double {/* #merge-duplicate-servers */}

Détecter et fusionner les serveurs en double qui ont le même nom mais des ID différents. Utilisez cette fonctionnalité pour les consolider en une seule entrée de serveur.

Cela peut se produire lorsque le `machine-id` de Duplicati change après une mise à jour ou une réinstallation. Les serveurs en double ne sont affichés que lorsqu'ils existent. Si aucun doublon n'est détecté, la section affichera un message indiquant que tous les serveurs ont des noms uniques.

1.  Accédez à [Paramètres → Maintenance de la base de données](database-maintenance.md).
2.  Si des serveurs en double sont détectés, une section **Fusionner les serveurs en double** apparaîtra.
3.  Examinez la liste des groupes de serveurs en double :
    - Chaque groupe affiche les serveurs ayant le même nom mais des ID différents
    - Le **Serveur cible** (le plus récent par date de création) est mis en évidence
    - Les **Anciens ID de serveur** qui seront fusionnés sont listés séparément
4.  Sélectionnez les groupes de serveurs que vous souhaitez fusionner en cochant la case à côté de chaque groupe.
5.  Cliquez sur <IconButton icon="lucide:git-merge" label="Fusionner les serveurs sélectionnés" />.
6.  Confirmez l'action dans la boîte de dialogue.

**Processus de fusion :**

- Tous les anciens ID de serveur sont fusionnés dans le serveur cible (le plus récent par date de création)
- Tous les enregistrements et configurations de sauvegarde sont transférés vers le serveur cible
- Les valeurs de `backup_id` en double pour le même nom de sauvegarde sont consolidées en un seul ID (la ligne de sauvegarde la plus récente l'emporte)
- Les anciennes entrées de serveur sont supprimées
- Les statistiques du tableau de bord sont mises à jour automatiquement

:::info[IMPORTANT]
Cette action ne peut pas être annulée. Une sauvegarde de la base de données est recommandée avant de confirmer.
:::

<br/>
