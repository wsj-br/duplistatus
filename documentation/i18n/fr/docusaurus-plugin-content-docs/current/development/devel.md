---
translation_last_updated: '2026-03-01T00:45:03.977Z'
source_file_mtime: '2026-03-01T00:08:30.255Z'
source_file_hash: 0fdfead3056820d5
translation_language: fr
source_file_path: development/devel.md
---
# Commandes les plus utilisées {#most-used-commands}

## Exécuter en mode développement {#run-in-dev-mode}

```bash
pnpm dev
```

- **Stockage de fichiers JSON** : Toutes les données de sauvegarde reçues sont stockées sous forme de fichiers JSON dans le répertoire `data`. Ces fichiers sont nommés à l'aide de l'horodatage du moment où ils ont été reçus, au format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (heure UTC). Cette fonctionnalité n'est active qu'en mode développement et aide au débogage en préservant les données brutes reçues de Duplicati.

- **Journalisation détaillée** : L'application enregistre des informations plus détaillées sur les opérations de base de données et les requêtes API lors de l'exécution en mode développement.

- **Mise à jour de version** : Le serveur de développement met à jour automatiquement les informations de version avant le démarrage, garantissant que la dernière version s'affiche dans l'application.

- **Suppression de sauvegarde** : Sur la page de détail du serveur, un bouton de suppression apparaît dans le tableau des sauvegardes qui vous permet de supprimer des sauvegardes individuelles. Cette fonctionnalité est particulièrement utile pour tester et déboguer la fonctionnalité des sauvegardes en retard.

## Démarrer le serveur de production (dans l'environnement de développement) {#start-the-production-server-in-development-environment}

D'abord, créez l'application pour la production locale :

```bash
pnpm build-local
```

Démarrez ensuite le serveur de production :

```bash
pnpm start-local
```

## Démarrer une pile Docker (Docker Compose) {#start-a-docker-stack-docker-compose}

```bash
pnpm docker:up
```

Ou manuellement :

```bash
docker compose up --build -d
```

## Arrêter une pile Docker (Docker Compose) {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker:down
```

Ou manuellement :

```bash
docker compose down
```

## Nettoyer l'environnement Docker {#clean-docker-environment}

```bash
pnpm docker:clean
```

Ou manuellement :

```bash
./scripts/clean-docker.sh
```

Ce script effectue un nettoyage complet de Docker, qui est utile pour :
- Libérer de l'espace disque
- Supprimer les anciens artefacts Docker inutilisés
- Nettoyer après les sessions de développement ou de test
- Maintenir un environnement Docker propre

## Créer une image de développement (pour tester localement ou avec Podman) {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
