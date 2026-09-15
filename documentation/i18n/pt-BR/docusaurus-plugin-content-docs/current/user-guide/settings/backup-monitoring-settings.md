# Monitoramento de Backup {/* #backup-monitoring */}

![Alertas de backup](../../assets/screen-settings-monitoring.png)

## Filtragem de Servidores {/* #server-filtering */}

A lista de servidores nesta página pode ser filtrada usando o campo de filtro.

Quando **Resumo Diário** está ativado, a detecção de atrasos continua, mas o e-mail de atraso para o destinatário padrão de E-mail é suprimido. Destinos de e-mail adicionais continuam para eventos correspondentes (atrasos contam como um Aviso). Veja [Resumo Diário](daily-summary-settings.md).

**Correspondências de Filtro:**
- ID do Servidor
- URL do Servidor
- Nomes de trabalhos de backup

Isso facilita a localização rápida de servidores ou backups específicos nas configurações de monitoramento quando você gerencia muitos sistemas.

## Configurar Configurações de Monitoramento por Backup {/* #configure-per-backup-monitoring-settings */}

-  **Nome do Servidor**: O nome do servidor a ser monitorado para backups atrasados. 
   - Clique em <SvgIcon svgFilename="duplicati_logo.svg" height="18"/> para abrir a interface web do servidor Duplicati
   - Clique em <IIcon2 icon="lucide:download" height="18"/> para coletar logs de backup deste servidor.
- **Nome do Backup**: O nome do backup a ser monitorado para backups atrasados.
- **Próxima Execução**: O próximo horário de backup agendado exibido em verde se agendado no futuro, ou em vermelho se atrasado. Passe o mouse sobre o valor "Próxima Execução" para exibir uma dica de ferramenta mostrando o timestamp do último backup do banco de dados, formatado com data/hora completa e tempo relativo.
- **Monitoramento de Backup**: Ative ou desative o monitoramento de backup para este backup.
- **Intervalo de Backup Esperado**: O intervalo de backup esperado.
- **Unidade**: A unidade do intervalo esperado.
- **Dias Permitidos**: Os dias da semana permitidos para o backup.

Se os ícones ao lado do nome do servidor estiverem desativados, o servidor não está configurado em [Configurações → Configurações do Servidor](/user-guide/settings/server-settings).

:::note
Quando você coleta logs de backup de um servidor Duplicati, **duplistatus** atualiza automaticamente os intervalos e configurações de monitoramento de backup.
:::

:::tip
Para melhores resultados, colete logs de backup após alterar a configuração de intervalos de trabalho de backup no seu servidor Duplicati. Isso garante que o **duplistatus** fique sincronizado com sua configuração atual.
:::

## Configurações Globais {/* #global-configurations */}

Essas configurações se aplicam a todos os backups:

| Configuração                    | Descrição                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Tolerância de Backup**         | O período de tolerância (tempo extra permitido) adicionado ao tempo de backup esperado antes de marcar como atrasado. O padrão é **1 hora**.                                                                                                                                                                                                             |
| **Intervalo de Monitoramento de Backup** | Com que frequência o sistema verifica backups atrasados. O padrão é **5 minutos**.                                                                                                                                                                                                                                                            |
| **Frequência de Notificação**   | Com que frequência enviar notificações de atraso: <br/> **Uma vez`: Send **just one** notification when the backup becomes overdue. <br/> `Todos os dias`: Send **daily** notifications while overdue (default). <br/> `Toda semana`: Send **weekly** notifications while overdue. <br/> `Todo mês**: Enviar notificações **mensais** enquanto estiver atrasado. |

## Ações Disponíveis {/* #available-actions */}

| Botão                                                               | Descrição                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Salvar Configurações de Monitoramento de Backup" />              | Salva as configurações, limpa os temporizadores para quaisquer backups desativados e executa uma verificação de backups atrasados.                                                |
| <IconButton icon="lucide:import" label="Coletar Tudo (#)"/>          | Coleta logs de backup de todos os servidores configurados, entre colchetes o número de servidores para coletar.                                   |
| <IconButton icon="lucide:download" label="Baixar CSV"/>           | Baixa um arquivo CSV contendo todas as configurações de monitoramento de backup e o "Timestamp do Último Backup (DB)" do banco de dados.               |
| <IconButton icon="lucide:refresh-cw" label="Verificar agora"/>            | Executa a verificação de backups atrasados imediatamente. Isso é útil após alterar configurações. Também aciona um recálculo de "Próxima Execução". |
| <IconButton icon="lucide:timer-reset" label="Redefinir notificações"/> | Redefine a última notificação de atraso enviada para todos os backups.                                                                            |
