# निगरानी और स्वास्थ्य {/* #monitoring--health */}

## स्वास्थ्य जाँच - `/api/health` {/* #health-check---apihealth */}
- **एंडपॉइंट**: `/api/health`
- **विधि**: GET
- **विवरण**: एप्लिकेशन और SQLite कनेक्शन के लिए सस्ता जीवितता जाँच। Docker `HEALTHCHECK` और एंट्रीपॉइंट वेट लूप इस URL का उपयोग localhost पर करते हैं।
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

- **प्रतिक्रिया** (ह्रासपत्र):

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
  - जब प्रारंभ पूरा हो जाता है और `SELECT 1` सफल होता है, तो 200 लौटाता है
  - जब प्रारंभ या कनेक्शन जाँच विफल होती है, तो 503 लौटाता है
  - टेबल नामों की सूची नहीं बनाता और डैशबोर्ड क्वेरी नहीं चलाता
  - कभी भी एपीआई कुंजी की आवश्यकता नहीं होती
  - जब कोई भी आईपी अनुमति सूची सक्षम की जाती है, तो क्लाइंट आईपी लूपबैक होनी चाहिए या प्रशासक या बाहरी CIDR सूची पर सूचीबद्ध होनी चाहिए (`403` `IP_NOT_ALLOWED` अन्यथा)
  - गैर-लूपबैक क्लाइंट को रेट लिमिट किया जाता है (`429` `PROBE_RATE_LIMITED`, प्रति मिनट 30 और प्रति घंटा 120)। लूपबैक (`127.0.0.1`, `::1`) कभी थ्रॉटल नहीं किया जाता

## कनेक्टिविटी प्रोब - `/api/ping` {/* #connectivity-probe---apiping */}
- **एंडपॉइंट**: `/api/ping`
- **विधि**: GET
- **विवरण**: डैशबोर्ड कनेक्टिविटी जाँच के लिए छोटा `{ "ok": true }` उत्तर (हर 30 सेकंड)।
- **Response**:

  ```json
  {
    "ok": true
  }
  ```

- **नोट्स**:
  - कभी भी एपीआई कुंजी या सेशन कुकी की आवश्यकता नहीं होती
  - `/api/health` के समान अनुमति सूची संघ और लूपबैक नियम
  - गैर-लूपबैक क्लाइंट को रेट लिमिट किया जाता है (`429` `PROBE_RATE_LIMITED`, प्रति मिनट 60 और प्रति घंटा 600)
