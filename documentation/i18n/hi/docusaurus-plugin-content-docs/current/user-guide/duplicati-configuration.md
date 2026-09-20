# Duplicati कॉन्फ़िगरेशन {/* #duplicati-configuration */}

[एप्लिकेशन टूलबार](overview.md#application-toolbar) पर <SvgButton svgFilename="duplicati_logo.svg" /> बटन एक नया टैब में Duplicati सर्वर का वेब इंटरफेस खोलता है।

आप ड्रॉपडाउन सूचि से एक सर्वर का चयन कर सकते हैं। यदि आप पहले से कोई सर्वर का चयन कर चुके हैं (उसके कार्ड पर क्लिक करके) या उसका विवरण देख रहे हैं, तो बटन उस विशिष्ट सर्वर का Duplicati कॉन्फ़िगरेशन सीधे खोलेगा।

![Duplicati कॉन्फ़िगरेशन](../assets/screen-duplicati-configuration.png)

- सर्वर की सूचि में `server name` या `server alias (server name)` दिखाई देगा।
- सर्वर पते [सेटिंग्स → सर्वर](settings/server-settings.md) में कॉन्फ़िगर किए जाते हैं।
- जब आप <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [बैकअप लॉग एकत्र करें](collect-backup-logs.md) सुविधा का उपयोग करते हैं, तो एप्लिकेशन स्वचालित रूप से सर्वर का URL सहेज लेता है।
- यदि सर्वर का पता कॉन्फ़िगर नहीं किया गया है, तो सर्वर सूचि में वे दिखाई नहीं देंगे।

## पुराना Duplicati UI तक पहुँचना {/* #accessing-the-old-duplicati-ui */}

यदि आप नए Duplicati वेब इंटरफेस (`/ngclient/`) के साथ लॉगिन समस्याओं का अनुभव करते हैं, तो आप सर्वर चयन पॉपओवर में <SvgButton svgFilename="duplicati_logo.svg" /> बटन पर या किसी भी सर्वर आइटम पर राइट-क्लिक कर सकते हैं ताकि एक नया टैब में पुराना Duplicati UI (`/ngax/`) खोला जा सके।

<br/><br/>

:::note
 सभी उत्पाद नाम, लोगो और ट्रेडमार्क अपने संबंधित मालिकों की संपत्ति हैं। आइकन और नाम केवल पहचान के उद्देश्य से उपयोग किए जाते हैं और समर्थन का तात्पर्य नहीं रखते।
:::
