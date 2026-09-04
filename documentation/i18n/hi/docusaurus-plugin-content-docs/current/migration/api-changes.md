# पिछले संस्करणों के साथ असंगत API परिवर्तन {#api-breaking-changes}

यह दस्तावेज़ duplistatus के विभिन्न संस्करणों में बाहरी API एंडपॉइंट्स के लिए असंगत परिवर्तनों का विवरण देता है। बाहरी API एंडपॉइंट्स वे हैं जो अन्य अनुप्रयोगों और एकीकरणों के लिए डिज़ाइन किए गए हैं (जैसे, होमपेज एकीकरण)।

## Overview {#overview}

यह दस्तावेज़ बाहरी API एंडपॉइंट्स के लिए असंगत परिवर्तनों को कवर करता है जो एकीकरणों, स्क्रिप्ट्स और इन एंडपॉइंट्स का उपयोग करने वाले अनुप्रयोगों को प्रभावित करते हैं। वेब इंटरफ़ेस द्वारा उपयोग किए जाने वाले आंतरिक API एंडपॉइंट्स के लिए परिवर्तन स्वचालित रूप से हैंडल किए जाते हैं और उन्हें मैन्युअल अपडेट की आवश्यकता नहीं होती है।

:::note
बाहरी API एंडपॉइंट्स जब संभव हो तो पिछले संस्करणों के साथ संगतता के लिए बनाए रखे जाते हैं। असंगत परिवर्तन केवल तभी पेश किए जाते हैं जब यह एकीकरण, सुरक्षा, या कार्यक्षमता में सुधार के लिए आवश्यक हो।
:::

## संस्करण-विशिष्ट परिवर्तन {#version-specific-changes}

### संस्करण 1.3.0 {#version-130}

**बाहरी API एंडपॉइंट्स में कोई असंगत परिवर्तन नहीं**

### संस्करण 1.2.1 {#version-121}

**बाहरी API एंडपॉइंट्स में कोई असंगत परिवर्तन नहीं**

### संस्करण 1.1.x {#version-11x}

**बाहरी API एंडपॉइंट्स में कोई असंगत परिवर्तन नहीं**

### संस्करण 1.0.x {#version-10x}

**बाहरी API एंडपॉइंट्स में कोई असंगत परिवर्तन नहीं**

### संस्करण 0.9.x {#version-09x}

**बाहरी API एंडपॉइंट्स में कोई असंगत परिवर्तन नहीं**

संस्करण 0.9.x में प्रमाणीकरण पेश किया गया है और सभी उपयोगकर्ताओं को लॉग इन करने की आवश्यकता होती है। संस्करण 0.8.x से अपग्रेड करते समय:

1. **प्रमाणीकरण आवश्यक**: सभी पृष्ठों और आंतरिक API एंडपॉइंट्स अब प्रमाणीकरण की आवश्यकता होती है
2. **डिफ़ॉल्ट एडमिन खाता**: एक डिफ़ॉल्ट एडमिन खाता स्वचालित रूप से बनाया जाता है:
   - Username: `admin`
   - Password: `Duplistatus09` (पहले लॉगिन पर बदलना होगा)
3. **सत्र अवैध**: सभी मौजूदा सत्र अवैध कर दिए जाते हैं
4. **बाहरी API एक्सेस**: बाहरी API एंडपॉइंट्स (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) एकीकरणों और डुप्लिकेटी के साथ संगतता के लिए प्रमाणीकरण रहित रहते हैं

### संस्करण 0.8.x {#version-08x}

**बाहरी API एंडपॉइंट्स में कोई असंगत परिवर्तन नहीं**

संस्करण 0.8.x किसी भी बाहरी API एंडपॉइंट में कोई ब्रेकिंग चेंजेज नहीं करता है। निम्नलिखित एंडपॉइंट अपरिवर्तित हैं:

- `/api/summary` - प्रतिक्रिया संरचना अपरिवर्तित
- `/api/lastbackup/{serverId}` - प्रतिक्रिया संरचना अपरिवर्तित
- `/api/lastbackups/{serverId}` - प्रतिक्रिया संरचना अपरिवर्तित
- `/api/upload` - अनुरोध/प्रतिक्रिया प्रारूप अपरिवर्तित

#### सुरक्षा सुधार {#security-enhancements}

हालांकि बाहरी API एंडपॉइंट में कोई ब्रेकिंग चेंजेज नहीं की गईं, संस्करण 0.8.x में सुरक्षा सुधार शामिल हैं:

- **CSRF सुरक्षा**: CSRF टोकन सत्यापन राज्य-परिवर्तन API अनुरोधों के लिए लागू किया जाता है, लेकिन बाहरी API संगतता बनाए रखती है
- **पासवर्ड सुरक्षा**: सुरक्षा कारणों से पासवर्ड एंडपॉइंट को उपयोगकर्ता इंटरफेस तक सीमित किया गया है

:::note
ये सुरक्षा सुधार बाहरी API एंडपॉइंट को प्रभावित नहीं करते जो बैकअप डेटा पढ़ने के लिए उपयोग किए जाते हैं। यदि आपके पास आंतरिक एंडपॉइंट का उपयोग करने वाले कस्टम स्क्रिप्ट हैं, तो उन्हें CSRF टोकन हैंडलिंग की आवश्यकता हो सकती है।
:::

### संस्करण 0.7.x {#version-07x}

संस्करण 0.7.x बाहरी API एंडपॉइंट में कई ब्रेकिंग चेंजेज को शामिल करता है जो बाहरी इंटीग्रेशन को अपडेट करने की आवश्यकता होती है।

