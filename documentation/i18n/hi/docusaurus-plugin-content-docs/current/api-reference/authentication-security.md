# प्रमाणीकरण और सुरक्षा {/* #authentication--security */}

API सत्र-आधारित प्रमाणीकरण और CSRF सुरक्षा का संयोजन डेटाबेस के सभी लेखन परिचालनों में अनधिकृत पहुंच और संभावित सेवा से इनकार हमलों को रोकने के लिए उपयोग करता है। Duplicati और Homepage द्वारा उपयोग किए जाने वाले बाहरी API CSRF-मुक्त रहते हैं। उन्हें वैकल्पिक रूप से एक स्कोप्ड API कुंजी और/या एक IP अनुमति सूची की आवश्यकता हो सकती है (डिफ़ॉल्ट रूप से दोनों बंद हैं)। `/api/upload` में एक विन्यास योग्य शरीर-आकार की सीमा और दर सीमा भी है।

## सत्र-आधारित प्रमाणीकरण {/* #session-based-authentication */}

सुरक्षित एंडपॉइंट को एक मान्य सत्र कुकी और CSRF टोकन की आवश्यकता होती है। सत्र प्रणाली सभी सुरक्षित परिचालनों के लिए सुरक्षित प्रमाणीकरण प्रदान करती है।

### सत्र प्रबंधन {/* #session-management */}
1. **सत्र बनाएं**: एक नया सत्र बनाने के लिए `/api/session` पर POST करें
2. **CSRF टोकन प्राप्त करें**: सत्र के लिए CSRF टोकन प्राप्त करने के लिए `/api/csrf` प्राप्त करें
3. **अनुरोधों में शामिल करें**: सुरक्षित अनुरोधों के साथ सत्र कुकी और CSRF टोकन भेजें
4. **सत्र की वैधता की जांच करें**: जांचें कि सत्र अभी भी मान्य है या नहीं `/api/session` प्राप्त करें
5. **सत्र हटाएं**: लॉगआउट करने और सत्र साफ़ करने के लिए `/api/session` हटाएं

### CSRF सुरक्षा {/* #csrf-protection */}
सभी स्थिति-बदलाव वाले परिचालन को वर्तमान सत्र से मेल खाने वाले एक मान्य CSRF टोकन की आवश्यकता होती है। सुरक्षित एंडपॉइंट के लिए `X-CSRF-Token` हेडर में CSRF टोकन शामिल किया जाना चाहिए।

### सुरक्षित एंडपॉइंट {/* #protected-endpoints */}
डेटाबेस डेटा को संशोधित करने वाले सभी एंडपॉइंट को सत्र प्रमाणीकरण और CSRF टोकन की आवश्यकता होती है:

- **सर्वर प्रबंधन**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **विन्यास प्रबंधन**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **अधिसूचना प्रणाली**: `/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **Cron विन्यास**: `/api/cron-config` (GET, POST)
- **Cron प्रॉक्सी**: `/api/cron/*` (GET, POST) - cron सेवा के लिए अनुरोधों को प्रॉक्सी करता है। POST को एक एडमिनिस्ट्रेटर की आवश्यकता होती है। cron प्रक्रिया डिफ़ॉल्ट रूप से `127.0.0.1` से बाइंड होती है; जब `CRON_SERVICE_SECRET` सेट होता है तो बदलाव वाले cron-सेवा मार्गों को `X-Cron-Service-Secret` की आवश्यकता होती है।
- **सत्र प्रबंधन**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **चार्ट डेटा**: `/api/chart-data/*` (GET)
- **डैशबोर्ड**: `/api/dashboard` (GET)
- **सर्वर विवरण**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **ऑडिट लॉग**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - लेखन परिचालन के लिए एडमिन की आवश्यकता होती है
- **उपयोगकर्ता प्रबंधन**: `/api/users` (GET, POST, PATCH, DELETE) - एडमिन की आवश्यकता होती है
- **डेटाबेस प्रबंधन**: `/api/database/backup` (GET), `/api/database/restore` (POST) - एडमिन की आवश्यकता होती है
- **एप्लिकेशन लॉग**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - एडमिन की आवश्यकता होती है
- **बैकअप संग्रह**: `/api/backups/collect` (POST) - सत्र और CSRF टोकन की आवश्यकता होती है
- **बैकअप अनुसूची सिंक**: `/api/backups/sync-schedule` (POST) - सत्र और CSRF टोकन की आवश्यकता होती है
- **अतिदेय जांच**: `/api/notifications/check-overdue` (POST) - सत्र और CSRF टोकन की आवश्यकता होती है
- **अतिदेय टाइमस्टैम्प साफ़ करें**: `/api/notifications/clear-overdue-timestamps` (POST) - सत्र और CSRF टोकन की आवश्यकता होती है

### बाहरी एंडपॉइंट {/* #external-endpoints */}
ये मार्ग सत्र कुकीज़ या CSRF का उपयोग नहीं करते हैं। प्रमाणीकरण वैकल्पिक है और सेटिंग्स में विन्यस्त किया जाता है:

