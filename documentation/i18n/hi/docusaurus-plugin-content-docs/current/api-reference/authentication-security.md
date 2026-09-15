# प्रमाणीकरण और सुरक्षा {/* #authentication--security */}

API सभी डेटाबेस लेखन संचालन के लिए सत्र-आधारित प्रमाणीकरण और CSRF सुरक्षा के संयोजन का उपयोग करता है ताकि अनधिकृत पहुंच और संभावित सेवा-से-इनकार हमलों को रोका जा सके। Duplicati और Homepage द्वारा उपयोग किए जाने वाले बाहरी API CSRF-मुक्त रहते हैं। वे वैकल्पिक रूप से एक स्कोप की गई API कुंजी और/या एक IP अनुमति सूची की आवश्यकता कर सकते हैं (दोनों डिफ़ॉल्ट रूप से बंद हैं)। `/api/upload` में एक कॉन्फ़िगर करने योग्य बॉडी-आकार सीमा और दर सीमा भी है।

## सत्र-आधारित प्रमाणीकरण {/* #session-based-authentication */}

संरक्षित एंडपॉइंट्स को एक वैध सत्र कुकी और CSRF टोकन की आवश्यकता है। सत्र प्रणाली सभी संरक्षित संचालन के लिए सुरक्षित प्रमाणीकरण प्रदान करती है।

### सत्र प्रबंधन {/* #session-management */}
1. **सत्र बनाएं**: एक नया सत्र बनाने के लिए `/api/session` को POST करें
2. **CSRF टोकन प्राप्त करें**: सत्र के लिए CSRF टोकन प्राप्त करने के लिए `/api/csrf` को GET करें
3. **अनुरोधों में शामिल करें**: संरक्षित अनुरोधों के साथ सत्र कुकी और CSRF टोकन भेजें
4. **सत्र को मान्य करें**: यह जांचने के लिए `/api/session` को GET करें कि सत्र अभी भी वैध है
5. **सत्र हटाएं**: लॉगआउट करने और सत्र को साफ़ करने के लिए `/api/session` को DELETE करें

### CSRF सुरक्षा {/* #csrf-protection */}
सभी स्थिति-परिवर्तनशील संचालन के लिए एक वैध CSRF टोकन की आवश्यकता है जो वर्तमान सत्र से मेल खाता है। CSRF टोकन को संरक्षित एंडपॉइंट्स के लिए `X-CSRF-Token` हेडर में शामिल किया जाना चाहिए।

### संरक्षित एंडपॉइंट्स {/* #protected-endpoints */}
सभी एंडपॉइंट्स जो डेटाबेस डेटा को संशोधित करते हैं, सत्र प्रमाणीकरण और CSRF टोकन की आवश्यकता है:

