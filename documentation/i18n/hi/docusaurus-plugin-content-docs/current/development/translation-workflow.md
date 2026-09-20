# अनुवाद रखरखाव कार्यप्रवाह {/* #translation-maintenance-workflow */}

सामान्य प्रलेखन आदेशों (बिल्ड, डिप्लॉय, स्क्रीनशॉट, रीडमी जनरेशन) के लिए, देखें [प्रलेखन उपकरण](documentation-tools.md)।

## अवलोकन {/* #overview */}

प्रलेखन डोकूसॉरस आई18एन का उपयोग करता है जहां अंग्रेजी डिफ़ॉल्ट स्थान है। स्रोत प्रलेखन में रहता है `docs/`; अनुवाद के तहत लिखे जाते हैं `i18n/{locale}/`। समर्थित स्थान: इंग्लिश-जीबी (डिफ़ॉल्ट), फ्रेंच, जर्मन, स्पेनिश, पीटी-बीआर, हिंदी, जेड-हैंस।

**एआई अनुवाद** ऐप यूआई, डोकूसॉरस मार्कडाउन/जेएसओएन, एसवीजी संपत्ति और **डिफ़ॉल्ट अधिसूचना टेम्पलेट** के लिए [**एआई-आई18एन-टूल्स**](https://www.npmjs.com/package/ai-i18n-tools) द्वारा संभाला जाता है **रिपॉजिटरी रूट** से, में कॉन्फ़िगर किया गया `ai-i18n-tools.config.json` (के अंदर नहीं `documentation/`)। सेट करें `OPENROUTER_API_KEY` जब अनुवाद आदेश चला रहे हों।

एक ही मशीन पर एक अप्रकाशित चेकआउट को आज़माने के लिए (डिफ़ॉल्ट `../ai-i18n-tools`), निर्भरता को `pnpm i18n:tools --local` या `./scripts/link-ai-i18n-tools.sh --local` के साथ स्विच करें। यह दोनों सीएलआई (`pnpm i18n:*`) और `ai-i18n-tools/runtime` आयात को लिंक करता है। स्रोत परिवर्तनों के बाद उपकरण पैकेज को पुनर्निर्माण करें (उस चेकआउट में `pnpm build`)। नवीनतम एनपीएम पैकेज को `--remote` के साथ पुनर्स्थापित करें। `link:` स्पेसिफायर को कमिट न करें।

## जब अंग्रेजी प्रलेखन बदलता है {/* #when-english-documentation-changes */}

1. **स्रोत संपादित करें** में `documentation/docs/` (केवल अंग्रेजी)।
2. **डोकूसॉरस यूआई स्ट्रिंग्स** (थीम लेबल, नेवबार, आदि): यदि आवश्यक हो, तो `pnpm write-translations` में चलाएं `documentation/` ताकि `i18n/en/*.json` नए कुंजियाँ ले सके।
3. **शीर्षक आईडी**: `pnpm write-heading-ids` (से `documentation/`)।
4. **अनुवाद** से **रेपो रूट** (या नीचे दिए गए शॉर्टकट का उपयोग करें `documentation/` से):
   - `pnpm i18n:extract` — रीफ्रेश करें `src/locales/strings.json` से `t('…')` में अगला.जेएस ऐप।
   - `pnpm i18n:translate:docs` — मार्कडाउन/जेएसओएन को `documentation/i18n/` में कॉन्फ़िग के अनुसार अनुवाद करें।
   - `pnpm i18n:translate:svg` — एसवीजी को `documentation/static/img` के तहत कॉन्फ़िग के अनुसार अनुवाद करें।
   - `pnpm i18n:translate:json` — डिफ़ॉल्ट अधिसूचना टेम्पलेट को `src/locales/templates/` में से `en-GB.json` में अनुवाद करें।
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

## शब्दकोश {/* #glossary */}

- प्रलेखन के लिए **UI शब्दावली** को `ai-i18n-tools.config.json` में `glossary.uiGlossary` द्वारा निर्देशित किया जाता है, जो `src/locales/strings.json` की ओर संकेत करता है (`pnpm i18n:extract` द्वारा उत्पादित सूची)।
- **अधिरोहण** को `documentation/glossary-user.csv` में रखा जाता है (config में `glossary.userGlossary`)। स्तंभ प्रारूप के लिए [ai-i18n-tools शब्दकोश प्रलेख](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) देखें।
- एक CSV टेम्पलेट उत्पन्न करें: `pnpm i18n:glossary-generate` (रूट)।

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
