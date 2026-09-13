# Templates {/* #templates */}

**duplistatus** चेतावनी संदेशों के लिए चार टेम्प्लेट्स का उपयोग करता है। ईमेल बॉडी मार्कडाउन होती है (शीर्षक, सूचियाँ, लिंक, और टेबल)। सफलता, चेतावनी/त्रुटि, और विलंबित के लिए NTFY एक ही मार्कडाउन बॉडी का उपयोग करता है, जिसे `Markdown: yes` के साथ भेजा जाता है ताकि ntfy क्लाइंट इसे रेंडर कर सके। किसी भी GFM टेबल का हेडर रॉ को छोड़ दिया जाता है और बॉडी को सादा पाठ के रूप में भेजा जाता है, क्योंकि ntfy टेबल को रेंडर नहीं करता है। दैनिक सारांश केवल ईमेल के लिए है।

प्रश्ठ में एक **Templeit Bhasha** चयनकर्ता शामिल है जो डिफ़ॉल्ट टेम्प्लेट्स के लिए लोकल सेट करता है। भाषा बदलने से नए डिफ़ॉल्ट्स के लिए लोकल अपडेट होता है, लेकिन यह मौजूदा टेम्प्लेट्स के पाठ को **बदलता नहीं है**। अपने टेम्प्लेट्स पर नई भाषा लागू करने के लिए, उन्हें मैन्युअल रूप से संपादित करें या **इस परनाली को डिफ़ॉल्ट पर पुनः स्थापित करें** (वर्तमान टैब के लिए) या **सभी को डिफ़ॉल्ट पर पुनः स्थापित करें** (सभी टेम्प्लेट्स के लिए) का उपयोग करें।

![notification templates](../../assets/screen-settings-templates.png)

| Template           | Description                                         |
| :----------------- | :-------------------------------------------------- |
| **Success**        | Used when backups complete successfully.            |
| **Warning/Error**  | Used when backups complete with warnings or errors. |
| **Overdue Backup** | Used when backups are overdue.                      |
| **दैनिक सारांश**  | वैकल्पिक दैनिक स्नैपशॉट के लिए मार्कडाउन ईमेल टेम्पलेट। |

<br/>

## Templeit Bhasha {/* #template-language */}

Prushth ke upar ek **Templeit Bhasha** chayanak lets you choose the language for default templates (English, German, French, Spanish, Portuguese, Hindi, aur Simplified Chinese). Bhaasha badalane se defaults ke liye locale update hota hai, lekin existing customized templates apne Vartaman text rakhte hain jab tak aap unhe update nahi karte ya reset buttons me se ek use nahi karte.

<br/>

## उपलब्ध क्रियाएं {/* #available-actions */}

| बटन                                                              | विवरण                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="टेम्प्लेट सेटिंग्स सहेजें" />                      | टेम्प्लेट बदलते समय सेटिंग्स सहेजता है। बटन वह टेम्प्लेट सहेजता है जो प्रदर्शित किया जा रहा है (सफलता, चेतावनी/त्रुटि, विलंबित बैकअप, या दैनिक सारांश)। |
| <IconButton icon="lucide:send" label="परीक्षण सूचना भेजें"/>     | इसे अपडेट करने के बाद टेम्पलेट की जाँच करता है। परीक्षण के लिए वेरिएबल उनके नामों से बदल दिए जाएंगे। ईमेल सूचनाओं के लिए, टेम्पलेट शीर्षक ईमेल विषय पंक्ति बन जाता है। दैनिक सारांश टैब पर उपलब्ध नहीं है। |
| <IconButton icon="lucide:rotate-ccw" label="Reset this template to default"/> | Restores the default template for the **selected template** (the current tab). Remember to save after resetting. |
| <IconButton icon="lucide:rotate-ccw" label="सभी को डिफ़ॉल्ट पर रीसेट करें"/> | सभी टेम्प्लेट्स (सफलता, चेतावनी/त्रुटि, विलंबित बैकअप, और दैनिक सारांश) को चयनित टेम्प्लेट भाषा के लिए डिफ़ॉल्ट पर रीसेट करता है। रीसेट करने के बाद सहेजने को याद रखें। |

