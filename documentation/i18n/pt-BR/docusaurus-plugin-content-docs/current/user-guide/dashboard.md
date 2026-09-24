# Painel {/* #dashboard */}

## Resumo do Painel {/* #dashboard-summary */}

Esta seção exibe estatísticas agregadas dos servidores que o usuário conectado pode ver. Os administradores veem todos os servidores. Um usuário não administrador vê todos os servidores, a menos que um administrador limite essa conta em [Usuários](settings/user-management-settings.md#server-visibility).

![Resumo do painel - visão geral](../assets/screen-dashboard-summary.png)
![Resumo do painel - tabela](../assets/screen-dashboard-summary-table.png)

- **Total de Servidores**: O número de servidores sendo monitorados.                                                                                                             
- **Total de Trabalhos de Backup**: O número total de trabalhos de backup (tipos) configurados para todos os servidores.                                                                                
- **Total de Execuções de Backup**: O número total de logs de backup das execuções recebidos ou coletados para todos os servidores.                                                                   
- **Tamanho Total de Backup**: O tamanho combinado de todos os dados de origem, com base nos logs de backup mais recentes recebidos.                                                                    
- **Total de Armazenamento Usado**: O espaço total de armazenamento usado pelos backups no destino de backup (por exemplo, armazenamento em nuvem, servidor FTP, unidade local), com base nos logs de backup mais recentes.                
- **Total de Tamanho Carregado**: A quantidade total de dados carregados do servidor Duplicati para o destino (por exemplo, armazenamento local, FTP, provedor de nuvem).                                       
- **Backups Atrasados** (tabela): O número de backups que estão atrasados. Veja [Configurações de Notificações de Backup](settings/backup-notifications-settings.md)                          
- **Alternância de Layout**: Alterna entre o layout de Cartões (padrão) e o layout de Tabela.

:::tip Vendo servidores duplicados?
Se o mesmo servidor aparecer mais de uma vez no painel, utilize [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers) para consolidá-los. Duplicatas podem ocorrer quando você reinstala ou atualiza o Duplicati, porque o `machine_id` do servidor pode mudar e o **duplistatus** então o trata como um novo servidor.
:::

## Filtragem de Servidores {/* #server-filtering */}

Você pode filtrar os servidores e backups exibidos no painel usando o campo de pesquisa na barra de ferramentas do aplicativo. Clique no ícone de filtro <IconButton icon="lucide:search" /> para revelar o campo de pesquisa.

**Correspondências de Filtro:**
- ID do Servidor
- URL do Servidor
- Nomes dos trabalhos de backup

**Escopo:**
- Filtra tanto as visualizações em cartões quanto em tabela no painel
- O estado da sessão é mantido através do Provedor de Filtro de Servidor do Painel
- Limpa quando você atualiza ou sai do painel

Isso facilita localizar rapidamente servidores ou backups específicos entre muitos sistemas monitorados.

## Layout de Cartões {/* #cards-layout */}

O layout de cartões mostra o status do log de backup mais recente recebido para cada backup.

![Layout de cartões](../assets/duplistatus_dash-cards.svg)

- **Nome do Servidor**: Nome do servidor Duplicati (ou o alias)
  - Passar o mouse sobre o **Nome do Servidor** mostrará o nome do servidor e a nota
- **Status Geral**: O status do servidor. Backups atrasados serão mostrados com status de **Aviso**
- **Versão**: A versão do Duplicati do log de backup mais recente, mostrada à esquerda do indicador de status. Veja [Versão do Servidor Duplicati](#duplicati-server-version).
- **Informações de resumo**: O número consolidado de arquivos, tamanho e armazenamento usado para todos os backups deste servidor. Também mostra o tempo decorrido do backup mais recente recebido (passe o mouse para mostrar o timestamp)
- **Lista de backups**: Uma tabela com todos os backups configurados para este servidor, com 3 colunas:
  - **Nome do Backup**: Nome do backup no servidor Duplicati
  - **Histórico de Status**: Status dos últimos 10 backups recebidos.
  - **Último backup recebido**: O tempo decorrido desde a hora atual do último log recebido. Mostrará um ícone de aviso se o backup estiver atrasado.
    - O tempo é mostrado em formato abreviado: `m` para minutos, `h` para horas, `d` para dias, `w` para semanas, `mo` para meses, `y` para anos.

A ordem de classificação dos cartões e outras configurações podem ser definidas nas [Configurações de Exibição](settings/display-settings.md).

A visualização em painel oferece duas exibições informativas, acessíveis clicando no botão superior direito no painel lateral:

- Status: Mostra estatísticas dos trabalhos de backup por status, com uma lista de backups atrasados e trabalhos de backup com status de avisos/erros.

![painel de status](../assets/screen-overview-side-status.png)

- Métricas: Mostra gráficos com duração, tamanho de arquivo e tamanho de armazenamento ao longo do tempo para o servidor agregado ou selecionado.

![painel de gráficos](../assets/screen-overview-side-charts.png)

### Detalhes de Backup {/* #backup-details */}

Passar o mouse sobre um backup na lista exibe detalhes do último log de backup recebido e qualquer informação de atraso.

![Detalhes do atraso](../assets/screen-backup-tooltip.png)

- **Nome do Servidor : Backup**: O nome ou alias do servidor Duplicati e backup, também mostrará o nome do servidor e a nota.
  - O alias e a nota podem ser configurados em [Configurações → Configurações do Servidor](settings/server-settings.md).
- **Notificação**: Um ícone mostrando a configuração de [notificação configurada](#notifications-icons) para novos logs de backup.
- **Data**: O timestamp do backup e o tempo decorrido desde a última atualização da tela.
- **Status**: O status do último backup recebido (Sucesso, Aviso, Erro, Fatal).
- **Duração, Número de Arquivos, Tamanho do Arquivo, Tamanho do Armazenamento, Tamanho Enviado**: Valores conforme relatados pelo servidor Duplicati.
- **Versões Disponíveis**: O número de versões de backup armazenadas no destino do backup no momento do backup.

Se este backup estiver atrasado, a dica também mostrará:

- **Backup Esperado**: A hora em que o backup era esperado, incluindo o período de carência configurado (tempo extra permitido antes de marcar como atrasado).

Você também pode clicar nos botões na parte inferior para abrir [Configurações → Notificações de Backup](settings/backup-notifications-settings.md) para configurar as configurações de monitoramento ou abrir a interface web do servidor Duplicati.

## Layout da Tabela {/* #table-layout */}

O layout da tabela lista os logs de backup mais recentes recebidos para todos os servidores e backups.

![Modo Tabela do Dashboard](../assets/screen-main-dashboard-table-mode.png)

- **Nome do Servidor**: O nome do servidor Duplicati (ou alias)
  - Abaixo do nome está a nota do servidor
- **Nome do Backup**: O nome do backup no servidor Duplicati.
- **Versão**: A versão do Duplicati do último log de backup para esse trabalho de backup. Veja [Versão do Servidor Duplicati](#duplicati-server-version).
- **Versões Disponíveis**: O número de versões de backup armazenadas no destino do backup. Se o ícone estiver cinza, informações detalhadas não foram recebidas no log. Consulte as [instruções de configuração do Duplicati](../installation/duplicati-server-configuration.md) para obter detalhes.
- **Contagem de Backups**: O número de backups relatados pelo servidor Duplicati.
- **Data do Último Backup**: O timestamp do último log de backup recebido e o tempo decorrido desde a última atualização da tela.
- **Status do Último Backup**: O status do último backup recebido (Sucesso, Aviso, Erro, Fatal).
- **Duração**: A duração do backup em HH:MM:SS.
- **Avisos/Erros**: O número de avisos e erros relatados no log de backup, mostrados como `warnings/errors` (por exemplo, `0/0`).
- **Configurações**:
  - **Notificação**: Um ícone mostrando a configuração de notificação definida para novos logs de backup.
  - **Configuração do Duplicati**: Um botão para abrir a interface web do servidor Duplicati

Você pode usar as [Configurações de Exibição](settings/display-settings.md) para configurar o tamanho da tabela e outras configurações.

### Ícones de Notificações {/* #notifications-icons */}

| Ícone                                                                                                                               | Opção de Notificação | Descrição                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Desativado                 | Nenhuma notificação será enviada quando um novo log de backup for recebido                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Todos                 | As notificações serão enviadas para cada novo log de backup, independentemente do seu status.                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Avisos              | As notificações serão enviadas apenas para logs de backup com status de Aviso, Desconhecido, Erro ou Fatal. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Erros               | As notificações serão enviadas apenas para logs de backup com status de Erro ou Fatal.                   |

:::note
Esta configuração de notificação aplica-se somente quando o **duplistatus** recebe um novo log de backup de um servidor Duplicati. As notificações de atraso são configuradas separadamente e serão enviadas independentemente desta configuração.
:::

### Detalhes do Atraso {/* #overdue-details */}

Passar o mouse sobre o ícone de aviso de atraso exibe detalhes sobre o backup atrasado.

![Detalhes do atraso](../assets/screen-overdue-backup-hover-card.png)

- **Verificado**: Quando foi realizada a última verificação de atraso. Configure a frequência em [Configurações de Notificações de Backup](settings/backup-notifications-settings.md).
- **Último Backup**: Quando o último log de backup foi recebido.
- **Backup Esperado**: O horário em que o backup era esperado, incluindo o período de carência configurado (tempo adicional permitido antes de marcar como atrasado).
- **Última Notificação**: Quando a última notificação de atraso foi enviada.

## Versão do Servidor Duplicati {/* #duplicati-server-version */}

O painel mostra a versão do Duplicati relatada no log de backup mais recente para cada servidor (visualização em cartões) ou trabalho de backup (visualização em tabela).

- **Onde aparece**: À esquerda do indicador de status nos cartões e na coluna **Versão** na tabela (após **Atrasado / Próxima execução**). Você pode ocultar o selo do cartão em [Configurações de Exibição](settings/display-settings.md) ou [Versões do Duplicati](settings/duplicati-versions.md). A coluna da tabela sempre permanece visível.
- **Cor**: Texto cinza significa que a versão corresponde à última versão lançada para esse canal (ou a comparação está indisponível). Amarelo de aviso significa que a versão é mais antiga que a última versão lançada para esse canal.
- **Dica de ferramenta**: Passe o mouse ou clique no número da versão para ver o canal de atualização (`stable`, `beta`, `experimental` ou `canary`), a versão do servidor e a última versão disponível para esse canal.

**duplistatus** compara a versão do log de backup com os últimos lançamentos do Duplicati publicados no GitHub. Os administradores podem visualizar as versões dos canais armazenadas em cache e configurar o intervalo de verificação e a hora de início em [Configurações → Versões do Duplicati](settings/duplicati-versions.md). O cache também é atualizado na inicialização quando ele é mais antigo que o intervalo selecionado. Atualizações bem-sucedidas e falhas do GitHub são registradas no [log de auditoria](settings/audit-logs-viewer.md) como `duplicati_version_refresh` (iniciado por `startup`, `cron` ou `manual`).

:::important
O **duplistatus** não consulta o servidor Duplicati pela versão que está atualmente em execução. Ele usa a versão armazenada no último log de backup recebido ou [coletado](collect-backup-logs.md). Após você atualizar o Duplicati, o painel continua mostrando a versão anterior até que um novo log de backup chegue.
:::

### Versões de Backup Disponíveis {/* #available-backup-versions */}

Clicar no ícone azul do relógio abre uma lista das versões de backup disponíveis no momento do backup, conforme relatado pelo servidor Duplicati.

![Versões disponíveis](../assets/screen-available-backups-modal.png)

- **Detalhes do Backup**: Mostra o nome do servidor e alias, nota do servidor, nome do backup e quando o backup foi executado.
- **Detalhes da Versão**: Mostra o número da versão, data de criação e idade.

:::note
Se o ícone estiver acinzentado, significa que nenhuma informação detalhada foi recebida nos logs de mensagem.
Consulte as [instruções de Configuração do Duplicati](../installation/duplicati-server-configuration.md) para obter detalhes.
:::
