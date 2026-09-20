# डेटाबेस स्कीमा {/* #database-schema */}

यह दस्तावेज़ एसक्यूलाइट डेटाबेस स्कीमा का वर्णन करता है जिसका उपयोग बैकअप ऑपरेशन डेटा को संग्रहीत करने के लिए duplistatus द्वारा किया जाता है।

## डेटाबेस स्थान {/* #database-location */}

एप्लिकेशन डेटा निर्देशिका में डेटाबेस संग्रहीत किया गया है:
- **डिफ़ॉल्ट स्थान**: `/app/data/backups.db`
- **डॉकर वॉल्यूम**: `duplistatus_data:/app/data`
- **फ़ाइल नाम**: `backups.db`

## डेटाबेस माइग्रेशन सिस्टम {/* #database-migration-system */}

duplistatus संस्करणों के बीच डेटाबेस स्कीमा परिवर्तनों को संभालने के लिए एक स्वचालित माइग्रेशन सिस्टम का उपयोग करता है।

### माइग्रेशन संस्करण इतिहास {/* #migration-version-history */}

निम्नलिखित ऐतिहासिक माइग्रेशन संस्करण हैं जिन्होंने डेटाबेस को इसकी वर्तमान स्थिति में लाया:

- **स्कीमा v1.0** (एप्लिकेशन v0.6.x और उससे पहले): मशीनों और बैकअप तालिकाओं के साथ प्रारंभिक डेटाबेस स्कीमा
- **स्कीमा v2.0** (एप्लिकेशन v0.7.x): अनुपस्थित कॉलम और कॉन्फ़िगरेशन तालिका जोड़ी गई
- **स्कीमा v3.0** (एप्लिकेशन v0.7.x): मशीन तालिका का नाम बदलकर सर्वर कर दिया गया, server_url कॉलम जोड़ा गया
- **स्कीमा v3.1** (एप्लिकेशन v0.8.x): बैकअप डेटा फ़ील्ड में सुधार किया गया, server_password कॉलम जोड़ा गया
- **स्कीमा v4.0** (एप्लिकेशन v0.9.x / v1.0.x): उपयोगकर्ता एक्सेस नियंत्रण जोड़ा गया (उपयोगकर्ता, सत्र, ऑडिट_लॉग तालिकाएँ)
- **स्कीमा v4.1** (एप्लिकेशन v1.5.x): वैकल्पिक एपीआई-कुंजी प्रमाणीकरण, आईपी अनुमति सूचियों और अपलोड सीमाओं के लिए `api_keys` और डिफ़ॉल्ट कॉन्फ़िगरेशन कुंजियाँ जोड़ी गईं
- **स्कीमा v4.2** (एप्लिकेशन v1.5.x): वैकल्पिक दैनिक सारांश सूचनाओं के लिए `daily_summary_deliveries` लेजर और डिफ़ॉल्ट `daily_summary` कॉन्फ़िगरेशन जोड़ा गया

वर्तमान एप्लिकेशन संस्करण (v1.5.x) **स्कीमा v4.2** का उपयोग नवीनतम डेटाबेस स्कीमा संस्करण के रूप में करता है।

### माइग्रेशन प्रक्रिया {/* #migration-process */}

1. **स्वचालित बैकअप**: माइग्रेशन से पहले बैकअप बनाता है
2. **स्कीमा अपडेट**: डेटाबेस संरचना अपडेट करता है
3. **डेटा माइग्रेशन**: मौजूदा डेटा को संरक्षित रखता है
4. **सत्यापन**: सफल माइग्रेशन की पुष्टि करता है

## तालिकाएँ {/* #tables */}

### सर्वर तालिका {/* #servers-table */}

निगरानी किए जा रहे डुप्लिकाती सर्वर के बारे में जानकारी संग्रहीत करता है।

#### फ़ील्ड {/* #fields */}

