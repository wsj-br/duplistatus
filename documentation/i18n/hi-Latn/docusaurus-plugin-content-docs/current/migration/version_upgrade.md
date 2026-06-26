# duplistatus Sanskaran Guide {#migration-guide}

Yah guide batati hai ki duplistatus ke sanskaranon ke beech kaise upgrade karein. Migration swachalit hain—jab aap naya sanskaran shuru karte hain to database schema khud update ho jaata hai.

Manual kadam sirf tabhi avashyak hain jab aapne notification templates ko customize kiya ho (sanskaran 0.8.x ne template variables badle hain) ya external API integrations ko update karne ki avashyakta ho (sanskaran 0.7.x ne API field names badle hain, sanskaran 0.9.x ko authentication ki avashyakta hai).

## Overview {#overview}

duplistatus upgrade karte samay aapke database schema ko swachalit roop se migrate karta hai. Pranali:

1. Parivartanon ko karne se pehle aapke database ka backup banata hai
2. Database schema ko naveentam sanskaran tak update karta hai
3. Sabhi vidyamaan data (servers, backups, configuration) ko sanrakshit rakhta hai
4. Migration ke safaltapoorvak poora hone ki pushti karta hai

## Migration Se Pehle Aapke Database Ka Backup Lena {#backing-up-your-database-before-migration}

Naye sanskaran mein upgrade karne se pehle, aapke database ka backup banana anushansit hai. Yah sunishchit karta hai ki yadi migration prakriya ke dauraan kuch galat ho jaaye to aap apne data ko restore kar sakte hain.

### Yadi Aap Sanskaran 1.2.1 Ya Uske Baad Chalate Hain {#if-youre-running-version-121-or-later}

Antar-nirmit database backup function ka upyog karein:

1. Web interface mein [Sammaan → Database Maintenance](../user-guide/settings/database-maintenance.md) par jaayein
2. **Database Backup** section mein, ek backup format chunein:
   - **Database File (.db)**: Binary format - sabse tez backup, sabhi database structure ko bilkul sanrakshit rakhta hai
   - **SQL Dump (.sql)**: Text format - manav-pathneeya SQL statements
3. **Download Backup** par click karein
4. Backup file aapke computer par timestamped filename ke saath download ho jayegi