- **सर्वर प्रबंधन**: `/api/servers/:id` (PATCH, DELETE), `/api/servers/:id/server-url` (PATCH), `/api/servers/:id/password` (PATCH, GET)
- **कॉन्फ़िगरेशन प्रबंधन**: `/api/configuration/email` (GET, POST, DELETE), `/api/configuration/unified` (GET), `/api/configuration/ntfy` (GET), `/api/configuration/notifications` (GET, POST), `/api/configuration/backup-settings` (POST), `/api/configuration/templates` (POST), `/api/configuration/overdue-tolerance` (GET, POST), `/api/configuration/daily-summary` (GET, POST), `/api/configuration/daily-summary/send` (POST), `/api/configuration/daily-summary/retry` (POST), `/api/configuration/daily-summary/preview` (POST)
- **सूचना प्रणाली**: `/api/notifications/test` (POST), `/api/notifications/preview` (POST)
- **Cron कॉन्फ़िगरेशन**: `/api/cron-config` (GET, POST)
- **Cron प्रॉक्सी**: `/api/cron/*` (GET, POST) - cron सेवा को अनुरोध प्रॉक्सी करता है। POST के लिए एक प्रशासक की आवश्यकता है। cron प्रक्रिया डिफ़ॉल्ट रूप से `127.0.0.1` से जुड़ी होती है; cron-सेवा मार्गों को परिवर्तित करने के लिए `CRON_SERVICE_SECRET` सेट होने पर `X-Cron-Service-Secret` की आवश्यकता होती है।
- **सत्र प्रबंधन**: `/api/session` (POST, GET, DELETE), `/api/csrf` (GET)
- **चार्ट डेटा**: `/api/chart-data/*` (GET)
- **डैशबोर्ड**: `/api/dashboard` (GET)
- **सर्वर विवरण**: `/api/servers` (GET), `/api/servers/:id` (GET), `/api/detail/:serverId` (GET)
- **ऑडिट लॉग**: `/api/audit-log` (GET), `/api/audit-log/download` (GET), `/api/audit-log/filters` (GET), `/api/audit-log/retention` (PATCH), `/api/audit-log/cleanup` (POST) - लेखन संचालन के लिए एडमिन आवश्यक है
- **उपयोगकर्ता प्रबंधन**: `/api/users` (GET, POST, PATCH, DELETE) - एडमिन आवश्यक है
- **डेटाबेस प्रबंधन**: `/api/database/backup` (GET), `/api/database/restore` (POST) - एडमिन आवश्यक है
- **एप्लिकेशन लॉग**: `/api/application-logs` (GET), `/api/application-logs/export` (GET) - एडमिन आवश्यक है
- **बैकअप संग्रह**: `/api/backups/collect` (POST) - सत्र और CSRF टोकन की आवश्यकता है
- **बैकअप शेड्यूल सिंक**: `/api/backups/sync-schedule` (POST) - सत्र और CSRF टोकन की आवश्यकता है
- **अतिदेय जांचें**: `/api/notifications/check-overdue` (POST) - सत्र और CSRF टोकन की आवश्यकता है
- **अतिदेय टाइमस्टैम्प साफ़ करें**: `/api/notifications/clear-overdue-timestamps` (POST) - सत्र और CSRF टोकन की आवश्यकता है

### बाहरी एंडपॉइंट्स {/* #external-endpoints */}
ये मार्ग सत्र कुकी या CSRF का उपयोग नहीं करते हैं। प्रमाणीकरण वैकल्पिक है और सेटिंग्स में कॉन्फ़िगर किया गया है:

- `/api/upload` - Duplicati से बैकअप डेटा अपलोड (अपलोड-स्कोप कुंजी, आकार और दर सीमाएं)
- `/api/lastbackup/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/lastbackups/:serverId` - नवीनतम बैकअप स्थिति (पढ़ने-स्कोप कुंजी)
- `/api/summary` - समग्र सारांश डेटा (पढ़ने-स्कोप कुंजी)
- `/api/health` - स्वास्थ्य जांच एंडपॉइंट (कभी नहीं कुंजीयुक्त; सस्ता SQLite जांच; प्रति-IP दर सीमा)
- `/api/ping` - कनेक्टिविटी जांच (कभी नहीं कुंजीयुक्त; प्रति-IP दर सीमा)

जब **API कुंजियों की आवश्यकता है** बंद है, तो पहले चार मार्ग कुंजी के साथ या बिना अनुरोध स्वीकार करते हैं: एक वैध मिलान-स्कोप कुंजी दर्ज की जाती है; एक खराब कुंजी को अनदेखा किया जाता है। जब स्विच चालू है, तो वे एक वैध कुंजी के बिना `401` लौटाते हैं और जब कुंजी स्कोप मेल नहीं खाता है तो `403` लौटाते हैं। `/api/health` और `/api/ping` कभी भी कुंजियों का उपयोग नहीं करते हैं। [API कुंजियाँ](../user-guide/settings/api-keys-settings.md) और [IP अनुमति सूची](../user-guide/settings/ip-allowlist-settings.md) देखें।

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

## प्रमाणीकरण एंडपॉइंट्स {/* #authentication-endpoints */}

