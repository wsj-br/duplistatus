---
translation_last_updated: '2026-02-05T00:20:53.548Z'
source_file_mtime: '2026-02-02T19:14:50.094Z'
source_file_hash: 3eab3fe85d0db77a
translation_language: fr
source_file_path: user-guide/settings/notification-templates.md
---
# Modèles {#templates}

**duplistatus** utilise trois modèles pour les messages de notification. Ces modèles sont utilisés pour les notifications NTFY et les notifications par e-mail :

![notification templates](../../assets/screen-settings-templates.png)

| Modèle             | Description                                                    |
| :----------------- | :------------------------------------------------------------- |
| **Succès**         | Utilisé quand les sauvegardes se terminent avec succès.        |
| **Avertissement/Erreur** | Utilisé quand les sauvegardes se terminent avec des avertissements ou des erreurs. |
| **Sauvegarde en retard** | Utilisé quand les sauvegardes sont en retard.                  |

<br/>

## Actions disponibles {#available-actions}

| Bouton                                                              | Description                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres du modèle" />                      | Enregistre les paramètres lors du changement de modèle. Le bouton enregistre le modèle affiché (Succès, Avertissement/Erreur ou Sauvegarde en retard). |
| <IconButton icon="lucide:send" label="Envoyer une notification de test"/>     | Vérifie le modèle après sa mise à jour. Les variables seront remplacées par leurs noms pour le test. Pour les notifications par e-mail, le titre du modèle devient la ligne d'objet de l'e-mail. |
| <IconButton icon="lucide:rotate-ccw" label="Réinitialiser aux valeurs par défaut"/>     | Restaure le modèle par défaut pour le **modèle sélectionné**. N'oubliez pas de l'enregistrer après la réinitialisation.  |

<br/>

## Variables {#variables}

Tous les modèles supportent les variables qui seront remplacées par des valeurs réelles. Le tableau suivant montre les variables disponibles :

| Variable               | Description                                     | Available In     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Nom du serveur.                             | Tous les modèles    |
| `{server_alias}`       | Alias du serveur.                            | Tous les modèles    |
| `{server_note}`        | Note pour le serveur.                            | Tous les modèles    |
| `{server_url}`         | URL de la configuration web du serveur Duplicati   | Tous les modèles    |
| `{backup_name}`        | Nom de la sauvegarde.                             | Tous les modèles    |
| `{status}`             | Statut de la sauvegarde (Succès, Avertissement, Erreur, Fatal). | Succès, Avertissement |
| `{backup_date}`        | Date et heure de la sauvegarde.                    | Succès, Avertissement |
| `{duration}`           | Durée de la sauvegarde.                         | Succès, Avertissement |
| `{uploaded_size}`      | Quantité de données téléversées.                        | Succès, Avertissement |
| `{storage_size}`       | Informations d'utilisation du stockage.                      | Succès, Avertissement |
| `{available_versions}` | Nombre de versions de sauvegarde disponibles.            | Succès, Avertissement |
| `{file_count}`         | Nombre de fichiers traités.                      | Succès, Avertissement |
| `{file_size}`          | Taille totale des fichiers sauvegardés.                  | Succès, Avertissement |
| `{messages_count}`     | Nombre de messages.                             | Succès, Avertissement |
| `{warnings_count}`     | Nombre d'avertissements.                             | Succès, Avertissement |
| `{errors_count}`       | Nombre d'erreurs.                               | Succès, Avertissement |
| `{log_text}`           | Messages du journal (avertissements et erreurs)              | Succès, Avertissement |
| `{last_backup_date}`   | Date de la dernière sauvegarde.                        | En retard          |
| `{last_elapsed}`       | Temps écoulé depuis la dernière sauvegarde.             | En retard          |
| `{expected_date}`      | Date de sauvegarde attendue.                           | En retard          |
| `{expected_elapsed}`   | Temps écoulé depuis la date attendue.           | En retard          |
| `{backup_interval}`    | Chaîne d'intervalle (par exemple, « 1D », « 2W », « 1M »).       | En retard          |
| `{overdue_tolerance}`  | Paramètre de tolérance de retard.                      | En retard          |
