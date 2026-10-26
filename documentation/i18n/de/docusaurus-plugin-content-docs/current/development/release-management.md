# Release-Management {/* #release-management */}

## Versionierung (Semantic Versioning) {/* #versioning-semantic-versioning */}

Das Projekt folgt der semantischen Versionierung (SemVer) mit dem Format `MAJOR.MINOR.PATCH`:

- **MAJOR**-Version (x.0.0): Wenn Sie inkompatible API-Änderungen vornehmen
- **MINOR**-Version (0.x.0): Wenn Sie Funktionen auf rückwärtskompatible Weise hinzufügen
- **PATCH**-Version (0.0.x): Wenn Sie rückwärtskompatible Fehlerbehebungen vornehmen

## Prüfliste für Vorabveröffentlichungen {/* #pre-release-checklist */}

Bevor Sie eine neue Version veröffentlichen, stellen Sie sicher, dass Sie Folgendes abgeschlossen haben:

- [ ] Alle Änderungen wurden committet und in den `vMAJOR.MINOR.x`-Branch gepusht.
- [ ] Die Versionsnummer wurde in `package.json` aktualisiert (verwenden Sie `scripts/update-version.sh`, um sie über Dateien hinweg zu synchronisieren).
- [ ] Alle Tests bestehen (im Entwicklungsmodus, lokal, Docker und Podman). 
- [ ] Starten Sie einen Docker-Container mit `pnpm docker:up` und führen Sie `scripts/compare-versions.sh` aus, um die Versionskonsistenz zwischen Entwicklungsumgebung und Docker-Container zu überprüfen (erfordert laufenden Docker-Container). Dieses Skript vergleicht SQLite-Versionen nur nach Hauptversion (z. B. werden 3.45.1 und 3.51.1 als kompatibel angesehen) und vergleicht Node-, npm- und Duplistatus-Versionen exakt.
- [ ] Die Dokumentation ist aktuell, aktualisieren Sie die Screenshots (verwenden Sie `pnpm take-screenshots`)
- [ ] Die Versionshinweise sind in `documentation/docs/release-notes/VERSION.md` vorbereitet.
- [ ] Führen Sie `pnpm release:github:dry` aus, um `README.md`, `README_dockerhub.md` und `RELEASE_NOTES_github_VERSION.md` aus `documentation/docs/intro.md` zu aktualisieren. Committen Sie `README.md`, falls es sich ändert, und führen Sie den Dry-Run erneut aus, bis der Arbeitsbaum sauber bleibt.

## Übersicht über den Veröffentlichungsprozess {/* #release-process-overview */}

Der empfohlene Veröffentlichungsprozess verwendet **GitHub Pull Requests und Releases** (siehe unten). Dadurch wird bessere Sichtbarkeit, Überprüfungsmöglichkeiten und automatische Triggerung von Docker-Image-Builds gewährleistet. Die Befehlszeilenmethode ist als Alternative verfügbar.

## Methode 1: GitHub Pull Request und Release (Empfohlen) {/* #method-1-github-pull-request-and-release-recommended */}

Dies ist die bevorzugte Methode, da sie bessere Nachverfolgbarkeit bietet und automatisch Docker-Builds auslöst.

### Schritt 1: Pull Request erstellen {/* #step-1-create-pull-request */}

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf den Tab **"Pull requests"**.
3. Klicken Sie auf **"New pull request."**
4. Legen Sie den **Basis-Branch** auf `master` und den **Vergleichs-Branch** auf `vMAJOR.MINOR.x` fest.
5. Überprüfen Sie die Änderungsvorschau, um sicherzustellen, dass alles korrekt aussieht.
6. Klicken Sie auf **"Create pull request."**
7. Fügen Sie einen aussagekräftigen Titel (z. B. "Release v1.2.0") und eine Beschreibung mit Zusammenfassung der Änderungen hinzu.
8. Klicken Sie erneut auf **"Create pull request"**.

### Schritt 2: Pull Request zusammenführen {/* #step-2-merge-the-pull-request */}

Nach der Überprüfung des Pull Requests:

1. Falls es keine Konflikte gibt, klicken Sie auf die grüne Schaltfläche **"Merge pull request"**.
2. Wählen Sie Ihre Merge-Strategie (typischerweise "Create a merge commit").
3. Bestätigen Sie das Merging.

### Schritt 3: GitHub-Release erstellen {/* #step-3-create-github-release */}

