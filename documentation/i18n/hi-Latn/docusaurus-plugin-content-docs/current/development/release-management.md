# Release Management {#release-management}

## Versioning (Semantic Versioning) {#versioning-semantic-versioning}

Project Semantic Versioning (SemVer) format `MAJOR.MINOR.PATCH` follow karta hai:

- **MAJOR** version (x.0.0): Jab aap incompatible API changes karte hain
- **MINOR** version (0.x.0): Jab aap backward-compatible tarike se functionality add karte hain
- **PATCH** version (0.0.x): Jab aap backward-compatible bug fixes karte hain

## Pre-Release Checklist {#pre-release-checklist}

Naye version ko release karne se pehle, yeh sunishchit karein ki aapne nimnalikhit poora kar liya hai:

- [ ] Saare changes commit aur `vMAJOR.MINOR.x` branch mein push ho gaye hain.
- [ ] Version number `package.json` mein update kiya gaya hai (files mein synchronise karne ke liye `scripts/update-version.sh` ka upyog karein).
- [ ] Saare tests pass ho rahe hain (devel mode, local, docker aur podman mein). 
- [ ] `pnpm docker:up` ke saath ek Docker container shuru karein aur development environment aur Docker container ke beech version consistency verify karne ke liye `scripts/compare-versions.sh` run karein (iske liye Docker container ka chalna zaroori hai). Yeh script sirf major version ke hisaab se SQLite versions ki tulna karta hai (jaise, 3.45.1 vs 3.51.1 ko compatible maana jaata hai), aur Node, npm, aur Duplistatus versions ki bilkul sahi tulna karta hai.
- [ ] Documentation up-to-date hai, screenshots update karein (`pnpm take-screenshots` ka upyog karein)
- [ ] Release notes `documentation/docs/release-notes/VERSION.md` mein taiyar hain.
- [ ] Naye version aur `documentation/docs/intro.md` se kisi bhi changes ke saath `README.md` ko update karne ke liye `scripts/generate-readme-from-intro.sh` run karein. Yeh script `README_dockerhub.md` aur `RELEASE_NOTES_github_VERSION.md` ko automatically generate bhi karta hai.

## Release Process Overview {#release-process-overview}

Recommended release process **GitHub Pull Requests aur Releases** ka upyog karta hai (neeche dekhein). Yeh behtar visibility, review capabilities pradaan karta hai, aur automatically Docker image builds trigger karta hai. Command-line method ek vikalp ke roop mein uplabdh hai.

## Method 1: GitHub Pull Request aur Release (Recommended) {#method-1-github-pull-request-and-release-recommended}

Yeh preferred method hai kyunki yeh behtar traceability pradaan karta hai aur automatically Docker builds trigger karta hai.

### Step 1: Pull Request Create Karein {#step-1-create-pull-request}