| फ़ील्ड             | प्रकार             | विवरण                        |
|-------------------|------------------|------------------------------------|
| `id`              | TEXT PRIMARY KEY | अद्वितीय सर्वर पहचानकर्ता           |
| `name`            | TEXT NOT NULL    | डुप्लिकाती से सर्वर नाम         |
| `server_url`      | TEXT             | डुप्लिकाती सर्वर यूआरएल               |
| `alias`           | TEXT             | उपयोगकर्ता-परिभाषित मैत्रीपूर्ण नाम         |
| `note`            | TEXT             | उपयोगकर्ता-परिभाषित टिप्पणियाँ/विवरण     |
| `server_password` | TEXT             | प्रमाणीकरण के लिए सर्वर पासवर्ड |
| `created_at`      | DATETIME         | सर्वर निर्माण टाइमस्टैम्प          |

### बैकअप तालिका {/* #backups-table */}

Duplicati सर्वर से प्राप्त बैकअप संचालन डेटा संग्रहीत करता है।

#### प्रमुख क्षेत्र {/* #key-fields */}

| क्षेत्र              | प्रकार              | विवरण                                    |
|--------------------|-------------------|------------------------------------------------|
| `id`               | TEXT PRIMARY KEY  | अद्वितीय बैकअप पहचानकर्ता                       |
| `server_id`        | TEXT NOT NULL     | सर्वर तालिका के संदर्भ                     |
| `backup_name`      | TEXT NOT NULL     | बैकअप नौकरी का नाम                                |
| `backup_id`        | TEXT NOT NULL     | Duplicati से बैकअप आईडी                       |
| `date`             | DATETIME NOT NULL | बैकअप निष्पादन समय                          |
| `status`           | TEXT NOT NULL     | बैकअप स्थिति (सफलता, चेतावनी, त्रुटि, Fatal) |
| `duration_seconds` | INTEGER NOT NULL  | सेकंड में अवधि                            |
| `size`             | INTEGER           | स्रोत फ़ाइलों का आकार                           |
| `uploaded_size`    | INTEGER           | अपलोड किए गए डेटा का आकार                          |
| `examined_files`   | INTEGER           | निरीक्षण की गई फ़ाइलों की संख्या                       |
| `warnings`         | INTEGER           | चेतावनियों की संख्या                             |
| `errors`           | INTEGER           | त्रुटियों की संख्या                               |
| `created_at`       | DATETIME          | रिकॉर्ड निर्माण टाइमस्टैम्प                      |

#### संदेश सरणियाँ (JSON संग्रहण) {/* #message-arrays-json-storage */}

| क्षेत्र | प्रकार | विवरण |
|---------------------|------|-----------------------------------------|
| `messages_array` | TEXT | लॉग संदेशों की JSON सरणी |
| `warnings_array` | TEXT | चेतावनी संदेशों की JSON सरणी |
| `errors_array` | TEXT | त्रुटि संदेशों की JSON सरणी |
| `available_backups` | TEXT | उपलब्ध बैकअप वर्शन की JSON सरणी |

#### फ़ाइल संचालन क्षेत्र {/* #file-operation-fields */}

| क्षेत्र | प्रकार | विवरण |
|-----------------------|---------|------------------------------|
| `examined_files` | INTEGER | बैकअप के दौरान जांची गई फ़ाइलें |
| `opened_files` | INTEGER | बैकअप के लिए खोली गई फ़ाइलें |
| `added_files` | INTEGER | बैकअप में जोड़ी गई नई फ़ाइलें |
| `modified_files` | INTEGER | बैकअप में संशोधित फ़ाइलें |
| `deleted_files` | INTEGER | बैकअप से हटाई गई फ़ाइलें |
| `deleted_folders` | INTEGER | बैकअप से हटाए गए फ़ोल्डर |
| `added_folders` | INTEGER | बैकअप में जोड़े गए फ़ोल्डर |
| `modified_folders` | INTEGER | बैकअप में संशोधित फ़ोल्डर |
| `not_processed_files` | INTEGER | अप्रक्रियाकृत फ़ाइलें |
| `too_large_files` | INTEGER | प्रक्रिया करने के लिए बहुत बड़ी फ़ाइलें |
| `files_with_error` | INTEGER | त्रुटियों वाली फ़ाइलें |
| `added_symlinks` | INTEGER | जोड़े गए सांकेतिक लिंक |
| `modified_symlinks` | INTEGER | संशोधित सांकेतिक लिंक |
| `deleted_symlinks` | INTEGER | हटाए गए सांकेतिक लिंक |

