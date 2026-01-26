# Guide d'installation {#installation-guide}

L'application peut être déployée à l'aide de Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), ou Podman. Après l'installation, vous souhaiterez peut-être Configurer le FUSEAU HORAIRE et la LANGUE, comme décrit dans la section [Configurer le fuseau horaire et la langue](./configure-tz-lang.md) et vous devez Configurer les serveurs Duplicati pour envoyer les Journaux de sauvegarde à **duplistatus**, comme indiqué dans la section [Configuration Duplicati](./duplicati-server-configuration.md).

## Conditions préalables {#prerequisites}

Assurez-vous que les éléments suivants sont installés :

- Docker Engine - [Guide d'installation Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guide d'installation Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (optionnel) - [Guide d'installation Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optionnel) - [Guide d'installation](http://podman.io/docs/installation#debian)

## Authentification {#authentication}

**duplistatus** depuis la version 0.9.x nécessite une authentification de l'Utilisateur. Un compte `admin` par défaut est créé automatiquement lors de l'installation de l'application pour la première fois ou lors de la mise à niveau à partir d'une version antérieure :
\- nom d'utilisateur : `admin`
\- mot de passe : `Duplistatus09`

Vous pouvez créer des comptes Utilisateurs supplémentaires dans [Paramètres > Utilisateurs](../user-guide/settings/user-management-settings.md) après la première Connexion.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Images de conteneur {#container-images}

Vous pouvez utiliser les images de :

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1 : Utiliser Docker Compose {#option-1-using-docker-compose}

Ceci est la méthode recommandée pour les déploiements locaux ou quand vous souhaitez personnaliser la configuration. Il utilise un fichier `docker compose` pour définir et exécuter le conteneur avec Tous ses Paramètres.

```bash
# télécharger le fichier compose {#download-the-compose-file}
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# Démarrer le conteneur {#start-the-container}
docker compose -f duplistatus.yml up -d
```

Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de Détails sur la façon d'ajuster le Fuseau horaire et le format des nombres/Date/Format d'heure.

### Option 2 : Utiliser Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Allez à "Stacks" dans votre serveur [Portainer](https://docs.portainer.io/user/docker/stacks) et cliquez sur "Ajouter stack".
2. Nommez votre stack (par exemple, "duplistatus").
3. Choisissez "Build method" comme "Web editor".
4. Copier et coller ceci dans l'éditeur web :

```yaml
# duplistatus production compose.yml {#duplistatus-production-composeyml}
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

5. Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de Détails sur la façon d'ajuster le Fuseau horaire et le format des nombres/Date/Format d'heure.
6. Cliquez sur "Deploy the stack".

### Option 3 : Utiliser Portainer Stacks (Référentiel GitHub) {#option-3-using-portainer-stacks-github-repository}

1. Dans [Portainer](https://docs.portainer.io/user/docker/stacks), allez à "Stacks" et cliquez sur "Ajouter stack".
2. Nommez votre stack (par exemple, "duplistatus").
3. Choisissez "Build method" comme "Repository".
4. Entrez l'URL du référentiel : `https://github.com/wsj-br/duplistatus.git`
5. Dans le champ "Compose path", entrez : `production.yml`
6. (optionnel) Définissez les variables d'environnement `TZ`, `LANG`, `PWD_ENFORCE` et `PWD_MIN_LEN` dans la section "Environment variables". Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de Détails sur la façon d'ajuster le Fuseau horaire et le format des nombres/Date/Format d'heure.
7. Cliquez sur "Deploy the stack".

### Option 4 : Utiliser Docker CLI {#option-4-using-docker-cli}

```bash
# Créer le volume {#create-the-volume}
docker volume create duplistatus_data

# Démarrer le conteneur {#start-the-container}
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- Le volume `duplistatus_data` est utilisé pour le Stockage persistant. L'image de conteneur utilise `Europe/London` comme Fuseau horaire par défaut et `en_GB` comme paramètres régionaux par défaut (Langue).

### Option 5 : Utiliser Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

Pour les configurations de base, vous pouvez Démarrer le conteneur sans configuration DNS :

```bash
mkdir -p ~/duplistatus_data
# Démarrer le conteneur (autonome) {#start-the-container-standalone}
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

Si vous avez besoin d'une configuration DNS Personnalisée (par exemple, pour Tailscale MagicDNS, les réseaux d'entreprise ou les configurations DNS personnalisées), vous pouvez Configurer manuellement les Serveurs DNS et les domaines de Recherche.

**Trouver votre configuration DNS :**

1. **Pour les Systèmes systemd-resolved** (la plupart des distributions Linux modernes) :
   ```bash
   # Obtenir les Serveurs DNS
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'

   # Obtenir les domaines de Recherche DNS
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Pour les Systèmes non-systemd** ou comme solution de secours :

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

   Recherchez les lignes commençant par `nameserver` (pour les Serveurs DNS) et `search` (pour les domaines de Recherche). Si vous n'êtes pas sûr de vos Paramètres DNS ou des domaines de Recherche du réseau, consultez votre administrateur réseau pour ces informations.

**Exemple avec configuration DNS :**

```bash
mkdir -p ~/duplistatus_data
# Démarrer le conteneur avec configuration DNS {#start-the-container-with-dns-configuration}
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

Vous pouvez spécifier plusieurs Serveurs DNS en Ajoutant plusieurs drapeaux `--dns` :

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Vous pouvez spécifier plusieurs domaines de Recherche en Ajoutant plusieurs drapeaux `--dns-search` :

```bash
--dns-search example.com --dns-search internal.local
```

**Note** : Ignorez les adresses IPv6 (contenant `:`) et les adresses localhost (comme `127.0.0.53`) quand vous Configurez les Serveurs DNS.

Consultez la section [Fuseau horaire et paramètres régionaux](./configure-tz-lang.md) pour plus de Détails sur la façon d'ajuster le Fuseau horaire et le format des nombres/Date/Format d'heure.

### Option 6 : Utiliser Podman Pods {#option-6-using-podman-pods}

Les pods Podman vous permettent d'exécuter plusieurs conteneurs dans un espace de noms réseau partagé. Ceci est utile pour les tests ou quand vous avez besoin d'exécuter duplistatus aux côtés d'autres conteneurs.

**Configuration de pod de base :**

```bash
mkdir -p ~/duplistatus_data

# Créer le pod {#create-the-pod}
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Créer le conteneur dans le pod {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Démarrer le pod {#start-the-pod}
podman pod start duplistatus-pod
```

#### Configuration de DNS pour Podman Pods {#configuring-dns-for-podman-pods}

Quand vous utilisez des pods, la configuration DNS doit être définie au niveau du pod, pas au niveau du conteneur.
Utilisez les mêmes méthodes décrites dans l'Option 5 pour trouver vos Serveurs DNS et domaines de Recherche.

**Exemple avec configuration DNS :**

```bash
mkdir -p ~/duplistatus_data

# Créer le pod avec configuration DNS {#create-the-pod-with-dns-configuration}
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Créer le conteneur dans le pod {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Démarrer le pod {#start-the-pod}
podman pod start duplistatus-pod
```

**Gestion du pod :**

```bash
# Arrêter le pod (arrête Tous les conteneurs du pod) {#stop-the-pod-stops-all-containers-in-the-pod}
podman pod stop duplistatus-pod

# Démarrer le pod {#start-the-pod}
podman pod start duplistatus-pod

# Supprimer le pod et Tous les conteneurs {#remove-the-pod-and-all-containers}
podman pod rm -f duplistatus-pod
```

## Configuration essentielle {#essential-configuration}

1. Configurez vos [Serveurs Duplicati](duplicati-server-configuration.md) pour envoyer les Messages de Journaux de sauvegarde à duplistatus (requis).
2. Se connecter à duplistatus – voir les instructions dans le [Guide de l'Utilisateur](../user-guide/overview.md#accessing-the-dashboard).
3. Collecter les Journaux de sauvegarde initiaux – utilisez la fonctionnalité [Collecter les journaux de sauvegarde](../user-guide/collect-backup-logs.md) pour remplir la base de données avec les données de sauvegarde historiques de Tous vos Serveurs Duplicati. Cela met également à jour automatiquement les intervalles de surveillance en retard en fonction de la configuration de chaque Serveurs.
4. Configurez les Paramètres du Serveurs – configurez les alias du Serveurs et les Notes dans [Paramètres → Serveurs](../user-guide/settings/server-settings.md) pour rendre votre Tableau de bord plus informatif.
5. Configurez les Paramètres NTFY – configurez les Notifications via NTFY dans [Paramètres → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configurez les Paramètres e-mail – configurez les Notifications par e-mail dans [Paramètres → E-mail](../user-guide/settings/email-settings.md).
7. Configurez les Notifications de sauvegarde – configurez les Notifications par sauvegarde ou par Serveurs dans [Paramètres → Notifications de sauvegarde](../user-guide/settings/backup-notifications-settings.md).

Consultez les sections suivantes pour Configurer les Paramètres optionnels tels que le Fuseau horaire, le Format des nombres et HTTPS.
