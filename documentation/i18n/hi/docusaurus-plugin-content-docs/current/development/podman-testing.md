# Podman Testing {#podman-testing}

Podman test server पर स्थित `scripts/podman_testing` पर स्थित स्क्रिप्ट को कॉपी करें और निष्पादित करें।

## प्रारंभिक सेटअप और प्रबंधन {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`: Podman में (स्थानीय परीक्षण के लिए) स्थानीय Docker डेमन से Docker image को कॉपी करता है।
2. `copy.docker.duplistatus.remote`: Podman में (SSH access की आवश्यकता है) एक रिमोट विकास सर्वर से Docker image को कॉपी करता है।
   - विकास सर्वर पर image बनाएँ: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: रूटलेस मोड में कंटेनर को शुरू करता है।
4. `pod.testing`: Podman पॉड के अंदर कंटेनर का परीक्षण करता है (रूट प्राइविलेज के साथ)।
5. `stop.duplistatus`: पॉड को रोकता है और कंटेनर को हटा देता है।
6. `clean.duplistatus`: कंटेनर को रोकता है, पॉड को हटा देता है, और पुराने इमेज को साफ़ करता है।

## DNS Configuration {#dns-configuration}

स्क्रिप्ट स्वचालित रूप से होस्ट प्रणाली से DNS सेटिंग्स का पता लगाता और कॉन्फ़िगर करता है:

- **स्वचालित पता लगाने**: DNS सर्वर और खोज डोमेन निकालने के लिए `resolvectl status` (systemd-resolved) का उपयोग करता है
- **फॉलबैक समर्थन**: गैर-सिस्टमडी सिस्टम पर `/etc/resolv.conf` को पार्स करने के लिए वापस आता है
- **स्मार्ट फ़िल्टरिंग**: स्वचालित रूप से लोकलहोस्ट पते और IPv6 नामसर्वर को फ़िल्टर करता है
- **के साथ काम करता है**:
  - Tailscale MagicDNS (100.100.100.100)
  - कॉर्पोरेट DNS सर्वर
  - मानक नेटवर्क कॉन्फ़िगरेशन
  - कस्टम DNS सेटअप

कोई मैनुअल DNS कॉन्फ़िगरेशन की आवश्यकता नहीं है - स्क्रिप्ट इसे स्वचालित रूप से संभालते हैं!

## Monitoring and Health Checks {#monitoring-and-health-checks}

- `check.duplistatus`: लॉग, कनेक्टिविटी, और एप्लिकेशन स्वास्थ्य की जाँच करता है।

## Debugging Commands {#debugging-commands}

- `logs.duplistatus`: पॉड के लॉग दिखाता है।
- `exec.shell.duplistatus`: कंटेनर में एक शेल खोलता है।
- `restart.duplistatus`: पॉड को रोकता है, कंटेनर को हटा देता है, इमेज को कॉपी करता है, कंटेनर बनाता है, और पॉड को शुरू करता है।

## Usage Workflow {#usage-workflow}

### Development Server {#development-server}

विकास सर्वर पर Docker image बनाएँ:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman Server {#podman-server}

1. Docker image ट्रांसफर करें:
   - अगर Docker और Podman एक ही मशीन पर हैं तो `./copy.docker.duplistatus.local` का उपयोग करें
   - अगर रिमोट विकास सर्वर से कॉपी कर रहे हैं तो `./copy.docker.duplistatus.remote` का उपयोग करें (`.env` फ़ाइल की आवश्यकता है जिसमें `REMOTE_USER` और `REMOTE_HOST`)
2. `./start.duplistatus` के साथ कंटेनर शुरू करें (स्टैंडअलोन, रूटलेस)
   - या पॉड मोड में परीक्षण के लिए `./pod.testing` का उपयोग करें (रूट के साथ)
3. `./check.duplistatus` और `./logs.duplistatus` के साथ मॉनिटर करें
4. जब पूरा हो जाए तो `./stop.duplistatus` के साथ रोक दें
5. पूर्ण रीस्टार्ट साइकिल के लिए `./restart.duplistatus` का उपयोग करें (रोकें, इमेज कॉपी करें, शुरू करें)
   - **Note**: यह स्क्रिप्ट वर्तमान में `copy.docker.duplistatus` का संदर्भ देती है, जो कि `.local` या `.remote` के विकल्प के साथ बदल दिया जाना चाहिए
6. `./clean.duplistatus` का उपयोग कंटेनर, पॉड और पुराने छवियों को हटाने के लिए करें

# एप्लिकेशन का परीक्षण {#testing-the-application}

यदि आप उसी मशीन पर Podman सर्वर चला रहे हैं, तो `http://localhost:9666` का उपयोग करें।

यदि आप दूसरे सर्वर पर हैं, तो URL प्राप्त करें:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## महत्वपूर्ण नोट्स {#important-notes}

### Podman पॉड नेटवर्किंग {#podman-pod-networking}

Podman पॉड में चलाते समय, एप्लिकेशन को निम्नलिखित की आवश्यकता होती है:
- स्पष्ट DNS कॉन्फ़िगरेशन (`pod.testing` स्क्रिप्ट द्वारा स्वचालित रूप से संभाला जाता है)
- सभी इंटरफेसेज़ पर पोर्ट बाइंडिंग (`0.0.0.0:9666`)

स्क्रिप्ट्स इन आवश्यकताओं को स्वचालित रूप से संभालती हैं - कोई मैनुअल कॉन्फ़िगरेशन की आवश्यकता नहीं है।

### रूटलेस बनाम रूट मोड {#rootless-vs-root-mode}

- **स्टैंडअलोन मोड** (`start.duplistatus`): `--userns=keep-id` के साथ रूटलेस चलाता है
- **पॉड मोड** (`pod.testing`): परीक्षण उद्देश्यों के लिए पॉड के अंदर रूट के रूप में चलाता है

दोनों मोड स्वचालित DNS पता लगाने के साथ सही ढंग से काम करते हैं।

## वातावरण कॉन्फ़िगरेशन {#environment-configuration}

`copy.docker.duplistatus.local` और `copy.docker.duplistatus.remote` दोनों को `.env` फ़ाइल की आवश्यकता होती है `scripts/podman_testing` निर्देशिका में:

**स्थानीय कॉपी के लिए** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**रिमोट कॉपी के लिए** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

`start.duplistatus` स्क्रिप्ट को `.env` फ़ाइल की आवश्यकता होती है जिसमें कम से कम `IMAGE` चर शामिल हैं:

```
IMAGE=wsj-br/duplistatus:devel
```

**Note**: स्क्रिप्ट का त्रुटि संदेश `REMOTE_USER` और `REMOTE_HOST` का उल्लेख करता है, लेकिन ये वास्तव में `start.duplistatus` द्वारा उपयोग नहीं किए जाते हैं—केवल `IMAGE` की आवश्यकता है।
