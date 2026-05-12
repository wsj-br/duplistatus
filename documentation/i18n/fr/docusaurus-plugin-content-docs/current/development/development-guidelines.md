# Référence de Développement {#development-reference}

## Organisation du code {#code-organisation}

- **Composants** : `src/components/` avec sous-répertoires :
  - `ui/` - composants shadcn/ui et éléments d'interface réutilisables
  - `dashboard/` - composants spécifiques au tableau de bord
  - `settings/` - composants de la page des paramètres
  - `server-details/` - composants de la page de détail du serveur
- **Routes API** : `src/app/api/` avec structure d'endpoint RESTful (voir [Référence API](../api-reference/overview))
- **Base de données** : SQLite avec better-sqlite3, utilitaires dans `src/lib/db-utils.ts`, migrations dans `src/lib/db-migrations.ts`
- **Types** : interfaces TypeScript dans `src/lib/types.ts`
- **Configuration** : configurations par défaut dans `src/lib/default-config.ts`
- **Service Cron** : `src/cron-service/` (exécuté sur le port 8667 en développement, 9667 en production)
- **Scripts** : scripts utilitaires dans le répertoire `scripts/`
- **Sécurité** : protection CSRF dans `src/lib/csrf-middleware.ts`, utiliser le middleware `withCSRF` pour les endpoints protégés

## Tests et débogage {#testing--debugging}

- Génération de données de test : `pnpm generate-test-data --servers=N`
- Test des notifications : endpoint `/api/notifications/test`
- Vérifications d'intégrité du cron : `curl http://localhost:8667/health` ou `curl http://localhost:8666/api/cron/health`
- Test des sauvegardes en retard : **Paramètres → Surveillance des sauvegardes** (**Tester les sauvegardes en retard**), ou `POST /api/notifications/check-overdue` avec authentification
- Mode développement : journalisation détaillée et stockage dans des fichiers JSON
- Maintenance de la base de données : utiliser le menu de maintenance pour les opérations de nettoyage
- Pré-vérifications : `scripts/pre-checks.sh` pour le dépannage des problèmes de démarrage

## Références de développement {#development-references}

- Points de terminaison API : Voir [Référence API](../api-reference/overview)
- Schéma de base de données : Voir [Schéma de base de données](database)
- Suivez les modèles dans `src/lib/db-utils.ts` pour les opérations de base de données

## Frameworks et bibliothèques {#frameworks--libraries}

### Environnement d'exécution et gestion des packages {#runtime--package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### Frameworks et bibliothèques principaux {#core-frameworks--libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 et React-DOM ^19.2.4
- Radix UI (`@radix-ui/react-*`): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (service cron), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- ai-i18n-tools ^1.x, i18next ^26.x, react-i18next ^17.x (pipeline de traduction UI + documentation)

### Vérification des types et linting {#type-checking--linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (via `next lint`)
- webpack ^5.105.3

### Construction et déploiement {#build--deployment}
- Sortie autonome Next.js (`output: 'standalone'`) avec point d'entrée du conteneur lançant `server.js`
- Docker (base node:alpine) avec des constructions multi-architectures (AMD64, ARM64)
- Workflows GitHub Actions pour CI/CD
- Inkscape pour les logos et images
- Docusaurus pour la documentation
- Greenfish Icon Editor pour les icônes

### Configuration du Projet {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Caractéristiques du Système {#system-features}

- **Service Cron** : Service distinct pour les tâches planifiées, démarré par `docker-entrypoint.sh` dans les déploiements Docker
- **Notifications** : Intégration ntfy.sh et e-mail SMTP (nodemailer), modèles configurables
- **Actualisation automatique** : Actualisation automatique configurable pour le tableau de bord et les pages de détails
