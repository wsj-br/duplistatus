---
translation_last_updated: '2026-05-06T23:19:38.455Z'
source_file_mtime: '2026-05-06T23:18:51.418Z'
source_file_hash: 55f7e22ce3b1fa4868b6c112f9ed098fc3c8bf99e832fc930106cbc887815c77
translation_language: fr
source_file_path: documentation/docs/api-reference/overview.md
translation_models:
  - qwen/qwen3-235b-a22b-2507
---
# Vue d'ensemble de l'API {#api-overview}

Ce document décrit tous les points de terminaison API disponibles pour l'application duplistatus. L'API suit les principes RESTful et offre des fonctionnalités complètes de surveillance des sauvegardes, de gestion des notifications et d'administration système.

:::note
**Français (FR) :** La documentation de l'API est disponible uniquement en anglais.    <br/>
**Allemand (DE) :** Die API-Dokumentation ist nur auf Englisch verfügbar.              <br/>
**Espagnol (ES) :** La documentación de la API solo está disponible en inglés.        <br/>
**Portugais (PT-BR) :** A documentação da API está disponível apenas em inglês.    
**Anglais (EN) :** The API documentation is available only in English.               <br/>
:::

## Structure de l'API {#api-structure}

Pour une référence rapide de tous les points de terminaison, consultez la [liste des points de terminaison de l'API](api-endpoint-list).

L'API est organisée en groupes logiques :
- [**API externes**](external-apis) : Données récapitulatives, statut de la dernière sauvegarde et chargement des données de sauvegarde depuis Duplicati
- [**Opérations principales**](core-operations) : Données du tableau de bord, gestion du serveur et informations détaillées sur les sauvegardes
- [**Données de graphiques**](chart-data-apis) : Données chronologiques agrégées ou spécifiques au serveur, destinées à la visualisation et à l'analyse
- [**Gestion de la configuration**](configuration-apis) : E-mail, notifications, paramètres de sauvegarde et configuration du système
- [**Système de notifications**](notification-apis) : Test des notifications, vérification des sauvegardes en retard et gestion des notifications
- [**Services Cron**](cron-service-apis) : Gestion des services Cron
- [**Surveillance et état de santé**](monitoring-apis) : Vérifications d'intégrité et surveillance du statut
- [**Administration**](administration-apis) : Maintenance de la base de données, opérations de nettoyage et gestion du système
- [**Gestion des sessions**](session-management-apis) : Gestion des sessions et création de session
- [**Authentification et sécurité**](authentication-security) : Authentification et sécurité

Pour une référence rapide de tous les points de terminaison, consultez la [liste des points de terminaison de l'API](api-endpoint-list).

## Format de réponse {#response-format}

Toutes les réponses de l'API sont renvoyées au format JSON avec des modèles de gestion des erreurs cohérents. Les réponses réussies incluent généralement un champ `status`, tandis que les réponses d'erreur incluent les champs `error` et `message`.

---

## Gestion des erreurs {#error-handling}

Tous les points de terminaison suivent un modèle de gestion des erreurs cohérent :

- **400 Demande incorrecte** : Données de demande invalides ou champs requis manquants
- **401 Non autorisé** : Session invalide ou manquante, session expirée, ou échec de la validation du jeton CSRF
- **403 Interdit** : Opération non autorisée (par exemple, suppression d'une sauvegarde en production) ou échec de la validation du jeton CSRF
- **404 Introuvable** : Ressource introuvable
- **409 Conflit** : Données en double (pour les points de terminaison de chargement)
- **500 Erreur interne du serveur** : Erreurs côté serveur accompagnées de messages d'erreur détaillés
- **503 Service indisponible** : Échec des vérifications d'intégrité, problèmes de connexion à la base de données ou service Cron indisponible

Les réponses d'erreur incluent :
- `error` : Message d'erreur lisible par l'utilisateur
- `message` : Détails techniques de l'erreur (en mode développement)
- `stack` : Pile d'appels de l'erreur (en mode développement)
- `timestamp` : Quand l'erreur s'est produite

## Remarques sur les types de données {#data-type-notes}

### Tableaux de messages {#message-arrays}
Les champs `messages_array`, `warnings_array` et `errors_array` sont stockés sous forme de chaînes JSON dans la base de données et renvoyés sous forme de tableaux dans les réponses de l'API. Ils contiennent les messages de journal, les avertissements et les erreurs réels des opérations de sauvegarde Duplicati.

### Sauvegardes disponibles {#available-backups}
Le champ `available_backups` contient un tableau d'horodatages de versions de sauvegarde (au format ISO) disponibles pour restauration. Cela est extrait des messages de journal de sauvegarde.

### Champs de durée {#duration-fields}
- `duration` : Format lisible par l'homme (par exemple, "00:38:31")
- `duration_seconds` : Durée brute en secondes
- `durationInMinutes` : Durée convertie en minutes à des fins de graphique

### Champs de taille de fichier {#file-size-fields}
Tous les champs de taille de fichier sont renvoyés en octets sous forme de nombres, pas de chaînes formatées. L'interface est responsable de la conversion en formats lisibles (Ko, Mo, Go, etc.).

<br/>

:::caution
 N'exposez pas le serveur **duplistatus** à l'internet public. Utilisez-le dans un réseau sécurisé 
(par exemple, un réseau local protégé par un pare-feu).

Exposer l'interface **duplistatus** à l'internet public 
sans mesures de sécurité adéquates pourrait entraîner un accès non autorisé.
:::
