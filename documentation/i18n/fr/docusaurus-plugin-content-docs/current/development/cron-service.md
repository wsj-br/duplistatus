---
translation_last_updated: '2026-02-05T19:08:10.544Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: a4aa296b36d4dd44
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

Le service cron inclut :
- **Point de terminaison de vérification de santé** : `/health` - Retourne le statut du service et les tâches actives
- **Déclenchement manuel de tâches** : `POST /trigger/:taskName` - Exécute manuellement les tâches planifiées
- **Gestion des tâches** : `POST /start/:taskName` et `POST /stop/:taskName` - Contrôle les tâches individuelles
- **Rechargement de la configuration** : `POST /reload-config` - Recharge la configuration depuis la base de données
- **Redémarrage automatique** : Le service redémarre automatiquement en cas de panne (géré par `duplistatus-cron.sh`)
- **Mode surveillance** : Le mode développement inclut la surveillance des fichiers pour les redémarrages automatiques lors de modifications du code
- **Surveillance des sauvegardes en retard** : Vérification automatisée et notification des sauvegardes en retard (s'exécute toutes les 5 minutes par défaut)
- **Nettoyage du journal d'audit** : Nettoyage automatisé des anciennes entrées du journal d'audit (s'exécute quotidiennement à 2 h UTC)
- **Planification flexible** : Expressions cron configurables pour différentes tâches
- **Intégration de base de données** : Partage la même base de données SQLite avec l'application principale
- **API RESTful** : API complète pour la gestion et la surveillance du service
