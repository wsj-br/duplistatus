# Résumé quotidien {#daily-summary}

Le résumé quotidien est un mode de notification optionnel qui envoie **un** instantané localisé de chaque tâche de sauvegarde connue à une heure exacte locale. Lorsqu'il est activé, les messages électroniques individuels de sauvegarde et les alertes en retard, y compris les destinations supplémentaires par tâche, sont suspendus. Ces paramètres restent stockés et reprennent leur activité dès que le résumé quotidien est désactivé.

L'instantané est l'**état actuel** au moment de l'envoi (le dernier résultat pour chaque tâche). Il ne s'agit pas d'un historique des exécutions de la journée précédente.

![Paramètres du résumé quotidien](../../assets/screen-settings-left-panel-admin.png)

## Exigences {#requirements}

- SMTP doit être configuré. L'e-mail est toujours envoyé une fois au destinataire SMTP.
- Le service cron doit être en cours d'exécution. Le répartiteur vérifie chaque minute en UTC.
- La livraison NTFY optionnelle nécessite également des paramètres NTFY valides stockés.

## Ce qui est inclus {#what-is-included}

Les tâches connues sont l'union de :

- la dernière sauvegarde observée pour chaque serveur et nom de sauvegarde
- les paramètres par tâche explicites dont le serveur existe toujours

Une tâche configurée qui n'a jamais envoyé de rapport est étiquetée **Aucun rapport reçu**. Les catégories d'état (Succès, Avertissement, Erreur, Fatal, Inconnu, Aucun rapport reçu) sont mutuellement exclusives et s'ajoutent au nombre de tâches. **En retard** est compté séparément : une tâche réussie en retard est toujours Succès et également en retard.

## Planification {#schedule}

Choisissez une heure exacte `HH:mm` et enregistrez le fuseau horaire IANA du navigateur. Le fuseau horaire enregistré reste visible et n'est pas remplacé lorsque les paramètres sont ouverts dans un autre navigateur.

- L'activation ou la modification de la planification commence à la **prochaine occurrence future**, jamais un envoi surprise immédiat.
- Le redémarrage plus tard le même jour local rattrape toujours après l'heure configurée.
- Les jours complètement manqués plus tôt ne sont pas rejoués.
- Les heures manquantes en avance de printemps s'exécutent à la première minute valide après l'écart. Les heures répétées en automne s'exécutent une fois.

## Comportement de remplacement {#replacement-behaviour}

Lorsque le résumé quotidien est activé :

- les téléchargements et les e-mails/NTFY en retard ne sont pas envoyés
- les horodatages en retard ne sont pas avancés, donc les alertes en retard peuvent reprendre immédiatement lorsque le mode est désactivé
- l'aperçu du modèle, les tests de transport et **Envoyer le résumé maintenant** fonctionnent toujours

**Envoyer le résumé maintenant** est une livraison supplémentaire. Il ne consomme pas la prochaine occurrence planifiée.

## Modèles {#templates}

Modifiez les modèles d'e-mail de résumé quotidien (Markdown) et NTFY compacts sous [Paramètres → Modèles](/user-guide/settings/notification-templates). Les corps d'e-mail pour Succès, Avertissement/Erreur, En retard et Résumé quotidien utilisent tous Markdown.

**Générer l'aperçu** sur cette page ouvre une boîte de dialogue avec l'instantané actuel. L'email HTML suit le thème clair ou sombre actuel.
