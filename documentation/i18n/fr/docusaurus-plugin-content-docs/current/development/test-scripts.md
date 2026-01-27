# Scripts de test {#test-scripts}

Le projet inclut plusieurs scripts de test pour aider au développement et aux tests :

## Générer des données de test {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

Ce script génère des données de sauvegarde de test pour plusieurs serveurs et sauvegardes.

Le paramètre `--servers=N` est **obligatoire** et spécifie le nombre de serveurs à générer (1-30).

Utilisez l'option `--upload` pour envoyer les données générées à `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**Exemples :**

```bash
# Générer des données pour 5 serveurs {#generate-data-for-5-servers}
pnpm generate-test-data --servers=5

# Générer des données pour 1 serveur avec mode téléversement {#generate-data-for-1-server-with-upload-mode}
pnpm generate-test-data --upload --servers=1

# Générer des données pour tous les 30 serveurs {#generate-data-for-all-30-servers}
pnpm generate-test-data --servers=30
```

> [!CAUTION]
> This script deletes all previous data in the database and replaces it with test data.
> Sauvegardez votre base de données avant d'exécuter ce script.

## Afficher le contenu des notifications en retard (pour déboguer le système de notification) {#show-the-overdue-notifications-contents-to-debug-notification-system}

```bash
pnpm show-overdue-notifications
```

## Exécuter la vérification en retard à une date/heure spécifique (pour déboguer le système de notification) {#run-overdue-check-at-a-specific-datetime-to-debug-notification-system}

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
```

## Tester la connectivité du port du service cron {#test-cron-service-port-connectivity}

Pour tester la connectivité du service cron, vous pouvez :

1. Vérifier si le service cron est en cours d'exécution :

```bash
curl http://localhost:8667/health
```

2. Ou utilisez les points de terminaison de l'API du service cron directement via l'application principale :

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

Ce script teste la logique de détection de sauvegarde en retard. Il vérifie :

- Identification de sauvegarde en retard
- Déclenchement de notification
- Calculs de date/heure pour le statut en retard

Utile pour déboguer la détection de sauvegarde en retard et les systèmes de notification.

## Valider l'export CSV {#validate-csv-export}

```bash
pnpm validate-csv-export
```

Ce script valide la fonctionnalité d'export CSV. Il :

- Teste la génération d'export CSV
- Vérifie le format et la structure des données
- Vérifie l'intégrité des données dans les fichiers exportés

Utile pour s'assurer que les exports CSV fonctionnent correctement avant les versions.

## Bloquer temporairement le serveur NTFY (pour les tests) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Ce script bloque temporairement l'accès réseau sortant au serveur NTFY (`ntfy.sh`) pour tester le mécanisme de réessai de notification. Il :

- Résout l'adresse IP du serveur NTFY
- Ajoute une règle iptables pour bloquer le trafic sortant
- Bloque pendant 10 secondes (configurable)
- Supprime automatiquement la règle de blocage à la sortie
- Nécessite les privilèges root (sudo)

> [!CAUTION]
> This script modifies iptables rules and requires root privileges. À utiliser uniquement pour tester les mécanismes de réessai de notification.

## Test de migration de base de données {#database-migration-testing}

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

**Sortie :**

- Fichiers de base de données : `scripts/migration_test_data/backups_<VERSION>.db`
- Fichiers de schéma : `scripts/migration_test_data/backups_<VERSION>.schema`
- Captures d'écran : `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuration :**

- Nombre de serveurs : Défini via la variable `SERVERS` (par défaut : 3)
- Répertoire de données : `/var/lib/docker/volumes/duplistatus_data/_data`
- Port : 9666 (port du conteneur Docker)

> [!CAUTION]
> This script requires Docker and will stop/remove existing containers. Il nécessite également un accès sudo pour les opérations Docker et l'accès au système de fichiers. Vous devez d'abord exécuter le script `pnpm take-screenshots` pour installer Google Chrome si vous ne l'avez pas déjà fait.

> [!IMPORTANT]
> This script was supposed to run only once, as new versions the developer can copy the database file and screenshots directly to the `scripts/migration_test_data/` directory. Pendant le développement, exécutez simplement le script `./scripts/test-migrations.sh` pour tester les migrations.

### Tester les migrations de base de données {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

Ce script teste les migrations de base de données à partir d'anciennes versions vers la version actuelle (4.0). Il :

1. **Pour chaque version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21) :
   - Crée une copie temporaire de la base de données de test
   - Exécute le processus de migration à l'aide de `test-migration.ts`
   - Valide la structure de la base de données migrée
   - Vérifie la présence des tables et colonnes requises
   - Vérifie que la version de la base de données est 4.0
   - Nettoie les fichiers temporaires

**Exigences :**

- Les bases de données de test doivent exister dans `scripts/migration_test_data/`
- Générées en exécutant d'abord `generate-migration-test-data.sh`

**Sortie :**

- Résultats de test codés par couleur (vert pour réussi, rouge pour échoué)
- Résumé des versions réussies et échouées
- Messages d'erreur détaillés pour les migrations échouées
- Code de sortie 0 si tous les tests réussissent, 1 si l'un échoue

**Ce qu'il valide :**

- La version de la base de données est 4.0 après la migration
- Tous les tableaux requis existent : `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Les colonnes requises existent dans chaque tableau
- La structure de la base de données est correcte

**Exemple de sortie :**

```
==========================================
Suite de test de migration de base de données
==========================================

Test des migrations à partir d'anciennes versions vers la version 4.0
Répertoire de données de test : /path/to/migration_test_data
Répertoire temporaire : /path/to/migration_test_data/.tmp

