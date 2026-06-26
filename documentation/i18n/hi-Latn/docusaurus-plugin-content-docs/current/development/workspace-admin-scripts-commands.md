# Workspace Prabandhak Scripts & Commands {#workspace-admin-scripts-commands}

## Database saaf karein {#clean-database}

```bash
./scripts/clean-db.sh
```

Database ko saaf karta hai, sabhi data ko hata deta hai jabki database schema aur structure ko banaye rakhta hai.

>[!CAUTION]
> Savdhani se istemaal karein kyunki yeh sabhi maujooda data ko delete kar dega.

## Build artefacts aur dependencies saaf karein {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

Ek saaf state sunishchit karne ke liye sabhi build artefacts, node_modules directory, aur anya generated file ko hata deta hai. Yeh upyogi hai jab aapko ek naya installation karna ho ya dependency issues ko hal karna ho. Command delete karega:
- `node_modules/` directory
- `.next/` build directory
- `dist/` directory
- `out/` directory
- `.turbo/` directory
- `pnpm-lock.yaml`
- `data/*.json` (development JSON backup files)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- `.genkit/` directory
- `*.tsbuildinfo` files
- pnpm store cache (`pnpm store prune` ke dwara)
- Docker build cache aur system prune (images, networks, volumes)

## Docker Compose aur Docker environment saaf karein {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Ek poori Docker safai karein, jo iske liye upyogi hai:
- Disk space khali karna
- Purane/anupyogi Docker artefacts ko hatana
- Development ya testing sessions ke baad safai karna
- Ek saaf Docker environment maintain karna

## Packages ko latest version mein update karein {#update-the-packages-to-the-latest-version}

Aap packages ko manually update kar sakte hain:

```bash
ncu --upgrade
pnpm update
```

Ya automated script ka istemaal karein (`source` ko prefer karein taaki **nvm** aapki vartaman shell par lagu ho; **CI** ya non-interactive runs ke liye `CI=1` ya `UPGRADE_ALLOW_EXEC=1` ka istemaal karein):

```bash
source ./scripts/upgrade-dependencies.sh
```

`upgrade-dependencies.sh` script poore dependency upgrade process ko automate karta hai. Yeh project-agnostic hai: package manager, workspace packages, aur har package ka verify command auto-detect ho jaate hain (isliye root aur `documentation/` packages dono upgrade hote hain, bina kisi hardcoded path ke). Yeh:
- `upgrade-tools.sh` (nvm / Node LTS, global `pnpm`, `npm-check-updates`, `doctoc`) ke dwara tool setup source karta hai
- `npm-check-updates` doctor mode ke saath **build-safe** upgrades karta hai har package ke liye: yeh un upgrades ko rakhta hai jo package ke `typecheck`/`lint` ko pass karte hain aur unhe revert karta hai jo build ko todte hain (ek embedded ESLint peer gate ke saath taaki `eslint` aur React plugin bumps compatible rahein)
- Workspace pnpm lockfile ko update karta hai aur dependencies install karta hai
- Browserslist database ko update karta hai
- Vulnerabilities ke liye check karta hai (`pnpm audit`) aur non-breaking fixes (`pnpm audit --fix`) lagu karta hai
- **Suraksha ko prathmikta deta hai**: agar ek vulnerable direct dependency ko sirf ek build-breaking upgrade se theek kiya ja sakta hai, toh safe version ko force-apply kiya jaata hai aur build errors report kiye jaate hain taaki code ko compatibility ke liye update kiya ja sake
- Ek summary print karta hai (upgraded vs. build-breaking packages skipped, vulnerabilities fixed/remaining, aur manual rollback ke liye ek manifest snapshot path)

Yeh script dependencies ko up-to-date aur surakshit rakhne ke liye ek poora workflow pradan karta hai.

## Anupyogi packages ke liye check karein {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Version ki jaankari update karein {#update-version-information}

```bash
./scripts/update-version.sh
```

Yeh script unhe synchronized rakhne ke liye kai files mein version ki jaankari ko automatically update karta hai. Yeh:
- `package.json` se version extract karta hai
- `.env` file ko `VERSION` variable ke saath update karta hai (agar yeh maujood nahi hai toh ise banata hai)
- `Dockerfile` ko `VERSION` variable ke saath update karta hai (agar yeh maujood hai)
- `documentation/package.json` version field ko update karta hai (agar maujood ho)
- Sirf tab update karta hai jab version badla ho
- Har operation par feedback deta hai

