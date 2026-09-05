# क्रॉन सेवा {#cron-service}

ऐप्लिकेशन में अनुसूचित कार्यों को संभालने के लिए एक अलग क्रॉन सेवा शामिल है:

## विकास मोड में क्रॉन सेवा शुरू करें {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## उत्पादन मोड में क्रॉन सेवा शुरू करें {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## स्थानीय रूप से क्रॉन सेवा शुरू करें (टेस्टिंग के लिए) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

क्रॉन सेवा एक अलग पोर्ट पर चलती है (विकास में 8667, उत्पादन में 9667) और अनुसूचित कार्य जैसे विलंबित बैकअप सूचनाएं संभालती है। पोर्ट को `CRON_PORT` पर्यावरण चर का उपयोग करके कॉन्फ़िगर किया जा सकता है।

क्रॉन सेवा में शामिल हैं:
- **स्वास्थ्य जांच एंडपॉइंट**: `/health` - सेवा स्थिति और सक्रिय कार्य लौटाता है
- **मैनुअल कार्य ट्रिगरिंग**: `POST /trigger/:taskName` - अनुसूचित कार्य मैन्युअल रूप से चलाएं
- **कार्य प्रबंधन**: `POST /start/:taskName` और `POST /stop/:taskName` - व्यक्तिगत कार्यों को नियंत्रित करें
- **कॉन्फ़िगरेशन रीलोड**: `POST /reload-config` - डेटाबेस से कॉन्फ़िगरेशन पुनः लोड करें
- **स्वचालित पुनरारंभ**: सेवा क्रैश होने पर स्वचालित रूप से पुनरारंभ होती है (डॉकर डिप्लॉयमेंट में `docker-entrypoint.sh` द्वारा प्रबंधित)
- **वॉच मोड**: विकास मोड में कोड परिवर्तनों पर स्वचालित पुनरारंभ के लिए फ़ाइल वॉचिंग शामिल है
- **विलंबित बैकअप मॉनिटरिंग**: विलंबित बैकअप की स्वचालित जांच और सूचना (डिफ़ॉल्ट रूप से हर 5 मिनट में चलती है)
- **Audit log cleanup**: Automated cleanup of old audit log entries (runs daily at 2 AM UTC)
- **Duplicati version refresh**: Updates cached latest Duplicati channel versions from GitHub Releases. The default is daily at 3 AM UTC; administrators can change the interval and start time in [Settings → Duplicati Versions](../user-guide/settings/duplicati-versions.md).
- **Flexible scheduling**: Configurable cron expressions for different tasks
- **Database integration**: Shares the same SQLite database with the main application
- **RESTful API**: Complete API for service management and monitoring
