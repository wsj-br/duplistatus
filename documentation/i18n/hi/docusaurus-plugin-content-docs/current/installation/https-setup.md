# HTTPS Setup (Optional) {#https-setup-optional}

उत्पादन परिनियोजन के लिए, **duplistatus** को एक रिवर्स प्रॉक्सी का उपयोग करके HTTPS पर सर्व करें। यह अनुभाग लोकप्रिय रिवर्स प्रॉक्सी समाधानों के लिए कॉन्फ़िगरेशन उदाहरण प्रदान करता है।

### विकल्प 1: Nginx with Certbot (Let's Encrypt) {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) एक लोकप्रिय वेब सर्वर है जो एक रिवर्स प्रॉक्सी के रूप में कार्य कर सकता है, और [Certbot](https://certbot.eff.org/) Let's Encrypt से मुफ्त SSL प्रमाणपत्र प्रदान करता है।

**पूर्वशर्तें:**

- आपके सर्वर को इंगित करने वाला डोमेन नाम
- आपके सिस्टम पर Nginx स्थापित
- आपके ऑपरेटिंग सिस्टम के लिए Certbot स्थापित

**चरण 1: Nginx और Certbot स्थापित करें**

उबंटू/डेबियन के लिए:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**चरण 2: Nginx कॉन्फ़िगरेशन बनाएं**

`/etc/nginx/sites-available/duplistatus` बनाएं:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**चरण 3: साइट सक्षम करें और SSL प्रमाणपत्र प्राप्त करें**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot स्वचालित रूप से आपके Nginx कॉन्फ़िगरेशन को अपडेट करेगा ताकि SSL सेटिंग्स शामिल हों और HTTP को HTTPS पर रीडायरेक्ट करें।

**प्रलेखन:**

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/instructions)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### विकल्प 2: Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) एक आधुनिक वेब सर्वर है जो स्वचालित HTTPS के साथ SSL प्रमाणपत्र प्रबंधन को सरल बनाता है।

**पूर्वशर्तें:**

- आपके सर्वर को इंगित करने वाला डोमेन नाम
- आपके सिस्टम पर Caddy स्थापित

**चरण 1: Caddy स्थापित करें**

अपने ऑपरेटिंग सिस्टम के लिए [अधिकृत स्थापना गाइड](https://caddyserver.com/docs/install) का पालन करें।

**चरण 2: Caddyfile बनाएँ**

निम्नलिखित सामग्री के साथ एक `Caddyfile` बनाएँ:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**चरण 3: Caddy चलाएँ**

```bash
sudo caddy run --config Caddyfile
```

या इसे एक प्रणाली सेवा के रूप में उपयोग करें:

```bash
sudo caddy start --config Caddyfile
```

Caddy स्वचालित रूप से Let's Encrypt से SSL प्रमाणपत्र प्राप्त और प्रबंधित करेगा।

**प्रलेखन:**

- [Caddy प्रलेखन](https://caddyserver.com/docs/)
- [Caddy रिवर्स प्रॉक्सी गाइड](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

सार्वजनिक इंटरनेट पर पोर्ट 9666 को उजागर न करें। एप्लिकेशन को लोकलहोस्ट (या एक निजी नेटवर्क) पर बाइंड करें और रिवर्स प्रॉक्सी को ही सार्वजनिक लिस्टनर बनाएं।

जब [आईपी अलोवेलिस्ट](../user-guide/settings/ip-allowlist-settings.md) सक्रिय हैं, तो इस प्रॉक्सी को **विश्वसनीय प्रॉक्सी** में सूचीबद्ध करें (या `IP_TRUSTED_PROXIES`)। एप्लिकेशन केवल `X-Forwarded-For` / `X-Real-IP` को मान्य करता है जब TCP पीयर एक विश्वसनीय प्रॉक्सी है। **ओवरराइट** करें `$remote_addr` के साथ। `$proxy_add_x_forwarded_for` का उपयोग न करें, जो ऐपेंड करता है और एक क्लाइंट को पहला हॉप छुपाने देता है।

### महत्वपूर्ण नोट्स {#important-notes}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[महत्वपूर्ण]
HTTPS सेटअप के बाद, अपने डुप्लिकेट सर्वर कॉन्फ़िगरेशन को HTTPS URL का उपयोग करने के लिए अपडेट करना न भूलें:


डुप्लिकेट 2.0.9.106 से पुराने में, `--send-http-url=https://your-domain.com/api/upload` के साथ `--send-http-result-output-format=Json` का उपयोग करें। [डुप्लिकेट सर्वर कॉन्फ़िगरेशन](duplicati-server-configuration.md) देखें।
:::

:::tip

- `your-domain.com` को अपने वास्तविक डोमेन नाम से बदलें
- सुनिश्चित करें कि आपके डोमेन के DNS A रिकॉर्ड आपके सर्वर के IP पते को इंगित करते हैं
- दोनों समाधान स्वचालित रूप से SSL प्रमाणपत्रों को नवीनीकृत करेंगे
- एक फायरवॉल सेटअप करने पर विचार करें जो केवल HTTP/HTTPS ट्रैफिक को अनुमति देता है
:::
