# Gestion de la configuration {/* #configuration-management */}

## Obtenir la configuration d'e-mail - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **Point de terminaison** : `/api/configuration/email`
- **Méthode** : GET
- **Description** : Récupère la configuration actuelle des notifications par courriel et indique si les notifications par courriel sont activées/configurées.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** (configuré) :

  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "message": "Email is configured and ready to use."
  }
  ```

- **Réponse** (non configuré) :

  ```json
  {
    "configured": false,
    "config": null,
    "message": "Email is not configured. Please configure SMTP settings."
  }
  ```

- **Réponses d'erreur** :
  - `400` : La clé maître est invalide - Tous les mots de passe chiffrés et paramètres doivent être reconfigurés
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de l'obtention de la configuration e-mail
- **Notes** :
  - Retourne la configuration sans le mot de passe pour des raisons de sécurité
  - Inclut le champ `hasPassword` pour indiquer si un mot de passe est défini
  - Inclut les champs `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` et `requireAuth`
  - Indique si les notifications par e-mail sont disponibles pour les tests et l'utilisation en production
  - Gère correctement les erreurs de validation de la clé maître

## Mettre à jour la configuration d'e-mail - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **Point de terminaison** : `/api/configuration/email`
- **Méthode** : POST
- **Description** : Met à jour la configuration de notification par courriel SMTP.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "username": "user@example.com",
    "password": "password",
    "mailto": "admin@example.com"
  }
  ```

- **Réponse** :

  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Champs requis manquants ou numéro de port invalide
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de l'enregistrement de la configuration SMTP
- **Notes** :
  - Tous les champs (hôte, port, nom d'utilisateur, mot de passe, destinataire) sont obligatoires
  - Le port doit être un nombre valide entre 1 et 65535
  - Le champ sécurisé est booléen (vrai pour SSL/TLS)
  - Le mot de passe est géré séparément via le point de terminaison du mot de passe

## Supprimer la configuration d'e-mail - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **Point de terminaison** : `/api/configuration/email`
- **Méthode** : DELETE
- **Description** : Supprime la configuration de notification par courriel SMTP.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `404` : Aucune configuration SMTP trouvée à supprimer
  - `500` : Échec de la suppression de la configuration SMTP
- **Notes** :
  - Cette opération supprime définitivement la configuration SMTP
  - Renvoie 404 si aucune configuration existante n'est disponible pour suppression
  - Renvoie 400 lorsque le mode Résumé quotidien est activé, car ce mode nécessite SMTP

## Mettre à jour le mot de passe d'e-mail - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **Point de terminaison** : `/api/configuration/email/password`
- **Méthode** : PATCH
- **Description** : Met à jour le mot de passe d'e-mail pour l'authentification SMTP.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "password": "new-password",
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com"
    }
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Email password updated successfully"
  }
  ```

- **Réponses d'erreur** :
  - `400` : Le mot de passe doit être une chaîne ou des champs de configuration requis sont manquants
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la mise à jour du mot de passe e-mail
- **Notes** :
  - Le mot de passe peut être une chaîne vide pour effacer le mot de passe
  - Si aucune configuration SMTP n'existe, crée une configuration minimale à partir de la configuration fournie
  - Le paramètre de configuration est requis lorsqu'aucune configuration SMTP existante n'existe
  - Le mot de passe est stocké en toute sécurité à l'aide du chiffrement

## Obtenir le jeton CSRF du mot de passe e-mail - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
- **Point de terminaison** : `/api/configuration/email/password`
- **Méthode** : GET
- **Description** : Récupère un jeton CSRF pour les opérations liées au mot de passe de l'e-mail.
- **Authentification** : Nécessite une session valide
- **Réponse** :

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Session invalide ou expirée
  - `500` : Échec de la génération du jeton CSRF
- **Remarques** :
  - Retourne le jeton CSRF à utiliser avec les opérations de mise à jour du mot de passe
  - La session doit être valide pour générer le jeton

## Obtenir la configuration unifiée - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **Point de terminaison** : `/api/configuration/unified`
- **Méthode** : GET
- **Description** : Récupère un objet de configuration unifié contenant toutes les données de configuration, y compris les paramètres cron, la fréquence des notifications et les serveurs avec sauvegardes.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en-GB",
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {server_name}",
        "message": "The backup {backup_name} is overdue on {server_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      },
      "dailySummary": {
        "email": {
          "title": "Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal",
          "message": "## Daily backup summary"
        }
      }
    },
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "overdue_tolerance": "2h",
    "backup_settings": {
      "server1:backup1": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours",
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    },
    "serverAddresses": [
      {
        "id": "server1",
        "name": "Server 1",
        "server_url": "http://localhost:8200"
      }
    ],
    "cronConfig": {
      "cronExpression": "*/20 * * * *",
      "enabled": true
    },
    "notificationFrequency": "every_day",
    "serversWithBackups": [
      {
        "id": "server1",
        "name": "Server 1",
        "backupName": "backup1",
        "server_url": "http://localhost:8200",
        "alias": "My Server",
        "note": "Primary backup server",
        "hasPassword": true,
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    ]
  }
  ```

