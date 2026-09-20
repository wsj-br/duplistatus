# Service Cron {/* #cron-service */}

L'application comprend un service cron distinct pour gérer les tâches planifiées :

## Démarrer le service cron en mode développement {/* #start-cron-service-in-development-mode */}

`pnpm dev` démarre déjà le service cron en parallèle de Next.js. Pour exécuter cron seul (par exemple dans un second terminal) :

```bash
pnpm cron:dev
```

## Démarrer le service cron en mode production {/* #start-cron-service-in-production-mode */}

```bash
pnpm cron:start
```

## Démarrer le service cron localement (pour les tests) {/* #start-cron-service-locally-for-testing */}

```bash
pnpm cron:start-local
```

Le service cron s'exécute sur un port distinct (8667 en développement, 9667 en production) et gère les tâches planifiées telles que les notifications de sauvegardes en retard. Le port peut être configuré à l'aide de la variable d'environnement `CRON_PORT`.

Le service cron comprend :
- **Point de terminaison de vérification de l'état** : `/health` - Renvoie l'état du service et les tâches actives
- **Déclenchement manuel de tâches** : `POST /trigger/:taskName` - Exécute manuellement les tâches planifiées. La tâche `daily-summary-dispatch` est rejetée sur cette route ; utilisez plutôt Paramètres → Résumé quotidien **Envoyer le résumé maintenant**
- **Gestion des tâches** : `POST /start/:taskName` et `POST /stop/:taskName` - Contrôle les tâches individuelles
- **Rechargement de la configuration** : `POST /reload-config` - Recharge la configuration depuis la base de données
- **Redémarrage automatique** : Le service redémarre automatiquement en cas de plantage (géré par `docker-entrypoint.sh` dans les déploiements Docker)
- **Mode surveillance (watch)** : Le mode développement inclut la surveillance des fichiers pour redémarrer automatiquement lors de modifications du code
- **Surveillance des sauvegardes en retard** : Vérification et notification automatisées des sauvegardes en retard (s'exécute toutes les 5 minutes par défaut)
- **Envoi du résumé quotidien** : Envoie l'instantané de l'état actuel une fois par jour à l'heure UTC enregistrée pour le Résumé quotidien (`minute hour * * *`). La valeur par défaut pour les nouvelles installations est 01:00 UTC. La modification de l'heure d'envoi recharge cette planification. La tâche s'exécute si le Résumé quotidien est activé et ne revérifie pas l'horloge.
- **Nettoyage du journal d'audit** : Nettoyage automatisé des anciennes entrées du journal d'audit (s'exécute quotidiennement à 2 h UTC)
- **Compactage de la base de données** : Hebdomadaire le Dimanche à 04:00 UTC. Supprime les lignes de sauvegarde dont le serveur n'existe plus, les lignes de serveur sans sauvegardes restantes, les clés `backup_settings` et `overdue_notifications` orphelines, purge les anciennes lignes de remise du Résumé quotidien et exécute `VACUUM` de SQLite
- **Actualisation des versions de Duplicati** : Met à jour les dernières versions mises en cache des chaînes Duplicati depuis GitHub Releases. La valeur par défaut est quotidienne à 3 h UTC ; les administrateurs peuvent modifier l'intervalle et l'heure de début dans [Paramètres → Versions de Duplicati](../user-guide/settings/duplicati-versions.md).
- **Planification flexible** : Expressions cron configurables pour différentes tâches
- **Intégration de la base de données** : Partage la même base de données SQLite avec l'application principale
- **API RESTful** : API complète pour la gestion et la surveillance du service
- **Liaison locale** : Écoute sur `127.0.0.1` par défaut (`CRON_BIND_HOST`). Les liaisons autres que de bouclage nécessitent `CRON_SERVICE_SECRET`
