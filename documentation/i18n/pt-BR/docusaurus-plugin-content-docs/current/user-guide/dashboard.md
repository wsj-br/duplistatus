# Painel {/* #dashboard */}

## Resumo do Painel {/* #dashboard-summary */}

Esta seção exibe estatísticas agregadas para todos os backups.

![Resumo do painel - visão geral](../assets/screen-dashboard-summary.png)
![Resumo do painel - tabela](../assets/screen-dashboard-summary-table.png)

- **Total de Servidores**: O número de servidores sendo monitorados.                                                                                                             
- **Total de Trabalhos de Backup**: O número total de trabalhos de backup (tipos) configurados para todos os servidores.                                                                                
- **Total de Execuções de Backup**: O número total de logs de backup de execuções recebidas ou coletadas para todos os servidores.                                                                   
- **Tamanho Total de Backup**: O tamanho combinado de todos os dados de origem, com base nos logs de backup mais recentes recebidos.                                                                    
- **Total de Armazenamento Usado**: O espaço total de armazenamento usado por backups no destino de backup (por exemplo, armazenamento em nuvem, servidor FTP, unidade local), com base nos logs de backup mais recentes.                
- **Total de Tamanho Carregado**: A quantidade total de dados carregados do servidor Duplicati para o destino (por exemplo, armazenamento local, FTP, provedor de nuvem).                                       
- **Backups Atrasados** (tabela): O número de backups que estão atrasados. Veja [Configurações de Notificações de Backup](settings/backup-notifications-settings.md)                          
- **Alternar Layout**: Alterna entre o layout de Cartões (padrão) e o layout de Tabela.

:::tip Vendo servidores duplicados?
Se o mesmo servidor aparecer mais de uma vez no painel, use [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers) para consolidá-los. Duplicatas podem ocorrer quando você reinstala ou atualiza o Duplicati, porque o `machine_id` do servidor pode mudar e o **duplistatus** o trata como um novo servidor.
:::

## Filtragem de Servidores {/* #server-filtering */}

Você pode filtrar os servidores e backups exibidos no painel usando o campo de pesquisa na barra de ferramentas do aplicativo. Clique no ícone de filtro <IconButton icon="lucide:search" /> para revelar o campo de pesquisa.

**Correspondências de Filtro:**
- ID do Servidor
- URL do Servidor
- Nomes de trabalhos de backup

**Escopo:**
- Filtra ambas as visualizações de cartão e tabela no painel
- O estado da sessão é mantido via o Provedor de Filtro de Servidor do Painel
- Limpa quando você atualiza ou sai do painel

Isso facilita a localização rápida de servidores ou backups específicos entre muitos sistemas monitorados.

## Layout de Cartões {/* #cards-layout */}

O layout de cartões mostra o status do log de backup mais recente recebido para cada backup.

![Layout de cartões](../assets/duplistatus_dash-cards.svg)

- **Nome do Servidor**: Nome do servidor Duplicati (ou o alias)
  - Passe o mouse sobre o **Nome do Servidor** para mostrar o nome do servidor e a nota
