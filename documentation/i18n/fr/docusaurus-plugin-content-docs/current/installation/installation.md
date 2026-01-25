# Guide d'installation

L'application peut être déployée en utilisant Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), ou Podman. Après l'installation, vous pouvez configurer le FUSEAU HORAIRE et la LANGUE, comme décrit dans [Configurer le fuseau horaire et la langue](./configure-tz-lang.md) et vous devez configurer les serveurs Duplicati pour envoyer les journaux de sauvegarde à **duplistatus**, comme indiqué dans la section [Configuration de Duplicati](./duplicati-server-configuration.md).

## Prérequis

Assurez-vous d'avoir installé les éléments suivants :

- Docker Engine - [Guide d'installation Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guide d'installation Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (optionnel) - [Guide d'installation Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optionnel) - [Guide d'installation](http://podman.io/docs/installation#debian)

## Authentification

**duplistatus** depuis la version 0.9.x nécessite une authentification utilisateur. Un compte `admin` par défaut est créé automatiquement lors de l'installation de l'application pour la première fois ou lors de la mise à niveau depuis une version antérieure :
\- nom d'utilisateur : `admin`
\- mot de passe : `Duplistatus09`

Vous pouvez créer des comptes utilisateurs supplémentaires dans [Paramètres > Utilisateurs](../user-guide/settings/user-management-settings.md) après la première connexion.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Images de conteneur

Vous pouvez utiliser les images depuis :

- **Docker Hub** : `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry** : `ghcr.io/wsj-br/duplistatus:latest`

### Option 1 : Utilisation de Docker Compose

Il s'agit de la méthode recommandée pour les déploiements locaux ou lorsque vous souhaitez personnaliser la configuration. Elle utilise un fichier `docker compose` pour définir et exécuter le conteneur avec tous ses paramètres.

```bash
# télécharger le fichier compose
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# démarrer le conteneur
docker compose -f duplistatus.yml up -d
```

Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.

### Option 2 : Utilisation de Portainer Stacks (Docker Compose)

1. Accédez à « Stacks » dans votre serveur [Portainer](https://docs.portainer.io/user/docker/stacks) et cliquez sur « Add stack ».
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
      - LANG=en_GB
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

5. Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.
6. Cliquez sur « Deploy the stack ».

### Option 3 : Utilisation de Portainer Stacks (dépôt GitHub)

1. Dans [Portainer](https://docs.portainer.io/user/docker/stacks), accédez à « Stacks » et cliquez sur « Add stack ».
2. Nommez votre stack (par exemple, « duplistatus »).
3. Choisissez « Build method » comme « Repository ».
4. Entrez l'URL du dépôt : `https://github.com/wsj-br/duplistatus.git`
5. Dans le champ « Compose path », entrez : `production.yml`
6. (optionnel) Définissez les variables d'environnement `TZ`, `LANG`, `PWD_ENFORCE` et `PWD_MIN_LEN` dans la section « Environment variables ». Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.
7. Cliquez sur « Deploy the stack ».

### Option 4 : Utilisation de Docker CLI

```bash
# Créer le volume
docker volume create duplistatus_data

# Démarrer le conteneur
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- Le volume `duplistatus_data` est utilisé pour le stockage persistant. L'image du conteneur utilise `Europe/London` comme fuseau horaire par défaut et `en_GB` comme paramètres régionaux (langue) par défaut.

### Option 5 : Utilisation de Podman (CLI) `rootless`

Pour les configurations de base, vous pouvez démarrer le conteneur sans configuration DNS :

```bash
mkdir -p ~/duplistatus_data
# Démarrer le conteneur (autonome)
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Configuration du DNS pour les conteneurs Podman {#configuring-dns-for-podman-containers}

Si vous avez besoin d'une configuration DNS personnalisée (par exemple, pour Tailscale MagicDNS, les réseaux d'entreprise ou les configurations DNS personnalisées), vous pouvez configurer manuellement les serveurs DNS et les domaines de recherche.

**Trouver votre configuration DNS :**

1. **Pour les systèmes systemd-resolved** (la plupart des distributions Linux modernes) :
   ```bash
   # Obtenir les serveurs DNS
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'

   # Obtenir les domaines de recherche DNS
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Pour les systèmes non-systemd** ou comme solution de secours :

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

   Recherchez les lignes commençant par `nameserver` (pour les serveurs DNS) et `search` (pour les domaines de recherche). Si vous n'êtes pas sûr de vos paramètres DNS ou des domaines de recherche réseau, consultez votre administrateur réseau pour obtenir ces informations.

**Exemple avec configuration DNS :**

```bash
mkdir -p ~/duplistatus_data
# Démarrer le conteneur avec configuration DNS
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

**Remarque** : Ignorez les adresses IPv6 (contenant `:`) et les adresses localhost (comme `127.0.0.53`) lors de la configuration des serveurs DNS.

Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de détails sur la façon d'ajuster le fuseau horaire et le format des nombres/dates/heures.

### Option 6 : Utilisation de Podman Pods

Les pods Podman vous permettent d'exécuter plusieurs conteneurs dans un espace de noms réseau partagé. Ceci est utile pour les tests ou lorsque vous devez exécuter duplistatus aux côtés d'autres conteneurs.

**Configuration de base du pod :**

```bash
mkdir -p ~/duplistatus_data

# Créer le pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Créer le conteneur dans le pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Démarrer le pod
podman pod start duplistatus-pod
```

#### Configuration du DNS pour les Podman Pods

Lors de l'utilisation de pods, la configuration DNS doit être définie au niveau du pod, et non au niveau du conteneur.
Utilisez les mêmes méthodes décrites dans l'Option 5 pour trouver vos serveurs DNS et domaines de recherche.

**Exemple avec configuration DNS :**

```bash
mkdir -p ~/duplistatus_data

# Créer le pod avec configuration DNS
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Créer le conteneur dans le pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Démarrer le pod
podman pod start duplistatus-pod
```

**Gestion du pod :**

```bash
# Arrêter le pod (arrête tous les conteneurs dans le pod)
podman pod stop duplistatus-pod

# Démarrer le pod
podman pod start duplistatus-pod

# Supprimer le pod et tous les conteneurs
podman pod rm -f duplistatus-pod
```

## Configuration essentielle

1. Configurez vos [serveurs Duplicati](duplicati-server-configuration.md) pour envoyer les messages de journal de sauvegarde à duplistatus (requis).
2. Connectez-vous à duplistatus – voir les instructions dans le [Guide de l'utilisateur](../user-guide/overview.md#accessing-the-dashboard).
3. Collectez les journaux de sauvegarde initiaux – utilisez la fonctionnalité [Collecter les journaux de sauvegarde](../user-guide/collect-backup-logs.md) pour remplir la base de données avec les données de sauvegarde historiques de tous vos serveurs Duplicati. Cela met également à jour automatiquement les intervalles de surveillance des retards en fonction de la configuration de chaque serveur.
4. Configurez les paramètres du serveur – définissez les alias et les notes du serveur dans [Paramètres → Serveur](../user-guide/settings/server-settings.md) pour rendre votre tableau de bord plus informatif.
5. Configurez les paramètres NTFY – configurez les notifications via NTFY dans [Paramètres → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configurez les paramètres de messagerie – configurez les notifications par e-mail dans [Paramètres → E-mail](../user-guide/settings/email-settings.md).
7. Configurez les notifications de sauvegarde – configurez les notifications par sauvegarde ou par serveur dans [Paramètres → Notifications de sauvegarde](../user-guide/settings/backup-notifications-settings.md).

Consultez les sections suivantes pour configurer les paramètres optionnels tels que le fuseau horaire, le format des nombres et HTTPS.