#### फ़ाइल आकार क्षेत्र {/* #file-size-fields */}

| क्षेत्र | प्रकार | विवरण |
|--------------------------|---------|--------------------------------------|
| `size_of_examined_files` | INTEGER | बैकअप के दौरान निरीक्षण की गई फ़ाइलों का आकार |
| `size_of_opened_files` | INTEGER | बैकअप के लिए खोली गई फ़ाइलों का आकार |
| `size_of_added_files` | INTEGER | बैकअप में जोड़ी गई नई फ़ाइलों का आकार |
| `size_of_modified_files` | INTEGER | बैकअप में संशोधित फ़ाइलों का आकार |

#### संचालन स्थिति क्षेत्र {/* #operation-status-fields */}

| क्षेत्र | प्रकार | विवरण |
|--------------------------|-------------------|--------------------------------|
| `parsed_result` | TEXT NOT NULL | पार्स किया गया संचालन परिणाम |
| `main_operation` | TEXT NOT NULL | मुख्य संचालन प्रकार |
| `interrupted` | BOOLEAN | क्या बैकअप बाधित हुआ था |
| `partial_backup` | BOOLEAN | क्या बैकअप आंशिक था |
| `dryrun` | BOOLEAN | क्या बैकअप ड्राई रन था |
| `version` | TEXT | उपयोग किया गया duplicati संस्करण |
| `begin_time` | DATETIME NOT NULL | बैकअप शुरू होने का समय |
| `end_time` | DATETIME NOT NULL | बैकअप समाप्ति समय |
| `warnings_actual_length` | INTEGER | वास्तविक चेतावनियाँ गिनती |
| `errors_actual_length` | INTEGER | वास्तविक त्रुटियाँ गिनती |
| `messages_actual_length` | INTEGER | वास्तविक संदेश गिनती |

#### बैकएंड आँकड़े क्षेत्र {/* #backend-statistics-fields */}

| क्षेत्र | प्रकार | विवरण |
|----------------------------------|----------|-----------------------------------|
| `bytes_downloaded` | INTEGER | गंतव्य से डाउनलोड किए गए बाइट्स |
| `known_file_size` | INTEGER | गंतव्य पर ज्ञात फ़ाइल आकार |
| `last_backup_date`               | DATETIME | गंतव्य पर अंतिम बैकअप तिथि   |
| `backup_list_count`              | INTEGER  | बैकअप संस्करणों की संख्या         |
| `reported_quota_error`           | BOOLEAN  | कोटा त्रुटि रिपोर्ट की गई              |
| `reported_quota_warning`         | BOOLEAN  | कोटा चेतावनी रिपोर्ट की गई            |
| `backend_main_operation`         | TEXT     | बैकएंड मुख्य संचालन            |
| `backend_parsed_result`          | TEXT     | बैकएंड पार्स किया गया परिणाम             |
| `backend_interrupted`            | BOOLEAN  | बैकएंड संचालन बाधित किया गया     |
| `backend_version`                | TEXT     | बैकएंड संस्करण                   |
| `backend_begin_time`             | DATETIME | बैकएंड संचालन शुरू होने का समय      |
| `backend_duration`               | TEXT     | बैकएंड संचालन अवधि        |
| `backend_warnings_actual_length` | INTEGER  | बैकएंड चेतावनियों की गिनती            |
| `backend_errors_actual_length`   | INTEGER  | बैकएंड त्रुटियों की गिनती              |

### कॉन्फ़िगरेशन तालिका {/* #configurations-table */}

एप्लिकेशन कॉन्फ़िगरेशन सेटिंग्स को संग्रहीत करता है।

#### फ़ील्ड्स {/* #fields-1 */}

| फ़ील्ड   | प्रकार                      | विवरण                |
|---------|---------------------------|----------------------------|
| `key`   | TEXT PRIMARY KEY NOT NULL | कॉन्फ़िगरेशन कुंजी          |
| `value` | TEXT                      | कॉन्फ़िगरेशन मान (JSON) |

