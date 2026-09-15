# अवलोकन {/* #overview */}

सेटिंग्स पृष्ठ **duplistatus** के सभी पहलुओं को कॉन्फ़िगर करने के लिए एक एकीकृत इंटरफ़ेस प्रदान करता है। आप [एप्लिकेशन टूलबार](../overview.md#application-toolbar) में <IconButton icon="lucide:settings" /> **सेटिंग्स** बटन पर क्लिक करके इसे एक्सेस कर सकते हैं। ध्यान दें कि एडमिन की तुलना में सामान्य उपयोगकर्ताओं को कम विकल्पों वाला एक सरल मेनू दिखाई देगा।

## एडमिन दृश्य {/* #administrator-view */}

एडमिन सभी उपलब्ध सेटिंग्स देखते हैं।

<table>
  <tr>
    <td>
      ![सेटिंग्स साइडबार - एडमिन दृश्य](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>सूचनाएं</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">बैकअप सूचनाएं</a>: प्रति-बैकअप सूचना सेटिंग्स कॉन्फ़िगर करें</li>
            <li><a href="backup-monitoring-settings.md">बैकअप निगरानी</a>: अतिदेय बैकअप पहचान और अलर्ट कॉन्फ़िगर करें</li>
            <li><a href="daily-summary-settings.md">दैनिक सारांश</a>: वैकल्पिक दैनिक स्नैपशॉट जो डिफ़ॉल्ट प्राप्तकर्ता को जाने वाले ईमेल को बदल देता है (अतिरिक्त गंतव्य जारी रहते हैं)</li>
            <li><a href="notification-templates.md">टेम्पलेट</a>: सूचना संदेश टेम्पलेट कस्टमाइज़ करें</li>
          </ul>
        </li><br/>
        <li>
          <strong>एकीकरण</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: NTFY पुश सूचना सेवा कॉन्फ़िगर करें</li>
            <li><a href="email-settings.md">ईमेल</a>: SMTP ईमेल सूचनाएं कॉन्फ़िगर करें</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">सिस्टम</strong>
          <ul>
            <li><a href="server-settings.md">सर्वर</a>: Duplicati सर्वर कॉन्फ़िगरेशन प्रबंधित करें</li>
            <li><a href="display-settings.md">प्रदर्शन सेटिंग्स</a>: थीम, चार्ट समय सीमा, चार्ट शैली, फ़ॉर्मैट लोकेल, स्वतः-रीफ़्रेश अंतराल, कार्ड सॉर्ट क्रम और सप्ताह की शुरुआत कॉन्फ़िगर करें</li>
            <li><a href="duplicati-versions.md">Duplicati संस्करण</a>: कैश्ड Duplicati रिलीज़ संस्करण देखें और संस्करण जांच शेड्यूल कॉन्फ़िगर करें</li>
            <li><a href="database-maintenance.md">डेटाबेस रखरखाव</a>: डेटाबेस की सफ़ाई करें (केवल एडमिन)</li>
            <li><a href="api-keys-settings.md">API कुंजियाँ</a>: स्कोप्ड कुंजियों और बाहरी API सुरक्षा को प्रबंधित करें (केवल एडमिन)</li>
            <li><a href="ip-allowlist-settings.md">IP अनुमति सूची</a>: एडमिन इंटरफ़ेस और बाहरी API को प्रतिबंधित करें (केवल एडमिन)</li>
            <li><a href="user-management-settings.md">उपयोगकर्ता</a>: उपयोगकर्ता खाते प्रबंधित करें (केवल एडमिन)</li>
            <li><a href="audit-logs-viewer.md">ऑडिट लॉग</a>: सिस्टम ऑडिट लॉग देखें</li>
            <li><a href="audit-logs-retention.md">ऑडिट लॉग प्रतिधारण</a>: ऑडिट लॉग प्रतिधारण कॉन्फ़िगर करें (केवल एडमिन)</li>
            <li><a href="application-logs-settings.md">एप्लिकेशन लॉग</a>: एप्लिकेशन लॉग देखें और निर्यात करें (केवल एडमिन)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## गैर-एडमिन दृश्य {/* #non-administrator-view */}

सामान्य उपयोगकर्ताओं को सेटिंग्स का एक सीमित सेट दिखाई देता है।

<table>
  <tr>
    <td>
      ![सेटिंग्स साइडबार - गैर-एडमिन दृश्य](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>सूचनाएं</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">बैकअप सूचनाएं</a>: प्रति-बैकअप सूचना सेटिंग्स देखें (केवल पढ़ने के लिए)</li>
            <li><a href="backup-monitoring-settings.md">बैकअप निगरानी</a>: अतिदेय बैकअप सेटिंग्स देखें (केवल पढ़ने के लिए)</li>
            <li><a href="daily-summary-settings.md">दैनिक सारांश</a>: दैनिक सारांश सेटिंग्स देखें (केवल पढ़ने के लिए)</li>
            <li><a href="notification-templates.md">टेम्पलेट</a>: सूचना टेम्पलेट देखें (केवल पढ़ने के लिए)</li>
          </ul>
        </li><br/>
        <li>
          <strong>एकीकरण</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: NTFY सेटिंग्स देखें (केवल पढ़ने के लिए)</li>
            <li><a href="email-settings.md">ईमेल</a>: ईमेल सेटिंग्स देखें (केवल पढ़ने के लिए)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">सिस्टम</strong>
          <ul>
            <li><a href="server-settings.md">सर्वर</a>: सर्वर कॉन्फ़िगरेशन देखें (केवल पढ़ने के लिए)</li>
            <li><a href="display-settings.md">डिस्प्ले</a>: थीम, चार्ट समय सीमा, चार्ट शैली, फ़ॉर्मैट लोकेल, स्वतः-रीफ़्रेश अंतराल, कार्ड सॉर्ट क्रम, और सप्ताह की शुरुआत कॉन्फ़िगर करें</li>
            <li><a href="duplicati-versions.md">Duplicati संस्करण</a>: कैश किए गए Duplicati रिलीज़ संस्करण देखें (शेड्यूल परिवर्तन केवल एडमिन के लिए हैं)</li>
            <li><a href="audit-logs-viewer.md">ऑडिट लॉग</a>: सिस्टम ऑडिट लॉग देखें (केवल पढ़ने के लिए)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## स्थिति आइकन {/* #status-icons */}

साइडबार **NTFY** और **ईमेल** एकीकरण सेटिंग्स के बगल में स्थिति आइकन प्रदर्शित करता है:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **हरा आइकन**: आपकी सेटिंग्स मान्य हैं और सही ढंग से कॉन्फ़िगर की गई हैं
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **पीला आइकन**: आपकी सेटिंग्स मान्य नहीं हैं या कॉन्फ़िगर नहीं है

जब कॉन्फ़िगरेशन अमान्य होता है, तो [बैकअप सूचनाएं](backup-notifications-settings.md) टैब में संबंधित चेकबॉक्स धूसर हो जाएंगे और अक्षम हो जाएंगे। अधिक विवरण के लिए, [NTFY सेटिंग्स](ntfy-settings.md) और [ईमेल सेटिंग्स](email-settings.md) पृष्ठ देखें।

<br/>

:::important
हरे आइकन का अनिवार्य रूप से यह अर्थ नहीं है कि सूचनाएं सही ढंग से काम कर रही हैं। उन पर निर्भर होने से पहले यह पुष्टि करने के लिए कि आपकी सूचनाएं काम कर रही हैं, हमेशा उपलब्ध परीक्षण सुविधाओं का उपयोग करें। 
:::

<br/>
