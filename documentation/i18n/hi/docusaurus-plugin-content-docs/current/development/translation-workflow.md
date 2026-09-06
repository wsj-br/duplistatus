# अनुवाद रखरखाव कार्यप्रवाह {#translation-maintenance-workflow}

सामान्य दस्तावेज़ कमांड्स (बिल्ड, डिप्लॉय, स्क्रीनशॉट, README जनरेशन) के लिए, देखें [Documentation Tools](documentation-tools.md).

## Overview {#overview}

दस्तावेज़ Docusaurus i18n का उपयोग करता है जिसमें अंग्रेज़ी डिफ़ॉल्ट लोकेल है। स्रोत दस्तावेज़ `docs/` में रहता है; अनुवाद `i18n/{locale}/` के अंतर्गत लिखे जाते हैं। समर्थित लोकेल: en-GB (डिफ़ॉल्ट), fr, de, es, pt-BR, hi, zh-Hans.

**AI translation** for the app UI, Docusaurus markdown/JSON, SVG assets, and **default notification templates** is handled by [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) from the **repository root**, configured in `ai-i18n-tools.config.json` (not inside `documentation/`). Set `OPENROUTER_API_KEY` when running translate commands.

## जब अंग्रेज़ी दस्तावेज़ बदलता है {#when-english-documentation-changes}

1. **स्रोत संपादित करें** `documentation/docs/` में (अंग्रेज़ी केवल).
2. **Docusaurus UI स्ट्रिंग्स** (थीम लेबल, नेवबार, आदि): अगर ज़रूरत हो, तो `pnpm write-translations` को `documentation/` में चलाएं ताकि `i18n/en/*.json` नए कीज़ पा सके।
3. **हेडिंग आईडी**: `pnpm write-heading-ids` (`documentation/` से).
4. **अनुवाद** **रिपॉजिटरी रूट** से (या नीचे दिए गए शॉर्टकट्स का उपयोग करें `documentation/` से):
   - `pnpm i18n:extract` — refresh `src/locales/strings.json` from `t('…')` in the Next.js app.
   - `pnpm i18n:translate:docs` — translate markdown/JSON into `documentation/i18n/` per config.
   - `pnpm i18n:translate:svg` — translate SVGs under `documentation/static/img` as configured.
   - `pnpm i18n:translate:json` — translate default notification templates in `src/locales/templates/` from `en-GB.json`.
   - Or run everything: `pnpm i18n:translate`.
5. **Build**: `cd documentation && pnpm build` (all locales).

`documentation/` के अंदर, वही फ़्लो `pnpm translate` → रूट `i18n:translate` के रूप में जुड़े हुए हैं, साथ ही `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## UI बहुवचन {#ui-plurals}

Next.js ऐप में कार्डिनल बहुवचन **ai-i18n-tools** का उपयोग करते हैं, न कि हस्तलिखित `_one` / `_other` कुंजी।

एक अंग्रेजी स्रोत स्ट्रिंग लिखें (आमतौर पर बहुवचन) और एक **सादा ऑब्जेक्ट लिटरल** पास करें जिसमें `plurals: true` और एक संख्यात्मक `count`:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

नियम:

- `item(s)` हेज़ या `count === 1 ? t('…') : t('…')` जोड़े का उपयोग न करें।
- स्वतंत्र **संख्यात्मक** गिनतियों के लिए अलग `t()` कॉल की आवश्यकता होती है — एक बहुवचन धुरी दो संख्याओं को नहीं बदल सकती (उदाहरण के लिए 1 सफल और 2 असफल)। अंशों को जोड़ें:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- गैर-संख्यात्मक इंटरपोलेशन (नाम, लेबल, आदि) `{{count}}` के समान बहुवचन स्ट्रिंग में ठीक हैं।
- `pnpm i18n:extract` कैटलॉग पंक्ति `"plural": true` को चिह्नित करता है। `pnpm i18n:translate:ui` CLDR फ़ॉर्म भरता है और `src/locales/en-GB.json` (केवल बहुवचन कुंजी) लिखता है।
- `src/i18n.ts` और `src/lib/i18n-server.ts` उस फ़ाइल को `sourcePluralFlatBundle` के रूप में लोड करते हैं ताकि अंग्रेजी एकवचन/बहुवचन रनटाइम पर हल हो सके।

## Default notification templates {#default-notification-templates}

Settings → Templates → **Reset** loads defaults from `src/locales/templates/{locale}.json` (wired in `src/lib/default-notification-templates.ts`).

1. Edit **`src/locales/templates/en-GB.json`** only (English source).
2. Run **`pnpm i18n:translate:json`** (or **`pnpm i18n:translate`**) from the repo root.
3. Review diffs — placeholders such as `{backup_name}` and `{problem_table}` must stay unchanged; `priority` and `tags` are skipped by `keyPolicy` in `ai-i18n-tools.config.json`.
4. Run **`pnpm i18n:status`** to see JSON block coverage.

See the [ai-i18n-tools JSON guide](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) for flags (`--locale`, `--force`, etc.).

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
