# अनुवाद रखरखाव कार्यप्रवाह {/* #translation-maintenance-workflow */}

सामान्य प्रलेखन आदेशों (बिल्ड, डिप्लॉय, स्क्रीनशॉट, रीडमी जनरेशन) के लिए, देखें [प्रलेखन उपकरण](documentation-tools.md)।

## अवलोकन {/* #overview */}

प्रलेखन डोकूसॉरस आई18एन का उपयोग करता है जहां अंग्रेजी डिफ़ॉल्ट स्थान है। स्रोत प्रलेखन में रहता है `docs/`; अनुवाद के तहत लिखे जाते हैं `i18n/{locale}/`। समर्थित स्थान: इंग्लिश-जीबी (डिफ़ॉल्ट), फ्रेंच, जर्मन, स्पेनिश, पीटी-बीआर, हिंदी, जेड-हैंस।

**एआई अनुवाद** ऐप यूआई, डोकूसॉरस मार्कडाउन/जेएसओएन, एसवीजी संपत्ति और **डिफ़ॉल्ट अधिसूचना टेम्पलेट** के लिए [**एआई-आई18एन-टूल्स**](https://www.npmjs.com/package/ai-i18n-tools) द्वारा संभाला जाता है **रिपॉजिटरी रूट** से, में कॉन्फ़िगर किया गया `ai-i18n-tools.config.json` (के अंदर नहीं `documentation/`)। सेट करें `OPENROUTER_API_KEY` जब अनुवाद आदेश चला रहे हों।

एक ही मशीन पर एक अप्रकाशित चेकआउट को आज़माने के लिए (डिफ़ॉल्ट `../ai-i18n-tools`), निर्भरता को `pnpm i18n:tools --local` या `./scripts/link-ai-i18n-tools.sh --local` के साथ स्विच करें। यह दोनों सीएलआई (`pnpm i18n:*`) और `ai-i18n-tools/runtime` आयात को लिंक करता है। स्रोत परिवर्तनों के बाद उपकरण पैकेज को पुनर्निर्माण करें (उस चेकआउट में `pnpm build`)। नवीनतम एनपीएम पैकेज को `--remote` के साथ पुनर्स्थापित करें। `link:` स्पेसिफायर को कमिट न करें।

## जब अंग्रेजी प्रलेखन बदलता है {/* #when-english-documentation-changes */}

1. `documentation/docs/` में **सोर्स संपादित करें** (केवल अंग्रेज़ी)। लैंडिंग-पेज की कॉपी `documentation/src/landing/landing.html` है।
2. **Docusaurus UI स्ट्रिंग्स** (थीम लेबल, navbar, आदि): यदि आवश्यक हो, तो `documentation/` में `pnpm write-translations` चलाएं ताकि `i18n/en/*.json` नई कुंजियों को ले सके।
3. **हेडिंग ID**: `pnpm write-heading-ids` (`documentation/` से)।
4. **रिपो रूट** से **अनुवाद करें** (या `documentation/` से नीचे दिए गए शॉर्टकट का उपयोग करें):
   - `pnpm i18n:extract` — Next.js ऐप में `t('…')` से `src/locales/strings.json` को रीफ्रेश करें।
   - `pnpm i18n:translate:docs` — कॉन्फ़िगरेशन के अनुसार मार्कडाउन, Docusaurus शेल JSON और लैंडिंग HTML का `documentation/i18n/` और `documentation/src/landing/i18n/` में अनुवाद करें।
   - `pnpm i18n:translate:svg` — कॉन्फ़िगरेशन के अनुसार `documentation/static/img` के अंतर्गत SVG का अनुवाद करें।
   - `pnpm i18n:translate:json` — `en-GB.json` से `src/locales/templates/` में डिफ़ॉल्ट नोटिफ़िकेशन टेम्पलेट का अनुवाद करें।
   - या सब कुछ चलाएं: `pnpm i18n:translate`।
5. **बिल्ड**: `cd documentation && pnpm build` (सभी स्थान)।

के अंदर से `documentation/`, वही प्रवाह तारबद्ध हैं जैसे `pnpm translate` → रूट `i18n:translate`, प्लस `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`।

## यूआई बहुवचन {/* #ui-plurals */}

अगला.जेएस ऐप में कार्डिनल बहुवचन **एआई-आई18एन-टूल्स** का उपयोग करते हैं, हाथ से लिखे गए `_one` / `_other` कुंजियाँ नहीं।

एक अंग्रेजी स्रोत स्ट्रिंग लिखें (आमतौर पर बहुवचन) और एक **सादा ऑब्जेक्ट लिटरल** पास करें जिसमें `plurals: true` और एक संख्यात्मक `count`:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

नियम:

- `item(s)` हेज या `count === 1 ? t('…') : t('…')` जोड़े का उपयोग न करें।
- स्वतंत्र **संख्यात्मक** गणना को अलग-अलग `t()` कॉल की आवश्यकता है — एक बहुवचन अक्ष दो संख्याओं को नहीं मोड़ सकता (उदाहरण के लिए 1 सफल और 2 विफल)। टुकड़ों को जोड़ें:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- गैर-संख्यात्मक अंतर्वेशन (नाम, लेबल, आदि) उसी बहुवचन स्ट्रिंग में `{{count}}` के साथ ठीक है।
- `pnpm i18n:extract` कैटलॉग पंक्ति को `"plural": true` के रूप में चिह्नित करता है। `pnpm i18n:translate:ui` सीएलडीआर फॉर्म भरता है और `src/locales/en-GB.json` लिखता है (केवल बहुवचन कुंजियाँ)।
- `src/i18n.ts` और `src/lib/i18n-server.ts` उस फ़ाइल को `sourcePluralFlatBundle` के रूप में लोड करते हैं ताकि अंग्रेजी एकवचन/बहुवचन रनटाइम पर हल हो सके।

## डिफ़ॉल्ट अधिसूचना टेम्पलेट {/* #default-notification-templates */}

सेटिंग्स → टेम्पलेट → **रीसेट** डिफ़ॉल्ट को `src/locales/templates/{locale}.json` से लोड करता है (में तारबद्ध `src/lib/default-notification-templates.ts`)।

1. केवल **`src/locales/templates/en-GB.json`** संपादित करें (अंग्रेजी स्रोत)।
2. रेपो रूट से **`pnpm i18n:translate:json`** (या **`pnpm i18n:translate`**) चलाएं।
3. डिफ़्स की समीक्षा करें — प्लेसहोल्डर जैसे `{backup_name}` और `{problem_table}` अपरिवर्तित रहना चाहिए; `priority` और `tags` को `keyPolicy` द्वारा `ai-i18n-tools.config.json` में छोड़ दिया जाता है।
4. जेएसओएन ब्लॉक कवरेज देखने के लिए **`pnpm i18n:status`** चलाएं।

झंडे के लिए [एआई-आई18एन-टूल्स जेएसओएन गाइड](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) देखें (`--locale`, `--force`, आदि)।

## लैंडिंग पेज HTML {/* #landing-page-html */}

दस्तावेज़ों का होमपेज मुख्य भाग (body) एक एकल अंग्रेज़ी HTML फ़ाइल है, न कि React सेक्शन कॉम्पोनेन्ट।

1. **`documentation/src/landing/landing.html`** संपादित करें (और लेआउट के लिए `documentation/src/landing/landing.css`)। हैश ID `features`, `dashboard`, `workflow`, `security` और `install` को बनाए रखें।
2. रिपो रूट से **`pnpm i18n:translate:docs`** चलाएं (या `documentation/` से `pnpm translate:docs`)।
3. जनरेट की गई प्रतियां **`documentation/src/landing/i18n/{locale}/landing.html`** में लिखी जाती हैं। उन फ़ाइलों को मैन्युअल रूप से संपादित न करें।

`translate-docs` [HTML पृष्ठ](https://wsj-br.github.io/ai-i18n-tools/guide/documents/html-pages.html) पाइपलाइन का उपयोग करता है: दृश्यमान पाठ और `alt` / `title` / `aria-label` का अनुवाद किया जाता है; `<pre>` और `<code>` अंग्रेज़ी में रहते हैं। Navbar लेबल और पृष्ठ शीर्षक Docusaurus `Translate` (`homepage.nav.*`, `homepage.meta.*`) में रहते हैं।

इस फ़ाइल में `data-i18n` मार्कर न जोड़ें, और इसे `ui.sourceRoots` के अंतर्गत सूचीबद्ध न करें। एक ही HTML फ़ाइल दस्तावेज़ पाइपलाइन और UI-स्ट्रिंग्स पाइपलाइन दोनों में नहीं होनी चाहिए।

## शब्दकोश {/* #glossary */}

- दस्तावेज़ों के लिए **UI शब्दावली** प्रत्येक `ui[]` कैटलॉग से आती है जिसमें `uiGlossary` चालू रहता है (डिफ़ॉल्ट)। Next.js ऐप कैटलॉग `src/locales/strings.json` है (`pnpm i18n:extract` द्वारा निर्मित)। `glossary.uiGlossary` सेट न करें; वह कुंजी अस्वीकार कर दी जाती है।
- **ओवरराइड** `documentation/glossary-user.csv` (कॉन्फ़िगरेशन में `glossary.userGlossary`) में रहते हैं। कॉलम प्रारूप के लिए [ai-i18n-tools शब्दावली दस्तावेज़](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) देखें।
- एक CSV टेम्पलेट जनरेट करें: `pnpm i18n:glossary-generate` (रूट)।

## कैश {/* #cache */}

ai-i18n-tools के लिए अनुवाद कैश रिपॉजिटरी रूट पर `.translation-cache/` के अंतर्गत होता है (`ai-i18n-tools.config.json` में `cacheDir`)। इसे गिट द्वारा अनदेखा किया जाता है। जब आपको पूर्ण रीफ्रेश की आवश्यकता हो तो [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) प्रलेखन के अनुसार `pnpm i18n:status` और CLI के `--force` / कैश फ्लैग का उपयोग करें।

## शीर्षक ID और लंगर {/* #heading-ids-and-anchors */}

स्पष्ट ID का उपयोग करें ताकि भाषाओं के पार लिंक स्थिर रहें। MDX टिप्पणी सिंटैक्स को प्राथमिकता दें (`pnpm write-heading-ids` `--syntax mdx-comment` का उपयोग करता है):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

`h2` और उसके नीचे के स्तर पर ID डालें। डॉक्यूसॉरस `write-heading-ids` `h1` को छोड़ देता है (पृष्ठ/साइडबार शीर्षक)। `documentation/docusaurus.config.ts` अनुमानित शीर्षकों से शीर्षक-आईडी टिप्पणियों को भी हटा देता है, क्योंकि डॉक्यूसॉरस मेटाडेटा निष्कर्षण अभी भी केवल क्लासिक `{#id}` को हटाता है।

```bash
cd documentation
pnpm write-heading-ids
```

## अनदेखा सूचियाँ {/* #ignore-lists */}

यदि आप अपने कार्यप्रवाह के लिए एक जोड़ते हैं तो डॉक अनुवादक द्वारा छोड़े जाने वाले पथों के लिए रिपॉजिटरी रूट पर `.translate-ignore` का उपयोग करें (`.gitignore` की तरह समान अवधारणा)।

## डॉक्यूसॉरस थीम JSON {/* #docusaurus-theme-json */}

`pnpm write-translations` डॉक्यूसॉरस UI स्ट्रिंग को `documentation/i18n/en/` में निकालता है। **ai-i18n-tools** `translate-docs` चरण (`markdownOutput.style: "docusaurus"` के साथ) प्रत्येक भाषा के अनुवादित JSON को markdown के साथ-साथ `ai-i18n-tools.config.json` के अनुसार भरता है।

## समस्या निवारण {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **सेट नहीं है** — इसे निर्यात करें या रिपॉजिटरी रूट पर `.env.local` में जोड़ें।
- **मॉडल / गुणवत्ता** — `ai-i18n-tools.config.json` में `openrouter.translationModels` और संबंधित विकल्पों को समायोजित करें।
- **शब्दकोश** — `documentation/glossary-user.csv` को संपादित करें या UI स्ट्रिंग को पुनः उत्पन्न करें और निष्कर्षण + अनुवाद कमांड को पुनः चलाएँ।

## एक नई भाषा जोड़ना {/* #adding-a-new-language */}

1. `documentation/docusaurus.config.ts` में डॉक्यूसॉरस `i18n.locales` और `localeConfigs` में भाषा जोड़ें।
2. `ai-i18n-tools.config.json` (रिपॉजिटरी रूट) में `targetLocales` में समान भाषा जोड़ें।
3. रूट पर `pnpm i18n:generate-ui-languages` चलाएँ, फिर आवश्यकतानुसार `pnpm i18n:extract` / अनुवाद कमांड चलाएँ।
