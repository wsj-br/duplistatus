# Installation Guide {#installation-guide}

The application can be deployed using Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), or Podman. After the installation, you may want to configure the TIMEZONE, as described in the [Configure Timezone](./configure-tz.md) and need to configure the Duplicati servers to send backup logs to **duplistatus**, as outlined in the [Duplicati Configuration](./duplicati-server-configuration.md) section.

## पूर्वापेक्षाएँ {#prerequisites}

Ensure you have the following installed:

- Docker Engine - [Debian installation guide](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux installation guide](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installation guide](http://podman.io/docs/installation#debian)

## Authentication {#authentication}

**duplistatus** since version 0.9.x requires user authentication. A default `admin` account is created automatically when installing the application for the first time or upgrading from an earlier version: 
    - username: `admin`
    - password: `Duplistatus09`

You can create additional users accounts in [Settings > Users](../user-guide/settings/user-management-settings.md) after the first login.

::::info[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please use these settings carefully.
::::

### Container Images {#container-images}

You can use the images from:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Using Docker Compose {#option-1-using-docker-compose}

This is the recommended method for local deployments or when you want to customise the configuration. It uses a `docker compose` file to define and run the container with all its settings.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Check [Timezone](./configure-tz.md) section to more details on how to adjust timezone and number/date/time format.

### Option 2: Using Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Go to "Stacks" in your [Portainer](https://docs.portainer.io/user/docker/stacks) server and click "Add stack".
2. Name your stack (e.g., "duplistatus").
3. Choose "Build method" as "Web editor".
4. Copy and paste this in the web editor:

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

5. Check the [Timezone](./configure-tz.md) section to more details on how to adjust the timezone and number/date/time format.
6. Click "Deploy the stack".

### Option 3: Using Portainer Stacks (GitHub Repository) {#option-3-using-portainer-stacks-github-repository}

1. In [Portainer](https://docs.portainer.io/user/docker/stacks), go to "Stacks" and click "Add stack".
2. Name your stack (e.g., "duplistatus").
3. Choose "Build method" as "Repository".
4. Enter the repository URL: `https://github.com/wsj-br/duplistatus.git`
5. In the "Compose path" field, enter: `production.yml`
6. (optional) Set the `TZ`, `LANG`, `PWD_ENFORCE` and `PWD_MIN_LEN` environment variables in the "Environment variables" section. Check the [Timezone](./configure-tz.md) section to more details on how to adjust the timezone and number/date/time format. 
6. Click "Deploy the stack".

### विकल्प 4: Docker CLI का उपयोग करके {#option-4-using-docker-cli}

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

- `duplistatus_data` वॉल्यूम स्थायी संचयन के लिए उपयोग की जाती है। कंटेनर छवि डिफ़ॉल्ट के रूप में `Europe/London` का उपयोग करती है समय क्षेत्र और `en_GB` का उपयोग करती है डिफ़ॉल्ट लोकल (भाषा) के रूप में।

### विकल्प 5: Podman (CLI) का उपयोग करके `rootless` {#option-5-using-podman-cli-rootless}

बुनियादी सेटअप के लिए, आप DNS कॉन्फ़िगरेशन के बिना कंटेनर शुरू कर सकते हैं:

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

#### Podman कंटेनर के लिए DNS कॉन्फ़िगरेशन {#configuring-dns-for-podman-containers}

यदि आपको कस्टम DNS कॉन्फ़िगरेशन की आवश्यकता है (जैसे Tailscale MagicDNS, कॉर्पोरेट नेटवर्क, या कस्टम DNS सेटअप के लिए), तो आप DNS सर्वर और खोज डोमेन को मैन्युअल रूप से कॉन्फ़िगर कर सकते हैं।

**अपनी DNS कॉन्फ़िगरेशन खोजना:**

1. **systemd-resolved सिस्टम के लिए** (बहुत से आधुनिक Linux वितरण):

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **non-systemd सिस्टम** या एक फॉलबैक के रूप में:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

लाइनों को खोजें जो `nameserver` के साथ शुरू होते हैं (DNS सर्वर के लिए) और `search` के साथ (खोज डोमेन के लिए)। यदि आप अपने DNS सेटिंग्स या नेटवर्क खोज डोमेन के बारे में असमझ हैं, तो इस जानकारी के लिए अपने नेटवर्क व्यवस्थापक से परामर्श करें।

**DNS configuration ke saath example:**

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

आप कई DNS सर्वर निर्दिष्ट कर सकते हैं कई `--dns` फ़्लैग जोड़कर:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

आप कई खोज डोमेन निर्दिष्ट कर सकते हैं कई `--dns-search` फ़्लैग जोड़कर:

```bash
--dns-search example.com --dns-search internal.local
```

**नोट**: DNS सर्वर कॉन्फ़िगर करते समय IPv6 एड्रेस (जो `:` शामिल करते हैं) और लोकलहोस्ट एड्रेस (जैसे `127.0.0.53`) को छोड़ दें।

[समय क्षेत्र](./configure-tz.md) अनुभाग में अधिक विवरण के लिए देखें कि कैसे समय क्षेत्र और संख्या/तारीख/समय प्रारूप को समायोजित किया जाए।

### विकल्प 6: Podman पॉड का उपयोग करके {#option-6-using-podman-pods}

Podman पॉड आपको एक साझा नेटवर्क नेमस्पेस में कई कंटेनर चलाने की अनुमति देते हैं। यह परीक्षण के लिए उपयोगी है या जब आपको duplistatus के साथ अन्य कंटेनर चलाने की आवश्यकता होती है।

**बुनियादी पॉड सेटअप:**

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

#### Podman पॉड के लिए DNS कॉन्फ़िगरेशन {#configuring-dns-for-podman-pods}

जब पॉड का उपयोग करते हैं, तो DNS कॉन्फ़िगरेशन को पॉड स्तर पर सेट किया जाना चाहिए, न कि कंटेनर स्तर पर।
विकल्प 5 में वर्णित समान तरीकों का उपयोग करें अपने DNS सर्वर और खोज डोमेन खोजने के लिए।

**DNS configuration ke saath example:**

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

**Pod ka pravaasan:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## Anivarya Sammaan {#essential-configuration}

1. Apne [Duplicati servers](duplicati-server-configuration.md) ko configure karein taaki vo backup log messages ko duplistatus par bhejen (anivarya).
2. duplistatus mein pravesh karein – [User Guide](../user-guide/overview.md#accessing-the-dashboard) mein anusaran karein.
3. Shuruwat ke backup logs ko sankalan karein – [Collect Backup Logs](../user-guide/collect-backup-logs.md) feature ka upyog karein taaki database mein apne sabhi Duplicati servers se historical backup data se bhara jaaye. Yeh automatically har server ke configuration ke anusar backup monitoring intervals ko bhi update karta hai.
4. Server settings ko configure karein – [Settings → Server](../user-guide/settings/server-settings.md) mein server aliases aur notes set up karein taaki apka dashboard zyada informative ho.
5. NTFY settings ko configure karein – [Settings → NTFY](../user-guide/settings/ntfy-settings.md) mein NTFY ke through notifications set up karein.
6. Email settings ko configure karein – [Settings → Email](../user-guide/settings/email-settings.md) mein email notifications set up karein.
7. Backup notifications ko configure karein – [Settings → Backup Notifications](../user-guide/settings/backup-notifications-settings.md) mein per-backup ya per-server notifications set up karein.

Vikalpik settings jaise ki timezone, sankhya format, aur HTTPS ke liye, neeche diye gaye sections dekhien.
