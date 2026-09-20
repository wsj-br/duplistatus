# Podman-Tests {/* #podman-testing */}

Kopieren und führen Sie die Skripte aus, die sich unter `scripts/podman_testing` auf dem Podman-Testserver befinden.

## Ersteinrichtung und Verwaltung {/* #initial-setup-and-management */}

1. `copy.docker.duplistatus.local`: Kopiert das Docker-Image vom lokalen Docker-Dienst zu Podman (für lokale Tests).
2. `copy.docker.duplistatus.remote`: Kopiert das Docker-Image von einem entfernten Entwicklungsserver zu Podman (erfordert SSH-Zugriff).
   - Erstellen Sie das Image auf dem Entwicklungsserver mit: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Startet den Container im Rootless-Modus.
4. `pod.testing`: Testet den Container innerhalb eines Podman-Pods (mit Root-Rechten).
5. `stop.duplistatus`: Stoppt den Pod und entfernt den Container.
6. `clean.duplistatus`: Stoppt Container, entfernt Pods und bereinigt alte Images.

## DNS-Konfiguration {/* #dns-configuration */}

Die Skripte erkennen automatisch DNS-Einstellungen des Host-Systems und konfigurieren diese:

- **Automatische Erkennung**: Verwendet `resolvectl status` (systemd-resolved), um DNS-Server und Suchdomänen zu extrahieren
- **Ausweichlösung**: Greift zurück auf die Auswertung von `/etc/resolv.conf` in Nicht-Systemd-Systemen
- **Intelligente Filterung**: Filtert automatisch Localhost-Adressen und IPv6-Namensserver heraus
- **Funktioniert mit**:
  - Tailscale MagicDNS (100.100.100.100)
  - Unternehmens-DNS-Server
  - Standard-Netzwerkkonfigurationen
  - Benutzerdefinierten DNS-Einrichtungen

Keine manuelle DNS-Konfiguration erforderlich – die Skripte übernehmen dies automatisch!

## Überwachung und Integritätsprüfungen {/* #monitoring-and-health-checks */}

- `check.duplistatus`: Prüft die Protokolle, Konnektivität und Anwendungsgesundheit.

## Debugging-Befehle {/* #debugging-commands */}

- `logs.duplistatus`: Zeigt die Protokolle des Pods an.
- `exec.shell.duplistatus`: Öffnet eine Shell im Container.
- `restart.duplistatus`: Stoppt den Pod, entfernt den Container, kopiert das Image, erstellt den Container und startet den Pod.

## Verwendungsworkflow {/* #usage-workflow */}

### Entwicklungsserver {/* #development-server */}

Erstellen Sie das Docker-Image auf dem Entwicklungsserver:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman-Server {/* #podman-server */}

1. Übertragen Sie das Docker-Image:
   - Verwenden Sie `./copy.docker.duplistatus.local`, wenn Docker und Podman auf derselben Maschine laufen
   - Verwenden Sie `./copy.docker.duplistatus.remote`, wenn Sie von einem entfernten Entwicklungsserver kopieren (erfordert `.env`-Datei mit `REMOTE_USER` und `REMOTE_HOST`)
2. Starten Sie den Container mit `./start.duplistatus` (eigenständig, rootlos)
   - Oder verwenden Sie `./pod.testing`, um den Pod-Modus zu testen (mit Root)
3. Überwachen Sie mit `./check.duplistatus` und `./logs.duplistatus`
4. Beenden Sie mit `./stop.duplistatus`, wenn Sie fertig sind
5. Verwenden Sie `./restart.duplistatus` für einen vollständigen Neustartzyklus (Stopp, Image kopieren, Start)
   - **Hinweis**: Dieses Skript verweist derzeit auf `copy.docker.duplistatus`, was entweder durch `.local` oder `.remote` Variante ersetzt werden sollte
6. Verwenden Sie `./clean.duplistatus`, um Container, Pods und alte Images zu entfernen

# Testen der Anwendung {/* #testing-the-application */}

Wenn Sie den Podman-Server auf demselben Rechner ausführen, verwenden Sie `http://localhost:9666`.

Wenn Sie sich auf einem anderen Server befinden, rufen Sie die URL ab mit:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Wichtige Hinweise {/* #important-notes */}

### Podman-Pod-Netzwerk {/* #podman-pod-networking */}

Bei der Ausführung in Podman-Pods erfordert die Anwendung:
- Explizite DNS-Konfiguration (automatisch durch das Skript `pod.testing` verwaltet)
- Port-Bindung an alle Schnittstellen (`0.0.0.0:9666`)

Die Skripte behandeln diese Anforderungen automatisch – keine manuelle Konfiguration erforderlich.

### Rootlos- vs. Root-Modus {/* #rootless-vs-root-mode */}

- **Eigenständiger Modus** (`start.duplistatus`): Läuft ohne Root-Rechte mit `--userns=keep-id`
- **Pod-Modus** (`pod.testing`): Läuft innerhalb des Pods als Root für Testzwecke

Beide Modi funktionieren korrekt mit der automatischen DNS-Erkennung.

## Umgebungskonfiguration {/* #environment-configuration */}

Sowohl `copy.docker.duplistatus.local` als auch `copy.docker.duplistatus.remote` benötigen eine `.env`-Datei im Verzeichnis `scripts/podman_testing`:

**Für lokales Kopieren** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**Für entferntes Kopieren** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

Das Skript `start.duplistatus` benötigt eine Datei `.env` mit mindestens der Variable `IMAGE`:

```
IMAGE=wsj-br/duplistatus:devel
```

**Notiz**: Die Fehlermeldung des Skripts erwähnt `REMOTE_USER` und `REMOTE_HOST`, diese werden jedoch nicht tatsächlich von `start.duplistatus` verwendet – nur `IMAGE` ist erforderlich.
