# अनुवाद रखरखाव वर्कफ़्लो {/* #translation-maintenance-workflow */}

सामान्य दस्तावेज़ीकरण कमांड (बिल्ड, डिप्लॉय, स्क्रीनशॉट, README जनरेशन) के लिए, [Documentation Tools](documentation-tools.md) देखें।

## अवलोकन {/* #overview */}

दस्तावेज़ीकरण में डिफ़ॉल्ट लोकेल के रूप में अंग्रेज़ी के साथ Docusaurus i18n का उपयोग किया गया है। स्रोत दस्तावेज़ीकरण `docs/` में रहता है; अनुवाद `i18n/{locale}/` के तहत लिखे जाते हैं। समर्थित लोकेल: en-GB (डिफ़ॉल्ट), fr, de, es, pt-BR, hi, zh-Hans।

ऐप UI, Docusaurus markdown/JSON, SVG एसेट्स और **डिफ़ॉल्ट नोटिफिकेशन टेम्पलेट** के लिए **AI अनुवाद** को **रिपॉजिटरी रूट** से [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) द्वारा संभाला जाता है, जिसे `ai-i18n-tools.config.json` में कॉन्फ़िगर किया गया है (`documentation/` के अंदर नहीं)। अनुवाद कमांड चलाते समय `OPENROUTER_API_KEY` सेट करें।

## जब अंग्रेज़ी दस्तावेज़ीकरण बदलता है {/* #when-english-documentation-changes */}

1. `documentation/docs/` में **स्रोत संपादित करें** (केवल अंग्रेज़ी)।
2. **Docusaurus UI स्ट्रिंग्स** (थीम लेबल, नेवबार, आदि): यदि आवश्यक हो, तो `documentation/` में `pnpm write-translations` चलाएं ताकि `i18n/en/*.json` नई कुंजियों को प्राप्त कर सके।
3. **हेडिंग ID**: `pnpm write-heading-ids` (`documentation/` से)।
4. **रिपो रूट** से **अनुवाद करें** (या `documentation/` से नीचे दिए गए शॉर्टकट का उपयोग करें):
   - `pnpm i18n:extract` — Next.js ऐप में `t('…')` से `src/locales/strings.json` रीफ्रेश करें।
   - `pnpm i18n:translate:docs` — कॉन्फ़िग के अनुसार markdown/JSON का `documentation/i18n/` में अनुवाद करें।
   - `pnpm i18n:translate:svg` — कॉन्फ़िगर किए गए अनुसार `documentation/static/img` के अंतर्गत SVG का अनुवाद करें।
   - `pnpm i18n:translate:json` — `en-GB.json` से `src/locales/templates/` में डिफ़ॉल्ट नोटिफिकेशन टेम्पलेट का अनुवाद करें।
   - या सब कुछ चलाएं: `pnpm i18n:translate`।
5. **बिल्ड**: `cd documentation && pnpm build` (सभी लोकेल)।

`documentation/` के अंदर से, वही फ़्लो `pnpm translate` → रूट `i18n:translate`, और साथ ही `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync` के रूप में जुड़े हैं।

## UI बहुवचन {/* #ui-plurals */}

Next.js ऐप में कार्डिनल बहुवचन **ai-i18n-tools** का उपयोग करते हैं, हाथ से लिखी गई `_one` / `_other` कुंजियों का नहीं।

एक अंग्रेज़ी स्रोत स्ट्रिंग लिखें (आमतौर पर बहुवचन) और `plurals: true` और संख्यात्मक `count` के साथ एक **प्लेन ऑब्जेक्ट लिटरल** पास करें:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

नियम:

- `item(s)` हेज या `count === 1 ? t('…') : t('…')` युग्मों का उपयोग न करें।
- स्वतंत्र **संख्यात्मक** गणनाओं के लिए अलग `t()` कॉल की आवश्यकता होती है — एक बहुवचन अक्ष दो संख्याओं को नहीं बदल सकता (उदाहरण के लिए 1 सफल और 2 विफल)। अंशों को संयोजित करें:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- गैर-संख्यात्मक इंटरपोलेशन (नाम, लेबल, आदि) `{{count}}` के समान बहुवचन स्ट्रिंग में ठीक हैं।
- `pnpm i18n:extract` कैटलॉग पंक्ति को `"plural": true` के रूप में चिह्नित करता है। `pnpm i18n:translate:ui` CLDR रूपों को भरता है और `src/locales/en-GB.json` (केवल बहुवचन कुंजियाँ) लिखता है।
- `src/i18n.ts` और `src/lib/i18n-server.ts` उस फ़ाइल को `sourcePluralFlatBundle` के रूप में लोड करते हैं ताकि अंग्रेज़ी एकवचन/बहुवचन रनटाइम पर रिज़ॉल्व हो सकें।

## डिफ़ॉल्ट नोटिफिकेशन टेम्पलेट {/* #default-notification-templates */}

