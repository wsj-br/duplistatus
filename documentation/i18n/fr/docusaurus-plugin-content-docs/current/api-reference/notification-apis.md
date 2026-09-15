# Système de notifications {/* #notification-system */}

## Tester la notification - `/api/notifications/test` {/* #test-notification---apinotificationstest */}
- **Point de terminaison** : `/api/notifications/test`
- **Méthode** : POST
- **Description** : Envoyer des notifications de test (simples, basées sur des modèles ou par e-mail) pour vérifier la configuration des notifications.
- **Authentification** : Nécessite une session d'administrateur et un jeton CSRF
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
  - Nom d'hôte et port du serveur SMTP
  - Type de connexion (SMTP simple, STARTTLS ou SSL/TLS direct)
  - Statut de l'authentification SMTP
  - Nom d'utilisateur SMTP (affiché uniquement lorsque l'authentification est requise)
  - Adresse e-mail du destinataire
  - Adresse d'expéditeur et nom de l'expéditeur utilisés pour l'e-mail
  - Horodatage du test
- **Réponses d'erreur** :
  - `401` : Non autorisé - Session ou jeton CSRF invalide
  - `400` : Configuration NTFY requise, configuration invalide ou e-mail non configuré
  - `500` : Échec de l'envoi de la notification de test avec détails de l'erreur
- **Remarques** :
  - Prend en charge les messages de test simples, les notifications basées sur des modèles et les tests d'e-mail
  - Le test de modèle utilise des données d'exemple pour remplacer les variables de modèle
  - Inclut un horodatage dans le message de test
  - Les tests NTFY utilisent la configuration NTFY stockée ; une URL NTFY fournie par le client n'est pas utilisée
  - Utilise le champ `accessToken` pour l'authentification lorsque stocké
  - Pour les tests de modèle, envoie des notifications à NTFY et à l'e-mail (si configuré)
  - Les tests d'e-mail nécessitent que la configuration SMTP soit définie
  - Le point de terminaison de l'e-mail de test efface le cache de la requête avant de lire la configuration SMTP, garantissant que les scripts externes peuvent mettre à jour la configuration et que celle-ci soit immédiatement reflétée dans les e-mails de test
  - Les tests de modèle et l'envoi immédiat du Résumé quotidien contournent la suppression par sauvegarde

## Aperçu du modèle de notification - `/api/notifications/preview` {/* #preview-notification-template---apinotificationspreview */}
- **Point de terminaison** : `/api/notifications/preview`
- **Méthode** : POST
- **Description** : Rendu d'un modèle de notification avec le moteur de rendu Markdown de production sans envoi. Le corps inclut `kind` (`success`, `warning`, `overdueBackup`, ou `dailySummaryEmail`) et le modèle en cours d'édition. Les aperçus du Résumé quotidien utilisent l'instantané réel actuel ; les autres utilisent des valeurs d'échantillon déterministes. L'Email HTML est destiné à un iframe sandboxé. Succès, Avertissement/Erreur et En retard renvoient également le payload NTFY (`ntfyMessage`) ; tout en-tête de tableau GFM est omis et les lignes du corps sont en texte brut.
- **Authentification**: Nécessite une session et un jeton CSRF valides

## Vérifier les sauvegardes en retard - `/api/notifications/check-overdue` {/* #check-overdue-backups---apinotificationscheck-overdue */}
- **Point de terminaison** : `/api/notifications/check-overdue`
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
- **Remarques** :
  - Déclenche manuellement la vérification des sauvegardes en retard
  - Retourne des statistiques sur le processus de vérification
  - Envoie des notifications pour les sauvegardes en retard trouvées

## Effacer les horodatages des sauvegardes en retard - `/api/notifications/clear-overdue-timestamps` {/* #clear-overdue-timestamps---apinotificationsclear-overdue-timestamps */}
- **Point de terminaison** : `/api/notifications/clear-overdue-timestamps`
- **Méthode** : POST
- **Description** : Efface tous les horodatages de notification des sauvegardes en retard, permettant de renvoyer les notifications.
- **Authentification** : Nécessite une session valide et un jeton CSRF
- **Réponse** :

  ```json
  {
    "message": "Overdue backup notification timestamps cleared successfully"
  }
  ```

- **Réponses d'erreur** :
  - `500` : Échec de l'effacement des horodatages des sauvegardes en retard
- **Remarques** :
  - Efface tous les horodatages de notification des sauvegardes en retard
  - Permet de renvoyer les notifications
  - Utile pour tester le système de notifications
