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
- **Point de terminaison de vérification de santé** : `/health` - Renvoie l'état du service et les tâches actives
- **Déclenchement manuel de tâches** : `POST /trigger/:taskName` - Exécute manuellement les tâches planifiées
- **Gestion des tâches** : `POST /start/:taskName` et `POST /stop/:taskName` - Contrôler les tâches individuelles
- **Rechargement de la configuration** : `POST /reload-config` - Recharge la configuration depuis la base de données
- **Redémarrage automatique** : Le service redémarre automatiquement en cas de panne (géré par `docker-entrypoint.sh` dans les déploiements Docker)
- **Mode observation** : Le mode développement inclut la surveillance des fichiers pour redémarrer automatiquement en cas de modification du code
- **Surveillance des sauvegardes en retard** : Vérification automatisée et notification des sauvegardes en retard (exécutée toutes les 5 minutes par défaut)
- **Nettoyage du journal d'audit** : Nettoyage automatique des anciennes entrées du journal d'audit (s'exécute quotidiennement à 2 h UTC)
- **Actualisation des versions de Duplicati** : Met à jour les versions de chaîne de Duplicati les plus récentes mises en cache à partir des versions GitHub. La valeur par défaut est quotidienne à 3 h UTC ; les administrateurs peuvent modifier l'intervalle et l'heure de début dans [Paramètres → Versions de Duplicati](../user-guide/settings/duplicati-versions.md).
- **Planification flexible** : Expressions cron configurables pour différentes tâches
- **Intégration de la base de données** : Partage la même base de données SQLite avec l'application principale
- **API RESTful** : API complète pour la gestion et la surveillance des services
