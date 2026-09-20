# Integração com a Página Inicial (Opcional) {/* #homepage-integration-optional */}

[Página Inicial](https://gethomepage.dev/) é um aplicativo de painel personalizável. Para integrar o **duplistatus** com a Página Inicial, adicione um widget ao seu arquivo `services.yaml` usando o [tipo de widget de API personalizada](https://gethomepage.dev/widgets/services/customapi/).

## Widget de Resumo {/* #summary-widget */}

Este widget exibe estatísticas gerais de backup no seu painel da Página Inicial.

```yaml
- Dashboard:
    icon: mdi-cloud-upload
    href: http://your-server:9666/
    widget:
      type: customapi
      url: http://your-server:9666/api/summary?api_key=YOUR_READ_KEY
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

![Widget de Resumo da Página Inicial](/img/homepage-summary.png)

## Widget de Informações do Último Backup {/* #last-backup-information-widget */}

Este widget exibe as informações do último backup para uma máquina específica.

```yaml
- Test Machine 1:
    icon: mdi-test-tube
    widget:
      type: customapi
      url: http://your-server:9666/api/lastbackup/Test%20Machine%201?api_key=YOUR_READ_KEY
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

![Widget de Último Backup da Página Inicial](/img/homepage-lastbackup.png)

## Notas de Configuração {/* #configuration-notes */}

- Substitua `your-server` pelo endereço IP ou nome do host do seu servidor.
- Ajuste o `refreshInterval` conforme necessário (em milissegundos).
- Substitua espaços nos nomes das máquinas por `%20` na URL (por exemplo, `Test Machine 1` torna-se `Test%20Machine%201`).
- Os valores `scale` convertem bytes para unidades mais legíveis (GB, MB).
- Utilize uma chave de API com escopo de **leitura** quando [chaves de API](settings/api-keys-settings.md) forem necessárias. Remova `?api_key=` quando as chaves forem opcionais.
- Se a [lista de permissões de IP da API externa](settings/ip-allowlist-settings.md) estiver habilitada, inclua o host da Página Inicial.
