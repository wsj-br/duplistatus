# Overview {/* #overview */}

Sammaan prushth ek ekikrit antarmukh prदान करता है जिसके माध्यम से **duplistatus** के सभी पक्षों का संरचनाबद्धीकरण किया जा सकता है। आप इसे <IconButton icon="lucide:settings" /> **Sammaan** बटन पर क्लिक करके [Application Toolbar](../overview.md#application-toolbar) में प्राप्त कर सकते हैं। ध्यान दें कि सामान्य उपयोगकर्ताओं को प्रशासकों की तुलना में कम विकल्पों वाला सरलीकृत मेनू दिखाई देगा।

## प्रशासक दृश्य {/* #administrator-view */}

व्यवस्थापक सभी उपलब्ध सेटिंग्स देखते हैं।

<table>
  <tr>
    <td>
      ![सेटिंग्स साइडबार - व्यवस्थापक दृश्य](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Suchnaayein</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">बैकअप suchnaayein</a>: प्रति-बैकअप सूचना सेटिंग्स कॉन्फ़िगर करें</li>
            <li><a href="backup-monitoring-settings.md">बैकअप Monitoring</a>: विलंबित बैकअप पहचान और अलर्ट कॉन्फ़िगर करें</li>
            <li><a href="daily-summary-settings.md">दैनिक सारांश</a>: वैकल्पिक दैनिक स्नैपशॉट जो डिफ़ॉल्ट प्राप्तकर्ता को ईमेल को प्रतिस्थापित करता है (अधिक गंतव्यों के लिए जारी)</li>
            <li><a href="notification-templates.md">Templates</a>: सूचना संदेश टेम्पलेट्स को अनुकूलित करें</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: NTFY पुश सूचना सेवा कॉन्फ़िगर करें</li>
            <li><a href="email-settings.md">Email</a>: SMTP ईमेल सूचनाओं को कॉन्फ़िगर करें</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">प्रणाली</strong>
          <ul>
            <li><a href="server-settings.md">सर्वर</a>: डुप्लिकेटी सर्वर कॉन्फ़िगरेशन प्रबंधित करें</li>
            <li><a href="display-settings.md">Display settings</a>: विषय, चार्ट समय सीमा, चार्ट शैली, फ़ॉर्मेट स्थानीय, ऑटो-रीफ्रेश अंतराल, कार्ड क्रम क्रम, और सप्ताह की शुरुआत कॉन्फ़िगर करें</li>
            <li><a href="duplicati-versions.md">डुप्लिकेटी संस्करण</a>: कैश किए गए डुप्लिकेटी रिलीज़ संस्करण देखें और संस्करण जांच कार्यक्रम कॉन्फ़िगर करें</li>
            <li><a href="database-maintenance.md">डेटाबेस रखरखाव</a>: डेटाबेस सफाई करें (व्यवस्थापक केवल)</li>
            <li><a href="api-keys-settings.md">एपीआई कुंजियाँ</a>: स्कोप किए गए कुंजियों और बाहरी एपीआई सुरक्षा का प्रबंधन करें (व्यवस्थापक केवल)</li>
            <li><a href="ip-allowlist-settings.md">आईपी अनुमति सूची</a>: व्यवस्थापक इंटरफेस और बाहरी एपीआई को प्रतिबंधित करें (व्यवस्थापक केवल)</li>
            <li><a href="user-management-settings.md">उपयोगकर्ता</a>: उपयोगकर्ता खातों का प्रबंधन करें (व्यवस्थापक केवल)</li>
            <li><a href="audit-logs-viewer.md">ऑडिट लॉग</a>: सिस्टम ऑडिट लॉग देखें</li>
            <li><a href="audit-logs-retention.md">ऑडिट लॉग रिटेंशन</a>: ऑडिट लॉग रिटेंशन कॉन्फ़िगर करें (व्यवस्थापक केवल)</li>
            <li><a href="application-logs-settings.md">Application logs</a>: एप्लिकेशन लॉग देखें और निर्यात करें (व्यवस्थापक केवल)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## गैर-प्रशासक दृश्य {/* #non-administrator-view */}

नियमित उपयोगकर्ताओं को सेटिंग्स का एक सीमित सेट दिखाई देता है।

<table>
  <tr>
    <td>
      ![सेटिंग्स साइडबार - गैर-प्रबंधक दृश्य](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>सूचनाएँ</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">बैकअप सूचनाएँ</a>: प्रति-बैकअप सूचना सेटिंग्स देखें (पढ़ने के लिए केवल)</li>
            <li><a href="backup-monitoring-settings.md">बैकअप मॉनिटरिंग</a>: विलंबित बैकअप सेटिंग्स देखें (पढ़ने के लिए केवल)</li>
            <li><a href="daily-summary-settings.md">दैनिक सारांश</a>: दैनिक सारांश सेटिंग्स देखें (पढ़ने के लिए केवल)</li>
            <li><a href="notification-templates.md">टेम्पलेट्स</a>: सूचना टेम्पलेट्स देखें (पढ़ने के लिए केवल)</li>
          </ul>
        </li><br/>
        <li>
          <strong>इंटीग्रेशन</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: NTFY सेटिंग्स देखें (पढ़ने के लिए केवल)</li>
            <li><a href="email-settings.md">ईमेल</a>: ईमेल सेटिंग्स देखें (पढ़ने के लिए केवल)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">प्रणाली</strong>
          <ul>
            <li><a href="server-settings.md">सर्वर</a>: सर्वर कॉन्फ़िगरेशन देखें (पढ़ने के लिए केवल)</li>
            <li><a href="display-settings.md">प्रदर्शन</a>: विषय, चार्ट समय परिमाण, चार्ट शैलियाँ, फ़ॉर्मेट स्थानीय, ऑटो-रीफ्रेश अंतराल, कार्ड क्रम क्रम, और सप्ताह की शुरुआत कॉन्फ़िगर करें</li>
            <li><a href="duplicati-versions.md">डुप्लिकेटी संस्करण</a>: कैश किए गए डुप्लिकेटी रिलीज़ संस्करण देखें (अनुसूची परिवर्तन केवल प्रबंधक के लिए)</li>
            <li><a href="audit-logs-viewer.md">ऑडिट लॉग</a>: सिस्टम ऑडिट लॉग देखें (पढ़ने के लिए केवल)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## स्थिति आइकन {/* #status-icons */}

साइडबार **NTFY** और **ईमेल** इंटीग्रेशन सेटिंग्स के बगल में स्थिति आइकन प्रदर्शित करता है:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **हरा आइकन**: आपकी सेटिंग्स मान्य हैं और सही तरीके से कॉन्फ़िगर की गई हैं
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **पीला आइकन**: आपकी सेटिंग्स मान्य नहीं हैं या कॉन्फ़िगर नहीं की गई हैं

जब कॉन्फ़िगरेशन अमान्य होता है, तो [बैकअप सूचनाएँ](backup-notifications-settings.md) टैब में संबंधित चेकबॉक्स ग्रे और निष्क्रिय हो जाएंगे। अधिक विवरण के लिए, [NTFY सेटिंग्स](ntfy-settings.md) और [ईमेल सेटिंग्स](email-settings.md) पृष्ठ देखें।

<br/>

:::important
एक हरा आइकन यह नहीं बताता कि सूचनाएँ सही तरीके से कार्य कर रही हैं। हमेशा उपलब्ध परीक्षण सुविधाओं का उपयोग करें यह पुष्टि करने के लिए कि आपकी सूचनाएँ कार्य कर रही हैं, पहले उन पर निर्भर होने से पहले। 
:::

<br/>
