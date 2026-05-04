---
translation_last_updated: '2026-04-18T00:03:16.656Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: aa2aee4865635902ba009cc73f39b48515884d5bc15c131a8e1fddf38c78e479
translation_language: fr
source_file_path: documentation/docs/user-guide/settings/audit-logs-retention.md
translation_models:
  - anthropic/claude-haiku-4.5
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
