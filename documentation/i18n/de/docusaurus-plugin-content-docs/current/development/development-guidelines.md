# Entwicklungsreferenz {#development-reference}

## Code-Organisation {#code-organisation}

- **Komponenten**: `src/components/` mit Unterverzeichnissen:
  - `ui/` - shadcn/ui-Komponenten und wiederverwendbare UI-Elemente
  - `dashboard/` - Dashboard-spezifische Komponenten
  - `settings/` - Einstellungsseiten-Komponenten
  - `server-details/` - Server-Detailsseiten-Komponenten
- **API-Routen**: `src/app/api/` mit RESTful-Endpunktstruktur (siehe [API-Referenz](../api-reference/overview))
- **Datenbank**: SQLite mit better-sqlite3, Hilfsfunktionen in `src/lib/db-utils.ts`, Migrationen in `src/lib/db-migrations.ts`
- **Typen**: TypeScript-Schnittstellen in `src/lib/types.ts`
- **Konfiguration**: Standardkonfigurationen in `src/lib/default-config.ts`
- **Cron-Service**: `src/cron-service/` (läuft auf Port 8667 in der Entwicklung, 9667 in der Produktion)
- **Skripte**: Hilfsskripte im Verzeichnis `scripts/`
- **Sicherheit**: CSRF-Schutz in `src/lib/csrf-middleware.ts`, verwende `withCSRF`-Middleware für geschützte Endpunkte

## Testen und Debuggen {#testing--debugging}

- Generierung von Testdaten: `pnpm generate-test-data --servers=N`
- Benachrichtigungstest: Endpunkt `/api/notifications/test`
- Cron-Health-Checks: `curl http://localhost:8667/health` oder `curl http://localhost:8666/api/cron/health`
- Testen überfälliger Sicherungen: **Einstellungen → Backup-Überwachung** (**Überfällige Sicherungen testen**), oder `POST /api/notifications/check-overdue` mit Authentifizierung
- Entwicklungsmodus: ausführliche Protokollierung und Speicherung in JSON-Dateien
- Datenbankwartung: Wartungsmenü für Bereinigungsoperationen verwenden
- Vorabprüfungen: `scripts/pre-checks.sh` zur Fehlerbehebung bei Startproblemen

## Entwicklungsreferenzen {#development-references}

- API-Endpunkte: Siehe [API-Referenz](../api-reference/overview)
- Datenbankschema: Siehe [Datenbankschema](database)
- Befolgen Sie die Muster in `src/lib/db-utils.ts` für Datenbankoperationen

## Frameworks und Bibliotheken {#frameworks--libraries}

:::info
Für die exakten Versionen siehe [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines` und `packageManager`). Die folgende Liste ist bewusst versionsarm gehalten, damit sie auch nach Dependency-Upgrades korrekt bleibt.
:::

### Runtime & Package-Management {#runtime--package-management}
- Node.js (siehe `engines.node`)
- pnpm (erzwungen über das `preinstall`-Skript; siehe `engines.pnpm` / `packageManager`)

### Core-Frameworks & Bibliotheken {#core-frameworks--libraries}
- Next.js (App Router)
- React & React-DOM
- Radix UI (`@radix-ui/react-*`-Primitives)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (Cron-Service), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (UI- + Dokumentations-Übersetzungspipeline)

### Typprüfung & Linting {#type-checking--linting}
- TypeScript (Strict Mode)
- TSX (zum Ausführen von TypeScript-Skripten)
- ESLint (Flat Config `eslint.config.mjs` + `eslint-config-next`; Ausführung via `pnpm lint` → `eslint .`)
- webpack

### Build und Deployment {#build--deployment}
- Next.js standalone Ausgabe (`output: 'standalone'`) mit Container-Einstiegspunkt, der `server.js` startet
- Docker (node:alpine Basis) mit Multi-Architektur-Builds (AMD64, ARM64)
- GitHub Actions Workflows für CI/CD
- Inkscape für Logos und Bilder
- Docusaurus für Dokumentation
- Greenfish Icon Editor für Symbole

### Projektkonfiguration {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Systemfunktionen {#system-features}

- **Cron-Dienst**: Separater Dienst für geplante Aufgaben, gestartet durch `docker-entrypoint.sh` bei Docker-Bereitstellungen
- **Benachrichtigungen**: ntfy.sh-Integration und SMTP-E-Mail (nodemailer), konfigurierbare Vorlagen
- **Automatische Aktualisierung**: Konfigurierbare automatische Aktualisierung für Dashboard und Detailseiten
