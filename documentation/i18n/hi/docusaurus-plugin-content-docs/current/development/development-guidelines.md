# विकास संदर्भ {/* #development-reference */}

## कोड संगठन {/* #code-organisation */}

- **घटक**: `src/components/` उप-निर्देशिकाओं के साथ:
  - `ui/` - shadcn/ui घटक और पुन: उपयोग योग्य UI तत्व
  - `dashboard/` - डैशबोर्ड विशिष्ट घटक
  - `settings/` - सेटिंग्स पृष्ठ घटक
  - `server-details/` - सर्वर विवरण पृष्ठ घटक
- **एपीआई मार्ग**: `src/app/api/` RESTful एंडपॉइंट संरचना के साथ (देखें [एपीआई संदर्भ](../api-reference/overview))
- **डेटाबेस**: SQLite के साथ better-sqlite3, `src/lib/db-utils.ts` में उपयोगिताएँ, `src/lib/db-migrations.ts` में माइग्रेशन
- **प्रकार**: `src/lib/types.ts` में TypeScript इंटरफेस
- **कॉन्फ़िगरेशन**: `src/lib/default-config.ts` में डिफ़ॉल्ट कॉन्फ़िगरेशन
- **क्रॉन सेवा**: `src/cron-service/` (पोर्ट 8667 डेव पर चलता है, 9667 प्रोड पर)
- **स्क्रिप्ट**: `scripts/` निर्देशिका में उपयोगिता स्क्रिप्ट
- **सुरक्षा**: `src/lib/csrf-middleware.ts` में CSRF सुरक्षा, संरक्षित एंडपॉइंट के लिए `withCSRF` मिडलवेयर का उपयोग करें

## परीक्षण और डीबगिंग {/* #testing--debugging */}

- परीक्षण डेटा उत्पादन: `pnpm generate-test-data --servers=N`
- सूचना परीक्षण: `/api/notifications/test` एंडपॉइंट
- क्रॉन स्वास्थ्य जाँच: `curl http://localhost:8667/health` या `curl http://localhost:8666/api/cron/health`
- अतिदेय बैकअप परीक्षण: **सेटिंग्स → बैकअप निगरानी** (**बकाया बैकअप परीक्षण करें**), या प्रमाणीकरण के साथ `POST /api/notifications/check-overdue`
- विकास मोड: वर्बोस लॉगिंग और JSON फ़ाइल संग्रहण
- डेटाबेस रखरखाव: सफाई ऑपरेशन के लिए रखरखाव मेनू का उपयोग करें
- प्री-चेक: स्टार्टअप समस्याओं के निदान के लिए `scripts/pre-checks.sh`

## विकास संदर्भ {/* #development-references */}

- एपीआई एंडपॉइंट: देखें [एपीआई संदर्भ](../api-reference/overview)
- डेटाबेस स्कीमा: देखें [डेटाबेस स्कीमा](database)
- डेटाबेस ऑपरेशन के लिए `src/lib/db-utils.ts` में पैटर्न का पालन करें

## फ्रेमवर्क और लाइब्रेरी {/* #frameworks--libraries */}

:::info
सटीक संस्करणों के लिए, देखें [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, और `packageManager`)। नीचे दी गई सूचि जानबूझकर संस्करण से हल्की है ताकि यह निर्भरता अपग्रेड पर सटीक रहे।
:::

### रनटाइम और पैकेज प्रबंधन {/* #runtime--package-management */}
- Node.js (देखें `engines.node`)
- pnpm (`preinstall` स्क्रिप्ट के माध्यम से लागू; देखें `engines.pnpm` / `packageManager`)

### कोर फ्रेमवर्क और लाइब्रेरी {/* #core-frameworks--libraries */}
- Next.js (ऐप रूटर)
- React और React-DOM
- Radix UI (`@radix-ui/react-*` प्राइमिटिव)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (cron सेवा), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI + दस्तावेज़ अनुवाद पाइपलाइन)

### प्रकार जाँच और लिंटिंग {/* #type-checking--linting */}
- TypeScript (स्ट्रिक्ट मोड)
- TSX (TypeScript स्क्रिप्ट चलाने के लिए)
- ESLint (फ्लैट कॉन्फ़िग `eslint.config.mjs` + `eslint-config-next`; `pnpm lint` के माध्यम से चलाएँ → `eslint .`)
- webpack

### बिल्ड और डिप्लॉयमेंट {/* #build--deployment */}
- Next.js स्टैंडअलोन आउटपुट (`output: 'standalone'`) कंटेनर एंट्रीपॉइंट के साथ जो `server.js` शुरू करता है। डॉकर रनटाइम छवि के लिए फ़ाइल ट्रेसिंग अभी भी चलती है; `next.config.ts` में `outputFileTracingExcludes` बिल्ड-केवल पैकेज (webpack, SWC कंपाइलर नेटिव, esbuild, CSS मिनिफायर्स) और गैर-लिनक्स `better-sqlite3` प्रीबिल्ड छोड़ देता है। `@swc/helpers`, `sharp`, या लिनक्स sqlite प्रीबिल्ड को बाहर नहीं करें।
- डॉकर (node:alpine बेस) मल्टी-आर्किटेक्चर बिल्ड (AMD64, ARM64) के साथ। छवि केवल Next.js ऐप का निर्माण करती है (Docusaurus साइट नहीं); pnpm संस्करण को `package.json` में `packageManager` से लिया जाता है
- CI/CD के लिए GitHub कार्रवाइयाँ कार्यप्रवाह
- लोगो और चित्रों के लिए Inkscape
- दस्तावेज़ीकरण के लिए Docusaurus
- आइकन के लिए Greenfish Icon Editor

### प्रोजेक्ट विन्यास {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## सिस्टम सुविधाएं {/* #system-features */}

- **क्रॉन सेवा**: निर्धारित कार्यों के लिए अलग सेवा, डॉकर डिप्लॉयमेंट में `docker-entrypoint.sh` द्वारा शुरू की गई
- **सूचनाएं**: ntfy.sh एकीकरण और एसएमटीपी ईमेल (nodemailer), विन्यास योग्य टेम्पलेट
- **ऑटो-रीफ्रेश**: डैशबोर्ड और विस्तार से पृष्ठों के लिए विन्यास योग्य स्वचालित रीफ्रेश
