# Duplicati कॉन्फ़िगरेशन {/* #duplicati-configuration */}

[एप्लिकेशन टूलबार](overview.md#application-toolbar) पर मौजूद <SvgButton svgFilename="duplicati_logo.svg" /> बटन Duplicati सर्वर के वेब इंटरफ़ेस को एक नए टैब में खोलता है।

आप ड्रॉपडाउन सूची से एक सर्वर चुन सकते हैं। यदि आपने पहले ही कोई सर्वर चुन लिया है (उसके कार्ड पर क्लिक करके) या उसका विवरण देख रहे हैं, तो यह बटन सीधे उस विशिष्ट सर्वर का Duplicati कॉन्फ़िगरेशन खोलेगा।

![Duplicati कॉन्फ़िगरेशन](../assets/screen-duplicati-configuration.png)

- सर्वर की सूची `server name` या `server alias (server name)` दिखाएगी।
- सर्वर पते [सेटिंग्स → सर्वर](settings/server-settings.md) में कॉन्फ़िगर किए जाते हैं।
- जब आप <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [बैकअप लॉग एकत्र करें](collect-backup-logs.md) सुविधा का उपयोग करते हैं, तो एप्लिकेशन सर्वर का URL स्वचालित रूप से सहेज लेता है।
- यदि सर्वर का पता कॉन्फ़िगर नहीं किया गया है, तो वे सर्वर सूची में दिखाई नहीं देंगे।

## पुराने Duplicati UI को एक्सेस करना {/* #accessing-the-old-duplicati-ui */}

यदि आप नए Duplicati वेब इंटरफ़ेस (`/ngclient/`) के साथ लॉगिन समस्याओं का सामना करते हैं, तो आप पुराने Duplicati UI (`/ngax/`) को एक नए टैब में खोलने के लिए <SvgButton svgFilename="duplicati_logo.svg" /> बटन पर या सर्वर चयन पॉपओवर में किसी भी सर्वर आइटम पर राइट-क्लिक कर सकते हैं।

<br/><br/>

:::note
सभी उत्पाद नाम, लोगो और ट्रेडमार्क उनके संबंधित स्वामियों की संपत्ति हैं। आइकन और नामों का उपयोग केवल पहचान के उद्देश्य से किया जाता है और इसका अर्थ कोई समर्थन नहीं है।
:::
