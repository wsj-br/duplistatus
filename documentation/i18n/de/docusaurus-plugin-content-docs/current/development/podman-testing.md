---
translation_last_updated: '2026-05-11T14:27:41.072Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: f647338c95a160f5fa9c03468bfb314c8f97e5e5ab00f1264f67ab14f18b1589
translation_language: de
source_file_path: documentation/docs/development/podman-testing.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Podman-Tests {#podman-testing}

Kopieren und führen Sie die Skripte aus, die sich unter `scripts/podman_testing` auf dem Podman-Testserver befinden.

## Ersteinrichtung und Verwaltung {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`: Kopiert das Docker-Image vom lokalen Docker-Daemon zu Podman (für lokale Tests).
2. `copy.docker.duplistatus.remote`: Kopiert das Docker-Image von einem entfernten Entwicklungs-Server zu Podman (benötigt SSH-Zugriff).
   - Erstellen Sie das Image auf dem Entwicklungs-Server mit: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Startet den Container im rootlosen Modus.
4. `pod.testing`: Testet den Container innerhalb eines Podman-Pods (mit Root-Rechten).
5. `stop.duplistatus`: Stoppt den Pod und entfernt den Container.
6. `clean.duplistatus`: Stoppt Container, entfernt Pods und bereinigt alte Images.

## DNS-Konfiguration {#dns-configuration}

Die Skripte erkennen und konfigurieren DNS-Einstellungen automatisch vom Host-System:

- **Automatische Erkennung**: Nutzt `resolvectl status` (systemd-resolved), um DNS-Server und Suchdomänen zu extrahieren
- **Fallback-Unterstützung**: Greift auf die Auswertung von `/etc/resolv.conf` in Nicht-systemd-Systemen zurück
- **Intelligente Filterung**: Filtert automatisch localhost-Adressen und IPv6-Namensserver heraus
- **Funktioniert mit**:
  - Tailscale MagicDNS (100.100.100.100)
  - Unternehmens-DNS-Server
  - Standard-Netzwerkkonfigurationen
  - Benutzerdefinierte DNS-Setups

Keine manuelle DNS-Konfiguration erforderlich - die Skripte handhaben dies automatisch!

## Überwachung und Integritätsprüfungen {#monitoring-and-health-checks}

- `check.duplistatus`: Überprüft die Protokolle, die Konnektivität und die Anwendungsintegrität.

## Debugging-Befehle {#debugging-commands}

- `logs.duplistatus`: Zeigt die Protokolle von Pod an.
- `exec.shell.duplistatus`: Öffnet eine Shell im Container.
- `restart.duplistatus`: Stoppt den Pod, entfernt den Container, kopiert das Image, erstellt den Container und startet den Pod.

## Verwendungs-Workflow {#usage-workflow}

### Entwicklungsserver {#development-server}

Erstellen Sie das Docker-Image auf dem Entwicklungsserver:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman-Server {#podman-server}

1. Übertragen Sie das Docker-Image:
   - Verwenden Sie `./copy.docker.duplistatus.local`, wenn Docker und Podman auf demselben Gerät sind
   - Verwenden Sie `./copy.docker.duplistatus.remote`, wenn Sie von einem entfernten Entwicklungs-Server kopieren (benötigt `.env`-Datei mit `REMOTE_USER` und `REMOTE_HOST`)
2. Starten Sie den Container mit `./start.duplistatus` (standalone, rootlos)
   - Oder verwenden Sie `./pod.testing`, um im Pod-Modus zu testen (mit Root)
3. Überwachen Sie mit `./check.duplistatus` und `./logs.duplistatus`
4. Beenden Sie mit `./stop.duplistatus`, wenn fertig
5. Verwenden Sie `./restart.duplistatus`, um einen vollständigen Neustartzyklus durchzuführen (stoppen, Image kopieren, starten)
   - **Hinweis**: Dieses Skript verweist derzeit auf `copy.docker.duplistatus`, das durch entweder `.local` oder `.remote` ersetzt werden sollte
6. Verwenden Sie `./clean.duplistatus`, um Container, Pods und alte Images zu entfernen

# Testen der Anwendung {#testing-the-application}

Wenn Sie den Podman-Server auf demselben Computer ausführen, verwenden Sie `http://localhost:9666`.

Wenn Sie sich auf einem anderen Server befinden, rufen Sie die URL mit ab:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Wichtig {#important-notes}

### Podman-Pod-Netzwerk {#podman-pod-networking}

Wenn die Anwendung in Podman-Pods ausgeführt wird, sind folgende Anforderungen erforderlich:
- Explizite DNS-Konfiguration (automatisch durch das `pod.testing`-Skript verwaltet)
- Port-Bindung an alle Schnittstellen (`0.0.0.0:9666`)

Die Skripte handhaben diese Anforderungen automatisch – keine manuelle Konfiguration erforderlich.

### Rootless vs Root-Modus {#rootless-vs-root-mode}

- **Standalone-Modus** (`start.duplistatus`): Wird rootlos mit `--userns=keep-id` ausgeführt
- **Pod-Modus** (`pod.testing`): Wird zu Testzwecken als Root innerhalb des Pods ausgeführt

Beide Modi funktionieren korrekt mit der automatischen DNS-Erkennung.

## Umgebungskonfiguration {#environment-configuration}

Sowohl `copy.docker.duplistatus.local` als auch `copy.docker.duplistatus.remote` erfordern eine `.env`-Datei im Verzeichnis `scripts/podman_testing`:

**Für lokales Kopieren** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**Für Remote-Kopieren** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

Das Skript `start.duplistatus` erfordert eine `.env`-Datei mit mindestens der Variable `IMAGE`:

```
IMAGE=wsj-br/duplistatus:devel
```

**Hinweis**: Die Fehlermeldung des Skripts erwähnt `REMOTE_USER` und `REMOTE_HOST`, diese werden jedoch von `start.duplistatus` nicht tatsächlich verwendet – nur `IMAGE` ist erforderlich.
