# Parikshan Script {#test-scripts}

Pariyojana mein vikas aur parikshan mein madad karne ke liye kai parikshan script shamil hain:

> [!NOTE]
> Vilambit debugging, SMTP matrix parikshan, aur cron port jaanch ke liye legacy repository-root `pnpm` helpers hata diye gaye hain. Application UI (**Sammaan → Backup Monitoring**), authenticated HTTP API, aur neeche document kiye anusar cron service ke khilaaf `curl` ka upyog karein.

## Parikshan Data Utpann Karein {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

Yah script kai server aur backup ke liye parikshan backup data utpann karti hai.

`--servers=N` parameter **anivarya** hai aur utpann kiye jaane wale server ki sankhya (1-30) nirdharit karta hai.

Utpann kiye gaye data ko `/api/upload` mein bhejne ke liye `--upload` vikalp ka upyog karein

```bash
pnpm generate-test-data --servers=N --upload
```

**Udaharan:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> Yah script database mein sabhi pichle data ko mita deti hai aur use parikshan data se badal deti hai.
> Is script ko chalane se pehle apne database ka backup lein.

## Vilambit jaanch aur cron connectivity (vikas) {#overdue-checks-and-cron-connectivity-development}

### Vilambit backup jaanch chalayein {#run-an-overdue-backup-check}

Jab app chal raha ho:

- **UI (anushansit):** **Sammaan → Backup Monitoring** kholein aur **Vilambit Backups ka Parikshan** ka upyog karein. Yah authenticated `POST /api/notifications/check-overdue` ke madhyam se scheduled job ke saman logic chalata hai.

### Cron service swasthya {#cron-service-health}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Vishesh Taareekh ya Samay ka Anukaran {#simulating-a-specific-date-or-time}

Ek anukrit "vartaman" samay ko inject karne ke liye koi bundled CLI nahin hai. Algorithm aur manual parikshan vicharon ke liye, repository file `dev/OVERDUE_DETECTION_ALGORITHM.md` aur `src/lib/overdue-backup-checker.ts` mein implementation dekhein.

## CSV export ko Validate Karein {#validate-csv-export}

```bash
pnpm validate-csv-export
```

Yah script CSV export functionality ko validate karti hai. Yah:
- CSV export generation ka parikshan karti hai
- Exported files mein data format aur structure ki pushti karti hai
- Data integrity ke liye jaanch karti hai

Release se pehle CSV exports ke sahi dhang se kaam karne ko sunishchit karne ke liye upyogi.

## NTFY server ko temporarily block karein (parikshan ke liye) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Yah script NTFY server (`ntfy.sh`) ko network access bahar jaane se temporarily block karta hai, notification retry mechanism ke parikshan ke liye. Yah:
- NTFY server ka IP pata resolve karta hai
- Bahar jaane wale traffic ko block karne ke liye ek iptables rule jodta hai
- 10 seconds ke liye block karta hai (configurable)
- Exit hone par block rule ko automatically hata deta hai
- Root privileges (sudo) ki avashyakta hoti hai

>[!CAUTION]
> Yah script iptables rules ko modify karta hai aur root privileges ki avashyakta hoti hai. Kewal notification retry mechanisms ke parikshan ke liye istemal karein.

## Database Migration Parikshan {#database-migration-testing}

Project mein purani versions se vartaman version tak database migrations ko test karne ke liye scripts shamil hain. Yah scripts sunishchit karti hain ki database migrations sahi dhang se kaam karein aur data integrity ko banaye rakhein.

### Migration Parikshan Data Generate Karein {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

Yah script application ke kai historical versions ke liye parikshan databases generate karta hai. Yah:

1. Kisi bhi vidyaman Docker container ko **band karta hai aur hata deta hai**
2. **Har version ke liye** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Vidyamn database files ko hata deta hai
   - Ek version tag file banata hai
   - Vishesh version ke saath ek Docker container shuru karta hai
   - Container ke taiyar hone ka intezar karta hai
   - `pnpm generate-test-data` ka upyog karke parikshan data generate karta hai
   - Parikshan data ke saath UI ka screenshot leta hai
   - Container ko band karta hai aur hata deta hai
   - WAL files ko flush karta hai aur database schema ko save karta hai
   - Database file ko `scripts/migration_test_data/` mein copy karta hai

**Avashyaktaayein:**
- Docker install aur configure hona chahiye
- Chromium (Playwright ke dwara) install hona chahiye
- Docker operations ke liye Root/sudo access
- Docker volume `duplistatus_data` vidyaman hona chahiye

**Output:**
- Database files: `scripts/migration_test_data/backups_<VERSION>.db`
- Schema files: `scripts/migration_test_data/backups_<VERSION>.schema`
- Screenshots: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuration:**
- Servers ki sankhya: `SERVERS` variable ke dwara set karein (default: 3)
- Data directory: `/var/lib/docker/volumes/duplistatus_data/_data`
- Port: 9666 (Docker container port)

