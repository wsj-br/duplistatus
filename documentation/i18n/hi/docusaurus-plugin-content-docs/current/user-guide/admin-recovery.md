# एडमिन खाता पुनर्प्राप्ति {/* #admin-account-recovery */}

जब आप अपना पासवर्ड भूल गए हों या अपने खाते से लॉक हो गए हों, तो **duplistatus** का एडमिनिस्ट्रेटर एक्सेस पुनर्प्राप्त करें। इस गाइड में Docker परिवेशों में एडमिन रिकवरी स्क्रिप्ट का उपयोग करने के बारे में बताया गया है।

यदि ब्राउज़र लॉगिन फ़ॉर्म से पहले **Access denied** (HTTP 403) दिखाता है, तो [एडमिन IP अनुमति सूची](settings/ip-allowlist-settings.md) अनुरोध को ब्लॉक कर रही है। इस स्क्रिप्ट के बजाय [IP अनुमति सूची द्वारा लॉक किया गया](troubleshooting.md#locked-out-by-ip-allowlist) का उपयोग करें।

## Docker में स्क्रिप्ट का उपयोग करना {/* #using-the-script-in-docker */}

Dockerfile में `scripts` डायरेक्टरी और एक सुविधाजनक शेल रैपर शामिल है।

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**उदाहरण:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## समस्या निवारण {/* #troubleshooting */}

यदि आपको रिकवरी स्क्रिप्ट के साथ समस्याओं का सामना करना पड़ता है:

1. **सत्यापित करें कि कंटेनर चल रहा है**: जांचें कि कंटेनर `docker ps` के साथ चल रहा है
2. **स्क्रिप्ट की उपलब्धता जांचें**: `docker exec -it duplistatus ls -la /app/admin-recovery` के साथ सत्यापित करें कि स्क्रिप्ट कंटेनर में मौजूद है
3. **कंटेनर लॉग की समीक्षा करें**: `docker logs duplistatus` के साथ त्रुटियाँ जांचें
4. **उपयोगकर्ता नाम सत्यापित करें**: सुनिश्चित करें कि उपयोगकर्ता नाम डेटाबेस में मौजूद है
5. **पासवर्ड फ़ॉर्मैट जांचें**: सुनिश्चित करें कि नया पासवर्ड सभी आवश्यकताओं को पूरा करता है

यदि समस्याएँ बनी रहती हैं, तो अधिक सहायता के लिए [समस्या निवारण](troubleshooting.md) गाइड देखें।
