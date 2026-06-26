# Podman Parikshan {#podman-testing}

Podman parikshan server par `scripts/podman_testing` par sthit scripts ko copy aur execute karein.

## Prarambhik Setup aur Prabandhan {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`: Podman mein Docker image ko sthaniya Docker daemon se copy karta hai (sthaniya parikshan ke liye).
2. `copy.docker.duplistatus.remote`: Podman mein doorasth vikas server se Docker image ko copy karta hai (SSH access ki avashyakta hai).
   - Vikas server par iska upyog karke image banayein: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Container ko rootless mode mein shuru karta hai.
4. `pod.testing`: Podman pod ke andar container ka parikshan karta hai (root visheshadhikaron ke saath).
5. `stop.duplistatus`: Pod ko rokta hai aur container ko hatata hai.
6. `clean.duplistatus`: Containers ko rokta hai, pods ko hatata hai, aur purani images ko saaf karta hai.

## DNS Configuration {#dns-configuration}

Scripts host pranali se DNS settings ko svatah pahchan aur configure karte hain:

- **Svachalit Pahchan**: DNS server aur search domains nikalne ke liye `resolvectl status` (systemd-resolved) ka upyog karta hai
- **Fallback Support**: Non-systemd pranaliyon par `/etc/resolv.conf` ko parse karne ke liye fallback karta hai
- **Smart Filtering**: localhost addresses aur IPv6 nameservers ko svatah filter karta hai
- **Ke saath kaam karta hai**:
  - Tailscale MagicDNS (100.100.100.100)
  - Corporate DNS server
  - Standard network configurations
  - Anukoolit DNS setups

Koi manual DNS configuration ki avashyakta nahin hai - scripts ise svatah handle karte hain!

## Monitoring aur Swasthya Jaanch {#monitoring-and-health-checks}

- `check.duplistatus`: Logs, connectivity, aur application health ki jaanch karta hai.

## Debugging Commands {#debugging-commands}

- `logs.duplistatus`: Pod ke logs dikhata hai.
- `exec.shell.duplistatus`: Container mein ek shell kholta hai.
- `restart.duplistatus`: Pod ko rokta hai, container ko hatata hai, image ko copy karta hai, container banata hai, aur pod shuru karta hai.

## Upyog Workflow {#usage-workflow}

### Vikas Server {#development-server}

Vikas server par Docker image banayein:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman Server {#podman-server}

1. Docker image ko transfer karen:
   - `./copy.docker.duplistatus.local` ka upyog karen yadi Docker aur Podman ek hi machine par hain
   - `./copy.docker.duplistatus.remote` ka upyog karen yadi remote development server se copy kar rahe hain (jiske liye `.env` file mein `REMOTE_USER` aur `REMOTE_HOST` ki avashyakta hoti hai)
2. `./start.duplistatus` ke sath container shuru karen (standalone, rootless)
   - Ya pod mode mein parikshan ke liye `./pod.testing` ka upyog karein (root ke saath)
3. `./check.duplistatus` aur `./logs.duplistatus` ke saath monitor karein
4. Ho jaane par `./stop.duplistatus` ke saath rokein
5. Pura restart cycle (stop, copy image, start) ke liye `./restart.duplistatus` ka upyog karein
   - **Note**: Yah script abhi `copy.docker.duplistatus` ka sandarbh deta hai jise `.local` ya `.remote` variant se badla jana chahiye
6. Container, pod, aur purani images ko hatane ke liye `./clean.duplistatus` ka upyog karen

# Application ka parikshan {#testing-the-application}

Yadi aap Podman server ko usi machine par chala rahe hain, to `http://localhost:9666` ka upyog karen.

Yadi aap kisi anya server par hain, to URL is prakar prapt karen:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Mahatvapurna Suchnaen {#important-notes}

### Podman Pod Networking {#podman-pod-networking}

Podman pods mein chalate samay, application ko avashyakta hoti hai:
- Spasht DNS configuration (jise `pod.testing` script dwara svatah sanbalit kiya jata hai)
- Sabhi interfaces par Port binding (`0.0.0.0:9666`)

Scripts in avashyaktaon ko svatah sanbalit karte hain - kisi manual configuration ki avashyakta nahin hai.

### Rootless vs Root Mode {#rootless-vs-root-mode}

- **Standalone mode** (`start.duplistatus`): `--userns=keep-id` ke saath rootless chalta hai
- **Pod mode** (`pod.testing`): Parikshan ke uddeshyon ke liye pod ke andar root ke roop mein chalta hai

Donon modes svatah DNS detection ke saath sahi dhang se kaam karte hain.

## Environment Configuration {#environment-configuration}

`copy.docker.duplistatus.local` aur `copy.docker.duplistatus.remote` donon ko `scripts/podman_testing` directory mein `.env` file ki avashyakta hoti hai:

**Local copying ke liye** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**Remote copying ke liye** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

`start.duplistatus` script ko `.env` file ki avashyakta hoti hai jisme kam se kam `IMAGE` variable ho:

```
IMAGE=wsj-br/duplistatus:devel
```

**Note**: Script ka truti sandesh `REMOTE_USER` aur `REMOTE_HOST` ka ullekh karta hai, lekin `start.duplistatus` dwara vastav mein inka upyog nahin kiya jata hai - keval `IMAGE` ki avashyakta hoti hai.
