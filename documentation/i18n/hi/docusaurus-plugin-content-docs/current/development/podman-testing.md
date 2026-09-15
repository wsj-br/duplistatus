# Podman टेस्टिंग {/* #podman-testing */}

Podman टेस्ट सर्वर पर `scripts/podman_testing` पर स्थित स्क्रिप्ट को कॉपी करें और चलाएं।

## प्रारंभिक सेटअप और प्रबंधन {/* #initial-setup-and-management */}

1. `copy.docker.duplistatus.local`: Docker इमेज को लोकल Docker डीमन से Podman में कॉपी करता है (लोकल टेस्टिंग के लिए)।
2. `copy.docker.duplistatus.remote`: Docker इमेज को किसी रिमोट डेवलपमेंट सर्वर से Podman में कॉपी करता है (SSH एक्सेस की आवश्यकता होती है)।
   - डेवलपमेंट सर्वर पर इसका उपयोग करके इमेज बनाएं: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: कंटेनर को रूटलेस मोड में शुरू करता है।
4. `pod.testing`: कंटेनर को Podman पॉड के अंदर टेस्ट करता है (रूट विशेषाधिकारों के साथ)।
5. `stop.duplistatus`: पॉड को रोकता है और कंटेनर को हटाता है।
6. `clean.duplistatus`: कंटेनरों को रोकता है, पॉड्स को हटाता है और पुरानी इमेज को साफ़ करता है।

## DNS कॉन्फ़िगरेशन {/* #dns-configuration */}

स्क्रिप्ट स्वचालित रूप से होस्ट सिस्टम से DNS सेटिंग्स का पता लगाती हैं और उन्हें कॉन्फ़िगर करती हैं:

- **Automatic Detection**: DNS सर्वर और सर्च डोमेन निकालने के लिए `resolvectl status` (systemd-resolved) का उपयोग करता है
- **Fallback Support**: गैर-systemd सिस्टम पर `/etc/resolv.conf` को पार्स करने का सहारा लेता है
- **Smart Filtering**: स्वचालित रूप से लोकलहोस्ट पतों और IPv6 नेमसर्वरों को फ़िल्टर करता है
- **Works with**:
  - Tailscale MagicDNS (100.100.100.100)
  - कॉर्पोरेट DNS सर्वर
  - मानक नेटवर्क कॉन्फ़िगरेशन
  - कस्टम DNS सेटअप

किसी मैन्युअल DNS कॉन्फ़िगरेशन की आवश्यकता नहीं है - स्क्रिप्ट इसे स्वचालित रूप से संभालती हैं!

## मॉनिटरिंग और हेल्थ चेक {/* #monitoring-and-health-checks */}

- `check.duplistatus`: लॉग, कनेक्टिविटी और एप्लिकेशन हेल्थ की जाँच करता है।

## डीबगिंग कमांड {/* #debugging-commands */}

- `logs.duplistatus`: पॉड के लॉग दिखाता है।
- `exec.shell.duplistatus`: कंटेनर में एक शेल खोलता है।
- `restart.duplistatus`: पॉड को रोकता है, कंटेनर को हटाता है, इमेज कॉपी करता है, कंटेनर बनाता है और पॉड को शुरू करता है।

## उपयोग वर्कफ़्लो {/* #usage-workflow */}

### डेवलपमेंट सर्वर {/* #development-server */}

डेवलपमेंट सर्वर पर Docker इमेज बनाएं:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman सर्वर {/* #podman-server */}

1. Docker इमेज ट्रांसफर करें:
   - यदि Docker और Podman एक ही मशीन पर हैं, तो `./copy.docker.duplistatus.local` का उपयोग करें
   - यदि किसी रिमोट डेवलपमेंट सर्वर से कॉपी कर रहे हैं, तो `./copy.docker.duplistatus.remote` का उपयोग करें (इसके लिए `REMOTE_USER` और `REMOTE_HOST` वाली `.env` फ़ाइल की आवश्यकता होती है)
2. कंटेनर को `./start.duplistatus` के साथ शुरू करें (स्टैंडअलोन, रूटलेस)
   - या पॉड मोड में टेस्ट करने के लिए `./pod.testing` का उपयोग करें (रूट के साथ)
3. `./check.duplistatus` और `./logs.duplistatus` के साथ मॉनिटर करें
4. काम पूरा होने पर `./stop.duplistatus` से रोकें
5. संपूर्ण रीस्टार्ट चक्र (रोकें, इमेज कॉपी करें, शुरू करें) के लिए `./restart.duplistatus` का उपयोग करें
   - **नोट**: यह स्क्रिप्ट वर्तमान में `copy.docker.duplistatus` को संदर्भित करती है जिसे या तो `.local` या `.remote` वैरिएंट से बदला जाना चाहिए
6. कंटेनरों, पॉड्स और पुरानी इमेज को हटाने के लिए `./clean.duplistatus` का उपयोग करें

# एप्लिकेशन का परीक्षण {/* #testing-the-application */}

यदि आप उसी मशीन पर Podman सर्वर चला रहे हैं, तो `http://localhost:9666` का उपयोग करें।

यदि आप किसी अन्य सर्वर पर हैं, तो इसके साथ URL प्राप्त करें:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## महत्वपूर्ण नोट्स {/* #important-notes */}

### Podman पॉड नेटवर्किंग {/* #podman-pod-networking */}

Podman पॉड्स में चलते समय, एप्लिकेशन को निम्नलिखित की आवश्यकता होती है:
- स्पष्ट DNS कॉन्फ़िगरेशन (`pod.testing` स्क्रिप्ट द्वारा स्वचालित रूप से संभाला जाता है)
- सभी इंटरफ़ेस पर पोर्ट बाइंडिंग (`0.0.0.0:9666`)

स्क्रिप्ट इन आवश्यकताओं को स्वचालित रूप से संभालती हैं - किसी मैन्युअल कॉन्फ़िगरेशन की आवश्यकता नहीं है।

### रूटलेस बनाम रूट मोड {/* #rootless-vs-root-mode */}

- **स्टैंडअलोन मोड** (`start.duplistatus`): `--userns=keep-id` के साथ रूटलेस चलता है
- **पॉड मोड** (`pod.testing`): परीक्षण के उद्देश्यों के लिए पॉड के अंदर रूट के रूप में चलता है

दोनों मोड स्वचालित DNS पहचान के साथ सही ढंग से काम करते हैं।

## एनवायरनमेंट कॉन्फ़िगरेशन {/* #environment-configuration */}

`copy.docker.duplistatus.local` और `copy.docker.duplistatus.remote` दोनों को `scripts/podman_testing` डायरेक्टरी में एक `.env` फ़ाइल की आवश्यकता होती है:

**लोकल कॉपी करने के लिए** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**रिमोट कॉपी करने के लिए** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

`start.duplistatus` स्क्रिप्ट को कम से कम `IMAGE` वैरिएबल वाली `.env` फ़ाइल की आवश्यकता होती है:

```
IMAGE=wsj-br/duplistatus:devel
```

**नोट**: स्क्रिप्ट का त्रुटि संदेश `REMOTE_USER` और `REMOTE_HOST` का उल्लेख करता है, लेकिन वास्तव में `start.duplistatus` द्वारा इनका उपयोग नहीं किया जाता है—केवल `IMAGE` आवश्यक है।
