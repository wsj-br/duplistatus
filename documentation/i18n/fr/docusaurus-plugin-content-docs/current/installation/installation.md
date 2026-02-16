---
translation_last_updated: '2026-02-16T00:13:28.420Z'
source_file_mtime: '2026-02-15T16:25:07.956Z'
source_file_hash: 4f631551c203abfa
translation_language: fr
source_file_path: installation/installation.md
---
# Guide d'Installation {#installation-guide}

L'application peut être déployée à l'aide de Docker, [Piles Portainer](https://docs.portainer.io/user/docker/stacks), ou Podman. Après l'installation, vous souhaiterez peut-être configurer le FUSEAU HORAIRE et la LANGUE, comme décrit dans [Configurer le fuseau horaire](./configure-tz.md) et devrez configurer les serveurs Duplicati pour envoyer les journaux de sauvegarde à **duplistatus**, comme indiqué dans la section [Configuration Duplicati](./duplicati-server-configuration.md).

## Conditions préalables {#prerequisites}

Assurez-vous que vous avez les éléments suivants installés :

- Docker Engine - [Guide d'installation Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guide d'installation Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (optionnel) - [Guide d'installation Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optionnel) - [Guide d'installation](http://podman.io/docs/installation#debian)

## Authentification {#authentication}

**duplistatus** depuis la version 0.9.x nécessite une authentification utilisateur. Un compte `admin` par défaut est créé automatiquement lors de la première installation de l'application ou lors de la mise à niveau à partir d'une version antérieure :
    - Nom d'utilisateur : `admin`
    - Mot de passe : `Duplistatus09`

Vous pouvez créer des comptes utilisateurs supplémentaires dans [Paramètres > Utilisateurs](../user-guide/settings/user-management-settings.md) après la première connexion.

::::info[IMPORTANT]
Le système applique une longueur minimale et une complexité du mot de passe. Ces exigences peuvent être ajustées à l'aide des variables d'environnement `PWD_ENFORCE` et `PWD_MIN_LEN` [environment variables](environment-variables.md). L'utilisation d'un mot de passe sans complexité suffisante ou avec une longueur courte peut compromettre la sécurité. Veuillez utiliser ces paramètres avec prudence.
::::

### Images de conteneur {#container-images}

Vous pouvez utiliser les images de :

- **Docker Hub** : `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry** : `ghcr.io/wsj-br/duplistatus:latest`

### Option 1 : Utiliser Docker Compose {#option-1-using-docker-compose}

Ceci est la méthode recommandée pour les déploiements locaux ou lorsque vous souhaitez personnaliser la configuration. Elle utilise un fichier `docker compose` pour définir et exécuter le conteneur avec tous ses paramètres.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Consultez la section [Fuseau horaire](./configure-tz.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.

### Option 2 : Utilisation des Stacks Portainer (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Allez à « Stacks » dans votre serveur [Portainer](https://docs.portainer.io/user/docker/stacks) et cliquez sur « Ajouter stack ».
2. Nommez votre stack (par exemple, « duplistatus »).
3. Choisissez « Build method » comme « Web editor ».
4. Copiez et collez ceci dans l'éditeur web :

```yaml
# duplistatus production compose.yml
services:
  duplistatus:
    image: ghcr.io/wsj-br/duplistatus:latest
    container_name: duplistatus
    restart: unless-stopped
    environment:
      - TZ=Europe/London
      - PWD_ENFORCE=true
      - PWD_MIN_LEN=8
    ports:
      - "9666:9666"
    volumes:
      - duplistatus_data:/app/data
    networks:
      - duplistatus_network

networks:
  duplistatus_network:
    driver: bridge

volumes:
  duplistatus_data:
    name: duplistatus_data
``` 

5. Consultez la section [Fuseau horaire](./configure-tz.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.
6. Cliquez sur « Déployer la pile ».

### Option 3 : Utilisation des piles Portainer (référentiel GitHub) {#option-3-using-portainer-stacks-github-repository}

1. Dans [Portainer](https://docs.portainer.io/user/docker/stacks), accédez à « Piles » et cliquez sur « Ajouter une pile ».
2. Nommez votre pile (par exemple, « duplistatus »).
3. Choisissez « Méthode de construction » comme « Dépôt ».
4. Entrez l'URL du dépôt : `https://github.com/wsj-br/duplistatus.git`
5. Dans le champ « Chemin du compose », entrez : `production.yml`
6. (optionnel) Définissez les variables d'environnement `TZ`, `LANG`, `PWD_ENFORCE` et `PWD_MIN_LEN` dans la section « Variables d'environnement ». Consultez la section [Fuseau horaire](./configure-tz.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.
6. Cliquez sur « Déployer la pile ».

### Option 4 : Utilisation de Docker CLI {#option-4-using-docker-cli}

```bash
# Create the volume
docker volume create duplistatus_data

# Start the container
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- Le volume `duplistatus_data` est utilisé pour le stockage persistant. L'image de conteneur utilise `Europe/London` comme fuseau horaire par défaut et `en_GB` comme langue par défaut.

### Option 5 : Utilisation de Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

Pour les configurations de base, vous pouvez démarrer le conteneur sans configuration DNS :

```bash
mkdir -p ~/duplistatus_data
# Start the container (standalone)
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Configuration de DNS pour les conteneurs Podman {#configuring-dns-for-podman-containers}

Si vous avez besoin d'une configuration DNS personnalisée (par exemple, pour Tailscale MagicDNS, les réseaux d'entreprise ou les configurations DNS personnalisées), vous pouvez configurer manuellement les serveurs DNS et les domaines de recherche.

**Trouver votre configuration DNS :**

1. **Pour les systèmes systemd-resolved** (la plupart des distributions Linux modernes) :

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Pour les systèmes non-systemd** ou en secours :

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

Recherchez les lignes commençant par `nameserver` (pour les serveurs DNS) et `search` (pour les domaines de recherche). Si vous n'êtes pas sûr de vos paramètres DNS ou de vos domaines de recherche réseau, consultez votre administrateur réseau pour obtenir ces informations.

**Exemple avec configuration DNS :**

```bash
mkdir -p ~/duplistatus_data
# Start the container with DNS configuration
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  --dns 100.100.100.100 \
  --dns-search example.com \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

Vous pouvez spécifier plusieurs serveurs DNS en ajoutant plusieurs drapeaux `--dns` :

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Vous pouvez spécifier plusieurs domaines de recherche en ajoutant plusieurs drapeaux `--dns-search` :

```bash
--dns-search example.com --dns-search internal.local
```

**Note** : Ignorer les adresses IPv6 (contenant `:`) et les adresses localhost (comme `127.0.0.53`) lors de la configuration des serveurs DNS.

Consultez la section [Fuseau horaire](./configure-tz.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.

### Option 6 : Utilisation des pods Podman {#option-6-using-podman-pods}

Les pods Podman vous permettent d'exécuter plusieurs conteneurs dans un espace de noms réseau partagé. Ceci est utile pour les tests ou quand vous avez besoin d'exécuter duplistatus aux côtés d'autres conteneurs.

**Configuration de base du pod :**

```bash
mkdir -p ~/duplistatus_data

# Create the pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

#### Configuration de DNS pour les pods Podman {#configuring-dns-for-podman-pods}

Quand vous utilisez des pods, la configuration DNS doit être définie au niveau du pod, et non au niveau du conteneur.
Utilisez les mêmes méthodes décrites dans l'Option 5 pour trouver vos serveurs DNS et domaines de recherche.

**Exemple avec configuration DNS :**

```bash
mkdir -p ~/duplistatus_data

# Create the pod with DNS configuration
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

**Gestion du pod :**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## Configuration Essentielle {#essential-configuration}

1. Configurez vos [serveurs Duplicati](duplicati-server-configuration.md) pour envoyer les messages de journaux de sauvegarde à duplistatus (requis).
2. Connectez-vous à duplistatus – consultez les instructions dans le [Guide de l'utilisateur](../user-guide/overview.md#accessing-the-dashboard).
3. Collectez les journaux de sauvegarde initiaux – utilisez la fonctionnalité [Collecter les journaux de sauvegarde](../user-guide/collect-backup-logs.md) pour remplir la base de données avec les données de sauvegarde historiques de tous vos serveurs Duplicati. Cela met également à jour automatiquement les intervalles de surveillance de sauvegarde en fonction de la configuration de chaque serveur.
4. Configurez les paramètres du serveur – configurez les alias de serveur et les notes dans [Paramètres → Serveur](../user-guide/settings/server-settings.md) pour rendre votre tableau de bord plus informatif.
5. Configurez les paramètres NTFY – configurez les notifications via NTFY dans [Paramètres → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configurez les paramètres e-mail – configurez les notifications par e-mail dans [Paramètres → E-mail](../user-guide/settings/email-settings.md).
7. Configurez les notifications de sauvegarde – configurez les notifications par sauvegarde ou par serveur dans [Paramètres → Notifications de sauvegarde](../user-guide/settings/backup-notifications-settings.md).

Consultez les sections suivantes pour configurer les paramètres optionnels tels que le fuseau horaire, le format des nombres et HTTPS.
