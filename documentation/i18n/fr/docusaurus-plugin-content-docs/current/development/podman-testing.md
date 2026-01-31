---
translation_last_updated: '2026-01-31T00:51:19.902Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 841b30d8ee97e362
translation_language: fr
source_file_path: development/podman-testing.md
---
# Test Podman {#podman-testing}

Copiez et exécutez les scripts situés à `scripts/podman_testing` sur le Serveur de test Podman.

## Configuration initiale et gestion {#initial-setup-and-management}

1. `copy.docker.duplistatus.local` : Copie l'image Docker du démon Docker local vers Podman (pour les tests locaux).
2. `copy.docker.duplistatus.remote` : Copie l'image Docker d'un Serveur de développement distant vers Podman (nécessite un accès SSH).
   - Créez l'image sur le Serveur de développement en utilisant : `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus` : Démarre le conteneur en mode rootless.
4. `pod.testing` : Teste le conteneur à l'intérieur d'un pod Podman (avec les privilèges root).
5. `stop.duplistatus` : Arrête le pod et supprime le conteneur.
6. `clean.duplistatus` : Arrête les conteneurs, supprime les pods et nettoie les anciennes images.

## Configuration DNS {#dns-configuration}

Les scripts détectent et configurent automatiquement les paramètres DNS à partir du système hôte :

- **Détection Automatique** : Utilise `resolvectl status` (systemd-resolved) pour extraire les serveurs DNS et les domaines de recherche
- **Support de Secours** : Bascule vers l'analyse de `/etc/resolv.conf` sur les systèmes non-systemd
- **Filtrage Intelligent** : Filtre automatiquement les adresses localhost et les serveurs de noms IPv6
- **Fonctionne avec** :
  - Tailscale MagicDNS (100.100.100.100)
  - Les serveurs DNS d'entreprise
  - Les configurations réseau standard
  - Les configurations DNS personnalisées

Non, aucune configuration DNS manuelle n'est nécessaire - les scripts la gèrent automatiquement !

## Surveillance et vérifications de santé {#monitoring-and-health-checks}

- `check.duplistatus`: Vérifie les journaux, la connectivité et l'état de santé de l'application.

## Commandes de débogage {#debugging-commands}

- `logs.duplistatus`: Affiche les journaux de la capsule.
- `exec.shell.duplistatus`: Ouvre un shell dans le conteneur.
- `restart.duplistatus`: Arrête la capsule, supprime le conteneur, copie l'image, crée le conteneur et démarre la capsule.

## Flux de travail d'utilisation {#usage-workflow}

### Serveur de développement {#development-server}

Créer l'image Docker sur le serveur de développement :

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Serveur Podman {#podman-server}

1. Transférer l'image Docker :
   - Utilisez `./copy.docker.duplistatus.local` si Docker et Podman se trouvent sur la même machine
   - Utilisez `./copy.docker.duplistatus.remote` si vous copiez à partir d'un serveur de développement distant (nécessite un fichier `.env` avec `REMOTE_USER` et `REMOTE_HOST`)
2. Démarrer le conteneur avec `./start.duplistatus` (autonome, sans privilèges root)
   - Ou utilisez `./pod.testing` pour tester en mode pod (avec root)
3. Surveiller avec `./check.duplistatus` et `./logs.duplistatus`
4. Arrêter avec `./stop.duplistatus` une fois terminé
5. Utilisez `./restart.duplistatus` pour un cycle de redémarrage complet (arrêt, copie de l'image, démarrage)
   - **Note** : Ce script référence actuellement `copy.docker.duplistatus` qui devrait être remplacé par la variante `.local` ou `.remote`
6. Utilisez `./clean.duplistatus` pour supprimer les conteneurs, les pods et les anciennes images

# Test de l'application {#testing-the-application}

Si vous exécutez le serveur Podman sur la même machine, utilisez `http://localhost:9666`.

Si vous êtes sur un autre serveur, obtenez l'URL avec :

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Notes Importantes {#important-notes}

### Mise en réseau des pods Podman {#podman-pod-networking}

Quand l'application s'exécute dans des pods Podman, elle nécessite :
- Une configuration DNS explicite (gérée automatiquement par le script `pod.testing`)
- Une liaison de port à toutes les interfaces (`0.0.0.0:9666`)

Les scripts gèrent automatiquement ces exigences - aucune configuration manuelle n'est nécessaire.

### Mode sans root vs Mode root {#rootless-vs-root-mode}

- **Mode autonome** (`start.duplistatus`) : S'exécute sans privilèges root avec `--userns=keep-id`
- **Mode pod** (`pod.testing`) : S'exécute en tant que root à l'intérieur du pod à des fins de test

Les deux modes fonctionnent correctement avec la détection DNS automatique.

## Configuration de l'environnement {#environment-configuration}

Les deux `copy.docker.duplistatus.local` et `copy.docker.duplistatus.remote` nécessitent un fichier `.env` dans le répertoire `scripts/podman_testing` :

**Pour la copie locale** (`copy.docker.duplistatus.local`) :

```
IMAGE=wsj-br/duplistatus:devel
```

**Pour la copie à distance** (`copy.docker.duplistatus.remote`) :

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

Le script `start.duplistatus` nécessite un fichier `.env` contenant au minimum la variable `IMAGE` :

```
IMAGE=wsj-br/duplistatus:devel
```

**Note** : Le message d'erreur du script mentionne `REMOTE_USER` et `REMOTE_HOST`, mais ceux-ci ne sont pas réellement utilisés par `start.duplistatus`—seul `IMAGE` est requis.
