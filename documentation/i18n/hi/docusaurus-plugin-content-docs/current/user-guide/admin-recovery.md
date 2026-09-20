# एडमिन खाता पुनर्प्राप्ति {/* #admin-account-recovery */}

जब आप अपना **duplistatus** पासवर्ड खो देते हैं या अपने खाते से लॉक हो जाते हैं, तो एडमिनिस्ट्रेटर एक्सेस पुनर्प्राप्त करें। यह गाइड डॉकर वातावरण में एडमिन रिकवरी स्क्रिप्ट का उपयोग करने को कवर करती है।

यदि ब्राउज़र लॉगिन फॉर्म से पहले **Access denied** (HTTP 403) दिखाता है, तो [एडमिन IP अनुमति सूची](settings/ip-allowlist-settings.md) अनुरोध को ब्लॉक कर रही है। इस स्क्रिप्ट के बजाय [IP अनुमति सूची द्वारा लॉक किया गया](troubleshooting.md#locked-out-by-ip-allowlist) का उपयोग करें।

## डॉकर में स्क्रिप्ट का उपयोग करना {/* #using-the-script-in-docker */}

Dockerfile में `scripts` निर्देशिका और एक सुविधाजनक शेल रैपर शामिल है।

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**उदाहरण:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## समस्या निवारण {/* #troubleshooting */}

यदि आप रिकवरी स्क्रिप्ट के साथ समस्याओं का सामना करते हैं:

1. **कंटेनर चल रहा है यह सत्यापित करें**: जांचें कि कंटेनर `docker ps` के साथ चल रहा है
2. **स्क्रिप्ट उपलब्धता जांचें**: जांचें कि स्क्रिप्ट कंटेनर में `docker exec -it duplistatus ls -la /app/admin-recovery` के साथ मौजूद है
3. **कंटेनर लॉग की समीक्षा करें**: `docker logs duplistatus` के साथ त्रुटियों की जांच करें
4. **उपयोगकर्ता नाम सत्यापित करें**: सुनिश्चित करें कि उपयोगकर्ता नाम डेटाबेस में मौजूद है
5. **पासवर्ड प्रारूप जांचें**: सुनिश्चित करें कि नया पासवर्ड सभी आवश्यकताओं को पूरा करता है

यदि समस्याएँ बनी रहती हैं, तो अधिक सहायता के लिए [समस्या निवारण](troubleshooting.md) गाइड देखें।
