# Painel {#dashboard}

## Painel Resumido {#dashboard-summary}

Esta seção exibe estatísticas agregadas para todos os backups.

![Resumo do painel - visão geral](../assets/screen-dashboard-summary.png)
![Resumo do painel - tabela](../assets/screen-dashboard-summary-table.png)

- **Total de Servidores**: O número de servidores que estão sendo monitorados.                                                                                                             
- **Total de Tarefas de Backup**: O número total de tarefas de backup (tipos) configuradas para todos os servidores.                                                                                
- **Total de Execuções de Backup**: O número total de registros de execuções de backup recebidos ou coletados para todos os servidores.                                                                   
- **Tamanho Total de Backup**: O tamanho combinado de todos os dados de origem, com base nos últimos registros de backup recebidos.                                                                    
- **Armazenamento Total Utilizado**: O espaço total de armazenamento usado pelos backups no destino do backup (por exemplo, armazenamento em nuvem, servidor FTP, unidade local), com base nos últimos registros de backup recebidos. 
- **Tamanho Total Enviado**: A quantidade total de dados enviados do servidor Duplicati para o destino (por exemplo, armazenamento local, FTP, provedor de nuvem).                       
- **Backups Atrasados** (tabela): O número de backups que estão atrasados. Veja [Configurações de Notificações de Backup](settings/backup-notifications-settings.md)                          
- **Alternar Layout**: Alterna entre o layout de Cartões (padrão) e o layout de Tabela.

:::tip Está vendo servidores duplicados?
Se o mesmo servidor aparecer mais de uma vez no painel, use [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers) para consolidá-los. Duplicatas podem ocorrer quando você reinstala ou atualiza o Duplicati, porque o `machine_id` do servidor pode mudar e o **duplistatus** então o trata como um novo servidor.
:::

## Filtragem de Servidores {#server-filtering}

Você pode filtrar os servidores e backups exibidos no painel usando o campo de pesquisa na barra de ferramentas do aplicativo. Clique no ícone de filtro <IconButton icon="lucide:search" /> para revelar o campo de pesquisa.

**Correspondências de Filtro:**
- ID do Servidor
- URL do Servidor
- Nomes de trabalhos de backup

**Escopo:**
- Filtra visualizações de cartão e tabela no painel
- Estado da sessão mantido pelo Provedor de Filtro de Servidor do Painel
- Limpa quando você atualiza ou sai do painel

Isso facilita a localização rápida de servidores ou backups específicos entre vários sistemas monitorados.

## Layout de Cartões {#cards-layout}

O layout de cards mostra o status do log de backup mais recente recebido para cada backup.

![Layout de cartão](../assets/duplistatus_dash-cards.svg)

- **Nome do Servidor**: Nome do servidor Duplicati (ou o Alias)
  - Ao passar o mouse sobre o **Nome do Servidor**, o nome do servidor e a nota serão exibidos