----------------------------------------
Version de test : v0.4.0
----------------------------------------
  Copie du fichier de base de données vers l'emplacement temporaire...
  Exécution du test de migration...
✅ Version v0.4.0 : Test de migration RÉUSSI

==========================================
Résumé du test
==========================================

✅ Versions réussies (5) :
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

Tous les tests de migration ont réussi !
```

**Utilisation :**

```bash
# Exécuter tous les tests de migration {#run-all-migration-tests}
./scripts/test-migrations.sh

# Vérifier le code de sortie {#check-exit-code}
echo $?  # 0 = tous réussis, 1 = certains échoués
```

> [!NOTE]
> This script uses the TypeScript migration test script (`test-migration.ts`) internally. Le script de test valide la structure de la base de données après la migration et garantit l'intégrité des données.

## Définir la configuration de test SMTP {#set-smtp-test-configuration}

```bash
pnpm set-smtp-test-config <connectionType>
```

Ce script définit la configuration de test SMTP à partir des variables d'environnement. Il accepte un paramètre `connectionType` (`plain`, `starttls` ou `ssl`) et lit les variables d'environnement correspondantes avec des préfixes (`PLAIN_`, `STARTTLS_`, `SSL_`) pour mettre à jour la configuration SMTP dans la base de données.

Pour les connexions simples, le script lit la variable d'environnement `PLAIN_SMTP_FROM` pour définir l'adresse d'expéditeur requise. Cela facilite le test de différents types de connexion SMTP sans mises à jour manuelles de la base de données.

**Utilisation :**

```bash
# Définir la configuration SMTP simple {#set-plain-smtp-configuration}
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
pnpm set-smtp-test-config plain

# Définir la configuration STARTTLS {#set-starttls-configuration}
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
pnpm set-smtp-test-config starttls

# Définir la configuration SSL/TLS direct {#set-direct-ssltls-configuration}
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm set-smtp-test-config ssl
```

**Exigences :**

- L'application doit être en cours d'exécution
- Les variables d'environnement doivent être définies avec le préfixe approprié pour le type de connexion
- Pour les connexions simples, `PLAIN_SMTP_FROM` est requis

## Tester la compatibilité croisée du type de connexion SMTP {#test-smtp-connection-type-cross-compatibility}

```bash
pnpm test-smtp-connections
```

Ce script effectue un test de matrice 3x3 complet qui valide si les configurations destinées à un type de connexion fonctionnent correctement avec différents types de connexion. Pour chaque type de configuration de base (plain, starttls, ssl), le script :

1. Lit les variables d'environnement avec les préfixes correspondants (`PLAIN_*`, `STARTTLS_*`, `SSL_*`)
2. Teste les trois types de connexion en modifiant uniquement le champ `connectionType`
3. Envoie des e-mails de test via l'API
4. Enregistre les résultats dans un format de matrice
5. Affiche un tableau récapitulatif
6. Enregistre les résultats détaillés dans `smtp-test-results.json`

**Utilisation :**

```bash
# Définir les variables d'environnement pour les trois types de connexion {#set-environment-variables-for-all-three-connection-types}
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
- Le script valide la configuration utilisée via une journalisation détaillée

**Comportement attendu :**
Les configurations ne doivent fonctionner qu'avec leur type de connexion prévu (par exemple, la configuration simple fonctionne avec le type de connexion simple mais échoue avec starttls/ssl).

**Sortie :**

- Sortie de console avec un tableau récapitulatif montrant les résultats des tests
- Fichier `smtp-test-results.json` avec les résultats de test détaillés pour chaque combinaison de configuration et de type de connexion

## Tester le script de point d'entrée Docker {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

Ce script fournit un wrapper de test pour `docker-entrypoint.sh` dans le développement local. Il configure l'environnement pour tester la fonctionnalité de journalisation du point d'entrée et garantit que les journaux sont écrits dans `data/logs/` afin que l'application puisse y accéder.

**Ce qu'il fait :**

1. **Construit toujours une version fraîche** : Exécute automatiquement `pnpm build-local` pour créer une version fraîche avant le test (pas besoin de construire manuellement en premier)
2. **Construit le service cron** : Garantit que le service cron est construit (`dist/cron-service.cjs`)
3. **Configure la structure de type Docker** : Crée les symlinks et la structure de répertoire nécessaires pour imiter l'environnement Docker
4. **Exécute le script de point d'entrée** : Exécute `docker-entrypoint.sh` avec les variables d'environnement appropriées
5. **Nettoie** : Supprime automatiquement les fichiers temporaires à la sortie

**Utilisation :**

```bash
# Exécuter le test (construit automatiquement une version fraîche) {#run-the-test-builds-fresh-version-automatically}
pnpm test-entrypoint
```

**Variables d'environnement :**

- `PORT=8666` - Port pour le serveur Next.js (correspond à `start-local`)
- `CRON_PORT=8667` - Port pour le service cron
- `VERSION` - Défini automatiquement au format `test-YYYYMMDD-HHMMSS`

**Sortie :**

- Les journaux sont écrits dans `data/logs/application.log` (accessible par l'application)
- La sortie de console affiche l'exécution du script de point d'entrée
- Appuyez sur Ctrl+C pour arrêter et tester le vidage des journaux

**Exigences :**

- Le script doit être exécuté à partir du répertoire racine du référentiel (pnpm gère cela automatiquement)
- Le script gère automatiquement tous les prérequis (construction, service cron, etc.)

**Cas d'utilisation :**

- Test des modifications du script de point d'entrée localement avant le déploiement Docker
- Vérification de la rotation des journaux et de la fonctionnalité de journalisation
- Test de l'arrêt gracieux et de la gestion des signaux
- Débogage du comportement du script de point d'entrée dans un environnement local


