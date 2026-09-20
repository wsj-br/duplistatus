# Duplicati सर्वर कॉन्फ़िगरेशन (आवश्यक) {/* #duplicati-server-configuration-required */}

इस एप्लिकेशन के सही ढंग से काम करने के लिए, आपके प्रत्येक Duplicati सर्वर को **duplistatus** सर्वर के लिए प्रत्येक बैकअप रन के लिए HTTP रिपोर्ट भेजने के लिए कॉन्फ़िगर किया जाना चाहिए।

इस कॉन्फ़िगरेशन को आपके प्रत्येक Duplicati सर्वर पर लागू करें:

1. **बैकअप परिणाम रिपोर्टिंग कॉन्फ़िगर करें:** Duplicati कॉन्फ़िगरेशन पृष्ठ पर, `Settings` का चयन करें और, `Default Options` अनुभाग में, निम्नलिखित विकल्प शामिल करें।

![Duplicati कॉन्फ़िगरेशन](/img/duplicati-options.png)

`my.local.server` को उस होस्टनाम या आईपी पते से बदलें जिसका Duplicati सर्वर **duplistatus** तक पहुँचने के लिए उपयोग करता है। यदि दोनों एक मशीन पर चलते हैं, तो [Duplicati और duplistatus एक ही होस्ट पर](#duplicati-and-duplistatus-on-the-same-host) देखें।

विकल्प संदर्भ के लिए Duplicati के [HTTP सूचनाएं](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) दस्तावेज़ देखें।

### अनुशंसित विकल्प (Duplicati 2.0.9.106 और बाद में) {/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` पहले से ही JSON भेजता है, इसलिए `--send-http-result-output-format=Json` आवश्यक नहीं है (और इन URLs के लिए अनदेखा किया जाता है)।

| उन्नत विकल्प           | मान                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (जब API कुंजियाँ आवश्यक हों तो `?api_key=` जोड़ें) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

वैकल्पिक रूप से, आप `Edit as text` पर क्लिक कर सकते हैं और नीचे की पंक्तियों को कॉपी कर सकते हैं, `my.local.server` को अपने वास्तविक सर्वर पते से बदलते हुए।

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

जब [API कुंजियाँ](../user-guide/settings/api-keys-settings.md) आवश्यक होती हैं, तो URL में अपलोड-स्कोप कुंजी जोड़ें:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati कस्टम HTTP हेडर सेट नहीं कर सकता। क्वेरी पैरामीटर कुंजी भेजने का समर्थित तरीका है। रिवर्स-प्रॉक्सी एक्सेस लॉग में रहस्य होगा, इसलिए उन लॉग को पढ़ने की अनुमति सीमित करें।

`--send-http-max-log-lines=500` JSON रिपोर्ट को डिफ़ॉल्ट 5 MB अपलोड आकार सीमा के तहत रखता है। `--send-http-max-log-lines=0` (असीमित) उस सीमा को पार कर सकता है और HTTP 413 लौटाता है। यदि आपको बड़े रिपोर्ट की आवश्यकता है, तो सेटिंग्स → API कुंजियाँ में सीमा बढ़ाएँ।

### पुराने Duplicati संस्करण {/* #older-duplicati-versions */}

यदि आपका Duplicati सर्वर 2.0.9.106 से पुराना है, तो विरासती URL विकल्प का उपयोग करें और परिणाम प्रारूप को JSON पर सेट करें:

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

### लॉग पंक्तियाँ और उपलब्ध संस्करण {/* #log-lines-and-available-versions */}

**Duplicati द्वारा भेजे गए संदेशों पर महत्वपूर्ण नोट्स:**

- यदि आप `--send-http-log-level=Information` को छोड़ते हैं, तो **duplistatus** पर कोई लॉग संदेश नहीं भेजे जाएंगे, केवल आँकड़े। यह उपलब्ध संस्करणों की **सूची** को काम करने से रोकेगा।
- Duplicati का डिफ़ॉल्ट `--send-http-max-log-lines=100` है। अनुशंसित मान `500` है। Duplicati **पहली** N लॉग पंक्तियों को रखता है। उपलब्ध संस्करणों की सूची (`Backups to consider`) के लिए उपयोग की जाने वाली पंक्तियाँ आमतौर पर उन पहली सैकड़ों पंक्तियों में होती हैं; `100` अक्सर बहुत कम होता है।
- `--send-http-max-log-lines=0` का अर्थ असीमित है। इसका उपयोग केवल तब करें जब संस्करण सूची अभी भी गायब हो और आप [Duplicati Monitoring](https://www.duplicati-monitoring.com/) को रिपोर्ट **नहीं** भेज रहे हों। असीमित लॉग बड़े जॉब्स पर उस सेवा को HTTP 500 लौटाने का कारण बन सकते हैं।
- उपलब्ध संस्करणों की **गिनती** अभी भी JSON आँकड़ों (`BackupListCount`) से आती है, भले ही विस्तृत टाइमस्टैम्प सूची गायब हो। यदि सूची आइकन धूसरित है, तो सीमा बढ़ाएँ (या केवल **duplistatus** को रिपोर्ट करते समय `0` का उपयोग करें)।

:::tip
**duplistatus** सर्वर को कॉन्फ़िगर करने के बाद, अपने सभी Duplicati सर्वर के लिए बैकअप लॉग को [Collect Backup Logs](../user-guide/collect-backup-logs.md) का उपयोग करके एकत्र करें।
:::

### duplistatus और Duplicati Monitoring को रिपोर्टिंग {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

आप **समान** Duplicati सर्वर से एक ही समय में **duplistatus** और [Duplicati Monitoring](https://www.duplicati-monitoring.com/) को रिपोर्ट भेज सकते हैं। **duplistatus** को JSON प्राप्त करना चाहिए। Duplicati Monitoring फॉर्म-एन्कोडेड रिपोर्ट की अपेक्षा करता है। `--send-http-form-urls` को `/api/upload` पर न इंगित करें।

उस Duplicati सर्वर पर, डिफ़ॉल्ट विकल्प को इस प्रकार सेट करें:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

`<your-endpoint>` को अपने Duplicati Monitoring खाते से URL से बदलें।

- इन समर्पित विकल्पों को प्राथमिकता दें। जब तक आपको पुराना विकल्प अभी भी आवश्यकता न हो तब तक `--send-http-url` को उसी गंतव्यों पर न रखें।
- `--send-http-log-level` और `--send-http-max-log-lines` **हर** HTTP लक्ष्य पर लागू होता है। आप **duplistatus** को एक पूर्ण लॉग भेज नहीं सकते और Duplicati Monitoring को एक छोटी रिपोर्ट भेज सकते हैं।
- `0` के बजाय `500` का उपयोग करें। यदि Duplicati Monitoring अभी भी बड़ी नौकरियों पर HTTP 500 लौटा रहा है, तो कैप को और कम करें (या `Information` को छोड़ दें) जानते हुए कि संस्करण **सूची** गायब हो सकती है। यदि सूची गायब है लेकिन Monitoring ठीक है, तो कैप बढ़ाएँ। वैकल्पिक रूप से, उन नौकरियों के लिए केवल **duplistatus** को रिपोर्ट करें।

:::caution
यदि एक HTTP लक्ष्य विफल हो जाता है (आउटेज या HTTP 500), तो Duplicati शेष रिपोर्ट नहीं भेज सकता है। फॉर्म URL पहले भेजे जाते हैं, फिर JSON URL। इसलिए, Duplicati Monitoring से आउटेज या 500 **duplistatus** को JSON रिपोर्ट ब्लॉक कर सकता है।
:::

[Collect Backup Logs](../user-guide/collect-backup-logs.md) HTTP रिपोर्टिंग पर निर्भर नहीं करता है। एक रन को बैकफ़िल करने के लिए इसका उपयोग करें जो प्राप्त नहीं हुआ था।

### एक ही होस्ट पर Duplicati और duplistatus {/* #duplicati-and-duplistatus-on-the-same-host */}

अपलोड URL **Duplicati प्रक्रिया** से पहुंच योग्य होना चाहिए, आपके ब्राउज़र से नहीं।

- **होस्ट पर Duplicati, पोर्ट `9666` के साथ Docker में duplistatus प्रकाशित:** `http://127.0.0.1:9666/api/upload` (या होस्ट LAN IP)।
- **एक साझा नेटवर्क पर Docker में दोनों:** `http://duplistatus:9666/api/upload` (कम्पोज़ सेवा या कंटेनर नाम)। Duplicati कंटेनर के अंदर `localhost` वह कंटेनर है, न कि **duplistatus**।
- **एक ही होस्ट पर HTTPS रिवर्स प्रॉक्सी:** [Security Hardening](security-hardening.md) में जैसे सार्वजनिक HTTPS URL का उपयोग करें।

Collect Backup Logs विपरीत दिशा है: **duplistatus** कंटेनर से, `localhost:8200` होस्ट पर Duplicati नहीं है। होस्ट IP, `host.docker.internal` (Docker Desktop, या एक अतिरिक्त होस्ट जिसे आपने कॉन्फ़िगर किया है), या Duplicati कंटेनर नाम का उपयोग करें।

2. **वैकल्पिक - रिमोट यूआई एक्सेस की अनुमति दें:** यदि आप **duplistatus** डैशबोर्ड लिंक से सीधे duplicati वेब इंटरफ़ेस तक पहुंचना चाहते हैं, तो [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) पर लॉग इन करें, `Settings` का चयन करें, और होस्टनाम की सूची सहित रिमोट एक्सेस की अनुमति दें (या `*` का उपयोग करें)। यदि आप इसे छोड़ देते हैं, तो **duplistatus** को अभी भी बैकअप रिपोर्ट प्राप्त होंगी, लेकिन duplicati यूआई पर सीधे लिंक काम नहीं करेंगे।

:::info
यदि आप Duplicati में रिमोट एक्सेस सक्षम नहीं करते हैं, तो __Duplicati UI__ तक पहुंचने के लिए **Duplistatus** में लिंक काम नहीं करेंगे।
:::

![Duplicati सेटिंग्स](/img/duplicati-settings.png)

:::caution
केवल तभी दूरस्थ पहुंच सक्षम करें जब आपका duplicati सर्वर सुरक्षित नेटवर्क द्वारा सुरक्षित हो
(जैसे, वीपीएन, निजी लैन या फ़ायरवॉल नियम). उचित सुरक्षा उपायों के बिना ड्यूप्लिकेटी इंटरफ़ेस को सार्वजनिक इंटरनेट के लिए प्रदर्शित करना
अनधिकृत पहुंच का कारण बन सकता है।

अपने स्थानीय नेटवर्क के बाहर से अपने सर्वर तक सुरक्षित रूप से पहुंचने के लिए टेलस्केल, हेडस्केल, नेटबर्ड, जीरोटियर, नेबुला, ट्विंगेट, प्रिटनल, क्लाउडफ्लेयर एक्सेस, वायरगार्ड या समान समाधानों का उपयोग करना अनुशंसित है।
:::
