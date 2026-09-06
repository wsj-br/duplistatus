# डेटाबेस स्कीमा {#database-schema}

यह दस्तावेज़ duplistatus द्वारा बैकअप ऑपरेशन डेटा संग्रहीत करने के लिए उपयोग किए जाने वाले SQLite डेटाबेस स्कीमा का वर्णन करता है।

## डेटाबेस स्थान {#database-location}

डेटाबेस एप्लिकेशन डेटा निर्देशिका में संग्रहीत किया जाता है:
- **Default Location**: `/app/data/backups.db`
- **Docker Volume**: `duplistatus_data:/app/data`
- **File Name**: `backups.db`

## डेटाबेस माइग्रेशन प्रणाली {#database-migration-system}

duplistatus संस्करणों के बीच डेटाबेस स्कीमा परिवर्तनों को संभालने के लिए एक स्वचालित माइग्रेशन प्रणाली का उपयोग करता है।

### माइग्रेशन संस्करण इतिहास {#migration-version-history}

निम्नलिखित ऐतिहासिक माइग्रेशन संस्करण हैं जो डेटाबेस को इसकी वर्तमान स्थिति में लाए गए हैं:

- **Schema v1.0** (Application v0.6.x और उससे पहले): मशीनें और बैकअप तालिकाओं के साथ प्रारंभिक डेटाबेस स्कीमा
- **Schema v2.0** (Application v0.7.x): लुप्त कॉलम और कॉन्फ़िगरेशन तालिका जोड़ी गई
- **Schema v3.0** (Application v0.7.x): मशीनें तालिका को सर्वर में पुनर्नामित किया गया, सर्वर _यूआरएल कॉलम जोड़ा गया
- **Schema v3.1** (Application v0.8.x): बैकअप डेटा फ़ील्डों को बढ़ाया गया, सर्वर_ पासवर्ड कॉलम जोड़ा गया
- **Schema v4.0** (Application v0.9.x / v1.0.x): Added User Access Control (users, sessions, audit_log tables)
- **Schema v4.1** (Application v1.5.x): Added `api_keys` and default configuration keys for optional API-key authentication, IP allowlists, and upload limits
- **Schema v4.2** (Application v1.5.x): Added `daily_summary_deliveries` ledger and default `daily_summary` configuration for optional daily summary notifications

Vartaman application version (v1.5.x) uses **Schema v4.2** as the latest database schema version.

### माइग्रेशन प्रक्रिया {#migration-process}

1. **स्वचालित बैकअप**: माइग्रेशन से पहले बैकअप बनाता है
2. **स्कीमा अपडेट**: डेटाबेस संरचना को अपडेट करता है
3. **डेटा माइग्रेशन**: मौजूदा डेटा को संरक्षित करता है
4. **सत्यापन**: सफल माइग्रेशन की पुष्टि करता है

## तालिकाएँ {#tables}

### सर्वर तालिका {#servers-table}

निगरानी के लिए डुप्लिकेट सर्वर के बारे में जानकारी संग्रहीत करता है।

#### फ़ील्ड {#fields}

| फ़ील्ड             | प्रकार             | विवरण                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | अद्वितीय सर्वर पहचानकर्ता           |
| `name`            | TEXT NOT NULL    | डुप्लिकेट से सर्वर नाम         |
| `server_url`      | TEXT             | डुप्लिकेट सर्वर URL               |
| `alias`           | TEXT             | उप्योगकर्ता द्वारा परिभाषित अनुकूल नाम         |
| `note`            | TEXT             | उप्योगकर्ता द्वारा परिभाषित टिप्पणियाँ/विवरण     |
| `server_password` | TEXT             | प्रमाणीकरण के लिए सर्वर पासवर्ड |
| `created_at`      | DATETIME         | सर्वर निर्माण समय चिन्ह          |

### बैकअप तालिका {#backups-table}

डुप्लिकेट सर्वरों से प्राप्त बैकअप ऑपरेशन डेटा संग्रहीत करता है।

