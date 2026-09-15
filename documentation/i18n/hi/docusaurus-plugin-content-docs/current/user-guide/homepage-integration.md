# Homepage एकीकरण (वैकल्पिक) {/* #homepage-integration-optional */}

[Homepage](https://gethomepage.dev/) एक कस्टमाइज़ करने योग्य डैशबोर्ड एप्लिकेशन है। **duplistatus** को Homepage के साथ एकीकृत करने के लिए, [कस्टम API विजेट प्रकार](https://gethomepage.dev/widgets/services/customapi/) का उपयोग करके अपनी `services.yaml` फ़ाइल में एक विजेट जोड़ें।

## सारांश विजेट {/* #summary-widget */}

यह विजेट आपके Homepage डैशबोर्ड पर समग्र बैकअप सांख्यिकी प्रदर्शित करता है।

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

![Homepage सारांश विजेट](/img/homepage-summary.png)

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

![Homepage अंतिम बैकअप विजेट](/img/homepage-lastbackup.png)

## कॉन्फ़िगरेशन नोट्स {/* #configuration-notes */}

- `your-server` को अपने सर्वर के आईपी पता या होस्टनाम से बदलें।
- आवश्यकतानुसार `refreshInterval` को समायोजित करें (मिलीसेकंड में)।
- URL में मशीन के नामों में मौजूद स्पेस को `%20` से बदलें (उदाहरण के लिए, `Test Machine 1`, `Test%20Machine%201` बन जाता है)।
- `scale` मान बाइट्स को अधिक पठनीय इकाइयों (GB, MB) में बदलते हैं।
- जब [API कुंजियाँ](settings/api-keys-settings.md) आवश्यक हों, तो **read**-स्कोप API कुंजी का उपयोग करें। कुंजियाँ वैकल्पिक होने पर `?api_key=` को हटा दें।
- यदि [बाहरी API IP अनुमति सूची](settings/ip-allowlist-settings.md) सक्षम है, तो Homepage होस्ट को शामिल करें।
