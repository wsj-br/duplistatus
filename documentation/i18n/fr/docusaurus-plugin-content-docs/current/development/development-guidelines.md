# Référence de développement {/* #development-reference */}

## Organisation du code {/* #code-organisation */}

- **Composants** : `src/components/` avec sous-répertoires :
  - `ui/` - composants shadcn/ui et éléments d'interface réutilisables
  - `dashboard/` - composants spécifiques au tableau de bord
  - `settings/` - composants de la page des paramètres
  - `server-details/` - composants de la page des détails du serveur
- **Routes API** : `src/app/api/` avec une structure de points de terminaison RESTful (voir [Référence API](../api-reference/overview))
- **Base de données** : SQLite avec better-sqlite3, utilitaires dans `src/lib/db-utils.ts`, migrations dans `src/lib/db-migrations.ts`
- **Types** : Interfaces TypeScript dans `src/lib/types.ts`
- **Configuration** : Configurations par défaut dans `src/lib/default-config.ts`
- **Service Cron** : `src/cron-service/` (s'exécute sur le port 8667 en développement, 9667 en production)
- **Scripts** : Scripts utilitaires dans le répertoire `scripts/`
- **Sécurité** : Protection CSRF dans `src/lib/csrf-middleware.ts`, utilisez le middleware `withCSRF` pour les points de terminaison protégés

## Tests et débogage {/* #testing--debugging */}

- Génération de données de test : `pnpm generate-test-data --servers=N`
- Test des notifications : point de terminaison `/api/notifications/test`
- Vérifications de santé du Cron : `curl http://localhost:8667/health` ou `curl http://localhost:8666/api/cron/health`
- Test des sauvegardes en retard : **Paramètres → Surveillance des sauvegardes** (**Tester les sauvegardes en retard**), ou `POST /api/notifications/check-overdue` avec authentification
- Mode développement : journalisation détaillée et stockage de fichiers JSON
- Maintenance de la base de données : utilisez le menu de maintenance pour les opérations de nettoyage
- Pré-vérifications : `scripts/pre-checks.sh` pour le dépannage des problèmes de démarrage

## Références de développement {/* #development-references */}

- Points de terminaison API : Voir [Référence API](../api-reference/overview)
- Schéma de la base de données : Voir [Schéma de la base de données](database)
- Suivez les modèles dans `src/lib/db-utils.ts` pour les opérations de base de données

## Cadres et bibliothèques {/* #frameworks--libraries */}

:::info
Pour les versions exactes, voir [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, et `packageManager`). La liste ci-dessous est intentionnellement légère en termes de version pour rester à jour lors des mises à jour des dépendances.
:::

### Runtime et gestion des paquets {/* #runtime--package-management */}
- Node.js (voir `engines.node`)
- pnpm (imposé via le script `preinstall` ; voir `engines.pnpm` / `packageManager`)

### Cadres et bibliothèques principaux {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React & React-DOM
- Radix UI (primitives `@radix-ui/react-*`)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (service cron), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (pipeline de traduction de l'interface utilisateur et de la documentation)

### Vérification de type et linting {/* #type-checking--linting */}
- TypeScript (mode strict)
- TSX (pour exécuter des scripts TypeScript)
- ESLint (configuration plate `eslint.config.mjs` + `eslint-config-next` ; exécuter via `pnpm lint` → `eslint .`)
- webpack

### Construction et déploiement {/* #build--deployment */}
- Sortie autonome de Next.js (`output: 'standalone'`) avec point d'entrée de conteneur démarrant `server.js`. Le traçage de fichiers est toujours exécuté pour l'image d'exécution Docker ; `outputFileTracingExcludes` dans `next.config.ts` supprime les paquets de construction uniquement (webpack, compilateurs natifs SWC, esbuild, minificateurs CSS) et les préconstructions non-Linux `better-sqlite3`. Ne pas exclure `@swc/helpers`, `sharp`, ou les préconstructions Linux sqlite.
- Docker (base node:alpine) avec des constructions multi-architectures (AMD64, ARM64). L'image construit uniquement l'application Next.js (pas le site Docusaurus) ; la version pnpm est prise à partir de `packageManager` dans `package.json`
- Workflows GitHub Actions pour CI/CD
- Inkscape pour les logos et les images
- Docusaurus pour la documentation
- Greenfish Icon Editor pour les icônes

### Configuration du projet {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Fonctionnalités du système {/* #system-features */}

- **Service Cron** : Service séparé pour les tâches planifiées, démarré par `docker-entrypoint.sh` dans les déploiements Docker
- **Notifications** : intégration ntfy.sh et E-mail SMTP (nodemailer), modèles configurables
- **Actualisation automatique** : Actualisation automatique configurable pour les pages de tableau de bord et de détails