- **Status Geral**: O status do servidor. Backups atrasados serão exibidos com o status de **Aviso**
- **Versão**: A versão do Duplicati do log de backup mais recente, exibida à esquerda do indicador de status. Veja [Duplicati Server Version](#duplicati-server-version).
- **Informações de resumo**: O número consolidado de arquivos, o tamanho e o Arm. usado para todos os backups deste servidor. Também mostra o tempo decorrido do backup mais recente recebido (passe o mouse para mostrar o Timestamp)
- **Lista de backups**: Uma tabela com todos os backups configurados para este servidor, com 3 colunas:
  - **Nome do Backup**: Nome do backup no servidor Duplicati
  - **Histórico de status**: Status dos últimos 10 backups recebidos.
  - **Último backup recebido**: O tempo decorrido desde o horário atual do último log recebido. Um ícone de aviso será exibido se o backup estiver atrasado.
    - O tempo é exibido em formato abreviado: `m` para minutos, `h` para horas, `d` para dias, `w` para semanas, `mo` para meses, `y` para anos.

A ordem de classificação dos cartões e outras configurações podem ser definidas em [Configurações de exibição](settings/display-settings.md).

A visualização do painel oferece duas exibições informacionais, acessíveis clicando no botão superior direito no painel lateral:

- Status: Mostrar Estatísticas dos trabalhos de backup por Status, com uma lista de Backups atrasados e trabalhos de backup com status de Avisos/Erros.

![painel de status](../assets/screen-overview-side-status.png)

- Métricas: Mostrar gráficos com duração, tamanho dos arquivos e tamanho de armazenamento ao longo do tempo para o servidor agregado ou selecionado.

![painel de gráficos](../assets/screen-overview-side-charts.png)

### Detalhes do backup {#backup-details}

Passar o mouse sobre um backup na lista exibe detalhes do último log de backup recebido e qualquer informação de atraso.

![Detalhes do Atraso](../assets/screen-backup-tooltip.png)

- **Nome do Servidor : Backup**: O nome ou apelido do servidor Duplicati e do backup, também mostrará o nome do servidor e a anotação.
  - O apelido e a anotação podem ser configurados em [Configurações → Configurações do Servidor](settings/server-settings.md).
- **Notificações**: Um ícone que mostra a [configuração de notificação](#notifications-icons) para novos registros de backup.
- **Data**: A data e hora do backup e o tempo decorrido desde a última atualização da tela.
- **Status**: O status do último backup recebido (Sucesso, Aviso, Erro, Grave).
- **Duração, Contagem de Arquivos, Tamanho do Arquivo, Tamanho do Armazenamento, Tamanho Enviado**: Valores informados pelo servidor Duplicati.
- **Versões Disponíveis**: O número de versões de backup armazenadas no destino do backup no momento do backup.

Se este backup está atrasado, a dica de ferramenta também mostra:

- **Backup Esperado**: A hora em que o backup era esperado, incluindo o período de tolerância configurado (tempo extra permitido antes de marcar como atrasado).

Você também pode clicar nos botões na parte inferior para abrir [Configurações → Notificações de backup](settings/backup-notifications-settings.md) para configurar as configurações de monitoramento ou abrir a interface web do servidor Duplicati.

## Layout de Tabela {#table-layout}

O layout da tabela lista os logs de backup mais recentes recebidos para todos os servidores e backups.

![Modo de Tabela do Dashboard](../assets/screen-main-dashboard-table-mode.png)

- **Nome do Servidor**: O nome do servidor Duplicati (ou Alias)
  - Abaixo do nome está a nota do servidor
- **Nome do Backup**: O nome do backup no servidor Duplicati.
- **Versão**: A versão do Duplicati do log de backup mais recente para aquele job de backup. Veja [Duplicati Server Version](#duplicati-server-version).
- **Versões Disponíveis**: O número de versões de backup armazenadas no destino do backup. Se o ícone estiver cinza, as informações detalhadas não foram recebidas no log. Veja as [instruções de Configuração do Duplicati](../installation/duplicati-server-configuration.md) para detalhes.
- **Contagem de Backups**: O número de backups relatados pelo servidor Duplicati.
- **Data do Último Backup**: O Timestamp do último log de backup recebido e o tempo decorrido desde a última atualização de tela.
- **Status do Último Backup**: O status do último backup recebido (Sucesso, Aviso, Erro, Fatal).
- **Duração**: A duração do backup em HH:MM:SS.
- **Avisos/Erros**: O número de avisos e erros relatados no log de backup, exibido como `warnings/errors` (por exemplo, `0/0`).
- **Configurações**:
  - **Notificação**: Um ícone mostrando a configuração de notificação configurada para novos logs de backup.
  - **Configuração do Duplicati**: Um botão para abrir a interface web do servidor Duplicati

Você pode usar [Configurações de exibição](settings/display-settings.md) para configurar o tamanho da tabela e outras configurações.

### Ícones de Notificações {#notifications-icons}

| Ícone                                                                                                                               | Opção de Notificação | Descrição                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Desligado                 | Nenhuma notificação será enviada quando um novo log de backup for recebido                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Todos                 | Notificações serão enviadas para cada novo log de backup, independentemente do seu status.                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Avisos            | Notificações serão enviadas somente para logs de backup com status de Aviso, Desconhecido, Erro ou Grave. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Erros              | Notificações serão enviadas somente para logs de backup com status de Erro ou Grave.                    |

:::note
Esta configuração de notificação se aplica apenas quando **duplistatus** recebe um novo log de backup de um servidor Duplicati. As notificações de atraso são configuradas separadamente e serão enviadas independentemente desta configuração.
:::

### Detalhes de atrasos {#overdue-details}

Passar o mouse sobre o ícone de aviso de backup atrasado exibe detalhes sobre o backup atrasado.

![Detalhes do Atraso](../assets/screen-overdue-backup-hover-card.png)

- **Verificado**: Quando a última verificação de backup atrasado foi realizada. Configure a frequência em [Configurações de Notificações de Backup](settings/backup-notifications-settings.md).
- **Último backup**: Quando o último log de backup foi recebido.
- **Backup esperado**: A hora em que o backup era esperado, incluindo o período de tolerância configurado (tempo extra permitido antes de marcar como atrasado).
- **Última notificação**: Quando a última notificação de backup atrasado foi enviada.

## Duplicati Server Version {#duplicati-server-version}

O dashboard mostra a versão do Duplicati relatada no último log de backup para cada servidor (visualização em cartão) ou job de backup (visualização em tabela).

- **Onde aparece**: À esquerda do indicador de status nos cards, e na coluna **Versão** na tabela (após **Atrasado / Próxima execução**). Você pode ocultar o badge do card nas [Configurações de Exibição](settings/display-settings.md) ou [Versões do Duplicati](settings/duplicati-versions.md). A coluna da tabela sempre permanece visível.
- **Cor**: Texto desbotado significa que a versão corresponde à versão mais recente para esse canal (ou a comparação está indisponível). Amarelo de aviso significa que a versão é mais antiga que a versão mais recente para esse canal.
- **Dica de ferramenta**: Passe o mouse ou clique no número da versão para ver o canal de atualização (`stable`, `beta`, `experimental`, ou `canary`), a versão do servidor e a versão mais recente disponível para esse canal.

**duplistatus** compara a versão do log de backup com as versões mais recentes do Duplicati publicadas no GitHub. Administradores podem visualizar as versões de canal em cache e configurar o intervalo de verificação e a hora de início em [Configurações → Versões do Duplicati](settings/duplicati-versions.md). O cache também é atualizado na inicialização quando ele é mais antigo que o intervalo selecionado. Atualizações bem-sucedidas e falhas do GitHub são registradas no [log de auditoria](settings/audit-logs-viewer.md) como `duplicati_version_refresh` (iniciado por `startup`, `cron`, ou `manual`).

:::important
O **duplistatus** não consulta o servidor Duplicati para saber a versão que está sendo executada no momento. Ele usa a versão armazenada no último log de backup que foi recebido ou [Coletado](collect-backup-logs.md). Após você atualizar o Duplicati, o dashboard continuará mostrando a versão anterior até que um novo log de backup chegue.
:::

### Versões de backup disponíveis {#available-backup-versions}

Clicar no ícone de relógio azul abre uma lista de versões de backup disponíveis no momento do backup, conforme relatado pelo servidor Duplicati.

![Versões disponíveis](../assets/screen-available-backups-modal.png)

- **Detalhes do backup**: Mostra o nome do servidor e alias, nota do servidor, nome do backup e quando o backup foi executado.
- **Detalhes da versão**: Mostra o número da versão, data de criação e idade.

:::note
Se o ícone estiver acinzentado, significa que nenhuma informação detalhada foi recebida nos logs de mensagens.
Consulte as [instruções de Configuração do Duplicati](../installation/duplicati-server-configuration.md) para obter detalhes.
:::
