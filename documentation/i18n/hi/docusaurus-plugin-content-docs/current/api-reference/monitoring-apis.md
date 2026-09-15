# निगरानी और स्वास्थ्य {/* #monitoring--health */}

## स्वास्थ्य जांचें - `/api/health` {/* #health-check---apihealth */}
- **Endpoint**: `/api/health`
- **Method**: GET
- **विवरण**: एप्लिकेशन और SQLite कनेक्शन के लिए कम लागत वाली जीवंतता (liveness) जांच। Docker `HEALTHCHECK` और एंट्रीपॉइंट वेट लूप लोकलहोस्ट पर इस URL का उपयोग करते हैं।
- **Response** (स्वस्थ):

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

- **Response** (निम्न स्तर/degraded):

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

- **त्रुटि Response** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **Notes**:
  - इनिशियलाइज़ेशन पूरा होने और `SELECT 1` के सफल होने पर 200 लौटाता है
  - इनिशियलाइज़ेशन या कनेक्शन जांच विफल होने पर 503 लौटाता है
  - टेबल के नामों को सूचीबद्ध नहीं करता है और न ही डैशबोर्ड क्वेरी चलाता है
  - API कुंजी की कभी नहीं आवश्यकता होती है
  - जब कोई भी IP अनुमति सूची सक्षम होती है, तो क्लाइंट IP लूपबैक होना चाहिए या एडमिन या बाहरी CIDR सूची में सूचीबद्ध होना चाहिए (अन्यथा `403` `IP_NOT_ALLOWED`)
  - गैर-लूपबैक क्लाइंट्स पर दर सीमा लागू होती है (`429` `PROBE_RATE_LIMITED`, 30/मिनट और 120/घंटा)। लूपबैक (`127.0.0.1`, `::1`) को कभी थ्रॉटल नहीं किया जाता है

## कनेक्टिविटी प्रोब - `/api/ping` {/* #connectivity-probe---apiping */}
- **Endpoint**: `/api/ping`
- **Method**: GET
- **विवरण**: डैशबोर्ड कनेक्टिविटी जांच (प्रत्येक 30 सेकंड) द्वारा उपयोग किया जाने वाला संक्षिप्त `{ "ok": true }` उत्तर।
- **प्रतिक्रिया**:

  ```json
  {
    "ok": true
  }
  ```

- **Notes**:
  - API कुंजी या सत्र कुकी की कभी नहीं आवश्यकता होती है
  - `/api/health` के समान अनुमति सूची संयोजन और लूपबैक नियम
  - गैर-लूपबैक क्लाइंट्स पर दर सीमा लागू होती है (`429` `PROBE_RATE_LIMITED`, 60/मिनट और 600/घंटा)