#### मुख्य क्षेत्र {#key-fields}

| क्षेत्र              | प्रकार              | विवरण                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | अद्वितीय बैकअप पहचानकर्ता                       |
| `server_id`        | TEXT NOT NULL     | सर्वर तालिका के संदर्भ                     |
| `backup_name`      | TEXT NOT NULL     | बैकअप कार्य नाम                                |
| `backup_id`        | TEXT NOT NULL     | डुप्लिकेट से बैकअप आईडी                       |
| `date`             | DATETIME NOT NULL | बैकअप कार्यान्वयन समय                          |
| `status`           | TEXT NOT NULL     | बैकअप स्थिति (सफलता, चेतावनी, त्रुटि, गंभीर) |
| `duration_seconds` | INTEGER NOT NULL  | सेकंड में अवधि                            |
| `size`             | INTEGER           | स्रोत फ़ाइल का आकार                           |
| `uploaded_size`    | INTEGER           | अपलोड किए गए डेटा का आकार                          |
| `examined_files`   | INTEGER           | जांची गई फ़ाइलों की संख्या                       |
| `warnings`         | INTEGER           | चेतावनियों की संख्या                             |
| `errors`           | INTEGER           | त्रुटियों की संख्या                               |
| `created_at`       | DATETIME          | रिकॉर्ड निर्माण समय चिन्ह                      |

#### संदेश सरणियाँ (JSON संचयन) {#message-arrays-json-storage}

| क्षेत्र                | प्रकार | विवरण                                   |
|---------------------|------|-----------------------------------------|
| `messages_array`    | पाठ | लॉग संदेशों का JSON सरणी              |
| `warnings_array`    | पाठ | चेतावनी संदेशों का JSON सरणी          |
| `errors_array`      | पाठ | त्रुटि संदेशों का JSON सरणी            |
| `available_backups` | पाठ | उपलब्ध बैकअप संस्करणों का JSON सरणी |

#### फ़ाइल ऑपरेशन फ़ील्ड {#file-operation-fields}

| क्षेत्र                 | प्रकार    | विवरण                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | पूर्णांक | बैकअप के दौरान जाँच की गई फ़ाइलें |
| `opened_files`        | पूर्णांक | बैकअप के लिए खोलने वाली फ़ाइलें      |
| `added_files`         | पूर्णांक | बैकअप में जोड़ी गई नई फ़ाइलें    |
| `modified_files`      | पूर्णांक | बैकअप में संशोधित फ़ाइलें     |
| `deleted_files`       | पूर्णांक | बैकअप से हटाई गई फ़ाइलें    |
| `deleted_folders`     | पूर्णांक | बैकअप से हटाए गए फ़ोल्डर  |
| `added_folders`       | पूर्णांक | बैकअप में जोड़े गए फ़ोल्डर      |
| `modified_folders`    | पूर्णांक | बैकअप में संशोधित फ़ोल्डर   |
| `not_processed_files` | पूर्णांक | संसाधित नही हुई फ़ाइलें          |
| `too_large_files`     | पूर्णांक | संसाधन के लिए बहुत बड़ी फ़ाइलें   |
| `files_with_error`    | पूर्णांक | त्रुटियों वाली फ़ाइलें            |
| `added_symlinks`      | पूर्णांक | जोड़ी गई सिंबोलिक लिंक         |
| `modified_symlinks`   | पूर्णांक | संशोधित सिंबोलिक लिंक      |
| `deleted_symlinks`    | पूर्णांक | हटाई गई सिंबोलिक लिंक       |

#### File Aakar Fields {#file-size-fields}

| Field                    | Type    | Description                          |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | Backup ke dauran jachre gaye file ka Aakar |
| `size_of_opened_files`   | INTEGER | Backup ke liye khole gaye file ka Aakar      |
| `size_of_added_files`    | INTEGER | Backup mein jodne ke liye naye file ka Aakar    |
| `size_of_modified_files` | INTEGER | Backup mein badal gaye file ka Aakar     |

