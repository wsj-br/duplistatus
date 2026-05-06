---
translation_last_updated: '2026-05-06T23:20:15.304Z'
source_file_mtime: '2026-05-06T23:18:51.406Z'
source_file_hash: c7ae1bc72c936d2aee0a62300df6c52bf8f2bbcc98ea4f2271e966cc459510be
translation_language: de
source_file_path: documentation/docs/development/development-guidelines.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
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

### Laufzeitumgebung und Paketverwaltung {#runtime--package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### Kern-Frameworks und Bibliotheken {#core-frameworks--libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 & React-DOM ^19.2.4
- Radix UI (`@radix-ui/react-*`): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (Cron-Service), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- ai-i18n-tools ^1.x, i18next ^26.x, react-i18next ^17.x (UI- und Dokumentations-Übersetzungs-Pipeline)

### Typüberprüfung und Linting {#type-checking--linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (über `next lint`)
- webpack ^5.105.3

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
