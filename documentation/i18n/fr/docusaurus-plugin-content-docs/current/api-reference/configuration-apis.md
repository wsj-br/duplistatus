---
translation_last_updated: '2026-05-11T14:27:38.577Z'
source_file_mtime: '2026-05-10T21:42:22.919Z'
source_file_hash: 7c4af7564bebe2a0dac1c8dc3c5face4a1ed43b3e9c8faa8357ce5864a58171f
translation_language: fr
source_file_path: documentation/docs/api-reference/configuration-apis.md
translation_models:
  - anthropic/claude-3.5-haiku
  - qwen/qwen3-235b-a22b-2507
---
# Gestion de la configuration {#configuration-management}

## Obtenir la configuration de messagerie - `/api/configuration/email` {#get-email-configuration---apiconfigurationemail}
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
  - `400` : La clé principale est invalide - Tous les mots de passe et paramètres chiffrés doivent être reconfigurés
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la récupération de la configuration du courriel
- **Notes** :
  - Renvoie la configuration sans le mot de passe pour des raisons de sécurité
  - Inclut le champ `hasPassword` pour indiquer si un mot de passe est défini
  - Inclut les champs `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress` et `requireAuth`
  - Indique si les notifications par courriel sont disponibles pour les environnements de test et de production
  - Gère les erreurs de validation de la clé principale de manière robuste

## Mettre à jour la configuration de messagerie - `/api/configuration/email` {#update-email-configuration---apiconfigurationemail}
- **Point de terminaison** : `/api/configuration/email`
- **Méthode** : POST
- **Description** : Met à jour la configuration des notifications par courriel SMTP.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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
  - Le port doit être un nombre valide compris entre 1 et 65535
  - Le champ Secure est un booléen (true pour SSL/TLS)
  - Le mot de passe est géré séparément via le point de terminaison du mot de passe

## Supprimer la configuration de messagerie - `/api/configuration/email` {#delete-email-configuration---apiconfigurationemail}
- **Point de terminaison** : `/api/configuration/email`
- **Méthode** : DELETE
- **Description** : Supprime la configuration des notifications par courriel SMTP.
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
  - Renvoie un code 404 si aucune configuration n'existe à supprimer

## Mettre à jour le mot de passe de messagerie - `/api/configuration/email/password` {#update-email-password---apiconfigurationemailpassword}
- **Point de terminaison** : `/api/configuration/email/password`
- **Méthode** : PATCH
- **Description** : Met à jour le mot de passe de messagerie pour l'authentification SMTP.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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
  - `400` : Le mot de passe doit être une chaîne de caractères ou des champs de configuration requis sont manquants
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `500` : Échec de la mise à jour du mot de passe du courriel
- **Notes** :
  - Le mot de passe peut être une chaîne vide pour effacer le mot de passe
  - Si aucune configuration SMTP n'existe, en crée une minimale à partir de la configuration fournie
  - Le paramètre Config est requis lorsqu'aucune configuration SMTP existante n'est présente
  - Le mot de passe est stocké de manière sécurisée à l'aide du chiffrement

## Obtenir le jeton CSRF du mot de passe de messagerie - `/api/configuration/email/password` {#get-email-password-csrf-token---apiconfigurationemailpassword}
- **Point de terminaison** : `/api/configuration/email/password`
- **Méthode** : GET
- **Description** : Récupère un jeton CSRF pour les opérations liées au mot de passe de messagerie.
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
- **Notes** :
  - Renvoie un jeton CSRF à utiliser avec les opérations de mise à jour du mot de passe
  - La session doit être valide pour générer le jeton

## Obtenir la configuration unifiée - `/api/configuration/unified` {#get-unified-configuration---apiconfigurationunified}
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
  - `500` : Erreur du serveur lors de la récupération de la configuration unifiée
- **Notes** :
  - Renvoie toutes les données de configuration dans une seule réponse
  - Inclut les paramètres cron, la fréquence des notifications et les serveurs avec sauvegardes
  - La configuration e-mail inclut le champ `hasPassword` mais pas le mot de passe réel
  - Récupère toutes les données en parallèle pour de meilleures performances

