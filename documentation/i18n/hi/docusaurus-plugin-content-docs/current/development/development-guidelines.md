# विकास संदर्भ {/* #development-reference */}

## कोड संगठन {/* #code-organisation */}

- **अंश**: `src/components/` के साथ उप-निर्देशिकाएँ:
  - `ui/` - शैडसी/यूआई घटक और पुन: उपयोग योग्य यूआई तत्व
  - `dashboard/` - डैशबोर्ड-विशिष्ट घटक
  - `settings/` - सेटिंग्स पृष्ठ घटक
  - `server-details/` - सर्वर विवरण पृष्ठ घटक
- **API रूट्स**: `src/app/api/` के साथ RESTful एंडपॉइंट संरचना (देखें [API संदर्भ](../api-reference/overview))
- **डेटाबेस**: SQLite के साथ better-sqlite3, उपयोगिता `src/lib/db-utils.ts` में, माइग्रेशन `src/lib/db-migrations.ts` में
- **टाइप्स**: TypeScript इंटरफेस `src/lib/types.ts` में
- **कॉन्फ़िगरेशन**: डिफ़ॉल्ट कॉन्फ़िग्स `src/lib/default-config.ts` में
- **क्रॉन सेवा**: `src/cron-service/` (पोर्ट 8667 डेव, 9667 प्रोड पर चलती है)
- **स्क्रिप्ट्स**: उपयोगिता स्क्रिप्ट्स `scripts/` निर्देशिका में
- **सुरक्षा**: CSRF संरक्षण `src/lib/csrf-middleware.ts` में, सुरक्षित एंडपॉइंट्स के लिए `withCSRF` मिडलवेयर का उपयोग करें

## परीक्षण और डिबगिंग {/* #testing--debugging */}

- परीक्षण डेटा जनरेशन: `pnpm generate-test-data --servers=N`
- अधिसूचना परीक्षण: `/api/notifications/test` एंडपॉइंट
- क्रॉन स्वास्थ्य चेक: `curl http://localhost:8667/health` या `curl http://localhost:8666/api/cron/health`
- विलंबित बैकअप परीक्षण: **सेटिंग्स → बैकअप मॉनिटरिंग** (**टेस्ट विलंबित बैकअप्स**), या `POST /api/notifications/check-overdue` के साथ प्रमाणीकरण
- विकास मोड: वर्बोज़ लॉगिंग और JSON फ़ाइल स्टोरेज
- डेटाबेस रखरखाव: सफाई ऑपरेशन के लिए रखरखाव मेनू का उपयोग करें
- पूर्व-चेक: `scripts/pre-checks.sh` स्टार्टअप समस्याओं के लिए ट्रबलशूटिंग

## विकास संदर्भ {/* #development-references */}

- API एंडपॉइंट्स: देखें [API संदर्भ](../api-reference/overview)
- डेटाबेस स्कीमा: देखें [डेटाबेस स्कीमा](database)
- डेटाबेस ऑपरेशन के लिए `src/lib/db-utils.ts` में पैटर्न का पालन करें

## फ़्रेमवर्क और लाइब्रेरी {/* #frameworks--libraries */}

:::info
सटीक संस्करणों के लिए, देखें [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, और `packageManager`). नीचे दी गई सूची उद्देश्य से संस्करण-लाइट है ताकि यह निर्भरता अपग्रेड के दौरान सटीक रहे।
:::

### रनटाइम और पैकेज प्रबंधन {/* #runtime--package-management */}
- Node.js (देखें `engines.node`)
- pnpm (`preinstall` स्क्रिप्ट के माध्यम से लागू; देखें `engines.pnpm` / `packageManager`)

### मुख्य फ़्रेमवर्क और लाइब्रेरी {/* #core-frameworks--libraries */}
- Next.js (ऐप राउटर)
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
- ai-i18n-tools, i18next, react-i18next (यूआई और दस्तावेज़ अनुवाद पाइपलाइन)

### प्रकार जाँच और लिंटिंग {/* #type-checking--linting */}
- TypeScript (सख्त मोड)
- TSX (TypeScript स्क्रिप्ट चलाने के लिए)
- ESLint (फ्लैट कॉन्फ़िग `eslint.config.mjs` + `eslint-config-next`; `pnpm lint` के माध्यम से चलाएँ → `eslint .`)
- webpack

### निर्माण और डिप्लॉयमेंट {/* #build--deployment */}
- Next.js स्टैंडअलोन आउटपुट (`output: 'standalone'`) के साथ कंटेनर एंट्रीपॉइंट शुरू होता है (`server.js`)
- Docker (node:alpine आधार) के साथ बहु-आर्किटेक्चर बिल्ड्स (AMD64, ARM64)। छवि केवल Next.js ऐप को बिल्ड करती है (Docusaurus साइट को नहीं); pnpm संस्करण `packageManager` से लिया जाता है `package.json`
- GitHub Actions वर्कफ़्लो CI/CD के लिए
- Inkscape for logos and pictures
- Docusaurus for documentation
- Greenfish Icon Editor for icons

### प्रोजेक्ट कॉन्फ़िगरेशन {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## प्रणाली सुविधाएँ {/* #system-features */}

- **Cron Service**: Separate service for scheduled tasks, started by `docker-entrypoint.sh` in Docker deployments
- **Suchnaayein**: ntfy.sh integration and SMTP email (nodemailer), configurable templates
- **Auto-refresh**: Configurable automatic refresh for dashboard and detail pages
