---
translation_last_updated: '2026-02-05T00:20:52.995Z'
source_file_mtime: '2026-02-02T19:14:50.094Z'
source_file_hash: cf92c351f5e4592a
translation_language: fr
source_file_path: user-guide/settings/audit-logs-retention.md
---
# Rétention du journal d'audit {#audit-log-retention}

Configurer la durée de conservation des journaux d'audit avant le nettoyage automatique.

![Audit Log Retention](../../assets/screen-settings-audit-retention.png)

| Paramètre | Description | Valeur par défaut |
|:-------|:-----------|:-------------|
| **Rétention (jours)** | Nombre de jours de conservation des journaux d'audit avant suppression automatique | `90 jours` |

## Paramètres de rétention {#retention-settings}

- **Plage** : 30 à 365 jours
- **Nettoyage automatique** : S'exécute quotidiennement à 02:00 UTC (non configurable)
- **Nettoyage manuel** : Disponible via API pour les administrateurs (voir [Nettoyage des journaux d'audit](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
