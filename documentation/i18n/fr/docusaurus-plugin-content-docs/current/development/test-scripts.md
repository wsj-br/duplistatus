# Scripts de test {/* #test-scripts */}

Le projet inclut plusieurs scripts de test pour faciliter le développement et les tests :

> [!NOTE]
> Les assistants du répertoire racine hérité `pnpm` pour le débogage des sauvegardes en retard, les tests de matrice SMTP et les vérifications de port cron ont été supprimés. Utilisez l'interface utilisateur de l'application (**Paramètres → Surveillance des sauvegardes**), les API HTTP authentifiées et `curl` contre le service cron comme documenté ci-dessous.

## Générer des données de test {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

Ce script génère des données de sauvegarde de test pour plusieurs serveurs et sauvegardes.

Le paramètre `--servers=N` est **obligatoire** et spécifie le nombre de serveurs à générer (1-30).

Utilisez l'option `--upload` pour envoyer les données générées au `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

`--api-key` est requis quand Paramètres → Clés API est défini pour exiger des clés. Le script réessaie une fois sur HTTP 429 afin qu'une grande exécution `--upload` reste dans les limites de débit par défaut.

**Exemples :**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

Le script attribue les versions de Duplicati **par serveur** (la même chaîne de rapport est écrite dans chaque sauvegarde pour ce serveur) :

- **70–80% actuel** : utilise la dernière version stable en cache disponible depuis `configurations.duplicati_versions`, sinon un secours épinglé (`2.1.0.5_stable`).
- **Reste plus ancien** : une version stable strictement précédente afin que le badge du tableau de bord se compare comme obsolète (jaune).
- Le mode Direct-DB efface `configurations` en premier, puis restaure ou amorce le cache de version afin que la comparaison actuel/obsolète fonctionne immédiatement.
- Les petits nombres ne peuvent pas toujours atteindre 70–80% : `--servers=1` est 100% actuel ; `--servers=2` ou `3` conserve au moins un serveur plus ancien ; `--servers=6` est 5 actuels (83%). `--servers=12` (utilisé par `pnpm take-screenshots`) est **9 actuels / 3 plus anciens**.
- Quand `pnpm take-screenshots` réduit ultérieurement l'ensemble de données à trois serveurs, il conserve le serveur en retard protégé et **au moins un serveur avec une version plus ancienne**.

>[!CAUTION]
> Ce script supprime toutes les données précédentes dans la base de données et les remplace par des données de test.
> Sauvegardez votre base de données avant d'exécuter ce script.

## Vérifications en retard et connectivité cron (développement) {/* #overdue-checks-and-cron-connectivity-development */}

### Exécuter une vérification de sauvegarde en retard {/* #run-an-overdue-backup-check */}

Pendant que l'application est en cours d'exécution :

- **Interface utilisateur (recommandé) :** ouvrez **Paramètres → Surveillance des sauvegardes** et utilisez **Tester les sauvegardes en retard**. Cela exécute la même logique que la tâche planifiée via `POST /api/notifications/check-overdue` authentifié.

### Santé du service Cron {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simuler une date ou une heure spécifique {/* #simulating-a-specific-date-or-time */}

Il n'y a pas d'interface de ligne de commande fournie pour injecter un temps "actuel" simulé. Pour l'algorithme et les idées de test manuel, consultez le fichier du répertoire `dev/OVERDUE_DETECTION_ALGORITHM.md` et l'implémentation dans `src/lib/overdue-backup-checker.ts`.

## Valider l'export CSV {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

Ce script valide la fonctionnalité d'export CSV. Il :
- Teste la génération d'export CSV
- Vérifie le format et la structure des données
- Contrôle l'intégrité des données dans les fichiers exportés

Utile pour s'assurer que les exports CSV fonctionnent correctement avant les versions.

## Bloquer temporairement le serveur NTFY (pour les tests) {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Ce script bloque temporairement l'accès réseau sortant au serveur `ntfy.sh` pour tester le mécanisme de nouvelle tentative de notification. Il :
- Résout l'adresse IP du serveur NTFY
- Ajoute une règle iptables pour bloquer le trafic sortant
- Bloque pendant 10 secondes (configurable)
- Supprime automatiquement la règle de blocage à la sortie
- Nécessite les privilèges root (sudo)

>[!CAUTION]
> Ce script modifie les règles iptables et nécessite les privilèges root. À utiliser uniquement pour tester les mécanismes de nouvelle tentative de notification.

## Tests de migration de base de données {/* #database-migration-testing */}

Le projet inclut des scripts pour tester les migrations de base de données à partir de versions antérieures vers la version actuelle. Ces scripts garantissent que les migrations de base de données fonctionnent correctement et préservent l'intégrité des données.

### Générer les données de test de migration {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

Ce script génère des bases de données de test pour plusieurs versions historiques de l'application. Il :

1. **Arrête et supprime** tout conteneur Docker existant
2. **Pour chaque version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21) :
   - Supprime les fichiers de base de données existants
   - Crée un fichier d'étiquette de version
   - Démarre un conteneur Docker avec la version spécifique
   - Attend que le conteneur soit prêt
   - Génère les données de test en utilisant `pnpm generate-test-data`
   - Prend une capture d'écran de l'interface utilisateur avec les données de test
   - Arrête et supprime le conteneur
   - Vide les fichiers WAL et enregistre le schéma de la base de données
   - Copie le fichier de base de données vers `scripts/migration_test_data/`