सेटिंग्स → टेम्पलेट → **रीसेट करें** `src/locales/templates/{locale}.json` से डिफ़ॉल्ट लोड करता है (`src/lib/default-notification-templates.ts` में जुड़ा हुआ)।

1. केवल **`src/locales/templates/en-GB.json`** संपादित करें (अंग्रेज़ी स्रोत)।
2. रिपो रूट से **`pnpm i18n:translate:json`** (या **`pnpm i18n:translate`**) चलाएं।
3. डिफ़्स की समीक्षा करें — प्लेसहोल्डर जैसे कि `{backup_name}` और `{problem_table}` अपरिवर्तित रहने चाहिए; `ai-i18n-tools.config.json` में `keyPolicy` द्वारा `priority` और `tags` को छोड़ दिया जाता है।
4. JSON ब्लॉक कवरेज देखने के लिए **`pnpm i18n:status`** चलाएं।

फ़्लैग्स (`--locale`, `--force`, आदि) के लिए [ai-i18n-tools JSON guide](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) देखें।

## शब्दावली {/* #glossary */}

- दस्तावेज़ीकरण के लिए **UI शब्दावली** `ai-i18n-tools.config.json` में `glossary.uiGlossary` द्वारा संचालित होती है, जो `src/locales/strings.json` (`pnpm i18n:extract` द्वारा निर्मित कैटलॉग) को इंगित करती है।
- **ओवरराइड** `documentation/glossary-user.csv` (कॉन्फ़िग में `glossary.userGlossary`) में रहते हैं। कॉलम फ़ॉर्मैट के लिए [ai-i18n-tools शब्दावली दस्तावेज़](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) देखें।
- CSV टेम्प्लेट जनरेट करें: `pnpm i18n:glossary-generate` (रूट)।

## कैश {/* #cache */}

ai-i18n-tools के लिए अनुवाद कैश रेपो रूट पर `.translation-cache/` के अंतर्गत है (`ai-i18n-tools.config.json` में `cacheDir`)। यह gitignore में शामिल है। जब आपको पूरी तरह रीफ़्रेश करने की आवश्यकता हो, तो [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) दस्तावेज़ों के अनुसार `pnpm i18n:status` और CLI के `--force` / कैश फ़्लैग का उपयोग करें।

## हेडिंग ID और एंकर {/* #heading-ids-and-anchors */}

स्पष्ट ID का उपयोग करें ताकि लिंक विभिन्न भाषाओं में स्थिर रहें। MDX टिप्पणी सिंटैक्स को प्राथमिकता दें (`pnpm write-heading-ids`, `--syntax mdx-comment` का उपयोग करता है):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

ID को `h2` और उसके नीचे रखें। Docusaurus `write-heading-ids`, `h1` (पृष्ठ/साइडबार शीर्षक) को छोड़ देता है। `documentation/docusaurus.config.ts` अनुमानित शीर्षकों से हेडिंग-id टिप्पणियों को भी हटा देता है, क्योंकि Docusaurus मेटाडेटा निष्कर्षण अभी भी केवल क्लासिक `{#id}` को हटाता है।

```bash
cd documentation
pnpm write-heading-ids
```

## इग्नोर सूचियाँ {/* #ignore-lists */}

यदि आप अपने वर्कफ़्लो के लिए कोई फ़ाइल जोड़ते हैं, तो उन पाथ के लिए जिन्हें दस्तावेज़ अनुवादक को छोड़ देना चाहिए, रेपो रूट पर `.translate-ignore` (`.gitignore` जैसा ही विचार) का उपयोग करें।

## Docusaurus थीम JSON {/* #docusaurus-theme-json */}

`pnpm write-translations`, Docusaurus UI स्ट्रिंग्स को `documentation/i18n/en/` में निकालता है। **ai-i18n-tools** `translate-docs` चरण (`markdownOutput.style: "docusaurus"` के साथ) `ai-i18n-tools.config.json` के अनुसार मार्कडाउन के साथ प्रत्येक लोकेल के तहत अनुवादित JSON भरता है।

## समस्या निवारण {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **सेट नहीं है** — इसे निर्यात करें या रेपो रूट पर `.env.local` में जोड़ें।
- **मॉडल / गुणवत्ता** — `ai-i18n-tools.config.json` में `openrouter.translationModels` और संबंधित विकल्पों को समायोजित करें।
- **शब्दावली** — `documentation/glossary-user.csv` को संपादित करें या UI स्ट्रिंग्स को पुन: जनरेट करें और एक्सट्रैक्ट + ट्रांसलेट को फिर से चलाएँ।

## एक नई भाषा जोड़ना {/* #adding-a-new-language */}

1. `documentation/docusaurus.config.ts` में Docusaurus `i18n.locales` और `localeConfigs` में लोकेल जोड़ें।
2. वही लोकेल `ai-i18n-tools.config.json` (रेपो रूट) में `targetLocales` में जोड़ें।
3. रूट पर `pnpm i18n:generate-ui-languages` चलाएँ, फिर आवश्यकतानुसार `pnpm i18n:extract` / अनुवाद कमांड चलाएँ।
