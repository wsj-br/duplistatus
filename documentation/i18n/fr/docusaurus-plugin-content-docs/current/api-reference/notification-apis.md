---
translation_last_updated: '2026-04-18T00:01:18.892Z'
source_file_mtime: '2026-03-05T22:33:28.419Z'
source_file_hash: c9fa1157e8f98ef3d8071252f75634990ea86aa2c6de3db3a16b0f911b7a2789
translation_language: fr
source_file_path: documentation/docs/api-reference/notification-apis.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Système de notifications {#notification-system}

## Notification de test - `/api/notifications/test` {#test-notification-apinotificationstest}
- **Endpoint**: `/api/notifications/test`
- **Méthode**: POST
- **Description**: Envoyer des notifications de test (simples, basées sur un modèle ou par e-mail) pour vérifier la configuration des notifications.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Corps de la requête** :
  Pour un test simple :

    ```json
    {
      "type": "simple",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      }
    }
    ```

Pour un test de modèle :

    ```json
    {
      "type": "template",
      "ntfyConfig": {
        "url": "https://ntfy.sh",
        "topic": "test-topic",
        "accessToken": "optional-access-token"
      },
      "template": {
        "title": "Test Title",
        "message": "Test message with {variable}",
        "priority": "default",
        "tags": "test"
      }
    }
    ```

Pour un test d'e-mail :

    ```json
    {
      "type": "email"
    }
    ```

- **Réponse** :
  Pour un test simple :

  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```

Pour un test de modèle :

  ```json
  {
    "success": true,
    "message": "Test notifications sent successfully via NTFY and Email",
    "channels": ["NTFY", "Email"]
  }
  ```

Pour un test d'e-mail :

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

Le contenu de l'e-mail de test affiche :
  - Le nom d'hôte et le port du serveur SMTP
  - Le type de connexion (SMTP standard, STARTTLS ou SSL/TLS direct)
  - Le statut de la demande d'authentification SMTP
  - Le nom d'utilisateur SMTP (affiché uniquement si l'authentification est requise)
  - L'adresse e-mail du destinataire
  - L'adresse d'expédition et le nom de l'expéditeur utilisés pour l'e-mail
  - L'horodatage du test
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : La configuration NTFY est requise, la configuration est invalide ou l'e-mail n'est pas configuré
  - `500` : Échec de l'envoi de la notification de test avec les détails de l'erreur
- **Notes** :
  - Prend en charge les messages de test simples, les notifications basées sur un modèle et les tests d'e-mail
  - Le test de modèle utilise des données d'exemple pour remplacer les variables du modèle
  - Inclut un horodatage dans le message de test
  - Valide l'URL NTFY et le sujet avant l'envoi
  - Utilise le champ `accessToken` pour l'authentification
  - Pour les tests de modèle, envoie des notifications à la fois vers NTFY et par e-mail (si configuré)
  - Les tests d'e-mail nécessitent une configuration SMTP préalablement définie
  - Le point de terminaison d'e-mail de test efface le cache de requête avant de lire la configuration SMTP, garantissant ainsi que les scripts externes peuvent mettre à jour la configuration et que celle-ci soit immédiatement prise en compte dans les e-mails de test

## Vérifier les sauvegardes en retard - `/api/notifications/check-overdue` {#check-overdue-backups-apinotificationscheck-overdue}
- **Endpoint**: `/api/notifications/check-overdue`
- **Méthode**: POST
- **Description**: Déclenche manuellement la vérification des sauvegardes en retard et envoie des notifications.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "message": "Overdue backup check completed",
    "statistics": {
      "totalBackupConfigs": 5,
      "checkedBackups": 5,
      "overdueBackupsFound": 2,
      "notificationsSent": 2
    }
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de la vérification des sauvegardes en retard
- **Notes** :
  - Déclenche manuellement la vérification des sauvegardes en retard
  - Renvoie des statistiques sur le processus de vérification
  - Envoie des notifications pour les sauvegardes en retard détectées

## Effacer les horodatages des sauvegardes en retard - `/api/notifications/clear-overdue-timestamps` {#clear-overdue-timestamps-apinotificationsclear-overdue-timestamps}
- **Endpoint**: `/api/notifications/clear-overdue-timestamps`
- **Méthode**: POST
- **Description**: Efface tous les horodatages des notifications de sauvegardes en retard, permettant ainsi de renvoyer les notifications.
- **Authentification**: Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de l'effacement des horodatages des sauvegardes en retard
- **Notes** :
  - Efface tous les horodatages des notifications de sauvegardes en retard
  - Permet de renvoyer les notifications
  - Utile pour tester le système de notification
