# Sabhi prayukt commands {#most-used-commands}

## Dev mode mein run karein {#run-in-dev-mode}

```bash
pnpm dev
```

- **JSON File Storage**: Sabhi prapt backup data ko `data` directory mein JSON file ke roop mein store kiya jata hai. Ye file unke prapt hone ke samay chinh ke naam se rakhi jati hain, format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC samay) mein. Ye suvidha kewal development mode mein sakriya hoti hai aur Duplicati se prapt raw data ko sanrakshit karke debugging mein madad karti hai.

- **Verbose Logging**: Development mode mein chalne par application database operations aur API requests ke bare mein adhik vistarit jankari log karta hai.

- **Sanskaran Update**: Development server shuru karne se pehle swayam sanskaran ki jankari update karta hai, jisse application mein latest sanskaran dikhaya ja sake.

- **Backup Delete karna**: Server detail page par, backups table mein ek delete button dikhta hai jo aapko vyaktigat backups ko delete karne ki anumati deta hai. Ye suvidha khas taur par overdue backups functionality ka parikshan aur debugging karne ke liye upyogi hai.

## Production server start karein (development environment mein) {#start-the-production-server-in-development-environment}

Pehle, local production ke liye application build karein:

```bash
pnpm build-local
```

Phir production server start karein:

```bash
pnpm start-local
```

## Docker stack start karein (Docker Compose) {#start-a-docker-stack-docker-compose}

```bash
pnpm docker:up
```

Ya manually:

```bash
docker compose up --build -d
```

## Docker stack stop karein (Docker Compose) {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker:down
```

Ya manually:

```bash
docker compose down
```

## Docker environment clean karein {#clean-docker-environment}

```bash
pnpm docker:clean
```

Ya manually:

```bash
./scripts/clean-docker.sh
```

Ye script ek sampurn Docker cleanup karti hai, jo iske liye upyogi hai:
- Disk space khali karna
- Purane/anupyogi Docker artefacts hatana
- Development ya testing sessions ke baad clean karna
- Ek saaf Docker environment maintain karna

## Development image banayein (locally ya Podman ke saath test karne ke liye) {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
