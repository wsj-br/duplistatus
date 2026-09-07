# API Overview {/* #api-overview */}

Yeh pratilipi duplistatus application ke sabhi available API endpoints ka vishleshan deti hai. API RESTful principles par chalta hai aur comprehensive backup monitoring, notification management, aur system administration capabilities provide karta hai.

## API संरचना {/* #api-structure */}

Sabhi endpoints ke liye ek jaldarpan ke liye, [API Endpoint List](api-endpoint-list) dekhein.

API logical groups mein vishleshit hai:
- [**External APIs**](external-apis): Summary data, latest backup status, aur Duplicati se backup data uploads
- [**Core Operations**](core-operations): Dashboard data, server management, aur detailed backup information
- [**Chart Data**](chart-data-apis): Aggregated aur server-specific time-series data visualisation aur analytics ke liye
- [**Configuration Management**](configuration-apis): Email, notification, backup settings, aur system configuration
- [**Notification System**](notification-apis): Notification testing, overdue backup checks, aur notification management
- [**Cron services**](cron-service-apis): Cron service management
- [**Monitoring & Health**](monitoring-apis): Health checks aur status monitoring
- [**Administration**](administration-apis): Database maintenance, cleanup operations, aur system management
- [**Session Management**](session-management-apis): Session management aur session creation
- [**Authentication & Security**](authentication-security): Authentication aur security

Sabhi endpoints ke liye ek jaldarpan ke liye, [API Endpoint List](api-endpoint-list) dekhein.

## प्रतिक्रिया प्रारूप {/* #response-format */}

Sabhi API responses JSON format mein return hote hain consistent error handling patterns ke saath. Successful responses typically include a `status` field, while error responses include `error` aur `message` fields.

---

## Truti प्रबंधन {/* #error-handling */}

Sabhi endpoints consistent error handling pattern follow karte hain:

- **400 Bad Request**: Invalid request data ya missing required fields
- **401 Unauthorized**: Invalid ya missing session, expired session, ya CSRF token validation failed
- **403 Forbidden**: Operation not allowed (e.g., backup deletion in production) ya CSRF token validation failed
- **404 Not Found**: Resource not found
- **409 Conflict**: डुप्लिकेट डेटा (अपलोड एंडपॉइंट्स के लिए)
- **413 Payload Too Large**: `/api/upload` बॉडी कॉन्फ़िगर्ड साइज़ लिमिट से अधिक है
- **429 Too Many Requests**: अपलोड, रीड-एपीआई, या ऑथेंटिकेशन-फेल्योर रेट लिमिट पार किया गया है
- **500 Internal Server Error**: सर्वर-साइड त्रुटियाँ व विस्तृत त्रुटि संदेशों के साथ
- **503 Service Unavailable**: हेल्थ चेक फेल्योर, डेटाबेस कनेक्शन समस्याएँ, या क्रॉन सेवा अनुपलब्ध

Error responses include:
- `error`: Human-readable error message
- `message`: Technical error details (development mode mein)
- `stack`: Error stack trace (development mode mein)
- `timestamp`: Jab error hua tha

## डेटा प्रकार नोट्स {/* #data-type-notes */}

### Sandesh Arrays {/* #message-arrays */}
`messages_array`, `warnings_array`, और `errors_array` फ़ील्ड डेटाबेस में JSON strings के रूप में संग्रहीत हैं और API प्रतिक्रियाओं में arrays के रूप में लौटाए जाते हैं। ये Duplicati बैकअप संचालनों से वास्तविक log Sandesh, Chetaavaniyaan, और Trutiyon शामिल करते हैं।

### उपलब्ध बैकअप {/* #available-backups */}
`available_backups` फ़ील्ड में बैकअप Sanskaran टाइमस्टैम्प्स (ISO प्रारूप में) ka एक array है जो पुनर्स्थापना के लिए उपलब्ध हैं। यह बैकअप log Sandesh से निकाला जाता है।

### Avadhi फ़ील्ड {/* #duration-fields */}
- `duration`: मानव-पठनीय प्रारूप (जैसे, "00:38:31")
- `duration_seconds`: सेकंड में कच्ची Avadhi
- `durationInMinutes`: चार्टिंग उद्देश्यों के लिए मिनटों में परिवर्तित Avadhi

### File Aakar फ़ील्ड {/* #file-size-fields */}
Sabhi File Aakar फ़ील्ड संख्याओं के रूप में बाइट्स में लौटाए जाते हैं, प्रारूपित strings के रूप में नहीं। फ्रंटएंड इन्हें मानव-पठनीय प्रारूपों (KB, MB, GB, आदि) में बदलने के लिए जिम्मेदार है।

<br/>

:::caution
 Don't expose the **duplistatus** server to the public internet. Use it in a secure network 
(e.g., local LAN protected by a firewall).

Exposing the **duplistatus** interface to the public
 internet without proper security measures could lead to unauthorized access.
:::