<br/>

## चर {/* #variables */}

ईमेल बॉडी मार्कडाउन होती है। शीर्षक, सूचियाँ, लिंक, और टेबल समर्थित हैं। प्लेसहोल्डर मान एस्केप्ड पाठ के रूप में डाल दिए जाते हैं और वे मार्कडाउन या HTML को परिभाषित नहीं कर सकते। पहले कस्टम टेम्प्लेट्स में एम्बेडेड रॉ HTML अब एस्केप्ड है। NTFY को उसी मार्कडाउन प्राप्त होता है, केवल GFM टेबल: हेडर रॉ को छोड़ दिया जाता है और बॉडी पंक्तियाँ सादा पाठ के रूप में भेजी जाती हैं, किसी भी कॉलम लेआउट के लिए।

Default Safalta, Chetavani/Trik, और Vilambit के बॉडी डेली सारांश के समान मार्कडाउन शैली का उपयोग करते हैं: एक शीर्षक, बोल्ड मान, और एक अवलोकन तालिका। अपरिवर्तित स्टोर किए गए डिफ़ॉल्ट लोड पर अपग्रेड किए जाते हैं; कस्टम टेम्पलेट्स बनाए रखे जाते हैं।

सभी सफलता, चेतावनी/त्रुटि, और विलंबित टेम्प्लेट्स वेरिएबल्स का समर्थन करते हैं जो वास्तविक मानों से बदल दिए जाएंगे। निम्नलिखित टेबल उपलब्ध वेरिएबल्स दिखाता है:

| वेरिएबल               | विवरण                                     | उपलब्ध है     |
|:-----------------------|:------------------------------------------------|:-----------------|
| `{server_name}`        | सर्वर का नाम।                             | सफलता, चेतावनी, विलंबित |
| `{server_alias}`       | सर्वर का उपनाम।                            | सफलता, चेतावनी, विलंबित |
| `{server_note}`        | सर्वर के लिए नोट।                            | सफलता, चेतावनी, विलंबित |
| `{server_url}`         | डुप्लिकेट सर्वर वेब कॉन्फ़िगरेशन का URL   | सफलता, चेतावनी, विलंबित |
| `{backup_name}`        | बैकअप का नाम।                             | सफलता, चेतावनी, विलंबित |
| `{status}`             | Backup की स्थिति (Safalta, Chetavaniya, Truti, Gambhir). | Safalta, Chetavaniya |
| `{backup_date}`        | Backup की तारीख और समय.                    | Safalta, Chetavaniya |
| `{duration}`           | Backup की अवधि.                         | Safalta, Chetavaniya |
| `{uploaded_size}`      | अपलोड किए गए डेटा की मात्रा.                        | Safalta, Chetavaniya |
| `{storage_size}`       | संचयन उपयोग जानकारी.                      | Safalta, Chetavaniya |
| `{available_versions}` | उपलब्ध backup संस्करणों की संख्या.            | Safalta, Chetavaniya |
| `{file_count}`         | प्रबंधित fileों की संख्या.                      | Safalta, Chetavaniya |
| `{file_size}`          | backup की गई fileों का कुल आकार.                  | Safalta, Chetavaniya |
| `{messages_count}`     | संदेशों की संख्या.                             | Safalta, Chetavaniya |
| `{warnings_count}`     | चेतावनियों की संख्या.                             | Safalta, Chetavaniya |
| `{errors_count}`       | त्रुटियों की संख्या.                               | Safalta, Chetavaniya |
| `{log_text}`           | केवल Warning aur Truti log लाइनें (संपूर्ण Information logs नहीं)। NTFY एक संक्षिप्त सारांश का उपयोग करता है और छोटा कर सकता है। | Safalta, Warning |
| `{last_backup_date}`   | अंतिम backup की तारीख.                        | Vilambit          |
| `{last_elapsed}`       | अंतिम backup से बीते समय.             | Vilambit          |
| `{expected_date}`      | अपेक्षित backup तारीख.                           | Vilambit          |
| `{expected_elapsed}`   | अपेक्षित तारीख से बीते समय.           | Vilambit          |
| `{backup_interval}`    | अंतराल स्ट्रिंग (उदाहरण, "1D", "2W", "1M").       | Vilambit          |
| `{overdue_tolerance}`  | विलंब सहनशीलता सेटिंग.                      | Vilambit          |