- `/api/upload` - Duplicati से बैकअप डेटा अपलोड (अपलोड-स्कोप कुंजी, आकार और दर सीमाएं)
- `/api/lastbackup/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/lastbackups/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/summary` - समग्र सारांश डेटा (पढ़ने-स्कोप कुंजी)
- `/api/health` - स्वास्थ्य जांच एंडपॉइंट (कभी नहीं कुंजीबद्ध; सस्ता SQLite प्रोब; प्रति-IP दर सीमा)
- `/api/ping` - कनेक्टिविटी प्रोब (कभी नहीं कुंजीबद्ध; प्रति-IP दर सीमा)

जब **API कुंजियाँ आवश्यक** बंद होता है, तो पहले चार मार्ग कुंजी के साथ या बिना अनुरोध स्वीकार करते हैं: एक मान्य मिलान-स्कोप कुंजी दर्ज की जाती है; एक खराब कुंजी को अनदेखा कर दिया जाता है। जब स्विच चालू होता है, तो वे एक मान्य कुंजी के बिना `401` लौटाते हैं और जब कुंजी स्कोप मेल नहीं खाता है तो `403`। `/api/health` और `/api/ping` कभी भी कुंजियों का उपयोग नहीं करते हैं। [API कुंजियाँ](../user-guide/settings/api-keys-settings.md) और [IP अनुमति सूची](../user-guide/settings/ip-allowlist-settings.md) देखें।

### उपयोग उदाहरण (सत्र + CSRF) {/* #usage-example-session--csrf */}

```typescript
// 1. Create session
const sessionResponse = await fetch('/api/session', { method: 'POST' });
const { sessionId } = await sessionResponse.json();

// 2. Get CSRF token
const csrfResponse = await fetch('/api/csrf', {
  headers: { 'Cookie': `session=${sessionId}` }
});
const { csrfToken } = await csrfResponse.json();

// 3. Make protected request
const response = await fetch('/api/servers/server-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'Cookie': `session=${sessionId}`
  },
  body: JSON.stringify({
    alias: 'Updated Server Name',
    note: 'Updated notes'
  })
});
```

## प्रमाणीकरण एंडपॉइंट {/* #authentication-endpoints */}

### लॉगिन - `/api/auth/login` {/* #login---apiauthlogin */}
- **एंडपॉइंट**: `/api/auth/login`
- **विधि**: POST
- **विवरण**: उपयोगकर्ता की प्रमाणिकता सत्यापित करता है और एक सत्र बनाता है। असफल प्रयासों के बाद खाता लॉक करने और पासवर्ड बदलने की आवश्यकता का समर्थन करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है (लेकिन लॉग इन किए गए उपयोगकर्ता की आवश्यकता नहीं है)
- **अनुरोध शरीर**:

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **प्रतिक्रिया** (सफलता):

  ```json
  {
    "success": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    },
    "keyChanged": false
  }
  ```

- **त्रुटि प्रतिक्रियाएं**: सभी त्रुटि प्रतिक्रियाओं में `error` (अंग्रेजी संदेश) और `errorCode` (क्लाइंट-साइड अनुवाद के लिए स्थिर कोड) शामिल है।
  - `400`: उपयोगकर्ता नाम या पासवर्ड गायब है — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: अमान्य उपयोगकर्ता नाम या पासवर्ड — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: बहुत सारे असफल लॉगिन प्रयासों के कारण खाता लॉक किया गया — `errorCode: "ACCOUNT_LOCKED"` (`lockedUntil`, `minutesRemaining` शामिल है)
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
  - `503`: डेटाबेस तैयार नहीं है — `errorCode: "DATABASE_NOT_READY"`