#### सामान्य कॉन्फ़िगरेशन कुंजियाँ {/* #common-configuration-keys */}

- `email_config`: ईमेल अधिसूचना सेटिंग्स
- `ntfy_config`: NTFY अधिसूचना सेटिंग्स
- `overdue_tolerance`: अतिदेय बैकअप सहिष्णुता सेटिंग्स
- `notification_templates`: अधिसूचना संदेश टेम्पलेट
- `daily_summary`: दैनिक सारांश मोड, अनुसूची, समय क्षेत्र, वैकल्पिक सार्वजनिक डैशबोर्ड URL, और वैकल्पिक SMTP प्राप्तकर्ता ओवरराइड (`smtpRecipient`; खाली ईमेल सेटिंग्स का उपयोग करता है)
- `cron_service`: क्रॉन कार्य अनुसूचियाँ, जिसमें `daily-summary-dispatch` शामिल है (`daily_summary.utcTime` के `minute hour * * *` से)
- `audit_retention_days`: ऑडिट लॉग प्रतिधारण अवधि (डिफ़ॉल्ट: 90 दिन)

### डेटाबेस संस्करण तालिका {/* #database-version-table */}

माइग्रेशन उद्देश्यों के लिए डेटाबेस स्कीमा संस्करण को ट्रैक करता है।

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
| `id`                    | TEXT PRIMARY KEY     | अद्वितीय उपयोगकर्ता पहचानकर्ता              |
| `username`              | TEXT UNIQUE NOT NULL | लॉगिन के लिए उपयोगकर्ता नाम                  |
| `password_hash`         | TEXT NOT NULL        | Bcrypt हैश किया गया पासवर्ड              |
| `is_admin`              | BOOLEAN NOT NULL     | क्या उपयोगकर्ता के पास एडमिन अधिकार हैं   |
| `must_change_password`  | BOOLEAN              | क्या पासवर्ड परिवर्तन आवश्यक है |
| `created_at`            | DATETIME             | खाता निर्माण टाइमस्टैम्प          |
| `updated_at`       | DATETIME         | अंतिम अपडेट टाइमस्टैम्प                                                       |
| `last_login_at`         | DATETIME             | अंतिम सफल लॉगिन टाइमस्टैम्प     |
| `last_login_ip`         | TEXT                 | अंतिम लॉगिन का आईपी पता            |
| `failed_login_attempts` | INTEGER              | असफल लॉगिन प्रयासों की गिनती      |
| `locked_until`          | DATETIME             | खाता लॉक समाप्ति (यदि लॉक किया गया हो) |

### सत्र तालिका {/* #sessions-table */}

प्रमाणीकरण और सुरक्षा के लिए उपयोगकर्ता सत्र डेटा संग्रहीत करता है।

#### फ़ील्ड्स {/* #fields-4 */}

| फ़ील्ड             | प्रकार              | विवरण                                                      |
|-------------------|-------------------|------------------------------------------------------------------|
| `id`              | TEXT PRIMARY KEY  | सत्र पहचानकर्ता                                               |
| `user_id`         | TEXT              | उपयोगकर्ता तालिका के संदर्भ (अप्रमाणित सत्रों के लिए शून्य संभावित) |
| `created_at`      | DATETIME          | सत्र निर्माण टाइमस्टैंप                                       |
| `last_accessed`   | DATETIME          | अंतिम पहुंच टाइमस्टैंप                                            |
| `expires_at`      | DATETIME NOT NULL | सत्र समाप्ति टाइमस्टैंप                                     |
| `ip_address`      | TEXT              | सत्र मूल का आईपी पता                                     |
| `user_agent`    | TEXT                              | यूज़र एजेंट स्ट्रिंग                                                 |
| `csrf_token`      | TEXT              | सत्र के लिए CSRF टोकन                                       |
| `csrf_expires_at` | DATETIME          | CSRF टोकन समाप्ति                                            |

### ऑडिट लॉग तालिका {/* #audit-log-table */}

उपयोगकर्ता कार्रवाइयों और सिस्टम घटनाओं का ऑडिट ट्रेल संग्रहीत करता है।

#### फ़ील्ड्स {/* #fields-5 */}

