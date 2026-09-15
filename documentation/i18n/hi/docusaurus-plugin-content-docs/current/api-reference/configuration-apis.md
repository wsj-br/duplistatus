# कॉन्फ़िगरेशन प्रबंधन {/* #configuration-management */}

## ईमेल कॉन्फ़िगरेशन प्राप्त करें - `/api/configuration/email` {/* #get-email-configuration---apiconfigurationemail */}
- **एंडपॉइंट**: `/api/configuration/email`
- **विधि**: GET
- **विवरण**: वर्तमान ईमेल सूचना कॉन्फ़िगरेशन और यह प्राप्त करता है कि ईमेल सूचनाएं सक्षम/कॉन्फ़िगर हैं या नहीं।
- **प्रमाणीकरण**: वैध सत्र और CSRF टोकन की आवश्यकता है
- **प्रतिक्रिया** (कॉन्फ़िगर किया गया):

  ```json
  {
    "configured": true,
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "message": "Email is configured and ready to use."
  }
  ```

- **प्रतिक्रिया** (कॉन्फ़िगर नहीं है):

  ```json
  {
    "configured": false,
    "config": null,
    "message": "Email is not configured. Please configure SMTP settings."
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `400`: मास्टर कुंजी अमान्य है - सभी एन्क्रिप्ट किए गए पासवर्ड और सेटिंग्स को पुनः कॉन्फ़िगर किया जाना चाहिए
  - `401`: अनुमति नहीं है - अमान्य सत्र या CSRF टोकन
  - `500`: ईमेल कॉन्फ़िगरेशन प्राप्त करने में विफल
- **नोट्स**:
  - सुरक्षा के लिए पासवर्ड के बिना कॉन्फ़िगरेशन लौटाता है
  - `hasPassword` फ़ील्ड शामिल करता है यह इंगित करने के लिए कि पासवर्ड सेट है या नहीं
  - `connectionType` (plain|starttls|ssl), `senderName`, `fromAddress`, और `requireAuth` फ़ील्ड शामिल करता है
  - इंगित करता है कि ईमेल सूचनाएं परीक्षण और उत्पादन उपयोग के लिए उपलब्ध हैं या नहीं
  - मास्टर कुंजी सत्यापन त्रुटियों को सुंदरता से संभालता है

## ईमेल कॉन्फ़िगरेशन अपडेट करें - `/api/configuration/email` {/* #update-email-configuration---apiconfigurationemail */}
- **एंडपॉइंट**: `/api/configuration/email`
- **विधि**: POST
- **विवरण**: SMTP ईमेल सूचना कॉन्फ़िगरेशन को अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **अनुरोध बॉडी**:

  ```json
  {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "username": "user@example.com",
    "password": "password",
    "mailto": "admin@example.com"
  }
  ```

- **प्रतिक्रिया**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration saved successfully"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `400`: आवश्यक फ़ील्ड गायब हैं या अमान्य पोर्ट संख्या है
  - `401`: अनुमति नहीं है - अमान्य सत्र या CSRF टोकन
  - `500`: SMTP कॉन्फ़िगरेशन सहेजने में विफल
- **नोट्स**:
  - सभी फ़ील्ड (होस्ट, पोर्ट, उपयोगकर्ता नाम, पासवर्ड, mailto) आवश्यक हैं
  - पोर्ट 1 और 65535 के बीच एक वैध संख्या होनी चाहिए
  - सुरक्षित फ़ील्ड बूलियन है (SSL/TLS के लिए true)
  - पासवर्ड को पासवर्ड एंडपॉइंट के माध्यम से अलग से प्रबंधित किया जाता है

## ईमेल कॉन्फ़िगरेशन हटाएं - `/api/configuration/email` {/* #delete-email-configuration---apiconfigurationemail */}
- **एंडपॉइंट**: `/api/configuration/email`
- **विधि**: DELETE
- **विवरण**: SMTP ईमेल सूचना कॉन्फ़िगरेशन को हटाता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **प्रतिक्रिया**:

  ```json
  {
    "success": true,
    "message": "SMTP configuration deleted successfully"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनुमति नहीं है - अमान्य सत्र या CSRF टोकन
  - `404`: हटाने के लिए कोई SMTP कॉन्फ़िगरेशन नहीं मिला
  - `500`: SMTP कॉन्फ़िगरेशन हटाने में विफल
- **नोट्स**:
  - यह ऑपरेशन SMTP कॉन्फ़िगरेशन को स्थायी रूप से हटा देता है
  - यदि हटाने के लिए कोई कॉन्फ़िगरेशन मौजूद नहीं है तो 404 लौटाता है
  - दैनिक सारांश मोड सक्षम होने पर 400 लौटाता है, क्योंकि उस मोड के लिए SMTP की आवश्यकता है

## ईमेल पासवर्ड अपडेट करें - `/api/configuration/email/password` {/* #update-email-password---apiconfigurationemailpassword */}
- **एंडपॉइंट**: `/api/configuration/email/password`
- **विधि**: PATCH
- **विवरण**: SMTP प्रमाणीकरण के लिए ईमेल पासवर्ड को अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **अनुरोध बॉडी**:

  ```json
  {
    "password": "new-password",
    "config": {
      "host": "smtp.example.com",
      "port": 465,
      "secure": true,
      "username": "user@example.com",
      "mailto": "admin@example.com"
    }
  }
  ```

- **प्रतिक्रिया**:

  ```json
  {
    "message": "Email password updated successfully"
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `400`: पासवर्ड एक स्ट्रिंग होना चाहिए या आवश्यक कॉन्फ़िग फ़ील्ड गायब हैं
  - `401`: अधिकृत नहीं - अमान्य सत्र या CSRF टोकन
  - `500`: ईमेल पासवर्ड अपडेट करने में विफल
- **नोट्स**:
  - पासवर्ड को साफ़ करने के लिए एक खाली स्ट्रिंग हो सकती है
  - यदि कोई SMTP कॉन्फ़िग मौजूद नहीं है, तो प्रदान की गई कॉन्फ़िग से एक न्यूनतम कॉन्फ़िग बनाता है
  - जब कोई मौजूदा SMTP कॉन्फ़िगरेशन मौजूद नहीं है तो कॉन्फ़िग पैरामीटर आवश्यक है
  - पासवर्ड को एन्क्रिप्शन का उपयोग करके सुरक्षित रूप से संग्रहीत किया जाता है

## ईमेल पासवर्ड CSRF टोकन प्राप्त करें - `/api/configuration/email/password` {/* #get-email-password-csrf-token---apiconfigurationemailpassword */}
- **एंडपॉइंट**: `/api/configuration/email/password`
- **विधि**: GET
- **विवरण**: ईमेल पासवर्ड संचालन के लिए CSRF टोकन प्राप्त करता है।
- **प्रमाणीकरण**: मान्य सत्र की आवश्यकता है
- **प्रतिक्रिया**:

  ```json
  {
    "csrfToken": "csrf-token-string"
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अमान्य या समाप्त सत्र
  - `500`: CSRF टोकन उत्पन्न करने में विफल
- **नोट्स**:
  - पासवर्ड अपडेट संचालन के लिए CSRF टोकन लौटाता है
  - टोकन उत्पन्न करने के लिए सत्र मान्य होना चाहिए

## एकीकृत कॉन्फ़िगरेशन प्राप्त करें - `/api/configuration/unified` {/* #get-unified-configuration---apiconfigurationunified */}
- **एंडपॉइंट**: `/api/configuration/unified`
- **विधि**: GET
- **विवरण**: सभी कॉन्फ़िगरेशन डेटा सहित एकीकृत कॉन्फ़िगरेशन ऑब्जेक्ट प्राप्त करता है जिसमें क्रोन सेटिंग्स, अधिसूचना आवृत्ति, और बैकअप के साथ सर्वर शामिल हैं।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **प्रतिक्रिया**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": ""
    },
    "templates": {
      "language": "en-GB",
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      },
      "warning": {
        "title": "⚠️ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date}.",
        "priority": "high",
        "tags": "duplicati, duplistatus, warning, error"
      },
      "overdueBackup": {
        "title": "🕑 Overdue - {backup_name} @ {server_name}",
        "message": "The backup {backup_name} is overdue on {server_name}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, overdue"
      },
      "dailySummary": {
        "email": {
          "title": "Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal",
          "message": "## Daily backup summary"
        }
      }
    },
    "email": {
      "host": "smtp.example.com",
      "port": 465,
      "connectionType": "ssl",
      "username": "user@example.com",
      "mailto": "admin@example.com",
      "senderName": "duplistatus",
      "fromAddress": "user@example.com",
      "requireAuth": true,
      "hasPassword": true
    },
    "overdue_tolerance": "2h",
    "backup_settings": {
      "server1:backup1": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours",
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    },
    "serverAddresses": [
      {
        "id": "server1",
        "name": "Server 1",
        "server_url": "http://localhost:8200"
      }
    ],
    "cronConfig": {
      "cronExpression": "*/20 * * * *",
      "enabled": true
    },
    "notificationFrequency": "every_day",
    "serversWithBackups": [
      {
        "id": "server1",
        "name": "Server 1",
        "backupName": "backup1",
        "server_url": "http://localhost:8200",
        "alias": "My Server",
        "note": "Primary backup server",
        "hasPassword": true,
        "expectedBackupDate": "2025-02-07T00:00:00.000Z",
        "lastBackupDate": "2025-02-06T00:00:00.000Z"
      }
    ]
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `500`: एकीकृत कॉन्फ़िगरेशन लाने में सर्वर त्रुटि
- **नोट्स**:
  - एकल प्रतिक्रिया में सभी कॉन्फ़िगरेशन डेटा लौटाता है
  - इसमें क्रोन सेटिंग्स, अधिसूचना आवृत्ति, और बैकअप के साथ सर्वर शामिल हैं
  - ईमेल कॉन्फ़िगरेशन में `hasPassword` फ़ील्ड शामिल है लेकिन वास्तविक पासवर्ड नहीं
  - बेहतर प्रदर्शन के लिए सभी डेटा समानांतर में लाता है