#### Operation Stithi Fields {#operation-status-fields}

| Field                    | Type              | Description                    |
|--------------------------|-------------------|--------------------------------|
| `parsed_result`          | TEXT NOT NULL     | Parsed operation result        |
| `main_operation`         | TEXT NOT NULL     | Main operation type            |
| `interrupted`            | BOOLEAN           | Whether backup was interrupted |
| `partial_backup`         | BOOLEAN           | Whether backup was partial     |
| `dryrun`                 | BOOLEAN           | Whether backup was a dry run   |
| `version`                | TEXT              | Duplicati version used         |
| `begin_time`             | DATETIME NOT NULL | Backup start time              |
| `end_time`               | DATETIME NOT NULL | Backup end time                |
| `warnings_actual_length` | INTEGER           | Actual warnings count          |
| `errors_actual_length`   | INTEGER           | Actual errors count            |
| `messages_actual_length` | INTEGER           | Actual messages count          |

#### Backend Aankde Fields {#backend-statistics-fields}

| Field                            | Type     | Description                       |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded`               | INTEGER  | Bytes downloaded from destination |
| `known_file_size`                | INTEGER  | Known file size on destination    |
| `last_backup_date`               | DATETIME | Antim Backup Tithi par ghar par   |
| `backup_list_count`              | INTEGER  | Backup Sanskaranon ka Sankhya         |
| `reported_quota_error`           | BOOLEAN  | Quota Truti ka Prabhava               |
| `reported_quota_warning`         | BOOLEAN  | Quota Warning ka Prabhava             |
| `backend_main_operation`         | TEXT     | Backend ka Mulaam Kaam            |
| `backend_parsed_result`          | TEXT     | Backend ka Parsed Result             |
| `backend_interrupted`            | BOOLEAN  | Backend ka Kaam Ruk gaya     |
| `backend_version`                | TEXT     | Backend Sanskaran                   |
| `backend_begin_time`             | DATETIME | Backend Kaam Shuru Samay      |
| `backend_duration`               | TEXT     | Backend Kaam Avadhi        |
| `backend_warnings_actual_length` | INTEGER  | Backend Chetaavaniyaan ka Sankhya            |
| `backend_errors_actual_length`   | INTEGER  | Backend Trutiyon ka Sankhya              |

### Sammaan Ka Table {#configurations-table}

Application ka Sammaan Sammaan ka Sammaan rakhta hai.

#### Fields {#fields-1}

| Field   | Type                      | Description                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | Sammaan ka Key          |
| `value` | TEXT                      | Sammaan ka Maan (JSON) |

#### Common Sammaan Keys {#common-configuration-keys}

- `email_config`: Email Notification Sammaan
- `ntfy_config`: NTFY Notification Sammaan
- `overdue_tolerance`: Vilambit Backup Samman Sammaan
- `notification_templates`: Notification Message Templates
- `daily_summary`: दैनिक सारांश मोड, अनुसूची, और समय क्षेत्र
- `cron_service`: क्रॉन कार्य अनुसूचियां, जिसमें `daily-summary-dispatch` शामिल है
- `audit_retention_days`: ऑडिट लॉग रिटेंशन अवधि (डिफ़ॉल्ट: 90 दिन)

### डेटाबेस संस्करण तालिका {#database-version-table}

माइग्रेशन उद्देश्यों के लिए डेटाबेस स्कीमा संस्करण को ट्रैक करता है।

#### फ़ील्ड {#fields-2}

| फ़ील्ड        | प्रकार             | विवरण                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | डेटाबेस संस्करण           |
| `applied_at` | DATETIME         | कब माइग्रेशन लागू किया गया |

### उपयोक्ता तालिका {#users-table}

प्रमाणीकरण और एक्सेस कंट्रोल के लिए उपयोक्ता खाता जानकारी को संग्रहीत करता है।

#### फ़ील्ड {#fields-3}

| फ़ील्ड                   | प्रकार                 | विवरण                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | अद्वितीय उपयोक्ता पहचानकर्ता              |
| `username`              | TEXT UNIQUE NOT NULL | लॉगिन के लिए उपयोक्ता नाम                  |
| `password_hash`         | TEXT NOT NULL        | Bcrypt हैश किया गया पासवर्ड              |
| `is_admin`              | BOOLEAN NOT NULL     | क्या उपयोक्ता को व्यवस्थापक विशेषाधिकार हैं   |
| `must_change_password`  | BOOLEAN              | क्या पासवर्ड बदलने की आवश्यकता है |
| `created_at`            | DATETIME             | खाता निर्माण समय चिह्न          |
| `updated_at`            | DATETIME             | अंतिम अपडेट समय चिह्न               |
| `last_login_at`         | DATETIME             | अंतिम सफल लॉगिन समय चिह्न     |
| `last_login_ip`         | TEXT                 | अंतिम लॉगिन का आईपी पता            |
| `failed_login_attempts` | INTEGER              | असफल लॉगिन प्रयासों की गिनती      |
| `locked_until`          | DATETIME             | खाता लॉक समाप्ति (यदि लॉक किया गया है) |

### सत्र तालिका {#sessions-table}

उपयोगकर्ता सत्र डेटा प्रमाणीकरण और सुरक्षा के लिए संग्रहीत करता है।

#### फ़ील्ड {#fields-4}

| फ़ील्ड             | प्रकार              | विवरण                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | सत्र पहचानकर्ता                                               |
| `user_id`         | TEXT              | उपयोगकर्ताओं तालिका का संदर्भ (अप्रमाणित सत्रों के लिए nullable) |
| `created_at`      | DATETIME          | सत्र निर्माण समय चिन्ह                                       |
| `last_accessed`   | DATETIME          | अंतिम पहुँच समय चिन्ह                                            |
| `expires_at`      | DATETIME NOT NULL | सत्र समाप्ति समय चिन्ह                                     |
| `ip_address`      | TEXT              | सत्र मूल का IP पता                                     |
| `user_agent`    | TEXT                              | उपयोक्ता एजेंट स्ट्रिंग                                                 |
| `csrf_token`      | TEXT              | सत्र के लिए CSRF टोकन                                       |
| `csrf_expires_at` | DATETIME          | CSRF टोकन समाप्ति                                            |

### ऑडिट लॉग तालिका {#audit-log-table}

उपयोगकर्ता क्रियाओं और प्रणाली घटनाओं की ऑडिट ट्रेल संग्रहीत करता है।

#### फ़ील्ड {#fields-5}

| फ़ील्ड           | प्रकार                              | विवरण                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | अद्वितीय ऑडिट लॉग प्रविष्टि पहचानकर्ता                                 |
| `timestamp`     | DATETIME                          | घटना समय चिन्ह                                                   |
| `user_id`       | TEXT                              | उपयोगकर्ताओं तालिका का संदर्भ (nullable)                               |
| `username`      | TEXT                              | क्रिया के समय उपयोगकर्ता नाम                                        |
| `action`        | TEXT NOT NULL                     | किये गये क्रिया                                                  |
| `category`      | TEXT NOT NULL                     | क्रिया का श्रेणी (उदाहरण के लिए, 'प्रमाणीकरण', 'सेटिंग्स', 'बैकअप') |
| `target_type`   | TEXT                              | लक्ष्य का प्रकार (जैसे, 'server', 'backup', 'user')                 |
| `target_id`     | TEXT                              | लक्ष्य का पहचानकर्ता                                              |
| `details`       | TEXT                              | अतिरिक्त विवरण (JSON)                                         |
| `ip_address`    | TEXT                              | अनुरोधकर्ता का IP पता                                           |
| `user_agent`    | TEXT                              | उपयोक्ता एजेंट स्ट्रिंग                                                 |
| `status`        | TEXT NOT NULL                     | क्रिया की स्थिति ('सफलता', 'असफलता', 'त्रुटि')                  |
| `error_message` | TEXT                              | त्रुटि संदेश यदि क्रिया असफल हुई                                    |

### एपीआई कुंजियाँ तालिका {#api-keys-table}

बाहरी एचटीटीपी एपीआई के लिए हैश्ड एपीआई कुंजियाँ संग्रहीत करता है। प्लेनटेक्स्ट सीक्रेट को बनाए जाने पर एक बार ही दिखाया जाता है और कभी भी संग्रहीत नहीं किया जाता।

#### फ़ील्ड {#fields-6}

| फ़ील्ड          | प्रकार             | विवरण                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | अद्वितीय कुंजी पहचानकर्ता                                    |
| `name`         | TEXT NOT NULL    | प्रदर्शन नाम                                             |
| `key_hash`     | TEXT UNIQUE      | सीक्रेट का SHA-256 हैश                                   |
| `key_prefix`   | TEXT             | सीक्रेट के पहले चार अक्षर (फिंगरप्रिंट के लिए)   |
| `key_suffix`   | TEXT             | सीक्रेट के अंतिम चार अक्षर (फिंगरप्रिंट के लिए)    |
| `scope`        | TEXT NOT NULL    | `upload` या `read`                                       |
| `description`  | TEXT             | वैकल्पिक विवरण                                     |
| `enabled`      | INTEGER          | `1` जब कुंजी सक्रिय है                               |
| `created_at`   | DATETIME         | निर्माण समय चिन्ह                                       |
| `created_by`   | TEXT             | कुंजी बनाने वाले व्यवस्थापक का उपयोगकर्ता आईडी         |
| `expires_at`   | DATETIME         | वैकल्पिक समाप्ति                                          |
| `last_used_at` | DATETIME         | अंतिम सफल उपयोग                                      |
| `usage_count`  | INTEGER          | सफल उपयोग गणना                                     |

संबंधित कॉन्फ़िगरेशन कुंजियाँ `configurations` तालिका में: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`।

