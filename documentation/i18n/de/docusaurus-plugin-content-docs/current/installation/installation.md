# Installationsanleitung

Die Anwendung kann mit Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks) oder Podman bereitgestellt werden. Nach der Installation möchten Sie möglicherweise die ZEITZONE und SPRACHE konfigurieren, wie in [Zeitzone und Sprache konfigurieren](./configure-tz-lang.md) beschrieben, und müssen die Duplicati-Server so konfigurieren, dass sie Backup-Protokolle an **duplistatus** senden, wie im Abschnitt [Duplicati-Konfiguration](./duplicati-server-configuration.md) beschrieben.

## Voraussetzungen

Stellen Sie sicher, dass Sie Folgendes installiert haben:

- Docker Engine - [Debian-Installationsanleitung](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux-Installationsanleitung](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker-Installationsanleitung](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installationsanleitung](http://podman.io/docs/installation#debian)

## Authentifizierung

**duplistatus** erfordert seit Version 0.9.x eine Benutzerauthentifizierung. Ein Standard-`admin`-Konto wird automatisch erstellt, wenn die Anwendung zum ersten Mal installiert oder von einer früheren Version aktualisiert wird:
\- Benutzername: `admin`
\- Passwort: `Duplistatus09`

Sie können nach der ersten Anmeldung zusätzliche Benutzerkonten unter [Einstellungen > Benutzer](../user-guide/settings/user-management-settings.md) erstellen.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Container-Images

Sie können die Images verwenden von:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Verwendung von Docker Compose

Dies ist die empfohlene Methode für lokale Bereitstellungen oder wenn Sie die Konfiguration anpassen möchten. Es verwendet eine `docker compose`-Datei, um den Container mit allen seinen Einstellungen zu definieren und auszuführen.

```bash
# Compose-Datei herunterladen
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# Container starten
docker compose -f duplistatus.yml up -d
```

Weitere Informationen zum Anpassen von Zeitzone und Zahlen-/Datums-/Zeitformat finden Sie im Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md).

### Option 2: Verwendung von Portainer Stacks (Docker Compose)

1. Gehen Sie in Ihrem [Portainer](https://docs.portainer.io/user/docker/stacks)-Server zu "Stacks" und klicken Sie auf "Add stack".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie "Build method" als "Web editor".
4. Kopieren Sie dies und fügen Sie es in den Web-Editor ein:

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

5. Weitere Informationen zum Anpassen von Zeitzone und Zahlen-/Datums-/Zeitformat finden Sie im Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md).
6. Klicken Sie auf "Deploy the stack".

### Option 3: Verwendung von Portainer Stacks (GitHub-Repository)

1. Gehen Sie in [Portainer](https://docs.portainer.io/user/docker/stacks) zu "Stacks" und klicken Sie auf "Add stack".
2. Benennen Sie Ihren Stack (z. B. "duplistatus").
3. Wählen Sie "Build method" als "Repository".
4. Geben Sie die Repository-URL ein: `https://github.com/wsj-br/duplistatus.git`
5. Geben Sie im Feld "Compose path" ein: `production.yml`
6. (optional) Legen Sie die Umgebungsvariablen `TZ`, `LANG`, `PWD_ENFORCE` und `PWD_MIN_LEN` im Abschnitt "Environment variables" fest. Weitere Informationen zum Anpassen von Zeitzone und Zahlen-/Datums-/Zeitformat finden Sie im Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md).
7. Klicken Sie auf "Deploy the stack".

### Option 4: Verwendung der Docker-CLI

```bash
# Volume erstellen
docker volume create duplistatus_data

# Container starten
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- Das `duplistatus_data`-Volume wird für persistenten Speicher verwendet. Das Container-Image verwendet `Europe/London` als Standardzeitzone und `en_GB` als Standardgebietsschema (Sprache).

### Option 5: Verwendung von Podman (CLI) `rootless`

Für grundlegende Setups können Sie den Container ohne DNS-Konfiguration starten:

```bash
mkdir -p ~/duplistatus_data
# Container starten (eigenständig)
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
# Container mit DNS-Konfiguration starten
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

**Hinweis**: Überspringen Sie IPv6-Adressen (die `:` enthalten) und Localhost-Adressen (wie `127.0.0.53`) beim Konfigurieren von DNS-Servern.

Weitere Informationen zum Anpassen von Zeitzone und Zahlen-/Datums-/Zeitformat finden Sie im Abschnitt [Zeitzone und Gebietsschema](./configure-tz-lang.md).

### Option 6: Verwendung von Podman Pods

Podman-Pods ermöglichen es Ihnen, mehrere Container in einem gemeinsamen Netzwerk-Namespace auszuführen. Dies ist nützlich zum Testen oder wenn Sie duplistatus zusammen mit anderen Containern ausführen müssen.

**Grundlegendes Pod-Setup:**

```bash
mkdir -p ~/duplistatus_data

# Pod erstellen
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Container im Pod erstellen
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Pod starten
podman pod start duplistatus-pod
```

#### DNS für Podman-Pods konfigurieren

Bei Verwendung von Pods muss die DNS-Konfiguration auf Pod-Ebene festgelegt werden, nicht auf Container-Ebene.
Verwenden Sie die gleichen Methoden, die in Option 5 beschrieben sind, um Ihre DNS-Server und Suchdomänen zu finden.

**Beispiel mit DNS-Konfiguration:**

```bash
mkdir -p ~/duplistatus_data

# Pod mit DNS-Konfiguration erstellen
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Container im Pod erstellen
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Pod starten
podman pod start duplistatus-pod
```

**Pod verwalten:**

```bash
# Pod stoppen (stoppt alle Container im Pod)
podman pod stop duplistatus-pod

# Pod starten
podman pod start duplistatus-pod

# Pod und alle Container entfernen
podman pod rm -f duplistatus-pod
```

## Wesentliche Konfiguration

1. Konfigurieren Sie Ihre [Duplicati-Server](duplicati-server-configuration.md), um Backup-Protokollnachrichten an duplistatus zu senden (erforderlich).
2. Melden Sie sich bei duplistatus an – siehe Anweisungen im [Benutzerhandbuch](../user-guide/overview.md#accessing-the-dashboard).
3. Sammeln Sie erste Backup-Protokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md), um die Datenbank mit historischen Backup-Daten von allen Ihren Duplicati-Servern zu füllen. Dies aktualisiert auch automatisch die Überwachungsintervalle für überfällige Backups basierend auf der Konfiguration jedes Servers.
4. Konfigurieren Sie Servereinstellungen – richten Sie Server-Aliase und Notizen unter [Einstellungen → Server](../user-guide/settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
5. Konfigurieren Sie NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY unter [Einstellungen → NTFY](../user-guide/settings/ntfy-settings.md) ein.
6. Konfigurieren Sie E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen unter [Einstellungen → E-Mail](../user-guide/settings/email-settings.md) ein.
7. Konfigurieren Sie Backup-Benachrichtigungen – richten Sie Benachrichtigungen pro Backup oder pro Server unter [Einstellungen → Backup-Benachrichtigungen](../user-guide/settings/backup-notifications-settings.md) ein.

In den folgenden Abschnitten finden Sie Informationen zum Konfigurieren optionaler Einstellungen wie Zeitzone, Zahlenformat und HTTPS.
