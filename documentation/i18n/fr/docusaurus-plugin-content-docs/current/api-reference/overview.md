# Aperçu de l'API {/* #api-overview */}

Ce document décrit tous les points de terminaison d'API disponibles pour l'application duplistatus. L'API suit les principes RESTful et offre des fonctionnalités complètes de surveillance des sauvegardes, de gestion des notifications et d'administration du système.

## Structure de l'API {/* #api-structure */}

Pour une référence rapide de tous les points de terminaison, consultez la [Liste des points de terminaison de l'API](api-endpoint-list).

L'API est organisée en groupes logiques :
- [**API externes**](external-apis) : Données de résumé, dernier état de sauvegarde et téléversements de données de sauvegarde depuis Duplicati
- [**Opérations de base**](core-operations) : Données du tableau de bord, gestion des serveurs et informations de sauvegarde détaillées
- [**Données de graphiques**](chart-data-apis) : Données de séries chronologiques agrégées et spécifiques aux serveurs pour la visualisation et l'analyse
- [**Gestion de la configuration**](configuration-apis) : E-mail, notifications, paramètres de sauvegarde et configuration du système
- [**Système de notification**](notification-apis) : Test des notifications, vérifications des sauvegardes en retard et gestion des notifications
- [**Services cron**](cron-service-apis) : Gestion des services cron
- [**Surveillance et intégrité**](monitoring-apis) : Contrôles d'intégrité et surveillance de l'état
- [**Administration**](administration-apis) : Maintenance de la base de données, opérations de nettoyage et gestion du système
- [**Gestion des sessions**](session-management-apis) : Gestion des sessions et création de sessions
- [**Authentification et sécurité**](authentication-security) : Authentification et sécurité

Pour une référence rapide de tous les points de terminaison, consultez la [Liste des points de terminaison de l'API](api-endpoint-list).

## Format des réponses {/* #response-format */}

Toutes les réponses de l'API sont renvoyées au format JSON avec des modèles cohérents de gestion des erreurs. Les réponses réussies incluent généralement un champ `status`, tandis que les réponses d'erreur incluent les champs `error` et `message`.

---

## Gestion des erreurs {/* #error-handling */}

Tous les points de terminaison suivent un modèle cohérent de gestion des erreurs :

- **400 Bad Request** : Données de requête non valides ou champs obligatoires manquants
- **401 Unauthorized** : Session non valide ou manquante, session expirée ou échec de validation du jeton CSRF
- **403 Forbidden** : Opération non autorisée (par ex., suppression de sauvegarde en production) ou échec de validation du jeton CSRF
- **404 Not Found** : Ressource introuvable
- **409 Conflict** : Données en double (pour les points de terminaison de téléversement)
- **413 Payload Too Large** : Le corps `/api/upload` dépasse la taille maximale configurée
- **429 Too Many Requests** : Limite de débit dépassée pour le téléversement, la lecture de l'API ou les échecs d'authentification
- **500 Internal Server Error** : Erreurs côté serveur avec messages d'erreur détaillés
- **503 Service Unavailable** : Échecs du contrôle d'intégrité, problèmes de connexion à la base de données ou service cron indisponible

Les réponses d'erreur comprennent :
- `error` : Message d'erreur lisible par l'utilisateur
- `message` : Détails techniques de l'erreur (en mode développement)
- `stack` : Trace de la pile d'erreurs (en mode développement)
- `timestamp` : Moment où l'erreur s'est produite

## Remarques sur les types de données {/* #data-type-notes */}

### Tableaux de messages {/* #message-arrays */}
Les champs `messages_array`, `warnings_array` et `errors_array` sont stockés sous forme de chaînes JSON dans la base de données et renvoyés sous forme de tableaux dans les réponses de l'API. Ils contiennent les messages de journal réels, les avertissements et les erreurs issus des opérations de sauvegarde Duplicati.

### Sauvegardes disponibles {/* #available-backups */}
Le champ `available_backups` contient un tableau d'horodatages de versions de sauvegarde (au format ISO) qui sont disponibles pour la restauration. Il est extrait des messages de journal de sauvegarde.

### Champs de Durée {/* #duration-fields */}
- `duration` : Format lisible par l'homme (par ex. « 00:38:31 »)
- `duration_seconds` : Durée brute en secondes
- `durationInMinutes` : Durée convertie en minutes à des fins de création de graphiques

### Champs de Taille de fichier {/* #file-size-fields */}
Tous les champs de taille de fichier sont renvoyés en octets sous forme de nombres, et non de chaînes formatées. Le frontend est chargé de les convertir dans des formats lisibles par l'homme (Ko, Mo, Go, etc.).

<br/>

:::caution
 N'exposez pas le serveur **duplistatus** à l'Internet public. Utilisez-le sur un réseau sécurisé 
(par exemple, un réseau local protégé par un pare-feu).

Exposer l'interface **duplistatus** à l'Internet public
 sans mesures de sécurité appropriées pourrait entraîner un accès non autorisé.
:::
