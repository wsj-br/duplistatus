# अवलोकन {/* #overview */}

सेटिंग्स पृष्ठ **duplistatus** के सभी पहलुओं को कॉन्फ़िगर करने के लिए एक एकीकृत इंटरफ़ेस प्रदान करता है। आप इसे [एप्लिकेशन टूलबार](../overview.md#application-toolbar) में <IconButton icon="lucide:settings" /> **सेटिंग्स** बटन पर क्लिक करके एक्सेस कर सकते हैं। ध्यान दें कि सामान्य उपयोगकर्ता व्यवस्थापकों की तुलना में कम विकल्पों वाला एक सरलीकृत मेनू देखेंगे।

## व्यवस्थापक दृश्य {/* #administrator-view */}

व्यवस्थापक सभी उपलब्ध सेटिंग्स देखते हैं।

<table>
  <tr>
    <td>
      ![सेटिंग्स साइडबार - व्यवस्थापक दृश्य](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>सूचनाएं</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">बैकअप सूचनाएं</a>: प्रति-बैकअप सूचना सेटिंग्स कॉन्फ़िगर करें</li>
            <li><a href="backup-monitoring-settings.md">बैकअप निगरानी</a>: अतिदेय बैकअप का पता लगाना और चेतावनी कॉन्फ़िगर करें</li>
            <li><a href="daily-summary-settings.md">दैनिक सारांश</a>: डिफ़ॉल्ट प्राप्तकर्ता के लिए ईमेल को बदलने वाला वैकल्पिक दैनिक स्नैपशॉट (अतिरिक्त गंतव्य जारी रहते हैं)</li>
            <li><a href="notification-templates.md">टेम्पलेट</a>: अनुकूलित सूचना संदेश टेम्पलेट</li>
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
            <li><a href="display-settings.md">प्रदर्शन सेटिंग्स</a>: थीम, चार्ट समय सीमा, चार्ट शैली, फ़ॉर्मैट लोकेल, स्वतः-रीफ़्रेश अंतराल, कार्ड क्रमबद्ध करने का क्रम और सप्ताह की शुरुआत कॉन्फ़िगर करें</li>
            <li><a href="duplicati-versions.md">Duplicati संस्करण</a>: कैश किए गए Duplicati रिलीज़ संस्करण देखें और संस्करण जांच शेड्यूल कॉन्फ़िगर करें</li>
            <li><a href="database-maintenance.md">डेटाबेस रखरखाव</a>: डेटाबेस सफाई करें (केवल व्यवस्थापक)</li>
            <li><a href="api-keys-settings.md">API कुंजियाँ</a>: स्कोप्ड कुंजियाँ और बाहरी API सुरक्षा प्रबंधित करें (केवल व्यवस्थापक)</li>
            <li><a href="ip-allowlist-settings.md">IP अनुमति सूची</a>: व्यवस्थापक इंटरफ़ेस और बाहरी API पर प्रतिबंध लगाएं (केवल व्यवस्थापक)</li>
            <li><a href="user-management-settings.md">उपयोगकर्ता</a>: उपयोगकर्ता खाते प्रबंधित करें (केवल व्यवस्थापक)</li>
            <li><a href="audit-logs-viewer.md">ऑडिट लॉग</a>: सिस्टम ऑडिट लॉग देखें</li>
            <li><a href="audit-logs-retention.md">ऑडिट लॉग प्रतिधारण</a>: ऑडिट लॉग प्रतिधारण कॉन्फ़िगर करें (केवल व्यवस्थापक)</li>
            <li><a href="application-logs-settings.md">एप्लिकेशन लॉग</a>: एप्लिकेशन लॉग देखें और निर्यात करें (केवल व्यवस्थापक)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## गैर-व्यवस्थापक दृश्य {/* #non-administrator-view */}

सामान्य उपयोगकर्ता सेटिंग्स का एक सीमित सेट देखते हैं। उन पृष्ठों में सर्वर नाम और बैकअप डेटा [उपयोगकर्ता](user-management-settings.md#server-visibility) से सर्वर अनुदान का पालन करते हैं।

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
            <li><a href="display-settings.md">प्रदर्शन</a>: थीम, चार्ट समय सीमा, चार्ट शैली, फ़ॉर्मैट लोकेल, स्वतः-रीफ़्रेश अंतराल, कार्ड क्रमबद्ध क्रम और सप्ताह प्रारंभ कॉन्फ़िगर करें</li>
            <li><a href="duplicati-versions.md">Duplicati संस्करण</a>: कैश किए गए Duplicati रिलीज़ संस्करण देखें (अनुसूचि परिवर्तन केवल व्यवस्थापक के लिए हैं)</li>
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
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **पीला आइकन**: आपकी सेटिंग्स मान्य नहीं हैं या कॉन्फ़िगर नहीं की गई हैं

जब कॉन्फ़िगरेशन अमान्य होता है, तो [बैकअप सूचनाएं](backup-notifications-settings.md) टैब में संबंधित चेकबॉक्स धूसरे रंग के हो जाएंगे और अक्षम हो जाएंगे। अधिक विवरण के लिए, [NTFY सेटिंग्स](ntfy-settings.md) और [ईमेल सेटिंग्स](email-settings.md) पृष्ठ देखें।

<br/>

:::important
हरा आइकन यह आवश्यक रूप से नहीं बताता कि सूचनाएं सही ढंग से कार्य कर रही हैं। उन पर भरोसा करने से पहले हमेशा उपलब्ध जाँच सुविधाओं का उपयोग करके पुष्टि करें कि आपकी सूचनाएं काम कर रही हैं। 
:::

<br/>
