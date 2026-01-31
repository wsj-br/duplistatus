---
translation_last_updated: '2026-01-31T00:51:25.939Z'
source_file_mtime: '2026-01-31T00:51:08.107Z'
source_file_hash: 31f0b5f50ece70d4
translation_language: de
source_file_path: installation/installation.md
---
# Installationsleitfaden {#installation-guide}

Die Anwendung kann mit Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks) oder Podman bereitgestellt werden. Nach der Installation können Sie die ZEITZONE und SPRACHE konfigurieren, wie in den Abschnitten [Zeitzone und Sprache konfigurieren](./configure-tz-lang.md) beschrieben, und müssen die Duplicati-Server so konfigurieren, dass sie Sicherungsprotokolle an **duplistatus** senden, wie im Abschnitt [Duplicati-Konfiguration](./duplicati-server-configuration.md) dargelegt.

## Voraussetzungen {#prerequisites}

Stellen Sie sicher, dass Sie über Folgendes verfügen:

- Docker Engine - [Debian-Installationsanleitung](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux-Installationsanleitung](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker-Installationsanleitung](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installationsanleitung](http://podman.io/docs/installation#debian)

## Authentifizierung {#authentication}

**duplistatus** ab Version 0.9.x erfordert eine Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn Sie die Anwendung zum ersten Mal installieren oder von einer früheren Version aktualisieren:
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können zusätzliche Benutzerkonten in [Einstellungen > Benutzer](../user-guide/settings/user-management-settings.md) nach der ersten Anmeldung erstellen.

::::info[WICHTIG]
Das System erzwingt eine Mindestlänge und Komplexität des Passworts. Diese Anforderungen können mithilfe der Umgebungsvariablen `PWD_ENFORCE` und `PWD_MIN_LEN` [environment variables](environment-variables.md) angepasst werden. Die Verwendung eines Passworts ohne ausreichende Komplexität oder mit kurzer Länge kann die Sicherheit gefährden. Bitte verwenden Sie diese Einstellungen mit Bedacht.
::::

### Container-Images {#container-images}

Sie können die Bilder von folgenden Quellen verwenden:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Verwendung von Docker Compose {#option-1-using-docker-compose}

Dies ist die empfohlene Methode für lokale Bereitstellungen oder wenn Sie die Konfiguration anpassen möchten. Sie verwendet eine `docker compose`-Datei, um den Container mit allen seinen Einstellungen zu definieren und auszuführen.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Prüfen Sie den Abschnitt [Zeitzone und Sprache](./configure-tz-lang.md) für weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats.

### Option 2: Verwendung von Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Gehen Sie zu „Stacks" auf Ihrem [Portainer](https://docs.portainer.io/user/docker/stacks)-Server und klicken Sie auf „Stack hinzufügen".
2. Benennen Sie Ihren Stack (z. B. „duplistatus").
3. Wählen Sie „Build method" als „Web editor".
4. Kopieren Sie den folgenden Text und fügen Sie ihn im Web-Editor ein:

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

5. Prüfen Sie den Abschnitt [Zeitzone und Sprache](./configure-tz-lang.md) für weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats.
6. Klicken Sie auf „Stack bereitstellen".

### Option 3: Verwendung von Portainer Stacks (GitHub-Repository) {#option-3-using-portainer-stacks-github-repository}

1. Gehen Sie in [Portainer](https://docs.portainer.io/user/docker/stacks) zu „Stacks" und klicken Sie auf „Add stack".
2. Benennen Sie Ihren Stack (z. B. „duplistatus").
3. Wählen Sie „Build method" als „Repository".
4. Geben Sie die Repository-URL ein: `https://github.com/wsj-br/duplistatus.git`
5. Geben Sie im Feld „Compose path" ein: `production.yml`
6. (optional) Legen Sie die Umgebungsvariablen `TZ`, `LANG`, `PWD_ENFORCE` und `PWD_MIN_LEN` im Abschnitt „Environment variables" fest. Weitere Details zum Anpassen der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats finden Sie im Abschnitt [Timezone and Locale](./configure-tz-lang.md).
7. Klicken Sie auf „Deploy the stack".

### Option 4: Verwendung der Docker CLI {#option-4-using-docker-cli}

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

- Das Volume `duplistatus_data` wird für persistenten Speicherplatz verwendet. Das Container-Image verwendet `Europe/London` als Standard-Zeitzone und `en_GB` als Standard-Gebietsschema (Sprache).

### Option 5: Podman (CLI) `rootless` verwenden {#option-5-using-podman-cli-rootless}

Für grundlegende Setups können Sie den Container ohne DNS-Konfiguration starten:

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

#### Konfigurieren von DNS für Podman-Container {#configuring-dns-for-podman-containers}

Wenn Sie eine benutzerdefinierte DNS-Konfiguration benötigen (z. B. für Tailscale MagicDNS, Unternehmensnetzwerke oder benutzerdefinierte DNS-Setups), können Sie DNS-Server und Suchdomänen manuell konfigurieren.

**Ihre DNS-Konfiguration finden:**

1. **Für systemd-resolved-Systeme** (die meisten modernen Linux-Distributionen):

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Für Nicht-systemd-Systeme** oder als Fallback:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

Suchen Sie nach Zeilen, die mit `nameserver` (für DNS-Server) und `search` (für Suchdomänen) beginnen. Falls Sie sich bezüglich Ihrer DNS-Einstellungen oder Netzwerk-Suchdomänen unsicher sind, wenden Sie sich bitte an Ihren Netzwerkadministrator.

**Beispiel mit DNS-Konfiguration:**

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

Sie können mehrere DNS-Server angeben, indem Sie mehrere `--dns`-Flags hinzufügen:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Sie können mehrere Suchdomänen angeben, indem Sie mehrere `--dns-search`-Flags hinzufügen:

```bash
--dns-search example.com --dns-search internal.local
```

**Hinweis**: Überspringen Sie IPv6-Adressen (die `:` enthalten) und Localhost-Adressen (wie `127.0.0.53`) bei der Konfiguration von DNS-Server.

Prüfen Sie den Abschnitt [Zeitzone und Sprache](./configure-tz-lang.md) für weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats.

### Option 6: Verwendung von Podman Pods {#option-6-using-podman-pods}

Podman-Pods ermöglichen es Ihnen, mehrere Container in einem gemeinsamen Netzwerk-Namespace auszuführen. Dies ist nützlich zum Testen oder wenn Sie duplistatus zusammen mit anderen Containern ausführen müssen.

**Grundlegende Pod-Konfiguration:**

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

#### DNS für Podman-Pods konfigurieren {#configuring-dns-for-podman-pods}

Wann Pods verwendet werden, muss die DNS-Konfiguration auf Pod-Ebene und nicht auf Container-Ebene festgelegt werden.
Verwenden Sie die gleichen Methoden, die in Option 5 beschrieben sind, um Ihre DNS-Server und Suchdomänen zu finden.

**Beispiel mit DNS-Konfiguration:**

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

**Verwaltung des Pods:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## Wesentliche Konfiguration {#essential-configuration}

1. Konfigurieren Sie Ihre [Duplicati-Server](duplicati-server-configuration.md) so, dass sie Backup-Protokollnachrichten an duplistatus senden (erforderlich).
2. Melden Sie sich bei duplistatus an – siehe Anweisungen im [Benutzerhandbuch](../user-guide/overview.md#accessing-the-dashboard).
3. Sammeln Sie erste Backup-Protokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md), um die Datenbank mit historischen Sicherungsdaten von allen Ihren Duplicati-Servern zu füllen. Dies aktualisiert auch automatisch die Überwachungsintervalle für überfällige Sicherungen basierend auf der Konfiguration jedes Servers.
4. Konfigurieren Sie Server-Einstellungen – richten Sie Server-Aliase und Notizen unter [Einstellungen → Server](../user-guide/settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
5. Konfigurieren Sie NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY unter [Einstellungen → NTFY](../user-guide/settings/ntfy-settings.md) ein.
6. Konfigurieren Sie E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen unter [Einstellungen → E-Mail](../user-guide/settings/email-settings.md) ein.
7. Konfigurieren Sie Backup-Benachrichtigungen – richten Sie Benachrichtigungen pro Sicherung oder pro Server unter [Einstellungen → Backup-Benachrichtigungen](../user-guide/settings/backup-notifications-settings.md) ein.

Siehe die folgenden Abschnitte, um optionale Einstellungen wie Zeitzone, Zahlenformat und HTTPS zu konfigurieren.
