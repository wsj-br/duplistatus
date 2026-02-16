---
translation_last_updated: '2026-02-16T00:13:30.308Z'
source_file_mtime: '2026-02-14T22:20:51.153Z'
source_file_hash: f21e4b84808c8bcb
translation_language: fr
source_file_path: user-guide/settings/audit-logs-retention.md
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
- **Nettoyage manuel** : Disponible via API pour les administrateurs (voir [Nettoyage des journaux d'audit](../../api-reference/administration-apis.md#cleanup-audit-logs-apiaudit-logcleanup))