### Daily Summary Deliveries Table {#daily-summary-deliveries-table}

दैनिक सारांश ईमेल डिलीवरी के लिए चैनल-विशिष्ट लेजर। पुराने पंक्तियाँ में एक `ntfy` चैनल शामिल हो सकता है जो पिछले रिलीज़ से है। प्रत्येक अनुसूचित घटना (या अद्वितीय मैनुअल भेजा) प्रति चैनल अधिकतम एक पंक्ति होती है। रेंडर किए गए पेलोड भेजने से पहले संग्रहीत किए जाते हैं ताकि पुन: प्रयासों में वही स्नैपशॉट हो। 30 दिन से पुराने पंक्तियाँ हटा दी जाती हैं।

If the process dies after a provider accepts a message but before success is recorded, that channel may be retried (at-least-once).

#### Fields {#fields-7}

| Field              | Type             | Description                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | Unique delivery identifier                                                  |
| `occurrence_key`   | TEXT NOT NULL    | Scheduled local date key or `manual:{uuid}`                                 |
| `channel`          | TEXT NOT NULL    | `email` or `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, or `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | Local calendar date for the snapshot                                        |
| `time_zone`        | TEXT NOT NULL    | Saved IANA timezone                                                         |
| `payload_json`     | TEXT             | Rendered subject, HTML, text, and NTFY fields                               |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, or `failed`                                   |
| `attempt_count`    | INTEGER          | Delivery attempts                                                           |
| `next_retry_at`    | DATETIME         | When a failed channel may be claimed again                                  |
| `lease_expires_at` | DATETIME         | Claim lease; a stale lease can be recovered                                 |
| `error`            | TEXT             | Last error, if any                                                          |
| `created_at`       | DATETIME         | Row creation timestamp                                                      |
| `updated_at`            | DATETIME             | अंतिम अपडेट समय चिह्न               |
| `sent_at`          | DATETIME         | Safalta ka samay chinh                                                           |