### लॉगिन - `/api/auth/login` {/* #login---apiauthlogin */}
- **एंडपॉइंट**: `/api/auth/login`
- **मेथड**: POST
- **विवरण**: उपयोगकर्ता को प्रमाणित करता है और एक सत्र बनाता है। असफल प्रयासों के बाद खाता लॉक करने और पासवर्ड बदलने की आवश्यकताओं का समर्थन करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है (लेकिन किसी लॉग-इन उपयोगकर्ता की नहीं)
- **रिक्वेस्ट बॉडी**:

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

- **त्रुटि प्रतिक्रियाएँ**: सभी त्रुटि प्रतिक्रियाओं में `error` (अंग्रेज़ी संदेश) और `errorCode` (क्लाइंट-साइड अनुवाद के लिए स्थिर कोड) शामिल हैं।
  - `400`: अनुपलब्ध उपयोगकर्ता नाम या पासवर्ड — `errorCode: "REQUIRED_CREDENTIALS"`
  - `401`: अमान्य उपयोगकर्ता नाम या पासवर्ड — `errorCode: "INVALID_CREDENTIALS"`
  - `403`: अत्यधिक असफल लॉगिन प्रयासों के कारण खाता लॉक किया गया — `errorCode: "ACCOUNT_LOCKED"` (`lockedUntil`, `minutesRemaining` शामिल हैं)
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
  - `503`: डेटाबेस तैयार नहीं है — `errorCode: "DATABASE_NOT_READY"`
- **नोट्स**:
  - 5 असफल लॉगिन प्रयासों के बाद खाता 15 मिनट के लिए लॉक किया जाता है
  - असफल लॉगिन प्रयासों को ट्रैक और लॉग किया जाता है
  - सत्र कुकी प्रतिक्रिया में स्वचालित रूप से सेट हो जाती है
  - यदि उपयोगकर्ता का `mustChangePassword` फ़्लैग सेट है, तो उन्हें पासवर्ड बदलें पृष्ठ पर पुनर्निर्देशित किया जाना चाहिए
  - सभी लॉगिन प्रयास (सफल और असफल) ऑडिट लॉग में लॉग किए जाते हैं

### लॉगआउट - `/api/auth/logout` {/* #logout---apiauthlogout */}
- **एंडपॉइंट**: `/api/auth/logout`
- **मेथड**: POST
- **विवरण**: वर्तमान उपयोगकर्ता को लॉगआउट करता है और उनके सत्र को समाप्त करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **प्रतिक्रिया** (सफलता):

  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "successCode": "LOGGED_OUT"
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल हैं।
  - `400`: कोई सक्रिय सत्र नहीं है — `errorCode: "NO_ACTIVE_SESSION"`
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
- **नोट्स**:
  - सत्र कुकी प्रतिक्रिया में साफ़ कर दी जाती है
  - लॉगआउट को ऑडिट लॉग में दर्ज किया जाता है
  - सत्र तुरंत अमान्य कर दिया जाता है

### वर्तमान उपयोगकर्ता प्राप्त करें - `/api/auth/me` {/* #get-current-user---apiauthme */}
- **एंडपॉइंट**: `/api/auth/me`
- **मेथड**: GET
- **विवरण**: वर्तमान प्रमाणित उपयोगकर्ता की जानकारी लौटाता है, या इंगित करता है कि कोई उपयोगकर्ता लॉग इन नहीं है।
- **प्रमाणीकरण**: मान्य सत्र की आवश्यकता होती है (लेकिन किसी लॉग-इन उपयोगकर्ता की आवश्यकता नहीं है)
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

