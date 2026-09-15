# डेटाबेस स्कीमा {/* #database-schema */}

यह दस्तावेज़ duplistatus द्वारा बैकअप ऑपरेशन डेटा संग्रहीत करने के लिए उपयोग किए जाने वाले SQLite डेटाबेस स्कीमा का विवरण देता है।

## डेटाबेस स्थान {/* #database-location */}

डेटाबेस एप्लिकेशन डेटा निर्देशिका (डायरेक्टरी) में संग्रहीत होता है:
- **डिफ़ॉल्ट स्थान**: `/app/data/backups.db`
- **Docker वॉल्यूम**: `duplistatus_data:/app/data`
- **फ़ाइल नाम**: `backups.db`

## डेटाबेस माइग्रेशन सिस्टम {/* #database-migration-system */}

संस्करणों के बीच डेटाबेस स्कीमा परिवर्तनों को संभालने के लिए duplistatus एक स्वचालित माइग्रेशन सिस्टम का उपयोग करता है।

### माइग्रेशन संस्करण इतिहास {/* #migration-version-history */}

डेटाबेस को उसकी वर्तमान स्थिति में लाने वाले ऐतिहासिक माइग्रेशन संस्करण निम्नलिखित हैं:

- **स्कीमा v1.0** (एप्लिकेशन v0.6.x और उससे पहले): मशीनों और बैकअप तालिकाओं के साथ प्रारंभिक डेटाबेस स्कीमा
- **स्कीमा v2.0** (एप्लिकेशन v0.7.x): अनुपलब्ध कॉलम और कॉन्फ़िगरेशन तालिका जोड़ी गई
- **स्कीमा v3.0** (एप्लिकेशन v0.7.x): machines तालिका का नाम बदलकर servers कर दिया गया, server_url कॉलम जोड़ा गया
- **स्कीमा v3.1** (एप्लिकेशन v0.8.x): बैकअप डेटा फ़ील्ड उन्नत किए गए, server_password कॉलम जोड़ा गया
- **स्कीमा v4.0** (एप्लिकेशन v0.9.x / v1.0.x): उपयोगकर्ता एक्सेस नियंत्रण (उपयोगकर्ता, सत्र, audit_log तालिकाएं) जोड़ा गया
- **स्कीमा v4.1** (एप्लिकेशन v1.5.x): वैकल्पिक API-की प्रमाणीकरण, IP अनुमत सूचियों और अपलोड सीमाओं के लिए `api_keys` और डिफ़ॉल्ट कॉन्फ़िगरेशन कुंजियाँ जोड़ी गईं
- **स्कीमा v4.2** (एप्लिकेशन v1.5.x): वैकल्पिक दैनिक सारांश सूचनाएं के लिए `daily_summary_deliveries` बहीखाता और डिफ़ॉल्ट `daily_summary` कॉन्फ़िगरेशन जोड़ा गया

वर्तमान एप्लिकेशन संस्करण (v1.5.x) नवीनतम डेटाबेस स्कीमा संस्करण के रूप में **स्कीमा v4.2** का उपयोग करता है।

### माइग्रेशन प्रक्रिया {/* #migration-process */}

1. **स्वचालित बैकअप**: माइग्रेशन से पहले बैकअप बनाता है
2. **स्कीमा अपडेट**: डेटाबेस संरचना को अपडेट करता है
3. **डेटा माइग्रेशन**: मौजूदा डेटा को संरक्षित करता है
4. **सत्यापन**: सफल माइग्रेशन की पुष्टि करता है

## तालिकाएं {/* #tables */}

### सर्वर तालिका {/* #servers-table */}

निगरानी किए जा रहे Duplicati सर्वर के बारे में जानकारी संग्रहीत करता है।

#### फ़ील्ड {/* #fields */}

