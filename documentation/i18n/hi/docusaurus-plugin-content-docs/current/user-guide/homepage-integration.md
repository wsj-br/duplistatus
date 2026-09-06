# होमपेज एकीकरण (optional) {#homepage-integration-optional}

[होमपेज](https://gethomepage.dev/) एक अनुकूलन योग्य डैशबोर्ड एप्लिकेशन है। **duplistatus** को होमपेज के साथ एकीकरण करने के लिए, [Custom API widget type](https://gethomepage.dev/widgets/services/customapi/) का उपयोग करके अपने `services.yaml` फ़ाइल में एक विजेट जोड़ें।

## सारांश विजेट {#summary-widget}

यह विजेट आपके होमपेज डैशबोर्ड पर समग्र बैकअप आँकड़े प्रदर्शित करता है।

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

![होमपेज सारांश विजेट](/img/homepage-summary.png)

## अंतिम बैकअप जानकारी विजेट {#last-backup-information-widget}

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

![होमपेज अंतिम बैकअप विजेट](/img/homepage-lastbackup.png)

## विन्यास नोट्स {#configuration-notes}

- `your-server` को अपने सर्वर के IP पते या होस्टनेम से बदलें।
- `refreshInterval` को आवश्यकतानुसार समायोजित करें (मिलीसेकंड में)।
- URL में मशीन नामों में अंतराल को `%20` से बदलें (उदाहरण के लिए, `Test Machine 1` को `Test%20Machine%201` में बदलें)।
- `scale` मान बाइट को अधिक पठनीय इकाइयों (GB, MB) में परिवर्तित करते हैं।
- **पढ़ें**-स्कोप एपीआई कुंजियाँ का उपयोग करें जब [एपीआई कुंजियाँ](settings/api-keys-settings.md) की आवश्यकता हो। कुंजियाँ वैकल्पिक होने पर `?api_key=` छोड़ दें।
- अगर [बाहरी एपीआई आईपी अनुमति सूची](settings/ip-allowlist-settings.md) सक्शम किया गया है, तो होमपेज होस्ट शामिल करें।
