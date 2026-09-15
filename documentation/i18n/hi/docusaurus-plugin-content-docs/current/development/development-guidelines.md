# डेवलपमेंट संदर्भ {/* #development-reference */}

## कोड संगठन {/* #code-organisation */}

- **घटक (Components)**: `src/components/` उप-निर्देशिकाओं (subdirectories) के साथ:
  - `ui/` - shadcn/ui घटक और पुन: प्रयोज्य UI तत्व
  - `dashboard/` - डैशबोर्ड-विशिष्ट घटक
  - `settings/` - सेटिंग्स पृष्ठ घटक
  - `server-details/` - सर्वर विवरण पृष्ठ घटक
- **API रूट्स**: RESTful एंडपॉइंट संरचना के साथ `src/app/api/` ([API संदर्भ](../api-reference/overview) देखें)
- **डेटाबेस**: better-sqlite3 के साथ SQLite, `src/lib/db-utils.ts` में उपयोगिताएँ, `src/lib/db-migrations.ts` में माइग्रेशन
- **प्रकार (Types)**: `src/lib/types.ts` में TypeScript इंटरफेस
- **कॉन्फ़िगरेशन**: `src/lib/default-config.ts` में डिफ़ॉल्ट कॉन्फ़िग
- **क्रॉन सेवा**: `src/cron-service/` (पोर्ट 8667 dev, 9667 prod पर चलती है)
- **स्क्रिप्ट**: `scripts/` निर्देशिका में उपयोगिता स्क्रिप्ट
- **सुरक्षा**: `src/lib/csrf-middleware.ts` में CSRF सुरक्षा, सुरक्षित एंडपॉइंट के लिए `withCSRF` मिडलवेयर का उपयोग करें

## परीक्षण और डीबगिंग {/* #testing--debugging */}

- परीक्षण डेटा निर्माण: `pnpm generate-test-data --servers=N`
- सूचना परीक्षण: `/api/notifications/test` एंडपॉइंट
- क्रॉन हेल्थ चेक: `curl http://localhost:8667/health` या `curl http://localhost:8666/api/cron/health`
- अतिदेय बैकअप परीक्षण: **सेटिंग्स → बैकअप निगरानी** (**जाँचें बकाया बैकअप**), या प्रमाणीकरण के साथ `POST /api/notifications/check-overdue`
- डेवलपमेंट मोड: विस्तृत लॉगिंग और JSON फ़ाइल संग्रहण
- डेटाबेस रखरखाव: क्लीनअप संचालन के लिए रखरखाव मेनू का उपयोग करें
- प्री-चेक: स्टार्टअप समस्याओं के निवारण के लिए `scripts/pre-checks.sh`

## डेवलपमेंट संदर्भ {/* #development-references */}

- API एंडपॉइंट: [API संदर्भ](../api-reference/overview) देखें
- डेटाबेस स्कीमा: [डेटाबेस स्कीमा](database) देखें
- डेटाबेस संचालन के लिए `src/lib/db-utils.ts` में दिए गए पैटर्न का पालन करें

## फ्रेमवर्क और लाइब्रेरीज़ {/* #frameworks--libraries */}

:::info
सटीक संस्करण के लिए, [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, और `packageManager`) देखें। नीचे दी गई सूची जानबूझकर संस्करण-मुक्त रखी गई है ताकि यह निर्भरता (dependency) अपग्रेड के दौरान सटीक बनी रहे।
:::

### रनटाइम और पैकेज प्रबंधन {/* #runtime--package-management */}
- Node.js (`engines.node` देखें)
- pnpm (`preinstall` स्क्रिप्ट के माध्यम से लागू; `engines.pnpm` / `packageManager` देखें)

### कोर फ्रेमवर्क और लाइब्रेरीज़ {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React और React-DOM
- Radix UI (`@radix-ui/react-*` प्रिमिटिव्स)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (क्रॉन सेवा), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI + डॉक्स अनुवाद पाइपलाइन)

### टाइप चेकिंग और लिंटिंग {/* #type-checking--linting */}
- TypeScript (सख्त मोड)
- TSX (TypeScript स्क्रिप्ट चलाने के लिए)
- ESLint (फ्लैट कॉन्फ़िग `eslint.config.mjs` + `eslint-config-next`; `pnpm lint` → `eslint .` के माध्यम से चलाएं)
- webpack

### बिल्ड और परिनियोजन (डिप्लॉयमेंट) {/* #build--deployment */}
- Next.js स्टैंडअलोन आउटपुट (`output: 'standalone'`) कंटेनर एंट्रीपॉइंट के साथ जो `server.js` को शुरू करता है। Docker रनटाइम इमेज के लिए फ़ाइल ट्रेसिंग अभी भी चलती है; `next.config.ts` में `outputFileTracingExcludes` केवल-बिल्ड पैकेज (webpack, SWC कंपाइलर नेटिव्स, esbuild, CSS मिनिफ़ायर्स) और गैर-लिनक्स `better-sqlite3` प्रीबिल्ड्स को हटा देता है। `@swc/helpers`, `sharp`, या लिनक्स sqlite प्रीबिल्ड्स को बाहर न निकालें।
- बहु-आर्किटेक्चर बिल्ड (AMD64, ARM64) के साथ Docker (node:alpine बेस)। यह इमेज केवल Next.js ऐप बनाती है (Docusaurus साइट नहीं); pnpm संस्करण `package.json` में `packageManager` से लिया गया है
- CI/CD के लिए GitHub Actions वर्कफ़्लो
- लोगो और चित्रों के लिए Inkscape
- दस्तावेज़ों (डॉक्यूमेंटेशन) के लिए Docusaurus
- आइकन के लिए Greenfish Icon Editor

### प्रोजेक्ट कॉन्फ़िगरेशन {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## सिस्टम की विशेषताएं {/* #system-features */}

- **Cron सेवा**: निर्धारित कार्यों (शेड्यूल्ड टास्क) के लिए अलग सेवा, जिसे Docker परिनियोजन (डिप्लॉयमेंट) में `docker-entrypoint.sh` द्वारा शुरू किया जाता है
- **सूचनाएं**: ntfy.sh एकीकरण और SMTP ईमेल (nodemailer), कॉन्फ़िगर करने योग्य टेम्पलेट
- **ऑटो-रीफ्रेश**: डैशबोर्ड और विवरण पेजों के लिए कॉन्फ़िगर करने योग्य स्वचालित रीफ़्रेश
