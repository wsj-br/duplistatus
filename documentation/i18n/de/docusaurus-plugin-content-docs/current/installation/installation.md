# Installationsanleitung {/* #installation-guide */}

Die Anwendung kann mit Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks) oder Podman bereitgestellt werden. Nach der Installation sollten Sie die Zeitzone konfigurieren, wie unter [Zeitzone konfigurieren](./configure-tz.md) beschrieben, und die Duplicati-Server so einrichten, dass sie Sicherungsprotokolle an **duplistatus** senden, wie im Abschnitt [Duplicati-Konfiguration](./duplicati-server-configuration.md) erläutert.

## Voraussetzungen {/* #prerequisites */}

Stellen Sie sicher, dass Folgendes installiert ist:

- Docker Engine - [Installationsanleitung für Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Installationsanleitung für Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Installationsanleitung für Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installationsanleitung](http://podman.io/docs/installation#debian)

## Authentifizierung {/* #authentication */}

**duplistatus** ab Version 0.9.x erfordert Benutzerauthentifizierung. Ein Standardkonto `admin` wird automatisch erstellt, wenn Sie die Anwendung zum ersten Mal installieren oder von einer früheren Version aktualisieren: 
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Sie können nach dem ersten Login weitere Benutzerkonten in [Einstellungen > Benutzer](../user-guide/settings/user-management-settings.md) erstellen.

Administratoren können optional [API-Schlüssel](../user-guide/settings/api-keys-settings.md) für Duplicati und Homepage verlangen und den Zugriff über [IP-Zulassungslisten](../user-guide/settings/ip-allowlist-settings.md) beschränken. Beides ist standardmäßig deaktiviert.

::::info[WICHTIG]
Das System erzwingt eine Mindestlänge und Komplexität für das Passwort. Diese Anforderungen können mit den Umgebungsvariablen `PWD_ENFORCE` und `PWD_MIN_LEN` angepasst werden ([environment variables](environment-variables.md)). Die Verwendung eines Passworts ohne ausreichende Komplexität oder mit einer kurzen Länge kann die Sicherheit beeinträchtigen. Bitte verwenden Sie diese Einstellungen sorgfältig.
::::

### Container-Images {/* #container-images */}

Sie können die Images verwenden von:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Verwendung von Docker Compose {/* #option-1-using-docker-compose */}

Dies ist die empfohlene Methode für lokale Bereitstellungen oder wenn Sie die Konfiguration anpassen möchten. Es verwendet eine Datei `docker compose`, um den Container mit all seinen Einstellungen zu definieren und auszuführen.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Zeitformats finden Sie im Abschnitt [Zeitzone](./configure-tz.md).

### Option 2: Verwendung von Portainer Stacks (Docker Compose) {/* #option-2-using-portainer-stacks-docker-compose */}

1. Gehen Sie zu "Stacks" auf Ihrem [Portainer](https://docs.portainer.io/user/docker/stacks)-Server und klicken Sie auf "Add stack".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie als "Build method" "Web editor".
4. Kopieren Sie diesen Inhalt in den Web-Editor:

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

5. Weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Zeitformats finden Sie im Abschnitt [Zeitzone](./configure-tz.md).
6. Klicken Sie auf "Deploy the stack".

### Option 3: Verwendung von Portainer Stacks (GitHub-Repository) {/* #option-3-using-portainer-stacks-github-repository */}

1. Gehen Sie in [Portainer](https://docs.portainer.io/user/docker/stacks) zu "Stacks" und klicken Sie auf "Add stack".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie als "Build method" "Repository".
4. Geben Sie die Repository-URL ein: `https://github.com/wsj-br/duplistatus.git`
5. Geben Sie im Feld „Compose-Pfad“ Folgendes ein: `production.yml`
6. (optional) Legen Sie die Umgebungsvariablen `TZ`, `LANG`, `PWD_ENFORCE` und `PWD_MIN_LEN` im Abschnitt „Umgebungsvariablen“ fest. Prüfen Sie den Abschnitt [Zeitzone](./configure-tz.md), um weitere Details zur Anpassung der Zeitzone sowie des Zahlen-/Datum-/Zeitformats zu erhalten.
6. Klicken Sie auf „Stack bereitstellen“.

### Option 4: Verwendung von Docker CLI {/* #option-4-using-docker-cli */}

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

- Das Volume `duplistatus_data` wird für den persistenten Speicher verwendet. Das Containerimage verwendet `Europe/London` als Standard-Zeitzone und `en_GB` als Standardsprache (Locale).

### Option 5: Verwendung von Podman (CLI) `rootless` {/* #option-5-using-podman-cli-rootless */}

Für grundlegende Einrichtungen können Sie den Container ohne DNS-Konfiguration starten:

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

#### Konfigurieren von DNS für Podman-Container {/* #configuring-dns-for-podman-containers */}

Wenn Sie eine benutzerdefinierte DNS-Konfiguration benötigen (z. B. für Tailscale MagicDNS, Firmennetzwerke oder individuelle DNS-Einrichtungen), können Sie DNS-Server und Suchdomänen manuell konfigurieren.

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

Suchen Sie nach Zeilen, die mit `nameserver` beginnen (für DNS-Server) und `search` (für Suchdomänen). Falls Sie unsicher sind, welche DNS-Einstellungen oder Netzwerk-Suchdomänen vorliegen, wenden Sie sich an Ihren Netzwerkadministrator, um diese Informationen zu erhalten.

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

**Hinweis**: Überspringen Sie IPv6-Adressen (mit `:`) und Localhost-Adressen (wie `127.0.0.53`), wenn Sie DNS-Server konfigurieren.

Prüfen Sie den Abschnitt [Zeitzone](./configure-tz.md), um weitere Details zur Anpassung der Zeitzone sowie des Zahlen-/Datum-/Zeitformats zu erhalten.

### Option 6: Verwendung von Podman-Pods {/* #option-6-using-podman-pods */}

Mit Podman-Pods können Sie mehrere Container in einem gemeinsamen Netzwerk-Namespace ausführen. Dies ist nützlich zum Testen oder wenn Sie duplistatus zusammen mit anderen Containern betreiben müssen.

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

#### Konfigurieren von DNS für Podman-Pods {/* #configuring-dns-for-podman-pods */}

Bei Verwendung von Pods muss die DNS-Konfiguration auf Pod-Ebene und nicht auf Containerebene festgelegt werden.
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

## Wesentliche Konfiguration {/* #essential-configuration */}

1. Konfigurieren Sie Ihre [Duplicati-Server](duplicati-server-configuration.md), sodass sie Sicherungsprotokollnachrichten an duplistatus senden (erforderlich). Verwenden Sie in Duplicati 2.0.9.106 und später `--send-http-json-urls`, wie in diesem Leitfaden beschrieben.
2. Melden Sie sich bei duplistatus an – siehe Anweisungen im [Benutzerhandbuch](../user-guide/overview.md#accessing-the-dashboard).
3. Sammeln Sie erste Sicherungsprotokolle – verwenden Sie die Funktion [Sicherungsprotokolle sammeln](../user-guide/collect-backup-logs.md), um die Datenbank mit historischen Sicherungsdaten von all Ihren Duplicati-Servern zu füllen. Dadurch werden auch automatisch die Intervalle für die Backup-Überwachung basierend auf der Konfiguration jedes Servers aktualisiert.
4. Konfigurieren Sie Servereinstellungen – richten Sie Server-Aliase und Notizen unter [Einstellungen → Server](../user-guide/settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
5. Konfigurieren Sie NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY unter [Einstellungen → NTFY](../user-guide/settings/ntfy-settings.md) ein.
6. Konfigurieren Sie E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen unter [Einstellungen → E-Mail](../user-guide/settings/email-settings.md) ein.
7. Konfigurieren Sie Backup-Benachrichtigungen – richten Sie pro-Sicherung oder pro-Server-Benachrichtigungen unter [Einstellungen → Backup-Benachrichtigungen](../user-guide/settings/backup-notifications-settings.md) ein.

Weitere Informationen zum Konfigurieren optionaler Einstellungen wie Zeitzone, Zahlenformat und [Sicherheitskonfiguration](security-configuration.md) finden Sie in den folgenden Abschnitten.
