---
translation_last_updated: '2026-05-11T14:27:40.221Z'
source_file_mtime: '2026-05-06T23:18:51.406Z'
source_file_hash: 9d4cf0118b57183b62975b8e1557d2da7033073c6a7bd0b3131a0a0efa508862
translation_language: fr
source_file_path: documentation/docs/development/devel.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
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

Ce script effectue un nettoyage complet de Docker, ce qui est utile pour :
- Libérer de l'espace disque
- Supprimer d'anciens objets Docker inutilisés
- Nettoyer après des sessions de développement ou de test
- Maintenir un environnement Docker propre

## Créer une image de développement (pour tester localement ou avec Podman) {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
