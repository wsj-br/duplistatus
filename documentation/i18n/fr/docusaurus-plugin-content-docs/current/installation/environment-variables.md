---
translation_last_updated: '2026-02-15T20:57:31.253Z'
source_file_mtime: '2026-02-15T18:21:42.048Z'
source_file_hash: 73f503de6e910445
translation_language: fr
source_file_path: installation/environment-variables.md
---
# Variables d'environnement {#environment-variables}

L'application prend en charge les variables d'environnement suivantes pour la configuration :

| Variable                  | Description                                                                                 | Par défaut                 |
|---------------------------|---------------------------------------------------------------------------------------------|:---------------------------|
| `PORT`                    | Port pour l'application web principale                                                      | `9666`                     |
| `CRON_PORT`               | Port pour le service cron (planification). Si non défini, utilise `PORT + 1`                | `9667`                     |
| `NODE_ENV`                | Environnement Node.js (`development` ou `production`)                                       | `production`               |
| `NEXT_TELEMETRY_DISABLED` | Désactiver la télémétrie Next.js                                                            | `1`                        |
| `TZ`                      | Fuseau horaire pour l'application                                                           | `Europe/London`            |
| `PWD_ENFORCE`             | Définir à `false` pour désactiver les exigences de complexité du mot de passe (majuscules, minuscules, chiffres). | Appliqué (validation complète) |
| `PWD_MIN_LEN`             | Longueur minimale du mot de passe en caractères (toujours appliquée)                        | `8`                        |
