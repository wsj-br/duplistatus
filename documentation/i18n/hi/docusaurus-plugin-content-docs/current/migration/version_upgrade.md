# Migration Guide {#migration-guide}

यह गाइड बताती है कि duplistatus ke sanskaranon ke beech upgrade kaise karein. Migrations automatic hote hain—jab aap naya sanskaran shuru karte hain toh database schema apne aap update ho jata hai.

Manual steps ki avashyakta keval tab hoti hai jab aapne customized notification Templates banaye hon (sanskaran 0.8.x ne template variables badal diye hain) ya external API Integrations hon jinhe update karne ki avashyakta ho (sanskaran 0.7.x ne API field ke naam badal diye hain, sanskaran 0.9.x mein authentication ki avashyakta hoti hai).

## Overview {#overview}

duplistatus upgrade karte samay aapke database schema ko automatic migrate kar deta hai. Pranali:

1. Badlav karne se pehle aapke database ka backup banati hai
2. Database schema ko sabse naye sanskaran mein update karti hai
3. Sabhi maujooda data (Server, backups, configuration) ko surakshit rakhti hai
4. Verifies karti hai ki migration safaltapoorvak poora ho gaya hai

## Migration se Pehle Apne Database ka Backup Lena {#backing-up-your-database-before-migration}

Naye sanskaran mein upgrade karne se pehle, apne database ka backup banana sifaarish kiya jata hai. Yeh sunishchit karta hai ki yadi migration prakriya ke dauran kuch galat hota hai toh aap apna data restore kar sakein.

### Yadi Aap Sanskaran 1.2.1 ya Usse Baad ka Upayog Kar Rahe Hain {#if-youre-running-version-121-or-later}

Built-in database backup function ka upayog karein:

1. Web interface mein [Settings → Database Maintenance](../user-guide/settings/database-maintenance.md) par jaayein
2. **Database Backup** section mein, ek backup format chunein:
   - **Database File (.db)**: Binary format - sabse tez backup, sabhi database structure ko bilkul sahi tarike se surakshit rakhta hai
   - **SQL Dump (.sql)**: Text format - human-readable SQL statements
3. **Download Backup** par click karein
4. Backup file ek timestamped filename ke saath aapke computer par download ho jayegi

