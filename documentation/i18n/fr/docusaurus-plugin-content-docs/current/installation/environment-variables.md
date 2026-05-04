---
translation_last_updated: '2026-04-18T00:02:33.354Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: 781281113de4e41e8ca020c5d122aaa0d1fe40599ea1612477312ced4f7eb83a
translation_language: fr
source_file_path: documentation/docs/installation/environment-variables.md
translation_models:
  - anthropic/claude-haiku-4.5
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
