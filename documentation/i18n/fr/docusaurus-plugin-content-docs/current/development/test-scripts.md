---
translation_last_updated: '2026-02-16T00:13:27.796Z'
source_file_mtime: '2026-02-01T03:16:19.469Z'
source_file_hash: 6f3df4c1ef3576bd
translation_language: fr
source_file_path: development/test-scripts.md
---
# Scripts de test {#test-scripts}

Le projet inclut plusieurs scripts de test pour faciliter le développement et les tests :

## Générer des données de test {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

Ce script génère des données de sauvegarde de test pour plusieurs serveurs et sauvegardes.

Le paramètre `--servers=N` est **obligatoire** et spécifie le nombre de serveurs à générer (1-30).

Utilisez l'option `--upload` pour envoyer les données générées vers `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**Exemples :**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> Ce script supprime toutes les données précédentes de la base de données et les remplace par des données de test.
> Sauvegardez votre base de données avant d'exécuter ce script.

## Afficher le contenu des notifications en retard (pour déboguer le système de notifications) {#show-the-overdue-notifications-contents-to-debug-notification-system}

```bash
pnpm show-overdue-notifications
```

## Vérifier les éléments en retard à une date/heure spécifique (pour déboguer le système de notification) {#run-overdue-check-at-a-specific-datetime-to-debug-notification-system}

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

## Tester la connectivité du port du service cron {#test-cron-service-port-connectivity}

Pour tester la connectivité du service cron, vous pouvez :

Vérifier si le service cron est en cours d'exécution :

```bash
curl http://localhost:8667/health
```

2. Ou utilisez directement les points de terminaison de l'API du service cron via l'application principale :

```bash
curl http://localhost:8666/api/cron/health
```

3. Utilisez le script de test pour vérifier la connectivité du port :

```bash
pnpm test-cron-port
```

Ce script teste la connectivité au port du service cron et fournit des informations détaillées sur le statut de la connexion.

## Tester la détection en retard {#test-overdue-detection}

```bash
pnpm test-overdue-detection
```

Ce script teste la logique de détection des sauvegardes en retard. Il vérifie :
- L'identification des sauvegardes en retard
- Le déclenchement des notifications
- Les calculs de date/heure pour le statut en retard

Utile pour déboguer les systèmes de détection et de notification des sauvegardes en retard.

## Valider l'export CSV {#validate-csv-export}

```bash
pnpm validate-csv-export
```

Ce script valide la fonctionnalité d'exportation CSV. Il :
- Teste la génération d'exportation CSV
- Vérifie le format et la structure des données
- Contrôle l'intégrité des données dans les fichiers exportés

Utile pour s'assurer que les exports CSV fonctionnent correctement avant les versions.

## Bloquer temporairement le serveur NTFY (pour les tests) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Ce script bloque temporairement l'accès réseau sortant vers le serveur NTFY (`ntfy.sh`) pour tester le mécanisme de réessayer de notification. Il :
- Résout l'adresse IP du serveur NTFY
- Ajoute une règle iptables pour bloquer le trafic sortant
- Bloque pendant 10 secondes (configurable)
- Supprime automatiquement la règle de blocage à la sortie
- Nécessite les privilèges root (sudo)

>[!CAUTION]
> Ce script modifie les règles iptables et nécessite les privilèges root. À utiliser uniquement pour tester les mécanismes de réessai de notification.

## Test de Migration de Base de Données {#database-migration-testing}

Le projet inclut des scripts pour tester les migrations de base de données à partir de versions antérieures vers la version actuelle. Ces scripts garantissent que les migrations de base de données fonctionnent correctement et préservent l'intégrité des données.

### Générer les données de test de migration {#generate-migration-test-data}

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
   - Génère des données de test à l'aide de `pnpm generate-test-data`
   - Prend une capture d'écran de l'interface utilisateur avec les données de test
   - Arrête et supprime le conteneur
   - Vide les fichiers WAL et enregistre le schéma de la base de données
   - Copie le fichier de base de données vers `scripts/migration_test_data/`

**Exigences :**
- Docker doit être installé et configuré
- Google Chrome (via Puppeteer) doit être installé
- Accès root/sudo pour les opérations Docker
- Le volume Docker `duplistatus_data` doit exister

**Résultat :**
- Fichiers de base de données : `scripts/migration_test_data/backups_<VERSION>.db`
- Fichiers de schéma : `scripts/migration_test_data/backups_<VERSION>.schema`
- Captures d'écran : `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuration :**
- Nombre de serveurs : Défini via la variable `SERVERS` (par défaut : 3)
- Répertoire de données : `/var/lib/docker/volumes/duplistatus_data/_data`
- Port : 9666 (port du conteneur Docker)

>[!CAUTION]
> Ce script nécessite Docker et arrêtera/supprimera les conteneurs existants. Il nécessite également un accès sudo pour les opérations Docker et l'accès au système de fichiers. Vous devez d'abord exécuter le script `pnpm take-screenshots` pour installer Google Chrome si vous ne l'avez pas déjà fait.

>[!IMPORTANT]
> Ce script était censé s'exécuter une seule fois. Pour les nouvelles versions, le développeur peut copier le fichier de base de données et les captures d'écran directement dans le répertoire `scripts/migration_test_data/`. Pendant le développement, exécutez simplement le script `./scripts/test-migrations.sh` pour tester les migrations.

### Tester les migrations de base de données {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

Ce script teste les migrations de base de données à partir des anciennes versions vers la version actuelle (4.0). Il :