## Pre-checks script {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

Yah script development server, build, ya production server shuru karne se pehle pre-checks chalaata hai. Yah:
- `.duplistatus.key` file ke maujood hone ko sunishchit karta hai (`ensure-key-file.sh` ke dwara)
- Version ki jaankari update karta hai (`update-version.sh` ke dwara)

Yah script `pnpm dev`, `pnpm build`, aur `pnpm start-local` dwara automatically call kiya jaata hai.

## Key file ka hona sunishchit karen {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

Yah script `data` directory mein `.duplistatus.key` file ke maujood hone ko sunishchit karta hai. Yah:
- Agar `data` directory maujood nahi hai to use banata hai
- Agar key file nahi hai to ek nayi 32-byte random key file generate karta hai
- File permissions ko 0400 (owner ke liye read-only) par set karta hai
- Agar permissions galat hain to unhe theek karta hai

Key file application mein cryptographic operations ke liye istemal hoti hai.

## Admin account recovery {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Yah script admin accounts ko recover karne ki anumati deta hai agar account lock ho gaya ho ya password bhool gaye hon. Yah:
- Diye gaye user ke liye password reset karta hai
- Account ko unlock karta hai agar vah lock tha
- Failed login attempts counter ko reset karta hai
- "Password Badalna Hai" flag ko clear karta hai
- Password security requirements ko poora karta hai ya nahi, iski jaanch karta hai
- Action ko audit log mein record karta hai

**Udaharan:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Yah script seedhe database ko modify karta hai. Sirf account recovery ke liye zaroorat padne par istemal karen.

## Images copy karen {#copy-images}

```bash
./scripts/copy-images.sh
```

Image files ko `documentation/static/img` se application mein unke sahi sthanon par copy karta hai:
- `favicon.ico` ko `src/app/` mein copy karta hai
- `duplistatus_logo.png` ko `public/images/` mein copy karta hai
- `duplistatus_banner.png` ko `public/images/` mein copy karta hai

Documentation images ke saath application images ko synchronized rakhne ke liye upyogi hai.

## Development aur Docker ke beech versions ki tulna karen {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Yah script aapke development environment aur chal rahe Docker container ke beech versions ki tulna karta hai. Yah:
- SQLite versions ki tulna sirf major version se karta hai (jaise, 3.45.1 vs 3.51.1 ko compatible mana jaata hai, "✅ (major)" ke roop mein dikhaya jaata hai)
- Node, npm, aur Duplistatus versions ki tulna bilkul sahi (exact match) karta hai
- Sabhi version comparisons ko dikhane wali ek formatted table display karta hai
- Color-coded results ke saath ek summary deta hai (matches ke liye ✅, mismatches ke liye ❌)
- Agar sabhi versions match karte hain to code 0 ke saath exit karta hai, agar mismatches hain to 1 ke saath

**Requirements:**
- `duplistatus` naam ka Docker container chal raha hona chahiye
- Script Docker container logs se version ki jaankari padhta hai

**Udaharan pradarshan:**

```
┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐
│ Component               │ Development                  │ Docker                       │   Match      │
├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤
│ SQLite                  │ 3.45.1                       │ 3.51.1                       │ ✅ (major)   │
│ Node                    │ 24.12.0                      │ 24.12.0                      │ ✅           │
│ npm                     │ 10.9.2                       │ 10.9.2                       │ ✅           │
│ Duplistatus             │ 1.2.1                        │ 1.2.1                        │ ✅           │
└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘
```

**Note:** SQLite versions ki tulna sirf major version se ki jaati hai kyunki ek hi major version ke alag-alag patch versions aam taur par compatible hote hain. Script yeh batayega ki agar SQLite versions major level par match karte hain lekin patch versions mein alag hain.

## Database mein configurations ko dekhna {#viewing-the-configurations-in-the-database}

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

## Backup Sammaan dikhayein {#show-backup-settings}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Configurations table mein `backup_settings` value ke contents ko ek formatted table mein display karta hai. Notification configurations ko debug karne ke liye upyogi hai. Default database path: `data/backups.db`.
