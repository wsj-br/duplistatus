# इंस्टॉलेशन गाइड {/* #installation-guide */}

एप्लिकेशन को Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), या Podman का उपयोग करके डिप्लॉय किया जा सकता है। इंस्टॉलेशन के बाद, आप [टाइमज़ोन कॉन्फ़िगर करें](./configure-tz.md) में बताए अनुसार TIMEZONE को कॉन्फ़िगर करना चाह सकते हैं और Duplicati सर्वर को **duplistatus** पर बैकअप लॉग भेजने के लिए कॉन्फ़िगर करने की आवश्यकता होगी, जैसा कि [Duplicati कॉन्फ़िगरेशन](./duplicati-server-configuration.md) अनुभाग में बताया गया है।

## पूर्वापेक्षाएँ {/* #prerequisites */}

सुनिश्चित करें कि आपके पास निम्नलिखित इंस्टॉल हैं:

- Docker Engine - [Debian इंस्टॉलेशन गाइड](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux इंस्टॉलेशन गाइड](https://docs.docker.com/compose/install/linux/)
- Portainer (वैकल्पिक) - [Docker इंस्टॉलेशन गाइड](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (वैकल्पिक) - [इंस्टॉलेशन गाइड](http://podman.io/docs/installation#debian)

## प्रमाणीकरण {/* #authentication */}

संस्करण 0.9.x के बाद से **duplistatus** को उपयोगकर्ता प्रमाणीकरण की आवश्यकता होती है। पहली बार एप्लिकेशन इंस्टॉल करते समय या किसी पुराने संस्करण से अपग्रेड करते समय एक डिफ़ॉल्ट `admin` खाता स्वचालित रूप से बन जाता है: 
    - उपयोगकर्ता नाम: `admin`
    - पासवर्ड: `Duplistatus09`

आप पहले लॉगिन के बाद [सेटिंग्स > उपयोगकर्ता](../user-guide/settings/user-management-settings.md) में अतिरिक्त उपयोगकर्ता खाते बना सकते हैं।

व्यवस्थापक वैकल्पिक रूप से Duplicati और Homepage के लिए [API कुंजियाँ](../user-guide/settings/api-keys-settings.md) भी अनिवार्य कर सकते हैं, और [IP अनुमत सूचियों](../user-guide/settings/ip-allowlist-settings.md) के साथ एक्सेस को प्रतिबंधित कर सकते हैं। दोनों डिफ़ॉल्ट रूप से बंद हैं।

::::info[महत्वपूर्ण]
सिस्टम पासवर्ड की न्यूनतम लंबाई और जटिलता लागू करता है। इन आवश्यकताओं को `PWD_ENFORCE` और `PWD_MIN_LEN` [एनवायरनमेंट वैरिएबल्स](environment-variables.md) का उपयोग करके समायोजित किया जा सकता है। पर्याप्त जटिलता के बिना या कम लंबाई वाले पासवर्ड का उपयोग करने से सुरक्षा से समझौता हो सकता है। कृपया इन सेटिंग्स का सावधानीपूर्वक उपयोग करें।
::::

### कंटेनर इमेज {/* #container-images */}

आप निम्न में से इमेज का उपयोग कर सकते हैं:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### विकल्प 1: Docker Compose का उपयोग करना {/* #option-1-using-docker-compose */}

यह स्थानीय डिप्लॉयमेंट के लिए या जब आप कॉन्फ़िगरेशन को कस्टमाइज़ करना चाहते हैं, तो अनुशंसित तरीका है। यह कंटेनर को उसकी सभी सेटिंग्स के साथ परिभाषित करने और चलाने के लिए `docker compose` फ़ाइल का उपयोग करता है।

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

टाइमज़ोन और संख्या/तिथि/समय प्रारूप को समायोजित करने के तरीके के बारे में अधिक विवरण के लिए [टाइमज़ोन](./configure-tz.md) अनुभाग जांचें।

### विकल्प 2: Portainer Stacks (Docker Compose) का उपयोग करना {/* #option-2-using-portainer-stacks-docker-compose */}

1. अपने [Portainer](https://docs.portainer.io/user/docker/stacks) सर्वर में "Stacks" पर जाएँ और "स्टैक जोड़ें" पर क्लिक करें।
2. अपने स्टैक को नाम दें (उदा., "duplistatus")।
3. "Build method" के रूप में "Web editor" चुनें।
4. इसे वेब एडिटर में कॉपी करें और पेस्ट करें:

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

5. टाइमज़ोन और संख्या/तिथि/समय प्रारूप को समायोजित करने के तरीके के बारे में अधिक विवरण के लिए [टाइमज़ोन](./configure-tz.md) अनुभाग जांचें।
6. "Deploy the stack" पर क्लिक करें।

### विकल्प 3: Portainer Stacks (GitHub रिपॉजिटरी) का उपयोग करना {/* #option-3-using-portainer-stacks-github-repository */}

1. [Portainer](https://docs.portainer.io/user/docker/stacks) में, "Stacks" पर जाएं और "Add stack" पर क्लिक करें।
2. अपने स्टैक को नाम दें (उदा., "duplistatus")।
3. "Build method" के रूप में "Repository" चुनें।
4. रिपॉजिटरी URL दर्ज करें: `https://github.com/wsj-br/duplistatus.git`
5. "Compose path" फ़ील्ड में, दर्ज करें: `production.yml`
6. (वैकल्पिक) "Environment variables" अनुभाग में `TZ`, `LANG`, `PWD_ENFORCE` और `PWD_MIN_LEN` एनवायरनमेंट वैरिएबल सेट करें। टाइमज़ोन और संख्या/तिथि/समय फ़ॉर्मेट को कैसे समायोजित करें, इस पर अधिक विवरण के लिए [Timezone](./configure-tz.md) अनुभाग जांचें। 
6. "Deploy the stack" पर क्लिक करें।

### विकल्प 4: Docker CLI का उपयोग करना {/* #option-4-using-docker-cli */}

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

- `duplistatus_data` वॉल्यूम का उपयोग परसिस्टेंट संग्रहण के लिए किया जाता है। कंटेनर इमेज डिफ़ॉल्ट टाइमज़ोन के रूप में `Europe/London` और डिफ़ॉल्ट लोकेल (भाषा) के रूप में `en_GB` का उपयोग करती है।

### विकल्प 5: Podman (CLI) का उपयोग करना `rootless` {/* #option-5-using-podman-cli-rootless */}

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

#### Podman कंटेनरों के लिए DNS कॉन्फ़िगर करना {/* #configuring-dns-for-podman-containers */}

यदि आपको कस्टम DNS कॉन्फ़िगरेशन की आवश्यकता है (उदा., Tailscale MagicDNS, कॉर्पोरेट नेटवर्क, या कस्टम DNS सेटअप के लिए), तो आप मैन्युअल रूप से DNS सर्वर और खोज डोमेन कॉन्फ़िगर कर सकते हैं।

**अपना DNS कॉन्फ़िगरेशन ढूंढना:**

1. **systemd-resolved सिस्टम के लिए** (अधिकांश आधुनिक Linux वितरण):

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **गैर-systemd सिस्टम के लिए** या फ़ॉलबैक के रूप में:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

`nameserver` (DNS सर्वर के लिए) और `search` (खोज डोमेन के लिए) से शुरू होने वाली पंक्तियों को देखें। यदि आप अपनी DNS सेटिंग्स या नेटवर्क खोज डोमेन के बारे में अनिश्चित हैं, तो इस जानकारी के लिए अपने नेटवर्क व्यवस्थापक से परामर्श लें।

**DNS कॉन्फ़िगरेशन के साथ उदाहरण:**

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

आप कई `--dns` फ़्लैग जोड़कर कई DNS सर्वर निर्दिष्ट कर सकते हैं:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

आप कई `--dns-search` फ़्लैग जोड़कर कई खोज डोमेन निर्दिष्ट कर सकते हैं:

```bash
--dns-search example.com --dns-search internal.local
```

**ध्यान दें**: DNS सर्वर कॉन्फ़िगर करते समय IPv6 पतों (जिनमें `:` शामिल है) और लोकलहोस्ट पतों (जैसे `127.0.0.53`) को छोड़ दें।

टाइमज़ोन और संख्या/तिथि/समय फ़ॉर्मेट को कैसे समायोजित करें, इस पर अधिक विवरण के लिए [Timezone](./configure-tz.md) अनुभाग जांचें।

### विकल्प 6: Podman पॉड्स का उपयोग करना {/* #option-6-using-podman-pods */}

Podman पॉड्स आपको एक साझा नेटवर्क नेमस्पेस में कई कंटेनर चलाने की अनुमति देते हैं। यह परीक्षण के लिए या तब उपयोगी होता है जब आपको अन्य कंटेनरों के साथ duplistatus चलाने की आवश्यकता होती है।

**बेसिक पॉड सेटअप:**

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

#### Podman पॉड्स के लिए DNS कॉन्फ़िगर करना {/* #configuring-dns-for-podman-pods */}

पॉड्स का उपयोग करते समय, DNS कॉन्फ़िगरेशन को पॉड स्तर पर सेट किया जाना चाहिए, कंटेनर स्तर पर नहीं।
अपने DNS सर्वर और खोज डोमेन खोजने के लिए विकल्प 5 में वर्णित समान विधियों का उपयोग करें।

**DNS कॉन्फ़िगरेशन के साथ उदाहरण:**

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

**पॉड का प्रबंधन करना:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## आवश्यक कॉन्फ़िगरेशन {/* #essential-configuration */}

1. अपने [Duplicati सर्वर](duplicati-server-configuration.md) को duplistatus पर बैकअप लॉग संदेश भेजने के लिए कॉन्फ़िगर करें (आवश्यक)। Duplicati 2.0.9.106 और बाद के संस्करणों पर, उस गाइड में वर्णित अनुसार `--send-http-json-urls` का उपयोग करें।
2. duplistatus में लॉग इन करें – [उपयोगकर्ता गाइड](../user-guide/overview.md#accessing-the-dashboard) में दिए गए निर्देश देखें।
3. प्रारंभिक बैकअप लॉग एकत्र करें – अपने सभी Duplicati सर्वर से ऐतिहासिक बैकअप डेटा के साथ डेटाबेस को पॉप्युलेट करने के लिए [बैकअप लॉग एकत्र करें](../user-guide/collect-backup-logs.md) सुविधा का उपयोग करें। यह प्रत्येक सर्वर के कॉन्फ़िगरेशन के आधार पर बैकअप निगरानी अंतरालों को स्वचालित रूप से भी अपडेट करता है।
4. सर्वर सेटिंग्स कॉन्फ़िगर करें – अपने डैशबोर्ड को अधिक जानकारीपूर्ण बनाने के लिए [सेटिंग्स → सर्वर](../user-guide/settings/server-settings.md) में सर्वर उपनाम और नोट्स सेट करें।
5. NTFY सेटिंग्स कॉन्फ़िगर करें – [सेटिंग्स → NTFY](../user-guide/settings/ntfy-settings.md) में NTFY के माध्यम से सूचनाएं सेट करें।
6. ईमेल सेटिंग्स कॉन्फ़िगर करें – [सेटिंग्स → Email](../user-guide/settings/email-settings.md) में ईमेल सूचनाएं सेट करें।
7. बैकअप सूचनाएं कॉन्फ़िगर करें – [सेटिंग्स → बैकअप सूचनाएं](../user-guide/settings/backup-notifications-settings.md) में प्रति-बैकअप या प्रति-सर्वर सूचनाएं सेट करें।

टाइमज़ोन, संख्या प्रारूप, और [सुरक्षा सुदृढ़ीकरण](security-hardening.md) जैसी वैकल्पिक सेटिंग्स कॉन्फ़िगर करने के लिए निम्नलिखित अनुभाग देखें।