1. GitHub par [duplistatus repository](https://github.com/wsj-br/duplistatus) par navigate karein.
2. **"Pull requests"** tab par click karein.
3. **"New pull request."** par click karein.
4. **base branch** ko `master` aur **compare branch** ko `vMAJOR.MINOR.x` par set karein.
5. Changes preview ko review karein taaki sab kuch sahi lage.
6. **"Create pull request."** par click karein.
7. Ek descriptive title (jaise, "Release v1.2.0") aur changes ka summary dene wala description add karein.
8. Dobara **"Create pull request"** par click karein.

### Step 2: Pull Request ko Merge Karein {#step-2-merge-the-pull-request}

Pull request review karne ke baad:

1. Agar koi conflicts nahi hain, toh green **"Merge pull request"** button par click karein.
2. Apni merge strategy chunein (aam taur par "Create a merge commit").
3. Merge ko confirm karein.

### Step 3: GitHub Release Create Karein {#step-3-create-github-release}

Merge poora hone ke baad, ek GitHub release banayein:

1. [duplistatus repository](https://github.com/wsj-br/duplistatus) GitHub par navigate karen.
2. **"Releases"** section par jaayen (ya daahine sidebar mein "Releases" par click karen).
3. **"Draft a new release."** par click karen.
4. **"Choose a tag"** field mein, `vMAJOR.MINOR.PATCH` format mein apna naya version number type karen (udaaharan: `v1.2.0`). Yeh ek naya tag banayega.
5. Target branch ke taur par `master` select karen.
6. Ek **release title** (udaaharan: "Release v1.2.0") add karen.
7. Is version mein kiye gaye badlavon ko document karne wala ek **description** add karen. Aap yeh kar sakte hain:
   - `RELEASE_NOTES_github_VERSION.md` (jise `scripts/generate-readme-from-intro.sh` dwara generate kiya gaya hai) se content copy karen
   - Ya `documentation/docs/release-notes/` se release notes ka reference dein (lekin dhyan rahe ki GitHub releases mein relative links kaam nahin karenge)
8. **"Publish release."** par click karen.

**Kya swatah hota hai:**
- Ek naya Git tag banaya jaata hai
- "Build and Publish Docker Image" workflow trigger hota hai
- AMD64 aur ARM64 architectures ke liye Docker images banayi jaati hain
- Images yahan push ki jaati hain:
  - Docker Hub: `wsjbr/duplistatus:VERSION` aur `wsjbr/duplistatus:latest` (agar yeh latest release hai)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` aur `ghcr.io/wsj-br/duplistatus:latest` (agar yeh latest release hai)

## Vidhi 2: Command Line (Vaikalpik) {#method-2-command-line-alternative}

Agar aap command line ka istemal karna pasand karte hain, to in steps ko follow karen:

### Step 1: Local Master Branch Update Karen {#step-1-update-local-master-branch}

Sunishchit karen ki aapki local `master` branch updated hai:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Step 2: Development Branch Merge Karen {#step-2-merge-development-branch}

`vMAJOR.MINOR.x` branch ko `master` mein merge karen:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Agar **merge conflicts** hain, to unhe manual roop se resolve karen:
1. Conflicted files ko edit karen
2. Resolved files ko stage karen: `git add <file>`
3. Merge ko poora karen: `git commit`

### Step 3: Release Tag Karen {#step-3-tag-the-release}

Naye version ke liye ek annotated tag banayen:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

`-a` flag ek annotated tag banata hai (releases ke liye recommended), aur `-m` flag ek message add karta hai.

### Step 4: GitHub par Push Karen {#step-4-push-to-github}

Updated `master` branch aur naye tag dono ko push karen:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Vaikalpik roop se, sabhi tags ko ek saath push karen: `git push --tags`

### Step 5: GitHub Release Banayen {#step-5-create-github-release}

Tag push karne ke baad, Docker build workflow ko trigger karne ke liye ek GitHub release banayen (Vidhi 1, Step 3 dekhen).

## Manual Docker Image Build {#manual-docker-image-build}

Docker image build workflow ko manual roop se trigger karne ke liye, bina release banaye:

1. GitHub par [duplistatus repository](https://github.com/wsj-br/duplistatus) par jaen.
2. **"Actions"** tab par click karen.
3. **"Build and Publish Docker Image"** workflow ko select karen.
4. **"Run workflow"** par click karen.
5. Us branch ko select karen jisse build karna hai (aam taur par `master`).
6. Dobara **"Run workflow"** par click karen.

**Note:** Manual builds automatically `latest` ke roop mein images ko tag nahin karenge jab tak ki workflow ise latest release na maane.

## Releasing Documentation {#releasing-documentation}

Documentation [GitHub Pages](https://wsj-br.github.io/duplistatus/) par host ki jaati hai aur application release se alag deploy ki jaati hai. Updated documentation release karne ke liye in steps ko follow karen:

### Prerequisites {#prerequisites}

1. Sunishchit karen ki aapke paas `repo` scope wala GitHub Personal Access Token hai.
2. Git credentials set up karen (ek baar setup):

```bash
cd documentation
./setup-git-credentials.sh
```

Yah aapko aapke GitHub Personal Access Token ke liye prompt karega aur ise surakshit roop se store karega.

### Deploy Documentation {#deploy-documentation}

1. `documentation` directory mein jaen:

```bash
cd documentation
```

2. Sunishchit karen ki sabhi documentation changes commit aur repository mein push ho gaye hain.

3. Documentation ko build aur deploy karen:

```bash
pnpm run deploy
```

Yah command yeh karega:
- Docusaurus documentation site ko build karega
- Built site ko `gh-pages` branch mein push karega
- Documentation ko [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) par uplabdh karayega

### When to Deploy Documentation {#when-to-deploy-documentation}

Documentation updates ko deploy karen:
- `master` mein documentation changes merge karne ke baad
- Jab koi naya version release ho raha ho (agar documentation update ki gayi ho)
- Badi documentation sudharon ke baad

**Note:** Documentation deployment application releases se swatantra hai. Aap application releases ke beech mein documentation ko kai baar deploy kar sakte hain.

### Preparing Release Notes for GitHub {#preparing-release-notes-for-github}

Chalaane par `generate-readme-from-intro.sh` script automatically GitHub release notes generate karta hai. Yah `documentation/docs/release-notes/VERSION.md` se release notes padhta hai (jahan VERSION ko `package.json` se extract kiya jaata hai) aur project root mein `RELEASE_NOTES_github_VERSION.md` banata hai.

**Udaharan:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Generate kiye gaye release notes file ko seedhe GitHub release description mein copy aur paste kiya ja sakta hai. Sabhi links aur images GitHub release context mein sahi se kaam karenge.

**Note:** Banayi gayi file asthayi hai aur GitHub release banane ke baad delete ki ja sakti hai. Yadi aap in files ko commit nahi karna chahte hain to `RELEASE_NOTES_github_*.md` ko `.gitignore` mein jodna sujhaya gaya hai.

### README.md {#update-readmemd} ko update karein

Yadi aapne `documentation/docs/intro.md` mein badlav kiye hain, to repository `README.md` ko dobara generate karein:

```bash
./scripts/generate-readme-from-intro.sh
```

Yah script:
- `package.json` se version extract karti hai
- `documentation/docs/intro.md` se `README.md` generate karti hai (Docusaurus admonitions ko GitHub-style alerts mein badalti hai, links aur images ko badalti hai)
- Docker Hub ke liye `README_dockerhub.md` banati hai (Docker Hub-compatible formatting ke saath)
- `documentation/docs/release-notes/VERSION.md` se `RELEASE_NOTES_github_VERSION.md` generate karti hai (links aur images ko absolute URLs mein badalti hai)
- `doctoc` ka upyog karke table of contents ko update karti hai

Apne release ke saath updated `README.md` ko commit aur push karein.
