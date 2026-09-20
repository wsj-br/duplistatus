# Coletar Logs de Backup {/* #collect-backup-logs */}

**duplistatus** pode recuperar logs de backup diretamente dos servidores Duplicati para preencher o banco de dados ou restaurar dados de log ausentes. O aplicativo ignora automaticamente quaisquer logs duplicados que já existam no banco de dados.

## Etapas para Coletar Logs de Backup {/* #steps-to-collect-backup-logs */}

### Coleta Manual {/* #manual-collection */}

1.  Clique no ícone <IconButton icon="lucide:download" /> **Coletar Logs de Backup** na [Barra de Ferramentas do Aplicativo](overview.md#application-toolbar).

![Popup de Coleta de Logs de Backup](../assets/screen-collect-button-popup.png)

2.  Selecionar Servidor

Se você tiver endereços de servidor configurados em [Configurações → Configurações do Servidor](settings/server-settings.md), selecione um da lista suspensa para coleta imediata. Se você não tiver nenhum servidor configurado, poderá inserir os detalhes do servidor Duplicati manualmente.

3.  Insira os detalhes do servidor Duplicati:
    - **Nome do host**: O nome do host ou endereço IP do servidor Duplicati. Você pode inserir vários nomes de host separados por vírgulas, por exemplo `192.168.1.23,someserver.local,192.168.1.89`
    - **Porta**: O número da porta usada pelo servidor Duplicati (padrão: `8200`).
    - **Senha**: Digite a senha de autenticação se necessário.
    - **Baixar dados JSON coletados**: Ative esta opção para baixar os dados coletados pelo duplistatus.
4.  Clique em **Coletar Backups**.

***Notas:***
- Se você inserir vários nomes de host, a coleta será realizada usando a mesma porta e senha para todos os servidores.
- **duplistatus** detectará automaticamente o melhor protocolo de conexão (HTTPS ou HTTP). Ele tenta primeiro HTTPS (com validação SSL adequada), depois HTTPS com certificados autoassinados e finalmente HTTP como alternativa.

:::tip
Os botões <IconButton icon="lucide:download" /> estão disponíveis em [Configurações → Monitoramento de Backup](settings/backup-monitoring-settings.md) e [Configurações → Configurações do Servidor](settings/server-settings.md) para coleta de servidor único.
:::

<br/>

### Coleta em Massa {/* #bulk-collection */}

_Clique com o botão direito_ no botão <IconButton icon="lucide:download" /> **Coletar Logs de Backup** na barra de ferramentas do aplicativo para coletar de todos os servidores configurados.

![Menu de Clique com Botão Direito Coletar Tudo](../assets/screen-collect-button-right-click-popup.png)

:::tip
Você também pode usar o botão <IconButton icon="lucide:import" label="Coletar Tudo"/> nas páginas [Configurações → Monitoramento de Backup](settings/backup-monitoring-settings.md) e [Configurações → Configurações do Servidor](settings/server-settings.md) para coletar de todos os servidores configurados.
:::

## Como Funciona o Processo de Coleta {/* #how-the-collection-process-works */}

- **duplistatus** detecta automaticamente o melhor protocolo de conexão e se conecta ao servidor Duplicati especificado.
- Ele recupera histórico de backup, informações de log e configurações de backup (para monitoramento de backup).
- Quaisquer logs já presentes no banco de dados **duplistatus** são ignorados.
- Novos dados são processados e armazenados no banco de dados local, incluindo a versão do Duplicati relatada em cada log de backup. A [versão do painel](dashboard.md#duplicati-server-version) é obtida a partir do log mais recente armazenado — **duplistatus** não lê a versão atualmente em execução no servidor. Após uma atualização do Duplicati, colete ou aguarde um novo backup para que o painel possa mostrar a nova versão.
- A URL usada (com o protocolo detectado) será armazenada ou atualizada no banco de dados local.
- Se a opção de download for selecionada, ela fará o download dos dados JSON coletados sempre que quaisquer dados forem recebidos do servidor Duplicati — mesmo que os logs falhem na validação ou não possam ser importados para o banco de dados. O nome do arquivo estará neste formato: `[serverName]_collected_[Timestamp].json`. O timestamp usa o formato de data ISO 8601 (AAAA-MM-DDTHH:MM:SS).
- O painel é atualizado para refletir as novas informações.

:::note Vendo servidores duplicados após a coleta?
Se o mesmo servidor aparecer mais de uma vez após coletar logs de backup (ou após reinstalação/atualização do Duplicati), geralmente isso é causado por uma `machine_id` alterada ou por um bug da API do Duplicati que mistura o id `identity` e o `machine_id`. A correção é alinhar os ids no servidor Duplicati (editar `identity.txt`/`machineid.txt` ou definir **Duplicati → Configurações → Opções Avançadas → Id da máquina**), reiniciar o Duplicati e, em seguida, mesclar as entradas no **duplistatus** através de [Configurações → Manutenção do Banco de Dados → Mesclar Servidores Duplicados](settings/database-maintenance.md#merge-duplicate-servers). Consulte [Servidores Duplicados no Painel](troubleshooting.md#duplicate-servers-on-the-dashboard) para obter todas as etapas.
:::

## Solução de Problemas de Coleta {/* #troubleshooting-collection-issues */}

A coleta de logs de backup exige que o servidor Duplicati seja acessível a partir da instalação do **duplistatus**. Se você encontrar problemas, verifique o seguinte:

- Confirme se o nome do host (ou endereço IP) e o número da porta estão corretos. Você pode testar isso acessando a interface do servidor Duplicati em seu navegador (por exemplo, `http://hostname:port`).
- Verifique se o **duplistatus** consegue se conectar ao servidor Duplicati. Um problema comum é a resolução de nomes DNS (o sistema não consegue encontrar o servidor pelo seu nome de host). Veja mais na [seção de solução de problemas](troubleshooting.md#collect-backup-logs-not-working).
- Certifique-se de que a senha fornecida esteja correta.
- No Duplicati 2.4+, a coleta lê o ID da máquina nas configurações do servidor Duplicati quando a opção padrão de informações do sistema está vazia.
