# {#troubleshooting} ke liye Samasya Nivaran

### Dashboard Load Nahi Ho Raha {#dashboard-not-loading}
- Janch karein ki container chal rahi hai: `docker ps`
- Janch karein ki port 9666 accessible hai
- Container logs check karein: `docker logs duplistatus`

### Backup Data Nahi Hai {#no-backup-data}
- Duplicati server configuration verify karein
- Servers ke beech network connectivity check karein
- Trutiyon ke liye duplistatus logs review karein
- Janch karein ki backup jobs chal rahi hai

### Notifications Nahi Ho Rahe {#notifications-not-working}
- Notification configuration check karein
- NTFY server connectivity verify karein (agar NTFY use kar rahe hain)
- Notification settings test karein
- Notification logs check karein

### New Backups Nahi dikh rahe {#new-backups-not-showing}

Agar aapko Duplicati server warnings jaise `HTTP Response request failed for:` aur `Failed to send message: System.Net.Http.HttpRequestException:` dikh rahe hain, aur new backups dashboard ya backup itihas mein nahi dikh rahe hain:

- **Duplicati Configuration Check Karein**: Janch karein ki Duplicati sahi se configure ki gayi hai **duplistatus** ke liye data bhejne ke liye. Duplicati mein HTTP URL settings verify karein.
- **Network Connectivity Check Karein**: Janch karein ki Duplicati server **duplistatus** server se connect ho sakta hai. Janch karein ki port sahi hai (default: `9666`).
- **Duplicati Logs Review Karein**: Duplicati logs mein HTTP request errors ke liye check karein.

### Dashboard par Duplicate Servers {#duplicate-servers-on-the-dashboard}

Agar dashboard par ek hi server ek se jyada baar dikh rahi hai, toh ye sabse jyada [backup logs collect karne](collect-backup-logs.md) ke baad hota hai, ya Duplicati server reinstall ya upgrade karne ke baad.

**Karanon:**

- **`machine_id` badal gayi**: Jab aap Duplicati reinstall ya upgrade karte hain, toh server ka `machine_id` badal sakta hai, aur **duplistatus** use ek naye server ke roop mein treat karta hai.
- **Duplicati API bug**: Duplicati ke naye versions mein ek bug hai jahan some API endpoints `identity` id aur `machine_id` ko mix kar dete hain. Is inconsistency ke karan **duplistatus** same server ko alag-alag IDs ke saath register karta hai, duplicates generate karne ke liye.

**Workaround:**

1.  **Duplicati server** par, aapko **ek** inme se koi bhi karna hai:
    - `identity.txt` aur `machineid.txt` files edit karein taaki dono files mein **same** id ho; ya
    - **Duplicati → Settings → Advanced Options → Machine-id** kholiye aur ek value set karein (ye auto-filled hai — bas suggested value accept karein).