## Obtenir la configuration NTFY - `/api/configuration/ntfy` {#get-ntfy-configuration---apiconfigurationntfy}
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
  - Renvoie les paramètres de configuration NTFY actuels
  - Utilisé pour la gestion du système de notification
  - Nécessite une authentification pour accéder aux données de configuration

## Obtenir la configuration des notifications - `/api/configuration/notifications` {#get-notification-configuration---apiconfigurationnotifications}
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

## Mettre à jour la configuration des notifications - `/api/configuration/notifications` {#update-notification-configuration---apiconfigurationnotifications}
- **Point de terminaison** : `/api/configuration/notifications`
- **Méthode** : POST
- **Description** : Met à jour la configuration des notifications (paramètres NTFY ou fréquence des notifications).
- **Authentification** : Nécessite une session valide et un jeton CSRF
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

Pour la fréquence des notifications :

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

Pour la fréquence des notifications :

  ```json
  {
    "value": "every_week"
  }
  ```

- **Valeurs disponibles** : `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : La configuration NTFY est requise ou la valeur est invalide
  - `500` : Erreur du serveur lors de la mise à jour de la configuration des notifications
- **Notes** :
  - Prend en charge les mises à jour de la configuration NTFY et de la fréquence des notifications
  - Met à jour uniquement la configuration NTFY lorsque le champ ntfy est fourni
  - Met à jour la fréquence des notifications lorsque le champ value est fourni
  - Génère un sujet par défaut s'il n'est pas fourni
  - Conserve les paramètres de configuration existants
  - Utilise le champ `accessToken` au lieu de champs séparés pour nom d'utilisateur et mot de passe
  - Valide la valeur de fréquence des notifications par rapport aux options autorisées
  - Affecte la fréquence d'envoi des notifications en retard

## Mettre à jour les paramètres de sauvegarde - `/api/configuration/backup-settings` {#update-backup-settings---apiconfigurationbackup-settings}
- **Point de terminaison** : `/api/configuration/backup-settings`
- **Méthode** : POST
- **Description** : Met à jour les paramètres de notification de sauvegarde pour des serveurs/sauvegardes spécifiques.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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
  - `500` : Erreur du serveur lors de la mise à jour des paramètres de sauvegarde
- **Notes** :
  - Met à jour les paramètres de notification de sauvegarde pour des serveurs/sauvegardes spécifiques
  - Nettoie les notifications de sauvegarde en retard pour les sauvegardes désactivées
  - Efface les notifications lorsque les paramètres de temporisation changent

## Mettre à jour les modèles de notification - `/api/configuration/templates` {#update-notification-templates---apiconfigurationtemplates}
- **Point de terminaison** : `/api/configuration/templates`
- **Méthode** : POST
- **Description** : Met à jour les modèles de notification.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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
  - `500` : Erreur du serveur lors de la mise à jour des modèles de notification
- **Notes** :
  - Met à jour les modèles de notification pour différents statuts de sauvegarde
  - Conserve les paramètres de configuration existants
  - Les modèles prennent en charge la substitution de variables

## Obtenir la tolérance pour les retards - `/api/configuration/overdue-tolerance` {#get-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Point de terminaison** : `/api/configuration/overdue-tolerance`
- **Méthode** : GET
- **Description** : Récupère le paramètre actuel de tolérance pour les retards.
- **Réponse** :

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de l'obtention de la tolérance en retard
- **Notes** :
  - Renvoie le paramètre actuel de tolérance en retard
  - Utilisé pour afficher la configuration actuelle

## Mettre à jour la tolérance pour les retards - `/api/configuration/overdue-tolerance` {#update-overdue-tolerance---apiconfigurationoverdue-tolerance}
- **Point de terminaison** : `/api/configuration/overdue-tolerance`
- **Méthode** : POST
- **Description** : Met à jour le paramètre de tolérance pour les retards.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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
- **Notes**:
  - Met à jour le paramètre de tolérance de retard (accepte le format de chaîne comme `"1h"`, `"2h"`, etc. ; par défaut pour les nouvelles installations : `2h`)
  - Affecte quand les sauvegardes sont considérées comme étant en retard
  - Utilisé par le vérificateur de sauvegarde en retard
