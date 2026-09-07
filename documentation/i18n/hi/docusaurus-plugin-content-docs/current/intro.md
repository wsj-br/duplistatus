# duplistatus {/* #welcome-to-duplistatus */} में आपका स्वागत है

**duplistatus** - एकल डैशबोर्ड से कई [Duplicati's](https://github.com/duplicati/duplicati) सर्वर की निगरानी करें

## विशेषताएँ {/* #features */}

- **त्वरित सेटअप**: सरल कंटेनराइज़्ड डिप्लॉयमेंट, डॉकर हब और गिटहब पर उपलब्ध छवियों के साथ।
- **संयुक्त डैशबोर्ड**: एक ही स्थान पर सभी सर्वरों के लिए बैकअप स्थिति, इतिहास, डुप्लिकेटी संस्करण और विवरण देखें।
- **बैकअप मॉनिटरिंग**: विलंबित अनुसूचित बैकअप के लिए स्वचालित जांच और अलर्ट।
- **डेटा विज़ुअलाइज़ेशन और लॉग्स**: डुप्लिकेटी सर्वरों से इंटरैक्टिव चार्ट्स और स्वचालित लॉग संग्रहण।
- **Suchnaayein aur Samachar**: NTFY aur SMTP email ke saath backup alerts ke liye samayojit, jisme vilambit backup suchnaayein bhi shamil hain.
- **Upyogkarta prabandhan**: Prabandhak aur Upyogkarta bhavishyakein login, configurable password niyam, account lockout, aur upyogkarta vyavsthaapak.
- **Suraksha ka sthira kiyam**: Vikalpik extra suraksha, Duplicati uploads aur Homepage widgets ke liye API keys (jisme upload size aur rate limits bhi hain), vyavsthaapak इंटरफेस aur बाहरी एपीआई ke liye alag IP allowlists, anti-spoofing suraksha, aur HTTPS reverse-proxy gaidance.
- **Audit Logging**: Sabhi system changes aur Upyogkarta kriyaen ke liye pura audit trail, advanced filtering, export capabilities, aur configurable retention periods.
- **Application Log Viewer**: Admin-only interface application logs को देखें, search करें, और export करें, web interface से directly real-time monitoring capabilities के साथ।
- **Multi-language Support**: Interface और documentation English, French, German, Spanish, Brazilian Portuguese, Hindi और Simplified Chinese में उपलब्ध।

## स्थापना {/* #installation */}

एप्लिकेशन को डॉकर, पोर्टेनर स्टैक या पॉडमैन का उपयोग करके डिप्लॉय किया जा सकता है।
[स्थापना गाइड](installation/installation.md) में विवरण देखें।

- यदि आप एक पूर्व संस्करण से अपग्रेड कर रहे हैं, तो आपका डेटाबेस अपग्रेड प्रक्रिया के दौरान नए स्कीमा में स्वचालित रूप से
  [माइग्रेट](migration/version_upgrade.md) किया जाएगा।

- जब आप पॉडमैन का उपयोग कर रहे हों (एक स्टैंडअलोन कंटेनर के रूप में या पॉड के भीतर), और यदि आपको कस्टम DNS सेटिंग्स की आवश्यकता है
(जैसे टेलस्केप मैजिकडीएनएस, कॉर्पोरेट नेटवर्क, या अन्य कस्टम डीएनएस कॉन्फ़िगरेशन के लिए), तो आप डीएनएस सर्वर और खोज डोमेन को मैन्युअल रूप से निर्दिष्ट कर सकते हैं। अधिक विवरण के लिए स्थापना गाइड देखें।

## Duplicati सर्वर कॉन्फ़िगरेशन (अनिवार्य) {/* #duplicati-servers-configuration-required */}

एक बार आपका **duplistatus** सर्वर चल रहा होता है, आपको अपने **Duplicati** सर्वर को कॉन्फ़िगर करने की आवश्यकता होती है ताकि वे बैकअप लॉग्स को **duplistatus** पर भेज सकें, जैसा कि [Duplicati कॉन्फ़िगरेशन](installation/duplicati-server-configuration.md) अनुभाग में उल्लेखित है। इस कॉन्फ़िगरेशन के बिना, डैशबोर्ड आपके Duplicati सर्वरों से बैकअप डेटा प्राप्त नहीं कर पाएगा।

## उपयोगकर्ता मार्गदर्शिका {/* #user-guide */}

[उपयोगकर्ता गाइड](user-guide/overview.md) में **duplistatus** को कॉन्फ़िगर और उपयोग करने के लिए विस्तृत निर्देश देखें, जिसमें प्रारंभिक सेटअप, सुविधा कॉन्फ़िगरेशन और ट्रबलशूटिंग शामिल है।

## स्क्रीनशॉट {/* #screenshots */}

### डैशबोर्ड {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### बैकअप इतिहास {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### बैकअप विवरण {/* #backup-details */}

![backup-detail](assets/screen-backup-detail.png)

### Overdue Backups {/* #overdue-backups */}

![विलम्बित बैकअप](assets/screen-overdue-backup-hover-card.png)

### आपके फ़ोन पर विलंबित सूचनाएँ {/* #overdue-notifications-on-your-phone */}

![ntfy विलम्बित संदेश](/img/screen-overdue-notification.png)

## API संदर्भ {/* #api-reference */}

[API एंडपॉइंट्स डॉक्यूमेंटेशन](api-reference/overview.md) पर उपलब्ध एंडपॉइंट्स, अनुरोध/प्रतिक्रिया प्रारूपों और उदाहरणों के बारे में विवरण देखें।

## विकास {/* #development */}

कोड डाउनलोड करने, बदलने या चलाने के निर्देशों के लिए, [डेवलपमेंट सेटअप](development/setup.md) देखें।

यह परियोजना मुख्य रूप से AI की मदद से बनाई गई थी। कैसे, यह जानने के लिए [मैंने इस एप्लिकेशन को AI टूल्स का उपयोग करके कैसे बनाया](development/how-i-build-with-ai) देखें।

## श्रेय {/* #credits */}

- सबसे पहले, डुप्लिकेटी बनाने के लिए केनेथ स्कोव्हेडे को धन्यवाद—यह अद्भुत बैकअप टूल। सभी योगदानकर्ताओं को भी धन्यवाद।

💙 यदि आप [डुप्लिकेटी](https://www.duplicati.com) उपयोगी पाते हैं, तो कृपया डेवलपर का समर्थन करने पर विचार करें। अधिक विवरण उनके वेबसाइट या GitHub पेज पर उपलब्ध है।

- API Keys aur IP Allowlists ka ideya/implementation `henmohr` ne issue [#79](https://github.com/wsj-br/duplistatus/issues/79) mein kiya
- Duplicati SVG icon from https://dashboardicons.com/icons/duplicati
- ntfy SVG icon from https://dashboardicons.com/icons/ntfy
- GitHub SVG icon from https://github.com/logos

:::note
 सभी उत्पाद नाम, लोगो और ट्रेडमार्क उनके संबंधित मालिकों का संपत्ति है। आइकन और नाम पहचान के लिए उपयोग किए जाते हैं और समर्थन का इम्प्लाई नहीं करते हैं।
:::

## लाइसेंस {/* #license */}

इस परियोजना को [Apache License 2.0](LICENSE.md) के तहत लाइसेंस दिया गया है।

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Note on UI and documentation translations:** Sabhi interface aur documentation languages except English (UK) were translated with AI using [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); the wording may be imprecise or contain errors.

</small>
