# Système de notification {/* #notification-system */}

## Tester la notification - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Endpoint** : `/api/notifications/test`
- **Méthode** : POST
- **Description** : Envoyer des notifications de test (simples, basées sur un modèle ou par e-mail) pour vérifier la configuration des notifications.
- **Authentification** : nécessite une session d'administrateur et un jeton CSRF
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

Pour un test par e-mail :

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

Pour un test par e-mail :

  ```json
  {
    "message": "Test email sent successfully"
  }
  ```

Le contenu de l'e-mail de test affiche :
  - Le nom d'hôte du serveur SMTP et le port
  - Le type de connexion (SMTP simple, STARTTLS ou SSL/TLS direct)
  - L'état de l'exigence d'authentification SMTP
  - Le nom d'utilisateur SMTP (affiché uniquement quand l'authentification est requise)
  - L'adresse e-mail du destinataire
  - L'adresse d'expéditeur et le nom de l'expéditeur utilisés pour l'e-mail
  - L'horodatage du test
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF non valide
  - `400` : La configuration NTFY est requise, configuration non valide ou e-mail non configuré
  - `500` : Échec de l'envoi de la notification de test avec les détails de l'erreur
- **Remarques** :
  - Prend en charge les messages de test simples, les notifications basées sur un modèle et les tests par e-mail
  - Le test de modèle utilise des données d'exemple pour remplacer les variables de modèle
  - Inclut l'horodatage dans le message de test
  - Les tests NTFY utilisent la configuration NTFY enregistrée ; une URL NTFY fournie par le client n'est pas utilisée
  - Utilise le champ `accessToken` pour l'authentification lorsqu'il est enregistré
  - Pour les tests de modèle, envoie des notifications à la fois à NTFY et par e-mail (si configuré)
  - Les tests par e-mail nécessitent la configuration de SMTP
  - L'endpoint d'e-mail de test vide le cache de requêtes avant de lire la configuration SMTP, garantissant ainsi que les scripts externes peuvent mettre à jour la configuration et que celle-ci soit immédiatement prise en compte dans les e-mails de test
  - Les tests de modèle et l'envoi immédiat de Résumé quotidien contournent la suppression par sauvegarde

## Aperçu du modèle de notification - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Endpoint** : `/api/notifications/preview`
- **Méthode** : POST
- **Description** : Restitue un modèle de notification avec le moteur de rendu Markdown de production sans l'envoyer. Le corps inclut `kind` (`success`, `warning`, `overdueBackup` ou `dailySummaryEmail`) et le modèle en cours d'édition. Les aperçus de Résumé quotidien utilisent l'instantané réel actuel ; les autres types utilisent des valeurs d'exemple déterministes. L'Email HTML est destiné à une iframe en bac à sable (sandbox). Succès, Avertissement/Erreur et En retard renvoient également la charge utile NTFY (`ntfyMessage`) ; tout en-tête de tableau GFM est omis et les lignes du corps sont en texte brut.
- **Authentification** : Requiert une session valide et un jeton CSRF

## Vérifier les sauvegardes en retard - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Endpoint** : `/api/notifications/check-overdue`
- **Méthode** : POST
- **Description** : Déclenche manuellement la vérification des sauvegardes en retard et envoie des notifications.
- **Authentification** : Nécessite une session valide et un jeton CSRF
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
  - Retourne les statistiques sur le processus de vérification
  - Envoie des notifications pour les sauvegardes en retard trouvées

## Effacer les horodatages des retards - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Endpoint** : `/api/notifications/clear-overdue-timestamps`
- **Méthode** : POST
- **Description** : Efface tous les horodatages de notification de sauvegarde en retard, permettant d'envoyer à nouveau des notifications.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de l'effacement des horodatages des sauvegardes en retard
- **Notes** :
  - Efface tous les horodatages de notification des sauvegardes en retard
  - Permet l'envoi à nouveau des notifications
  - Utile pour tester le système de notification