#### ब्रेकिंग चेंजेज {#breaking-changes}

##### फ़ील्ड नाम बदलाव {#field-renaming}

- `totalMachines` → `totalServers` में `/api/summary` एंडपॉइंट
- `machine` → `server` में API प्रतिक्रिया ऑब्जेक्ट
- `backup_types_count` → `backup_jobs_count` में `/api/lastbackups/{serverId}` एंडपॉइंट

##### एंडपॉइंट पथ बदलाव {#endpoint-path-changes}

- सभी API एंडपॉइंट जो पहले `/api/machines/...` का उपयोग करते थे अब `/api/servers/...` का उपयोग करते हैं
- पैरामीटर नाम `machine_id` से `server_id` में बदल गए (URL एन्कोडिंग दोनों के साथ काम करता है)

#### प्रतिक्रिया संरचना बदलाव {#response-structure-changes}

कई एंडपॉइंट की प्रतिक्रिया संरचना एकसारिकता के लिए अपडेट की गई है:

##### `/api/summary` {#apisummary}

**Before (0.6.x and earlier):**

```json
{
  "totalMachines": 3,
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

**After (0.7.x+):**

```json
{
  "totalServers": 3,  // Changed from "totalMachines"
  "totalBackupsRuns": 9,
  "totalBackups": 9,
  "totalUploadedSize": 2397229507,
  "totalStorageUsed": 43346796938,
  "totalBackupSize": 126089687807,
  "overdueBackupsCount": 2,
  "secondsSinceLastBackup": 7200
}
```

##### `/api/lastbackup/{serverId}` {#apilastbackupserverid}

**Before (0.6.x and earlier):**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

**After (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Backup Name",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backup": {
    // ... backup details
  },
  "status": 200
}
```

##### `/api/lastbackups/{serverId}` {#apilastbackupsserverid}

**Before (0.6.x and earlier):**

```json
{
  "machine": {  // Changed to "server"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_types_count": 2,  // Changed to "backup_jobs_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

**After (0.7.x+):**

```json
{
  "server": {  // Changed from "machine"
    "id": "unique-server-id",
    "name": "Server Name",
    "backup_name": "Default Backup",
    "backup_id": "backup-id",
    "created_at": "2024-03-20T10:00:00Z"
  },
  "latest_backups": [
    // ... backup array
  ],
  "backup_jobs_count": 2,  // Changed from "backup_types_count"
  "backup_names": ["Files", "Databases"],
  "status": 200
}
```

## Migration Steps {#migration-steps}

If you're upgrading from a version prior to 0.7.x, follow these steps:

1. **Update Field References**: Replace all references to old field names with new ones
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Update Object Keys**: Change `machine` to `server` in response parsing
   - Update any code that accesses `response.machine` to `response.server`

3. **Update Endpoint Paths**: Change any endpoints using `/api/machines/...` to `/api/servers/...`
   - Note: Parameters can still accept old identifiers; paths should be updated

4. **Test Integration**: Verify that your integration works with the new API structure
   - Test all endpoints your application uses
   - Verify response parsing handles new field names correctly

5. **Update Documentation**: Update any internal documentation referencing the old API
   - Update API examples and field name references

## Compatibility {#compatibility}

### Backward Compatibility {#backward-compatibility}

- **Version 1.2.1**: Fully backward compatible with 1.1.x API structure
- **Version 1.1.x**: Fully backward compatible with 1.0.x API structure
- **Version 1.0.x**: Fully backward compatible with 0.9.x API structure
- **Version 0.9.x**: Fully backward compatible with 0.8.x API structure
- **Version 0.8.x**: Fully backward compatible with 0.7.x API structure
- **Version 0.7.x**: Not backward compatible with versions prior to 0.7.x
  - Old field names will not work
  - Old endpoint paths will not work

### Future Support {#future-support}

- Old field names from pre-0.7.x versions are not supported
- Old endpoint paths from pre-0.7.x versions are not supported
- Future versions will maintain the current API structure unless breaking changes are necessary

## Summary of External API Endpoints {#summary-of-external-api-endpoints}

The following external API endpoints are maintained for backward compatibility and remain unauthenticated:

| Endpoint | Method | Description | Breaking Changes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Overall summary of backup operations | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | सर्वर के लिए नवीनतम बैकअप | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | सभी बैकअप जॉब्स के लिए नवीनतम बैकअप | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | डुप्लिकेटी से बैकअप डेटा अपलोड करें | कोई ब्रेकिंग चेंज नहीं |

## सहायता चाहिए? {#need-help}

अगर आपको अपने इंटीग्रेशन को अपडेट करने में सहायता चाहिए:

- **API संदर्भ**: वर्तमान एंडपॉइंट डॉक्यूमेंटेशन के लिए [API संदर्भ](../api-reference/overview.md) देखें
- **बाहरी APIs**: विस्तृत एंडपॉइंट डॉक्यूमेंटेशन के लिए [बाहरी APIs](../api-reference/external-apis.md) देखें
- **माइग्रेशन गाइड**: सामान्य माइग्रेशन जानकारी के लिए [माइग्रेशन गाइड](version_upgrade.md) देखें
- **रिलीज़ नोट्स**: अतिरिक्त संदर्भ के लिए संस्करण-विशिष्ट [रिलीज़ नोट्स](../release-notes/0.8.x.md) देखें
- **सहायता**: सहायता के लिए [GitHub](https://github.com/wsj-br/duplistatus/issues) पर एक इश्यू खोलें
