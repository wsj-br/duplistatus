---
translation_last_updated: '2026-03-01T00:45:20.314Z'
source_file_mtime: '2026-02-16T00:30:39.431Z'
source_file_hash: 5b8fdae17a34ff83
translation_language: pt-BR
source_file_path: user-guide/homepage-integration.md
---
# Integração da Página Inicial (Opcional) {#homepage-integration-optional}

[Homepage](https://gethomepage.dev/) é um aplicativo de painel personalizável. Para integrar **duplistatus** com Homepage, adicione um widget ao seu arquivo `services.yaml` usando o [tipo de widget Custom API](https://gethomepage.dev/widgets/services/customapi/).

## Widget de Resumo {#summary-widget}

Este widget exibe as estatísticas gerais do backup no painel da sua página inicial.

```yaml
- Dashboard:
    icon: mdi-cloud-upload
    href: http://your-server:9666/
    widget:
      type: customapi
      url: http://your-server:9666/api/summary
      display: list
      refreshInterval: 60000
      mappings:
        - field: totalServers
          label: Servers
        - field: totalBackups
          label: Backups received
        - field: secondsSinceLastBackup
          label: Last backup
          format: duration
        - field: totalBackupSize
          label: Backed up size
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalStorageUsed
          label: Storage used
          format: number
          scale: 0.000000001
          suffix: GB
        - field: totalUploadedSize
          label: Uploaded size
          format: number
          scale: 0.000000001
          suffix: GB
```

**Exibição do Widget:**

![Homepage Summary Widget](/img/homepage-summary.png)

## Widget de Informações da Última Backup {#last-backup-information-widget}

Este widget exibe as informações de backup mais recentes para uma máquina específica.

```yaml
- Test Machine 1:
    icon: mdi-test-tube
    widget:
      type: customapi
      url: http://your-server:9666/api/lastbackup/Test%20Machine%201
      display: list
      refreshInterval: 60000
      mappings:
        - field: latest_backup.name
          label: Backup name
        - field: latest_backup.status
          label: Result
        - field: latest_backup.date
          label: Date
          format: relativeDate
        - field: latest_backup.duration
          label: Duration
        - field: latest_backup.uploadedSize
          label: Bytes Uploaded
          format: number
          scale: 0.000001
          suffix: MB
        - field: latest_backup.backup_list_count
          label: Versions
```

**Exibição do Widget:**

![Homepage Last Backup Widget](/img/homepage-lastbackup.png)

## Notas de Configuração {#configuration-notes}

- Substitua `your-server` pelo endereço IP ou nome do host do seu servidor.
- Ajuste o `refreshInterval` conforme necessário (em milissegundos).
- Substitua espaços em nomes de máquinas por `%20` na URL (por exemplo, `Test Machine 1` torna-se `Test%20Machine%201`).
- Os valores de `scale` convertem bytes para unidades mais legíveis (GB, MB).