Adhik vivaran ke liye, [Database Maintenance](../user-guide/settings/database-maintenance.md#database-backup) dastavez par jaayein.

### Yadi Aap Sanskaran 1.2.1 Se Pehle Chalate Hain {#if-youre-running-a-version-before-121}

#### Backup {#backup}

Aage badhne se pehle aapko database ka manual backup lena hoga. Database file container ke andar `/app/data/backups.db` par sthit hai.

##### Linux Upyogkartaon Ke Liye {#for-linux-users}
Yadi aap Linux par hain, to helper containers shuru karne ki chinta na karein. Aap running container se seedhe database ko apne host par nikalne ke liye native `cp` command ka upyog kar sakte hain.

###### Docker Ya Podman Ka Upyog Karna: {#using-docker-or-podman}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Podman ka upyog karte samay, upar diye gaye command mein `docker` ko `podman` se badal dein.)

##### Windows Upyogkartaon Ke Liye {#for-windows-users}
Yadi aap Windows par Docker Desktop chalate hain, to command line ka upyog kiye bina ise handle karne ke liye aapke paas do saral tareeke hain:

###### Vikalp A: Docker Desktop Ka Upyog Karein (Sabse Aasan) {#option-a-use-docker-desktop-easiest}
1. Docker Desktop Dashboard kholein.
2. Containers tab par jaayein aur apne duplistatus container par click karein.
3. Files tab par click karein.
4. `/app/data/` par jaayen.
5. `backups.db` par right-click karein aur ise apne Windows folder mein download karne ke liye **Save as...** chunein.

###### Vikalp B: PowerShell ka upyog karein {#option-b-use-powershell}
Yadi aap terminal pasand karte hain, to aap file ko apne Desktop par copy karne ke liye PowerShell ka upyog kar sakte hain:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### Yadi aap Bind Mounts ka upyog karte hain {#if-you-use-bind-mounts}
Yadi aapne shuru mein bind mount ka upyog karke apna container set kiya tha (udaharan ke liye, aapne `/opt/duplistatus` jaise local folder ko container mein map kiya), to aapko bilkul bhi Docker commands ki zaroorat nahin hai. Bas apne file manager ka upyog karke file copy karein:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Setup ke dauraan aapne jo folder designate kiya tha, us folder se **File Explorer** mein file ko seedhe copy karein.

#### Apne Data ko Restore karna {#restoring-your-data}
Yadi aapko apne database ko pichhle backup se restore karne ki zaroorat hai, to apne operating system ke aadhar par neeche diye gaye steps follow karein.

:::info[IMPORTANT]
Database restore karne se pehle container ko stop karein taaki file corruption se bacha ja sake.
:::

##### Linux Upyogkartaon ke liye {#for-linux-users-1}
Restore karne ka sabse aasan tareeka backup file ko container ke internal storage path mein "push" karna hai.

###### Docker ya Podman ka upyog karna: {#using-docker-or-podman-1}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Windows Upyogkartaon ke liye {#for-windows-users-1}
Yadi aap Docker Desktop ka upyog kar rahe hain, to aap GUI ya PowerShell ke madhyam se restore kar sakte hain.

###### Vikalp A: Docker Desktop (GUI) ka upyog karna {#option-a-use-docker-desktop-gui}
1. Sunishchit karein ki duplistatus container chal raha hai (Docker Desktop ko GUI ke madhyam se file upload karne ke liye container ka sakriya hona zaroori hai).
2. Apne container settings mein Files tab par jaayen.
3. `/app/data/` par jaayen.
4. Maujooda backups.db par right-click karein aur Delete chunein.
5. Import button par click karein (ya folder area mein right-click karein) aur apne computer se apna backup file chunein.

Import ki gayi file ka naam badalkar bilkul backups.db rakhein yadi uske naam mein timestamp ho.

Container ko restart karein.

###### Vikalp B: PowerShell ka upyog karna {#option-b-use-powershell-1}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Yadi aap Bind Mounts ka upyog karte hain {#if-you-use-bind-mounts-1}
Yadi aap container mein map ki gayi local folder ka upyog kar rahe hain, to aapko kisi vishesh command ki zaroorat nahin hai.

1. Container ko stop karein.
2. Apni backup file ko manually apne mapped folder (udaharan ke liye, `/opt/duplistatus` ya `C:\duplistatus_data`) mein copy karein.
3. Sunishchit karein ki file ka naam bilkul `backups.db` hai.
4. Container ko start karein.

```bash
docker logs <container-name>
```

:::note
Yadi aap database ko manually restore karte hain, to aapko permission errors ka saamna karna pad sakta hai. 

Container logs check karein aur yadi zaroori ho to permissions adjust karein. Adhik jaankari ke liye neeche [Troubleshooting](#troubleshooting-your-restore--rollback) section dekhein.
:::

## Swachalit Migration Prakriya {#automatic-migration-process}

Jab aap naya sanskaran start karte hain, to migrations swachalit roop se chalte hain:

1. **Backup Banana**: Aapke data directory mein ek timestamped backup banaya jaata hai
2. **Schema Update**: Database tables aur fields zaroorat ke anusar update kiye jaate hain
3. **Data Migration**: Sabhi maujooda data ko surakshit rakha jaata hai aur migrate kiya jaata hai
4. **Satyapan**: Migration ki safalta log ki jaati hai

### Migration ki Nigrani karna {#monitoring-migration}

Migration ki pragati ki nigrani karne ke liye Docker logs check karein:


Sandeshon ko dekhein jaise:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Sanskaran-Vishesh Migration Notes {#version-specific-migration-notes}

### Sanskaran 0.9.x ya Uske Baad Mein Upgrade karna (Schema v4.0) {#upgrading-to-version-09x-or-later-schema-v40}

:::warning
**Authentication ab zaroori hai.** Sabhi upyogkartaon ko upgrade ke baad pravesh karna hoga.
:::

#### Kya Swachalit roop se badalta hai {#what-changes-automatically}

- Database schema v3.1 se v4.0 mein migrate hota hai
- Nayi tables banayi gayi hain: `users`, `sessions`, `audit_log`
- Default Admin account swachalit roop se banaya jaata hai
- Sabhi maujooda sessions invalidate kiye gaye hain

#### Aapko Kya Karna Hoga {#what-you-must-do}

1. Default admin credentials ke saath **Pravesh karein**:
   - Username: `admin`
   - Password: `Duplistatus09`
2. Poochhe jaane par **password badlein** (pehla pravesh karne par zaroori)
3. Anya upyogkarta ke liye **upyogkarta accounts banayein** (Sammaan → Upyogkarta)
4. Authentication shamil karne ke liye **bahari API integrations update karein** (dekhein [Backward-incompatible API changes](api-changes.md))
5. Yadi avashyak ho to **Audit Log Retention configure karein** (Sammaan → Audit log)

#### Yadi Aap Lock Ho Gaye Hain {#if-youre-locked-out}

Admin recovery tool ka upyog karein:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Vivaran ke liye [Admin Recovery Guide](../user-guide/admin-recovery.md) dekhein.

### Sanskaran 0.8.x mein upgrade karna {#upgrading-to-version-08x}

#### Kya Swatah Badalta Hai {#what-changes-automatically-1}

- Database schema v3.1 mein update kiya gaya
- Encryption ke liye Master key generate ki gayi (`.duplistatus.key` mein stored)
- Sessions invalidate ki gayi (naye CSRF-protected sessions banaye gaye)
- Naye system ka upyog karke passwords encrypt kiye gaye

#### Aapko Kya Karna Hoga {#what-you-must-do-1}

1. Yadi aapne **notification templates** customize kiye hain to unhein update karein:
   - `{backup_interval_value}` aur `{backup_interval_type}` ko `{backup_interval}` se badlein
   - Default templates swatah update ho jate hain

#### Suraksha Suchnaayein {#security-notes}

- Sunishchit karein ki `.duplistatus.key` file ka backup liya gaya hai (0400 permissions hain)
- Sessions 24 ghante baad expire ho jati hain

### Sanskaran 0.7.x mein upgrade karna {#upgrading-to-version-07x}

#### Kya Swatah Badalta Hai {#what-changes-automatically-2}

- `machines` table ka naam badalkar `servers` kar diya gaya
- `machine_id` fields ka naam badalkar `server_id` kar diya gaya
- Naye fields jode gaye: `alias`, `notes`, `created_at`, `updated_at`

#### Aapko Kya Karna Hoga {#what-you-must-do-2}

1. **Bahari API integrations update karein**:
   - `/api/summary` mein `totalMachines` → `totalServers` badlein
   - API response objects mein `machine` → `server` badlein
   - `/api/lastbackups/{serverId}` mein `backup_types_count` → `backup_jobs_count` badlein
   - Endpoint paths ko `/api/machines/...` se `/api/servers/...` mein update karein
2. **Notification templates update karein**:
   - `{machine_name}` ko `{server_name}` se badlein

Vistrit API migration steps ke liye [Backward-incompatible API changes](api-changes.md) dekhein.

## Migration ke baad ki Checklist {#post-migration-checklist}

Upgrade karne ke baad, jaanch karein:

- [ ] Sabhi server dashboard mein sahi dikh rahe hain
- [ ] Backup Itihas poora aur accessible hai
- [ ] Suchnaayein kaam kar rahi hain (NTFY/email ka parikshan karein)
- [ ] Bahari API integrations kaam kar rahe hain (yadi lagu ho)
- [ ] Sammaan accessible aur sahi hain
- [ ] Backup Monitoring sahi kaam kar raha hai
- [ ] Safaltapoorvak login kiya (0.9.x+)
- [ ] Default Admin Password badla (0.9.x+)
- [ ] Anya upyogkartaon ke liye user accounts banaye (0.9.x+)
- [ ] Authentication ke saath bahari API integrations update kiye (0.9.x+)

## Samasya Nivaran {#troubleshooting}

### Migration Asafal {#migration-fails}

1. Disk space ki jaanch karein (backup ke liye space chahiye)
2. Data directory par write permissions verify karein
3. Vishesh trutiyon ke liye container logs review karein
4. Yadi zaroorat ho to backup se restore karein (Rollback neeche dekhein)

### Migration ke baad Data Gayab {#data-missing-after-migration}

1. Backup banne ki verify karein (data directory check karein)
2. Backup banane ke sandeshon ke liye container logs review karein
3. Database file integrity check karein

### Authentication Samasyayein (0.9.x+) {#authentication-issues-09x}

1. Default Admin account maujood hone ki verify karein (logs check karein)
2. Default credentials try karein: `admin` / `Duplistatus09`
3. Lockout hone par admin recovery tool ka upyog karein
4. Database mein `users` table maujood hone ki verify karein

### API Trutiyon {#api-errors}

1. Endpoint updates ke liye [Backward-incompatible API changes](api-changes.md) review karein
2. Naye field names ke saath bahari integrations update karein
3. API requests mein authentication jodein (0.9.x+)
4. Migration ke baad API endpoints ka parikshan karein

### Master Key Samasyayein (0.8.x+) {#master-key-issues-08x}

1. `.duplistatus.key` file accessible hone ki sunishchit karein
2. File permissions 0400 hone ki verify karein
3. Key generation trutiyon ke liye container logs check karein

### Podman DNS Configuration {#podman-dns-configuration}

Yadi aap Podman ka upyog kar rahe hain aur upgrade ke baad network connectivity samasyao ka anubhav kar rahe hain, to aapko apne container ke liye DNS settings configure karne ki zaroorat ho sakti hai. Vivaran ke liye installation guide mein [DNS configuration section](../installation/installation.md#configuring-dns-for-podman-containers) dekhein.

## Rollback Prakriya {#rollback-procedure}

Yadi aapko pichle sanskaran mein rollback karne ki zaroorat hai:

1. **Container band karein**: `docker stop <container-name>` (ya `podman stop <container-name>`)
2. **Apna backup dhoondhein**: 
   - Yadi aapne web interface (sanskaran 1.2.1+) ka upyog karke backup banaya hai, to us download kiye gaye backup file ka upyog karein
   - Yadi aapne manual volume backup banaya hai, to pehle use extract karein
   - Automatic migration backups data directory mein sthit hain (timestamped `.db` files)
3. **Database restore karein**: 
   - **Web interface backups ke liye (sanskaran 1.2.1+)**: `Settings → Database Maintenance` mein restore function ka upyog karein (dekhein [Database Maintenance](../user-guide/settings/database-maintenance.md#database-restore))
   - **Manual backups ke liye**: Apni data directory/volume mein `backups.db` ko backup file se badlein
4. **Pichle image sanskaran ka upyog karein**: Pichle container image ko pull aur run karein
5. **Container start karein**: Pichle sanskaran ke saath start karein

:::warning
Agar naya schema purane version ke saath asangat ho to rollback karne se data ka nuksan ho sakta hai. Rollback ka prayas karne se pehle hamesha ek haal ka backup sunishchit karein.
:::

### Apne Restore / Rollback mein samasyaon ka nivaran {#troubleshooting-your-restore--rollback}

Agar restore ya rollback ke baad application shuru nahi hota hai ya aapka data dikhai nahi deta hai, to nimnalikhit aam samasyaon ki jaanch karein:

#### 1. Database File Permissions (Linux/Podman) {#1-database-file-permissions-linuxpodman}

Agar aapne `root` upyogkarta ke roop mein file ko restore kiya hai, to container ke andar application ke paas use padhne ya likhne ki anumati nahi ho sakti hai.

* **Lakshan:** Logs mein "Permission Denied" ya "Read-only database." dikhata hai.
* **Samadhan:** File ki anumatiyon ko container ke andar reset karein taaki yeh sunishchit ho sake ki yeh pahunch yogya hai.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Galat Filename {#2-incorrect-filename}

Application vishesh roop se `backups.db` naam ki file dhoondhta hai.

* **Lakshan:** Application shuru hota hai lekin "khali" dikhta hai (jaise naya install ho).
* **Samadhan:** `/app/data/` directory ki jaanch karein. Agar aapki file ka naam `duplistatus-backup-2024.db` hai ya uska `.sqlite` extension hai, to app use nazarandaaz kar dega. Ise `backups.db` naam dene ke liye `mv` command ya Docker Desktop GUI ka upyog karein.

#### 3. Container Restart Nahi Kiya Gaya {#3-container-not-restarted}

Kuch systems par, container chalne ke dauran `docker cp` ka upyog karne se application ka database se connection turant "refresh" nahi ho sakta hai.

* **Samadhan:** Restore ke baad hamesha poora restart karein:

```bash
docker restart duplistatus
```

#### 4. Database Version Mismatch {#4-database-version-mismatch}

Agar aap duplistatus ke bahut naye version ka backup purane version mein restore kar rahe hain, to database schema asangat ho sakta hai.

* **Samadhan:** Hamesha sunishchit karein ki aap backup banane wale duplistatus image ke saman (ya naye) version ko chala rahe hain. Apne version ki jaanch isse karein:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## Database Schema Versions {#database-schema-versions}

| Application Version        | Schema Version | Mukhya Badlav                                      |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x aur pehle            | v1.0           | Shuruaati schema                                   |
| 0.7.x                      | v2.0, v3.0     | Configurations jodi gayi, machines ka naam badalkar servers kiya gaya |
| 0.8.x                      | v3.1           | Backup fields badhaye gaye, encryption support      |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | Upyogkarta access control, authentication, audit logging |

## Sahayata prapt karna {#getting-help}

- **Dastavezikaran**: [Upyogkarta Margdarshak](../user-guide/overview.md)
- **API Sandarbh**: [API Dastavezikaran](../api-reference/overview.md)
- **API Parivartan**: [Pashchagami-asangat API parivartan](api-changes.md)
- **Release Notes**: Vistrit parivartanon ke liye sanskaran-vishesh release notes ki jaanch karein
- **Samuday**: [GitHub Charcha](https://github.com/wsj-br/duplistatus/discussions)
- **Samasyaen**: [GitHub Samasyaen](https://github.com/wsj-br/duplistatus/issues)
