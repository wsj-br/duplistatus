# Variables d'environnement {/* #environment-variables */}

L'application prend en charge les variables d'environnement suivantes pour la configuration :

| Variable                  | Description                                                                                 | Par défaut                    |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port pour l'application web principale                                                           | `9666`                     |
| `CRON_PORT`               | Port pour le service cron (planification). Si non défini, utilise `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Adresse à laquelle le service cron écoute. La boucle locale est la valeur par défaut, donc l'API de contrôle n'est pas exposée.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Secret partagé requis pour modifier les routes du service cron lorsque le service n'est pas lié à la boucle locale. Le proxy Next.js le transmet comme `X-Cron-Service-Secret`. | non défini (requis si non boucle locale) |
| `NODE_ENV`                | Environnement Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Désactiver la télémétrie Next.js (définir sur tous les scripts Next.js et dans Docker)                        | `1`                        |
| `TZ`                      | Fuseau horaire pour l'application                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Définir sur `false` pour désactiver les exigences de complexité des mots de passe (majuscules, minuscules, chiffres). | Exigé (validation complète) |
| `PWD_MIN_LEN`             | Longueur minimale du mot de passe en caractères (toujours exigée)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs séparés par des virgules des proxies inverses autorisés à définir `X-Forwarded-For`                   | non défini                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Remplacer le drapeau d'activation de la liste d'adresses IP autorisées pour l'interface d'administration (`true` / `false`)                           | non défini (utiliser Paramètres)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs séparés par des virgules pour l'interface d'administration                                               | non défini                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Remplacer le drapeau d'activation de la liste d'adresses IP autorisées pour l'API externe (`true` / `false`)                | non défini (utiliser Paramètres)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs séparés par des virgules pour `/api/upload`, `/api/summary`, et `/api/lastbackup*`           | non défini                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL de base publique de l'interface web duplistatus (sans barre oblique finale). Quand elle est définie, elle remplace Paramètres → Résumé quotidien **URL du tableau de bord public** et les e-mails de résumé quotidien incluent `{duplistatus_link}`. Quand elle n'est pas définie, le paramètre enregistré est utilisé ; si celui-ci est également vide, aucun lien de tableau de bord n'est ajouté. | non défini                      |

`NEXT_TELEMETRY_DISABLED=1` est défini par l'image Docker et par `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, et `pnpm dev`, donc Next.js ne collecte pas de télémétrie CLI anonyme. Quand vous utilisez un nouvel environnement de développement ou que vous compilez à partir de la source, persistez également l'opt-out dans votre configuration utilisateur et exécutez `npx next telemetry disable`.
