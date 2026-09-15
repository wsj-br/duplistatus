# Installationsanleitung {/* #installation-guide */}

Die Anwendung kann mit Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), oder Podman bereitgestellt werden. Nach der Installation können Sie die ZEITZONE konfigurieren, wie in der [Zeitzonenkonfiguration](./configure-tz.md) beschrieben, und die Duplicati-Server so einrichten, dass sie Sicherungsprotokolle an **duplistatus** senden, wie in der [Duplicati-Konfiguration](./duplicati-server-configuration.md) beschrieben.

## Voraussetzungen {/* #prerequisites */}

Stellen Sie sicher, dass Sie Folgendes installiert haben:

- Docker Engine - [Debian Installationsanleitung](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux Installationsanleitung](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker Installationsanleitung](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installationsanleitung](http://podman.io/docs/installation#debian)

## Authentifizierung {/* #authentication */}

**duplistatus** ab Version 0.9.x erfordert die Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn die Anwendung zum ersten Mal installiert oder von einer älteren Version aktualisiert wird: 
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können zusätzliche Benutzerkonten in [Einstellungen > Benutzer](../user-guide/settings/user-management-settings.md) erstellen, nachdem Sie sich zum ersten Mal angemeldet haben.

Administratoren können optional [API-Schlüssel](../user-guide/settings/api-keys-settings.md) für Duplicati und Homepage erfordern und den Zugriff mit [IP-Zulassungslisten](../user-guide/settings/ip-allowlist-settings.md) einschränken. Beide sind standardmäßig deaktiviert.

::::info[WICHTIG]
Das System erzwingt eine Mindestlänge und Komplexität für Passwörter. Diese Anforderungen können mit den `PWD_ENFORCE` und `PWD_MIN_LEN` [Umgebungsvariablen](environment-variables.md) angepasst werden. Die Verwendung eines Passworts ohne ausreichende Komplexität oder mit einer kurzen Länge kann die Sicherheit beeinträchtigen. Bitte verwenden Sie diese Einstellungen sorgfältig.
::::

### Container-Images {/* #container-images */}

Sie können die Images von verwenden:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Mit Docker Compose {/* #option-1-using-docker-compose */}

Dies ist die empfohlene Methode für lokale Bereitstellungen oder wenn Sie die Konfiguration anpassen möchten. Sie verwendet eine `docker compose`-Datei, um den Container mit allen seinen Einstellungen zu definieren und auszuführen.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Überprüfen Sie den Abschnitt [Zeitzone](./configure-tz.md), um weitere Details zur Anpassung der Zeitzone und des Datums-/Uhrzeitformats zu erhalten.

### Option 2: Mit Portainer Stacks (Docker Compose) {/* #option-2-using-portainer-stacks-docker-compose */}

1. Gehen Sie zu "Stacks" auf Ihrem [Portainer](https://docs.portainer.io/user/docker/stacks) Server und klicken Sie auf "Add stack".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie "Build method" als "Web editor".
4. Kopieren und fügen Sie dies in den Web-Editor ein:

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

5. Überprüfen Sie den Abschnitt [Zeitzone](./configure-tz.md), um weitere Details zur Anpassung der Zeitzone und des Datums-/Uhrzeitformats zu erhalten.
6. Klicken Sie auf "Deploy the stack".

### Option 3: Mit Portainer Stacks (GitHub Repository) {/* #option-3-using-portainer-stacks-github-repository */}

1. Gehen Sie in [Portainer](https://docs.portainer.io/user/docker/stacks) zu "Stacks" und klicken Sie auf "Add stack".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie "Build method" als "Repository".
4. Geben Sie die Repository-URL ein: `https://github.com/wsj-br/duplistatus.git`
5. Geben Sie im Feld "Compose-Pfad" ein: `production.yml`
6. (optional) Legen Sie die `TZ`, `LANG`, `PWD_ENFORCE` und `PWD_MIN_LEN` Umgebungsvariablen im Abschnitt "Umgebungsvariablen" fest. Prüfen Sie den Abschnitt [Zeitzone](./configure-tz.md) für weitere Details zur Anpassung der Zeitzone und des Datums-/Zeitformats.
6. Klicken Sie auf "Stack bereitstellen".

### Option 4: Mit Docker CLI {/* #option-4-using-docker-cli */}

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

- Das `duplistatus_data` Volume wird für die persistente Speicherung verwendet. Das Container-Image verwendet `Europe/London` als Standardzeitzone und `en_GB` als Standard-Locale (Sprache).

### Option 5: Mit Podman (CLI) `rootless` {/* #option-5-using-podman-cli-rootless */}

Für einfache Setups können Sie den Container ohne DNS-Konfiguration starten:

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

#### DNS für Podman-Container konfigurieren {/* #configuring-dns-for-podman-containers */}

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

Suchen Sie nach Zeilen, die mit `nameserver` (für DNS-Server) und `search` (für Suchdomänen) beginnen. Wenn Sie sich unsicher sind, welche DNS-Einstellungen oder Netzwerk-Suchdomänen Sie verwenden, konsultieren Sie Ihren Netzwerkadministrator für diese Informationen.

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

Sie können mehrere DNS-Server angeben, indem Sie mehrere `--dns` Flags hinzufügen:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Sie können mehrere Suchdomänen angeben, indem Sie mehrere `--dns-search` Flags hinzufügen:

```bash
--dns-search example.com --dns-search internal.local
```

**Notiz**: Überspringen Sie IPv6-Adressen (die `:` enthalten) und localhost-Adressen (wie `127.0.0.53`) beim Konfigurieren von DNS-Servern.

Prüfen Sie den Abschnitt [Zeitzone](./configure-tz.md) für weitere Details zur Anpassung der Zeitzone und des Datums-/Zeitformats.

### Option 6: Mit Podman Pods {/* #option-6-using-podman-pods */}

Podman Pods ermöglichen es Ihnen, mehrere Container in einem gemeinsamen Netzwerk-Namespace auszuführen. Dies ist nützlich für Tests oder wenn Sie duplistatus zusammen mit anderen Containern ausführen müssen.

**Grundlegende Pod-Einrichtung:**

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

#### DNS für Podman Pods konfigurieren {/* #configuring-dns-for-podman-pods */}

Wenn Pods verwendet werden, muss die DNS-Konfiguration auf Pod-Ebene und nicht auf Container-Ebene erfolgen.
Verwenden Sie dieselben Methoden wie in Option 5 beschrieben, um Ihre DNS-Server und Suchdomänen zu finden.

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

## Wichtige Konfiguration {/* #essential-configuration */}

1. Konfigurieren Sie Ihre [Duplicati-Server](duplicati-server-configuration.md), um Backup-Protokollnachrichten an duplistatus zu senden (erforderlich). Ab Duplicati 2.0.9.106 verwenden Sie `--send-http-json-urls`, wie in der Anleitung beschrieben.
2. Melden Sie sich bei duplistatus an – siehe Anleitung im [Benutzerhandbuch](../user-guide/overview.md#accessing-the-dashboard).
3. Sammeln Sie die ersten Backup-Protokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md), um die Datenbank mit historischen Backup-Daten aus allen Ihren Duplicati-Servern zu befüllen. Dies aktualisiert auch automatisch die Backup-Überwachungsintervalle basierend auf der Konfiguration jedes Servers.
4. Konfigurieren Sie die Servereinstellungen – richten Sie Server-Aliase und Notizen in [Einstellungen → Server](../user-guide/settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
5. Konfigurieren Sie die NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY in [Einstellungen → NTFY](../user-guide/settings/ntfy-settings.md) ein.
6. Konfigurieren Sie die E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen in [Einstellungen → E-Mail](../user-guide/settings/email-settings.md) ein.
7. Konfigurieren Sie die Backup-Benachrichtigungen – richten Sie pro-Backup- oder pro-Server-Benachrichtigungen in [Einstellungen → Backup-Benachrichtigungen](../user-guide/settings/backup-notifications-settings.md) ein.

Siehe die folgenden Abschnitte, um optionale Einstellungen wie Zeitzone, Zahlenformat und [Sicherheitshärtung](security-hardening.md) zu konfigurieren.
