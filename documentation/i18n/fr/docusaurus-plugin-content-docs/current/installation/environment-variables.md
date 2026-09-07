# Variables d'environnement {/* #environment-variables */}

L'application prend en charge les variables d'environnement suivantes pour la configuration :

| Variable                  | Description                                                                                 | Par défaut                |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port pour l'application web principale                                                       | `9666`                     |
| `CRON_PORT`               | Port pour le service cron (planification). Si non défini, utilise `PORT + 1`                                      | `9667`                     |
| `CRON_BIND_HOST`          | Adresse à laquelle le service cron écoute. Le mode boucle locale est par défaut, donc l'API de contrôle n'est pas exposée.          | `127.0.0.1`                |
| `CRON_SERVICE_SECRET`     | Secret partagé requis pour modifier les routes du service cron lorsque le service n'est pas lié à la boucle locale. Le proxy Next.js le transmet sous `X-Cron-Service-Secret`. | non défini (requis si pas en boucle locale) |
| `NODE_ENV`                | Environnement Node.js (`development` ou `production`)                                         | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Désactiver la télémétrie Next.js (définie sur tous les scripts Next.js et dans Docker)                        | `1`                        |
| `TZ`                      | Fuseau horaire pour l'application                                                                | `Europe/London`            |
| `PWD_ENFORCE`             | Défini sur `false` pour désactiver les exigences de complexité du mot de passe (majuscules, minuscules, chiffres). | Appliqué (validation complète) |
| `PWD_MIN_LEN`             | Longueur minimale du mot de passe en caractères (toujours appliquée)                                    | `8`                        |
| `IP_TRUSTED_PROXIES`      | CIDRs séparés par des virgules des proxys inverses autorisés à définir `X-Forwarded-For`                   | non défini                      |
| `ADMIN_IP_ALLOWLIST_ENABLED` | Remplacer le drapeau d'activation de la liste d'adresses IP de l'admin (`true` / `false`)                           | non défini (utiliser Paramètres)       |
| `ADMIN_IP_ALLOWLIST`      | CIDRs séparés par des virgules pour l'interface d'administration                                               | non défini                      |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | Remplacer le drapeau d'activation de la liste d'adresses API externes (`true` / `false`)                | non défini (utiliser Paramètres)       |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs séparés par des virgules pour `/api/upload`, `/api/summary`, et `/api/lastbackup*`           | non défini                      |
| `DUPLISTATUS_PUBLIC_URL`    | URL de base publique de l'interface web du duplistatus (sans barre oblique finale). Lorsqu'elle est définie, elle remplace les Paramètres → Résumé quotidien **URL du tableau de bord public** et les e-mails de résumé quotidien incluent `{duplistatus_link}`. Lorsqu'elle est non définie, le paramètre enregistré est utilisé ; si celui-ci est également vide, aucun lien vers le tableau de bord n'est ajouté. | non défini                      |

`NEXT_TELEMETRY_DISABLED=1` est défini par l'image Docker et par `pnpm build`, `pnpm build-local`, `pnpm start`, `pnpm start-local`, et `pnpm dev`, donc Next.js ne collecte pas de télémétrie CLI anonyme. Quand vous utilisez un nouvel environnement de développement ou que vous compilez à partir de la source, conservez également l'opt-out dans votre configuration utilisateur, exécutez `npx next telemetry disable`.
