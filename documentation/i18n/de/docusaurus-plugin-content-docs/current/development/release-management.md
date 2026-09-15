# Release Management {/* #release-management */}

## Versionierung (Semantic Versioning) {/* #versioning-semantic-versioning */}

Das Projekt folgt dem Semantic Versioning (SemVer) mit dem Format `MAJOR.MINOR.PATCH`:

- **MAJOR** Version (x.0.0): Wenn Sie inkompatible API-Änderungen vornehmen
- **MINOR** Version (0.x.0): Wenn Sie Funktionalität auf abwärtskompatible Weise hinzufügen
- **PATCH** Version (0.0.x): Wenn Sie abwärtskompatible Fehlerbehebungen vornehmen

## Pre-Release Checkliste {/* #pre-release-checklist */}

Bevor Sie eine neue Version freigeben, stellen Sie sicher, dass Sie Folgendes abgeschlossen haben:

- [ ] Alle Änderungen sind committed und in den `vMAJOR.MINOR.x` Branch gepusht.
- [ ] Die Versionsnummer ist in `package.json` aktualisiert (verwenden Sie `scripts/update-version.sh`, um sie über die Dateien zu synchronisieren).
- [ ] Alle Tests sind erfolgreich (in Entwicklungsmodus, lokal, Docker und Podman).
- [ ] Starten Sie einen Docker-Container mit `pnpm docker:up` und führen Sie `scripts/compare-versions.sh` aus, um die Versionskompatibilität zwischen der Entwicklungs- und der Docker-Umgebung zu überprüfen (erfordert, dass der Docker-Container läuft). Dieses Skript vergleicht die SQLite-Versionen nur nach der Hauptversion (z. B. 3.45.1 vs. 3.51.1 werden als kompatibel betrachtet) und vergleicht die Node-, npm- und Duplistatus-Versionen exakt.
- [ ] Die Dokumentation ist auf dem neuesten Stand, aktualisieren Sie die Screenshots (verwenden Sie `pnpm take-screenshots`)
- [ ] Die Release Notes sind in `documentation/docs/release-notes/VERSION.md` vorbereitet.
- [ ] Führen Sie `scripts/generate-readme-from-intro.sh` aus, um `README.md` mit der neuen Version und allen Änderungen aus `documentation/docs/intro.md` zu aktualisieren. Dieses Skript generiert auch automatisch `README_dockerhub.md` und `RELEASE_NOTES_github_VERSION.md`.

## Release-Prozess Übersicht {/* #release-process-overview */}

Der empfohlene Release-Prozess verwendet **GitHub Pull Requests und Releases** (siehe unten). Dies bietet bessere Sichtbarkeit, Review-Möglichkeiten und löst automatisch Docker-Image-Builds aus. Die Befehlszeilenmethode ist als Alternative verfügbar.

## Methode 1: GitHub Pull Request und Release (Empfohlen) {/* #method-1-github-pull-request-and-release-recommended */}

Dies ist die bevorzugte Methode, da sie bessere Nachverfolgbarkeit bietet und automatisch Docker-Builds auslöst.

### Schritt 1: Pull Request erstellen {/* #step-1-create-pull-request */}

