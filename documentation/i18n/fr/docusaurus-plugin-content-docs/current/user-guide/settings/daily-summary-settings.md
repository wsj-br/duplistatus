# Résumé quotidien {#daily-summary}

Le Résumé quotidien est un mode de notification facultatif qui envoie **un** instantané localisé de chaque tâche de sauvegarde connue à une heure locale exacte. Tant qu'il est activé, les messages de sauvegarde individuels et les messages **E-mail** en retard sont suspendus, y compris les destinations E-mail supplémentaires par tâche. Les Notifications NTFY par tâche continuent. Ces paramètres restent stockés et redeviennent actifs dès que le Résumé quotidien est désactivé.

L'instantané est l'**état actuel** au moment de l'envoi (le dernier résultat pour chaque tâche). Il ne s'agit pas d'un historique des exécutions de la journée précédente.

![Paramètres du résumé quotidien](../../assets/screen-settings-left-panel-admin.png)

## Exigences {#requirements}

- Le SMTP doit être configuré. L'E-mail est toujours envoyé une fois au Destinataire SMTP.
- La livraison programmée nécessite le service cron. Le répartiteur vérifie chaque minute en UTC lorsqu'il est en cours d'exécution.

## Ce qui est inclus {#what-is-included}

Les tâches connues sont l'union de :

- la dernière sauvegarde observée pour chaque serveur et nom de sauvegarde
- les paramètres par tâche explicites dont le serveur existe toujours

Une tâche configurée qui n'a jamais envoyé de rapport est étiquetée **Aucun rapport reçu**. Les catégories d'état (Succès, Avertissement, Erreur, Fatal, Inconnu, Aucun rapport reçu) sont mutuellement exclusives et s'ajoutent au nombre de tâches. **En retard** est compté séparément : une tâche réussie en retard est toujours Succès et également en retard.

## Planification {#schedule}

Choisissez un `HH:mm` moment exact dans votre **fuseau horaire de navigateur**. duplistatus stocke le calendrier en UTC et affiche les deux valeurs sur la page (même modèle que **Versions de Duplicati**). Les modifications sur cette page sont enregistrées automatiquement.

- L'activation ou la modification de la planification commence à la **prochaine occurrence future**, jamais un envoi surprise immédiat.
- Le redémarrage plus tard le même jour local rattrape toujours après l'heure configurée.
- Les jours complètement manqués plus tôt ne sont pas rejoués.
- Les heures manquantes en avance de printemps s'exécutent à la première minute valide après l'écart. Les heures répétées en automne s'exécutent une fois.

## URL du tableau de bord public {#public-dashboard-url}

L'**URL du tableau de bord public** optionnelle sur cette page alimente le placeholder `{duplistatus_link}` dans les e-mails de Résumé quotidien. Utilisez une URL `http://` ou `https://` sans barre oblique à la fin. Laissez-le vide pour omettre le lien.

Quand `DUPLISTATUS_PUBLIC_URL` est défini dans l'environnement, il remplace le paramètre enregistré (voir [Variables d'environnement](/installation/environment-variables)).

## Comportement de remplacement {#replacement-behaviour}

Lorsque le résumé quotidien est activé :

- les e-mails de téléchargement et d'en retard ne sont pas envoyés
- les notifications NTFY par tâche continuent
- les horodatages en retard ne sont pas avancés, donc les alertes en retard peuvent reprendre immédiatement lorsque le mode est désactivé
- l'aperçu du modèle, les tests de transport et **Envoyer le résumé maintenant** fonctionnent toujours

**Envoyer le résumé maintenant** est une livraison supplémentaire. Il ne consomme pas la prochaine occurrence planifiée.

## Modèles {#templates}

Modifiez le modèle d'e-mail de résumé quotidien (Markdown) sous [Paramètres → Modèles](/user-guide/settings/notification-templates). Les corps des e-mails pour Succès, Avertissement/Erreur, En retard, et Résumé quotidien utilisent tous Markdown. Le modèle par défaut inclut `{duplistatus_link}` à la fin lorsqu'une URL de tableau de bord public est configurée sur cette page ou via `DUPLISTATUS_PUBLIC_URL`.

**Générer l'aperçu** sur cette page ouvre une boîte de dialogue avec l'instantané actuel. L'email HTML suit le thème clair ou sombre actuel.
