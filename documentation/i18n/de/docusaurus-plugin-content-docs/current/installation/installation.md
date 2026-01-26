# Installationsleitfaden {#installation-guide}

Die Anwendung kann mit Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks) oder Podman bereitgestellt werden. Nach der Installation möchten Sie möglicherweise die Zeitzone und Sprache konfigurieren, wie in [Zeitzone und Sprache konfigurieren](./configure-tz-lang.md) beschrieben, und müssen die Duplicati-Server so konfigurieren, dass sie Sicherungsprotokolle an **duplistatus** senden, wie im Abschnitt [Duplicati-Konfiguration](./duplicati-server-configuration.md) beschrieben.

## Voraussetzungen {#prerequisites}

Stellen Sie sicher, dass Sie Folgendes installiert haben:

- Docker Engine - [Debian-Installationsleitfaden](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux-Installationsleitfaden](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker-Installationsleitfaden](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installationsleitfaden](http://podman.io/docs/installation#debian)

## Authentifizierung {#authentication}

**duplistatus** erfordert seit Version 0.9.x eine Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn Sie die Anwendung zum ersten Mal installieren oder von einer früheren Version aktualisieren:
\- Benutzername: `admin`
\- Passwort: `Duplistatus09`

Sie können zusätzliche Benutzerkonten in [Einstellungen > Benutzer](../user-guide/settings/user-management-settings.md) nach der ersten Anmeldung erstellen.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Container-Images {#container-images}

Sie können die Images von folgenden Quellen verwenden:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Docker Compose verwenden {#option-1-using-docker-compose}

Dies ist die empfohlene Methode für lokale Bereitstellungen oder wenn Sie die Konfiguration anpassen möchten. Es verwendet eine `docker compose`-Datei, um den Container mit allen seinen Einstellungen zu definieren und auszuführen.

```bash
# Compose-Datei herunterladen {#download-the-compose-file}
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# Container starten {#start-the-container}
docker compose -f duplistatus.yml up -d
```

Lesen Sie den Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md), um weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats zu erhalten.

### Option 2: Portainer Stacks (Docker Compose) verwenden {#option-2-using-portainer-stacks-docker-compose}

1. Gehen Sie zu "Stacks" auf Ihrem [Portainer](https://docs.portainer.io/user/docker/stacks)-Server und klicken Sie auf "Stack hinzufügen".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie "Build-Methode" als "Web-Editor".
4. Kopieren Sie dies und fügen Sie es in den Web-Editor ein:

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

5. Lesen Sie den Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md), um weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats zu erhalten.
6. Klicken Sie auf "Stack bereitstellen".

### Option 3: Portainer Stacks (GitHub-Repository) verwenden {#option-3-using-portainer-stacks-github-repository}

1. Gehen Sie in [Portainer](https://docs.portainer.io/user/docker/stacks) zu "Stacks" und klicken Sie auf "Stack hinzufügen".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie "Build-Methode" als "Repository".
4. Geben Sie die Repository-URL ein: `https://github.com/wsj-br/duplistatus.git`
5. Geben Sie im Feld "Compose-Pfad" Folgendes ein: `production.yml`
6. (optional) Legen Sie die Umgebungsvariablen `TZ`, `LANG`, `PWD_ENFORCE` und `PWD_MIN_LEN` im Abschnitt "Umgebungsvariablen" fest. Lesen Sie den Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md), um weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats zu erhalten.
7. Klicken Sie auf "Stack bereitstellen".

### Option 4: Docker CLI verwenden {#option-4-using-docker-cli}

```bash
# Volume erstellen {#create-the-volume}
docker volume create duplistatus_data

# Container starten {#start-the-container}
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
# Container starten (eigenständig) {#start-the-container-standalone}
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### DNS für Podman-Container konfigurieren {#configuring-dns-for-podman-containers}

Wenn Sie eine benutzerdefinierte DNS-Konfiguration benötigen (z. B. für Tailscale MagicDNS, Unternehmensnetzwerke oder benutzerdefinierte DNS-Setups), können Sie DNS-Server und Suchdomänen manuell konfigurieren.

**Ihre DNS-Konfiguration finden:**

1. **Für systemd-resolved-Systeme** (die meisten modernen Linux-Distributionen):
   ```bash
   # DNS-Server abrufen
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'

   # DNS-Suchdomänen abrufen
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Für Nicht-systemd-Systeme** oder als Fallback:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

   Suchen Sie nach Zeilen, die mit `nameserver` (für DNS-Server) und `search` (für Suchdomänen) beginnen. Wenn Sie sich über Ihre DNS-Einstellungen oder Netzwerk-Suchdomänen nicht sicher sind, wenden Sie sich an Ihren Netzwerkadministrator, um diese Informationen zu erhalten.

**Beispiel mit DNS-Konfiguration:**

```bash
mkdir -p ~/duplistatus_data
# Container mit DNS-Konfiguration starten {#start-the-container-with-dns-configuration}
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

**Hinweis**: Überspringen Sie IPv6-Adressen (mit `:`) und Localhost-Adressen (wie `127.0.0.53`) bei der Konfiguration von DNS-Servern.

Lesen Sie den Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md), um weitere Details zur Anpassung der Zeitzone und des Zahlen-/Datums-/Uhrzeitformats zu erhalten.

### Option 6: Podman Pods verwenden {#option-6-using-podman-pods}

Podman Pods ermöglichen es Ihnen, mehrere Container in einem gemeinsamen Netzwerk-Namespace auszuführen. Dies ist nützlich zum Testen oder wenn Sie duplistatus neben anderen Containern ausführen müssen.

**Grundlegendes Pod-Setup:**

```bash
mkdir -p ~/duplistatus_data

# Pod erstellen {#create-the-pod}
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Container im Pod erstellen {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Pod starten {#start-the-pod}
podman pod start duplistatus-pod
```

#### DNS für Podman Pods konfigurieren {#configuring-dns-for-podman-pods}

Bei Verwendung von Pods muss die DNS-Konfiguration auf Pod-Ebene und nicht auf Container-Ebene festgelegt werden.
Verwenden Sie die gleichen Methoden wie in Option 5 beschrieben, um Ihre DNS-Server und Suchdomänen zu finden.

**Beispiel mit DNS-Konfiguration:**

```bash
mkdir -p ~/duplistatus_data

# Pod mit DNS-Konfiguration erstellen {#create-the-pod-with-dns-configuration}
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Container im Pod erstellen {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Pod starten {#start-the-pod}
podman pod start duplistatus-pod
```

**Pod verwalten:**

```bash
# Pod stoppen (stoppt alle Container im Pod) {#stop-the-pod-stops-all-containers-in-the-pod}
podman pod stop duplistatus-pod

# Pod starten {#start-the-pod}
podman pod start duplistatus-pod

# Pod und alle Container entfernen {#remove-the-pod-and-all-containers}
podman pod rm -f duplistatus-pod
```

## Wesentliche Konfiguration {#essential-configuration}

1. Konfigurieren Sie Ihre [Duplicati-Server](duplicati-server-configuration.md), um Sicherungsprotokolle an duplistatus zu senden (erforderlich).
2. Melden Sie sich bei duplistatus an – siehe Anweisungen im [Benutzerhandbuch](../user-guide/overview.md#accessing-the-dashboard).
3. Sammeln Sie anfängliche Sicherungsprotokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md), um die Datenbank mit historischen Sicherungsdaten von allen Ihren Duplicati-Servern zu füllen. Dies aktualisiert auch automatisch die Überwachungsintervalle für überfällige Sicherungen basierend auf der Konfiguration jedes Servers.
4. Konfigurieren Sie Server-Einstellungen – richten Sie Server-Aliase und Notizen in [Einstellungen → Server](../user-guide/settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
5. Konfigurieren Sie NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY in [Einstellungen → NTFY](../user-guide/settings/ntfy-settings.md) ein.
6. Konfigurieren Sie E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen in [Einstellungen → E-Mail](../user-guide/settings/email-settings.md) ein.
7. Konfigurieren Sie Backup-Benachrichtigungen – richten Sie Benachrichtigungen pro Sicherung oder pro Server in [Einstellungen → Backup-Benachrichtigungen](../user-guide/settings/backup-notifications-settings.md) ein.

Lesen Sie die folgenden Abschnitte, um optionale Einstellungen wie Zeitzone, Zahlenformat und HTTPS zu konfigurieren.