Adhik Vivaran ke liye, [Database Maintenance](../user-guide/settings/database-maintenance.md#database-backup) dastavez par jaayein.

### Yadi Aap 1.2.1 se Pehle ka Sanskaran Upayog Kar Rahe Hain {#if-youre-running-a-version-before-121}

#### Backup {#backup}

Aage badhne se pehle aapko manually database ka backup lena hoga. Database File (.db) container ke andar `/app/data/backups.db` par sthit hai.

##### Linux Upyogkartaon Ke Liye {#for-linux-users}
Yadi aap Linux par hain, toh helper containers chalane ki chinta na karein. Aap running container se seedhe apne host par database nikalne ke liye native `cp` command ka upayog kar sakte hain.

###### Docker ya Podman ka Upayog Kar: {#using-docker-or-podman}

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```

(Yadi Podman ka upayog kar rahe hain, toh upar diye gaye command mein `docker` ko `podman` se badal dein.)

##### Windows Upyogkartaon Ke Liye {#for-windows-users}
Yadi aap Windows par Docker Desktop chala rahe hain, toh aapke paas command line ka upayog kiye bina ise sambhalne ke do saral tarike hain:

###### Option A: Docker Desktop ka Upayog Karein (Sabse Saral) {#option-a-use-docker-desktop-easiest}
1. Docker Desktop Dashboard kholein.
2. Containers tab par jaayein aur apne duplistatus container par click karein.
3. Files tab par click karein.
4. `/app/data/` पर जाएं।
5. `backups.db` पर राइट-क्लिक करें और **Save as...** चुनें इसे अपने Windows फ़ोल्डर में डाउनलोड करने के लिए।

###### विकल्प B: PowerShell का उपयोग करें {#option-b-use-powershell}
यदि आप टर्मिनल पसंद करते हैं, तो आप PowerShell का उपयोग करके फ़ाइल को अपने डेस्कटॉप पर कॉपी कर सकते हैं:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### अगर आप बाइंड माउंट का उपयोग करते हैं {#if-you-use-bind-mounts}
यदि आपने मूल रूप से बाइंड माउंट का उपयोग करके कंटेनर सेट अप किया है (जैसे, आपने एक स्थानीय फ़ोल्डर जैसे `/opt/duplistatus` को कंटेनर में मैप किया है), तो आपको डॉकर कमांड की ज़रूरत नहीं है। बस अपने फ़ाइल मैनेजर का उपयोग करके फ़ाइल कॉपी करें:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: **File Explorer** में फ़ाइल कॉपी करें जिसे आपने सेटअप के दौरान निर्दिष्ट किया था।

#### अपने डेटा को पुनर्स्थापित करना {#restoring-your-data}
यदि आपको अपने डेटाबेस को पिछले बैकअप से पुनर्स्थापित करने की ज़रूरत है, तो नीचे दिए गए चरणों का पालन करें, आपके ऑपरेटिंग सिस्टम के आधार पर।

:::info[महत्वपूर्ण] 
डेटाबेस पुनर्स्थापित करने से पहले कंटेनर को रोकें ताकि फ़ाइल कोरप्शन से बचा जा सके।
:::

##### Linux उपयोगकर्ताओं के लिए {#for-linux-users-1}
पुनर्स्थापित करने का सबसे आसान तरीका है बैकअप फ़ाइल को कंटेनर के आंतरिक स्टोरेज पथ में "पुश" करना।

###### Docker या Podman का उपयोग करना: {#using-docker-or-podman-1}

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### Windows उपयोगकर्ताओं के लिए {#for-windows-users-1}
यदि आप Docker Desktop का उपयोग कर रहे हैं, तो आप GUI या PowerShell के माध्यम से पुनर्स्थापित कर सकते हैं।

###### विकल्प A: Docker Desktop (GUI) का उपयोग करें {#option-a-use-docker-desktop-gui}
1. सुनिश्चित करें कि duplistatus कंटेनर चल रहा है (Docker Desktop को GUI के माध्यम से फ़ाइल अपलोड करने के लिए कंटेनर को सक्रिय होने की ज़रूरत होती है)।
2. अपने कंटेनर सेटिंग्स में Files टैब पर जाएं।
3. `/app/data/` पर जाएं।
4. मौजूदा backups.db पर राइट-क्लिक करें और Delete चुनें।
5. Import बटन पर क्लिक करें (या फ़ोल्डर क्षेत्र में राइट-क्लिक करें) और अपनी कंप्यूटर से अपना बैकअप फ़ाइल चुनें।

अगर फ़ाइल का नाम में टाइमस्टैम्प है, तो इसे बिल्कुल backups.db के रूप में नाम दें।

कंटेनर को पुनः आरंभ करें।

###### विकल्प B: PowerShell का उपयोग करें {#option-b-use-powershell-1}

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### अगर आप बाइंड माउंट का उपयोग करते हैं {#if-you-use-bind-mounts-1}
यदि आप एक स्थानीय फ़ोल्डर को कंटेनर में मैप कर रहे हैं, तो आपको कोई विशेष कमांड की ज़रूरत नहीं है।

1. कंटेनर को रोकें।
2. अपने बैकअप फ़ाइल को अपने मैप किए गए फ़ोल्डर में मैन्युअल रूप से कॉपी करें (जैसे, `/opt/duplistatus` या `C:\duplistatus_data`)।
3. सुनिश्चित करें कि फ़ाइल का नाम बिल्कुल `backups.db` है।
4. कंटेनर को आरंभ करें।

:::note
यदि आप डेटाबेस को मैन्युअल रूप से पुनर्स्थापित करते हैं, तो आपको अनुमति त्रुटियों का सामना करना पड़ सकता है।

कंटेनर लॉग्स जांचें और आवश्यकतानुसार अनुमतियाँ समायोजित करें। अधिक जानकारी के लिए नीचे दिए गए [Troubleshooting](#troubleshooting-your-restore--rollback) अनुभाग देखें।
:::

## स्वचालित माइग्रेशन प्रक्रिया {#automatic-migration-process}

जब आप एक नया संस्करण शुरू करते हैं, तो माइग्रेशन स्वचालित रूप से चलते हैं:

1. **बैकअप निर्माण**: आपके डेटा निर्देशिका में टाइमस्टैम्प वाला बैकअप बनाया जाता है
2. **स्कीमा अपडेट**: डेटाबेस टेबल और फ़ील्ड आवश्यकतानुसार अपडेट किए जाते हैं
3. **डेटा माइग्रेशन**: सभी मौजूदा डेटा संरक्षित और माइग्रेट किए जाते हैं
4. **सत्यापन**: माइग्रेशन सफलता लॉग किया जाता है

### माइग्रेशन की निगरानी करना {#monitoring-migration}

Docker logs ko monitor karne ke liye migration progress ko check karein:

```bash
docker logs <container-name>
```

Like messages ko dekhiye:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Version-Specific Migration Notes {#version-specific-migration-notes}

### Version 0.9.x ya usse zyada (Schema v4.0) ko upgrade karne ke liye {#upgrading-to-version-09x-or-later-schema-v40}

:::warning
**Authentication abhi zaroori hai.** Upgrade ke baad sabhi users log in karne ke liye zaroori hai.
:::

#### Kya changes automatically hote hain {#what-changes-automatically}

- Database schema v3.1 se v4.0 mein migrate hoti hai
- Naye tables banaye jate hain: `users`, `sessions`, `audit_log`
- Default admin account automatically banaya jata hai
- Sabhi existing sessions invalid kiye jate hain

#### Aapko kya karna hai {#what-you-must-do}

1. **Log in** default admin credentials ke saath:
   - Username: `admin`
   - Password: `Duplistatus09`
2. **Change the password** jab prompt ho (pehli login par required hai)
3. **Create user accounts** dusre users ke liye (Settings → Users)
4. **Update external API integrations** authentication ko include karne ke liye (see [Backward-incompatible API changes](api-changes.md))
5. **Configure audit log retention** agar zaroori ho (Settings → Audit Log)

#### Agar aap lock out ho gaye hain {#if-youre-locked-out}

Admin recovery tool ka use karein:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

Details ke liye [Admin Recovery Guide](../user-guide/admin-recovery.md) ko dekhiye.

### Version 0.8.x ko upgrade karne ke liye {#upgrading-to-version-08x}

#### Kya changes automatically hote hain {#what-changes-automatically-1}

- Database schema v3.1 mein update hoti hai
- Master key encryption ke liye generate hoti hai (`.duplistatus.key` mein stored hoti hai)
- Sessions invalid kiye jate hain (naye CSRF-protected sessions banaye jate hain)
- Passwords naye system ke saath encrypt kiye jate hain

#### What You Must Do {#what-you-must-do-1}

1. **Update notification templates** agar aapne customise kiye hain:
   - `{backup_interval_value}` aur `{backup_interval_type}` ko `{backup_interval}` se replace karein
   - Default templates automatically update hoti hain

#### Security Notes {#security-notes}

- `.duplistatus.key` फ़ाइल का बैकअप सुनिश्चित करें (0400 अनुमतियाँ हैं)
- सत्र 24 घंटे बाद समाप्त हो जाते हैं

### संस्करण 0.7.x पर अपग्रेड करना {#upgrading-to-version-07x}

#### क्या स्वचालित रूप से बदलता है {#what-changes-automatically-2}

- `machines` तालिका का नाम बदलकर `servers` कर दिया गया
- `machine_id` फ़ील्ड का नाम बदलकर `server_id` कर दिया गया
- नए फ़ील्ड जोड़े गए: `alias`, `notes`, `created_at`, `updated_at`

#### आप क्या करना चाहिए {#what-you-must-do-2}

1. **बाहरी API एकीकरण अपडेट करें**:
   - `totalMachines` → `totalServers` बदलें `/api/summary` में
   - `machine` → `server` बदलें API प्रतिक्रिया ऑब्जेक्ट में
   - `backup_types_count` → `backup_jobs_count` बदलें `/api/lastbackups/{serverId}` में
   - एंडपॉइंट पथ को `/api/machines/...` से `/api/servers/...` तक अपडेट करें
2. **सूचना टेम्प्लेट अपडेट करें**:
   - `{machine_name}` को `{server_name}` से बदलें

विस्तृत API माइग्रेशन चरणों के लिए [Backward-incompatible API changes](api-changes.md) देखें।

## माइग्रेशन के बाद की जाँच सूची {#post-migration-checklist}

अपग्रेड के बाद, निम्नलिखित की जाँच करें:

- [ ] सभी सर्वर डैशबोर्ड में सही तरह से दिखाई देते हैं
- [ ] बैकअप इतिहास पूर्ण और पहुँच योग्य है
- [ ] सूचनाएं काम करती हैं (NTFY/ईमेल का परीक्षण करें)
- [ ] बाहरी API एकीकरण काम करते हैं (यदि लागू हो)
- [ ] सेटिंग्स पहुँच योग्य और सही हैं
- [ ] बैकअप मॉनिटरिंग सही तरह से काम करती है
- [ ] सफलतापूर्वक लॉग इन किया गया (0.9.x+)
- [ ] डिफ़ॉल्ट एडमिन पासवर्ड बदल दिया गया (0.9.x+)
- [ ] अन्य उपयोगकर्ताओं के लिए उपयोगकर्ता खाते बनाए गए (0.9.x+)
- [ ] प्रमाणीकरण के साथ बाहरी API एकीकरण अपडेट किए गए (0.9.x+)

## {#troubleshooting} के लिए समस्या निवारण

### माइग्रेशन विफल होता है {#migration-fails}

1. डिस्क स्पेस की जाँच करें (बैकअप के लिए जगह की आवश्यकता होती है)
2. डेटा निर्देशिका पर लिखने की अनुमतियों की जाँच करें
3. विशिष्ट त्रुटियों के लिए कंटेनर लॉग्स की समीक्षा करें
4. यदि आवश्यक हो तो बैकअप से पुनर्स्थापित करें (नीचे रोलबैक देखें)

### माइग्रेशन के बाद डेटा गायब है {#data-missing-after-migration}

1. बैकअप बनाया गया है (डेटा निर्देशिका की जाँच करें)
2. बैकअप निर्माण संदेशों के लिए कंटेनर लॉग्स की समीक्षा करें
3. डेटाबेस फ़ाइल की एकता की जाँच करें

### प्रमाणीकरण समस्याएँ (0.9.x+) {#authentication-issues-09x}

1. डिफ़ॉल्ट एडमिन खाता मौजूद है (लॉग्स की जाँच करें)
2. डिफ़ॉल्ट क्रेडेंशियल्स का प्रयास करें: `admin` / `Duplistatus09`
3. लॉक आउट होने पर एडमिन रिकवरी टूल का उपयोग करें
4. `users` तालिका डेटाबेस में मौजूद है

### API त्रुटियाँ {#api-errors}

1. [Backward-incompatible API changes](api-changes.md) के लिए endpoint updates की जाँच करें
2. नए फ़ील्ड नामों के साथ बाहरी integrations को अपडेट करें
3. API requests में authentication जोड़ें (0.9.x+)
4. migration के बाद API endpoints का परीक्षण करें

### Master Key Issues (0.8.x+) {#master-key-issues-08x}

1. `.duplistatus.key` फ़ाइल को पहुँच योग्य सुनिश्चित करें
2. फ़ाइल permissions को 0400 पर सेट करें
3. key generation errors के लिए container logs की जाँच करें

### Podman DNS Configuration {#podman-dns-configuration}

यदि आप Podman का उपयोग कर रहे हैं और अपग्रेड के बाद नेटवर्क कनेक्टिविटी समस्याओं का सामना कर रहे हैं, तो आपको अपने container के लिए DNS सेटिंग्स को कॉन्फ़िगर करने की आवश्यकता हो सकती है। विवरण के लिए इंस्टॉलेशन गाइड में [DNS configuration section](../installation/installation.md#configuring-dns-for-podman-containers) देखें।

## Rollback Procedure {#rollback-procedure}

यदि आपको पिछले संस्करण पर वापस जाना है:

1. **Stop the container**: `docker stop <container-name>` (or `podman stop <container-name>`)
2. **Find your backup**: 
   - यदि आपने वेब इंटरफ़ेस का उपयोग करके बैकअप बनाया है (संस्करण 1.2.1+), तो उस डाउनलोड किए गए बैकअप फ़ाइल का उपयोग करें
   - यदि आपने मैनुअल वॉल्यूम बैकअप बनाया है, तो इसे पहले निकालें
   - ऑटोमेटिक माइग्रेशन बैकअप डेटा डायरेक्टरी में स्थित हैं (timestamped `.db` फ़ाइलें)
3. **Restore the database**: 
   - **वेब इंटरफ़ेस बैकअप के लिए (संस्करण 1.2.1+)**: `Settings → Database Maintenance` में रिस्टोर फ़ंक्शन का उपयोग करें (देखें [Database Maintenance](../user-guide/settings/database-maintenance.md#database-restore))
   - **मैनुअल बैकअप के लिए**: बैकअप फ़ाइल के साथ अपने डेटा डायरेक्टरी/वॉल्यूम में `backups.db` को बदलें
4. **Use previous image version**: पिछले container image को पुल और चलाएं
5. **Start the container**: पिछले संस्करण के साथ शुरू करें

:::warning
रोलबैक करने से नए स्कीमा के साथ पिछले संस्करण के असंगत होने की स्थिति में डेटा हानि हो सकती है। रोलबैक करने से पहले हमेशा सुनिश्चित करें कि आपके पास एक हालिया बैकअप है।
:::

### Troubleshooting Your Restore / Rollback {#troubleshooting-your-restore--rollback}

यदि एप्लिकेशन रिस्टोर या रोलबैक के बाद शुरू नहीं होता है या आपका डेटा दिखाई नहीं देता है, तो निम्नलिखित सामान्य समस्याओं की जाँच करें:

#### 1. Database File Permissions (Linux/Podman) {#1-database-file-permissions-linuxpodman}

यदि आपने फ़ाइल को `root` उपयोगकर्ता के रूप में रिस्टोर की है, तो container के अंदर एप्लिकेशन को इसे पढ़ने या लिखने की अनुमति नहीं हो सकती है।

* **The Symptom:** लॉग "Permission Denied" या "Read-only database." दिखाते हैं
* **The Fix:** container के अंदर फ़ाइल की permissions को रीसेट करें ताकि यह पहुँच योग्य हो।

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```

#### 2. Incorrect Filename {#2-incorrect-filename}

एप्लिकेशन विशेष रूप से `backups.db` नाम की फ़ाइल के लिए खोजता है।

* **The Symptom:** एप्लिकेशन शुरू होता है लेकिन "खाली" लगता है (जैसे एक नया इंस्टॉलेशन)।
* **The Fix:** `/app/data/` डायरेक्टरी की जाँच करें। यदि आपकी फ़ाइल का नाम `duplistatus-backup-2024.db` है या `.sqlite` एक्सटेंशन है, तो ऐप इसे अनदेखा करेगा। इसे `backups.db` के रूप में ठीक से नाम बदलने के लिए `mv` कमांड या Docker Desktop GUI का उपयोग करें।

#### 3. Container Not Restarted {#3-container-not-restarted}

कुछ सिस्टम पर, कंटेनर चलते समय `docker cp` का उपयोग करने से एप्लिकेशन का डेटाबेस से कनेक्शन ताज़ा नहीं हो सकता।

* **सुलझाने का तरीका:** हमेशा एक रिस्टोर के बाद एक पूर्ण रीस्टार्ट करें:

```bash
docker restart duplistatus
```

#### 4. डेटाबेस संस्करण का असंगति {#4-database-version-mismatch}

यदि आप एक बहुत नए संस्करण के duplistatus से एक बैकअप रिस्टोर कर रहे हैं, तो ऐप का पुराना संस्करण डेटाबेस स्कीमा के साथ असंगत हो सकता है।

* **सुलझाने का तरीका:** हमेशा सुनिश्चित करें कि आप बैकअप बनाने वाले संस्करण के समान (या नए) संस्करण का duplistatus इमेज चल रहे हैं। अपने संस्करण की जाँच करें:

```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```

## डेटाबेस स्कीमा संस्करण {#database-schema-versions}

| एप्लिकेशन संस्करण        | स्कीमा संस्करण | मुख्य बदलाव                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x और उससे पहले          | v1.0           | प्रारंभिक स्कीमा                                     |
| 0.7.x                      | v2.0, v3.0     | कॉन्फ़िगरेशन जोड़े गए, मशीन को सर्वर में नाम बदल दिया   |
| 0.8.x                      | v3.1           | बैकअप फ़ील्ड में सुधार, एन्क्रिप्शन समर्थन         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x, 1.3.x | v4.0           | उपयोगकर्ता एक्सेस कंट्रोल, प्रमाणीकरण, ऑडिट लॉगिंग |

## सहायता प्राप्त करना {#getting-help}

- **दस्तावेज़ीकरण**: [उपयोगकर्ता गाइड](../user-guide/overview.md)
- **API संदर्भ**: [API दस्तावेज़ीकरण](../api-reference/overview.md)
- **API बदलाव**: [पीछे के अनुकूल नहीं होने वाले API बदलाव](api-changes.md)
- **रिलीज़ नोट्स**: वर्जन-विशिष्ट रिलीज़ नोट्स के लिए विस्तृत बदलाव की जाँच करें
- **समुदाय**: [GitHub चर्चाएँ](https://github.com/wsj-br/duplistatus/discussions)
- **समस्याएँ**: [GitHub समस्याएँ](https://github.com/wsj-br/duplistatus/issues)