- **Réponses d'erreur** :
  - `500` : Erreur serveur lors de la récupération de la configuration unifiée
- **Notes** :
  - Renvoie toutes les données de configuration dans une seule réponse
  - Inclut les paramètres cron, la fréquence des notifications et les serveurs avec sauvegardes
  - La configuration e-mail inclut le champ `hasPassword` mais pas le mot de passe réel
  - Récupère toutes les données en parallèle pour de meilleures performances

## Obtenir la configuration NTFY - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **Point de terminaison** : `/api/configuration/ntfy`
- **Méthode** : GET
- **Description** : Récupère les paramètres de configuration NTFY actuels.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la récupération de la configuration NTFY
- **Notes** :
  - Renvoie les paramètres actuels de configuration NTFY
  - Utilisé pour la gestion du système de notification
  - Nécessite une authentification pour accéder aux données de configuration

## Obtenir la configuration des notifications - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **Point de terminaison** : `/api/configuration/notifications`
- **Méthode** : GET
- **Description** : Récupère la configuration actuelle de la fréquence des notifications.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "value": "every_day"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la récupération de la configuration
- **Notes** :
  - Récupère la configuration actuelle de la fréquence des notifications
  - Utilisé pour la gestion des notifications de sauvegarde en retard
  - Renvoie l'une des valeurs suivantes : `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## Mettre à jour la configuration des notifications - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **Point de terminaison** : `/api/configuration/notifications`
- **Méthode** : POST
- **Description** : Met à jour la configuration des notifications (paramètres NTFY ou fréquence des notifications).
- **Authentification** : nécessite une session et un jeton CSRF valides
- **Corps de la requête** :
  Pour la configuration NTFY :

  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Pour la fréquence de notification :

  ```json
  {
    "value": "every_week"
  }
  ```

- **Réponse** :
  Pour la configuration NTFY :

  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

Pour la fréquence de notification :

  ```json
  {
    "value": "every_week"
  }
  ```

- **Valeurs disponibles** : `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : La configuration NTFY est requise ou valeur invalide
  - `500` : Erreur serveur lors de la mise à jour de la configuration de notification
- **Notes** :
  - Prend en charge la mise à jour de la configuration NTFY et de la fréquence des notifications
  - Met à jour uniquement la configuration NTFY lorsque le champ ntfy est fourni
  - Met à jour la fréquence des notifications lorsque le champ valeur est fourni
  - Génère un sujet par défaut si aucun n'est fourni
  - Préserve les paramètres de configuration existants
  - Utilise le champ `accessToken` au lieu des champs séparés nom d'utilisateur/mot de passe
  - Valide la valeur de fréquence de notification par rapport aux options autorisées
  - Affecte la fréquence d'envoi des notifications en retard

## Mettre à jour les paramètres de sauvegarde - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **Endpoint** : `/api/configuration/backup-settings`
- **Méthode** : POST
- **Description** : Met à jour les paramètres de notifications de sauvegarde pour des serveurs/sauvegardes spécifiques.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    }
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : backupSettings est requis
  - `500` : Erreur serveur lors de la mise à jour des paramètres de sauvegarde
- **Notes** :
  - Met à jour les paramètres de notification de sauvegarde pour des serveurs/sauvegardes spécifiques
  - Nettoie les notifications de sauvegarde en retard pour les sauvegardes désactivées
  - Efface les notifications lorsque les paramètres de délai d'attente changent

## Mettre à jour les modèles de notification - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **Endpoint** : `/api/configuration/templates`
- **Méthode** : POST
- **Description** : Met à jour les modèles de notification.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      }
    }
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : les modèles sont requis
  - `500` : Erreur serveur lors de la mise à jour des modèles de notification
- **Notes** :
  - Met à jour les modèles de notification pour différents statuts de sauvegarde
  - Préserve les paramètres de configuration existants
  - Les modèles prennent en charge les corps d'e-mails Markdown et la substitution `{placeholder}`
  - Un modèle d'e-mail `dailySummary` (sujet et corps Markdown) est requis

## Résumé quotidien - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **Endpoint** : `/api/configuration/daily-summary`
- **Méthode** : GET, POST
- **Description** : Lit ou met à jour le mode Résumé quotidien. GET renvoie les paramètres nettoyés, l'état de santé du répartiteur, la prochaine occurrence et l'état de la livraison des e-mails. POST enregistre `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (fuseau horaire IANA du navigateur depuis le dernier enregistrement), `publicUrl` facultatif et `smtpRecipient` facultatif (laisser vide utilise le destinataire SMTP des paramètres de messagerie). L'activation nécessite un SMTP valide. La modification de `utcTime` met à jour `daily-summary-dispatch` à `minute hour * * *` UTC et recharge le service cron. La modification de la planification définit la prochaine occurrence **future**.
- **Authentification** : GET nécessite une session valide et un jeton CSRF. POST nécessite une session administrateur et un jeton CSRF.
- **Réponses d'erreur** :
  - `400` : Heure ou fuseau horaire invalide, URL publique invalide, destinataire SMTP invalide ou SMTP manquant
  - `401` : Non autorisé
  - `500` : Échec de lecture ou de mise à jour du résumé quotidien

