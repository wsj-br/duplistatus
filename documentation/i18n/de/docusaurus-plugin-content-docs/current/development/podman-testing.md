---
translation_last_updated: '2026-03-01T00:45:08.810Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: 841b30d8ee97e362
translation_language: de
source_file_path: development/podman-testing.md
---
# Podman-Tests {#podman-testing}

Kopieren und führen Sie die Skripte aus, die sich unter `scripts/podman_testing` auf dem Podman-Testserver befinden.

## Ersteinrichtung und Verwaltung {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`: Kopiert das Docker-Image vom lokalen Docker-Daemon zu Podman (für lokale Tests).
2. `copy.docker.duplistatus.remote`: Kopiert das Docker-Image von einem Remote-Entwicklungsserver zu Podman (erfordert SSH-Zugriff).
   - Erstellen Sie das Image auf dem Entwicklungsserver mit: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Startet den Container im rootless-Modus.
4. `pod.testing`: Testet den Container in einem Podman-Pod (mit Root-Berechtigung).
5. `stop.duplistatus`: Stoppt den Pod und entfernt den Container.
6. `clean.duplistatus`: Stoppt Container, entfernt Pods und bereinigt alte Images.

## DNS-Konfiguration {#dns-configuration}

Die Skripte erkennen und konfigurieren DNS-Einstellungen automatisch vom Host-System:

- **Automatische Erkennung**: Verwendet `resolvectl status` (systemd-resolved), um DNS-Server und Suchdomänen zu extrahieren
- **Fallback-Unterstützung**: Greift auf das Parsing von `/etc/resolv.conf` auf Nicht-systemd-Systemen zurück
- **Intelligente Filterung**: Filtert automatisch Localhost-Adressen und IPv6-Nameserver heraus
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

1. Docker-Image übertragen:
   - Verwenden Sie `./copy.docker.duplistatus.local`, wenn Docker und Podman auf demselben Computer ausgeführt werden
   - Verwenden Sie `./copy.docker.duplistatus.remote`, wenn Sie von einem Remote-Entwicklungsserver kopieren (erfordert `.env`-Datei mit `REMOTE_USER` und `REMOTE_HOST`)
2. Starten Sie den Container mit `./start.duplistatus` (eigenständig, rootlos)
   - Oder verwenden Sie `./pod.testing`, um im Pod-Modus zu testen (mit Root)
3. Überwachen Sie mit `./check.duplistatus` und `./logs.duplistatus`
4. Stoppen Sie mit `./stop.duplistatus`, wenn Sie fertig sind
5. Verwenden Sie `./restart.duplistatus` für einen vollständigen Neustartzyklus (Stoppen, Image kopieren, Starten)
   - **Hinweis**: Dieses Skript verweist derzeit auf `copy.docker.duplistatus`, das durch die Variante `.local` oder `.remote` ersetzt werden sollte
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
