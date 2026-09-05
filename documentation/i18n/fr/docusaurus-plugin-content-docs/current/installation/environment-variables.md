# Variables d'environnement {#environment-variables}

L'application prend en charge les variables d'environnement suivantes pour la configuration :

| Variable                  | Description                                                                                 | Par défaut                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port pour l'application web principale                                                           | `9666`                     |
| `CRON_PORT`               | Port pour le service cron (planification). Si non défini, utilise `PORT + 1`                                      | `9667`                     |
| `NODE_ENV`                | Environnement Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Désactiver la télémétrie Next.js (définie dans tous les scripts Next.js et dans Docker)                        | `1`                        |
| `TZ`                      | Fuseau horaire de l'application                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Définir sur `false` pour désactiver les exigences de complexité du mot de passe (majuscules, minuscules, chiffres). | Appliqué (validation complète) |
| `PWD_MIN_LEN`             | Longueur minimale du mot de passe en caractères (toujours appliquée)                                    | `8`                        |

`NEXT_TELEMETRY_DISABLED=1` est défini par l'image Docker et par `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, et `pnpm dev`, de sorte que Next.js ne collecte pas de télémétrie CLI anonyme. Pour conserver l'opt-out dans votre configuration utilisateur, exécutez `npx next telemetry disable`.
