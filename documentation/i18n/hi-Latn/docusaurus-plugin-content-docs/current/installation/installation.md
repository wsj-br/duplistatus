# Installation Guide {#installation-guide}

Application ko Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), ya Podman ka upyog karke deploy kiya ja sakta hai. Installation ke baad, aap TIMEZONE ko configure karna chah sakte hain, jaisa ki [Configure Timezone](./configure-tz.md) mein bataya gaya hai aur backup logs ko **duplistatus** mein bhejane ke liye Duplicati servers ko configure karne ki zaroorat hogi, jaisa ki [Duplicati Configuration](./duplicati-server-configuration.md) section mein bataya gaya hai.

## Prerequisites {#prerequisites}

Sunishchit karein ki aapne nimnalikhit install kar liya hai:

- Docker Engine - [Debian installation guide](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux installation guide](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installation guide](http://podman.io/docs/installation#debian)

## Authentication {#authentication}

**duplistatus** version 0.9.x se user authentication ki zaroorat hoti hai. Ek default `admin` account application ko pehli baar install karne ya pehle ke version se upgrade karne par automatically banaya jaata hai: 
    - username: `admin`
    - password: `Duplistatus09`

Pehla login karne ke baad aap [Settings > Users](../user-guide/settings/user-management-settings.md) mein additional user accounts bana sakte hain.

::::info[IMPORTANT]
Pranali ek minimum password length aur complexity ko enforce karti hai. In requirements ko `PWD_ENFORCE` aur `PWD_MIN_LEN` [environment variables](environment-variables.md) ka upyog karke adjust kiya ja sakta hai. Paryapt complexity ya kam length wale password ka upyog karne se suraksha compromised ho sakti hai. Kripya in settings ka upyog savdhani se karein.
::::

### Container Images {#container-images}

Aap yahan se images ka upyog kar sakte hain:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Using Docker Compose {#option-1-using-docker-compose}

Local deployments ke liye ya jab aap configuration ko customize karna chahte hain, yeh recommended method hai. Yeh sabhi settings ke saath container ko define aur run karne ke liye ek `docker compose` file ka upyog karta hai.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Timezone aur number/date/time format ko kaise adjust karna hai, iske baare mein adhik vivaran ke liye [Timezone](./configure-tz.md) section check karein.

### Option 2: Using Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Apne [Portainer](https://docs.portainer.io/user/docker/stacks) server mein "Stacks" par jaayen aur "Add stack" par click karein.
2. Apne stack ko naam dein (jaise, "duplistatus").
3. "Build method" ke roop mein "Web editor" chunein.
4. Isse web editor mein copy aur paste karein:

```yaml
# duplistatus production compose.yml
services:
  duplistatus:
    image: ghcr.io/wsj-br/duplistatus:latest
    container_name: duplistatus
    restart: unless-stopped
    environment:
      - TZ=Europe/London
      - PWD_ENFORCE=true
      - PWD_MIN_LEN=8
    ports:
      - "9666:9666"
    volumes:
      - duplistatus_data:/app/data
    networks:
      - duplistatus_network

networks:
  duplistatus_network:
    driver: bridge

volumes:
  duplistatus_data:
    name: duplistatus_data
``` 

5. Timezone aur number/date/time format ko kaise adjust karna hai, iske baare mein adhik vivaran ke liye [Timezone](./configure-tz.md) section check karein.
6. "Deploy the stack" par click karein.

### Option 3: Using Portainer Stacks (GitHub Repository) {#option-3-using-portainer-stacks-github-repository}

1. [Portainer](https://docs.portainer.io/user/docker/stacks) mein, "Stacks" par jaayen aur "Add stack" par click karein.
2. Apne stack ko naam dein (jaise, "duplistatus").
3. "Build method" ke roop mein "Repository" chunein.
4. Repository URL enter karein: `https://github.com/wsj-br/duplistatus.git`
5. "Compose path" field mein, enter karein: `production.yml`
6. (optional) "Environment variables" section mein `TZ`, `LANG`, `PWD_ENFORCE` aur `PWD_MIN_LEN` environment variables set karein. Timezone aur number/date/time format ko kaise adjust karna hai, iske baare mein adhik vivaran ke liye [Timezone](./configure-tz.md) section check karein. 
6. "Deploy the stack" par click karein.

### Vikalp 4: Docker CLI ka upyog {#option-4-using-docker-cli}

```bash
# Create the volume
docker volume create duplistatus_data

# Start the container
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- `duplistatus_data` volume ka upyog sthaayi sanchayan ke liye kiya jaata hai. Container image `Europe/London` ko default timezone aur `en_GB` ko default locale (bhaasha) ke roop mein istemaal karta hai.

### Vikalp 5: Podman (CLI) ka upyog `rootless` {#option-5-using-podman-cli-rootless}

Saadhaaran setup ke liye, aap bina DNS configuration ke container shuru kar sakte hain:

```bash
mkdir -p ~/duplistatus_data
# Start the container (standalone)
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Podman Containers ke liye DNS configure karna {#configuring-dns-for-podman-containers}

Yadi aapko anukoolit DNS configuration (udaaharan ke liye, Tailscale MagicDNS, corporate network, ya anukoolit DNS setup) ki zaroorat hai, to aap DNS server aur search domain ko manually configure kar sakte hain.

**Apna DNS configuration dhundhna:**

1. **systemd-resolved systems ke liye** (adhikaansh aadhunik Linux distributions):

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **non-systemd systems ke liye** ya fallback ke roop mein:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

`nameserver` (DNS server ke liye) aur `search` (search domain ke liye) se shuru hone wali lines dekhein. Yadi aap apne DNS settings ya network search domain ke baare mein anishchit hain, to is jaankari ke liye apne network administrator se sampark karein.

**DNS configuration ka udaharan:**

```bash
mkdir -p ~/duplistatus_data
# Start the container with DNS configuration
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  --dns 100.100.100.100 \
  --dns-search example.com \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

Aap multiple `--dns` flags jodkar multiple DNS server specify kar sakte hain:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Aap multiple `--dns-search` flags jodkar multiple search domain specify kar sakte hain:

```bash
--dns-search example.com --dns-search internal.local
```

**Note**: DNS server configure karte samay IPv6 addresses (jinmein `:` ho) aur localhost addresses (jaise `127.0.0.53`) ko chhod dein.

Timezone aur number/date/time format ko adjust karne ke baare mein adhik vivaran ke liye [Timezone](./configure-tz.md) section dekhein.

### Vikalp 6: Podman Pods ka upyog {#option-6-using-podman-pods}

Podman pods aapko ek saajha network namespace mein multiple containers chalane ki anumati dete hain. Yah testing ke liye ya jab aapko duplistatus ko anya containers ke saath chalane ki zaroorat ho to upyogi hai.

**Saadhaaran pod setup:**

```bash
mkdir -p ~/duplistatus_data

# Create the pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

#### Podman Pods ke liye DNS configure karna {#configuring-dns-for-podman-pods}

Pods ka upyog karte samay, DNS configuration pod level par set kiya jaana chahiye, container level par nahi.
Apne DNS server aur search domain dhundhne ke liye Option 5 mein bataaye gaye tareeke istemaal karein.

**DNS configuration ka udaharan:**

```bash
mkdir -p ~/duplistatus_data

# Create the pod with DNS configuration
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

**Pod ka prabandhan:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## Aavashyak Configuration {#essential-configuration}

1. Apne [Duplicati server](duplicati-server-configuration.md) ko backup log sandesh duplistatus ko bhejne ke liye configure karein (anivarya).
2. Duplistatus mein pravesh karein – [Upyogkarta Margdarshika](../user-guide/overview.md#accessing-the-dashboard) mein nirdeshon ka paalan karein.
3. Prarambhik backup logs sankalan karein – [Backup Logs Ikattha Karein](../user-guide/collect-backup-logs.md) visheshata ka upyog karke aapke sabhi Duplicati server se aitihaasik backup data se database ko aabadi den. Isse pratyek server ki sammaan ke aadhar par backup monitoring antaral bhi swatah hi update ho jaate hain.
4. Server settings configure karein – [Sammaan → Server](../user-guide/settings/server-settings.md) mein server upnaamon aur notes set up karein taaki aapka dashboard adhik soochak ban sake.
5. NTFY settings configure karein – [Sammaan → NTFY](../user-guide/settings/ntfy-settings.md) mein NTFY ke madhyam se suchnaayein sthapit karein.
6. Email settings configure karein – [Sammaan → Email](../user-guide/settings/email-settings.md) mein email suchnaayein sthapit karein.
7. Backup suchnaayein configure karein – [Sammaan → Backup Suchnaayein](../user-guide/settings/backup-notifications-settings.md) mein prati-backup ya prati-server suchnaayein sthapit karein.

Samay kshetra, sankhya format, aur HTTPS jaise aavashyak settings configure karne ke liye nimnalikhit sections dekhein.
