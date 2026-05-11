---
translation_last_updated: '2026-05-11T14:27:47.014Z'
source_file_mtime: '2026-05-10T19:03:27.501Z'
source_file_hash: 6e8a3cb53bff96ec8defba9ae5c4fd654bfcf4c5249b42c64faab1e60cc2bc68
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/server-details.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Detalhes do Servidor {#server-details}

Clicar em um servidor do painel abre uma página com uma lista de backups para esse servidor. Você pode visualizar todos os backups ou selecionar um específico se o servidor tiver múltiplos backups configurados.

![Server Details](../assets/screen-server-backup-list.png)

## Estatísticas do Servidor/Backup {#serverbackup-statistics}

Esta seção mostra estatísticas para todos os backups no servidor ou um backup único selecionado.

- **TOTAL DE TAREFAS DE BACKUP**: Número total de tarefas de backup configuradas neste servidor.
- **TOTAL DE EXECUÇÕES DE BACKUP**: Número total de execuções de backup realizadas (conforme informado pelo servidor Duplicati).
- **VERSÕES DISPONÍVEIS**: Número de versões disponíveis (conforme informado pelo servidor Duplicati).
- **DURAÇÃO MÉDIA**: Duração média (média aritmética) dos backups registrados no banco de dados **duplistatus**.
- **TAMANHO DO ÚLTIMO BACKUP**: Tamanho dos arquivos de origem do último log de backup recebido.
- **ARMazenamento TOTAL UTILIZADO**: Armazenamento utilizado no destino do backup, conforme informado no último log de backup.
- **TOTAL ENVIADO**: Soma de todos os dados enviados registrados no banco de dados **duplistatus**.

Se este backup ou qualquer um dos backups no servidor (quando **Todos os backups** está selecionado) está atrasado, uma mensagem aparece abaixo do resumo.

![Server Details - Overdue Scheduled Backups](../assets/screen-server-overdue-message.png)

Clique em <IconButton icon="lucide:settings" href="settings/backup-monitoring-settings" label="Configurar"/> para ir para [Configurações → Monitoramento de backup](settings/backup-monitoring-settings.md). Ou clique em <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> na barra de ferramentas para abrir a interface web do servidor Duplicati e verificar os logs.

<br/>

## Histórico de backups {#backup-history}

Esta tabela lista os logs de backup para o servidor selecionado.

![Backup History](../assets/screen-backup-history.png)

- **Nome do Backup**: O nome do backup no servidor Duplicati.
- **Data**: A data e hora do backup e o tempo decorrido desde a última atualização da tela.
- **Status**: O status do backup (Sucesso, Aviso, Erro, Grave).
- **Avisos/Erros**: O número de avisos/erros relatados no log do backup.
- **Versões Disponíveis**: O número de versões de backup disponíveis no destino do backup. Se o ícone estiver acinzentado, as informações detalhadas não foram recebidas.
- **Contagem de Arquivos, Tamanho do Arquivo, Tamanho Enviado, Duração, Tamanho do Armazenamento**: Valores conforme informados pelo servidor Duplicati.

:::tip Tips
• Use o menu suspenso na seção **Histórico de backups** para selecionar **Todos os backups** ou um backup específico para este servidor.

• Você pode classificar qualquer coluna clicando em seu cabeçalho, clique novamente para inverter a ordem de classificação.
 
• Clique em qualquer lugar em uma linha para visualizar os [Detalhes do backup](#backup-details).

:::

:::note
Quando **Todos os backups** está selecionado, a lista mostra todos os backups ordenados do mais recente para o mais antigo por padrão.
:::

<br/>

## Detalhes do backup {#backup-details}

Clicar em um badge de status no Painel (visualização de tabela) ou em qualquer linha na tabela de Histórico de backups exibe as Informações do backup detalhadas.

![Backup Details](../assets/screen-backup-detail.png)

- **Detalhes do servidor**: nome do servidor, apelido e observação.
- **Informações do Backup**: A data e hora do backup e seu ID.
- **Estatísticas do Backup**: Um resumo dos contadores, tamanhos e duração informados.
- **Resumo do Log**: O número de mensagens relatadas.
- **Versões Disponíveis**: Uma lista das versões disponíveis (exibida apenas se a informação foi recebida nos logs).
- **Mensagens/Avisos/Erros**: Os logs completos de execução. O subtítulo indica se o log foi truncado pelo servidor Duplicati.

<br/>

:::note
Consulte as [instruções de Configuração do Duplicati](../installation/duplicati-server-configuration.md) para aprender como configurar o servidor Duplicati para enviar logs de execução completos e evitar truncamento.
:::
