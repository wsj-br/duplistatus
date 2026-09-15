# Entwicklungsreferenz {/* #development-reference */}

## Code-Organisation {/* #code-organisation */}

- **Komponenten**: `src/components/` mit Unterverzeichnissen:
  - `ui/` - shadcn/ui-Komponenten und wiederverwendbare UI-Elemente
  - `dashboard/` - Dashboard-spezifische Komponenten
  - `settings/` - Einstellungsseiten-Komponenten
  - `server-details/` - Server-Detail-Seiten-Komponenten
- **API-Routen**: `src/app/api/` mit RESTful-Endpunkt-Struktur (siehe [API-Referenz](../api-reference/overview))
- **Datenbank**: SQLite mit better-sqlite3, Utilities in `src/lib/db-utils.ts`, Migrationen in `src/lib/db-migrations.ts`
- **Typen**: TypeScript-Schnittstellen in `src/lib/types.ts`
- **Konfiguration**: Standard-Konfigurationen in `src/lib/default-config.ts`
- **Cron-Dienst**: `src/cron-service/` (läuft auf Port 8667 in der Entwicklung, 9667 in der Produktion)
- **Skripte**: Utility-Skripte im `scripts/`-Verzeichnis
- **Sicherheit**: CSRF-Schutz in `src/lib/csrf-middleware.ts`, verwenden Sie das `withCSRF`-Middleware für geschützte Endpunkte

## Testing & Debugging {/* #testing--debugging */}

- Testdaten-Generierung: `pnpm generate-test-data --servers=N`
- Benachrichtigungstests: `/api/notifications/test`-Endpunkt
- Cron-Health-Checks: `curl http://localhost:8667/health` oder `curl http://localhost:8666/api/cron/health`
- Überfällige Backup-Tests: **Einstellungen → Backup-Überwachung** (**Überfällige Backups testen**), oder `POST /api/notifications/check-overdue` mit Authentifizierung
- Entwicklungsmodus: ausführliche Protokollierung und JSON-Datei-Speicherung
- Datenbankwartung: Verwenden Sie das Wartungsmenü für Reinigungsoperationen
- Vorabprüfungen: `scripts/pre-checks.sh` für die Fehlerbehebung bei Startproblemen

## Entwicklungsreferenzen {/* #development-references */}

- API-Endpunkte: Siehe [API-Referenz](../api-reference/overview)
- Datenbankschema: Siehe [Datenbankschema](database)
- Folgen Sie den Mustern in `src/lib/db-utils.ts` für Datenbankoperationen

## Frameworks & Bibliotheken {/* #frameworks--libraries */}

:::info
Für genaue Versionen, siehe [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, und `packageManager`). Die folgende Liste ist absichtlich versionenleicht, damit sie bei Abhängigkeits-Upgrades aktuell bleibt.
:::

### Laufzeit & Paketverwaltung {/* #runtime--package-management */}
- Node.js (siehe `engines.node`)
- pnpm (erzwungen durch das `preinstall`-Skript; siehe `engines.pnpm` / `packageManager`)

### Kern-Frameworks & Bibliotheken {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React & React-DOM
- Radix UI (`@radix-ui/react-*` Primitiven)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (Cron-Dienst), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI + Dokumenten-Übersetzungs-Pipeline)

### Typprüfung & Linting {/* #type-checking--linting */}
- TypeScript (strenger Modus)
- TSX (für das Ausführen von TypeScript-Skripten)
- ESLint (flache Konfiguration `eslint.config.mjs` + `eslint-config-next`; ausführen über `pnpm lint` → `eslint .`)
- webpack

### Build & Deployment {/* #build--deployment */}
- Next.js standalone-Ausgabe (`output: 'standalone'`) mit Container-Einstiegspunkt, der `server.js` startet. Die Datei-Tracing läuft weiterhin für das Docker-Laufzeit-Image; `outputFileTracingExcludes` in `next.config.ts` entfernt Build-only-Pakete (webpack, SWC-Compiler-Natives, esbuild, CSS-Minifier) und nicht-Linux-`better-sqlite3`-Prebuilds. Schließen Sie `@swc/helpers`, `sharp` oder Linux-sqlite-Prebuilds nicht aus.
- Docker (node:alpine-Basis) mit Multi-Architektur-Builds (AMD64, ARM64). Das Image baut nur die Next.js-App (nicht die Docusaurus-Site); die pnpm-Version wird aus `packageManager` in `package.json` genommen
- GitHub Actions-Workflows für CI/CD
- Inkscape für Logos und Bilder
- Docusaurus für Dokumentation
- Greenfish Icon Editor für Icons

### Projektkonfiguration {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Systemfunktionen {/* #system-features */}

- **Cron-Dienst**: Separater Dienst für geplante Aufgaben, gestartet durch `docker-entrypoint.sh` in Docker-Bereitstellungen
- **Benachrichtigungen**: ntfy.sh-Integration und SMTP-E-Mail (nodemailer), konfigurierbare Vorlagen
- **Automatische Aktualisierung**: Konfigurierbare automatische Aktualisierung für Dashboard- und Detailseiten
