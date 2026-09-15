# Aperçu des API {/* #api-overview */}

Ce document décrit tous les points de terminaison API disponibles pour l'application duplistatus. L'API suit les principes RESTful et fournit des fonctionnalités complètes de surveillance des sauvegardes, de gestion des notifications et d'administration système.

## Structure des API {/* #api-structure */}

Pour une référence rapide de tous les points de terminaison, consultez la [Liste des points de terminaison API](api-endpoint-list).

L'API est organisée en groupes logiques:
- [**API externes**](external-apis): Données récapitulatives, dernier statut de sauvegarde et téléchargements de données de sauvegarde depuis Duplicati
- [**Opérations principales**](core-operations): Données du tableau de bord, gestion du serveur et informations détaillées sur les sauvegardes
- [**Données de graphiques**](chart-data-apis): Données de séries temporelles agrégées et spécifiques au serveur pour la visualisation et l'analyse
- [**Gestion de la configuration**](configuration-apis): E-mail, notifications, paramètres de sauvegarde et configuration système
- [**Système de notifications**](notification-apis): Test des notifications, vérification des sauvegardes en retard et gestion des notifications
- [**Services Cron**](cron-service-apis): Gestion des services Cron
- [**Surveillance et santé**](monitoring-apis): Vérifications de santé et surveillance de l'état
- [**Administration**](administration-apis): Maintenance de la base de données, opérations de nettoyage et gestion du système
- [**Gestion des sessions**](session-management-apis): Gestion des sessions et création de sessions
- [**Authentification et sécurité**](authentication-security): Authentification et sécurité

Pour une référence rapide de tous les points de terminaison, consultez la [Liste des points de terminaison API](api-endpoint-list).

## Format de réponse {/* #response-format */}

Toutes les réponses API sont renvoyées au format JSON avec des schémas de gestion des erreurs cohérents. Les réponses réussies incluent généralement un champ `status`, tandis que les réponses d'erreur incluent les champs `error` et `message`.

---

## Gestion des erreurs {/* #error-handling */}

Tous les points de terminaison suivent un schéma de gestion des erreurs cohérent:

- **400 Mauvaise requête**: Données de requête invalides ou champs obligatoires manquants
- **401 Non autorisé**: Session invalide ou manquante, session expirée ou validation du jeton CSRF échouée
- **403 Interdit**: Opération non autorisée (par exemple, suppression de sauvegarde en production) ou validation du jeton CSRF échouée
- **404 Non trouvé**: Ressource introuvable
- **409 Conflit**: Données dupliquées (pour les points de terminaison de téléchargement)
- **413 Entité de requête trop volumineuse**: Le corps `/api/upload` dépasse la limite de taille configurée
- **429 Trop de requêtes**: Limite de taux dépassée pour les téléchargements, les API de lecture ou les échecs d'authentification
- **500 Erreur interne du serveur**: Erreurs côté serveur avec des messages d'erreur détaillés
- **503 Service indisponible**: Échecs de vérification de santé, problèmes de connexion à la base de données ou service Cron indisponible

Les réponses d'erreur incluent:
- `error`: Message d'erreur lisible par l'utilisateur
- `message`: Détails techniques de l'erreur (en mode développement)
- `stack`: Trace de la pile d'erreur (en mode développement)
- `timestamp`: Quand l'erreur s'est produite

## Notes sur les types de données {/* #data-type-notes */}

### Tableaux de messages {/* #message-arrays */}
Les champs `messages_array`, `warnings_array` et `errors_array` sont stockés sous forme de chaînes JSON dans la base de données et renvoyés sous forme de tableaux dans les réponses API. Ils contiennent les messages de journalisation réels, les avertissements et les erreurs des opérations de sauvegarde Duplicati.

### Sauvegardes disponibles {/* #available-backups */}
Le champ `available_backups` contient un tableau de horodatages de versions de sauvegarde (au format ISO) disponibles pour la restauration. Il est extrait des messages de journalisation des sauvegardes.

### Champs de durée {/* #duration-fields */}
- `duration` : Format lisible par l'utilisateur (par exemple, "00:38:31")
- `duration_seconds` : Durée brute en secondes
- `durationInMinutes` : Durée convertie en minutes pour les graphiques

### Champs de taille de fichier {/* #file-size-fields */}
Tous les champs de taille de fichier sont renvoyés en octets sous forme de nombres, et non sous forme de chaînes formatées. Le frontend est responsable de la conversion de ces valeurs en formats lisibles par l'utilisateur (Ko, Mo, Go, etc.).

<br/>

:::caution
 Ne pas exposer le serveur **duplistatus** sur Internet public. Utilisez-le dans un réseau sécurisé
 (par exemple, un LAN local protégé par un pare-feu).

Exposer l'interface **duplistatus** sur Internet public sans mesures de sécurité appropriées pourrait entraîner un accès non autorisé.
:::
