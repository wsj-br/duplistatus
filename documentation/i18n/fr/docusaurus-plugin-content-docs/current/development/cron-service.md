# Service Cron {/* #cron-service */}

L'application inclut un service cron distinct pour la gestion des tâches planifiées :

## Démarrer le service cron en mode développement {/* #start-cron-service-in-development-mode */}

`pnpm dev` démarre déjà le service cron avec Next.js. Pour exécuter cron seul (par exemple dans un second terminal) :

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

Le service cron s'exécute sur un port distinct (8667 en développement, 9667 en production) et gère les tâches planifiées comme les notifications de sauvegarde en retard. Le port peut être configuré à l'aide de la variable d'environnement `CRON_PORT`.

Le service cron inclut :
- **Point de terminaison de vérification de santé** : `/health` - Retourne le statut du service et les tâches actives
- **Déclenchement manuel des tâches** : `POST /trigger/:taskName` - Exécute manuellement les tâches planifiées. La tâche `daily-summary-dispatch` est rejetée sur cette route ; utilisez Paramètres → Résumé quotidien **Envoyer le résumé maintenant** à la place
- **Gestion des tâches** : `POST /start/:taskName` et `POST /stop/:taskName` - Contrôle des tâches individuelles
- **Rechargement de la configuration** : `POST /reload-config` - Recharge la configuration depuis la base de données
- **Redémarrage automatique** : Le service redémarre automatiquement s'il plante (géré par `docker-entrypoint.sh` dans les déploiements Docker)
- **Mode surveillance** : Le mode développement inclut la surveillance des fichiers pour des redémarrages automatiques en cas de modifications de code
- **Surveillance des sauvegardes en retard** : Vérification et notification automatisées des sauvegardes en retard (s'exécute toutes les 5 minutes par défaut)
- **Envoi du résumé quotidien** : Envoie une capture d'état actuel une fois par jour à l'heure UTC du Résumé quotidien stockée (`minute hour * * *`). La valeur par défaut pour les nouvelles installations est 01:00 UTC. Le changement de l'heure d'envoi recharge ce calendrier. La tâche s'exécute si le Résumé quotidien est activé et ne vérifie pas l'heure.
- **Nettoyage du journal d'audit** : Nettoyage automatisé des anciennes entrées du journal d'audit (s'exécute quotidiennement à 2h00 UTC)
- **Compactage de la base de données** : Hebdomadaire le dimanche à 04:00 UTC. Supprime les lignes de sauvegarde dont le serveur n'existe plus, les lignes de serveur sans sauvegardes restantes, les clés `backup_settings` et `overdue_notifications` résiduelles, élimine les anciennes lignes de livraison du Résumé quotidien et exécute le compactage SQLite `VACUUM`
- **Actualisation des versions de Duplicati** : Met à jour les dernières versions de canal de Duplicati mises en cache depuis les versions GitHub. La valeur par défaut est quotidienne à 3h00 UTC ; les administrateurs peuvent modifier l'intervalle et l'heure de début dans [Paramètres → Versions de Duplicati](../user-guide/settings/duplicati-versions.md).
- **Planification flexible** : Expressions cron configurables pour différentes tâches
- **Intégration de la base de données** : Partage la même base de données SQLite avec l'application principale
- **API RESTful** : API complète pour la gestion et la surveillance du service
- **Liaison locale** : Écoute sur `127.0.0.1` par défaut (`CRON_BIND_HOST`). Les liaisons non-loopback nécessitent `CRON_SERVICE_SECRET`
