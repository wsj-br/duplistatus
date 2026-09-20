# Modèles {/* #templates */}

**duplistatus** utilise quatre modèles pour les messages de notification. Les corps des e-mails sont au format Markdown (titres, listes, liens et tableaux). NTFY pour Succès, Avertissement/Erreur et En retard utilise le même corps Markdown, envoyé avec `Markdown: yes` afin que les clients ntfy puissent le restituer. Toute table GFM omet sa ligne d'en-tête et envoie le corps en texte brut, car ntfy ne restitue pas les tableaux. Le Résumé quotidien est uniquement destiné aux e-mails.

La page inclut un sélecteur de **Langue du modèle** qui définit les paramètres régionaux des modèles par défaut. La modification de la langue met à jour les paramètres régionaux des nouveaux modèles par défaut, mais elle ne modifie **pas** le texte des modèles existants. Pour appliquer une nouvelle langue à vos modèles, éditez-les manuellement ou utilisez **Réinitialiser ce modèle à la valeur par défaut** (pour l'onglet actuel) ou **Réinitialiser tout par défaut** (pour tous les modèles).

![modèles de notification](../../assets/screen-settings-templates.png)

| Modèle             | Description                                         |
| :----------------- | :-------------------------------------------------- |
| **Succès**         | Utilisé lorsque les sauvegardes se terminent correctement.            |
| **Avertissement/Erreur**  | Utilisé lorsque les sauvegardes se terminent avec des avertissements ou des erreurs. |
| **Sauvegarde en retard** | Utilisé lorsque les sauvegardes sont en retard.                      |
| **Résumé quotidien**  | Modèle d'e-mail Markdown pour l'instantané quotidien facultatif. |

<br/>

## Langue du modèle {/* #template-language */}

Un sélecteur de **Langue du modèle** en haut de la page vous permet de choisir la langue des modèles par défaut (anglais, allemand, français, espagnol, portugais, hindi et chinois simplifié). La modification de la langue met à jour les paramètres régionaux des modèles par défaut, mais les modèles personnalisés existants conservent leur texte actuel jusqu'à ce que vous les mettiez à jour ou que vous utilisiez l'un des boutons de réinitialisation.

<br/>

## Actions disponibles {/* #available-actions */}

| Bouton                                                              | Description                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres du modèle" />                      | Enregistre les paramètres lors de la modification du modèle. Le bouton enregistre le modèle affiché (Succès, Avertissement/Erreur, Sauvegarde en retard ou Résumé quotidien). |
| <IconButton icon="lucide:send" label="Envoyer une notification de test"/>     | Vérifie le modèle après l'avoir mis à jour. Les variables seront remplacées par leurs noms pour le test. Pour les notifications par e-mail, le titre du modèle devient la ligne d'objet de l'e-mail. Non disponible dans l'onglet Résumé quotidien. |
| <IconButton icon="lucide:rotate-ccw" label="Réinitialiser ce modèle à la valeur par défaut"/> | Restaure le modèle par défaut pour le **modèle sélectionné** (l'onglet actuel). N'oubliez pas d'enregistrer après la réinitialisation. |
| <IconButton icon="lucide:rotate-ccw" label="Réinitialiser tout par défaut"/> | Restaure tous les modèles (Succès, Avertissement/Erreur, Sauvegarde en retard et Résumé quotidien) aux valeurs par défaut de la Langue du modèle sélectionnée. N'oubliez pas d'enregistrer après la réinitialisation. |

<br/>

## Variables {/* #variables */}

Les corps des e-mails sont au format Markdown. Les titres, listes, liens et tableaux sont pris en charge. Les valeurs de substitution sont insérées sous forme de texte échappé et ne peuvent introduire de Markdown ou de HTML. Le HTML brut précédemment intégré dans les modèles personnalisés est désormais échappé. NTFY reçoit le même Markdown, à l'exception des tableaux GFM : la ligne d'en-tête est omise et les lignes de corps sont envoyées en texte brut, quelle que soit la disposition des colonnes.

Les corps par défaut des modèles Succès, Avertissement/Erreur et En retard utilisent le même style Markdown que le Résumé quotidien : un titre, des valeurs en gras et un tableau d'aperçu. Les valeurs par défaut stockées non modifiées sont mises à niveau au chargement ; les modèles personnalisés sont conservés.

Tous les modèles Succès, Avertissement/Erreur et En retard prennent en charge des variables qui seront remplacées par des valeurs réelles. Le tableau suivant présente les variables disponibles :

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
| `{log_text}`           | Lignes de journal d'avertissements et d'erreurs uniquement (pas les journaux d'information complets). NTFY utilise un résumé court et peut tronquer. | Succès, Avertissement |
| `{last_backup_date}`   | Date de la dernière sauvegarde.                        | En retard          |
| `{last_elapsed}`       | Temps écoulé depuis la dernière sauvegarde.             | En retard          |
| `{expected_date}`      | Date de sauvegarde prévue.                           | En retard          |
| `{expected_elapsed}`   | Temps écoulé depuis la date prévue.           | En retard          |
| `{backup_interval}`    | Chaîne d'intervalle (par exemple, "1D", "2W", "1M").       | En retard          |
| `{overdue_tolerance}`  | Paramètre de tolérance des tâches en retard.                      | En retard          |

Les modèles de résumé quotidien utilisent un ensemble différent de variables pour l'instantané du statut actuel :

| Variable | Description |
|:---------|:------------|
| `{summary_date}` | Date du calendrier local de l'instantané |
| `{generated_at}` | Date et heure auxquelles l'instantané a été généré |
| `{time_zone}` | Fuseau horaire IANA enregistré |
| `{server_count}` / `{job_count}` | Serveurs et tâches connues |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | Groupes de statuts mutuellement exclusifs |
| `{overdue_count}` | Tâches en retard (orthogonal au statut ; peut chevaucher les groupes ci-dessus) |
| `{problem_table}` / `{all_jobs_table}` | Tables générées des tâches nécessitant une attention particulière et de toutes les tâches. Colonnes : Serveur, Sauvegarde, En retard, Dernier statut, Dernier résultat, Durée, Avertissements, Erreurs, Téléchargé. |
| `{duplistatus_link}` | Lien vers le tableau de bord duplistatus (omis lorsqu'aucune URL publique n'est configurée). Préférez ceci plutôt que des liens Markdown construits manuellement. |
| `{duplistatus_url}` | Même URL en texte brut (vide lorsque aucune URL publique n'est configurée). |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | Totaux du dernier résultat |

L'objet par défaut de l'e-mail de résumé quotidien est :

```text
Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal
```

Les objets par défaut stockés non modifiés sont mis à jour vers ce format. Les objets personnalisés restent inchangés. `{unknown_count}` et `{no_report_count}` restent dans le corps de l'e-mail, pas dans l'objet par défaut.

Utilisez **Aperçu** pour afficher l'objet de l'e-mail, HTML et texte brut sans envoyer. Les aperçus Succès, Avertissement/Erreur et En retard incluent également la charge utile Markdown NTFY. L'aperçu s'ouvre dans une boîte de dialogue. Les boutons E-mail HTML / texte brut / NTFY se trouvent au-dessus de l'objet. L'e-mail HTML suit le thème clair ou sombre actuel.
