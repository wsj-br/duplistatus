---
translation_last_updated: '2026-03-01T00:16:31.189Z'
source_file_mtime: '2026-03-01T00:09:33.538Z'
source_file_hash: 24e59da35ba78059
translation_language: de
source_file_path: development/development-guidelines.md
---
# Entwicklungsreferenz {#development-reference}

## Code-Organisation {#code-organisation}

- **Komponenten**: `src/components/` mit Unterverzeichnissen:
  - `ui/` - shadcn/ui-Komponenten und wiederverwendbare UI-Elemente
  - `dashboard/` - Dashboard-spezifische Komponenten
  - `settings/` - Komponenten der Einstellungsseite
  - `server-details/` - Komponenten der Server-Details-Seite
- **API-Routen**: `src/app/api/` mit RESTful-Endpunkt-Struktur (siehe [API-Referenz](../api-reference/overview))
- **Datenbank**: SQLite mit better-sqlite3, Dienstprogramme in `src/lib/db-utils.ts`, Migrationen in `src/lib/db-migrations.ts`
- **Typen**: TypeScript-Schnittstellen in `src/lib/types.ts`
- **Konfiguration**: Standardkonfigurationen in `src/lib/default-config.ts`
- **Cron-Dienst**: `src/cron-service/` (läuft auf Port 8667 Dev, 9667 Prod)
- **Skripte**: Dienstprogramm-Skripte im Verzeichnis `scripts/`
- **Sicherheit**: CSRF-Schutz in `src/lib/csrf-middleware.ts`, verwenden Sie `withCSRF`-Middleware für geschützte Endpunkte

## Testen & Debugging {#testing-debugging}

- Testdatengenerierung: `pnpm generate-test-data --servers=N`
- Benachrichtigungen testen: `/api/notifications/test` Endpunkt
- Cron-Integritätsprüfungen: `curl http://localhost:8667/health` oder `curl http://localhost:8666/api/cron/health`
- Überfällige Sicherung testen: `pnpm run-overdue-check`
- Entwicklungsmodus: ausführliches Logging und JSON-Dateispeicherung
- Datenbankwartung: Wartungsmenü für Bereinigungsvorgänge verwenden
- Vorchecks: `scripts/pre-checks.sh` zur Fehlerbehebung bei Startproblemen

## Entwicklungsreferenzen {#development-references}

- API-Endpunkte: Siehe [API-Referenz](../api-reference/overview)
- Datenbankschema: Siehe [Datenbankschema](database)
- Befolgen Sie die Muster in `src/lib/db-utils.ts` für Datenbankoperationen

## Frameworks & Bibliotheken {#frameworks-libraries}

### Laufzeit- und Paketverwaltung {#runtime-package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### Kern-Frameworks und Bibliotheken {#core-frameworks-libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 & React-DOM ^19.2.4
- Radix UI (@radix-ui/react-*): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (Cron-Service), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- intlayer ^8.1.8, next-intlayer ^8.1.8, react-intlayer ^8.1.8, @intlayer/editor-react ^8.1.8, @intlayer/swc ^8.1.8

### Typprüfung und Linting {#type-checking-linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (via `next lint`)
- intlayer-editor ^8.1.8
- webpack ^5.105.3

### Build & Deployment {#build-deployment}
- Next.js Standalone-Ausgabe (`output: 'standalone'`) mit Container-Einstiegspunkt, der `server.js` startet
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
