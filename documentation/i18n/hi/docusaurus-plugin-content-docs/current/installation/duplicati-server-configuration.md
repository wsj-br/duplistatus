# Duplicati सर्वर कॉन्फ़िगरेशन (आवश्यक) {/* #duplicati-server-configuration-required */}

इस एप्लिकेशन के ठीक से काम करने के लिए, आपके प्रत्येक Duplicati सर्वर को प्रत्येक बैकअप रन के लिए HTTP रिपोर्ट **duplistatus** सर्वर पर भेजने के लिए कॉन्फ़िगर किया जाना आवश्यक है।

यह कॉन्फ़िगरेशन अपने प्रत्येक Duplicati सर्वर पर लागू करें:

1. **बैकअप परिणाम रिपोर्टिंग कॉन्फ़िगर करें:** Duplicati कॉन्फ़िगरेशन पृष्ठ पर, `Settings` चुनें और `Default Options` अनुभाग में निम्नलिखित विकल्प शामिल करें।

![Duplicati कॉन्फ़िगरेशन](/img/duplicati-options.png)

`my.local.server` को उस होस्टनाम या आईपी पता से बदलें जिसका उपयोग Duplicati सर्वर **duplistatus** तक पहुँचने के लिए करता है। यदि दोनों एक ही मशीन पर चलते हैं, तो [एक ही होस्ट पर Duplicati और duplistatus](#duplicati-and-duplistatus-on-the-same-host) देखें।

विकल्प संदर्भ के लिए Duplicati का [HTTP सूचनाएं](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) दस्तावेज़ देखें।

### अनुशंसित विकल्प (Duplicati 2.0.9.106 और बाद के) {/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` पहले से ही JSON भेजता है, इसलिए `--send-http-result-output-format=Json` आवश्यक नहीं है (और इन URL के लिए इसे अनदेखा कर दिया जाता है)।

| उन्नत विकल्प           | मान                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (जब API कुंजियाँ आवश्यक हों, तो `?api_key=` जोड़ें) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

वैकल्पिक रूप से, आप `Edit as text` पर क्लिक कर सकते हैं और `my.local.server` को अपने वास्तविक सर्वर पता से बदलते हुए नीचे दी गई पंक्तियों को कॉपी कर सकते हैं।

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

जब [API कुंजियाँ](../user-guide/settings/api-keys-settings.md) आवश्यक हों, तो URL में अपलोड-स्कोप कुंजी जोड़ें:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati कस्टम HTTP हेडर सेट नहीं कर सकता है। कुंजी भेजने के लिए क्वेरी पैरामीटर ही समर्थित तरीका है। रिवर्स-प्रॉक्सी एक्सेस लॉग में सीक्रेट शामिल होगा, इसलिए इसे सीमित करें कि उन लॉग को कौन पढ़ सकता है।

`--send-http-max-log-lines=500` JSON रिपोर्ट को डिफ़ॉल्ट 5 MB अपलोड आकार सीमा से काफी कम रखता है। `--send-http-max-log-lines=0` (असीमित) उस सीमा को पार कर सकता है और HTTP 413 लौटा सकता है। यदि आपको बड़ी रिपोर्ट की आवश्यकता है, तो सेटिंग्स → API कुंजियाँ में सीमा बढ़ाएँ।

### पुराने Duplicati संस्करण {/* #older-duplicati-versions */}

यदि आपका Duplicati सर्वर 2.0.9.106 से पुराना है, तो लेगेसी URL विकल्प का उपयोग करें और परिणाम प्रारूप को JSON पर सेट करें:

| उन्नत विकल्प                  | मान                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=500
```

### लॉग लाइनें और उपलब्ध संस्करण {/* #log-lines-and-available-versions */}

**Duplicati द्वारा भेजे गए संदेशों पर महत्वपूर्ण नोट्स:**

- यदि आप `--send-http-log-level=Information` छोड़ देते हैं, तो **duplistatus** को कोई लॉग संदेश नहीं भेजा जाएगा, केवल आँकड़े भेजे जाएँगे। इससे उपलब्ध संस्करण **सूची** काम नहीं करेगी।
- Duplicati का डिफ़ॉल्ट `--send-http-max-log-lines=100` है। अनुशंसित मान `500` है। Duplicati **पहली** N लॉग लाइनें रखता है। उपलब्ध संस्करण सूची (`Backups to consider`) के लिए उपयोग की जाने वाली लाइनें आमतौर पर उन शुरुआती सैकड़ों लाइनों में होती हैं; `100` अक्सर बहुत कम होती हैं।
- `--send-http-max-log-lines=0` का अर्थ असीमित है। इसका उपयोग केवल तभी करें जब संस्करण सूची अभी भी अनुपलब्ध हो और आप [Duplicati Monitoring](https://www.duplicati-monitoring.com/) को भी रिपोर्ट **नहीं** भेज रहे हों। असीमित लॉग के कारण बड़े जॉब्स पर वह सेवा HTTP 500 लौटा सकती है।
- उपलब्ध संस्करणों की **गिनती** विस्तृत टाइमस्टैम्प सूची अनुपलब्ध होने पर भी JSON आँकड़ों (`BackupListCount`) से ही आती है। यदि सूची का आइकन धूसर (ग्रे) है, तो सीमा बढ़ाएँ (या केवल **duplistatus** को रिपोर्ट करते समय `0` का उपयोग करें)।

:::tip
**duplistatus** सर्वर को कॉन्फ़िगर करने के बाद, [बैकअप लॉग एकत्र करें](../user-guide/collect-backup-logs.md) का उपयोग करके अपने सभी Duplicati सर्वर के बैकअप लॉग एकत्र करें।
:::

### duplistatus और Duplicati Monitoring को रिपोर्ट करना {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

आप **उसी** Duplicati सर्वर से एक ही समय में **duplistatus** और [Duplicati Monitoring](https://www.duplicati-monitoring.com/) दोनों को रिपोर्ट भेज सकते हैं। **duplistatus** को JSON प्राप्त होना चाहिए। Duplicati Monitoring फ़ॉर्म-एन्कोडेड रिपोर्ट की अपेक्षा करता है। `--send-http-form-urls` को `/api/upload` पर इंगित न करें।

उस Duplicati सर्वर पर, डिफ़ॉल्ट विकल्प (Default Options) को इस पर सेट करें:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

`<your-endpoint>` को अपने Duplicati Monitoring खाते के URL से बदलें।

- इन समर्पित विकल्पों को प्राथमिकता दें। जब तक आपको लीगेसी विकल्प की आवश्यकता न हो, तब तक `--send-http-url` को भी उन्हीं गंतव्यों पर इंगित न रखें।
- `--send-http-log-level` और `--send-http-max-log-lines` **प्रत्येक** HTTP लक्ष्य पर लागू होते हैं। आप **duplistatus** को पूरा लॉग और Duplicati Monitoring को संक्षिप्त रिपोर्ट नहीं भेज सकते।
- `500` का उपयोग करें, `0` का नहीं। यदि Duplicati Monitoring बड़े जॉब्स पर अभी भी HTTP 500 लौटाता है, तो यह ध्यान में रखते हुए सीमा को और कम करें (या `Information` को हटा दें) कि संस्करण **सूची** अनुपलब्ध हो सकती है। यदि सूची अनुपलब्ध है लेकिन Monitoring ठीक चल रहा है, तो सीमा बढ़ाएँ। वैकल्पिक रूप से, उन जॉब्स के लिए केवल **duplistatus** को रिपोर्ट करें।

:::caution
यदि कोई एक HTTP लक्ष्य विफल हो जाता है (आउटेज या HTTP 500), तो हो सकता है कि Duplicati शेष रिपोर्ट न भेजे। फ़ॉर्म URL पहले भेजे जाते हैं, फिर JSON URL। इसलिए Duplicati Monitoring से आउटेज या 500 त्रुटि **duplistatus** को जाने वाली JSON रिपोर्ट को अवरुद्ध कर सकती है।
:::

[बैकअप लॉग एकत्र करें](../user-guide/collect-backup-logs.md) HTTP रिपोर्टिंग पर निर्भर नहीं करता है। जो रन प्राप्त नहीं हुआ था, उसे बैकफ़िल करने के लिए इसका उपयोग करें।

### एक ही होस्ट पर Duplicati और duplistatus {/* #duplicati-and-duplistatus-on-the-same-host */}

अपलोड URL **Duplicati प्रक्रिया से** पहुँच योग्य होना चाहिए, आपके ब्राउज़र से नहीं।

- **होस्ट पर Duplicati, प्रकाशित पोर्ट `9666` के साथ Docker में duplistatus:** `http://127.0.0.1:9666/api/upload` (या होस्ट LAN IP)।
- **साझा नेटवर्क पर Docker में दोनों:** `http://duplistatus:9666/api/upload` (Compose सर्विस या कंटेनर का नाम)। Duplicati कंटेनर के अंदर `localhost` वही कंटेनर है, **duplistatus** नहीं।
- **उसी होस्ट पर HTTPS रिवर्स प्रॉक्सी:** [सुरक्षा सुदृढ़ीकरण](security-hardening.md) के अनुसार सार्वजनिक HTTPS URL का उपयोग करें।

बैकअप लॉग एकत्र करें विपरीत दिशा में काम करता है: **duplistatus** कंटेनर से, `localhost:8200` होस्ट पर Duplicati नहीं है। होस्ट IP, `host.docker.internal` (Docker Desktop, या आपके द्वारा कॉन्फ़िगर किया गया कोई अतिरिक्त होस्ट), या Duplicati कंटेनर के नाम का उपयोग करें।

2. **वैकल्पिक - रिमोट UI एक्सेस की अनुमति दें:** यदि आप **duplistatus** डैशबोर्ड लिंक से सीधे Duplicati वेब इंटरफ़ेस तक पहुँचना चाहते हैं, तो [Duplicati के UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) में लॉग इन करें, `Settings` चुनें, और होस्टनामों की सूची सहित रिमोट एक्सेस की अनुमति दें (या `*` का उपयोग करें)। यदि आप इसे छोड़ देते हैं, तो भी **duplistatus** को बैकअप रिपोर्ट प्राप्त होंगी, लेकिन Duplicati UI के सीधे लिंक काम नहीं करेंगे।

:::info
यदि आप Duplicati में रिमोट एक्सेस सक्षम नहीं करते हैं, तो __Duplicati UI__ तक पहुँचने के लिए **Duplistatus** में दिए गए लिंक काम नहीं करेंगे।
:::

![Duplicati सेटिंग्स](/img/duplicati-settings.png)

:::caution
रिमोट एक्सेस केवल तभी सक्षम करें जब आपका Duplicati सर्वर किसी सुरक्षित नेटवर्क
(जैसे, VPN, निजी LAN, या फ़ायरवॉल नियम) द्वारा सुरक्षित हो। उचित सुरक्षा उपायों के बिना Duplicati इंटरफ़ेस को सार्वजनिक इंटरनेट पर
उजागर करने से अनधिकृत एक्सेस हो सकता है।

अपने स्थानीय नेटवर्क के बाहर से अपने सर्वर को सुरक्षित रूप से एक्सेस करने के लिए Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard या इसी तरह के समाधानों का उपयोग करने की अनुशंसा की जाती है।
:::
