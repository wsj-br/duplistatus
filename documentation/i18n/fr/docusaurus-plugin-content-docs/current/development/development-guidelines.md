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

:::info
Pour les versions exactes, consultez [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines` et `packageManager`). La liste ci-dessous est intentionnellement simplifiée au niveau des versions afin de rester exacte lors des mises à jour de dépendances.
:::

### Runtime et gestion des paquets {#runtime--package-management}
- Node.js (voir `engines.node`)
- pnpm (imposé via le script `preinstall` ; voir `engines.pnpm` / `packageManager`)

### Frameworks et bibliothèques principaux {#core-frameworks--libraries}
- Next.js (App Router)
- React et React-DOM
- Radix UI (primitives `@radix-ui/react-*`)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (service cron), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (pipeline de traduction de l'UI et de la documentation)

### Vérification des types et linting {#type-checking--linting}
- TypeScript (mode strict)
- TSX (pour l'exécution de scripts TypeScript)
- ESLint (flat config `eslint.config.mjs` + `eslint-config-next` ; exécuté via `pnpm lint` → `eslint .`)
- webpack

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