## Envoyer le Résumé quotidien - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **Point de terminaison** : `/api/configuration/daily-summary/send`
- **Méthode** : POST
- **Description** : Envoie immédiatement un instantané supplémentaire de l'état actuel. Ne consomme pas la prochaine occurrence planifiée. Utilise le SMTP stocké. Envoie à `daily_summary.smtpRecipient` lorsqu'il est défini, sinon au destinataire des Paramètres de messagerie. N'accepte pas d'adresses de destinataire dans la requête. Enregistre `daily_summary_sent` dans le Journal d'audit (système).
- **Authentification** : Requiert une session d'administrateur et un jeton CSRF

## Réessayer le Résumé quotidien - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **Point de terminaison** : `/api/configuration/daily-summary/retry`
- **Méthode** : POST
- **Description** : Réessaie les canaux en échec à partir de la charge utile persistée. Corps facultatif `{ "occurrenceKey": "..." }` ; sinon, réessaie la dernière remise d'e-mail ayant échoué.
- **Authentification** : Requiert une session d'administrateur et un jeton CSRF

## Aperçu du Résumé quotidien - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **Point de terminaison** : `/api/configuration/daily-summary/preview`
- **Méthode** : POST
- **Description** : Génère le rendu de l'instantané actuel sans l'envoyer et sans écrire de lignes dans le registre de remise.
- **Authentification** : Requiert une session valide et un jeton CSRF

## Obtenir la tolérance de retard - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Point de terminaison** : `/api/configuration/overdue-tolerance`
- **Méthode** : GET
- **Description** : Récupère le paramètre actuel de tolérance de retard.
- **Réponse** :

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de récupération de la tolérance en retard
- **Notes** :
  - Renvoie le paramètre actuel de tolérance en retard
  - Utilisé pour afficher la configuration actuelle

## Mettre à jour la tolérance de retard - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **Point de terminaison** : `/api/configuration/overdue-tolerance`
- **Méthode** : POST
- **Description** : Met à jour le paramètre de tolérance de retard.
- **Authentification** : Requiert une session valide et un jeton CSRF
- **Corps de la requête** :

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Réponse** :

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : overdue_tolerance est requis
  - `500` : Erreur serveur lors de la mise à jour de la tolérance en retard
- **Notes** :
  - Met à jour le paramètre de tolérance en retard (accepte le format chaîne comme `"1h"`, `"2h"`, etc. ; la valeur par défaut pour les nouvelles installations est `2h`)
  - Affecte le moment où les sauvegardes sont considérées comme en retard
  - Utilisé par le vérificateur de sauvegarde en retard

## Sécurité des API externes - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **Point de terminaison** : `/api/configuration/external-api-security`
- **Méthodes** : GET, PATCH
- **Description** : Lit ou met à jour si les API externes requièrent une clé, ainsi que la Taille de `/api/upload` et les limites de débit.
- **Authentification** : Requiert des privilèges d'administrateur, une session valide et un jeton CSRF
- **Corps du PATCH** :

  ```json
  {
    "requireApiKey": false,
    "uploadLimits": {
      "enabled": true,
      "maxBytes": 5242880,
      "perMinute": 20,
      "perHour": 200
    }
  }
  ```

## Liste d'adresses IP autorisées - `/api/configuration/ip-allowlist` {/* #ip-allowlist---apiconfigurationip-allowlist */}
- **Point de terminaison** : `/api/configuration/ip-allowlist`
- **Méthodes** : GET, PATCH
- **Description** : Lit ou met à jour les Proxies de confiance et les listes d'autorisations CIDR pour l'admin et les API externes. L'activation de la liste d'administration échoue à moins que l'adresse IP client actuelle ne figure déjà dans la liste (l'adresse de bouclage est exemptée).
- **Authentification** : nécessite des privilèges admin, une session valide et un jeton CSRF
