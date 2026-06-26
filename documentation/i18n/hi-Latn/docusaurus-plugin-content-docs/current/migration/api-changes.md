# Bahari-se-asangat API badlav {#api-breaking-changes}

Yah dastavez duplistatus ke vibhinn sanskaranon mein bahari API endpoints mein todne wale badlavon ki rooprekha deta hai. Bahari API endpoints anya anupryogon aur integrations (udaharan ke liye, Homepage integration) dwara upyog ke liye dizain kiye gaye hain.

## Overview {#overview}

Yah dastavez bahari API endpoints mein todne wale badlavon ko kavar karta hai jo integrations, scripts, aur in endpoints ka upyog karne wale anupryogon ko prabhavit karte hain. Web interface dwara upyog kiye jane wale antarik API endpoints ke liye, badlav svatah kiye jate hain aur unhein manaviy roop se update karne ki avashyakta nahin hoti hai.

:::note
Bahari API endpoints ko jab bhi sambhav ho, bahari anukoolata ke liye banaye rakha jata hai. Todne wale badlav kewal tab hi pesh kiye jate hain jab consistency, suraksha, ya karyakshamata sudhar ke liye avashyak ho.
:::

## Sanskaran-vishesh badlav {#version-specific-changes}

### Sanskaran 1.3.0 {#version-130}

**Bahari API Endpoints mein koi todne wala badlav nahin**

### Sanskaran 1.2.1 {#version-121}

**Bahari API Endpoints mein koi todne wala badlav nahin**

### Sanskaran 1.1.x {#version-11x}

**Bahari API Endpoints mein koi todne wala badlav nahin**

### Sanskaran 1.0.x {#version-10x}

**Bahari API Endpoints mein koi todne wala badlav nahin**

### Sanskaran 0.9.x {#version-09x}

**Bahari API Endpoints mein koi todne wala badlav nahin**

Sanskaran 0.9.x authentication pesh karta hai aur sabhi upyogkartaon ko pravesh karne ki avashyakta hai. Jab sanskaran 0.8.x se upgrade kar rahe hon:

1. **Authentication avashyak**: Sabhi pages aur antarik API endpoints ko ab authentication ki avashyakta hai
2. **Default Admin Account**: Ek default admin account svatah banaya jata hai:
   - Username: `admin`
   - Password: `Duplistatus09` (pahle pravesh par badla jana chahiye)
3. **Session Validity**: Sabhi maujooda sessions ko avaidh kar diya gaya hai
4. **Bahari API Access**: Bahari API endpoints (`/api/summary`, `/api/lastbackup`, `/api/lastbackups`, `/api/upload`) integrations aur Duplicati ke saath anukoolata ke liye apramanit rahte hain

### Sanskaran 0.8.x {#version-08x}

**Bahari API Endpoints mein koi todne wala badlav nahin**

Sanskaran 0.8.x mein bahari API endpoints mein koi breaking changes nahi hain. Nimnalikhit endpoints avam parivartit hain:

- `/api/summary` - Response structure avam parivartit
- `/api/lastbackup/{serverId}` - Response structure avam parivartit
- `/api/lastbackups/{serverId}` - Response structure avam parivartit
- `/api/upload` - Request/response format avam parivartit

#### Suraksha Badhotari {#security-enhancements}

Jabki bahari API endpoints mein koi breaking changes nahi kiye gaye hain, sanskaran 0.8.x mein suraksha badhotariyan shamil hain:

- **CSRF Suraksha**: CSRF token validation rajya-badalne wale API anurodhon ke liye lagu kiya gaya hai, lekin bahari APIs avam anukoolit hain
- **Password Suraksha**: Password endpoints suraksha ke liye kewal upyogkarta interface tak seemit hain

:::note
Ye suraksha badhotariyan backup data padhne ke liye istemal hone wale bahari API endpoints ko prabhavit nahi karti hain. Yadi aapke paas antarik endpoints ka istemal karne wali anukoolit scripts hain, to unhein CSRF token handling ki avashyakta ho sakti hai.
:::

### Sanskaran 0.7.x {#version-07x}

Sanskaran 0.7.x mein bahari API endpoints mein kai breaking changes hain jinhein bahari integrations mein updates ki avashyakta hai.

#### Breaking Changes {#breaking-changes}

##### Kshetra ka naam badalna {#field-renaming}

- `totalMachines` → `totalServers` `/api/summary` endpoint mein
- `machine` → `server` API response objects mein
- `backup_types_count` → `backup_jobs_count` `/api/lastbackups/{serverId}` endpoint mein

