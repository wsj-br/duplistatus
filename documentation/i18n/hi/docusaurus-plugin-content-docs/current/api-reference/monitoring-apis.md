# निगरानी और स्वास्थ्य {/* #monitoring--health */}

## स्वास्थ्य जांच - `/api/health` {/* #health-check---apihealth */}
- **एंडपॉइंट**: `/api/health`
- **विधि**: GET
- **विवरण**: एप्लिकेशन और SQLite कनेक्शन के लिए सस्ती लाइवनेस जांच। डॉकर `HEALTHCHECK` और एंट्रीपॉइंट प्रतीक्षा लूप लोकलहोस्ट पर इस URL का उपयोग करते हैं।
- **प्रतिक्रिया** (स्वस्थ):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **प्रतिक्रिया** (कमजोर):

  ```json
  {
    "status": "degraded",
    "database": "unavailable",
    "basicConnection": false,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Database connection test failed",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **त्रुटि प्रतिक्रिया** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **नोट्स**:
  - जब आरंभीकरण पूरा हो जाता है और `SELECT 1` सफल होता है तो 200 लौटाता है
  - जब आरंभीकरण या कनेक्शन जांच विफल होती है तो 503 लौटाता है
  - तालिका नामों को सूचीबद्ध नहीं करता या डैशबोर्ड क्वेरी नहीं चलाता
  - कभी भी एपीआई कुंजी की आवश्यकता नहीं होती
  - जब भी IP अनुमति सूची सक्षम होती है, तो क्लाइंट IP लूपबैक या एडमिन या बाहरी CIDR सूचि पर सूचीबद्ध होना चाहिए (`403` `IP_NOT_ALLOWED` अन्यथा)
  - गैर-लूपबैक क्लाइंट्स को दर सीमित किया गया है (`429` `PROBE_RATE_LIMITED`, 30/मिनट और 120/घंटा)। लूपबैक (`127.0.0.1`, `::1`) को कभी भी धीमा नहीं किया जाता है

## कनेक्टिविटी प्रोब - `/api/ping` {/* #connectivity-probe---apiping */}
- **एंडपॉइंट**: `/api/ping`
- **विधि**: GET
- **विवरण**: छोटा `{ "ok": true }` उत्तर जो डैशबोर्ड कनेक्टिविटी जांच द्वारा उपयोग किया जाता है (हर 30 सेकंड में)।
- **प्रतिक्रिया**:

  ```json
  {
    "ok": true
  }
  ```

- **नोट्स**:
  - कभी भी एपीआई कुंजी या सत्र कुकी की आवश्यकता नहीं होती
  - `/api/health` के समान अनुमति सूचि संघ और लूपबैक नियम
  - गैर-लूपबैक क्लाइंट्स को दर सीमित किया गया है (`429` `PROBE_RATE_LIMITED`, 60/मिनट और 600/घंटा)
