# Modèles {#templates}

**duplistatus** utilise quatre modèles pour les messages de notification. Les corps des emails sont en Markdown (titres, listes, liens et tableaux). NTFY pour Succès, Avertissement/Erreur et En retard est dérivé du même contenu. Le Résumé quotidien est uniquement pour les emails.

La page comprend un sélecteur de **Langue du modèle** qui définit la locale pour les modèles par défaut. Changer la langue met à jour la locale pour les nouveaux paramètres par défaut, mais cela ne modifie **pas** le texte des modèles existants. Pour appliquer une nouvelle langue à vos modèles, modifiez-les manuellement ou utilisez **Réinitialiser ce modèle à la valeur par défaut** (pour l'onglet actuel) ou **Réinitialiser tout par défaut** (pour tous les modèles).

![modèles de notification](../../assets/screen-settings-templates.png)

| Modèle           | Description                                         |
| :----------------- | :-------------------------------------------------- |
| **Succès**        | Utilisé lorsque les sauvegardes se terminent avec succès.            |
| **Avertissement/Erreur**  | Utilisé lorsque les sauvegardes se terminent avec des avertissements ou des erreurs. |
| **Sauvegarde en retard** | Utilisé lorsque les sauvegardes sont en retard.                      |
| **Résumé quotidien**  | Modèle d'email en Markdown pour le snapshot quotidien optionnel. |

<br/>

## Langue du modèle {#template-language}

Un sélecteur de **Langue du modèle** situé en haut de la page vous permet de choisir la langue des modèles par défaut (anglais, allemand, français, espagnol, portugais, hindi (roman) et chinois simplifié). La modification de la langue met à jour les paramètres régionaux par défaut, mais les modèles personnalisés existants conservent leur texte actuel jusqu'à ce que vous les mettiez à jour ou utilisiez l'un des boutons de réinitialisation.

<br/>

## Actions disponibles {#available-actions}

| Bouton                                                              | Description                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres du modèle" />                      | Enregistre les paramètres lors du changement de modèle. Le bouton enregistre le modèle affiché (Succès, Avertissement/Erreur, Sauvegarde en retard ou Résumé quotidien). |
| <IconButton icon="lucide:send" label="Envoyer une notification de test"/>     | Vérifie le modèle après l'avoir mis à jour. Les variables seront remplacées par leurs noms pour le test. Pour les notifications par courriel, le titre du modèle devient l'objet de l'email. Non disponible dans l'onglet Résumé quotidien. |
| <IconButton icon="lucide:rotate-ccw" label="Réinitialiser ce modèle à la valeur par défaut"/> | Restaure le modèle par défaut pour le **modèle sélectionné** (l'onglet actuel). N'oubliez pas d'enregistrer après la réinitialisation. |
| <IconButton icon="lucide:rotate-ccw" label="Réinitialiser tout par défaut"/> | Restaure tous les modèles (Succès, Avertissement/Erreur, Sauvegarde en retard et Résumé quotidien) aux valeurs par défaut pour la Langue du modèle sélectionnée. N'oubliez pas d'enregistrer après la réinitialisation. |

<br/>

## Variables {#variables}

Les corps des e-mails sont en Markdown. Les titres, listes, liens et tableaux sont pris en charge. Les valeurs des variables sont insérées comme texte échappé et ne peuvent pas introduire de Markdown ou de HTML. Les balises HTML brutes intégrées précédemment dans les modèles personnalisés sont maintenant échappées.

Tous les modèles Succès, Avertissement/Erreur et En retard prennent en charge des variables qui seront remplacées par des valeurs réelles. Le tableau suivant montre les variables disponibles :

| Variable               | Description                                     | Disponible dans     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | Nom du serveur.                             | Succès, Avertissement, En retard |
| `{server_alias}`       | Alias du serveur.                            | Succès, Avertissement, En retard |
| `{server_note}`        | Note pour le serveur.                            | Succès, Avertissement, En retard |
| `{server_url}`         | URL de la configuration web du serveur Duplicati   | Succès, Avertissement, En retard |
| `{backup_name}`        | Nom de la sauvegarde.                             | Succès, Avertissement, En retard |
| `{status}`             | Statut de la sauvegarde (Succès, Avertissement, Erreur, Fatal). | Succès, Avertissement |
| `{backup_date}`        | Date et heure de la sauvegarde.                    | Succès, Avertissement |
| `{duration}`           | Durée de la sauvegarde.                         | Succès, Avertissement |
| `{uploaded_size}`      | Quantité de données téléchargées.                        | Succès, Avertissement |
| `{storage_size}`       | Informations sur l'utilisation du stockage.                      | Succès, Avertissement |
| `{available_versions}` | Nombre de versions de sauvegarde disponibles.            | Succès, Avertissement |
| `{file_count}`         | Nombre de fichiers traités.                      | Succès, Avertissement |
| `{file_size}`          | Taille totale des fichiers sauvegardés.                  | Succès, Avertissement |
| `{messages_count}`     | Nombre de messages.                             | Succès, Avertissement |
| `{warnings_count}`     | Nombre d'avertissements.                             | Succès, Avertissement |
| `{errors_count}`       | Nombre d'erreurs.                               | Succès, Avertissement |
| `{log_text}`           | Messages du journal (avertissements et erreurs)              | Succès, Avertissement |
| `{last_backup_date}`   | Date de la dernière sauvegarde.                        | En retard          |
| `{last_elapsed}`       | Temps écoulé depuis la dernière sauvegarde.             | En retard          |
| `{expected_date}`      | Date prévue de la sauvegarde.                           | En retard          |
| `{expected_elapsed}`   | Temps écoulé depuis la date prévue.           | En retard          |
| `{backup_interval}`    | Chaîne d'intervalle (par exemple, "1D", "2W", "1M").       | En retard          |
| `{overdue_tolerance}`  | Paramètre de tolérance de retard.                      | En retard          |

Les modèles de Résumé quotidien utilisent un ensemble différent de variables pour la capture instantanée de l'état actuel :

| Variable | Description |
|:---------|:------------|
| `{summary_date}` | Date du calendrier locale de la capture instantanée |
| `{generated_at}` | Date et heure de génération de la capture instantanée |
| `{time_zone}` | Fuseau horaire IANA enregistré |
| `{server_count}` / `{job_count}` | Serveurs et tâches connues |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | Paniers d'état mutuellement exclusifs |
| `{overdue_count}` | Tâches en retard (orthogonales à l'état) |
| `{problem_table}` / `{all_jobs_table}` | Tables générées des tâches nécessitant une attention et de toutes les tâches. Colonnes : Serveur, Sauvegarde, En retard, Dernier statut, Dernier résultat, Durée, Avertissements, Erreurs, Téléchargé. |
| `{duplistatus_link}` | Lien vers le tableau de bord du duplistatus (omise lorsqu'aucune URL publique n'est configurée). Préférez ceci aux liens Markdown construits à la main. |
| `{duplistatus_url}` | Même URL que le texte brut (vide lorsqu'aucune URL publique n'est configurée). |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | Totaux des derniers résultats |

Utilisez **Aperçu** pour rendre l'email HTML et le texte brut sans envoi. Les aperçus de Succès, Avertissement/Erreur et En retard incluent également NTFY. L'aperçu s'ouvre dans une boîte de dialogue. L'email HTML suit le thème clair ou sombre actuel.