2.  **Restart** karein Duplicati server taaki change effect ho.
3.  **duplistatus** mein, [Settings → Database Maintenance → Merge Duplicate Servers](settings/database-maintenance.md#merge-duplicate-servers) use karke duplicate entries consolidate karein.

### Notifications Nahi Ho Rahe (Vivaran) {#notifications-not-working-detailed}

Agar notifications bheje ja rahe hain ya received nahi ho rahe hain:

- **NTFY Configuration Check Karein**: Janch karein ki NTFY URL aur topic sahi hai. Test ke liye **Send Test Notification** button use karein.
- **Network Connectivity Check Karein**: Janch karein ki **duplistatus** aapke NTFY server se connect ho sakta hai. Agar applicable hai toh firewall settings review karein.
- **Notification Settings Check Karein**: Janch karein ki relevant backups ke liye notifications enable hai.

### Available Versions Nahi dikh rahe {#available-versions-not-appearing}

Agar backup versions dashboard ya details page par nahi dikh rahe hain:

- **Duplicati configuration जाँच करें**: सुनिश्चित करें कि `send-http-log-level=Information` और `send-http-max-log-lines=0` Duplicati के उन्नत विकल्पों में कॉन्फ़िगर किए गए हैं।

### विलंबित बैकअप अलर्ट्स काम नहीं कर रहे {#overdue-backup-alerts-not-working}

यदि विलंबित बैकअप सूचनाएं भेजी जा रही नहीं हैं:

- **विलंबित कॉन्फ़िगरेशन जाँच करें**: सुनिश्चित करें कि बैकअप के लिए बैकअप मॉनिटरिंग सक्षम की गई है। अपेक्षित अंतराल और सहिष्णुता सेटिंग्स की पुष्टि करें।
- **सूचना आवृत्ति जाँच करें**: यदि **एक बार** पर सेट किया गया है, तो अलर्ट केवल एक बार प्रति विलंबित घटना भेजे जाते हैं।
- **क्रॉन सेवा जाँच करें**: सुनिश्चित करें कि क्रॉन सेवा जो विलंबित बैकअप के लिए मॉनिटर करती है, सही ढंग से चल रही है। एप्लिकेशन लॉग्स में त्रुटियों की जाँच करें। क्रॉन सेवा को कॉन्फ़िगर किए गए पोर्ट (डिफ़ॉल्ट: `8667`) पर पहुंच योग्य है, यह भी पुष्टि करें।

### बैकअप लॉग्स संग्रहित नहीं हो रहे {#collect-backup-logs-not-working}

यदि मैनुअल बैकअप लॉग संग्रहण विफल हो जाता है:

- **Duplicati सर्वर एक्सेस जाँच करें**: सुनिश्चित करें कि Duplicati सर्वर होस्टनेम और पोर्ट सही हैं। Duplicati में रिमोट एक्सेस सक्षम है, यह पुष्टि करें। प्रमाणीकरण पासवर्ड सही है, यह भी पुष्टि करें।
- **नेटवर्क कनेक्टिविटी जाँच करें**: **duplistatus** से Duplicati सर्वर तक कनेक्टिविटी का परीक्षण करें। Duplicati सर्वर पोर्ट पहुंच योग्य है (डिफ़ॉल्ट: `8200`), यह पुष्टि करें।
  उदाहरण के लिए, यदि आप Docker का उपयोग कर रहे हैं, तो आप `docker exec -it <container-name> /bin/sh` का उपयोग करके कंटेनर के कमांड लाइन तक पहुंच सकते हैं और `ping` और `curl` जैसे नेटवर्क टूल चला सकते हैं।

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

कंटेनर के अंदर DNS कॉन्फ़िगरेशन की जाँच भी करें (अधिक जानकारी के लिए [Podman कंटेनर के लिए DNS कॉन्फ़िगरेशन](../installation/installation.md#configuring-dns-for-podman-containers) देखें)

- **Duplicati 2.4 aur baad** par, `/api/v1/systeminfo` `machine-id` ko khali Default ke saath list karta hai. **duplistatus** Duplicati server sammaan se configured id padhta hai. Agar collection ab bhi server ko identify nahi kar sakta, to **Duplicati → Sammaan → Advanced Options → Machine-id** set karein aur phir se try karein.

### एक पूर्व संस्करण से अपग्रेड (0.9.x से पहले) और लॉगिन नहीं कर पा रहे {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** since version 0.9.x requires user authentication. A default `admin` account is created automatically when installing the application for the first time or upgrading from an earlier version: 
    - username: `admin`
    - password: `Duplistatus09`

आप [सेटिंग्स > उपयोगकर्ता](settings/user-management-settings.md) में अतिरिक्त उपयोगकर्ता खाते बना सकते हैं, पहली लॉगिन के बाद।

### एडमिन पासवर्ड खो गया या लॉक आ गया {#lost-admin-password-or-locked-out}

यदि आपने अपना प्रशासक पासवर्ड खो दिया है या अपने खाते से लॉक आ गए हैं:

- **एडमिन रिकवरी स्क्रिप्ट का उपयोग करें**: Docker वातावरण में प्रशासक एक्सेस को पुनर्प्राप्त करने के लिए निर्देशों के लिए [एडमिन खाता पुनर्प्राप्ति](admin-recovery.md) गाइड देखें।
- **कंटेनर एक्सेस की पुष्टि करें**: सुनिश्चित करें कि आप कंटेनर में रिकवरी स्क्रिप्ट चलाने के लिए Docker exec एक्सेस है।

### डेटाबेस बैकअप और माइग्रेशन {#database-backup-and-migration}

पिछले संस्करण से माइग्रेट करते समय या डेटाबेस बैकअप बनाते समय:

**यदि आप 1.2.1 या उससे बाद का संस्करण चला रहे हैं:**
- [सेटिंग्स → डेटाबेस रखरखाव](user-guide/settings/database-maintenance.md) में बिल्ट-इन डेटाबेस बैकअप फ़ंक्शन का उपयोग करें
- अपनी पसंदीदा प्रारूप (.db या .sql) चुनें और **डाउनलोड बैकअप** पर क्लिक करें
- बैकअप फ़ाइल आपके कंप्यूटर पर डाउनलोड की जाएगी
- [डेटाबेस रखरखाव](settings/database-maintenance.md#database-backup) में विस्तृत निर्देशों के लिए देखें

**यदि आप 1.2.1 से पहले का संस्करण चला रहे हैं:**
- आपको मैन्युअल रूप से बैकअप करना पड़ेगा। अधिक जानकारी के लिए [माइग्रेशन गाइड](../migration/version_upgrade.md#backing-up-your-database-before-migration) देखें।

यदि आप अभी भी समस्याओं का सामना कर रहे हैं, तो निम्नलिखित चरणों का प्रयास करें:

1.  **एप्लिकेशन लॉग्स की जाँच करें**: यदि Docker का उपयोग कर रहे हैं, तो `docker logs <container-name>` चलाएं विस्तृत त्रुटि जानकारी की समीक्षा के लिए।
2.  **कॉन्फ़िगरेशन की पुष्टि करें**: अपने कंटेनर प्रबंधन टूल (Docker, Portainer, Podman, आदि) में सभी कॉन्फ़िगरेशन सेटिंग्स की दोबारा जाँच करें, जिसमें पोर्ट, नेटवर्क, और अनुमतियाँ शामिल हैं।
3.  **नेटवर्क कनेक्टिविटी की पुष्टि करें**: सुनिश्चित करें कि सभी नेटवर्क कनेक्शन स्थिर हैं।
4.  **क्रॉन सेवा की जाँच करें**: सुनिश्चित करें कि क्रॉन सेवा मुख्य एप्लिकेशन के साथ चल रही है। दोनों सेवाओं के लिए लॉग्स की जाँच करें।
5.  **दस्तावेज़ देखें**: अधिक जानकारी के लिए स्थापना गाइड और README देखें।
6.  **समस्याओं की रिपोर्ट**: यदि समस्या बनी रहती है, तो कृपया [duplistatus GitHub रिपॉजिटरी](https://github.com/wsj-br/duplistatus/issues) पर विस्तृत समस्या सबमिट करें।

<br/>

# अतिरिक्त संसाधन {#additional-resources}

- **स्थापना गाइड**: [स्थापना गाइड](../installation/installation.md)
- **डुप्लिकेटी दस्तावेज़**: [docs.duplicati.com](https://docs.duplicati.com)
- **API दस्तावेज़**: [API संदर्भ](../api-reference/overview.md)
- **GitHub रिपॉजिटरी**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **विकास गाइड**: [विकास गाइड](../development/setup.md)
- **डेटाबेस स्कीमा**: [डेटाबेस दस्तावेज़](../development/database)

### समर्थन {#support}
- **GitHub समस्याएँ**: [बग्स रिपोर्ट करें या सुविधाओं का अनुरोध करें](https://github.com/wsj-br/duplistatus/issues)