## NTFY कॉन्फ़िगरेशन प्राप्त करें - `/api/configuration/ntfy` {/* #get-ntfy-configuration---apiconfigurationntfy */}
- **एंडपॉइंट**: `/api/configuration/ntfy`
- **विधि**: GET
- **विवरण**: वर्तमान NTFY कॉन्फ़िगरेशन सेटिंग्स प्राप्त करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **प्रतिक्रिया**:

  ```json
  {
    "ntfy": {
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अधिकृत नहीं - अमान्य सत्र या CSRF टोकन
  - `500`: NTFY कॉन्फ़िगरेशन लाने में विफल
- **नोट्स**:
  - वर्तमान NTFY कॉन्फ़िगरेशन सेटिंग्स लौटाता है
  - अधिसूचना प्रणाली प्रबंधन के लिए उपयोग किया जाता है
  - कॉन्फ़िगरेशन डेटा तक पहुँचने के लिए प्रमाणीकरण की आवश्यकता है

## अधिसूचना कॉन्फ़िगरेशन प्राप्त करें - `/api/configuration/notifications` {/* #get-notification-configuration---apiconfigurationnotifications */}
- **एंडपॉइंट**: `/api/configuration/notifications`
- **विधि**: GET
- **विवरण**: वर्तमान अधिसूचना आवृत्ति कॉन्फ़िगरेशन प्राप्त करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **प्रतिक्रिया**:

  ```json
  {
    "value": "every_day"
  }
  ```

- **त्रुटि प्रतिक्रियाएँ**:
  - `401`: अधिकृत नहीं - अमान्य सत्र या CSRF टोकन
  - `500`: कॉन्फ़िग लाने में विफल
- **नोट्स**:
  - वर्तमान अधिसूचना आवृत्ति कॉन्फ़िगरेशन प्राप्त करता है
  - अतिदेय बैकअप अधिसूचना प्रबंधन के लिए उपयोग किया जाता है
  - लौटाता है: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`