एक अद्वितीय सूचकांक `(occurrence_key, channel)` पर एक ही घटना के समान चैनल पर दोहराव से बचाता है।

## सत्र प्रबंधन {#session-management}

### डेटाबेस-सहायता सत्र संचयन {#database-backed-session-storage}

सत्र डेटाबेस में संग्रहीत होते हैं, साथ ही स्मृति में पिछड़ा हुआ:
- **प्राथमिक संग्रहण**: डेटाबेस-सहायता सत्र तालिका
- **पिछड़ा हुआ**: स्मृति में संग्रहण (विरासत समर्थन या त्रुटि मामलों के लिए)
- **सत्र आईडी**: क्रिप्टोग्राफिक रूप से सुरक्षित यादृच्छिक स्ट्रिंग
- **समय सीमा**: सत्र समय सीमा कॉन्फ़िगर करने योग्य
- **CSRF रक्षा**: क्रॉस-साइट अनुरोध फर्जी रक्षा
- **स्वचालित सफाई**: समाप्त हुए सत्र स्वचालित रूप से हटाए जाते हैं

### सत्र API एंडपॉइंट्स {#session-api-endpoints}

- `POST /api/session`: नया सत्र बनाएँ
- `GET /api/session`: मौजूदा सत्र को सत्यापित करें
- `DELETE /api/session`: सत्र को नष्ट करें
- `GET /api/csrf`: CSRF टोकन प्राप्त करें

