---
translation_last_updated: '2026-02-05T00:20:49.772Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: d1761516332c96f7
translation_language: fr
source_file_path: installation/environment-variables.md
---
# Variables d'environnement {#environment-variables}

L'application prend en charge les variables d'environnement suivantes pour la configuration :

| Variable                  | Description                                            | Par défaut      |
| ------------------------- | ------------------------------------------------------ | :-------------- |
| `PORT`                    | Port pour l'application web principale                 | `9666`          |
| `CRON_PORT`               | Port pour le service cron. Si non défini, utilise `PORT + 1` | `9667`          |
| `NODE_ENV`                | Environnement Node.js (`development` ou `production`)  | `production`    |
| `NEXT_TELEMETRY_DISABLED` | Désactiver la télémétrie Next.js                       | `1`             |
| `TZ`                      | Fuseau horaire pour l'application                      | `Europe/London` |
| `LANG`                    | Locale pour l'application (par ex. `en_US`, `pt_BR`)   | `en_GB`         |
| `PWD_ENFORCE`             | Définir à `false` pour désactiver les exigences de complexité du mot de passe (majuscules, minuscules, chiffres). La longueur minimum est toujours appliquée. | Appliqué (validation complète) |
| `PWD_MIN_LEN`             | Longueur minimum du mot de passe en caractères         | `8`             |
