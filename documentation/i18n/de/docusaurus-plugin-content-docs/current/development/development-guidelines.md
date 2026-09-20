# Entwicklungsreferenz {/* #development-reference */}

## Code-Organisation {/* #code-organisation */}

- **Komponenten**: `src/components/` mit Unterverzeichnissen:
  - `ui/` - shadcn/ui-Komponenten und wiederverwendbare UI-Elemente
  - `dashboard/` - Dashboard-spezifische Komponenten
  - `settings/` - Komponenten der Einstellungsseite
  - `server-details/` - Komponenten der Serverdetailseite
- **API-Routen**: `src/app/api/` mit RESTful-Endpunkt-Struktur (siehe [API-Referenz](../api-reference/overview))
- **Datenbank**: SQLite mit better-sqlite3, Utilities in `src/lib/db-utils.ts`, Migrationen in `src/lib/db-migrations.ts`
- **Typen**: TypeScript-Schnittstellen in `src/lib/types.ts`
- **Konfiguration**: Standard-Konfigurationen in `src/lib/default-config.ts`
- **Cron-Service**: `src/cron-service/` (läuft auf Port 8667 Dev, 9667 Prod)
- **Skripte**: Utility-Skripte im Verzeichnis `scripts/`
- **Sicherheit**: CSRF-Schutz in `src/lib/csrf-middleware.ts`, verwenden Sie `withCSRF`-Middleware für geschützte Endpunkte

## Testen und Debugging {/* #testing--debugging */}

- Testdatengenerierung: `pnpm generate-test-data --servers=N`
- Benachrichtigungstests: `/api/notifications/test`-Endpunkt
- Cron-Integritätsprüfungen: `curl http://localhost:8667/health` oder `curl http://localhost:8666/api/cron/health`
- Test für überfällige Sicherungen: **Einstellungen → Backup-Überwachung** (**Überfällige Backups testen**), oder `POST /api/notifications/check-overdue` mit Authentifizierung
- Entwicklungsmodus: ausführliches Logging und JSON-Dateispeicherung
- Datenbankverwaltung: Verwenden Sie das Wartungsmenü für Bereinigungsvorgänge
- Vorchecks: `scripts/pre-checks.sh` zur Behebung von Startproblemen

## Entwicklungsreferenzen {/* #development-references */}

- API-Endpunkte: Siehe [API-Referenz](../api-reference/overview)
- Datenbankschema: Siehe [Datenbankschema](database)
- Befolgen Sie Muster in `src/lib/db-utils.ts` für Datenbankoperationen

## Frameworks und Bibliotheken {/* #frameworks--libraries */}

:::info
Für genaue Versionen siehe [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines` und `packageManager`). Die folgende Liste ist absichtlich versionslicht, damit sie über Abhängigkeitsaktualisierungen hinweg genau bleibt.
:::

### Laufzeit und Paketverwaltung {/* #runtime--package-management */}
- Node.js (siehe `engines.node`)
- pnpm (erzwungen über das `preinstall`-Skript; siehe `engines.pnpm` / `packageManager`)

### Kern-Frameworks und Bibliotheken {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React und React-DOM
- Radix UI (`@radix-ui/react-*`-Primitive)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (Cron-Service), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI- und Dokumentations-Übersetzungs-Pipeline)

### Typprüfung und Linting {/* #type-checking--linting */}
- TypeScript (strikter Modus)
- TSX (zum Ausführen von TypeScript-Skripten)
- ESLint (Flat-Config `eslint.config.mjs` + `eslint-config-next`; ausführen über `pnpm lint` → `eslint .`)
- webpack

### Build und Bereitstellung {/* #build--deployment */}
- Next.js Standalone-Ausgabe (`output: 'standalone'`) mit Container-Einstiegspunkt, der `server.js` startet. Die Datei-Verfolgung läuft immer noch für das Docker-Laufzeit-Image; `outputFileTracingExcludes` in `next.config.ts` entfernt nur-Build-Pakete (webpack, SWC-Compiler-Native, esbuild, CSS-Minifier) und nicht-Linux-`better-sqlite3`-Prebuilds. Schließen Sie `@swc/helpers`, `sharp` oder Linux-sqlite-Prebuilds nicht aus.
- Docker (node:alpine-Basis) mit Multi-Architektur-Builds (AMD64, ARM64). Das Image erstellt nur die Next.js-App (nicht die Docusaurus-Website); die pnpm-Version wird aus `packageManager` in `package.json` entnommen
- GitHub Actions-Workflows für CI/CD
- Inkscape für Logos und Bilder
- Docusaurus für Dokumentation
- Greenfish Icon Editor für Symbole

### Projektkonfiguration {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## System-Funktionen {/* #system-features */}

- **Cron-Service**: Separater Service für geplante Aufgaben, gestartet von `docker-entrypoint.sh` in Docker-Bereitstellungen
- **Benachrichtigungen**: ntfy.sh-Integration und SMTP-E-Mail (nodemailer), konfigurierbare Vorlagen
- **Automatisches Aktualisieren**: Konfigurierbares automatisches Aktualisieren für Dashboard- und Detailseiten