## सूचकांक {#indexes}

डेटाबेस में अनुप्रयोग के लिए अनुकूलित क्वेरी प्रदर्शन के लिए कई सूचकांक शामिल हैं:

- **प्राथमिक कुंजियाँ**: सभी तालिकाओं में प्राथमिक कुंजी सूचकांक
- **विदेशी कुंजियाँ**: बैकअप तालिका में सर्वर संदर्भ, उपयोक्ता संदर्भ सत्र और ऑडिट लॉग में
- **क्वेरी अनुकूलन**: अक्सर क्वेरी किए जाने वाले क्षेत्रों पर सूचकांक
- **तिथि सूचकांक**: समय-आधारित क्वेरी के लिए तिथि क्षेत्रों पर सूचकांक
- **उपयोगकर्ता इंडेक्स**: उपयोगकर्ता लुकअप के लिए उपयोगकर्ता नाम इंडेक्स
- **सत्र इंडेक्स**: सत्र प्रबंधन के लिए समाप्ति और उपयोगकर्ता_आईडी इंडेक्स
- **ऑडिट इंडेक्स**: ऑडिट क्वेरी के लिए समय चिन्ह, उपयोगकर्ता_आईडी, क्रिया, श्रेणी, और स्थिति इंडेक्स
- **एपीआई कुंजी इंडेक्स**: अद्वितीय हैश, साथ ही सक्रिय/स्कोप लुकअप के लिए प्रमाणीकरण

## संबंध {#relationships}

- **Server → Backups**: एक-से-एक से अधिक संबंध
- **Upyogkarta → Sessions**: एक-से-एक से अधिक संबंध (sessions उप्योगकर्ता के बिना भी मौजूद हो सकते हैं)
- **Upyogkarta → Audit Log**: एक-से-एक से अधिक संबंध (audit entries उप्योगकर्ता के बिना भी मौजूद हो सकते हैं)
- **Upyogkarta → एपीआई कुंजियाँ**: एक-से-एक से अधिक संबंध `created_by` के माध्यम से (कुंजियाँ उप्योगकर्ता को हटाने के बाद भी मौजूद रहती हैं)
- **Backups → Sandesh**: Embedded JSON arrays
- **Configurations**: Key-value storage

## डेटा प्रकार {#data-types}

