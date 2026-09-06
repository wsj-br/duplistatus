# अनुवाद रखरखाव कार्यप्रवाह {#translation-maintenance-workflow}

सामान्य दस्तावेज़ कमांड्स (बिल्ड, डिप्लॉय, स्क्रीनशॉट, README जनरेशन) के लिए, देखें [Documentation Tools](documentation-tools.md).

## Overview {#overview}

दस्तावेज़ Docusaurus i18n का उपयोग करता है जिसमें अंग्रेज़ी डिफ़ॉल्ट लोकेल है। स्रोत दस्तावेज़ `docs/` में रहता है; अनुवाद `i18n/{locale}/` के अंतर्गत लिखे जाते हैं। समर्थित लोकेल: en-GB (डिफ़ॉल्ट), fr, de, es, pt-BR, hi, zh-Hans.

**AI अनुवाद** ऐप UI, Docusaurus markdown/JSON, और SVG एसेट्स के लिए [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) से **रिपॉजिटरी रूट** से हैंडल किया जाता है, जो `ai-i18n-tools.config.json` में कॉन्फ़िगर किया गया है (`documentation/` के अंदर नहीं)। अनुवाद कमांड चलाने के समय `OPENROUTER_API_KEY` सेट करें।

## जब अंग्रेज़ी दस्तावेज़ बदलता है {#when-english-documentation-changes}

1. **स्रोत संपादित करें** `documentation/docs/` में (अंग्रेज़ी केवल).
2. **Docusaurus UI स्ट्रिंग्स** (थीम लेबल, नेवबार, आदि): अगर ज़रूरत हो, तो `pnpm write-translations` को `documentation/` में चलाएं ताकि `i18n/en/*.json` नए कीज़ पा सके।
3. **हेडिंग आईडी**: `pnpm write-heading-ids` (`documentation/` से).
4. **अनुवाद** **रिपॉजिटरी रूट** से (या नीचे दिए गए शॉर्टकट्स का उपयोग करें `documentation/` से):
   - `pnpm i18n:extract` — `src/locales/strings.json` को `t('…')` से रिफ्रेश करें Next.js ऐप में।
   - `pnpm i18n:translate:docs` — markdown/JSON को `documentation/i18n/` में अनुवाद करें कॉन्फ़िग के अनुसार।
   - `pnpm i18n:translate:svg` — `documentation/static/img` के अंतर्गत SVG अनुवाद करें कॉन्फ़िग के अनुसार।
   - या सब कुछ चलाएं: `pnpm i18n:translate`.
5. **बिल्ड**: `cd documentation && pnpm build` (सभी लोकेल).

`documentation/` के अंदर, वही फ़्लो `pnpm translate` → रूट `i18n:translate` के रूप में जुड़े हुए हैं, साथ ही `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## UI बहुवचन {#ui-plurals}

Next.js ऐप में कार्डिनल बहुवचन **ai-i18n-tools** का उपयोग करते हैं, न कि हस्तलिखित `_one` / `_other` कुंजी।

एक अंग्रेजी स्रोत स्ट्रिंग लिखें (आमतौर पर बहुवचन) और एक **सादा ऑब्जेक्ट लिटरल** पास करें जिसमें `plurals: true` और एक संख्यात्मक `count`:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

नियम:

- `item(s)` हेज़ या `count === 1 ? t('…') : t('…')` जोड़ी का उपयोग न करें।
- स्वतंत्र गिनती के लिए अलग `t()` कॉल की आवश्यकता होती है। दो या अधिक इंटरपोलेशन वाली एक स्ट्रिंग में `{{count}}` को बहुवचन के अक्ष के रूप में शामिल करना होगा।
- `pnpm i18n:extract` कैटलॉग पंक्ति को चिह्नित करता है `"plural": true`। `pnpm i18n:translate:ui` CLDR फॉर्म भरता है और `src/locales/en-GB.json` लिखता है (बहुवचन कुंजी केवल)।
- `src/i18n.ts` और `src/lib/i18n-server.ts` उस फ़ाइल को `sourcePluralFlatBundle` के रूप में लोड करते हैं ताकि अंग्रेजी एकवचन/बहुवचन रनटाइम पर हल हो।

## शब्दावली {#glossary}

- **UI शब्दावली** दस्तावेज़ के लिए `glossary.uiGlossary` में ड्राइव की जाती है `ai-i18n-tools.config.json` में, जो `src/locales/strings.json` पर इंगित करता है (जो `pnpm i18n:extract` द्वारा उत्पादित की गई कैटलॉग है).
- **ओवरराइड्स** `documentation/glossary-user.csv` में रहते हैं (`glossary.userGlossary` कॉन्फ़िग में). [ai-i18n-tools शब्दावली दस्तावेज़](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) के लिए कॉलम प्रारूप देखें।
- एक CSV टेम्पलेट जनरेट करें: `pnpm i18n:glossary-generate` (रूट).

## कैश {#cache}

ai-i18n-tools के लिए अनुवाद कैश रिपॉजिटरी रूट के अंतर्गत `.translation-cache/` में है (`cacheDir` में `ai-i18n-tools.config.json`). यह gitignored है। अगर आपको एक पूर्ण रिफ्रेश की ज़रूरत है, तो `pnpm i18n:status` और CLI के `--force` / कैश फ़्लैग का उपयोग करें [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) दस्तावेज़ के अनुसार।

## हेडिंग आईडी और ऐंकर {#heading-ids-and-anchors}

लिंक स्थिर रखने के लिए स्पष्ट आईडी का उपयोग करें:

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## इग्नोर लिस्ट {#ignore-lists}

अगर आप अपने वर्कफ़्लो के लिए एक जोड़ते हैं, तो रिपॉजिटरी रूट पर `.translate-ignore` का उपयोग करें (जो `.gitignore` के समान है) जो दस्तावेज़ अनुवादक को स्किप करने के लिए पथ हैं।

## Docusaurus थीम JSON {#docusaurus-theme-json}

`pnpm write-translations` Docusaurus UI स्ट्रिंग्स को `documentation/i18n/en/` में निकालता है। **ai-i18n-tools** `translate-docs` चरण (`markdownOutput.style: "docusaurus"` के साथ) प्रत्येक लोकेल के अंतर्गत अनुवादित JSON भरता है markdown के साथ, `ai-i18n-tools.config.json` के अनुसार।

## {#troubleshooting} के लिए समस्या निवारण

- `OPENROUTER_API_KEY` **निर्‍द्‍हा‍रित ना‍हि‍न कि‍या गा‍या** — इसे निर्‍यातित करें या `.env.local` में जोड़ें (रिपॉजिटरी रूट पर).
- **मॉडल / गुणवत्ता** — `openrouter.translationModels` और संबंधित विकल्पों को `ai-i18n-tools.config.json` में समायोजित करें.
- **शब्दावली** — `documentation/glossary-user.csv` को संपादित करें या यूआई स्ट्रिंग्स को पुनः उत्पन्न करें और निष्पादित करें + अनुवाद.

## एक नया भाषा जोड़ना {#adding-a-new-language}

1. डॉक्यूसॉरस `i18n.locales` और `localeConfigs` में लोकल जोड़ें `documentation/docusaurus.config.ts` में.
2. उसी लोकल को `targetLocales` में जोड़ें `ai-i18n-tools.config.json` में (रिपॉजिटरी रूट पर).
3. रूट पर `pnpm i18n:generate-ui-languages` चलाएं, फिर `pnpm i18n:extract` / अनुवाद कमांड्स के अनुसार.