## अधिसूचना कॉन्फ़िगरेशन अपडेट करें - `/api/configuration/notifications` {/* #update-notification-configuration---apiconfigurationnotifications */}
- **एंडपॉइंट**: `/api/configuration/notifications`
- **विधि**: POST
- **विवरण**: अधिसूचना कॉन्फ़िगरेशन (NTFY सेटिंग्स या अधिसूचना आवृत्ति) को अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता है
- **अनुरोध बॉडी**:
  NTFY कॉन्फ़िगरेशन के लिए:

  ```json
  {
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

सूचना आवृत्ति के लिए:

  ```json
  {
    "value": "every_week"
  }
  ```

- **प्रतिक्रिया**:
  NTFY कॉन्फ़िगरेशन के लिए:

  ```json
  {
    "message": "Notification config updated successfully",
    "ntfy": {
      "enabled": true,
      "url": "https://ntfy.sh",
      "topic": "duplistatus-notifications",
      "accessToken": "optional-access-token"
    }
  }
  ```

सूचना आवृत्ति के लिए:

  ```json
  {
    "value": "every_week"
  }
  ```

- **उपलब्ध मान**: `"onetime"`, `"every_day"`, `"every_week"`, `"every_month"`
- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `400`: NTFY कॉन्फ़िगरेशन आवश्यक है या अमान्य मान है
  - `500`: सूचना कॉन्फ़िगरेशन अपडेट करते समय सर्वर त्रुटि
- **टिप्पणियाँ**:
  - NTFY कॉन्फ़िगरेशन और सूचना आवृत्ति अपडेट दोनों का समर्थन करता है
  - ntfy फ़ील्ड प्रदान किए जाने पर केवल NTFY कॉन्फ़िगरेशन को अपडेट करता है
  - value फ़ील्ड प्रदान किए जाने पर सूचना आवृत्ति को अपडेट करता है
  - यदि कोई नहीं प्रदान किया गया है तो डिफ़ॉल्ट विषय जनरेट करता है
  - मौजूदा कॉन्फ़िगरेशन सेटिंग्स को सुरक्षित रखता है
  - अलग उपयोगकर्ता नाम/पासवर्ड फ़ील्ड के बजाय `accessToken` फ़ील्ड का उपयोग करता है
  - अनुमत विकल्पों के विरुद्ध सूचना आवृत्ति मान को मान्य करता है
  - प्रभावित करता है कि अतिदेय सूचनाएं कितनी बार भेजी जाती हैं

## बैकअप सेटिंग्स अपडेट करें - `/api/configuration/backup-settings` {/* #update-backup-settings---apiconfigurationbackup-settings */}
- **एंडपॉइंट**: `/api/configuration/backup-settings`
- **विधि**: POST
- **विवरण**: विशिष्ट सर्वर/बैकअप के लिए बैकअप सूचनाएं सेटिंग्स को अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **अनुरोध बॉडी**:

  ```json
  {
    "backupSettings": {
      "Server Name:Backup Name": {
        "notificationEvent": "all",
        "expectedInterval": 24,
        "overdueBackupCheckEnabled": true,
        "intervalUnit": "hours"
      }
    }
  }
  ```

- **प्रतिक्रिया**:

  ```json
  {
    "message": "Backup settings updated successfully"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `400`: backupSettings आवश्यक है
  - `500`: बैकअप सेटिंग्स अपडेट करते समय सर्वर त्रुटि
- **टिप्पणियाँ**:
  - विशिष्ट सर्वर/बैकअप के लिए बैकअप सूचनाएं सेटिंग्स को अपडेट करता है
  - अक्षम बैकअप के लिए अतिदेय बैकअप सूचनाएं साफ़ करता है
  - टाइमआउट सेटिंग्स बदलने पर सूचनाएं साफ़ करता है

## सूचना टेम्पलेट अपडेट करें - `/api/configuration/templates` {/* #update-notification-templates---apiconfigurationtemplates */}
- **एंडपॉइंट**: `/api/configuration/templates`
- **विधि**: POST
- **विवरण**: सूचना टेम्पलेट को अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **अनुरोध बॉडी**:

  ```json
  {
    "templates": {
      "success": {
        "title": "✅ {status} - {backup_name} @ {server_name}",
        "message": "Backup {backup_name} on {server_name} completed with status '{status}' at {backup_date} in {duration}.",
        "priority": "default",
        "tags": "duplicati, duplistatus, success"
      }
    }
  }
  ```

- **प्रतिक्रिया**:

  ```json
  {
    "message": "Notification templates updated successfully"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `400`: templates आवश्यक हैं
  - `500`: सूचना टेम्पलेट अपडेट करते समय सर्वर त्रुटि
- **टिप्पणियाँ**:
  - विभिन्न बैकअप स्थितियों के लिए सूचना टेम्पलेट को अपडेट करता है
  - मौजूदा कॉन्फ़िगरेशन सेटिंग्स को सुरक्षित रखता है
  - टेम्पलेट Markdown ईमेल बॉडी और `{placeholder}` प्रतिस्थापन का समर्थन करते हैं
  - एक `dailySummary` ईमेल टेम्पलेट (विषय और Markdown बॉडी) आवश्यक है

## दैनिक सारांश - `/api/configuration/daily-summary` {/* #daily-summary---apiconfigurationdaily-summary */}
- **एंडपॉइंट**: `/api/configuration/daily-summary`
- **विधि**: GET, POST
- **विवरण**: दैनिक सारांश मोड को पढ़ता है या अपडेट करता है। GET सैनिटाइज़ की गई सेटिंग्स, डिस्पैचर स्वास्थ्य, अगला घटनाक्रम, और ईमेल डिलीवरी स्थिति लौटाता है। POST `enabled`, `utcTime` (`HH:mm` UTC), `timeZone` (अंतिम सहेजें से ब्राउज़र IANA टाइमज़ोन), वैकल्पिक `publicUrl`, और वैकल्पिक `smtpRecipient` (खाली होने पर ईमेल सेटिंग्स SMTP प्राप्तकर्ता का उपयोग करता है) को सहेजता है। सक्षम करने के लिए मान्य SMTP आवश्यक है। `utcTime` बदलने से `daily-summary-dispatch` `minute hour * * *` UTC में अपडेट हो जाता है और cron सेवा रीलोड हो जाती है। शेड्यूल बदलने से अगला **भविष्य का** घटनाक्रम सेट होता है।
- **प्रमाणीकरण**: GET के लिए एक मान्य सत्र और CSRF टोकन की आवश्यकता होती है। POST के लिए एक व्यवस्थापक सत्र और CSRF टोकन की आवश्यकता होती है।
- **त्रुटि प्रतिक्रियाएं**:
  - `400`: अमान्य समय/समय क्षेत्र, अमान्य सार्वजनिक URL, अमान्य SMTP प्राप्तकर्ता, या अनुपलब्ध SMTP
  - `401`: अनधिकृत
  - `500`: दैनिक सारांश को पढ़ने या अपडेट करने में विफल

## दैनिक सारांश भेजें - `/api/configuration/daily-summary/send` {/* #send-daily-summary---apiconfigurationdaily-summarysend */}
- **एंडपॉइंट**: `/api/configuration/daily-summary/send`
- **विधि**: POST
- **विवरण**: वर्तमान-स्थिति का एक अतिरिक्त स्नैपशॉट तुरंत भेजता है। अगली निर्धारित घटना का उपभोग नहीं करता है। संग्रहीत SMTP का उपयोग करता है। सेट होने पर `daily_summary.smtpRecipient` को भेजता है, अन्यथा ईमेल सेटिंग्स प्राप्तकर्ता को। अनुरोध में प्राप्तकर्ता पते स्वीकार नहीं करता है। ऑडिट लॉग (सिस्टम) में `daily_summary_sent` रिकॉर्ड करता है।
- **प्रमाणीकरण**: व्यवस्थापक सत्र और CSRF टोकन की आवश्यकता होती है

## दैनिक सारांश पुनः प्रयास करें - `/api/configuration/daily-summary/retry` {/* #retry-daily-summary---apiconfigurationdaily-summaryretry */}
- **एंडपॉइंट**: `/api/configuration/daily-summary/retry`
- **विधि**: POST
- **विवरण**: स्थायी पेलोड से विफल चैनलों का पुनः प्रयास करता है। वैकल्पिक बॉडी `{ "occurrenceKey": "..." }`; अन्यथा नवीनतम विफल ईमेल डिलीवरी का पुनः प्रयास करता है।
- **प्रमाणीकरण**: व्यवस्थापक सत्र और CSRF टोकन की आवश्यकता होती है

## दैनिक सारांश का पूर्वावलोकन करें - `/api/configuration/daily-summary/preview` {/* #preview-daily-summary---apiconfigurationdaily-summarypreview */}
- **एंडपॉइंट**: `/api/configuration/daily-summary/preview`
- **विधि**: POST
- **विवरण**: बिना भेजे और डिलीवरी-लेज़र पंक्तियों को लिखे बिना वर्तमान स्नैपशॉट को रेंडर करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है

## अतिदेय सहनशीलता प्राप्त करें - `/api/configuration/overdue-tolerance` {/* #get-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **एंडपॉइंट**: `/api/configuration/overdue-tolerance`
- **विधि**: GET
- **विवरण**: वर्तमान अतिदेय सहनशीलता सेटिंग प्राप्त करता है।
- **प्रतिक्रिया**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `500`: अतिदेय सहनशीलता प्राप्त करने में विफल
- **नोट्स**:
  - वर्तमान अतिदेय सहनशीलता सेटिंग लौटाता है
  - वर्तमान कॉन्फ़िगरेशन प्रदर्शित करने के लिए उपयोग किया जाता है

## अतिदेय सहनशीलता अपडेट करें - `/api/configuration/overdue-tolerance` {/* #update-overdue-tolerance---apiconfigurationoverdue-tolerance */}
- **एंडपॉइंट**: `/api/configuration/overdue-tolerance`
- **विधि**: POST
- **विवरण**: अतिदेय सहनशीलता सेटिंग को अपडेट करता है।
- **प्रमाणीकरण**: मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **अनुरोध बॉडी**:

  ```json
  {
    "overdue_tolerance": "2h"
  }
  ```

- **प्रतिक्रिया**:

  ```json
  {
    "message": "Overdue tolerance updated successfully"
  }
  ```

- **त्रुटि प्रतिक्रियाएं**:
  - `401`: अनधिकृत - अमान्य सत्र या CSRF टोकन
  - `400`: overdue_tolerance आवश्यक है
  - `500`: अतिदेय सहनशीलता को अपडेट करने में सर्वर त्रुटि
- **नोट्स**:
  - अतिदेय सहनशीलता सेटिंग को अपडेट करता है (`"1h"`, `"2h"`, आदि जैसे स्ट्रिंग प्रारूप स्वीकार करता है; नए इंस्टॉलेशन के लिए डिफ़ॉल्ट `2h` है)
  - बैकअप को कब अतिदेय माना जाए, इस पर प्रभाव डालता है
  - अतिदेय बैकअप चेकर द्वारा उपयोग किया जाता है

## बाहरी API सुरक्षा - `/api/configuration/external-api-security` {/* #external-api-security---apiconfigurationexternal-api-security */}
- **एंडपॉइंट**: `/api/configuration/external-api-security`
- **विधियां**: GET, PATCH
- **विवरण**: यह पढ़ता या अपडेट करता है कि क्या बाहरी API को कुंजी की आवश्यकता है, साथ ही `/api/upload` आकार और दर सीमाएं भी।
- **प्रमाणीकरण**: एडमिन विशेषाधिकार, मान्य सत्र और CSRF टोकन की आवश्यकता होती है
- **PATCH बॉडी**:

  ```json
  {
    "requireApiKey": false,
    "uploadLimits": {
      "enabled": true,
      "maxBytes": 5242880,
      "perMinute": 20,
      "perHour": 200
    }
  }
  ```

## IP अनुमति सूची - `/api/configuration/ip-allowlist` {/* #ip-allowlist---apiconfigurationip-allowlist */}
- **एंडपॉइंट**: `/api/configuration/ip-allowlist`
- **विधियां**: GET, PATCH
- **विवरण**: विश्वसनीय प्रॉक्सी और एडमिन / बाहरी-API CIDR अनुमति सूचियों को पढ़ता या अपडेट करता है। एडमिन सूची को सक्षम करना तब तक विफल रहता है जब तक कि वर्तमान क्लाइंट IP पहले से सूचीबद्ध न हो (लूपबैक को छूट प्राप्त है)।
- **प्रमाणीकरण**: एडमिन विशेषाधिकारों, मान्य सत्र और CSRF टोकन की आवश्यकता होती है
