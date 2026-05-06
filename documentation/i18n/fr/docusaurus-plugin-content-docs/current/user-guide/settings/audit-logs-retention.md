---
translation_last_updated: '2026-05-06T23:21:47.588Z'
source_file_mtime: '2026-05-06T23:18:51.442Z'
source_file_hash: e3e4bfa89172763e996fda191dad072d6156ecad610292ea1c564e416018e41e
translation_language: fr
source_file_path: documentation/docs/user-guide/settings/audit-logs-retention.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Rétention du journal d'audit {#audit-log-retention}

Configurer la durée de conservation des journaux d'audit avant le nettoyage automatique.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Paramètre | Description | Valeur par défaut |
|:-------|:-----------|:-------------|
| **Rétention (jours)** | Nombre de jours de conservation des journaux d'audit avant suppression automatique | **90 jours** |

## Paramètres de rétention {#retention-settings}

- **Plage** : 30 à 365 jours
- **Nettoyage automatique** : S'exécute quotidiennement à 02:00 UTC (non configurable)
- **Nettoyage manuel** : Disponible via l'API pour les administrateurs (voir [Nettoyer les journaux d'audit](../../api-reference/administration-apis.md#cleanup-audit-logs---apiaudit-logcleanup))
