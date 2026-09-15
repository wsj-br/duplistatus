# Résumé quotidien {/* #daily-summary */}

Le Résumé quotidien est un mode de notification optionnel qui envoie **un** instantané localisé de chaque tâche de sauvegarde connue à une heure exacte locale. Lorsqu'il est activé, les e-mails de sauvegarde et les e-mails en retard pour le destinataire E-mail par défaut (Paramètres → E-mail → E-mail du destinataire) sont mis en pause. Les destinations e-mail supplémentaires configurées dans [Notifications de sauvegarde](backup-notifications-settings.md) continuent de recevoir les événements correspondants. Les notifications NTFY par tâche continuent. Ces paramètres restent stockés et deviennent actifs à nouveau dès que le Résumé quotidien est désactivé.

L'instantané est le statut **actuel** au moment de l'envoi (le dernier résultat pour chaque tâche). Il ne s'agit pas d'un historique des exécutions de la journée précédente.

![Paramètres du Résumé quotidien](../../assets/screen-settings-daily-summary.png)

## Exigences {/* #requirements */}

- SMTP doit être configuré. L'e-mail est envoyé une fois, au **Destinataire SMTP de remplacement** si un est enregistré, sinon au destinataire SMTP des [Paramètres de messagerie](/user-guide/settings/email-settings).
- Vérifiez votre configuration SMTP et assurez-vous qu'elle fonctionne avant de vous fier au Résumé quotidien.
- La livraison programmée nécessite le service cron. Le dispatcher s'exécute une fois par jour à l'heure UTC de l'envoi stockée.

## Ce qui est inclus {/* #what-is-included */}

Les tâches connues sont les **dernières sauvegardes observées** pour chaque serveur et nom de sauvegarde — le même ensemble que le tableau de bord et Paramètres → Surveillance des sauvegardes.

Les catégories de statut (Succès, Avertissement, Erreur, Fatal, Inconnu) sont mutuellement exclusives et s'additionnent au nombre de tâches. **En retard** est compté séparément : une tâche réussie en retard est toujours Succès et aussi en retard.

## Planification {/* #schedule */}

Choisissez une heure exacte `HH:mm` dans votre fuseau horaire du **navigateur**. duplistatus stocke la planification en UTC et affiche les deux valeurs sur la page (même modèle que **Versions de Duplicati**). Les modifications sur cette page sont enregistrées automatiquement. L'heure d'envoi par défaut pour les nouvelles installations est **01:00 UTC**.

- L'activation ou le changement de la planification commence à la **prochaine occurrence future**, jamais un envoi surprise immédiat.
- L'heure programmée s'envoie toujours lorsque le travail cron s'exécute. **Envoyer le résumé maintenant**, une tentative de réessai, ou un envoi plus tôt le même jour ne le saute pas.

## URL du tableau de bord public {/* #public-dashboard-url */}

L'**URL du tableau de bord public** facultatif sur cette page alimente le `{duplistatus_link}` espace réservé dans les e-mails de Résumé quotidien. Utilisez une `http://` ou `https://` URL sans barre oblique finale. Laissez-le vide pour omettre le lien.

Lorsque `DUPLISTATUS_PUBLIC_URL` est défini dans l'environnement, il remplace le paramètre enregistré (voir [Variables d'environnement](/installation/environment-variables)).

## Remplacement du destinataire SMTP {/* #override-smtp-recipient */}

Le **Destinataire SMTP de remplacement** optionnel envoie le Résumé quotidien à une adresse différente de celle des paramètres E-mail. Laissez-le vide pour continuer à utiliser le destinataire par défaut. La valeur est stockée dans la clé de configuration `daily_summary` (`smtpRecipient`) et est utilisée pour les envois programmés, **Envoyer le résumé maintenant**, et les tentatives de réessai. Les API d'envoi n'acceptent toujours pas de destinataire dans la requête.

## Comportement de remplacement {/* #replacement-behaviour */}

Lorsque le Résumé quotidien est activé :

- les e-mails de téléchargement et les e-mails en retard pour le destinataire E-mail par défaut ne sont pas envoyés
- les destinations e-mail supplémentaires dans Notifications de sauvegarde continuent de recevoir les événements correspondants (en retard est compté comme un Avertissement pour ce filtre)
- les notifications NTFY par tâche continuent
- les horodatages en retard ne sont pas avancés lorsque rien n'a été envoyé, donc les alertes en retard peuvent reprendre immédiatement lorsque le mode est désactivé
- l'aperçu du modèle, les tests de transport et **Envoyer le résumé maintenant** fonctionnent toujours

**Envoyer le résumé maintenant** est une livraison supplémentaire. Il ne consomme pas la prochaine occurrence programmée.

Les livraisons programmées, **Envoyer le résumé maintenant** et les nouvelles tentatives sont enregistrées dans le [journal d'audit](audit-logs-viewer.md) en tant que `daily_summary_sent` (Opérations système). L'enregistrement des paramètres est `daily_summary_updated` (Configuration).

## Modèles {/* #templates */}

Modifiez le modèle d'e-mail de résumé quotidien (Markdown) sous [Paramètres → Modèles](/user-guide/settings/notification-templates). Le sujet par défaut inclut `{summary_date}` ainsi que les comptes de Succès, Avertissement, En retard, Erreur et Fatal afin que la ligne de la boîte de réception résume l'instantané. En retard peut chevaucher les comptes d'état. Les corps d'e-mail pour Succès, Avertissement/Erreur, En retard et Résumé quotidien utilisent tous Markdown. Le modèle par défaut inclut `{duplistatus_link}` à la fin lorsqu'une URL de tableau de bord public est configurée sur cette page ou via `DUPLISTATUS_PUBLIC_URL`.

**Générer un aperçu** sur cette page ouvre la même boîte de dialogue d'aperçu que [Paramètres → Modèles](/user-guide/settings/notification-templates): sujet de l'e-mail plus Email HTML et texte brut. L'HTML de l'e-mail suit le thème clair ou sombre actuel.
