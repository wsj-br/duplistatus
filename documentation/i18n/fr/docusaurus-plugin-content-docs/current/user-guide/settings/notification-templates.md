# Modèles {#templates}

**duplistatus** utilise trois Modèles pour les Messages de Notifications. Ces Modèles sont utilisés pour les Notifications NTFY et Notifications par e-mail :

![Modèles de notification](/assets/screen-settings-templates.png)

| Modèle                   | Description                                                                                        |
| :----------------------- | :------------------------------------------------------------------------------------------------- |
| **Succès**               | Utilisé quand les Sauvegardes se terminent avec succès.                            |
| **Avertissement/Erreur** | Utilisé quand les Sauvegardes se terminent avec des Avertissements ou des Erreurs. |
| **Sauvegarde en retard** | Utilisé quand les Sauvegardes sont en retard.                                      |

<br/>

## Actions disponibles {#available-actions}

| Bouton                                                                    | Description                                                                                                                                                                                                                                      |
| :------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton label="Enregistrer les paramètres du modèle" />               | Enregistre les paramètres lors de la modification du Modèle. Le bouton Enregistre le Modèle affiché (Succès, Avertissement/Erreur ou Sauvegarde en retard).                                   |
| <IconButton icon="lucide:send" label="Envoyer une notification de test"/> | Vérifie le Modèle après sa mise à jour. Les variables seront remplacées par leurs noms pour le test. Pour les Notifications par e-mail, le titre du Modèle devient la ligne d'objet de l'e-mail. |
| <IconButton icon="lucide:rotate-ccw" label="Réinitialiser par défaut"/>   | Restaure le Modèle par défaut pour le **Modèle sélectionné**. N'oubliez pas de l'Enregistrer après la Réinitialisation.                                                                                          |

<br/>

## Variables {#variables}

Tous les Modèles prennent en charge les variables qui seront remplacées par les valeurs réelles. Le tableau suivant Affiche les variables disponibles :

| Variable               | Description                                                                                     | Disponible dans       |
| :--------------------- | :---------------------------------------------------------------------------------------------- | :-------------------- |
| `{server_name}`        | Nom du serveur.                                                                 | Tous les Modèles      |
| `{server_alias}`       | Alias du serveur.                                                               | Tous les Modèles      |
| `{server_note}`        | Note du serveur.                                                                | Tous les Modèles      |
| `{server_url}`         | URL du serveur Duplicati                                                                        | Tous les Modèles      |
| `{backup_name}`        | Nom de la sauvegarde.                                                           | Tous les Modèles      |
| `{status}`             | Statut de sauvegarde (Succès, Avertissement, Erreur, Fatal). | Succès, Avertissement |
| `{backup_date}`        | Date et heure de la sauvegarde.                                                 | Succès, Avertissement |
| `{duration}`           | Durée de la sauvegarde.                                                         | Succès, Avertissement |
| `{uploaded_size}`      | Quantité de données téléversées.                                                | Succès, Avertissement |
| `{storage_size}`       | Informations d'utilisation du Stockage.                                         | Succès, Avertissement |
| `{available_versions}` | Versions de sauvegarde disponibles.                                             | Succès, Avertissement |
| `{file_count}`         | Nombre de fichiers traités.                                                     | Succès, Avertissement |
| `{file_size}`          | Taille Total des Fichiers sauvegardés.                                          | Succès, Avertissement |
| `{messages_count}`     | Nombre de Messages.                                                             | Succès, Avertissement |
| `{warnings_count}`     | Nombre d'Avertissements.                                                        | Succès, Avertissement |
| `{errors_count}`       | Nombre d'Erreurs.                                                               | Succès, Avertissement |
| `{log_text}`           | Messages de journal (Avertissements et Erreurs)                              | Succès, Avertissement |
| `{last_backup_date}`   | Date de la Dernière sauvegarde.                                                 | En retard             |
| `{last_elapsed}`       | Temps écoulé depuis la Dernière sauvegarde.                                     | En retard             |
| `{expected_date}`      | Date de sauvegarde prévue.                                                      | En retard             |
| `{expected_elapsed}`   | Temps écoulé depuis la Date prévue.                                             | En retard             |
| `{backup_interval}`    | Chaîne d'intervalle (par exemple, "1D", "2W", "1M").         | En retard             |
| `{overdue_tolerance}`  | Paramètre de tolérance en retard.                                               | En retard             |




