---
translation_last_updated: '2026-04-18T00:02:16.999Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: c41071b1ca07d5e1429c3ffe82eda783ae96f0bf0d8132f43f1e985f96153d9e
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/settings/backup-monitoring-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Monitoramento de Backup {#backup-monitoring}

![Backup alerts](../../assets/screen-settings-monitoring.png)

## Configurar Configurações de Monitoramento por Backup {#configure-per-backup-monitoring-settings}

-  **Nome do servidor**: O nome do servidor a monitorar para backups atrasados. 
   - Clique em <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> para abrir a interface web do servidor Duplicati
   - Clique em <IIcon2 icon="lucide:download" height="18"/> para coletar logs de backup deste servidor.
- **Nome do backup**: O nome do backup a monitorar para backups atrasados.
- **Próxima execução**: A próxima hora de backup agendada exibida em verde se agendada no futuro, ou em vermelho se atrasada. Passar o mouse sobre o valor "Próxima execução" exibe uma dica de ferramenta mostrando o timestamp do último backup do banco de dados, formatado com data/hora completa e tempo relativo.
- **Monitoramento de Backup**: Ativar ou desativar o monitoramento de backup para este backup.
- **Intervalo de backup esperado**: O intervalo de backup esperado.
- **Unidade**: A unidade do intervalo esperado.
- **Dias permitidos**: Os dias da semana permitidos para o backup.

Se os ícones ao lado do nome do servidor estiverem acinzentados, o servidor não está configurado em [Configurações → Configurações do Servidor](/user-guide/settings/server-settings).

:::note
Quando você coleta logs de backup de um servidor Duplicati, o **duplistatus** atualiza automaticamente os intervalos e configurações de monitoramento de backup.
:::

:::tip
Para obter melhores resultados, colete logs de backup após alterar a configuração de intervalos de trabalho de backup no seu servidor Duplicati. Isso garante que **duplistatus** permaneça sincronizado com sua configuração atual.
:::

## Configurações Globais {#global-configurations}

Estas configurações aplicam-se a todos os backups:

| Setting                         | Description                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Backup Tolerance**            | O período de carência (tempo extra permitido) adicionado ao horário previsto do backup antes de ser marcado como atrasado. O padrão é **1 hora**.                                                                                                                                                                                          |
| **Backup Monitoring Interval** | Com que frequência o sistema verifica backups atrasados. O padrão é **5 minutos**.                                                                                                                                                                                                                                                         |
| **Notification Frequency**      | Com que frequência enviar notificações de atraso: <br/> **Uma vez`: Send **just one** notification when the backup becomes overdue. <br/> `Todos os dias`: Send **daily** notifications while overdue (default). <br/> `Toda semana`: Send **weekly** notifications while overdue. <br/> `Todo mês**: Envie notificações **mensais** enquanto estiver atrasado. |

## Ações Disponíveis {#available-actions}

| Botão                                                              | Descrição                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Salvar Configurações de Monitoramento de Backup" />              | Salva as configurações, limpa temporizadores para qualquer backup desabilitado e executa uma verificação de backup atrasado.                                                |
| <IconButton icon="lucide:import" label="Coletar todos (#)"/>          | Coleta logs de backup de todos os servidores configurados, entre colchetes o número de servidores para coletar.                                   |
| <IconButton icon="lucide:download" label="Baixar CSV"/>           | Baixa um arquivo CSV contendo todas as configurações de monitoramento de backup e o "Timestamp do Último Backup (BD)" do banco de dados.               |
| <IconButton icon="lucide:refresh-cw" label="Verificar agora"/>            | Executa a verificação de backup atrasado imediatamente. Isso é útil após alterar configurações. Também dispara um recálculo de "Próxima execução". |
| <IconButton icon="lucide:timer-reset" label="Redefinir notificações"/> | Redefine a última notificação de backup atrasado enviada para todos os backups.                                                                            |