- **Status Geral**: O status do servidor. Backups atrasados serão mostrados como um status de **Aviso**
- **Versão**: A versão do Duplicati do log de backup mais recente, mostrada à esquerda do indicador de status. Veja [Versão do Servidor Duplicati](#duplicati-server-version).
- **Informações resumidas**: O número consolidado de arquivos, tamanho e armazenamento usado para todos os backups deste servidor. Também mostra o tempo decorrido do backup mais recente recebido (passe o mouse para mostrar o timestamp)
- **Lista de backups**: Uma tabela com todos os backups configurados para este servidor, com 3 colunas:
  - **Nome do Backup**: Nome do backup no servidor Duplicati
  - **Histórico de status**: Status dos últimos 10 backups recebidos.
  - **Último backup recebido**: O tempo decorrido desde o horário atual do último log recebido. Ele mostrará um ícone de aviso se o backup estiver atrasado.
    - O tempo é mostrado em formato abreviado: `m` para minutos, `h` para horas, `d` para dias, `w` para semanas, `mo` para meses, `y` para anos.

A ordem de classificação dos cartões e outras configurações podem ser definidas nas [Configurações de Exibição](settings/display-settings.md).

A visualização do painel oferece duas exibições informativas, acessíveis clicando no botão superior direito no painel lateral:

- Status: Mostrar estatísticas dos trabalhos de backup por status, com uma lista de backups atrasados e trabalhos de backup com status de avisos/erros.

![painel de status](../assets/screen-overview-side-status.png)

- Métricas: Mostrar gráficos com duração, tamanho do arquivo e tamanho do armazenamento ao longo do tempo para o servidor agregado ou selecionado.

![painel de gráficos](../assets/screen-overview-side-charts.png)

### Detalhes do Backup {/* #backup-details */}

Passe o mouse sobre um backup na lista para exibir detalhes do último registro de backup recebido e quaisquer informações de atraso.

![Detalhes do atraso](../assets/screen-backup-tooltip.png)

- **Nome do Servidor : Backup**: O nome ou alias do servidor Duplicati e do backup, também mostrará o nome do servidor e a nota.
  - O alias e a nota podem ser configurados em [Configurações → Configurações do Servidor](settings/server-settings.md).
- **Notificação**: Um ícone mostrando a [configuração de notificação](#notifications-icons) para novos registros de backup.
- **Data**: O timestamp do backup e o tempo decorrido desde a última atualização da tela.
- **Status**: O status do último backup recebido (Sucesso, Aviso, Erro, Fatal).
- **Duração, Número de Arquivos, Tamanho do Arquivo, Tamanho do Armazenamento, Tamanho Enviado**: Valores conforme relatados pelo servidor Duplicati.
- **Versões Disponíveis**: O número de versões de backup armazenadas no destino do backup no momento do backup.

Se este backup estiver atrasado, a dica de ferramenta também mostrará:

- **Backup Esperado**: O horário em que o backup era esperado, incluindo o período de graça configurado (tempo extra permitido antes de ser marcado como atrasado).

Você também pode clicar nos botões na parte inferior para abrir [Configurações → Notificações de Backup](settings/backup-notifications-settings.md) para configurar as configurações de monitoramento ou abrir a interface web do servidor Duplicati.

## Layout da Tabela {/* #table-layout */}

O layout da tabela lista os registros de backup mais recentes recebidos para todos os servidores e backups.

![Modo de Tabela do Painel](../assets/screen-main-dashboard-table-mode.png)

- **Nome do Servidor**: O nome do servidor Duplicati (ou alias)
  - Abaixo do nome está a nota do servidor
- **Nome do Backup**: O nome do backup no servidor Duplicati.
- **Versão**: A versão do Duplicati do último registro de backup para aquele trabalho de backup. Veja [Versão do Servidor Duplicati](#duplicati-server-version).
- **Versões Disponíveis**: O número de versões de backup armazenadas no destino do backup. Se o ícone estiver desativado, informações detalhadas não foram recebidas no registro. Veja as [instruções de Configuração do Duplicati](../installation/duplicati-server-configuration.md) para detalhes.
- **Contagem de Backups**: O número de backups relatados pelo servidor Duplicati.
- **Data do Último Backup**: O timestamp do último registro de backup recebido e o tempo decorrido desde a última atualização da tela.
- **Status do Último Backup**: O status do último backup recebido (Sucesso, Aviso, Erro, Fatal).
- **Duração**: A duração do backup em HH:MM:SS.
- **Avisos/Erros**: O número de avisos e erros relatados no registro de backup, mostrado como `warnings/errors` (por exemplo `0/0`).
- **Configurações**:
  - **Notificação**: Um ícone mostrando a configuração de notificação para novos registros de backup.
  - **Configuração do Duplicati**: Um botão para abrir a interface web do servidor Duplicati

Você pode usar as [Configurações de Exibição](settings/display-settings.md) para configurar o tamanho da tabela e outras configurações.

### Ícones de Notificações {/* #notifications-icons */}

| Ícone                                                                                                                               | Opção de Notificação | Descrição                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Desativado                 | Nenhuma notificação será enviada quando um novo log de backup for recebido                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Todos                 | Notificações serão enviadas para cada novo log de backup, independentemente do seu status.                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Avisos            | Notificações serão enviadas apenas para logs de backup com status de Aviso, Desconhecido, Erro ou Fatal. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Erros              | Notificações serão enviadas apenas para logs de backup com status de Erro ou Fatal.                    |

:::note
Esta configuração de notificação aplica-se apenas quando o **duplistatus** recebe um novo log de backup de um servidor Duplicati. Notificações de atraso são configuradas separadamente e serão enviadas independentemente desta configuração.
:::

### Detalhes do Atraso {/* #overdue-details */}

Passe o mouse sobre o ícone de aviso de atraso para exibir detalhes sobre o backup atrasado.

![Detalhes do atraso](../assets/screen-overdue-backup-hover-card.png)

- **Verificado**: Quando a última verificação de atraso foi realizada. Configure a frequência em [Configurações de Notificações de Backup](settings/backup-notifications-settings.md).
- **Último Backup**: Quando o último log de backup foi recebido.
- **Backup Esperado**: O horário em que o backup era esperado, incluindo o tempo de tolerância configurado (tempo extra permitido antes de marcar como atrasado).
- **Última Notificação**: Quando a última notificação de atraso foi enviada.

## Versão do Servidor Duplicati {/* #duplicati-server-version */}

O painel exibe a versão do Duplicati relatada no último log de backup para cada servidor (visualização em cartão) ou trabalho de backup (visualização em tabela).

- **Onde aparece**: À esquerda do indicador de status nos cards, e na coluna **Versão** na tabela (após **Atrasado / Próxima execução**). Você pode ocultar o badge do card nas [Configurações de Exibição](settings/display-settings.md) ou [Versões do Duplicati](settings/duplicati-versions.md). A coluna da tabela sempre permanece visível.
- **Cor**: Texto cinza significa que a versão corresponde à versão mais recente para esse canal (ou a comparação está indisponível). Amarelo de aviso significa que a versão é mais antiga que a versão mais recente para esse canal.
- **Dica de ferramenta**: Passe o mouse ou clique no número da versão para ver o canal de atualização (`stable`, `beta`, `experimental`, ou `canary`), a versão do servidor, e a versão mais recente disponível para esse canal.

**duplistatus** compara a versão do log de backup com as versões mais recentes do Duplicati publicadas no GitHub. Os administradores podem visualizar as versões do canal em cache e configurar o intervalo de verificação e o horário de início em [Configurações → Versões do Duplicati](settings/duplicati-versions.md). O cache também é atualizado na inicialização quando ele é mais antigo do que o intervalo selecionado. Atualizações bem-sucedidas e falhas do GitHub são registradas no [log de auditoria](settings/audit-logs-viewer.md) como `duplicati_version_refresh` (iniciado por `startup`, `cron`, ou `manual`).

:::important
**duplistatus** não consulta o servidor Duplicati para a versão que está sendo executada. Ele usa a versão armazenada no último log de backup que foi recebido ou [coletado](collect-backup-logs.md). Após atualizar o Duplicati, o painel continua mostrando a versão anterior até que um novo log de backup chegue.
:::

### Versões de Backup Disponíveis {/* #available-backup-versions */}

Clicar no ícone de relógio azul abre uma lista de versões de backup disponíveis no momento do backup, conforme relatado pelo servidor Duplicati.

![Versões disponíveis](../assets/screen-available-backups-modal.png)

- **Detalhes do Backup**: Mostra o nome do servidor e o alias, a nota do servidor, o nome do backup e quando o backup foi executado.
- **Detalhes da Versão**: Mostra o número da versão, a data de criação e a idade.

:::note
Se o ícone estiver desativado, significa que nenhuma informação detalhada foi recebida nos logs de mensagens.
Consulte as [instruções de Configuração do Duplicati](../installation/duplicati-server-configuration.md) para obter detalhes.
:::
