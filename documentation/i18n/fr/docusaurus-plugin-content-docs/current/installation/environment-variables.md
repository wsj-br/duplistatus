# Variables d'environnement {/* #environment-variables */}

L'application prend en charge les variables d'environnement suivantes pour la configuration :

| Variable                  | Description                                                                                 | Par défaut                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port pour l'application web principale                                                           | `9666`                     |
| `CRON_PORT`               | Port pour le service cron (planification). S'il n'est pas défini, utilise `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Adresse sur laquelle le service cron écoute. La boucle locale est la valeur par défaut, donc l'API de contrôle n'est pas exposée.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Secret partagé requis pour les routes de mutation du service cron quand le service n'est pas lié à la boucle locale. Le proxy Next.js le transmet en tant que `X-Cron-Service-Secret`. | non défini (requis si pas de boucle locale) |
| `NODE_ENV`                | Environnement Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Désactiver la télémétrie Next.js (défini sur tous les scripts Next.js et dans Docker)                        | `1`                        |
| `TZ`                      | Fuseau horaire pour l'application                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Définir sur `false` pour désactiver les exigences de complexité du mot de passe (majuscules, minuscules, chiffres). | Appliqué (validation complète) |
| `PWD_MIN_LEN`             | Longueur minimale du mot de passe en caractères (toujours appliquée)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDR séparés par des virgules des proxies inverses autorisés à définir `X-Forwarded-For`                   | non défini                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Remplacer le drapeau d'activation de la liste d'adresses IP autorisées pour l'admin (`true` / `false`)                           | non défini (utiliser Paramètres)       |
| `ADMIN_IP_ALLOWLIST`      | CIDR séparés par des virgules pour l'interface d'administration                                               | non défini                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Remplacer le drapeau d'activation de la liste d'adresses IP autorisées pour l'API externe (`true` / `false`)                | non défini (utiliser Paramètres)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDR séparés par des virgules pour `/api/upload`, `/api/summary`, et `/api/lastbackup*`           | non défini                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL de base publique de l'interface utilisateur duplistatus (sans barre oblique finale). Quand elle est définie, elle remplace Paramètres → Résumé quotidien **URL du tableau de bord public** et les e-mails du Résumé quotidien incluent `{duplistatus_link}`. Quand elle n'est pas définie, le paramètre enregistré est utilisé ; s'il est également vide, aucun lien de tableau de bord n'est ajouté. | non défini                      |

`NEXT_TELEMETRY_DISABLED=1` est défini par l'image Docker et par `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, et `pnpm dev`, donc Next.js ne collecte pas de télémétrie CLI anonyme. Lors de l'utilisation d'un nouvel environnement de développement ou de la compilation à partir de la source, conservez également l'exclusion dans votre configuration utilisateur, exécutez `npx next telemetry disable`.