- **प्रतिक्रिया** (प्रमाणित नहीं):

  ```json
  {
    "authenticated": false,
    "user": null
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल हैं।
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
- **नोट्स**:
  - लॉग-इन उपयोगकर्ता के बिना भी कॉल किया जा सकता है (`authenticated: false` लौटाता है)
  - पृष्ठ लोड होने पर प्रमाणीकरण स्थिति की जाँच करने के लिए उपयोगी

### पासवर्ड बदलें - `/api/auth/change-password` {/* #change-password---apiauthchange-password */}
- **एंडपॉइंट**: `/api/auth/change-password`
- **मेथड**: POST
- **विवरण**: वर्तमान प्रमाणित उपयोगकर्ता का पासवर्ड बदलता है। यदि `mustChangePassword` सेट है, तो वर्तमान पासवर्ड सत्यापन छोड़ दिया जाता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है (लॉग-इन उपयोगकर्ता आवश्यक)
- **रिक्वेस्ट बॉडी**:

  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-secure-password"
  }
  ```

- `currentPassword`: यदि `mustChangePassword` सत्य है तो वैकल्पिक, अन्यथा आवश्यक
  - `newPassword`: आवश्यक, पासवर्ड नीति आवश्यकताओं को पूरा करना चाहिए
- **प्रतिक्रिया** (सफलता):

  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "successCode": "PASSWORD_CHANGED"
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल हैं। नीति उल्लंघन में `validationErrors` (स्ट्रिंग्स का ऐरे) शामिल हो सकता है।
  - `400`: नया पासवर्ड अनुपलब्ध है — `errorCode: "NEW_PASSWORD_REQUIRED"`
  - `400`: पासवर्ड नीति का उल्लंघन — `errorCode: "POLICY_NOT_MET"` (`validationErrors` शामिल हो सकता है)
  - `400`: नया पासवर्ड वर्तमान के समान है — `errorCode: "NEW_PASSWORD_SAME_AS_CURRENT"`
  - `401`: वर्तमान पासवर्ड गलत है — `errorCode: "CURRENT_PASSWORD_INCORRECT"`
  - `404`: उपयोगकर्ता नहीं मिला — `errorCode: "USER_NOT_FOUND"`
  - `500`: आंतरिक सर्वर त्रुटि — `errorCode: "INTERNAL_ERROR"`
- **नोट्स**:
  - नया पासवर्ड पासवर्ड नीति आवश्यकताओं को पूरा करना चाहिए (लंबाई, जटिलता, आदि)
  - यदि `mustChangePassword` फ़्लैग सेट है, तो वर्तमान पासवर्ड सत्यापन छोड़ दिया जाता है
  - सफल पासवर्ड परिवर्तन के बाद, `mustChangePassword` फ़्लैग साफ़ किया जाता है
  - पासवर्ड परिवर्तन ऑडिट लॉग में दर्ज किए जाते हैं
  - नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए

### व्यवस्थापक उपयोगकर्ता पासवर्ड परिवर्तन जांचें - `/api/auth/admin-must-change-password` {/* #check-admin-must-change-password---apiauthadmin-must-change-password */}
- **एंडपॉइंट**: `/api/auth/admin-must-change-password`
- **विधि**: GET
- **विवरण**: जांचता है कि क्या व्यवस्थापक उपयोगकर्ता को अपना पासवर्ड बदलना चाहिए। यह एंडपॉइंट सार्वजनिक है (कोई प्रमाणीकरण आवश्यक नहीं) क्योंकि यह केवल एक बूलियन फ़्लैग लौटाता है।
- **प्रतिक्रिया**:

  ```json
  {
    "mustChangePassword": false
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `500`: आंतरिक सर्वर त्रुटि (डेटाबेस समस्या होने पर सुझाव दिखाने से बचने के लिए `mustChangePassword: false` लौटाता है)
- **नोट्स**:
  - सार्वजनिक एंडपॉइंट, कोई प्रमाणीकरण आवश्यक नहीं
  - यदि व्यवस्थापक उपयोगकर्ता मौजूद नहीं है तो `false` लौटाता है
  - यह निर्धारित करने के लिए उपयोग किया जाता है कि पासवर्ड परिवर्तन सुझाव दिखाया जाना चाहिए या नहीं
  - त्रुटि पर, डेटाबेस समस्या होने पर सुझाव दिखाने से बचने के लिए `false` लौटाता है

### पासवर्ड नीति प्राप्त करें - `/api/auth/password-policy` {/* #get-password-policy---apiauthpassword-policy */}
- **एंडपॉइंट**: `/api/auth/password-policy`
- **विधि**: GET
- **विवरण**: वर्तमान पासवर्ड नीति कॉन्फ़िगरेशन लौटाता है। यह एंडपॉइंट सार्वजनिक है (कोई प्रमाणीकरण आवश्यक नहीं) क्योंकि इसकी फ्रंटएंड सत्यापन के लिए आवश्यकता है।
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

- **त्रुटि प्रतिक्रियाएं**: क्लाइंट-साइड अनुवाद के लिए `error` और `errorCode` शामिल करें।
  - `500`: पासवर्ड नीति पुनः प्राप्त करने में विफल — `errorCode: "POLICY_RETRIEVE_FAILED"`
- **नोट्स**:
  - सार्वजनिक एंडपॉइंट, कोई प्रमाणीकरण आवश्यक नहीं
  - पासवर्ड आवश्यकताओं को प्रदर्शित करने और सबमिशन से पहले पासवर्ड को सत्यापित करने के लिए फ्रंटएंड घटकों द्वारा उपयोग किया जाता है
  - नीति पर्यावरण चर के माध्यम से कॉन्फ़िगर की जाती है (`PWD_ENFORCE`, `PWD_MIN_LEN`)
  - डिफ़ॉल्ट पासवर्ड जांच (डिफ़ॉल्ट व्यवस्थापक पासवर्ड के उपयोग को रोकना) नीति सेटिंग्स की परवाह किए बिना हमेशा लागू होती है

### Auth API त्रुटि और सफलता कोड (i18n) {/* #auth-api-error-and-success-codes-i18n */}

प्रमाणीकरण एंडपॉइंट एक स्थिर `errorCode` (और, सफलता पर, `successCode`) लौटाते हैं जो मानव-पठनीय `error` या `message` फ़ील्ड के अतिरिक्त होता है। `error` और `message` मान अंग्रेजी में हैं। क्लाइंट्स को कोड का उपयोग करके स्थानीयकृत स्ट्रिंग्स को देखना चाहिए ताकि यूआई उपयोगकर्ता की चयनित भाषा में संदेश प्रदर्शित करे।

| एंडपॉइंट | सफलता कोड | त्रुटि कोड |
|----------|--------------|-------------|
| `/api/auth/login` | — | `REQUIRED_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `DATABASE_NOT_READY`, `INTERNAL_ERROR` |
| `/api/auth/logout` | `LOGGED_OUT` | `NO_ACTIVE_SESSION`, `INTERNAL_ERROR` |
| `/api/auth/me` | — | `INTERNAL_ERROR` |
| `/api/auth/change-password` | `PASSWORD_CHANGED` | `NEW_PASSWORD_REQUIRED`, `POLICY_NOT_MET`, `USER_NOT_FOUND`, `CURRENT_PASSWORD_INCORRECT`, `NEW_PASSWORD_SAME_AS_CURRENT`, `INTERNAL_ERROR` |
| `/api/auth/password-policy` | — | `POLICY_RETRIEVE_FAILED` |

### त्रुटि प्रतिक्रियाएं {/* #error-responses */}
- `401 Unauthorized`: अमान्य या लापता सत्र, समाप्त सत्र, या CSRF टोकन सत्यापन विफल
- `403 Forbidden`: CSRF टोकन सत्यापन विफल या ऑपरेशन की अनुमति नहीं है

:::caution
 **duplistatus** सर्वर को सार्वजनिक इंटरनेट पर एक्सपोज़ न करें। इसे किसी सुरक्षित नेटवर्क 
(उदा. फ़ायरवॉल द्वारा सुरक्षित स्थानीय LAN) में उपयोग करें।

उचित सुरक्षा उपायों के बिना **duplistatus** इंटरफ़ेस को सार्वजनिक
 इंटरनेट पर एक्सपोज़ करने से अनधिकृत एक्सेस हो सकता है।
:::
