# Podman-Tests {/* #podman-testing */}

Kopieren Sie die Skripte unter `scripts/podman_testing` und führen Sie diese auf dem Podman-Testserver aus.

## Initiale Einrichtung und Verwaltung {/* #initial-setup-and-management */}

1. `copy.docker.duplistatus.local`: Kopiert das Docker-Image vom lokalen Docker-Daemon zu Podman (für lokale Tests).
2. `copy.docker.duplistatus.remote`: Kopiert das Docker-Image von einem Remote-Entwicklungsserver zu Podman (erfordert SSH-Zugriff).
   - Erstellen Sie das Image auf dem Entwicklungsserver mit: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Startet den Container im rootless-Modus.
4. `pod.testing`: Testet den Container innerhalb eines Podman-Pods (mit Root-Rechten).
5. `stop.duplistatus`: Stoppt den Pod und entfernt den Container.
6. `clean.duplistatus`: Stoppt Container, entfernt Pods und bereinigt alte Images.

## DNS-Konfiguration {/* #dns-configuration */}

Die Skripte erkennen und konfigurieren automatisch die DNS-Einstellungen vom Host-System:

- **Automatische Erkennung**: Verwendet `resolvectl status` (systemd-resolved), um DNS-Server und Suchdomänen zu extrahieren
- **Fallback-Unterstützung**: Wechselt auf das Parsen von `/etc/resolv.conf` auf Nicht-systemd-Systemen
- **Intelligente Filterung**: Filtert automatisch localhost-Adressen und IPv6-Namensserver heraus
- **Funktioniert mit**:
  - Tailscale MagicDNS (100.100.100.100)
  - Unternehmens-DNS-Server
  - Standard-Netzwerkkonfigurationen
  - Benutzerdefinierte DNS-Einstellungen

Keine manuelle DNS-Konfiguration erforderlich - die Skripte erledigen dies automatisch!

## Überwachung und Health Checks {/* #monitoring-and-health-checks */}

- `check.duplistatus`: Überprüft die Logs, die Konnektivität und den Anwendungsstatus.

## Debugging-Befehle {/* #debugging-commands */}

- `logs.duplistatus`: Zeigt die Logs des Pods an.
- `exec.shell.duplistatus`: Öffnet eine Shell im Container.
- `restart.duplistatus`: Stoppt den Pod, entfernt den Container, kopiert das Image, erstellt den Container und startet den Pod.

## Arbeitsablauf {/* #usage-workflow */}

### Entwicklungsserver {/* #development-server */}

Erstellen Sie das Docker-Image auf dem Entwicklungsserver:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman-Server {/* #podman-server */}

1. Übertragen Sie das Docker-Image:
   - Verwenden Sie `./copy.docker.duplistatus.local`, wenn Docker und Podman auf demselben Rechner sind
   - Verwenden Sie `./copy.docker.duplistatus.remote`, wenn Sie von einem Remote-Entwicklungsserver kopieren (erfordert die `.env`-Datei mit `REMOTE_USER` und `REMOTE_HOST`)
2. Starten Sie den Container mit `./start.duplistatus` (standalone, rootless)
   - Oder verwenden Sie `./pod.testing`, um im Pod-Modus zu testen (mit Root)
3. Überwachen Sie mit `./check.duplistatus` und `./logs.duplistatus`
4. Stoppen Sie mit `./stop.duplistatus`, wenn Sie fertig sind
5. Verwenden Sie `./restart.duplistatus` für einen vollständigen Neustartzyklus (stoppen, Image kopieren, starten)
   - **Notiz**: Dieses Skript verweist derzeit auf `copy.docker.duplistatus`, das durch eine der Varianten `.local` oder `.remote` ersetzt werden sollte
6. Verwenden Sie `./clean.duplistatus`, um Container, Pods und alte Bilder zu entfernen

# Anwendung testen {/* #testing-the-application */}

Wenn Sie den Podman-Server auf demselben Rechner ausführen, verwenden Sie `http://localhost:9666`.

Wenn Sie sich auf einem anderen Server befinden, erhalten Sie die URL mit:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Wichtige Hinweise {/* #important-notes */}

### Podman-Pod-Netzwerk {/* #podman-pod-networking */}

Wenn Sie in Podman-Pods ausgeführt werden, erfordert die Anwendung:
- Explizite DNS-Konfiguration (automatisch durch das `pod.testing`-Skript behandelt)
- Port-Binding an alle Schnittstellen (`0.0.0.0:9666`)

Die Skripte behandeln diese Anforderungen automatisch - keine manuelle Konfiguration erforderlich.

### Rootless vs Root-Modus {/* #rootless-vs-root-mode */}

- **Standalone-Modus** (`start.duplistatus`): Wird rootless mit `--userns=keep-id` ausgeführt
- **Pod-Modus** (`pod.testing`): Wird als Root innerhalb des Pods für Testzwecke ausgeführt

Beide Modi funktionieren korrekt mit der automatischen DNS-Erkennung.

## Umgebungs-Konfiguration {/* #environment-configuration */}

Beide `copy.docker.duplistatus.local` und `copy.docker.duplistatus.remote` erfordern eine `.env`-Datei im `scripts/podman_testing`-Verzeichnis:

**Für lokale Kopien** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**Für entfernte Kopien** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

Das `start.duplistatus`-Skript erfordert eine `.env`-Datei mit mindestens der `IMAGE`-Variablen:

```
IMAGE=wsj-br/duplistatus:devel
```

**Notiz**: Die Fehlermeldung des Skripts erwähnt `REMOTE_USER` und `REMOTE_HOST`, aber diese werden tatsächlich nicht von `start.duplistatus` verwendet—nur `IMAGE` ist erforderlich.