Sobald das Merging abgeschlossen ist, erstellen Sie einen GitHub-Release:

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Gehen Sie zum Abschnitt **"Releases"** (oder klicken Sie auf "Releases" in der rechten Seitenleiste).
3. Klicken Sie auf **"Draft a new release."**
4. Geben Sie im Feld **"Choose a tag"** Ihre neue Versionsnummer im Format `vMAJOR.MINOR.PATCH` ein (z.B. `v1.2.0`). Dadurch wird ein neuer Tag erstellt.
5. Wählen Sie `master` als Ziel-Branch aus.
6. Fügen Sie einen **Release-Titel** hinzu (z.B. "Release v1.2.0").
7. Fügen Sie eine **Beschreibung** hinzu, die die Änderungen in dieser Version dokumentiert. Sie können:
   - Den Inhalt aus `RELEASE_NOTES_github_VERSION.md` kopieren (erzeugt von `scripts/generate-readme-from-intro.sh`)
   - Oder auf Release-Notes aus `documentation/docs/release-notes/` verweisen (beachten Sie jedoch, dass relative Links in GitHub-Releases nicht funktionieren)
8. Klicken Sie auf **"Publish release."**

**Was automatisch geschieht:**
- Ein neuer Git-Tag wird erstellt
- Der Workflow "Build and Publish Docker Image" wird ausgelöst
- Docker-Images werden für AMD64- und ARM64-Architekturen erstellt
- Images werden gepusht nach:
  - Docker Hub: `wsjbr/duplistatus:VERSION` und `wsjbr/duplistatus:latest` (wenn dies die aktuellste Version ist)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` und `ghcr.io/wsj-br/duplistatus:latest` (wenn dies die aktuellste Version ist)

## Methode 2: Befehlszeile (Alternative) {/* #method-2-command-line-alternative */}

Ausgehend von dem Commit, der veröffentlicht werden soll (typischerweise `master`, bereits gepusht), mit einem sauberen Working Tree und vorhandenem `documentation/docs/release-notes/VERSION.md`:

```bash
pnpm release:github:dry   # regenerate README.md and GitHub notes; stop if tracked files changed
pnpm release:github       # refresh GitHub notes only, tag vVERSION at HEAD, publish the release, and deploy the docs
```

`pnpm release:github:dry` führt `scripts/generate-readme-from-intro.sh` aus. Das schreibt `README.md` und die von Git ignorierten `RELEASE_NOTES_github_VERSION.md` (absolute Links für den GitHub-Release-Body) neu. Wenn sich verfolgte Dateien ändern, stoppt der Dry-Run, damit Sie sie committen können – normalerweise das Versions-Badge in `README.md` – und den Dry-Run erneut ausführen können.

`pnpm release:github` schreibt `README.md` nicht neu. Es aktualisiert nur die von Git ignorierte Notizdatei, taggt `vVERSION` bei HEAD und veröffentlicht den Release. Die Veröffentlichung startet den Docker-Image-Workflow. Das Skript führt dann `pnpm run deploy` in `documentation/` aus, um den GitHub Actions-Workflow **Dokumentation bereitstellen** zu starten, der die Docusaurus-Site erstellt und auf GitHub Pages veröffentlicht. Wenn Tag `vVERSION` oder dieser GitHub-Release bereits existiert, löscht das Skript sie und erstellt den Tag am aktuellen HEAD neu. Übergeben Sie `--verify-clean=false`, um die Clean-Tree-Prüfungen zu überspringen.

Die nachfolgenden Schritte sind dieselben Vorgänge, manuell ausgeführt.

### Schritt 1: Lokalen Master-Branch aktualisieren {/* #step-1-update-local-master-branch */}

Stellen Sie sicher, dass Ihr lokaler `master`-Branch auf dem neuesten Stand ist:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Schritt 2: Entwicklungs-Branch zusammenführen {/* #step-2-merge-development-branch */}

Führen Sie den `vMAJOR.MINOR.x`-Branch in `master` zusammen:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Wenn es **Merge-Konflikte** gibt, lösen Sie diese manuell:
1. Bearbeiten Sie die Dateien mit Konflikten
2. Stagen Sie die gelösten Dateien: `git add <file>`
3. Vervollständigen Sie das Merge: `git commit`

### Schritt 3: Release taggen {/* #step-3-tag-the-release */}

Erstellen Sie einen annotierten Tag für die neue Version:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

Der `-a`-Parameter erstellt einen annotierten Tag (empfohlen für Releases), und der `-m`-Parameter fügt eine Nachricht hinzu.

### Schritt 4: Nach GitHub pushen {/* #step-4-push-to-github */}

Pushen Sie sowohl den aktualisierten `master`-Branch als auch den neuen Tag:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativ können Sie alle Tags auf einmal pushen: `git push --tags`

### Schritt 5: GitHub-Release erstellen {/* #step-5-create-github-release */}

Nachdem Sie den Tag gepusht haben, erstellen Sie einen GitHub-Release (siehe Methode 1, Schritt 3), um den Docker-Build-Workflow auszulösen.

## Manuelles Docker-Image-Build {/* #manual-docker-image-build */}

Um den Workflow zum Erstellen des Docker-Images manuell auszulösen, ohne eine Version zu erstellen:

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf den Tab **"Aktionen"**.
3. Wählen Sie den Workflow **"Build and Publish Docker Image"** aus.
4. Klicken Sie auf **"Run workflow"**.
5. Wählen Sie den Branch aus, aus dem erstellt werden soll (typischerweise `master`).
6. Klicken Sie erneut auf **"Run workflow"**.

**Hinweis:** Manuelles Erstellen wird Images nicht automatisch als `latest` kennzeichnen, es sei denn, der Workflow erkennt, dass es sich um die neueste Version handelt.

## Dokumentation veröffentlichen {/* #releasing-documentation */}

Die Dokumentation wird auf [GitHub Pages](https://wsj-br.github.io/duplistatus/) gehostet. `pnpm release:github` stellt sie nach der Veröffentlichung des GitHub-Releases bereit. Um die Site zwischen Releases der Anwendung zu aktualisieren, befolgen Sie diese Schritte:

### Voraussetzungen {/* #prerequisites */}

1. Authentifizieren Sie die GitHub CLI (`gh auth login`), damit sie Workflows starten kann.
2. Setzen Sie in den Repository-**Einstellungen → Pages** die Option **Source** auf **GitHub Actions** (nicht Deploy from a branch).

### Dokumentation bereitstellen {/* #deploy-documentation */}

1. Navigieren Sie zum Verzeichnis `documentation`:

```bash
cd documentation
```

2. Stellen Sie sicher, dass alle Änderungen an der Dokumentation committet und zu `master` gepusht wurden.

3. Erstellen und stellen Sie die Dokumentation bereit:

```bash
pnpm run deploy
```

Dieser Befehl führt folgende Schritte aus:
- Startet den Workflow **Deploy documentation** auf `master`
- Erstellt die Docusaurus-Website auf Node 24
- Veröffentlicht sie auf GitHub Pages unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Wann Dokumentation bereitstellen {/* #when-to-deploy-documentation */}

Stellen Sie Dokumentationsaktualisierungen bereit:
- Nachdem Dokumentationsänderungen in `master` zusammengeführt wurden
- Bei der Veröffentlichung einer neuen Version (falls die Dokumentation aktualisiert wurde)
- Nach wesentlichen Verbesserungen der Dokumentation

**Hinweis:** Die Bereitstellung der Dokumentation ist unabhängig von Anwendungsveröffentlichungen. Sie können die Dokumentation mehrfach zwischen Anwendungsveröffentlichungen bereitstellen.

### Vorbereiten von Versionshinweisen für GitHub {/* #preparing-release-notes-for-github */}

Das Skript `generate-readme-from-intro.sh` generiert beim Ausführen automatisch GitHub-Versionshinweise. Es liest die Versionshinweise aus `documentation/docs/release-notes/VERSION.md` (wobei VERSION aus `package.json` extrahiert wird) und erstellt `RELEASE_NOTES_github_VERSION.md` im Projektstammverzeichnis.

**Beispiel:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Die generierte Release-Notizdatei kann direkt in die GitHub-Release-Beschreibung kopiert und eingefügt werden. Alle Links und Bilder funktionieren im Kontext der GitHub-Release korrekt.

**Hinweis:** Die generierte Datei ist temporär und kann nach Erstellung der GitHub-Version gelöscht werden. Es wird empfohlen, `RELEASE_NOTES_github_*.md` zu `.gitignore` hinzuzufügen, wenn Sie diese Dateien nicht committen möchten.

### README.md aktualisieren {/* #update-readmemd */}

Wenn Sie Änderungen an `documentation/docs/intro.md` vorgenommen haben, generieren Sie das Repository `README.md` neu. Vor einem GitHub-Release führt `pnpm release:github:dry` dasselbe Skript aus und schreibt auch `RELEASE_NOTES_github_VERSION.md` neu:

```bash
./scripts/generate-readme-from-intro.sh
# or, as the release preflight:
pnpm release:github:dry
```

Dieses Skript:
- Extrahiert die Version aus `package.json`
- Generiert `README.md` aus `documentation/docs/intro.md` (wandelt Docusaurus-Hinweise in GitHub-Stil-Warnungen um, wandelt Links und Bilder um)
- Erstellt `README_dockerhub.md` für Docker Hub (mit Docker Hub-kompatibler Formatierung)
- Generiert `RELEASE_NOTES_github_VERSION.md` aus `documentation/docs/release-notes/VERSION.md` (wandelt Links und Bilder in absolute URLs um)
- Aktualisiert das Inhaltsverzeichnis unter Verwendung von `doctoc`

`README.md` zusammen mit Ihrer Veröffentlichung committen und pushen
