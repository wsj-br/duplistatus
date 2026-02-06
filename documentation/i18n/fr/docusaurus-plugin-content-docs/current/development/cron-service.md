---
translation_last_updated: '2026-02-06T22:33:24.890Z'
source_file_mtime: '2026-02-06T21:19:17.562Z'
source_file_hash: 5ce1c81347ec9e1a
translation_language: fr
source_file_path: development/cron-service.md
---
# Service Cron {#cron-service}

L'application inclut un service cron distinct pour gérer les tâches planifiées :

## Démarrer le service cron en mode développement {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## Démarrer le service cron en mode production {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## Démarrer le service cron localement (pour les tests) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

Le service cron s'exécute sur un port séparé (8667 en développement, 9667 en production) et gère les tâches planifiées comme les notifications de sauvegarde en retard. Le port peut être configuré à l'aide de la variable d'environnement `CRON_PORT`.

Le service cron comprend :
- **Point de terminaison de vérification de santé** : `/health` - Renvoie le statut du service et les tâches actives
- **Déclenchement manuel de tâches** : `POST /trigger/:taskName` - Exécuter manuellement des tâches planifiées
- **Gestion des tâches** : `POST /start/:taskName` et `POST /stop/:taskName` - Contrôler des tâches individuelles
- **Rechargement de la configuration** : `POST /reload-config` - Recharger la configuration depuis la base de données
- **Redémarrage automatique** : Le service redémarre automatiquement en cas de plantage (géré par `docker-entrypoint.sh` dans les déploiements Docker)
- **Mode surveillance** : Le mode de développement inclut la surveillance des fichiers pour des redémarrages automatiques lors de modifications de code
- **Surveillance des sauvegardes en retard** : Vérification et notification automatiques des sauvegardes en retard (exécuté toutes les 5 minutes par défaut)
- **Nettoyage du journal d'audit** : Nettoyage automatique des anciennes entrées du journal d'audit (exécuté quotidiennement à 2h UTC)
- **Planification flexible** : Expressions cron configurables pour différentes tâches
- **Intégration de base de données** : Partage de la même base de données SQLite que l'application principale
- **API RESTful** : API complète pour la gestion et la surveillance du service