| फ़ील्ड           | प्रकार                              | विवरण                                                       |
|-----------------|-----------------------------------|-------------------------------------------------------------------|
| `id`            | INTEGER PRIMARY KEY AUTOINCREMENT | अद्वितीय ऑडिट लॉग प्रविष्टि पहचानकर्ता                                 |
| `timestamp`     | DATETIME                          | घटना टाइमस्टैंप                                                   |
| `user_id`       | TEXT                              | उपयोगकर्ता तालिका के संदर्भ (शून्य संभावित)                               |
| `username`      | TEXT                              | कार्रवाई के समय उपयोगकर्ता नाम                                        |
| `action`        | TEXT NOT NULL                     | की गई कार्रवाई                                                  |
| `category`      | TEXT NOT NULL                     | कार्रवाई की श्रेणी (जैसे, 'प्रमाणीकरण', 'सेटिंग्स', 'बैकअप') |
| `target_type`   | TEXT                              | लक्ष्य का प्रकार ('server', 'backup', 'user' आदि)                 |
| `target_id`     | TEXT                              | लक्ष्य का पहचानकर्ता                                              |
| `details`       | TEXT                              | अतिरिक्त विवरण (JSON)                                         |
| `ip_address`    | TEXT                              | अनुरोधकर्ता का आईपी पता                                           |
| `user_agent`    | TEXT                              | यूज़र एजेंट स्ट्रिंग                                                 |
| `status`        | TEXT NOT NULL                     | कार्रवाई की स्थिति ('success', 'failure', 'error')                  |
| `error_message` | TEXT                              | यदि कार्रवाई विफल होती है तो त्रुटि संदेश                                    |

### API कुंजियाँ तालिका {/* #api-keys-table */}

बाहरी HTTP APIs के लिए हैश की गई API कुंजियाँ संग्रहीत करता है। सादा पाठ रहस्य को केवल एक बार बनाते समय दिखाया जाता है और कभी भी संग्रहीत नहीं किया जाता है।

#### फ़ील्ड्स {/* #fields-6 */}

| फ़ील्ड          | प्रकार             | विवरण                                              |
|----------------|------------------|----------------------------------------------------------|
| `id`           | TEXT PRIMARY KEY | अद्वितीय कुंजी पहचानकर्ता                                    |
| `name`         | TEXT NOT NULL    | प्रदर्शन नाम                                             |
| `key_hash`     | TEXT UNIQUE      | रहस्य का SHA-256 हैश                               |
| `key_prefix`   | TEXT             | रहस्य के पहले चार वर्ण (फिंगरप्रिंट के लिए)   |
| `key_suffix`   | TEXT             | रहस्य के अंतिम चार वर्ण (फिंगरप्रिंट के लिए)    |
| `scope`        | TEXT NOT NULL    | `upload` या `read`                                       |
| `description`  | TEXT             | वैकल्पिक विवरण                                     |
| `enabled`      | INTEGER          | कुंजी सक्रिय होने पर `1`                               |
| `created_at`   | DATETIME         | निर्माण टाइमस्टैम्प                                       |
| `created_by`   | TEXT             | उस प्रशासक का उपयोगकर्ता आईडी जिसने कुंजी बनाई         |
| `expires_at`   | DATETIME         | वैकल्पिक समाप्ति                                          |
| `last_used_at` | DATETIME         | अंतिम सफल उपयोग                                      |
| `usage_count`  | INTEGER          | सफल उपयोग गणना                                     |

`configurations` तालिका में संबंधित विन्यास कुंजियाँ: `external_api_require_api_key`, `ip_trusted_proxies`, `admin_ip_allowlist`, `external_api_ip_allowlist`, `upload_limits`।

### दैनिक सारांश वितरण तालिका {/* #daily-summary-deliveries-table */}

दैनिक सारांश ईमेल वितरण के लिए प्रति-चैनल लेजर। पुरानी पंक्तियों में पिछले रिलीज़ से `ntfy` चैनल शामिल हो सकता है। प्रत्येक निर्धारित घटना (या अद्वितीय मैनुअल भेजना) के लिए प्रति चैनल अधिकतम एक पंक्ति होती है। पुन: प्रयास करने पर भी समान स्नैपशॉट बनाए रखने के लिए भेजे जाने से पहले प्रस्तुत पेलोड संग्रहीत किए जाते हैं। 30 दिन से अधिक पुरानी पंक्तियाँ हटा दी जाती हैं।

