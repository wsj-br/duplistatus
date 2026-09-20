# मुखपृष्ठ एकीकरण (वैकल्पिक) {/* #homepage-integration-optional */}

[मुखपृष्ठ](https://gethomepage.dev/) एक अनुकूलन योग्य डैशबोर्ड एप्लिकेशन है। मुखपृष्ठ के साथ **duplistatus** को एकीकृत करने के लिए, [कस्टम एपीआई विजेट प्रकार](https://gethomepage.dev/widgets/services/customapi/) का उपयोग करके अपनी `services.yaml` फ़ाइल में एक विजेट जोड़ें।

## सारांश विजेट {/* #summary-widget */}

यह विजेट आपके मुखपृष्ठ डैशबोर्ड पर समग्र बैकअप सांख्यिकी प्रदर्शित करता है।

```yaml
- Dashboard:
    icon: mdi-cloud-upload
    href: http://your-server:9666/
    widget:
      type: customapi
      url: http://your-server:9666/api/summary?api_key=YOUR_READ_KEY
      display: list
      refreshInterval: 60000
      mappings:
        - field: totalServers
          label: Servers
        - field: totalBackups
          label: Backups received
        - field: secondsSinceLastBackup
          label: Last backup
          format: duration
        - field: totalBackupSize
          label: Backed up size
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalStorageUsed
          label: Storage used
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalUploadedSize
          label: Uploaded size
          format: number
          scale: 0.000000001
          suffix: GB
```

**विजेट प्रदर्शन:**

![मुखपृष्ठ सारांश विजेट](/img/homepage-summary.png)

## अंतिम बैकअप जानकारी विजेट {/* #last-backup-information-widget */}

यह विजेट किसी विशिष्ट मशीन के लिए नवीनतम बैकअप जानकारी प्रदर्शित करता है।

```yaml
- Test Machine 1:
    icon: mdi-test-tube
    widget:
      type: customapi
      url: http://your-server:9666/api/lastbackup/Test%20Machine%201?api_key=YOUR_READ_KEY
      display: list
      refreshInterval: 60000
      mappings:
        - field: latest_backup.name
          label: Backup name
        - field: latest_backup.status
          label: Result
        - field: latest_backup.date
          label: Date
          format: relativeDate
        - field: latest_backup.duration
          label: Duration
        - field: latest_backup.uploadedSize
          label: Bytes Uploaded
          format: number
          scale: 0.000001
          suffix: MB
        - field: latest_backup.backup_list_count
          label: Versions
```

**विजेट प्रदर्शन:**

![मुखपृष्ठ अंतिम बैकअप विजेट](/img/homepage-lastbackup.png)

## कॉन्फ़िगरेशन नोट्स {/* #configuration-notes */}

- अपने सर्वर के आईपी पते या होस्टनाम के साथ `your-server` को प्रतिस्थापित करें।
- आवश्यकतानुसार `refreshInterval` को समायोजित करें (मिलीसेकंड में)।
- यूआरएल में मशीन नामों में रिक्त स्थान को `%20` के साथ प्रतिस्थापित करें (उदाहरण के लिए, `Test Machine 1` `Test%20Machine%201` बन जाता है)।
- `scale` मान बाइट्स को अधिक पठनीय इकाइयों (जीबी, एमबी) में परिवर्तित करते हैं।
- जब [एपीआई कुंजियाँ](settings/api-keys-settings.md) की आवश्यकता हो तो **पढ़ें**-स्कोप एपीआई कुंजी का उपयोग करें। जब कुंजियाँ वैकल्पिक हों तो `?api_key=` को छोड़ दें।
- यदि [बाहरी एपीआई आईपी अनुमति सूची](settings/ip-allowlist-settings.md) सक्षम है, तो मुखपृष्ठ होस्ट को शामिल करें।
