# Résumé quotidien {/* #daily-summary */}

Le Résumé quotidien est un mode de notification optionnel qui envoie **un** instantané localisé de chaque tâche de sauvegarde connue à une heure locale exacte. Lorsqu'il est activé, les e-mails de sauvegarde et les alertes en retard à l'adresse e-mail par défaut (Paramètres → E-mail → E-mail du destinataire) sont suspendus. Les destinations e-mail supplémentaires configurées dans [Notifications de sauvegarde](backup-notifications-settings.md) continuent de recevoir les événements correspondants. Les notifications NTFY par tâche continuent. Ces paramètres restent stockés et deviennent actifs à nouveau dès que le Résumé quotidien est désactivé.

L'instantané est l'**état actuel** au moment de l'envoi (le dernier résultat pour chaque tâche). Il ne s'agit pas d'un historique des exécutions de la journée précédente.

![Paramètres du résumé quotidien](../../assets/screen-settings-daily-summary.png)

## Exigences {/* #requirements */}

- Le SMTP doit être configuré. L'e-mail est envoyé une fois, à l'**adresse e-mail de remplacement SMTP** si elle est enregistrée, sinon à l'adresse SMTP du destinataire dans les [Paramètres de messagerie](/user-guide/settings/email-settings).
- Vérifiez votre configuration SMTP et assurez-vous qu'elle fonctionne avant de vous fier au Résumé quotidien.
- La livraison programmée nécessite le service cron. Le dispatcher s'exécute une fois par jour à l'heure d'envoi UTC stockée.

## Ce qui est inclus {/* #what-is-included */}

Les tâches connues sont les **dernières sauvegardes observées** pour chaque serveur et nom de sauvegarde — le même ensemble que le tableau de bord et Paramètres → Surveillance des sauvegardes.

Les catégories de statut (Succès, Avertissement, Erreur, Fatal, Inconnu) sont mutuellement exclusives et s'additionnent au nombre de tâches. **En retard** est compté séparément : une tâche réussie en retard est toujours Succès et aussi en retard.

## Calendrier {/* #schedule */}

Choisissez une heure exacte `HH:mm` dans votre fuseau horaire du **navigateur**. duplistatus stocke le planning en UTC et affiche les deux valeurs sur la page (même modèle que **Duplicati Versions**). Les modifications sur cette page sont enregistrées automatiquement. L'heure d'envoi par défaut pour les nouvelles installations est **01:00 UTC**.

- L'activation ou le changement de l'horaire commence à la **prochaine occurrence future**, jamais une envoi surprise immédiat.
- L'heure programmée envoie toujours lorsque le travail cron est déclenché. **Envoyer le résumé maintenant**, une tentative de réessai, ou un envoi plus tôt le même jour ne le saute pas.

## URL du tableau de bord public {/* #public-dashboard-url */}

L'**URL du tableau de bord public** optionnelle sur cette page alimente le placeholder `{duplistatus_link}` dans les e-mails de Résumé quotidien. Utilisez une URL `http://` ou `https://` sans barre oblique à la fin. Laissez-le vide pour omettre le lien.

Quand `DUPLISTATUS_PUBLIC_URL` est défini dans l'environnement, il remplace le paramètre enregistré (voir [Variables d'environnement](/installation/environment-variables)).

## Remplacer le destinataire SMTP {/* #override-smtp-recipient */}

Le **remplacement du destinataire SMTP** optionnel envoie le Résumé quotidien à une adresse différente de celle des paramètres de messagerie. Laissez-le vide pour continuer à utiliser le destinataire par défaut. La valeur est stockée dans la clé de configuration `daily_summary` (`smtpRecipient`) et est utilisée pour les envois programmés, **Envoyer le résumé maintenant**, et les tentatives de réessai. Les API d'envoi n'acceptent toujours pas de destinataire dans la requête.

## Comportement de remplacement {/* #replacement-behaviour */}

Lorsque le résumé quotidien est activé :

- les e-mails de téléchargement et les alertes en retard à l'adresse e-mail par défaut ne sont pas envoyés
- les destinations e-mail supplémentaires dans les Notifications de sauvegarde continuent de recevoir les événements correspondants (les alertes en retard comptent comme un Avertissement pour ce filtre)
- les notifications NTFY par tâche continuent
- les horodatages en retard ne sont pas avancés lorsque rien n'est envoyé, donc les alertes en retard peuvent reprendre immédiatement lorsque le mode est désactivé
- l'aperçu du modèle, les tests de transport et **Envoyer le résumé maintenant** continuent de fonctionner

**Envoyer le résumé maintenant** est une livraison supplémentaire. Il ne consomme pas la prochaine occurrence planifiée.

Les livraisons planifiées, **Envoyer le résumé maintenant** et les nouvelles tentatives sont enregistrées dans le [journal d'audit](audit-logs-viewer.md) comme `daily_summary_sent` (Opérations système). L'enregistrement des paramètres est `daily_summary_updated` (Configuration).

## Modèles {/* #templates */}

Modifiez le modèle d'e-mail de résumé quotidien (Markdown) sous [Paramètres → Modèles](/user-guide/settings/notification-templates). Les corps des e-mails pour Succès, Avertissement/Erreur, En retard, et Résumé quotidien utilisent tous Markdown. Le modèle par défaut inclut `{duplistatus_link}` à la fin lorsqu'une URL de tableau de bord public est configurée sur cette page ou via `DUPLISTATUS_PUBLIC_URL`.

**Générer l'aperçu** sur cette page ouvre une boîte de dialogue avec l'instantané actuel. L'email HTML suit le thème clair ou sombre actuel.
