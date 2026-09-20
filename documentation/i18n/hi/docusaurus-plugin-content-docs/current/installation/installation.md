# स्थापना मार्गदर्शिका {/* #installation-guide */}

Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), या Podman का उपयोग करके एप्लिकेशन को डिप्लॉय किया जा सकता है। स्थापना के बाद, आप [Configure Timezone](./configure-tz.md) में वर्णित के अनुसार TIMEZONE कॉन्फ़िगर करना चाह सकते हैं और [Duplicati Configuration](./duplicati-server-configuration.md) अनुभाग में रूपरेखित के अनुसार **duplistatus** को बैकअप लॉग भेजने के लिए Duplicati सर्वर को कॉन्फ़िगर करना होगा।

## पूर्वापेक्षाएँ {/* #prerequisites */}

सुनिश्चित करें कि आपके पास निम्नलिखित स्थापित है:

- Docker Engine - [Debian installation guide](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux installation guide](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installation guide](http://podman.io/docs/installation#debian)

## प्रमाणीकरण {/* #authentication */}

**duplistatus** संस्करण 0.9.x से उपयोगकर्ता प्रमाणीकरण की आवश्यकता है। एक डिफ़ॉल्ट `admin` खाता स्वचालित रूप से बनाया जाता है जब एप्लिकेशन को पहली बार स्थापित किया जाता है या पिछले संस्करण से अपग्रेड किया जाता है: 
    - उपयोगकर्ता नाम: `admin`
    - पासवर्ड: `Duplistatus09`

आप पहले लॉगिन के बाद [Settings > Users](../user-guide/settings/user-management-settings.md) में अतिरिक्त उपयोगकर्ता खाते बना सकते हैं।

व्यवस्थापक वैकल्पिक रूप से Duplicati और Homepage के लिए [API keys](../user-guide/settings/api-keys-settings.md) की आवश्यकता भी रख सकते हैं, और [IP allowlists](../user-guide/settings/ip-allowlist-settings.md) के साथ पहुंच को प्रतिबंधित कर सकते हैं। दोनों डिफ़ॉल्ट रूप से बंद हैं।

::::info[महत्वपूर्ण]
सिस्टम न्यूनतम पासवर्ड लंबाई और जटिलता को लागू करता है। इन आवश्यकताओं को `PWD_ENFORCE` और `PWD_MIN_LEN` [environment variables](environment-variables.md) का उपयोग करके समायोजित किया जा सकता है। पर्याप्त जटिलता के बिना या छोटी लंबाई के साथ पासवर्ड का उपयोग करना सुरक्षा को खतरे में डाल सकता है। कृपया इन सेटिंग्स का सावधानी से उपयोग करें।
::::

### कंटेनर छवियाँ {/* #container-images */}

आप इनसे छवियों का उपयोग कर सकते हैं:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### विकल्प 1: Docker Compose का उपयोग करना {/* #option-1-using-docker-compose */}

यह स्थानीय डिप्लॉयमेंट के लिए या जब आप कॉन्फ़िगरेशन को अनुकूलित करना चाहते हैं तो यह अनुशंसित विधि है। यह सभी सेटिंग्स के साथ कंटेनर को परिभाषित करने और चलाने के लिए एक `docker compose` फ़ाइल का उपयोग करता है।

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

समय क्षेत्र और संख्या/तिथि/समय प्रारूप को समायोजित करने के बारे में अधिक विवरण के लिए [Timezone](./configure-tz.md) अनुभाग देखें।

### विकल्प 2: Portainer Stacks (Docker Compose) का उपयोग करना {/* #option-2-using-portainer-stacks-docker-compose */}

1. अपने [Portainer](https://docs.portainer.io/user/docker/stacks) सर्वर में "Stacks" पर जाएं और "Add stack" पर क्लिक करें।
2. अपने स्टैक का नाम दें (उदाहरण के लिए, "duplistatus")।
3. "Build method" को "Web editor" के रूप में चुनें।
4. वेब संपादक में इसे कॉपी और पेस्ट करें:

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

5. समय क्षेत्र और संख्या/तिथि/समय प्रारूप को समायोजित करने के बारे में अधिक विवरण के लिए [Timezone](./configure-tz.md) अनुभाग देखें।
6. "Deploy the stack" पर क्लिक करें।

### विकल्प 3: Portainer Stacks (GitHub Repository) का उपयोग करना {/* #option-3-using-portainer-stacks-github-repository */}

1. [Portainer](https://docs.portainer.io/user/docker/stacks) में, "Stacks" पर जाएं और "Add stack" पर क्लिक करें।
2. अपने स्टैक का नाम दें (उदाहरण के लिए, "duplistatus")।
3. "Build method" को "Repository" के रूप में चुनें।
4. रिपॉजिटरी URL दर्ज करें: `https://github.com/wsj-br/duplistatus.git`
5. "पथ लिखें" फ़ील्ड में, दर्ज करें: `production.yml`
6. (वैकल्पिक) "पर्यावरण चर" अनुभाग में `TZ`, `LANG`, `PWD_ENFORCE` और `PWD_MIN_LEN` पर्यावरण चर सेट करें। टाइमज़ोन और संख्या/तिथि/समय प्रारूप को समायोजित करने के बारे में अधिक विवरण के लिए [टाइमज़ोन](./configure-tz.md) अनुभाग की जांच करें। 
6. "स्टैक को डिप्लॉय करें" पर क्लिक करें।

### विकल्प 4: डॉकर सीएलआई का उपयोग करना {/* #option-4-using-docker-cli */}

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

- `duplistatus_data` वॉल्यूम को स्थायी भंडारण के लिए उपयोग किया जाता है। कंटेनर छवि डिफ़ॉल्ट टाइमज़ोन के रूप में `Europe/London` और डिफ़ॉल्ट स्थान के रूप में `en_GB` (भाषा) का उपयोग करती है।

### विकल्प 5: पॉडमैन (सीएलआई) का उपयोग करना `rootless` {/* #option-5-using-podman-cli-rootless */}

मूलभूत सेटअप के लिए, आप डीएनएस कॉन्फ़िगरेशन के बिना कंटेनर प्रारंभ कर सकते हैं:

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

#### पॉडमैन कंटेनर के लिए डीएनएस कॉन्फ़िगर करना {/* #configuring-dns-for-podman-containers */}

यदि आपको कस्टम डीएनएस कॉन्फ़िगरेशन की आवश्यकता है (जैसे, टेलस्केल मैजिकडीएनएस, कॉर्पोरेट नेटवर्क या कस्टम डीएनएस सेटअप के लिए), तो आप मैन्युअल रूप से डीएनएस सर्वर और खोज डोमेन कॉन्फ़िगर कर सकते हैं।

**आपका डीएनएस कॉन्फ़िगरेशन खोजना:**

1. **सिस्टमडी-रिसॉल्व्ड सिस्टम के लिए** (अधिकांश आधुनिक लिनक्स वितरण):

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **गैर-सिस्टमडी सिस्टम के लिए** या फ़ॉलबैक के रूप में:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

`nameserver` (डीएनएस सर्वर के लिए) और `search` (खोज डोमेन के लिए) के साथ शुरू होने वाली पंक्तियाँ देखें। यदि आप अपने डीएनएस सेटिंग्स या नेटवर्क खोज डोमेन के बारे में अनिश्चित हैं, तो इस जानकारी के लिए अपने नेटवर्क व्यवस्थापक से परामर्श करें।

**डीएनएस कॉन्फ़िगरेशन के साथ उदाहरण:**

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

आप कई डीएनएस सर्वर निर्दिष्ट कर सकते हैं द्वारा कई `--dns` फ्लैग जोड़ना:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

आप कई खोज डोमेन निर्दिष्ट कर सकते हैं द्वारा कई `--dns-search` फ्लैग जोड़ना:

```bash
--dns-search example.com --dns-search internal.local
```

**नोट**: डीएनएस सर्वर कॉन्फ़िगर करते समय आईपीवी6 पते (`:` सहित) और लोकलहोस्ट पते (जैसे `127.0.0.53`) को छोड़ दें।

टाइमज़ोन और संख्या/तिथि/समय प्रारूप को समायोजित करने के बारे में अधिक विवरण के लिए [टाइमज़ोन](./configure-tz.md) अनुभाग की जांच करें।

### विकल्प 6: पॉडमैन पॉड्स का उपयोग करना {/* #option-6-using-podman-pods */}

पॉडमैन पॉड्स आपको एक साझा नेटवर्क नामस्थान में कई कंटेनर चलाने की अनुमति देता है। यह परीक्षण के लिए उपयोगी है या जब आपको अन्य कंटेनर के साथ duplistatus चलाने की आवश्यकता होती है।

**मूलभूत पॉड सेटअप:**

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

#### पॉडमैन पॉड्स के लिए डीएनएस कॉन्फ़िगर करना {/* #configuring-dns-for-podman-pods */}

पॉड्स का उपयोग करते समय, डीएनएस कॉन्फ़िगरेशन को कंटेनर स्तर पर नहीं बल्कि पॉड स्तर पर सेट किया जाना चाहिए।
अपने डीएनएस सर्वर और खोज डोमेन खोजने के लिए विकल्प 5 में वर्णित समान विधियों का उपयोग करें।

**डीएनएस कॉन्फ़िगरेशन के साथ उदाहरण:**

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

**पॉड का प्रबंधन:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## आवश्यक कॉन्फ़िगरेशन {/* #essential-configuration */}

1. अपने [डुप्लिकेटी सर्वर](duplicati-server-configuration.md) को डुप्लिस्टैटस को बैकअप लॉग संदेश भेजने के लिए कॉन्फ़िगर करें (आवश्यक)। डुप्लिकेटी 2.0.9.106 और बाद के संस्करणों में, उस गाइड में वर्णित के रूप में `--send-http-json-urls` का उपयोग करें।
2. डुप्लिस्टैटस में लॉग इन करें - [उपयोगकर्ता गाइड](../user-guide/overview.md#accessing-the-dashboard) में निर्देश देखें।
3. प्रारंभिक बैकअप लॉग एकत्र करें - सभी आपके डुप्लिकेटी सर्वर से ऐतिहासिक बैकअप डेटा के साथ डेटाबेस को भरने के लिए [बैकअप लॉग एकत्र करें](../user-guide/collect-backup-logs.md) सुविधा का उपयोग करें। यह प्रत्येक सर्वर की कॉन्फ़िगरेशन के आधार पर बैकअप निगरानी अंतराल को भी स्वचालित रूप से अपडेट करता है।
4. सर्वर सेटिंग्स कॉन्फ़िगर करें - अपने डैशबोर्ड को अधिक सूचनापूर्ण बनाने के लिए [सेटिंग्स → सर्वर](../user-guide/settings/server-settings.md) में सर्वर उपनाम और टिप्पणियां सेट करें।
5. एनटीएफाई सेटिंग्स कॉन्फ़िगर करें - [सेटिंग्स → एनटीएफाई](../user-guide/settings/ntfy-settings.md) में एनटीएफाई के माध्यम से सूचनाएं सेट करें।
6. ईमेल सेटिंग्स कॉन्फ़िगर करें - [सेटिंग्स → ईमेल](../user-guide/settings/email-settings.md) में ईमेल सूचनाएं सेट करें।
7. बैकअप सूचनाएं कॉन्फ़िगर करें - [सेटिंग्स → बैकअप सूचनाएं](../user-guide/settings/backup-notifications-settings.md) में प्रति-बैकअप या प्रति-सर्वर सूचनाएं सेट करें।

समय क्षेत्र, संख्या प्रारूप और [सुरक्षा कठोरीकरण](security-hardening.md) जैसी वैकल्पिक सेटिंग्स कॉन्फ़िगर करने के लिए निम्नलिखित अनुभाग देखें।