##### Endpoint path mein badlav {#endpoint-path-changes}

- Sabhi API endpoints jo pehle `/api/machines/...` ka istemal karte the ab `/api/servers/...` ka istemal karte hain
- Parameter ke naam `machine_id` se badalkar `server_id` kar diye gaye hain (URL encoding abhi bhi dono ke saath kaam karta hai)

#### Response structure mein badlav {#response-structure-changes}

Ekroopata ke liye kai endpoints ki response structure ko update kiya gaya hai:

##### `/api/summary` {#apisummary}

**0.6.x aur usse pehle:**

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

**0.7.x+ ke baad:**

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

**0.6.x aur usse pehle:**

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

**0.7.x+ ke baad:**

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

**0.6.x aur usse pehle:**

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

**0.7.x+ ke baad:**

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

Agar aap 0.7.x se pehle ke version se upgrade kar rahe hain, to in steps ko follow karen:

1. **Field References ko Update Karen**: Purane field names ke sabhi references ko naye se badal den
   - `totalMachines` → `totalServers`
   - `backup_types_count` → `backup_jobs_count`

2. **Object Keys ko Update Karen**: Response parsing mein `machine` ko `server` mein badalen
   - Kisi bhi code ko update karen jo `response.machine` ko access karta hai `response.server` ke liye

3. **Endpoint Paths ko Update Karen**: `/api/machines/...` ka istemal karne wale kisi bhi endpoint ko `/api/servers/...` mein badalen
   - Note: Parameters ab bhi purane identifiers ko accept kar sakte hain; paths ko update kiya jana chahiye

4. **Integration ka Parikshan Karen**: Verify karen ki aapki integration naye API structure ke saath kaam karti hai
   - Un sabhi endpoints ka parikshan karen jinka istemal aapka application karta hai
   - Verify karen ki response parsing naye field names ko sahi dhang se handle karta hai

5. **Documentation ko Update Karen**: Purane API ka reference dene wale kisi bhi internal documentation ko update karen
   - API examples aur field name references ko update karen

## Compatibility {#compatibility}

### Backward Compatibility {#backward-compatibility}

- **Version 1.2.1**: 1.1.x API structure ke saath poori tarah backward compatible
- **Version 1.1.x**: 1.0.x API structure ke saath poori tarah backward compatible
- **Version 1.0.x**: 0.9.x API structure ke saath poori tarah backward compatible
- **Version 0.9.x**: 0.8.x API structure ke saath poori tarah backward compatible
- **Version 0.8.x**: 0.7.x API structure ke saath poori tarah backward compatible
- **Version 0.7.x**: 0.7.x se pehle ke versions ke saath backward compatible nahin hai
  - Purane field names kaam nahin karenge
  - Purane endpoint paths kaam nahin karenge

### Future Support {#future-support}

- 0.7.x se pehle ke versions ke purane field names supported nahin hain
- 0.7.x se pehle ke versions ke purane endpoint paths supported nahin hain
- Future versions vartaman API structure ko maintain karenge jab tak ki breaking changes zaroori na hon

## External API Endpoints ka Saransh {#summary-of-external-api-endpoints}

Neeche diye gaye external API endpoints backward compatibility ke liye maintain kiye gaye hain aur unauthenticated hain:

| Endpoint | Method | Description | Breaking Changes |
|----------|--------|-------------|------------------|
| `/api/summary` | GET | Backup operations ka samagra saransh | 0.7.x: `totalMachines` → `totalServers` |
| `/api/lastbackup/{serverId}` | GET | Server ke liye latest backup | 0.7.x: `machine` → `server` |
| `/api/lastbackups/{serverId}` | GET | Sabhi backup jobs ke liye latest backups | 0.7.x: `machine` → `server`, `backup_types_count` → `backup_jobs_count` |
| `/api/upload` | POST | Duplicati se backup data upload karein | Koi breaking changes nahi |

## Sahayata chahiye? {#need-help}

Agar aapko apna integration update karne mein sahayata chahiye:

- **API Reference**: Vartaman endpoint documentation ke liye [API Reference](../api-reference/overview.md) ki Janch karein
- **External APIs**: Vistrit endpoint documentation ke liye [External APIs](../api-reference/external-apis.md) dekhein
- **Migration Guide**: Samanya migration jaankari ke liye [Migration Guide](version_upgrade.md) ki samiksha karein
- **Release Notes**: Adhik sandarbh ke liye version-specific [Release Notes](../release-notes/0.8.x.md) ki samiksha karein
- **Support**: Support ke liye [GitHub](https://github.com/wsj-br/duplistatus/issues) par ek issue kholen