1. **Pour chaque version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Crée une copie temporaire de la base de données de test
   - Exécute le processus de migration en utilisant `test-migration.ts`
   - Valide la structure de la base de données migrée
   - Vérifie la présence des tables et colonnes requises
   - Confirme que la version de la base de données est 4.0
   - Nettoie les fichiers temporaires

**Exigences :**
- Les bases de données de test doivent exister dans `scripts/migration_test_data/`
- Générées en exécutant d'abord `generate-migration-test-data.sh`

**Résultat :**
- Résultats de test codés par couleur (vert pour réussite, rouge pour échec)
- Résumé des versions réussies et échouées
- Messages d'erreur détaillés pour les migrations échouées
- Code de sortie 0 si tous les tests réussissent, 1 si l'un d'eux échoue

**Ce qu'il valide :**
- La version de la base de données est 4.0 après la migration
- Tous les tableaux requis existent : `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Les colonnes requises existent dans chaque tableau
- La structure de la base de données est correcte

**Exemple de sortie :**

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

## Configurer la configuration de test SMTP {#set-smtp-test-configuration}

```bash
pnpm set-smtp-test-config <connectionType>
```

Ce script configure les paramètres de test SMTP à partir de variables d'environnement. Il accepte un paramètre `connectionType` (`plain`, `starttls` ou `ssl`) et lit les variables d'environnement correspondantes avec des préfixes (`PLAIN_`, `STARTTLS_`, `SSL_`) pour mettre à jour la configuration SMTP dans la base de données.

Pour les connexions simples, le script lit la variable d'environnement `PLAIN_SMTP_FROM` pour définir l'Adresse d'expéditeur requise. Cela facilite le test de différents types de connexion SMTP sans mises à jour manuelles de la base de données.

**Utilisation :**

```bash
# Set Plain SMTP configuration
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
pnpm set-smtp-test-config plain

# Set STARTTLS configuration
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
pnpm set-smtp-test-config starttls

# Set Direct SSL/TLS configuration
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm set-smtp-test-config ssl
```

**Exigences :**
- L'application doit être en cours d'exécution
- Les variables d'environnement doivent être définies avec le préfixe approprié pour le type de connexion
- Pour les connexions en clair, `PLAIN_SMTP_FROM` est requis

## Tester la compatibilité croisée du Type de connexion SMTP {#test-smtp-connection-type-cross-compatibility}

```bash
pnpm test-smtp-connections
```

Ce script effectue un test matriciel complet 3x3 qui valide si les configurations destinées à un type de connexion fonctionnent correctement avec différents types de connexion. Pour chaque type de configuration de base (plain, starttls, ssl), le script :

1. Lit les variables d'environnement avec les préfixes correspondants (`PLAIN_*`, `STARTTLS_*`, `SSL_*`)
2. Teste les trois types de connexion en modifiant uniquement le champ `connectionType`
3. Envoie des e-mails de test via l'API
4. Enregistre les résultats dans un format matriciel
5. Affiche un tableau récapitulatif
6. Enregistre les résultats détaillés dans `smtp-test-results.json`

**Utilisation :**

```bash
# Set environment variables for all three connection types
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm test-smtp-connections
```

**Exigences :**
- L'application doit être en cours d'exécution
- Les variables d'environnement doivent être définies pour les trois types de connexion
- Le script valide la configuration utilisée par le biais d'une journalisation détaillée

**Comportement attendu :**
Les configurations ne doivent fonctionner qu'avec leur type de connexion prévu (par exemple, la configuration simple fonctionne avec le type de connexion simple mais échoue avec STARTTLS/SSL).

**Résultat :**
- Sortie console avec un tableau récapitulatif montrant les résultats des tests
- Fichier `smtp-test-results.json` avec les résultats détaillés des tests pour chaque combinaison de configuration et de type de connexion

## Tester le script Docker Entrypoint {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

Ce script fournit un wrapper de test pour `docker-entrypoint.sh` en développement local. Il configure l'environnement pour tester la fonctionnalité de journalisation du point d'entrée et garantit que les journaux sont écrits dans `data/logs/` afin que l'application puisse y accéder.

**Ce qu'il fait :**

1. **Crée toujours une version récente** : Exécute automatiquement `pnpm build-local` pour créer une version récente avant les tests (pas besoin de compiler manuellement en premier)
2. **Compile le service cron** : Assure que le service cron est compilé (`dist/cron-service.cjs`)
3. **Configure une structure de type Docker** : Crée les liens symboliques et la structure de répertoires nécessaires pour imiter l'environnement Docker
4. **Exécute le script de point d'entrée** : Lance `docker-entrypoint.sh` avec les variables d'environnement appropriées
5. **Nettoie** : Supprime automatiquement les fichiers temporaires à la fermeture

**Utilisation :**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variables d'environnement :**
- `PORT=8666` - Port pour le serveur Next.js (correspond à `start-local`)
- `CRON_PORT=8667` - Port pour le service cron
- `VERSION` - Défini automatiquement au format `test-YYYYMMDD-HHMMSS`

**Résultat :**
- Les journaux sont écrits dans `data/logs/application.log` (accessible par l'application)
- La sortie console affiche l'exécution du script de point d'entrée
- Appuyez sur Ctrl+C pour arrêter et tester le vidage des journaux

**Exigences :**
- Le script doit être exécuté à partir du répertoire racine du dépôt (pnpm gère cela automatiquement)
- Le script gère automatiquement tous les prérequis (build, service cron, etc.)

**Cas d'utilisation :**
- Tester les modifications du script de point d'entrée localement avant le déploiement Docker
- Vérifier la rotation des journaux et la fonctionnalité de journalisation
- Tester l'arrêt gracieux et la gestion des signaux
- Déboguer le comportement du script de point d'entrée dans un environnement local