**Prérequis :**
- Docker doit être installé et configuré
- Chromium (via Playwright) doit être installé
- Accès root/sudo pour les opérations Docker
- Le volume Docker `duplistatus_data` doit exister

**Sortie :**
- Fichiers de base de données : `scripts/migration_test_data/backups_<VERSION>.db`
- Fichiers de schéma : `scripts/migration_test_data/backups_<VERSION>.schema`
- Captures d'écran : `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuration :**
- Nombre de serveurs : Défini via la variable `SERVERS` (par défaut : 3)
- Répertoire des données : `/var/lib/docker/volumes/duplistatus_data/_data`
- Port : 9666 (port du conteneur Docker)

>[!CAUTION]
> Ce script nécessite Docker et arrêtera/supprimera les conteneurs existants. Il nécessite également un accès sudo pour les opérations Docker et l'accès au système de fichiers. Exécutez `pnpm take-screenshots:install` en premier pour installer le navigateur Chromium de Playwright si vous ne l'avez pas déjà fait.

>[!IMPORTANT]
> Ce script était censé s'exécuter une seule fois, car pour les nouvelles versions, le développeur peut copier directement le fichier de base de données et les captures d'écran dans le répertoire `scripts/migration_test_data/`. Pendant le développement, exécutez simplement le script `./scripts/test-migrations.sh` pour tester les migrations.

### Tester les migrations de base de données {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

Ce script teste les migrations de base de données des anciennes versions vers la version actuelle (4.0). Il :

1. **Pour chaque version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21) :
   - Crée une copie temporaire de la base de données de test
   - Exécute le processus de migration à l'aide de `test-migration.ts`
   - Valide la structure de la base de données migrée
   - Vérifie la présence des tables et colonnes requises
   - Confirme que la version de la base de données est 4.0
   - Nettoie les fichiers temporaires

**Conditions préalables :**
- Les bases de données de test doivent exister dans `scripts/migration_test_data/`
- Générées en exécutant d'abord `generate-migration-test-data.sh`

**Résultat :**
- Résultats de test codés par couleur (vert pour réussi, rouge pour échoué)
- Résumé des versions réussies et échouées
- Messages d'erreur détaillés pour les migrations échouées
- Code de sortie 0 si tous les tests réussissent, 1 si l'un d'eux échoue

**Ce qu'il valide :**
- La version de la base de données est 4.0 après la migration
- Toutes les tables requises existent : `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Les colonnes requises existent dans chaque table
- La structure de la base de données est correcte

**Exemple de résultat :**

```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**Utilisation :**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> Ce script utilise en interne le script de test de migration TypeScript (`test-migration.ts`). Le script de test valide la structure de la base de données après la migration et garantit l'intégrité des données.

## SMTP et e-mail (développement) {/* #smtp-and-email-development */}

Configurez SMTP sous **Paramètres → E-mail** et utilisez le test d'e-mail intégré à l'application et les flux de notification. Les anciens scripts d'assistance `pnpm set-smtp-test-config` et `pnpm test-smtp-connections` ont été supprimés du référentiel.

## Tester le script de point d'entrée Docker {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

Ce script fournit un wrapper de test pour `docker-entrypoint.sh` dans le développement local. Il configure l'environnement pour tester la fonctionnalité de journalisation du point d'entrée et garantit que les journaux sont écrits dans `data/logs/` afin que l'application puisse y accéder.

**Ce qu'il fait :**

1. **Crée toujours une version nouvelle** : Exécute automatiquement `pnpm build-local` pour créer une version nouvelle avant le test (pas besoin de construire manuellement en premier)
2. **Construit le service cron** : Garantit que le service cron est construit (`dist/cron-service.cjs`)
3. **Configure la structure de type Docker** : Crée les liens symboliques et la structure de répertoires nécessaires pour imiter l'environnement Docker
4. **Exécute le script de point d'entrée** : Exécute `docker-entrypoint.sh` avec les variables d'environnement appropriées
5. **Nettoie** : Supprime automatiquement les fichiers temporaires à la sortie

**Utilisation :**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variables d'environnement :**
- `PORT=8666` - Port pour le serveur Next.js (correspond à `start-local`)
- `CRON_PORT=8667` - Port pour le service cron
- `VERSION` - Défini automatiquement au format `test-YYYYMMDD-HHMMSS`

**Sortie :**
- Les journaux sont écrits dans `data/logs/application.log` (accessible par l'application)
- La sortie console affiche l'exécution du script de point d'entrée
- Appuyez sur Ctrl+C pour arrêter et tester le vidage des journaux

**Prérequis :**
- Le script doit être exécuté à partir du répertoire racine du dépôt (pnpm gère cela automatiquement)
- Le script gère automatiquement tous les prérequis (build, service cron, etc.)

**Cas d'utilisation :**
- Tester les modifications du script de point d'entrée localement avant le déploiement Docker
- Vérifier la rotation des journaux et la fonctionnalité de journalisation
- Tester l'arrêt gracieux et la gestion des signaux
- Déboguer le comportement du script de point d'entrée dans un environnement local

## Validation du Résumé quotidien {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

Exécute des vérifications déterministes pour la planification du Résumé quotidien (y compris l'heure d'été), l'agrégation des snapshots (dernières Tâches de Sauvegarde uniquement), le nettoyage des paramètres de notification restants, les lignes Sauvegarde/Serveur orphelines, l'assainissement Markdown, les réclamations du journal de livraison et la migration du schéma 4.1 → 4.2 avec Modèles personnalisés. N'envoie pas d'E-mail ni NTFY.