| Field             | Type             | विवरण                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | अद्वितीय सर्वर पहचानकर्ता           |
| `name`            | TEXT NOT NULL    | Duplicati से सर्वर नाम         |
| `server_url`      | TEXT             | Duplicati सर्वर URL               |
| `alias`           | TEXT             | उपयोगकर्ता द्वारा निर्धारित आसान नाम         |
| `note`            | TEXT             | उपयोगकर्ता द्वारा निर्धारित नोट्स/विवरण     |
| `server_password` | TEXT             | प्रमाणीकरण के लिए सर्वर पासवर्ड |
| `created_at`      | DATETIME         | सर्वर निर्माण टाइमस्टैम्प          |

### बैकअप तालिका {/* #backups-table */}

Duplicati सर्वर से प्राप्त बैकअप ऑपरेशन डेटा संग्रहीत करता है।

#### मुख्य फ़ील्ड {/* #key-fields */}

| फ़ील्ड              | प्रकार              | विवरण                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | अद्वितीय बैकअप पहचानकर्ता                       |
| `server_id`        | TEXT NOT NULL     | सर्वर तालिका का संदर्भ                     |
| `backup_name`      | TEXT NOT NULL     | बैकअप जॉब का नाम                                |
| `backup_id`        | TEXT NOT NULL     | Duplicati से बैकअप आईडी                       |
| `date`             | DATETIME NOT NULL | बैकअप निष्पादन समय                          |
| `status`           | TEXT NOT NULL     | बैकअप स्थिति (सफलता, चेतावनी, त्रुटि, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | सेकंड में अवधि                            |
| `size`             | INTEGER           | स्रोत फ़ाइलों का आकार                           |
| `uploaded_size`    | INTEGER           | अपलोड किए गए डेटा का आकार                          |
| `examined_files`   | INTEGER           | जाँची गई फ़ाइलों की संख्या                       |
| `warnings`         | INTEGER           | चेतावनियों की संख्या                             |
| `errors`           | INTEGER           | त्रुटियों की संख्या                               |
| `created_at`       | DATETIME          | रिकॉर्ड निर्माण टाइमस्टैम्प                      |

#### संदेश ऐरे (JSON संग्रहण) {/* #message-arrays-json-storage */}

| फ़ील्ड               | प्रकार | विवरण                             |
|---------------------|------|-----------------------------------------|
| `messages_array`    | TEXT | लॉग संदेशों का JSON ऐरे              |
| `warnings_array`    | TEXT | चेतावनी संदेशों का JSON ऐरे          |
| `errors_array`      | TEXT | त्रुटि संदेशों का JSON ऐरे            |
| `available_backups` | TEXT | उपलब्ध बैकअप वर्शन का JSON ऐरे |

#### फ़ाइल ऑपरेशन फ़ील्ड {/* #file-operation-fields */}

| फ़ील्ड                 | प्रकार    | विवरण                  |
|-----------------------|---------|------------------------------|
| `examined_files`      | INTEGER | बैकअप के दौरान जाँची गईं फ़ाइलें |
| `opened_files`        | INTEGER | बैकअप के लिए खोली गईं फ़ाइलें      |
| `added_files`         | INTEGER | बैकअप में जोड़ी गईं नई फ़ाइलें    |
| `modified_files`      | INTEGER | बैकअप में संशोधित की गईं फ़ाइलें     |
| `deleted_files`       | INTEGER | बैकअप से हटाई गईं फ़ाइलें    |
| `deleted_folders`     | INTEGER | बैकअप से हटाए गए फ़ोल्डर  |
| `added_folders`       | INTEGER | बैकअप में जोड़े गए फ़ोल्डर      |
| `modified_folders`    | INTEGER | बैकअप में संशोधित किए गए फ़ोल्डर   |
| `not_processed_files` | INTEGER | प्रोसेस न की गई फ़ाइलें          |
| `too_large_files`     | INTEGER | प्रोसेस करने के लिए बहुत बड़ी फ़ाइलें   |
| `files_with_error`    | INTEGER | त्रुटियों वाली फ़ाइलें            |
| `added_symlinks`      | INTEGER | जोड़े गए सिंबॉलिक लिंक         |
| `modified_symlinks`   | INTEGER | संशोधित किए गए सिंबॉलिक लिंक      |
| `deleted_symlinks`    | INTEGER | हटाए गए सिंबॉलिक लिंक       |

#### फ़ाइल आकार फ़ील्ड्स {/* #file-size-fields */}

| फ़ील्ड | प्रकार | विवरण |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | बैकअप के दौरान जाँची गई फ़ाइलों का आकार |
| `size_of_opened_files` | INTEGER | बैकअप के लिए खोली गई फ़ाइलों का आकार |
| `size_of_added_files` | INTEGER | बैकअप में जोड़ी गई नई फ़ाइलों का आकार |
| `size_of_modified_files` | INTEGER | बैकअप में संशोधित की गई फ़ाइलों का आकार |

#### ऑपरेशन स्थिति फ़ील्ड्स {/* #operation-status-fields */}

| फ़ील्ड | प्रकार | विवरण |
|--------------------------|-------------------|--------------------------------|
| `parsed_result` | TEXT NOT NULL | पार्स किया गया ऑपरेशन परिणाम |
| `main_operation` | TEXT NOT NULL | मुख्य ऑपरेशन प्रकार |
| `interrupted` | BOOLEAN | क्या बैकअप बाधित हुआ था |
| `partial_backup` | BOOLEAN | क्या बैकअप आंशिक था |
| `dryrun` | BOOLEAN | क्या बैकअप एक ड्राई रन था |
| `version` | TEXT | उपयोग किया गया Duplicati संस्करण |
| `begin_time` | DATETIME NOT NULL | बैकअप प्रारंभ समय |
| `end_time` | DATETIME NOT NULL | बैकअप समाप्ति समय |
| `warnings_actual_length` | INTEGER | वास्तविक चेतावनियों की संख्या |
| `errors_actual_length` | INTEGER | वास्तविक त्रुटियों की संख्या |
| `messages_actual_length` | INTEGER | वास्तविक संदेशों की संख्या |

#### बैकएंड आँकड़े फ़ील्ड्स {/* #backend-statistics-fields */}

| फ़ील्ड | प्रकार | विवरण |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded` | INTEGER | गंतव्य से डाउनलोड किए गए बाइट्स |
| `known_file_size` | INTEGER | गंतव्य पर ज्ञात फ़ाइल आकार |
| `last_backup_date`               | DATETIME | गंतव्य पर अंतिम बैकअप तिथि   |
| `backup_list_count`              | INTEGER  | बैकअप संस्करणों की संख्या         |
| `reported_quota_error`           | BOOLEAN  | कोटा त्रुटि रिपोर्ट की गई              |
| `reported_quota_warning`         | BOOLEAN  | कोटा चेतावनी रिपोर्ट की गई            |
| `backend_main_operation`         | TEXT     | बैकएंड मुख्य ऑपरेशन            |
| `backend_parsed_result`          | TEXT     | बैकएंड पार्स किया गया परिणाम             |
| `backend_interrupted`            | BOOLEAN  | बैकएंड ऑपरेशन बाधित हुआ     |
| `backend_version`                | TEXT     | बैकएंड संस्करण                   |
| `backend_begin_time`             | DATETIME | बैकएंड ऑपरेशन प्रारंभ समय      |
| `backend_duration`               | TEXT     | बैकएंड ऑपरेशन अवधि        |
| `backend_warnings_actual_length` | INTEGER  | बैकएंड चेतावनियों की संख्या            |
| `backend_errors_actual_length`   | INTEGER  | बैकएंड त्रुटियों की संख्या              |

### कॉन्फ़िगरेशन तालिका {/* #configurations-table */}

एप्लिकेशन कॉन्फ़िगरेशन सेटिंग्स संग्रहीत करता है।

#### फ़ील्ड {/* #fields-1 */}

| फ़ील्ड   | प्रकार                      | विवरण                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | कॉन्फ़िगरेशन कुंजी          |
| `value` | TEXT                      | कॉन्फ़िगरेशन मान (JSON) |

#### सामान्य कॉन्फ़िगरेशन कुंजियाँ {/* #common-configuration-keys */}

- `email_config`: ईमेल सूचना सेटिंग्स
- `ntfy_config`: NTFY सूचना सेटिंग्स
- `overdue_tolerance`: अतिदेय बैकअप सहनशीलता सेटिंग्स
- `notification_templates`: सूचना संदेश टेम्पलेट
- `daily_summary`: दैनिक सारांश मोड, शेड्यूल, टाइमज़ोन, वैकल्पिक सार्वजनिक डैशबोर्ड URL, और वैकल्पिक SMTP प्राप्तकर्ता ओवरराइड (`smtpRecipient`; खाली होने पर ईमेल सेटिंग्स का उपयोग करता है)
- `cron_service`: क्रॉन कार्य शेड्यूल, जिसमें `daily-summary-dispatch` (`daily_summary.utcTime` से `minute hour * * *`) शामिल है
- `audit_retention_days`: ऑडिट लॉग प्रतिधारण अवधि (डिफ़ॉल्ट: 90 दिन)

### डेटाबेस संस्करण तालिका {/* #database-version-table */}

माइग्रेशन के उद्देश्यों के लिए डेटाबेस स्कीमा संस्करण को ट्रैक करता है।

#### फ़ील्ड्स {/* #fields-2 */}

| फ़ील्ड        | प्रकार             | विवरण                |
|--------------|------------------|----------------------------|
| `version`    | TEXT PRIMARY KEY | डेटाबेस संस्करण           |
| `applied_at` | DATETIME         | जब माइग्रेशन लागू किया गया था |

### उपयोगकर्ता तालिका {/* #users-table */}

प्रमाणीकरण और एक्सेस नियंत्रण के लिए उपयोगकर्ता खाता जानकारी संग्रहीत करता है।

#### फ़ील्ड्स {/* #fields-3 */}

| फ़ील्ड                   | प्रकार                 | विवरण                         |
|-------------------------|----------------------|-------------------------------------|
| `id`                    | TEXT PRIMARY KEY     | विशिष्ट उपयोगकर्ता पहचानकर्ता              |
| `username`              | TEXT UNIQUE NOT NULL | लॉगिन के लिए उपयोगकर्ता नाम                  |
| `password_hash`         | TEXT NOT NULL        | Bcrypt हैश किया गया पासवर्ड              |
| `is_admin`              | BOOLEAN NOT NULL     | क्या उपयोगकर्ता के पास एडमिन विशेषाधिकार हैं   |
| `must_change_password`  | BOOLEAN              | क्या पासवर्ड बदलना आवश्यक है |
| `created_at`            | DATETIME             | खाता निर्माण टाइमस्टैम्प          |
| `updated_at`       | DATETIME         | अंतिम अपडेट टाइमस्टैम्प                                                        |
| `last_login_at`         | DATETIME             | अंतिम सफल लॉगिन टाइमस्टैम्प     |
| `last_login_ip`         | TEXT                 | अंतिम लॉगिन का आईपी पता            |
| `failed_login_attempts` | INTEGER              | असफल लॉगिन प्रयासों की संख्या      |
| `locked_until`          | DATETIME             | खाता लॉक समाप्ति (यदि लॉक किया गया है) |

### सत्र तालिका {/* #sessions-table */}

प्रमाणीकरण और सुरक्षा के लिए उपयोगकर्ता सेशन डेटा संग्रहीत करता है।

#### फ़ील्ड {/* #fields-4 */}

| फ़ील्ड             | प्रकार              | विवरण                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | सेशन पहचानकर्ता                                               |
| `user_id`         | TEXT              | उपयोगकर्ता तालिका का संदर्भ (अप्रमाणीकृत सेशन के लिए नलेबल) |
| `created_at`      | DATETIME          | सेशन निर्माण टाइमस्टैम्प                                       |
| `last_accessed`   | DATETIME          | अंतिम एक्सेस टाइमस्टैम्प                                            |
| `expires_at`      | DATETIME NOT NULL | सेशन समाप्ति टाइमस्टैम्प                                     |
| `ip_address`      | TEXT              | सेशन उत्पत्ति का आईपी पता                                     |
| `user_agent`    | TEXT                              | यूज़र एजेंट स्ट्रिंग                                                 |
| `csrf_token`      | TEXT              | सेशन के लिए CSRF टोकन                                       |
| `csrf_expires_at` | DATETIME          | CSRF टोकन समाप्ति                                            |

### ऑडिट लॉग तालिका {/* #audit-log-table */}

उपयोगकर्ता की कार्रवाइयों और सिस्टम इवेंट का ऑडिट ट्रेल संग्रहीत करता है।

#### फ़ील्ड {/* #fields-5 */}

| फ़ील्ड           | प्रकार                              | विवरण                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | विशिष्ट ऑडिट लॉग प्रविष्टि पहचानकर्ता                                 |
| `timestamp`     | DATETIME                          | इवेंट टाइमस्टैम्प                                                   |
| `user_id`       | TEXT                              | उपयोगकर्ता तालिका का संदर्भ (नलेबल)                               |
| `username`      | TEXT                              | कार्रवाई के समय उपयोगकर्ता नाम                                        |
| `action`        | TEXT NOT NULL                     | की गई कार्रवाई                                                  |
| `category`      | TEXT NOT NULL                     | कार्रवाई की श्रेणी (उदा., 'प्रमाणीकरण', 'सेटिंग्स', 'बैकअप') |
| `target_type`   | TEXT                              | लक्ष्य का प्रकार (जैसे, 'सर्वर', 'बैकअप', 'उपयोगकर्ता')                 |
| `target_id`     | TEXT                              | लक्ष्य का पहचानकर्ता (Identifier)                                              |
| `details`       | TEXT                              | अतिरिक्त विवरण (JSON)                                         |
| `ip_address`    | TEXT                              | अनुरोधकर्ता का आईपी पता                                           |
| `user_agent`    | TEXT                              | यूज़र एजेंट स्ट्रिंग                                                 |
| `status`        | TEXT NOT NULL                     | कार्रवाई की स्थिति ('success', 'विफलता', 'त्रुटि')                  |
| `error_message` | TEXT                              | कार्रवाई विफल होने पर त्रुटि संदेश                                    |

### API कुंजियाँ तालिका {/* #api-keys-table */}

बाहरी HTTP API के लिए हैश की गई API कुंजियाँ संग्रहीत करता है। प्लेनटेक्स्ट सीक्रेट निर्माण के समय केवल एक बार दिखाया जाता है और इसे कभी नहीं संग्रहीत किया जाता है।

#### फ़ील्ड्स {/* #fields-6 */}

| फ़ील्ड          | प्रकार             | विवरण                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | अद्वितीय कुंजी पहचानकर्ता                                    |
| `name`         | TEXT NOT NULL    | प्रदर्शित नाम                                             |
| `key_hash`     | TEXT UNIQUE      | सीक्रेट का SHA-256 हैश                               |
| `key_prefix`   | TEXT             | सीक्रेट के पहले चार वर्ण (फ़िंगरप्रिंट के लिए)   |
| `key_suffix`   | TEXT             | सीक्रेट के अंतिम चार वर्ण (फ़िंगरप्रिंट के लिए)    |
| `scope`        | TEXT NOT NULL    | `upload` और `read`                                       |
| `description`  | TEXT             | वैकल्पिक विवरण                                     |
| `enabled`      | INTEGER          | `1` जब कुंजी सक्रिय हो                               |
| `created_at`   | DATETIME         | निर्माण टाइमस्टैम्प                                       |
| `created_by`   | TEXT             | कुंजी बनाने वाले व्यवस्थापक (administrator) की उपयोगकर्ता ID         |
| `expires_at`   | DATETIME         | वैकल्पिक समाप्ति                                          |
| `last_used_at` | DATETIME         | अंतिम सफल उपयोग                                      |
| `usage_count`  | INTEGER          | सफल उपयोगों की संख्या                                     |

`configurations` तालिका में संबंधित कॉन्फ़िगरेशन कुंजियाँ: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`।

### दैनिक सारांश वितरण तालिका {/* #daily-summary-deliveries-table */}

दैनिक सारांश ईमेल वितरण के लिए प्रति-चैनल लेज़र। लेगेसी पंक्तियों में पुराने रिलीज़ से `ntfy` चैनल शामिल हो सकता है। प्रत्येक निर्धारित घटना (या अद्वितीय मैनुअल भेजने) के लिए प्रति चैनल अधिकतम एक पंक्ति होती है। रेंडर किए गए पेलोड भेजने से पहले संग्रहीत किए जाते हैं ताकि पुनः प्रयास समान स्नैपशॉट बनाए रखें। 30 दिनों से पुरानी पंक्तियों को हटा दिया जाता है।

यदि किसी प्रदाता द्वारा संदेश स्वीकार किए जाने के बाद लेकिन सफलता रिकॉर्ड होने से पहले प्रक्रिया समाप्त हो जाती है, तो उस चैनल का पुनः प्रयास किया जा सकता है (कम से कम एक बार)।

#### फ़ील्ड {/* #fields-7 */}

| Field              | Type             | विवरण                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | अद्वितीय वितरण पहचानकर्ता                                                  |
| `occurrence_key`   | TEXT NOT NULL    | निर्धारित कुंजी `scheduled:UTC:{date}:{HH:mm}` या `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` या `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, या `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | स्नैपशॉट के लिए स्थानीय कैलेंडर तिथि                                        |
| `time_zone`        | TEXT NOT NULL    | सहेजा गया IANA टाइमज़ोन                                                         |
| `payload_json`     | TEXT             | रेंडर किया गया विषय, HTML, टेक्स्ट, और NTFY फ़ील्ड                               |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, या `failed`                                   |
| `attempt_count`    | INTEGER          | वितरण के प्रयास                                                           |
| `next_retry_at`    | DATETIME         | जब किसी विफल चैनल पर फिर से दावा किया जा सकता है                                  |
| `lease_expires_at` | DATETIME         | क्लेम लीज; पुरानी लीज को पुनर्प्राप्त किया जा सकता है                                 |
| `error`            | TEXT             | अंतिम त्रुटि, यदि कोई हो                                                          |
| `created_at`       | DATETIME         | पंक्ति निर्माण टाइमस्टैम्प                                                   |
| `updated_at`       | DATETIME         | अंतिम अपडेट टाइमस्टैम्प                                                        |
| `sent_at`          | DATETIME         | सफलता टाइमस्टैम्प                                                           |

`(occurrence_key, channel)` पर एक यूनिक इंडेक्स एक ही चैनल पर एक ही घटना को दोबारा भेजे जाने से रोकता है।

## सत्र प्रबंधन {/* #session-management */}

### डेटाबेस-समर्थित सत्र संग्रहण {/* #database-backed-session-storage */}

सत्रों को इन-मेमोरी फ़ॉलबैक के साथ डेटाबेस में संग्रहीत किया जाता है:
- **प्राथमिक संग्रहण**: डेटाबेस-समर्थित sessions तालिका
- **फ़ॉलबैक**: इन-मेमोरी संग्रहण (लीगेसी समर्थन या त्रुटि के मामले)
- **सत्र ID**: क्रिप्टोग्राफ़िक रूप से सुरक्षित रैंडम स्ट्रिंग
- **समाप्ति**: कॉन्फ़िगर करने योग्य सत्र टाइमआउट
- **CSRF सुरक्षा**: क्रॉस-साइट रिक्वेस्ट फ़ोर्जरे सुरक्षा
- **स्वचालित सफ़ाई**: समाप्त सत्रों को स्वचालित रूप से हटा दिया जाता है

### सत्र API एंडपॉइंट्स {/* #session-api-endpoints */}

- `POST /api/session`: नया सत्र बनाएं
- `GET /api/session`: मौजूदा सत्र को मान्य करें
- `DELETE /api/session`: सत्र नष्ट करें
- `GET /api/csrf`: CSRF टोकन प्राप्त करें

## इंडेक्स {/* #indexes */}

डेटाबेस में इष्टतम क्वेरी प्रदर्शन के लिए कई इंडेक्स शामिल हैं:

- **Primary Keys**: सभी तालिकाओं में प्राथमिक कुंजी इंडेक्स होते हैं
- **Foreign Keys**: backups तालिका में सर्वर संदर्भ, sessions और audit_log में उपयोगकर्ता संदर्भ
- **क्वेरी अनुकूलन**: बार-बार क्वेरी किए जाने वाले फ़ील्ड पर इंडेक्स
- **तिथि इंडेक्स**: समय-आधारित क्वेरी के लिए तिथि फ़ील्ड पर इंडेक्स
- **उपयोगकर्ता इंडेक्स**: तेज़ उपयोगकर्ता लुकअप के लिए उपयोगकर्ता नाम इंडेक्स
- **सत्र इंडेक्स**: सत्र प्रबंधन के लिए Expiration और user_id इंडेक्स
- **ऑडिट इंडेक्स**: ऑडिट क्वेरी के लिए टाइमस्टैम्प, user_id, कार्रवाई, श्रेणी, और स्थिति इंडेक्स
- **API कुंजी इंडेक्स**: प्रमाणीकरण के लिए यूनिक हैश, साथ ही सक्षम/स्कोप लुकअप

## संबंध {/* #relationships */}

- **सर्वर → बैकअप**: वन-टू-मेनी संबंध
- **उपयोगकर्ता → सत्र**: वन-टू-मेनी संबंध (सत्र उपयोगकर्ताओं के बिना भी मौजूद हो सकते हैं)
- **उपयोगकर्ता → ऑडिट लॉग**: वन-टू-मेनी संबंध (ऑडिट प्रविष्टियाँ उपयोगकर्ताओं के बिना भी मौजूद हो सकती हैं)
- **उपयोगकर्ता → API कुंजियाँ**: `created_by` के माध्यम से वन-टू-मेनी संबंध (उपयोगकर्ता हटाए जाने के बाद भी कुंजियाँ बनी रहती हैं)
- **बैकअप → संदेश**: एम्बेडेड JSON ऐरे
- **कॉन्फ़िगरेशन**: की-वैल्यू संग्रहण

## डेटा प्रकार {/* #data-types */}

- **TEXT**: स्ट्रिंग डेटा, JSON ऐरे
- **INTEGER**: संख्यात्मक डेटा, फ़ाइल संख्या, आकार
- **REAL**: फ़्लोटिंग-पॉइंट संख्याएँ, अवधियाँ
- **DATETIME**: टाइमस्टैम्प डेटा
- **BOOLEAN**: सत्य/असत्य मान

## बैकअप स्थिति के मान {/* #backup-status-values */}

- **Success**: बैकअप सफलतापूर्वक पूरा हुआ
- **Warning**: बैकअप चेतावनियों के साथ पूरा हुआ
- **Error**: बैकअप त्रुटियों के साथ पूरा हुआ
- **Fatal**: बैकअप गंभीर रूप से (fatally) विफल हुआ

## सामान्य क्वेरीज़ {/* #common-queries */}

### किसी सर्वर के लिए नवीनतम बैकअप प्राप्त करें {/* #get-latest-backup-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC 
LIMIT 1;
```

### किसी सर्वर के लिए सभी बैकअप प्राप्त करें {/* #get-all-backups-for-a-server */}

```sql
SELECT * FROM backups 
WHERE server_id = ? 
ORDER BY date DESC;
```

### सर्वर सारांश प्राप्त करें {/* #get-server-summary */}

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

### समग्र सारांश प्राप्त करें {/* #get-overall-summary */}

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

### डेटाबेस क्लीनअप {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## डेटाबेस मैपिंग के लिए JSON {/* #json-to-database-mapping */}

### डेटाबेस कॉलम मैपिंग के लिए API अनुरोध बॉडी {/* #api-request-body-to-database-columns-mapping */}

जब Duplicati HTTP POST के माध्यम से बैकअप डेटा भेजता है, तो JSON संरचना को डेटाबेस कॉलम में मैप किया जाता है:

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

**ध्यान दें**: बैकअप तालिका में `size` फ़ील्ड `SizeOfExaminedFiles` को संग्रहीत करता है और `uploaded_size` बैकअप कार्रवाई से वास्तविक अपलोड किया गया/ट्रांसफ़र किया गया आकार संग्रहीत करता है।