1. Navigieren Sie zum [duplistatus Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf die Registerkarte **"Pull requests"**.
3. Klicken Sie auf **"New pull request"**.
4. Legen Sie den **base branch** auf `master` und den **compare branch** auf `vMAJOR.MINOR.x` fest.
5. Überprüfen Sie die Änderungen in der Vorschau, um sicherzustellen, dass alles korrekt aussieht.
6. Klicken Sie auf **"Create pull request"**.
7. Fügen Sie einen beschreibenden Titel hinzu (z. B. "Release v1.2.0") und eine Beschreibung, die die Änderungen zusammenfasst.
8. Klicken Sie erneut auf **"Create pull request"**.

### Schritt 2: Pull Request mergen {/* #step-2-merge-the-pull-request */}

Nach der Überprüfung des Pull Requests:

1. Wenn keine Konflikte vorliegen, klicken Sie auf die grüne Schaltfläche **"Merge pull request"**.
2. Wählen Sie Ihre Merge-Strategie (typischerweise "Create a merge commit").
3. Bestätigen Sie den Merge.

### Schritt 3: GitHub Release erstellen {/* #step-3-create-github-release */}

Sobald der Merge abgeschlossen ist, erstellen Sie ein GitHub Release:

1. Navigieren Sie zum [duplistatus Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Gehen Sie zum Abschnitt **"Releases"** (oder klicken Sie auf "Releases" in der rechten Seitenleiste).
3. Klicken Sie auf **"Neue Veröffentlichung entwerfen."**
4. Geben Sie im Feld **"Tag auswählen"** Ihre neue Versionsnummer im Format `vMAJOR.MINOR.PATCH` ein (z. B. `v1.2.0`). Dies erstellt einen neuen Tag.
5. Wählen Sie `master` als Zielbranch aus.
6. Fügen Sie einen **Veröffentlichungstitel** hinzu (z. B. "Release v1.2.0").
7. Fügen Sie eine **Beschreibung** hinzu, die die Änderungen in dieser Version dokumentiert. Sie können:
   - Den Inhalt aus `RELEASE_NOTES_github_VERSION.md` kopieren (generiert von `scripts/generate-readme-from-intro.sh`)
   - Oder die Versionshinweise aus `documentation/docs/release-notes/` referenzieren (beachten Sie, dass relative Links in GitHub-Veröffentlichungen nicht funktionieren)
8. Klicken Sie auf **"Veröffentlichung veröffentlichen."**

**Was passiert automatisch:**
- Ein neuer Git-Tag wird erstellt
- Der "Build and Publish Docker Image"-Workflow wird ausgelöst
- Docker-Images werden für die Architekturen AMD64 und ARM64 erstellt
- Die Bilder werden auf:
  - Docker Hub: `wsjbr/duplistatus:VERSION` und `wsjbr/duplistatus:latest` (falls dies die neueste Veröffentlichung ist)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` und `ghcr.io/wsj-br/duplistatus:latest` (falls dies die neueste Veröffentlichung ist)

## Methode 2: Befehlszeile (Alternative) {/* #method-2-command-line-alternative */}

Wenn Sie die Befehlszeile bevorzugen, befolgen Sie diese Schritte:

### Schritt 1: Lokales Master-Branch aktualisieren {/* #step-1-update-local-master-branch */}

Stellen Sie sicher, dass Ihr lokales `master`-Branch auf dem neuesten Stand ist:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Schritt 2: Entwicklungsbranch zusammenführen {/* #step-2-merge-development-branch */}

Führen Sie den `vMAJOR.MINOR.x`-Branch in den `master`-Branch zusammen:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Falls es zu **Merge-Konflikten** kommt, lösen Sie diese manuell:
1. Bearbeiten Sie die betroffenen Dateien
2. Stagen Sie die gelösten Dateien: `git add <file>`
3. Beenden Sie den Merge: `git commit`

### Schritt 3: Release taggen {/* #step-3-tag-the-release */}

Erstellen Sie einen annotierten Tag für die neue Version:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

Die `-a`-Flagge erstellt einen annotierten Tag (empfohlen für Releases), und die `-m`-Flagge fügt eine Nachricht hinzu.

### Schritt 4: Zu GitHub pushen {/* #step-4-push-to-github */}

Pushen Sie sowohl den aktualisierten `master`-Branch als auch den neuen Tag:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativ können Sie alle Tags auf einmal pushen: `git push --tags`

### Schritt 5: GitHub-Release erstellen {/* #step-5-create-github-release */}

Nach dem Pushen des Tags erstellen Sie ein GitHub-Release (siehe Methode 1, Schritt 3), um den Docker-Build-Workflow auszulösen.

## Manuelles Docker-Image-Build {/* #manual-docker-image-build */}

So können Sie den Docker-Image-Build-Workflow manuell auslösen, ohne eine Version zu erstellen:

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf die Registerkarte **"Aktionen"**.
3. Wählen Sie den Workflow **"Build and Publish Docker Image"** aus.
4. Klicken Sie auf **"Run workflow"**.
5. Wählen Sie den Zweig aus, von dem aus gebaut werden soll (typischerweise `master`).
6. Klicken Sie erneut auf **"Run workflow"**.

**Hinweis:** Manuelle Builds kennzeichnen Bilder nicht automatisch als `latest`, es sei denn, der Workflow entscheidet, dass es sich um die neueste Version handelt.

## Dokumentation veröffentlichen {/* #releasing-documentation */}

Die Dokumentation wird auf [GitHub Pages](https://wsj-br.github.io/duplistatus/) gehostet und separat von der Anwendungsversion bereitgestellt. Folgen Sie diesen Schritten, um aktualisierte Dokumentation zu veröffentlichen:

### Voraussetzungen {/* #prerequisites */}

1. Stellen Sie sicher, dass Sie ein GitHub-Personal Access Token mit dem `repo`-Bereich haben.
2. Richten Sie Git-Anmeldedaten ein (einmalige Einrichtung):

```bash
cd documentation
./setup-git-credentials.sh
```

Dadurch werden Sie aufgefordert, Ihr GitHub-Personal Access Token einzugeben und es sicher zu speichern.

### Dokumentation bereitstellen {/* #deploy-documentation */}

1. Navigieren Sie zum `documentation`-Verzeichnis:

```bash
cd documentation
```

2. Stellen Sie sicher, dass alle Dokumentationsänderungen in das Repository committed und gepusht wurden.

3. Erstellen und stellen Sie die Dokumentation bereit:

```bash
pnpm run deploy
```

Dieser Befehl wird:
- Die Docusaurus-Dokumentationsseite erstellen
- Die erstellte Seite auf den `gh-pages`-Zweig pushen
- Die Dokumentation unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) verfügbar machen

### Wann Dokumentation bereitstellen {/* #when-to-deploy-documentation */}

Stellen Sie Dokumentationsupdates bereit:
- Nach dem Zusammenführen von Dokumentationsänderungen in `master`
- Bei der Veröffentlichung einer neuen Version (falls Dokumentation aktualisiert wurde)
- Nach erheblichen Dokumentationsverbesserungen

**Hinweis:** Die Bereitstellung der Dokumentation ist unabhängig von Anwendungsversionen. Sie können die Dokumentation mehrmals zwischen Anwendungsversionen bereitstellen.

### Vorbereitung der Release Notes für GitHub {/* #preparing-release-notes-for-github */}

Das `generate-readme-from-intro.sh`-Skript generiert automatisch GitHub-Release Notes, wenn es ausgeführt wird. Es liest die Release Notes aus `documentation/docs/release-notes/VERSION.md` (wo VERSION aus `package.json` extrahiert wird) und erstellt `RELEASE_NOTES_github_VERSION.md` im Projektstamm.

**Beispiel:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Die generierte Release-Notizen-Datei kann direkt in die GitHub-Release-Beschreibung kopiert und eingefügt werden. Alle Links und Bilder funktionieren korrekt im GitHub-Release-Kontext.

**Hinweis:** Die generierte Datei ist temporär und kann nach der Erstellung des GitHub-Releases gelöscht werden. Es wird empfohlen, `RELEASE_NOTES_github_*.md` zu `.gitignore` hinzuzufügen, wenn Sie diese Dateien nicht committen möchten.

### README.md aktualisieren {/* #update-readmemd */}

Wenn Sie Änderungen an `documentation/docs/intro.md` vorgenommen haben, generieren Sie das Repository `README.md` neu:

```bash
./scripts/generate-readme-from-intro.sh
```

Dieses Skript:
- Extrahiert die Version aus `package.json`
- Generiert `README.md` aus `documentation/docs/intro.md` (wandelt Docusaurus-Admonitions in GitHub-kompatible Warnungen um, wandelt Links und Bilder)
- Erstellt `README_dockerhub.md` für Docker Hub (mit Docker Hub-kompatibler Formatierung)
- Generiert `RELEASE_NOTES_github_VERSION.md` aus `documentation/docs/release-notes/VERSION.md` (wandelt Links und Bilder in absolute URLs um)
- Aktualisiert das Inhaltsverzeichnis mit Hilfe von `doctoc`

Committen und pushen Sie die aktualisierte `README.md` zusammen mit Ihrem Release.
