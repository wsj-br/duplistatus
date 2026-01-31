---
translation_last_updated: '2026-01-31T00:51:19.853Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 1afab25f18ff213d
translation_language: fr
source_file_path: development/development-guidelines.md
---
# Référence de développement {#development-reference}

## Organisation du code {#code-organisation}

- **Composants** : `src/components/` avec sous-répertoires :
  - `ui/` - Composants shadcn/ui et éléments d'interface utilisateur réutilisables
  - `dashboard/` - Composants spécifiques au Tableau de bord
  - `settings/` - Composants de la page Paramètres
  - `server-details/` - Composants de la page de détails du Serveur
- **Routes API** : `src/app/api/` avec structure de points de terminaison RESTful (voir [Référence API](../api-reference/overview))
- **Base de données** : SQLite avec better-sqlite3, utilitaires dans `src/lib/db-utils.ts`, migrations dans `src/lib/db-migrations.ts`
- **Types** : Interfaces TypeScript dans `src/lib/types.ts`
- **Configuration** : Configurations par défaut dans `src/lib/default-config.ts`
- **Service Cron** : `src/cron-service/` (s'exécute sur le port 8667 en développement, 9667 en production)
- **Scripts** : Scripts utilitaires dans le répertoire `scripts/`
- **Sécurité** : Protection CSRF dans `src/lib/csrf-middleware.ts`, utilisez le middleware `withCSRF` pour les points de terminaison protégés

## Test et débogage {#testing-debugging}

- Génération de données de test : `pnpm generate-test-data --servers=N`
- Test de notifications : endpoint `/api/notifications/test`
- Contrôles de santé Cron : `curl http://localhost:8667/health` ou `curl http://localhost:8666/api/cron/health`
- Test de sauvegarde en retard : `pnpm run-overdue-check`
- Mode développement : journalisation détaillée et stockage de fichiers JSON
- Maintenance de la base de données : utilisez le menu de maintenance pour les opérations de nettoyage
- Pré-vérifications : `scripts/pre-checks.sh` pour dépanner les problèmes de démarrage

## Références de développement {#development-references}

- Points de terminaison API : Voir [Référence API](../api-reference/overview)
- Schéma de base de données : Voir [Schéma de base de données](database)
- Suivez les modèles dans `src/lib/db-utils.ts` pour les opérations de base de données

## Frameworks et bibliothèques {#frameworks-libraries}

### Runtime et gestion des paquets {#runtime-package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.28.0)

### Frameworks et bibliothèques principaux {#core-frameworks-libraries}
- Next.js ^16.1.1 (App Router)
- React ^19.2.3 & React-DOM ^19.2.3
- Radix UI (@radix-ui/react-*): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.1.18 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.0
- Recharts ^3.6.0, react-day-picker ^9.13.0, react-hook-form ^7.70.0, react-datepicker ^9.1.0
- lucide-react ^0.562.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (service cron), node-cron ^4.2.1
- nodemailer ^7.0.12, qrcode ^1.5.4

### Vérification des types et linting {#type-checking-linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.39.2 (via `next lint`)

### Build & Déploiement {#build-deployment}
- Sortie autonome Next.js (`output: 'standalone'`) avec point d'entrée conteneur démarrant `server.js`
- Docker (base node:alpine) avec builds multi-architecture (AMD64, ARM64)
- Workflows GitHub Actions pour CI/CD
- Inkscape pour les logos et les images
- Docusaurus pour la documentation
- Greenfish Icon Editor pour les icônes

### Configuration du Projet {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Fonctionnalités du Système {#system-features}

- **Service Cron** : Service distinct pour les tâches planifiées, redémarrage automatique via `duplistatus-cron.sh`
- **Notifications** : Intégration ntfy.sh et e-mail SMTP (nodemailer), modèles configurables
- **Actualisation automatique** : Actualisation automatique configurable pour le tableau de bord et les pages de détail
