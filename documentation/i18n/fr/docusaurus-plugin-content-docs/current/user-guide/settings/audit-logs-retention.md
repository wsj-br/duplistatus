---
translation_last_updated: '2026-01-31T00:51:22.978Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 94eead26e2126982
translation_language: fr
source_file_path: user-guide/settings/audit-logs-retention.md
---
# Rétention du journal d'audit {#audit-log-retention}

Configurer la durée de rétention des journaux d'audit avant le nettoyage automatique.

![Audit Log Retention](/assets/screen-settings-audit-retention.png)

| Setting | Description | Par défaut |
|:-------|:-----------|:-------------|
| **Rétention (jours)** | Nombre de jours de conservation des journaux d'audit avant suppression automatique | `90 jours` |

## Paramètres de rétention {#retention-settings}

- **Plage** : 30 à 365 jours
- **Nettoyage automatique** : S'exécute quotidiennement à 02:00 UTC (non configurable)
- **Nettoyage manuel** : Disponible via l'API pour les administrateurs (voir [Nettoyage des journaux d'audit](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