- **नोट**:
  - 5 असफल लॉगिन प्रयासों के बाद खाता 15 मिनट के लिए लॉक हो जाता है
  - असफल लॉगिन प्रयासों को ट्रैक किया जाता है और लॉग किया जाता है
  - सत्र कुकी को प्रतिक्रिया में स्वचालित रूप से सेट किया जाता है
  - यदि उपयोगकर्ता के पास `mustChangePassword` फ्लैग सेट है, तो उन्हें पासवर्ड बदलने के पृष्ठ पर पुनः निर्देशित किया जाना चाहिए
  - सभी लॉगिन प्रयास (सफल और असफल) को ऑडिट लॉग में लॉग किया जाता है

### लॉगआउट - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **एंडपॉइंट**: `/api/auth/logout`
- **विधि**: POST
- **विवरण**: वर्तमान उपयोगकर्ता को लॉगआउट करता है और उनका सत्र समाप्त करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **प्रतिक्रिया** (सफलता):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल करता है।
  - `400`: कोई सक्रिय सत्र नहीं — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
- **नोट**:
  - सत्र कुकी को प्रतिक्रिया में साफ़ कर दिया जाता है
  - लॉगआउट को ऑडिट लॉग में लॉग किया जाता है
  - सत्र तुरंत अमान्य कर दिया जाता है

### वर्तमान उपयोगकर्ता प्राप्त करें - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **एंडपॉइंट**: `/api/auth/me`
- **विधि**: GET
- **विवरण**: वर्तमान प्रमाणित उपयोगकर्ता की जानकारी लौटाता है, या यह संकेत देता है कि कोई उपयोगकर्ता लॉग इन नहीं है।
- **प्रमाणीकरण**: मान्य सत्र की आवश्यकता होती है (लेकिन लॉग इन किए गए उपयोगकर्ता की आवश्यकता नहीं है)
- **प्रतिक्रिया** (प्रमाणित):

  ```json
  {
    "authenticated": true,
    "user": {
      "id": "user-id",
      "username": "admin",
      "isAdmin": true,
      "mustChangePassword": false
    }
  }
  ```

- **प्रतिक्रिया** (गैर-प्रमाणित):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **त्रुटि प्रतिक्रियाएं**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल करता है।
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
- **नोट**:
  - लॉग इन किए गए उपयोगकर्ता के बिना बुलाया जा सकता है (`authenticated: false` लौटाता है)
  - पृष्ठ लोड पर प्रमाणीकरण स्थिति की जांच करने के लिए उपयोगी

### पासवर्ड बदलें - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **एंडपॉइंट**: `/api/auth/change-password`
- **विधि**: POST
- **विवरण**: वर्तमान प्रमाणित उपयोगकर्ता के लिए पासवर्ड बदलता है। यदि `mustChangePassword` सेट है, तो वर्तमान पासवर्ड सत्यापन छोड़ दिया जाता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है (लॉग इन किए गए उपयोगकर्ता की आवश्यकता है)
- **अनुरोध शरीर**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: वैकल्पिक यदि `mustChangePassword` सत्य है, अन्यथा आवश्यक
  - `newPassword`: आवश्यक, पासवर्ड नीति आवश्यकताओं को पूरा करना चाहिए
- **प्रतिक्रिया** (सफलता):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल करता है। नीति के उल्लंघन में `validationErrors` (स्ट्रिंग की सरणी) शामिल हो सकता है।
  - `400`: नया पासवर्ड गायब है — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: पासवर्ड नीति उल्लंघन — `errorCode: "POLICY_NOT_MET"` (`validationErrors` शामिल हो सकता है)
  - `400`: नया पासवर्ड वर्तमान के समान है — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: वर्तमान पासवर्ड गलत है — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: उपयोगकर्ता नहीं मिला — `errorCode: "USER_NOT_FOUND"`
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
- **नोट**:
  - नया पासवर्ड पासवर्ड नीति आवश्यकताओं को पूरा करना चाहिए (लंबाई, जटिलता, आदि)
  - यदि `mustChangePassword` फ्लैग सेट है, तो वर्तमान पासवर्ड सत्यापन छोड़ दिया जाता है
  - सफल पासवर्ड परिवर्तन के बाद, `mustChangePassword` फ्लैग साफ़ कर दिया जाता है
  - पासवर्ड परिवर्तन को ऑडिट लॉग में लॉग किया जाता है
  - नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए

### एडमिन पासवर्ड बदलना चाहिए जांचें - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **एंडपॉइंट**: `/api/auth/admin-must-change-password`
- **विधि**: GET
- **विवरण**: जांचता है कि क्या व्यवस्थापक उपयोगकर्ता को अपना पासवर्ड बदलना चाहिए। यह एंडपॉइंट सार्वजनिक है (प्रमाणीकरण की आवश्यकता नहीं है) क्योंकि यह केवल एक बूलियन फ्लैग लौटाता है।
- **प्रतिक्रिया**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `500`: आंतरिक सर्वर त्रुटि (त्रुटि पर `mustChangePassword: false` लौटाता है यदि कोई डेटाबेस समस्या हो तो यह टिप दिखाने से बचने के लिए)
- **नोट्स**:
  - सार्वजनिक एंडपॉइंट, कोई प्रमाणीकरण आवश्यक नहीं
  - वापस लौटता है `false` यदि व्यवस्थापक उपयोगकर्ता मौजूद नहीं है
  - निर्धारित करने के लिए उपयोग किया जाता है कि क्या पासवर्ड परिवर्तन टिप दिखाई जानी चाहिए
  - त्रुटि पर, वापस लौटता है `false` यदि कोई डेटाबेस समस्या हो तो यह टिप दिखाने से बचने के लिए

### पासवर्ड नीति प्राप्त करें - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **एंडपॉइंट**: `/api/auth/password-policy`
- **विधि**: GET
- **विवरण**: वर्तमान पासवर्ड नीति कॉन्फ़िगरेशन लौटाता है। यह एंडपॉइंट सार्वजनिक है (कोई प्रमाणीकरण आवश्यक नहीं) क्योंकि यह फ्रंटएंड सत्यापन के लिए आवश्यक है।
- **प्रतिक्रिया**:

  ```json
  {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": false
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल करें।
  - `500`: पासवर्ड नीति पुनर्प्राप्त करने में विफल — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **नोट्स**:
  - सार्वजनिक एंडपॉइंट, कोई प्रमाणीकरण आवश्यक नहीं
  - फ्रंटएंड घटकों द्वारा पासवर्ड आवश्यकताओं को प्रदर्शित करने और प्रस्तुति से पहले पासवर्ड को सत्यापित करने के लिए उपयोग किया जाता है
  - नीति को वातावरण चर (`PWD_ENFORCE`, `PWD_MIN_LEN`) के माध्यम से कॉन्फ़िगर किया जाता है
  - डिफ़ॉल्ट व्यवस्थापक पासवर्ड के उपयोग को रोकना (नीति सेटिंग्स की परवाह किए बिना) हमेशा लागू किया जाता है

### Auth API त्रुटि और सफलता कोड (i18n) {/* #auth-api-error-and-success-codes-i18n */}

Auth एंडपॉइंट एक स्थिर `errorCode` (और, सफलता पर, `successCode`) के साथ-साथ मानव-पठनीय `error` या `message` फ़ील्ड भी लौटाते हैं। `error` और `message` मान अंग्रेजी में हैं। क्लाइंट को UI में संदेशों को उपयोगकर्ता की चुनी हुई भाषा में प्रदर्शित करने के लिए स्थानीयकृत स्ट्रिंग खोजने के लिए कोड का उपयोग करना चाहिए।

| एंडपॉइंट | सफलता कोड | त्रुटि कोड |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### त्रुटि प्रतिक्रियाएँ {/* #error-responses */}
- `401 Unauthorized`: अमान्य या गुम सत्र, समाप्त सत्र, या CSRF टोकन सत्यापन विफल
- `403 Forbidden`: CSRF टोकन सत्यापन विफल या ऑपरेशन की अनुमति नहीं है

:::caution
 **duplistatus** सर्वर को सार्वजनिक इंटरनेट पर प्रकाशित न करें। इसका उपयोग एक सुरक्षित नेटवर्क में करें
(जैसे, फ़ायरवॉल द्वारा सुरक्षित स्थानीय LAN)।

**duplistatus** इंटरफ़ेस को सार्वजनिक इंटरनेट पर उचित सुरक्षा उपायों के बिना प्रकाशित करने से अनधिकृत पहुंच हो सकती है।
:::