यदि कोई प्रदाता संदेश स्वीकार करने के बाद लेकिन सफलता दर्ज करने से पहले प्रक्रिया समाप्त हो जाती है, तो उस चैनल को पुन: प्रयास किया जा सकता है (कम से कम एक बार)।

#### फ़ील्ड्स {/* #fields-7 */}

| फ़ील्ड              | प्रकार             | विवरण                                                                 |
|--------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | TEXT PRIMARY KEY | अद्वितीय वितरण पहचानकर्ता                                                  |
| `occurrence_key`   | TEXT NOT NULL    | निर्धारित कुंजी `scheduled:UTC:{date}:{HH:mm}` या `manual:{uuid}`             |
| `channel`          | TEXT NOT NULL    | `email` या `ntfy`                                                           |
| `trigger`          | TEXT NOT NULL    | `scheduled`, `manual`, या `retry`                                           |
| `summary_date`     | TEXT NOT NULL    | स्नैपशॉट के लिए स्थानीय कैलेंडर तिथि                                        |
| `time_zone`        | TEXT NOT NULL    | सहेजा गया IANA टाइमज़ोन                                                         |
| `payload_json`     | TEXT             | प्रस्तुत विषय, HTML, पाठ, और NTFY फ़ील्ड्स                               |
| `state`            | TEXT NOT NULL    | `pending`, `sending`, `sent`, या `failed`                                   |
| `attempt_count`    | INTEGER          | वितरण प्रयास                                                           |
| `next_retry_at`    | DATETIME         | जब एक विफल चैनल को फिर से दावा किया जा सकता है                                  |
| `lease_expires_at` | DATETIME         | दावा किराया; एक पुराना किराया पुनर्प्राप्त किया जा सकता है                                 |
| `error`            | TEXT             | अंतिम त्रुटि, यदि कोई हो                                                          |
| `created_at`       | DATETIME         | पंक्ति निर्माण टाइमस्टैम्प                                                      |
| `updated_at`       | DATETIME         | अंतिम अपडेट टाइमस्टैम्प                                                       |
| `sent_at`          | DATETIME         | सफलता टाइमस्टैम्प                                                           |

एक ही चैनल पर एक ही घटना के डुप्लिकेट भेजने को रोकने के लिए `(occurrence_key, channel)` पर एक अद्वितीय इंडेक्स है।

## सत्र प्रबंधन {/* #session-management */}

### डेटाबेस-समर्थित सत्र संग्रहण {/* #database-backed-session-storage */}

सत्रों को डेटाबेस में मेमोरी में फ़ॉलबैक के साथ संग्रहीत किया जाता है:
- **प्राथमिक संग्रहण**: डेटाबेस-समर्थित सत्र तालिका
- **फ़ॉलबैक**: मेमोरी में संग्रहण (लीगेसी समर्थन या त्रुटि मामलों के लिए)
- **सत्र आईडी**: क्रिप्टोग्राफ़िक रूप से सुरक्षित यादृच्छिक स्ट्रिंग
- **समाप्ति**: कॉन्फ़िगर करने योग्य सत्र टाइमआउट
- **CSRF सुरक्षा**: क्रॉस-साइट अनुरोध धोखाधड़ी सुरक्षा
- **स्वचालित सफाई**: समाप्त सत्र स्वचालित रूप से हटा दिए जाते हैं

### सत्र एपीआई एंडपॉइंट {/* #session-api-endpoints */}

- `POST /api/session`: नया सत्र बनाएं
- `GET /api/session`: मौजूदा सत्र को मान्य करें
- `DELETE /api/session`: सत्र नष्ट करें
- `GET /api/csrf`: CSRF टोकन प्राप्त करें

## इंडेक्स {/* #indexes */}

डेटाबेस में ऑप्टिमल क्वेरी प्रदर्शन के लिए कई इंडेक्स शामिल हैं:

- **प्राथमिक कुंजियाँ**: सभी तालिकाओं में प्राथमिक कुंजी इंडेक्स हैं
- **विदेशी कुंजियाँ**: बैकअप तालिका में सर्वर संदर्भ, सत्र और ऑडिट_लॉग में उपयोगकर्ता संदर्भ
- **क्वेरी अनुकूलन**: अक्सर क्वेरी किए गए फ़ील्ड पर इंडेक्स
- **तिथि इंडेक्स**: समय-आधारित क्वेरी के लिए तिथि फ़ील्ड पर इंडेक्स
- **उपयोगकर्ता इंडेक्स**: त्वरित उपयोगकर्ता लुकअप के लिए उपयोगकर्ता नाम इंडेक्स
- **सत्र इंडेक्स**: सत्र प्रबंधन के लिए समाप्ति और उपयोगकर्ता_आईडी इंडेक्स
- **ऑडिट इंडेक्स**: ऑडिट क्वेरी के लिए टाइमस्टैम्प, उपयोगकर्ता_आईडी, कार्रवाई, श्रेणी और स्थिति इंडेक्स
- **एपीआई कुंजी इंडेक्स**: अद्वितीय हैश, प्लस सक्षम/स्कोप लुकअप के लिए प्रमाणीकरण

## संबंध {/* #relationships */}

- **सर्वर → बैकअप**: एक-से-कई संबंध
- **उपयोगकर्ता → सत्र**: एक-से-कई संबंध (उपयोगकर्ता के बिना भी सत्र मौजूद हो सकते हैं)
- **उपयोगकर्ता → ऑडिट लॉग**: एक-से-कई संबंध (उपयोगकर्ता के बिना भी ऑडिट प्रविष्टियाँ मौजूद हो सकती हैं)
- **उपयोगकर्ता → एपीआई कुंजियाँ**: `created_by` के माध्यम से एक-से-कई संबंध (उपयोगकर्ता के हटाए जाने के बाद भी कुंजियाँ बनी रहती हैं)
- **बैकअप → संदेश**: एम्बेडेड JSON सरणियाँ
- **कॉन्फ़िगरेशन**: कुंजी-मान संग्रहण

## डेटा प्रकार {/* #data-types */}

- **TEXT**: स्ट्रिंग डेटा, JSON सरणियाँ
- **INTEGER**: संख्यात्मक डेटा, फ़ाइल गिनती, आकार
- **REAL**: फ़्लोटिंग-पॉइंट संख्याएँ, अवधि
- **DATETIME**: टाइमस्टैम्प डेटा
- **BOOLEAN**: सही/गलत मान

## बैकअप स्थिति मान {/* #backup-status-values */}

- **सफलता**: बैकअप सफलतापूर्वक पूरा हुआ
- **चेतावनी**: चेतावनियों के साथ बैकअप पूरा हुआ
- **त्रुटि**: त्रुटियों के साथ बैकअप पूरा हुआ
- **Fatal**: बैकअप घातक रूप से विफल हुआ

## सामान्य प्रश्न {/* #common-queries */}

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

### डेटाबेस सफाई {/* #database-cleanup */}

```sql
-- Delete old backups (older than 30 days)
DELETE FROM backups 
WHERE date < datetime('now', '-30 days');

-- Delete servers with no backups
DELETE FROM servers 
WHERE id NOT IN (SELECT DISTINCT server_id FROM backups);
```

## डेटाबेस मानचित्रण में JSON {/* #json-to-database-mapping */}

### डेटाबेस कॉलम मानचित्रण के लिए एपीआई अनुरोध शरीर {/* #api-request-body-to-database-columns-mapping */}

जब duplicati HTTP POST के माध्यम से बैकअप डेटा भेजता है, तो JSON संरचना को डेटाबेस कॉलम में मैप किया जाता है:

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

**नोट**: बैकअप तालिका में `size` फ़ील्ड `SizeOfExaminedFiles` को संग्रहीत करता है और `uploaded_size` बैकअप ऑपरेशन से वास्तविक अपलोड/स्थानांतरित आकार को संग्रहीत करता है।
