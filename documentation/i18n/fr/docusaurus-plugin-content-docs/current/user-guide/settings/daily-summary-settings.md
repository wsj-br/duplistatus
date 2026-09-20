# Résumé quotidien {/* #daily-summary */}

Le résumé quotidien est un mode de notification facultatif qui envoie **un** instantané localisé de chaque tâche de sauvegarde connue à une heure locale précise. Lorsqu'il est activé, les e-mails de sauvegarde et les e-mails en retard sont suspendus pour le destinataire par défaut (Paramètres → E-mail → E-mail du destinataire). Les destinations de messagerie supplémentaires configurées dans [Notifications de sauvegarde](backup-notifications-settings.md) continuent de recevoir les événements correspondants. Les notifications NTFY par tâche continuent. Ces paramètres restent stockés et deviennent actifs à nouveau dès que le résumé quotidien est désactivé.

L'instantané est le statut **actuel** au moment de l'envoi (le dernier résultat pour chaque tâche). Ce n'est pas un historique des exécutions de la veille.

![Paramètres du résumé quotidien](../../assets/screen-settings-daily-summary.png)

## Exigences {/* #requirements */}

- SMTP doit être configuré. Le courrier électronique est envoyé une fois, au **remplacement du destinataire SMTP** s'il est enregistré, sinon au destinataire SMTP provenant des [paramètres de messagerie](/user-guide/settings/email-settings).
- Vérifiez votre configuration SMTP et assurez-vous qu'elle fonctionne avant de vous fier au résumé quotidien.
- La livraison planifiée nécessite le service cron. L'expéditeur s'exécute une fois par jour à l'heure d'envoi UTC enregistrée.

## Ce qui est inclus {/* #what-is-included */}

Les tâches connues correspondent à la **dernière sauvegarde observée** pour chaque serveur et nom de sauvegarde — le même ensemble que le tableau de bord et Paramètres → Surveillance des sauvegardes.

Les catégories de statut (Succès, Avertissement, Erreur, Fatal, Inconnu) sont mutuellement exclusives et s'additionnent pour former le nombre total de tâches. **En retard** est compté séparément : une tâche en retard qui réussit est toujours considérée comme un succès mais aussi comme en retard.

## Planification {/* #schedule */}

Choisissez une heure `HH:mm` exacte dans votre **fuseau horaire navigateur**. duplistatus enregistre la planification en UTC et affiche les deux valeurs sur la page (même modèle que **Versions de Duplicati**). Les modifications apportées à cette page sont enregistrées automatiquement. L'heure d'envoi par défaut pour les nouvelles installations est **01:00 UTC**.

- L'activation ou la modification de la planification commence à la prochaine occurrence **future**, jamais un envoi immédiat.
- L'heure programmée envoie toujours lorsque la tâche cron s'exécute. **Envoyer le résumé maintenant**, une nouvelle tentative ou un envoi plus tôt le même jour ne la saute pas.

## URL du tableau de bord public {/* #public-dashboard-url */}

L'**URL du tableau de bord public** facultative sur cette page alimente l'espace réservé `{duplistatus_link}` dans les e-mails de résumé quotidien. Utilisez une URL `http://` ou `https://` sans barre oblique finale. Laissez vide pour omettre le lien.

Lorsque `DUPLISTATUS_PUBLIC_URL` est défini dans l'environnement, il remplace le paramètre enregistré (voir [Variables d'environnement](/installation/environment-variables)).

## Remplacer le destinataire SMTP {/* #override-smtp-recipient */}

Le **remplacement du destinataire SMTP** facultatif envoie le résumé quotidien à une adresse différente de celle du destinataire dans les paramètres de messagerie. Laissez vide pour continuer à utiliser celui par défaut. La valeur est stockée dans la clé de configuration `daily_summary` (`smtpRecipient`) et est utilisée pour les envois planifiés, **Envoyer le résumé maintenant** et les tentatives ultérieures. Les API d'envoi n'acceptent toujours pas de destinataire dans la requête.

## Comportement de remplacement {/* #replacement-behaviour */}

Lorsque le résumé quotidien est activé :

- les e-mails de téléchargement et les e-mails en retard ne sont pas envoyés au destinataire par défaut
- les destinations de messagerie supplémentaires dans les notifications de sauvegarde continuent de recevoir les événements correspondants (les retards sont comptabilisés comme des avertissements pour ce filtre)
- les notifications NTFY par tâche continuent
- les horodatages des retards ne sont pas mis à jour lorsqu'aucun envoi n'a eu lieu, donc les alertes de retard peuvent reprendre immédiatement lorsque le mode est désactivé
- l'aperçu du modèle, les tests de transport et **Envoyer le résumé maintenant** fonctionnent toujours

**Envoyer le résumé maintenant** est une livraison supplémentaire. Cela n'utilise pas la prochaine occurrence planifiée.

Les livraisons planifiées, **Envoyer le résumé maintenant** et les tentatives de livraison sont enregistrées dans le [journal d'audit](audit-logs-viewer.md) en tant que `daily_summary_sent` (Opérations système). L'enregistrement des paramètres est `daily_summary_updated` (Configuration).

## Modèles {/* #templates */}

Modifiez le modèle d'e-mail de résumé quotidien (Markdown) dans [Paramètres → Modèles](/user-guide/settings/notification-templates). Le sujet par défaut inclut `{summary_date}` ainsi que les nombres de Succès, Avertissement, En retard, Erreur et Fatal afin que la ligne de réception résume l'instantané. Les tâches en retard peuvent chevaucher les décomptes de statut. Les corps d'e-mails pour Succès, Avertissement/Erreur, En retard et Résumé quotidien utilisent tous Markdown. Le modèle par défaut inclut `{duplistatus_link}` à la fin lorsqu'une URL de tableau de bord public est configurée sur cette page ou via `DUPLISTATUS_PUBLIC_URL`.

**Générer un aperçu** sur cette page ouvre la même boîte de dialogue d'aperçu que [Paramètres → Modèles](/user-guide/settings/notification-templates) : objet de l'e-mail plus e-mail HTML et texte brut. L'e-mail HTML suit le thème clair ou sombre actuel.