- **TEXT**: स्ट्रिंग डेटा, JSON एरे
- **INTEGER**: संख्यात्मक डेटा, फ़ाइल गिनती, आकार
- **REAL**: फ़्लोटिंग-पॉइंट नंबर, अवधि
- **DATETIME**: टाइमस्टैम्प डेटा
- **BOOLEAN**: सत्य/असत्य मान

## बैकअप स्थिति मान {#backup-status-values}

- **सफलता**: बैकअप सफलतापूर्वक पूरा हुआ
- **चेतावनी**: चेतावनियों के साथ बैकअप पूरा हुआ
- **त्रुटि**: त्रुटियों के साथ बैकअप पूरा हुआ
- **गंभीर**: बैकअप गंभीर रूप से असफल हुआ

## सामान्य क्वेरीज़ {#common-queries}

### सर्वर के लिए नवीनतम बैकअप प्राप्त करें {#get-latest-backup-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### सर्वर के लिए सभी बैकअप प्राप्त करें {#get-all-backups-for-a-server}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### सर्वर सारांश प्राप्त करें {#get-server-summary}

```sql
SELECT 
  s.name,
  s.alias,
  COUNT(b.id) as backup_count,
  MAX(b.date) as last_backup,
  b.status as last_status
FROM servers s
LEFT JOIN backups b ON s.id = b.server_id
GROUP BY s.id;
```

### कुल सारांश प्राप्त करें {#get-overall-summary}

```sql
SELECT 
  COUNT(DISTINCT s.id) as total_servers,
  COUNT(b.id) as total_backups_runs,
  COUNT(DISTINCT s.id || ':' || b.backup_name) as total_backups,
  COALESCE(SUM(b.uploaded_size), 0) as total_uploaded_size,
  (
    SELECT COALESCE(SUM(b2.known_file_size), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_storage_used,
  (
    SELECT COALESCE(SUM(b2.size_of_examined_files), 0)
    FROM backups b2
    INNER JOIN (
      SELECT server_id, MAX(date) as max_date
      FROM backups
      GROUP BY server_id
    ) latest ON b2.server_id = latest.server_id AND b2.date = latest.max_date
  ) as total_backuped_size
FROM servers s
LEFT JOIN backups b ON b.server_id = s.id;
```

### डेटाबेस साफ़-चौकी {#database-cleanup}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## JSON से डेटाबेस मैपिंग {#json-to-database-mapping}

### API अनुरोध बॉडी से डेटाबेस कॉलम मैपिंग {#api-request-body-to-database-columns-mapping}

जब डुप्लिकेटी HTTP POST के माध्यम से बैकअप डेटा भेजता है, तो JSON संरचना डेटाबेस कॉलम में मैप की जाती है:

```json
{
  "Data": {
    "ExaminedFiles": 15399,           // → examined_files
    "OpenedFiles": 1861,              // → opened_files
    "AddedFiles": 1861,               // → added_files
    "SizeOfExaminedFiles": 11086692615, // → size_of_examined_files
    "SizeOfOpenedFiles": 13450481,    // → size_of_opened_files
    "SizeOfAddedFiles": 13450481,     // → size_of_added_files
    "SizeOfModifiedFiles": 0,         // → size_of_modified_files
    "ParsedResult": "Success",        // → status
    "BeginTime": "2025-04-21T23:45:46.9712217Z", // → begin_time and date
    "Duration": "00:00:51.3856057",   // → duration_seconds (calculated)
    "WarningsActualLength": 0,        // → warnings_actual_length
    "ErrorsActualLength": 0           // → errors_actual_length
  },
  "Extra": {
    "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", // → server_id
    "machine-name": "WSJ-SER5",       // → server name
    "backup-name": "WSJ-SER5 Local files", // → backup_name
    "backup-id": "DB-2"               // → backup_id
  }
}
```

**नोट**: बैकअप्स तालिका में `size` फ़ील्ड `SizeOfExaminedFiles` और `uploaded_size` में बैकअप ऑपरेशन से अपलोड/ट्रांसफर किया गया वास्तविक आकार संग्रहीत होता है।