>[!CAUTION]
> Yah script ko Docker ki avashyakta hai aur yah vidyaman containers ko band/hata dega. Iske liye Docker operations aur file system access ke liye sudo access ki bhi avashyakta hoti hai. Yadi aapne abhi tak Playwright Chromium browser install nahi kiya hai, to use install karne ke liye pehle `pnpm take-screenshots:install` run karein.

>[!IMPORTANT]
> Yah script kewal ek baar chalne ke liye tha, kyunki naye versions mein developer database file aur screenshots ko seedhe `scripts/migration_test_data/` directory mein copy kar sakta hai. Development ke dauran, migrations ko test karne ke liye bas `./scripts/test-migrations.sh` script run karein.

### Database Migrations Test Karein {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

Yah script purani versions se vartaman version (4.0) tak database migrations ko test karta hai. Yah:

1. **Har version ke liye** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Parikshan database ki ek temporary copy banata hai
   - `test-migration.ts` ka upyog karke migration process run karta hai
   - Migrated database structure ko validate karta hai
   - Avashyak tables aur columns ke liye check karta hai
   - Database version 4.0 hai verify karta hai
   - Temporary files ko clean up karta hai

**Aavashyaktaayein:**
- Test database `scripts/migration_test_data/` mein maujood honi chahiye
- Pahle `generate-migration-test-data.sh` chalakar banaya gaya ho

**Nishpadan:**
- Rang-coded parikshan parinaam (safalta ke liye hara, asaphalata ke liye laal)
- Safal aur asafal sanskaran ka saaransh
- Asafal migration ke liye vistrit truti sandesh
- Yadi sabhi parikshan safal hote hain to exit code 0, yadi koi bhi asafal hota hai to 1

**Kya jaanchta hai:**
- Migration ke baad database sanskaran 4.0 hai
- Sabhi aavashyak table maujood hain: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Pratyek table mein aavashyak column maujood hain
- Database sanrachana sahi hai

**Udaharan pradarshan:**

```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**Upyog:**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> Yah script antarik roop se TypeScript migration test script (`test-migration.ts`) ka upyog karti hai. Test script migration ke baad database sanrachana ko jaanchta hai aur data ki akhandata sunishchit karta hai.

## SMTP aur email (development) {#smtp-and-email-development}

**Sammaan → Email** ke tahat SMTP configure karein aur in-app email parikshan aur notification flows ka upyog karein. Pahle `pnpm set-smtp-test-config` aur `pnpm test-smtp-connections` sahayak scripts repository se hata di gayi hain.

## Test Docker Entrypoint Script {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

Yah script sthaniya vikas mein `docker-entrypoint.sh` ke liye ek test wrapper pradaan karti hai. Yah entrypoint logging functionality ka parikshan karne ke liye environment set karta hai aur sunishchit karta hai ki logs `data/logs/` mein likhe gaye hain taaki application unhein access kar sake.

**Yah kya karta hai:**

1. **Hamesha ek naya sanskaran banata hai**: Parikshan se pahle ek naya build banane ke liye svayanchalit roop se `pnpm build-local` chalata hai (pahle manchalit roop se build karne ki koi avashyakta nahin hai)
2. **Cron service banata hai**: Sunishchit karta hai ki cron service banayi gayi hai (`dist/cron-service.cjs`)
3. **Docker-jaisi sanrachana sthapit karta hai**: Docker environment ki nakal karne ke liye aavashyak symlinks aur directory sanrachana banata hai
4. **Entrypoint script chalata hai**: `docker-entrypoint.sh` ko uchit environment variables ke saath execute karta hai
5. **Safai karta hai**: Exit hone par svayanchalit roop se asthayi file hata deta hai

**Upyog:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Environment Variables:**
- `PORT=8666` - Next.js server ke liye Port (`start-local`) se mel khata hai)
- `start-local` - Cron service ke liye Port
- `CRON_PORT=8667` - Svayanchalit roop se `VERSION` format mein set kiya gaya

**Nishpadan:**
- Logs `data/logs/application.log` mein likhe jate hain (application dwara access kiya ja sakta hai)
- Console output entrypoint script execution dikhata hai
- Log flushing ka parikshan karne aur band karne ke liye Ctrl+C dabayein

**Aavashyaktaayein:**
- Script ko repository root directory se chalaya jana chahiye (pnpm ise svayanchalit roop se handle karta hai)
- Script sabhi purv-aavashyaktaon (build, cron service, aadi) ko svayanchalit roop se handle karta hai

**Upyog ke mamle:**
- Docker deployment se pahle sthaniya roop se entrypoint script badlavon ka parikshan karna
- Log rotation aur logging functionality ki pushti karna
- Graceful shutdown aur signal handling ka parikshan karna
- Apne local environment mein entrypoint script ke behavior ko debug karna
