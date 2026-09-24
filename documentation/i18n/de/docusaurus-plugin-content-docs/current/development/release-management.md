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
- [ ] Die Dokumentation ist auf dem neuesten Stand, aktualisieren Sie die Screenshots (verwenden Sie `pnpm take-screenshots`)
- [ ] Versionshinweise sind in `documentation/docs/release-notes/VERSION.md` vorbereitet.
- [ ] Führen Sie `scripts/generate-readme-from-intro.sh` aus, um `README.md` mit der neuen Version und allen Änderungen aus `documentation/docs/intro.md` zu aktualisieren. Dieses Skript generiert auch automatisch `README_dockerhub.md` und `RELEASE_NOTES_github_VERSION.md`.

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
pnpm release:github:dry   # print the planned tag, notes file, and gh command
pnpm release:github       # generate GitHub notes, tag vVERSION at HEAD, publish the release, and deploy the docs
```

`scripts/release.mjs` liest die Version aus `package.json`, führt `scripts/generate-readme-from-intro.sh` aus (sodass `RELEASE_NOTES_github_VERSION.md` absolute Links enthält) und erstellt das GitHub-Release. Durch die Veröffentlichung wird der Docker-Image-Workflow gestartet. Das Skript führt dann `pnpm run deploy` in `documentation/` aus, um die Docusaurus-Site zu erstellen und nach `gh-pages` zu pushen. Falls das Tag `vVERSION` oder dieses GitHub-Release bereits existiert, löscht das Skript diese und erstellt das Tag am aktuellen HEAD neu. Übergeben Sie `--verify-clean=false`, um die Prüfungen auf einen sauberen Working Tree zu überspringen.

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

1. Stellen Sie sicher, dass Sie über ein GitHub-Personal Access Token mit dem Bereich `repo` verfügen.
2. Richten Sie Git-Anmeldeinformationen ein (einmalige Einrichtung):

```bash
cd documentation
./setup-git-credentials.sh
```

Dadurch werden Sie zur Eingabe Ihres GitHub-Personal Access Tokens aufgefordert und dieser sicher gespeichert.

### Dokumentation bereitstellen {/* #deploy-documentation */}

1. Navigieren Sie zum Verzeichnis `documentation`:

```bash
cd documentation
```

2. Stellen Sie sicher, dass alle Dokumentationsänderungen committet und in das Repository gepusht wurden.

3. Erstellen und stellen Sie die Dokumentation bereit:

```bash
pnpm run deploy
```

Dieser Befehl führt Folgendes aus:
- Erstellt die Docusaurus-Dokumentationsseite
- Überträgt die erstellte Seite in den Branch `gh-pages`
- Macht die Dokumentation unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) verfügbar

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

Wenn Sie Änderungen an `documentation/docs/intro.md` vorgenommen haben, generieren Sie das Repository `README.md` erneut:

```bash
./scripts/generate-readme-from-intro.sh
```

Dieses Skript:
- Extrahiert die Version aus `package.json`
- Generiert `README.md` aus `documentation/docs/intro.md` (wandelt Docusaurus-Hinweise in GitHub-Stil-Warnungen um, wandelt Links und Bilder um)
- Erstellt `README_dockerhub.md` für Docker Hub (mit Docker Hub-kompatibler Formatierung)
- Generiert `RELEASE_NOTES_github_VERSION.md` aus `documentation/docs/release-notes/VERSION.md` (wandelt Links und Bilder in absolute URLs um)
- Aktualisiert das Inhaltsverzeichnis unter Verwendung von `doctoc`

`README.md` zusammen mit Ihrer Veröffentlichung committen und pushen