दैनिक सारांश टेम्प्लेट्स वर्तमान-स्थिति स्नैपशॉट के लिए एक अलग सेट वेरिएबल्स का उपयोग करते हैं:

| वेरिएबल | विवरण |
|:---------|:------------|
| `{summary_date}` | स्नैपशॉट का स्थानीय कैलेंडर तिथि |
| `{generated_at}` | स्नैपशॉट जनरेट किया गया तिथि और समय |
| `{time_zone}` | सहेजा गया IANA समय क्षेत्र |
| `{server_count}` / `{job_count}` | सर्वर और ज्ञात कार्य |
| `{success_count}` / `{warning_count}` / `{error_count}` / `{fatal_count}` / `{unknown_count}` / `{no_report_count}` | परस्परविरोधी स्थिति बकेट्स |
| `{overdue_count}` | विलंबित कार्य (स्थिति से स्वतंत्र; ऊपर दिए गए बकेट्स से ओवरलैप हो सकते हैं) |
| `{problem_table}` / `{all_jobs_table}` | ध्यान देने वाले और सभी कार्य के लिए उत्पन्न किए गए तालिकाएँ। कॉलम: सर्वर, बैकअप, विलंबित, अंतिम स्थिति, अंतिम परिणाम, अवधि, चेतावनियाँ, त्रुटियाँ, अपलोड किया गया। |
| `{duplistatus_link}` | duplistatus डैशबोर्ड का लिंक (जब कोई सार्वजनिक URL कॉन्फ़िगर नहीं किया गया है तो छोड़ दिया गया)। हाथ से बनाए गए Markdown लिंक पर इसे प्राथमिकता दें। |
| `{duplistatus_url}` | सादा पाठ के रूप में वही URL (जब कोई सार्वजनिक URL कॉन्फ़िगर नहीं किया गया है तो खाली)। |
| `{latest_uploaded_size}` / `{latest_source_size}` / `{latest_storage_size}` / `{latest_file_count}` / `{total_warnings}` / `{total_errors}` | नवीनतम परिणाम कुल |

डिफ़ॉल्ट दैनिक सारांश ईमेल विषय है:

```text
Daily Backup Summary — {summary_date} — ✅ {success_count} Success, ⚠️ {warning_count} Warning, 🕑 {overdue_count} Overdue, 🛑 {error_count} Error, ❌ {fatal_count} Fatal
```

अपरिवर्तित संग्रहीत डिफ़ॉल्ट विषयों को इस प्रारूप में अपग्रेड किया जाता है। कस्टमाइज़ किए गए विषयों को अपरिवर्तित छोड़ा जाता है। `{unknown_count}` और `{no_report_count}` ईमेल बॉडी में रहते हैं, न कि डिफ़ॉल्ट विषय में।

**पूर्वावलोकन** का उपयोग ईमेल विषय, HTML, और सादा पाठ को भेजे बिना रेंडर करने के लिए किया जाता है। सफलता, चेतावनी/त्रुटि, और विलंबित पूर्वावलोकन में NTFY मार्कडाउन पेलोड भी शामिल होता है। पूर्वावलोकन एक डायलॉग में खुलता है। ईमेल HTML / सादा पाठ / NTFY बटन विषय के ऊपर स्थित होते हैं। ईमेल HTML वर्तमान उज्ज्वल या अंधकार वसतु शैली का पालन करता है।
