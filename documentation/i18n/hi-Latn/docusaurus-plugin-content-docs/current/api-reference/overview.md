# API Overview {#api-overview}

Yah dastavez duplistatus application ke liye sabhi uplabdh API endpoints ka varnan karta hai. API RESTful siddhanton ka anupalan karti hai aur sampoorn backup monitoring, notification prabandhan, aur pranali prashasan kshamataayein pradaan karti hai.

## API Structure {#api-structure}

Sabhi endpoints ke liye ek tvarit sandarbh hetu, [API Endpoint List](api-endpoint-list) dekhein.

API ko tarkik samoohon mein sangathit kiya gaya hai:
- [**External APIs**](external-apis): Duplicati se samanya data, naveentam backup stithi, aur backup data uploads
- [**Core Operations**](core-operations): Dashboard data, server prabandhan, aur vishad backup jaankaaree
- [**Chart Data**](chart-data-apis): Drishtikaran aur vishleshan ke liye sankalit aur server-vishesh samay-shrinkhala data
- [**Configuration Management**](configuration-apis): Email, notification, backup settings, aur pranali configuration
- [**Notification System**](notification-apis): Notification testing, vilambit backup jaanch, aur notification prabandhan
- [**Cron services**](cron-service-apis): Cron service prabandhan
- [**Monitoring & Health**](monitoring-apis): Health checks aur stithi monitoring
- [**Administration**](administration-apis): Database maintenance, safai operations, aur pranali prabandhan
- [**Session Management**](session-management-apis): Session prabandhan aur session nirman
- [**Authentication & Security**](authentication-security): Authentication aur suraksha

Sabhi endpoints ke liye ek tvarit sandarbh hetu, [API Endpoint List](api-endpoint-list) dekhein.

## Response Format {#response-format}

Sabhi API responses JSON format mein sthir truti handling patterns ke saath vapas ki jaati hain. Safal responses mein aam taur par ek `status` field shaamil hota hai, jabki truti responses mein `error` aur `message` fields shaamil hote hain.

---

## Error Handling {#error-handling}

Sabhi endpoints ek sthir truti handling pattern ka anupalan karte hain:

- **400 Bad Request**: Avidh anurodh data ya avashyak fields ka gayab hona
- **401 Unauthorized**: Avidh ya gayab session, samapt session, ya CSRF token validation viphal
- **403 Forbidden**: Operation anumodit nahin hai (udaharanarth, production mein backup hatana) ya CSRF token validation viphal
- **404 Not Found**: Sansadhan nahin mila
- **409 Conflict**: Duplicate data (upload endpoints ke liye)
- **500 Internal Server Error**: Server-side trutiyon vishad truti sandeshon ke saath
- **503 Service Unavailable**: Health check viphalataayein, database connection samasyaayein, ya cron service uplabdh nahin hai

Truti responses mein shaamil hain:
- `error`: Manav-pathneeya truti sandesh
- `message`: Takneeki truti vivaran (development mode mein)
- `stack`: Truti stack trace (development mode mein)
- `timestamp`: Kab truti hui

## Data Type Notes {#data-type-notes}

### Message Arrays {#message-arrays}
`messages_array`, `warnings_array`, aur `errors_array` fields database mein JSON strings ke roop mein store kiye jaate hain aur API responses mein arrays ke roop mein vapas kiye jaate hain. Inmein Duplicati backup operations se vastavik log sandesh, chetaavaniyaan, aur trutiyan shaamil hain.

### Available Backups {#available-backups}
`available_backups` field mein backup version timestamps (ISO format mein) ka ek array shaamil hai jo restoration ke liye uplabdh hain. Yah backup log sandeshon se nikala gaya hai.

### Duration Fields {#duration-fields}
- `duration`: Manav-pathneeya format (udaharanarth, "00:38:31")
- `duration_seconds`: Seconds mein raw avadhi
- `durationInMinutes`: Charting uddeshyon ke liye minutes mein parivartit avadhi

### File Aakar Fields {#file-size-fields}
Sabhi file aakar fields ko bytes mein sankhyaon ke roop mein vapas kiya jata hai, na ki formatted strings ke roop mein. Frontend inhein manav-pathya roopon (KB, MB, GB, aadi) mein badalne ke liye jimmedar hai.

<br/>

:::caution
 **duplistatus** server ko public internet par expose na karein. Iska istemaal ek surakshit network mein karein 
(jaise, firewall dwara surakshit local LAN).

**duplistatus** interface ko public
 internet par bina uchit suraksha upaayon ke expose karne se anadhikrit access ho sakta hai.
:::
